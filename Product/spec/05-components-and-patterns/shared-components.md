# 05-1. 跨页复用业务组件规格（`COMP-*`）

本文档严格遵循元规范 [03-authoring-templates.md 第 2.5.1 节](../../meta/03-authoring-templates.md#tpl-comp-shared) 的**固定四段式结构**，定义全站在 `>= 2` 个功能空间复用的三项核心业务 UI 组件。

---

## <a id="comp-recipecard"></a>1. `COMP-RecipeCard`（跨页菜谱摘要卡片）

### 1.1 复用范围与视觉解剖契约
- **复用范围**：[PAGE-PLAN-01 今日菜谱](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-SRCH-01 找菜谱](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-FAV-01 收藏夹](../06-pages/favorites/favorites-list.md#page-fav-01)（共 3 处列表空间）。
- **固定视觉分区**：
  1. **左侧媒体缩略区**（`1:1` 圆角方图，移动端 `78×78px` / 宽屏网格自适应）：左上角叠放配餐角色深色角标，右下角在存在视频时叠放 `▶ mm:ss` 时长胶囊；图片加载失败时回退中性餐具占位底纹。
  2. **中部核心摘要区**：第 1 行主菜名（超 1 行末尾 `...` 截断）；第 2 行四维量化元数据（`菜系 · 总耗时 · 辣度 · 单人份千卡`）；第 3 行按变体动态挂载推荐理由、食材命中进度或忌口预警徽章。
  3. **右上独立收藏热区**：最小触控尺寸 `32×32px`（阻止点击事件冒泡穿透主卡片），已登录且已收藏渲染实心橙红 `♥`，否则渲染空心描边 `♡`。

### 1.2 输入属性与数据绑定表（Props Contract）

| 属性标识 | 数据类型 / 绑定领域源 | 必填 | 默认值 / 边界约束 | 渲染映射说明 |
| :--- | :--- | :--- | :--- | :--- |
| `recipe` | [DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) | 是 | `title` 单行省略；`video_url` 为空时隐藏时长标 | 绑定封面、标题、菜系（[ENUM-RCP-Cuisine](../02-domain-model/recipe-catalog/enums.md#enum-rcp-cuisine)）、`total_time_min`、辣度与热量 |
| `variant` | `'meal_plan' \| 'search_hit' \| 'favorite_item'` | 是 | `'search_hit'` | 决定卡片底部附加标签与局部操作按钮 |
| `is_favorited` | `Boolean`（查 [DOM-PLN-FavoriteRecord](../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord)） | 是 | `false`（游客态恒为 `false`） | 控制右上红心实心/空心视觉态 |
| `context_servings` | `Int`（`1..8`） | 否 | 缺省按 [RULE-COOK-01](../03-business-rules/portion-and-cooking.md#rule-cook-01) 继承 | 今日菜谱卡片显式传入当日 `applied_servings` |
| `match_meta` | `{ hitCount, totalSelected, missingNames[], hasAvoid }` | 否 | 仅 `search_hit` 变体按需传入 | 渲染多食材命中比与忌口温和预警标 |

### 1.3 场景变体矩阵表（Variants Matrix）

| 变体编码 | 挂载宿主页面 | 差异化展示字段与规则绑定 | 专属局部操作按钮 | 主热区跳转与传参 |
| :--- | :--- | :--- | :--- | :--- |
| `meal_plan` | [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 展示左上配餐角色角标（[ENUM-RCP-DishRole](../02-domain-model/recipe-catalog/enums.md#enum-rcp-dishrole)）及 [RULE-PLAN-03](../03-business-rules/meal-recommendation.md#rule-plan-03) 个性化命中理由胶囊（最多 `2` 项） | 右下角附带 `[⇄ 换一道]` 局部替换按钮 | 跳 `PAGE-COOK-01`，透传 `entry_source='daily_plan'` 与 `applied_servings` |
| `search_hit` | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) | • 选 `>=1` 项包含食材时展示 [RULE-SRCH-02](../03-business-rules/search-and-matching.md#rule-srch-02) 命中徽章（如 `命中 2/3 · 缺:青椒`）<br>• 含用户忌口时展示 [RULE-SRCH-03](../03-business-rules/search-and-matching.md#rule-srch-03) `⚠️ 含忌口` 橙黄标 | 无额外按钮（保持高密度浏览） | 跳 `PAGE-COOK-01`，透传 `entry_source='search'` |
| `favorite_item` | [PAGE-FAV-01](../06-pages/favorites/favorites-list.md#page-fav-01) | 展示左上配餐角色角标与收藏时间相对提示；不展示换菜按钮 | 点击实心红心移除时强制接入 [PAT-UndoSnackbar](./interaction-patterns.md#pat-undosnackbar) | 跳 `PAGE-COOK-01`，透传 `entry_source='favorites'` |

### 1.4 内部状态与事件透出表（States & Emitted Events）

| 触发子热区 / 内部状态 | 防抖或置灰边界约束 | 透出事件语义（交由宿主绑定规则与埋点） | 组件局部即时视觉反馈 |
| :--- | :--- | :--- | :--- |
| 点击右上红心热区 | `300ms` 节流防连点；阻止冒泡 | `onToggleFavorite(recipeId)` → 遵循 [FLOW-DISC-02](../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02) 与 [EVT-12](../07-metrics-and-tracking/event-dictionary.md#evt-12) | 已登录态乐观切换 `♥ / ♡` 微弹跳；游客态唤起认证框 |
| 点击 `[⇄ 换一道]`（仅 `meal_plan`） | 替换请求中当前按钮置灰防重入 | `onSwapDish(mealSlot, slotIndex)` → 调用 [RULE-PLAN-04](../03-business-rules/meal-recommendation.md#rule-plan-04) 与 [EVT-05](../07-metrics-and-tracking/event-dictionary.md#evt-05) | 仅当前单张卡片进入局部脉冲微加载态，其余卡片静止不闪动 |
| 点击卡片主体其余区域 | 无置灰限制 | `onOpenRecipe(recipeId, entrySource, contextServings)` → 触发 [EVT-09](../07-metrics-and-tracking/event-dictionary.md#evt-09) | 卡片按压背景微暗反馈后执行路由 `Push` |

---

## <a id="comp-servingsstepper"></a>2. `COMP-ServingsStepper`（目标用餐人数步进控件）

### 2.1 复用范围与视觉解剖契约
- **复用范围**：[PAGE-COOK-01 菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)（食材清单头部、平板/桌面 Sticky 栏及手机吸底栏）、[PAGE-COMM-01 偏好引导向导](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01)（Step 1 选择“4人及以上”时展开精确人数微调）。
- **固定视觉分区**：由左侧减号按钮 `[-]`、中部当前人数高亮读数（`N 人份`）、右侧加号按钮 `[+]` 及可选的折算状态副标组成；加减按钮最小点击热区 `36×36px`，支持湿手防误触。

### 2.2 输入属性与数据绑定表（Props Contract）

| 属性标识 | 数据类型 / 绑定领域源 | 必填 | 默认值 / 边界约束 | 渲染映射说明 |
| :--- | :--- | :--- | :--- | :--- |
| `value` | `Int` | 是 | 闭区间 `[1, 8]`，步长固定为 `1` | 中部实时展示 `"{value} 人份"` |
| `base_servings` | `Int`（[DOM-RCP-Recipe](../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) `base_servings`） | 否 | 详情页必传；向导页不传 | 当 `value != base_servings` 时激活折算提示标 |
| `variant` | `'detail_header' \| 'mobile_bar' \| 'onboarding_custom'` | 是 | `'detail_header'` | 控制紧凑度与折算副标显隐 |

### 2.3 场景变体矩阵表（Variants Matrix）

| 变体编码 | 挂载宿主页面 | 差异化展示字段与规则绑定 | 专属局部操作按钮 | 主热区跳转与传参 |
| :--- | :--- | :--- | :--- | :--- |
| `detail_header` | [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 食材表头 / 右侧吸顶栏 | `value != base_servings` 时旁侧高亮展示橙色胶囊 `已按 N 人份折算`（原方 `M` 人份） | 附带 `[恢复原方]` 轻量文字链（当偏离基准人数时显现） | 页内原地换算，不跳转路由 |
| `mobile_bar` | [PAGE-COOK-01](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)（`SHELL-Mobile` 吸底操作栏） | 紧凑胶囊态（仅保留 `[-] N人 [+]`），与食材表头步进器双向实时同步同一状态源 | 无附加文字链以节省手机底栏宽度 | 页内原地同步换算 |
| `onboarding_custom` | [PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01) Step 1 | 下限锁定为 `4`（选“4人+”档位时微调 `4 ~ 8` 人），写入档案草稿 | 无 | 随向导步骤保存 |

### 2.4 内部状态与事件透出表（States & Emitted Events）

| 触发子热区 / 内部状态 | 防抖或置灰边界约束 | 透出事件语义（交由宿主绑定规则与埋点） | 组件局部即时视觉反馈 |
| :--- | :--- | :--- | :--- |
| 点击 `[-]` 减少人数 | 当 `value == min`（常规 `1`，向导 `4`）时 `[-]` 置灰 `disabled` | `onChange(value - 1)` → 详情页同步调用 [RULE-COOK-02](../03-business-rules/portion-and-cooking.md#rule-cook-02)、[RULE-COOK-03](../03-business-rules/portion-and-cooking.md#rule-cook-03) 并上报 [EVT-10](../07-metrics-and-tracking/event-dictionary.md#evt-10) | 数字瞬时刷新，关联调料胶囊闪烁高亮 `300ms` |
| 点击 `[+]` 增加人数 | 当 `value == 8` 时 `[+]` 置灰 `disabled`（轻提示“家常灶具单锅建议上限 8 人份”） | `onChange(value + 1)` → 同上执行端侧毫秒级无请求折算 | 同上 |

---

## <a id="comp-searchbar"></a>3. `COMP-SearchBar`（多态同义词联想搜索框）

### 3.1 复用范围与视觉解剖契约
- **复用范围**：[PAGE-SRCH-01 找菜谱主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01)（全功能检索态）、[PAGE-FAV-01 我的收藏夹](../06-pages/favorites/favorites-list.md#page-fav-01)（页内本地快筛态）。
- **固定视觉分区**：左侧放大镜图标 + 中部单行文本输入区（禁用浏览器原生自动大写与拼写纠错）+ 右侧清空 `✕` 按钮（仅非空时显现）+ 下拉联想浮层（仅 `discovery_full` 变体挂载）。

### 3.2 输入属性与数据绑定表（Props Contract）

| 属性标识 | 数据类型 / 绑定领域源 | 必填 | 默认值 / 边界约束 | 渲染映射说明 |
| :--- | :--- | :--- | :--- | :--- |
| `query` | `String` | 是 | 最大输入长度 `30` 字符；首尾空格自动裁剪 | 受控绑定当前检索词 |
| `variant` | `'discovery_full' \| 'favorites_local'` | 是 | `'discovery_full'` | 区分服务端/全库同义词联想 vs 收藏列表纯内存过滤 |
| `placeholder` | `String` | 是 | 依变体注入具象引导文案 | 空值失焦时展示 |

### 3.3 场景变体矩阵表（Variants Matrix）

| 变体编码 | 挂载宿主页面 | 差异化展示字段与规则绑定 | 专属局部操作按钮 | 主热区跳转与传参 |
| :--- | :--- | :--- | :--- | :--- |
| `discovery_full` | [PAGE-SRCH-01](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) | • 聚焦空值下拉：本地最近 `10` 条搜索词 + 时令热搜芯片<br>• 输入态下拉：按 [RULE-SRCH-01](../03-business-rules/search-and-matching.md#rule-srch-01) 匹配 [DOM-RCP-StandardIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient) `synonyms`（如输`西红柿`提示标准食材`[+ 筛选食材：番茄]`）及菜名补全 | 最近搜索栏右上附 `[🗑 清空历史]`；右侧附 `[搜索]` 提交钮 | 点击标准食材联想项直接加入包含食材过滤集合并刷新 `PAGE-SRCH-01` |
| `favorites_local` | [PAGE-FAV-01](../06-pages/favorites/favorites-list.md#page-fav-01) | 不弹历史与热词下拉浮层；占位符显示 `在我的 N 道收藏中搜菜名或食材…` | 仅右侧 `✕` 一键清空按钮 | 原页毫秒级内存过滤已收藏卡片 |

### 3.4 内部状态与事件透出表（States & Emitted Events）

| 触发子热区 / 内部状态 | 防抖或置灰边界约束 | 透出事件语义（交由宿主绑定规则与埋点） | 组件局部即时视觉反馈 |
| :--- | :--- | :--- | :--- |
| `Idle -> FocusedEmpty`（点击聚焦且无字符） | 仅 `discovery_full` 展开浮层 | `onFocusEmpty()` → 读取本地搜索历史缓存 | 输入框外发光高亮，平滑展开历史与热搜面板 |
| `Typing`（输入字符且非中文输入法 `composition` 拼写中） | **`250ms` 防抖**（IME 选词上屏后再触发，禁止拼音字母逐键乱搜） | `onSuggestOrFilter(trimmedQuery)` → `discovery_full` 渲染联想项（`S2_SuggestTyping`）；`favorites_local` 直接过滤列表 | 右侧显现 `✕` 按钮；匹配同义词高亮着色 |
| 点击回车 / `[搜索]` / 联想项 | 空字符串回车不发起无效检索 | `onSubmitSearch(query, matchedIngId?)` → 调用 [RULE-SRCH-01](../03-business-rules/search-and-matching.md#rule-srch-01) 并上报 [EVT-07](../07-metrics-and-tracking/event-dictionary.md#evt-07) | 收起移动端软键盘与联想下拉层，写入最近搜索历史 |
| 点击右侧 `✕` 清空 | 仅 `query.length > 0` 可点 | `onClear()` → 清空关键词并恢复宿主筛选前或全量列表态 | 清空文本并保持输入框焦点便于重输 |
