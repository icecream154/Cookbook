# 业务规则簇一：智能配餐与换菜规则组（`RULE-PLAN-*`）

## <a id="rule-plan-01"></a>1. `RULE-PLAN-01`：今日三餐硬过滤一票否决规则

- **1. 触发时机与适用范围**：生成当日首次三餐方案、执行单菜或整餐“换一换”召回候选菜谱池时。
- **2. 输入依赖契约**：读取 [DOM-USR-DietaryProfile 个人饮食档案](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)（忌口大类 `avoid_tags`、自定义忌口 `avoid_ingredient_ids`、最高辣度 `max_spiciness`、现有厨具 `owned_appliances`、厨艺等级 `skill_level`、平日耗时预算 `weekday_time_budget`）与 [DOM-RCP-Recipe 菜谱聚合根](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)。
- **3. 核心判定决策矩阵**（以下任一条件命中即从推荐候选池剔除）：

| 校验项 | 否决剔除判定条件（附字段中文语义） | 是否允许在极端空池时放宽？ |
| :--- | :--- | :--- |
| **忌口过敏红线** | 菜谱任意食材命中 [ENUM-USR-AvoidTag 高频忌口大类](../02-domain-model/user-profile/enums.md#enum-usr-avoidtag)（`avoid_tags`）或自定义忌口食材列表（`avoid_ingredient_ids`） | **绝不允许放宽** |
| **辣度上限红线** | 菜谱辣度（`recipe.spiciness`）高于用户最高接受辣度（`profile.max_spiciness`，取值见 [ENUM-RCP-Spiciness 通用辣度分级](../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness) 0不辣~3重辣） | 用户选 `0`（不辣）时绝不放宽 |
| **必需厨具红线** | 菜谱必需厨具（`required_appliances`）存在不属于用户现有厨具（`owned_appliances`）的设备 | **绝不允许放宽** |
| **厨艺难度约束** | 用户为厨房小白（`beginner`）且菜谱难度不为简单（`difficulty != 'easy'`） | 仅在同槽位候选数 `< 1` 时放宽至适中（`medium`） |
| **平日耗时约束** | 菜谱总耗时（`total_time_min`）超出用户平日耗时预算（`weekday_time_budget`） | 允许阶梯放宽 `+15` 分钟并在卡片外显提示 |

- **4. 边界与降级兜底（Fallback）**：若放宽耗时与难度后某配餐角色槽位仍无菜可配（如用户勾选了极多忌口），坚守忌口与免辣红线，允许用相邻角色（如以一碗端 `one_bowl` 替代主荤 `main_meat`）补齐槽位。
- **5. 下游消费索引**：[FLOW-PLAN-01 三餐生成与换菜流](../04-ia-and-flows/flows/meal-planning.md#flow-plan-01) · [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) · [AC-PLAN-01 三口之家硬过滤验收](../08-verification/acceptance-criteria.md#ac-plan-01)

---

## <a id="rule-plan-02"></a>2. `RULE-PLAN-02`：按用餐人数餐次配餐结构矩阵

- **1. 触发时机与适用范围**：计算早、午、晚餐各需装载几个菜品槽位及其配餐角色时。
- **2. 输入依赖契约**：[ENUM-USR-HouseholdSize 用餐人数档位](../02-domain-model/user-profile/enums.md#enum-usr-householdsize)（`household_size`）、[ENUM-RCP-DishRole 套餐配餐角色](../02-domain-model/recipe-catalog/enums.md#enum-rcp-dishrole)（早点/一碗端/主荤/时蔬/汤羹）、家有儿童/老人标记（`has_kids` / `has_seniors`）。
- **3. 配餐结构决策矩阵**：

| 用餐人数（`household_size`） | 早餐槽位组合 | 午 / 晚餐槽位组合 | 附加配餐约束 |
| :--- | :--- | :--- | :--- |
| **`1`（1人食）** | `1 ×` 主食早点（`breakfast_main`） | `1 ×` 一碗端（`one_bowl`，次选 `1 ×` 主荤 `main_meat`） | 控制一餐只开一锅，避免剩菜与洗碗负担 |
| **`2`（二人世界）** | `1 ×` 主食早点 + `1 ×` 汤羹粥品（`soup`） | `1 ×` 主荤（`main_meat`）+ `1 ×` 清爽时蔬（`side_veg`）（一荤一素） | 遵守 [TERM-PLN-02 同餐主材互斥](../02-domain-model/meal-and-collection/terms.md#term-pln-02)（防两道番茄菜撞车） |
| **`3`（三口之家）** | `1 ×` 主食早点 + `1 ×` 汤羹粥品 | `1 ×` 主荤 + `1 ×` 时蔬 + `1 ×` 汤羹（两菜一汤） | 若家有儿童或老人（`has_kids / has_seniors` 为真），至少 `2` 道菜必须为不辣（`spiciness == 0`） |
| **`>= 4`（四口及以上）** | `2 ×` 主食早点 + `1 ×` 汤羹粥品 | `2 ×` 主荤 + `1 ×` 时蔬 + `1 ×` 汤羹（三菜一汤） | 两道主荤的第一主食材（`primary_main_ing_id`）不得同属同一种肉类 |

- **4. 边界与降级兜底**：未建档游客固定按默认 `2` 人（二人世界 · 一荤一素）执行通用时令配餐。
- **5. 下游消费索引**：[PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) · [AC-PLAN-01 三口之家硬过滤验收](../08-verification/acceptance-criteria.md#ac-plan-01)

---

## <a id="rule-plan-03"></a>3. `RULE-PLAN-03`：个性化推荐命中理由生成规则

- **1. 触发时机与适用范围**：渲染今日三餐卡片上的个性化推荐依据胶囊标签（单卡最多外显 `2` 个标签）时。
- **2. 输入依赖契约**：[DOM-USR-DietaryProfile 个人饮食档案](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 与 [DOM-RCP-Recipe 菜谱聚合根](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)。
- **3. 优先级截取顺序**（自上而下依次匹配，凑满 `2` 个标签即停止）：
  1. 命中用户显式勾选的专项健康标签（非默认的均衡膳食 `balanced`）：输出 `契合{健康标签文案}`（如 `契合减脂低卡`）。
  2. 家有儿童（`has_kids == true`）且菜谱不辣（`spiciness == 0`）：输出 `儿童友好免辣`。
  3. 菜谱使用用户已勾选的特色省力厨具（空气炸锅 `air_fryer` / 电饭煲 `rice_cooker`）：输出 `{厨具名}免看火`。
  4. 菜谱总耗时不超平日预算（`total_time_min <= weekday_time_budget`）：输出 `{total_time_min}分钟快手`。
  5. 命中用户偏爱风味（`favorite_flavors`）：输出 `{风味文案}匹配`。
- **4. 边界与降级兜底**：游客未定制默认态无个人画像交集时，回退展示 `时令精选` 或 `{total_time_min}分钟搞定`。
- **5. 下游消费索引**：[COMP-RecipeCard 跨页菜谱卡片](../05-components-and-patterns/shared-components.md#comp-recipecard) · [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)

---

## <a id="rule-plan-04"></a>4. `RULE-PLAN-04`：单菜与整餐“换一换”互斥防重轮询规则

- **1. 触发时机与适用范围**：用户在今日菜谱点击单张卡片 `[⇄ 换一道]` 或餐次头部 `[↻ 整餐换一批]` 时。
- **2. 输入依赖契约**：[DOM-PLN-DailyMealPlan 每日三餐推荐单](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan)（读取当日已换掉防重菜谱池 `dismissed_recipe_ids`）、[RULE-PLAN-01 忌口厨具硬过滤](#rule-plan-01)。
- **3. 核心替换与互斥逻辑**：
  1. 将本次被替换下场的菜谱 ID 追加进当日已换掉防重池（`dismissed_recipe_ids`）。
  2. **单菜替换**：锁定原槽位的配餐角色（`dish_role`）不变（如汤羹 `soup` 只换汤羹），排除当日早中晚正在展示的全部菜谱与防重池，且新菜品的第一主食材（`primary_main_ing_id`）不得与本餐其余在场菜品冲突。
  3. **整餐替换**：仅重算当前餐次下的全部槽位组合，其余两个餐次的菜品锁定不动。
- **4. 边界与降级兜底**：当符合硬过滤条件的剩余候选池耗尽时，自动清空该槽位的 `dismissed_recipe_ids` 重新开启循环轮询，并弹出轻提示 `已为你轮换展示全部高匹配菜式`。
- **5. 下游消费索引**：[FLOW-PLAN-01 三餐生成与换菜流](../04-ia-and-flows/flows/meal-planning.md#flow-plan-01) · [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) · [AC-PLAN-02 换菜同餐主材互斥验收](../08-verification/acceptance-criteria.md#ac-plan-02)

---

## <a id="rule-plan-05"></a>5. `RULE-PLAN-05`：当日跨菜谱同类食材合并规则

- **1. 触发时机与适用范围**：打开今日食材汇总抽屉，或在抽屉内切换早/午/晚餐勾选胶囊开关时。
- **2. 输入依赖契约**：[DOM-PLN-DailyMealPlan 每日三餐推荐单](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan)（读取生效人数 `applied_servings`）、[DOM-RCP-RecipeIngredient 菜谱结构化食材项](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)、[RULE-COOK-02 多量纲人性化取整](./portion-and-cooking.md#rule-cook-02)。
- **3. 跨菜谱聚合计算步骤**：
  1. 筛选处于勾选开启态的餐次（默认早、午、晚三餐全勾）下的所有菜谱。
  2. 对每道菜谱的每项食材先计算**未取整原始缩放值**：`raw_scaled = 基准用量 base_amount * (当日生效人数 applied_servings / 菜谱基准人份 base_servings)`。
  3. 按 `(标准食材主键 ingredient_id, 计量单位 unit)` 相同键分组累加 `sum(raw_scaled)`，累加完成后再统一调用 [RULE-COOK-02 多量纲人性化取整](./portion-and-cooking.md#rule-cook-02) 执行一次最终取整（防止每道菜先四舍五入造成累积偏差），并拼接来源菜谱追踪说明（`source_traces`）。
  4. 按 [ENUM-PLN-SummaryCategory 采购货架分组](../02-domain-model/meal-and-collection/enums.md#enum-pln-summarycategory)（肉禽水产 → 蔬果菌菇 → 蛋奶主食 → 常备调味）顺序分组展示。
- **4. 边界与降级兜底**：若同一标准食材在两道菜中使用不可直接相加的异构单位（如一道按 `个`，一道按 `g`），并列保留两条明细不强行合并；若用户手动取消勾选全部三餐，返回空列表并展示引导提示。
- **5. 下游消费索引**：[PAGE-PLAN-02 今日食材汇总抽屉](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) · [AC-PLAN-03 跨餐合并与动态扣减验收](../08-verification/acceptance-criteria.md#ac-plan-03)
