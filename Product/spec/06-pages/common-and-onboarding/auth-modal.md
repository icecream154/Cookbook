# <a id="page-comm-02"></a>`PAGE-COMM-02`：快捷注册登录与冲突裁决弹窗

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-COMM-02` · 快捷注册登录一体化认证弹窗 |
| **视图载体与层级** | `G` 全局认证中断弹层（挂载于 [ia-and-shell.md](../../04-ia-and-flows/ia-and-shell.md) `Z60` 层，高于业务抽屉 `Z50`） |
| **访问权限与游客策略** | 仅在 `auth_state == 'guest'` 未登录态被唤起；已登录态绝不出现 |
| **路由入参与上下文继承** | 读取内存挂起快照 `pendingAction`（含拦截动作类型与目标 `recipe_id`）；个人中心主动点击登录时 `pendingAction = null` |
| **上游进入入口** | 全站任意受限动作触发 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 拦截，或 [PAGE-FAV-01](../favorites/favorites-list.md#page-fav-01) / [PAGE-PROF-01](../user-profile/profile-home.md#page-prof-01) 主动点击登录 |
| **下游跳转出口与无栈兜底** | 认证并完成档案裁决后原位关闭 `Z60` 弹窗，留在原宿主页面自动重放挂起动作（[FLOW-AUTH-02](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02)） |
| **关联可交互画板** | [common-onboarding.html](../../08-verification/prototypes/pages/common-onboarding.html) · 跨页动线 [flow-auth-and-merge.html](../../08-verification/prototypes/flows/flow-auth-and-merge.html) |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载容器形态 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 底部圆角模态抽屉 Bottom Sheet（自适应内容高） | 贴底弹出并锁定底层滚动；系统软键盘唤起时容器自动随视觉视口（`visualViewport`）上推，确保验证码框与协议栏不被遮挡 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 屏幕居中模态卡片（固定宽 `420px`，圆角 `14px`） | 居中叠放于半透明遮罩之上（即使下方已展开 `PAGE-SRCH-02` 侧边抽屉亦在正上方清晰呈现） |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 屏幕居中模态卡片（固定宽 `420px`，圆角 `14px`） | 自动聚焦手机号/邮箱输入框，支持键盘 `Esc` 一键取消关闭 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（`DOM-*` / `ENUM-*`） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 弹窗头与接续意图提示条 | 标题 `免密快捷登录 / 注册` + 右上 `✕` + 蓝色接续提示横幅 | 读取内存 `pendingAction` | 横幅仅在 `pendingAction != null` 时显示（如 `验证后将自动为你收藏这道菜谱`） |
| **B2** | 一体化验证码登录表单 | 手机号/邮箱输入框 + `[获取验证码]`（`60s` 倒计时）+ 6 位数字验证码格 + 用户协议勾选框 | [DOM-USR-Account](../../02-domain-model/user-profile/entities.md#dom-usr-account) `phone_or_email` | `S1_AuthForm` 状态下显示；未注册账号验证通过即自动创建账号 |
| **B3** | 双端饮食档案冲突裁决卡 | “刚才定制的本地偏好” vs “账号原有云端档案”五维差异摘要对比双卡 + 二选一确认按钮 | 本地与云端两侧 [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) | 仅在 `S2_ProfileConflict`（命中 [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) 双侧非空不一致分支）时切换显示 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S1_AuthForm` | 验证码输入与动作接续提示态 | 未登录触发拦截或主动点击登录唤起弹窗时 | 顶部展示动作接续承诺横幅，中部渲染手机号/邮箱与 6 位验证码表单 | 输入获取并填满 6 位验证码提交，或点 `✕` / 遮罩无损取消退出 |
| `S2_ProfileConflict` | 云端历史档案与本地草稿冲突裁决态 | 验证码校验通过，且 [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) 检出本地有自定义草稿且老账号云端有不同旧档案 | 隐藏验证码框，原位切换并排/上下对比摘要卡（高亮人数、忌口、辣度差异项）与两颗明确裁决按钮 | 点击 `[采用刚才定制的新偏好]` 或 `[恢复账号原有云端档案]` 完成合并并关闭弹窗 |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程 | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 点击 `[获取验证码]` | 校验手机号或邮箱格式合法 | — | 下发验证码，按钮进入 `60s` 倒计时置灰防重发并自动聚焦验证码首格 | — |
| 输满第 6 位验证码自动提交 | 若未勾选协议先弹 `[同意协议并继续]` 轻确认 | [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) | • 无双端冲突：静默合并档案、关闭弹窗并按 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 自动执行挂起动作<br>• 有冲突：切换弹窗至 `S2_ProfileConflict` | 无冲突分支立即上报 [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) (`merge_resolution='auto'`) |
| 在 `S2_ProfileConflict` 点击任一档案保留方案 | `S2_ProfileConflict` | [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) + [RULE-SYNC-03](../../03-business-rules/identity-and-sync.md#rule-sync-03) | 按所选方案同步云端与本地档案（若选云端旧档案则置位今日菜单待刷新标记），关闭弹窗并自动重放 `pendingAction` | [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) (`merge_resolution='keep_local' \| 'keep_cloud'`) |
| 在 `S1_AuthForm` 点击 `✕`、遮罩或 `Esc` | [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [FLOW-AUTH-02](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02) | 清空内存 `pendingAction`，关闭弹窗，宿主页面保持点击前原状零副作用 | — |
