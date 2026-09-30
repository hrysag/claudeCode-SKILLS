# Game Workflow Skills Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `D:\Tools\skill\codex_SKILLS` 的 6 個 `cocos-*` skill 移植為支援 Cocos 3.8.7 與 Egret 5.4.1 的 6 個 `game-*` Claude Code global skill，並安裝到 `~/.claude/skills/`。

**Architecture:** 流程類 skill 共用一套；`game-implementation-boundary/engines/<engine>/` 放引擎專屬規則（engine / boundary / typescript / project-rules 四檔），靠 `engines/README.md` 登記表判斷引擎。HTML 渲染改為零依賴 Node 腳本。觸發路由放 global `~/.claude/CLAUDE.md`。

**Tech Stack:** Markdown skills（Claude Code SKILL.md frontmatter）、Node v24（`node:test`、ESM `.mjs`，零依賴）、git（本機版控）。

**Spec:** `docs/specs/2026-09-30-game-workflow-port-design.md`

## Global Constraints

- 來源 `D:\Tools\skill\codex_SKILLS` 只讀，任何任務都不得寫入。
- 作業根目錄：`D:\Tools\skill\claudeCode_SKILLS`；skill 放 `skills/<name>/`。
- 6 個 skill 名稱：`game-workflow`、`game-concept-example`、`game-prototype-example`、`game-skeleton-first`、`game-implementation-boundary`、`game-workflow-html-review`。
- 不帶入 `agents/openai.yaml`、`*.py`；不得出現 `.codex` 路徑或 `python` 呼叫。
- 引擎原始碼路徑：Cocos `D:\engine\cocos\cocos-engine-3.8.7\cocos-engine-3.8.7`；Egret `D:\engine\egret\egret-core-master`。
- 引擎判斷順序：`egretProperties.json` → Egret；`assets/` 且（`settings/` 或 `package.json` 含 `creator`）→ Cocos；都不符 → 問使用者。
- 最小修改：除改名、去 Cocos 化的 description / 風險關鍵字、引擎規則搬移、spec 明列的新增內容外，文字逐字保留。
- 腳本零依賴，只用 Node 內建模組。
- Egret 草稿 4 處【需確認】/ [CONFIRM] 使用者已核准，定稿時移除標記、保留內容。

## Review Focus

1. 中文標題的錨點：Python `\w`（UNICODE）會保留中日韓字元，JS 預設 `\w` 不會 → 目錄連結全變 `section`。→ Task 2 測試 `slugify('設計 決策')`。
2. 程式碼區塊沒關（檔尾缺 ```）時，內容仍要輸出為 `<pre>`，不能遺失。→ Task 2 測試。
3. 內文或 `--title` 含 `<`、`&`、`"` 時必須跳脫，不能破壞 HTML。→ Task 2 測試。
4. `--output` 的上層資料夾不存在時要自動建立。→ Task 2 測試。
5. 安裝時 `~/.claude/skills/<name>` 或 `~/.claude/CLAUDE.md` 已存在：不可無聲覆寫。→ Task 8 安裝腳本檢查。

---

## 共用：去 Cocos 化替換表

Task 3、4、7 在「流程類 / 共用」檔案中套用（`engines/cocos/` 內不套用）：

| 原文 | 改為 |
|------|------|
| `cocos-workflow` / `cocos-concept-example` / `cocos-prototype-example` / `cocos-skeleton-first` / `cocos-implementation-boundary` / `cocos-workflow-html-review` | 對應 `game-*` |
| 標題 `# Cocos Xxx` | `# Game Xxx` |
| description 中 `a Cocos Creator TypeScript` | `a Cocos Creator or Egret TypeScript` |
| `Spine`（通用檔中） | `skeletal animation (Spine / DragonBones)` |
| `Cocos constraints` / `Cocos-specific` / `Cocos safety` | `engine constraints` / `engine-specific` / `engine safety` |
| 引用 `AGENTS.md` 作為規範來源 | `the project's AGENTS.md / CLAUDE.md and engines/<engine>/project-rules.md` |

