# Cocos Project Rules

# Project Overview

This project uses:

* Cocos Creator 3.8.x
* TypeScript
* Component-based architecture
* Shader code following the 3.8.x conventions
* A reusable animation system

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

## Set and Map Rules

* Do not declare a Set variable containing maps.
* Do not declare a Map variable whose stored value is a Set.
* Do not use anonymous functions directly; assign lambda functions to named variables.

# Cocos Creator Rules

## Engine Lifecycle Limits

* Do not initialize or assign values in `onLoad`.
* Do initial assignment in a public `init` method that external flow can call.
* Guard `init` with an `_inited` flag to prevent repeated initialization.
* `onLoad` only calls the public `init`.
* When follow-up work must wait until a component has been created, consider listening to `Node.EventType.CHILD_ADDED`, or drive the flow with promise async/await.
* `onDestroy` only nulls related variables and properties; for real cleanup, provide an externally callable public `destroy` method that actively removes related objects.

## Node Access

* Avoid `node.find` in runtime loops.
* Cache frequently used nodes.
* Avoid heavy deep scene traversal during gameplay.

## Shader Code Rules

* Never write Cocos builtin include paths from memory.
* Never reuse shader structure from another engine, another Cocos version, or a different rendering purpose as-is.
* Before adding a shader, confirm the project's Cocos Creator version.
* If the project has no reference shader, first build a minimal compilable version; add custom uniforms and fragment logic only after it compiles.
* After adding or replacing an include, tell the user this is a high-risk area that must be compile-tested before continuing feature work.
* Watch UBO field order for padding.

## Code Lifecycle Safety

* Before `destroy` / `removeChild` / `removeFromParent`, remove listeners.
* Before `destroy` / `removeChild` / `removeFromParent`, clear tweens.
* Before `destroy` / `removeChild` / `removeFromParent`, settle pending promise resolves.
* Before `destroy` / `removeChild` / `removeFromParent`, clear schedule callbacks.
* Before `destroy` / `removeChild` / `removeFromParent`, clear references.
* Unregister Spine callbacks after use.
* When `active` becomes true/false, enable or disable event listeners or the button's `interactable`.

## Object Pool

* Fully `resetData` before recycle.
* Pool objects must not keep old references.
* Avoid `instantiate` / `destroy` in high-frequency flows.
* Do not use the engine's native `NodePool`.

## Component Design

* Each component has a single responsibility.
* Avoid God components.
* Prefer controller/manager orchestration.
* If the node a component is attached to will never be shown in the scene, consider not using a component (except for audio or other cases where a component is strictly required).

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
* Spine animation
* async callbacks
* scheduled tasks

---

# Timer Rules

* Do not use native JS timing mechanisms or related methods unless necessary, and discuss it first.
* When using `schedule`, always write the matching `unschedule`.
* When a timer operation must be promise-based, drive it with a tween and provide a cancel method.

---

# Tween Rules

* A controllable tween that must be stoppable from outside must be stored in a field.
* Expose it through a dedicated method; never bury it inside other logic functions.
* When completion is needed (`call`), wrap the tween in a promise for async/await.
* For promise rules see "Promise Safety".

---

# Spine Rules

* Spine callbacks must be unregistered.
* Prevent animation states from overwriting each other.
* Prevent the animation complete callback from firing more than once.
* Clean up correctly when an animation is interrupted.

---

# Audio Rules

* Audio playback must support cleanup.
* Prevent unmanaged audio sources.
* Avoid `AudioSource` reference leaks.
* Group/list playback must fully clean up callbacks.

---

# Performance Rules

## Draw Call

* Avoid unnecessary draw calls.
* Reduce dynamic UI rebuilds.
* Avoid expensive runtime masks.

## Memory

* Avoid frequent allocation in gameplay loops.
* High-frequency systems must reuse arrays/objects.
* Prefer pooling for temporary objects.

## Update Loop

* Avoid heavy logic inside `update()`.
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

* TypeScript compiles.
* No unresolved promise.
* No dangling callback.
* No tween leak.
* No Spine callback leak.
* No event listener leak.
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
* Runtime scene traversal spam
* Callbacks left registered
* Fire-and-forget async without cleanup
* Large unrelated refactors
* Over-engineering simple problems
* Deleting old code without permission
