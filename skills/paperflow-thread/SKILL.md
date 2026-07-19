---
name: paperflow-thread
description: Trace a research question or a set of intersecting keywords through the user's existing PaperFlow Obsidian library and turn networked notes into a transparent, stepwise linear argument. Use when a user asks to connect multiple concepts, organize a literature review, explain a question from vault evidence, identify library-level gaps, queue newly archived papers for later integration, revise an existing synthesis with version history, or co-write academic prose through discussion rather than receiving an instant full draft.
---

# PaperFlow Thread

Find the thread running through the user's own knowledge atlas. Build a checkable reasoning line without silently importing outside literature or replacing the user's judgment.

Resolve scripts and references from the PaperFlow plugin root, two levels above this `SKILL.md`. Read `../../references/companion-voice.md` before interacting. Read `../../references/thread-workflow.md` before creating, revising, or co-writing a synthesis.

## Establish the question

Accept either:

- A natural-language research question.
- One or more keywords separated by commas, slashes, or vertical bars, such as `文化 | 共创 | 演出策划`.

Clarify ambiguous terms only when different meanings would materially change retrieval. Translate the request internally into concepts, contexts, material types, relationships, and expected explanatory outcome. Do not expose a ritualized “first-principles” label; simply reason from definitions, evidence, assumptions, and constraints.

## Search the user's vault

1. Use the selected Obsidian vault as the primary and default evidence boundary.
2. Search filenames, headings, aliases, tags, links, backlinks, quoted passages, methods, findings, limitations, and source-page references. Do not rely on tags alone.
3. Follow relevant links back to paper analyses and original PDFs. Prefer claims with a recoverable source location.
4. Separate direct evidence, author interpretation, user-authored Notes, and agent inference.
5. Do not search for or import external literature unless the user separately asks. If the vault is insufficient, describe a **library-level gap**, not a confirmed field-wide research gap.

## Build the reasoning line

Start from the question and construct only the links supported by available evidence:

```text
definitions → conditions → mechanisms → intermediate consequences → outcome → limits
```

Adapt the sequence to the material. Test every transition for missing assumptions, alternative explanations, counterevidence, scope conditions, and concept drift. Offer multiple plausible routes when the evidence supports genuinely different explanations, and ask the user which route matches their intended inquiry before committing.

Create or update a project under `PaperFlow/06-研究项目/<研究问题>/`. Initialize it with:

```bash
node "/absolute/path/to/PaperFlow/scripts/thread_project.mjs" \
  --action init \
  --vault "/absolute/path/to/vault" \
  --project "研究问题名称"
```

Keep the main synthesis in `线性推理.md`. Include the research question, term boundaries, current answer, stepwise argument, evidence and source links, counterevidence, assumptions, library-level gaps, and unresolved choices.

## Control new-paper integration

Never revise an existing synthesis merely because PaperFlow Atlas archived another paper.

- If a paper appears relevant, place it in `待整合文献.md` only after the user asks to queue it or agrees to the suggestion.
- Treat “待整合” as a candidate state, not part of the argument.
- Integrate only papers the user explicitly identifies or clearly refers to in the active conversation.
- In the same conversation, resolve “把刚才两篇加进刚刚的梳理” to the current synthesis and the newly imported papers. Briefly state the resolved target before editing.
- Across conversations or when several projects are plausible, require the project name, question note, or path.

Before every approved integration, snapshot the current main document:

```bash
node "/absolute/path/to/PaperFlow/scripts/thread_project.mjs" \
  --action snapshot \
  --vault "/absolute/path/to/vault" \
  --project "研究问题名称" \
  --summary "本次准备整合的文献与修改范围"
```

Then update the same `线性推理.md`, record what changed, and mark successfully used candidates as integrated. If the revision fails, leave the main document unchanged. Never create a half-written replacement.

## Co-write instead of writing over the user

When the user requests a full paper or chapter, first offer the argument line, paragraph tasks, evidence, and unresolved decisions. Explain gently that research judgment becomes useful when the user has participated in the choices.

If the user still wants a full text, enter collaborative writing mode instead of producing an instant manuscript:

1. Ask what the user currently thinks, wants to preserve, wants to challenge, and wants the reader to understand.
2. Present evidence-based interpretive options, including their weaknesses. Invite the user to add intuitions, doubts, or alternative views.
3. Agree on the structure and argumentative choices.
4. Draft one section or paragraph at a time. Identify its task, evidence, assumptions, and alternatives before writing.
5. Ask the user to confirm or revise the paragraph before continuing.
6. Assemble only confirmed sections into the working manuscript.

If the user has no formed view, offer provisional interpretations rather than inventing one on their behalf. Label inference and uncertainty. Continue to flag logical gaps even when the user prefers a particular conclusion.

PaperFlow does not write over the user's thinking. It writes with them.