---

### Task 1: 版控與結構驗證器

**Files:**
- Create: `.gitignore`、`tools/validate-skills.mjs`、`tools/validate-skills.test.mjs`

**Interfaces:**
- Produces: `node tools/validate-skills.mjs [skillsRoot]` — 預設 `skills/`；全部通過印 `OK` 並 exit 0，否則逐行印 `FAIL <path>: <reason>` 並 exit 1。匯出 `validate(skillsRoot: string): string[]`（回傳失敗訊息陣列）。

- [ ] **Step 1:** `git init`，`.gitignore` 內容 `node_modules/`、`*.log`；把現有 `PORTING-HANDOFF.md`、`docs/`、`drafts/` 做第一個 commit。
- [ ] **Step 2: 寫測試** `tools/validate-skills.test.mjs`（`node:test`，在 `os.tmpdir()` 建臨時 fixture）：
  - `validate(emptyDir)` 回報 6 個 `missing skill game-*`。
  - frontmatter `name: foo` 放在 `game-workflow/` → 回報 `name mismatch`。
  - 任一檔含 `cocos-workflow`（或其他 5 個舊名）→ 回報 `legacy name`。
  - 任一檔含 `.codex` 或 `python ` → 回報 `codex residue`；存在 `*.py` 或 `openai.yaml` → 回報 `codex file`。
  - 任一檔含 `DRAFT`、`[CONFIRM]`、`【需確認】` → 回報 `draft marker`。
  - `engines/README.md` 登記的每個資料夾缺 `engine.md`/`boundary.md`/`typescript.md`/`project-rules.md` 任一 → 回報 `engine file missing`。
  - 完整合法 fixture → `[]`。
- [ ] **Step 3:** `node --test tools/` → FAIL（validate 未定義）。
- [ ] **Step 4:** 實作 `validate`；登記表解析：讀 `game-implementation-boundary/engines/README.md` 表格第三欄的 `engines/<x>/`。
- [ ] **Step 5:** `node --test tools/` → PASS；`node tools/validate-skills.mjs` → FAIL（6 個 missing skill，預期）。
- [ ] **Step 6:** commit `chore: add skill structure validator`。

### Task 2: `game-workflow-html-review`（Node 渲染器）

**Files:**
- Create: `skills/game-workflow-html-review/SKILL.md`、`skills/game-workflow-html-review/scripts/render_markdown_review.mjs`、`skills/game-workflow-html-review/scripts/render_markdown_review.test.mjs`

**Interfaces:**
- Produces: CLI `node <skill>/scripts/render_markdown_review.mjs --input <md> --output <html> [--title <t>]`，成功印 `Wrote <output>`；匯出 `slugify(text)`、`renderMarkdown(md) -> {toc: [level,text,anchor][], body: string}`、`buildHtml(source, title, md) -> string`。行為逐項對照原 `render_markdown_review.py`（段落、標題、無序 / 有序清單、blockquote、pipe 表格含對齊、code fence、`` `code` ``、`**bold**`、CSS 與版面逐字沿用）。

