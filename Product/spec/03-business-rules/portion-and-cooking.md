# 业务规则簇三：分量换算与下厨辅助规则组（`RULE-COOK-*`）

## <a id="rule-cook-01"></a>1. `RULE-COOK-01`：详情页目标人数初始值继承优先级规则

- **1. 触发时机与适用范围**：用户从任意列表或外链打开 [PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)，确定首屏初始目标用餐人数（`target_servings`）时。
- **2. 输入依赖契约**：路由入口透传参数（`context_servings`）、[DOM-USR-DietaryProfile 个人饮食档案](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 的期望用餐人数（`household_size`）与档案来源（`profile_source`）、[DOM-RCP-Recipe 菜谱聚合根](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) 的配方基准人份（`base_servings`）。
- **3. 初始人数继承优先级链**（自高向低依次匹配）：
  1. **上游入口显式透传人数**：如从今日菜谱页点击进入时，优先继承当日套餐正在生效的人数（`applied_servings`）。
  2. **用户已定制的个人档案人数**：若入口未显式传参，且用户已定制过个人偏好（`profile_source != 'default'`），继承其个人档案的期望人数（`household_size`）。
  3. **菜谱自身原始基准人份**：未定制偏好的纯游客从检索页或外链直达时，回退采用该菜谱编撰入库时的基准人份（`recipe.base_servings`）。
- **4. 作用域单向隔离边界**：用户在详情页内通过人数步进器手动加减 `target_servings`（允许区间 `1 ~ 8` 人），**仅在本次菜谱详情浏览与紧随的全屏跟做会话内局部生效**，严禁反向覆写篡改用户个人饮食档案中的全局日常人数（`household_size`）。
- **5. 下游消费索引**：[FLOW-COOK-01 详情多媒体联动与换算流](../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-01) · [PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) · [AC-COOK-01 分量取整与作用域隔离验收](../08-verification/acceptance-criteria.md#ac-cook-01)

---

## <a id="rule-cook-02"></a>2. `RULE-COOK-02`：多量纲食材人性化取整换算规则

- **1. 触发时机与适用范围**：详情页初始化或切换目标人数（`target_servings`）计算每项食材展示用量时，以及今日食材汇总跨菜谱累加后最终取整时。
- **2. 输入依赖契约**：[DOM-RCP-RecipeIngredient 菜谱结构化食材项](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)（基准数值 `base_amount`、单位 `unit`）与 [ENUM-RCP-ScaleMode 食材取整模式枚举](../02-domain-model/recipe-catalog/enums.md#enum-rcp-scalemode)。
- **3. 计算公式与分级取整矩阵**（设未取整线性理论值 `raw = base_amount * (target_servings / base_servings)`）：

| 取整模式（`scale_mode`） | 理论值 `raw` 区间 | 人性化取整刻度规则 | 下厨实操示例（彻底杜绝反直觉小数） |
| :--- | :--- | :--- | :--- |
| **称重与液体**（`weight_vol`：`g` / `ml`） | `raw < 20` | 四舍五入精确到 `1`（最小保底为 `1`） | 食盐 `3g × 1.5 = 4.5g → 5g` |
| **称重与液体**（`weight_vol`：`g` / `ml`） | `20 <= raw <= 100` | 按 `5` 的整数倍就近取整 | 虾仁 `60g × 1.33 = 80g`；`63g → 65g` |
| **称重与液体**（`weight_vol`：`g` / `ml`） | `raw > 100` | 按 `10` 的整数倍就近取整 | 牛腩 `500g × (2/3) = 333.3g → 330g` |
| **可切半计数食材**（`half_piece`：`个 / 片 / 块`） | 全区间 | 按 `0.5` 为最小刻度取整（保底 `0.5`） | 番茄 `2个 × (3/2) = 3个`；`1.33个 → 1.5个` |
| **不可拆整颗食材**（`whole_int`：鸡蛋`个` / 整鱼`条`） | 全区间 | 按 `1` 正整数四舍五入（最小保底为 `1`） | 鸡蛋 `2个 × (2/3) = 1.33 → 1个`；整鲈鱼最少 `1条`（禁出半个生蛋） |
| **勺具量纲调料**（`spoon_step`：`勺 / 茶匙`） | 全区间 | 按 `0.5` 勺步进取整（保底 `0.5`） | 生抽 `2勺 × (2/3) = 1.33 → 1.5勺` |
| **模糊免缩放量**（`unscaled`：`少许 / 适量`） | — | 忽略人数比例系数，原样输出单位文案 | `现磨黑胡椒 少许` |

- **4. 边界与降级兜底**：当目标人数恰好等于配方基准人份（`target_servings == base_servings`）时，直接原样输出录入的原始数值与单位，不做多余舍入转换。
- **5. 下游消费索引**：[PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) · [PAGE-COOK-02 全屏分步跟做视图](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) · [PAGE-PLAN-02 今日食材汇总抽屉](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) · [AC-COOK-01 分量取整与作用域隔离验收](../08-verification/acceptance-criteria.md#ac-cook-01)

---

## <a id="rule-cook-03"></a>3. `RULE-COOK-03`：食材表与步骤富文本动态数值同步规则

- **1. 触发时机与适用范围**：渲染菜谱详情页步骤列表、全屏跟做视图单步卡片，以及每次点击人数步进器改变目标人数后。
- **2. 输入依赖契约**：[DOM-RCP-RecipeStep 富文本做法步骤项](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipestep) 的模板正文（`rich_text_tpl`，内含 [TERM-RCP-04 步骤动态占位符](../02-domain-model/recipe-catalog/terms.md#term-rcp-04) 如 `{ing_soy_sauce}`）、[RULE-COOK-02 多量纲人性化取整](#rule-cook-02)。
- **3. 端侧实时同步逻辑**：
  1. 解析每条步骤模板正文 `rich_text_tpl` 中所有形如 `{ingredient_id}` 的食材占位标记。
  2. 实时关联当前菜谱食材清单中匹配的条目，填入经 [RULE-COOK-02 多量纲人性化取整](#rule-cook-02) 计算出的最新折算值，并以高亮胶囊样式渲染为 `【食材展示名 + 折算后用量】`（例如人数从 2 改到 4 时，步骤第 3 步文字内的 `生抽 1.5勺` 同步变为 `生抽 3勺`）。
  3. 详情页的 [DOM-RCP-NutritionChart 单人份营养热量图](../02-domain-model/recipe-catalog/entities.md#dom-rcp-nutritionchart) **恒定维持 1 人份摄入口径不变**，不在图表上乘以总人数。
- **4. 边界与降级兜底**：若内容编撰疏漏导致模板中某占位符未匹配到食材表行，优雅回退显示占位符去括号原词并上报内容质检日志，绝不白屏崩溃。
- **5. 下游消费索引**：[PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) · [PAGE-COOK-02 全屏分步跟做视图](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) · [AC-COOK-02 步骤同步与跨步计时验收](../08-verification/acceptance-criteria.md#ac-cook-02)
