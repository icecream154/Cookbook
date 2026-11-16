# <a id="page-prof-02"></a>`PAGE-PROF-02`：我的饮食档案单页编辑页

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-PROF-02` · 我的饮食档案单页分组编辑页 |
| **视图载体与层级** | `L2` 二级标准推入表单页（无需重走 5 步向导，支持一页平铺单点快改） |
| **访问权限与游客策略** | 游客（写本地 `local_draft`）与已登录用户（写云端 `cloud_synced`）均可直接编辑保存 |
| **路由入参与上下文继承** | 克隆当前生效 [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 形成表单工作副本，通过字段深比较计算 `is_dirty` 修改标记 |
| **上游进入入口** | [PAGE-PROF-01](./profile-home.md#page-prof-01) 点击 `[编辑档案 >]`、[PAGE-PLAN-01](../daily-plan/daily-meal-plan.md#page-plan-01) 画像摘要栏点击 `[调整偏好 >]` |
| **下游跳转出口与无栈兜底** | 保存成功后 `Pop` 返回触发来源页（无站内历史栈时兜底回退至 `PAGE-PROF-01`）；或点击底部辅助链接跳转 [PAGE-COMM-01](../common-and-onboarding/onboarding-wizard.md#page-comm-01) 重走向导 |
| **关联可交互画板** | [user-profile.html](../../08-verification/prototypes/pages/user-profile.html)（顶栏切至 `S3_ArchiveEditor` 直达） · 跨页动线 [flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-FocusedForm](../../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | **隐藏全局底部 4-Tab 栏**；顶部吸顶 `[← 返回]` 与五维分组快捷锚点胶囊条，中部全宽单列滚动 5 张分组卡片，底部常驻/吸底挂载 `[取消]` 与 `[💾 保存饮食档案]` 操作栏 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-FocusedForm](../../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | 保留左侧 `76px` 导航轨；主画布内采用 `max-width: 760px` 居中限宽单列分组卡片流，底部吸底操作栏跟随表单容器等宽对齐 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-FocusedForm](../../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | 保留左侧 `220px` 侧栏；版心内采用 `max-width: 820px` 居中限宽卡片流，顶部锚点条吸顶支持一键跳至“忌口排除”或“厨具配置”分组 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 顶栏返回、重走向导与分组锚点条 | `[← 返回]` + 标题 + `[重走 5 步向导]` 链接 + 5 个分组锚点芯片 | — | 常驻吸顶 |
| **B2** | 分组 1：用餐人数与家庭结构 | 档位单选芯片 + 儿童/老人复选框 | [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) `household_size` ([ENUM-USR-HouseholdSize](../../02-domain-model/user-profile/enums.md#enum-usr-householdsize))、`has_kids`、`has_seniors` | 常驻必填；`1人食` 档位下自动收起并置 `false` 儿童/老人勾选项 |
| **B3** | 分组 2：风味喜好与最高辣度 | 风味多选芯片 + 4 档辣度单选滑块 | `favorite_flavors` ([ENUM-USR-Flavor](../../02-domain-model/user-profile/enums.md#enum-usr-flavor))、`max_spiciness` ([ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)) | 常驻；最高辣度必选 |
| **B4** | 分组 3：忌口与过敏源排除 | 互斥 `无忌口` 芯片 + 高频忌口多选 + 标准食材搜索添加器 | `avoid_tags` ([ENUM-USR-AvoidTag](../../02-domain-model/user-profile/enums.md#enum-usr-avoidtag))、`avoid_ingredient_ids` | 常驻；当累计排除项 `> 6` 类主食材时，组内底部浮现琥珀色柔和提示“忌口较多可能减少每日可选菜谱池” |
| **B5** | 分组 4：厨艺、平日耗时与厨具 | 厨艺单选 + 耗时单选 + 厨具多选网格 | `skill_level` ([ENUM-USR-SkillLevel](../../02-domain-model/user-profile/enums.md#enum-usr-skilllevel))、`weekday_time_budget` ([ENUM-USR-TimeBudget](../../02-domain-model/user-profile/enums.md#enum-usr-timebudget))、`owned_appliances` ([ENUM-USR-Appliance](../../02-domain-model/user-profile/enums.md#enum-usr-appliance)) | 常驻；至少保留 `1` 项基础厨具不可全空 |
| **B6** | 分组 5：健康偏好与使用目的 | 健康标签多选 + 使用目的多选 + 吸底保存操作栏 | `health_tags` ([ENUM-USR-HealthTag](../../02-domain-model/user-profile/enums.md#enum-usr-healthtag))、`app_purposes` ([ENUM-USR-Purpose](../../02-domain-model/user-profile/enums.md#enum-usr-purpose)) | 常驻；两组均至少保留 `1` 项；未修改时保存按钮半透明置灰，有修改（`is_dirty == true`）时高亮激活 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S3_ArchiveEditor` | 单页分组编辑与变更待保存态 | 用户进入编辑页并对人数、辣度、忌口等任一字段做出修改（`is_dirty == true`） | 平铺全部 5 组偏好卡片直观展示变更项，底部吸底栏高亮激活橙色 `[💾 保存饮食档案修改]` 主按钮 | 点击保存持久化并返回来源页，或点击返回弹出放弃未保存修改确认框 |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 修改表单任意选项后点击 `[💾 保存饮食档案修改]` | 必填项非空且 `is_dirty == true` | [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03) + [FLOW-PLAN-02](../../04-ia-and-flows/flows/meal-planning.md#flow-plan-02) | 写入本地草稿或云端档案并刷新 `updated_at`（若当日已生成菜单则自动触发 `PAGE-PLAN-01` 的 `S4_ProfileDirty` 温和待重算标记），弹成功 Toast 并 `Pop` 返回来源页 | [EVT-02](../../07-metrics-and-tracking/event-dictionary.md#evt-02) (`source='editor'`) |
| `is_dirty == true` 时点击左上角 `[← 返回]` 或取消 | 弹出轻量确认框 `尚有修改未保存，确认放弃吗？` | — | 点击确认放弃则丢弃工作副本（不更新 `updated_at`）并原路返回；点继续编辑则留在当前页 | — |
| 点击右上角 `[重走 5 步向导]` | — | [FLOW-AUTH-01](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-01) | 携带当前生效值唤起 `PAGE-COMM-01`（`trigger_from='archive_reset'`） | [EVT-01](../../07-metrics-and-tracking/event-dictionary.md#evt-01) (`action='enter'`) |
