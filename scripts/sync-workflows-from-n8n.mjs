/**
 * Pull workflows from n8n into local n8n-workflows/*.json (match by `id` in file, else by workflow name).
 * Complement to sync-workflows-to-n8n.mjs (local ← server).
 *
 * Usage:
 *   node scripts/sync-workflows-from-n8n.mjs
 *   node scripts/sync-workflows-from-n8n.mjs --dry-run
 *   node scripts/sync-workflows-from-n8n.mjs --only "n8n-workflows/_config/CONFIG — Global Settings.json"
 *
 * Single workflow: scripts/pull-n8n-workflow.mjs <workflowId> --out "n8n-workflows/..."
 *
 * Optional: N8N_API_URL (default https://n8n.intrawebtech.com)
 * Auth: N8N_API_KEY or ~/.cursor/mcp.json (same as push/pull scripts)
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

function loadApiKey() {
  const fromEnv = process.env.N8N_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const mcpPath =
    process.env.N8N_MCP_JSON?.trim() ||
    path.join(process.env.USERPROFILE || process.env.HOME || "", ".cursor", "mcp.json");
  const raw = fs.readFileSync(mcpPath, "utf8");
  const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
  if (!m) throw new Error("Set N8N_API_KEY or add N8N_API_KEY to ~/.cursor/mcp.json");
  return m[1];
}

async function fetchJson(url, { headers = {} } = {}) {
  const res = await fetch(url, {
    headers: { accept: "application/json", ...headers },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}\n${text.slice(0, 600)}`);
  }
  return JSON.parse(text);
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

async function main() {
  const dryRun = hasFlag("--dry-run");
  const onlyRel = getArg("--only");
  const baseUrl = (process.env.N8N_API_URL || "https://n8n.intrawebtech.com").replace(/\/$/, "");
  const apiKey = loadApiKey();

  const listUrl = new URL(`${baseUrl}/api/v1/workflows`);
  listUrl.searchParams.set("limit", "250");
  const listRes = await fetchJson(listUrl.toString(), { headers: { "X-N8N-API-KEY": apiKey } });
  const workflows = Array.isArray(listRes?.data) ? listRes.data : Array.isArray(listRes) ? listRes : [];
  const nameToId = buildNameToId(workflows);

  let files = collectWorkflowFiles(WF_ROOT);
  if (onlyRel) {
    const abs = path.resolve(REPO_ROOT, onlyRel);
    if (!files.includes(abs)) {
      console.error(`--only path not found or not a workflow JSON: ${onlyRel}`);
      process.exit(1);
    }
    files = [abs];
  }

  const results = { ok: [], skip: [], fail: [] };

  for (const filePath of files) {
    const rel = path.relative(REPO_ROOT, filePath);
    let wf;
    try {
      wf = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      results.fail.push({ file: rel, error: `invalid JSON: ${e.message}` });
      continue;
    }

    // Prefer name → server id (local JSON may store slug placeholders, not real n8n ids).
    let remoteId = wf.name ? nameToId.get(wf.name) ?? null : null;
    if (!remoteId && wf.id != null) {
      remoteId = String(wf.id);
    }
    if (!remoteId) {
      results.skip.push({ file: rel, reason: "no id in JSON and no remote match by name" });
      continue;
    }

    if (dryRun) {
      results.ok.push({ file: rel, id: remoteId, name: wf.name, action: "would pull" });
      continue;
    }

    const url = `${baseUrl}/api/v1/workflows/${encodeURIComponent(remoteId)}`;
    try {
      const data = await fetchJson(url, { headers: { "X-N8N-API-KEY": apiKey } });
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
      results.ok.push({ file: rel, id: remoteId, name: data.name, nodes: data.nodes?.length });
    } catch (e) {
      results.fail.push({ file: rel, id: remoteId, error: e.message });
    }
  }

  console.log(JSON.stringify({ dryRun, baseUrl, summary: results }, null, 2));
  if (results.fail.length) process.exit(1);
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
