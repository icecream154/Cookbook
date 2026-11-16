# 旅程阶段四：菜谱消费与实操跟做流程（`FLOW-COOK-*`）

## <a id="flow-cook-01"></a>1. `FLOW-COOK-01`：菜谱详情多媒体联动与动态分量换算流

- **1. 关联范围与前置条件**（Given）：
  - **支撑功能**：[FEAT-05 多媒体富文本详情、双图表与动态换算](../../01-vision-and-scope.md#feat-05)
  - **涉及视图与规则**（逐条展开）：
    - 视图与组件：[PAGE-COOK-01 多媒体菜谱详情页](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[COMP-ServingsStepper 目标人数步进器](../../05-components-and-patterns/shared-components.md#comp-servingsstepper)
    - 规则：[RULE-COOK-01 详情目标人数继承优先级](../../03-business-rules/portion-and-cooking.md#rule-cook-01)、[RULE-COOK-02 多量纲人性化取整](../../03-business-rules/portion-and-cooking.md#rule-cook-02)、[RULE-COOK-03 食材表与步骤正文动态同步](../../03-business-rules/portion-and-cooking.md#rule-cook-03)、[RULE-SRCH-03 主动检索忌口温和预警](../../03-business-rules/search-and-matching.md#rule-srch-03)
  - **触发前置条件**：用户从今日菜谱、找菜谱、收藏夹或个人中心最近浏览足迹点击任一菜谱卡片进入 `PAGE-COOK-01`。
- **2. 端到端交互与规则流转图**：

```mermaid
flowchart TD
    OPEN(["Push 进入 [PAGE-COOK-01 多媒体菜谱详情页]"]) --> INIT_SV["按 [RULE-COOK-01 继承优先级] (上游传参 > 饮食档案人数 > 基准人份) 确定初始人数"]
    INIT_SV --> RENDER["渲染 [PAGE-COOK-01]: 视频/封面 + 单人营养环图 + 折算食材表(含 [RULE-SRCH-03 忌口预警]) + 火候图 + 步骤流"]

    RENDER --> INTERACT{"用户在 [PAGE-COOK-01] 执行阅读或备料交互"}
    INTERACT -- "点击 COMP-ServingsStepper 加减人数" --> SCALE["按 [RULE-COOK-02 人性化取整] + [RULE-COOK-03 步骤动态同步] 刷新食材表与步骤内嵌调料胶囊"]
    INTERACT -- "点击工序火候时间轴某阶段块" --> SCROLL_STEP["平滑滚动定位至对应目标步骤号 target_step_no"]
    INTERACT -- "点击步骤内 [▶ mm:ss 看手法] 胶囊" --> SEEK_VID["主视频跳至对应秒数锚点播放 (手机端已滚出顶部时唤起 S3_MobileMiniPiP 悬浮小窗)"]
    INTERACT -- "点击 [开始跟做] 主按钮" --> GO_FOCUS["携带当前目标人数 target_servings 全屏打开 [PAGE-COOK-02 分步跟做视图]"]

    SCALE & SCROLL_STEP & SEEK_VID --> RENDER
```

- **3. 中断与异常回退**：当处于弱网或离线环境导致教学视频流超时失败时，遵循 [PAT-ViewStates 全局视图四态契约](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) 切换至 `S4_VideoDegraded`（回退高清静态封面海报 + `[↻ 重试视频]`），食材换算器、双图表与图文步骤保持 100% 正常交互不阻塞；手机端用户手动点击悬浮视频小窗 `✕` 关闭后，本次浏览下滑不再自动弹小窗打扰（除非再次主动点击步骤内的 `[▶ mm:ss 看手法]`）。
- **4. 跨页状态与缓存同步影响**：① 打开详情页时自动将该菜谱追加至本地/云端最近浏览历史队首（[PAGE-PROF-01 个人中心主页](../../06-pages/user-profile/profile-home.md#page-prof-01) 可见，上限 `20` 条）；② **作用域严格隔离**：在详情页通过步进器调整的目标人数（`target_servings`）仅作用于本次详情与下游 [PAGE-COOK-02 全屏跟做视图](../../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) 会话，**绝不反向污染**个人饮食档案中的全局期望人数（`household_size`）或今日三餐人数。

---

## <a id="flow-cook-02"></a>2. `FLOW-COOK-02`：全屏分步跟做与跨步骤悬浮倒计时完播流

- **1. 关联范围与前置条件**（Given）：
  - **支撑功能**：[FEAT-06 屏幕常亮大字分步跟做与跨步计时](../../01-vision-and-scope.md#feat-06)
  - **涉及视图与约束**：[PAGE-COOK-01 多媒体菜谱详情页](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[PAGE-COOK-02 全屏分步跟做视图](../../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02)、[NFR-03 厨房防油污与常亮易用性](../../01-vision-and-scope.md#nfr-03)、[RULE-COOK-02 多量纲人性化取整](../../03-business-rules/portion-and-cooking.md#rule-cook-02)、[RULE-COOK-03 食材表与步骤正文动态同步](../../03-business-rules/portion-and-cooking.md#rule-cook-03)
  - **触发前置条件**：用户在详情页已确认用餐人数，点击底部或右侧吸顶栏的 `[🍳 开始跟做]` 主按钮。
- **2. 端到端交互与规则流转图**：

```mermaid
flowchart TD
    ENTER_COOK(["从 [PAGE-COOK-01 详情页] 点击开始跟做进入 [PAGE-COOK-02]"]) --> WAKE_LOCK["隐藏全局导航壳, 请求 [NFR-03 屏幕常亮锁], 渲染第 0 页(开火前备料清点卡)"]
    WAKE_LOCK -- "核对折算后主辅料, 点击 [备齐了, 正式开火]" --> STEP_N["进入 [PAGE-COOK-02] 大字单步专注卡 (Step 1..N, 调料值按 [RULE-COOK-03] 折算)"]

    STEP_N --> STEP_ACT{"厨房跟做期间用户操作"}
    STEP_ACT -- "点击本步 [启动倒计时] 按钮" --> FLOAT_TIMER["在顶栏挂载全局悬浮计时胶囊 (S5_CookFocusTimer: 翻至上下步均后台持续跳秒)"]
    FLOAT_TIMER -- "倒计时归零" --> ALARM["触发清脆提示音与顶栏橙色闪烁提醒 (点击胶囊确认收起)"]

    STEP_ACT -- "点击底部超大热区 上一步 / 下一步" --> NAV_STEP{"是否已达最后一步并点击 [完成出锅] ?"}
    NAV_STEP -- "否" --> STEP_N
    NAV_STEP -- "是" --> FINISH["释放屏幕常亮锁, 销毁计时器, 上报完播埋点并返回 [PAGE-COOK-01 详情页] 弹出完赛鼓励"]
```

- **3. 中断与异常回退**：① 若浏览器环境不支持系统级屏幕常亮接口（`Screen Wake Lock API`）或设备低电量拒绝授权，顶栏常亮状态灯降级提示“请调长手机自动锁屏时间”，不阻断跟做流程；② 用户在中途点击右上角 `[退出跟做 ✕]` 时：若当前无运行中的倒计时则直接释放常亮锁返回详情页；若有正在跳秒的炖煮倒计时，先弹轻确认“当前倒计时仍在运行，确认退出跟做吗？”防止湿手误触中断掐表。
- **4. 跨页状态与缓存同步影响**：退出或完成跟做视图返回宿主 `PAGE-COOK-01`（菜谱详情页）时，宿主详情页完整保留进入跟做前的目标折算人数（`target_servings`）与食材备料勾选态，并恢复外层视口对应的全局导航壳显隐状态。
