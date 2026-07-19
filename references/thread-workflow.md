# PaperFlow Thread contract

## Project structure

Store each synthesis under:

```text
PaperFlow/06-研究项目/<研究问题>/
├── 线性推理.md
├── 待整合文献.md
└── 版本记录/
    └── 版本索引.md
```

Keep `线性推理.md` as the stable entry point so Obsidian links remain valid. Snapshot its current contents before an approved revision.

## Main document contract

Include:

- Research question and scope.
- Term boundaries and material boundary.
- Current answer in calibrated language.
- A numbered, stepwise reasoning line.
- Evidence for each step with links to paper notes or PDF pages.
- Counterevidence and plausible alternatives.
- Assumptions and unsupported transitions.
- Library-level gaps.
- Unresolved choices that require the user's judgment.
- A revision note listing newly integrated sources and changed sections.

Do not convert correlation into causation, an author's proposal into a finding, or a missing vault item into a field-wide gap.

## Candidate queue contract

Record a candidate only after user instruction or agreement. Use one section per paper:

```markdown
## Paper key

- source: [[PaperFlow/05-文献原库/.../核心解析]]
- status: pending
- related_question: ...
- possible_role: support | challenge | extend | redefine | method
- reason: ...
- evidence_pages: ...
- queued_at: YYYY-MM-DD HH:mm
- integrated_version:
```

Do not treat a queued paper as evidence in the main argument. After successful integration, set `status: integrated` and record the snapshot or revision time. Keep rejected or deferred candidates with a short reason instead of silently deleting them.

## Active-conversation resolution

Track the active synthesis and newly imported papers in conversation context. Resolve references such as “刚才的梳理” only when there is one unambiguous active synthesis. Resolve “这两篇” only when the immediately preceding import set is clear. State the target project and papers before writing.

Do not carry vague references across conversations. Ask for a project name or path when context is ambiguous.

## Safe revision sequence

1. Confirm the target project and exact papers.
2. Read the current main document, candidate entries, paper analyses, and source evidence.
3. Plan which reasoning steps may change.
4. Run the snapshot action.
5. Build the complete revised text in memory or a temporary file.
6. Replace the main document only after the revision is complete and internally checked.
7. Update candidate statuses and the revision note.

If any required evidence is missing or writing fails, preserve the original main document and report what remains unresolved.

## Collaborative writing protocol

Do not produce an instant full chapter after a perfunctory warning. Invite the user into the actual choices:

- Ask for their current view, even if tentative.
- Offer evidence-grounded options and counterarguments.
- Agree on what each section must establish.
- Draft in bounded sections.
- Pause for user confirmation or revision.
- Assemble confirmed sections into the working manuscript.

The user may contribute claims, intuitions, language, examples, objections, or uncertainty. Treat these as material to examine, not conclusions to endorse automatically.
