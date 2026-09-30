# Runtime State

Use this reference when starting, resuming, pausing, cancelling, completing, archiving, or checking a COMPLEX, STANDARD, or FAST workflow.

## Runtime Workspace

New workflows are organized by one root state file, one finish folder, and one active round folder:

```text
run-workflow/
  workflow-state.json
  finish/
  <round-topic>/
    <round-topic>-spec.md
    <round-topic>-plan.md
    <round-topic>-phase-1-checkpoint.md
```

Create `run-workflow/`, `run-workflow/workflow-state.json`, `run-workflow/finish/`, and `run-workflow/<round-topic>/` only when a COMPLEX, STANDARD, or FAST workflow starts, or when recovery needs a missing root state file or round folder.

If `run-workflow/finish/` is missing when an archive is approved, create it before writing the archive summary.

Do not create per-round state files. Do not create `active-workflow.json`.

Do not create artifact-type folders such as `run-workflow/specs/`, `run-workflow/plans/`, `run-workflow/checkpoints/`, `run-workflow/reviews/`, `run-workflow/verifications/`, `run-workflow/debugging/`, or `run-workflow/reconciliations/` for new workflows.

Do not delete old round folders during startup or recovery. Round folder deletion is allowed only during the approved archive action.

## Thin State Template

`run-workflow/workflow-state.json` should stay small:

```json
{
  "schemaVersion": 1,
  "activeRound": "<round-topic>",
  "roundFolder": "run-workflow/<round-topic>",
  "feature": "<FEATURE_NAME>",
  "workflowMode": "COMPLEX | STANDARD | FAST",
  "workflowState": "BRAINSTORMING | CONCEPT_EXAMPLE | PROTOTYPE | SPEC | PLAN | IMPLEMENTATION | DEBUGGING | REVIEW | VERIFICATION | COMPLETE | CANCELLED",
  "activePhase": "<PHASE_ID_OR_NAME_OR_EMPTY>",
  "isPaused": false,
  "isCancelled": false,
  "resumeAllowed": true,
  "archived": false,
  "archivePath": "<PATH_OR_EMPTY>",
  "blockingIssue": "<BLOCKING_ISSUE_OR_EMPTY>",
  "nextRecommendedAction": "<NEXT_ACTION>",
  "updatedAt": "<ISO_DATE>"
}
```

`CONCEPT_EXAMPLE` and `PROTOTYPE` workflow states are valid only for COMPLEX mode unless the user explicitly asks to insert those steps.

Do not duplicate artifact paths, review status, verification status, workspace reconciliation status, modified files, active risks, allowed actions, or detailed evidence into runtime state. Those belong in round-folder Markdown artifacts such as checkpoint, review, verification, debugging, and reconciliation reports.

Do not store phase status in runtime state. Phase status belongs in checkpoint, plan, review, verification, or reconciliation artifacts.

## Startup Gate

Before starting a COMPLEX, STANDARD, or FAST workflow:

1. Check `run-workflow/workflow-state.json`.
2. If it does not exist, create the root state file, `run-workflow/finish/`, and a new round folder.
3. If it exists, read `activeRound`, `roundFolder`, `workflowState`, `archived`, and `archivePath`.
4. If the referenced workflow is `COMPLETE` and `archived` is false, ask whether to archive it before starting a new round.
5. If the referenced workflow is `COMPLETE` or `CANCELLED`, report the previous state and ask before starting a new round or reusing the topic.
6. If `isPaused` is true, offer resume, cancel, or start-new-with-confirmation.
7. If an active workflow is not terminal, do not silently overwrite it.

## Recovery Order

When resuming or checking status:

1. Read `run-workflow/workflow-state.json`.
2. If `archived` is true, read the archive summary from `archivePath` when present and report that the round folder may have been removed.
3. If `archived` is false, read the active round folder from `roundFolder`.
4. Infer current spec, plan, checkpoint, review, verification, and reconciliation artifacts from the round folder naming rules.
5. If the root state file is missing or stale, infer only from the latest round folders in `run-workflow/` and clearly label the result as inferred.
6. Check pause, cancel, and blocking issue before any phase execution.
7. Re-run workspace reconciliation when workspace drift matters; do not trust stale reconciliation status from runtime state.

## Pause

Pause is a flag, not a terminal workflow state.

On pause:

- Set `isPaused` to `true`.
- Keep `workflowState` and `activePhase` unchanged.
- Set `resumeAllowed` to `true`.
- Update `blockingIssue` when relevant.
- Update `nextRecommendedAction` to indicate that the workflow is paused and waiting for explicit user approval to resume, revise, or cancel.
- Write a checkpoint inside the active round folder.
- Update `run-workflow/workflow-state.json`.

Paused workflows cannot move to implementation, review, verification, next phase, or complete until resumed.

## Cancel

Cancel is terminal and is not completion.

On cancel:

- Set `workflowState` to `CANCELLED`.
- Set `isCancelled` to `true`.
- Set `isPaused` to `false`.
- Set `resumeAllowed` to `false`.
- Update `blockingIssue` when relevant.
- Update `nextRecommendedAction` to indicate that the workflow is cancelled and cannot continue unless the user starts a new workflow.
- Write a checkpoint inside the active round folder.
- Update `run-workflow/workflow-state.json`.

Cancelled workflows cannot resume, execute phases, review, verify, move to next phase, or complete. Starting again requires an explicit new workflow decision.

## Complete

On completion:

- Confirm all completion gates in `orchestration-gates.md`.
- Set `workflowState` to `COMPLETE`.
- Set `resumeAllowed` to `false`.
- Set `archived` to `false`.
- Set `archivePath` to an empty string.
- Clear `blockingIssue` if no blocker remains.
- Update `nextRecommendedAction` to indicate that the workflow is complete and waiting for explicit user approval before archive.
- Write a final checkpoint inside the active round folder.
- Update `run-workflow/workflow-state.json`.
- Ask the user whether to archive the completed round.

Completion requires all phase gates in `orchestration-gates.md`.

## Archive

Archive is optional and requires user approval after `workflowState` becomes `COMPLETE`.

When the user approves archive:

1. Ensure `run-workflow/finish/` exists; create it if missing.
2. Read the active round folder from `roundFolder`.
3. Summarize the round into an outline-style Markdown archive.
4. Write the summary to `run-workflow/finish/<round-topic>.md`.
5. Render the paired HTML summary to `run-workflow/finish/<round-topic>.html`.
6. Update `run-workflow/workflow-state.json`:
   - `archived` to `true`
   - `archivePath` to `run-workflow/finish/<round-topic>.md`
   - `nextRecommendedAction` to indicate the archive is complete and a new workflow may start
   - `updatedAt` to the archive time
7. Delete `run-workflow/<round-topic>/` only after the Markdown and HTML archive summaries were written successfully.

Do not archive cancelled or incomplete workflows unless the user explicitly asks for a separate manual export.
