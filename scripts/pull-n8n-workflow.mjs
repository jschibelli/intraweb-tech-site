/**
 * Pull a workflow from n8n by ID and write JSON. Uses N8N_API_KEY or ~/.cursor/mcp.json.
 *
 *   node scripts/pull-n8n-workflow.mjs <workflowId> --out <path-relative-to-repo>
 *
 * Example:
 *   node scripts/pull-n8n-workflow.mjs 1aX9pLXOuVelq3sK --out "n8n-workflows/03_sales/SYS 03 — Proposal and Contract Delivery.json"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function loadApiKey() {
  const fromEnv = process.env.N8N_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const mcpPath = path.join(process.env.USERPROFILE || process.env.HOME || "", ".cursor", "mcp.json");
  const raw = fs.readFileSync(mcpPath, "utf8");
  const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
  if (!m) throw new Error("Set N8N_API_KEY or add it to ~/.cursor/mcp.json");
  return m[1];
}

const argv = process.argv.slice(2);
const outIdx = argv.indexOf("--out");
let outRel = outIdx !== -1 ? argv[outIdx + 1] : null;
const idArg = argv.find((a, i) => i !== outIdx + 1 && a !== "--out" && !a.startsWith("--"));

if (!idArg || !outRel) {
  console.error('Usage: node scripts/pull-n8n-workflow.mjs <workflowId> --out "n8n-workflows/..."');
  process.exit(1);
}

const baseUrl = (process.env.N8N_API_URL || "https://n8n.intrawebtech.com").replace(/\/$/, "");
const key = loadApiKey();
const url = `${baseUrl}/api/v1/workflows/${encodeURIComponent(idArg)}`;

const res = await fetch(url, {
  headers: { "X-N8N-API-KEY": key, accept: "application/json" },
});
const text = await res.text();
if (!res.ok) {
  console.error(text.slice(0, 800));
  process.exit(1);
}
const data = JSON.parse(text);

const outPath = path.join(REPO_ROOT, outRel);
await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
await fs.promises.writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(
  JSON.stringify(
    {
      id: idArg,
      name: data.name,
      out: path.relative(REPO_ROOT, outPath),
      nodes: data.nodes?.length,
    },
    null,
    2,
  ),
);
