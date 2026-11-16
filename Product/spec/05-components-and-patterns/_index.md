# 05. 公共业务组件与全局交互契约总索引

## 1. 公共层准入标准与分包说明

凡在 **`>= 2` 个独立页面/功能空间**中重复出现的复合业务设计资产，一律提升至本目录统一建模，并按“**看得见的复合 UI 零件**”与“**看不见的跨页交互状态机**”正交拆分为两份规格文档：
- **有形复用组件（[shared-components.md](./shared-components.md)）**：遵循元规范 [03-authoring-templates.md 第 2.5.1 节](../../meta/03-authoring-templates.md#tpl-comp-shared) 的四段式契约（视觉解剖、输入属性表、场景变体矩阵表、内部状态与事件透出表）。
- **无形交互契约（[interaction-patterns.md](./interaction-patterns.md)）**：遵循元规范 [03-authoring-templates.md 第 2.5.2 节](../../meta/03-authoring-templates.md#tpl-pat-doc) 的四段式契约（适用范围、Mermaid 状态机、时序参数表、并发冲突与中断边界表）。

> 下游 `06-pages/` 各单页规格书严守“**三不抄铁律**”，仅声明挂载变体编码并绑定页面级事件，**严禁在单页文档中重复抄写组件内部字段构成或登录拦截/撤销提示逻辑**。

---

## 2. 全量公共组件与交互模式注册导航表

| 资产 ID | 资产类型与标准名称 | 核心职责与变体概览 | 下游挂载宿主页面（`PAGE-*`） |
| :--- | :--- | :--- | :--- |
| [COMP-RecipeCard](./shared-components.md#comp-recipecard) | **有形组件** · 菜谱摘要卡片 | 承载封面角色角标、量化指标、独立红心热区及 `meal_plan` / `search_hit` / `favorite_item` 3 套变体 | `PAGE-PLAN-01`、`PAGE-SRCH-01`、`PAGE-FAV-01` |
| [COMP-ServingsStepper](./shared-components.md#comp-servingsstepper) | **有形组件** · 目标人数调节器 | 限定 `[1, 8]` 整数步进与边界禁用，提供 `detail_header` / `mobile_bottom` / `onboarding_custom` 3 套变体 | `PAGE-COOK-01`、`PAGE-COMM-01` |
| [COMP-SearchBar](./shared-components.md#comp-searchbar) | **有形组件** · 多态搜索输入框 | 支持空值热词下拉、防抖清空与标准食材同义词联想（`discovery_full` / `favorites_local` 2 套变体） | `PAGE-SRCH-01`、`PAGE-FAV-01` |
| [PAT-AuthResume](./interaction-patterns.md#pat-authresume) | **交互契约** · 受限操作拦截与自动接续 | 游客触发强账号动作时挂起 `pendingAction`，完成认证与档案裁决后原位自动替用户完成原动作 | `PAGE-PLAN-01`、`PAGE-SRCH-01`/`02`、`PAGE-FAV-01`、`PAGE-COOK-01`、`PAGE-PROF-01` |
| [PAT-UndoSnackbar](./interaction-patterns.md#pat-undosnackbar) | **交互契约** · 破坏性移除 4 秒撤销保护 | 免二次确认弹窗立即隐藏移除项，底部悬浮 `4000ms` 黑底撤销胶囊支持原位无损恢复 | `PAGE-FAV-01` |
| [PAT-ViewStates](./interaction-patterns.md#pat-viewstates) | **交互契约** · 全局视图异常与反馈四态 | 统一规定脉冲骨架加载态（`>200ms` 显现）、双要素空状态引导、媒体/弱网局部降级与瞬态 Toast 规范 | 全站 `11` 个 `PAGE-*` 视图 |
