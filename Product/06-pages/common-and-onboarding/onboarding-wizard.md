# <a id="page-comm-01"></a>`PAGE-COMM-01`：首次 5 步饮食偏好引导向导

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-COMM-01` · 沉浸式分步卡片向导 |
| **访问权限** | 游客与登录用户均可访问 |
| **上游入口** | 首次冷启动欢迎卡、[PAGE-PLAN-01](../daily-plan/daily-meal-plan.md#page-plan-01) 顶部定制横幅、[PAGE-PROF-02](../user-profile/dietary-archive-editor.md#page-prof-02) 重走引导入口 |
| **下游出口** | 完成后进入 [PAGE-PLAN-01](../daily-plan/daily-meal-plan.md#page-plan-01)（关联流程：[FLOW-AUTH-01](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-01)） |
| **配套画板原型** | [common-onboarding.html](../../08-verification/prototypes/pages/common-onboarding.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 全屏卡片：顶部固定进度条与 `[跳过]`，中部滚动选项区，底部固定 `[上一步]` / `[下一步]` |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) / [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 居中模态窗口（宽 `560px`，高自适应 `<= 82vh`），半透明遮罩背景 |

---

## 3. 区块组装与数据绑定清单

| 步骤 / 区块 | 控件类型或复用组件 | 绑定的领域字段与枚举（`DOM-*` / `ENUM-*`） | 显隐与默认值约束 |
| :--- | :--- | :--- | :--- |
| **顶部导航头** | `1/5 ~ 5/5` 进度条 + `跳过先逛` 按钮 | — | 全步骤常驻 |
| **Step 1：规模与目的** | 单选卡 + [COMP-ServingsStepper](../../05-components-and-patterns/shared-components.md#comp-servingsstepper) + 多选芯片 | `household_size` ([ENUM-USR-HouseholdSize](../../02-domain-model/user-profile/enums.md#enum-usr-householdsize))、`has_kids`、`has_seniors`、`app_purposes` ([ENUM-USR-Purpose](../../02-domain-model/user-profile/enums.md#enum-usr-purpose)) | `has_kids/seniors` 仅在人数 `>= 2` 时展开；默认预选 `2人` + `daily_decide` |
| **Step 2：口味与辣度** | 多选风味芯片 + 4 档分段滑块 | `favorite_flavors` ([ENUM-USR-Flavor](../../02-domain-model/user-profile/enums.md#enum-usr-flavor))、`max_spiciness` ([ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)) | 辣度默认预选 `1`（微辣） |
| **Step 3：忌口排除** | 互斥 `无忌口` 芯片 + 网格多选 + 食材搜索框 | `avoid_tags` ([ENUM-USR-AvoidTag](../../02-domain-model/user-profile/enums.md#enum-usr-avoidtag))、`avoid_ingredient_ids` | 勾选任一具体忌口时自动取消 `无忌口` |
| **Step 4：厨艺与厨具** | 3 选 1 等级卡 + 耗时单选 + 厨具多选 | `skill_level` ([ENUM-USR-SkillLevel](../../02-domain-model/user-profile/enums.md#enum-usr-skilllevel))、`weekday_time_budget` ([ENUM-USR-TimeBudget](../../02-domain-model/user-profile/enums.md#enum-usr-timebudget))、`owned_appliances` ([ENUM-USR-Appliance](../../02-domain-model/user-profile/enums.md#enum-usr-appliance)) | 默认选中 `wok_pot` 与 `rice_cooker` |
| **Step 5：健康诉求** | 多选健康卡片 + 底部主按钮 `[生成今日三餐]` | `health_tags` ([ENUM-USR-HealthTag](../../02-domain-model/user-profile/enums.md#enum-usr-healthtag)) | 默认选中 `balanced` |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_Step1_Household` | 步骤 1：用餐人数与结构展开态 | 展示人数档位及 `>=2人` 展开的儿童/老人复选框 |
| `S2_Step2_3_TasteAvoid` | 步骤 2~3：风味辣度与忌口选择态 | 展示辣度标尺提示与忌口互斥选中态 |
| `S3_Step4_5_SkillHealth` | 步骤 4~5：厨艺厨具与生成收尾态 | 展示底部 `[✨ 生成我的今日三餐]` 主召唤态 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 点击右上角 `[跳过先逛]` | — | [RULE-SYNC-01](../../03-business-rules/identity-and-sync.md#rule-sync-01) | 保留已填步、未填步赋默认值，关闭向导进入 `PAGE-PLAN-01` | [EVT-01](../../07-metrics-and-tracking/event-dictionary.md#evt-01) (`action='skip'`) |
| 在 Step 5 点击 `[生成我的今日三餐]` | 至少保留 1 项健康标签 | [RULE-SYNC-01](../../03-business-rules/identity-and-sync.md#rule-sync-01) + [RULE-PLAN-02](../../03-business-rules/meal-recommendation.md#rule-plan-02) | 保存本地草稿或云端档案，生成三餐并进入 `PAGE-PLAN-01` | [EVT-02](../../07-metrics-and-tracking/event-dictionary.md#evt-02) |
