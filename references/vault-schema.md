# Vault schema and writing contract

## PaperFlow root

Default managed layout:

```text
PaperFlow/
├── PaperFlow 首页.md
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

Recommend a dedicated Obsidian vault for the cleanest experience. In an existing vault, keep this whole tree under the single `PaperFlow/` namespace. Do not merge new PaperFlow materials into an existing classification unless the user explicitly chooses a custom mapping.

Run `scripts/bootstrap_vault.mjs --vault <vault>` before the first import. It is idempotent and does not overwrite existing notes or templates. Never migrate an existing literature collection as a side effect of initialization.

## Paper package

Default layout:

```text
PaperFlow/
└── 05-文献原库/
    └── Author Year - Short Title/
        ├── Author Year - Short Title - 原文.pdf
        ├── Author Year - Short Title - 核心解析.md
        ├── Author Year - Short Title - 全文中文译稿.md
        └── Author Year - Short Title - 精读笔记.md
```

Keep the four logical artifacts separate. Change the library root only after an explicit user request.

## Durable PDF rule

Copy the PDF into the paper folder. Do not create only a link to Downloads. PDF Annotator also creates a checksum-addressed recovery copy under `.pdf-annotator`, but that recovery bundle supplements the visible library copy rather than replacing it.

## Core analysis contract

Write these sections when supported by the paper:

- Bibliographic card and direct PDF link
- One-sentence central claim
- Research problem and motivating gap
- Argument or causal chain
- Core concepts and definitions
- Theory, mechanisms, and boundary conditions
- Data, method, sample, and identification or analytical strategy
- Findings and evidence
- Contribution relative to prior literature
- Limitations, open questions, and critical assessment
- Reusable original quotations with page links
- Links to domain, concept, theory, method, and viewpoint notes

Keep summaries proportional to evidence. Do not turn an author's speculation into a finding.

## Atomic notes

Create an atomic note when an item is reusable across papers, not merely because a term appears once. Each atomic note should contain:

- A concise definition or proposition
- The paper's specific use of it
- A source link with page location
- Related and contrasting notes
- A backlink to the paper analysis

Route discipline-specific notes to `PaperFlow/01-学科领域`, cross-disciplinary concepts to `02-跨领域概念`, theories and models to `03-理论与模型`, and methods to `04-研究方法`. Update the nearest PaperFlow index note so the new paper is discoverable without relying on search.

## Full translation contract

Keep the full Chinese translation separate from analysis and annotations. Include a source-page link at each major section or page boundary. Preserve citations and formula identifiers. For figures and tables:

- Link or embed the original visual.
- Translate captions and legible labels.
- Rebuild a table only when rows and columns are reliable.
- Mark OCR uncertainty instead of guessing.

## Close-reading note contract

The generated annotation region contains:

1. Original excerpt, when the annotation is text-bound.
2. User-authored Note or Side note.
3. A direct link to the source PDF page.

Do not include temporary selection translations. Page tags may contain only a page link and the user's Note because they have no bound excerpt.

Keep manual synthesis outside these markers:

```html
<!-- PDF-ANNOTATIONS:START -->
generated annotations
<!-- PDF-ANNOTATIONS:END -->
```
