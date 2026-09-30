# Egret 專案規範

# 專案概述

本專案使用：

* Egret 5.4.1
* TypeScript 2.4.2（引擎內建編譯器，target ES5）
* 顯示列表（DisplayObject）+ eui 架構
* 可重用動畫系統（DragonBones / Tween / MovieClip）

本專案重視：

* 可擴充性
* Lifecycle 安全性
* Async 安全性
* 效能穩定
* 系統可重用性
* 降低回歸風險

---

# 架構規範

## 基本原則

* 優先使用 組合Composition或是Dependency Injection，而非過度繼承
* 使用DI時，禁止實例直接注入!須採介面注入!
* 遵循 OOP SOLID 概念
* 避免不必要的抽象化
* 系統需保持模組化與可擴充
* 除非明確要求，不主動改動既有架構
* 減少隱性依賴
* 避免系統間高度耦合

## Public API 規範

* 不可破壞既有 Public API
* 不可隨意重新命名公開方法
* 優先保持向下相容

## 系統設計

* 系統需考慮未來擴充性
* 避免將遊戲特例硬編碼進通用系統
* 狀態切換必須明確且可追蹤

---

# Typescript 規範

* 詳見 `typescript.md`（TS 2.4.2 語法與 ES5 lib 限制）
* 模組寫法：僅使用 namespace,不要用 import / export（含 `import x = require()`、`import 別名 = 命名空間`、`export =`）；跨 namespace 一律寫完整名稱
* 寫 TS 前先讀專案根目錄 tsconfig.json 偵測,不可假設 Map / Set 能用（判斷表見 `typescript.md`）：
  * lib 含 `es2015.collection`（或 es2015 / es6 / es2016 / es7 / es2017 / esnext）→ 可用 Map / Set 的建構、get / set / add / has / delete / size / forEach
  * 再含 `es2015.iterable`（或上述總括 lib）→ 才可用 keys() / values() / entries()、Array.from(set)
  * 再開 `downlevelIteration: true` → 才可用 for...of 走訪 Map / Set
  * 都沒有、沒有 lib、或 tsconfig 不是合法 JSON → 不可用 Map / Set,改用物件 `{ [key: string]: T }` 與陣列
* strict：`strict: true`（或個別開 noImplicitAny / strictNullChecks / noImplicitThis）時,參數必須標型別；null / undefined 要寫進型別；map.get() 回傳 `T | undefined`,使用前要先判斷
* 宣告一個set變數時不能是包含map
* 宣告一個map變數時存取物不能是set
* 禁止使用匿名函示,請宣告成變數指向Lambda function（Egret 另一原因：removeEventListener 需同一函式參考才能移除）

# Egret 規範

## engine Lifecycle 限制

* 不要在 constructor 做初始化或是賦予值的行為（欄位預設值除外）
* 初始賦值使用public init方法呼叫,可由外部流程呼叫
* 要做 _inited flag控制避免重複操作init
* eui.Component 在 childrenCreated 內呼叫public init即可；非 eui 物件在第一次 ADDED_TO_STAGE 時呼叫
* 如遇到需要某子物件完成建立後才進行後續操作,可考慮 childrenCreated / partAdded（注意：constructor 內設定 skinName 時 partAdded 會在建構期間就觸發；partRemoved 只在換皮時觸發,不可放清理邏輯）,
  或是設計成promise async/await驅動
* Egret 顯示物件沒有 destroy，removeChild 不會釋放任何東西；相關清理請設計外部可呼叫的public destroy 方法來主動手動移除相關物件
* REMOVED_FROM_STAGE 每次換父節點都會觸發,不可在此做不可逆的清理（除非專案約定該物件不會再被加回）

## 顯示物件存取

* 避免在 ENTER_FRAME / startTick 中使用 getChildByName 或遞迴搜尋
* 常用顯示物件需快取；eui 優先使用 skin part（EXML id）
* 避免遊戲進行中大量深層顯示列表 traversal

## Shader（CustomFilter）規範

* 不得憑記憶直接寫出 Egret 預設 shader 的 attribute / varying / uniform 名稱,需先讀引擎原始碼
* 不得把其他引擎（含 Cocos）、其他 Egret 版本、或不同渲染用途的 shader 結構直接套用
* 新增 shader 前，應先確認專案 Egret 版本與 renderMode（CustomFilter 僅支援 WebGL）
* 若找不到專案內可參考 shader，應先建立最小可編譯、可顯示的 pass-through 版本，確認通過後再加入自訂 uniform 與 fragment 邏輯
* 每次新增或更換 CustomFilter 後，需告知使用者這是高風險區，應先實機測試再繼續功能開發
* 效果超出原圖範圍（描邊、外發光）需設定 padding

## code Lifecycle 安全

* removeChild / removeChildren / 丟棄參考 前必須清除 listener（removeEventListener 需傳入相同 listener、thisObject 與 useCapture）
* removeChild / removeChildren / 丟棄參考 前必須清除 tween（egret.Tween.removeTweens 或 setPaused）
* removeChild / removeChildren / 丟棄參考 前必須清除 promise resolve
* removeChild / removeChildren / 丟棄參考 前必須清除 Timer / startTick / egret.setTimeout / ENTER_FRAME
* removeChild / removeChildren / 丟棄參考 前必須清除 reference
* DragonBones callback 使用後必須解除註冊
* 在 visible / 啟用狀態切換時需開啟或是關閉 事件監聽或是 touchEnabled / touchChildren

