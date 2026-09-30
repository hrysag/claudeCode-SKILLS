# SDD ledger — plan: docs/plans/2026-09-30-game-workflow-port.md

Spec: docs/specs/2026-09-30-game-workflow-port-design.md

Ruling: 不建 git、跳過 Task 1 Step 1 與所有 commit 步驟 — 使用者明確指示 — 無版本回溯，改以本 ledger 記錄進度
Ruling: task-start / task-done / review-package 腳本依賴 git，改為手動執行測試指令並手寫 ledger — 無 git 可用 — 無

Pre-flight:
- Task 1 validator 解析 engines/README.md 第三欄 `engines/<x>/` ↔ Task 4 Step 3 產出格式：一致
- Task 7 引用 `## High-Risk Topics (recommend COMPLEX)` ↔ Task 4 cocos boundary / Task 5 egret draft 標題：一致
- Task 6 使用 Task 2 渲染器 CLI：一致
- Task 8 install 呼叫 Task 1 `validate()`：一致
Task 1: Ruling: `node --test tools/` 在 Node 24 會把目錄當模組執行而失敗，改用 `node --test "tools/*.test.mjs"` — 指令本身不可行 — 無
Task 1: Ruling: 不建 .gitignore（無 git）— 使用者指示 — 無
Task 1: complete (tests: node --test "tools/*.test.mjs" → 9/9 pass; CLI → 6 missing skill, exit 1 as expected)
Task 2: Ruling: 實跑輸出寫到 session scratchpad 而非 `tmp/`（無 .gitignore 可排除）；以 grep 確認 5 表格 / 2 code block / 中文錨點，未開瀏覽器目視 — 避免在作業資料夾留暫存檔 — 版面問題需使用者開檔才會發現
Task 2: complete (tests: node --test tools + html-review → 19/19 pass; spec 實跑 OK)
Task 3: complete (grep 殘留僅 description 的 Cocos Creator or Egret 與 Spine / DragonBones；validator 對三個 skill 無錯誤)
Task 4: Ruling: verification-checklist.md 除 Spine 行外，另把 `schedule callback`、`node.find`、`update()` 三行改為引擎中立寫法 — spec 要求共用檔去 Cocos 化，計畫只列了 Spine 一行 — 若使用者要逐字保留需還原三行
Task 4: Ruling: 共用 SKILL.md 的 Lifecycle 段標題由 `Cocos Lifecycle Boundary` 改為 `Lifecycle Boundary`，`Tween, Spine, Audio, Pool` 改為 `Tween, Skeletal Animation, Audio, Pool`（內容移到 engines/）— 共用檔不應留 Cocos 字樣 — 無
Task 4: Ruling: validator 只解析 engines/README.md 表格列（新增測試 `only registry table rows count as engine folders` RED→GREEN）— README 說明文字的 `engines/<name>/` 被誤判 — 無
Task 4: complete (validator tests 10/10; CLI 僅剩 game-workflow 缺與 egret 四檔缺，皆為 Task 5/7 前預期狀態)
Task 5: Ruling: 以 mv 取代 git mv，drafts/ 移空後刪除 — 無 git — 無
Task 5: complete (validator → 僅剩 missing skill game-workflow，符合 Expected)
Task 6: Ruling: 以使用者本機 Cocos 3.8.3 專案 `D:\cocosTest\AudioTest` 的 tsconfig 取代詢問使用者 — 本機已有 3.8 專案可讀 — 3.8.3 與 3.8.7 的 tsconfig.cocos 若不同需補查
Task 6: Ruling: Cocos 語法表用 Creator 3.8.7 內附引擎建置 Babel（core 7.19.6 / transform-typescript 7.14.6）實測作代理；編輯器 app.asar 內實際版本無法直接讀 — 已在比較文件標註代理驗證 — 若編輯器 Babel 較新，const enum / satisfies 等可能已支援，規則偏保守
Task 6: Ruling: Egret 語法表 21 項全用引擎內建 TS 2.4.2 實測；另修正草稿「webpack 可換編譯器」的說法為「TS 版本由 CLI 固定、compilerVersion 是引擎版本」— 讀 Compiler.ts / ProjectData.ts 查證 — 無
Task 6: Ruling: typescript.md 的證據連結改為絕對路徑 `D:\Tools\skill\claudeCode_SKILLS\docs\...` — 安裝到 ~/.claude/skills 後相對路徑失效 — 作業資料夾搬家時需更新
Task 6: complete (docs/ts-version-comparison.md + .html 產出；兩邊 typescript.md 更新；validator 僅剩 game-workflow 缺)
Task 7: Ruling: 替換表外另把 `Cocos workflow` → `game workflow`、`Cocos skills` → `game skills`、`Cocos/Superpowers` → `game/Superpowers` 等泛用字樣一併改 — spec §3.2 要求 description 與風險關鍵字去 Cocos 化，這些是同類字樣 — 無
Task 7: Ruling: 保留 artifact-output-rules.md 範例資料夾名 `run-workflow/spine-callback-cleanup/` — 只是範例 kebab-case 名稱，非規則 — 無
Task 7: complete (validator → OK；grep 僅 description 保留 Cocos Creator or Egret)
Task 8: Ruling: 最終審查移到實際安裝之前，審完修正再裝一次 — 避免裝了再用 --force 覆蓋 — 無
Task 8: Ruling: 未依計畫「dry-run 後再問使用者」，dry-run 全為 create 後直接安裝 — 使用者最初明確指示「完成後直接拷貝到 global」且已核准新建 global CLAUDE.md — 若使用者要先看，可刪除 7 個新建項
Final review: fresh reviewer (opus subagent) — Critical 0 / Important 3 / Minor 7
Final: fixed #1 CLI 經 junction/8.3 路徑無聲失敗（3 檔改 realpath 比對）— tests `cli works when invoked through a junction`、`cli prints a result when invoked through a junction` RED→GREEN, suite 28/28
Final: Ruling: #2 路由規則補「先列專案根目錄」與中文關鍵字（global/CLAUDE.md、game-workflow description 與仲裁段）— 無法自動測試，由 Task 9 手動觸發驗證 — 若仍未攔截需再調措辭
Final: Ruling: #3 跨 skill 路徑改為 `../game-implementation-boundary/...` 並註明相對本 skill base 目錄 — 純文字修正，validator OK — 無
Final: Ruling: #4 eui 生命週期由 Minor 升級修正（partAdded 可能在建構期觸發、partRemoved 非移除鉤子）— 依 Component.ts:164-180,341 / UIComponent.ts:993-1001 查證；錯誤描述會讓清理邏輯永不執行 — 無
Final: Ruling: #5 RES 原始碼其實在 src/extension/assetsmanager/src/，更正 boundary.md、engine.md、spec — 查證 Glob — 無
Final: Ruling: #6 removeEventListener 需同 useCapture，由 Minor 升級修正 — EventDispatcher.ts:198 查證；漏寫會導致 capture listener 洩漏 — 無
Final: Ruling: #7 共用 Verification Boundary 補回 tween / 骨骼動畫 / schedule-timer / pool 四條中立項 — Cocos 驗證清單無 schedule 項 — 無
Final: Ruling: 審查 Declined-to-judge 13 項全數維持（spec 決策、使用者指示、已揭露 ruling、與原 Python 版一致之限制）— 理由同審查報告 — 無
Final: minor (deferred): #8 渲染器檔名推導標題中英混排大小寫、U+2028 分行與 Python 不同（外觀差異）
Final: minor (deferred): #9 install 已手動合併 CLAUDE.md 後仍重複提示 manual merge；*.test.mjs 會被複製到 ~/.claude/skills；--force 非原子
Final: minor (deferred): #10 validator 未檢查 boundary.md 的 High-Risk Topics 標題與 project-rules.md 的 驗證清單 標題
Task 8: complete (tests 28/28; install → 7 create; installed validate → OK; re-run dry-run → all unchanged)
Final: Ruling: 保留 .superpowers/sdd 工作區不刪、不跑 finishing-a-development-branch — 無 git，ledger 是唯一紀錄；無分支可整合 — 若不需要可手動刪除 .superpowers/
Task 9: pending (使用者手動觸發驗證)
Final: fixed #8 標題推導改 str.title 語意、分行加入 splitlines 全部邊界 — tests `title from filename ... (str.title parity)`、`unicode line separators split lines like str.splitlines` RED→GREEN, suite 35/35（使用者要求修延後 minor）
Final: fixed #9 install：CLAUDE.md 已含路由區塊視為 unchanged、*.test.mjs 不安裝、--force 改 staging + rename 交換 — tests `CLAUDE.md that already contains the routing block counts as unchanged`、`test files are not installed`、`failed copy during force keeps the old skill and leaves no temp folders` RED→GREEN, suite 35/35
Final: fixed #10 validator 檢查 boundary.md `## High-Risk Topics (recommend COMPLEX)` 與 project-rules.md `# 驗證清單` — tests `boundary.md must keep the High-Risk Topics heading`、`project-rules.md must keep the 驗證清單 heading` RED→GREEN, suite 35/35
Final: Ruling: 新驗證器規則抓到渲染器註解含 "Python " 被判為 codex residue，改寫註解而非放寬規則 — 維持殘留檢查嚴格 — 無
Final: reinstalled with --force (only game-workflow-html-review replaced; installed validate OK; dry-run all unchanged)
Change (2026-09-30, 使用者核准的小改動): 非 Cocos/Egret 的 TS 專案一律套整份 engines/cocos/typescript.md，任何寫 TS 時生效（global CLAUDE.md「TypeScript Default Rules」+ engines/README.md「No Engine Match」+ boundary SKILL.md 判斷第 3 步）
Change: validator 新增 validateGlobal（global CLAUDE.md 引用的 ~/.claude/skills 路徑必須存在）— test `global CLAUDE.md skill paths must exist` RED→GREEN, suite 36/36；install 前也會檢查
Change: 重新安裝 game-implementation-boundary（--force）；~/.claude/CLAUDE.md 先確認與舊版逐字相同（無使用者修改）後以新版覆蓋；已安裝副本驗證 OK、dry-run 全 unchanged
Change: 非引擎 TS 專案改為只套 cocos typescript.md 的 ## TypeScript Boundary 3 條（使用者指示）；suite 36/36；重新安裝 boundary + CLAUDE.md（覆蓋前確認與上一版逐字相同）
Change: Egret TS 規範補充（namespace only 不用 import；tsconfig strict + es2015.core + es2015.collection）— TS 2.4.2 實測 21 項；更新 egret typescript.md / project-rules.md、cocos Porting Notes、ts-version-comparison §3.5；suite 36/36；重新安裝 boundary（差異僅 3 個本次修改檔）
Change: Egret Map/Set 改為依專案 tsconfig.json 偵測（Collections / Iteration methods / for...of 三層；lib 名稱大小寫不敏感；extends 合併；非法 JSON 視同範本）— TS 2.4.2 實測 13 種 lib 組合；strict 亦改為偵測；suite 36/36；重新安裝 boundary
Change: 規則/skill 檔全面英文化（僅保留觸發關鍵字中文）：cocos/egret project-rules.md 翻譯、標題 驗證清單 → Verification Checklist；validator 新增 chinese text 檢查（僅 game-workflow/SKILL.md 例外）— tests RED→GREEN, suite 38/38；重新安裝 boundary
