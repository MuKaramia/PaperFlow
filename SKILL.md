---
name: obsidian-literature-workflow
description: Initialize an isolated PaperFlow research library inside a selected Obsidian vault, archive academic PDFs with a vault-local original, produce separate full Chinese translations and evidence-linked core analyses, create linked concept/theory/method/viewpoint notes, and collect PDF highlights plus user Notes into per-paper close-reading notes. Use with Codex, Claude Code, Kimi Code, or WorkBuddy when a user asks to set up a clean Obsidian literature library, import or migrate PDFs, translate, annotate, closely read, summarize, classify, connect papers, or install and configure the LLM Translator and PDF Annotator workflow.
---

# PaperFlow｜文脉

Build an isolated PaperFlow research library inside an Obsidian vault. Keep the source PDF, full translation, analytical synthesis, and personal annotations separate but linked.

Resolve every bundled script and reference relative to the directory containing this `SKILL.md`; never assume the current working directory is the skill directory. Require Obsidian Desktop and Node.js 18 or newer for plugin setup.

## Adapt to the host

1. Identify whether the current host is Codex, Claude Code, Kimi Code, or WorkBuddy without changing the research workflow.
2. Read [references/platforms.md](references/platforms.md) during installation, first use, permission troubleshooting, or any Kimi Code or WorkBuddy session.
3. Use Kimi Code instead of ordinary Kimi web or mobile chat when the task requires local vault access or scripts.
4. In WorkBuddy Desktop, use an uploaded Skill package, select or authorize the vault as a working folder, and use its official Obsidian Skill as a complementary connector when available.
5. Keep access scoped to the selected vault, input PDF, this Skill folder, and the network destinations needed for an explicitly approved plugin installation.

Before changing the vault on first use, run the read-only check:

```bash
node "/absolute/path/to/obsidian-literature-workflow/scripts/preflight.mjs" \
  --host auto \
  --vault "/absolute/path/to/vault"
```

If host detection returns `unknown`, rerun with `--host codex`, `claude`, `kimi`, or `workbuddy`. Stop and explain any failed requirement rather than bypassing it.

## Establish the target

1. Recommend creating a dedicated empty Obsidian vault for PaperFlow when the user wants the cleanest setup. Ask the user to create or open it in Obsidian first so `.obsidian/` exists.
2. When the user keeps an existing vault, isolate all managed content under one top-level `PaperFlow/` folder. Do not place new material into the user's pre-existing classifications by default.
3. Locate the selected vault by finding `.obsidian/`. Never invent a vault path or initialize an arbitrary directory as a vault.
4. Identify the input PDF and the paper key, preferably `Author Year - Short Title`.
5. Never scan, reorganize, or migrate existing literature automatically. Import old literature only after an explicit user request, and copy rather than move it unless the user clearly requests otherwise.
6. Never delete the downloaded source. Copy it into the vault and verify the copy before treating ingestion as complete.

## Initialize the PaperFlow library

On first use with a selected vault, run:

```bash
node "/absolute/path/to/obsidian-literature-workflow/scripts/bootstrap_vault.mjs" \
  --vault "/absolute/path/to/vault"
```

This creates an idempotent, isolated structure:

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

The initializer also adds `PaperFlow 首页.md`, one index note per area, and editable copies of the three paper templates. It creates missing items and keeps existing files unchanged. Run it before archiving the first PDF, and rerun safely when repairing an incomplete structure.

Use the folders consistently:

- Put discipline-specific notes and indexes in `01-学科领域`.
- Put genuinely cross-disciplinary concepts in `02-跨领域概念`.
- Put reusable theories, models, mechanisms, and boundary conditions in `03-理论与模型`.
- Put research designs, measurements, and analytical methods in `04-研究方法`.
- Put every processed paper package in `05-文献原库`.
- Put question-led collections and active studies in `06-研究项目`.
- Put unprocessed PDFs and unresolved items in `07-待处理`.
- Keep conventions and templates in `90-规范与模板`, and miscellaneous attachments in `99-其他附件`.

## Configure the reading tools

Use two core plugins:

- **LLM Translator** (`llm-translator`) for selection translation only.
- **PDF Annotator** (`local-pdf-annotator`) for persistent highlights, deletion, Page Notes, and excerpt Notes stored as Markdown sidecars.

Ask for permission before installing community plugins or changing `.obsidian/` unless the user already requested that setup. Then run:

