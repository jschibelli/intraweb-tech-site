/**
 * End-to-end POST /api/website-intake (production or any base URL).
 * Loads WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET from .env.local and sends X-Intraweb-Website-Intake-Bypass.
 *
 * Usage:
 *   node scripts/e2e-website-intake-payload.mjs > .tmp-e2e-payload.json
 *   node scripts/run-e2e-website-intake.mjs
 *   node scripts/run-e2e-website-intake.mjs http://localhost:3001/api/website-intake
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const payloadPath = path.join(root, ".tmp-e2e-payload.json");

function parseEnvLocal(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const targetUrl =
  process.argv[2] || "https://www.intrawebtech.com/api/website-intake";

if (!fs.existsSync(payloadPath)) {
  console.error("Missing .tmp-e2e-payload.json — run: node scripts/e2e-website-intake-payload.mjs > .tmp-e2e-payload.json");
  process.exit(1);
}

const env = fs.existsSync(envPath) ? parseEnvLocal(fs.readFileSync(envPath, "utf8")) : {};
const bypass = env.WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET?.trim();
if (!bypass || bypass.length < 16) {
  console.error("WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET missing or too short in .env.local");
  process.exit(1);
}

const body = fs.readFileSync(payloadPath, "utf8");
const res = await fetch(targetUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Intraweb-Website-Intake-Bypass": bypass,
  },
  body,
});

const text = await res.text();
console.log("URL:", targetUrl);
console.log("HTTP", res.status);
try {
  const j = JSON.parse(text);
  console.log(JSON.stringify(j, null, 2));
} catch {
  console.log(text.slice(0, 2000));
}
process.exit(res.ok ? 0 : 1);
