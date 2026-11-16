# <a id="page-comm-01"></a>`PAGE-COMM-01`：首次 5 步饮食偏好引导向导

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-COMM-01` · 首次 5 步饮食偏好引导向导 |
| **视图载体与层级** | `G` 全局引导向导容器（挂载于 `Z50` 层，禁用点击遮罩误关） |
| **访问权限与游客策略** | 游客与已登录用户均可访问（游客落盘本地草稿，已登录落盘云端档案） |
| **路由入参与上下文继承** | 可选传入 `trigger_from`（`'cold_start' \| 'home_banner' \| 'archive_reset'`）；若已有非空档案重走向导，预填当前生效值 |
| **上游进入入口** | 首次冷启动欢迎卡、[PAGE-PLAN-01](../daily-plan/daily-meal-plan.md#page-plan-01) 顶部定制横幅、[PAGE-PROF-02](../user-profile/dietary-archive-editor.md#page-prof-02) `[重走 5 步卡片向导]` |
| **下游跳转出口与无栈兜底** | 完成或跳过后进入 [PAGE-PLAN-01 今日菜谱](../daily-plan/daily-meal-plan.md#page-plan-01)（关联流程：[FLOW-AUTH-01](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-01)） |
| **关联可交互画板** | [common-onboarding.html](../../08-verification/prototypes/pages/common-onboarding.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载容器形态 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 全屏沉浸卡片（`100vw × 100dvh`） | 隐藏全局底部 Tab；顶部固定步骤进度条与 `[跳过先逛]`，中部独立滚动当前步选项卡片，底部固定 `[← 上一步]` / `[下一步 →]` |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 居中大模态窗（宽 `560px`，`max-height: 82vh`） | 半透明遮罩覆盖宿主 `PAGE-PLAN-01`；弹窗内部保持头/体/脚三段固定结构，多选芯片采用 3~4 列舒展网格 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 居中大模态窗（宽 `560px`，`max-height: 82vh`） | 同平板居中模态框，支持键盘 `Enter` 进入下一步，禁用 `Esc` 或遮罩点击防误丢已填项 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 顶栏进度与跳过区 | `Step 1/5 ~ 5/5` 分段进度条 + `[跳过先逛]` 按钮 | — | 全程常驻吸顶 |
| **B2** | Step 1：规模与目的 | 人数单选卡 + [COMP-ServingsStepper](../../05-components-and-patterns/shared-components.md#comp-servingsstepper) (`onboarding_custom`) + 目的多选芯片 | [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) `household_size` ([ENUM-USR-HouseholdSize](../../02-domain-model/user-profile/enums.md#enum-usr-householdsize))、`has_kids`、`has_seniors`、`app_purposes` ([ENUM-USR-Purpose](../../02-domain-model/user-profile/enums.md#enum-usr-purpose)) | `step == 1` 显示；`has_kids/seniors` 仅在人数 `>= 2` 时展开；选 `4人+` 展开步进器（`4..8`）；默认预选 `2人` + `daily_decide` |
| **B3** | Step 2：风味与辣度 | 风味多选芯片组 + 4 档辣度分段滑块 | `favorite_flavors` ([ENUM-USR-Flavor](../../02-domain-model/user-profile/enums.md#enum-usr-flavor))、`max_spiciness` ([ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)) | `step == 2` 显示；辣度默认预选微辣档 |
| **B4** | Step 3：忌口与过敏 | 互斥 `[✓ 无特殊忌口]` 芯片 + 高频忌口多选网格 + 标准食材检索添加框 | `avoid_tags` ([ENUM-USR-AvoidTag](../../02-domain-model/user-profile/enums.md#enum-usr-avoidtag))、`avoid_ingredient_ids` ([DOM-RCP-StandardIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient)) | `step == 3` 显示；勾选任一具体忌口自动取消 `无特殊忌口`，反之清空具体项 |
| **B5** | Step 4：厨艺与厨具 | 3 选 1 厨艺卡 + 平日耗时单选 + 现有厨具多选网格 | `skill_level` ([ENUM-USR-SkillLevel](../../02-domain-model/user-profile/enums.md#enum-usr-skilllevel))、`weekday_time_budget` ([ENUM-USR-TimeBudget](../../02-domain-model/user-profile/enums.md#enum-usr-timebudget))、`owned_appliances` ([ENUM-USR-Appliance](../../02-domain-model/user-profile/enums.md#enum-usr-appliance)) | `step == 4` 显示；默认勾选基础炒锅与电饭煲，至少保留 `1` 项厨具 |
| **B6** | Step 5：健康诉求与收尾 | 健康目标多选大卡 + 底部主按钮 `[✨ 生成我的今日三餐]` | `health_tags` ([ENUM-USR-HealthTag](../../02-domain-model/user-profile/enums.md#enum-usr-healthtag)) | `step == 5` 显示；默认预选均衡家常 `balanced`，至少保留 `1` 项 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_Step1_Household` | 步骤 1：用餐人数与结构展开态 | 打开向导初始化处于第 1 步且选中 `>= 2` 人档位 | 进度条 `1/5`，展开“家有儿童 / 家有老人”勾选项，左侧无上一步按钮 | 切换人数/目的、点击 `[下一步 →]` 进入 `S2` 或点 `[跳过先逛]` |
| `S2_Step2_3_TasteAvoid` | 步骤 2~3：风味辣度与忌口选择态 | 推进至第 2 或第 3 步偏好采集区 | 进度条 `2/5 ~ 3/5`，展示 4 档辣度上限说明及忌口芯片与“无忌口”互斥高亮态 | 点击 `[← 上一步]` 回改、点击 `[下一步 →]` 推进至 `S3` 或跳过 |
| `S3_Step4_5_SkillHealth` | 步骤 4~5：厨艺厨具与生成收尾态 | 推进至第 4 或第 5 步收尾确认区 | 进度条满格 `5/5`，底部主行动按钮切换为橙色高亮 `[✨ 生成我的今日三餐]` | 点击 `[← 上一步]` 微调，或点击主按钮保存档案并进入 `PAGE-PLAN-01` |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 打开向导完成第 1 步首屏渲染 | [PAT-ViewStates](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | [FLOW-AUTH-01](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-01) | 展示 `S1_Step1_Household` 并预填安全默认项 | [EVT-01](../../07-metrics-and-tracking/event-dictionary.md#evt-01) (`action='enter', step_no=1`) |
| 任一步点击右上角 `[跳过先逛]` | — | [RULE-SYNC-01](../../03-business-rules/identity-and-sync.md#rule-sync-01) | 新建档时保留已填步并对未填步赋默认值（重走向导时保留原正式档案），关闭向导跳转 `PAGE-PLAN-01` | [EVT-01](../../07-metrics-and-tracking/event-dictionary.md#evt-01) (`action='skip', step_no`) |
| 点击 `[← 上一步]` / `[下一步 →]` | 校验当前步必选项非空 | — | 内存暂存当前步草稿，平滑切换步骤卡片与进度条刻度 | — |
| 在第 5 步点击 `[✨ 生成我的今日三餐]` | 至少选中 `1` 项健康标签 | [RULE-SYNC-01](../../03-business-rules/identity-and-sync.md#rule-sync-01) + [RULE-PLAN-01](../../03-business-rules/meal-recommendation.md#rule-plan-01) + [RULE-PLAN-02](../../03-business-rules/meal-recommendation.md#rule-plan-02) | 写入本地草稿或云端档案，立即生成个性化三餐并进入 `PAGE-PLAN-01` | [EVT-02](../../07-metrics-and-tracking/event-dictionary.md#evt-02) (`source='wizard'`) |
