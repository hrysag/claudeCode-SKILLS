# Egret Project Rules

# Project Overview

This project uses:

* Egret 5.4.1
* TypeScript 2.4.2 (the engine's bundled compiler, target ES5)
* Display list (`DisplayObject`) + eui architecture
* Reusable animation systems (DragonBones / Tween / MovieClip)

This project values:

* Extensibility
* Lifecycle safety
* Async safety
* Stable performance
* System reusability
* Low regression risk

---

# Architecture Rules

## Basic Principles

* Prefer composition or dependency injection over deep inheritance.
* When using DI, never inject concrete instances directly; inject through interfaces.
* Follow OOP SOLID principles.
* Avoid unnecessary abstraction.
* Keep systems modular and extensible.
* Do not change the existing architecture unless explicitly asked.
* Reduce hidden dependencies.
* Avoid tight coupling between systems.

## Public API Rules

* Never break an existing public API.
* Never rename public methods casually.
* Prefer backward compatibility.

## System Design

* Design systems for future extension.
* Do not hardcode game-specific cases into generic systems.
* State transitions must be explicit and traceable.

---

# TypeScript Rules

* See `typescript.md` for TS 2.4.2 syntax and ES5 lib limits.
* Module style: use `namespace` only. Never use `import` / `export` (including `import x = require()`, `import Alias = Some.Namespace`, and `export =`). Reference other namespaces by their fully qualified name.
* Before writing TS, read the project root `tsconfig.json` and detect support; never assume `Map` / `Set` are usable (decision table in `typescript.md`):
  * `lib` contains `es2015.collection` (or `es2015` / `es6` / `es2016` / `es7` / `es2017` / `esnext`) → `Map` / `Set` construction, `get` / `set` / `add` / `has` / `delete` / `size` / `forEach` are allowed.
  * Additionally contains `es2015.iterable` (or one of the umbrella libs above) → `keys()` / `values()` / `entries()` and `Array.from(set)` are allowed.
  * Additionally `downlevelIteration: true` → `for...of` over `Map` / `Set` is allowed.
  * None of the above, no `lib`, or `tsconfig.json` is not valid JSON → do not use `Map` / `Set`; use plain objects `{ [key: string]: T }` and arrays.
* Strict: when `strict: true` (or `noImplicitAny` / `strictNullChecks` / `noImplicitThis` individually) is on, annotate every parameter, put `null` / `undefined` in the type, and narrow `map.get()` (returns `T | undefined`) before use.
* Do not declare a Set variable containing maps.
* Do not declare a Map variable whose stored value is a Set.
* Do not use anonymous functions directly; assign lambda functions to named variables. (In Egret this is also required so `removeEventListener` receives the same function reference.)

# Egret Rules

## Engine Lifecycle Limits

* Do not initialize or assign values in the constructor (field defaults excepted).
* Do initial assignment in a public `init` method that external flow can call.
* Guard `init` with an `_inited` flag to prevent repeated initialization.
* For `eui.Component`, call the public `init` from `childrenCreated`; for non-eui objects, call it on the first `ADDED_TO_STAGE`.
* When follow-up work must wait until a child object is created, consider `childrenCreated` / `partAdded` (note: when `skinName` is set in the constructor, `partAdded` fires during construction; `partRemoved` fires only when a skin part is replaced, so never put cleanup there), or drive the flow with promise async/await.
* Egret display objects have no `destroy`, and `removeChild` releases nothing; provide an externally callable public `destroy` method that actively removes related objects.
* `REMOVED_FROM_STAGE` fires on every re-parent; never do irreversible cleanup there (unless the project guarantees the object is never re-added).

## Display Object Access

* Avoid `getChildByName` or recursive searches inside `ENTER_FRAME` / `startTick`.
* Cache frequently used display objects; for eui prefer skin parts (EXML `id`).
* Avoid heavy deep display-list traversal during gameplay.

## Shader (CustomFilter) Rules

* Never write Egret's default shader attribute / varying / uniform names from memory; read the engine source first.
* Never reuse shader structure from another engine (including Cocos), another Egret version, or a different rendering purpose as-is.
* Before adding a shader, confirm the project's Egret version and `renderMode` (`CustomFilter` supports WebGL only).
* If the project has no reference shader, first build a minimal compilable, displayable pass-through version; add custom uniforms and fragment logic only after it works.
* After adding or replacing a `CustomFilter`, tell the user this is a high-risk area that must be tested on device before continuing feature work.
* Set `padding` when the effect extends beyond the original bounds (outline, outer glow).

## Code Lifecycle Safety

* Before `removeChild` / `removeChildren` / dropping the reference, remove listeners (`removeEventListener` needs the same `listener`, `thisObject`, and `useCapture`).
* Before `removeChild` / `removeChildren` / dropping the reference, clear tweens (`egret.Tween.removeTweens` or `setPaused`).
* Before `removeChild` / `removeChildren` / dropping the reference, settle pending promise resolves.
* Before `removeChild` / `removeChildren` / dropping the reference, clear `Timer` / `startTick` / `egret.setTimeout` / `ENTER_FRAME`.
* Before `removeChild` / `removeChildren` / dropping the reference, clear references.
* Unregister DragonBones callbacks after use.
* When `visible` / enabled state changes, enable or disable event listeners or `touchEnabled` / `touchChildren`.

## Object Pool

* Fully `resetData` before recycle, and remove the object from its parent first.
* Pool objects must not keep old references.
* Avoid `new` / discarding display objects in high-frequency flows.
* The Egret core has no built-in display-object pool; always use the project's own pool.
* `eui.List` virtual layout reuses `ItemRenderer`s; `dataChanged` must fully reset the visual state.

## Component Design

* Each class has a single responsibility.
* Avoid God classes / God components.
* Prefer controller/manager orchestration.
* Logic that is never displayed should not extend `DisplayObject` / `eui.Component`; use a plain class (counterpart of the Cocos rule "consider dropping the component when the node is never shown in the scene").

---

# Async Rules

## Promise Safety

* No unresolved promises.
* Promise flows should support cancellation wherever possible.
* Avoid hidden async state mutation.

## Callback Safety

* Unregister callbacks after use.
* Prevent duplicate callback registration.
* Prevent dangling async listeners.
* Do not use cross-class callback designs.

## Timing Safety

Watch for race conditions in:

* tween
* DragonBones / MovieClip animation
* async callbacks
* `Timer` / `startTick` / `egret.setTimeout`

---

# Timer Rules

* Do not use native JS timing mechanisms (`window.setTimeout` / `setInterval` / `requestAnimationFrame`) unless necessary, and discuss it first.
* Engine timer preference order: `egret.Timer` → `egret.startTick` → `egret.setTimeout` (each needs its matching `stop` / `stopTick` / `clearTimeout`).
* When a timer operation must be promise-based, drive it with a tween and provide a cancel method.

---

# Tween Rules

* A controllable tween that must be stoppable from outside must be stored in a field.
* Expose it through a dedicated method; never bury it inside other logic functions.
* When completion is needed (`call`), wrap the tween in a promise for async/await.
* `egret.Tween.removeTweens(target)` removes every tween on that target; when one target has several tweens, use `setPaused` and drop the reference instead.
* Do not use the override parameter of `Tween.get`; call `removeTweens` explicitly.
* For promise rules see "Promise Safety".

---

# DragonBones Rules (counterpart of the Cocos Spine rules)

* Unregister DragonBones events (`COMPLETE` / `LOOP_COMPLETE` / `FRAME_EVENT`).
* Prevent animation states from overwriting each other.
* Prevent the animation complete callback from firing more than once.
* Clean up correctly when an animation is interrupted (an interrupted animation never fires `COMPLETE`; the interrupting code must settle any waiting promise).
* On removal, call the armature display's `dispose` and drop the reference (verify the API in the project's `libs/modules/dragonBones` d.ts).

