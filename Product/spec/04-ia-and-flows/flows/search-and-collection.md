# 旅程阶段三：探索检索与收藏沉淀流程（`FLOW-DISC-*`）

## <a id="flow-disc-01"></a>1. `FLOW-DISC-01`：多维复合检索与零结果放宽兜底流

- **支撑功能**：[FEAT-04](../../01-vision-and-scope.md#feat-04)
- **涉及页面与规则**：[PAGE-SRCH-01](../../06-pages/recipe-discovery/recipe-search.md#page-srch-01)、[PAGE-SRCH-02](../../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02)、[RULE-SRCH-01](../../03-business-rules/search-and-matching.md#rule-srch-01) ~ [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04)。

```mermaid
flowchart TD
    OPEN(["进入 PAGE-SRCH-01 找菜谱"]) --> INPUT_OR_FILTER{"检索触发路径"}
    INPUT_OR_FILTER -- "在 COMP-SearchBar 输入词" --> SUGGEST["按 RULE-SRCH-01 提示同义标准食材直达筛选项与匹配菜名"]
    INPUT_OR_FILTER -- "打开 PAGE-SRCH-02 复合筛选面板/侧栏" --> CONFIG_F["配置包含食材(选智能/严格模式)、排除忌口、菜系、辣度、耗时、仅看收藏"]

    CONFIG_F --> PREVIEW_N["按 RULE-SRCH-04 实时计算并在底部按钮显示命中数 N"]
    SUGGEST & PREVIEW_N --> EXEC["提交/防抖刷新检索列表"]

    EXEC --> CHECK_N{"命中菜谱数 N > 0 ?"}
    CHECK_N -- "是" --> RENDER_LIST["展示已激活条件胶囊条 + 结果卡片流 (含 RULE-SRCH-02 食材命中数与 RULE-SRCH-03 忌口预警)"]
    CHECK_N -- "否 (N == 0)" --> FALLBACK["按 RULE-SRCH-04 诊断最严苛冲突条件, 渲染一键放宽按钮与近似菜谱兜底"]
    FALLBACK -- "点击任一放宽按钮" --> EXEC
```

---

## <a id="flow-disc-02"></a>2. `FLOW-DISC-02`：轻量单层收藏与 4 秒误触撤销保护流

- **支撑功能**：[FEAT-07](../../01-vision-and-scope.md#feat-07)
- **涉及页面与模式**：[PAGE-FAV-01](../../06-pages/favorites/favorites-list.md#page-fav-01)、[COMP-RecipeCard](../../05-components-and-patterns/shared-components.md#comp-recipecard)、[PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume)、[PAT-UndoSnackbar](../../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar)。

```mermaid
flowchart TD
    CLICK_HEART(["用户在任意卡片或详情页点击收藏按钮"]) --> IS_LOGIN{"是否已登录?"}
    IS_LOGIN -- "否" --> AUTH_GATE["转入 FLOW-AUTH-02 (PAT-AuthResume 登录成功后自动接续收藏)"]
    IS_LOGIN -- "是" --> IS_FAV{"当前菜谱是否已在收藏夹?"}

    IS_FAV -- "否 (新增收藏)" --> ADD_FAV["乐观更新点亮红心 + 写入 DOM-PLN-FavoriteRecord + 轻提示"]
    IS_FAV -- "是 (取消收藏)" --> WHERE{"当前所在页面?"}

    WHERE -- "非收藏夹页 (如详情页/搜索页)" --> REMOVE_DIRECT["熄灭红心图标并移除收藏记录"]
    WHERE -- "在 PAGE-FAV-01 收藏夹列表内" --> REMOVE_WITH_UNDO["卡片平滑移除 + 触发 PAT-UndoSnackbar 4秒底部撤销条"]

    REMOVE_WITH_UNDO -- "4秒内点击 撤销" --> RESTORE["原位恢复卡片与收藏记录"]
    REMOVE_WITH_UNDO -- "4秒超时无操作" --> COMMIT_DEL["确认最终移除"]
```
