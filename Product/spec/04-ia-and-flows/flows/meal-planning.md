# 旅程阶段二：日常三餐规划与买菜核对流程（`FLOW-PLAN-*`）

## <a id="flow-plan-01"></a>1. `FLOW-PLAN-01`：今日三餐浏览、换菜与食材合并流

- **支撑功能**：[FEAT-02](../../01-vision-and-scope.md#feat-02)、[FEAT-03](../../01-vision-and-scope.md#feat-03)
- **涉及页面与规则**：[PAGE-PLAN-01](../../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-PLAN-02](../../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02)、[RULE-PLAN-01](../../03-business-rules/meal-recommendation.md#rule-plan-01) ~ [RULE-PLAN-05](../../03-business-rules/meal-recommendation.md#rule-plan-05)。

```mermaid
flowchart TD
    ENTER(["打开 PAGE-PLAN-01 今日菜谱"]) --> HAS_PLAN{"当日 DOM-PLN-DailyMealPlan 是否已生成?"}
    HAS_PLAN -- "否 (当日首次访问)" --> GEN["按 RULE-PLAN-01 硬过滤 + RULE-PLAN-02 人数结构生成三餐"]
    HAS_PLAN -- "是" --> RENDER["渲染早/午/晚套餐卡片组 + RULE-PLAN-03 命中理由标签"]
    GEN --> RENDER

    RENDER --> ACT{"用户在 PAGE-PLAN-01 执行操作"}
    ACT -- "点击某道菜 换一道" --> SWAP_1["按 RULE-PLAN-04 同角色互斥防重替换该槽位"]
    ACT -- "点击某餐次 整餐换一批" --> SWAP_M["按 RULE-PLAN-04 重算该餐次全部槽位, 其余餐次不变"]
    ACT -- "切换顶部快捷人数胶囊" --> QUICK_SV["立即按新人数重算三餐槽位结构"]
    ACT -- "点击 今日食材汇总" --> OPEN_SUM["打开 PAGE-PLAN-02 抽屉, 按 RULE-PLAN-05 合并三餐食材"]

    OPEN_SUM --> TOGGLE_MEAL["勾选/取消 早·午·晚 餐次开关 -> 实时重算合并总量"]
    TOGGLE_MEAL --> CHECK_OFF["打勾核对已有食材 或 一键复制采购文本清单"]

    SWAP_1 & SWAP_M & QUICK_SV --> RENDER
    ACT -- "点击任一菜品卡主体" --> GO_COOK["携带当前生效人数进入 PAGE-COOK-01 菜谱详情页"]
```

---

## <a id="flow-plan-02"></a>2. `FLOW-PLAN-02`：修改饮食档案后的跨页温和重算闭环流

- **支撑功能**：[FEAT-01](../../01-vision-and-scope.md#feat-01)、[FEAT-02](../../01-vision-and-scope.md#feat-02)
- **涉及页面与规则**：[PAGE-PROF-02](../../06-pages/user-profile/dietary-archive-editor.md#page-prof-02)、[PAGE-PLAN-01](../../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03)。
- **配套可交互微原型**：[flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html)

```mermaid
flowchart TD
    EDIT(["用户在 PAGE-PROF-02 修改人数/辣度/忌口/健康标签并保存"]) --> UPDATE_TS["更新 DOM-USR-DietaryProfile.updated_at"]
    UPDATE_TS --> BACK_HOME["用户切换导航回到 PAGE-PLAN-01 今日菜谱"]
    BACK_HOME --> CHECK_DIRTY{"执行 RULE-SYNC-03: profile.updated_at > plan.generated_at ?"}

    CHECK_DIRTY -- "否" --> NORMAL["正常展示当前今日三餐"]
    CHECK_DIRTY -- "是 (进入画像待刷新态)" --> SHOW_BANNER["在 PAGE-PLAN-01 顶部展示温和确认条 (不直接覆盖原菜品)"]

    SHOW_BANNER -- "用户点击 立即重新生成" --> RECALC["按新档案执行 RULE-PLAN-01 & RULE-PLAN-02 重算三餐并更新 generated_at"]
    SHOW_BANNER -- "用户点击 保持今日原菜单" --> KEEP_OLD["收起确认条, 今日维持原菜单, 次日 00:00 自动按新档案生成"]
    RECALC & KEEP_OLD --> NORMAL
```
