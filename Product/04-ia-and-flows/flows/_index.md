# 04-2. 用户价值旅程流程总索引与跨页状态同步矩阵

## 1. 流程分类标准（Journey Stage Partitioning）

本目录按**用户完成端到端价值闭环的旅程阶段**划分为 4 份流程文档，所有流程图节点严格标注所属 `[PAGE-*]`，所有判断分支严格指向 `[RULE-*]` 或 `[PAT-*]`：

| 流程文件 | 旅程阶段 | 包含流程条目 | 关联跨页微原型 |
| :--- | :--- | :--- | :--- |
| [auth-and-onboarding.md](./auth-and-onboarding.md) | **冷启动建档与身份转化阶段** | [FLOW-AUTH-01](./auth-and-onboarding.md#flow-auth-01) 渐进式引导建档流<br>[FLOW-AUTH-02](./auth-and-onboarding.md#flow-auth-02) 受限操作登录接续与档案合并流 | [flow-auth-and-merge.html](../../08-verification/prototypes/flows/flow-auth-and-merge.html) |
| [meal-planning.md](./meal-planning.md) | **日常三餐规划与买菜核对阶段** | [FLOW-PLAN-01](./meal-planning.md#flow-plan-01) 三餐生成、换菜与食材合并流<br>[FLOW-PLAN-02](./meal-planning.md#flow-plan-02) 档案修改跨页温和重算流 | [flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html) |
| [search-and-collection.md](./search-and-collection.md) | **探索检索与收藏沉淀阶段** | [FLOW-DISC-01](./search-and-collection.md#flow-disc-01) 多维复合检索与零结果放宽流<br>[FLOW-DISC-02](./search-and-collection.md#flow-disc-02) 菜谱收藏与 4 秒撤销保护流 | —（页内画板覆盖） |
| [detail-and-cooking.md](./detail-and-cooking.md) | **菜谱消费与实操跟做阶段** | [FLOW-COOK-01](./detail-and-cooking.md#flow-cook-01) 详情多媒体联动与分量换算流<br>[FLOW-COOK-02](./detail-and-cooking.md#flow-cook-02) 全屏分步跟做与跨步计时流 | —（页内画板覆盖） |

---

## 2. 全局跨页面状态同步总矩阵（Cross-Page State Sync Matrix）

| 源页面与用户触发动作 | 变更的底层状态源（`DOM-*`） | 受影响的目标页面 | 目标页面的响应时机与表现契约 |
| :--- | :--- | :--- | :--- |
| 在 [PAGE-PROF-02](../../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 修改并保存饮食档案 | `DOM-USR-DietaryProfile.updated_at` | [PAGE-PLAN-01 今日菜谱](../../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 切回首页时按 [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03) 弹出顶部温和确认条，**不静默覆盖**已生成的当日菜单 |
| 在 [PAGE-PROF-02](../../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 新增或删减忌口标签 | `DOM-USR-DietaryProfile.avoid_tags` | [PAGE-SRCH-01](../../06-pages/recipe-discovery/recipe-search.md#page-srch-01) / [PAGE-COOK-01](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 实时生效：按 [RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03) 更新忌口预警角标及复合筛选面板内的忌口排除摘要 |
| 在任意卡片或 [PAGE-COOK-01](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 点亮/取消收藏 | `DOM-PLN-FavoriteRecord` | [PAGE-FAV-01](../../06-pages/favorites/favorites-list.md#page-fav-01) 及所有含 [COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard) 的列表 | 全局共享同一收藏状态源，返回上级列表时红心状态与收藏计数即时同步一致 |
| 在 [PAGE-COOK-01](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 用步进器调整目标人数 | 仅变更详情会话局部 `target_servings` | [PAGE-COOK-02 跟做视图](../../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02)（正向传递）；**不影响** `PAGE-PROF-01` | 按 [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) 同步带入本次跟做视图，但绝不篡改用户日常全局饮食档案人数 |
| 在 [PAGE-COMM-02](../../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) 完成登录认证 | `DOM-USR-Account` + `DOM-USR-DietaryProfile` | 唤起登录弹窗的原宿主页面 | 按 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 关闭弹窗后原位自动执行挂起动作（如点亮红心或激活仅看收藏过滤） |
