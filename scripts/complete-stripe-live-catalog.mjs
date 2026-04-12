/**
 * Stripe LIVE only: Phase 2 cleanup + Phase 3 create for the 23-row service menu.
 * HubSpot is NOT modified (use after HubSpot catalog is already correct).
 *
 * Requires a write-capable secret key: set STRIPE_SECRET_KEY or STRIPE_API_KEY to sk_live_...
 * The Stripe CLI default restricted key (rk_live_...) returns HTTP errors with exit code 0.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "./service-menu-catalog.mjs";
import { readStripeSecretKey, stripeRun } from "./stripe-cli-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOG_PATH = path.join(ROOT, "scripts", "stripe-live-catalog.log");

function log(line) {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}\n`;
  process.stdout.write(row);
  fs.appendFileSync(LOG_PATH, row, "utf8");
}

function stripe(args) {
  return stripeRun(args, ROOT);
}

function stripeList(resource, extraArgs = []) {
  const acc = [];
  let starting_after;
  for (;;) {
    const args = [resource, "list", "--live", "--limit", "100", ...extraArgs];
    if (starting_after) args.push("--starting-after", starting_after);
    const r = stripe(args);
    if (r.status !== 0 || r.json.error) {
      throw new Error(`${resource} list failed: ${r.json?.error?.message || r.stderr}`);
    }
    const data = r.json.data || [];
    acc.push(...data);
    if (!r.json.has_more) break;
    starting_after = data[data.length - 1].id;
  }
  return acc;
}

function readHubSpotToken() {
  const envPath = path.join(ROOT, ".env.local");
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^HUBSPOT_ACCESS_TOKEN=(.*)$/);
    if (m) return m[1].trim();
  }
  throw new Error("HUBSPOT_ACCESS_TOKEN missing in .env.local");
}

async function hubspotIdBySku(sku) {
  const token = readHubSpotToken();
  const body = {
    filterGroups: [
      {
        filters: [{ propertyName: "hs_sku", operator: "EQ", value: sku }],
      },
    ],
    properties: ["name", "hs_sku"],
    limit: 1,
  };
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/products/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return "";
  return json.results?.[0]?.id ? String(json.results[0].id) : "";
}

fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
fs.appendFileSync(LOG_PATH, "\n", "utf8");

const sk = readStripeSecretKey(ROOT);
if (!sk || !sk.startsWith("sk_live")) {
  log(
    "[FATAL] STRIPE_SECRET_KEY or STRIPE_API_KEY must be set to sk_live_... (secret key in env or .env.local). Restricted keys cannot delete/create.",
  );
  process.exit(1);
}

log("[STRIPE-ONLY] === Live catalog sync started ===");

const FAILURES = [];

try {
  const products = stripeList("products");
  const prices = stripeList("prices");
  const links = stripeList("payment_links");
  log(
    `[AUDIT] products: ${products.length}, prices: ${prices.length}, payment_links: ${links.length}`,
  );

  for (const pl of links) {
    if (!pl.active) continue;
    const r = stripe(["payment_links", "update", pl.id, "--live", "--active=false", "-c"]);
    if (r.status === 0) log(`[STRIPE] DEACTIVATED payment_link_id: ${pl.id}`);
    else {
      log(`[STRIPE] FLAG payment_link ${pl.id}: ${r.json?.error?.message || r.stderr}`);
      FAILURES.push({ pl: pl.id, msg: r.json?.error?.message });
    }
  }

  for (const pr of prices) {
    if (!pr.active) continue;
    const r = stripe(["prices", "update", pr.id, "--live", "--active=false", "-c"]);
    if (r.status === 0) log(`[STRIPE] ARCHIVED price_id: ${pr.id}`);
    else {
      log(`[STRIPE] FLAG price ${pr.id}: ${r.json?.error?.message || r.stderr}`);
      FAILURES.push({ price: pr.id, msg: r.json?.error?.message });
    }
  }

  for (const p of products) {
    const rDel = stripe(["products", "delete", p.id, "--live", "-c"]);
    if (rDel.status === 0) {
      log(`[STRIPE] DELETED product_id: ${p.id} — name: ${p.name}`);
      continue;
    }
    const err = rDel.json?.error?.message || "";
    if (/subscription|active subscription|cannot be deleted/i.test(err)) {
      log(`[STRIPE] FLAG product_id: ${p.id} — delete blocked; archiving — ${err}`);
    }
    const rArc = stripe(["products", "update", p.id, "--live", "--active=false", "-c"]);
    if (rArc.status === 0) log(`[STRIPE] ARCHIVED product_id: ${p.id} — name: ${p.name}`);
    else {
      log(`[STRIPE] FLAG product_id: ${p.id}: ${rArc.json?.error?.message || rArc.stderr}`);
      FAILURES.push({ product: p.id, msg: rArc.json?.error?.message });
    }
  }

  const recon = [];
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
      log(`[STRIPE] FLAG create product ${item.sku}: ${rP.json?.error?.message}`);
      FAILURES.push({ sku: item.sku, step: "create_product", msg: rP.json?.error?.message });
      recon.push({ sku: item.sku, stripe: "", hubspot: "", status: "STRIPE_FAIL" });
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
      log(`[STRIPE] FLAG create price ${item.sku}: ${rPr.json?.error?.message}`);
      FAILURES.push({ sku: item.sku, step: "create_price", msg: rPr.json?.error?.message });
      recon.push({ sku: item.sku, stripe: prodId, hubspot: "", status: "PRICE_FAIL" });
      continue;
    }
    const priceId = rPr.json.id;
    const rDef = stripe(["products", "update", prodId, "--live", "-c", `--default-price=${priceId}`]);
    if (rDef.status !== 0) {
      log(`[STRIPE] FLAG default price ${item.sku}: ${rDef.json?.error?.message}`);
      FAILURES.push({ sku: item.sku, step: "default_price", msg: rDef.json?.error?.message });
    } else {
      log(`[STRIPE] CREATED product_id: ${prodId} price_id: ${priceId} — sku: ${item.sku}`);
    }
    const hsId = await hubspotIdBySku(item.sku);
    recon.push({
      sku: item.sku,
      stripe: prodId,
      hubspot: hsId,
      status: rDef.status === 0 && hsId ? "OK" : rDef.status !== 0 ? "PARTIAL" : "MISSING_HUBSPOT_SKU",
    });
  }

  log("[PHASE 4] Reconciliation (SKU | Stripe | HubSpot | Status)");
  for (const row of recon) {
    log(`[ROW] ${row.sku} | ${row.stripe} | ${row.hubspot} | ${row.status}`);
  }
  const post = stripeList("products");
  const active = post.filter((p) => p.active);
  log(`[VERIFY] Stripe products total: ${post.length}, active: ${active.length} (expect 23 active)`);
  log(`[SUMMARY] failures: ${FAILURES.length}`);
  if (FAILURES.length) log(`[SUMMARY] ${JSON.stringify(FAILURES)}`);
  log("[STRIPE-ONLY] === finished ===");
} catch (e) {
  log(`[FATAL] ${e?.stack || e}`);
  process.exit(1);
}
