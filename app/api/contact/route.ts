import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { timingSafeEqual } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Vercel / serverless: allow HubSpot + Claude + n8n without cutting the request short on Pro plans */
export const maxDuration = 60;

const RECAPTCHA_ACTION = "contact";
const RECAPTCHA_MIN_SCORE = 0.5;

/** HubSpot single-line text; keep UI/server in sync with property limits */
const PAIN_POINT_MAX = 1000;

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function normalizeWebsiteInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    new URL(withScheme);
    return withScheme;
  } catch {
    return t;
  }
}

function isValidOptionalWebsite(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  const normalized = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

/** Collapse whitespace/newlines for HubSpot single-line `pain_point` */
function toHubSpotSingleLinePainPoint(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine((v) => {
      const d = digitsOnly(v);
      return d.length >= 10 && d.length <= 15;
    }, "Enter a valid phone number (10–15 digits, e.g. +1 555 000 0000)"),
  website: z
    .string()
    .optional()
    .transform((s) => (s == null ? "" : s.trim()))
    .refine(isValidOptionalWebsite, "Enter a valid URL or leave blank"),
  painPoint: z
    .string()
    .max(PAIN_POINT_MAX)
    .transform(toHubSpotSingleLinePainPoint)
    .refine((s) => s.length > 0, "Please describe what you are trying to fix or achieve"),
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

/** Postman / server-to-server testing only. Set CONTACT_BYPASS_RECAPTCHA_SECRET (≥16 chars) and send matching X-Intraweb-Contact-Bypass header. */
type Tier = "starter" | "growth";

type ContactSyncResult = {
  contactId: string | null;
  contactAction: "created" | "updated" | "failed" | "skipped";
  hubspotContactsSummary: string;
};

async function classifyPainTier(painPoint: string): Promise<Tier> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return "starter";
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 32,
        messages: [
          {
            role: "user",
            content:
              `Reply with exactly one word: starter or growth.\n` +
              `starter = early-stage, small/solo, simple or first website, MVP, tight budget.\n` +
              `growth = scaling, larger org, replatform, automation, integrations, complex rebuild, enterprise.\n\n` +
              `Pain description:\n${painPoint.slice(0, 2000)}`,
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[tier] Claude API HTTP", res.status, errText.slice(0, 300));
      return "starter";
    }
    const data = (await res.json()) as {
      content?: Array<{ text?: string }>;
    };
    const raw = data.content?.[0]?.text?.trim().toLowerCase() ?? "";
    if (raw.includes("growth")) return "growth";
    return "starter";
  } catch (err) {
    console.error("[tier] Claude classify error:", err);
    return "starter";
  }
}

async function syncHubSpotContact(params: {
  hubspotAccessToken: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  websiteForHubSpot: string;
  painPoint: string;
}): Promise<ContactSyncResult> {
  const {
    hubspotAccessToken,
    email,
    firstName,
    lastName,
    companyName,
    phone,
    websiteForHubSpot,
    painPoint,
  } = params;

  const contactProperties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    company: companyName,
    phone,
    pain_point: painPoint,
  };
  if (websiteForHubSpot) {
    contactProperties.website = websiteForHubSpot;
  }
  const contactData = { properties: contactProperties };

  console.log("Creating/updating contact via Contacts API");

  try {
    const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hubspotAccessToken}`,
      },
      body: JSON.stringify(contactData),
    });

    if (!res.ok) {
      if (res.status === 409) {
        console.log("Contact already exists, updating by email...");
        const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`;
        const updateResponse = await fetch(updateUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hubspotAccessToken}`,
          },
          body: JSON.stringify(contactData),
        });

        if (!updateResponse.ok) {
          const updateError = await updateResponse.text();
          console.error("Failed to update contact:", updateError);
          return {
            contactId: null,
            contactAction: "failed",
            hubspotContactsSummary: `error: PATCH by email HTTP ${updateResponse.status} — ${updateError.slice(0, 400)}`,
          };
        }

        const updateResult = (await updateResponse.json()) as { id?: string };
        const id = updateResult.id != null ? String(updateResult.id) : null;
        console.log("HubSpot Contact Updated:", email, id);
        return {
          contactId: id,
          contactAction: "updated",
          hubspotContactsSummary: "ok (contact updated by email)",
        };
      }

      const errorBody = await res.text();
      console.error("[HubSpot Contacts] Failed:", res.status, errorBody.slice(0, 800));
      return {
        contactId: null,
        contactAction: "failed",
        hubspotContactsSummary: `error: POST contact HTTP ${res.status} — ${errorBody.slice(0, 400)}${errorBody.length > 400 ? "…" : ""}`,
      };
    }

    const created = (await res.json()) as { id?: string };
    const id = created.id != null ? String(created.id) : null;
    console.log("HubSpot contact processed:", id);
    return {
      contactId: id,
      contactAction: "created",
      hubspotContactsSummary: "ok (contact created)",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("HubSpot Contacts API Error:", err);
    return {
      contactId: null,
      contactAction: "failed",
      hubspotContactsSummary: `error: ${msg}`,
    };
  }
}

function isRecaptchaBypassAuthorized(request: NextRequest): boolean {
  const envSecret = process.env.CONTACT_BYPASS_RECAPTCHA_SECRET?.trim();
  if (!envSecret || envSecret.length < 16) {
    return false;
  }
  const headerVal = request.headers.get("x-intraweb-contact-bypass")?.trim();
  if (!headerVal) {
    return false;
  }
  try {
    const a = Buffer.from(headerVal, "utf8");
    const b = Buffer.from(envSecret, "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    if (!process.env.RESEND_API_KEY?.trim()) {
      console.error("[contact] RESEND_API_KEY is not set");
      const fallbackEmail = process.env.CONTACT_EMAIL || "contact@intrawebtech.com";
      return NextResponse.json(
        {
          message: `Email delivery is not configured. Please reach us at ${fallbackEmail}.`,
          error: "email_not_configured",
        },
        { status: 503 }
      );
    }

    const recaptchaProjectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
    const recaptchaSiteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
    const recaptchaEnabled = Boolean(recaptchaProjectId && recaptchaSiteKey);

    const skipRecaptchaInDev =
      process.env.NODE_ENV === "development" &&
      process.env.RECAPTCHA_SKIP_IN_DEV === "true";

    const recaptchaBypass = isRecaptchaBypassAuthorized(request);
    if (recaptchaBypass) {
      console.warn(
        "[contact] reCAPTCHA skipped: X-Intraweb-Contact-Bypass matched CONTACT_BYPASS_RECAPTCHA_SECRET (remove secret from production when done testing)"
      );
    }

    // When RECAPTCHA_SKIP_IN_DEV is set, skip token requirement and verification entirely (no token needed).
    if (recaptchaEnabled && !skipRecaptchaInDev && !recaptchaBypass) {
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
      email,
      firstName,
      lastName,
      companyName,
      phone,
      website,
      painPoint,
    } = validatedData;

    const websiteForHubSpot = website ? normalizeWebsiteInput(website) : "";

    // 1. Send Email via Resend
    const emailContent = `
New Contact Form Submission:

Name: ${firstName} ${lastName}
Company: ${companyName}
Email: ${email}
Phone: ${phone}
${websiteForHubSpot ? `Website: ${websiteForHubSpot}` : ""}

What they are trying to fix or achieve:
${painPoint}
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

    let hubspotFormsSummary = "skipped: Forms API not configured (set NEXT_PUBLIC_HUBSPOT_ID + HUBSPOT_FORM_GUID on the server)";
    let hubspotContactsSummary = "skipped: Contacts API not configured (set HUBSPOT_ACCESS_TOKEN on the server)";
    let contactAction: ContactSyncResult["contactAction"] = "skipped";
    let tier: Tier = "starter";
    let n8nFired = false;

    let hubspotPromise = Promise.resolve();

    if (!hubspotPortalId || !hubspotFormGuid || hubspotFormGuid === "TODO_FILL_THIS") {
      if (hubspotPortalId || hubspotFormGuid) {
        hubspotFormsSummary =
          "skipped: incomplete config (need both NEXT_PUBLIC_HUBSPOT_ID and HUBSPOT_FORM_GUID; GUID must not be TODO_FILL_THIS)";
        console.warn(
          "[HubSpot Forms] Skipped: missing or placeholder config. Need NEXT_PUBLIC_HUBSPOT_ID and HUBSPOT_FORM_GUID (not TODO_FILL_THIS) in deployment env."
        );
      }
    }
    if (hubspotPortalId && hubspotFormGuid && hubspotFormGuid !== "TODO_FILL_THIS") {
      const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormGuid}`;

      // Field `name` values must match the HubSpot form’s internal names (and contact properties)
      const hubspotData = {
        fields: [
          { name: "email", value: email },
          { name: "firstname", value: firstName },
          { name: "lastname", value: lastName },
          { name: "company", value: companyName },
          { name: "phone", value: phone },
          ...(websiteForHubSpot ? [{ name: "website", value: websiteForHubSpot }] : []),
          { name: "pain_point", value: painPoint },
        ],
        context: {
          pageUri: request.headers.get("referer") || "",
          pageName: "IntraWeb Website",
        },
      };

      hubspotFormsSummary = "pending";
      console.log("[HubSpot Forms] Submitting to", hubspotUrl.replace(/\/[a-f0-9-]{36}$/i, "/<formGuid>"));

      hubspotPromise = fetch(hubspotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotData),
      })
        .then(async (res) => {
          const bodyText = await res.text();
          if (!res.ok) {
            hubspotFormsSummary = `error: HTTP ${res.status} — ${bodyText.slice(0, 400)}${bodyText.length > 400 ? "…" : ""}`;
            console.error("[HubSpot Forms] Failed:", res.status, res.statusText, "—", bodyText.slice(0, 800));
          } else {
            hubspotFormsSummary = "ok";
            console.log("[HubSpot Forms] Success");
          }
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          hubspotFormsSummary = `error: ${msg}`;
          console.error("[HubSpot Forms] Request error:", err);
        });
    }

    // 3. Create/Update contact via Contacts API, then tier + n8n (requires real contactId)
    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN?.trim();

    if (!hubspotAccessToken) {
      console.warn(
        "[HubSpot Contacts] Skipped: HUBSPOT_ACCESS_TOKEN not set in deployment env. Form submissions will not create/update HubSpot contacts."
      );
    } else {
      const sync = await syncHubSpotContact({
        hubspotAccessToken,
        email,
        firstName,
        lastName,
        companyName,
        phone,
        websiteForHubSpot,
        painPoint,
      });
      hubspotContactsSummary = sync.hubspotContactsSummary;
      contactAction = sync.contactAction;

      const n8nUrl = process.env.N8N_CONTACT_WEBHOOK_URL?.trim();
      if (sync.contactId && n8nUrl) {
        tier = await classifyPainTier(painPoint);
        const n8nPayload = {
          contactId: sync.contactId,
          createDeal: true,
          dealStage: "qualifiedtobuy",
          tier,
          painOverride: "",
        };
        console.log("[n8n] Firing webhook for", sync.contactId, "tier", tier);
        try {
          const n8nRes = await fetch(n8nUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(n8nPayload),
          });
          console.log("[n8n] Webhook response:", n8nRes.status, n8nRes.statusText, n8nUrl.slice(-40));
          n8nFired = n8nRes.ok;
          if (!n8nRes.ok) {
            const text = await n8nRes.text();
            console.error("[n8n] Webhook error body:", text.slice(0, 300));
          }
        } catch (err) {
          console.error("[n8n] Webhook error:", err);
        }
      } else if (!n8nUrl) {
        console.warn(
          "[n8n] Skipped: N8N_CONTACT_WEBHOOK_URL not set in deployment env (e.g. Vercel)."
        );
      }
    }

    await Promise.all([emailPromise, hubspotPromise]);

    console.log(
      "[contact] integration summary for",
      email,
      "| hubspot_forms:",
      hubspotFormsSummary,
      "| hubspot_contacts:",
      hubspotContactsSummary
    );

    const responseBody: Record<string, unknown> = {
      message: "Message sent successfully",
    };

    const includeIntegrationDetails =
      process.env.CONTACT_INTEGRATION_DEBUG === "true" ||
      process.env.NODE_ENV === "development";

    if (includeIntegrationDetails) {
      const formGuid = process.env.HUBSPOT_FORM_GUID?.trim();
      const formsApiReady = Boolean(
        process.env.NEXT_PUBLIC_HUBSPOT_ID?.trim() &&
          formGuid &&
          formGuid !== "TODO_FILL_THIS"
      );
      const contactsApiReady = Boolean(process.env.HUBSPOT_ACCESS_TOKEN?.trim());
      responseBody.integrations = {
        hubspotForms: hubspotFormsSummary,
        hubspotContacts: hubspotContactsSummary,
        n8nFired,
        tier,
        contactAction,
        hubspotEnv: {
          formsApiReady,
          contactsApiReady,
        },
        hint:
          process.env.NODE_ENV === "development"
            ? "Local: add NEXT_PUBLIC_HUBSPOT_ID, HUBSPOT_FORM_GUID, and HUBSPOT_ACCESS_TOKEN to .env.local, restart dev server. Form field internal names must match: email, firstname, lastname, company, phone, pain_point (website optional). Create contact property pain_point if Contacts API returns validation errors."
            : "Set CONTACT_INTEGRATION_DEBUG=false in production when done. Fix env vars and HubSpot form field internal names; ensure pain_point exists on contacts.",
      };
    }

    return NextResponse.json(responseBody, { status: 200 });
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
