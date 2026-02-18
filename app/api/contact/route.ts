import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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
});

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

    await resend.emails.send({
      from: "IntraWeb Contact Form <contact@intrawebtech.com>",
      to: process.env.CONTACT_EMAIL || "contact@intrawebtech.com",
      subject: "New Contact Form Submission",
      text: emailContent,
      replyTo: email,
    });

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
