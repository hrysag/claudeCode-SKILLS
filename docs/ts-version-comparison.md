# Cocos 3.8.7 vs Egret 5.4.1 TypeScript 差異評估

> 日期：2026-09-30
> 方法：讀本機引擎原始碼、Creator 安裝檔、使用者 Cocos 專案設定，並用兩邊實際的編譯器跑語法探針（probe）。
> 標記：**實測** = 用該引擎實際使用的編譯器跑過；**讀檔** = 讀設定 / 原始碼得知；**推論** = 有間接證據但未直接驗證。

## 1. 編譯管線

| 項目 | Cocos 3.8.7 | Egret 5.4.1 | 來源 |
| --- | --- | --- | --- |
| 專案腳本如何轉成 JS | 編輯器用 Babel（`@babel/plugin-transform-typescript`）逐檔轉譯，只剝除型別、不做型別檢查 | 引擎 CLI 用內建 TypeScript 編譯器（`egret build`）整包編譯 | Cocos：`app.asar` 內含 `@cocos/creator-programming-babel-preset-cc`、`@babel/plugin-transform-typescript`（讀檔）；Egret：`tools/actions/Compiler.ts:3` import `../lib/typescript-plus/lib/typescript`（讀檔） |
| TypeScript 版本 | 型別檢查＝IDE 的 TS（專案 tsconfig `noEmit: true`，只給 IDE 用）；引擎自身開發用 TS 4.9.5；編輯器另附 TS 5.8.2 | **2.4.2**，固定內建，無法切換 | Cocos：`AudioTest/temp/tsconfig.cocos.json:24`、引擎 `package.json:72`、`app.asar.unpacked/node_modules/typescript` 5.8.2（讀檔）；Egret：`typescript-plus/package.json` 與 `ts.version`（實測） |
| `egretProperties.json` 的 `compilerVersion` | — | 是 **Egret 引擎版本**（選哪一版 CLI），不是 TS 版本 | `tools/project/ProjectData.ts:119`、`tools/actions/Create.ts:58`（讀檔） |
| 型別檢查時機 | 只在 IDE；編輯器編譯不擋型別錯誤（推論：Babel 不做型別檢查） | 每次 `egret build` 都做，型別錯誤會失敗 | 推論 / `Compiler.ts:125-126` logErrors（讀檔） |
| target | tsconfig `ES2015`（僅供 IDE）；實際輸出依建置平台（未查證） | `es5` | `tsconfig.cocos.json:4`；Egret 範本 `tools/templates/empty/tsconfig.json`（讀檔） |
| lib | 依 target，含 ES2015 集合型別 | `es5`、`dom`、`es2015.promise` | 同上 |
| 模組系統 | ES module（`import` / `export`），`isolatedModules: true` | 全域腳本 + `namespace`；CLI 會刪除 tsconfig 的 `module`、`noLib`、`rootDir`、`out` | `tsconfig.cocos.json:5,22`；`Compiler.ts:154-161`（讀檔） |
| 裝飾器 | `experimentalDecorators: true`（`@ccclass`、`@property`） | `experimentalDecorators: true` | 兩邊 tsconfig（讀檔） |
| strict | 預設 `true`，專案可覆寫（`AudioTest` 設 `false`） | 範本未開 | `AudioTest/tsconfig.json:7`（讀檔） |

## 2. 語法可用性

Cocos 欄以 Creator 3.8.7 內附的 `@babel/core` 7.19.6 + `@babel/plugin-transform-typescript` 7.14.6 實測（位於 `resources/3d/engine/node_modules`，是引擎建置用的 Babel；編輯器打包在 `app.asar` 內的版本無法直接讀取，視為代理驗證）。Egret 欄以引擎內建 TS 2.4.2、範本 tsconfig 設定實測。

| 語法 / API | Cocos 3.8.7 | Egret 5.4.1 | Egret 錯誤碼（實測） |
| --- | --- | --- | --- |
| `a?.b` | 可用 | ❌ | TS1109 |
| `a ?? b` | 可用 | ❌ | TS1109 |
| `unknown` | 可用 | ❌ | TS2304 |
| 條件型別 `T extends U ? X : Y` | 可用 | ❌ | TS1005 |
| `field!: T` | 可用（Babel 會移除未初始化欄位） | ❌ | TS1005 |
| `1_000` | 可用 | ❌ | TS1005 |
| 選用 tuple 元素 `[number, string?]` | 可用 | ❌ | TS2322 |
| `as const` | 可用 | ❌ | TS1110 |
| `readonly T[]` | 可用 | ❌ | TS2304 |
| `import type` | 可用 | ❌ | TS1005 |
| `#private` | 可用 | ❌ | TS1127 |
| `bigint` | 可用 | ❌ | TS2304 |
| `Map` / `Set` | 可用 | ❌（範本 lib 未宣告） | TS2304 |
| `Object.assign` | 可用 | ❌（範本 lib 未宣告） | TS2339 |
| `Array.prototype.includes` | 可用 | ❌（範本 lib 未宣告） | TS2339 |
| `async` / `await` | 可用 | ✅（需 `es2015.promise`） | — |
| `for...of` 陣列 | 可用 | ✅ | — |
| 字串 enum | 可用 | ✅ | — |
| `keyof` / mapped type / 泛型預設值 | 可用 | ✅ | — |

