# 旅程阶段一：冷启动建档与身份转化流程（`FLOW-AUTH-*`）

## <a id="flow-auth-01"></a>1. `FLOW-AUTH-01`：新用户冷启动渐进式建档流

- **支撑功能**：[FEAT-01](../../01-vision-and-scope.md#feat-01)
- **涉及页面与规则**：[PAGE-COMM-01](../../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01)、[PAGE-PLAN-01](../../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[RULE-SYNC-01](../../03-business-rules/identity-and-sync.md#rule-sync-01)、[RULE-PLAN-02](../../03-business-rules/meal-recommendation.md#rule-plan-02)。

```mermaid
flowchart TD
    START(["首次启动应用"]) --> ENTRY{"用户在欢迎引导层选择"}
    ENTRY -- "跳过 / 先随便逛逛" --> DEFAULT_RULE["执行 RULE-SYNC-01 (profile_source = default)"]
    DEFAULT_RULE --> GUEST_PLAN["进入 PAGE-PLAN-01 (渲染默认2人时令三餐 + 定制引导横幅)"]

    ENTRY -- "立即定制专属三餐" --> WIZ["进入 PAGE-COMM-01 (5步卡片式偏好向导)"]
    GUEST_PLAN -- "点击顶部 30秒定制专属三餐" --> WIZ

    WIZ --> STEP_FLOW["依次配置: 1.人数目的 -> 2.风味辣度 -> 3.忌口 -> 4.厨艺厨具 -> 5.健康目标"]
    STEP_FLOW -- "中途点击 跳过剩余步骤" --> SAVE_PARTIAL["保留已填项 + 未填项取默认值"]
    STEP_FLOW -- "完成第5步点击 生成今日三餐" --> CHECK_LOGIN{"当前是否已登录?"}
    SAVE_PARTIAL --> CHECK_LOGIN

    CHECK_LOGIN -- "未登录" --> SAVE_DRAFT["按 RULE-SYNC-01 写入本地草稿 (local_draft)"]
    CHECK_LOGIN -- "已登录" --> SAVE_CLOUD["写入云端档案 (cloud_synced)"]

    SAVE_DRAFT & SAVE_CLOUD --> GEN_MEAL["按 RULE-PLAN-01 & RULE-PLAN-02 生成个性化三餐"]
    GEN_MEAL --> CUSTOM_HOME["进入 PAGE-PLAN-01 (展示专属三餐套餐)"]
```

---

## <a id="flow-auth-02"></a>2. `FLOW-AUTH-02`：受限操作触发登录接续与云端旧档案合并流

- **支撑功能**：[FEAT-01](../../01-vision-and-scope.md#feat-01)、[FEAT-07](../../01-vision-and-scope.md#feat-07)
- **涉及模式与规则**：[PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume)、[PAGE-COMM-02](../../06-pages/common-and-onboarding/auth-modal.md#page-comm-02)、[RULE-SYNC-02](../../03-business-rules/identity-and-sync.md#rule-sync-02)。
- **配套可交互微原型**：[flow-auth-and-merge.html](../../08-verification/prototypes/flows/flow-auth-and-merge.html)

```mermaid
flowchart TD
    TRIGGER(["未登录态点击受限动作: 收藏菜谱 / 仅看收藏过滤 / 云同步档案"]) --> RECORD_ACT["按 PAT-AuthResume 挂起待执行动作 pendingAction"]
    RECORD_ACT --> OPEN_AUTH["唤起 PAGE-COMM-02 (快捷注册登录一体化弹窗)"]

    OPEN_AUTH -- "用户主动关闭弹窗" --> ABORT["清空 pendingAction, 保持原页面原状态无损回退"]
    OPEN_AUTH -- "输入6位验证码校验通过" --> DIFF_CHECK{"执行 RULE-SYNC-02 检查本地草稿与云端旧档案"}

    DIFF_CHECK -- "无冲突 (仅一侧有自定义档案或均为空)" --> AUTO_SYNC["静默同步合并饮食档案"]
    DIFF_CHECK -- "存在双端冲突 (本地有新草稿 且 老账号云端有旧档案)" --> CONFLICT_UI["在 PAGE-COMM-02 内展示双档案摘要对比裁决卡"]

    CONFLICT_UI -- "选: 采用刚才定制的新偏好" --> OVERWRITE_CLOUD["本地草稿覆盖写入云端"]
    CONFLICT_UI -- "选: 恢复账号原有档案" --> PULL_CLOUD["拉取云端旧档案并标记今日菜单待重算"]

    AUTO_SYNC & OVERWRITE_CLOUD & PULL_CLOUD --> RESUME["自动执行挂起的 pendingAction (如点亮红心收藏) + 弹出成功 Toast"]
```
