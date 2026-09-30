---
name: game-implementation-boundary
description: Use when game-workflow STANDARD, FAST, or LAZY has been selected, or when the user explicitly asks for implementation boundary rules for a Cocos Creator 3.8 or Egret 5.4 TypeScript plan, phase execution, review, debugging, or verification task.
---

# Game Implementation Boundary

## Core Principle

This skill defines implementation boundaries. It does not execute the plan. Apply it only after `game-workflow` selects STANDARD, FAST, or LAZY mode, or when the user explicitly asks for this boundary.

Explicit user instructions and project-local instructions remain higher priority. If a local project `AGENTS.md` or `CLAUDE.md` conflicts with this skill, follow the more specific project instruction.

## Engine Detection

Before applying any engine rule, detect the engine with `engines/README.md`:

1. Check the rows from top to bottom against the project root; use the first row that matches.
2. Read that engine folder's `engine.md`, `boundary.md`, `typescript.md`, and `project-rules.md`.
3. If no row matches but the project is TypeScript, apply only the `## TypeScript Boundary` section of `engines/cocos/typescript.md` (see "No Engine Match" in `engines/README.md`). If the project is not TypeScript either, stop and ask the user which engine the project uses. Never apply one engine's lifecycle, boundary, or project rules to another engine.

## Reference Map

Read only what is needed:

- `references/implementation-rules.md` for phase planning and implementation boundaries.
- `references/verification-checklist.md` before claiming completion.
- `engines/<engine>/engine.md` for engine version, engine source path, and modules outside the source path.
- `engines/<engine>/boundary.md` for engine source reading, lifecycle, tween/timer, skeletal animation, audio, pool, shader, performance, and high-risk topics.
- `engines/<engine>/typescript.md` for the compiler baseline and TypeScript rules of that engine.
- `engines/<engine>/project-rules.md` for the full project convention set of that engine.

## Planning Boundary

Every plan must define:

- Phase scope
- Allowed files
- Forbidden files or APIs
- Public API compatibility expectations
- Lifecycle and async risk
- Cleanup ownership
- Verification commands
- Manual runtime checks when compile/tests are insufficient

## Implementation Boundary

Required:

- Preserve existing public APIs unless explicitly approved.
- Prefer composition or interface-based dependency injection.
- Keep changes minimal and scoped to the phase.
- Avoid unrelated refactors and architecture rewrites.
- Avoid hidden singleton dependencies.
- Avoid hardcoding game-specific behavior into reusable systems.
- Keep state transitions explicit and traceable.

## Lifecycle Boundary

See `engines/<engine>/boundary.md`.

## Async Boundary

Required:

- No unresolved promises.
- Prefer cancellable async flows.
- Avoid hidden async state mutation.
- Clear callback references after use.
- Prevent duplicate callback registration.
- Do not use cross-class callback design unless explicitly approved.
- For promise-based timing, prefer tween-driven flows with cancel support instead of native timers.

## Tween, Skeletal Animation, Audio, Pool Boundary

See `engines/<engine>/boundary.md`.

## TypeScript Boundary

See `engines/<engine>/typescript.md`.

## Corrupted or Broken Code Repair Boundary

When encountering any of the following:

- Mojibake or garbled text
- Abnormal comments
- Unclosed comments
- Missing method signatures
- Abnormal decorators
- Encoding anomalies
- Residue after restore
- Merge conflict residue
- Compile errors
- Syntax errors
- Comment corruption

Do not assume the whole code block is invalid. Do not rewrite the whole class, module, or flow unless the user explicitly approves it after risks are explained.

Before repairing, confirm:

- The true compile error location
- Whether only a comment or string is polluted
- Whether the damage is local syntax damage
- Whether the issue is only an encoding display problem
- Whether the issue is residue from restore or merge
- Whether the code is historical compatibility behavior
- Whether the code is an engine/editor workaround
- Whether editor serialization is affected
- Whether runtime behavior is affected

Forbidden by default:

- Modernizing code
- Normalizing formatting
- Rewriting decorators
- Rewriting tooltips
- Reordering property declarations
- Removing legacy comments
- Large-scale cleanup of old code
- Rewriting legacy flow while fixing syntax

Prefer:

- Local syntax repair
- Minimal syntax fix
- Local patch
- Preserving original structure
- Preserving original method signatures
- Preserving original property order
- Preserving original decorator structure
- Preserving original behavior

High-risk cases require stopping and asking the user before continuing:

- Large amounts of garbled text
- Many methods appear missing
- Original structure cannot be determined
- Editor serialization impact cannot be confirmed
- Original behavior cannot be confirmed

If a compile problem comes from comment blocks, tooltip strings, decorator strings, or encoding corruption, prefer fixing the comment boundary, string boundary, or local syntax only. Do not rewrite business logic because of comment or string corruption.

## Deletion Safety Boundary

Do not directly delete any of the following without dependency checks:

- Class
- Function
- Interface
- Enum
- Type
- Module
- File

Before deletion, check:

- Whether other files still reference it
- Whether imports still depend on it
- Whether runtime dependencies still exist
- Whether callback, event, or async dependencies still exist

If dependencies still exist:

- Do not delete directly.
- Preserve the original structure.
- Add a TODO/comment explaining why it is retained or pending migration.

Prefer deprecation markers, TODO comments, gradual migration, and safe replacement flow over direct deletion.

## Verification Boundary

Use `superpowers:verification-before-completion` for the verification discipline. This boundary defines what must be considered:

- TypeScript compile pass
- Relevant tests or manual checks
- No unresolved promise
- No dangling callback
- No tween leak
- No skeletal animation callback leak
- No schedule / timer callback leak
- No pool reference leak
- No engine-specific leak listed in the Verification Checklist of `engines/<engine>/project-rules.md`
- No event listener leak
- No obvious lifecycle issue
- No public API regression
- No unrelated architecture change
