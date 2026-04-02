import { createHmac, timingSafeEqual } from "crypto";

const ALG = "HS256";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

export type KickoffBookingClaims = {
  /** HubSpot contact id */
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  dealId?: string;
  iat: number;
  exp: number;
};

export type KickoffBookingSignInput = Omit<KickoffBookingClaims, "iat" | "exp">;

export function signKickoffBookingSession(
  input: KickoffBookingSignInput,
  secret: string,
  ttlSec: number,
): string {
  const header = { alg: ALG, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: KickoffBookingClaims = {
    ...input,
    iat: now,
    exp: now + ttlSec,
  };
  const h = base64url(Buffer.from(JSON.stringify(header), "utf8"));
  const p = base64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const data = `${h}.${p}`;
  const sig = createHmac("sha256", secret).update(data).digest();
  const s = base64url(sig);
  return `${data}.${s}`;
}

export function verifyKickoffBookingSession(token: string, secret: string): KickoffBookingClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  if (!h || !p || !s) return null;
  const data = `${h}.${p}`;
  const expected = createHmac("sha256", secret).update(data).digest();
  let sig: Buffer;
  try {
    sig = base64urlDecode(s);
  } catch {
    return null;
  }
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) {
    return null;
  }
  let payload: KickoffBookingClaims;
  try {
    payload = JSON.parse(base64urlDecode(p).toString("utf8")) as KickoffBookingClaims;
  } catch {
    return null;
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }
  if (!payload.sub || !payload.email) {
    return null;
  }
  return payload;
}

export function getKickoffBookingSecret(): string | null {
  const s = process.env.KICKOFF_BOOKING_JWT_SECRET?.trim();
  if (!s || s.length < 16) {
    return null;
  }
  return s;
}

export function getKickoffBookingTtlSec(): number {
  const n = Number(process.env.KICKOFF_BOOKING_JWT_TTL_SEC);
  if (Number.isFinite(n) && n >= 300 && n <= 172800) {
    return Math.floor(n);
  }
  return 86_400;
}

export function buildBookingSessionPayload(
  contactId: string,
  contact: { email: string; firstName: string; lastName: string; company: string; phone?: string },
  dealId?: string | null,
): { bookingSession: string; hubspotContactId: string; hubspotDealId?: string } | Record<string, never> {
  const secret = getKickoffBookingSecret();
  if (!secret) {
    return {};
  }
  const token = signKickoffBookingSession(
    {
      sub: contactId,
      email: contact.email.toLowerCase(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      phone: contact.phone?.trim() || undefined,
      dealId: dealId || undefined,
    },
    secret,
    getKickoffBookingTtlSec(),
  );
  return {
    bookingSession: token,
    hubspotContactId: contactId,
    ...(dealId ? { hubspotDealId: dealId } : {}),
  };
}
