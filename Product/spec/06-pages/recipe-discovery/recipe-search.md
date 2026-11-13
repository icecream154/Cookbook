# <a id="page-srch-01"></a>`PAGE-SRCH-01`：找菜谱检索主页

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-SRCH-01` · 一级导航检索主页（Tab 2） |
| **访问权限** | 游客可读（仅当开启“仅看已收藏”开关时触发登录拦截） |
| **上游入口** | 全局一级导航栏、[PAGE-FAV-01](../favorites/favorites-list.md#page-fav-01) 空状态探索按钮 |
| **下游出口** | [PAGE-SRCH-02 复合筛选面板](./complex-filter-panel.md#page-srch-02)、[PAGE-COOK-01 菜谱详情页](../recipe-consumption/recipe-detail.md#page-cook-01) |
| **配套画板原型** | [recipe-discovery.html](../../08-verification/prototypes/pages/recipe-discovery.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 搜索框与快捷胶囊吸顶，单列结果卡片流；点击 `[⚙ 复合筛选]` 从底部弹出 `PAGE-SRCH-02` |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 结果区为 2 列卡片网格；`PAGE-SRCH-02` 为右侧滑出抽屉 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | **左栏常驻展开 `PAGE-SRCH-02`（宽 `280px`）** + 右侧主栏（搜索框 + 排序条 + 2~3 列菜谱网格），勾选条件实时防抖刷新列表 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 复用组件或控件 | 绑定实体与枚举（`DOM-*` / `ENUM-*`） | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **顶部搜索输入区** | [COMP-SearchBar](../../05-components-and-patterns/shared-components.md#comp-searchbar) | [DOM-RCP-StandardIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient) `synonyms`、`title` | 常驻 |
| **快捷筛选胶囊栏** | `[⚙ 复合筛选(计数)]`、`[♥ 仅看收藏]`、`[⚡ ≤15分钟]`、热门菜系快捷项 | [ENUM-RCP-Cuisine](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-cuisine)、[ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness) | 常驻（Web 端隐藏抽屉唤起按钮） |
| **已生效条件摘要条** | 带 `×` 的可单删条件芯片 + `[清空全部]` | 当前激活的筛选条件集合 | 存在 `>= 1` 项筛选条件时显示 |
| **结果统计与排序栏** | 命中总数文案 + 排序切换按钮组 | [ENUM-PLN-SortOrder](../../02-domain-model/meal-and-collection/enums.md#enum-pln-sortorder) | 命中结果 `> 0` 时显示 |
| **检索结果列表区** | [COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard) (`Variant: search_hit`) | [DOM-RCP-Recipe](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) | 命中结果 `> 0` 时显示 |
| **零结果阶梯放宽卡** | 冲突诊断文案 + 一键放宽条件按钮组 + 近似高分菜谱 | 遵循 [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 命中结果 `== 0` 时显示 |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_BrowseDefault` | 默认探索与热搜引导态 | 展示最近搜索、时令热搜词与全量精选菜谱流 |
| `S2_SuggestTyping` | 关键词与同义食材联想态 | 如输入 `西红柿` 下拉提示标准食材 `[番茄]` 快捷过滤入口 |
| `S3_MultiIngSmart` | 多食材智能匹配排序激活态 | 已选 `>= 2` 项食材，列表按命中度降序并展示 `命中 2/3 食材 · 缺:XX` 及忌口预警 |
| `S4_ZeroResultFallback` | 严苛交集零结果阶梯放宽态 | 命中 0 道菜，展示诊断说明与一键移除/放宽严苛条件按钮 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 输入搜索词或点击联想项提交 | `250ms` 防抖 | [RULE-SRCH-01](../../03-business-rules/search-and-matching.md#rule-srch-01) + [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 刷新结果列表与命中计数 | [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
| 点击 `[♥ 仅看收藏]` 胶囊 | 未登录触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 已登录直接切换过滤；未登录验证后自动开启过滤 | [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
| 点击零结果卡上的一键放宽按钮 | `S4_ZeroResultFallback` | [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 自动解除对应冲突条件并立即展示恢复召回的菜谱列表 | [EVT-08](../../07-metrics-and-tracking/event-dictionary.md#evt-08) |
