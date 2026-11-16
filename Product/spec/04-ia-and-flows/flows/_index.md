# 04-2. 用户价值旅程流程总索引与跨页状态同步矩阵

本文档遵循元规范 [03-authoring-templates.md 第 2.4.2 节](../../../meta/03-authoring-templates.md#tpl-flows-doc)，按用户核心价值阶段索引全站 **8 条端到端跨页流程（`FLOW-*`）**，并集中声明跨页面数据变更的同步传播契约。

---

## 1. 流程分类标准（Journey Stage Partitioning）

本目录按**用户完成端到端下厨价值闭环的旅程阶段**划分为 4 份流程文档；每条流程均严格标注前置条件、关联页面节点、判定规则依据、中断回退及跨页缓存同步影响：

| 流程文件 | 旅程阶段 | 包含流程条目（点击直达） | 关联跨页微原型 |
| :--- | :--- | :--- | :--- |
| [auth-and-onboarding.md](./auth-and-onboarding.md) | **阶段一：冷启动建档与身份转化** | • [FLOW-AUTH-01 新用户冷启动渐进式建档流](./auth-and-onboarding.md#flow-auth-01)<br>• [FLOW-AUTH-02 受限操作登录接续与档案合并流](./auth-and-onboarding.md#flow-auth-02) | [flow-auth-and-merge.html](../../08-verification/prototypes/flows/flow-auth-and-merge.html) |
| [meal-planning.md](./meal-planning.md) | **阶段二：日常三餐规划与买菜核对** | • [FLOW-PLAN-01 今日三餐生成、换菜与食材合并流](./meal-planning.md#flow-plan-01)<br>• [FLOW-PLAN-02 档案修改后的跨页温和重算闭环流](./meal-planning.md#flow-plan-02) | [flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html) |
| [search-and-collection.md](./search-and-collection.md) | **阶段三：探索检索与收藏沉淀** | • [FLOW-DISC-01 多维复合检索与零结果放宽兜底流](./search-and-collection.md#flow-disc-01)<br>• [FLOW-DISC-02 轻量单层收藏与 4 秒误触撤销保护流](./search-and-collection.md#flow-disc-02) | —（页内状态画板覆盖） |
| [detail-and-cooking.md](./detail-and-cooking.md) | **阶段四：菜谱消费与实操跟做** | • [FLOW-COOK-01 详情多媒体联动与动态分量换算流](./detail-and-cooking.md#flow-cook-01)<br>• [FLOW-COOK-02 全屏分步跟做与跨步悬浮计时完播流](./detail-and-cooking.md#flow-cook-02) | —（页内状态画板覆盖） |

---

## 2. 全局跨页面状态同步总矩阵（Cross-Page State Sync Matrix）

| 源页面与用户触发动作 | 变更底层状态源（附中文字段名） | 受影响目标页面 | 响应时机与界面展示同步契约 |
| :--- | :--- | :--- | :--- |
| 在 [PAGE-PROF-02 饮食档案编辑页](../../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 修改并保存偏好（或老账号登录在 [PAGE-COMM-02 快捷认证弹窗](../../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) 选择恢复云端旧档案） | [DOM-USR-DietaryProfile 个人饮食档案](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 的最近修改时间（`updated_at`） | [PAGE-PLAN-01 今日菜谱主页](../../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-PROF-01 个人中心主页](../../06-pages/user-profile/profile-home.md#page-prof-01) | 个人中心五维摘要即时刷新；切回已生成菜单的今日菜谱页时，按 [RULE-SYNC-03 当日菜单温和刷新保护](../../03-business-rules/identity-and-sync.md#rule-sync-03) 展示顶部蓝色确认横幅（`S4_ProfileDirty`），**严禁静默覆盖**用户当日已浏览或买好菜的菜单 |
| 在 [PAGE-PLAN-01 今日菜谱主页](../../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) 执行单菜/整餐换一换或切换快捷人数重算 | [DOM-PLN-DailyMealPlan 每日三餐单](../../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan) 的三餐槽位与生效人数（`applied_servings`） | [PAGE-PLAN-02 今日食材汇总抽屉](../../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) | 下次唤起汇总抽屉时，按最新菜品与生效人数实时重新调用 [RULE-PLAN-05 跨菜谱同类食材合并](../../03-business-rules/meal-recommendation.md#rule-plan-05) 求和；当日已打勾的同名标准食材保留已备齐勾选态（`is_checked`） |
| 在 [PAGE-PROF-02 饮食档案编辑页](../../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 新增或删减忌口标签/食材 | [DOM-USR-DietaryProfile 个人饮食档案](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 的忌口大类（`avoid_tags`）与自定义忌口（`avoid_ingredient_ids`） | [PAGE-SRCH-01 找菜谱主页](../../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-SRCH-02 复合筛选面板](../../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02)、[PAGE-COOK-01 菜谱详情页](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 实时生效：按 [RULE-SRCH-03 主动检索忌口温和预警](../../03-business-rules/search-and-matching.md#rule-srch-03) 立即同步搜索卡片与详情食材行的 `⚠️ 含忌口` 预警标，并刷新筛选面板内的忌口排除摘要 |
| 在任意 [COMP-RecipeCard 菜谱卡片](../../05-components-and-patterns/shared-components.md#comp-recipecard) 或 [PAGE-COOK-01 菜谱详情页](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 点亮/取消收藏 | [DOM-PLN-FavoriteRecord 菜谱收藏记录](../../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord) | [PAGE-FAV-01 我的收藏夹](../../06-pages/favorites/favorites-list.md#page-fav-01) 及全站所有保活列表页（今日菜谱 / 找菜谱） | 全站共享单一收藏状态源；从详情页返回上级列表或切入收藏夹时，对应菜谱红心图标与收藏总数立即同步，无需手动下拉刷新 |
| 在 [PAGE-COOK-01 菜谱详情页](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 通过步进器调整目标用餐人数 | 仅变更详情会话局部目标人数（`target_servings`） | 正向透传至 [PAGE-COOK-02 全屏跟做视图](../../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02)；**隔离保护**个人中心与今日菜谱 | 按 [RULE-COOK-01 目标人数继承与隔离规则](../../03-business-rules/portion-and-cooking.md#rule-cook-01) 同步折算跟做视图备料卡与步骤克数，但**绝不回写篡改**用户全局日常期望人数（`household_size`） |
| 在 [PAGE-COMM-02 快捷认证弹窗](../../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) 完成快捷认证与冲突裁决 | [DOM-USR-Account 用户账号](../../02-domain-model/user-profile/entities.md#dom-usr-account) + [DOM-USR-DietaryProfile 个人饮食档案](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) | 触发拦截的原宿主页面（如详情页、复合筛选、收藏夹、个人中心） | 按 [PAT-AuthResume 未登录拦截并自动接续](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 原位关闭 `Z60` 弹窗（若下方有 `Z50` 筛选抽屉则保持展开），自动执行挂起动作并同步切换个人中心为云端已同步态 |
