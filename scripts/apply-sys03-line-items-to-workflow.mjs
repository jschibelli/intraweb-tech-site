/**
 * Copies Code node sources from scripts/sys03-*.js into SYS 03 Proposal workflow JSON.
 * Run from repo root: node scripts/apply-sys03-line-items-to-workflow.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WF = path.join(
  ROOT,
  "n8n-workflows",
  "03_sales",
  "SYS 03 — Proposal and Contract Delivery.json"
);

const lf = (s) => s.replace(/\r\n/g, "\n");
const extract = lf(fs.readFileSync(path.join(__dirname, "sys03-extract-deal-data.js"), "utf8"));
const prepClaude = lf(fs.readFileSync(path.join(__dirname, "sys03-prep-claude.js"), "utf8"));
const prepPdf = lf(fs.readFileSync(path.join(__dirname, "sys03-prep-pdf.js"), "utf8"));

function patch(nodes) {
  for (const n of nodes) {
    if (n.name === "Extract Deal Data") n.parameters.jsCode = extract;
    if (n.name === "Prep Claude Prompt") n.parameters.jsCode = prepClaude;
    if (n.name === "Prep PDF Input") n.parameters.jsCode = prepPdf;
  }
}

const j = JSON.parse(fs.readFileSync(WF, "utf8"));
patch(j.nodes);
if (j.meta?.activeVersion?.nodes) patch(j.meta.activeVersion.nodes);

fs.writeFileSync(WF, JSON.stringify(j, null, 2) + "\n", "utf8");
console.log("Updated:", WF);
