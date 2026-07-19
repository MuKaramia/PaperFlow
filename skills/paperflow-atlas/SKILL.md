---
name: paperflow-atlas
description: Build and maintain a connected academic literature atlas in an isolated PaperFlow area of an Obsidian vault. Use when a user asks to initialize a literature vault, archive or migrate PDFs, preserve vault-local originals, create full Chinese translations, analyze a paper, extract evidence-linked concepts/theories/methods/viewpoints, configure PDF translation and annotation, or synchronize highlights and user Notes. Supports Codex, Claude Code, Kimi Code, CodeBuddy, and WorkBuddy.
---

# PaperFlow Atlas

Turn each paper into a durable, evidence-traceable part of an Obsidian knowledge atlas. Keep the source PDF, full translation, core analysis, and personal annotations separate but linked.

Resolve scripts, assets, and references from the PaperFlow plugin root, two levels above this `SKILL.md`. Never assume the working directory is the plugin directory. Require Obsidian Desktop and Node.js 18 or newer for plugin setup.

Read `../../references/companion-voice.md` before substantive interaction. Read `../../references/platforms.md` during installation, first use, permission troubleshooting, or any Kimi Code, CodeBuddy, or WorkBuddy session. Read `../../references/vault-schema.md` before creating or routing notes. Read `../../references/plugin-workflow.md` when installing, operating, debugging, or updating the Obsidian plugins.

## Establish the target

1. Recommend a dedicated empty Obsidian vault for the cleanest setup. If the user keeps an existing vault, isolate all managed content under `PaperFlow/`.
2. Find the selected vault by locating `.obsidian/`. Never invent a vault path or initialize an arbitrary folder.
3. Scope access to the selected vault, input PDF, PaperFlow plugin folder, and approved network destinations.
4. Never scan, reorganize, or migrate existing literature automatically. Import old papers only after an explicit request, and copy rather than move unless asked otherwise.
5. Copy every source PDF into the vault and verify it. Never rely only on a link to Downloads.

Run the read-only preflight before first use:

```bash
node "/absolute/path/to/PaperFlow/scripts/preflight.mjs" --host auto --vault "/absolute/path/to/vault"
```

Stop and explain failed requirements instead of bypassing them.

## Initialize the library

Run:

```bash
node "/absolute/path/to/PaperFlow/scripts/bootstrap_vault.mjs" --vault "/absolute/path/to/vault"
```

Create only missing items in this structure:

```text
PaperFlow/
├── 01-学科领域/
├── 02-跨领域概念/
├── 03-理论与模型/
├── 04-研究方法/
├── 05-文献原库/
├── 06-研究项目/
├── 07-待处理/
├── 90-规范与模板/
└── 99-其他附件/
```

Keep existing files unchanged. Put question-led synthesis projects under `06-研究项目`; PaperFlow Thread manages their reasoning documents.

## Configure reading tools

Use LLM Translator (`llm-translator`) for temporary selection translation and PDF Annotator (`local-pdf-annotator`) for persistent, deletable highlights and Notes. Ask permission before installing community plugins or changing `.obsidian/`, unless the user already requested it.

```bash
node "/absolute/path/to/PaperFlow/scripts/setup_plugins.mjs" --vault "/absolute/path/to/vault"
```

Restart Obsidian or reload both plugins afterward. Treat OPEN PDF Translate as optional; the durable complete Chinese translation remains Markdown inside the vault.

## Archive and analyze a paper

Run:

```bash
node "/absolute/path/to/PaperFlow/scripts/archive_paper.mjs" \
  --vault "/absolute/path/to/vault" \
  --pdf "/absolute/path/to/paper.pdf" \
  --key "Author Year - Short Title"
```

Then:

1. Read the full paper, using OCR when necessary.
2. Distinguish author claims, reported evidence, user interpretations, and agent inference.
3. Write `核心解析.md` with source pages for claims, definitions, methods, findings, limitations, and reusable quotations.
4. Write the complete Chinese reading version only in `全文中文译稿.md`. Preserve structure, citations, numbering, formulas, and recoverable tables. Link or embed original figures and translate only legible labels.
5. Create atomic concept, theory, method, or viewpoint notes only when they materially improve cross-paper retrieval. Link every note back to source evidence and update the nearest index.
6. Mark uncertain metadata, OCR gaps, unreadable labels, and unsupported inferences. Never fill gaps for completeness.

Archiving a new paper must not silently change an existing PaperFlow Thread synthesis. At most, mention that it may be relevant and ask whether the user wants it queued or integrated.

## Support close reading

Use LLM Translator only for temporary selection translation. Do not copy that translation into `精读笔记.md`.

Use PDF Annotator to bind durable Notes to original excerpts, add Page Notes, search annotations, and delete them through the annotation menu. Synchronize annotations with:

```bash
node "/absolute/path/to/PaperFlow/scripts/sync_annotations.mjs" \
  --vault "/absolute/path/to/vault" \
  --pdf "PaperFlow/05-文献原库/Author Year - Short Title/Author Year - Short Title - 原文.pdf"
```

Keep only the original excerpt, user Note, and page link inside the managed annotation markers. Preserve manual writing outside those markers.

## Verify completion

Confirm that the vault-local PDF remains available after the download is removed, the four paper artifacts remain separate and linked, claims have usable source locations, and annotation synchronization preserves manual prose. If plugins were configured, verify selection translation, popup dragging, highlight persistence, Note editing, and deletion after reopening Obsidian.
