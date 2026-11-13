# 业务规则簇二：复合检索与匹配规则组（`RULE-SRCH-*`）

## <a id="rule-srch-01"></a>1. `RULE-SRCH-01`：关键词与标准食材同义词召回规则

- **触发时机**：用户在检索框输入字符（250ms 防抖联想）或提交关键词检索时。
- **输入依赖**：[DOM-RCP-StandardIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient)（含 `synonyms`）、[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)。
- **匹配逻辑**：
  1. 先将输入词与 `DOM-RCP-StandardIngredient` 的 `canonical_name` 及 `synonyms` 比对（例如输入 `西红柿` 命中 `ing_tomato: 番茄`）。
  2. **输入联想阶段**：若命中标准食材，首条联想项固定渲染为 `[食材快捷过滤] 筛选包含「{canonical_name}」的菜谱`，下方再列标题包含输入词的菜谱建议。
  3. **提交检索阶段**：召回满足 `title 包含关键词` **或** `cuisine 文案包含关键词` **或** `任一食材命中对应标准食材 ID` 的全部菜谱。
- **降级兜底**：输入空白字符或纯标点时忽略关键词条件，仅执行已勾选的筛选项过滤。
- **消费索引**：[COMP-SearchBar](../05-components-and-patterns/shared-components.md#comp-searchbar)、[PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)。

---

## <a id="rule-srch-02"></a>2. `RULE-SRCH-02`：多食材“智能匹配度 vs 严格全含”判定规则

- **触发时机**：复合筛选中勾选 `include_ingredient_ids` 数量 `>= 1` 时。
- **输入依赖**：[ENUM-PLN-IngMatchMode](../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode)、[DOM-RCP-RecipeIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)。
- **判定矩阵**：

| 所选食材数 `M` | 匹配模式 `ing_match_mode` | 召回准入条件 | 排序与卡片附加信息 |
| :--- | :--- | :--- | :--- |
| `M == 1` | 不展示模式切换开关 | 菜谱包含该食材 | 卡片标注 `命中食材: {名称}` |
| `M >= 2` | `smart_rank`（默认） | 菜谱命中数 `K >= 1`（`OR` 并集） | 自动切换默认排序为按 `K / M` 降序；卡片标注 `命中 K/M 食材`（若 `K < M` 附注 `缺: {未命中食材名}`） |
| `M >= 2` | `strict_all`（手动切） | 菜谱命中数 `K == M`（`AND` 交集） | 保持用户所选排序；卡片标注 `包含全部 M 种所选食材` |

- **降级兜底**：`M` 达到上限 `8` 个后，其余未选食材芯片置灰不可继续追加并轻提示 `最多同时选择 8 种食材`。
- **消费索引**：[PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-SRCH-02](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02)、[AC-SRCH-01](../08-verification/acceptance-criteria.md#ac-srch-01)。

---

## <a id="rule-srch-03"></a>3. `RULE-SRCH-03`：主动检索下个人忌口显隐与温和预警规则

- **触发时机**：用户在「找菜谱」执行搜索筛选，或进入某道含个人忌口食材的「菜谱详情页」时。
- **输入依赖**：[DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)、[DOM-RCP-RecipeIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)。
- **设计原则与判定逻辑**（区分“被动推荐”与“主动搜索”）：
  1. 不同于今日三餐的静默硬屏蔽，用户在「找菜谱」主动搜索（如替家人朋友搜一道海鲜菜）时，**默认不暗中开启忌口过滤**，避免用户搜不到明确存在的菜谱而怀疑题库缺失。
  2. 在复合筛选面板提供显式开关 `auto_exclude_profile_avoid`（`[ ] 自动排除我的个人忌口`）：开启后将个人 `avoid_tags` 与 `avoid_ingredient_ids` 并入 `NOT` 严格剔除集。
  3. 当未开启剔除且召回结果/详情页中某食材命中用户个人忌口时：在列表卡片及详情食材行旁展示醒目温和预警标 `⚠️ 含你的忌口: {名称}`，若该食材配置了 `substitute_note` 则一并展示替代方案。
- **降级兜底**：未设置过任何忌口的游客/用户，筛选面板中的“自动排除个人忌口”开关置为不可用引导态。
- **消费索引**：[PAGE-SRCH-02](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02)、[PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)。

---

## <a id="rule-srch-04"></a>4. `RULE-SRCH-04`：复合筛选布尔组合与零结果阶梯放宽规则

- **触发时机**：计算复合筛选实时命中数量（`查看匹配的 N 道菜谱`）及渲染检索结果列表时。
- **输入依赖**：[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)、[ENUM-PLN-SortOrder](../02-domain-model/meal-and-collection/enums.md#enum-pln-sortorder)。
- **布尔运算规则**：
  - **跨维度之间一律取 `AND` 交集**：`关键词 ∧ 仅看收藏 ∧ 包含食材规则 ∧ ¬排除食材 ∧ 菜系组 ∧ 辣度组 ∧ 耗时上限 ∧ 难度组 ∧ 健康标签组`。
  - **同维度多选内部关系**：`菜系`、`辣度`、`难度` 组内多选为 `OR` 并集；`健康标签` 组内多选为 `AND` 交集；`排除食材` 组内多选为 `NOR` 均不包含。
- **零结果（`N == 0`）阶梯放宽诊断兜底**：
  当总交集结果数为 `0` 时，系统在后台试算移除单一限制条件后的增量结果数，并在空状态卡片上最多生成 2 个收益最高的一键放宽按钮（优先级：① 将食材 `strict_all` 切回 `smart_rank`；② 取消 `仅看收藏` 扩大至全库；③ 移除 `耗时` 或冲突的 `辣度/菜系` 限制），下方附带 3 道近似热门菜谱兜底。
- **消费索引**：[FLOW-DISC-01](../04-ia-and-flows/flows/search-and-collection.md#flow-disc-01)、[PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[AC-SRCH-02](../08-verification/acceptance-criteria.md#ac-srch-02)。
