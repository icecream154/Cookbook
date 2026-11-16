# <a id="page-cook-01"></a>`PAGE-COOK-01`：多媒体菜谱详情页

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-COOK-01` · 多媒体富文本菜谱详情页 |
| **视图载体与层级** | `L2` 跨空间共享二级核心消费页（标准路由 `Push` 入栈） |
| **访问权限与游客策略** | 游客可读、可换算人数、可看视频与进入全屏跟做；仅点击 `[♡ 收藏]` 时触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) |
| **路由入参与上下文继承** | 必传 `recipe_id`；可选透传 `context_servings` 与 `entry_source`（缺省初始人数严格按 [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) 继承优先级决定） |
| **上游进入入口** | `PAGE-PLAN-01`、`PAGE-SRCH-01`、`PAGE-FAV-01` 及 `PAGE-PROF-01` 最近浏览足迹中的任意菜谱卡片 |
| **下游跳转出口与无栈兜底** | 全屏打开 [PAGE-COOK-02 分步跟做视图](./cooking-focus-mode.md#page-cook-02)、`Pop` 返回原来源列表页（无站内历史栈时兜底回退至 `PAGE-PLAN-01`） |
| **关联可交互画板** | [recipe-consumption.html](../../08-verification/prototypes/pages/recipe-consumption.html) · 跨页拦截 [flow-auth-and-merge.html](../../08-verification/prototypes/flows/flow-auth-and-merge.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-SplitDetail](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | **隐藏全局底部 4-Tab 栏**，切换为顶部吸顶返回栏 + 底部专属吸底操作栏（收藏 + 紧凑步进器 + `[🍳 开始跟做]`）；视频播放态滚出视口时自动在 `Z30` 右上角挂载可关闭的**悬浮视频小窗（Mini-PiP）** |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-SplitDetail](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 保留左侧 `76px` 导航轨；主画布采用**厨房横屏左右双栏**：左栏（宽 `42%`，Sticky 常驻）固定展示主视频、人数步进器与食材核对表；右栏（宽 `58%`）独立滚动双图表与图文步骤，彻底免去上下翻找调料克数 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-SplitDetail](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 保留左侧 `220px` 侧栏；`1200px` 版心内采用**主副双栏**：左主阅读栏（宽 `64%`）顺序展示宽屏视频、导语、双图表与富文本步骤；右吸顶工具副栏（宽 `36%` Sticky）常驻人数计算器、食材备料核对单与 `[🍳 开始跟做]` 主按钮 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 教学视频播放器与章节条 | `16:9` 视频容器（含关键节点章节圆点刻度与倍速）+ 手机 Mini-PiP 小窗 | [DOM-RCP-Recipe](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipe) `video_url`、`cover_image_url` | 无视频或弱网超时按 [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) 降级渲染高清静态封面海报 |
| **B2** | 菜谱头与四维核心指标卡 | 主标题 + 风味导语 + `菜系 / 总耗时 / 难度 / 辣度` 四宫格指标卡 | `title`、`tagline`、[ENUM-RCP-Cuisine](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-cuisine)、[ENUM-RCP-Difficulty](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-difficulty)、[ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness) | 常驻显示 |
| **B3** | 动态人数换算与食材核对表 | [COMP-ServingsStepper](../../05-components-and-patterns/shared-components.md#comp-servingsstepper) (`detail_header`) + 主料/辅料/调料三段可打勾清单 + 忌口预警标 | [DOM-RCP-RecipeIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)、[ENUM-RCP-ScaleMode](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-scalemode) | 常驻；数值遵循 [RULE-COOK-02](../../03-business-rules/portion-and-cooking.md#rule-cook-02) 人性化取整，命中用户忌口时按 [RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03) 标 `⚠️ 你的忌口` |
| **B4** | 单人份营养热量构成图 | SVG 三大营养素供能占比环形图 + 蛋白质/碳水/脂肪克数条 + 健康徽章 | [DOM-RCP-NutritionChart](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-nutritionchart) | 常驻；口径恒定锚定 **1 人份标准摄入量**，不随人数步进器放大以免误导控卡认知 |
| **B5** | 工序火候时间轴甘特图 | 横向分段工序色块条（色块高度与颜色映射火力等级，标注阶段分钟数） | [DOM-RCP-TimelineChart](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-timelinechart)、[ENUM-RCP-HeatLevel](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-heatlevel) | 常驻；每个阶段色块绑定 `target_step_no` 支持点击平滑锚点跳转 |
| **B6** | 动态调料联动图文步骤流 | 步骤序号头 + `[▶ mm:ss 看手法]` 胶囊 + 动态占位符高亮正文 + 步骤图 + `[⏱ 倒计时]` + 主厨避坑贴士框 | [DOM-RCP-RecipeStep](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipestep)、[TERM-RCP-04 步骤动态占位符](../../02-domain-model/recipe-catalog/terms.md#term-rcp-04) | 常驻；正文内嵌 `{ing_*}` 胶囊按 [RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03) 与食材表毫秒级同步折算 |
| **B7** | 详情操作栏（吸底 / 副栏吸顶） | `[♡ 收藏]` + `COMP-ServingsStepper` (`mobile_bar`，仅手机端底栏) + `[🍳 开始跟做]` 主按钮 | `is_favorited`、`target_servings` | 手机端固定于 `Slot-BottomBar`；平板/桌面端合并进右侧/左侧 Sticky 栏 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_DefaultScaled` | 继承画像人数折算与双图表正常态 | 打开详情页，网络正常且自动继承三口之家（`3` 人份）完成初始化折算 | 表头提示 `已按 3 人份折算`，完整渲染视频、营养环图、火候甘特图及同步折算后的步骤调料胶囊 | 加减人数实时换算、点章节看手法、收藏或点击 `[🍳 开始跟做]` |
| `S2_AvoidWarning` | 含用户忌口食材温和预警态 | 用户从搜索或外链主动点进一道包含本人忌口（如香菜/花生）的菜谱 | 不阻断浏览，在对应食材行醒目高亮 `⚠️ 你的忌口` 橙色徽章及“点缀辅料可省略/替代”贴士说明 | 正常阅读、打勾剔除该辅料或照常跟做 |
| `S3_MobileMiniPiP` | 手机下滑悬浮视频小窗跟看态 | `SHELL-Mobile` 下主视频处于播放中且用户向下滚动浏览至步骤区超出主播放器高度 | 右上角 `Z30` 层自动吸附 `148px` 宽 `16:9` 悬浮视频小窗，实现边看刀工手法边核对文字步骤 | 点击小窗 `✕` 关闭本次自动吸附，或滚回顶部无缝归位主播放器 |
| `S4_VideoDegraded` | 弱网视频加载失败降级态 | 弱网超时或离线导致 `video_url` 流加载失败 | 视频区优雅回退为 `cover_image_url` 高清静态封面图 + `[↻ 重试加载视频]` 按钮，下方换算器、双图表与图文步骤 100% 正常可用 | 点击重试恢复视频流，或直接依靠图文步骤进入 `PAGE-COOK-02` 跟做 |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 进入详情页完成首次初始化渲染 | [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | [RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) + [RULE-COOK-02](../../03-business-rules/portion-and-cooking.md#rule-cook-02) | 确定初始 `target_servings` 完成首屏折算，并写入最近浏览足迹 | [EVT-09](../../07-metrics-and-tracking/event-dictionary.md#evt-09) (`recipe_id, entry_source, init_servings`) |
| 点击步进器 `[-]` / `[+]` 调整人数 | 限制闭区间 `[1, 8]` | [RULE-COOK-02](../../03-business-rules/portion-and-cooking.md#rule-cook-02) + [RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03) | 端侧毫秒级同步更新食材清单与全部步骤正文内嵌调料克数（严格隔离，不改写全局饮食档案） | `500ms` 收敛后上报 [EVT-10](../../07-metrics-and-tracking/event-dictionary.md#evt-10) |
| 点击步骤内 `[▶ mm:ss 看手法]` 胶囊 | 视频可用态 | [FLOW-COOK-01](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-01) | 主播放器跳转至 `video_anchor_sec` 播放（`SHELL-Mobile` 若处于下方步骤区则自动唤起 `S3_MobileMiniPiP`） | — |
| 点击工序火候甘特图任一阶段块 | — | — | 页面平滑滚动定位至对应 `target_step_no` 步骤卡片并短暂高亮边框 | — |
| 点击 `[♡ 收藏]` 按钮 | 未登录触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [FLOW-DISC-02](../../04-ia-and-flows/flows/search-and-collection.md#flow-disc-02) | 已登录即时切换收藏状态并同步全站列表；游客验证后自动点亮红心 | [EVT-12](../../07-metrics-and-tracking/event-dictionary.md#evt-12) (`page_id='PAGE-COOK-01'`) |
| 点击 `[🍳 开始跟做]` 主按钮 | — | [FLOW-COOK-02](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 暂停详情页视频（含小窗），携带当前 `target_servings` 在 `Z50` 全屏打开 `PAGE-COOK-02` | [EVT-11](../../07-metrics-and-tracking/event-dictionary.md#evt-11) (`stage='start'`) |
