# Egret Engine

## Engine

- Egret 5.4.1, TypeScript, display list (`egret.DisplayObject`) + eui architecture.
- Compiler: bundled `typescript-plus` 2.4.2 (`tools/lib/typescript-plus`); see `typescript.md`.

## Source Path

- `D:\engine\egret\egret-core-master` (engine sources in `src/`: `src/egret` core, `src/extension/{eui,game,tween,...}`).
- If this path is unavailable or the relevant source cannot be found there, stop and ask the user for the correct engine source path before continuing.

## Modules Outside Source Path

- `dragonBones` has no source in the engine repo (`package.json` lists it with an empty `root`); read the project's `libs/modules/dragonBones/*.d.ts` (and the matching `.js` when needed) instead.
- `assetsmanager` (RES) source is in `src/extension/assetsmanager/src/`; the project's `libs/modules/assetsmanager` copy may be a different version, so cross-check both.

## Detection

- Project root has `egretProperties.json`.
