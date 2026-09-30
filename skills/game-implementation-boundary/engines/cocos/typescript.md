# Cocos TypeScript Boundary

## Compiler Baseline

- Cocos Creator 3.8 transpiles project scripts per file with Babel (`@babel/plugin-transform-typescript`). Babel strips types and does NOT type-check; type errors only show in the IDE.
- The project `tsconfig.json` extends `temp/tsconfig.cocos.json` (`target: ES2015`, `module: ES2015`, `isolatedModules: true`, `experimentalDecorators: true`, `noEmit: true`). It exists for IDE type checking only. The project may override `strict`.
- Modules are ES modules (`import` / `export`).
- Because Babel does not type-check, run the IDE / `tsc --noEmit -p .` type check before claiming "TypeScript compile pass".

## Syntax That Breaks Under Babel Per-File Transpile

| Do not use | Result | Use instead |
|------------|--------|-------------|
| `const enum` | transpile error | `enum` |
| `export = x` / `import x = require(...)` | transpile error | `export default` / `import x from` |
| `declare field: T` in a class | transpile error | a normal field |
| Re-exporting a type with `export { T }` | runtime missing export | `export type { T }` |
| `x satisfies T` | left in output → runtime syntax error | a type annotation |
| `namespace` merged across files | unreliable | ES modules |

## TypeScript Boundary

Required:

- Do not declare a Set variable containing maps.
- Do not declare a Map variable whose stored value is a Set.
- Do not use anonymous functions directly; assign lambda functions to named variables.

## Porting Notes (Cocos → Egret)

- Egret compiles with TypeScript 2.4.2 to ES5; most modern syntax fails there, and whether `Map` / `Set` (and their iteration) are usable depends on the Egret project's `tsconfig.json` `lib` — detect it per `engines/egret/typescript.md` before porting code that uses them.
- Egret projects use `namespace` only; every `import` / `export` must be removed.
- Engine APIs differ (lifecycle, events, tween, Spine → DragonBones); map them with `engines/egret/boundary.md`.
- Full evidence: `D:\Tools\skill\claudeCode_SKILLS\docs\ts-version-comparison.md`.
