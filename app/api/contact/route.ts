import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  website: z.string().optional(),
  reason: z.enum(["ai-transformation", "ai-engineer", "education", "reselling"]),
  email: z.string().email(),
  decisionMaker: z.string().min(1),
  revenue: z.string().min(1),
  description: z.string().min(20),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    const { firstName, lastName, website, reason, email, decisionMaker, revenue, description } = validatedData;

    const reasonLabels: Record<string, string> = {
      "ai-transformation": "AI Transformation",
      "ai-engineer": "Developing custom AI solutions / AI Engineer",
      "education": "Educating your team on AI",
      "reselling": "Re-selling/white-label your solutions",
    };

    // Map string ranges to estimated integer values for HubSpot's 'annualrevenue' (must be a number)
    const revenueToNumber: Record<string, number> = {
      "Less than $100K": 50000,
      "$100K - $500K": 250000,
      "$500K - $1M": 750000,
      "$1M - $5M": 2500000,
      "$5M - $10M": 7500000,
      "$10M+": 10000000,
      "Prefer not to say": 0,
    };

    const numericRevenue = revenueToNumber[revenue] || 0;

    // 1. Send Email via Resend
    const emailContent = `
      New Contact Form Submission:
      
      Name: ${firstName} ${lastName}
      Email: ${email}
      ${website ? `Website: ${website}` : ""}
      Reason for Call: ${reasonLabels[reason] || reason}
      Decision Maker: ${decisionMaker}
      Annual Revenue: ${revenue}
      
      Description:
      ${description}
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
          { name: "reason_for_call", value: reason },
          { name: "decision_maker", value: decisionMaker },
          { name: "annualrevenue", value: numericRevenue.toString() },
          { name: "message", value: description },
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
        "ai-engineer": "ai-engineer",
        "education": "ai-education",
        "reselling": "reselling",
      };

      const contactData = {
        properties: {
          email,
          firstname: firstName,
          lastname: lastName,
          website: website || "",
          reason_for_call: reasonMapping[reason] || reason,
          decision_maker: decisionMaker,
          annualrevenue: numericRevenue.toString(),
          message: description,
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
                hs_note_body: description
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
        { message: "Invalid form data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
