#!/usr/bin/env node
/**
 * Auto-generates the docs Prompt Library page from the metadata stored
 * in the /prompts directory.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PROMPTS_DIR = path.join(REPO_ROOT, "prompts");
const OUTPUT_FILE = path.join(
  REPO_ROOT,
  "apps",
  "docs",
  "contents",
  "docs",
  "scripts-reference",
  "prompts",
  "index.mdx"
);
const ALLOWED_CATEGORIES = new Set([
  "automation",
  "agents",
  "generated",
  "templates",
  "workflows",
]);
const REPO_URL =
  "https://github.com/jschibelli/portfolio-os/blob/develop/";

function readAllPromptFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(readAllPromptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontMatter(content) {
  if (!content.startsWith("---")) {
    return null;
  }
  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) {
    return null;
  }
  const block = content.substring(4, endIndex).trimEnd();
  const data = {};
  const lines = block.split("\n");
  let currentKey = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("- ") && currentKey && Array.isArray(data[currentKey])) {
      data[currentKey].push(line.slice(2).trim().replace(/^"|"$/g, ""));
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      if (value === "[]") {
        data[key] = [];
        currentKey = key;
        continue;
      }
      if (!value) {
        // Expecting subsequent "- " lines.
        data[key] = [];
        currentKey = key;
        continue;
      }
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      data[key] = value;
      currentKey = key;
      continue;
    }
    if (line.startsWith("- ") && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(line.slice(2).trim().replace(/^"|"$/g, ""));
    }
  }
  return data;
}

function normalizeLinkedScripts(scripts) {
  if (!scripts) return [];
  const normalized = Array.isArray(scripts) ? scripts : [scripts];
  return normalized
    .filter(Boolean)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatScriptsColumn(scripts) {
  const list = normalizeLinkedScripts(scripts);
  if (!list.length) return "—";
  return list.map((entry) => `\`${entry}\``).join(", ");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return dateStr;
}

function buildTableForCategory(name, prompts) {
  if (!prompts.length) return "";
  const rows = prompts
    .map((prompt) => {
      const link =
        "[" +
        prompt.title +
        "](" +
        REPO_URL +
        prompt.relativePath.replace(/\\/g, "/") +
        ")";
      return `| ${link} | ${formatDate(
        prompt.last_reviewed
      )} | ${prompt.status || "—"} | ${formatScriptsColumn(
        prompt.linked_scripts
      )} |`;
    })
    .join("\n");
  return `### ${name.charAt(0).toUpperCase() + name.slice(1)} Prompts

| Prompt | Last Reviewed | Status | Linked Scripts |
| --- | --- | --- | --- |
${rows}
`;
}

function formatPromptDetails(prompt) {
  const scriptsColumn = formatScriptsColumn(prompt.linked_scripts)
  const link = `${REPO_URL}${prompt.relativePath.replace(/\\/g, "/")}`
  const body = prompt.body?.trim()
  const sanitizedBody = body
    ? body.replace(
        /[^\x20-\x7E\n\r\t]/g,
        ""
      )
    : ""
  const bodyBlock = body
    ? `\n<details>\n<summary>Copy Prompt</summary>\n\n~~~markdown\n${sanitizedBody}\n~~~\n\n</details>\n`
    : ""
  return `#### ${prompt.title}

- **Source:** [${prompt.relativePath.replace(/\\/g, "/")}](${link})
- **Last Reviewed:** ${formatDate(prompt.last_reviewed)}
- **Status:** ${prompt.status || "—"}
- **Linked Scripts:** ${scriptsColumn}

${bodyBlock}`;
}

function generateContent(groupedPrompts) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
const header = `---
title: Prompt Library
description: Browse copy-ready prompt templates with execution commands pulled directly from /prompts.
lastUpdated: ${formatter.format(now)}
---
{/* AUTO-GENERATED via scripts/documentation/generate-prompt-library.js */}
import Note from '@/components/docs/note'

# Prompt Library

<Note type="warning">
This page is auto-generated from the metadata defined in the \`prompts/\` directory. Run \`node scripts/documentation/generate-prompt-library.js\` after adding or updating a prompt.
</Note>

## Using This Library

- Start with the category tables below to find a prompt by workflow area.
- Expand any entry in **Prompt Details** to copy the complete text into Cursor or another tool.
- Each prompt lists linked scripts so you can run the right automation helpers.
- Regenerate this page any time prompts change with \`node scripts/documentation/generate-prompt-library.js\`.

`;

  const summarySection = `## Prompt Categories

${Object.keys(groupedPrompts)
  .sort()
  .map((category) => buildTableForCategory(category, groupedPrompts[category]))
  .join("\n")}
`;

  const detailSection = `## Prompt Details

${Object.keys(groupedPrompts)
  .sort()
  .map((category) => {
    const label =
      category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
    const entries = groupedPrompts[category]
      .map((prompt) => formatPromptDetails(prompt))
      .join("\n");
    return `### ${label}\n\n${entries}`;
  })
  .join("\n")}
`;

  const footer = `
---

Need the raw prompt text? Open the linked markdown file in GitHub or your editor, copy the body below the front-matter, and follow the documented Execution snippet.
`;

  return header + summarySection + detailSection + footer;
}

function main() {
  const promptFiles = readAllPromptFiles(PROMPTS_DIR);
  if (process.env.DEBUG_PROMPTS === "1") {
    console.log("Total prompt files discovered:", promptFiles.length);
  }
  const grouped = {};

  for (const filePath of promptFiles) {
    const relativePath = path.relative(REPO_ROOT, filePath);
    const promptRelative = path.relative(PROMPTS_DIR, filePath);
    const segments = promptRelative.split(path.sep);
    const category = segments[0];
    if (!ALLOWED_CATEGORIES.has(category)) {
      if (process.env.DEBUG_PROMPTS === "1") {
        console.log(`Skipping prompt (category ${category} not allowed): ${promptRelative}`);
      }
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    const metadata = parseFrontMatter(content);
    if (!metadata || !metadata.title) {
      if (process.env.DEBUG_PROMPTS === "1") {
        console.log(
          `Skipping prompt (missing metadata): ${promptRelative} (first chars: ${JSON.stringify(
            content.slice(0, 4)
          )})`,
          metadata
        );
      }
      continue;
    }

    if (process.env.DEBUG_PROMPTS === "1") {
      console.log(`Found prompt [${category}]: ${promptRelative}`);
    }

    const bodyStart = content.indexOf("\n---", 3);
    const body = bodyStart !== -1 ? content.slice(bodyStart + 4) : "";

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      ...metadata,
      relativePath: promptRelative,
      body,
    });
  }

  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );
  }

  const output = generateContent(grouped);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  if (process.env.DEBUG_PROMPTS === "1") {
    console.log("Categories:", Object.keys(grouped));
  }
  console.log(`Prompt library generated: ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);
}

main();

