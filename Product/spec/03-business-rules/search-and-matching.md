# 业务规则簇二：复合检索与匹配规则组（`RULE-SRCH-*`）

## <a id="rule-srch-01"></a>1. `RULE-SRCH-01`：关键词与标准食材同义词召回规则

- **1. 触发时机与适用范围**：用户在搜索框输入字符（经 `250ms` 防抖触发下拉联想）或正式提交关键词检索时。
- **2. 输入依赖契约**：[DOM-RCP-StandardIngredient 标准食材主数据](../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient)（读取标准名 `canonical_name` 与俗称同义词数组 `synonyms`）、[DOM-RCP-Recipe 菜谱聚合根](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)。
- **3. 同义词映射与召回逻辑**：
  1. 先将输入词与标准食材库的 `canonical_name` 及 `synonyms` 匹配（例如输入俗称 `西红柿` 或 `洋柿子` 均归一命中标准食材 `ing_tomato：番茄`）。
  2. **下拉联想阶段**：若命中标准食材，下拉面板首行置顶渲染快捷过滤入口 `[+ 按食材筛选：番茄（含西红柿）]`，下方再列菜名包含该词的菜谱建议。
  3. **提交检索阶段**：并集召回满足 `菜谱标题（title）包含关键词` **或** `所属菜系文案包含关键词` **或** `食材表命中对应标准食材 ID` 的全部菜谱。
