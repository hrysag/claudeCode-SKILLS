# Engine Registry

Check the rows from top to bottom against the project root. Use the first row that matches and read the four files in its folder (`engine.md`, `boundary.md`, `typescript.md`, `project-rules.md`). If no row matches, follow "No Engine Match" below.

| Engine | Detect (project root) | Folder | Language / Compiler |
| --- | --- | --- | --- |
| Egret 5.4.1 | has `egretProperties.json` | `engines/egret/` | TypeScript 2.4.2 (bundled with the engine) |
| Cocos Creator 3.8.7 | has `assets/`, and has `settings/` or a `package.json` with a `creator` field | `engines/cocos/` | TypeScript (bundled with Cocos Creator 3.8) |

## No Engine Match

If no row matches but the project is TypeScript (has `tsconfig.json` or `.ts` / `.tsx` sources), apply only the `## TypeScript Boundary` section of `engines/cocos/typescript.md` (three rules). Skip the rest of that file (Cocos compiler baseline, Babel syntax restrictions, porting notes) and do not load the other Cocos files (`engine.md`, `boundary.md`, `project-rules.md`); they are Cocos-specific.
If the project is not TypeScript either, stop and ask the user.

## Adding an Engine

1. Create `engines/<name>/` with the four files: `engine.md`, `boundary.md`, `typescript.md`, `project-rules.md`.
2. `boundary.md` must end with a `## High-Risk Topics (recommend COMPLEX)` section; `game-workflow` uses it for mode recommendation.
3. Add one row to the table above. Put more specific detection rules above more generic ones.
