# <a id="page-fav-01"></a>`PAGE-FAV-01`：我的收藏夹主页

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-FAV-01` · 我的收藏夹主页 |
| **视图载体与层级** | `L1` 一级常驻导航收藏空间（Tab 3，开启 Keep-Alive 保留页内快筛词、角色胶囊与滚动坐标） |
| **访问权限与游客策略** | **允许游客直接切入浏览**（渲染 `S4_GuestUnauthed` 跨端同步价值引导态，严禁在点击底部 Tab 3 时粗暴拦截弹登录框）；已登录用户读写本人云端收藏 |
| **路由入参与上下文继承** | 订阅全局共享的 [DOM-PLN-FavoriteRecord 菜谱收藏记录](../../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord) 状态源，任一页面新增收藏后切入本页 `0` 延迟可见 |
| **上游进入入口** | 全局一级导航栏 Tab 3 |
| **下游跳转出口与无栈兜底** | `Push` 进入 [PAGE-COOK-01 多媒体菜谱详情](../recipe-consumption/recipe-detail.md#page-cook-01)、唤起 [PAGE-COMM-02 快捷认证弹窗](../common-and-onboarding/auth-modal.md#page-comm-02)、空态跳转 [PAGE-PLAN-01 今日菜谱](../daily-plan/daily-meal-plan.md#page-plan-01) 或 [PAGE-SRCH-01 找菜谱](../recipe-discovery/recipe-search.md#page-srch-01) |
| **关联可交互画板** | [favorites.html](../../08-verification/prototypes/pages/favorites.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile 手机竖屏壳 (<768px)](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-CardGrid 自适应多列网格](../../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 底部 `60px` 4-Tab 栏常驻；单列紧凑卡片流；取消收藏时 `4000ms` 撤销胶囊悬浮于 `bottom: 68px + safe-area` 避让底栏 |
| [SHELL-Tablet 平板横屏壳 (768~1023px)](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-CardGrid 自适应多列网格](../../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 左侧 `76px` 导航轨常驻；收藏列表采用 **`2` 列等宽卡片网格**，撤销胶囊居中悬浮于主区底边上方 `24px` |
| [SHELL-Desktop 桌面宽屏壳 (>=1024px)](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-CardGrid 自适应多列网格](../../04-ia-and-flows/ia-and-shell.md#mode-cardgrid) | 左侧 `220px` 侧栏常驻；`1200px` 版心内页内搜索框与配餐角色胶囊同行并列，下方采用 **`3` 列宽幅卡片网格** |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（附字段与代表项说明） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 页头统计与排序栏 | 标题 `我的收藏夹 (N)` + 排序切换器（最近收藏优先 / 耗时最短优先） | [DOM-PLN-FavoriteRecord 收藏记录](../../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord) 的收藏时间（`favorited_at`）、[ENUM-PLN-SortOrder 列表排序方式](../../02-domain-model/meal-and-collection/enums.md#enum-pln-sortorder) | 已登录且总收藏数 `N > 0` 时显示 |
| **B2** | 页内秒级快筛工具栏 | [COMP-SearchBar 多态搜索框](../../05-components-and-patterns/shared-components.md#comp-searchbar)（收藏本地变体 `favorites_local`）+ 配餐角色横向胶囊 | [ENUM-RCP-DishRole 套餐配餐角色](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-dishrole)（全部 / 主荤 / 时蔬 / 汤羹 / 一碗端 / 主食早点） | 已登录且总收藏数 `N > 0` 时显示 |
| **B3** | 单层私房收藏网格区 | [COMP-RecipeCard 跨页菜谱卡片](../../05-components-and-patterns/shared-components.md#comp-recipecard)（收藏夹变体 `favorite_item`） | [DOM-RCP-Recipe 菜谱核心聚合根](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) | 已登录且当前快筛命中数 `> 0` 时显示（若总收藏 `> 0` 但快筛无匹配，展示 `[清空页内筛选]` 轻空态） |
| **B4** | 专属价值与探索空状态区 | 引导插画 + 场景原因说明 + 双行动按钮 | 遵循 [PAT-ViewStates 全局视图四态契约](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | 处于 `S3_LoggedEmpty` 或 `S4_GuestUnauthed` 时显示 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_LoggedWithItems` | 已登录有收藏正常过滤态 | 已登录且账号收藏总数 `>= 1` | 渲染总数统计、本地秒级搜索框、配餐角色过滤胶囊与实心红心卡片网格 | 输入词条/点选角色秒级过滤、点进详情或点红心移除进入 `S2` |
| `S2_UndoRemoving` | 取消收藏 4 秒防误删撤销态 | 在列表内点击任一卡片实心红心 `♥` 触发移除 | 目标卡片平滑折叠隐去，底部 `Z70` 层浮出黑底胶囊 `已将「XX」移出收藏夹 [撤销]` 持续 `4000ms` | `4000ms` 内点击 `[撤销]` 原序号位无损恢复回 `S1`，或等待超时确认删除 |
| `S3_LoggedEmpty` | 已登录但 0 收藏引导空态 | 已登录且账号收藏总数为 `0` | 展示轻量引导卡：“还没有攒下私房好菜，看到心仪菜谱点亮红心即可一键沉淀” + `[去今日三餐看看]` 与 `[去菜谱库探索]` 双入口 | 点击双入口分别切换至今日菜谱或找菜谱主页 |
| `S4_GuestUnauthed` | 未登录游客引导态 | 未登录游客切换进入 Tab 3 | 展示跨设备云同步与结合收藏检索的价值说明卡 + 高亮主按钮 `[立即登录 / 注册同步收藏]` | 点击登录按钮唤起认证框，认证后自动按云端收藏数切至 `S1` 或 `S3` |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程（附语义短名） | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 在列表卡片点击右上实心红心 `♥` | [PAT-UndoSnackbar 4秒延迟撤销条](../../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar) | [FLOW-DISC-02 收藏与4秒撤销保护流](../../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02) | 免二次确认框，卡片立即折叠隐藏并切至 `S2_UndoRemoving` 浮现 `4000ms` 撤销胶囊 | [EVT-12 收藏增删与撤销埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-12) (`action='remove', page_id='PAGE-FAV-01'`) |
| 在 `4000ms` 内点击胶囊 `[撤销]` | [PAT-UndoSnackbar 4秒延迟撤销条](../../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar) | [FLOW-DISC-02 收藏与4秒撤销保护流](../../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02) | 立即原序号恢复该卡片与原收藏时间戳（`favorited_at`），收起胶囊回到 `S1_LoggedWithItems` | [EVT-12 收藏增删与撤销埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-12) (`action='undo_restore'`) |
| 输入页内搜索词或切换配餐角色胶囊 | — | 纯客户端内存实时过滤 | 毫秒级（`< 50ms`，不闪骨架屏）过滤已收藏菜谱网格 | — |
| 在 `S4_GuestUnauthed` 点击 `[立即登录 / 注册]` | — | [RULE-SYNC-02 本地与云端旧档案冲突裁决](../../03-business-rules/identity-and-sync.md#rule-sync-02) | 唤起快捷认证弹窗，验证通过后立即拉取该账号云端收藏记录刷新本页 | [EVT-03 完成快捷认证埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
| 点击任一收藏卡片主热区 | — | [RULE-COOK-01 详情目标人数继承优先级](../../03-business-rules/portion-and-cooking.md#rule-cook-01) | `Push` 进入菜谱详情页并透传来源 `entry_source='favorites'` | [EVT-09 菜谱详情浏览埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-09) (`entry_source='favorites'`) |
