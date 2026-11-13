# 06. 页面与子视图规格总注册表（Page Registry）

## 1. 页面分组划分标准

本目录按**信息架构功能空间**（IA Functional Space）划分为 6 个子目录（4 个一级导航空间 + 2 个跨空间共享核心层）。每个子目录内，**宿主主页面**与**高复杂度专属子抽屉/子视图**拆分为平级独立文档，全部严格遵循元规范 [03-authoring-templates.md 第 2.6 节](../../meta/03-authoring-templates.md#tpl-page) 定义的**固定五段式陈述结构**。

---

## 2. 全量页面与子视图注册总表（共 11 份规格书）

| 页面 ID | 名称 | 所属功能空间目录 | 视图载体形态 | 访问权限 | 配套单页多状态画板原型 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [PAGE-COMM-01](./common-and-onboarding/onboarding-wizard.md#page-comm-01) | 首次 5 步偏好引导向导 | `common-and-onboarding/` | 全屏向导 / 居中模态窗 | 游客与登录皆可 | [common-onboarding.html](../08-verification/prototypes/pages/common-onboarding.html) |
| [PAGE-COMM-02](./common-and-onboarding/auth-modal.md#page-comm-02) | 快捷注册登录认证弹窗 | `common-and-onboarding/` | 底部抽屉 / 居中模态窗 | 未登录时唤起 | [common-onboarding.html](../08-verification/prototypes/pages/common-onboarding.html) |
| [PAGE-PLAN-01](./daily-plan/daily-meal-plan.md#page-plan-01) | 今日菜谱推荐主页 | `daily-plan/` | 一级导航主页（Tab 1） | 游客可读（默认兜底） | [daily-plan.html](../08-verification/prototypes/pages/daily-plan.html) |
| [PAGE-PLAN-02](./daily-plan/ingredient-summary-drawer.md#page-plan-02) | 今日食材汇总核对抽屉 | `daily-plan/` | 底部抽屉 / 右侧滑出抽屉 | 游客与登录皆可 | [daily-plan.html](../08-verification/prototypes/pages/daily-plan.html) |
| [PAGE-SRCH-01](./recipe-discovery/recipe-search.md#page-srch-01) | 找菜谱检索主页 | `recipe-discovery/` | 一级导航主页（Tab 2） | 游客可读 | [recipe-discovery.html](../08-verification/prototypes/pages/recipe-discovery.html) |
| [PAGE-SRCH-02](./recipe-discovery/complex-filter-panel.md#page-srch-02) | 多维复合筛选面板/侧栏 | `recipe-discovery/` | 抽屉（移动/平板）/ 左侧常驻栏（Web） | 游客可用（收藏开关拦截） | [recipe-discovery.html](../08-verification/prototypes/pages/recipe-discovery.html) |
| [PAGE-FAV-01](./favorites/favorites-list.md#page-fav-01) | 我的收藏夹主页 | `favorites/` | 一级导航主页（Tab 3） | 游客展示引导页 / 登录可操作 | [favorites.html](../08-verification/prototypes/pages/favorites.html) |
| [PAGE-COOK-01](./recipe-consumption/recipe-detail.md#page-cook-01) | 多媒体菜谱详情页 | `recipe-consumption/` | 二级核心消费页 | 游客可读（收藏按钮拦截） | [recipe-consumption.html](../08-verification/prototypes/pages/recipe-consumption.html) |
| [PAGE-COOK-02](./recipe-consumption/cooking-focus-mode.md#page-cook-02) | 全屏分步跟做视图 | `recipe-consumption/` | 全屏深色高对比覆盖层 | 游客与登录皆可 | [recipe-consumption.html](../08-verification/prototypes/pages/recipe-consumption.html) |
| [PAGE-PROF-01](./user-profile/profile-home.md#page-prof-01) | 我的个人中心主页 | `user-profile/` | 一级导航主页（Tab 4） | 游客可读引导态 | [user-profile.html](../08-verification/prototypes/pages/user-profile.html) |
| [PAGE-PROF-02](./user-profile/dietary-archive-editor.md#page-prof-02) | 我的饮食档案编辑页 | `user-profile/` | 二级单页分组表单 | 游客存草稿 / 登录存云端 | [user-profile.html](../08-verification/prototypes/pages/user-profile.html) |
