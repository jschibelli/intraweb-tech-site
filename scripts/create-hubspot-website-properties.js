#!/usr/bin/env node
/**
 * Create HubSpot deal property group "Website Project" and 27 custom deal properties.
 *
 * Requires a HubSpot Private App token with CRM deal schema write access
 * (e.g. crm.schemas.deals.write) in HubSpot → Settings → Integrations → Private Apps.
 *
 * Env: HUBSPOT_TOKEN (preferred) or HUBSPOT_ACCESS_TOKEN. Optional: load from project root
 * .env.local then .env if not set in the shell.
 *
 * Usage:
 *   node scripts/create-hubspot-website-properties.js
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://api.hubapi.com";
const GROUP_NAME = "website_project";
const DELAY_MS = 200;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function loadEnvFromProjectRoot() {
  const root = path.join(__dirname, "..");
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));
}

function getToken() {
  const t =
    process.env.HUBSPOT_TOKEN?.trim() ||
    process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  return t || "";
}

/** Dropdown option internal values: lowercase, underscores, special chars removed (see project spec). */
function slugifyOptionLabel(label) {
  return label
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/[—–]/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function enumOptions(labels) {
  return labels.map((label, displayOrder) => ({
    label,
    value: slugifyOptionLabel(label),
    displayOrder,
    hidden: false,
  }));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hubRequest(token, method, pathname, body) {
  const url = `${BASE_URL}${pathname}`;
  const init = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  const bodyText = await res.text();
  let json;
  try {
    json = bodyText ? JSON.parse(bodyText) : undefined;
  } catch {
    json = undefined;
  }
  return { status: res.status, ok: res.ok, bodyText, json };
}

const PROPERTIES = [
  {
    kind: "enumeration",
    name: "project_budget_range",
    label: "Project Budget Range",
    options: enumOptions([
      "Under $2,500",
      "$2,500 – $5,000",
      "$5,000 – $10,000",
      "$10,000 – $20,000",
      "$20,000+",
      "Not sure — need guidance",
    ]),
  },
  {
    kind: "enumeration",
    name: "requested_launch_timeline",
    label: "Requested Launch Timeline",
    options: enumOptions([
      "ASAP (within 2 weeks)",
      "1 month",
      "6–8 weeks",
      "2–3 months",
      "3–6 months",
      "Flexible / no hard deadline",
    ]),
  },
  {
    kind: "enumeration",
    name: "copywriter_status",
    label: "Copywriter Status",
    options: enumOptions([
      "Client will write all copy",
      "IntraWeb will write the copy",
      "Split — client has some, needs help with the rest",
    ]),
  },
  {
    kind: "enumeration",
    name: "needs_cms",
    label: "Needs CMS",
    options: enumOptions(["Yes", "No", "Not sure"]),
  },
  {
    kind: "enumeration",
    name: "has_logo",
    label: "Has Logo",
    options: enumOptions([
      "Yes — will provide files",
      "No — needs one designed",
      "Has a rough version",
    ]),
  },
  {
    kind: "enumeration",
    name: "font_style_preference",
    label: "Font Style Preference",
    options: enumOptions(["Serif", "Sans-serif", "No preference"]),
  },
  {
    kind: "enumeration",
    name: "has_photography",
    label: "Has Photography",
    options: enumOptions([
      "Yes — professional photos",
      "Yes — phone photos only",
      "No — needs stock photos",
    ]),
  },
  {
    kind: "enumeration",
    name: "project_type",
    label: "Project Type",
    options: enumOptions(["Website", "Automation", "Website + Automation"]),
  },
  {
    kind: "enumeration",
    name: "website_tier",
    label: "Website Tier",
    options: enumOptions(["Web Starter", "Web Growth", "Web Custom"]),
  },
  {
    kind: "enumeration",
    name: "ongoing_support_requested",
    label: "Ongoing Support Requested",
    options: enumOptions(["Yes", "No", "Possibly"]),
  },
  {
    kind: "enumeration",
    name: "funding_source",
    label: "Funding Source",
    options: enumOptions([
      "Business funds",
      "Personal funds",
      "Grant or loan",
      "Prefer not to say",
    ]),
  },
  {
    kind: "enumeration",
    name: "payment_preference",
    label: "Payment Preference",
    options: enumOptions([
      "Upfront / milestone",
      "Monthly retainer",
      "Flexible",
    ]),
  },
  { kind: "textarea", name: "website_pages_requested", label: "Website Pages Requested" },
  { kind: "textarea", name: "features_requested", label: "Features Requested" },
  { kind: "textarea", name: "design_vibe", label: "Design Vibe" },
  { kind: "textarea", name: "design_dont_wants", label: "Design Don'ts" },
  { kind: "textarea", name: "competitor_sites", label: "Competitor Sites" },
  { kind: "textarea", name: "inspiration_sites", label: "Inspiration Sites" },
  { kind: "textarea", name: "what_they_like", label: "What They Like" },
  { kind: "textarea", name: "what_they_dislike", label: "What They Dislike" },
  { kind: "textarea", name: "differentiator", label: "Differentiator" },
  { kind: "textarea", name: "target_audience", label: "Target Audience" },
  { kind: "textarea", name: "goals_selected", label: "Goals Selected" },
  { kind: "textarea", name: "final_notes", label: "Final Notes" },
  { kind: "text", name: "hard_deadline", label: "Hard Deadline" },
  { kind: "text", name: "brand_colors", label: "Brand Colors" },
  { kind: "text", name: "current_website_url", label: "Current Website URL" },
];

function buildPropertyPayload(def) {
  const base = {
    name: def.name,
    label: def.label,
    groupName: GROUP_NAME,
  };
  if (def.kind === "enumeration") {
    return {
      ...base,
      type: "enumeration",
      fieldType: "select",
      options: def.options,
    };
  }
  if (def.kind === "textarea") {
    return {
      ...base,
      type: "string",
      fieldType: "textarea",
    };
  }
  return {
    ...base,
    type: "string",
    fieldType: "text",
  };
}

async function main() {
  loadEnvFromProjectRoot();
  const token = getToken();
  if (!token) {
    console.error(
      "Missing HUBSPOT_TOKEN (or HUBSPOT_ACCESS_TOKEN). Add it to .env or .env.local at the project root, or paste/export your HubSpot Private App token and run again."
    );
    process.exit(1);
  }

  const groupBody = {
    name: GROUP_NAME,
    label: "Website Project",
    displayOrder: 1,
  };

  const groupRes = await hubRequest(
    token,
    "POST",
    "/crm/v3/properties/deals/groups",
    groupBody
  );
  if (groupRes.status === 401) {
    console.error("AUTH ERROR — check token");
    process.exit(1);
  }
  if (groupRes.status === 409) {
    console.log(`SKIP: property group ${GROUP_NAME} already exists`);
  } else if (groupRes.ok) {
    console.log(`OK: property group ${GROUP_NAME}`);
  } else {
    console.error(
      `FAIL: property group ${GROUP_NAME} HTTP ${groupRes.status} — ${groupRes.bodyText.slice(0, 500)}`
    );
    process.exit(1);
  }
  await delay(DELAY_MS);

  for (const def of PROPERTIES) {
    const payload = buildPropertyPayload(def);
    const res = await hubRequest(
      token,
      "POST",
      "/crm/v3/properties/deals",
      payload
    );

    if (res.status === 401) {
      console.error("AUTH ERROR — check token");
      process.exit(1);
    }
    if (res.status === 409) {
      console.log(`SKIP: ${def.name} already exists`);
    } else if (res.ok) {
      console.log(`OK: ${def.name}`);
    } else {
      console.error(
        `FAIL: ${def.name} HTTP ${res.status} — ${res.bodyText.slice(0, 500)}`
      );
    }
    await delay(DELAY_MS);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
