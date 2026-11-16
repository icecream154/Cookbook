# 膳食规划与收藏域：实体契约（`DOM-PLN-*`）

## <a id="dom-pln-dailymealplan"></a>1. `DOM-PLN-DailyMealPlan`（每日三餐推荐方案实体）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `plan_date` | 归属自然日 | `date` | 是 | `YYYY-MM-DD` 本地日期 | 每日一档，跨自然日 `00:00` 自动归档换新 |
| `applied_servings` | 当前方案生效人数 | `int` | 是 | `1 ~ 8` | 决定套餐菜式槽位数量与食材汇总折算倍数 |
| `breakfast_items` | 早餐槽位菜谱组 | `SlotItem[]` | 是 | 每项含菜谱 ID（`recipe_id`）、配餐角色（`dish_role`）、命中理由（`reason_tags[]`） | 早餐推荐菜品集合 |
| `lunch_items` | 午餐槽位菜谱组 | `SlotItem[]` | 是 | 结构同上 | 午餐推荐菜品集合 |
| `dinner_items` | 晚餐槽位菜谱组 | `SlotItem[]` | 是 | 结构同上 | 晚餐推荐菜品集合 |
| `dismissed_recipe_ids` | 当日已换掉菜谱池 | `string[]` | 是 | 关联 [DOM-RCP-Recipe 菜谱核心聚合根](../recipe-catalog/entities.md#dom-rcp-recipe) | 会话防重黑名单，避免点击“换一换”立刻换回刚被替换掉的菜谱 |
| `generated_at` | 方案生成时间戳 | `datetime` | 是 | ISO-8601 时间戳 | 与个人饮食档案最近修改时间（`updated_at`）比对，判定是否进入 [TERM-PLN-03 画像待刷新态](./terms.md#term-pln-03) |

---

## <a id="dom-pln-ingredientsummaryitem"></a>2. `DOM-PLN-IngredientSummaryItem`（今日跨菜谱食材合并视图项）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ingredient_id` | 标准食材主键 | `string` | 是 | 关联 [DOM-RCP-StandardIngredient 标准食材主数据](../recipe-catalog/entities.md#dom-rcp-standardingredient) | 跨菜谱同名食材合并求和主键 |
| `canonical_name` | 食材标准名 | `string` | 是 | 如 `番茄`、`鸡蛋` | 采购清单行主标题 |
| `summary_category` | 超市货架分组 | `string` | 是 | 引用 [ENUM-PLN-SummaryCategory 采购货架分组](./enums.md#enum-pln-summarycategory)（肉禽水产/蔬果菌菇/蛋奶主食/常备调味 4 组） | 采购区域分组排序依据 |
| `merged_display_amount` | 合并折算后总量文案 | `string` | 是 | 如 `5个`、`450g` | 按当前生效人数跨所选餐次累加后再一次性人性化取整的展示值 |
| `source_traces` | 来源菜谱溯源列表 | `string[]` | 是 | 如 `["早·北非蛋(2个)", "午·番茄炒蛋(3个)"]` | 让用户清楚每项汇总食材分别用于哪一餐哪道菜 |
| `is_checked` | 已备齐打勾状态 | `boolean` | 是 | 默认 `false`，当日缓存持久化 | 买菜或翻冰箱核对已有存货的划线打勾标记 |

---

## <a id="dom-pln-favoriterecord"></a>3. `DOM-PLN-FavoriteRecord`（菜谱收藏记录实体）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | 所属登录用户 | `string` | 是 | 关联 [DOM-USR-Account 用户账号实体](../user-profile/entities.md#dom-usr-account) | 收藏必须绑定已认证登录账号 |
| `recipe_id` | 被收藏菜谱 | `string` | 是 | 关联 [DOM-RCP-Recipe 菜谱核心聚合根](../recipe-catalog/entities.md#dom-rcp-recipe) | 联合唯一键 `(user_id, recipe_id)` |
| `favorited_at` | 收藏时间戳 | `datetime` | 是 | ISO-8601 时间戳 | 收藏夹默认按收藏时间（`favorited_at`）倒序展示 |
