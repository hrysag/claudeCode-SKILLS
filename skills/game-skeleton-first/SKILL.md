---
name: game-skeleton-first
description: Use when implementing a Cocos Creator or Egret TypeScript phase that must first establish class structure, function structure, async flow, state flow, lifecycle flow, TODO comments, and orchestration flow before production implementation.
---

# Game Skeleton First

## Core Principle

Do a skeleton pass before production implementation. The skeleton is an approved base for later Superpowers phase execution.

## Required Inputs

- Current phase plan
- Current spec or requirements
- `game-implementation-boundary`
- Existing code context

## Allowed In Skeleton Pass

- Create class structure
- Create function and method signatures
- Create async flow structure
- Create state flow structure
- Create lifecycle flow structure
- Create orchestration flow
- Add TODO comments where implementation will be filled later
- Add minimal type/interface placeholders needed to compile when feasible

## Forbidden In Skeleton Pass

- Production business logic
- Deep implementation detail
- Optimization
- Unrelated refactor
- Architecture expansion beyond the approved phase
- Public API breakage
- Silent rename/removal of existing behavior

## Handoff Contract

After approval, subsequent phase execution must continue from the approved skeleton.

Rules:

- Do not recreate structure from scratch.
- Preserve approved class names, method names, state flow, lifecycle flow, and orchestration flow.
- Fill TODO sections and method bodies according to the phase plan.
- If a skeleton element must be renamed, removed, or restructured, stop and report the blocker before implementation continues.

## Required Output

```markdown
# Skeleton Summary

# Modified Files

# Class Structure

# Function Skeleton

# Async Flow

# State Flow

# Lifecycle Flow

# Orchestration Flow

# TODO Structure

# Boundary Compliance

# Risk

# Confirmation Question
```

## Confirmation Question

End by asking:

`Do you approve this skeleton and flow as the base for full phase implementation?`
