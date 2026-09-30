# Implementation Rules

## Project Context

Assume the target engine and version from `engines/<engine>/engine.md` unless the local project says otherwise.

## Architecture and Scope

- Preserve public APIs unless explicitly approved.
- Keep changes scoped to the current workflow phase.
- Do not refactor unrelated systems.
- Prefer composition and interface-based dependency injection.
- Do not inject concrete instances directly when an interface boundary is required.
- Avoid hidden singleton dependencies.
- Keep state transitions explicit.
- Do not hardcode game-specific behavior into reusable systems.
- Add cleanup in the same phase for any listener, tween, schedule, promise, callback, skeletal animation callback, or reference introduced by the phase.

## Phase Implementation Discipline

- Analyze the requirement before implementation.
- Propose architecture only when the task has real architecture, async, lifecycle, or cross-system risk.
- Follow the approved implementation plan and current phase scope.
- Implement one phase at a time.
- Verify each phase before moving to the next phase.
- Do not rewrite established low-level algorithms unless the user explicitly requests that change.