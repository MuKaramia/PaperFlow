#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bootstrapVault } from "./bootstrap_vault.mjs";

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (["--vault", "--pdf", "--key", "--library"].includes(arg)) result[arg.slice(2)] = argv[++i];
    else if (arg === "--help" || arg === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function safeName(value) {
  return value.replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}

async function sha256(file) {
  return crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex");
}

async function writeIfMissing(file, content) {
  try {
    await fs.writeFile(file, content, { flag: "wx" });
    return "created";
  } catch (error) {
    if (error.code === "EEXIST") return "kept";
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.vault || !args.pdf) {
    console.log("Usage: node archive_paper.mjs --vault /path/to/vault --pdf /path/paper.pdf [--key 'Author Year - Title'] [--library PaperFlow/05-文献原库]");
    return;
  }
  const vault = path.resolve(args.vault);
  const source = path.resolve(args.pdf);
  const key = safeName(args.key || path.basename(source));
  const library = args.library || "PaperFlow/05-文献原库";
  const libraryRoot = path.resolve(vault, library);
  const relativeLibrary = path.relative(vault, libraryRoot);
  if (path.isAbsolute(relativeLibrary) || relativeLibrary === ".." || relativeLibrary.startsWith(`..${path.sep}`)) {
    throw new Error("--library must stay inside the Obsidian vault");
  }
  const paperDir = path.join(libraryRoot, key);
  const pdfName = `${key} - 原文.pdf`;
  const pdfTarget = path.join(paperDir, pdfName);
  const vaultConfig = await fs.stat(path.join(vault, ".obsidian")).catch(() => null);
  if (!vaultConfig?.isDirectory()) throw new Error(`Not an Obsidian vault: ${vault}`);
  if (!args.library) await bootstrapVault(vault, { log: () => {} });
  await fs.mkdir(paperDir, { recursive: true });

  try {
    const [sourceHash, targetHash] = await Promise.all([sha256(source), sha256(pdfTarget)]);
    if (sourceHash !== targetHash) throw new Error(`Refusing to overwrite a different PDF: ${pdfTarget}`);
  } catch (error) {
    if (error.code === "ENOENT") await fs.copyFile(source, pdfTarget, fs.constants.COPYFILE_EXCL);
    else throw error;
  }

  const assets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets");
  const replacements = new Map([
    ["{{PAPER_KEY}}", key],
    ["{{PDF_NAME}}", pdfName],
    ["{{PDF_PATH}}", path.relative(vault, pdfTarget).split(path.sep).join("/")],
  ]);
  for (const [template, suffix] of [["paper-analysis-template.md", "核心解析.md"], ["full-translation-template.md", "全文中文译稿.md"], ["reading-notes-template.md", "精读笔记.md"]]) {
    let text = await fs.readFile(path.join(assets, template), "utf8");
    for (const [from, to] of replacements) text = text.replaceAll(from, to);
    const status = await writeIfMissing(path.join(paperDir, `${key} - ${suffix}`), text);
    console.log(`[${status}] ${key} - ${suffix}`);
  }
  console.log(`[ready] ${paperDir}`);
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