- [ ] **Step 1: 寫測試**（`node:test`）：
  - `slugify('Phase 1: Setup')` === `'phase-1-setup'`；`slugify('設計 決策')` === `'設計-決策'`；`slugify('!!!')` === `'section'`。
  - `| a | b |\n| :--- | ---: |\n| 1 | 2 |` → body 含 `<th style="text-align: left;">a</th>` 與 `<td style="text-align: right;">2</td>`。
  - 未關閉的 fence：`` ```\nx<y `` → body 含 `<pre><code>x&lt;y</code></pre>`。
  - `buildHtml('a.md', 'A & "B"', '# T')` 含 `<title>A &amp; &quot;B&quot;</title>` 與 nav `<a href="#t">T</a>`。
  - CLI：`--output <tmp>/new/dir/out.html` 會建立資料夾並寫檔；不給 `--title` 時標題為檔名 `my-plan_v2` → `My Plan V2`。
- [ ] **Step 2:** `node --test skills/game-workflow-html-review/scripts/` → FAIL。
- [ ] **Step 3:** 實作 `.mjs`。`slugify` 用 `/[^\p{L}\p{N}_\s-]/gu` 對應 Python UNICODE `\w`；HTML 跳脫與 Python `html.escape(quote=True)` 相同（`& < > " '`）；時間格式 `YYYY-MM-DD HH:mm:ss`；讀寫 UTF-8。
- [ ] **Step 4:** 測試 PASS；再用 spec 檔實際跑一次：`node skills/game-workflow-html-review/scripts/render_markdown_review.mjs --input docs/specs/2026-09-30-game-workflow-port-design.md --output tmp/spec.html` → 開啟確認表格、code block、中文目錄連結可跳轉（`tmp/` 加入 `.gitignore`）。
- [ ] **Step 5:** 從來源複製 `SKILL.md`，套用替換表；`## Script` 段改為：使用 `scripts/render_markdown_review.mjs`（相對本 skill 目錄），範例改為 `node "<本 skill 目錄>/scripts/render_markdown_review.mjs" --input … --output … --title …`，範例專案路徑改為 `<project>`。
- [ ] **Step 6:** commit `feat: port html review renderer to node`。

### Task 3: concept / prototype / skeleton 三個 skill

**Files:**
- Create: `skills/game-concept-example/`、`skills/game-prototype-example/`、`skills/game-skeleton-first/`（各自 `SKILL.md` + `references/*-template.md`，自來源複製）

- [ ] **Step 1:** 複製三個來源資料夾（排除 `agents/`），改資料夾名。
- [ ] **Step 2:** 套用去 Cocos 化替換表（frontmatter `name`、description、標題、`cocos-*` 引用、Spine、`## Cocos Safety Questions` → `## Engine Safety Questions`，並在該段首加一行：`Also check the High-Risk Topics in engines/<engine>/boundary.md of game-implementation-boundary.`）。
- [ ] **Step 3:** `grep -rniE "cocos|spine" skills/game-concept-example skills/game-prototype-example skills/game-skeleton-first` → 僅剩 description 中的 `Cocos Creator or Egret` 與 `Spine / DragonBones`。
- [ ] **Step 4:** commit `feat: port concept, prototype, skeleton skills`。

### Task 4: `game-implementation-boundary`（共用 + Cocos）

**Files:**
- Create: `skills/game-implementation-boundary/SKILL.md`、`references/implementation-rules.md`、`references/verification-checklist.md`、`engines/README.md`、`engines/cocos/{engine,boundary,typescript,project-rules}.md`

**Interfaces:**
- Produces: `engines/README.md` 表格欄位 `| Engine | Detect (project root) | Folder | Language / Compiler |`，Folder 欄格式 `` `engines/<x>/` ``（Task 1 驗證器依此解析）。每個 `engine.md` 固定段落：`## Engine`、`## Source Path`、`## Modules Outside Source Path`、`## Detection`。每個 `boundary.md` 以 `## High-Risk Topics (recommend COMPLEX)` 結尾（Task 7 引用此標題）。

