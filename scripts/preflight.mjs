#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

function usage() {
  console.log("Usage: node preflight.mjs [--host auto|codex|claude|kimi|workbuddy] [--vault /path/to/vault] [--json]");
}

function parseArgs(argv) {
  const args = { host: "auto", vault: null, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--host") args.host = argv[++index];
    else if (value === "--vault") args.vault = argv[++index];
    else if (value === "--json") args.json = true;
    else if (value === "--help" || value === "-h") {
      usage();
      process.exit(0);
    } else throw new Error(`Unknown argument: ${value}`);
  }
  if (!["auto", "codex", "claude", "kimi", "workbuddy"].includes(args.host)) {
    throw new Error(`Unsupported host: ${args.host}`);
  }
  return args;
}

function detectHost(requested) {
  if (requested !== "auto") return { name: requested, source: "explicit" };
  const env = process.env;
  if (env.KIMI_CODE_HOME) return { name: "kimi", source: "KIMI_CODE_HOME" };
  if (Object.keys(env).some((key) => key.startsWith("CODEBUDDY_") || key.startsWith("WORKBUDDY_"))) {
    return { name: "workbuddy", source: "WorkBuddy environment" };
  }
  if (env.CODEX_HOME) return { name: "codex", source: "CODEX_HOME" };
  if (env.CLAUDE_CODE || env.CLAUDE_PROJECT_DIR) return { name: "claude", source: "Claude environment" };
  return { name: "unknown", source: "no host marker" };
}

async function isDirectory(target) {
  const stat = await fs.stat(target).catch(() => null);
  return Boolean(stat?.isDirectory());
}

async function isFile(target) {
  const stat = await fs.stat(target).catch(() => null);
  return Boolean(stat?.isFile());
}

async function canWrite(target) {
  try {
    await fs.access(target, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const host = detectHost(args.host);
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.dirname(scriptDir);
  const requiredFiles = [
    "SKILL.md",
    "scripts/bootstrap_vault.mjs",
    "scripts/archive_paper.mjs",
    "scripts/setup_plugins.mjs",
    "scripts/sync_annotations.mjs",
    "references/platforms.md",
  ];
  const missingResources = [];
  for (const relative of requiredFiles) {
    if (!(await isFile(path.join(skillDir, relative)))) missingResources.push(relative);
  }

  const result = {
    ok: nodeMajor >= 18 && missingResources.length === 0,
    host,
    os: `${os.platform()} ${os.arch()}`,
    node: { version: process.versions.node, supported: nodeMajor >= 18 },
    skill: { path: skillDir, missingResources },
    vault: null,
  };

  if (args.vault) {
    const vaultPath = path.resolve(args.vault);
    const exists = await isDirectory(vaultPath);
    const hasObsidian = exists && (await isDirectory(path.join(vaultPath, ".obsidian")));
    const writable = exists && (await canWrite(vaultPath));
    result.vault = { path: vaultPath, exists, hasObsidian, writable };
    result.ok &&= exists && hasObsidian && writable;
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`PaperFlow preflight: ${result.ok ? "PASS" : "NEEDS ATTENTION"}`);
    console.log(`Host: ${host.name} (${host.source})`);
    console.log(`OS: ${result.os}`);
    console.log(`Node.js: ${result.node.version} (${result.node.supported ? "supported" : "requires 18+"})`);
    console.log(`Skill: ${skillDir}`);
    console.log(`Skill resources: ${missingResources.length === 0 ? "complete" : `missing ${missingResources.join(", ")}`}`);
    if (result.vault) {
      console.log(`Vault: ${result.vault.path}`);
      console.log(`  exists: ${result.vault.exists}`);
      console.log(`  contains .obsidian: ${result.vault.hasObsidian}`);
      console.log(`  writable: ${result.vault.writable}`);
    } else {
      console.log("Vault: not checked; pass --vault before initialization");
    }
  }

  if (!result.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
