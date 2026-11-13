# 07-2. 关键业务事件字典（`EVT-*`）

## 1. 全局公共上下文属性（随每次事件默认携带）

| 公共属性名 | 取值范围 / 引用领域 | 说明 |
| :--- | :--- | :--- |
| `auth_state` | `'guest'` / `'logged_in'` | 当前是否为已登录账号态 |
| `profile_source` | `'default'` / `'local_draft'` / `'cloud_synced'` | 引用 [DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) |
| `viewport_shell` | `'mobile'` / `'tablet'` / `'desktop'` | 引用 [ia-and-shell.md](../04-ia-and-flows/ia-and-shell.md) 三端断点容器壳 |

---

## 2. 关键业务事件注册表（共 12 项核心事件）

| 事件 ID | 事件英文名与中文名 | 触发载体 (`PAGE-*` / `COMP-*`) | 触发时机（When） | 核心业务私有属性（引用 `DOM-*` / `ENUM-*`） | 支撑指标 (`MET-*`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="evt-01"></a>**EVT-01** | `onboarding_action`<br>偏好引导向导交互 | [PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01) | 打开向导或点击右上角跳过向导时 | `action`: `'enter' \| 'skip'`, `step_no`: `1..5` | [MET-01](./metrics-funnel.md#met-01) |
| <a id="evt-02"></a>**EVT-02** | `dietary_profile_saved`<br>保存个人饮食档案 | [PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01), [PAGE-PROF-02](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) | 完成向导生成菜单或在档案编辑页点击保存成功时 | `source`: `'wizard' \| 'editor'`, `household_size`, `max_spiciness`, `avoid_count`, `health_tags[]` | [MET-01](./metrics-funnel.md#met-01) |
| <a id="evt-03"></a>**EVT-03** | `auth_completed`<br>完成快捷注册/登录认证 | [PAGE-COMM-02](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) | 验证码校验通过并完成档案合并裁决时 | `is_new_user`: `bool`, `has_pending_action`: `bool`, `merge_resolution`: `'auto' \| 'keep_local' \| 'keep_cloud'` | [MET-01](./metrics-funnel.md#met-01) |
| <a id="evt-04"></a>**EVT-04** | `daily_plan_rendered`<br>今日三餐方案生成/曝光 | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 当日三餐卡片组完成加载或重算渲染时 | `applied_servings`, `trigger`: `'first_load' \| 'profile_refresh' \| 'quick_servings'` | [MET-02](./metrics-funnel.md#met-02) |
| <a id="evt-05"></a>**EVT-05** | `meal_plan_swapped`<br>触发今日菜品换一换 | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 点击单菜 `[换一道]` 或餐次 `[整餐换一批]` 时 | `scope`: `'dish' \| 'meal'`, `meal_slot` ([ENUM-RCP-MealSlot](../02-domain-model/recipe-catalog/enums.md#enum-rcp-mealslot)), `dish_role` | [MET-02](./metrics-funnel.md#met-02) |
| <a id="evt-06"></a>**EVT-06** | `ingredient_summary_used`<br>使用今日食材汇总清单 | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01), [PAGE-PLAN-02](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) | 打开今日食材汇总抽屉或点击复制买菜清单时 | `action`: `'open' \| 'copy'`, `selected_meals_count`: `1..3`, `merged_item_count`: `int` | [MET-NSM](./metrics-funnel.md#met-nsm), [MET-02](./metrics-funnel.md#met-02) |
| <a id="evt-07"></a>**EVT-07** | `recipe_search_executed`<br>执行菜谱复合检索 | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01), [PAGE-SRCH-02](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) | 提交关键词或变更任意筛选条件刷新结果列表时 | `has_keyword`: `bool`, `include_ing_count`: `int`, `ing_match_mode` ([ENUM-PLN-IngMatchMode](../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode)), `only_fav`: `bool`, `result_count`: `int` | [MET-03](./metrics-funnel.md#met-03) |
| <a id="evt-08"></a>**EVT-08** | `zero_result_relaxed`<br>点击零结果一键放宽条件 | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) | 检索结果为 0 时点击空状态放宽建议按钮 | `relaxed_dimension`: `'ing_mode' \| 'only_fav' \| 'time' \| 'reset_all'`, `recovered_count`: `int` | [MET-03](./metrics-funnel.md#met-03) |
| <a id="evt-09"></a>**EVT-09** | `recipe_detail_viewed`<br>访问菜谱详情页 | [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 从任意来源打开菜谱详情完成初始化时 | `recipe_id`, `entry_source`: `'daily_plan' \| 'search' \| 'favorites' \| 'history'`, `init_servings`: `int` | [MET-02](./metrics-funnel.md#met-02), [MET-03](./metrics-funnel.md#met-03), [MET-04](./metrics-funnel.md#met-04), [MET-05](./metrics-funnel.md#met-05) |
| <a id="evt-10"></a>**EVT-10** | `servings_scaled`<br>手动调整菜谱份量换算 | [COMP-ServingsStepper](../05-components-and-patterns/shared-components.md#comp-servingsstepper) (`PAGE-COOK-01`) | 在详情页点击 `[-]` / `[+]` 改变目标人数时 | `recipe_id`, `base_servings`, `target_servings` | [MET-NSM](./metrics-funnel.md#met-nsm) |
| <a id="evt-11"></a>**EVT-11** | `cooking_focus_progressed`<br>全屏跟做模式启动与完成 | [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01), [PAGE-COOK-02](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) | 点击 `[开始跟做]` 进入或点击最后一步 `[完成出锅]` 时 | `recipe_id`, `stage`: `'start' \| 'complete'`, `used_timer`: `bool` | [MET-NSM](./metrics-funnel.md#met-nsm), [MET-04](./metrics-funnel.md#met-04) |
| <a id="evt-12"></a>**EVT-12** | `recipe_favorite_toggled`<br>收藏或取消收藏菜谱 | [COMP-RecipeCard](../05-components-and-patterns/shared-components.md#comp-recipecard), [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 登录用户点亮红心、取消收藏或点击 4 秒撤销恢复时 | `recipe_id`, `action`: `'add' \| 'remove' \| 'undo_restore'`, `page_id` | [MET-05](./metrics-funnel.md#met-05) |
