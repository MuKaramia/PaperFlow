#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (["--action", "--vault", "--project", "--root", "--summary"].includes(arg)) result[arg.slice(2)] = argv[++i];
    else if (arg === "--help" || arg === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function safeSegment(value, label) {
  const clean = String(value || "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
  if (!clean || clean === "." || clean === "..") throw new Error(`${label} must be a non-empty safe folder name`);
  return clean;
}

function safeRoot(value) {
  const normalized = path.normalize(value || "PaperFlow/06-研究项目");
  if (path.isAbsolute(normalized) || normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw new Error("--root must stay inside the Obsidian vault");
  }
  return normalized;
}

async function assertVault(vault) {
  const stat = await fs.stat(path.join(vault, ".obsidian")).catch(() => null);
  if (!stat?.isDirectory()) throw new Error(`Not an Obsidian vault: ${vault}`);
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

function timestamp(now = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}_${value.hour}${value.minute}${value.second}`;
}

async function pathsFor(args) {
  const vault = path.resolve(args.vault);
  await assertVault(vault);
  const root = safeRoot(args.root);
  const project = safeSegment(args.project, "--project");
  const projectDir = path.join(vault, root, project);
  const relative = path.relative(vault, projectDir);
  if (relative === ".." || relative.startsWith(`..${path.sep}`)) throw new Error("Project path escaped the vault");
  return { vault, root, project, projectDir };
}

async function initProject(args) {
  const { project, projectDir } = await pathsFor(args);
  const versions = path.join(projectDir, "版本记录");
  await fs.mkdir(versions, { recursive: true });
  const assets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets");
  for (const [source, target] of [["thread-main-template.md", "线性推理.md"], ["thread-queue-template.md", "待整合文献.md"]]) {
    const template = (await fs.readFile(path.join(assets, source), "utf8")).replaceAll("{{PROJECT}}", project);
    console.log(`[${await writeIfMissing(path.join(projectDir, target), template)}] ${target}`);
  }
  const index = `# ${project} - 版本索引\n\n| 时间 | 版本文件 | 更新说明 |\n|---|---|---|\n`;
  console.log(`[${await writeIfMissing(path.join(versions, "版本索引.md"), index)}] 版本记录/版本索引.md`);
  console.log(`[ready] ${projectDir}`);
}

async function snapshotProject(args) {
  const { project, projectDir } = await pathsFor(args);
  const main = path.join(projectDir, "线性推理.md");
  const stat = await fs.stat(main).catch(() => null);
  if (!stat?.isFile()) throw new Error(`Main synthesis does not exist: ${main}. Run --action init first.`);
  const versions = path.join(projectDir, "版本记录");
  await fs.mkdir(versions, { recursive: true });
  const stamp = timestamp();
  const versionName = `线性推理_${stamp}.md`;
  const target = path.join(versions, versionName);
  await fs.copyFile(main, target, fs.constants.COPYFILE_EXCL);
  const index = path.join(versions, "版本索引.md");
  const summary = String(args.summary || "正式整合前自动保存").replaceAll("|", "\\|").replaceAll("\n", " ");
  const header = `# ${project} - 版本索引\n\n| 时间 | 版本文件 | 更新说明 |\n|---|---|---|\n`;
  await writeIfMissing(index, header);
  await fs.appendFile(index, `| ${stamp.replace("_", " ")} | [[${versionName.replace(/\.md$/, "")}]] | ${summary} |\n`);
  console.log(`[snapshot] ${target}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.action || !args.vault || !args.project) {
    console.log("Usage: node thread_project.mjs --action init|snapshot --vault /path/to/vault --project 'Research question' [--root PaperFlow/06-研究项目] [--summary text]");
    return;
  }
  if (args.action === "init") await initProject(args);
  else if (args.action === "snapshot") await snapshotProject(args);
  else throw new Error("--action must be init or snapshot");
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
