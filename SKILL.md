---
name: obsidian-literature-workflow
description: Archive academic PDFs into an Obsidian vault, preserve a vault-local original, produce a separate full Chinese translation and evidence-linked core analysis, create linked concept/theory/method/viewpoint notes, and collect PDF highlights plus user Notes into a per-paper close-reading note. Use when a user asks to import, translate, annotate, closely read, summarize, classify, or connect a PDF paper in Obsidian, or asks to install/configure the LLM Translator and PDF Annotator reading workflow for Codex or Claude Code.
---

# Obsidian Literature Workflow

Build a durable paper package in Obsidian. Keep the source PDF, full translation, analytical synthesis, and personal annotations separate but linked.

Resolve every bundled script and reference relative to the directory containing this `SKILL.md`; never assume the current working directory is the skill directory. Require Obsidian Desktop and Node.js 18 or newer for plugin setup.

## Establish the target

1. Locate the Obsidian vault by finding `.obsidian/`.
2. Identify the input PDF and the paper key, preferably `Author Year - Short Title`.
3. Inspect the vault's existing folder and metadata conventions before adding files. Preserve them when they differ from the defaults in this skill.
4. Never delete the downloaded source. Copy it into the vault and verify the copy before treating ingestion as complete.

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

This creates a paper folder, copies the PDF as `- 原文.pdf`, and creates separate analysis, translation, and close-reading notes without overwriting existing work. Follow [references/vault-schema.md](references/vault-schema.md) for naming and linking.

## Read and synthesize the paper

1. Extract bibliographic metadata and readable text. Use OCR when the PDF lacks a text layer.
2. Read the entire paper before finalizing claims. Distinguish author claims, reported evidence, and your inference.
3. Write `核心解析.md` using the supplied headings. Add page references for claims, definitions, methods, results, limitations, and reusable quotations.
4. Create or update atomic notes only for concepts, theories, mechanisms, methods, and viewpoints that materially help retrieval. Link each note back to the paper and link the paper analysis to the relevant domain index.
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
  --pdf "05-文献原库/Author Year - Short Title/Author Year - Short Title - 原文.pdf"
```

The managed section contains only the original excerpt, the user's Note, and a page link. Never insert the temporary Chinese selection translation there. Preserve any manual prose outside the managed markers.

## Verify completion

Confirm all of the following:

- The vault-local PDF opens after the original download is moved or deleted.
- `核心解析.md`, `全文中文译稿.md`, and `精读笔记.md` are separate and mutually linked.
- Analysis claims and quotations include usable source locations.
- LLM Translator can translate a selection and its popup can move.
- PDF Annotator can add, edit, persist, search, and delete a highlight or Note after reopening Obsidian.
- Annotation synchronization does not include selection translations and does not overwrite manual prose.

Read [references/plugin-workflow.md](references/plugin-workflow.md) for failure signatures and [references/vault-schema.md](references/vault-schema.md) for the final information architecture.
