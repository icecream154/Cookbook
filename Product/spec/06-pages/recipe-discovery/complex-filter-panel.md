# <a id="page-srch-02"></a>`PAGE-SRCH-02`：多维复合筛选面板 / 常驻侧栏

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-SRCH-02` · 多维复合筛选面板 / 常驻侧栏 |
| **视图载体与层级** | `L2` 宿主 `PAGE-SRCH-01` 的复合过滤容器（移动/平板挂载于 `Z50` 模态抽屉；Web 桌面端降维挂载于 `[Slot-SubSide]` 常驻栏） |
| **访问权限与游客策略** | 游客可自由组合全部食材与属性筛选项；仅切换到“仅看已收藏”分段时触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume)（`Z60` 认证弹窗叠放在本抽屉正上方） |
| **路由入参与上下文继承** | 双向绑定宿主 `PAGE-SRCH-01` 当前激活的筛选状态树，并读取 [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 个人忌口摘要 |
| **上游进入入口** | 手机/平板点击 [PAGE-SRCH-01](./recipe-search.md#page-srch-01) 的 `[⚙ 复合筛选]`；`SHELL-Desktop` 进入 Tab 2 默认内嵌展开 |
| **下游跳转出口与无栈兜底** | 移动/平板点击底部 `[查看匹配的 N 道菜谱]` 关闭抽屉并提交刷新 `PAGE-SRCH-01`（点遮罩或 `✕` 丢弃未提交临时改动） |
| **关联可交互画板** | [recipe-discovery.html](../../08-verification/prototypes/pages/recipe-discovery.html)（顶栏切换至 `S5_FilterDrawerOpen` 直达） |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载容器形态 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 底部模态抽屉 Bottom Sheet（`max-height: 85vh`） | 顶部固定标题与 `✕`，中部独立滚动 7 个筛选分组，底部固定 `[重置全部]` 与实时计数确认主按钮 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 右侧滑出模态抽屉 Side Drawer（固定宽 `380px`，高 `100dvh`） | 锁定底层列表滚动，全高纵向排布筛选分组，底部固定重置与实时计数确认主按钮 |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 左侧内嵌常驻侧栏（[Mode-FilterWorkspace](../../04-ia-and-flows/ia-and-shell.md#mode-filterworkspace)，宽 `280px`） | 无遮罩非模态，隐藏 `✕` 与底部确认按钮（仅保留顶部 `[重置]`），任意勾选经 `250ms` 防抖实时刷新右侧结果网格 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 收藏范围分段器 | 二选一分段开关：`全部菜谱` / `仅看已收藏` | [DOM-PLN-FavoriteRecord](../../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord) | 常驻；与宿主快捷胶囊双向实时同步 |
| **B2** | 包含食材与双模开关区 | 常见食材多选芯片 + 标准食材检索添加框 + 二选一匹配模式切换器 | [DOM-RCP-StandardIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient)、[ENUM-PLN-IngMatchMode](../../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode) | 常驻，最多勾选 `8` 项食材；当已选 `>= 2` 项时动态展开 `智能匹配度排序` / `严格全部包含` 模式切换条 |
| **B3** | 排除食材与个人忌口开关 | `[一键排除我的个人忌口]` 开关 + 临时排除食材芯片 | [ENUM-USR-AvoidTag](../../02-domain-model/user-profile/enums.md#enum-usr-avoidtag)、`avoid_ingredient_ids` | 常驻；遵循 [RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03) 默认关闭不暗中屏蔽，开启后严格剔除含忌口菜谱 |
| **B4** | 菜系与辣度筛选组 | 菜系多选网格芯片 + 4 档辣度多选芯片 | [ENUM-RCP-Cuisine](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-cuisine)、[ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness) | 常驻；同组内多选按 `OR` 并集计算 |
| **B5** | 耗时与难度筛选组 | 单餐耗时上限单选芯片 + 难度多选芯片 | [ENUM-USR-TimeBudget](../../02-domain-model/user-profile/enums.md#enum-usr-timebudget)、[ENUM-RCP-Difficulty](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-difficulty) | 常驻；跨组之间按 `AND` 交集过滤 |
| **B6** | 健康诉求与厨具筛选组 | 健康标签多选（组内 `AND`）+ 特色厨具多选（组内 `OR`） | [ENUM-USR-HealthTag](../../02-domain-model/user-profile/enums.md#enum-usr-healthtag)、[ENUM-USR-Appliance](../../02-domain-model/user-profile/enums.md#enum-usr-appliance) | 常驻 |
| **B7** | 底部实时计数确认栏 | `[重置全部]` + `[查看匹配的 N 道菜谱]` 主按钮 | 实时试算命中总数 `N` | 仅 `SHELL-Mobile` 与 `SHELL-Tablet` 抽屉态吸底显示 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S5_FilterDrawerOpen` | 复合筛选抽屉展开与实时计数态 | 用户在 `PAGE-SRCH-01` 唤起复合筛选面板（且勾选 `>= 2` 项食材激活模式条） | 展开双模式切换器与各分组选中芯片，底部主按钮实时动态显示 `查看匹配的 N 道菜谱`（当试算 `N == 0` 时按钮转为橙色预警文案 `当前组合 0 结果，点击查看放宽建议`） | 增删筛选项、切换匹配模式、点击 `[重置全部]` 或点击主按钮提交返回 `PAGE-SRCH-01` |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 勾选/取消任一筛选项或切换包含食材匹配模式 | 包含食材上限 `<= 8`（超限轻提示） | [RULE-SRCH-02](../../03-business-rules/search-and-matching.md#rule-srch-02) + [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | • 移动/平板：实时刷新抽屉底栏预览命中数 `N`<br>• `SHELL-Desktop`：`250ms` 防抖后直接刷新右侧 `PAGE-SRCH-01` 列表 | Web 端直接触发 [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
| 未登录游客切换至 `仅看已收藏` | [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [FLOW-AUTH-02](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02) | 在本抽屉正上方 `Z60` 层叠放 `PAGE-COMM-02`；认证成功后保留本抽屉展开并自动切至 `仅看已收藏` 重算 `N` | 认证通过上报 [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
| 点击抽屉底部 `[查看匹配的 N 道菜谱]` | — | [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 收起抽屉并将筛选集合正式提交至宿主 `PAGE-SRCH-01` 渲染 | [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
| 点击 `[重置全部]` | — | — | 清空全部包含/排除食材与属性勾选项，恢复 `全部菜谱` 与默认排序 | Web 端同步上报 [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
