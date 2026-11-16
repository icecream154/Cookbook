# <a id="page-srch-01"></a>`PAGE-SRCH-01`：找菜谱检索主页

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-SRCH-01` · 找菜谱多维复合检索主页 |
| **视图载体与层级** | `L1` 一级常驻导航检索空间（Tab 2，开启 Keep-Alive 保留检索词、筛选集合与列表滚动位） |
| **访问权限与游客策略** | 游客直接可读可搜；仅当点击 `[♥ 仅看收藏]` 胶囊或卡片红心时触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 拦截 |
| **路由入参与上下文继承** | 读取全局 [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 忌口集合用于渲染温和预警标（默认不暗中屏蔽主动检索词，见 [RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03)） |
| **上游进入入口** | 全局一级导航栏 Tab 2、[PAGE-FAV-01](../favorites/favorites-list.md#page-fav-01) 空状态 `[去菜谱库探索]` 按钮 |
| **下游跳转出口与无栈兜底** | 展开/联动 [PAGE-SRCH-02 复合筛选容器](./complex-filter-panel.md#page-srch-02)、`Push` 进入 [PAGE-COOK-01 菜谱详情页](../recipe-consumption/recipe-detail.md#page-cook-01) |
| **关联可交互画板** | [recipe-discovery.html](../../08-verification/prototypes/pages/recipe-discovery.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-FilterWorkspace](../../04-ia-and-flows/ia-and-shell.md#mode-filterworkspace) | 搜索框与快捷胶囊栏吸顶（`Z20`），下方结果区为 **`1` 列卡片流**；点击 `[⚙ 复合筛选]` 在 `Z50` 弹出底部抽屉 `PAGE-SRCH-02` |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-FilterWorkspace](../../04-ia-and-flows/ia-and-shell.md#mode-filterworkspace) | 左侧 `76px` 导航轨常驻；搜索栏吸顶，结果区升级为 **`2` 列等宽网格**；点击 `[⚙ 复合筛选]` 从右侧滑出 `380px` 宽 `PAGE-SRCH-02` |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-FilterWorkspace](../../04-ia-and-flows/ia-and-shell.md#mode-filterworkspace) | 左侧 `220px` 侧栏旁**常驻展开内嵌 `PAGE-SRCH-02` 过滤边栏（宽 `280px`）**，隐藏移动端抽屉唤起按钮；右侧主栏展示搜索框、排序条与 **`2~3` 列自适应菜谱网格** |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 顶部同义联想搜索区 | [COMP-SearchBar](../../05-components-and-patterns/shared-components.md#comp-searchbar) (`variant='discovery_full'`) | [DOM-RCP-StandardIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient) `synonyms`、[DOM-RCP-Recipe](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) `title` | 常驻吸顶 |
| **B2** | 快捷筛选胶囊栏 | `[⚙ 复合筛选(计数)]`、`[♥ 仅看收藏]`、`[⚡ ≤15分钟]`、高频菜系快捷芯片 | [ENUM-RCP-Cuisine](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-cuisine)、[ENUM-USR-TimeBudget](../../02-domain-model/user-profile/enums.md#enum-usr-timebudget) | 常驻（`SHELL-Desktop` 下隐藏 `[⚙ 复合筛选]` 抽屉唤起钮，其余快捷胶囊与左栏双向同步） |
| **B3** | 已生效条件摘要条 | 带 `×` 的可单删条件芯片流 + `[清空全部]` 文字链 | 当前激活的关键词与全部筛选条件集合 | 存在 `>= 1` 项生效过滤条件时显示 |
| **B4** | 结果统计与排序切换栏 | `共找到 N 道菜谱` 文案 + 排序切换按钮组 | [ENUM-PLN-SortOrder](../../02-domain-model/meal-and-collection/enums.md#enum-pln-sortorder) | 命中结果 `N > 0` 时显示；选 `>=2` 项食材且处于智能模式时默认置为匹配度优先排序 |
| **B5** | 检索结果卡片网格区 | [COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard) (`variant='search_hit'`) | [DOM-RCP-Recipe](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) | 命中结果 `N > 0` 时显示 |
| **B6** | 零结果阶梯放宽恢复卡 | 冲突原因诊断说明 + 一键放宽严苛条件按钮组 + 近似高分兜底菜谱 | 遵循 [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) 与 [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | 仅当命中结果 `N == 0`（`S4_ZeroResultFallback`）时显示 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_BrowseDefault` | 默认探索与热搜引导态 | 初始进入未输入关键词且未勾选任何复合筛选项 | 展示本地最近搜索历史芯片、时令热搜推荐词及全量高分精选菜谱网格 | 点击热词、输入检索词或打开 `PAGE-SRCH-02` 配置过滤 |
| `S2_SuggestTyping` | 关键词与同义食材联想态 | 在搜索框输入非空字符（如 `西红柿`）经 `250ms` 防抖触发联想 | 搜索框下方展开浮层：置顶提示标准食材同义映射 `[+ 按食材筛选：番茄（含西红柿）]` 及匹配菜名列表 | 点击标准食材项转入食材过滤，或回车提交关键词检索 |
| `S3_MultiIngSmart` | 多食材智能匹配排序激活态 | 已选 `>= 2` 项包含食材且匹配模式为 `smart_rank`（默认） | 列表按食材命中率降序排列，卡片显式挂载 `命中 2/3 食材 · 缺:青椒` 徽章及个人忌口温和预警标 | 切为严格全含模式、增删条件芯片或点进菜谱详情 |
| `S4_ZeroResultFallback` | 严苛交集零结果阶梯放宽态 | 多维条件组合交集命中 `0` 道菜谱 | 展示具体零结果诊断（如 `同时满足“严格含3种食材 + ≤15分钟 + 仅看收藏”的菜谱为 0`）及一键放宽建议按钮组（如 `[改为智能匹配度排序]`、`[放宽耗时限制]`） | 点击任一放宽按钮立即恢复召回列表并切回 `S1/S3`，或点 `[清空全部]` |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 搜索框输入提交或点选同义词联想项 | IME 结束 + `250ms` 防抖 | [RULE-SRCH-01](../../03-business-rules/search-and-matching.md#rule-srch-01) + [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 收起联想浮层，写入最近搜索历史，刷新结果流（`N > 0` 渲染列表，`N == 0` 切至 `S4_ZeroResultFallback`） | [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
| 点击快捷栏 `[♥ 仅看收藏]` 胶囊 | 未登录触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [FLOW-AUTH-02](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02) + [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 已登录直接过滤本人收藏集；游客验证通过后自动开启该胶囊并刷新列表 | [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) (`only_fav=true`) |
| 点击 `[⚙ 复合筛选]`（移动/平板） | — | — | 在 `Z50` 层唤起 `PAGE-SRCH-02`（`S5_FilterDrawerOpen`） | — |
| 在 `S4_ZeroResultFallback` 点击一键放宽按钮 | `result_count == 0` | [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 自动解除该严苛条件并立即重查渲染恢复召回的菜谱列表 | [EVT-08](../../07-metrics-and-tracking/event-dictionary.md#evt-08) (`relaxed_dimension, recovered_count`) |
| 点击任一结果卡 `COMP-RecipeCard` 主热区 | — | [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) | `Push` 进入 `PAGE-COOK-01` 并透传 `entry_source='search'` | [EVT-09](../../07-metrics-and-tracking/event-dictionary.md#evt-09) (`entry_source='search'`) |
