# Game Workflow Skills（Cocos / Egret）移植設計

> 日期：2026-09-30
> 來源（僅參考，不修改）：`D:\Tools\skill\codex_SKILLS`
> 作業位置：`D:\Tools\skill\claudeCode_SKILLS`
> 安裝目標：`~/.claude/skills/`（global skill）

## 1. 目標

把 Codex 版 6 個 `cocos-*` skill 移植為 Claude Code 的 global skill，並擴充為同時支援 **Cocos Creator 3.8.7** 與 **Egret 5.4.1** 兩種引擎：

- 流程（模式仲裁、runtime state、gate、checkpoint、模板、HTML review）只有一套，與引擎無關。
- 引擎專屬的規則（生命週期、Tween / 骨骼動畫 / 音效 / Pool、shader、TypeScript 版本限制、專案規範）按引擎分資料夾；日後新增引擎只需加一個資料夾並在登記表加一行。

成功條件：

1. 在 Cocos 或 Egret 專案說「腦爆 / brainstorming / design / plan / review / debug」時，會先進 `game-workflow` 仲裁模式，而不是直接進 `superpowers:brainstorming`。
2. 選定模式後的實作邊界會自動載入目前引擎的規則，不會把 Cocos 規則套到 Egret（反之亦然）。
3. 選定 COMPLEX / STANDARD / FAST 後，所有產出都在 `run-workflow/<round-topic>/`，每份 md 都有同名 html。
4. HTML 渲染在只有 Node（v24）、沒有 Python 的機器上可以執行。

非目標：不維護 Codex 版；不修改 Superpowers；不改原本的流程、gate、模板內容（最小修改原則）。

## 2. 已確認的決策

| # | 決策 |
|---|------|
| 1 | Global skill。先在本資料夾完成，完成後複製到 `~/.claude/skills/`；非 plugin、非 junction |
| A | 流程類 skill 共用一套，前綴 `game-`；`game-implementation-boundary` 內按引擎分資料夾 |
| TS | TypeScript 規則不共用：Egret 5.4.1 內建編譯器為 TS 2.4.2（`tools/lib/typescript-plus`） |
| 2 | 路由規則寫在新建的 global `~/.claude/CLAUDE.md`，僅在偵測為遊戲引擎專案時生效 |
| 3 | COMPLEX / STANDARD / FAST 的 spec、plan 一律寫到 `run-workflow/<round-topic>/`；LAZY 照原版，不寫檔 |
| 4 | HTML 渲染腳本改寫為零依賴 Node 版 `render_markdown_review.mjs`，參數與輸出不變 |
| 5 | `agents/openai.yaml` 與 `.py` 不帶入新版 |
| 6 | 專案判斷：`egretProperties.json` → Egret；`assets/` 且（`settings/` 或 `package.json` 含 `creator`）→ Cocos；皆不符 → 問使用者 |
| 7 | 只做三類修改：改名、description 與風險關鍵字去 Cocos 化、引擎規則搬移（只搬不改寫） |
| 8 | Egret 三份規則由 Claude 參照引擎原始碼起草，使用者審閱（草稿見 `drafts/egret/`） |

## 3. 目錄結構

### 3.1 作業資料夾

```
claudeCode_SKILLS/
  PORTING-HANDOFF.md
  docs/specs/2026-09-30-game-workflow-port-design.md   ← 本檔
  drafts/egret/                                         ← Egret 規則草稿（審閱用，核准後搬進 skills/）
  global/CLAUDE.md                                      ← 安裝到 ~/.claude/CLAUDE.md
  skills/                                               ← 整包複製到 ~/.claude/skills/
    game-workflow/
    game-concept-example/
    game-prototype-example/
    game-skeleton-first/
    game-implementation-boundary/
    game-workflow-html-review/
```

### 3.2 skill 對照表

