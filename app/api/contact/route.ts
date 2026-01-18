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

    // 2. Submit to HubSpot
    const hubspotPortalId = process.env.NEXT_PUBLIC_HUBSPOT_ID;
    const hubspotFormGuid = process.env.HUBSPOT_FORM_GUID;

    let hubspotPromise = Promise.resolve(); // Default to resolved if no creds

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

      console.log("Sending to HubSpot:", JSON.stringify(hubspotData, null, 2));

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
            console.error("HubSpot Submission Failed:", res.status, errorBody);
            console.error("Payload was:", JSON.stringify(hubspotData, null, 2));
            // We don't throw here to avoid failing the whole request if only HubSpot fails
          } else {
            const successBody = await res.text();
            console.log("HubSpot Submission Successful");
            console.log("HubSpot Response:", successBody);
          }
        })
        .catch((err) => {
          console.error("HubSpot Submission Error:", err);
        });
    } else {
      console.warn("HubSpot credentials missing or incomplete. Skipping HubSpot submission.");
    }

    // 3. Update/create contact via Contacts API
    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    let contactsApiPromise = Promise.resolve();

    if (hubspotAccessToken) {
      const contactsApiUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;

      // Map frontend reason values to HubSpot's exact dropdown internal values
      const reasonMapping: Record<string, string> = {
        "ai-transformation": "ai-transformation",
        "ai-engineer": "ai-engineer",
        "education": "ai-education",
        "reselling": "reselling", // Best guess fallback
      };

      // Ensure boolean string for Yes/No fields if they are HubSpot Boolean checkboxes
      // const decisionMakerBoolean = decisionMaker === "Yes" ? "true" : "false"; // REVERTED: Error log confirms it expects Yes/No

      const contactData = {
        properties: {
          email,
          firstname: firstName,
          lastname: lastName,
          website: website || "",
          reason_for_call: reasonMapping[reason] || reason,
          decision_maker: decisionMaker, // Send as-is ("Yes" / "No")
          annualrevenue: numericRevenue.toString(),
          message: description, // Try keeping this, but we'll also add a note
          hs_lead_status: "NEW", // Set Lead Status to "New"
        },
      };

      console.log("Creating/updating contact via Contacts API:", JSON.stringify(contactData, null, 2));

      contactsApiPromise = fetch(contactsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hubspotAccessToken}`,
        },
        body: JSON.stringify(contactData),
      })
        .then(async (res) => {
          if (!res.ok) {
            // If contact exists (409), we should update it.
            // For now, let's log the error.
            if (res.status === 409) {
              console.log("Contact already exists, attempting to log a note/activity...");
              // In a full implementation, we'd search for the contact ID by email here.
              // For now, just log success that we reached here.
            }
            const errorBody = await res.text();
            console.error("HubSpot Contacts API Failed:", res.status, errorBody);
            throw new Error(`HubSpot Contact Create Failed: ${res.status}`);
          }
          return res.json();
        })
        .then(async (contactResult) => {
          if (contactResult && contactResult.id) {
            console.log("HubSpot Contact Created:", contactResult.id);

            // 4. Create a Note for the "Message" description
            // This ensures the message is saved even if the 'message' property doesn't exist
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
                    { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 } // 202 = Note to Contact
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
              if (res.ok) console.log("HubSpot Note Created successfully");
              else res.text().then(t => console.error("HubSpot Note Failed:", t));
            });
          }
        })
        .catch((err) => {
          console.error("HubSpot Contacts API Error:", err);
        });
    }

    // Await both (or at least start them)
    // We await them so we can return success only if email succeeds, 
    // but we generally want to return reasonably quickly.
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
// Force deploy 20260117-222255
