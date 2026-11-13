# 旅程阶段四：菜谱消费与实操跟做流程（`FLOW-COOK-*`）

## <a id="flow-cook-01"></a>1. `FLOW-COOK-01`：菜谱详情多媒体联动与动态分量换算流

- **支撑功能**：[FEAT-05](../../01-vision-and-scope.md#feat-05)
- **涉及页面与规则**：[PAGE-COOK-01](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[RULE-COOK-01](../../03-business-rules/portion-and-cooking.md#rule-cook-01) ~ [RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03)、[RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03)。

```mermaid
flowchart TD
    OPEN(["从推荐/检索/收藏点击进入 PAGE-COOK-01 菜谱详情"]) --> INIT_SV["按 RULE-COOK-01 继承优先级确定初始 target_servings"]
    INIT_SV --> RENDER["渲染视频/封面 + 指标卡 + 营养环图 + 折算食材表(含忌口预警) + 火候时间轴图 + 富文本步骤"]

    RENDER --> INTERACT{"详情页内用户交互"}
    INTERACT -- "点击 COMP-ServingsStepper 调整人数" --> SCALE["按 RULE-COOK-02 & RULE-COOK-03 同步刷新食材清单与步骤内嵌调料胶囊"]
    INTERACT -- "点击火候时间轴图某阶段色块" --> SCROLL_STEP["平滑滚动定位至对应 target_step_no 步骤"]
    INTERACT -- "点击步骤内 视频时间锚点胶囊" --> SEEK_VID["跳转主视频至 video_anchor_sec 播放 (手机端若已下滑则自动唤起悬浮小窗)"]
    INTERACT -- "点击 开始跟做 主按钮" --> GO_FOCUS["携带当前 target_servings 进入 PAGE-COOK-02 全屏跟做视图"]

    SCALE & SCROLL_STEP & SEEK_VID --> RENDER
```

---

## <a id="flow-cook-02"></a>2. `FLOW-COOK-02`：全屏分步跟做与跨步骤悬浮倒计时完播流

- **支撑功能**：[FEAT-06](../../01-vision-and-scope.md#feat-06)
- **涉及页面与约束**：[PAGE-COOK-02](../../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02)、[NFR-03](../../01-vision-and-scope.md#nfr-03)、[RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03)。

```mermaid
flowchart TD
    ENTER_COOK(["从 PAGE-COOK-01 点击开始跟做进入 PAGE-COOK-02"]) --> WAKE_LOCK["开启 NFR-03 屏幕常亮锁 + 渲染第 0 页(开火前备料清点卡)"]
    WAKE_LOCK -- "核对折算后主辅料, 点击 备齐了正式开火" --> STEP_N["进入大字单步专注卡 (Step 1..N)"]

    STEP_N --> STEP_ACT{"跟做过程操作"}
    STEP_ACT -- "点击本步 启动倒计时 按钮" --> FLOAT_TIMER["在顶栏挂载全局悬浮倒计时胶囊 (翻页至上下步均持续跳秒不中断)"]
    FLOAT_TIMER -- "倒计时归零" --> ALARM["触发提示音与顶栏闪烁完成提醒"]

    STEP_ACT -- "点击 上一步 / 下一步" --> NAV_STEP{"是否已达最后一步并点击 完成出锅?"}
    NAV_STEP -- "否" --> STEP_N
    NAV_STEP -- "是" --> FINISH["释放屏幕常亮锁, 上报跟做完播事件, 返回 PAGE-COOK-01 并弹出完赛鼓励反馈"]
```
