# 02. 领域模型与数据字典总索引（Domain Model Index）

## 1. 子域划分标准（Bounded Context Partitioning）

本目录按**静态业务对象的数据所有权与生命周期内聚性**（限界上下文）划分为三大子域，每个子域内部严格拆分为 `terms.md`（领域术语）、`entities.md`（实体结构契约）与 `enums.md`（标准枚举字典）：

| 子域目录 | 子域名称 | ID 命名空间 | 核心聚合与职责范围 |
| :--- | :--- | :--- | :--- |
| [user-profile/](./user-profile/entities.md) | **用户与饮食画像域** | `*-USR-*` | 账号身份（`Account`）、多维个人饮食档案（`DietaryProfile`）及其偏好枚举体系 |
| [recipe-catalog/](./recipe-catalog/entities.md) | **菜谱与标准食材域** | `*-RCP-*` | 标准食材字典（`StandardIngredient`）、结构化菜谱聚合根（`Recipe`、食材项、图文步骤、双数据图表）及分类量纲枚举 |
| [meal-and-collection/](./meal-and-collection/entities.md) | **膳食规划与收藏域** | `*-PLN-*` | 每日三餐推荐方案（`DailyMealPlan`）、当日跨菜食材合并项（`IngredientSummaryItem`）、用户收藏记录（`FavoriteRecord`）及检索排序枚举 |

---

## 2. 全局跨子域实体关系总图（Context & ER Map）

```mermaid
erDiagram
    DOM_USR_Account ||--o| DOM_USR_DietaryProfile : "1:1 绑定云端饮食档案"
    DOM_USR_Account ||--o{ DOM_PLN_FavoriteRecord : "1:N 收藏沉淀"
    DOM_USR_DietaryProfile ||--o{ DOM_PLN_DailyMealPlan : "输入驱动配餐生成"
    DOM_USR_DietaryProfile }o--o{ DOM_RCP_StandardIngredient : "引用忌口过敏食材"

    DOM_RCP_Recipe ||--o{ DOM_RCP_RecipeIngredient : "1:N 组成结构化食材表"
    DOM_RCP_StandardIngredient ||--o{ DOM_RCP_RecipeIngredient : "1:N 标准同义映射"
    DOM_RCP_Recipe ||--o{ DOM_RCP_RecipeStep : "1:N 有序富文本步骤"
    DOM_RCP_Recipe ||--|| DOM_RCP_NutritionChart : "1:1 单人份营养构成图"
    DOM_RCP_Recipe ||--|| DOM_RCP_TimelineChart : "1:1 烹饪火候时间轴图"

    DOM_PLN_DailyMealPlan }o--o{ DOM_RCP_Recipe : "早/午/晚槽位装载"
    DOM_PLN_DailyMealPlan ||--o{ DOM_PLN_IngredientSummaryItem : "跨菜聚合折算"
    DOM_RCP_Recipe ||--o{ DOM_PLN_FavoriteRecord : "被用户收藏"
```

---

## 3. 全量领域条目注册导航表

### 3.1 用户与饮食画像域（`user-profile/`）
- **术语**：[TERM-USR-01 饮食画像](./user-profile/terms.md#term-usr-01) · [TERM-USR-02 本地偏好草稿](./user-profile/terms.md#term-usr-02) · [TERM-USR-03 硬性饮食约束](./user-profile/terms.md#term-usr-03)
- **实体**：[DOM-USR-Account](./user-profile/entities.md#dom-usr-account) · [DOM-USR-DietaryProfile](./user-profile/entities.md#dom-usr-dietaryprofile)
- **枚举**：[ENUM-USR-Purpose](./user-profile/enums.md#enum-usr-purpose) · [ENUM-USR-HouseholdSize](./user-profile/enums.md#enum-usr-householdsize) · [ENUM-USR-Flavor](./user-profile/enums.md#enum-usr-flavor) · [ENUM-USR-SkillLevel](./user-profile/enums.md#enum-usr-skilllevel) · [ENUM-USR-TimeBudget](./user-profile/enums.md#enum-usr-timebudget) · [ENUM-USR-Appliance](./user-profile/enums.md#enum-usr-appliance) · [ENUM-USR-HealthTag](./user-profile/enums.md#enum-usr-healthtag) · [ENUM-USR-AvoidTag](./user-profile/enums.md#enum-usr-avoidtag)

### 3.2 菜谱与标准食材域（`recipe-catalog/`）
- **术语**：[TERM-RCP-01 标准食材库](./recipe-catalog/terms.md#term-rcp-01) · [TERM-RCP-02 基准人份](./recipe-catalog/terms.md#term-rcp-02) · [TERM-RCP-03 一碗端](./recipe-catalog/terms.md#term-rcp-03) · [TERM-RCP-04 步骤动态占位符](./recipe-catalog/terms.md#term-rcp-04)
- **实体**：[DOM-RCP-StandardIngredient](./recipe-catalog/entities.md#dom-rcp-standardingredient) · [DOM-RCP-Recipe](./recipe-catalog/entities.md#dom-rcp-recipe) · [DOM-RCP-RecipeIngredient](./recipe-catalog/entities.md#dom-rcp-recipeingredient) · [DOM-RCP-RecipeStep](./recipe-catalog/entities.md#dom-rcp-recipestep) · [DOM-RCP-NutritionChart](./recipe-catalog/entities.md#dom-rcp-nutritionchart) · [DOM-RCP-TimelineChart](./recipe-catalog/entities.md#dom-rcp-timelinechart)
- **枚举**：[ENUM-RCP-Cuisine](./recipe-catalog/enums.md#enum-rcp-cuisine) · [ENUM-RCP-MealSlot](./recipe-catalog/enums.md#enum-rcp-mealslot) · [ENUM-RCP-DishRole](./recipe-catalog/enums.md#enum-rcp-dishrole) · [ENUM-RCP-Spiciness](./recipe-catalog/enums.md#enum-rcp-spiciness) · [ENUM-RCP-Difficulty](./recipe-catalog/enums.md#enum-rcp-difficulty) · [ENUM-RCP-ScaleMode](./recipe-catalog/enums.md#enum-rcp-scalemode) · [ENUM-RCP-HeatLevel](./recipe-catalog/enums.md#enum-rcp-heatlevel)

### 3.3 膳食规划与收藏域（`meal-and-collection/`）
- **术语**：[TERM-PLN-01 餐次套餐结构](./meal-and-collection/terms.md#term-pln-01) · [TERM-PLN-02 同餐主材互斥](./meal-and-collection/terms.md#term-pln-02) · [TERM-PLN-03 画像待刷新态](./meal-and-collection/terms.md#term-pln-03)
- **实体**：[DOM-PLN-DailyMealPlan](./meal-and-collection/entities.md#dom-pln-dailymealplan) · [DOM-PLN-IngredientSummaryItem](./meal-and-collection/entities.md#dom-pln-ingredientsummaryitem) · [DOM-PLN-FavoriteRecord](./meal-and-collection/entities.md#dom-pln-favoriterecord)
- **枚举**：[ENUM-PLN-IngMatchMode](./meal-and-collection/enums.md#enum-pln-ingmatchmode) · [ENUM-PLN-SortOrder](./meal-and-collection/enums.md#enum-pln-sortorder) · [ENUM-PLN-SummaryCategory](./meal-and-collection/enums.md#enum-pln-summarycategory)
