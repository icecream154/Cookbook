# 5-1. 跨页复用业务组件规格（`COMP-*`）

## <a id="comp-recipecard"></a>1. `COMP-RecipeCard`（菜谱摘要卡片）

### 1.1 基础构成与数据绑定
绑定实体：[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe)、[DOM-PLN-FavoriteRecord](../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord)。
- **媒体缩略区**：`cover_image_url` + 左上角配餐角色角标（`dish_role`）+ 右下角视频时长徽章（当 `video_url` 非空时展示 `▶ mm:ss`）。
- **核心信息区**：`title`（单行截断）+ 量化摘要行（`cuisine · total_time_min分 · spiciness文案 · calories_per_serving kcal/人`）。
- **右上常驻红心热区**：独立点击区域（`32×32px` 防误触），已登录且在收藏中渲染实心红心 `♥`，否则渲染空心 `♡`；点击统一遵循 [FLOW-DISC-02](../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02)。
- **主热区跳转**：点击除红心与局部操作按钮外的卡片区域，进入 [PAGE-COOK-01 菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)。

### 1.2 场景变体矩阵（Variants）

| 变体标识 | 挂载页面 | 专属附加元素与规则绑定 |
| :--- | :--- | :--- |
| `Variant: meal_plan` | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | • 展示 [RULE-PLAN-03](../03-business-rules/meal-recommendation.md#rule-plan-03) 生成的个性化命中理由标签（最多 2 项）<br>• 右下角附带 `[⇄ 换一道]` 局部替换按钮<br>• 点击主卡片跳转时显式传递 `applied_servings` |
| `Variant: search_hit` | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) | • 勾选包含食材时展示 [RULE-SRCH-02](../03-business-rules/search-and-matching.md#rule-srch-02) 命中进度标（如 `命中 2/3 食材 · 缺:青椒`）<br>• 命中用户忌口时展示 [RULE-SRCH-03](../03-business-rules/search-and-matching.md#rule-srch-03) 温和预警标 `⚠️ 含忌口` |
| `Variant: favorite_item` | [PAGE-FAV-01](../06-pages/favorites/favorites-list.md#page-fav-01) | • 精简无换菜按钮；点击红心取消收藏时强制触发 [PAT-UndoSnackbar](./interaction-patterns.md#pat-undosnackbar) |

---

## <a id="comp-servingsstepper"></a>2. `COMP-ServingsStepper`（目标用餐人数调节控件）

- **复用位置**：[PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)（食材区头部与手机底栏）、[PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01)（4口及以上微调）。
- **边界约束**：最小值为 `1`，最大值为 `8`，步进刻度为 `1`。达到边界值时对应 `[-]` 或 `[+]` 按钮置为禁用态。
- **状态反馈**：在详情页内若当前数值 `!= recipe.base_servings`，控件旁联动激活高亮提示文案 `已按 N 人份折算`。

---

## <a id="comp-searchbar"></a>3. `COMP-SearchBar`（三态搜索输入框）

- **复用位置**：[PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)（全功能态）、[PAGE-FAV-01](../06-pages/favorites/favorites-list.md#page-fav-01)（页内本地轻量态）。
- **状态迁移契约**：
  1. `Idle`（失焦空值）：显示放大镜图标与场景占位符。
  2. `FocusedEmpty`（聚焦无字符，仅 `PAGE-SRCH-01` 启用）：下拉浮层展示本地最近 10 条搜索词（可清空）与时令热搜词芯片。
  3. `Typing`（输入 `>= 1` 字符，`250ms` 防抖）：右侧显示 `✕` 一键清空按钮；在 `PAGE-SRCH-01` 按 [RULE-SRCH-01](../03-business-rules/search-and-matching.md#rule-srch-01) 展示同义标准食材快捷过滤入口与菜名联想。
