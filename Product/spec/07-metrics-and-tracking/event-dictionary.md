# 07-2. 关键业务事件采集字典（`EVT-*`）

本文档严格遵循元规范 [03-authoring-templates.md 第 2.7.2 节](../../meta/03-authoring-templates.md#tpl-event-dict) 与 [02-id-and-traceability.md 铁律 5](../../meta/02-id-and-traceability.md#rule-5)，声明支撑全部业务指标计算的 **4 项全局公共属性**、**上报防重幂等规约**与 **12 项核心业务埋点契约**，不采集任何无指标消费的冗余事件。

---

## 1. 全局公共上下文属性契约表（Super Properties）

以下公共属性由前端埋点底座统一自动注入每次事件载荷，单页与组件无需重复手工拼装：

| 公共属性名 | 中文语义名 | 数据类型 | 取值枚举 / 领域引用 | 采集时机与缺省兜底说明 |
| :--- | :--- | :--- | :--- | :--- |
| `session_id` | 会话唯一标识 | `String` | UUID v4 字符串 | 应用冷启动或后台静置超 `30` 分钟重开时刷新生成，用于漏斗会话级去重 |
| `auth_state` | 当前鉴权状态 | `Enum` | `'guest'`（游客）/ `'logged_in'`（已登录） | 读取实时鉴权态（注：`EVT-03` 完成认证瞬间固定上报变更后的 `'logged_in'`） |
| `profile_source` | 饮食档案状态源 | `Enum` | `'default'`（默认）/ `'local_draft'`（本地草稿）/ `'cloud_synced'`（云同步） | 绑定 [DOM-USR-DietaryProfile 个人饮食档案](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 当前生效来源 |
| `viewport_shell` | 当前视口容器壳 | `Enum` | `'mobile'` / `'tablet'` / `'desktop'` | 实时匹配 [04-1 三端视口容器壳断点](../04-ia-and-flows/ia-and-shell.md)（`<768` / `768~1023` / `>=1024`） |

---

## 2. 上报去重、防抖与幂等通用规约（Idempotency & Debounce Rules）

1. **渲染曝光幂等去重**：`EVT-04`（今日三餐渲染）与 `EVT-09`（菜谱详情浏览）仅在页面首次初始化完成或发生显式重算刷新时上报 `1` 次；用户跨一级导航保活（Keep-Alive）切回、窗口缩放触发断点重排、或从附属抽屉关闭回到宿主页面时**严禁重复上报**。
2. **检索防抖与输入法保护**：`EVT-07`（执行复合检索）必须在中文输入法选词上屏（`compositionend`）且通过 `250ms` 防抖真正刷新结果列表后上报，严禁在拼音敲击过程中逐字符刷量。
3. **步进器连续调节收敛**：用户在详情页连续快速点击 `[-]` / `[+]` 调整人数时，`EVT-10`（手动折算份量）按 `500ms` 静默收敛窗口上报最终稳定停留的目标人数（`target_servings`），避免从 2 人连点到 6 人产生 4 条中间过程噪音。
4. **乐观更新与失败过滤**：`EVT-02`（保存档案）、`EVT-03`（完成认证）、`EVT-12`（收藏增删）均以业务校验与落库成功为准；若后端因断网最终失败回滚，不得计入成功转化事件。

---

## 3. 关键业务事件注册表（`EVT-01 ~ EVT-12`）

| 事件 ID | 事件英文标识与中文名 | 触发载体（附中文名称） | 精确触发时机与防重条件 | 必传私有属性契约（`字段名（中文名）: 类型 = 取值约束`） | 消费该事件的业务指标 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="evt-01"></a>**EVT-01** | `onboarding_action`<br>偏好引导向导进出 | [PAGE-COMM-01 5步偏好引导向导](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01) | 进入第 1 步向导首屏时，或中途点击右上角 `[跳过先逛]` 退出时触发 | • `action`（动作类型）: `'enter' \| 'skip'`<br>• `step_no`（所在步骤号）: `Int`（`1..5`） | [MET-01 建档完成率与接续率](./metrics-funnel.md#met-01) |
| <a id="evt-02"></a>**EVT-02** | `dietary_profile_saved`<br>保存个人饮食档案 | [PAGE-COMM-01 5步偏好引导向导](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01)、[PAGE-PROF-02 饮食档案编辑页](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) | 完成向导第 5 步生成菜单，或在档案编辑页点击 `[保存饮食档案]` 落盘成功时触发 | • `source`（保存入口）: `'wizard' \| 'editor'`<br>• `household_size`（期望人数）: [ENUM-USR-HouseholdSize 人数档位](../02-domain-model/user-profile/enums.md#enum-usr-householdsize)<br>• `max_spiciness`（最高辣度）: [ENUM-RCP-Spiciness 辣度分级](../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)<br>• `avoid_count`（忌口总数）: `Int`（`>= 0`）<br>• `health_tags`（健康标签组）: [ENUM-USR-HealthTag 健康标签](../02-domain-model/user-profile/enums.md#enum-usr-healthtag) | [MET-01 建档完成率与接续率](./metrics-funnel.md#met-01) |
| <a id="evt-03"></a>**EVT-03** | `auth_completed`<br>完成快捷注册登录认证 | [PAGE-COMM-02 快捷认证弹窗](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) | 6 位验证码校验成功且完成 [RULE-SYNC-02 本地与云端旧档案裁决](../03-business-rules/identity-and-sync.md#rule-sync-02) 落库后触发 `1` 次 | • `is_new_user`（是否新注册）: `Boolean`<br>• `has_pending_action`（是否由 [PAT-AuthResume 未登录拦截](../05-components-and-patterns/interaction-patterns.md#pat-authresume) 唤起）: `Boolean`<br>• `merge_resolution`（裁决结果）: `'auto' \| 'keep_local' \| 'keep_cloud'` | [MET-01 建档完成率与接续率](./metrics-funnel.md#met-01) |
| <a id="evt-04"></a>**EVT-04** | `daily_plan_rendered`<br>今日三餐方案渲染完成 | [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 当日三餐套餐卡片首次加载完毕，或因确认刷新/切换快捷人数全量重算完毕时触发（保活切回不重报） | • `applied_servings`（生效人数）: `Int`（`1..8`）<br>• `trigger`（触发缘由）: `'first_load' \| 'profile_refresh' \| 'quick_servings'` | [MET-02 三餐推荐采纳率](./metrics-funnel.md#met-02) |
| <a id="evt-05"></a>**EVT-05** | `meal_plan_swapped`<br>触发今日菜品换一换 | [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[COMP-RecipeCard 菜谱卡片](../05-components-and-patterns/shared-components.md#comp-recipecard) | 点击单张卡片 `[⇄ 换一道]` 或餐次头部 `[↻ 整餐换一批]` 完成替换后触发 | • `scope`（替换粒度）: `'dish'`（单菜）/ `'meal'`（整餐）<br>• `meal_slot`（所属餐次）: [ENUM-RCP-MealSlot 每日餐次](../02-domain-model/recipe-catalog/enums.md#enum-rcp-mealslot)<br>• `dish_role`（槽位角色）: `String`（整餐传 `'all'`） | [MET-02 三餐推荐采纳率](./metrics-funnel.md#met-02) |
| <a id="evt-06"></a>**EVT-06** | `ingredient_summary_used`<br>使用今日食材汇总清单 | [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-PLAN-02 今日食材汇总抽屉](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) | 点击打开食材汇总抽屉，或在抽屉内点击 `[📋 复制买菜清单]` 成功写入剪贴板时触发 | • `action`（交互动作）: `'open' \| 'copy'`<br>• `selected_meals_count`（勾选餐次数）: `Int`（`1..3`）<br>• `merged_item_count`（合并后食材种数）: `Int`（`>= 0`） | [MET-NSM 周有效下厨用户](./metrics-funnel.md#met-nsm)、[MET-02 三餐推荐采纳率](./metrics-funnel.md#met-02) |
| <a id="evt-07"></a>**EVT-07** | `recipe_search_executed`<br>执行菜谱复合检索 | [PAGE-SRCH-01 找菜谱主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-SRCH-02 复合筛选面板](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) | 提交关键词、点击抽屉确认主按钮、或桌面常驻栏勾选经 `250ms` 防抖返回检索列表时触发 | • `has_keyword`（是否含关键词）: `Boolean`<br>• `include_ing_count`（包含食材数）: `Int`（`0..8`）<br>• `ing_match_mode`（匹配模式）: [ENUM-PLN-IngMatchMode 多食材匹配模式](../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode)<br>• `only_fav`（仅看已收藏）: `Boolean`<br>• `result_count`（命中菜谱数）: `Int`（`>= 0`） | [MET-03 检索点击与零结果率](./metrics-funnel.md#met-03) |
| <a id="evt-08"></a>**EVT-08** | `zero_result_relaxed`<br>点击零结果一键放宽条件 | [PAGE-SRCH-01 找菜谱主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) | 处于零结果态（`S4_ZeroResultFallback`）点击任一阶梯放宽恢复按钮并完成重查后触发 | • `relaxed_dimension`（放宽维度）: `'ing_mode' \| 'only_fav' \| 'time' \| 'spiciness' \| 'reset_all'`<br>• `recovered_count`（恢复召回数）: `Int`（`>= 0`） | [MET-03 检索点击与零结果率](./metrics-funnel.md#met-03) |
| <a id="evt-09"></a>**EVT-09** | `recipe_detail_viewed`<br>访问菜谱详情页 | [PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 从任意入口打开详情页完成初始人数折算与首屏渲染时触发（从跟做视图退出返回不重报） | • `recipe_id`（菜谱主键）: `String`<br>• `entry_source`（进入来源）: `'daily_plan' \| 'search' \| 'favorites' \| 'history'`<br>• `init_servings`（初始折算人数）: `Int`（`1..8`） | [MET-02 三餐采纳率](./metrics-funnel.md#met-02)、[MET-03 检索转化率](./metrics-funnel.md#met-03)、[MET-04 跟做启动率](./metrics-funnel.md#met-04)、[MET-05 详情收藏率](./metrics-funnel.md#met-05) |
| <a id="evt-10"></a>**EVT-10** | `servings_scaled`<br>手动调整菜谱份量换算 | [COMP-ServingsStepper 目标人数步进器](../05-components-and-patterns/shared-components.md#comp-servingsstepper)（挂载于详情页） | 在详情页点击 `[-]` / `[+]` 改变目标人数并经 `500ms` 静默收敛后触发 | • `recipe_id`（菜谱主键）: `String`<br>• `base_servings`（配方基准人份）: `Int`<br>• `target_servings`（调整后目标人数）: `Int`（`1..8`） | [MET-NSM 周有效下厨用户](./metrics-funnel.md#met-nsm) |
| <a id="evt-11"></a>**EVT-11** | `cooking_focus_progressed`<br>全屏跟做模式启动与完播 | [PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-COOK-02 全屏分步跟做视图](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) | 点击 `[🍳 开始跟做]` 打开覆盖层（`start`），或在第 N 步点击 `[🎉 完成出锅]`（`complete`）时触发 | • `recipe_id`（菜谱主键）: `String`<br>• `stage`（跟做阶段）: `'start' \| 'complete'`<br>• `used_timer`（全程是否用过倒计时）: `Boolean` | [MET-NSM 周有效下厨用户](./metrics-funnel.md#met-nsm)、[MET-04 跟做启动与完播率](./metrics-funnel.md#met-04) |
| <a id="evt-12"></a>**EVT-12** | `recipe_favorite_toggled`<br>收藏增删与撤销恢复 | [COMP-RecipeCard 菜谱卡片](../05-components-and-patterns/shared-components.md#comp-recipecard)、[PAGE-COOK-01 多媒体菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) | 已登录（含拦截认证刚完成自动接续）点亮收藏、取消收藏，或在 `4000ms` 内点击撤销恢复时触发 | • `recipe_id`（菜谱主键）: `String`<br>• `action`（收藏动作）: `'add' \| 'remove' \| 'undo_restore'`<br>• `page_id`（触发所在页面编码）: `String` | [MET-05 净收藏与复访率](./metrics-funnel.md#met-05) |