| 新名稱 | 來源 | 主要修改 |
|--------|------|----------|
| `game-workflow` | `cocos-workflow` | 改名；description 加「在 `superpowers:brainstorming` 之前使用」；風險關鍵字改為引用引擎 boundary 的高風險清單；spec/plan 路徑覆寫 Superpowers 預設；`AGENTS.md` 引用改為「專案 `AGENTS.md` / `CLAUDE.md` + 引擎 `project-rules.md`」 |
| `game-concept-example` | `cocos-concept-example` | 改名；description 去 Cocos 化（Spine → 骨骼動畫） |
| `game-prototype-example` | `cocos-prototype-example` | 同上 |
| `game-skeleton-first` | `cocos-skeleton-first` | 同上 |
| `game-implementation-boundary` | `cocos-implementation-boundary` | 改名；引擎專屬段落搬到 `engines/<engine>/`；新增引擎判斷流程 |
| `game-workflow-html-review` | `cocos-workflow-html-review` | 改名；`.py` → `.mjs`；腳本路徑改為相對 skill 目錄 |

所有 skill 內互相引用的名稱（`cocos-xxx`）一律改為 `game-xxx`。

### 3.3 `game-implementation-boundary`

```
game-implementation-boundary/
  SKILL.md                     共用：Core Principle、引擎判斷、Planning、Implementation、
                               Async（通用部分）、損壞程式碼修復、刪除安全、Verification
  references/
    implementation-rules.md    共用（Project Context 改為「依 engines/<engine>/engine.md」）
    verification-checklist.md  共用（Spine / tween 等引擎項目改為「依引擎 boundary 的清單」）
  engines/
    README.md                  引擎登記表
    cocos/
      engine.md                版本 3.8.7、原始碼路徑、判斷條件
      boundary.md              原 cocos-coding-boundary.md + 原 SKILL.md 的 Cocos Lifecycle、
                               Tween/Spine/Audio/Pool 段落 + 高風險主題清單
      typescript.md            原 SKILL.md 的 TypeScript Boundary（Set/Map、匿名函式）
      project-rules.md         原 AGENTS.md
    egret/
      engine.md                版本 5.4.1、原始碼路徑、TS 2.4.2、判斷條件
      boundary.md              草稿：drafts/egret/boundary.md
      typescript.md            草稿：drafts/egret/typescript.md
      project-rules.md         草稿：drafts/egret/project-rules.md
```

`engines/README.md` 登記表格式：

| Engine | 判斷條件（專案根目錄） | 資料夾 | 語言 / 編譯器 |
|--------|------------------------|--------|---------------|
| Egret | 有 `egretProperties.json` | `engines/egret/` | TypeScript 2.4.2（引擎內建） |
| Cocos | 有 `assets/`，且有 `settings/` 或 `package.json` 含 `creator` 欄位 | `engines/cocos/` | TypeScript（Cocos Creator 3.8 內建） |

判斷順序由上而下，第一個符合即採用；都不符合就停下來問使用者。新增引擎：加資料夾（4 個檔）+ 登記表一行。

每個 `engine.md` 固定欄位：引擎與版本、原始碼路徑、不在原始碼路徑內的模組及替代閱讀來源、判斷條件。

| Engine | 原始碼路徑 | 備註 |
|--------|------------|------|
| Cocos | `D:\engine\cocos\cocos-engine-3.8.7\cocos-engine-3.8.7` | 外層多一層同名資料夾 |
| Egret | `D:\engine\egret\egret-core-master` | 原始碼在 `src/`；`dragonBones` 不在此 repo，改讀專案 `libs/modules/dragonBones/*.d.ts`；`assetsmanager`（RES）原始碼在 `src/extension/assetsmanager/src/`（最終審查更正） |

原始碼路徑找不到或讀不到相關原始碼時，停下來問使用者（沿用原版規則）。

每個 `boundary.md` 固定段落：Engine Source Reading Gate、Lifecycle、Node / 顯示物件存取、Tween / 計時、骨骼動畫、Audio、Pool、Shader、效能、**High-Risk Topics**（供 `game-workflow` 推薦 COMPLEX 用）。

### 3.4 `game-workflow` 的引擎感知

