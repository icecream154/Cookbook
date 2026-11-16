# 05. 公共业务组件与全局交互契约总索引

## 1. 公共层准入标准与分包说明

凡在 **`>= 2` 个独立页面/功能空间**中重复出现的复合业务设计资产，一律提升至本目录统一建模，并按“**看得见的复合 UI 零件**”与“**看不见的跨页交互状态机**”正交拆分为两份规格文档：
- **有形复用组件（[shared-components.md](./shared-components.md)）**：遵循元规范 [03-authoring-templates.md 第 2.5.1 节](../../meta/03-authoring-templates.md#tpl-comp-shared) 的四段式契约（视觉解剖、输入属性表、场景变体矩阵表、内部状态与事件透出表）。
- **无形交互契约（[interaction-patterns.md](./interaction-patterns.md)）**：遵循元规范 [03-authoring-templates.md 第 2.5.2 节](../../meta/03-authoring-templates.md#tpl-pat-doc) 的四段式契约（适用范围、Mermaid 状态机、时序参数表、并发冲突与中断边界表）。

> 下游 `06-pages/` 各单页规格书严守“**三不抄铁律**”，仅声明挂载变体编码并附一句话语义微摘要，**严禁在单页文档中重复抄写组件内部字段构成或登录拦截/撤销提示逻辑**。

---

## 2. 全量公共组件与交互模式注册导航表（支持一键跳转宿主页面）

| 资产 ID | 资产类型与标准名称 | 核心职责与变体概览 | 下游挂载宿主页面（点击直达） |
| :--- | :--- | :--- | :--- |
| [COMP-RecipeCard](./shared-components.md#comp-recipecard) | **有形组件** · 跨页菜谱摘要卡片 | 承载封面角色角标、量化指标、独立红心热区及推荐（`meal_plan`）/ 检索（`search_hit`）/ 收藏（`favorite_item`）3 套变体 | [PAGE-PLAN-01 今日菜谱](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-SRCH-01 找菜谱](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-FAV-01 收藏夹](../06-pages/favorites/favorites-list.md#page-fav-01) |
| [COMP-ServingsStepper](./shared-components.md#comp-servingsstepper) | **有形组件** · 目标人数步进控件 | 限定 `1 ~ 8` 整数步进与边界置灰，提供详情表头（`detail_header`）/ 手机底栏（`mobile_bar`）/ 向导微调（`onboarding_custom`）3 套变体 | [PAGE-COOK-01 菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-COMM-01 偏好引导向导](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01) |
| [COMP-SearchBar](./shared-components.md#comp-searchbar) | **有形组件** · 多态同义联想搜索框 | 支持空值热词下拉、`250ms` 防抖清空与标准食材同义词联想（全库检索 `discovery_full` / 收藏快筛 `favorites_local` 2 套变体） | [PAGE-SRCH-01 找菜谱主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-FAV-01 收藏夹主页](../06-pages/favorites/favorites-list.md#page-fav-01) |
| [PAT-AuthResume](./interaction-patterns.md#pat-authresume) | **交互契约** · 受限操作拦截与自动接续 | 游客触发强账号动作时挂起意图（`pendingAction`），完成认证与档案裁决后原位自动替用户完成原动作 | [PAGE-PLAN-01 今日菜谱](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-SRCH-01 找菜谱](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-SRCH-02 复合筛选](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02)、[PAGE-COOK-01 详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-PROF-01 个人中心](../06-pages/user-profile/profile-home.md#page-prof-01) |
| [PAT-UndoSnackbar](./interaction-patterns.md#pat-undosnackbar) | **交互契约** · 破坏性移除 4 秒撤销保护 | 免二次确认弹窗立即折叠隐藏移除项，底部悬浮 `4000ms` 黑底撤销胶囊支持原序号位无损恢复 | [PAGE-FAV-01 我的收藏夹](../06-pages/favorites/favorites-list.md#page-fav-01) |
| [PAT-ViewStates](./interaction-patterns.md#pat-viewstates) | **交互契约** · 全局视图异常与反馈四态 | 统一规定脉冲骨架加载态（耗时 `>200ms` 显现）、双要素空状态引导、媒体/弱网局部降级与瞬态轻提示规范 | 全站 [11 个注册视图](../06-pages/_index.md) |