- **4. 边界与降级兜底**：输入纯空格或纯标点符号时自动忽略关键词条件，仅执行当前已勾选的筛选项过滤。
- **5. 下游消费索引**：[COMP-SearchBar 多态联想搜索框](../05-components-and-patterns/shared-components.md#comp-searchbar) · [PAGE-SRCH-01 找菜谱检索主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) · [AC-SRCH-01 同义词联想与双模匹配验收](../08-verification/acceptance-criteria.md#ac-srch-01)

---

## <a id="rule-srch-02"></a>2. `RULE-SRCH-02`：多食材“智能匹配度 vs 严格全含”判定规则

- **1. 触发时机与适用范围**：用户在复合筛选中勾选“包含食材”数量 `M >= 1` 时。
- **2. 输入依赖契约**：[ENUM-PLN-IngMatchMode 多食材匹配模式枚举](../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode)（智能匹配度排序 `smart_rank` / 严格全部包含 `strict_all`）、[DOM-RCP-RecipeIngredient 菜谱结构化食材项](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)。
- **3. 双模式召回与排序决策矩阵**：

| 已勾选包含食材数 `M` | 匹配模式（`ing_match_mode`） | 召回准入条件 | 排序联动与卡片外显徽章 |
| :--- | :--- | :--- | :--- |
| `M == 1` | 隐藏模式切换开关 | 菜谱包含该项食材 | 卡片标注 `命中食材: {标准名}` |
| `M >= 2` | **智能匹配度排序**（`smart_rank`，默认） | 菜谱命中食材数 `K >= 1`（`OR` 并集召回，容许缺一两味辅料） | 自动切换列表排序为按命中率 `K / M` 降序；卡片标注 `命中 K/M 食材`（若 `K < M` 附注 `缺: {未命中食材名}`） |
| `M >= 2` | **严格全部包含**（`strict_all`，手动切换） | 菜谱命中食材数 `K == M`（`AND` 交集，必须全部用到） | 保持用户当前所选排序；卡片标注 `包含全部 M 种所选食材` |

- **4. 边界与降级兜底**：已选包含食材达到上限 `8` 种后，其余未选食材芯片置灰禁用并轻提示 `最多同时选择 8 种食材`。
- **5. 下游消费索引**：[PAGE-SRCH-01 找菜谱检索主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) · [PAGE-SRCH-02 多维复合筛选面板](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) · [AC-SRCH-01 同义词联想与双模匹配验收](../08-verification/acceptance-criteria.md#ac-srch-01)

---

## <a id="rule-srch-03"></a>3. `RULE-SRCH-03`：主动检索下个人忌口显隐与温和预警规则

- **1. 触发时机与适用范围**：用户在“找菜谱”主动发起搜索筛选，或从搜索/外链进入某道含本人忌口食材的“菜谱详情页”时。
- **2. 输入依赖契约**：[DOM-USR-DietaryProfile 个人饮食档案](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)（忌口大类 `avoid_tags`、自定义忌口 `avoid_ingredient_ids`）、[DOM-RCP-RecipeIngredient 菜谱结构化食材项](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)（含替代说明 `substitute_note`）。
- **3. 核心判定逻辑**（严格区分“首页被动推荐”与“用户主动搜索”）：
  1. **默认不暗中屏蔽**：不同于今日三餐的一票否决硬过滤，用户在检索页主动搜菜（例如替不忌口的家人搜一道油焖大虾）时，默认**不自动开启忌口剔除**，防止用户搜不到客观存在的菜谱而误判题库缺失。
  2. **显式一键排除开关**：在 [PAGE-SRCH-02 复合筛选面板](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) 提供 `[ ] 一键排除我的个人忌口` 开关；用户主动开启后，才将个人忌口并入排除集严格过滤。
  3. **温和预警与替代提示**：当未开启排除开关且结果卡片或详情页命中个人忌口时，在卡片与详情对应食材行醒目展示橙色徽章 `⚠️ 含你的忌口: {名称}`；若该食材配有替代说明（`substitute_note`，如“点缀香菜可省去”），一并在食材行下方透出。
- **4. 边界与降级兜底**：尚未设置任何忌口的用户，筛选面板内的“一键排除我的个人忌口”开关置灰并附引导提示。
- **5. 下游消费索引**：[PAGE-SRCH-01 找菜谱检索主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) · [PAGE-SRCH-02 多维复合筛选面板](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) · [PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) · [AC-SRCH-02 主动搜忌口预警与零结果验收](../08-verification/acceptance-criteria.md#ac-srch-02)

---

## <a id="rule-srch-04"></a>4. `RULE-SRCH-04`：复合筛选布尔组合与零结果阶梯放宽规则

- **1. 触发时机与适用范围**：实时试算复合筛选面板底部的匹配总数（`查看匹配的 N 道菜谱`）及正式渲染检索结果列表时。
- **2. 输入依赖契约**：[DOM-RCP-Recipe 菜谱聚合根](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)、[ENUM-PLN-SortOrder 列表排序方式枚举](../02-domain-model/meal-and-collection/enums.md#enum-pln-sortorder)。
- **3. 多维布尔组合运算规则**：
  - **跨筛选维度之间一律取 `AND` 交集**：`关键词 ∧ 仅看已收藏 ∧ 包含食材条件 ∧ ¬排除食材 ∧ 菜系组 ∧ 辣度组 ∧ 耗时上限 ∧ 难度组 ∧ 健康标签组 ∧ 厨具组`。
  - **同一维度多选内部关系**：`菜系`、`辣度`、`难度`、`厨具` 组内多选为 `OR` 并集；`健康标签` 组内多选为 `AND` 交集；`排除食材` 组内多选为 `NOR`（均不包含）。
- **4. 零结果（`N == 0`）阶梯放宽诊断兜底**：
  当多维交集命中 `0` 道菜谱时，后台自动试算“单独解除某一项最严苛条件后可恢复召回的菜谱数”，在零结果卡片上最多生成 `2` 颗收益最高的一键放宽按钮（固定诊断优先级：① 将包含食材“严格全部包含 `strict_all`”放宽为“智能匹配度排序 `smart_rank`”；② 关闭“仅看已收藏”扩大至全站菜谱库；③ 放宽“耗时上限”或冲突的“辣度/菜系”限制），并在下方附带 `3` 道近似高分菜谱兜底。
- **5. 下游消费索引**：[FLOW-DISC-01 复合检索与零结果放宽流](../04-ia-and-flows/flows/search-and-collection.md#flow-disc-01) · [PAGE-SRCH-01 找菜谱检索主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) · [AC-SRCH-02 主动搜忌口预警与零结果验收](../08-verification/acceptance-criteria.md#ac-srch-02)
