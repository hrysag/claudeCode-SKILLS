---
name: game-concept-example
description: Use when a Cocos Creator or Egret TypeScript request needs an architecture, orchestration, async, lifecycle, state, callback, tween, skeletal animation (Spine / DragonBones), or pooling concept example before prototype, spec, plan, or implementation.
---

# Game Concept Example

## Core Principle

Create a focused concept example only. Do not produce production implementation, final architecture, final spec, or implementation plan.

## Use For

- Architecture direction
- Orchestration ownership
- Async flow
- Lifecycle flow
- State flow
- Callback, tween, schedule, skeletal animation (Spine / DragonBones), or pool cleanup concept
- Dependency direction and public API impact

## Do Not Do

- Do not write production business logic.
- Do not finalize architecture.
- Do not optimize.
- Do not refactor unrelated code.
- Do not continue to implementation without checkpoint approval.

## Required Output

```markdown
# Concept Summary

# Architecture Direction

# Architecture Concept

# Orchestration Flow

# Async Flow

# Lifecycle Flow

# State Flow

# Cleanup Risk

# Public API Impact

# Remaining Risk

# Next Step Recommendation
```

## Engine Safety Questions

Also check the High-Risk Topics in `../game-implementation-boundary/engines/<engine>/boundary.md` (the sibling skill folder, relative to this skill's base directory).

Answer these when relevant:

- Which object owns state?
- Which object owns cleanup?
- Where is cancellation handled?
- What happens if the node is destroyed mid-flow?
- What listeners, tweens, schedules, promises, or callbacks must be cleared?
- Does this preserve existing public API?
- Is this concept generic system behavior or game-specific behavior?

## Checkpoint

End by asking which next action should be taken:

- Prototype
- Spec
- Return to brainstorming
- Pause
- Cancel
