# <a id="page-prof-01"></a>`PAGE-PROF-01`：我的个人中心主页

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-PROF-01` · 一级导航个人中心主页（Tab 4） |
| **访问权限** | 游客与登录用户均可访问 |
| **上游入口** | 全局一级导航栏、`PAGE-PLAN-01` 画像摘要条点击 `[调整偏好 >]` |
| **下游出口** | [PAGE-PROF-02 饮食档案编辑页](./dietary-archive-editor.md#page-prof-02)、[PAGE-COMM-02 认证弹窗](../common-and-onboarding/auth-modal.md#page-comm-02)、最近浏览跳 `PAGE-COOK-01` |
| **配套画板原型** | [user-profile.html](../../08-verification/prototypes/pages/user-profile.html) |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 单列纵向分组卡片 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) / [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 居中双栏容器：左栏账号身份与系统设置，右栏饮食档案全景摘要卡与最近浏览足迹 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 控件构成 | 绑定实体字段（`DOM-*`） | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **账号身份卡** | 头像 + 昵称/游客标识 + 收藏数统计 + `[立即登录]` / `[退出登录]` | [DOM-USR-Account](../../02-domain-model/user-profile/entities.md#dom-usr-account) | 常驻 |
| **我的饮食档案摘要大卡** | 五维生效摘要（用餐规模/口味辣度/忌口/厨艺耗时/健康目的）+ `[编辑档案 >]` | [DOM-USR-DietaryProfile](../../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) | 常驻（`default` 态显示立即建档按钮） |
| **最近浏览足迹与基础设置** | 最近浏览菜谱简卡（最多 20 条，支持清空）+ 默认屏幕常亮开关 | 本地/云端浏览历史 | 常驻 |

---

## 4. 页面级状态枚举（与画板原型顶栏 1:1 对齐）

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S1_LoggedSynced` | 已登录云端同步摘要态 | 显示账号昵称、云端已同步标识与五维饮食档案摘要矩阵 |
| `S2_GuestLocalDraft` | 游客本地草稿未绑定态 | 展示本地已定制偏好摘要，附带橙色 `[登录以永久跨端保存]` 引导按钮 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 点击饮食档案大卡 `[编辑档案 >]` | — | — | 进入单页分组编辑视图 `PAGE-PROF-02` | — |
| 游客点击 `[登录以永久保存]` | [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) | [RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02) | 唤起 `PAGE-COMM-02`，认证后自动将本地草稿同步上云 | [EVT-03](../../07-metrics-and-tracking/event-dictionary.md#evt-03) |
| 已登录点击 `[退出登录]` | 二次确认轻弹窗 | [RULE-SYNC-01](../../03-business-rules/identity-and-sync.md#rule-sync-01) | 清除登录凭证与云端收藏视图，回退至未登录默认态 | — |
