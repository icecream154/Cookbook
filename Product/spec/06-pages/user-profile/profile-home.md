# <a id="page-prof-01"></a>`PAGE-PROF-01`：我的个人中心主页

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-PROF-01` · 我的个人中心与饮食档案总览主页 |
| **视图载体与层级** | `L1` 一级常驻导航个人空间（Tab 4，开启 Keep-Alive 保活） |
| **访问权限与游客策略** | 游客与已登录用户均可直接访问；游客完整展示本地已定制的饮食偏好草稿摘要与最近浏览足迹，并附跨端同步登录引导 |
| **路由入参与上下文继承** | 实时读取 [DOM-USR-Account 用户账号实体](../../02-domain-model/user-profile/entities.md#dom-usr-account)、[DOM-USR-DietaryProfile 个人饮食档案](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 与本地/云端浏览历史队列 |
| **上游进入入口** | 全局一级导航栏 Tab 4 |
| **下游跳转出口与无栈兜底** | `Push` 进入 [PAGE-PROF-02 饮食档案编辑页](./dietary-archive-editor.md#page-prof-02) 或 [PAGE-COOK-01 多媒体菜谱详情](../recipe-consumption/recipe-detail.md#page-cook-01)、唤起 [PAGE-COMM-02 快捷认证弹窗](../common-and-onboarding/auth-modal.md#page-comm-02) |
| **关联可交互画板** | [user-profile.html](../../08-verification/prototypes/pages/user-profile.html) · 跨页动线 [flow-profile-to-plan-sync.html](../../08-verification/prototypes/flows/flow-profile-to-plan-sync.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile 手机竖屏壳 (<768px)](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-SplitDetail 主副双栏骨架](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 底部 `60px` 4-Tab 栏常驻；账号身份卡、五维饮食档案大卡、最近浏览与厨房设置纵向单列排布 |
| [SHELL-Tablet 平板横屏壳 (768~1023px)](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-SplitDetail 主副双栏骨架](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 左侧 `76px` 导航轨常驻；主区采用左右双栏并列：左栏（`38%`）放置账号身份卡与厨房常亮设置，右栏（`62%`）展开五维饮食档案全景卡与最近浏览足迹 |
| [SHELL-Desktop 桌面宽屏壳 (>=1024px)](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-SplitDetail 主副双栏骨架](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 左侧 `220px` 侧栏常驻；`1200px` 居中版心内维持左身份设置（`36%`）+ 右饮食档案与双列最近浏览简卡（`64%`） |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（附字段语义说明） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 账号身份与云同步状态卡 | 头像 + 昵称/游客标识 + 云同步状态徽章 + 收藏总数统计 + `[登录永久保存]` / `[退出登录]` 按钮 | [DOM-USR-Account 用户账号实体](../../02-domain-model/user-profile/entities.md#dom-usr-account)、档案状态源（`profile_source`） | 常驻；已登录展示脱敏账号与收藏计数，游客展示橙色同步引导按钮 |
| **B2** | 我的五维饮食档案全景大卡 | 五维键值摘要矩阵（用餐人数结构 / 风味与辣度上限 / 忌口过敏源 / 厨艺耗时与厨具 / 健康目标）+ `[编辑档案 >]` | [DOM-USR-DietaryProfile 个人饮食档案](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) | 常驻；若处于未定制默认态（`default`），顶部高亮提示“当前使用通用默认参数”并提供一键建档入口 |
| **B3** | 最近浏览菜谱足迹区 | 横滑/双列轻量菜谱简卡（缩略图 + 单行菜名 + 耗时）+ `[清空足迹]` | 本地/云端最近浏览菜谱列表（上限 `20` 条） | 常驻；`0` 条记录时按 [PAT-ViewStates 全局视图四态契约](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) 渲染精简引导文案 |
| **B4** | 厨房偏好基础设置卡 | `跟做模式默认请求屏幕常亮` 开关 + 计量单位说明 | 本地客户端偏好配置（响应 [NFR-03 厨房防油污与常亮易用性](../../01-vision-and-scope.md#nfr-03)） | 常驻；屏幕常亮开关默认开启 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_LoggedSynced` | 已登录云端同步摘要态 | 已登录且档案状态源为云端同步（`profile_source == 'cloud_synced'`） | 账号卡展示绿色 `☁️ 饮食档案与收藏已跨端同步` 徽章，完整呈现五维饮食偏好标签矩阵与退出按钮 | 点击 `[编辑档案 >]` 进入编辑页、点浏览足迹进详情或退出登录 |
| `S2_GuestLocalDraft` | 游客本地草稿待绑定态 | 未登录游客且已在本地定制过偏好草稿（`profile_source == 'local_draft'`） | 完整展示本地已生效的五维偏好摘要，身份卡醒目提示 `本地草稿仅保存在当前浏览器` 及橙色主按钮 `[登录以永久跨端保存]` | 点击登录按钮触发拦截认证同步上云切至 `S1`，或照常点击 `[编辑档案 >]` 修改本地草稿 |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程（附语义短名） | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 点击饮食档案大卡 `[编辑档案 >]` | — | — | `Push` 进入单页分组编辑页 `PAGE-PROF-02` | — |
| 游客在 `S2_GuestLocalDraft` 点击 `[登录以永久跨端保存]` | [PAT-AuthResume 未登录拦截接续](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [FLOW-AUTH-02 拦截登录接续流](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02) + [RULE-SYNC-02 本地与云端旧档案裁决](../../03-business-rules/identity-and-sync.md#rule-sync-02) | 唤起快捷认证弹窗；认证并完成冲突裁决后自动将本地档案同步上云，原位切换至 `S1_LoggedSynced` | [EVT-03 完成快捷认证埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
| 点击最近浏览中的任一菜谱简卡 | — | [RULE-COOK-01 详情目标人数继承优先级](../../03-business-rules/portion-and-cooking.md#rule-cook-01) | `Push` 进入菜谱详情页并透传来源 `entry_source='history'` | [EVT-09 菜谱详情浏览埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-09) (`entry_source='history'`) |
| 已登录点击 `[退出登录]` | 轻量二次确认框 | [RULE-SYNC-01 游客本地草稿与默认兜底](../../03-business-rules/identity-and-sync.md#rule-sync-01) | 清除当前会话登录态与云端私有收藏列表视图，回退至未登录游客态 | — |
