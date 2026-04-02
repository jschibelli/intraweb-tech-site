type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  let e = store.get(key);
  if (!e || now >= e.resetAt) {
    e = { count: 1, resetAt: now + windowMs };
    store.set(key, e);
    return { ok: true };
  }
  if (e.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((e.resetAt - now) / 1000) };
  }
  e.count += 1;
  return { ok: true };
}
