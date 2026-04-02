/**
 * Cal.com API v2 — server-only. Slots use cal-api-version 2024-09-04; bookings use 2026-02-25 (per Cal docs).
 */

export const CAL_SLOTS_API_VERSION = "2024-09-04";
export const CAL_BOOKINGS_API_VERSION = "2026-02-25";

export type CalEventResolution =
  | { kind: "id"; eventTypeId: number }
  | { kind: "slug"; username: string; eventTypeSlug: string; organizationSlug?: string };

/** Parse `intraweb/website-discovery` or full https://cal.com/... URL into username + slug. */
export function parseCalKickoffLink(configured: string): { username: string; eventTypeSlug: string } | null {
  const raw = configured.trim().replace(/^\/+/, "");
  if (!raw) return null;
  try {
    const path = configured.startsWith("http") ? new URL(configured).pathname.replace(/^\/+/, "") : raw;
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { username: parts[0], eventTypeSlug: parts[1] };
  } catch {
    return null;
  }
}

export function getCalEventResolution(): CalEventResolution | null {
  const idStr = process.env.CAL_EVENT_TYPE_ID?.trim();
  if (idStr) {
    const n = Number(idStr);
    if (Number.isFinite(n) && n > 0) return { kind: "id", eventTypeId: n };
  }
  const link = process.env.NEXT_PUBLIC_CAL_KICKOFF_CAL_LINK?.trim() || "intraweb/website-discovery";
  const parsed = parseCalKickoffLink(link);
  if (!parsed) return null;
  const org = process.env.CAL_ORGANIZATION_SLUG?.trim();
  return {
    kind: "slug",
    username: parsed.username,
    eventTypeSlug: parsed.eventTypeSlug,
    ...(org ? { organizationSlug: org } : {}),
  };
}

function calApiBase(): string {
  return (process.env.CAL_API_BASE || "https://api.cal.com").replace(/\/+$/, "");
}

function authHeader(): string | null {
  const key = process.env.CAL_API_KEY?.trim();
  if (!key) return null;
  return key.startsWith("Bearer ") ? key : `Bearer ${key}`;
}

export type NormalizedSlot = { start: string; end?: string };

function normalizeSlotEntry(entry: unknown): NormalizedSlot | null {
  if (typeof entry === "string") {
    return { start: entry };
  }
  if (entry && typeof entry === "object" && "start" in entry) {
    const o = entry as { start?: string; end?: string };
    if (typeof o.start === "string") {
      return { start: o.start, ...(typeof o.end === "string" ? { end: o.end } : {}) };
    }
  }
  return null;
}

/** GET /v2/slots — returns flat list of slot start times (ISO strings). */
export async function fetchAvailableSlots(params: {
  start: string;
  end: string;
  timeZone: string;
  format?: "time" | "range";
}): Promise<{ ok: true; slots: NormalizedSlot[] } | { ok: false; error: string; status?: number }> {
  const auth = authHeader();
  const resolution = getCalEventResolution();
  if (!auth) {
    return { ok: false, error: "CAL_API_KEY is not configured" };
  }
  if (!resolution) {
    return { ok: false, error: "Could not resolve Cal event type (CAL_EVENT_TYPE_ID or NEXT_PUBLIC_CAL_KICKOFF_CAL_LINK)" };
  }

  const sp = new URLSearchParams();
  sp.set("start", params.start);
  sp.set("end", params.end);
  sp.set("timeZone", params.timeZone);
  if (params.format === "range") {
    sp.set("format", "range");
  }
  if (resolution.kind === "id") {
    sp.set("eventTypeId", String(resolution.eventTypeId));
  } else {
    sp.set("username", resolution.username);
    sp.set("eventTypeSlug", resolution.eventTypeSlug);
    if (resolution.organizationSlug) {
      sp.set("organizationSlug", resolution.organizationSlug);
    }
  }

  const url = `${calApiBase()}/v2/slots?${sp.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: auth,
      "cal-api-version": CAL_SLOTS_API_VERSION,
    },
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg =
      json && typeof json === "object" && json !== null && "message" in json
        ? String((json as { message?: unknown }).message)
        : text.slice(0, 300);
    return { ok: false, error: msg || `Cal slots HTTP ${res.status}`, status: res.status };
  }

  const data =
    json && typeof json === "object" && json !== null && "data" in json
      ? (json as { data: unknown }).data
      : json;

  const slots: NormalizedSlot[] = [];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const day of Object.keys(data as Record<string, unknown>)) {
      const arr = (data as Record<string, unknown>)[day];
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const n = normalizeSlotEntry(item);
        if (n) slots.push(n);
      }
    }
  }

  slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return { ok: true, slots };
}

export type CreateCalBookingInput = {
  startUtc: string;
  attendee: {
    name: string;
    email: string;
    timeZone: string;
    phoneNumber?: string;
  };
  title?: string;
  metadata?: Record<string, string>;
};

export type CreateCalBookingResult =
  | {
      ok: true;
      uid: string;
      start: string;
      end: string;
      location?: string;
      data: unknown;
    }
  | { ok: false; error: string; status?: number };

export async function createCalBooking(input: CreateCalBookingInput): Promise<CreateCalBookingResult> {
  const auth = authHeader();
  const resolution = getCalEventResolution();
  if (!auth) {
    return { ok: false, error: "CAL_API_KEY is not configured" };
  }
  if (!resolution) {
    return { ok: false, error: "Could not resolve Cal event type" };
  }

  const body: Record<string, unknown> = {
    start: input.startUtc,
    attendee: {
      name: input.attendee.name,
      email: input.attendee.email,
      timeZone: input.attendee.timeZone,
      language: "en",
      ...(input.attendee.phoneNumber?.trim() ? { phoneNumber: input.attendee.phoneNumber.trim() } : {}),
    },
  };

  if (resolution.kind === "id") {
    body.eventTypeId = resolution.eventTypeId;
  } else {
    body.username = resolution.username;
    body.eventTypeSlug = resolution.eventTypeSlug;
    if (resolution.organizationSlug) {
      body.organizationSlug = resolution.organizationSlug;
    }
  }

  const meta: Record<string, string> = {};
  if (input.metadata) {
    for (const [k, v] of Object.entries(input.metadata)) {
      if (k.length <= 40 && String(v).length <= 500) {
        meta[k] = String(v);
      }
    }
  }
  if (input.title?.trim()) {
    meta.title = input.title.trim().slice(0, 500);
  }
  if (Object.keys(meta).length > 0) {
    body.metadata = meta;
  }

  const res = await fetch(`${calApiBase()}/v2/bookings`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "cal-api-version": CAL_BOOKINGS_API_VERSION,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg =
      json && typeof json === "object" && json !== null && "message" in json
        ? String((json as { message?: unknown }).message)
        : text.slice(0, 400);
    return { ok: false, error: msg || `Cal booking HTTP ${res.status}`, status: res.status };
  }

  const outer = json as { status?: string; data?: unknown } | null;
  const booking =
    outer?.data && typeof outer.data === "object"
      ? (outer.data as {
          uid?: string;
          start?: string;
          end?: string;
          location?: string;
        })
      : null;

  if (!booking?.uid || !booking.start) {
    return { ok: false, error: "Unexpected Cal booking response shape" };
  }

  return {
    ok: true,
    uid: booking.uid,
    start: booking.start,
    end: booking.end || booking.start,
    location: typeof booking.location === "string" ? booking.location : undefined,
    data: json,
  };
}
