/**
 * Create the 23 service-menu products on Stripe LIVE (product + price + default price).
 * Does not delete or archive anything — use after you have cleared/archived the old catalog.
 *
 * Requires STRIPE_SECRET_KEY or STRIPE_API_KEY = sk_live_... in environment or .env.local
 * (Stripe CLI default rk_live cannot create products.)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "./service-menu-catalog.mjs";
import { readStripeSecretKey, stripeRun } from "./stripe-cli-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOG = path.join(ROOT, "scripts", "stripe-create-products.log");

function log(line) {
  const row = `[${new Date().toISOString()}] ${line}\n`;
  process.stdout.write(row);
  fs.appendFileSync(LOG, row, "utf8");
}

function stripe(args) {
  return stripeRun(args, ROOT);
}

fs.mkdirSync(path.dirname(LOG), { recursive: true });
fs.appendFileSync(LOG, "\n", "utf8");

const sk = readStripeSecretKey(ROOT);
if (!sk || !sk.startsWith("sk_live")) {
  console.error(
    "Missing STRIPE_SECRET_KEY (sk_live_...). Add it to .env.local or set the env var, then re-run:\n  node scripts/create-stripe-live-products-only.mjs",
  );
  process.exit(1);
}

log(`[CREATE] Starting ${CATALOG.length} Stripe live products`);
const failures = [];

for (const item of CATALOG) {
  const cents = Math.round(item.dollars * 100);
  const rP = stripe([
    "products",
    "create",
    "--live",
    "-c",
    `--name=${item.name}`,
    `--description=${item.hubDesc}`,
    "-d",
    `metadata[sku]=${item.sku}`,
    "-d",
    `metadata[category]=${item.category}`,
  ]);
  if (rP.status !== 0) {
    const msg = rP.json?.error?.message || rP.stderr;
    log(`[STRIPE] FLAG product sku=${item.sku}: ${msg}`);
    failures.push({ sku: item.sku, step: "product", msg });
    continue;
  }
  const prodId = rP.json.id;
  const priceArgs =
    item.billing === "monthly"
      ? [
          "prices",
          "create",
          "--live",
          "-c",
          `--product=${prodId}`,
          "--currency=usd",
          `--unit-amount=${cents}`,
          "-d",
          "recurring[interval]=month",
        ]
      : ["prices", "create", "--live", "-c", `--product=${prodId}`, "--currency=usd", `--unit-amount=${cents}`];
  const rPr = stripe(priceArgs);
  if (rPr.status !== 0) {
    const msg = rPr.json?.error?.message || rPr.stderr;
    log(`[STRIPE] FLAG price sku=${item.sku}: ${msg}`);
    failures.push({ sku: item.sku, step: "price", msg });
    continue;
  }
  const priceId = rPr.json.id;
  const rDef = stripe(["products", "update", prodId, "--live", "-c", `--default-price=${priceId}`]);
  if (rDef.status !== 0) {
    const msg = rDef.json?.error?.message || rDef.stderr;
    log(`[STRIPE] FLAG default_price sku=${item.sku}: ${msg}`);
    failures.push({ sku: item.sku, step: "default_price", msg });
    continue;
  }
  log(`[STRIPE] CREATED sku=${item.sku} product_id=${prodId} price_id=${priceId}`);
}

log(`[CREATE] Done. Failures: ${failures.length}`);
if (failures.length) console.error(JSON.stringify(failures, null, 2));
process.exit(failures.length ? 1 : 0);