- 仲裁與風險推薦段落中的 Cocos 專屬關鍵字（shader、Spine、editor serialization、lower-level Cocos inheritance…）改為：通用風險（架構、async、生命週期、跨系統、public API）＋「目前引擎 `engines/<engine>/boundary.md` 的 High-Risk Topics」。
- 其餘流程（四種模式、State Routing、Phase Execution Handoff、Debugging Routing、Checkpoint）不改。

## 4. 觸發路由（global `~/.claude/CLAUDE.md`）

`~/.claude/CLAUDE.md` 目前不存在，新建，內容大意：

> 若目前專案根目錄符合遊戲引擎判斷條件（`egretProperties.json`；或 `assets/` 加 `settings/` 或 `package.json` 含 `creator`），當使用者說腦爆、brainstorming、design、spec、plan、review、verification、debug 且未明確指定 skill 或模式時，先使用 `game-workflow` 進行模式仲裁，再依選定模式進入 Superpowers skill。

原理：Claude Code 中使用者指令（CLAUDE.md）優先於 skill（`using-superpowers`），可蓋過「腦爆先進 `superpowers:brainstorming`」。非遊戲專案條件不成立，不受影響。

安裝時若 `~/.claude/CLAUDE.md` 已存在，先給使用者看差異並詢問合併方式，不直接覆寫。

## 5. 產出路徑

`game-workflow` 明寫：選定 COMPLEX / STANDARD / FAST 後，`superpowers:brainstorming` 的 spec 與 `superpowers:writing-plans` 的 plan 一律依 `artifact-output-rules.md` 寫到 `run-workflow/<round-topic>/<round-topic>-spec.md`、`-plan.md`，覆寫 Superpowers 預設的 `docs/superpowers/specs/`、`docs/superpowers/plans/`，並同時產出同名 html。

| 模式 | runtime state | checkpoint | 產出 |
|------|---------------|-----------|------|
| COMPLEX | 有 | 有 | spec、plan、phase checkpoint/review/verification/debugging、reconciliation、final-checkpoint + concept、prototype、phase-N-skeleton |
| STANDARD | 有 | 有 | 同上，不含 concept / prototype / skeleton |
| FAST | 有 | 有 | 同 STANDARD，精簡版 |
| LAZY | 無 | 無 | 無（照原版） |

## 6. HTML 渲染（`render_markdown_review.mjs`）

- 零依賴，Node 18+ 可跑（本機 v24.19.0）。
- 參數與原 Python 版相同：`--input`、`--output`、`--title`。
- 輸出功能與原版相同：表格、code block、目錄導覽（實作時逐項對照原 `.py`）。
- `SKILL.md` 內的呼叫方式改為相對 skill 目錄：`node <skill 目錄>/scripts/render_markdown_review.mjs --input … --output …`，不再寫死 `C:\Users\user\.codex\...`。

## 7. 安裝

1. `skills/` 下 6 個資料夾複製到 `~/.claude/skills/`（目前不存在，新建）。
2. `global/CLAUDE.md` 複製到 `~/.claude/CLAUDE.md`（依第 4 節的衝突規則）。
3. 日後修改一律改作業資料夾，再重新複製。

## 8. 驗證

1. 結構：6 個 `SKILL.md` frontmatter 的 `name` 與資料夾名一致；全文搜尋不再出現 `cocos-workflow`、`cocos-implementation-boundary` 等舊名（`engines/cocos/` 內的引擎用語除外）。
2. 渲染：用一份含表格、code block、多層標題的 md 跑 `.mjs`，確認輸出 html 與 Python 版功能一致。
3. 觸發：在一個 Cocos 專案與一個 Egret 專案中，新 session 說「開啟腦爆」，確認先進 `game-workflow` 仲裁、且載入對應引擎的 boundary。
4. 非遊戲專案說「開啟腦爆」，確認仍直接進 `superpowers:brainstorming`。

## 9. 待使用者審閱

- `drafts/egret/boundary.md`
- `drafts/egret/typescript.md`
- `drafts/egret/project-rules.md`

草稿內標 **【需確認】** 的項目，是原 Cocos 規範為使用者個人偏好、無法從引擎原始碼推得 Egret 對應作法的地方。
