# Cocos Workflow Skills — Codex → Claude Code 移植交接筆記

> 建立日期：2026-09-29
> 用途：跨 session 交接。新 session 請先讀本檔，從「下一步」繼續。

## 背景

- 來源（**僅參考，不修改**）：`D:\Tools\skill\codex_SKILLS`
  - 在 Codex 上搭配 Superpowers 設計的 6 個 skill：
    `cocos-workflow`、`cocos-concept-example`、`cocos-prototype-example`、
    `cocos-skeleton-first`、`cocos-implementation-boundary`、`cocos-workflow-html-review`
  - 另有 `AGENTS.md`（Cocos Creator 3.8.x 專案規範）
- 目標（**新作業位置**）：`D:\Tools\skill\claudeCode_SKILLS`
- 決策：只要 Claude Code 版，不再維護 Codex 版（使用者選 B）。
- 使用者要求：節奏要快、直接討論重點；使用者先前已有移植經驗。

## 流程狀態

- 使用 `superpowers:brainstorming`，分類為 **Architectural**。
- 目前進度：設計討論中，**設計尚未核准**。
- 核准後的流程：寫精簡 spec → 使用者 review → `superpowers:writing-plans` → 實作。

## 已查證的事實

1. `SKILL.md` frontmatter（name / description）Claude Code 可直接吃。
2. `agents/openai.yaml` 為 Codex 專用，Claude 不需要。
3. Superpowers skill 名稱在 Claude 端一致（v6.4.2）：`brainstorming`、`writing-plans`、
   `executing-plans`、`subagent-driven-development`、`systematic-debugging`、
   `verification-before-completion`、`requesting-code-review` 等皆存在。
4. **觸發衝突（實測）**：`cocos-workflow` 的 description 宣告吃「腦爆 / brainstorming」等關鍵字並要求先仲裁模式；
   但 Claude 端 `using-superpowers` 規定腦爆先進 `superpowers:brainstorming`。
   實測「開啟腦爆」直接進了 Superpowers，`cocos-workflow` 未被觸發。
5. **產出路徑衝突**：Superpowers brainstorming 預設 spec 寫 `docs/superpowers/specs/`；
   Cocos workflow 要求 `run-workflow/<round-topic>/` 且每份 md 必配 html。
   Superpowers 允許使用者偏好覆寫 spec 位置。
6. **HTML 渲染腳本無法執行**：`render_markdown_review.py` 需要 Python，本機**沒有 Python**，只有 **Node v24.19.0**；
   且 SKILL.md 內寫死路徑 `C:\Users\user\.codex\skills\...`（本機該目錄不存在）。
7. 引擎原始碼路徑寫死：`D:\cocosTest\engine\cocos-engine-3.8.7\cocos-engine-3.8.7`
   （位於 `cocos-implementation-boundary/references/cocos-coding-boundary.md`，原設計已含「找不到就問使用者」）。
8. `~/.claude/skills/` 目前不存在。

## 新需求（2026-09-30）

- 要做 **Cocos 與 Egret 兩種版本**。使用者會提供兩個引擎原始碼路徑；需判斷目前開啟的專案是哪一種引擎。
- 引擎原始碼路徑（已確認存在）：
  - Cocos 3.8.7：`D:\engine\cocos\cocos-engine-3.8.7\cocos-engine-3.8.7`（注意兩層同名資料夾）
  - Egret 5.4.1：`D:\engine\egret\egret-core-master`（`package.json` version 5.4.1，原始碼在 `src/`）
- ✅ 分流結構：**A**。流程類 skill 共用一套，前綴 **`game-`**：
  `game-workflow`、`game-concept-example`、`game-prototype-example`、`game-skeleton-first`、
  `game-implementation-boundary`、`game-workflow-html-review`。
- ✅ `game-implementation-boundary` 內部按引擎分資料夾（新增引擎 = 加資料夾 + 登記表一行）：
  ```
  game-implementation-boundary/
    SKILL.md                    共用：規劃 / 實作原則 / 損壞修復 / 刪除安全 / 驗證 + 引擎判斷流程
    references/implementation-rules.md, verification-checklist.md   共用
    engines/
      README.md                 登記表：判斷條件 → 資料夾
      cocos/  engine.md（3.8.7、路徑）, boundary.md（原 cocos-coding-boundary + Cocos 生命週期/Tween/Spine/Pool）,
              typescript.md（原 TS 規則）, project-rules.md（原 AGENTS.md）
      egret/  engine.md（5.4.1、路徑、TS 2.4.2）, boundary.md, typescript.md, project-rules.md   ← 皆待起草
  ```
- ✅ TS 規則**不共用**：Egret 5.4.1 內建編譯器為 TypeScript **2.4.2**（`tools/lib/typescript-plus`），與 Cocos 3.8 差異大。
- 專案判斷提案：根目錄有 `egretProperties.json` → Egret；有 `assets/` 且（`settings/` 或 `package.json` 含 `creator`）→ Cocos；都不符就問。
- 盤點結果：引擎專屬內容集中在 `cocos-implementation-boundary`（尤其 `references/cocos-coding-boundary.md`）與 `AGENTS.md`；
  workflow 的模式、gate、模板、html-review 基本與引擎無關，只有 description 與風險關鍵字寫死 Cocos。

