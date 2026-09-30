# Orchestration Gates

Use this reference before phase transitions, workflow completion, resume decisions, archive decisions, and workspace reconciliation.

## Phase Status

Phase status belongs in checkpoint, plan, review, verification, or reconciliation artifacts. Do not store phase status in `run-workflow/workflow-state.json`.

Allowed phase status values:

- `NOT_STARTED`
- `IN_PROGRESS`
- `IMPLEMENTED`
- `REVIEWED`
- `VERIFIED`
- `BLOCKED`
- `DONE`

Allowed transitions:

- `NOT_STARTED` -> `IN_PROGRESS`
- `IN_PROGRESS` -> `IMPLEMENTED`
- `IN_PROGRESS` -> `BLOCKED`
- `IMPLEMENTED` -> `REVIEWED`
- `IMPLEMENTED` -> `VERIFIED`
- `REVIEWED` -> `DONE`
- `VERIFIED` -> `DONE`
- `BLOCKED` -> `IN_PROGRESS` after the blocking issue is resolved

Never move from `IMPLEMENTED`, `REVIEWED`, `VERIFIED`, or `BLOCKED` directly to the next phase.

## Done Gate

A phase can become `DONE` only when all are true:

- Implementation tasks are complete.
- Review is complete or explicitly not required for the scoped change.
- Verification passed, or unrelated failures are clearly separated.
- No blocking issue remains.
- Workspace reconciliation is `UNCHANGED` or `RECONCILED`.
- Workflow is not paused or cancelled.

## Next Phase Gate

Before moving to the next phase:

1. Recover runtime context.
2. Confirm current phase is `DONE`.
3. Confirm review and verification status from the latest artifacts.
4. Confirm no blocking issue remains.
5. Confirm workspace reconciliation is `UNCHANGED` or `RECONCILED`.
6. Write a checkpoint and sync runtime state.
7. Stop and ask for explicit user approval before moving to the next phase.

Do not move to the next phase automatically after a checkpoint, even when all checks pass.

## Checkpoint Approval Gate

Every checkpoint is a hard user approval gate. After writing any checkpoint:

1. Sync `run-workflow/workflow-state.json`.
2. Set `nextRecommendedAction` to waiting for user approval.
3. Present the checkpoint summary, approval basis, confirmation checklist, proposed operation steps, and available decisions.
4. Stop before implementation, review, verification, next phase, completion, resume, cancel finalization, or archive actions that depend on the checkpoint.
5. Continue only after the user explicitly approves the next operation.

Even when the workflow is safe to continue, list the approval basis and proposed operation steps before asking for confirmation.

## Failure Gate

Route to `DEBUGGING` when any current-change failure appears:

- TypeScript compile failure
- Runtime failure
- Verification failure
- Regression
- Blocking review issue

Use `superpowers:systematic-debugging`, apply the minimal fix, verify, then return to the current phase checkpoint.

## Workspace Reconciliation

Run reconciliation when workspace state may have drifted from runtime state, plan, or checkpoint:

- Modified files exist after a checkpoint.
- Resuming after interruption.
- Current phase status does not match code state.
- Work appears to include next-phase or out-of-plan changes.
- Public API, lifecycle, async, dependency, or architecture risk appears.

Classify the result in a reconciliation report or checkpoint:

- `UNCHANGED`: no relevant drift.
- `RECONCILED`: drift was understood and aligned with the plan/checkpoint.
- `DIVERGED`: out-of-plan work exists and needs a user decision.
- `BLOCKED`: risky or unclear divergence prevents safe continuation.

Do not continue to the next phase while workspace reconciliation is `UNKNOWN`, `DIVERGED`, or `BLOCKED`.

## Completion Gate

A workflow can become `COMPLETE` only when:

- All planned phases are `DONE`.
- Final verification passed, or unrelated failures are documented.
- Required review is complete.
- No blocking issue remains.
- Workspace reconciliation is `UNCHANGED` or `RECONCILED`.
- Workflow is not paused or cancelled.

After the completion gate passes, write the final checkpoint, sync `workflowState` to `COMPLETE`, and ask for explicit user approval before any archive action. Do not continue from the final checkpoint into archive without user approval.

## Archive Gate

Archive is allowed only after `workflowState` is `COMPLETE` and the user approves archive.

Archive must:

- Create `run-workflow/finish/` if missing.
- Write `run-workflow/finish/<round-topic>.md`.
- Write `run-workflow/finish/<round-topic>.html`.
- Update `run-workflow/workflow-state.json` with `archived = true` and `archivePath`.
- Delete `run-workflow/<round-topic>/` only after the Markdown and HTML archive summaries exist.

Do not archive silently and do not delete the round folder before both summaries are written.