- [ ] **Step 1: `SKILL.md`**（自來源複製後調整）：
  - frontmatter：`name: game-implementation-boundary`；description：`Use when game-workflow STANDARD, FAST, or LAZY has been selected, or when the user explicitly asks for implementation boundary rules for a Cocos Creator 3.8 or Egret 5.4 TypeScript plan, phase execution, review, debugging, or verification task.`
  - `## Core Principle` 之後新增 `## Engine Detection`：依 `engines/README.md` 由上而下判斷，採用第一個符合者並讀該資料夾四檔；都不符合 → 停下來問使用者。專案本地 `AGENTS.md` / `CLAUDE.md` 衝突時以較具體者為準（沿用原句）。
  - `## Reference Map` 改列：共用兩檔 + `engines/<engine>/engine.md`、`boundary.md`、`typescript.md`、`project-rules.md`。
  - 搬出（整段移到 `engines/cocos/boundary.md`，逐字）：`## Cocos Lifecycle Boundary`、`## Tween, Spine, Audio, Pool Boundary`；搬出 `## TypeScript Boundary` 到 `engines/cocos/typescript.md`。原位置各留一行：`See engines/<engine>/boundary.md` / `typescript.md`。
  - `## Async Boundary` 最後一條 `prefer tween-driven flows…` 保留（兩引擎皆適用）。
  - `## Verification Boundary` 中 `No tween leak`、`No Spine callback leak`、`No schedule callback leak`、`No pool reference leak` 改為一行：`No engine-specific leak listed in engines/<engine>/project-rules.md 驗證清單`；其餘逐字。
- [ ] **Step 2: references**：`implementation-rules.md` 的 `## Project Context` 改為 `Assume the target engine and version from engines/<engine>/engine.md unless the local project says otherwise.`，`Spine callback` 改 `skeletal animation callback`；`verification-checklist.md` 的 `No Spine callback leak.` 改 `No skeletal animation callback leak.`。
- [ ] **Step 3: `engines/README.md`**：spec §3.3 登記表（Egret 列在前）+ 一段「新增引擎：加 `engines/<name>/` 四檔 + 本表一行」。
- [ ] **Step 4: `engines/cocos/`**：
  - `engine.md`：Cocos Creator 3.8.7；路徑 `D:\engine\cocos\cocos-engine-3.8.7\cocos-engine-3.8.7`（註明外層同名資料夾）；Modules Outside：無；Detection 同登記表；找不到路徑 → 問使用者。
  - `boundary.md`：來源 `cocos-coding-boundary.md` 逐字，只改 (a) 開頭一句 `cocos-workflow` → `game-workflow`，(b) 預設路徑改為「see `engine.md`」；接著附上 Step 1 搬出的兩段；最後新增 `## High-Risk Topics (recommend COMPLEX)`，內容取自來源 `cocos-workflow/SKILL.md` 第 18、30、39 行的 Cocos 項目：shader / material / effect / rendering pipeline、lower-level Cocos inheritance、engine-level override、lifecycle、serialization、editor behavior、Spine、tween、pooling、reusable framework / public API。
  - `typescript.md`：`# Cocos TypeScript Boundary` + Step 1 搬出的 TypeScript 段落（Compiler Baseline 由 Task 6 補）。
  - `project-rules.md`：來源 `AGENTS.md` 逐字（標題改為 `# Cocos 專案規範`）。
- [ ] **Step 5:** commit `feat: add shared boundary and cocos engine rules`。

### Task 5: Egret 引擎資料夾

**Files:**
- Create: `skills/game-implementation-boundary/engines/egret/{engine,boundary,typescript,project-rules}.md`
- Delete: `drafts/egret/`（git mv）

- [ ] **Step 1:** `git mv drafts/egret/*.md skills/game-implementation-boundary/engines/egret/`。
- [ ] **Step 2:** 移除草稿標記：檔首 `> DRAFT…` 引言區塊、所有 `**[CONFIRM]**`、`【需確認】`（保留該條內容）；`project-rules.md` 標題改為 `# Egret 專案規範`。
- [ ] **Step 3:** `engine.md`：Egret 5.4.1；路徑 `D:\engine\egret\egret-core-master`（原始碼在 `src/`）；Modules Outside：`dragonBones`、`assetsmanager`（RES）→ 讀專案 `libs/modules/<module>/*.d.ts`；編譯器 TS 2.4.2（`tools/lib/typescript-plus`）；Detection 同登記表。
- [ ] **Step 4:** `node tools/validate-skills.mjs` → 此時只剩 `missing skill game-workflow`（Task 7 前的預期狀態）。
- [ ] **Step 5:** commit `feat: add egret engine rules`。

