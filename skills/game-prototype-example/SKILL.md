---
name: game-prototype-example
description: Use when a Cocos Creator or Egret TypeScript workflow needs a small isolated prototype to verify async flow, lifecycle flow, callback cleanup, state transitions, pooling, animation flow, or architecture feasibility before spec, plan, or production implementation.
---

# Game Prototype Example

## Core Principle

Build only a focused, minimal, verifiable prototype. A prototype proves feasibility; it is not production implementation.

## Use For

- Async feasibility
- Lifecycle safety
- Callback cleanup behavior
- State transition behavior
- Pool reset behavior
- Animation or skeletal animation (Spine / DragonBones) callback flow
- Orchestration feasibility

## Prototype Limits

- Keep it isolated.
- Avoid production business logic.
- Avoid unrelated architecture changes.
- Avoid optimization.
- Avoid broad refactoring.
- Do not treat prototype code as final implementation without explicit approval.

## Required Output

```markdown
# Prototype Goal

# Verified Assumption

# Prototype Scope

# Files Touched

# Async Flow

# Lifecycle Flow

# State Flow

# Cleanup Strategy

# Verification Evidence

# Known Risk

# Next Step Recommendation
```

## Verification Expectations

State which of these were verified:

- Compile pass
- Async flow completes or cancels correctly
- Callback cleanup occurs
- Listener/tween/schedule cleanup occurs
- Lifecycle destruction is safe
- No unresolved promise remains
- No old pool reference remains

## Checkpoint

After prototype verification, ask whether to:

- Move to spec
- Move to implementation plan
- Revise concept
- Pause
- Cancel
