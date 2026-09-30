---
name: game-workflow-html-review
description: Use when a Superpowers or game workflow Markdown spec, design, plan, checkpoint, skeleton report, phase handoff, or generated workflow artifact should be rendered to browser-friendly HTML with matching round-folder output.
---

# Game Workflow HTML Review

## Core Principle

Render workflow Markdown into readable HTML without changing the source content. This skill is for review presentation, not translation and not content editing.

## Use For

- Superpowers design/spec Markdown
- Superpowers implementation plans
- Game concept reports
- Game prototype reports
- Skeleton reports
- Phase execution handoff documents
- Checkpoints
- Any `game-workflow` Markdown artifact that requires the paired HTML output rule

## Do Not Do

- Do not translate the content.
- Do not rewrite the source document.
- Do not change requirements, tasks, or code blocks.
- Do not treat HTML review as approval by itself.

## Output Location

For `game-workflow` round artifacts, write HTML next to the Markdown source with the same basename:

```text
run-workflow/<round-topic>/<round-topic>-spec.md
run-workflow/<round-topic>/<round-topic>-spec.html
```

Examples:

```text
run-workflow/play-selector-rule-update/play-selector-rule-update-plan.md
run-workflow/play-selector-rule-update/play-selector-rule-update-plan.html
run-workflow/play-selector-rule-update/play-selector-rule-update-phase-1-checkpoint.md
run-workflow/play-selector-rule-update/play-selector-rule-update-phase-1-checkpoint.html
```

For user-specified output paths, keep the same `.md` to `.html` basename pairing unless the user explicitly asks for another path.

## Rendering Requirements

The HTML should include:

- Source path
- Generated timestamp
- Section navigation
- Readable typography
- Preserved code blocks
- Markdown pipe tables rendered as HTML tables
- No external network dependency

## Script

Use `scripts/render_markdown_review.mjs` (relative to this skill's directory). It needs only Node 18+ and has no dependencies.

Example:

```powershell
node "<this skill directory>/scripts/render_markdown_review.mjs" `
  --input <project>\run-workflow\play-selector-rule-update\play-selector-rule-update-plan.md `
  --output <project>\run-workflow\play-selector-rule-update\play-selector-rule-update-plan.html `
  --title "Play Selector Rule Update Plan"
```

`--title` is optional; without it the title is derived from the input filename.
