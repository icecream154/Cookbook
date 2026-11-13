# <a id="page-comm-02"></a>`PAGE-COMM-02`：快捷注册登录一体化认证弹窗

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-COMM-02` · 模态半屏抽屉 / 居中模态框 |
| **访问权限** | 仅在未登录状态被唤起 |
| **上游入口** | 全站任意受限操作拦截（[PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume)）或个人中心主动点击 `[立即登录]` |
| **下游出口** | 验证并裁决档案后关闭弹窗，原位恢复宿主页面并执行挂起动作（[FLOW-AUTH-02](../../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02)） |
| **配套画板原型** | [common-onboarding.html](../../08-verification/prototypes/pages/common-onboarding.html) 及动线原型 [flow-auth-and-merge.html](../../08-verification/prototypes/flows/flow-auth-and-merge.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 底部圆角模态抽屉（Bottom Sheet），软键盘弹起时自动上推输入框不被遮挡 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) / [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 居中模态卡片（宽 `420px`） |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 控件构成 | 绑定字段（`DOM-*`） | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **上下文接续提示条** | 顶部温和提示横幅 | 读取 `pendingAction` 类型 | 仅由 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 拦截唤起时显示（如“验证后将自动为你收藏该菜谱”） |
| **一体化验证码表单** | 手机号/邮箱输入框 + 6位验证码框 + 60s倒计时按钮 + 协议勾选 | [DOM-USR-Account](../../02-domain-model/user-profile/entities.md#dom-usr-account) `phone_or_email` | `S1_InputCode` 状态下显示 |
| **双端档案冲突裁决卡** | 本地新草稿摘要 vs 云端旧档案摘要对比卡片 + 二选一按钮 | 双侧 [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) | 仅当命中 [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) 双侧非空冲突分支时切换展示 |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_AuthForm` | 验证码输入与动作接续提示态 | 展示快捷登录表单与顶部接续意图说明 |
| `S2_ProfileConflict` | 云端历史档案与本地草稿冲突裁决态 | 验证码通过后检测到双端不同档案，展示摘要对比二选一卡片 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 输满 6 位验证码自动提交 | 未勾选协议时先弹 `[同意并继续]` 轻确认 | [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) | 无冲突则直接关闭弹窗并按 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 自动接续原动作；有冲突则切至 `S2_ProfileConflict` | [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
| 在冲突卡选择保留本地或恢复云端 | `S2_ProfileConflict` | [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) | 写入最终选定档案，关闭弹窗并自动接续原挂起动作 | [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
| 点击右上角 `✕` 或遮罩关闭 | — | [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | 清空 `pendingAction`，宿主页面保持点击前原貌 | — |
