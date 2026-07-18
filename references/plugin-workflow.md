# Plugin workflow and compatibility notes

## Roles

Keep responsibilities separate:

| Need | Tool | Persistent result |
|---|---|---|
| Selection translation | LLM Translator | Temporary popup; copy manually if needed |
| Highlight, excerpt Note, page Note, delete | PDF Annotator | `.pdf-annotator/bundles/sha256/<hash>/annotations.md` |
| Verified recovery copy | PDF Annotator | `.pdf-annotator/bundles/sha256/<hash>/document.pdf` |
| Full Chinese document | Agent workflow | Per-paper `全文中文译稿.md` |

Do not use LLM Translator's legacy highlight control. It writes annotations into the PDF, can stack duplicates, and may lack a stable deletion entry after persistence. The setup snippet hides that control.

## Installation

Run `scripts/setup_plugins.mjs --vault <vault>`. The script:

1. Resolves both plugins through Obsidian's community registry.
2. Downloads `manifest.json`, `main.js`, and `styles.css` from the upstream release.
3. Retains a one-time `main.js.workflow-original` backup.
4. Enables both plugin IDs in `.obsidian/community-plugins.json`.
5. Configures LLM Translator for automatic `auto → zh-Hans` selection translation.
6. Disables PDF Annotator's experimental native overlay and enables its independent PDF view.
7. Adds a CSS snippet that hides the conflicting highlighter and clarifies Note input behavior.

Both plugins are community plugins and may not have been manually reviewed by Obsidian staff. Explain this before installation when trust or sensitive material matters.

## Tested patches

The setup script applies patches only when it finds exactly the expected upstream code or detects that the patch is already present. Stop on an unknown version instead of guessing.

### Draggable translation popup

LLM Translator 0.3.5 positions its popup near the selection but does not provide dragging. The patch uses the header's blank area as a pointer-drag handle, excludes buttons and language selectors, keeps the popup inside the window, and clears automatic repositioning after a manual move.

### Detached ArrayBuffer

PDF Annotator 0.2.0 passes the same PDF buffer to PDF.js and then tries to hash/copy it for the verified backup. PDF.js may detach the buffer, causing:

```text
Could not create a verified PDF backup.
Cannot perform Construct on a detached ArrayBuffer
```

The patch passes a cloned buffer to PDF.js and retains the original for hashing and backup.

### Note focus loss

PDF Annotator 0.2.0 re-renders an active unpinned tag card during the textarea focus event. The input element is replaced immediately, making Page Note and Side note appear uneditable. The patch avoids reactivating an annotation that is already active.

## Daily use

After setup, restart Obsidian or toggle both plugins off and on.

### Translate a selection

1. Select PDF text.
2. Wait for the Chinese popup.
3. Drag the popup from blank space in its top bar.
4. Copy the result only when needed outside the durable reading-note workflow.

### Create an excerpt annotation

1. Open the PDF in `PDF Annotator` view. If needed, run `PDF Annotator: Open current PDF in annotator` from the command palette.
2. Select the original text.
3. Choose `Annotate` and a mark style/color.
4. Click the associated Note field and type. Saving is automatic.

### Create a page Note

1. Choose `Tag`.
2. Place it on the page.
3. Enter text in `Page note` or `Side note`.

### Delete

Right-click an existing mark or annotation card and choose `Delete` or `Delete annotation`. Reopen the PDF once during acceptance testing to confirm persistence.

## Troubleshooting

### `could not attach the annotation overlay`

The experimental overlay could not identify the current native PDF DOM. Set:

```json
{
  "registerAsDefaultPdfHandler": true,
  "enableNativeOverlay": false
}
```

Restart the plugin, close the native PDF tab, reopen the file, or run `Open current PDF in annotator`.

### Yellow highlight will not undo

Determine which plugin owns it. If it came from LLM Translator and only exists in the current session, avoid adding another layer. Once persisted into the PDF, `Command+Z` may no longer remove it. Back up the PDF, inspect its `/Annot` objects, and remove only confirmed `/Highlight` annotations. Never delete all annotations blindly when other comments may be valuable.

### A plugin update removes the fixes

Rerun `setup_plugins.mjs --vault <vault> --skip-download`. If it reports an unknown patch target, inspect the new upstream code before adapting the patch. Do not force a string replacement against an unrecognized release.

### Translation popup works in the native reader but not the custom reader

Confirm the custom view exposes a selectable text layer. If selection translation remains incompatible after restart, use the native reader for translation and the PDF Annotator view for durable marking, without enabling the experimental overlay.
