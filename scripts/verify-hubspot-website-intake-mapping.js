#!/usr/bin/env node
/**
 * Compare HubSpot contact properties (group website_intake) to the app's mapper.
 * Source of truth for names: lib/mapWebsiteIntakeToHubSpotContactProperties.ts → WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES
 *
 * Env: HUBSPOT_TOKEN or HUBSPOT_ACCESS_TOKEN (crm.schemas.contacts.read)
 *
 * Usage:
 *   node scripts/verify-hubspot-website-intake-mapping.js
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://api.hubapi.com";
const GROUP_NAME = "website_intake";

/** Keep in sync with WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES in mapWebsiteIntakeToHubSpotContactProperties.ts */
const EXPECTED_NAMES = [
  "website_intake_audience",
  "website_intake_brand_colors",
  "website_intake_budget_notes",
  "website_intake_budget_range",
  "website_intake_business_description",
  "website_intake_cms",
  "website_intake_competitors",
  "website_intake_copywriter",
  "website_intake_design_notes",
  "website_intake_differentiator",
  "website_intake_dislike_about",
  "website_intake_dont_want",
  "website_intake_features",
  "website_intake_final_notes",
  "website_intake_font_style",
  "website_intake_funding",
  "website_intake_goal_detail",
  "website_intake_goals",
  "website_intake_hard_deadline",
  "website_intake_has_logo",
  "website_intake_has_photos",
  "website_intake_industry",
  "website_intake_inspiration_sites",
  "website_intake_like_about",
  "website_intake_location",
  "website_intake_ongoing_support",
  "website_intake_other_pages",
  "website_intake_pages",
  "website_intake_payment",
  "website_intake_timeline",
  "website_intake_vibe",
].sort();

/** intake JSON path → HubSpot internal name (for documentation in this script output only). */
const MAPPING_DOC = `
Mapper paths (same order as alphabetical property names):
  goals.audience                    → website_intake_audience
  design.brandColors                → website_intake_brand_colors
  budget.notes                      → website_intake_budget_notes
  budget.range                      → website_intake_budget_range
  contact.bizDesc                   → website_intake_business_description
  content.cms                       → website_intake_cms
  research.competitors              → website_intake_competitors
  content.copywriter                → website_intake_copywriter
  design.designNotes                → website_intake_design_notes
  research.differentiator           → website_intake_differentiator
  research.dislikeAbout             → website_intake_dislike_about
  design.dontWant                   → website_intake_dont_want
  content.features                  → website_intake_features
  research.finalNotes               → website_intake_final_notes
  design.fontStyle                  → website_intake_font_style
  budget.funding                    → website_intake_funding
  goals.goalDetail                  → website_intake_goal_detail
  goals.goals                       → website_intake_goals
  goals.hardDeadline                → website_intake_hard_deadline
  design.hasLogo                    → website_intake_has_logo
  design.hasPhotos                  → website_intake_has_photos
  contact.industry                  → website_intake_industry
  research.inspiration              → website_intake_inspiration_sites
  research.likeAbout                → website_intake_like_about
  contact.location                  → website_intake_location
  budget.ongoing                    → website_intake_ongoing_support
  content.otherPages                → website_intake_other_pages
  content.pages                     → website_intake_pages
  budget.payment                    → website_intake_payment
  goals.timeline                    → website_intake_timeline
  design.vibe                       → website_intake_vibe
`;

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

function getToken() {
  return (
    process.env.HUBSPOT_TOKEN?.trim() ||
    process.env.HUBSPOT_ACCESS_TOKEN?.trim() ||
    ""
  );
}

async function main() {
  const root = path.join(__dirname, "..");
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));

  const token = getToken();
  if (!token) {
    console.error("Missing HUBSPOT_TOKEN or HUBSPOT_ACCESS_TOKEN");
    process.exit(1);
  }

  const url = `${BASE_URL}/crm/v3/properties/contacts`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`GET ${url} HTTP ${res.status}:`, text.slice(0, 500));
    process.exit(1);
  }

  const data = JSON.parse(text);
  const results = Array.isArray(data.results) ? data.results : [];
  const inGroup = results.filter((p) => p.groupName === GROUP_NAME);
  const portalNames = inGroup
    .map((p) => p.name)
    .filter(Boolean)
    .sort();

  console.log(MAPPING_DOC);
  console.log(`---\nHubSpot portal: ${portalNames.length} properties in group "${GROUP_NAME}"`);

  const missingInPortal = EXPECTED_NAMES.filter((n) => !portalNames.includes(n));
  const extraInPortal = portalNames.filter((n) => !EXPECTED_NAMES.includes(n));

  if (missingInPortal.length) {
    console.error("\nMISSING in HubSpot (run create-hubspot-website-intake-contact-properties.js):");
    missingInPortal.forEach((n) => console.error(`  - ${n}`));
  }

  if (extraInPortal.length) {
    console.warn("\nExtra properties in HubSpot group (not in app mapper list):");
    extraInPortal.forEach((n) => console.warn(`  - ${n}`));
  }

  for (const name of EXPECTED_NAMES) {
    const def = inGroup.find((p) => p.name === name);
    if (!def) continue;
    const typeOk = def.type === "string";
    const fieldType = def.fieldType || "";
    if (!typeOk || (fieldType && fieldType !== "textarea")) {
      console.warn(
        `  [warn] ${name}: type=${def.type} fieldType=${fieldType} (app sends strings; textarea recommended)`,
      );
    }
  }

  if (missingInPortal.length === 0 && portalNames.length >= EXPECTED_NAMES.length) {
    console.log("\nOK: All expected website_intake_* properties exist in HubSpot for this portal.");
    console.log(`Count: expected ${EXPECTED_NAMES.length}, portal group ${portalNames.length}`);
  } else {
    process.exit(missingInPortal.length ? 2 : 0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
