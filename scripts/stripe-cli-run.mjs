import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Stripe CLI often prints a banner before JSON; API errors still return exit code 0. */
export function parseStripeStdout(stdout) {
  const t = (stdout || "").trim();
  if (!t) return {};
  const i = t.indexOf("{");
  if (i === -1) return { _parse_error: true, raw: t.slice(0, 2000) };
  const tail = t.slice(i);
  try {
    return JSON.parse(tail);
  } catch {
    try {
      const j = tail.lastIndexOf("\n}");
      if (j !== -1) return JSON.parse(tail.slice(0, j + 2));
    } catch {
      /* fall through */
    }
    return { _parse_error: true, raw: tail.slice(0, 2000) };
  }
}

export function readStripeSecretKey(rootDir) {
  if (process.env.STRIPE_SECRET_KEY?.trim()) return process.env.STRIPE_SECRET_KEY.trim();
  if (process.env.STRIPE_API_KEY?.trim()) return process.env.STRIPE_API_KEY.trim();
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return "";
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^(STRIPE_SECRET_KEY|STRIPE_API_KEY)=(.*)$/);
    if (m) {
      const v = m[2].trim();
      if (v) return v;
    }
  }
  return "";
}

/**
 * Run Stripe CLI. If STRIPE_SECRET_KEY / STRIPE_API_KEY is set (env or .env.local), passes it as STRIPE_API_KEY
 * so write-capable secret keys override the CLI default restricted key.
 */
export function stripeRun(argv, rootDir) {
  const sk = readStripeSecretKey(rootDir);
  const env = { ...process.env };
  if (sk) env.STRIPE_API_KEY = sk;
  const r = spawnSync("stripe", argv, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    env,
  });
  const json = parseStripeStdout(r.stdout);
  const apiError = json?.error;
  const shellOk = r.status === 0 || r.status === null;
  const ok = shellOk && !apiError;
  return {
    ok,
    status: ok ? 0 : 1,
    json,
    stderr: r.stderr || "",
    out: r.stdout || "",
  };
}
