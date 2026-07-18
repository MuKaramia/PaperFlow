#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FOLDERS = [
  ["01-学科领域", "学科领域索引.md", "按学科建立主题、概念与观点索引。"],
  ["02-跨领域概念", "跨领域概念索引.md", "保存会跨越多个学科反复使用的概念。"],
  ["03-理论与模型", "理论与模型索引.md", "保存理论、模型、机制与边界条件。"],
  ["04-研究方法", "研究方法索引.md", "保存研究设计、方法、测量与分析策略。"],
  ["05-文献原库", "文献原库索引.md", "每篇文献在这里形成独立的原文、译稿、解析和精读笔记包。"],
  ["06-研究项目", "研究项目索引.md", "按具体研究问题组织项目材料和文献组合。"],
  ["07-待处理", "待处理清单.md", "暂存尚未正式归档、需要 OCR 或等待补充信息的材料。"],
  ["90-规范与模板", "PaperFlow 使用规范.md", "保存工作流规范和可编辑模板。"],
  ["99-其他附件", "附件说明.md", "保存无法归入单篇文献包的图片、数据与其他附件。"],
];

const TEMPLATES = [
  ["paper-analysis-template.md", "文献核心解析模板.md"],
  ["full-translation-template.md", "全文中文译稿模板.md"],
  ["reading-notes-template.md", "精读笔记模板.md"],
];

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (["--vault", "--root"].includes(arg)) result[arg.slice(2)] = argv[++i];
    else if (arg === "--help" || arg === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function validateRoot(value) {
  const normalized = path.normalize(value || "PaperFlow");
  if (path.isAbsolute(normalized) || normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw new Error("--root must stay inside the Obsidian vault");
  }
  return normalized;
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

function indexContent(folder, title, description) {
  return `---\ntype: paperflow-index\npaperflow_folder: "${folder}"\n---\n\n# ${title.replace(/\.md$/, "")}\n\n${description}\n\n## 内容\n\n`;
}

function homeContent(root) {
  const links = FOLDERS.map(([folder, note, description]) => `- [[${root}/${folder}/${note.replace(/\.md$/, "")}|${folder}]]：${description}`).join("\n");
  return `---\ntype: paperflow-home\npaperflow_version: 1\n---\n\n# PaperFlow｜文脉\n\n从 PDF 原文出发，分开保存全文译稿、核心解析和个人精读笔记，再把可复用知识连接到学科、概念、理论、方法与研究项目。\n\n## 目录\n\n${links}\n\n## 使用原则\n\n- 新文献默认进入 [[${root}/05-文献原库/文献原库索引|05-文献原库]]。\n- 未处理材料可以先放入 [[${root}/07-待处理/待处理清单|07-待处理]]。\n- 旧文献不会自动迁移，只有明确要求导入时才会复制进 PaperFlow。\n- 原文、全文译稿、核心解析和精读笔记保持分离并相互链接。\n`;
}

async function assertVault(vault) {
  const stat = await fs.stat(path.join(vault, ".obsidian")).catch(() => null);
  if (!stat?.isDirectory()) {
    throw new Error(`Not an Obsidian vault: ${vault}. Create or open the vault in Obsidian first.`);
  }
}

export async function bootstrapVault(vaultInput, options = {}) {
  const vault = path.resolve(vaultInput);
  const root = validateRoot(options.root);
  const log = options.log || console.log;
  const rootDir = path.join(vault, root);
  await assertVault(vault);
  await fs.mkdir(rootDir, { recursive: true });

  for (const [folder, note, description] of FOLDERS) {
    const folderPath = path.join(rootDir, folder);
    await fs.mkdir(folderPath, { recursive: true });
    const status = await writeIfMissing(path.join(folderPath, note), indexContent(folder, note, description));
    log(`[${status}] ${path.join(root, folder, note)}`);
  }

  const assets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets");
  const templateDir = path.join(rootDir, "90-规范与模板");
  for (const [source, target] of TEMPLATES) {
    const content = await fs.readFile(path.join(assets, source), "utf8");
    const status = await writeIfMissing(path.join(templateDir, target), content);
    log(`[${status}] ${path.join(root, "90-规范与模板", target)}`);
  }

  const homeStatus = await writeIfMissing(path.join(rootDir, "PaperFlow 首页.md"), homeContent(root.split(path.sep).join("/")));
  log(`[${homeStatus}] ${path.join(root, "PaperFlow 首页.md")}`);
  log(`[ready] ${rootDir}`);
  return rootDir;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.vault) {
    console.log("Usage: node bootstrap_vault.mjs --vault /path/to/vault [--root PaperFlow]");
    return;
  }
  await bootstrapVault(args.vault, { root: args.root });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[error] ${error.message}`);
    process.exitCode = 1;
  });
}
