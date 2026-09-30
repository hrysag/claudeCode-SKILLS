---
name: game-workflow
description: Use BEFORE superpowers:brainstorming in a Cocos Creator or Egret TypeScript project when a request needs workflow coordination or uses ambiguous Superpowers keywords such as 腦爆, brainstorming, 設計, design, spec, 規劃, plan, 審查, review, 驗證, verification, 除錯, or debug (project root has egretProperties.json, or assets/ with settings/ or a creator package.json) — decides between pure Superpowers and the COMPLEX/STANDARD/FAST/LAZY game workflow.
---

# Game Workflow

## Core Principle

Act as the workflow router, runtime state owner, artifact owner, and checkpoint owner. Do not replace game skills or Superpowers skills that already solve the step. Route to them and add engine-aware orchestration gates only where needed.

User and project instructions take priority. The project's `AGENTS.md` / `CLAUDE.md` and `../game-implementation-boundary/engines/<engine>/project-rules.md` are required sources of implementation constraints.

Detect the engine first with `../game-implementation-boundary/engines/README.md`. Paths starting with `../game-implementation-boundary/` are relative to this skill's base directory (the sibling skill folder). If no engine matches, ask the user before choosing a mode.

## Ambiguous Trigger Arbitration

When a game engine project request uses keywords that overlap with Superpowers, such as `腦爆`, `brainstorming`, `設計`, `design`, `spec`, `規劃`, `計畫`, `plan`, `審查`, `檢查`, `review`, `驗證`, `verification`, `除錯`, or `debug`, and the user did not explicitly choose a skill or workflow mode, ask which flow to use before continuing:

If the ambiguous request is a brainstorming or design discussion and the topic already involves architecture, core systems, lifecycle, cross-system orchestration risk, or any High-Risk Topic in `../game-implementation-boundary/engines/<engine>/boundary.md`, recommend game workflow COMPLEX in the arbitration prompt.

1. Pure Superpowers flow: use the matching Superpowers skill directly and do not create game workflow runtime state.
2. Game workflow COMPLEX: create or recover runtime state, use the full concept/prototype/skeleton-first flow, and delegate work steps to game skills and Superpowers.
3. Game workflow STANDARD: create or recover runtime state, use normal spec/plan/checkpoint flow, and include a lightweight implementation skeleton inside the spec.
4. Game workflow FAST: create or recover runtime state with concise spec/plan/checkpoint flow.
5. Game workflow LAZY: use game-implementation-boundary plus direct game/Superpowers skills without runtime state or phase checkpoints unless requested.

Do not create or update `run-workflow/workflow-state.json` or any round folder while asking this arbitration question. Runtime state begins only after the user chooses COMPLEX, STANDARD, or FAST, or explicitly requests workflow state/checkpoint behavior.

## Risk-Based Mode Recommendation

When brainstorming begins as a pure discussion but the content reveals architecture, core system, async, lifecycle, state, callback, pooling, reusable framework, public API design, cross-system orchestration risk, or any High-Risk Topic in `../game-implementation-boundary/engines/<engine>/boundary.md`, end the brainstorming with a mode recommendation before creating runtime state or moving to implementation.

The recommendation must include:

- Suggested mode: COMPLEX, STANDARD, FAST, or LAZY.
- Why that mode fits the discovered risk.
- Whether concept example, prototype example, skeleton-first, runtime state, or checkpoints are recommended.
- The next question asking whether to switch to the suggested game workflow mode.

Recommend COMPLEX by default when the discovered risk touches engine source reading, shader/rendering behavior, inheritance from lower-level engine classes, override contracts, reusable architecture, cross-system orchestration uncertainty, or a High-Risk Topic of the detected engine.

## Runtime Ownership

COMPLEX, STANDARD, and FAST workflows use `run-workflow/workflow-state.json` as the root state file and `run-workflow/<round-topic>/` as the active round artifact folder. Keep state thin: store only active round, mode/state, active phase, pause/cancel flags, blocking issue, and next recommended action.

Read `references/runtime-state.md` when starting, resuming, pausing, cancelling, completing, or checking a workflow. Read `references/artifact-output-rules.md` before creating Markdown workflow artifacts. Read `references/orchestration-gates.md` before moving to the next phase, completing a workflow, or handling workspace drift.

When COMPLEX, STANDARD, or FAST is active, write the `superpowers:brainstorming` spec and the `superpowers:writing-plans` plan to `run-workflow/<round-topic>/<round-topic>-spec.md` and `run-workflow/<round-topic>/<round-topic>-plan.md` per `references/artifact-output-rules.md`, overriding the Superpowers default `docs/superpowers/` locations, and render the paired HTML with `game-workflow-html-review`.

LAZY mode does not create runtime state or phase checkpoints unless the user asks.

## Modes

| Mode | Use When | Concept | Prototype | Skeleton | Runtime State | Phase Checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| COMPLEX | Large or high-risk architecture, async, lifecycle, orchestration, pooling, skeletal animation, tween, shader, engine High-Risk Topic, or cross-system uncertainty exists | Yes | Yes | Independent skeleton-first | Yes | Yes |
| STANDARD | Normal game feature work that needs traceable spec, plan, verification, and checkpoints without heavyweight exploration | No | No | Lightweight skeleton inside spec | Yes | Yes |
| FAST | Requirements are clear and risk is controlled | No | No | Optional lightweight spec notes | Yes | Yes |
| LAZY | Small local task or user explicitly asks for speed | No | No | No | No | No |

