# <a id="page-prof-02"></a>`PAGE-PROF-02`：我的饮食档案单页编辑页

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-PROF-02` · 二级单页分组表单页（无需翻走 5 步向导，支持单点快改） |
| **访问权限** | 游客（写本地草稿）与登录用户（写云端）均可编辑 |
| **上游入口** | [PAGE-PROF-01](./profile-home.md#page-prof-01) 点击 `[编辑档案]`、[PAGE-PLAN-01](../daily-plan/daily-meal-plan.md#page-plan-01) 点击 `[调整偏好 >]` |
| **下游出口** | 点击 `[保存饮食档案]` 返回来源页；或点击 `[重走 5 步卡片向导]` 跳转 `PAGE-COMM-01` |
| **配套画板原型** | [user-profile.html](../../08-verification/prototypes/pages/user-profile.html)（切换至 `S3_ArchiveEditor` 直达）及跨页动线 [flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| 全端自适应表单壳 | 顶部带分组锚点快捷条，中部平铺 5 个字段分组卡片，当检测到表单存在未保存修改（Dirty）时底部吸底浮现 `[取消]` 与 `[保存饮食档案]` 按钮 |

---

## 3. 区块组装与数据绑定清单

| 分组区块 | 绑定实体与枚举（完整复用 `02-domain-model/user-profile/`） | 校验与边界提示 |
| :--- | :--- | :--- |
| **分组 1：用餐人数与结构** | `household_size` ([ENUM-USR-HouseholdSize](../../02-domain-model/user-profile/enums.md#enum-usr-householdsize))、`has_kids`、`has_seniors` | 必填 |
| **分组 2：风味喜好与辣度** | `favorite_flavors` ([ENUM-USR-Flavor](../../02-domain-model/user-profile/enums.md#enum-usr-flavor))、`max_spiciness` ([ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness)) | 辣度必选 |
| **分组 3：忌口与过敏排除** | `avoid_tags` ([ENUM-USR-AvoidTag](../../02-domain-model/user-profile/enums.md#enum-usr-avoidtag))、`avoid_ingredient_ids` | 若勾选超过 6 类主食材，底部展示柔和提示“忌口较多可能减少推荐池可选菜式” |
| **分组 4：厨艺、耗时与厨具** | `skill_level`、`weekday_time_budget`、`owned_appliances` | 至少保留 1 项基础厨具 |
| **分组 5：健康偏好与目的** | `health_tags` ([ENUM-USR-HealthTag](../../02-domain-model/user-profile/enums.md#enum-usr-healthtag))、`app_purposes` ([ENUM-USR-Purpose](../../02-domain-model/user-profile/enums.md#enum-usr-purpose)) | 至少各选 1 项 |

---

## 4. 页面级状态枚举

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S3_ArchiveEditor` | 单页分组编辑与变更待保存态 | 平铺全部偏好维度供局部快速修改，底部激活高亮 `[保存饮食档案]` 按钮 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 修改任一字段后点击 `[保存饮食档案]` | 必填项校验通过 | [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03) | 更新 `DOM-USR-DietaryProfile.updated_at`（触发今日菜单温和待刷新标记），弹 Toast 并返回上一页 | [EVT-02](../../07-metrics-and-tracking/event-dictionary.md#evt-02) (`source='editor'`) |
| 有未保存变更时点击返回 | 弹出未保存放弃确认 | — | 确认放弃则丢弃草稿变更并返回 | — |
