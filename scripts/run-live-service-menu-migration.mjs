/**
 * Live Stripe + HubSpot service menu migration (Phase 2–4).
 * Logs to stdout and scripts/catalog-migration-live.log
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "./service-menu-catalog.mjs";
import { stripeRun } from "./stripe-cli-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOG_PATH = path.join(ROOT, "scripts", "catalog-migration-live.log");

function log(line) {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}\n`;
  process.stdout.write(row);
  fs.appendFileSync(LOG_PATH, row, "utf8");
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

function stripe(args) {
  const r = stripeRun(args, ROOT);
  return { status: r.status, json: r.json, stderr: r.stderr, out: r.out };
}

function stripeList(resource, extraArgs = []) {
  const acc = [];
  let starting_after;
  for (;;) {
    const args = [resource, "list", "--live", "--limit", "100", ...extraArgs];
    if (starting_after) args.push("--starting-after", starting_after);
    const r = stripe(args);
    if (r.status !== 0 || r.json.error) {
      throw new Error(`${resource} list failed: ${r.json?.error?.message || r.stderr || r.out}`);
    }
    const data = r.json.data || [];
    acc.push(...data);
    if (!r.json.has_more) break;
    starting_after = data[data.length - 1].id;
  }
  return acc;
}

const FAILURES = { stripe: [], hubspot: [] };

async function hubspotFetch(method, url, body) {
  const token = readHubSpotToken();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function hubspotListAllProducts() {
  const props = ["name", "hs_sku", "price", "description", "recurringbillingfrequency"];
  const acc = [];
  let after;
  for (;;) {
    const url = new URL("https://api.hubapi.com/crm/v3/objects/products");
    url.searchParams.set("limit", "100");
    url.searchParams.set("properties", props.join(","));
    if (after) url.searchParams.set("after", after);
    const r = await hubspotFetch("GET", url.toString());
    if (!r.ok) throw new Error(`HubSpot list products failed: ${r.status} ${JSON.stringify(r.json)}`);
    acc.push(...(r.json.results || []));
    after = r.json.paging?.next?.after;
    if (!after) break;
  }
  const archived = [];
  let aafter;
  for (;;) {
    const url = new URL("https://api.hubapi.com/crm/v3/objects/products");
    url.searchParams.set("limit", "100");
    url.searchParams.set("archived", "true");
    url.searchParams.set("properties", props.join(","));
    if (aafter) url.searchParams.set("after", aafter);
    const r = await hubspotFetch("GET", url.toString());
    if (!r.ok) break;
    archived.push(...(r.json.results || []));
    aafter = r.json.paging?.next?.after;
    if (!aafter) break;
  }
  return { active: acc, archived };
}

fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
fs.writeFileSync(LOG_PATH, "", "utf8");

log("[MIGRATION] === LIVE run started (Stripe --live + HubSpot CRM) ===");

(async () => {
  log("[PHASE 2] Pre-flight: Stripe live inventory");
  const products = stripeList("products");
  const prices = stripeList("prices");
  const links = stripeList("payment_links");
  const subs = stripeList("subscriptions");
  log(
    `[AUDIT] Stripe live counts — products: ${products.length}, prices: ${prices.length}, payment_links: ${links.length}, subscriptions: ${subs.length}`,
  );

  log("[PHASE 2] Deactivate active Payment Links (live)");
  for (const pl of links) {
    if (!pl.active) continue;
    const r = stripe(["payment_links", "update", pl.id, "--live", "--active=false", "-c"]);
    if (r.status === 0) {
      log(`[STRIPE] DEACTIVATED payment_link_id: ${pl.id} — was active`);
    } else {
      const msg = r.json?.error?.message || r.stderr || r.out;
      log(`[STRIPE] FLAG payment_link_id: ${pl.id} — deactivate failed: ${msg}`);
      FAILURES.stripe.push({ step: "deactivate_payment_link", id: pl.id, msg });
    }
  }

  log("[PHASE 2] Archive all active Prices (live)");
  for (const pr of prices) {
    if (!pr.active) continue;
    const r = stripe(["prices", "update", pr.id, "--live", "--active=false", "-c"]);
    if (r.status === 0) {
      log(`[STRIPE] ARCHIVED price_id: ${pr.id} — product: ${pr.product}`);
    } else {
      const msg = r.json?.error?.message || r.stderr || r.out;
      log(`[STRIPE] FLAG price_id: ${pr.id} — archive failed: ${msg}`);
      FAILURES.stripe.push({ step: "archive_price", id: pr.id, msg });
    }
  }

  log("[PHASE 2] Delete or archive Products (live)");
  for (const p of products) {
    const rDel = stripe(["products", "delete", p.id, "--live", "-c"]);
    if (rDel.status === 0) {
      log(`[STRIPE] DELETED product_id: ${p.id} — name: ${p.name}`);
      continue;
    }
    const err = rDel.json?.error?.message || rDel.stderr || "";
    if (/subscription|active subscription|cannot be deleted/i.test(err)) {
      log(`[STRIPE] FLAG product_id: ${p.id} — delete blocked (${err}); archiving only`);
    }
    const rArc = stripe(["products", "update", p.id, "--live", "--active=false", "-c"]);
    if (rArc.status === 0) {
      log(`[STRIPE] ARCHIVED product_id: ${p.id} — name: ${p.name}`);
    } else {
      const msg = rArc.json?.error?.message || rArc.stderr || rArc.out;
      log(`[STRIPE] FLAG product_id: ${p.id} — archive failed after delete fail: ${msg}`);
      FAILURES.stripe.push({ step: "product_delete_archive", id: p.id, msg });
    }
  }

  log("[PHASE 2] HubSpot — delete all product library records");
  const hs = await hubspotListAllProducts();
  const hsAll = [...hs.active, ...hs.archived];
  const seen = new Set();
  for (const row of hsAll) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const nm = row.properties?.name || "";
    const r = await hubspotFetch(
      "DELETE",
      `https://api.hubapi.com/crm/v3/objects/products/${row.id}`,
    );
    if (r.ok || r.status === 204) {
      log(`[HUBSPOT] DELETED product_id: ${row.id} — name: ${nm}`);
    } else {
      log(
        `[HUBSPOT] FLAG product_id: ${row.id} — delete failed (${r.status}): ${JSON.stringify(r.json).slice(0, 500)}`,
      );
      FAILURES.hubspot.push({ id: row.id, name: nm, status: r.status, body: r.json });
    }
  }

  log(`[PHASE 3] Create ${CATALOG.length} Stripe + HubSpot products (live)`);
  const reconciliation = [];

  for (const item of CATALOG) {
    const cents = Math.round(item.dollars * 100);
    const metaSku = ["-d", `metadata[sku]=${item.sku}`, "-d", `metadata[category]=${item.category}`];
    const rP = stripe([
      "products",
      "create",
      "--live",
      "-c",
      `--name=${item.name}`,
      `--description=${item.hubDesc}`,
      ...metaSku,
    ]);
    if (rP.status !== 0) {
      const msg = rP.json?.error?.message || rP.stderr || rP.out;
      log(`[STRIPE] FLAG create product sku=${item.sku}: ${msg}`);
      FAILURES.stripe.push({ step: "create_product", sku: item.sku, msg });
      reconciliation.push({
        sku: item.sku,
        stripe_product_id: "",
        hubspot_product_id: "",
        status: `STRIPE_CREATE_FAIL: ${msg}`,
      });
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
        : [
            "prices",
            "create",
            "--live",
            "-c",
            `--product=${prodId}`,
            "--currency=usd",
            `--unit-amount=${cents}`,
          ];
    const rPr = stripe(priceArgs);
    if (rPr.status !== 0) {
      const msg = rPr.json?.error?.message || rPr.stderr || rPr.out;
      log(`[STRIPE] FLAG create price sku=${item.sku}: ${msg}`);
      FAILURES.stripe.push({ step: "create_price", sku: item.sku, msg });
      reconciliation.push({
        sku: item.sku,
        stripe_product_id: prodId,
        hubspot_product_id: "",
        status: `STRIPE_PRICE_FAIL: ${msg}`,
      });
      continue;
    }
    const priceId = rPr.json.id;
    const rDef = stripe(["products", "update", prodId, "--live", "-c", `--default-price=${priceId}`]);
    if (rDef.status !== 0) {
      const msg = rDef.json?.error?.message || rDef.stderr || rDef.out;
      log(`[STRIPE] FLAG set default price sku=${item.sku}: ${msg}`);
      FAILURES.stripe.push({ step: "set_default_price", sku: item.sku, msg });
    } else {
      log(`[STRIPE] CREATED product_id: ${prodId} price_id: ${priceId} — sku: ${item.sku}`);
    }

    const props = {
      name: item.name,
      hs_sku: item.sku,
      price: String(item.dollars),
      description: item.hubDesc,
    };
    if (item.billing === "monthly") props.recurringbillingfrequency = "monthly";

    const rH = await hubspotFetch("POST", "https://api.hubapi.com/crm/v3/objects/products", {
      properties: props,
    });
    let hsId = "";
    if (rH.ok && rH.json?.id) {
      hsId = String(rH.json.id);
      log(`[HUBSPOT] CREATED product_id: ${hsId} — sku: ${item.sku}`);
    } else {
      const msg = JSON.stringify(rH.json).slice(0, 800);
      log(`[HUBSPOT] FLAG create sku=${item.sku}: ${rH.status} ${msg}`);
      FAILURES.hubspot.push({ sku: item.sku, status: rH.status, body: rH.json });
    }

    reconciliation.push({
      sku: item.sku,
      stripe_product_id: prodId,
      hubspot_product_id: hsId,
      status:
        rDef.status === 0 && rH.ok
          ? "OK"
          : rDef.status !== 0
            ? "PARTIAL_STRIPE_DEFAULT"
            : "PARTIAL_HUBSPOT",
    });
  }

  log("[PHASE 4] Verification — recount live Stripe products (active + inactive)");
  const postProducts = stripeList("products");
  const activeStripe = postProducts.filter((p) => p.active);
  log(`[VERIFY] Stripe live products total: ${postProducts.length}, active: ${activeStripe.length}`);

  const rHs = await hubspotFetch(
    "GET",
    "https://api.hubapi.com/crm/v3/objects/products?limit=100&properties=name,hs_sku,price",
  );
  const hsCount = rHs.json?.results?.length ?? 0;
  log(`[VERIFY] HubSpot products listed (first page count): ${hsCount}`);

  let hsTotal = 0;
  let after;
  for (;;) {
    const url = new URL("https://api.hubapi.com/crm/v3/objects/products");
    url.searchParams.set("limit", "100");
    url.searchParams.set("properties", "name,hs_sku");
    if (after) url.searchParams.set("after", after);
    const pg = await hubspotFetch("GET", url.toString());
    if (!pg.ok) break;
    hsTotal += (pg.json.results || []).length;
    after = pg.json.paging?.next?.after;
    if (!after) break;
  }
  log(`[VERIFY] HubSpot products paginated total: ${hsTotal}`);

  log("[PHASE 4] Reconciliation table (SKU | Stripe product ID | HubSpot product ID | Status)");
  for (const row of reconciliation) {
    log(`[ROW] ${row.sku} | ${row.stripe_product_id} | ${row.hubspot_product_id} | ${row.status}`);
  }

  log(`[SUMMARY] Catalog rows defined: ${CATALOG.length} (spec tables total 23; runbook mentioned 24 — using 23 source rows).`);
  log(`[SUMMARY] Failures — Stripe: ${FAILURES.stripe.length}, HubSpot: ${FAILURES.hubspot.length}`);
  if (FAILURES.stripe.length) log(`[SUMMARY] Stripe failure detail: ${JSON.stringify(FAILURES.stripe)}`);
  if (FAILURES.hubspot.length) log(`[SUMMARY] HubSpot failure detail: ${JSON.stringify(FAILURES.hubspot)}`);
  log("[MIGRATION] === LIVE run finished ===");
})().catch((e) => {
  log(`[FATAL] ${e?.stack || e}`);
  process.exit(1);
});
