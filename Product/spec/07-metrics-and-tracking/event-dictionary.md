# 07-2. 关键业务事件采集字典（`EVT-*`）

本文档严格遵循元规范 [03-authoring-templates.md 第 2.7.2 节](../../meta/03-authoring-templates.md#tpl-event-dict) 与 [02-id-and-traceability.md 铁律 5](../../meta/02-id-and-traceability.md#rule-5)，声明支撑全部 `MET-*` 指标计算的 **4 项全局公共属性**、**上报防重幂等规约**与 **12 项核心业务埋点契约**，不采集任何无指标消费的冗余事件。

---

## 1. 全局公共上下文属性契约表（Super Properties）

以下公共属性由前端埋点底座统一自动注入每次 `EVT-*` 事件载荷，单页与组件无需重复手工拼装：

| 公共属性名 | 数据类型 | 取值枚举 / 领域引用 | 采集时机与缺省兜底说明 |
| :--- | :--- | :--- | :--- |
| `session_id` | `String` | UUID v4 会话唯一标识 | 应用冷启动或后台静置超 `30` 分钟重开时刷新生成，用于漏斗会话级（Session）去重 |
| `auth_state` | `Enum` | `'guest' \| 'logged_in'` | 读取当前实时鉴权态（注意：`EVT-03` 完成认证瞬间固定上报变更后的 `'logged_in'`） |
| `profile_source` | `Enum` | `'default' \| 'local_draft' \| 'cloud_synced'` | 绑定 [DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 当前生效档案来源 |
| `viewport_shell` | `Enum` | `'mobile' \| 'tablet' \| 'desktop'` | 实时匹配 [ia-and-shell.md](../04-ia-and-flows/ia-and-shell.md) 三端视口容器壳断点（`<768` / `768~1023` / `>=1024`） |

---

## 2. 上报去重、防抖与幂等通用规约（Idempotency & Debounce Rules）

1. **渲染曝光幂等去重**：`EVT-04`（今日三餐渲染）与 `EVT-09`（详情浏览）仅在页面首次初始化完成或发生显式重算刷新时上报 `1` 次；用户跨一级 Tab Keep-Alive 切回、浏览器窗口缩放触发断点重排、或从子抽屉关闭回到宿主页面时**严禁重复上报**。
2. **检索防抖与输入法保护**：`EVT-07`（执行复合检索）必须在中文输入法选词上屏（`compositionend`）且通过 `250ms` 防抖真正刷新结果列表后上报，严禁在拼音敲击过程中逐字符刷量。
3. **步进器连续调节收敛**：用户在详情页连续快速点击 `[-]` / `[+]` 调整人数时，`EVT-10` 按 `500ms` 静默收敛窗口上报最终稳定停留的 `target_servings`，避免从 2 人点到 6 人产生 4 条中间过程噪音事件。
4. **乐观更新与失败过滤**：`EVT-02`、`EVT-03`、`EVT-12` 均以业务校验通过为准；若后端持久化因断网最终失败回滚，不得计入成功转化事件。

---

## 3. 关键业务事件注册表（`EVT-01 ~ EVT-12`）

| 事件 ID | 事件英文标识与中文名 | 触发载体 (`PAGE-*` / `COMP-*`) | 精确触发时机与防重条件 | 必传私有属性契约（`字段名: 类型 = 取值约束`） | 消费指标 (`MET-*`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="evt-01"></a>**EVT-01** | `onboarding_action`<br>偏好引导向导进出 | [PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01) | 进入第 1 步向导页时，或中途点击右上角 `[跳过先逛]` 退出时触发 | • `action`: `'enter' \| 'skip'`<br>• `step_no`: `Int`（`1..5`，标记进入或跳出时所在步骤序号） | [MET-01](./metrics-funnel.md#met-01) |
| <a id="evt-02"></a>**EVT-02** | `dietary_profile_saved`<br>保存个人饮食档案 | [PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01), [PAGE-PROF-02](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) | 完成向导第 5 步生成菜单，或在档案编辑页点击 `[保存饮食档案]` 落盘成功时触发 | • `source`: `'wizard' \| 'editor'`<br>• `household_size`: `Enum`（[ENUM-USR-HouseholdSize](../02-domain-model/user-profile/enums.md#enum-usr-householdsize)）<br>• `max_spiciness`: `Enum`（[ENUM-RCP-Spiciness](../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)）<br>• `avoid_count`: `Int`（`>= 0`）<br>• `health_tags`: `String[]`（[ENUM-USR-HealthTag](../02-domain-model/user-profile/enums.md#enum-usr-healthtag)） | [MET-01](./metrics-funnel.md#met-01) |
| <a id="evt-03"></a>**EVT-03** | `auth_completed`<br>完成快捷注册登录认证 | [PAGE-COMM-02](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) | 6 位验证码校验成功且完成 [RULE-SYNC-02](../03-business-rules/identity-and-sync.md#rule-sync-02) 双端档案裁决落库后触发 `1` 次 | • `is_new_user`: `Boolean`<br>• `has_pending_action`: `Boolean`（是否由 [PAT-AuthResume](../05-components-and-patterns/interaction-patterns.md#pat-authresume) 唤起）<br>• `merge_resolution`: `'auto' \| 'keep_local' \| 'keep_cloud'` | [MET-01](./metrics-funnel.md#met-01) |
| <a id="evt-04"></a>**EVT-04** | `daily_plan_rendered`<br>今日三餐方案渲染完成 | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 当日三餐套餐卡片首次加载完毕，或因确认刷新/切换快捷人数全量重算渲染完毕时触发（Keep-Alive 切回不重报） | • `applied_servings`: `Int`（`1..8`）<br>• `trigger`: `'first_load' \| 'profile_refresh' \| 'quick_servings'` | [MET-02](./metrics-funnel.md#met-02) |
| <a id="evt-05"></a>**EVT-05** | `meal_plan_swapped`<br>触发今日菜品换一换 | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01), [COMP-RecipeCard](../05-components-and-patterns/shared-components.md#comp-recipecard) | 点击单张卡片 `[⇄ 换一道]` 或餐次头部 `[↻ 整餐换一批]` 完成替换后触发 | • `scope`: `'dish' \| 'meal'`<br>• `meal_slot`: `Enum`（[ENUM-RCP-MealSlot](../02-domain-model/recipe-catalog/enums.md#enum-rcp-mealslot)）<br>• `dish_role`: `String`（整餐替换时传 `'all'`） | [MET-02](./metrics-funnel.md#met-02) |
| <a id="evt-06"></a>**EVT-06** | `ingredient_summary_used`<br>使用今日食材汇总清单 | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01), [PAGE-PLAN-02](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) | 点击打开 `PAGE-PLAN-02` 汇总抽屉，或在抽屉内点击 `[📋 复制买菜清单]` 成功写入剪贴板时触发 | • `action`: `'open' \| 'copy'`<br>• `selected_meals_count`: `Int`（`1..3`）<br>• `merged_item_count`: `Int`（`>= 0`，合并后食材种数） | [MET-NSM](./metrics-funnel.md#met-nsm), [MET-02](./metrics-funnel.md#met-02) |
| <a id="evt-07"></a>**EVT-07** | `recipe_search_executed`<br>执行菜谱复合检索 | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01), [PAGE-SRCH-02](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) | 提交关键词、点击抽屉确认主按钮、或 Web 常驻栏勾选经 `250ms` 防抖返回检索列表时触发 | • `has_keyword`: `Boolean`<br>• `include_ing_count`: `Int`（`0..8`）<br>• `ing_match_mode`: `Enum`（[ENUM-PLN-IngMatchMode](../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode)）<br>• `only_fav`: `Boolean`<br>• `result_count`: `Int`（`>= 0`） | [MET-03](./metrics-funnel.md#met-03) |
| <a id="evt-08"></a>**EVT-08** | `zero_result_relaxed`<br>点击零结果一键放宽条件 | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) | 处于 `S4_ZeroResultFallback` 态点击任一阶梯放宽恢复按钮并完成重查后触发 | • `relaxed_dimension`: `'ing_mode' \| 'only_fav' \| 'time' \| 'spiciness' \| 'reset_all'`<br>• `recovered_count`: `Int`（`>= 0`，放宽后恢复召回的菜谱数） | [MET-03](./metrics-funnel.md#met-03) |
| <a id="evt-09"></a>**EVT-09** | `recipe_detail_viewed`<br>访问菜谱详情页 | [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 从任意入口打开 `PAGE-COOK-01` 完成初始人数折算与首屏渲染时触发（从 `PAGE-COOK-02` 退出返回不重报） | • `recipe_id`: `String`<br>• `entry_source`: `'daily_plan' \| 'search' \| 'favorites' \| 'history'`<br>• `init_servings`: `Int`（`1..8`） | [MET-02](./metrics-funnel.md#met-02), [MET-03](./metrics-funnel.md#met-03), [MET-04](./metrics-funnel.md#met-04), [MET-05](./metrics-funnel.md#met-05) |
| <a id="evt-10"></a>**EVT-10** | `servings_scaled`<br>手动调整菜谱份量换算 | [COMP-ServingsStepper](../05-components-and-patterns/shared-components.md#comp-servingsstepper)（挂载于 `PAGE-COOK-01`） | 在详情页点击 `[-]` / `[+]` 改变目标人数并经 `500ms` 静默收敛后触发 | • `recipe_id`: `String`<br>• `base_servings`: `Int`<br>• `target_servings`: `Int`（`1..8`） | [MET-NSM](./metrics-funnel.md#met-nsm) |
| <a id="evt-11"></a>**EVT-11** | `cooking_focus_progressed`<br>全屏跟做模式启动与完播 | [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01), [PAGE-COOK-02](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) | 点击 `[🍳 开始跟做]` 打开覆盖层（`start`），或在第 N 步点击 `[🎉 完成出锅]`（`complete`）时触发 | • `recipe_id`: `String`<br>• `stage`: `'start' \| 'complete'`<br>• `used_timer`: `Boolean`（跟做全程是否启动过悬浮计时器） | [MET-NSM](./metrics-funnel.md#met-nsm), [MET-04](./metrics-funnel.md#met-04) |
| <a id="evt-12"></a>**EVT-12** | `recipe_favorite_toggled`<br>收藏增删与撤销恢复 | [COMP-RecipeCard](../05-components-and-patterns/shared-components.md#comp-recipecard), [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 已登录（含拦截认证刚完成自动接续）点亮收藏、取消收藏，或在 `4000ms` 内点击撤销恢复时触发 | • `recipe_id`: `String`<br>• `action`: `'add' \| 'remove' \| 'undo_restore'`<br>• `page_id`: `String`（触发所在 `PAGE-*` 编码） | [MET-05](./metrics-funnel.md#met-05) |
