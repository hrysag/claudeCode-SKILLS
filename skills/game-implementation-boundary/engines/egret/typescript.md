# Egret TypeScript Boundary

## Compiler Baseline

- Egret 5.4.1 compiles with its bundled `typescript-plus` **2.4.2** (`tools/lib/typescript-plus`).
- Project template `tsconfig.json`: `target: es5`, `lib: ["es5", "dom", "es2015.promise"]`, `experimentalDecorators: true`.
- The TypeScript version is fixed by the engine CLI (`tools/actions/Compiler.ts` imports the bundled compiler). `compilerVersion` in `egretProperties.json` selects the Egret engine version, not the TypeScript version.
- Every `egret build` type-checks the whole project; type errors fail the build.
- Before writing code, read the project's `tsconfig.json` and `egretProperties.json`, and run the detection below. If the project builds with a different toolchain (e.g. webpack), follow the project and state the difference.
- Every row in the tables below was verified by compiling a sample with the bundled TS 2.4.2.

## Detect Map / Set and Strict Support from tsconfig.json

Never assume `Map` / `Set` are usable. Before the first TypeScript edit in an Egret project, read the project root `tsconfig.json` and decide from `compilerOptions`:

1. Read `compilerOptions.lib` (lib names are case-insensitive). If `extends` is present, merge the base file's options first (the child's `lib` replaces the base's).
2. If `tsconfig.json` is missing or is not valid JSON (comments included — the Egret CLI reads it with `JSON.parse`), the CLI falls back to `lib: ["es5", "dom", "es2015.promise"]`: treat Map / Set as NOT available.
3. Decide each level with the table; a lower level is required for every level below it.

| Level | Enabled when `lib` contains any of | Allows |
|-------|------------------------------------|--------|
| Collections | `es2015.collection`, `es2015`, `es6`, `es2016`, `es7`, `es2017`, `esnext` | `Map`, `Set`, `WeakMap`, `WeakSet`: constructor, `get` / `set` / `add` / `has` / `delete` / `clear` / `size` / `forEach` |
| Iteration methods | Collections AND any of `es2015.iterable`, `es2015`, `es6`, `es2016`, `es7`, `es2017`, `esnext` | `keys()` / `values()` / `entries()`, `Array.from(map / set)` |
| `for...of` over Map / Set | Iteration methods AND `"downlevelIteration": true` | `for (const [k, v] of map)` |

- `lib` absent: TS uses its ES5 default lib, so no level is enabled.
- `es2015.iterable` alone (without Collections) enables nothing here.
- If Collections is not enabled: do not use `Map` / `Set`; use plain objects (`{ [key: string]: T }`) and arrays, or ask the user to add `es2015.collection` to `lib`.
- If Collections is enabled but Iteration methods is not: iterate only with `forEach`.
- The declarations do not polyfill anything; `Map` / `Set` rely on the runtime (modern browsers and WebViews provide them).

Other ES2015+ APIs follow the same rule: `Object.assign`, `Array.prototype.find` / `findIndex`, `String.prototype.startsWith` / `endsWith` / `includes`, and `Number.isInteger` need `es2015.core` (or an umbrella lib above). `Array.prototype.includes` needs `es2016` / `es2016.array.include`, `Object.values` / `entries` need `es2017` / `es2017.object`, and `padStart` needs `es2017` / `es2017.string`; otherwise use `indexOf(x) !== -1` and manual loops.

### Strict

Treat the project as strict when `compilerOptions.strict` is `true`; if it is absent or `false`, still honor `noImplicitAny` / `strictNullChecks` / `noImplicitThis` when set individually. In TS 2.4.2 `strict` turns on `noImplicitAny`, `strictNullChecks`, `noImplicitThis`, and `alwaysStrict`:

- `noImplicitAny`: annotate every parameter.
- `strictNullChecks`: `null` / `undefined` must be in the type (`T | null`); `map.get(key)` returns `T | undefined` and must be narrowed before use.
- `noImplicitThis`: functions using `this` outside a class need a `this:` parameter type.
- Uninitialized class fields are NOT checked (no `strictPropertyInitialization` in 2.4), and `field!: T` is unavailable — initialize fields explicitly or type them `T | null`.

## Syntax Not Available in TS 2.4.2 (compile errors)

| Do not use | Introduced in | Use instead |
|------------|---------------|-------------|
| Optional chaining `a?.b`, nullish coalescing `a ?? b` | 3.7 | explicit `a && a.b`, `a != null ? a : b` |
| `unknown` type | 3.0 | `any` with a narrowing check |
| Conditional types, `infer` | 2.8 | overloads or explicit types |
| Definite assignment `field!: T` | 2.7 | initialize the field or declare `T \| null` |
| Numeric separators `1_000` | 2.7 | `1000` |
| Optional / rest tuple elements | 3.0 | arrays or explicit overloads |
| `as const`, `readonly T[]` shorthand | 3.4 | `ReadonlyArray<T>`, explicit literal types |
| `import type`, `#private` fields | 3.8 | no imports at all (see Module Style) / `private` keyword |
| `bigint` | 3.2 | `number` |

## Runtime / Lib Limits (target ES5)

- Only use APIs the detected `lib` declares (see Detect Map / Set and Strict Support). The bare template `lib` has no `Map`, `Set`, `Object.assign`, `find`, or `startsWith` declarations.
- `for...of` works over arrays and strings; over `Map` / `Set` only when the detection table allows it.
- `async` / `await` compiles to ES5 but depends on `Promise`; the template includes `es2015.promise`. Keep every Promise settle-able (see boundary async rules).

## Module Style

- Use `namespace` only. Never write `import` or `export` statements, including `import x = require(...)` and `export =`. Code is organized as global scripts with `namespace` / global classes, ordered by the Egret compiler.
- Reference code in another namespace by its qualified name (`game.ui.MainPanel`); a namespace import alias (`import Panel = game.ui.MainPanel;`) is also an `import` and is not allowed.
- The CLI deletes `module`, `noLib`, `rootDir`, and `out` from `tsconfig.json` (`tools/actions/Compiler.ts`), so ES modules are not an option anyway.
- Class registration for reflection (`egret.getQualifiedClassName`, EXML `skinName` class lookup) depends on global class names; renaming or moving a class into a namespace can break EXML binding.

## Project TypeScript Rules (from the Cocos rule set)

- Do not declare a Set variable containing maps.
- Do not declare a Map variable whose stored value is a Set.
- Do not use anonymous functions directly; assign lambda functions to named variables. In Egret this is also required so `removeEventListener` can match the same function reference.

## Porting Notes (Egret → Cocos)

- Cocos uses ES modules: replace `namespace` / global classes with `import` / `export`, and add `@ccclass` / `@property` for components.
- Cocos transpiles per file with Babel: `const enum`, `export =`, `import = require`, and cross-file `namespace` merging break there (see `engines/cocos/typescript.md`).
- Engine APIs differ (display list → nodes + components, `egret.Tween` → `tween`, DragonBones → Spine or the Cocos DragonBones component); map them with `engines/cocos/boundary.md`.
- Full evidence: `D:\Tools\skill\claudeCode_SKILLS\docs\ts-version-comparison.md`.
