# 03. 全局业务规则库总索引（Business Rules Registry）

## 1. 业务规则分类划分标准

因业务规则大量横跨多个静态领域实体，本目录**不按静态实体拆分，而按系统执行的核心业务决策能力簇（Business Capability）划分**为 4 份规则文档。全站所有终端与页面涉及判定、配餐、换算、过滤与同步逻辑时，必须唯一引用本目录规则，严禁在页面文档私自重写。

| 规则文件 | 能力簇名称 | ID 前缀 | 核心管辖决策 |
| :--- | :--- | :--- | :--- |
| [meal-recommendation.md](./meal-recommendation.md) | **智能配餐与换菜规则组** | `RULE-PLAN-*` | 硬过滤一票否决、按人数配餐矩阵、推荐命中标签、换一换互斥防重、跨菜谱食材合并 |
| [search-and-matching.md](./search-and-matching.md) | **复合检索与匹配规则组** | `RULE-SRCH-*` | 同义食材召回、多食材智能 vs 严格匹配、主动检索忌口提示、零结果阶梯放宽 |
| [portion-and-cooking.md](./portion-and-cooking.md) | **分量换算与下厨规则组** | `RULE-COOK-*` | 目标人数继承优先级、多量纲人性化取整公式、食材清单与步骤正文同步折算 |
| [identity-and-sync.md](./identity-and-sync.md) | **身份转化与数据同步组** | `RULE-SYNC-*` | 游客本地草稿与默认兜底、登录旧档案冲突裁决、档案变更对当日菜单的温和刷新保护 |

---

## 2. 全量业务规则注册索引表（共 15 条）

| 规则 ID | 规则标准名称 | 输入领域依赖 | 核心消费页面 / 流程 |
| :--- | :--- | :--- | :--- |
| [RULE-PLAN-01](./meal-recommendation.md#rule-plan-01) | 今日三餐硬过滤一票否决规则 | `DOM-USR-DietaryProfile`, `DOM-RCP-Recipe` | `PAGE-PLAN-01`, `FLOW-PLAN-01` |
| [RULE-PLAN-02](./meal-recommendation.md#rule-plan-02) | 按用餐人数餐次配餐结构矩阵 | `ENUM-USR-HouseholdSize`, `ENUM-RCP-DishRole` | `PAGE-PLAN-01`, `FLOW-PLAN-01` |
| [RULE-PLAN-03](./meal-recommendation.md#rule-plan-03) | 个性化推荐命中理由生成规则 | `DOM-USR-DietaryProfile`, `DOM-RCP-Recipe` | `COMP-RecipeCard`, `PAGE-PLAN-01` |
| [RULE-PLAN-04](./meal-recommendation.md#rule-plan-04) | 单菜与整餐“换一换”互斥防重规则 | `DOM-PLN-DailyMealPlan`, `DOM-RCP-Recipe` | `PAGE-PLAN-01`, `FLOW-PLAN-01` |
| [RULE-PLAN-05](./meal-recommendation.md#rule-plan-05) | 当日跨菜谱同类食材合并规则 | `DOM-PLN-IngredientSummaryItem`, `ENUM-RCP-ScaleMode` | `PAGE-PLAN-02`, `FLOW-PLAN-01` |
| [RULE-SRCH-01](./search-and-matching.md#rule-srch-01) | 关键词与标准食材同义词召回规则 | `DOM-RCP-StandardIngredient`, `DOM-RCP-Recipe` | `COMP-SearchBar`, `PAGE-SRCH-01` |
| [RULE-SRCH-02](./search-and-matching.md#rule-srch-02) | 多食材“智能匹配度 vs 严格全含”规则 | `ENUM-PLN-IngMatchMode`, `DOM-RCP-RecipeIngredient` | `PAGE-SRCH-01`, `PAGE-SRCH-02` |
| [RULE-SRCH-03](./search-and-matching.md#rule-srch-03) | 主动检索下个人忌口显隐与预警规则 | `DOM-USR-DietaryProfile`, `DOM-RCP-RecipeIngredient` | `PAGE-SRCH-01`, `PAGE-COOK-01` |
| [RULE-SRCH-04](./search-and-matching.md#rule-srch-04) | 复合筛选布尔组合与零结果阶梯放宽规则 | `DOM-RCP-Recipe`, `ENUM-PLN-SortOrder` | `PAGE-SRCH-01`, `PAGE-SRCH-02`, `FLOW-DISC-01` |
| [RULE-COOK-01](./portion-and-cooking.md#rule-cook-01) | 详情页目标人数初始值继承优先级规则 | `DOM-USR-DietaryProfile`, `DOM-RCP-Recipe` | `PAGE-COOK-01`, `FLOW-COOK-01` |
| [RULE-COOK-02](./portion-and-cooking.md#rule-cook-02) | 多量纲食材人性化取整换算规则 | `DOM-RCP-RecipeIngredient`, `ENUM-RCP-ScaleMode` | `PAGE-COOK-01`, `PAGE-COOK-02`, `PAGE-PLAN-02` |
| [RULE-COOK-03](./portion-and-cooking.md#rule-cook-03) | 食材表与步骤富文本动态数值同步规则 | `DOM-RCP-RecipeStep`, `DOM-RCP-RecipeIngredient` | `PAGE-COOK-01`, `PAGE-COOK-02` |
| [RULE-SYNC-01](./identity-and-sync.md#rule-sync-01) | 游客本地偏好草稿与默认兜底规则 | `DOM-USR-DietaryProfile` | `PAGE-COMM-01`, `PAGE-PLAN-01`, `FLOW-AUTH-01` |
| [RULE-SYNC-02](./identity-and-sync.md#rule-sync-02) | 登录时云端旧档案与本地草稿冲突裁决规则 | `DOM-USR-Account`, `DOM-USR-DietaryProfile` | `PAGE-COMM-02`, `FLOW-AUTH-02` |
| [RULE-SYNC-03](./identity-and-sync.md#rule-sync-03) | 饮食档案变更对当日菜单的温和刷新保护规则 | `DOM-USR-DietaryProfile`, `DOM-PLN-DailyMealPlan` | `PAGE-PROF-02`, `PAGE-PLAN-01`, `FLOW-PLAN-02` |
