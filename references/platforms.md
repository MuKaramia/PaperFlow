# Platform adapters

Use this reference when installing PaperFlow, resolving its location, or running it from Kimi Code or WorkBuddy. The research workflow and vault schema stay identical on every host.

## Shared requirements

- Use Obsidian Desktop and an opened vault containing `.obsidian/`.
- Use Node.js 18 or newer for the bundled scripts.
- Give the agent access to the selected vault and the input PDF.
- Ask before installing community plugins or changing `.obsidian/`.
- Resolve scripts relative to this Skill folder. Do not assume the chat workspace is the Skill folder.

Run the read-only preflight before first setup:

```bash
node "/absolute/path/to/obsidian-literature-workflow/scripts/preflight.mjs" \
  --host auto \
  --vault "/absolute/path/to/vault"
```

Use `--host codex`, `claude`, `kimi`, or `workbuddy` when automatic detection is inconclusive.

## Codex

User Skill location:

```text
~/.codex/skills/obsidian-literature-workflow/
```

Ask Codex to use `obsidian-literature-workflow`, provide the vault path and PDF path, and approve writes inside the selected vault.

## Claude Code

User Skill location:

```text
~/.claude/skills/obsidian-literature-workflow/
```

A project-local installation may instead use `.claude/skills/obsidian-literature-workflow/`.

## Kimi Code

Install the complete folder in either location:

```text
~/.kimi-code/skills/obsidian-literature-workflow/
~/.agents/skills/obsidian-literature-workflow/
```

Alternatively start Kimi Code with an extra Skills parent directory:

```bash
kimi --skills-dir "/absolute/path/to/skills"
```

Start a new Kimi Code session after installation. Invoke manually with:

```text
/skill:obsidian-literature-workflow
```

Kimi's ordinary web or mobile chat can analyze an uploaded PDF but cannot be assumed to access a local Obsidian vault or run these scripts. Use Kimi Code for the complete workflow.

## WorkBuddy

Use WorkBuddy Desktop, not only the mobile or mini-program surface.

1. Open **Skills**, choose **Add Skill**, then **Upload Skill**.
2. Upload the WorkBuddy release package whose archive root contains `SKILL.md`.
3. Install WorkBuddy's official `obsidian` Skill from SkillHub when available. It is complementary: PaperFlow supplies the literature workflow, while the Obsidian Skill improves vault access and note operations.
4. Create a task whose working directory is the selected Obsidian vault, or explicitly grant that vault as an accessible folder.
5. Keep the default confirmation mode unless the user intentionally wants broader access. Approve the specific file and terminal operations PaperFlow needs.
6. Ask WorkBuddy to use `obsidian-literature-workflow`, then provide the vault and PDF paths.

If WorkBuddy imports the package but does not list it, confirm that `SKILL.md` is at the archive root, re-enable the Skill, and start a new task. If terminal execution is unavailable, WorkBuddy may still draft the notes, but it cannot safely initialize the library, install the plugins, archive the PDF, or synchronize annotations automatically.

## Host-specific limitations

- The selected model affects translation and synthesis quality; the host application does not remove the need to verify quotations, page numbers, tables, formulas, and OCR.
- Network policy may block the first plugin download from GitHub. Retry only after confirming that the user permits the download.
- WorkBuddy and Kimi Code may use different permission prompts, but neither should receive access to unrelated folders.
- Do not silently fall back to an uploaded cloud copy when the user expects the original PDF and notes to remain local.
