# Egret Coding Boundary

Use this reference only after `game-workflow` selects STANDARD, FAST, or LAZY mode in an Egret project, or when the user explicitly asks for Egret implementation boundary rules.

## Engine Source Reading Gate

- Before custom filter / shader work, subclassing lower-level Egret display or eui classes, or overriding engine-level behavior, first read the relevant Egret engine source.
- Engine source path and version: see `engine.md`.
- `dragonBones` source is NOT in the engine repo; read the project's `libs/modules/dragonBones/*.d.ts` (and the matching `.js` if needed) instead.
- `assetsmanager` (RES) source is in `src/extension/assetsmanager/src/`; the project's `libs/modules/assetsmanager` copy may be a different version, so cross-check both.
- If the source path is unavailable or the relevant source cannot be found, stop and ask the user for the correct path before continuing.
- Do not rely on memory for engine internals, display list / render behavior, eui invalidation order, EXML skin binding, or override contracts. Egret 5.4.1 APIs differ from Egret 3.x/4.x docs and from Egret Pro.

## Lifecycle Boundary

Egret has no `onLoad` / `onDestroy`. The lifecycle points are:

| Class | Entry points | Removal |
|-------|-------------|---------|
| `egret.DisplayObject` / `DisplayObjectContainer` | constructor, `egret.Event.ADDED_TO_STAGE` | `egret.Event.REMOVED_FROM_STAGE` |
| `eui.Component` | constructor; `createChildren()` → `childrenCreated()` run once, on the FIRST add to stage; `partAdded()` runs whenever a skin part is set; `commitProperties()` on invalidation | `REMOVED_FROM_STAGE` |
| `eui.ItemRenderer` | as above, plus `dataChanged()` on every data assignment (renderers are recycled) | recycled, not destroyed |

eui notes (verified in `src/extension/eui/components/Component.ts` and `core/UIComponent.ts`):

- Setting `skinName` parses the skin immediately. With the common "set `skinName` in the constructor" pattern, `partAdded()` fires during construction, before `createChildren()`; do not assume other fields are ready inside `partAdded()`.
- `partRemoved()` runs only when a skin part is replaced by a new skin; it is NOT called when the component is removed or dropped. Never put cleanup there.

Required:

- Do not initialize mutable runtime state in the constructor beyond field defaults; expose a public `init()` guarded by `_inited`. Call `init()` from `childrenCreated()` (eui) or the first `ADDED_TO_STAGE` handler when the local pattern requires self-initialization — this mirrors the Cocos "onLoad only calls init" rule.
- Egret has no display-object `destroy()`; `removeChild` releases nothing. Provide an explicit public `destroy()` / `cleanup()` that removes listeners, tweens, timers, ticks, sound channels, armatures, and references.
- `REMOVED_FROM_STAGE` fires on every re-parent, not only on final removal. Do not do irreversible cleanup there unless the object is never re-added by project convention.
- Before `removeChild` / `removeChildren` / dropping the last reference, clear listeners, tweens, timers, `startTick` callbacks, promise resolves, and references.
- When `visible` / enabled state changes, enable or disable listeners and `touchEnabled` / `touchChildren` as needed (Cocos `active` + `interactable` equivalent).

## Event Listener Boundary

- `removeEventListener(type, listener, thisObject, useCapture)` only removes the listener when `listener`, `thisObject`, AND `useCapture` match the add call (capture and bubble listeners live in separate maps). Store handlers as named methods or named lambda fields; never pass `fn.bind(this)` or an inline function to `addEventListener`.
- Prefer `once()` for one-shot events; still remove it in cleanup if the event may never fire.
- Every `addEventListener` introduced in a phase must have its matching `removeEventListener` in the same phase.

## Display Object Access

- Avoid `getChildByName` / recursive container search inside `ENTER_FRAME`, `startTick`, or other per-frame paths.
- Cache commonly used display objects; for eui use skin parts (`id` in EXML) instead of lookups.
- Avoid deep display-list traversal during gameplay.

## Tween and Timing Boundary

- Tweens: `egret.Tween.get(target)`. Removal is per target: `egret.Tween.removeTweens(target)` removes ALL tweens on that target. When several tweens share a target, stop a single one with `tween.setPaused(true)` and drop the reference instead.
- Store externally controllable tweens in fields and expose a dedicated stop method; do not bury tween control inside other logic.
- For completion, wrap `.call(...)` in a Promise; the stop method must also settle (resolve or reject) that Promise so no Promise stays unresolved.
- Do not use `Tween.get(target, props, null, true)` (override flag); the engine source marks it "not recommended" — call `removeTweens` explicitly.
- Timers, in order of preference:
  1. Tween-driven delay (`Tween.get(proxy).wait(ms).call(...)`) with a cancel method, when a Promise is needed.
  2. `egret.Timer` — must `stop()` and remove `TIMER` / `TIMER_COMPLETE` listeners.
  3. `egret.startTick` / `egret.stopTick` — same callback and `thisObject` for both.
  4. `egret.setTimeout` / `egret.clearTimeout` (engine ticker, `game` module) — store the returned key.
