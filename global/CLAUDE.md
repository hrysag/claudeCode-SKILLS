# Game Engine Workflow Routing

When the user says 腦爆, brainstorming, 設計, design, spec, 規劃, 計畫, plan, 審查, 檢查, review, 驗證, verification, 除錯, or debug without explicitly naming a skill or workflow mode, first list the current project root once (before invoking any Superpowers skill) and check for these markers:

- `egretProperties.json` → Egret project
- `assets/` together with `settings/`, or a `package.json` that has a `creator` field → Cocos Creator project

If either marker matches, use the `game-workflow` skill FIRST to arbitrate the mode, then enter the Superpowers skill the chosen mode routes to.
This rule overrides the default of entering `superpowers:brainstorming` directly. It does not apply to other projects.

# TypeScript Default Rules

When writing or modifying TypeScript (`.ts` / `.tsx`) in a project whose root has none of the engine markers above, read `~/.claude/skills/game-implementation-boundary/engines/cocos/typescript.md` once per session before the first TypeScript edit, and follow only its `## TypeScript Boundary` section (the three rules: no Set of Maps, no Map whose values are Sets, no inline anonymous functions). Ignore the Cocos compiler baseline, Babel syntax restrictions, and porting notes in that file.
If the project's own `AGENTS.md`, `CLAUDE.md`, or `tsconfig.json` conflicts with it, the project wins.
This rule applies the TypeScript rules only; it does not start `game-workflow` or load any other engine rule file.