## 設計提案與狀態

| # | 項目 | 提案 | 狀態 |
|---|------|------|------|
| 1 | 包裝 / 安裝方式 | **Global skill**：先在 `claudeCode_SKILLS` 內完成全部 skill，完成後直接**複製**到 `~/.claude/skills/`（非 plugin、非 junction） | ✅ 已確認（2026-09-29） |
| 2 | 觸發衝突 | 在 Cocos 專案 `CLAUDE.md` 加路由規則（腦爆/brainstorming/design/plan/review/debug → 先 `cocos-workflow` 仲裁模式），利用「使用者指令 > skill」優先序；並改寫 `cocos-workflow` description 標明在 `superpowers:brainstorming` 之前使用 | 待確認 |
| 3 | 產出路徑 | `game-workflow` 明寫：選定 COMPLEX/STANDARD/FAST 後，brainstorming 的 spec 與 writing-plans 的 plan 一律寫到 `run-workflow/<round-topic>/`，覆寫 Superpowers 預設。**LAZY 原版即存在（第四種模式），照原樣移植：無 runtime state、無 checkpoint、無產出** | 待確認 |
| 4 | HTML 渲染 | Python 腳本改寫為零依賴 Node 版 `render_markdown_review.mjs`，參數與輸出不變（`--input` / `--output` / `--title`，表格、code block、目錄導覽）；路徑改相對 skill 目錄 | 待確認 |
| 5 | 移除 Codex 專用檔 | 原提案：刪 `openai.yaml` 與 `.py`。**因改在新資料夾撰寫，此項改為：新資料夾不帶入這些檔案，codex repo 不動** | 隨 #1 調整，待確認 |
| 6 | AGENTS.md / 引擎路徑 | `AGENTS.md` 屬 Cocos 專案規範，不放進 skill 本體；改為 `templates/AGENTS.md` + `templates/CLAUDE.md`（`@AGENTS.md` 引入 + #2 路由規則），新專案直接複製。引擎路徑維持原樣 | 待確認 |
| 7 | skill 內容 | 除 #2–#4 牽涉的路徑 / description / 腳本指令外，流程、gate、模板內容不改（最小修改原則） | 待確認 |

## 進度（2026-09-30）

- #2–#7 使用者已 OK；#8 由 Claude 起草 Egret 規則供審。
- ✅ Spec 已寫：`docs/specs/2026-09-30-game-workflow-port-design.md`
- ✅ Egret 草稿已寫：`drafts/egret/{boundary,typescript,project-rules}.md`（標【需確認】/ [CONFIRM] 處待使用者決定）
- ✅ 使用者核准 spec + Egret 草稿（4 處【需確認】全 OK），並要求加入 TS 版本差異評估。
- ✅ 計畫已寫：`docs/plans/2026-09-30-game-workflow-port.md`（9 個 Task；Task 6 = TS 版本差異評估；Task 1 含 `git init`）
- ✅ 使用者選 Native 執行、不建 git。Task 1–8 完成，進度與所有 Ruling 見 `.superpowers/sdd/2026-09-30-game-workflow-port/progress.md`。
- ✅ TS 版本差異評估：`docs/ts-version-comparison.md`（.html 同目錄），兩邊語法表皆以實際編譯器實測。
- ✅ 最終審查（opus reviewer）：Critical 0；Important 3 + 升級 4 項已修；3 項 Minor 亦已修正（使用者要求）。
- ✅ 已安裝（2026-09-30）：`~/.claude/skills/game-*`（6 個）與 `~/.claude/CLAUDE.md`（新建）。
- ⏳ Task 9 手動觸發驗證（使用者操作）：Cocos 專案、Egret 專案、非遊戲專案各說一次「開啟腦爆」。
- 日後修改：改本資料夾 → `node tools/install.mjs --dry-run` → `node tools/install.mjs --force`（CLAUDE.md 永不自動覆寫）。

## 下一步（新 session 從這裡開始）

1. ~~問使用者 #1~~ 已確認：global skill，先在本資料夾做完再複製到 `~/.claude/skills/`。
2. 逐一確認 #2–#7（使用者要求快，可一次列出請其回覆 OK 或指出編號）。
3. 設計核准後，寫精簡 spec（位置依使用者指定，預設放本資料夾內）→ 使用者 review。
4. 呼叫 `superpowers:writing-plans` 產出實作計畫 → 選執行方式 → 實作。

## 追加變更（2026-09-30）

- 非 Cocos/Egret 專案寫 TS（.ts/.tsx）時，只套用 `engines/cocos/typescript.md` 的 `## TypeScript Boundary` 3 條規則（使用者後改，不含 Babel 禁用語法）。
  入口：global `CLAUDE.md`「TypeScript Default Rules」；`engines/README.md`「No Engine Match」。只套 TS 規則，不啟動 game-workflow。
- 專案自己的 `AGENTS.md` / `CLAUDE.md` / `tsconfig.json` 衝突時以專案為準。
