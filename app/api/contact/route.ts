import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const resend = new Resend(process.env.RESEND_API_KEY);

const RECAPTCHA_ACTION = "contact";
const RECAPTCHA_MIN_SCORE = 0.5;

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().min(1),
  message: z.string().min(1),
  recaptchaToken: z.string().optional(),
});

/**
 * Create a reCAPTCHA Enterprise assessment (aligns with createAssessment sample).
 * Validates token, expected action "contact", and minimum risk score.
 */
async function verifyRecaptchaToken(
  token: string,
  request: NextRequest
): Promise<{ valid: boolean; score?: number; invalidReason?: string; hostname?: string; apiErrorMessage?: string }> {
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  const siteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!projectId || !siteKey) {
    return { valid: false };
  }
  try {
    // On Vercel/serverless there are no default credentials. Use env JSON and write to a temp
    // file so GOOGLE_APPLICATION_CREDENTIALS works (Google client reads this path).
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson || credentialsJson.trim() === "") {
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage:
          "GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. In Vercel: Settings → Environment Variables → add the full service account JSON for Production, then redeploy.",
      };
    }
    let key: { client_email?: string; private_key?: string; [k: string]: unknown };
    try {
      key = JSON.parse(credentialsJson) as typeof key;
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage: `Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON (parse error: ${msg}). Paste the full JSON from your service account key file.`,
      };
    }
    if (!key.client_email || !key.private_key) {
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage:
          "GOOGLE_APPLICATION_CREDENTIALS_JSON must contain client_email and private_key. Use the JSON file from Google Cloud service account Keys.",
      };
    }
    // Restore newlines in private_key if lost when pasting into env
    const privateKey = key.private_key.includes("\\n")
      ? key.private_key.replace(/\\n/g, "\n")
      : key.private_key;
    const keyWithNewlines = { ...key, private_key: privateKey };
    const tmpDir = tmpdir();
    const credsPath = join(tmpDir, "gcp-recaptcha-creds.json");
    try {
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(credsPath, JSON.stringify(keyWithNewlines), "utf8");
    } catch (writeErr) {
      const msg = writeErr instanceof Error ? writeErr.message : String(writeErr);
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage: `Could not write credentials file: ${msg}.`,
      };
    }
    const prevPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    type AssessmentResult = {
      tokenProperties?: { valid?: boolean; invalidReason?: string; action?: string; hostname?: string; createTime?: string };
      riskAnalysis?: { score?: number };
    };
    let response: AssessmentResult;
    try {
      const client = new RecaptchaEnterpriseServiceClient();
      const projectPath = client.projectPath(projectId);
      const userAgent = request.headers.get("user-agent") ?? "";
      const forwarded = request.headers.get("x-forwarded-for");
      const userIp = forwarded ? forwarded.split(",")[0].trim() : "";
      const result = await client.createAssessment({
        parent: projectPath,
        assessment: {
          event: {
            token,
            siteKey,
            expectedAction: RECAPTCHA_ACTION,
            userAgent: userAgent || undefined,
            userIpAddress: userIp || undefined,
          },
        },
      });
      response = result[0] as AssessmentResult;
    } finally {
      if (prevPath !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = prevPath;
      else delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    const invalidReasonRaw = response!.tokenProperties?.invalidReason;
    const invalidReason = invalidReasonRaw != null ? String(invalidReasonRaw) : "unknown";
    const score = response.riskAnalysis?.score ?? 0;
    const action = response.tokenProperties?.action ?? "";
    const hostname = response.tokenProperties?.hostname ?? "";

    if (process.env.NODE_ENV === "development") {
      console.log("[reCAPTCHA] assessment response:", {
        valid: response.tokenProperties?.valid,
        invalidReason,
        action,
        hostname,
        createTime: response.tokenProperties?.createTime,
        score,
      });
    }

    if (!response.tokenProperties?.valid) {
      if (process.env.NODE_ENV === "development") {
        console.log("reCAPTCHA token invalid:", invalidReason);
      }
      return { valid: false, invalidReason, score, hostname };
    }
    if (response.tokenProperties.action !== RECAPTCHA_ACTION) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "reCAPTCHA action mismatch: expected",
          RECAPTCHA_ACTION,
          "got",
          action
        );
      }
      return { valid: false, invalidReason: "action_mismatch", score, hostname };
    }
    const scoreOk = score >= RECAPTCHA_MIN_SCORE;
    return {
      valid: scoreOk,
      score,
      invalidReason: scoreOk ? undefined : "score_below_threshold",
      hostname,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("reCAPTCHA verification error:", err);
    return { valid: false, invalidReason: "api_error", apiErrorMessage: message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    const recaptchaProjectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
    const recaptchaSiteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
    const recaptchaEnabled = Boolean(recaptchaProjectId && recaptchaSiteKey);

    const skipRecaptchaInDev =
      process.env.NODE_ENV === "development" &&
      process.env.RECAPTCHA_SKIP_IN_DEV === "true";

    // When RECAPTCHA_SKIP_IN_DEV is set, skip token requirement and verification entirely (no token needed).
    if (recaptchaEnabled && !skipRecaptchaInDev) {
      const token = validatedData.recaptchaToken;
      if (!token || typeof token !== "string") {
        return NextResponse.json(
          { error: "reCAPTCHA verification required", message: "Please complete the security check and try again." },
          { status: 400 }
        );
      }
      const { valid, invalidReason, score, hostname, apiErrorMessage } = await verifyRecaptchaToken(token, request);
      if (!valid) {
        // Log server-side so you can debug in production (Vercel logs, etc.)
        console.error("[reCAPTCHA] verification failed", {
          invalidReason,
          score,
          hostname,
          apiErrorMessage,
          hint: "Check: NEXT_PUBLIC_RECAPTCHA_SITE_KEY matches RECAPTCHA_ENTERPRISE_SITE_KEY; domain allowed in reCAPTCHA key; token not reused; Google credentials and API enabled.",
        });
        const responseBody: Record<string, unknown> = {
          error: "reCAPTCHA verification failed",
          message: "Security check failed. Please try again.",
        };
        // Optional: set RECAPTCHA_DEBUG_RESPONSE=true in Vercel env to see reason in Network tab, then remove after fixing
        if (process.env.RECAPTCHA_DEBUG_RESPONSE === "true") {
          responseBody.debug = { invalidReason, score, hostname, apiErrorMessage };
        }
        return NextResponse.json(responseBody, { status: 400 });
      }
    }

    const {
      firstName,
      lastName,
      companyName,
      email,
      phone,
      website,
      message,
    } = validatedData;

    // n8n webhooks: run in parallel with email/HubSpot so they always fire (not dependent on HubSpot success)
    const n8nWebhookUrls: string[] = [
      process.env.N8N_LEAD_SCORING_WEBHOOK_URL,
      process.env.N8N_CONTACT_WEBHOOK_URL,
    ].filter((url): url is string => Boolean(url?.trim()));
    if (n8nWebhookUrls.length > 0) {
      console.log("[n8n] Triggering", n8nWebhookUrls.length, "webhook(s) for", email);
    } else {
      console.warn(
        "[n8n] Skipped: no webhook URLs set. Set N8N_LEAD_SCORING_WEBHOOK_URL and/or N8N_CONTACT_WEBHOOK_URL in your deployment env (e.g. Vercel)."
      );
    }
    const n8nPayload = {
      contactId: "",
      firstName,
      lastName,
      companyName,
      phone: phone || "",
      email,
      website: website || "",
      message,
    };
    const n8nPromise = Promise.all(
      n8nWebhookUrls.map((url) =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n8nPayload),
        })
          .then(async (res) => {
            console.log("[n8n] Webhook response:", res.status, res.statusText, url.slice(-20));
            if (!res.ok) {
              const text = await res.text();
              console.error("[n8n] Webhook error body:", text.slice(0, 300));
            }
          })
          .catch((err) => {
            console.error("[n8n] Webhook error:", err);
          })
      )
    );

    // 1. Send Email via Resend
    const emailContent = `
New Contact Form Submission:

Name: ${firstName} ${lastName}
Company: ${companyName}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
Website: ${website}

Message:
${message}
`;

    const emailPromise = resend.emails.send({
      from: "IntraWeb Contact Form <contact@intrawebtech.com>",
      to: process.env.CONTACT_EMAIL || "contact@intrawebtech.com",
      subject: "New Contact Form Submission",
      text: emailContent,
      replyTo: email,
    });

    // 2. Submit to HubSpot Forms API (for attribution)
    const hubspotPortalId = process.env.NEXT_PUBLIC_HUBSPOT_ID;
    const hubspotFormGuid = process.env.HUBSPOT_FORM_GUID;

    let hubspotPromise = Promise.resolve();

    if (!hubspotPortalId || !hubspotFormGuid || hubspotFormGuid === "TODO_FILL_THIS") {
      if (hubspotPortalId || hubspotFormGuid) {
        console.warn(
          "[HubSpot Forms] Skipped: missing or placeholder config. Need NEXT_PUBLIC_HUBSPOT_ID and HUBSPOT_FORM_GUID (not TODO_FILL_THIS) in deployment env."
        );
      }
    }
    if (hubspotPortalId && hubspotFormGuid && hubspotFormGuid !== "TODO_FILL_THIS") {
      const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormGuid}`;

      // Use only form field names that exist on your HubSpot form
      const hubspotData = {
        fields: [
          { name: "email", value: email },
          { name: "firstname", value: firstName },
          { name: "lastname", value: lastName },
          { name: "companyname", value: companyName },
          { name: "phone", value: phone || "" },
          { name: "website", value: website || "" },
          { name: "message", value: message },
        ],
        context: {
          pageUri: request.headers.get("referer") || "",
          pageName: "IntraWeb Website",
        },
      };

      console.log("Sending to HubSpot Forms API:", JSON.stringify(hubspotData, null, 2));

      hubspotPromise = fetch(hubspotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotData),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorBody = await res.text();
            console.error("HubSpot Forms API Failed:", res.status, errorBody);
          } else {
            console.log("HubSpot Forms API Successful");
          }
        })
        .catch((err) => {
          console.error("HubSpot Forms API Error:", err);
        });
    }

    // 3. Create/Update contact via Contacts API
    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    let contactsApiPromise = Promise.resolve();

    if (!hubspotAccessToken) {
      console.warn(
        "[HubSpot Contacts] Skipped: HUBSPOT_ACCESS_TOKEN not set in deployment env. Form submissions will not create/update HubSpot contacts."
      );
    }
    if (hubspotAccessToken) {
      const contactData = {
        properties: {
          email,
          firstname: firstName,
          lastname: lastName,
          companyname: companyName,
          phone: phone || "",
          website: website || "",
          message,
        },
      };

      console.log("Creating/updating contact via Contacts API");

      contactsApiPromise = fetch(`https://api.hubapi.com/crm/v3/objects/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hubspotAccessToken}`,
        },
        body: JSON.stringify(contactData),
      })
        .then(async (res) => {
          if (!res.ok) {
            // If contact exists (409), update it using email as identifier
            if (res.status === 409) {
              console.log("Contact already exists, updating by email...");

              // Update using email as the identifier (no search API needed)
              const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`;
              const updateResponse = await fetch(updateUrl, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${hubspotAccessToken}`,
                },
                body: JSON.stringify(contactData),
              });

              if (!updateResponse.ok) {
                const updateError = await updateResponse.text();
                console.error("Failed to update contact:", updateError);
                return null;
              }

              const updateResult = await updateResponse.json();
              console.log("HubSpot Contact Updated:", email);
              return updateResult;
            }

            const errorBody = await res.text();
            console.error("HubSpot Contacts API Failed:", res.status, errorBody);
            return null;
          }
          return res.json();
        })
        .then(async (contactResult) => {
          if (contactResult && contactResult.id) {
            console.log("Processing contact:", contactResult.id);

            // Create a Note for the message
            const notesUrl = `https://api.hubapi.com/crm/v3/objects/notes`;
            const noteData = {
              properties: {
                hs_timestamp: new Date().toISOString(),
                hs_note_body: message
              },
              associations: [
                {
                  to: { id: contactResult.id },
                  types: [
                    { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }
                  ]
                }
              ]
            };

            await fetch(notesUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hubspotAccessToken}`
              },
              body: JSON.stringify(noteData)
            }).then(res => {
              if (res.ok) console.log("HubSpot Note Created");
              else res.text().then(t => console.error("HubSpot Note Failed:", t));
            });
          }
        })
        .catch((err) => {
          console.error("HubSpot Contacts API Error:", err);
        });
    }

    await Promise.all([emailPromise, hubspotPromise, contactsApiPromise, n8nPromise]);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid form data",
          error: error.errors.map((e) => e.message).join("; "),
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
