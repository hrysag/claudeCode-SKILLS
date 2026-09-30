# Cocos Coding Boundary

Use this reference only after `game-workflow` selects STANDARD, FAST, or LAZY mode, or when the user explicitly asks for Cocos implementation boundary rules.

## Engine Source Reading Gate

- Before shader-related implementation, inheritance from lower-level Cocos classes, or overriding engine-level behavior, first read the relevant Cocos engine source.
- Engine source path: see `engine.md`.
- If the engine source path is unavailable or the relevant source cannot be found there, stop and ask the user for the correct engine source path before continuing.
- Do not rely on memory for engine internals, lifecycle behavior, rendering behavior, decorators, serialization behavior, or override contracts.
- Prefer confirming the engine-level call chain, ownership, cleanup expectations, and version-specific behavior before proposing or applying implementation changes.

## Node Access

- Avoid `node.find` in runtime loops.
- Cache commonly used nodes.
- Avoid heavy or repeated scene traversal during gameplay.

## Shader Safety

- Before shader-related implementation, read the relevant Cocos engine shader/effect/material source from the engine source path defined in `Engine Source Reading Gate`.
- Do not invent Cocos built-in include paths from memory.
- Confirm the project Cocos Creator version before adding or changing shader code.
- Do not copy shader structure from another engine, another Cocos version, or a different rendering purpose without validation.
- If no project shader reference exists, start from a minimal compilable shader before adding custom uniforms or fragment logic.
- Treat every include-path addition or replacement as high risk and tell the user to compile-test it before continuing feature work.
- Pay attention to UBO field order and padding.

## Performance Boundary

- Avoid unnecessary draw calls.
- Reduce dynamic UI rebuilds.
- Avoid expensive runtime masks.
- Avoid frequent allocations in gameplay loops.
- Reuse arrays or objects in high-frequency systems.
- Prefer pooling for temporary gameplay objects when allocation pressure matters.
- Avoid heavy logic inside `update()`.
- Prefer event-driven flow when practical.

## Debugging Discipline

- Do not guess.
- Establish a hypothesis.
- Gather evidence.
- Narrow the root cause.
- Modify only after evidence supports the fix.
- Verify again after the modification.

## Forbidden Defaults

- No hidden singleton dependency.
- No unmanaged async state.
- No runtime scene traversal spam.
- No callback registration without cleanup.
- No fire-and-forget async without cleanup ownership.
- No unrelated large-scale rewrite.
- No over-engineering simple local changes.
- No deleting old code without explicit approval and dependency checks.

## Cocos Lifecycle Boundary

Required:

- Do not initialize mutable runtime state in `onLoad` except delegating to a public `init` when the local pattern requires it.
- Use an `_inited` or equivalent guard to avoid repeated initialization.
- Keep cleanup callable from an explicit public destroy/cleanup method when runtime removal is needed.
- In `onDestroy`, clear references and invoke already-defined cleanup only when that matches project convention.
- Before destroy, removeChild, or removeFromParent, clear listeners, tweens, schedules, callbacks, promise resolves, and references.
- When active state changes, enable or disable event listeners and button interactability as needed.

## Tween, Spine, Audio, Pool Boundary

Required:

- Store externally controllable tweens in fields.
- Provide a dedicated stop/cleanup method for controllable tweens.
- Unregister Spine callbacks after use or interruption.
- Clean up audio playback callbacks and references.
- Pool objects must reset data and release old references before recycle.
- Do not use engine `NodePool`.

## High-Risk Topics (recommend COMPLEX)

- Shader, material, effect, or rendering pipeline changes
- Inheritance from lower-level Cocos classes or engine-level override behavior
- Lifecycle, serialization, or editor behavior
- Spine animation orchestration and callback cleanup
- Tween orchestration and cancellation
- Pooling
- Reusable framework or public API design
- Cross-system orchestration uncertainty
