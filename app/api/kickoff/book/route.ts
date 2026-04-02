import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createCalBooking } from "@/lib/calcomApi";
import { verifyKickoffBookingSession, getKickoffBookingSecret } from "@/lib/kickoffBookingSession";
import { hubspotSyncKickoffBooking } from "@/lib/hubspotKickoffBooking";
import { checkRateLimit } from "@/lib/kickoffRateLimit";

export const maxDuration = 60;

const bodySchema = z.object({
  bookingSession: z.string().min(10),
  start: z.string().min(10),
  timeZone: z.string().min(2).max(120),
  kickoffTitle: z.string().max(500).optional(),
});

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

function managementUrlFromUid(uid: string): string {
  const base = (process.env.CAL_BOOKING_MANAGE_URL_BASE || "https://cal.com/booking").replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(uid)}`;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`kickoff-book:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  const secret = getKickoffBookingSecret();
  if (!secret) {
    return NextResponse.json({ error: "Kickoff booking is not configured (missing KICKOFF_BOOKING_JWT_SECRET)" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", detail: parsed.error.flatten() }, { status: 400 });
  }

  const claims = verifyKickoffBookingSession(parsed.data.bookingSession, secret);
  if (!claims) {
    return NextResponse.json({ error: "Invalid or expired booking session" }, { status: 401 });
  }

  let startDate: Date;
  try {
    startDate = new Date(parsed.data.start);
    if (Number.isNaN(startDate.getTime())) {
      throw new Error("bad");
    }
  } catch {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }

  const startUtc = startDate.toISOString();

  const meta: Record<string, string> = {
    hubspotContactId: claims.sub,
    source: "website_intake_kickoff",
  };
  if (claims.dealId) {
    meta.hubspotDealId = claims.dealId;
  }

  const cal = await createCalBooking({
    startUtc,
    attendee: {
      name: `${claims.firstName} ${claims.lastName}`.trim() || claims.email,
      email: claims.email.toLowerCase(),
      timeZone: parsed.data.timeZone,
      ...(claims.phone?.trim() ? { phoneNumber: claims.phone.trim() } : {}),
    },
    title: parsed.data.kickoffTitle?.trim() || `${claims.company || claims.email} kickoff`,
    metadata: meta,
  });

  if (!cal.ok) {
    return NextResponse.json(
      { error: cal.error || "Could not create booking" },
      { status: cal.status && cal.status < 500 ? cal.status : 502 },
    );
  }

  const managementUrl = managementUrlFromUid(cal.uid);

  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  let hubspotErrors: string[] = [];
  if (hubspotToken) {
    const sync = await hubspotSyncKickoffBooking(hubspotToken, {
      contactId: claims.sub,
      dealId: claims.dealId,
      meetingStart: cal.start,
      calBookingUid: cal.uid,
      managementUrl,
    });
    hubspotErrors = sync.errors;
    if (hubspotErrors.length) {
      console.error("[kickoff/book] HubSpot sync warnings:", hubspotErrors);
    }
  }

  const kickoffWebhook = process.env.N8N_KICKOFF_BOOKED_WEBHOOK_URL?.trim();
  if (kickoffWebhook) {
    const webhookHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET?.trim();
    if (webhookSecret) {
      const headerName =
        process.env.N8N_WEBHOOK_SECRET_HEADER?.trim() || "X-Intraweb-Website-Intake-Secret";
      webhookHeaders[headerName] = webhookSecret;
    }
    const payload = {
      type: "kickoff_booked",
      hubspotContactId: claims.sub,
      hubspotDealId: claims.dealId ?? null,
      calBookingUid: cal.uid,
      start: cal.start,
      end: cal.end,
      managementUrl,
      location: cal.location ?? null,
      email: claims.email,
    };
    try {
      await fetch(kickoffWebhook, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25_000),
      });
    } catch (e) {
      console.error("[kickoff/book] n8n kickoff webhook failed:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    booking: {
      uid: cal.uid,
      start: cal.start,
      end: cal.end,
      location: cal.location ?? null,
      managementUrl,
    },
    ...(hubspotErrors.length ? { hubspotWarnings: hubspotErrors } : {}),
  });
}
