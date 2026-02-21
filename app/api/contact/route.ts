import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const resend = new Resend(process.env.RESEND_API_KEY);

const RECAPTCHA_ACTION = "contact";
const RECAPTCHA_MIN_SCORE = 0.5;

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  website: z.string().min(1),
  reasonForCall: z.string().min(1),
  email: z.string().email(),
  decisionMaker: z.string().min(1),
  annualRevenue: z.string().min(1),
  numberOfEmployees: z.string().optional(),
  message: z.string().min(1),
  recaptchaToken: z.string().optional(),
});

async function verifyRecaptchaToken(
  token: string,
  request: NextRequest
): Promise<{ valid: boolean; score?: number }> {
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  const siteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!projectId || !siteKey) {
    return { valid: false };
  }
  try {
    const client = new RecaptchaEnterpriseServiceClient();
    const userAgent = request.headers.get("user-agent") ?? "";
    const forwarded = request.headers.get("x-forwarded-for");
    const userIp = forwarded ? forwarded.split(",")[0].trim() : "";
    const [response] = await client.createAssessment({
      parent: `projects/${projectId}`,
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
    const valid = response.tokenProperties?.valid ?? false;
    const score = response.riskAnalysis?.score ?? 0;
    const scoreOk = score >= RECAPTCHA_MIN_SCORE;
    return { valid: valid && scoreOk, score };
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    return { valid: false };
  }
}

const reasonLabels: Record<string, string> = {
  "ai-transformation": "AI Transformation",
  "custom-ai-engineer": "Developing custom AI solutions / AI Engineer",
  "educating-team": "Educating your team on AI",
  "reselling-white-label": "Re-selling/white-label your solutions",
};

const revenueLabels: Record<string, string> = {
  "less-than-100k": "Less than $100K",
  "100k-500k": "$100K - $500K",
  "500k-1m": "$500K - $1M",
  "1m-5m": "$1M - $5M",
  "5m-10m": "$5M - $10M",
  "10m-plus": "$10M+",
  "prefer-not": "Prefer not to say",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    const recaptchaProjectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
    const recaptchaSiteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
    const recaptchaEnabled = Boolean(recaptchaProjectId && recaptchaSiteKey);

    if (recaptchaEnabled) {
      const token = validatedData.recaptchaToken;
      if (!token || typeof token !== "string") {
        return NextResponse.json(
          { error: "reCAPTCHA verification required", message: "Please complete the security check and try again." },
          { status: 400 }
        );
      }
      const { valid } = await verifyRecaptchaToken(token, request);
      if (!valid) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed", message: "Security check failed. Please try again." },
          { status: 400 }
        );
      }
    }

    const {
      firstName,
      lastName,
      website,
      reasonForCall,
      email,
      decisionMaker,
      annualRevenue,
      numberOfEmployees,
      message,
    } = validatedData;

    const reasonLabel = reasonLabels[reasonForCall] || reasonForCall;
    const revenueLabel = revenueLabels[annualRevenue] || annualRevenue;

    // Map value keys to estimated integer for HubSpot 'annualrevenue'
    const revenueToNumber: Record<string, number> = {
      "less-than-100k": 50000,
      "100k-500k": 250000,
      "500k-1m": 750000,
      "1m-5m": 2500000,
      "5m-10m": 7500000,
      "10m-plus": 10000000,
      "prefer-not": 0,
    };
    const numericRevenue = revenueToNumber[annualRevenue] || 0;

    // Normalize decision_maker for n8n lead scoring (expects "Yes" / "No" / "Partial")
    const decisionMakerForHubSpot =
      decisionMaker === "yes" ? "Yes" : decisionMaker === "no" ? "No" : decisionMaker;

    // 1. Send Email via Resend
    const emailContent = `
New Contact Form Submission:

Name: ${firstName} ${lastName}
Email: ${email}
Website: ${website}
Reason for call: ${reasonLabel}
Decision maker only: ${decisionMaker === "yes" ? "Yes" : "No"}
Company revenue: ${revenueLabel}
${numberOfEmployees ? `Company size (employees): ${numberOfEmployees}` : ""}

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

    if (hubspotPortalId && hubspotFormGuid && hubspotFormGuid !== "TODO_FILL_THIS") {
      const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormGuid}`;

      const hubspotData = {
        fields: [
          { name: "email", value: email },
          { name: "firstname", value: firstName },
          { name: "lastname", value: lastName },
          { name: "website", value: website || "" },
          { name: "reason_for_call", value: reasonForCall },
          { name: "decision_maker", value: decisionMakerForHubSpot },
          { name: "annualrevenue", value: numericRevenue.toString() },
          { name: "numberofemployees", value: numberOfEmployees ?? "" },
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

    if (hubspotAccessToken) {
      const reasonMapping: Record<string, string> = {
        "ai-transformation": "ai-transformation",
        "custom-ai-engineer": "ai-engineer",
        "educating-team": "ai-education",
        "reselling-white-label": "reselling",
      };

      const contactData = {
        properties: {
          email,
          firstname: firstName,
          lastname: lastName,
          website: website || "",
          reason_for_call: reasonMapping[reasonForCall] || reasonForCall,
          decision_maker: decisionMakerForHubSpot,
          annualrevenue: numericRevenue.toString(),
          numberofemployees: numberOfEmployees ? String(parseInt(numberOfEmployees, 10) || "") : "",
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

            // Trigger n8n Lead Qualification workflow (fire-and-forget)
            const n8nWebhookUrl = process.env.N8N_LEAD_SCORING_WEBHOOK_URL;
            if (n8nWebhookUrl) {
              fetch(n8nWebhookUrl, { method: "POST" }).catch((err) => {
                console.error("n8n lead scoring webhook error:", err);
              });
            }

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

    await Promise.all([emailPromise, hubspotPromise, contactsApiPromise]);

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