```bash
node "/absolute/path/to/obsidian-literature-workflow/scripts/setup_plugins.mjs" \
  --vault "/absolute/path/to/vault"
```

The setup applies the tested compatibility patches, hides LLM Translator's PDF-writing highlighter, enables a draggable translation popup, and makes PDF Annotator the default PDF view. Restart Obsidian or disable and re-enable both plugins afterward.

Read [references/plugin-workflow.md](references/plugin-workflow.md) when installing, operating, debugging, or updating the plugins.

## Archive the paper

Run:

```bash
node "/absolute/path/to/obsidian-literature-workflow/scripts/archive_paper.mjs" \
  --vault "/absolute/path/to/vault" \
  --pdf "/absolute/path/to/downloaded-paper.pdf" \
  --key "Author Year - Short Title"
```

This creates the paper folder under `PaperFlow/05-文献原库`, copies the PDF as `- 原文.pdf`, and creates separate analysis, translation, and close-reading notes without overwriting existing work. Use `--library` only when the user explicitly requests a different location. Follow [references/vault-schema.md](references/vault-schema.md) for naming and linking.

## Read and synthesize the paper

1. Extract bibliographic metadata and readable text. Use OCR when the PDF lacks a text layer.
2. Read the entire paper before finalizing claims. Distinguish author claims, reported evidence, and your inference.
3. Write `核心解析.md` using the supplied headings. Add page references for claims, definitions, methods, results, limitations, and reusable quotations.
4. Create or update atomic notes only for concepts, theories, mechanisms, methods, and viewpoints that materially help retrieval. Route them to the corresponding PaperFlow area, link each note back to the paper, and link the paper analysis to the relevant domain index.
5. Do not fabricate metadata, results, quotations, or page numbers. Mark uncertain extraction explicitly.

## Produce the full Chinese translation

Write the complete translation only in `全文中文译稿.md`.

- Preserve heading hierarchy, paragraph order, citations, formulas, numbering, and page boundaries where practical.
- Keep technical terms consistent. On first use, prefer `中文术语（English term）` when it aids later retrieval.
- Convert tables into translated Markdown tables when structure is recoverable. Link each table to its source page.
- Retain figures as links or embeds from the original PDF. Translate captions and visible labels separately; do not invent unreadable labels or silently redraw data.
- Record OCR gaps, illegible content, and uncertain equations.

Treat OPEN PDF Translate (`open-pdf-translate`) as an optional visual overlay, not a required dependency. The durable full Chinese version remains a Markdown file in the vault.

## Support close reading

Use LLM Translator for temporary selection translation. Drag its popup by the blank area in the top language bar. Do not store these translations in `精读笔记.md`.

Use PDF Annotator for durable reading marks:

- Select an original passage and choose **Annotate** to bind a Note to the excerpt.
- Use **Tag** for a page-level Note without a selected excerpt.
- Enter text directly in **Note** or **Side note**; saving is automatic.
- Right-click the highlight or annotation card and choose **Delete** to remove it.

To collect the current annotations into the paper's close-reading note, run:

```bash
node "/absolute/path/to/obsidian-literature-workflow/scripts/sync_annotations.mjs" \
  --vault "/absolute/path/to/vault" \
  --pdf "PaperFlow/05-文献原库/Author Year - Short Title/Author Year - Short Title - 原文.pdf"
```

The managed section contains only the original excerpt, the user's Note, and a page link. Never insert the temporary Chinese selection translation there. Preserve any manual prose outside the managed markers.

## Verify completion

Confirm all of the following:

- The vault-local PDF opens after the original download is moved or deleted.
- `PaperFlow/` contains the complete `01` through `99` managed structure and `PaperFlow 首页.md`.
- New paper packages are under `PaperFlow/05-文献原库`, not mixed into pre-existing vault classifications.
- `核心解析.md`, `全文中文译稿.md`, and `精读笔记.md` are separate and mutually linked.
- Analysis claims and quotations include usable source locations.
- LLM Translator can translate a selection and its popup can move.
- PDF Annotator can add, edit, persist, search, and delete a highlight or Note after reopening Obsidian.
- Annotation synchronization does not include selection translations and does not overwrite manual prose.

Read [references/plugin-workflow.md](references/plugin-workflow.md) for failure signatures and [references/vault-schema.md](references/vault-schema.md) for the final information architecture.
