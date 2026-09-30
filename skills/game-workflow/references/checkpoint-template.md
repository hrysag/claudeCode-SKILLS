# Workflow Checkpoint

## Current Workflow

- Mode:
- State:
- Round topic:
- Round folder: `run-workflow/<round-topic>/`
- Runtime state: `run-workflow/workflow-state.json`
- Active phase:
- Archived:
- Archive path:
- Recovery source: `runtime-state | round-artifacts | checkpoint | inferred`

## Artifacts

- Spec:
- Plan:
- Last checkpoint:
- Last review:
- Last verification:
- Last reconciliation:

## Pause / Cancel

- isPaused:
- isCancelled:
- resumeAllowed:

## Workspace

- Workspace reconciliation:
- Blocking issue:

## Completed Tasks

- 

## Review Status

- 

## Verification Evidence

- TypeScript compile:
- Tests:
- Manual runtime checks:
- Lifecycle / async / cleanup checks:

## Remaining Risk

- 

## User Approval Required

- Required: true
- Blocking: true
- Reason: Every checkpoint requires explicit user approval before the workflow may continue.

## Approval Basis

- [ ] Current workflow state is understood.
- [ ] Current phase status is documented in this checkpoint or the relevant phase artifact.
- [ ] Review status is documented or explicitly not required for this scope.
- [ ] Verification evidence is documented or the remaining verification gap is listed.
- [ ] Workspace reconciliation is acceptable or the drift is listed as a blocker.
- [ ] No unresolved blocking issue remains, or the blocker is listed below.
- [ ] Runtime state has been synced to `run-workflow/workflow-state.json`.

## Confirmation Checklist

- [ ] The checkpoint summary is accurate.
- [ ] The listed completed tasks match the actual work.
- [ ] The verification evidence is acceptable.
- [ ] The remaining risks are acceptable or need revision.
- [ ] The proposed next operation is acceptable.

## Proposed Operation Steps

1. 
2. 
3. 

## Next Available Actions

1. 
2. 
3. 

## Recommended Next Step

- 

## User Decision Needed

Please confirm one of:

1. Approve and continue.
2. Revise checkpoint, checklist, or proposed operation steps.
3. Pause workflow.
4. Cancel workflow.

## Runtime State Sync

After writing this checkpoint, update `run-workflow/workflow-state.json` with only the thin state fields: `activeRound`, `roundFolder`, `workflowMode`, `workflowState`, `activePhase`, pause/cancel flags, `resumeAllowed`, `archived`, `archivePath`, `blockingIssue`, `nextRecommendedAction`, and `updatedAt`.

Set `nextRecommendedAction` to indicate that the workflow is waiting for explicit user approval before continuing. Do not copy phase status, checklist details, operation steps, review evidence, verification evidence, or reconciliation details into runtime state.
