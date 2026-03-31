#!/usr/bin/env node
/**
 * Create HubSpot deal property group "Stripe Billing" and custom deal properties
 * used by the v1 HubSpot ↔ Stripe ↔ n8n implementation.
 *
 * Requires a HubSpot Private App token with CRM deal schema write access.
 *
 * Env: HUBSPOT_TOKEN (preferred) or HUBSPOT_ACCESS_TOKEN
 *
 * Usage:
 *   node scripts/create-hubspot-stripe-properties.js
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://api.hubapi.com';
const GROUP_NAME = 'stripe_billing';
const GROUP_LABEL = 'Stripe Billing';
const DELAY_MS = 200;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function loadEnvFromProjectRoot() {
  const root = path.join(__dirname, '..');
  loadEnvFile(path.join(root, '.env.local'));
  loadEnvFile(path.join(root, '.env'));
}

function getToken() {
  return (process.env.HUBSPOT_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN || '').trim();
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function hubRequest(token, method, pathname, body) {
  const url = `${BASE_URL}${pathname}`;
  const init = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }
  return { ok: res.ok, status: res.status, text, json };
}

const SKU_OPTIONS = [
  { label: 'IW-AS-TIER', value: 'IW-AS-TIER' },
  { label: 'IW-AS-SETUP', value: 'IW-AS-SETUP' },
  { label: 'IW-AS-MRR', value: 'IW-AS-MRR' },
  { label: 'IW-AG-TIER', value: 'IW-AG-TIER' },
  { label: 'IW-AG-SETUP', value: 'IW-AG-SETUP' },
  { label: 'IW-AG-MRR', value: 'IW-AG-MRR' },
  { label: 'IW-WS-SETUP', value: 'IW-WS-SETUP' },
  { label: 'IW-WS-MRR', value: 'IW-WS-MRR' },
  { label: 'IW-WG-SETUP', value: 'IW-WG-SETUP' },
  { label: 'IW-WG-MRR', value: 'IW-WG-MRR' },
  { label: 'IW-WC-SETUP', value: 'IW-WC-SETUP' },
  { label: 'IW-COPY-ADDON', value: 'IW-COPY-ADDON' },
];

const PROPERTIES = [
  {
    name: 'selected_sku',
    label: 'Selected SKU',
    type: 'enumeration',
    fieldType: 'select',
    options: SKU_OPTIONS.map((o, i) => ({ ...o, displayOrder: i, hidden: false })),
  },
  { name: 'stripe_customer_id', label: 'Stripe Customer ID', type: 'string', fieldType: 'text' },
  { name: 'stripe_payment_intent_id', label: 'Stripe Payment Intent ID', type: 'string', fieldType: 'text' },
  { name: 'stripe_checkout_session_id', label: 'Stripe Checkout Session ID', type: 'string', fieldType: 'text' },
  { name: 'stripe_subscription_id', label: 'Stripe Subscription ID', type: 'string', fieldType: 'text' },
  { name: 'stripe_invoice_id', label: 'Stripe Invoice ID', type: 'string', fieldType: 'text' },
  { name: 'stripe_price_id', label: 'Stripe Price ID', type: 'string', fieldType: 'text' },
  { name: 'stripe_payment_link_url', label: 'Stripe Payment Link URL', type: 'string', fieldType: 'text' },
  { name: 'stripe_payment_status', label: 'Stripe Payment Status', type: 'string', fieldType: 'text' },
];

async function ensureGroup(token) {
  const existing = await hubRequest(token, 'GET', `/crm/v3/properties/deals/groups/${GROUP_NAME}`);
  if (existing.ok) return existing.json;

  const created = await hubRequest(token, 'POST', `/crm/v3/properties/deals/groups`, {
    name: GROUP_NAME,
    label: GROUP_LABEL,
    displayOrder: 999,
  });
  if (!created.ok) throw new Error(`Failed to create group: ${created.status} ${created.text}`);
  return created.json;
}

async function ensureProperty(token, p) {
  const get = await hubRequest(token, 'GET', `/crm/v3/properties/deals/${p.name}`);
  if (get.ok) return { status: 'skipped', name: p.name };

  const create = await hubRequest(token, 'POST', `/crm/v3/properties/deals`, {
    name: p.name,
    label: p.label,
    type: p.type,
    fieldType: p.fieldType,
    groupName: GROUP_NAME,
    options: p.options,
  });
  if (!create.ok) throw new Error(`Failed to create property ${p.name}: ${create.status} ${create.text}`);
  return { status: 'created', name: p.name };
}

async function main() {
  loadEnvFromProjectRoot();
  const token = getToken();
  if (!token) {
    console.error('Missing HUBSPOT_TOKEN (or HUBSPOT_ACCESS_TOKEN).');
    process.exit(1);
  }

  await ensureGroup(token);
  const results = [];
  for (const p of PROPERTIES) {
    const r = await ensureProperty(token, p);
    results.push(r);
    await delay(DELAY_MS);
  }

  const created = results.filter((r) => r.status === 'created').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  console.log(`Done. created=${created} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