## 3. Cocos 專屬限制（Babel 逐檔轉譯造成）

以下在 Egret（tsc 整包編譯）沒問題，但在 Cocos 會失敗或產生壞掉的輸出（Babel 實測）：

| 語法 | Babel 結果 |
| --- | --- |
| `const enum` | 轉譯失敗：`'const' enums are not supported` |
| `export = x` | 轉譯失敗：`export =` is not supported |
| `import x = require('...')` | 轉譯失敗：`import =` is not supported |
| `declare f: number`（class 欄位） | 轉譯失敗：需 `allowDeclareFields` |
| `export { T } from './t'`（T 只是型別） | 轉譯成功但保留匯出 → 執行期找不到 `T`；型別要用 `export type { T }` |
| `x satisfies T`（TS 4.9） | 轉譯成功但 `satisfies` 原樣留在輸出 → 執行期語法錯誤 |
| `namespace`（含值） | 可轉譯，但跨檔宣告合併不可靠（推論：逐檔轉譯無法合併） |

## 3.5 Egret 專案 tsconfig 的 lib 偵測（2026-09-30 追加）

Map / Set 能否使用取決於專案 `tsconfig.json` 的 `lib`，skill 規則改為每次偵測（見 `engines/egret/typescript.md`）。TS 2.4.2 實測各 lib 組合：

| lib 設定 | `new Map` | `keys()` / `Array.from(set)` | `for...of` Map |
| --- | --- | --- | --- |
| 無 lib（預設） | ❌ | ❌ | ❌ |
| 範本 `es5, dom, es2015.promise` | ❌ | ❌ | ❌ |
| `+ es2015.collection` | ✅ | ❌ | ❌ |
| `es5, dom, es2015.iterable`（無 collection） | ❌ | ❌ | ❌ |
| `+ es2015.collection + es2015.iterable` | ✅ | ✅ | ❌ |
| `es2015` / `es6` / `es7` / `es2016` / `es2017` / `esnext` | ✅ | ✅ | ❌ |
| `es2015` + `downlevelIteration: true` | ✅ | ✅ | ✅ |
| `ES2015.Collection`（大小寫不同） | ✅ | ❌ | ❌ |

以 `strict` + `es5, dom, es2015.promise, es2015.core, es2015.collection` 這組設定的細項實測：

| 項目 | 結果 |
| --- | --- |
| `Map` / `Set` / `WeakMap` 建構與 get/set/add/has/forEach | 可用 |
| `map.keys()`、`for...of` Map、`Array.from(set)` | ❌ TS2339 / TS2495 / TS2345（缺 `es2015.iterable`） |
| `Object.assign`、`find`/`findIndex`、`startsWith`/`includes`（字串）、`Number.isInteger` | 可用 |
| `Symbol`、`Array.prototype.includes`、`Object.values`、`padStart` | ❌ |
| strict：隱含 any 參數、`null` 指給 `number`、隱含 `this` | ❌ TS7006 / TS2322 / TS2683 |
| strict：`map.get()` 直接當 `number` 用 | ❌ TS2322（回傳 `number \| undefined`） |
| strict：未初始化的 class 欄位 | 可編譯（2.4 無 `strictPropertyInitialization`） |

第 2 節表格中 Egret 欄的 `Map` / `Set` / `Object.assign` ❌ 指的是未加 lib 的範本設定；實際以專案 tsconfig 偵測結果為準。

## 4. 對 skill 的影響

- `engines/cocos/typescript.md`：補「Compiler Baseline」（Babel 逐檔轉譯、IDE 型別檢查、ES module）與第 3 節的禁用清單。
- `engines/egret/typescript.md`：語法表維持，已全數實測通過；補「Porting Notes」（Egret → Cocos 要改的地方）。
- 雙向移植程式碼時：Cocos → Egret 主要是語法降級與 lib 缺漏；Egret → Cocos 主要是模組化（namespace → import/export）與引擎 API 對換（事件、tween、骨骼動畫，見兩邊 `boundary.md`）。
