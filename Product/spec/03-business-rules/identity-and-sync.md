# 业务规则簇四：身份转化与跨端同步规则组（`RULE-SYNC-*`）

## <a id="rule-sync-01"></a>1. `RULE-SYNC-01`：游客本地偏好草稿与默认兜底规则

- **触发时机**：未登录用户首次打开应用、跳过引导向导、或在未登录态完成偏好问卷时。
- **输入依赖**：[DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)。
- **状态逻辑**：
  1. **纯默认态（`profile_source = 'default'`）**：游客直接点击“跳过先逛”时，系统按内置默认参数（`household_size = 2`、`max_spiciness = 1`、无忌口、`skill_level = 'intermediate'`、`weekday_time_budget = 30`、`health_tags = ['balanced']`）渲染通用精选三餐，并在首页顶部展示定制引导卡。
  2. **本地草稿态（`profile_source = 'local_draft'`）**：游客在未登录时完成偏好定制，全量配置写入客户端本地存储，立即享受与登录用户一致的个性化配餐，仅在顶部轻提示“登录账号可跨设备永久保存饮食档案”。
- **降级兜底**：本地存储不可用（如浏览器隐私无痕限制）时退化为内存会话态保存。
- **消费索引**：[FLOW-AUTH-01](../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-01)、[PAGE-COMM-01](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01)、[PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)。

---

## <a id="rule-sync-02"></a>2. `RULE-SYNC-02`：登录时云端旧档案与本地草稿冲突裁决规则

- **触发时机**：用户在 [PAGE-COMM-02 快捷认证弹窗](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) 校验验证码通过瞬间。
- **输入依赖**：本地 `DOM-USR-DietaryProfile` 草稿、云端账号绑定的历史 `DOM-USR-DietaryProfile`。
- **冲突裁决决策表**：

| 本地是否存在草稿 (`local_draft`) | 云端账号是否已有历史档案 | 系统执行裁决动作 |
| :--- | :--- | :--- |
| **否**（本地为 `default`） | **否**（新注册账号） | 初始化云端为空待建档态，保持通用推荐 |
| **是**（游客刚定制过偏好） | **否**（新注册或云端未建档） | **静默自动上云**：将本地草稿直接写入云端，置为 `cloud_synced` |
| **否**（本地为 `default`） | **是**（老用户换设备登录） | **静默拉取云端**：用云端档案覆盖本地并标记菜单待刷新 |
| **是**（游客刚定制过新偏好） | **是**（老账号云端已有旧档案且内容不同） | **显式二选一裁决**：在认证弹窗内切换为冲突确认视图，对比摘要后由用户点选 `[采用刚才新设的偏好]` 或 `[恢复账号原有档案]` |

- **降级兜底**：云端同步网络请求超时时，优先保留本地草稿可用并放入后台重试队列。
- **消费索引**：[FLOW-AUTH-02](../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02)、[PAGE-COMM-02](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02)、[AC-SYNC-01](../08-verification/acceptance-criteria.md#ac-sync-01)。

---

## <a id="rule-sync-03"></a>3. `RULE-SYNC-03`：饮食档案变更对当日菜单的温和刷新保护规则

- **触发时机**：当日 `DOM-PLN-DailyMealPlan` 已生成，且用户在 [PAGE-PROF-02 饮食档案编辑页](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 修改保存了偏好（使 `profile.updated_at > plan.generated_at`）后再次进入「今日菜谱」页时。
- **输入依赖**：[DOM-USR-DietaryProfile](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)、[DOM-PLN-DailyMealPlan](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan)。
- **保护逻辑**：
  1. **严禁静默覆盖**：防止用户上午刚按旧菜单买完菜，下午顺手改了健康标签导致回到首页时菜谱突然全变。
  2. 进入 [TERM-PLN-03 画像待刷新态](../02-domain-model/meal-and-collection/terms.md#term-pln-03)，在今日菜谱页顶部展示非阻塞确认横幅：
     - 用户点选 **`[立即重新生成]`** → 按新档案调用 `RULE-PLAN-01` & `RULE-PLAN-02` 重算当日三餐并更新 `generated_at`。
     - 用户点选 **`[保持今日原菜单]`** → 隐藏确认横幅，维持当日菜单不变，新档案于次日 00:00 生成新菜单时自然生效。
- **例外直通场景**：若用户是在**今日菜谱页顶部的快捷人数胶囊**直接手动切换人数，因属于在当前页显式请求看新人数方案，立即重算今日套餐无需二次弹窗确认。
- **消费索引**：[FLOW-PLAN-02](../04-ia-and-flows/flows/meal-planning.md#flow-plan-02)、[PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)、[PAGE-PROF-02](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02)、[AC-SYNC-02](../08-verification/acceptance-criteria.md#ac-sync-02)。