---

# Audio Rules

* Audio playback must support cleanup (keep the `SoundChannel` and `stop` it when needed).
* Prevent unmanaged `SoundChannel`s.
* Avoid `Sound` / `SoundChannel` reference leaks.
* Group/list playback must fully clean up callbacks (including `SOUND_COMPLETE` listeners).

---

# Performance Rules

## Draw Call

* Avoid unnecessary draw calls (use atlases / sprite sheets; avoid interleaving different textures and text).
* Reduce dynamic eui layout recalculation.
* Avoid expensive runtime masks and filters (prefer `scrollRect` for rectangular clipping).
* Use `cacheAsBitmap` only on static, complex containers.

## Memory

* Avoid frequent allocation in gameplay loops.
* High-frequency systems must reuse arrays/objects.
* Prefer pooling for temporary objects.
* Release unused resources with `RES.destroyRes` according to project rules.

## Update Loop

* Avoid heavy logic inside `ENTER_FRAME` / `startTick`.
* Prefer event-driven flow.

---

# Minimal Change Principle

Unless explicitly requested:

* Do not rewrite the overall architecture.
* Do not refactor unrelated systems.
* Do not add unnecessary design patterns.
* Prefer the smallest safe change.
* Do not rewrite established low-level algorithms unless a change is requested.

---

# Debugging Process

When debugging you must:

1. Not guess.
2. Form a hypothesis.
3. Collect evidence.
4. Narrow down the root cause.
5. Verify before changing anything.
6. Verify again after the change.

---

# Verification Checklist

Before completion, confirm:

* TypeScript compiles (`egret build`, TS 2.4.2, per the project `tsconfig.json`).
* Every `Map` / `Set` / ES2015+ API used is within the detected `lib`.
* No `import` / `export` statements.
* No unresolved promise.
* No dangling callback.
* No tween leak.
* No DragonBones callback leak.
* No event listener leak.
* No `Timer` / `startTick` / `setTimeout` leak.
* No pool reference leak.
* No obvious lifecycle issue.
* No public API regression.

---

# Implementation Process

When implementing a feature:

1. Analyze the requirement first.
2. Propose architecture when necessary.
3. Create an implementation plan.
4. Implement in phases.
5. Verify after each phase.

Avoid large one-shot rewrites.

---

# Forbidden Behavior

* Hidden singleton dependency
* Unmanaged async state
* Runtime display-list traversal spam
* Callbacks left registered
* Fire-and-forget async without cleanup
* Large unrelated refactors
* Over-engineering simple problems
* Deleting old code without permission