## Object Pool

* recycle 前必須完整 resetData,並先從父節點移除
* pool object 不可保留舊 reference
* 高頻流程避免 new / 丟棄顯示物件
* Egret 核心沒有內建顯示物件 pool,一律使用專案自製 pool
* eui.List 虛擬佈局會重用 ItemRenderer,dataChanged 必須完整重設畫面狀態

## Component 設計

* 類別職責需單一
* 避免 God Class / God Component
* 優先使用 controller/manager orchestration
* 不需顯示的邏輯不要繼承 DisplayObject / eui.Component,改用一般類別（對應 Cocos「最終不會呈現在 scene 上需考慮放棄使用 component」）

---

# Async 規範

## Promise 安全

* 禁止 unresolved promise
* Promise 流程需盡可能支援 cancellation
* 避免隱性 async state mutation

## Callback 安全

* callback 使用後必須解除註冊
* 防止重複 callback 註冊
* 防止 dangling async listener
* 禁止跨類別使用 callback 設計

## Timing 安全

需注意以下流程的 race condition：

* tween
* DragonBones / MovieClip animation
* async callback
* Timer / startTick / egret.setTimeout

---

# timer 規範

* 禁止使用 js原生的計時機制與相關方法（window.setTimeout / setInterval / requestAnimationFrame）,除非有必要,也需要進行討論
* 引擎計時器可用順序：egret.Timer → egret.startTick → egret.setTimeout（皆需有對應的 stop / stopTick / clearTimeout）
* 如需透過promise,做計時器相關的操作,一律改用tween驅動.且須提供cancel 方法

---

# tween 規範

* 如需外部呼叫停止的可控tween須將tween指給一個全域變數
* 需要獨立成一個方法來提供呼叫!禁止寫在其他邏輯的function內
* 有complete的需求(call) 就將tween的方法做成promise async/await
* egret.Tween.removeTweens(target) 會移除該 target 上所有 tween,同一 target 有多個 tween 時改用 setPaused 並清掉參考
* 不使用 Tween.get 的 override 參數,改為明確呼叫 removeTweens
* 相關Promise規範請閱讀## Promise 安全

---

# DragonBones 規範（對應 Cocos Spine 規範）

* DragonBones 事件（COMPLETE / LOOP_COMPLETE / FRAME_EVENT）必須解除註冊
* 避免 animation state 被互相覆蓋
* 防止 animation complete callback 重複觸發
* animation 被中斷時需正確 cleanup（被中斷的動畫不會觸發 COMPLETE,等待中的 promise 需由中斷方處理）
* 移除時呼叫 armature display 的 dispose 並清掉參考（API 以專案 libs/modules/dragonBones 的 d.ts 為準）

---

# Audio 規範

* Audio 播放需支援 cleanup（保存 SoundChannel,需要時 stop）
* 防止 unmanaged SoundChannel
* 避免 Sound / SoundChannel reference leak
* group/list playback 需完整 cleanup callback（含 SOUND_COMPLETE listener）

---

# 效能規範

## Draw Call

* 避免不必要 draw call（使用圖集 / sprite sheet,避免不同貼圖與文字交錯排列）
* 減少動態 eui 佈局重算
* 避免高成本 runtime mask 與 filter（矩形裁切優先使用 scrollRect）
* cacheAsBitmap 只用於靜態複雜容器

## Memory

* 避免 gameplay loop 中頻繁 allocation
* 高頻系統需重用 array/object
* 臨時物件優先使用 pooling
* 不再使用的資源依專案規則以 RES.destroyRes 釋放

## Update Loop

* 避免在 ENTER_FRAME / startTick 中執行重邏輯
* 優先 event-driven flow

---

# Minimal Change 原則

除非明確要求：

* 不可重寫整體架構
* 不可重構無關系統
* 不可增加不必要 design pattern
* 優先最小安全修改
* 不可重寫以定義好的底層演算法,除非有要求更動
---

# Debugging 流程

Debug 時必須：

1. 不可猜測
2. 建立 hypothesis
3. 收集 evidence
4. 縮小 root cause
5. 驗證後再修改
6. 修改後重新驗證

---

# 驗證清單

完成前必須確認：

* TypeScript compile 通過（egret build,TS 2.4.2,依專案 tsconfig 設定）
* 使用的 Map / Set / ES2015+ API 皆在偵測到的 lib 範圍內
* 無 import / export 語句
* 無 unresolved promise
* 無 dangling callback
* 無 tween leak
* 無 DragonBones callback leak
* 無 event listener leak
* 無 Timer / startTick / setTimeout leak
* 無 pool reference leak
* 無明顯 lifecycle 問題
* 無 public API regression

---

# 實作流程規範

實作功能時：

1. 先分析需求
2. 必要時提出 architecture 建議
3. 建立 implementation plan
4. 分階段實作
5. 每階段完成後驗證

避免一次性大規模重寫。

---

# 禁止行為

* 隱性 singleton dependency
* unmanaged async state
* runtime 顯示列表 traversal spam
* 未解除註冊 callback
* 無 cleanup 的 fire-and-forget async
* 大規模無關重構
* 過度工程化簡單問題
* 未經允許刪除舊代碼
