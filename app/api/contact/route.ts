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
          { name: "reason_for_call", value: reason }, // Trying raw ID
          { name: "decision_maker", value: decisionMaker },
          { name: "annualrevenue", value: numericRevenue.toString() }, // Must be stringified number
          { name: "message", value: description }, // Clean user message only
          // Only include website if it exists
          ...(website ? [{ name: "website", value: website }] : []),
        ],
        context: {
          pageUri: request.headers.get("referer") || "",
          pageName: "Contact Page",
        },
      };

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
            // We don't throw here to avoid failing the whole request if only HubSpot fails
          } else {
            console.log("HubSpot Submission Successful");
          }
        })
        .catch((err) => {
          console.error("HubSpot Submission Error:", err);
        });
    } else {
      console.warn("HubSpot credentials missing or incomplete. Skipping HubSpot submission.");
    }

    // Await both (or at least start them)
    // We await them so we can return success only if email succeeds, 
    // but we generally want to return reasonably quickly.
    await Promise.all([emailPromise, hubspotPromise]);

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