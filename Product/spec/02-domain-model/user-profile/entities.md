# 用户与饮食画像域：实体契约（`DOM-USR-*`）

## <a id="dom-usr-account"></a>1. `DOM-USR-Account`（用户账号实体）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | 用户唯一标识 | `string` | 是 | 全局唯一 UUID | 登录态身份主键；游客态为空 |
| `phone_or_email` | 认证凭证 | `string` | 是 | 手机号或合法邮箱 | 注册登录一体化唯一凭证，界面展示须脱敏 |
| `nickname` | 用户昵称 | `string` | 是 | 长度 `2 ~ 20` 字符 | 首次自动注册默认生成 `食客_XXXX`，支持修改 |
| `avatar_url` | 头像地址 | `string` | 否 | URL，空则展示默认厨师帽占位头像 | 个人中心展示 |
| `created_at` | 注册时间 | `datetime` | 是 | ISO-8601 时间戳 | 用于统计陪伴天数与新老客分群 |

---

## <a id="dom-usr-dietaryprofile"></a>2. `DOM-USR-DietaryProfile`（个人饮食画像实体）

> 注：该实体既可持久化于云端（绑定 `user_id`），也可作为 [TERM-USR-02 本地偏好草稿](./terms.md#term-usr-02) 存储在未登录设备本地。

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联枚举 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `profile_source` | 档案状态源 | `string` | 是 | `default` / `local_draft` / `cloud_synced` | 区分未定制通用默认态、游客本地草稿态与云端同步态 |
| `app_purposes` | 使用 APP 目的 | `string[]` | 是 | `1 ~ 3` 项，引用 [ENUM-USR-Purpose](./enums.md#enum-usr-purpose) | 决定推荐卡片重点外显指标（如控卡外显热量） |
| `household_size` | 期望用餐人数 | `int` | 是 | 范围 `1 ~ 8`，档位映射 [ENUM-USR-HouseholdSize](./enums.md#enum-usr-householdsize) | 同时决定今日配餐菜数结构与菜谱详情默认折算人数 |
| `has_kids` | 家有儿童标记 | `boolean` | 是 | 默认 `false`（仅 `household_size >= 2` 可置真） | 为真时提高免辣、高钙高蛋白与易咀嚼菜谱权重 |
| `has_seniors` | 家有老人标记 | `boolean` | 是 | 默认 `false`（仅 `household_size >= 2` 可置真） | 为真时提高少油少盐、软烂易消化菜谱权重 |
| `favorite_flavors` | 偏爱风味集合 | `string[]` | 否 | 多选，引用 [ENUM-USR-Flavor](./enums.md#enum-usr-flavor) | 空数组视为不限特定风味 |
| `max_spiciness` | 最高辣度接受度 | `int` | 是 | `0 ~ 3`，引用 [ENUM-RCP-Spiciness](../recipe-catalog/enums.md#enum-rcp-spiciness) | 属于 [TERM-USR-03 硬性饮食约束](./terms.md#term-usr-03) |
| `avoid_tags` | 忌口大类集合 | `string[]` | 否 | 多选，引用 [ENUM-USR-AvoidTag](./enums.md#enum-usr-avoidtag) | 高频过敏与忌口分类硬过滤项 |
| `avoid_ingredient_ids` | 自定义忌口食材 | `string[]` | 否 | 关联 [DOM-RCP-StandardIngredient](../recipe-catalog/entities.md#dom-rcp-standardingredient) | 用户手动搜索追加的具体不吃食材 ID 列表 |
| `skill_level` | 做菜能力等级 | `string` | 是 | 单选，引用 [ENUM-USR-SkillLevel](./enums.md#enum-usr-skilllevel) | 约束自动推荐菜谱的难度上限 |
| `weekday_time_budget` | 平日期望单餐耗时 | `int` | 是 | 单选分钟上限，引用 [ENUM-USR-TimeBudget](./enums.md#enum-usr-timebudget) | 软性优先排序与配餐耗时控制参数 |
| `owned_appliances` | 可用厨房厨具 | `string[]` | 是 | 至少含基础灶锅，引用 [ENUM-USR-Appliance](./enums.md#enum-usr-appliance) | 属于硬性约束：不推荐依赖用户未拥有厨具的菜谱 |
| `health_tags` | 健康饮食偏好 | `string[]` | 是 | 至少 1 项，引用 [ENUM-USR-HealthTag](./enums.md#enum-usr-healthtag) | 影响健康标签召回加权与命中理由标签外显 |
| `updated_at` | 最近修改时间 | `datetime` | 是 | ISO-8601 时间戳 | 用于比对当日菜单生成时间，判定是否触发温和重算提示 |
