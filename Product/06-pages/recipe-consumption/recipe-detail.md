# <a id="page-cook-01"></a>`PAGE-COOK-01`：多媒体菜谱详情页

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-COOK-01` · 全站核心二级消费页 |
| **访问权限** | 游客可读可换算（仅点击收藏按钮时受 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 拦截） |
| **上游入口** | `PAGE-PLAN-01`、`PAGE-SRCH-01`、`PAGE-FAV-01` 及个人中心最近浏览记录中的任意菜谱卡 |
| **下游出口** | [PAGE-COOK-02 全屏分步跟做视图](./cooking-focus-mode.md#page-cook-02)、返回来源列表页 |
| **配套画板原型** | [recipe-consumption.html](../../08-verification/prototypes/pages/recipe-consumption.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 单栏纵向流 + 底部常驻操作栏（收藏 / 人数步进器 / 开始跟做）；当视频处于播放态且页面下滑滚出播放器高度时，自动在右上角挂载可关闭的**悬浮视频小窗（Mini PiP）** |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | **厨房横屏左右双栏**：左栏（42%宽，Sticky 常驻）固定展示主视频与可调人数食材核对清单；右栏（58%宽）独立滚动浏览双图表与富文本步骤，彻底免去上下翻页核对调料克数 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | **主副双栏**：左主栏（64%宽）展示宽屏视频、导语、双图表与图文步骤；右吸顶栏（36%宽）常驻人数计算器、食材核对单与 `[🍳 全屏跟做]` 主入口 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 复用组件或控件 | 绑定实体与图表契约（`DOM-*`） | 显隐与交互约束 |
| :--- | :--- | :--- | :--- |
| **1. 主视频与章节器** | 16:9 播放器（含章节圆点刻度与倍速）+ 手机悬浮小窗 | [DOM-RCP-Recipe](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) `video_url`、`cover_image_url` | 无视频或弱网失败时按 [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) 优雅降级为高清封面图 |
| **2. 标题与四维指标** | 主副标题 + 菜系/总耗时/难度/辣度指标组 | `title`、`tagline`、`cuisine`、`difficulty`、`spiciness` | 常驻 |
| **3. 动态人数食材表** | [COMP-ServingsStepper](../../05-components-and-patterns/shared-components.md#comp-servingsstepper) + 主/辅/调料三段勾选表 + 忌口预警标 | [DOM-RCP-RecipeIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient) | 遵循 [RULE-COOK-02](../../03-business-rules/portion-and-cooking.md#rule-cook-02) 与 [RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03) |
| **4. 营养热量构成图** | SVG 供能占比环图 + 蛋白质/碳水/脂肪进度条 + 健康徽章 | [DOM-RCP-NutritionChart](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-nutritionchart) | 恒定以 **1 人份**为口径 |
| **5. 工序火候时间轴图** | 横向分段工序甘特块（高度映射火力等级） | [DOM-RCP-TimelineChart](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-timelinechart)、[ENUM-RCP-HeatLevel](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-heatlevel) | 点击任一阶段平滑滚动至对应 `target_step_no` |
| **6. 富文本图文步骤** | 步骤标题 + `[▶ mm:ss 看手法]` 胶囊 + 动态占位符正文 + 配图 + `[⏱ 倒计时]` + 避坑贴士框 | [DOM-RCP-RecipeStep](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipestep) | 步骤内嵌调料数值按 [RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03) 随人数同步更新 |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_DefaultScaled` | 继承画像人数折算与双图表正常态 | 按 3 人份自动折算食材与步骤调料，完整渲染营养环图与火候时间轴图 |
| `S2_AvoidWarning` | 含用户忌口食材温和预警态 | 在对应食材行显式展示 `⚠️ 你的忌口` 及可省略/替代说明 |
| `S3_MobileMiniPiP` | 手机下滑悬浮视频小窗跟看态 | 页面滚至步骤区，右上角吸附正在播放的视频小窗实现边看手法边看文字 |
| `S4_VideoDegraded` | 弱网视频加载失败降级态 | 播放器回退高清封面静态海报 + `[重试视频]`，食材换算与图文步骤完全可用 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 进入详情页初始化 | — | [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) | 按继承优先级初始化 `target_servings` 并完成首次折算渲染 | [EVT-09](../../07-metrics-and-tracking/event-dictionary.md#evt-09) |
| 点击步进器 `[-]` / `[+]` 调整人数 | 限制区间 `1 ~ 8` | [RULE-COOK-02](../../03-business-rules/portion-and-cooking.md#rule-cook-02) + [RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03) | 食材表与所有步骤正文中高亮的调料克数实时同步更新（不改动全局档案） | [EVT-10](../../07-metrics-and-tracking/event-dictionary.md#evt-10) |
| 点击步骤 `[▶ mm:ss 看手法]` | — | [FLOW-COOK-01](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-01) | 主视频跳转至 `video_anchor_sec` 播放（手机若在页面底部则唤起悬浮小窗） | — |
| 点击火候图表某阶段块 | — | — | 平滑滚动定位至下方对应步骤卡片 | — |
| 点击 `[♡ 收藏]` 按钮 | 未登录触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [FLOW-DISC-02](../../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02) | 点亮/取消收藏并全局同步收藏状态 | [EVT-12](../../07-metrics-and-tracking/event-dictionary.md#evt-12) |
| 点击 `[🍳 开始跟做]` | — | [FLOW-COOK-02](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 携带当前 `target_servings` 打开 `PAGE-COOK-02` | [EVT-11](../../07-metrics-and-tracking/event-dictionary.md#evt-11) (`stage='start'`) |
