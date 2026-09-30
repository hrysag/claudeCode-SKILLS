# Artifact Output Rules

Use this reference whenever a COMPLEX, STANDARD, or FAST workflow creates Markdown artifacts.

## Paired Markdown And HTML

Every workflow Markdown artifact must produce a paired HTML file at the same time. Use the same folder and basename:

```text
run-workflow/<round-topic>/<round-topic>-spec.md
run-workflow/<round-topic>/<round-topic>-spec.html
```

Render HTML with `game-workflow-html-review`. The renderer must preserve code blocks and render Markdown pipe tables as HTML tables.

Do not leave a newly generated Markdown workflow artifact without its matching HTML unless the user explicitly asks to skip HTML generation.

## Round Folder

Each workflow round owns one topic folder under `run-workflow/`:

```text
run-workflow/<round-topic>/
```

`<round-topic>` must be a short descriptive kebab-case name derived from the current round topic. Use ASCII lowercase letters, digits, and hyphens. Keep it stable for the whole workflow round.

Examples:

```text
run-workflow/play-selector-rule-update/
run-workflow/reusable-animation-controller/
run-workflow/spine-callback-cleanup/
```

Do not create artifact-type folders such as `run-workflow/specs/`, `run-workflow/plans/`, `run-workflow/checkpoints/`, `run-workflow/reviews/`, or `run-workflow/verifications/` for new workflows. Keep all round artifacts flat inside the round folder.

## Finish Folder

Create `run-workflow/finish/` when `run-workflow/` is first created. If it is missing during an approved archive action, create it before writing the archive summary.

Archived completed-round summaries go here:

```text
run-workflow/finish/<round-topic>.md
run-workflow/finish/<round-topic>.html
```

The archive summary filenames must match the round topic exactly.

## Root State File

Use one root workflow state file:

```text
run-workflow/workflow-state.json
```

This file stores `activeRound`, `roundFolder`, `archived`, and `archivePath`. Do not create per-round state files and do not create `active-workflow.json`.

## Required File Names

Use the round topic as the Markdown filename prefix. Generate the matching `.html` beside each `.md`.

```text
run-workflow/<round-topic>/<round-topic>-spec.md
run-workflow/<round-topic>/<round-topic>-spec.html
run-workflow/<round-topic>/<round-topic>-plan.md
run-workflow/<round-topic>/<round-topic>-plan.html
run-workflow/<round-topic>/<round-topic>-reconciliation.md
run-workflow/<round-topic>/<round-topic>-reconciliation.html
run-workflow/<round-topic>/<round-topic>-final-checkpoint.md
run-workflow/<round-topic>/<round-topic>-final-checkpoint.html
```

For phase-scoped artifacts, include the phase id:

```text
run-workflow/<round-topic>/<round-topic>-phase-1-checkpoint.md
run-workflow/<round-topic>/<round-topic>-phase-1-checkpoint.html
run-workflow/<round-topic>/<round-topic>-phase-1-review.md
run-workflow/<round-topic>/<round-topic>-phase-1-review.html
run-workflow/<round-topic>/<round-topic>-phase-1-verification.md
run-workflow/<round-topic>/<round-topic>-phase-1-verification.html
run-workflow/<round-topic>/<round-topic>-phase-1-debugging.md
run-workflow/<round-topic>/<round-topic>-phase-1-debugging.html
```

Use `phase-2`, `phase-3`, and so on for later phases. Use a short descriptive suffix only when phase numbers are not available:

```text
<round-topic>-api-cleanup-checkpoint.md
<round-topic>-api-cleanup-checkpoint.html
```

## Optional COMPLEX Artifacts

COMPLEX mode may add:

```text
run-workflow/<round-topic>/<round-topic>-concept.md
run-workflow/<round-topic>/<round-topic>-concept.html
run-workflow/<round-topic>/<round-topic>-prototype.md
run-workflow/<round-topic>/<round-topic>-prototype.html
run-workflow/<round-topic>/<round-topic>-phase-1-skeleton.md
run-workflow/<round-topic>/<round-topic>-phase-1-skeleton.html
```

STANDARD and FAST do not create concept/prototype artifacts by default.

## Archive Summary

When archiving a completed round, create an outline-style summary at:

```text
run-workflow/finish/<round-topic>.md
run-workflow/finish/<round-topic>.html
```

The summary should include:

- Round topic
- Workflow mode
- Final workflow state
- Goal / scope
- Completed phases
- Key design decisions
- Files or systems affected
- Verification summary
- Remaining risks or follow-up notes
- Links or relative paths to important artifacts when they still exist before deletion

After the summary Markdown and HTML are successfully written and state is updated, delete the round folder:

```text
run-workflow/<round-topic>/
```

## Collision Rules

When the round folder already exists:

1. Read `run-workflow/workflow-state.json`.
2. If `activeRound` points to the same round and the workflow is not terminal, resume or ask whether to resume, pause, cancel, or start a new round.
3. If the existing round is `COMPLETE` or `CANCELLED`, create a unique suffix such as `<round-topic>-2`.
4. If the existing round state cannot be read, stop and ask before overwriting or reusing it.

Never overwrite an existing artifact silently. If a new artifact would replace an old one, create a phase/final/numbered filename or ask the user.

If `run-workflow/finish/<round-topic>.md` or `.html` already exists during archive, ask before overwriting or create a unique suffix such as `<round-topic>-2.md` and `<round-topic>-2.html`.

## User-Specified Paths

If the user specifies an output path, resolve it inside the current workspace unless explicitly approved otherwise. Keep the same flat round-folder structure under the requested path.
