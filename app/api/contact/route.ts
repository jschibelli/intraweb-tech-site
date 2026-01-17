import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  name: z.string().min(2),
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

    const { name, website, reason, email, decisionMaker, revenue, description } = validatedData;

    const reasonLabels: Record<string, string> = {
      "ai-transformation": "AI Transformation",
      "ai-engineer": "Developing custom AI solutions / AI Engineer",
      "education": "Educating your team on AI",
      "reselling": "Re-selling/white-label your solutions",
    };

    const emailContent = `
      New Contact Form Submission:
      
      Name: ${name}
      Email: ${email}
      ${website ? `Website: ${website}` : ""}
      Reason for Call: ${reasonLabels[reason] || reason}
      Decision Maker: ${decisionMaker}
      Annual Revenue: ${revenue}
      
      Description:
      ${description}
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