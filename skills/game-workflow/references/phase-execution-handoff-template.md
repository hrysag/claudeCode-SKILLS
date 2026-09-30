# Phase Execution Handoff

## Required Superpower

Use `superpowers:subagent-driven-development` when tasks are independent and subagents are appropriate.
Use `superpowers:executing-plans` when tasks are tightly coupled or should stay inline.

## Phase

- Name:
- Goal:
- Mode:
- Source plan:
- Approved skeleton report:

## Runtime Gate

- Runtime state:
- Current workflow state:
- Active phase:
- Workspace reconciliation:
- Blocking issue:

Do not execute the phase if the workflow is paused, cancelled, blocked, or unreconciled.

## Implementation Boundary

Use `game-implementation-boundary`. If unavailable, apply the engine lifecycle, async, tween, callback, pool, public API, and minimal-change rules from the project's `AGENTS.md` / `CLAUDE.md` and `../game-implementation-boundary/engines/<engine>/project-rules.md` directly.

## Allowed Changes

- 

## Forbidden Changes

- 

## Handoff Rules

- Continue from the approved skeleton when one exists.
- Do not recreate structure from scratch.
- Preserve approved class names, method names, state flow, lifecycle flow, and orchestration flow.
- Fill TODO sections and method bodies according to the phase plan.
- If skeleton must be renamed, removed, or restructured, stop and report the blocker before continuing.

## Verification

- TypeScript compile:
- Tests:
- Manual runtime checks:
- Cleanup checks:
