import fs from "node:fs";
import path from "node:path";

const WF_ROOT = path.resolve("n8n-workflows");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith(".json")) {
      const l = ent.name.toLowerCase();
      if (l.includes("sample") || l.includes("payload")) continue;
      out.push(p);
    }
  }
  return out;
}

/** One short tag: CONFIG | SYS 00 | SYS 01–09 | SW */
function tagForName(name) {
  if (!name) return null;
  if (name.startsWith("CONFIG")) return "CONFIG";
  if (name.startsWith("SYS 00")) return "SYS 00";
  if (name.startsWith("SW:") || name.startsWith("SW —")) return "SW";
  const m = name.match(/^SYS (\d{1,2})\b/);
  if (m) return `SYS ${m[1].padStart(2, "0")}`;
  if (name.includes("Kickoff")) return "SYS 01";
  return null;
}

let updated = 0;
for (const file of walk(WF_ROOT)) {
  const raw = fs.readFileSync(file, "utf8");
  let j;
  try {
    j = JSON.parse(raw);
  } catch {
    continue;
  }
  const tag = tagForName(j.name);
  if (!tag) continue;
  const single = JSON.stringify([{ name: tag }]);
  if (!raw.includes('"tags"')) continue;
  const replaced = raw.replace(/"tags":\s*\[[\s\S]*?\]/m, `"tags": ${single}`);
  if (replaced !== raw) {
    fs.writeFileSync(file, replaced);
    updated++;
  }
}
console.log(`Updated ${updated} workflow files`);