- Native `window.setTimeout` / `setInterval` / `requestAnimationFrame` are forbidden unless discussed (mirrors Cocos rule).
- `ENTER_FRAME` is the Cocos `update()` equivalent: keep it light and remove it in cleanup.

## Skeletal / Frame Animation Boundary (DragonBones, MovieClip)

Egret's counterpart to Cocos Spine is DragonBones (`dragonBones.EgretArmatureDisplay`); frame animation uses `egret.MovieClip`.

- Unregister `dragonBones.EventObject` listeners (`COMPLETE`, `LOOP_COMPLETE`, `FRAME_EVENT`, …) after use or interruption.
- Prevent animation state overwrite: a new `animation.play()` / `fadeIn()` interrupts the current one without firing its `COMPLETE`; any Promise waiting on the old animation must be settled by the interrupting code.
- Prevent duplicate `COMPLETE` handling on looping animations.
- On cleanup call the armature display's `dispose()` and drop the reference. Verify the exact API in the project's `libs/modules/dragonBones/*.d.ts` (DragonBones versions differ).
- `egret.MovieClip`: remove `MovieClipEvent` / `Event.COMPLETE` listeners and `stop()` before removal.

## Audio Boundary

- `egret.Sound.play()` returns an `egret.SoundChannel`; keep the channel reference to stop it.
- Cleanup: `channel.stop()`, remove `egret.Event.SOUND_COMPLETE` listeners, drop the channel reference; call `sound.close()` when the sound resource itself is released.
- Group/list playback must clean up every channel and callback.

## Pool Boundary

- Egret 5.4.1 core has no built-in display object pool; use project pools.
- Pool objects must reset data and release old references before recycle; remove from parent before recycle.
- Avoid `new` + discard of display objects in high-frequency flows.
- `eui.List` / `DataGroup` with virtual layout recycles item renderers: `dataChanged()` must fully reset visual state (treat it like pool recycle).

## Custom Filter / Shader Safety

- Egret custom shaders use `egret.CustomFilter(vertexSrc, fragmentSrc, uniforms)`. The engine source states it supports WebGL mode only; confirm the project render mode (`egret.runEgret({ renderMode })`) and target platforms before relying on it.
- Before shader work, read `src/egret/filters/CustomFilter.ts` and the WebGL renderer / default shader source in the engine repo; do not invent attribute, varying, or uniform names from memory.
- If no project shader reference exists, start from a minimal pass-through filter that compiles and renders, then add custom uniforms and fragment logic.
- Set `padding` when the effect draws outside the original bounds (outline, glow).
- Every filter renders to an off-screen target; treat filters on frequently changing or many objects as a performance risk.
- Do not copy GLSL from Cocos effects or other engines without validation.

## Performance Boundary

- Minimize draw calls: use sprite sheets / texture atlases; avoid interleaving different textures and text in the same container order.
- Use `cacheAsBitmap` only for static, complex containers; never on containers that change every frame.
- Prefer `scrollRect` over `mask` for rectangular clipping; treat `mask` and filters as expensive.
- Avoid frequent eui invalidation (setting layout-affecting properties every frame).
- Avoid allocations in `ENTER_FRAME` / tick loops; reuse arrays and objects.
- Release unused resources via RES (`RES.destroyRes`) according to the project's resource ownership rules.

## Debugging Discipline

Same as Cocos: do not guess; hypothesis → evidence → narrow root cause → modify → verify again.

## Forbidden Defaults

- No hidden singleton dependency.
- No unmanaged async state.
- No per-frame display-list traversal.
- No listener registration without matching removal (same `listener` + `thisObject` + `useCapture`).
- No fire-and-forget async without cleanup ownership.
- No unrelated large-scale rewrite.
- No over-engineering simple local changes.
- No deleting old code without explicit approval and dependency checks.

## High-Risk Topics (recommend COMPLEX)

- `CustomFilter` / GLSL / render mode (WebGL vs Canvas)
- Subclassing `eui.Component` / layout / `DisplayObjectContainer` internals, or overriding `$`-prefixed engine methods
- EXML skin structure, skin part renaming, data binding
- DragonBones animation orchestration and interruption
- RES group loading / release ownership
- eui virtual layout item renderer recycling
- Lifecycle, async, tween / timer ownership across systems
- Reusable framework or public API design
