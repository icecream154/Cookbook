# 旅程阶段三：探索检索与收藏沉淀流程（`FLOW-DISC-*`）

## <a id="flow-disc-01"></a>1. `FLOW-DISC-01`：多维复合检索与零结果放宽兜底流

- **1. 关联范围与前置条件**（Given）：
  - **支撑功能**：[FEAT-04](../../01-vision-and-scope.md#feat-04)
  - **涉及视图与规则**：[PAGE-SRCH-01](../../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-SRCH-02](../../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02)、[COMP-SearchBar](../../05-components-and-patterns/shared-components.md#comp-searchbar)、[RULE-SRCH-01](../../03-business-rules/search-and-matching.md#rule-srch-01) ~ [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04)
  - **触发前置条件**：用户进入一级导航 Tab 2 `PAGE-SRCH-01`（游客与登录用户均可直接使用）。
- **2. 端到端交互与规则流转图**：

```mermaid
flowchart TD
    OPEN(["进入 [PAGE-SRCH-01] 找菜谱主页 (S1_BrowseDefault)"]) --> INPUT_OR_FILTER{"用户发起检索方式"}
    INPUT_OR_FILTER -- "在 COMP-SearchBar 输入词条" --> SUGGEST["按 [RULE-SRCH-01] 渲染 S2_SuggestTyping: 同义标准食材快捷入口 + 菜名联想"]
    INPUT_OR_FILTER -- "展开 [PAGE-SRCH-02] 复合筛选抽屉/常驻栏" --> CONFIG_F["配置包含食材(双匹配模式)、排除忌口、菜系、辣度、耗时、仅看已收藏"]

    CONFIG_F --> PREVIEW_N["按 [RULE-SRCH-04] 实时试算并在抽屉底栏显示匹配数 N"]
    SUGGEST & PREVIEW_N --> EXEC["提交搜索或防抖刷新 [PAGE-SRCH-01] 结果流"]

    EXEC --> CHECK_N{"命中菜谱总数 N > 0 ? [RULE-SRCH-04]"}
    CHECK_N -- "是 (N > 0)" --> RENDER_LIST["渲染条件摘要条 + 结果列表 (含 [RULE-SRCH-02] 食材命中度与 [RULE-SRCH-03] 忌口预警标)"]
    CHECK_N -- "否 (N == 0)" --> FALLBACK["切换 [PAGE-SRCH-01] 至 S4_ZeroResultFallback: 诊断冲突项并提供一键放宽按钮与近似推荐"]
    FALLBACK -- "点击任一阶梯放宽按钮" --> EXEC
```

- **3. 中断与异常回退**：在移动/平板端打开 `PAGE-SRCH-02` 调整了若干筛选项但未点击底部 `[查看匹配的 N 道菜谱]` 主按钮，而是直接点击遮罩或右上角 `✕` 收起抽屉时，本次抽屉内未提交的临时勾选回退至打开前已生效的筛选集合（Web 桌面端因内嵌常驻无确认按钮，每次勾选经 `250ms` 防抖后直接生效）。
- **4. 跨页状态与缓存同步影响**：提交有效关键词后自动写入本地最近搜索历史（最多保留 10 条去重记录）；`PAGE-SRCH-01` 与 `PAGE-SRCH-02` 的筛选状态在跨一级 Tab 切换期间全程 Keep-Alive 保活，直至用户点击 `[清空全部]`；点击结果卡片进入 `PAGE-COOK-01` 再返回时保留原列表筛选态与滚动位置。

---

## <a id="flow-disc-02"></a>2. `FLOW-DISC-02`：轻量单层收藏与 4 秒误触撤销保护流

- **1. 关联范围与前置条件**（Given）：
  - **支撑功能**：[FEAT-07](../../01-vision-and-scope.md#feat-07)
  - **涉及视图与契约**：[PAGE-FAV-01](../../06-pages/favorites/favorites-list.md#page-fav-01)、[PAGE-COOK-01](../../06-pages/recipe-consumption/recipe-detail.md#page-cook-01)、[COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard)、[PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume)、[PAT-UndoSnackbar](../../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar)
  - **触发前置条件**：用户在全站任意 `COMP-RecipeCard` 右上角或 `PAGE-COOK-01` 操作栏点击红心收藏按钮。
- **2. 端到端交互与规则流转图**：

```mermaid
flowchart TD
    CLICK_HEART(["在任意卡片或 [PAGE-COOK-01] 点击收藏红心"]) --> IS_LOGIN{"校验登录态 [PAT-AuthResume]"}
    IS_LOGIN -- "未登录游客" --> AUTH_GATE["转入 FLOW-AUTH-02: 唤起 [PAGE-COMM-02] 认证并在通过后自动接续收藏"]
    IS_LOGIN -- "已登录用户" --> IS_FAV{"该 recipe_id 是否已在 DOM-PLN-FavoriteRecord ?"}

    IS_FAV -- "否 (新增收藏)" --> ADD_FAV["乐观更新点亮实心红心 ♥ + 写入收藏记录 + 轻提示已加入收藏夹"]
    IS_FAV -- "是 (取消收藏)" --> WHERE{"判定当前所在宿主视图"}

    WHERE -- "非收藏夹列表 (如 PAGE-PLAN-01 / PAGE-SRCH-01 / PAGE-COOK-01)" --> REMOVE_DIRECT["立即切换为空心 ♡ 并移除收藏记录 (列表项保留原位不消失)"]
    WHERE -- "处于 [PAGE-FAV-01] 收藏夹列表内" --> REMOVE_WITH_UNDO["卡片平滑收起 + 激活 [PAT-UndoSnackbar] 4秒底部撤销胶囊 (S2_UndoRemoving)"]

    REMOVE_WITH_UNDO -- "4000ms 内点击 撤销" --> RESTORE["原位无损恢复该卡片与原收藏时间戳"]
    REMOVE_WITH_UNDO -- "4000ms 倒计时自然结束或切页" --> COMMIT_DEL["确认最终移除; 若总收藏数归 0 则切至 S3_LoggedEmpty 空态"]
```

- **3. 中断与异常回退**：新增或取消收藏采用前端乐观更新（Optimistic UI），若后台持久化接口因断网报错，立即回滚红心点亮状态或重现刚收起的卡片，并弹出重试提示“网络开小差，收藏操作未保存”。
- **4. 跨页状态与缓存同步影响**：全站所有挂载 `COMP-RecipeCard` 的保活页面（`PAGE-PLAN-01`、`PAGE-SRCH-01`、`PAGE-FAV-01`）、`PAGE-COOK-01` 详情收藏按钮及 `PAGE-PROF-01` 账号卡收藏计数均订阅同一份内存收藏索引映射表，任一处增删收藏后跨页面 `0` 延迟即时同步。
