# <a id="page-plan-02"></a>`PAGE-PLAN-02`：今日食材汇总核对抽屉

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-PLAN-02` · 宿主 `PAGE-PLAN-01` 的附属模态抽屉 |
| **访问权限** | 游客与登录用户均可使用 |
| **上游入口** | 点击 [PAGE-PLAN-01](./daily-meal-plan.md#page-plan-01) 右上角 `[🛒 今日食材汇总]` |
| **下游出口** | 关闭抽屉返回 `PAGE-PLAN-01`；或复制纯文本买菜清单至系统剪贴板 |
| **配套画板原型** | [daily-plan.html](../../08-verification/prototypes/pages/daily-plan.html)（切换至 `S5_IngSummaryDrawer` 状态直达） |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 底部弹出抽屉（高度 `85vh`） |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) / [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 右侧滑出抽屉（宽度 `420px`），可对照左侧三餐菜谱同时查看 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 控件构成 | 绑定实体与枚举（`DOM-*` / `ENUM-*`） | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **餐次范围多选条** | `[✓ 早餐]`、`[✓ 午餐]`、`[✓ 晚餐]` 开关胶囊 + 当前折算人数标识 | [ENUM-RCP-MealSlot](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-mealslot)、`applied_servings` | 常驻吸顶 |
| **货架分类合并列表** | 按 [ENUM-PLN-SummaryCategory](../../02-domain-model/meal-and-collection/enums.md#enum-pln-summarycategory) 分组的食材复选行 | [DOM-PLN-IngredientSummaryItem](../../02-domain-model/meal-and-collection/entities.md#dom-pln-ingredientsummaryitem)（含 `merged_display_amount` 与 `source_traces`） | 至少勾选 1 个餐次时展示 |
| **底部工具栏** | `[📋 复制买菜清单]` 按钮 + `[完成核对]` 主按钮 | — | 常驻吸底 |

---

## 4. 页面级状态枚举

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S5_IngSummaryDrawer` | 多餐合并与勾选核对正常态 | 跨餐次同名食材已合并求和并注明菜谱来源，支持点击划线打勾 |
| `S6_EmptyMealSelected` | 三餐全部取消勾选空态 | 展示空提示（[PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates)）：“请至少勾选一餐以汇总所需食材” |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 切换早/午/晚餐勾选胶囊 | — | [RULE-PLAN-05](../../03-business-rules/meal-recommendation.md#rule-plan-05) | 实时剔除或并入对应餐次食材，重新执行求和与人性化取整 | — |
| 点击某食材行 | — | — | 切换 `is_checked` 划线置灰状态并写入当日缓存 | — |
| 点击 `[📋 复制买菜清单]` | 列表非空 | — | 将“未勾选待采购”的食材按分类格式化写入剪贴板并弹 Toast | [EVT-06](../../07-metrics-and-tracking/event-dictionary.md#evt-06) (`action='copy'`) |
