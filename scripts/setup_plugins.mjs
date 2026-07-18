#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const REGISTRY_URL = "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
const REQUIRED = ["llm-translator", "local-pdf-annotator"];

function usage() {
  console.log("Usage: node setup_plugins.mjs --vault /path/to/vault [--force] [--skip-download]");
}

function parseArgs(argv) {
  const result = { force: false, skipDownload: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--vault") result.vault = argv[++i];
    else if (arg === "--force") result.force = true;
    else if (arg === "--skip-download") result.skipDownload = true;
    else if (arg === "--help" || arg === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file, fallback) {
  if (!(await exists(file))) return fallback;
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function fetchOk(url) {
  const response = await fetch(url, { headers: { "User-Agent": "obsidian-literature-workflow" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response;
}

async function downloadFirst(urls, required = true) {
  const errors = [];
  for (const url of urls) {
    try {
      return Buffer.from(await (await fetchOk(url)).arrayBuffer());
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (!required) return null;
  throw new Error(errors.join("\n"));
}

async function installPlugin(obsidianDir, record, force) {
  const dir = path.join(obsidianDir, "plugins", record.id);
  const manifestFile = path.join(dir, "manifest.json");
  const mainFile = path.join(dir, "main.js");
  if ((await exists(manifestFile)) && (await exists(mainFile)) && !force) {
    console.log(`[keep] ${record.id} is already installed`);
    return;
  }

  const upstreamManifest = await (await fetchOk(`https://raw.githubusercontent.com/${record.repo}/HEAD/manifest.json`)).json();
  const version = upstreamManifest.version;
  const tags = [version, `v${version}`];
  await fs.mkdir(dir, { recursive: true });

  for (const name of ["manifest.json", "main.js", "styles.css"]) {
    const urls = tags.map((tag) => `https://github.com/${record.repo}/releases/download/${tag}/${name}`);
    urls.push(`https://raw.githubusercontent.com/${record.repo}/HEAD/${name}`);
    const body = await downloadFirst(urls, name !== "styles.css");
    if (body) await fs.writeFile(path.join(dir, name), body);
  }
  console.log(`[install] ${record.id} ${version} from ${record.repo}`);
}

async function backupOnce(file) {
  const backup = `${file}.workflow-original`;
  if (!(await exists(backup))) await fs.copyFile(file, backup);
}

function replaceOnceOrConfirm(text, original, patched, label) {
  if (text.includes(patched)) return { text, status: `${label}: already patched` };
  const count = text.split(original).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one patch target, found ${count}`);
  return { text: text.replace(original, patched), status: `${label}: patched` };
}

async function patchLlmTranslator(obsidianDir) {
  const file = path.join(obsidianDir, "plugins", "llm-translator", "main.js");
  await backupOnce(file);
  let text = await fs.readFile(file, "utf8");
  const original = 'this.languageEl=e.createDiv({cls:"pdf-ollama-translator-popup__language"}),this.actionsEl=e.createDiv({cls:"pdf-ollama-translator-popup__actions"});let n=';
  const patched = 'this.languageEl=e.createDiv({cls:"pdf-ollama-translator-popup__language"}),this.actionsEl=e.createDiv({cls:"pdf-ollama-translator-popup__actions"}),e.onpointerdown=t=>{let n=t.target;if(!(n instanceof Element)||n.closest("button,select,input,textarea"))return;t.preventDefault();let r=this.rootEl.getBoundingClientRect(),s=t.clientX-r.left,i=t.clientY-r.top,o=activeDocument.defaultView??window;this.lastRect=null,e.classList.add("is-dragging");let c=l=>{let u=this.rootEl.getBoundingClientRect(),d=Math.max(12,o.innerWidth-u.width-12),h=Math.max(12,o.innerHeight-u.height-12);this.rootEl.style.left=`${p1(l.clientX-s,12,d)}px`,this.rootEl.style.top=`${p1(l.clientY-i,12,h)}px`},l=()=>{activeDocument.removeEventListener("pointermove",c),activeDocument.removeEventListener("pointerup",l),activeDocument.removeEventListener("pointercancel",l),e.classList.remove("is-dragging")};activeDocument.addEventListener("pointermove",c),activeDocument.addEventListener("pointerup",l),activeDocument.addEventListener("pointercancel",l)};let n=';
  const result = replaceOnceOrConfirm(text, original, patched, "draggable translation popup");
  text = result.text;
  await fs.writeFile(file, text);
  console.log(`[patch] ${result.status}`);
}

async function patchPdfAnnotator(obsidianDir) {
  const file = path.join(obsidianDir, "plugins", "local-pdf-annotator", "main.js");
  await backupOnce(file);
  let text = await fs.readFile(file, "utf8");
  const patches = [
    ["data:new Uint8Array(n),useSystemFonts", "data:new Uint8Array(n.slice(0)),useSystemFonts", "independent custom-view PDF buffer"],
    ["data:new Uint8Array(r),useSystemFonts", "data:new Uint8Array(r.slice(0)),useSystemFonts", "independent native-overlay PDF buffer"],
    ["g.onfocus=()=>this.activateHighlight(s.id)", "g.onfocus=()=>{this.activeHighlightId!==s.id&&this.activateHighlight(s.id)}", "Page note focus"],
    ["f.onfocus=()=>this.activateHighlight(s.id)", "f.onfocus=()=>{this.activeHighlightId!==s.id&&this.activateHighlight(s.id)}", "Side note focus"],
  ];
  for (const [original, patched, label] of patches) {
    const result = replaceOnceOrConfirm(text, original, patched, label);
    text = result.text;
    console.log(`[patch] ${result.status}`);
  }
  await fs.writeFile(file, text);
}

async function configurePlugins(obsidianDir) {
  const llmFile = path.join(obsidianDir, "plugins", "llm-translator", "data.json");
  const llm = await readJson(llmFile, {});
  Object.assign(llm, {
    translationProvider: llm.translationProvider || "google",
    autoTranslateSelection: true,
    enablePopup: true,
    sourceLanguage: "auto",
    targetLanguage: "zh-Hans",
    rememberPopupSize: true,
    showCopyButton: true,
    showRetryButton: true,
  });
  await writeJson(llmFile, llm);

  const annotatorFile = path.join(obsidianDir, "plugins", "local-pdf-annotator", "data.json");
  await writeJson(annotatorFile, {
    registerAsDefaultPdfHandler: true,
    enableNativeOverlay: false,
    annotationStorageMode: "folder",
    annotationStorageFolder: "PDF Annotations",
  });
}

async function configureSnippet(obsidianDir) {
  const snippetName = "literature-workflow-pdf-tools";
  const snippetFile = path.join(obsidianDir, "snippets", `${snippetName}.css`);
  const css = `/* LLM Translator translates selections; PDF Annotator owns persistent annotations. */
.pdf-ollama-translator-popup__button--highlight,
.pdf-ollama-translator-sidebar__highlight-row {
  display: none !important;
}

.pdf-ollama-translator-popup__header {
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.pdf-ollama-translator-popup__header.is-dragging { cursor: grabbing; }

.lpa-margin-note,
.lpa-margin-side-note {
  cursor: text;
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
}
`;
  await fs.mkdir(path.dirname(snippetFile), { recursive: true });
  await fs.writeFile(snippetFile, css);

  const appearanceFile = path.join(obsidianDir, "appearance.json");
  const appearance = await readJson(appearanceFile, {});
  const enabled = new Set(appearance.enabledCssSnippets || []);
  enabled.add(snippetName);
  appearance.enabledCssSnippets = [...enabled];
  await writeJson(appearanceFile, appearance);
}

async function enablePlugins(obsidianDir) {
  const file = path.join(obsidianDir, "community-plugins.json");
  const enabled = new Set(await readJson(file, []));
  for (const id of REQUIRED) enabled.add(id);
  await writeJson(file, [...enabled]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();
  if (!args.vault) throw new Error("--vault is required");
  const vault = path.resolve(args.vault);
  const obsidianDir = path.join(vault, ".obsidian");
  if (!(await exists(obsidianDir))) throw new Error(`Not an Obsidian vault: ${vault}`);

  if (!args.skipDownload) {
    const registry = await (await fetchOk(REGISTRY_URL)).json();
    for (const id of REQUIRED) {
      const record = registry.find((item) => item.id === id);
      if (!record) throw new Error(`Plugin not found in Obsidian registry: ${id}`);
      await installPlugin(obsidianDir, record, args.force);
    }
  }

  for (const id of REQUIRED) {
    if (!(await exists(path.join(obsidianDir, "plugins", id, "main.js")))) {
      throw new Error(`${id} is missing. Run without --skip-download.`);
    }
  }

  await patchLlmTranslator(obsidianDir);
  await patchPdfAnnotator(obsidianDir);
  await configurePlugins(obsidianDir);
  await configureSnippet(obsidianDir);
  await enablePlugins(obsidianDir);
  console.log("[done] Restart Obsidian or disable and re-enable both plugins.");
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
