#!/usr/bin/env node
/**
 * Create or update HubSpot contact property group "Website intake" and custom properties
 * (alphabetical internal names: website_intake_*), matching lib/mapWebsiteIntakeToHubSpotContactProperties.ts.
 * Existing properties are PATCHed (label, description, group); missing ones are POSTed.
 *
 * Env: HUBSPOT_TOKEN or HUBSPOT_ACCESS_TOKEN (CRM contacts schema write).
 *
 * Usage:
 *   node scripts/create-hubspot-website-intake-contact-properties.js
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://api.hubapi.com";
const GROUP_NAME = "website_intake";
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
  return (
    process.env.HUBSPOT_TOKEN?.trim() ||
    process.env.HUBSPOT_ACCESS_TOKEN?.trim() ||
    ""
  );
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

/**
 * Alphabetical by internal `name` (matches mapWebsiteIntakeToHubSpotContactProperties).
 * Labels omit the old "Intake —" prefix; descriptions document source path and usage.
 */
const PROPERTIES = [
  {
    name: "website_intake_audience",
    label: "Audience",
    description:
      "Who the site should speak to and serve, as submitted on the website project intake form (mapped from intake.goals.audience). Use this for positioning, tone, and IA decisions.",
  },
  {
    name: "website_intake_brand_colors",
    label: "Brand colors",
    description:
      "Preferred brand colors, palettes, or constraints for the new site (intake.design.brandColors). May include hex codes, named colors, or narrative guidance for designers.",
  },
  {
    name: "website_intake_budget_notes",
    label: "Budget notes",
    description:
      "Additional context about budget, scope tradeoffs, or financial constraints (intake.budget.notes). Complements budget range and payment preference.",
  },
  {
    name: "website_intake_budget_range",
    label: "Budget range",
    description:
      "The budget band or range the prospect indicated for the website project (intake.budget.range). Used for scoping and proposal alignment.",
  },
  {
    name: "website_intake_business_description",
    label: "Business description",
    description:
      "How the business describes what they do, their offer, and their model (intake.contact.bizDesc). Primary narrative for discovery and copy.",
  },
  {
    name: "website_intake_cms",
    label: "CMS",
    description:
      "Content management system preference or requirement—e.g. stay on current platform, migrate, or headless (intake.content.cms). Informs technical approach.",
  },
  {
    name: "website_intake_competitors",
    label: "Competitors",
    description:
      "Competitors or comparable sites the prospect named (intake.research.competitors). Often a comma-separated list from the form; use for differentiation and benchmarking.",
  },
  {
    name: "website_intake_copywriter",
    label: "Copywriter",
    description:
      "Whether they will supply copy, need copywriting help, or hybrid (intake.content.copywriter). Drives content workflow and estimates.",
  },
  {
    name: "website_intake_design_notes",
    label: "Design notes",
    description:
      "Open-ended design direction, references, or constraints beyond colors and typography (intake.design.designNotes).",
  },
  {
    name: "website_intake_differentiator",
    label: "Differentiator",
    description:
      "What makes their business stand out versus alternatives (intake.research.differentiator). Supports messaging and homepage hierarchy.",
  },
  {
    name: "website_intake_dislike_about",
    label: "What they dislike",
    description:
      "What the prospect dislikes about competitor or reference sites—patterns to avoid (intake.research.dislikeAbout).",
  },
  {
    name: "website_intake_dont_want",
    label: "Design don'ts",
    description:
      "Explicit design elements or styles they do not want on the new site (intake.design.dontWant). Reduces rework and mismatched expectations.",
  },
  {
    name: "website_intake_features",
    label: "Features",
    description:
      "Functionality and features they need—forms, booking, ecommerce, integrations, etc. (intake.content.features).",
  },
  {
    name: "website_intake_final_notes",
    label: "Final notes",
    description:
      "Catch-all notes from the research or closing section of the intake (intake.research.finalNotes). Anything that did not fit other fields.",
  },
  {
    name: "website_intake_font_style",
    label: "Font style",
    description:
      "Typography preferences—serif vs sans, character, pairing hints (intake.design.fontStyle).",
  },
  {
    name: "website_intake_funding",
    label: "Funding",
    description:
      "How the project is funded or approval status if provided (intake.budget.funding). Useful for payment terms and urgency.",
  },
  {
    name: "website_intake_goal_detail",
    label: "Goal detail",
    description:
      "Expanded explanation of success metrics or specific outcomes for the site (intake.goals.goalDetail).",
  },
  {
    name: "website_intake_goals",
    label: "Goals",
    description:
      "High-level goals for the new website—leads, credibility, recruitment, etc. (intake.goals.goals).",
  },
  {
    name: "website_intake_hard_deadline",
    label: "Hard deadline",
    description:
      "Non-negotiable launch or milestone dates—events, campaigns, contracts (intake.goals.hardDeadline).",
  },
  {
    name: "website_intake_has_logo",
    label: "Logo",
    description:
      "Whether they have a usable logo or need logo work (intake.design.hasLogo). Informs brand and design tasks.",
  },
  {
    name: "website_intake_has_photos",
    label: "Photos",
    description:
      "Whether they have photography or need stock or a shoot (intake.design.hasPhotos). Affects content and timeline.",
  },
  {
    name: "website_intake_industry",
    label: "Industry (form)",
    description:
      "Industry or vertical as entered on the intake form (intake.contact.industry). Distinct from HubSpot default industry when both are used.",
  },
  {
    name: "website_intake_inspiration_sites",
    label: "Inspiration sites",
    description:
      "Sites they like or want to emulate in feel or structure (intake.research.inspiration). Reference for visual and UX direction.",
  },
  {
    name: "website_intake_like_about",
    label: "What they like",
    description:
      "What they like about competitor or reference sites—patterns to lean into (intake.research.likeAbout).",
  },
  {
    name: "website_intake_location",
    label: "Location",
    description:
      "Business location, service area, or market geography (intake.contact.location). Relevant for local SEO and contact content.",
  },
  {
    name: "website_intake_ongoing_support",
    label: "Ongoing support",
    description:
      "Interest or need for retainer, maintenance, or post-launch support (intake.budget.ongoing).",
  },
  {
    name: "website_intake_other_pages",
    label: "Other pages",
    description:
      "Additional page types or sections beyond the main list—legal, careers, resources, etc. (intake.content.otherPages).",
  },
  {
    name: "website_intake_pages",
    label: "Pages",
    description:
      "Core pages or sitemap items they expect on the new site (intake.content.pages). Foundation for IA and estimates.",
  },
  {
    name: "website_intake_payment",
    label: "Payment preference",
    description:
      "How they prefer to pay—milestones, upfront, financing, etc. (intake.budget.payment).",
  },
  {
    name: "website_intake_timeline",
    label: "Timeline",
    description:
      "Desired timeline or phases for design and build (intake.goals.timeline). Works with hard deadline for scheduling.",
  },
  {
    name: "website_intake_vibe",
    label: "Vibe",
    description:
      "Overall aesthetic or brand feel they want—modern, playful, minimal, etc. (intake.design.vibe).",
  },
].sort((a, b) => a.name.localeCompare(b.name));

