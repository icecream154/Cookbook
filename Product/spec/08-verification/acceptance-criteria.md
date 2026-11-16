# 08-1. 端到端与边界验收用例集（Acceptance Criteria `AC-*`）

本文档按四大业务决策能力簇组织验收走查清单，作为移交下游视觉设计（`Design/`）与代码实现（`Code/`）的客观准出网关。每条核心业务规则的正常分支、临界边界与异常降级兜底均在此建立显式可勾选覆盖。

---

## 1. 智能配餐与食材合并验收组（`AC-PLAN-*`）

| 验收 ID | 覆盖规格引用（附语义名称） | Given（前置状态） | When（触发操作） | Then（预期确定性结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-plan-01"></a>**AC-PLAN-01** | [RULE-PLAN-01 忌口厨具硬过滤否决](../03-business-rules/meal-recommendation.md#rule-plan-01)<br>[RULE-PLAN-02 按人数配餐结构矩阵](../03-business-rules/meal-recommendation.md#rule-plan-02) | 用户饮食档案设为 `3人（三口之家，含儿童）`、`最高辣度=1（微辣）`、`忌香菜`、`未勾选空气炸锅` | 进入 [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) 生成当日三餐 | ① 午晚餐均为 `1主荤 + 1时蔬 + 1汤羹`（两菜一汤）且至少 2 道免辣（`spiciness == 0`）；② 全天三餐绝对不含香菜菜谱、不含必需空气炸锅的菜谱、不含中/重辣菜谱 |
| <a id="ac-plan-02"></a>**AC-PLAN-02** | [RULE-PLAN-04 单菜与整餐换一换互斥防重](../03-business-rules/meal-recommendation.md#rule-plan-04) | 午餐已包含第一主食材（`primary_main_ing_id`）为 `番茄` 的主菜，用户对午餐汤羹卡点击 `[⇄ 换一道]` | 连续点击 3 次 `[⇄ 换一道]` | ① 早餐与晚餐菜品锁定不动；② 每次仅替换为汤羹角色（`soup`）菜谱，且自动避开第一主材同为 `番茄` 的汤品；③ 候选池耗尽前不重复出现刚被换掉的菜谱 |
| <a id="ac-plan-03"></a>**AC-PLAN-03** | [RULE-PLAN-05 跨菜谱同类食材合并](../03-business-rules/meal-recommendation.md#rule-plan-05)<br>[PAGE-PLAN-02 今日食材汇总抽屉](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) | 早餐含鸡蛋菜谱、午餐也含鸡蛋菜谱，当前套餐生效人数（`applied_servings`）为 `3人份` | 打开 `PAGE-PLAN-02` 今日食材汇总抽屉，随后点灭 `[午餐]` 勾选胶囊 | ① 初始状态鸡蛋合并为 1 条总个数并标明早+午两处菜谱来源；② 取消午餐后，鸡蛋数量即时剔除午餐部分并重新按 [RULE-COOK-02 多量纲人性化取整](../03-business-rules/portion-and-cooking.md#rule-cook-02) 输出整数个 |

---

## 2. 复合检索与收藏保护验收组（`AC-SRCH-*`）

| 验收 ID | 覆盖规格引用（附语义名称） | Given（前置状态） | When（触发操作） | Then（预期确定性结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-srch-01"></a>**AC-SRCH-01** | [RULE-SRCH-01 同义词联想与召回](../03-business-rules/search-and-matching.md#rule-srch-01)<br>[RULE-SRCH-02 多食材智能vs严格匹配](../03-business-rules/search-and-matching.md#rule-srch-02) | 用户在 [PAGE-SRCH-01 找菜谱主页](../06-pages/recipe-discovery/recipe-search.md#page-srch-01) 输入俗称 `西红柿`，并在 [PAGE-SRCH-02 复合筛选面板](../06-pages/recipe-discovery/complex-filter-panel.md#page-srch-02) 同时勾选包含 `牛肉 + 番茄 + 土豆` | 先保持默认 `智能匹配度排序`（`smart_rank`），再切换为 `严格全部包含`（`strict_all`） | ① 输入 `西红柿` 下拉置顶提示标准食材 `番茄`；② 智能模式下仅含 2/3 种食材的菜谱（如番茄肥牛焖饭）被召回并标注 `命中 2/3 · 缺:土豆`；③ 切严格模式后仅保留三者全含的菜谱 |
| <a id="ac-srch-02"></a>**AC-SRCH-02** | [RULE-SRCH-03 主动检索忌口温和预警](../03-business-rules/search-and-matching.md#rule-srch-03)<br>[RULE-SRCH-04 复合布尔与零结果阶梯放宽](../03-business-rules/search-and-matching.md#rule-srch-04) | 用户档案设 `忌海鲜`；在筛选器未开忌口排除开关时主动搜 `虾仁`，随后叠加严苛冲突条件 `粤菜 + 重辣` | 观察搜索结果卡，再提交冲突筛选组合 | ① 主动搜虾仁不被暗中屏蔽，但在卡片醒目展示 `⚠️ 含你的忌口:海鲜`；② 叠加冲突条件命中 `0` 道菜时，空态卡渲染一键放宽严苛条件按钮并显示可恢复召回数 |
| <a id="ac-srch-03"></a>**AC-SRCH-03** | [PAT-UndoSnackbar 4秒延迟撤销保护](../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar)<br>[PAGE-FAV-01 我的收藏夹主页](../06-pages/favorites/favorites-list.md#page-fav-01) | 已登录用户在 `PAGE-FAV-01` 收藏夹列表内有 `3` 道收藏菜谱 | 点击第 1 道菜的实心红心 `♥`，并在 `3` 秒内点击底部黑条 `[撤销]` | 点击红心免二次确认弹窗，卡片立即折叠收起并在底部浮现 `4000ms` 撤销胶囊；点击 `[撤销]` 后卡片原序号无损恢复，收藏总数保持为 `3` |

---

## 3. 分量换算与全屏跟做验收组（`AC-COOK-*`）

| 验收 ID | 覆盖规格引用（附语义名称） | Given（前置状态） | When（触发操作） | Then（预期确定性结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-cook-01"></a>**AC-COOK-01** | [RULE-COOK-01 详情目标人数继承优先级](../03-business-rules/portion-and-cooking.md#rule-cook-01)<br>[RULE-COOK-02 多量纲人性化取整](../03-business-rules/portion-and-cooking.md#rule-cook-02) | 某菜谱基准人份（`base_servings`）为 `3`（含牛腩 `500g`、鸡蛋 `2个`、生抽 `2勺`、盐 `少许`） | 在 [PAGE-COOK-01 菜谱详情页](../06-pages/recipe-consumption/recipe-detail.md#page-cook-01) 用步进器将目标人数调为 `2人份`，随后返回 [PAGE-PROF-01 个人中心](../06-pages/user-profile/profile-home.md#page-prof-01) 检查档案 | ① 牛腩折算为 `330g`（超 100g 按 10g 取整）、鸡蛋为 `1个`（整颗正整数取整，绝不出现 `1.33个`）、生抽为 `1.5勺`（半勺取整）、盐保持 `少许`；② 个人中心全局默认用餐人数未被篡改 |
| <a id="ac-cook-02"></a>**AC-COOK-02** | [RULE-COOK-03 食材与步骤正文动态同步](../03-business-rules/portion-and-cooking.md#rule-cook-03)<br>[FLOW-COOK-02 全屏跟做与悬浮计时流](../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 详情页人数已调为 `4人份`，点击 `[🍳 开始跟做]` 进入 [PAGE-COOK-02 全屏分步跟做视图](../06-pages/recipe-consumption/cooking-focus-mode.md#page-cook-02) | 在 Step 2 点击 `[⏱ 启动倒计时]` 后立即点击 `[下一步 →]` 翻到 Step 3 | ① 详情与跟做卡片正文内高亮调料量均与 `4` 人份食材表毫秒级严格一致；② 翻到 Step 3 后顶栏悬浮倒计时胶囊持续跳秒不中断，屏幕常亮指示灯开启 |

---

## 4. 身份接续与跨页同步验收组（`AC-SYNC-*`）

| 验收 ID | 覆盖规格引用（附语义名称） | Given（前置状态） | When（触发操作） | Then（预期确定性结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-sync-01"></a>**AC-SYNC-01** | [PAT-AuthResume 未登录拦截并自动接续](../05-components-and-patterns/interaction-patterns.md#pat-authresume)<br>[RULE-SYNC-02 本地与云端旧档案冲突裁决](../03-business-rules/identity-and-sync.md#rule-sync-02) | 未登录游客已在本地设置 `1人食` 草稿，点击某菜谱 `♡ 收藏` 唤起 [PAGE-COMM-02 快捷认证弹窗](../06-pages/common-and-onboarding/auth-modal.md#page-comm-02)，登录一个云端已有 `三口之家` 旧档案的老账号 | 完成 6 位验证码输入并点选任一档案保留方案 | 弹窗内原位切换双档案差异对比二选一裁决卡；点选方案后弹窗自动关闭，**刚才被拦截的那道菜自动点亮为 `♥ 已收藏`**，无需用户二次点击红心 |
| <a id="ac-sync-02"></a>**AC-SYNC-02** | [RULE-SYNC-03 当日菜单温和刷新保护](../03-business-rules/identity-and-sync.md#rule-sync-03)<br>[FLOW-PLAN-02 档案修改跨页温和重算流](../04-ia-and-flows/flows/meal-planning.md#flow-plan-02) | 当日三餐已生成；用户进入 [PAGE-PROF-02 饮食档案编辑页](../06-pages/user-profile/dietary-archive-editor.md#page-prof-02) 将人数从 `2人` 改为 `4人` 并点击保存 | 切换一级导航回到 [PAGE-PLAN-01 今日菜谱主页](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) | 原 `2` 人菜单未被静默清空覆盖；页面顶部浮现蓝色温和确认条，仅当点击 `[立即重新生成]` 后才刷新为四口之家三菜一汤方案 |
