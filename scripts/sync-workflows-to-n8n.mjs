/**
 * Push local n8n-workflows/*.json to the n8n instance (match by workflow name).
 *
 * Usage:
 *   N8N_API_KEY=... node scripts/sync-workflows-to-n8n.mjs
 *   node scripts/sync-workflows-to-n8n.mjs --dry-run
 *   node scripts/sync-workflows-to-n8n.mjs --passes 3
 *
 * Optional: N8N_API_URL (default https://n8n.intrawebtech.com)
 * Optional: N8N_MCP_JSON path to Cursor mcp.json containing "N8N_API_KEY" (fallback if env unset)
 *
 * Note: The public PUT /workflows/:id schema does not accept tags or description; workflow
 * `tags` in JSON are not pushed here. Use n8n UI or MCP partial updates to align tags after sync.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const WF_ROOT = path.join(REPO_ROOT, "n8n-workflows");

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getIntArg(flag, defaultValue) {
  const v = getArg(flag);
  if (v == null || v === "") return defaultValue;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

/** Public API accepts only a subset; UI-only keys (callerPolicy, availableInMCP, …) cause 400. */
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

function loadApiKey() {
  const fromEnv = process.env.N8N_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const mcpPath =
    process.env.N8N_MCP_JSON?.trim() ||
    path.join(process.env.USERPROFILE || process.env.HOME || "", ".cursor", "mcp.json");
  try {
    const raw = fs.readFileSync(mcpPath, "utf8");
    const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
    if (m) return m[1];
  } catch {
    /* ignore */
  }
  throw new Error(
    "Set N8N_API_KEY or ensure ~/.cursor/mcp.json contains N8N_API_KEY (see scripts/push-sys03-proposal-to-n8n.mjs).",
  );
}

async function fetchJson(url, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { accept: "application/json", ...headers },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text.slice(0, 800)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function shouldSkipFile(name) {
  const lower = name.toLowerCase();
  if (lower.includes("sample")) return true;
  if (lower.includes("payload")) return true;
  return false;
}

function collectWorkflowFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectWorkflowFiles(p, out);
    else if (ent.isFile() && ent.name.endsWith(".json") && !shouldSkipFile(ent.name)) out.push(p);
  }
  return out;
}

/** Sub-workflows and CONFIG first so downstream “publish” checks see updated sub-workflows. */
function sortSyncOrder(paths) {
  const score = (p) => {
    const rel = p.replace(/\\/g, "/");
    if (rel.includes("/_config/")) return 0;
    if (rel.includes("/_subworkflows/")) return 1;
    return 2;
  };
  return [...paths].sort((a, b) => {
    const d = score(a) - score(b);
    return d !== 0 ? d : a.localeCompare(b);
  });
}

/** Prefer non-archived; if multiple, prefer active; then newest updatedAt */
function buildNameToId(workflows) {
  const byName = new Map();
  for (const w of workflows) {
    const name = w.name;
    if (!name) continue;
    const prev = byName.get(name);
    if (!prev) {
      byName.set(name, w);
      continue;
    }
    const score = (x) =>
      (x.isArchived ? 0 : 4) + (x.active ? 2 : 0) + (Date.parse(x.updatedAt || 0) || 0) / 1e15;
    if (score(w) > score(prev)) byName.set(name, w);
  }
  const idMap = new Map();
  for (const [name, w] of byName) idMap.set(name, String(w.id));
  return idMap;
}

async function syncOne({
  filePath,
  baseUrl,
  apiKey,
  nameToId,
  dryRun,
}) {
  const raw = fs.readFileSync(filePath, "utf8");
  let wf;
  try {
    wf = JSON.parse(raw);
  } catch (e) {
    return { status: "fail", file: filePath, error: `invalid JSON: ${e.message}` };
  }
  const name = wf.name;
  if (!name) {
    return { status: "skip", file: filePath, reason: "missing name" };
  }

  if (dryRun) {
    return {
      status: "ok",
      file: path.relative(REPO_ROOT, filePath),
      name,
      action: "would sync",
    };
  }

  const remoteId = nameToId.get(name);
  if (!remoteId) {
    return {
      status: "skip",
      file: filePath,
      name,
      reason: "no remote workflow with this name (non-archived preferred)",
    };
  }

  const body = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: pickSettings(wf.settings),
    staticData: wf.staticData ?? null,
    pinData: wf.pinData ?? {},
  };

  const putUrl = `${baseUrl}/api/v1/workflows/${encodeURIComponent(remoteId)}`;
  try {
    await fetchJson(putUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": apiKey,
      },
      body: JSON.stringify(body),
    });
    return { status: "ok", file: path.relative(REPO_ROOT, filePath), name, id: remoteId };
  } catch (e) {
    return { file: filePath, name, id: remoteId, error: e.message, status: "fail" };
  }
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const passes = dryRun ? 1 : getIntArg("--passes", 2);
  const baseUrl = (process.env.N8N_API_URL || "https://n8n.intrawebtech.com").replace(/\/$/, "");
  const apiKey = dryRun ? null : loadApiKey();

  const listUrl = new URL(`${baseUrl}/api/v1/workflows`);
  listUrl.searchParams.set("limit", "250");
  const listRes = dryRun
    ? null
    : await fetchJson(listUrl.toString(), { headers: { "X-N8N-API-KEY": apiKey } });
  const workflows = Array.isArray(listRes?.data) ? listRes.data : Array.isArray(listRes) ? listRes : [];
  const nameToId = dryRun ? new Map() : buildNameToId(workflows);

  const allFiles = sortSyncOrder(collectWorkflowFiles(WF_ROOT));
  const results = { ok: [], skip: [], fail: [] };
  const passLog = [];
  const syncedOk = new Set();
  let pending = allFiles;

  for (let pass = 1; pass <= passes && pending.length; pass++) {
    const nextFailRecords = [];
    for (const filePath of pending) {
      const r = await syncOne({ filePath, baseUrl, apiKey, nameToId, dryRun });
      if (r.status === "ok") {
        if (!syncedOk.has(filePath)) {
          syncedOk.add(filePath);
          results.ok.push(r);
        }
      } else if (r.status === "skip") {
        results.skip.push(r);
      } else {
        nextFailRecords.push(r);
      }
    }
    results.fail = nextFailRecords;
    passLog.push({ pass, attempted: pending.length, stillFailed: nextFailRecords.length });
    pending = nextFailRecords.map((x) => x.file);
    if (!nextFailRecords.length) break;
  }

  console.log(JSON.stringify({ dryRun, baseUrl, passes, passLog, summary: results }, null, 2));
  if (results.fail.length) process.exit(1);
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