function buildTextareaPayload(def) {
  return {
    name: def.name,
    label: def.label,
    description: def.description,
    groupName: GROUP_NAME,
    type: "string",
    fieldType: "textarea",
  };
}

function buildPatchPayload(def) {
  return {
    label: def.label,
    description: def.description,
    groupName: GROUP_NAME,
  };
}

/**
 * Update existing property (label, description, group). If missing, create.
 */
async function upsertContactProperty(token, def) {
  const patch = await hubRequest(
    token,
    "PATCH",
    `/crm/v3/properties/contacts/${encodeURIComponent(def.name)}`,
    buildPatchPayload(def)
  );
  if (patch.ok) {
    return { action: "updated", def, res: patch };
  }
  if (patch.status === 404) {
    const create = await hubRequest(
      token,
      "POST",
      "/crm/v3/properties/contacts",
      buildTextareaPayload(def)
    );
    return { action: create.ok ? "created" : "failed", def, res: create };
  }
  return { action: "failed", def, res: patch };
}

async function main() {
  loadEnvFromProjectRoot();
  const token = getToken();
  if (!token) {
    console.error(
      "Missing HUBSPOT_TOKEN or HUBSPOT_ACCESS_TOKEN in .env / .env.local"
    );
    process.exit(1);
  }

  const groupBody = {
    name: GROUP_NAME,
    label: "Website intake",
    displayOrder: 1,
  };

  const groupRes = await hubRequest(
    token,
    "POST",
    "/crm/v3/properties/contacts/groups",
    groupBody
  );
  if (groupRes.status === 401) {
    console.error("AUTH ERROR — check token scopes (crm.schemas.contacts.write)");
    process.exit(1);
  }
  if (groupRes.status === 409) {
    console.log(`SKIP: property group ${GROUP_NAME} already exists`);
  } else if (groupRes.ok) {
    console.log(`OK: property group ${GROUP_NAME}`);
  } else {
    console.error(
      `FAIL: property group HTTP ${groupRes.status} — ${groupRes.bodyText.slice(0, 500)}`
    );
    process.exit(1);
  }
  await delay(DELAY_MS);

  for (const def of PROPERTIES) {
    const result = await upsertContactProperty(token, def);
    const res = result.res;

    if (res.status === 401) {
      console.error("AUTH ERROR");
      process.exit(1);
    }
    if (result.action === "updated" && res.ok) {
      console.log(`OK (updated): ${def.name}`);
    } else if (result.action === "created" && res.ok) {
      console.log(`OK (created): ${def.name}`);
    } else if (!res.ok) {
      console.error(
        `FAIL: ${def.name} HTTP ${res.status} — ${res.bodyText.slice(0, 500)}`
      );
    }
    await delay(DELAY_MS);
  }

  console.log("Done. In HubSpot: Settings → Data Management → Objects → Contacts → Groups → Website intake.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
