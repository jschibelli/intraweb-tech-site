import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { fetchAvailableSlots } from "@/lib/calcomApi";
import { rangeUtcFromAnchor } from "@/lib/kickoffSlotRange";
import { checkRateLimit } from "@/lib/kickoffRateLimit";

const querySchema = z.object({
  anchorDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeZone: z.string().min(2).max(120),
  spanDays: z.coerce.number().int().min(1).max(35).optional().default(7),
});

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`kickoff-slots:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  const sp = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    anchorDate: sp.get("anchorDate"),
    timeZone: sp.get("timeZone"),
    spanDays: sp.get("spanDays") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", detail: parsed.error.flatten() }, { status: 400 });
  }

  let startUtc: string;
  let endUtc: string;
  try {
    const r = rangeUtcFromAnchor(parsed.data.anchorDate, parsed.data.timeZone, parsed.data.spanDays);
    startUtc = r.startUtc;
    endUtc = r.endUtc;
  } catch {
    return NextResponse.json({ error: "Invalid anchor date or time zone" }, { status: 400 });
  }

  const result = await fetchAvailableSlots({
    start: startUtc,
    end: endUtc,
    timeZone: parsed.data.timeZone,
    format: "range",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status && result.status < 500 ? result.status : 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    range: { startUtc, endUtc },
    slots: result.slots,
  });
}
