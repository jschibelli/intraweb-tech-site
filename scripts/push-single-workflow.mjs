/**
 * Push one local workflow JSON to n8n by workflow id (updates server canvas).
 *   node scripts/push-single-workflow.mjs <workflowId> <path-to-json>
 */
import fs from "node:fs";
import path from "node:path";

function loadApiKey() {
  const fromEnv = process.env.N8N_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const mcpPath = path.join(process.env.USERPROFILE || "", ".cursor", "mcp.json");
  const raw = fs.readFileSync(mcpPath, "utf8");
  const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
  if (!m) throw new Error("N8N_API_KEY or ~/.cursor/mcp.json");
  return m[1];
}

function pickSettings(obj) {
  if (!obj || typeof obj !== "object") return {};
  const keys = [
    "executionOrder",
    "errorWorkflow",
    "timezone",
    "saveExecutionProgress",
    "saveManualExecutions",
    "saveDataErrorExecution",
    "saveDataSuccessExecution",
    "executionTimeout",
  ];
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

const id = process.argv[2];
const file = process.argv[3];
if (!id || !file) {
  console.error("Usage: node scripts/push-single-workflow.mjs <workflowId> <path-to-json>");
  process.exit(1);
}

const wf = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const baseUrl = (process.env.N8N_API_URL || "https://n8n.intrawebtech.com").replace(/\/$/, "");
const key = loadApiKey();
const body = JSON.stringify({
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: pickSettings(wf.settings),
  staticData: wf.staticData ?? null,
  pinData: wf.pinData ?? {},
});

const res = await fetch(`${baseUrl}/api/v1/workflows/${encodeURIComponent(id)}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", "X-N8N-API-KEY": key },
  body,
});
const text = await res.text();
console.log(res.status, text.slice(0, 1500));
process.exit(res.ok ? 0 : 1);
