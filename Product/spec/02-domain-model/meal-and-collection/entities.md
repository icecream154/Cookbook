# 膳食规划与收藏域：实体契约（`DOM-PLN-*`）

## <a id="dom-pln-dailymealplan"></a>1. `DOM-PLN-DailyMealPlan`（每日三餐推荐方案实体）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `plan_date` | 归属自然日 | `date` | 是 | `YYYY-MM-DD` 本地日期 | 每日一档，跨自然日 00:00 自动归档 |
| `applied_servings` | 当前方案生效人数 | `int` | 是 | `1 ~ 8` | 决定套餐菜式数量与食材汇总折算倍数 |
| `breakfast_items` | 早餐槽位菜谱组 | `SlotItem[]` | 是 | 含 `recipe_id`、`dish_role`、`reason_tags[]` | 早餐推荐菜品集合 |
| `lunch_items` | 午餐槽位菜谱组 | `SlotItem[]` | 是 | 同上 | 午餐推荐菜品集合 |
| `dinner_items` | 晚餐槽位菜谱组 | `SlotItem[]` | 是 | 同上 | 晚餐推荐菜品集合 |
| `dismissed_recipe_ids` | 当日已换掉菜谱池 | `string[]` | 是 | 关联 [DOM-RCP-Recipe](../recipe-catalog/entities.md#dom-rcp-recipe) | 会话防重队列，避免用户点击“换一换”立刻换回刚拒绝的菜 |
| `generated_at` | 方案生成时间戳 | `datetime` | 是 | ISO-8601 | 与饮食档案 `updated_at` 对比判定 [TERM-PLN-03 画像待刷新态](./terms.md#term-pln-03) |

---

## <a id="dom-pln-ingredientsummaryitem"></a>2. `DOM-PLN-IngredientSummaryItem`（今日跨菜谱食材合并视图项）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ingredient_id` | 标准食材主键 | `string` | 是 | 关联 [DOM-RCP-StandardIngredient](../recipe-catalog/entities.md#dom-rcp-standardingredient) | 合并聚合键 |
| `canonical_name` | 食材标准名 | `string` | 是 | 如 `番茄`、`鸡蛋` | 清单主标题 |
| `summary_category` | 超市货架分组 | `string` | 是 | 引用 [ENUM-PLN-SummaryCategory](./enums.md#enum-pln-summarycategory) | 采购区域分组依据 |
| `merged_display_amount` | 合并折算后总量文案 | `string` | 是 | 如 `5个`、`450g` | 按当前生效人数跨所选餐次求和取整后的展示值 |
| `source_traces` | 来源菜谱溯源列表 | `string[]` | 是 | 如 `["早·北非蛋(1.5个)", "午·番茄牛腩(3个)"]` | 让用户清楚每项总量分别用于哪餐哪道菜 |
| `is_checked` | 已备齐打勾状态 | `boolean` | 是 | 默认 `false`，当日缓存持久化 | 买菜或翻冰箱核对勾选标记 |

---

## <a id="dom-pln-favoriterecord"></a>3. `DOM-PLN-FavoriteRecord`（菜谱收藏记录实体）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | 所属登录用户 | `string` | 是 | 关联 [DOM-USR-Account](../user-profile/entities.md#dom-usr-account) | 收藏必须绑定已认证账号 |
| `recipe_id` | 被收藏菜谱 | `string` | 是 | 关联 [DOM-RCP-Recipe](../recipe-catalog/entities.md#dom-rcp-recipe) | 联合唯一键 `(user_id, recipe_id)` |
| `favorited_at` | 收藏时间戳 | `datetime` | 是 | ISO-8601 | 收藏夹默认按 `favorited_at` 倒序排列 |
