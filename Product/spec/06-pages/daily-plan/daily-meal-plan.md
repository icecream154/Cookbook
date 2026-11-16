# <a id="page-plan-01"></a>`PAGE-PLAN-01`：今日菜谱推荐主页

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-PLAN-01` · 今日菜谱推荐主页 |
| **视图载体与层级** | `L1` 一级常驻导航默认首屏（Tab 1，开启 Keep-Alive 状态与滚动位保活） |
| **访问权限与游客策略** | 游客直接可读（`profile_source == 'default'` 时按默认 2 人一荤一素渲染时令套餐并展示定制横幅；卡片点击收藏时触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume)） |
| **路由入参与上下文继承** | 读取当日 [DOM-PLN-DailyMealPlan](../../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan) 缓存及最新 [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 时间戳 |
| **上游进入入口** | 应用冷启动默认落点、全局一级导航栏切换、[PAGE-COMM-01](../common-and-onboarding/onboarding-wizard.md#page-comm-01) 完成跳入、[PAGE-FAV-01](../favorites/favorites-list.md#page-fav-01) 空态探索入口 |
| **下游跳转出口与无栈兜底** | 展开子抽屉 [PAGE-PLAN-02 食材汇总](./ingredient-summary-drawer.md#page-plan-02)、`Push` 进入 [PAGE-COOK-01 菜谱详情](../recipe-consumption/recipe-detail.md#page-cook-01) 或 [PAGE-PROF-02 档案编辑](../user-profile/dietary-archive-editor.md#page-prof-02)、唤起 `PAGE-COMM-01` |
| **关联可交互画板** | [daily-plan.html](../../08-verification/prototypes/pages/daily-plan.html) · 跨页动线 [flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-CardGrid](../../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 底部 `60px` 4-Tab 栏常驻；页头与画像胶囊条随流滚动，早/午/晚三餐分组内部采用 **`1` 列纵向卡片流**，支持早中晚快速锚点定位 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-CardGrid](../../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 左侧 `76px` 导航轨常驻；每个餐次分组容器内部升级为 **`2` 列等宽网格**并排展示同餐荤素搭配 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-CardGrid](../../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 左侧 `220px` 侧栏常驻；`1200px` 居中版心内，每个餐次分组采用 **`3` 列宽幅卡片网格**，一屏完整平铺“两菜一汤 / 三菜一汤”全貌 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 页头日期与买菜汇总入口 | 日期时段问候标题 + 右侧 `[🛒 今日食材汇总]` 主入口按钮 | [DOM-PLN-DailyMealPlan](../../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan) `plan_date` | 常驻显示 |
| **B2** | 生效画像摘要与快捷人数栏 | 快捷人数切换胶囊（`1人 / 2人 / 三口之家 / 4人+`）+ 辣度上限/忌口摘要芯片 + `[调整偏好 >]` 链接 | [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)、[ENUM-USR-HouseholdSize](../../02-domain-model/user-profile/enums.md#enum-usr-householdsize) | 常驻；忌口超 `2` 项时折叠显示 `忌口:香菜等N项` |
| **B3** | 条件状态通知横幅 | 橙色游客定制引导横幅 / 蓝色画像变更温和重算确认条 | `profile_source`、[TERM-PLN-03 画像待刷新态](../../02-domain-model/meal-and-collection/terms.md#term-pln-03) | 仅在 `S3_GuestDefault` 或 `S4_ProfileDirty` 态显式挂载，正常已同步态隐藏不占高 |
| **B4** | 早 / 午 / 晚三餐套餐分组区 | 餐次头（餐次名 [ENUM-RCP-MealSlot](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-mealslot) + 配餐结构名 + 预计总耗时/单人总千卡 + `[↻ 整餐换一批]`）+ [COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard) (`variant='meal_plan'`) | `breakfast_items`、`lunch_items`、`dinner_items`、`applied_servings` | 常驻渲染早、午、晚三个分组区块 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_SoloPlan` | 1人食专属配餐态 | 当前生效 `applied_servings == 1`（独居 1 人食档案或顶部切至 1 人） | 午/晚餐仅渲染 `1` 道 `one_dish`“一碗端”有肉有菜快手主食，卡片凸显 `≤15分钟`、`一锅出少洗碗` 命中理由 | 换菜、查看食材汇总、切换人数胶囊或点进详情 |
| `S2_FamilyPlan` | 三口之家（两菜一汤）配餐态 | 当前生效 `applied_servings == 3`（家庭多口配餐） | 午/晚餐按 `1 主荤 + 1 时蔬 + 1 汤羹` 组合渲染，凸显 `宝宝免辣`、`同餐主材不重样` 命中标签 | 单菜换一道、整餐换一批、点开汇总抽屉或进详情 |
| `S3_GuestDefault` | 未定制游客通用兜底态 | 新访客跳过引导，当前 `profile_source == 'default'` | 顶部挂载橙色虚线引导横幅 `🎯 30秒定制口味与忌口，获取专属三餐`，下方按默认 2 人一荤一素展示普适时令菜 | 点击横幅唤起 `PAGE-COMM-01` 定制，或直接浏览使用默认推荐 |
| `S4_ProfileDirty` | 饮食档案已更新待重算确认态 | 当日菜单已生成且命中 [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03)（`profile.updated_at > plan.generated_at`） | 顶部挂载蓝色温和确认条：`检测到饮食档案已更新，是否立即重算今日菜单？` 附 `[立即重新生成]` 与 `[保持原菜单]` 双按钮，下方原菜单完好保留不闪变 | 点击 `[立即重新生成]` 重算切回 `S1/S2`，或点 `[保持原菜单]` 收起横幅维持当日原菜品 |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 当日首次打开或冷启动初始化 | [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | [RULE-PLAN-01](../../03-business-rules/meal-recommendation.md#rule-plan-01) ~ [RULE-PLAN-03](../../03-business-rules/meal-recommendation.md#rule-plan-03) | 生成并缓存当日三餐卡片与推荐理由 | [EVT-04](../../07-metrics-and-tracking/event-dictionary.md#evt-04) (`trigger='first_load'`) |
| 点击单张卡片右下 `[⇄ 换一道]` | 按钮请求期防重入 | [RULE-PLAN-04](../../03-business-rules/meal-recommendation.md#rule-plan-04) | 仅该槽位卡片局部脉冲微加载，替换为同角色且主材不与同餐其他菜冲突的新菜谱 | [EVT-05](../../07-metrics-and-tracking/event-dictionary.md#evt-05) (`scope='dish'`) |
| 点击餐次头 `[↻ 整餐换一批]` | — | [RULE-PLAN-04](../../03-business-rules/meal-recommendation.md#rule-plan-04) | 重算当前餐次下所有槽位组合，其余两餐锁定不变 | [EVT-05](../../07-metrics-and-tracking/event-dictionary.md#evt-05) (`scope='meal'`) |
| 点击顶部快捷人数胶囊切换档位 | — | [RULE-PLAN-02](../../03-business-rules/meal-recommendation.md#rule-plan-02) | 立即按新人数档位重算三餐套餐槽位结构（如 1 人一碗端 ↔ 3 人两菜一汤） | [EVT-04](../../07-metrics-and-tracking/event-dictionary.md#evt-04) (`trigger='quick_servings'`) |
| 在 `S4_ProfileDirty` 点击 `[立即重新生成]` | — | [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03) + [RULE-PLAN-01](../../03-business-rules/meal-recommendation.md#rule-plan-01) + [RULE-PLAN-02](../../03-business-rules/meal-recommendation.md#rule-plan-02) | 按最新档案重算今日三餐，更新 `generated_at` 并平滑收起蓝色确认条 | [EVT-04](../../07-metrics-and-tracking/event-dictionary.md#evt-04) (`trigger='profile_refresh'`) |
| 点击页头 `[🛒 今日食材汇总]` | — | [RULE-PLAN-05](../../03-business-rules/meal-recommendation.md#rule-plan-05) | 在 `Z50` 层展开附属抽屉 `PAGE-PLAN-02` | [EVT-06](../../07-metrics-and-tracking/event-dictionary.md#evt-06) (`action='open'`) |
| 点击任一 `COMP-RecipeCard` 主体 | — | [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) | `Push` 进入 `PAGE-COOK-01` 并透传当前 `applied_servings` 与 `entry_source='daily_plan'` | [EVT-09](../../07-metrics-and-tracking/event-dictionary.md#evt-09) (`entry_source='daily_plan'`) |
