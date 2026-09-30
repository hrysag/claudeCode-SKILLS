# Game Workflow Routing Reference

## Mode Selection

- COMPLEX: use for large or high-risk architecture, async, lifecycle, state, orchestration, skeletal animation, tween, pooling, shader, engine High-Risk Topic, or cross-system uncertainty. This is the old heavyweight STANDARD flow.
- STANDARD: use for normal game feature work that needs traceable spec, plan, verification, checkpoints, and lightweight skeleton notes without concept/prototype exploration.
- FAST: use when requirements are clear and the change is scoped.
- LAZY: use only for small changes or when the user explicitly chooses speed.

## Workflow State Routing

| State | Route To | Next States |
| --- | --- | --- |
| `BRAINSTORMING` | `superpowers:brainstorming` | `CONCEPT_EXAMPLE` in COMPLEX, otherwise `SPEC` |
| `CONCEPT_EXAMPLE` | `game-concept-example`; COMPLEX only unless explicitly inserted | `PROTOTYPE`, `SPEC` |
| `PROTOTYPE` | `game-prototype-example`; COMPLEX only unless explicitly inserted | `SPEC`, `REVIEW` |
| `SPEC` | Spec/design artifact creation with engine constraints; STANDARD includes lightweight implementation skeleton notes | `PLAN`, `REVIEW` |
| `PLAN` | `game-implementation-boundary`, then `superpowers:writing-plans` | `IMPLEMENTATION`, `REVIEW` |
| `IMPLEMENTATION` | Current phase handoff, then Superpowers execution | `REVIEW`, `VERIFICATION`, `DEBUGGING` |
| `DEBUGGING` | `superpowers:systematic-debugging` | `IMPLEMENTATION`, `VERIFICATION`, `REVIEW` |
| `REVIEW` | Review current phase/artifact; use Superpowers review patterns when available | `IMPLEMENTATION`, `VERIFICATION`, `COMPLETE` |
| `VERIFICATION` | `superpowers:verification-before-completion` | `IMPLEMENTATION`, `DEBUGGING`, `COMPLETE` |
| `COMPLETE` | Terminal state | none |
| `CANCELLED` | Terminal state | none |

## STANDARD Spec Skeleton

STANDARD does not run independent `game-skeleton-first`. Instead, the spec must include lightweight implementation skeleton notes:

- Components/classes to touch
- New methods or public API impact
- State flow
- Lifecycle entry and cleanup points
- Async/tween/callback ownership
- Files expected to change

## Direct Skill Mode

If the user asks for one narrow action, such as rendering a review HTML, running debugging, checking verification, producing a concept example, or producing a prototype example, use the relevant game/Superpowers skill directly. Do not create full workflow runtime state unless the user asks for COMPLEX, STANDARD, or FAST workflow coordination.

## Guardrails

- Do not create hidden workflow states.
- Do not skip checkpoints in COMPLEX, STANDARD, or FAST mode.
- Do not run concept/prototype steps in STANDARD by default.
- Do not run independent skeleton-first in STANDARD by default.
- Do not treat `IMPLEMENTED` as `DONE`.
- Do not move to next phase while paused, cancelled, blocked, unverified, unreviewed when review is required, or unreconciled.
- Do not let implementation, debugging, review, or verification skills mutate workflow state silently; `game-workflow` owns state sync.
