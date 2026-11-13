# 业务规则簇一：智能配餐与换菜规则组（`RULE-PLAN-*`）

## <a id="rule-plan-01"></a>1. `RULE-PLAN-01`：今日三餐硬过滤一票否决规则

- **触发时机**：生成当日首次三餐方案、执行单菜或整餐“换一换”召回候选池时。
- **输入依赖**：[DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)、[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)。
- **判定决策表**（以下任一条件命中即从推荐候选池剔除）：

| 校验项 | 否决剔除判定条件 | 是否允许在极端空池时放宽？ |
| :--- | :--- | :--- |
| **忌口过敏红线** | 菜谱任意食材命中 `avoid_tags`（[ENUM-USR-AvoidTag](../02-domain-model/user-profile/enums.md#enum-usr-avoidtag)）或 `avoid_ingredient_ids` | **绝不允许放宽** |
| **辣度上限红线** | `recipe.spiciness > profile.max_spiciness`（[ENUM-RCP-Spiciness](../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)） | `max_spiciness == 0` 时绝不放宽 |
| **必需厨具红线** | `recipe.required_appliances` 存在不属于 `profile.owned_appliances` 的设备 | **绝不允许放宽** |
| **厨艺难度约束** | 用户为 `beginner` 且 `recipe.difficulty != 'easy'` | 仅在同槽位候选数 `< 1` 时放宽至 `medium` |
| **平日耗时约束** | `recipe.total_time_min > profile.weekday_time_budget` | 允许阶梯放宽 `+15min` 并在卡片提示 |

- **降级兜底（Fallback）**：若放宽耗时与难度后某角色槽位仍无菜可配（如用户勾选了全部忌口），保留忌口与免辣红线，允许用相邻角色（如 `one_bowl` 替代 `main_meat`）补齐。
- **消费索引**：[FLOW-PLAN-01](../04-ia-and-flows/flows/meal-planning.md#flow-plan-01)、[PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)。

---

## <a id="rule-plan-02"></a>2. `RULE-PLAN-02`：按用餐人数餐次配餐结构矩阵

- **触发时机**：计算早、午、晚餐各需装载几个菜品槽位及其角色时。
- **输入依赖**：[ENUM-USR-HouseholdSize](../02-domain-model/user-profile/enums.md#enum-usr-householdsize)、[ENUM-RCP-DishRole](../02-domain-model/recipe-catalog/enums.md#enum-rcp-dishrole)、`has_kids` / `has_seniors`。
- **配餐结构决策矩阵**：

| 用餐人数 `household_size` | 早餐槽位组合 | 午 / 晚餐槽位组合 | 附加配餐约束 |
| :--- | :--- | :--- | :--- |
| **`1`（1人食）** | `1 × breakfast_main` | `1 × one_bowl`（次选 `1 × main_meat`） | 控制一餐只开一锅，避免剩菜 |
| **`2`（二人世界）** | `1 × breakfast_main` + `1 × soup` | `1 × main_meat` + `1 × side_veg`（一荤一素） | 遵守 [TERM-PLN-02 同餐主材互斥](../02-domain-model/meal-and-collection/terms.md#term-pln-02) |
| **`3`（三口之家）** | `1 × breakfast_main` + `1 × soup` | `1 × main_meat` + `1 × side_veg` + `1 × soup`（两菜一汤） | 若 `has_kids` 或 `has_seniors` 为真，至少 2 道菜 `spiciness == 0` |
| **`>= 4`（四口及以上）** | `2 × breakfast_main` + `1 × soup` | `2 × main_meat` + `1 × side_veg` + `1 × soup`（三菜一汤） | 两道主荤第一主材不得同属同一种肉类 |

- **降级兜底**：未建档游客固定按 `household_size = 2`（一荤一素）执行通用时令配餐。
- **消费索引**：[PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[AC-PLAN-01](../08-verification/acceptance-criteria.md#ac-plan-01)。

---

## <a id="rule-plan-03"></a>3. `RULE-PLAN-03`：个性化推荐命中理由生成规则

- **触发时机**：渲染今日三餐卡片上的推荐依据角标（最多外显 `2` 个标签）时。
- **输入依赖**：[DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)、[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)。
- **优先级截取顺序**（自上而下匹配，满 2 个即停）：
  1. 命中用户显式勾选的专项健康标签（非默认 `balanced`）：输出 `契合{健康标签文案}`（如 `契合减脂低卡`）。
  2. `has_kids == true` 且菜谱 `spiciness == 0`：输出 `儿童友好免辣`。
  3. 菜谱使用用户勾选的特色厨具（`air_fryer` / `rice_cooker`）：输出 `{厨具名}免看火`。
  4. `total_time_min <= weekday_time_budget`：输出 `{total_time_min}分钟快手`。
  5. 命中 `favorite_flavors`：输出 `{风味文案}匹配`。
- **降级兜底**：游客默认态无个人画像交集时，回退展示 `时令精选` 或 `{total_time_min}分钟搞定`。
- **消费索引**：[COMP-RecipeCard](../05-components-and-patterns/shared-components.md#comp-recipecard)、[PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)。

---

## <a id="rule-plan-04"></a>4. `RULE-PLAN-04`：单菜与整餐“换一换”互斥防重轮询规则

- **触发时机**：用户点击单张卡片 `[⇄ 换一道]` 或餐次头部 `[↻ 整餐换一批]` 时。
- **输入依赖**：[DOM-PLN-DailyMealPlan](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan)（含 `dismissed_recipe_ids`）、[RULE-PLAN-01](#rule-plan-01)。
- **核心逻辑**：
  1. 将被替换掉的 `recipe_id` 追加进当日 `dismissed_recipe_ids` 队列。
  2. **单菜替换**：锁定原槽位的 `dish_role` 不变（如 `soup` 仅换 `soup`），排除当日三餐正在展示的全部菜谱 ID 与 `dismissed_recipe_ids`，且新菜品的 `primary_main_ing_id` 不得与本餐其余槽位冲突。
  3. **整餐替换**：仅重算当前餐次下的全部槽位，其余两个餐次保持原状不变。
- **降级兜底**：当符合硬过滤条件的剩余候选池耗尽时，清空 `dismissed_recipe_ids` 重新开启轮询，并触发轻量 Toast 提示 `已为你轮换展示全部高匹配菜式`。
- **消费索引**：[FLOW-PLAN-01](../04-ia-and-flows/flows/meal-planning.md#flow-plan-01)、[PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)。

---

## <a id="rule-plan-05"></a>5. `RULE-PLAN-05`：当日跨菜谱同类食材合并规则

- **触发时机**：打开今日食材汇总抽屉，或在抽屉内切换早/午/晚餐勾选开关时。
- **输入依赖**：[DOM-PLN-DailyMealPlan](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan)、[DOM-RCP-RecipeIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)、[RULE-COOK-02](./portion-and-cooking.md#rule-cook-02)。
- **聚合计算逻辑**：
  1. 筛选处于勾选开启态的餐次（默认早、午、晚全选）下的所有菜谱。
  2. 对每道菜谱的每项食材先计算未取整原始缩放值：`raw_scaled = base_amount * (applied_servings / base_servings)`。
  3. 按 `(ingredient_id, unit)` 相同键分组累加 `sum(raw_scaled)`，累加完成后统一调用 [RULE-COOK-02](./portion-and-cooking.md#rule-cook-02) 进行一次人性化取整（避免先多次四舍五入产生累积误差），并拼接来源追踪文案 `source_traces`。
  4. 按 [ENUM-PLN-SummaryCategory](../02-domain-model/meal-and-collection/enums.md#enum-pln-summarycategory) 顺序排列分组。
- **降级兜底**：若同一 `ingredient_id` 在两道菜中使用不可通约单位（如一道按 `个`，一道按 `g`），并列保留两条明细不强行相加；若用户取消勾选全部三餐，返回空列表并展示引导提示。
- **消费索引**：[PAGE-PLAN-02](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02)、[AC-PLAN-03](../08-verification/acceptance-criteria.md#ac-plan-03)。
