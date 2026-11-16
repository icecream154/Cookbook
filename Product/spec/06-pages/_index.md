# 06. 页面与子视图规格总注册表（Page Registry）

## 1. 功能空间分包标准与三不抄铁律

本目录按 [04-1 全局信息架构与多端容器壳](../04-ia-and-flows/ia-and-shell.md) 确立的 **6 大信息架构功能空间**（4 个 L1 一级常驻导航空间 + 2 个跨空间共享核心层）建立子目录。同一功能空间内，**宿主主页面**与**高复杂度附属抽屉/面板/全屏专注子视图**平级拆分为独立文档。

全量 11 份文档严格遵循元规范 [03-authoring-templates.md 第 2.6 节](../../meta/03-authoring-templates.md#tpl-page) 的**固定五段式陈述结构**，严守“**三不抄铁律 + 自解释伴随引用法则**”（枚举不抄全集表但附 2~3 个代表项速查、规则不抄公式但点明核心判据、公共组件不重画内部结构但注明变体职责），第 4 节页面状态编码与 `08` 画板顶栏状态切换按钮 **1:1 同名咬合**。

---

## 2. 全量页面与子视图注册导航总表（共 11 份规格书）

| 页面 ID | 标准名称 | 所属功能空间目录 | 拓扑层级与挂载骨架 | 访问权限与游客策略 | 关联可交互状态画板 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [PAGE-COMM-01](./common-and-onboarding/onboarding-wizard.md#page-comm-01) | 首次 5 步偏好引导向导 | `common-and-onboarding/` | `G` 全局向导层（全屏卡 / `560px` 模态框） | 游客（写本地草稿）与登录（写云端）皆可 | [common-onboarding.html](../08-verification/prototypes/pages/common-onboarding.html) |
| [PAGE-COMM-02](./common-and-onboarding/auth-modal.md#page-comm-02) | 快捷注册登录与冲突裁决弹窗 | `common-and-onboarding/` | `G` 全局认证中断层（`Z60` 抽屉 / `420px` 模态框） | 仅未登录态唤起 | [common-onboarding.html](../08-verification/prototypes/pages/common-onboarding.html) |
| [PAGE-PLAN-01](./daily-plan/daily-meal-plan.md#page-plan-01) | 今日菜谱推荐主页 | `daily-plan/` | `L1` Tab 1 默认首屏 · [Mode-CardGrid 多列网格骨架](../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 游客可读（未建档展示 2 人时令兜底推荐） | [daily-plan.html](../08-verification/prototypes/pages/daily-plan.html) |
| [PAGE-PLAN-02](./daily-plan/ingredient-summary-drawer.md#page-plan-02) | 今日食材汇总核对抽屉 | `daily-plan/` | `L2` 附属对照抽屉（`Z50` 半屏抽屉 / `420px` 右侧栏） | 游客与登录皆可核对复制 | [daily-plan.html](../08-verification/prototypes/pages/daily-plan.html) |
| [PAGE-SRCH-01](./recipe-discovery/recipe-search.md#page-srch-01) | 找菜谱检索主页 | `recipe-discovery/` | `L1` Tab 2 检索空间 · [Mode-FilterWorkspace 复合过滤工作台](../04-ia-and-flows/ia-and-shell.md#mode-filterworkspace) | 游客可读可搜（仅“仅看收藏”触发拦截） | [recipe-discovery.html](../08-verification/prototypes/pages/recipe-discovery.html) |
| [PAGE-SRCH-02](./recipe-discovery/complex-filter-panel.md#page-srch-02) | 多维复合筛选面板 / 常驻栏 | `recipe-discovery/` | `L2` 复合过滤容器（抽屉 `380px` / 桌面内嵌 `280px`） | 游客可用（内部“仅看收藏”受拦截保护） | [recipe-discovery.html](../08-verification/prototypes/pages/recipe-discovery.html) |
| [PAGE-FAV-01](./favorites/favorites-list.md#page-fav-01) | 我的收藏夹主页 | `favorites/` | `L1` Tab 3 收藏空间 · [Mode-CardGrid 多列网格骨架](../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 游客允许切入展示引导空态；登录可读写 | [favorites.html](../08-verification/prototypes/pages/favorites.html) |
| [PAGE-COOK-01](./recipe-consumption/recipe-detail.md#page-cook-01) | 多媒体菜谱详情页 | `recipe-consumption/` | `L2` 跨空间消费页 · [Mode-SplitDetail 主副双栏骨架](../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 游客可读可换算（仅点击收藏受拦截保护） | [recipe-consumption.html](../08-verification/prototypes/pages/recipe-consumption.html) |
| [PAGE-COOK-02](./recipe-consumption/cooking-focus-mode.md#page-cook-02) | 全屏大字分步跟做视图 | `recipe-consumption/` | `L3` 全屏沉浸专注层 · [Mode-FocusedForm 专注大卡骨架](../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | 游客与登录皆可全程跟做 | [recipe-consumption.html](../08-verification/prototypes/pages/recipe-consumption.html) |
| [PAGE-PROF-01](./user-profile/profile-home.md#page-prof-01) | 我的个人中心主页 | `user-profile/` | `L1` Tab 4 个人空间 · [Mode-SplitDetail 主副双栏骨架](../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 游客可读本地草稿摘要与足迹 | [user-profile.html](../08-verification/prototypes/pages/user-profile.html) |
| [PAGE-PROF-02](./user-profile/dietary-archive-editor.md#page-prof-02) | 我的饮食档案单页编辑页 | `user-profile/` | `L2` 二级分组表单页 · [Mode-FocusedForm 限宽表单骨架](../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | 游客保存至本地草稿；登录保存至云端 | [user-profile.html](../08-verification/prototypes/pages/user-profile.html) |
