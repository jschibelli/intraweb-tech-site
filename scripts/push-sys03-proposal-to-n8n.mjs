import fs from "fs";

const MCP = "C:/Users/jschi/.cursor/mcp.json";
const WF =
  "n8n-workflows/03_sales/SYS 03 — Proposal and Contract Delivery.json";
const WORKFLOW_ID = "1aX9pLXOuVelq3sK";

const raw = fs.readFileSync(MCP, "utf8");
const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
if (!m) throw new Error("N8N_API_KEY not found in mcp.json");
const key = m[1];

const wf = JSON.parse(fs.readFileSync(WF, "utf8"));
// Public API rejects many UI-only settings (callerPolicy, availableInMCP, …).
const apiSettings = pick(wf.settings, [
  "executionOrder",
  "errorWorkflow",
  "timezone",
  "saveExecutionProgress",
  "saveManualExecutions",
  "saveDataErrorExecution",
  "saveDataSuccessExecution",
  "executionTimeout",
]);

function pick(obj, keys) {
  if (!obj || typeof obj !== "object") return {};
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

const body = JSON.stringify({
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: apiSettings,
  staticData: wf.staticData,
  pinData: wf.pinData,
});

const res = await fetch(
  `https://n8n.intrawebtech.com/api/v1/workflows/${WORKFLOW_ID}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": key,
    },
    body,
  }
);

const text = await res.text();
console.log("status", res.status);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2).slice(0, 6000));
} catch {
  console.log(text.slice(0, 2000));
}
process.exit(res.ok ? 0 : 1);