If touching game engine or TypeScript project code, apply `game-implementation-boundary`. If that skill is unavailable, apply the engine lifecycle, async, tween, callback, pool, public API, and minimal-change rules from the selected workflow context directly.

## COMPLEX Flow

Use COMPLEX when the previous heavyweight STANDARD flow is actually needed.

1. Initialize or recover runtime state.
2. Use `superpowers:brainstorming` to clarify requirements and produce the initial design/spec direction.
3. Use `game-concept-example` for architecture, async, lifecycle, state, and orchestration concept risks.
4. Use `game-prototype-example` when feasibility or timing behavior must be proven before implementation.
5. Use `game-workflow-html-review` to render spec artifacts for browser review when the user wants review or translation.
6. Use `game-implementation-boundary` before plan generation.
7. Use `superpowers:writing-plans` to produce the implementation plan.
8. For each approved high-risk phase, use `game-skeleton-first` before implementation.
9. Create a phase execution handoff and execute only the current phase with `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
10. Use `superpowers:verification-before-completion`.
11. Record a checkpoint, sync runtime state, and stop for explicit user approval before continuing, revising, pausing, cancelling, completing, or archiving.

## STANDARD Flow

Use STANDARD as the default game workflow when the task needs traceability but not concept/prototype exploration.

1. Initialize or recover runtime state.
2. Use `superpowers:brainstorming` to clarify requirements.
3. Create a standard spec with engine constraints and a lightweight implementation skeleton section.
4. Use `game-workflow-html-review` to render spec artifacts when the user wants review or translation.
5. Use `game-implementation-boundary` before plan generation.
6. Use `superpowers:writing-plans` to produce the implementation plan.
7. Create a phase execution handoff and execute only the current phase with `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
8. Use `superpowers:verification-before-completion`.
9. Record a checkpoint, sync runtime state, and stop for explicit user approval before continuing, revising, pausing, cancelling, completing, or archiving.

The STANDARD spec lightweight skeleton should include:

- Components/classes to touch
- New methods or public API impact
- State flow
- Lifecycle entry and cleanup points
- Async/tween/callback ownership
- Files expected to change

## FAST Flow

1. Initialize or recover runtime state.
2. Use `superpowers:brainstorming` only as much as needed to remove ambiguity.
3. Create a concise spec/plan path; skip concept, prototype, and independent skeleton-first.
4. Use `game-implementation-boundary` before `superpowers:writing-plans` or direct phase execution.
5. Execute phase by phase with Superpowers.
6. Use `superpowers:verification-before-completion`.
7. Record a checkpoint, sync runtime state, and stop for explicit user approval after each phase.

## LAZY Flow

1. Use the relevant game or Superpowers skill directly.
2. If touching game engine or TypeScript project code, apply `game-implementation-boundary`.
3. Use `superpowers:verification-before-completion` before claiming success.
4. Do not create workflow state or phase checkpoints unless the user asks.

## State Routing

Use `references/routing.md` for workflow state routing. Keep implementation, debugging, review, and verification methods delegated:

- Implementation safety: `game-implementation-boundary`
- Concept risks, COMPLEX only: `game-concept-example`
- Prototype risks, COMPLEX only: `game-prototype-example`
- Skeleton-first handoff, COMPLEX only: `game-skeleton-first`
- Debugging method: `superpowers:systematic-debugging`
- Verification discipline: `superpowers:verification-before-completion`

## Phase Execution Handoff

Before Superpowers executes a phase, create a handoff artifact. The handoff is task-local context, not a modification to Superpowers.

Required handoff sections:

- Phase name and goal
- Source plan path
- Approved skeleton report path, if any
- Implementation boundary requirement
- Files allowed to change
- Files that must not change
- Public API preservation notes
- Verification commands and manual checks
- Handoff rules

Required handoff rules:

- Continue from the approved skeleton when one exists.
- Do not recreate structure from scratch.
- Preserve approved class names, method names, state flow, lifecycle flow, and orchestration flow unless blocked.
- Fill TODO sections and method bodies according to the phase plan.
- If skeleton must be renamed, removed, or restructured, stop and report the blocker before continuing.

## Debugging Routing

Keep a `DEBUGGING` workflow state for routing and checkpointing, but use Superpowers for the debugging method.

When compile, runtime, verification, regression, or blocking review failure occurs:

1. Route to `DEBUGGING`.
2. Use `superpowers:systematic-debugging`.
3. Apply the minimal fix.
4. Use `superpowers:verification-before-completion`.
5. Return to the current phase checkpoint.

## Checkpoint Output

Every COMPLEX, STANDARD, and FAST phase checkpoint must follow `references/checkpoint-template.md`, write Markdown artifacts according to `references/artifact-output-rules.md`, then sync `run-workflow/workflow-state.json`.

Every checkpoint is a hard user approval gate. Do not proceed to implementation, review, verification, next phase, completion, archive, or resume-dependent work after a checkpoint until the user explicitly approves the proposed next operation.
