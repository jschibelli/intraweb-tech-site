/**
 * Offline test for "SYS 01.5 — Client Intake Brief (Real-Time)":
 * runs the "Build Intake Brief" Code node against HubSpot-style property fixtures.
 *
 * The live workflow is HubSpot-triggered; /api/v1/workflows/:id/execute is not enabled (405),
 * so this validates the brief markdown and tier logic without calling n8n or HubSpot.
 *
 * Usage:
 *   node scripts/test-sys015-client-intake-brief.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_WF = path.join(
  REPO_ROOT,
  "n8n-workflows",
  "01_lead-generation",
  "SYS 01.5 — Client Intake Brief (Real-Time).json"
);

function prop(value) {
  return { value: value == null ? "" : String(value) };
}

function hubspotProperties(overrides = {}) {
  const base = {
    firstname: prop("Alex"),
    lastname: prop("Rivera"),
    email: prop("alex@example.com"),
    company: prop("Rivera Labs"),
    phone: prop("555-0100"),
    website: prop("https://rivera.example"),
    hs_lead_status: prop("NEW"),
    createdate: prop(new Date("2026-01-15T12:00:00Z").toISOString()),
    website_intake_goals: prop("Launch a marketing site with blog and lead capture"),
    website_intake_industry: prop("B2B SaaS"),
    website_intake_timeline: prop("6–8 weeks"),
    website_intake_pages: prop("Home, About, Services, Blog, Contact"),
    website_intake_competitors: prop("stripe.com, linear.app"),
    website_intake_design_notes: prop("Clean, minimal, lots of whitespace"),
  };
  return { ...base, ...overrides };
}

function runBuildIntakeBrief(jsCode, properties) {
  const fn = new Function("items", jsCode);
  const items = [{ json: { properties } }];
  return fn(items);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const wfPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_WF;
const raw = fs.readFileSync(wfPath, "utf8");
const wf = JSON.parse(raw);
const codeNode = wf.nodes?.find((n) => n.name === "Build Intake Brief");
assert(codeNode?.parameters?.jsCode, 'Workflow must contain node "Build Intake Brief" with jsCode');
const jsCode = codeNode.parameters.jsCode;

// Case 1: rich intake → Growth path (pages > 4, no "simple" in goals)
const out1 = runBuildIntakeBrief(jsCode, hubspotProperties());
assert(Array.isArray(out1) && out1.length === 1, "Code node must return one item");
const { brief, slug, name } = out1[0].json;
assert(name === "Alex Rivera", `name: expected "Alex Rivera", got ${JSON.stringify(name)}`);
assert(slug === "rivera-labs", `slug: expected rivera-labs, got ${JSON.stringify(slug)}`);
assert(brief.includes("# Client Intake Brief"), "brief must contain title");
assert(brief.includes("Rivera Labs"), "brief must include company");
assert(brief.includes("**Growth**"), "tier should be Growth for 5 pages + typical goals");
assert(!brief.includes("UNKNOWN"), "company UNKNOWN should not appear when company is set");

// Case 2: few pages + simple goals → Starter
const out2 = runBuildIntakeBrief(
  jsCode,
  hubspotProperties({
    website_intake_goals: prop("A simple brochure site"),
    website_intake_pages: prop("Home, About"),
    website_intake_competitors: prop("N/A"),
  })
);
const brief2 = out2[0].json.brief;
assert(brief2.includes("**Starter**"), "tier should be Starter for <=4 pages / simple goals");
assert(brief2.includes("No competitor"), "gaps should mention missing competitors");

// Case 3: company UNKNOWN → displayed as N/A in narrative, slug from name
const out3 = runBuildIntakeBrief(
  jsCode,
  hubspotProperties({
    company: prop("UNKNOWN"),
    website_intake_pages: prop("Home"),
  })
);
const brief3 = out3[0].json.brief;
assert(brief3.includes("**N/A**") || brief3.includes("N/A"), "UNKNOWN company should read as N/A");
// Company becomes "N/A" → slug derives from that ("n-a") before name fallback kicks in
assert(out3[0].json.slug === "n-a", `expected slug "n-a" for UNKNOWN company, got ${JSON.stringify(out3[0].json.slug)}`);

console.log(JSON.stringify({ ok: true, wf: path.relative(REPO_ROOT, wfPath), cases: 3 }, null, 2));
