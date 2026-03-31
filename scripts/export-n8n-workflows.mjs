import fs from "node:fs/promises";
import path from "node:path";

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

async function fetchJson(url, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text.slice(0, 500)}`);
  }

  return res.json();
}

function slugifyFilename(name) {
  const base = (name || "workflow")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .replace(/\s+/g, " ");
  return base.length ? base : "workflow";
}

function bucketForName(name) {
  const n = (name || "").trim();
  if (n.startsWith("CONFIG")) return "CONFIG";
  if (n.startsWith("SYS")) return "SYS";
  if (n.startsWith("SW:")) return "SW";
  if (n.startsWith("IntraWeb")) return "IntraWeb";
  return "Other";
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function fetchFirstWorkingJson(paths, fetcher) {
  const errors = [];
  for (const p of paths) {
    try {
      const data = await fetcher(p);
      return { path: p, data };
    } catch (e) {
      errors.push({ path: p, error: e?.message || String(e) });
    }
  }
  return { path: null, data: null, errors };
}

function normalizeFolderListPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.folders)) return payload.folders;
  return [];
}

function folderIdOf(f) {
  return f?.id ?? f?._id ?? null;
}

function parentIdOf(f) {
  return f?.parentFolderId ?? f?.parentId ?? f?.parent ?? null;
}

async function getDescendantFolderIds({ baseUrl, apiKey, rootFolderId }) {
  // n8n folder APIs vary by version/edition; try a few known patterns.
  const candidates = [
    "/api/v1/folders",
    "/api/v1/workflow-folders",
    "/rest/folders",
    "/rest/workflow-folders",
  ];

  const { path: okPath, data, errors } = await fetchFirstWorkingJson(candidates, async (p) =>
    fetchJson(`${baseUrl}${p}`, { headers: { "X-N8N-API-KEY": apiKey } })
  );

  const folders = normalizeFolderListPayload(data);
  if (!okPath || folders.length === 0) {
    return {
      folderIds: new Set([rootFolderId]),
      source: null,
      note:
        "Folder list endpoint not available; cannot resolve subfolders. " +
        "Will only match workflows whose parentFolderId equals the provided root (if present).",
      errors,
    };
  }

  const childrenByParent = new Map();
  for (const f of folders) {
    const id = folderIdOf(f);
    if (!id) continue;
    const parent = parentIdOf(f);
    const arr = childrenByParent.get(parent) ?? [];
    arr.push(id);
    childrenByParent.set(parent, arr);
  }

  const out = new Set([rootFolderId]);
  const q = [rootFolderId];
  while (q.length) {
    const cur = q.shift();
    const kids = childrenByParent.get(cur) ?? [];
    for (const kid of kids) {
      if (!out.has(kid)) {
        out.add(kid);
        q.push(kid);
      }
    }
  }

  return { folderIds: out, source: okPath, note: null, errors: null };
}

async function main() {
  const outDir = getArg("--out") || "n8n-workflows/internal-ops";
  const excludeArchived = hasFlag("--exclude-archived");
  const parentFolderId = getArg("--parent-folder-id"); // filter root (best-effort unless folders endpoint available)

  const baseUrl = requireEnv("N8N_API_URL").replace(/\/$/, "");
  const apiKey = requireEnv("N8N_API_KEY");

  // n8n public API: GET /api/v1/workflows
  // Note: folder metadata availability varies by edition/version.
  const listUrl = new URL(`${baseUrl}/api/v1/workflows`);
  listUrl.searchParams.set("limit", "250");

  const list = await fetchJson(listUrl.toString(), {
    headers: { "X-N8N-API-KEY": apiKey },
  });

  const workflows = Array.isArray(list?.data) ? list.data : Array.isArray(list) ? list : [];
  if (!workflows.length) {
    throw new Error(
      `No workflows returned from ${listUrl}. ` +
        `Check N8N_API_URL/N8N_API_KEY and that the instance supports /api/v1/workflows.`
    );
  }

  let allowedFolderIds = null;
  let folderFilterInfo = null;
  if (parentFolderId) {
    const r = await getDescendantFolderIds({ baseUrl, apiKey, rootFolderId: parentFolderId });
    allowedFolderIds = r.folderIds;
    folderFilterInfo = { source: r.source, note: r.note, errors: r.errors };
  }

  const filtered = workflows.filter((w) => {
    if (excludeArchived && w?.isArchived) return false;
    if (!parentFolderId) return true;
    if (w?.parentFolderId == null) return false; // strict: if we can't prove folder membership, don't export
    return allowedFolderIds ? allowedFolderIds.has(w.parentFolderId) : w.parentFolderId === parentFolderId;
  });

  await ensureDir(outDir);
  for (const bucket of ["CONFIG", "SYS", "SW", "IntraWeb", "Other"]) {
    await ensureDir(path.join(outDir, bucket));
  }

  const manifest = [];

  for (const w of filtered) {
    const id = String(w.id);
    const name = w.name || id;
    const bucket = bucketForName(name);
    const fileBase = `${slugifyFilename(name)}__${id}.json`;
    const filePath = path.join(outDir, bucket, fileBase);

    const wfUrl = `${baseUrl}/api/v1/workflows/${encodeURIComponent(id)}`;
    const full = await fetchJson(wfUrl, { headers: { "X-N8N-API-KEY": apiKey } });

    // Store the raw workflow payload as returned by n8n API.
    await fs.writeFile(filePath, JSON.stringify(full, null, 2) + "\n", "utf8");

    manifest.push({
      id,
      name,
      bucket,
      active: Boolean(w.active),
      isArchived: Boolean(w.isArchived),
      parentFolderId: w.parentFolderId ?? null,
      file: path.relative(process.cwd(), filePath).replaceAll("\\", "/"),
    });
  }

  const manifestPath = path.join(outDir, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const summary = {
    exported: manifest.length,
    excludedArchived: excludeArchived,
    parentFolderId: parentFolderId ?? null,
    folderFilterInfo,
    outDir,
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

