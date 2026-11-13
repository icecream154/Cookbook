# <a id="page-fav-01"></a>`PAGE-FAV-01`：我的收藏夹主页

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-FAV-01` · 一级导航收藏主页（Tab 3） |
| **访问权限** | 游客展示登录引导空状态；已登录用户读写本人收藏记录 |
| **上游入口** | 全局一级导航栏 |
| **下游出口** | [PAGE-COOK-01 菜谱详情页](../recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-COMM-02 认证弹窗](../common-and-onboarding/auth-modal.md#page-comm-02)、空态跳转 `PAGE-PLAN-01` / `PAGE-SRCH-01` |
| **配套画板原型** | [favorites.html](../../08-verification/prototypes/pages/favorites.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 单列紧凑卡片流，撤销提示胶囊悬浮于底部 Tab 栏正上方 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 2 列卡片网格 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 3 列宽幅卡片网格，页内搜索框与角色胶囊同行右对齐 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 复用组件或控件 | 绑定实体与枚举（`DOM-*` / `ENUM-*`） | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **页头与总数统计** | 标题 `我的收藏夹 (N)` + 排序切换（最近收藏 / 耗时最短） | [DOM-PLN-FavoriteRecord](../../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord)、[ENUM-PLN-SortOrder](../../02-domain-model/meal-and-collection/enums.md#enum-pln-sortorder) | 已登录且总收藏数 `> 0` 时显示 |
| **页内快筛工具栏** | [COMP-SearchBar](../../05-components-and-patterns/shared-components.md#comp-searchbar)（本地轻量态）+ 配餐角色胶囊栏 | [ENUM-RCP-DishRole](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-dishrole) | 已登录且总收藏数 `> 0` 时显示 |
| **单层收藏卡片列表** | [COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard) (`Variant: favorite_item`) | [DOM-RCP-Recipe](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) | 过滤后结果 `> 0` 时显示 |
| **两类专属空状态卡** | 未登录引导卡 / 已登录 0 收藏引导卡 | 遵循 [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | 未登录或收藏数为 `0` 时显示 |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_LoggedWithItems` | 已登录有收藏正常过滤态 | 展示单层收藏列表、页内秒级搜索与配餐角色过滤胶囊 |
| `S2_UndoRemoving` | 取消收藏 4 秒防误删撤销态 | 某卡片刚被移出，底部驻留黑底 `[已移出收藏夹 · 撤销]` 悬浮条 |
| `S3_LoggedEmpty` | 已登录但 0 收藏引导空态 | 展示引导插画及 `[去今日三餐看看]`、`[去菜谱库探索]` 双入口 |
| `S4_GuestUnauthed` | 未登录游客引导态 | 展示跨端同步价值说明及 `[立即登录 / 注册]` 主按钮 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 在列表卡片点击实心红心 `♥` | [PAT-UndoSnackbar](../../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar) | [FLOW-DISC-02](../../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02) | 卡片立即平滑隐藏，底部浮现 4 秒 `[撤销]` 胶囊；点击撤销原位恢复 | [EVT-12](../../07-metrics-and-tracking/event-dictionary.md#evt-12) (`action='remove'`) |
| 输入页内搜索词或切换角色胶囊 | — | 纯内存前端过滤 | 毫秒级过滤已收藏列表 | — |
| 未登录态点击 `[立即登录 / 注册]` | — | [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) | 唤起 `PAGE-COMM-02`，认证后自动刷新渲染云端收藏列表 | [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