### Task 6: TS 版本差異評估

**Files:**
- Create: `docs/ts-version-comparison.md`
- Modify: `engines/cocos/typescript.md`（新增 `## Compiler Baseline`、`## Porting Notes`）、`engines/egret/typescript.md`（新增 `## Porting Notes`）

每一項結論都必須附上查證來源（檔案路徑 + 行號，或指令輸出）；查不到的寫「未查證」，不得憑記憶。

- [ ] **Step 1: 蒐集 Cocos 事實**：
  - 引擎自身 TS 版本：`package.json` `"typescript": "^4.9.5"`（已知，第 72 行），再讀根目錄 `tsconfig.json` 的 `target` / `lib` / `strict` / `experimentalDecorators`。
  - 使用者專案腳本的編譯方式（Creator 3.8 由編輯器以 Babel 轉譯、型別檢查靠 IDE / tsc，需查證）：在引擎 repo 搜尋 `@babel/preset-typescript`、`isolatedModules`、`tsconfig.cocos`；若使用者有 Cocos 3.8 專案（詢問路徑，例如 `D:\cocosTest\...`），讀其 `tsconfig.json` 與 `temp/tsconfig.cocos.json`。
  - 由上推得的限制（每條需查證）：`const enum` 跨檔、`namespace` 合併、`export =`、裝飾器版本（legacy `experimentalDecorators`）。
- [ ] **Step 2: 蒐集 Egret 事實**：`tools/lib/typescript-plus/package.json` version 2.4.2；`tools/templates/empty/tsconfig.json`（target es5、lib es5/dom/es2015.promise、experimentalDecorators）；確認 Egret 是否有 `compilerVersion` 或 webpack 模式可換編譯器（搜尋 `tools/` 內 `compilerVersion`、`typescript` 載入處）。
- [ ] **Step 3: 寫 `docs/ts-version-comparison.md`**：表格 `| 項目 | Cocos 3.8.7 | Egret 5.4.1 | 來源 |`，列：編譯器與版本、target、lib、模組系統、型別檢查時機、裝飾器、可用語法差異（沿用 `engines/egret/typescript.md` 表格的每一列，Cocos 欄填可用 / 不可用）、執行期 API（Map/Set/Promise/Object.assign 等）。
- [ ] **Step 4: 寫回兩個 `typescript.md`**：
  - Cocos 新增 `## Compiler Baseline`（Step 1 查證結果）與 `## Porting Notes`：從 Cocos 移植程式碼到 Egret 時必須改寫的語法清單（指向 `engines/egret/typescript.md` 的表格，不重複）。
  - Egret 新增 `## Porting Notes`：從 Egret 移植到 Cocos 時的差異（namespace → ES module、全域類別 → import、事件 / tween API 不同，指向對應 boundary）。
- [ ] **Step 5:** 把比較表用 Task 2 渲染器產出 `docs/ts-version-comparison.html`，給使用者看。
- [ ] **Step 6:** commit `docs: evaluate cocos vs egret typescript baselines`。

### Task 7: `game-workflow`

**Files:**
- Create: `skills/game-workflow/SKILL.md`、`skills/game-workflow/references/{routing,runtime-state,orchestration-gates,artifact-output-rules,checkpoint-template,phase-execution-handoff-template}.md`

