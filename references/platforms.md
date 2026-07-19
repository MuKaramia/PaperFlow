# Platform adapters

Use this reference when installing PaperFlow, locating its plugin root, or resolving platform-specific invocation. Keep the research workflow, evidence rules, and vault schema identical on every host.

## Shared requirements

- Use Obsidian Desktop and an opened vault containing `.obsidian/`.
- Use Node.js 18 or newer for bundled scripts.
- Grant access only to the selected vault, input papers, and PaperFlow plugin directory.
- Ask before installing community plugins or changing `.obsidian/`.
- Resolve scripts from the PaperFlow plugin root. From either Skill, move two levels upward from `SKILL.md`.

Run the read-only preflight before first setup:

```bash
node "/absolute/path/to/PaperFlow/scripts/preflight.mjs" \
  --host auto \
  --vault "/absolute/path/to/vault"
```

Use `--host codex`, `claude`, `kimi`, `codebuddy`, or `workbuddy` when automatic detection is inconclusive.

## Plugin inventory

The complete installation must preserve:

```text
PaperFlow/
├── skills/paperflow-atlas/SKILL.md
├── skills/paperflow-thread/SKILL.md
├── scripts/
├── assets/
└── references/
```

Do not install only one `SKILL.md` without its shared resources.

## Codex

Use the complete plugin root containing `.codex-plugin/plugin.json`. When installation is delegated through chat, ask Codex to install the ZIP as a persistent multi-Skill plugin and verify that both `paperflow-atlas` and `paperflow-thread` are discoverable.

Invoke by name in natural language or with `$paperflow-atlas` and `$paperflow-thread` when the client exposes Skill chips. Authorize only the selected vault and commands required by the chosen workflow.

## Claude Code

Load the unpacked plugin during local use:

```bash
claude --plugin-dir "/absolute/path/to/PaperFlow"
```

Plugin Skills are namespaced:

```text
/paperflow:paperflow-atlas
/paperflow:paperflow-thread
```

Run `/reload-plugins` after modifying or updating a local plugin. Keep `skills/` at the plugin root, not inside `.claude-plugin/`.

## Kimi Code

Install directly from GitHub:

```text
/plugins install https://github.com/MuKaramia/PaperFlow
```

Or install the Kimi release ZIP or unpacked plugin directory. The root `kimi.plugin.json` points to both Skills. Run `/reload` or open a new session after installing. Invoke manually with:

```text
/skill:paperflow-atlas
/skill:paperflow-thread
```

Ordinary Kimi web or mobile chat cannot be assumed to access a local Obsidian vault or run these scripts. Use Kimi Code for the complete workflow.

## CodeBuddy and WorkBuddy

For CodeBuddy Code, load the plugin root locally:

```bash
codebuddy --plugin-dir "/absolute/path/to/PaperFlow"
```

Invoke namespaced Skills as `/paperflow:paperflow-atlas` and `/paperflow:paperflow-thread`, then run `/reload-plugins` after updates.

For WorkBuddy Desktop:

1. Open **Skills**, choose **Add Skill**, then **Upload Skill**.
2. Upload the WorkBuddy release ZIP whose archive root contains `.workbuddy-plugin/plugin.json`, `skills/`, and shared resources.
3. Enable `paperflow` and start a new task.
4. Select the Obsidian vault as the working directory or grant it as an accessible folder.
5. Install WorkBuddy's official Obsidian capability when available. It complements PaperFlow's research workflow.

If terminal execution is unavailable, WorkBuddy may draft notes but cannot safely initialize the library, install plugins, archive PDFs, create verified snapshots, or synchronize annotations automatically.

## Host-specific limits

- Model choice affects translation and synthesis quality. Always verify quotations, page numbers, tables, formulas, and OCR.
- Network policy may block the first community-plugin download. Retry only after confirming user approval.
- Permission prompts differ, but no host should receive access to unrelated folders.
- Do not silently fall back to an uploaded cloud copy when the user expects the PDF and notes to remain local.
