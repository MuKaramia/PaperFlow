#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const START = "<!-- PDF-ANNOTATIONS:START -->";
const END = "<!-- PDF-ANNOTATIONS:END -->";

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (["--vault", "--pdf", "--output"].includes(arg)) result[arg.slice(2)] = argv[++i];
    else if (arg === "--help" || arg === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

async function sha256(file) {
  return crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex");
}

function parseAnnotationJson(markdown) {
  const blocks = [...markdown.matchAll(/^```json[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)];
  if (!blocks.length) throw new Error("No JSON annotation block found");
  return JSON.parse(blocks.at(-1)[1]);
}

function quote(text) {
  return text.split(/\r?\n/).map((line) => `> ${line}`).join("\n");
}

function uniqueNotes(item) {
  return [...new Set([item.note, item.noteContentCJK].filter((value) => value && value.trim()).map((value) => value.trim()))];
}

function renderItems(doc) {
  const items = [...(doc.highlights || [])].sort((a, b) => a.page - b.page || a.created.localeCompare(b.created));
  const rendered = [];
  for (const item of items) {
    const notes = uniqueNotes(item);
    const excerpt = (item.text || "").trim();
    if (!excerpt && !notes.length) continue;
    const page = item.page + 1;
    const source = `[[${doc.pdf}#page=${page}|打开原文第 ${page} 页]]`;
    const parts = [`## 第 ${page} 页`, source];
    if (excerpt) parts.push("", "> [!quote] 原文", quote(excerpt));
    if (notes.length) parts.push("", "### Note", notes.join("\n\n"));
    parts.push("", `^ann-${item.id}`);
    rendered.push(parts.join("\n"));
  }
  return rendered.length ? rendered.join("\n\n") : "_尚无包含原文或 Note 的批注。_";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.vault || !args.pdf) {
    console.log("Usage: node sync_annotations.mjs --vault /path/to/vault --pdf 'vault/relative/or/absolute.pdf' [--output note.md]");
    return;
  }
  const vault = path.resolve(args.vault);
  const pdf = path.isAbsolute(args.pdf) ? args.pdf : path.join(vault, args.pdf);
  const hash = await sha256(pdf);
  const annotationFile = path.join(vault, ".pdf-annotator", "bundles", "sha256", hash, "annotations.md");
  const doc = parseAnnotationJson(await fs.readFile(annotationFile, "utf8"));
  doc.pdf = path.relative(vault, pdf).split(path.sep).join("/");
  const key = path.basename(pdf, path.extname(pdf)).replace(/ - 原文$/, "");
  const output = path.resolve(args.output || path.join(path.dirname(pdf), `${key} - 精读笔记.md`));
  const managed = `${START}\n${renderItems(doc)}\n${END}`;

  let current;
  try {
    current = await fs.readFile(output, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    current = `---\ntype: literature-reading-notes\nsource_pdf: "[[${doc.pdf}]]"\n---\n\n# ${key} - 精读笔记\n\n${managed}\n`;
  }
  if (current.includes(START) && current.includes(END)) {
    current = current.replace(new RegExp(`${START}[\\s\\S]*?${END}`), managed);
  } else if (!current.includes(managed)) {
    current = `${current.trimEnd()}\n\n${managed}\n`;
  }
  await fs.writeFile(output, current);
  console.log(`[synced] ${output}`);
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
