# <a id="page-plan-01"></a>`PAGE-PLAN-01`：今日菜谱推荐主页

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-PLAN-01` · 一级导航默认首屏（Tab 1） |
| **访问权限** | 游客可读（未建档展示通用时令兜底推荐） |
| **上游入口** | 应用启动首页、导航栏切换、[PAGE-COMM-01](../common-and-onboarding/onboarding-wizard.md#page-comm-01) 完成跳入 |
| **下游出口** | [PAGE-PLAN-02 食材汇总抽屉](./ingredient-summary-drawer.md#page-plan-02)、[PAGE-COOK-01 菜谱详情](../recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-PROF-02 档案编辑](../user-profile/dietary-archive-editor.md#page-prof-02) |
| **配套画板原型** | [daily-plan.html](../../08-verification/prototypes/pages/daily-plan.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 三餐分组纵向单列卡片流，支持餐次锚点平滑定位 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 每个餐次区块内部采用 2 列网格并排展示同餐搭配菜品 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 每个餐次区块内部采用 3 列宽幅网格卡片，直观呈现“两菜一汤 / 三菜一汤”全貌 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 复用组件或控件 | 绑定实体字段（`DOM-*`） | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **页头与汇总入口** | 日期时段问候 + `[🛒 今日食材汇总 (N)]` 按钮 | [DOM-PLN-DailyMealPlan](../../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan) `plan_date` | 常驻 |
| **生效画像胶囊栏** | 快捷人数胶囊 `1人~4人+` + 辣度/忌口摘要芯片 + `[调整偏好 >]` | [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) | 常驻 |
| **条件状态通知横幅** | 游客定制引导条 / 画像变更温和重算确认条 | `profile_source` / [TERM-PLN-03 画像待刷新态](../../02-domain-model/meal-and-collection/terms.md#term-pln-03) | 仅在 `default` 态或待刷新态显式出现 |
| **早 / 午 / 晚餐套餐区** | 餐次头（配餐结构名 + 耗时热量合计 + `[↻ 整餐换一批]`）+ [COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard) (`Variant: meal_plan`) | `breakfast_items` / `lunch_items` / `dinner_items` | 常驻渲染三餐 |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_SoloPlan` | 1人食专属配餐态 | 正餐呈现单道 `一碗端` 结构，命中标签凸显快手低负担 |
| `S2_FamilyPlan` | 三口之家（两菜一汤）配餐态 | 正餐呈现 `1主荤 + 1时蔬 + 1汤羹` 组合，凸显儿童免辣与营养均衡 |
| `S3_GuestDefault` | 未定制游客通用兜底态 | 顶部展示橙色 `30秒定制专属三餐` 引导卡，默认按 2 人一荤一素展示 |
| `S4_ProfileDirty` | 饮食档案已更新待重算确认态 | 顶部展示蓝色非阻塞确认条 `[立即重新生成] / [保持今日原菜单]` |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 页面首次曝光加载三餐 | [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | [RULE-PLAN-01](../../03-business-rules/meal-recommendation.md#rule-plan-01) ~ [RULE-PLAN-03](../../03-business-rules/meal-recommendation.md#rule-plan-03) | 渲染三餐套餐卡片与命中理由 | [EVT-04](../../07-metrics-and-tracking/event-dictionary.md#evt-04) |
| 点击单张菜品卡 `[⇄ 换一道]` | — | [RULE-PLAN-04](../../03-business-rules/meal-recommendation.md#rule-plan-04) | 原槽位局部微加载后替换为同角色互斥新菜品 | [EVT-05](../../07-metrics-and-tracking/event-dictionary.md#evt-05) (`scope='dish'`) |
| 点击餐次头部 `[↻ 整餐换一批]` | — | [RULE-PLAN-04](../../03-business-rules/meal-recommendation.md#rule-plan-04) | 仅重算该餐次下所有槽位，其余两餐不动 | [EVT-05](../../07-metrics-and-tracking/event-dictionary.md#evt-05) (`scope='meal'`) |
| 点击确认条 `[立即重新生成]` 或切换顶部人数胶囊 | — | [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03) + [RULE-PLAN-02](../../03-business-rules/meal-recommendation.md#rule-plan-02) | 全量重算今日三餐并收起待刷新横幅 | [EVT-04](../../07-metrics-and-tracking/event-dictionary.md#evt-04) |
| 点击 `[🛒 今日食材汇总]` | — | [RULE-PLAN-05](../../03-business-rules/meal-recommendation.md#rule-plan-05) | 唤起子抽屉 `PAGE-PLAN-02` | [EVT-06](../../07-metrics-and-tracking/event-dictionary.md#evt-06) |
| 点击任意 `COMP-RecipeCard` 主体 | — | [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) | 携带 `applied_servings` 跳转 `PAGE-COOK-01` | [EVT-09](../../07-metrics-and-tracking/event-dictionary.md#evt-09) (`from='daily_plan'`) |
