# 业务规则簇三：分量换算与下厨辅助规则组（`RULE-COOK-*`）

## <a id="rule-cook-01"></a>1. `RULE-COOK-01`：详情页目标人数初始值继承优先级规则

- **触发时机**：用户从任意入口打开 [PAGE-COOK-01 菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 初始化目标人数 `target_servings` 时。
- **输入依赖**：入口上下文参数、[DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) `household_size`、[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) `base_servings`。
- **继承优先级链**（自高向低）：
  1. **入口显式携带人数**（如从今日三餐页点入时携带当前套餐生效的 `applied_servings`）。
  2. **用户已定制的饮食档案默认人数**（`profile_source != 'default'` 时的 `household_size`）。
  3. **菜谱自身原始基准人份**（`recipe.base_servings`，适用于未定制偏好的纯游客从检索页直接点入）。
- **作用域隔离边界**：用户在详情页内通过步进器手动增减 `target_servings`（允许区间 `1 ~ 8`）**仅在当前菜谱浏览与跟做会话内生效**，严禁反向篡改用户个人饮食档案中的全局 `household_size`。
- **消费索引**：[FLOW-COOK-01](../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-01)、[PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)。

---

## <a id="rule-cook-02"></a>2. `RULE-COOK-02`：多量纲食材人性化取整换算规则

- **触发时机**：`target_servings` 初始化或变更时计算每项食材展示量，以及跨菜谱食材汇总取整时。
- **输入依赖**：[DOM-RCP-RecipeIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)、[ENUM-RCP-ScaleMode](../02-domain-model/recipe-catalog/enums.md#enum-rcp-scalemode)。
- **计算公式与分级取整矩阵**（设未取整理论值 `raw = base_amount * (target_servings / base_servings)`）：

| 换算模式 `scale_mode` | 理论值区间 | 人性化取整规则 | 示例说明（杜绝反直觉小数） |
| :--- | :--- | :--- | :--- |
| `weight_vol`（`g` / `ml`） | `raw < 20` | 四舍五入精确到 `1`（下限为 `1`） | 食盐 `3g × 1.5 = 4.5g → 5g` |
| `weight_vol`（`g` / `ml`） | `20 <= raw <= 100` | 按 `5` 的整数倍就近取整 | 虾仁 `60g × 1.33 = 80g`；`63g → 65g` |
| `weight_vol`（`g` / `ml`） | `raw > 100` | 按 `10` 的整数倍就近取整 | 牛腩 `500g × (2/3) = 333.3g → 330g` |
| `half_piece`（`个` / `片` / `块`） | 全区间 | 按 `0.5` 步进取整（下限为 `0.5`） | 番茄 `2个 × (3/2) = 3个`；`1.33个 → 1.5个` |
| `whole_int`（整鱼`条` / 鸡蛋`个`） | 全区间 | 按 `1` 正整数四舍五入（下限为 `1`） | 鸡蛋 `3个 × (1/2) = 1.5 → 2个`；整鲈鱼最小为 `1条` |
| `spoon_step`（`勺` / `茶匙`） | 全区间 | 按 `0.5` 勺步进取整（下限为 `0.5`） | 生抽 `1.5勺 × (3/2) = 2.25 → 2勺` |
| `unscaled`（`少许` / `适量`） | — | 忽略比例系数，原样输出 `unit` 文案 | `海盐黑胡椒 少许` |

- **降级兜底**：当 `target_servings == base_servings` 时直接输出原始 `base_amount + unit`，不做二次舍入。
- **消费索引**：[PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-COOK-02](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02)、[PAGE-PLAN-02](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02)、[AC-COOK-01](../08-verification/acceptance-criteria.md#ac-cook-01)。

---

## <a id="rule-cook-03"></a>3. `RULE-COOK-03`：食材表与步骤富文本动态数值同步规则

- **触发时机**：渲染菜谱详情页步骤列表及全屏跟做视图单步卡片时，以及每次调整人数步进器后。
- **输入依赖**：[DOM-RCP-RecipeStep](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipestep) `rich_text_tpl`（含 [TERM-RCP-04 步骤动态占位符](../02-domain-model/recipe-catalog/terms.md#term-rcp-04)）、[RULE-COOK-02](#rule-cook-02)。
- **同步逻辑**：
  1. 解析 `rich_text_tpl` 中所有形如 `{ingredient_id}` 的动态占位符。
  2. 实时查找当前菜谱食材清单中匹配的条目，填入由 `RULE-COOK-02` 算出的最新结果，并包裹高亮视觉标记渲染为 `【食材展示名 + 折算后用量】`（如 `生抽 3勺`）。
  3. 单人份营养构成图（`DOM-RCP-NutritionChart`）**保持单人份口径恒定不变**，仅在食材区顶部提示 `已由基准 X 人份折算为 Y 人份`。
- **降级兜底**：若模板中某占位符未能匹配食材表项，回退渲染占位符原始文本并记录内容编撰告警，不得抛出渲染崩溃。
- **消费索引**：[PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-COOK-02](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02)、[AC-COOK-02](../08-verification/acceptance-criteria.md#ac-cook-02)。
