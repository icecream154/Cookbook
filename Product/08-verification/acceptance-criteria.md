# 08-1. 端到端与边界验收用例集（Acceptance Criteria `AC-*`）

本文档按四大业务决策能力簇组织验收走查清单，作为移交 `Design/` 与 `Code/` 的客观准出网关。每条核心 `RULE-*` 的正常分支与降级兜底分支均在此建立显式覆盖。

---

## 1. 智能配餐与食材合并验收组（`AC-PLAN-*`）

| 验收 ID | 覆盖规格引用 | Given（前置状态） | When（触发操作） | Then（预期验收结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-plan-01"></a>**AC-PLAN-01** | [RULE-PLAN-01](../03-business-rules/meal-recommendation.md#rule-plan-01)<br>[RULE-PLAN-02](../03-business-rules/meal-recommendation.md#rule-plan-02) | 用户档案设为 `3人(三口之家, 含儿童)`、`辣度上限=1(微辣)`、`忌香菜`、`无空气炸锅` | 进入 [PAGE-PLAN-01](../06-pages/daily-plan/daily-meal-plan.md#page-plan-01) 生成今日三餐 | ① 午晚餐均为 `1主荤+1时蔬+1汤羹`（两菜一汤）且至少 2 道免辣；② 全天三餐绝对不含香菜菜谱、不含必需空气炸锅的菜谱、不含中/重辣菜谱 |
| <a id="ac-plan-02"></a>**AC-PLAN-02** | [RULE-PLAN-04](../03-business-rules/meal-recommendation.md#rule-plan-04) | 午餐已包含第一主材为 `番茄` 的主菜，用户对午餐汤羹点击 `[⇄ 换一道]` | 连续点击 3 次 `[⇄ 换一道]` | ① 早餐与晚餐菜品纹丝不动；② 每次仅替换为 `soup` 角色菜谱，且自动避开第一主材同为 `番茄` 的汤品；③ 候选耗尽前不重复出现刚被换掉的菜谱 |
| <a id="ac-plan-03"></a>**AC-PLAN-03** | [RULE-PLAN-05](../03-business-rules/meal-recommendation.md#rule-plan-05)<br>[PAGE-PLAN-02](../06-pages/daily-plan/ingredient-summary-drawer.md#page-plan-02) | 早餐含鸡蛋菜谱、午餐也含鸡蛋菜谱，当前套餐生效为 `3人份` | 打开今日食材汇总抽屉，随后取消勾选 `[午餐]` | ① 初始状态鸡蛋合并为 1 条总个数并标明早+午两处菜谱来源；② 取消午餐后，鸡蛋数量即时扣减午餐部分并重新按 [RULE-COOK-02](../03-business-rules/portion-and-cooking.md#rule-cook-02) 取整 |

---

## 2. 复合检索与收藏保护验收组（`AC-SRCH-*`）

| 验收 ID | 覆盖规格引用 | Given（前置状态） | When（触发操作） | Then（预期验收结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-srch-01"></a>**AC-SRCH-01** | [RULE-SRCH-01](../03-business-rules/search-and-matching.md#rule-srch-01)<br>[RULE-SRCH-02](../03-business-rules/search-and-matching.md#rule-srch-02) | 用户在 `PAGE-SRCH-01` 输入俗称 `西红柿`，并在 `PAGE-SRCH-02` 同时勾选包含 `牛肉 + 番茄 + 土豆` | 先保持默认 `智能匹配度排序`，再切换为 `严格全部包含` | ① 输入 `西红柿` 联想出标准食材 `番茄`；② 智能模式下包含 2/3 种食材的菜谱（如番茄肥牛焖饭）被召回并标注 `命中 2/3 · 缺:土豆`；③ 切严格模式后仅保留三者全含的菜谱 |
| <a id="ac-srch-02"></a>**AC-SRCH-02** | [RULE-SRCH-03](../03-business-rules/search-and-matching.md#rule-srch-03)<br>[RULE-SRCH-04](../03-business-rules/search-and-matching.md#rule-srch-04) | 用户档案设 `忌海鲜`；在筛选器未开忌口排除时搜 `虾仁`，随后叠加冲突条件 `粤菜 + 重辣` | 观察搜索卡片，再提交冲突筛选 | ① 搜虾仁正常返回菜谱但在卡片显式展示 `⚠️ 含你的忌口:海鲜`；② 叠加冲突条件命中 0 道菜时，空态卡渲染一键移除严苛条件按钮并显示恢复数量 |
| <a id="ac-srch-03"></a>**AC-SRCH-03** | [PAT-UndoSnackbar](../05-components-and-patterns/interaction-patterns.md#pat-undosnackbar)<br>[PAGE-FAV-01](../06-pages/favorites/favorites-list.md#page-fav-01) | 已登录用户在 `PAGE-FAV-01` 列表内有 3 道收藏菜谱 | 点击第一道菜的实心红心 `♥`，并在 3 秒内点击底部 `[撤销]` | 点击红心无烦人确认弹窗、卡片立即收起并浮现 4 秒撤销条；点击 `[撤销]` 后卡片原位恢复，收藏总数保持为 3 |

---

## 3. 分量换算与全屏跟做验收组（`AC-COOK-*`）

| 验收 ID | 覆盖规格引用 | Given（前置状态） | When（触发操作） | Then（预期验收结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-cook-01"></a>**AC-COOK-01** | [RULE-COOK-01](../03-business-rules/portion-and-cooking.md#rule-cook-01)<br>[RULE-COOK-02](../03-business-rules/portion-and-cooking.md#rule-cook-02) | 某菜谱 `base_servings = 3`（含牛腩 `500g`、鸡蛋 `2个`、生抽 `2勺`、盐 `少许`） | 在 `PAGE-COOK-01` 用步进器将目标人数调为 `2人份`，再返回 `PAGE-PROF-01` 检查个人档案 | ① 牛腩折算为 `330g`（10g取整）、鸡蛋为 `1个`（整数取整，绝不出现 `1.33个`）、生抽为 `1.5勺`（0.5勺取整）、盐保持 `少许`；② 个人中心全局默认人数未被篡改 |
| <a id="ac-cook-02"></a>**AC-COOK-02** | [RULE-COOK-03](../03-business-rules/portion-and-cooking.md#rule-cook-03)<br>[FLOW-COOK-02](../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 详情页人数已调为 `4人份`，点击 `[🍳 开始跟做]` 进入 `PAGE-COOK-02` | 在 Step 2 点击 `[⏱ 启动倒计时]` 后立即点击 `[下一步 →]` 翻到 Step 3 | ① 详情与跟做卡片正文内高亮调料量均与 4 人份食材表严格一致；② 翻到 Step 3 后顶栏悬浮倒计时胶囊持续跳秒不中断，屏幕常亮指示灯开启 |

---

## 4. 身份接续与跨页同步验收组（`AC-SYNC-*`）

| 验收 ID | 覆盖规格引用 | Given（前置状态） | When（触发操作） | Then（预期验收结果） |
| :--- | :--- | :--- | :--- | :--- |
| <a id="ac-sync-01"></a>**AC-SYNC-01** | [PAT-AuthResume](../05-components-and-patterns/interaction-patterns.md#pat-authresume)<br>[RULE-SYNC-02](../03-business-rules/identity-and-sync.md#rule-sync-02) | 未登录游客已在本地设置 `1人食` 草稿，点击某菜谱 `♡ 收藏` 唤起 `PAGE-COMM-02`，登录一个云端已有 `三口之家` 旧档案的老账号 | 完成验证码输入并选择档案保留方案 | 展示双档案冲突二选一裁决卡；点选任一方案后弹窗关闭，**刚才点击的那道菜自动变为 `♥ 已收藏`**，无需用户二次点击红心 |
| <a id="ac-sync-02"></a>**AC-SYNC-02** | [RULE-SYNC-03](../03-business-rules/identity-and-sync.md#rule-sync-03)<br>[FLOW-PLAN-02](../04-ia-and-flows/flows/meal-planning.md#flow-plan-02) | 今日三餐已生成；用户进入 `PAGE-PROF-02` 将人数从 `2人` 改为 `4人` 并保存 | 切换一级导航回到 `PAGE-PLAN-01` 今日菜谱 | 原 2 人菜单未被静默清空覆盖；页面顶部浮现温和确认条，点击 `[立即重新生成]` 后才刷新为四口三菜一汤方案 |