- [ ] **Step 1:** 複製來源（排除 `agents/`），套用去 Cocos 化替換表。
- [ ] **Step 2: description** 改為：`Use BEFORE superpowers:brainstorming in a Cocos Creator or Egret TypeScript project when a request needs workflow coordination or uses ambiguous Superpowers keywords such as brainstorming, design, spec, plan, review, verification, debug, or 腦爆 — decides between pure Superpowers and the COMPLEX/STANDARD/FAST/LAZY game workflow.`
- [ ] **Step 3: 引擎感知**（SKILL.md 第 18、30、39 行三處及 `routing.md` 第 5 行）：把 Cocos 專屬項目換成「通用風險（architecture, core systems, async, lifecycle, state, callback, pooling, reusable framework, public API, cross-system orchestration）＋ the High-Risk Topics in `game-implementation-boundary/engines/<engine>/boundary.md`」；在 `## Core Principle` 加一句：先依 `game-implementation-boundary/engines/README.md` 判斷引擎。
- [ ] **Step 4: 規範來源**：第 12 行 `AGENTS.md is a required source` 改為 `the project's AGENTS.md / CLAUDE.md and game-implementation-boundary/engines/<engine>/project-rules.md are required sources`；`phase-execution-handoff-template.md` 第 28 行同步。
- [ ] **Step 5: 產出路徑覆寫**：在 `## Runtime Ownership` 末加一段：`When COMPLEX, STANDARD, or FAST is active, write the superpowers:brainstorming spec and the superpowers:writing-plans plan to run-workflow/<round-topic>/<round-topic>-spec.md and -plan.md per references/artifact-output-rules.md, overriding the Superpowers default docs/superpowers/ locations, and render the paired HTML with game-workflow-html-review.` LAZY 段不動。
- [ ] **Step 6:** `node tools/validate-skills.mjs` → `OK`；`grep -rn "Cocos" skills/game-workflow` 只剩 description 的 `Cocos Creator or Egret`。
- [ ] **Step 7:** commit `feat: port game-workflow orchestrator`。

### Task 8: global 路由與安裝

**Files:**
- Create: `global/CLAUDE.md`、`tools/install.mjs`

**Interfaces:**
- Produces: `node tools/install.mjs [--dry-run] [--force]` — 目標 `~/.claude/skills/<6 skills>` 與 `~/.claude/CLAUDE.md`。目標已存在且內容不同時：未帶 `--force` 則列出衝突並 exit 1、不寫任何檔；`~/.claude/CLAUDE.md` 存在時永遠不覆寫，只印出需手動合併的內容。

- [ ] **Step 1: `global/CLAUDE.md`**（spec §4）：

```markdown
# Game Engine Workflow Routing

When the current project root contains `egretProperties.json`, or contains `assets/` together with `settings/` or a `package.json` that has a `creator` field, and the user says 腦爆, brainstorming, design, spec, plan, review, verification, or debug without explicitly naming a skill or workflow mode:
use the `game-workflow` skill FIRST to arbitrate the mode, then enter the Superpowers skill the chosen mode routes to.
This rule overrides the default of entering `superpowers:brainstorming` directly. It does not apply to other projects.
```

- [ ] **Step 2:** 實作 `install.mjs`（`fs.cpSync` 遞迴複製；安裝前先跑 `validate()`，失敗則中止）。
- [ ] **Step 3:** `node tools/install.mjs --dry-run` → 列出 6 個 skill 與 CLAUDE.md 將新建。給使用者看結果，取得同意後執行 `node tools/install.mjs`。
- [ ] **Step 4:** `node tools/validate-skills.mjs "%USERPROFILE%/.claude/skills"` → `OK`；再跑一次 `node tools/install.mjs --dry-run` → 顯示「無變更」。
- [ ] **Step 5:** 更新 `PORTING-HANDOFF.md` 進度；commit `feat: add global routing and installer`。

### Task 9: 手動觸發驗證（使用者操作）

- [ ] 在一個 Cocos 3.8 專案開新 session 說「開啟腦爆」→ 先出現 `game-workflow` 模式仲裁；選 STANDARD 後讀取 `engines/cocos/`。
- [ ] 在一個 Egret 專案重複 → 讀取 `engines/egret/`。
- [ ] 在非遊戲資料夾說「開啟腦爆」→ 直接進 `superpowers:brainstorming`。
- [ ] 任一項不符 → 用 `superpowers:systematic-debugging` 找原因（多半是 description 或 CLAUDE.md 措辭），修改後重跑 Task 8 安裝。
