# 业务规则簇四：身份转化与跨端同步规则组（`RULE-SYNC-*`）

## <a id="rule-sync-01"></a>1. `RULE-SYNC-01`：游客本地偏好草稿与默认兜底规则

- **1. 触发时机与适用范围**：未登录游客首次冷启动打开应用、点击“跳过先逛”、或在未登录态走完偏好向导/编辑档案时。
- **2. 输入依赖契约**：[DOM-USR-DietaryProfile 个人饮食档案实体](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)（重点读写档案状态源 `profile_source`）。
- **3. 双态持久化逻辑**：
  1. **未定制通用默认态**（`profile_source = 'default'`）：游客直接点击“跳过先逛”时，系统注入安全默认参数（期望人数 `2` 人、最高微辣 `1`、无特殊忌口、家常熟手 `intermediate`、平日预算 `30` 分钟、基础炒锅+电饭煲、均衡膳食 `balanced`）生成普适时令三餐，并在首页顶部常驻定制引导横幅。
  2. **游客本地草稿态**（`profile_source = 'local_draft'`）：游客在未登录时完成偏好定制或修改，全量配置持久化写入浏览器本地存储（`localStorage`），立即享受与登录用户完全一致的千人千面配餐，仅在个人中心温和提示“登录账号可跨设备永久保存”。
- **4. 边界与降级兜底**：当运行环境禁用本地持久化存储（如极端隐私沙盒模式）时，自动降级至内存会话态运行，不抛异常阻断使用。
- **5. 下游消费索引**：[FLOW-AUTH-01 冷启动渐进建档流](../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-01) · [PAGE-COMM-01 5步偏好引导向导](../06-pages/common-and-onboarding/onboarding-wizard.md#page-comm-01) · [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01)

---

## <a id="rule-sync-02"></a>2. `RULE-SYNC-02`：登录时云端旧档案与本地草稿冲突裁决规则

- **1. 触发时机与适用范围**：未登录游客在 [PAGE-COMM-02 快捷认证弹窗](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) 输满 6 位验证码校验通过的瞬间。
- **2. 输入依赖契约**：客户端本地存储的 [DOM-USR-DietaryProfile 本地偏好草稿](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile) 与该登录 [DOM-USR-Account 用户账号](../02-domain-model/user-profile/entities.md#dom-usr-account) 云端绑定的历史饮食档案。
- **3. 四象限冲突裁决矩阵**：

| 本地是否存在自定义草稿（`local_draft`） | 云端账号是否已有历史档案 | 系统确定性裁决动作 |
| :--- | :--- | :--- |
| **否**（本地仍为未定制 `default`） | **否**（全新注册账号） | 保持待建档默认态，直接关闭弹窗完成接续 |
| **是**（游客刚才已定制过偏好） | **否**（全新注册或云端未建档） | **静默自动上云**：将本地草稿直接持久化写入云端，状态源升级为云同步（`cloud_synced`） |
| **否**（本地仍为未定制 `default`） | **是**（老用户在新设备登录） | **静默拉取云端**：拉取云端历史档案覆盖本地，并置位当日菜单待重算标记 |
| **是**（游客刚定制过新偏好） | **是**（老账号云端已有旧档案且字段不一致） | **显式二选一裁决**：在认证弹窗内原位切换冲突对比卡（`S2_ProfileConflict`），并排展示差异摘要供用户选择 `[采用刚才定制的新偏好]` 或 `[恢复账号原有云端档案]` |

- **4. 边界与降级兜底**：若云端同步接口网络超时，优先保留本地已选档案可用并压入后台静默重试队列；若在冲突卡未选直接异常退出，保底保留老账号云端原有档案以防误覆写历史数据。
- **5. 下游消费索引**：[FLOW-AUTH-02 拦截登录接续与合并流](../04-ia-and-flows/flows/auth-and-onboarding.md#flow-auth-02) · [PAGE-COMM-02 快捷认证弹窗](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02) · [AC-SYNC-01 拦截登录双端冲突合并验收](../08-verification/acceptance-criteria.md#ac-sync-01)

---

## <a id="rule-sync-03"></a>3. `RULE-SYNC-03`：饮食档案变更对当日菜单的温和刷新保护规则

- **1. 触发时机与适用范围**：当日 [DOM-PLN-DailyMealPlan 每日三餐单](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan) 已生成，随后用户在 [PAGE-PROF-02 饮食档案编辑页](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 修改保存了偏好（或登录后拉取了不同的云端旧档案），导致**档案最近修改时间晚于当日菜单生成时间**（`profile.updated_at > plan.generated_at`），再次切回“今日菜谱”主页时。
- **2. 输入依赖契约**：[DOM-USR-DietaryProfile 个人饮食档案](../02-domain-model/user-profile/entities.md#dom-usr-dietaryprofile)（`updated_at`）与 [DOM-PLN-DailyMealPlan 每日三餐单](../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan)（`generated_at`）。
- **3. 防静默覆盖温和确认机制**：
  1. **严禁后台静默重算覆盖**：防止用户早晨已经按旧菜单买齐了菜，下午顺手改了个人档案里的某个健康标签，结果晚上做饭打开首页发现原菜谱全被清空换掉。
  2. 命中条件时进入 [TERM-PLN-03 画像待刷新态](../02-domain-model/meal-and-collection/terms.md#term-pln-03)，保留原三餐卡片不动，仅在首页顶部挂载蓝色温和确认横幅：
     - 用户点击 **`[立即重新生成]`** → 立即按新档案调用 [RULE-PLAN-01 硬过滤](./meal-recommendation.md#rule-plan-01) 与 [RULE-PLAN-02 人数配餐结构](./meal-recommendation.md#rule-plan-02) 重算今日三餐，并将 `plan.generated_at` 对齐至最新时间。
     - 用户点击 **`[保持原菜单]`** → 收起确认条维持今日原菜单不变，新档案于次日 `00:00` 生成新一天菜单时自然生效。
- **4. 例外直通边界**：若用户是直接在**今日菜谱页顶部的快捷人数胶囊**手动点击切换人数，属于在当前页显式发起重配指令，立即重算当日三餐无需再弹确认横幅。
- **5. 下游消费索引**：[FLOW-PLAN-02 档案修改跨页温和重算流](../04-ia-and-flows/flows/meal-planning.md#flow-plan-02) · [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) · [PAGE-PROF-02 饮食档案编辑页](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) · [AC-SYNC-02 改档案切回首页温和重算验收](../08-verification/acceptance-criteria.md#ac-sync-02)
