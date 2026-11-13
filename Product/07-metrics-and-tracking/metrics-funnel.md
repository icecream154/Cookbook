# 07-1. 核心业务数据指标体系与转化漏斗（`MET-*`）

本文档定义衡量【菜谱】应用核心产品价值的**北极星指标（North Star Metric）**与**五大模块转化漏斗公式**。根据 [00-spec-standard.md](../00-spec-standard.md) 强制铁律，所有指标的分子与分母均精确绑定至 [event-dictionary.md](./event-dictionary.md) 中的关键业务事件（`EVT-*`），确保 100% 可计算、无虚空口径。

---

## 1. 北极星指标（North Star Metric）

| 指标 ID | 指标名称 | 统计周期与计算口径（基于 `EVT-*`） | 为什么选它作为北极星？ |
| :--- | :--- | :--- | :--- |
| <a id="met-nsm"></a>**MET-NSM** | **周有效下厨采纳用户数（Weekly Active Cooks）** | 自然周内触发过 **启动全屏跟做（[EVT-11](./event-dictionary.md#evt-11) `stage='start'`）**、**调整详情页人数换算（[EVT-10](./event-dictionary.md#evt-10)）** 或 **导出/勾选今日食材汇总（[EVT-06](./event-dictionary.md#evt-06)）** 任一深度备餐行为的去重用户数 | 纯浏览菜谱不代表解决“真做饭”问题；触发换算、备菜核对或进入跟做，证明产品真正帮用户走完了从“决定吃什么”到“走进厨房动手做”的价值闭环。 |

---

## 2. 核心业务漏斗与诊断指标表（`MET-01 ~ MET-05`）

| 指标 ID | 归属功能 (`FEAT-*`) | 指标名称 | 核心计算公式（分子 / 分母） | 业务健康度诊断意义 |
| :--- | :--- | :--- | :--- | :--- |
| <a id="met-01"></a>**MET-01** | [FEAT-01](../01-vision-and-scope.md#feat-01) | **饮食偏好建档完成率**<br>& **拦截登录接续转化率** | • 建档率 = 触发 [EVT-02](./event-dictionary.md#evt-02)（保存饮食档案）去重设备数 ÷ 触发 [EVT-01](./event-dictionary.md#evt-01)（开启引导向导）去重设备数<br>• 拦截登录率 = 触发 [EVT-03](./event-dictionary.md#evt-03)（完成认证且 `has_pending_action=true`）次数 ÷ 游客触发受限动作唤起认证框次数 | 评估 5 步卡片问卷是否过重导致中途跳出，以及“先逛后登+自动接续”模式的注册转化效率 |
| <a id="met-02"></a>**MET-02** | [FEAT-02](../01-vision-and-scope.md#feat-02)<br>[FEAT-03](../01-vision-and-scope.md#feat-03) | **今日三餐推荐采纳率**<br>& **人均换一换次数** | • 推荐采纳率 = 从今日菜谱进入详情（[EVT-09](./event-dictionary.md#evt-09) `entry_source='daily_plan'`）或打开食材汇总（[EVT-06](./event-dictionary.md#evt-06)）的会话数 ÷ 今日三餐曝光会话数（[EVT-04](./event-dictionary.md#evt-04)）<br>• 人均换菜频次 = [EVT-05](./event-dictionary.md#evt-05) 总次数 ÷ [EVT-04](./event-dictionary.md#evt-04) 会话数 | 若人均连续点击换一换 `> 4` 次仍不点进详情，说明配餐推荐与用户口味匹配度不佳或候选池太窄 |
| <a id="met-03"></a>**MET-03** | [FEAT-04](../01-vision-and-scope.md#feat-04) | **复合检索点击转化率**<br>& **检索零结果率** | • 检索转化率 = 检索后点进详情（[EVT-09](./event-dictionary.md#evt-09) `entry_source='search'`）次数 ÷ 执行检索次数（[EVT-07](./event-dictionary.md#evt-07)）<br>• 零结果率 = [EVT-07](./event-dictionary.md#evt-07) 中 `result_count == 0` 的次数 ÷ [EVT-07](./event-dictionary.md#evt-07) 总次数（辅看 [EVT-08](./event-dictionary.md#evt-08) 放宽挽回率） | 监控菜谱库供给缺口与同义食材词典覆盖度，零结果率过高需扩充对应菜系/食材菜谱或优化放宽策略 |
| <a id="met-04"></a>**MET-04** | [FEAT-05](../01-vision-and-scope.md#feat-05)<br>[FEAT-06](../01-vision-and-scope.md#feat-06) | **跟做模式启动率**<br>& **跟做完播率** | • 启动率 = [EVT-11](./event-dictionary.md#evt-11) (`stage='start'`) 次数 ÷ 详情页访问次数（[EVT-09](./event-dictionary.md#evt-09)）<br>• 完播率 = [EVT-11](./event-dictionary.md#evt-11) (`stage='complete'`) 次数 ÷ [EVT-11](./event-dictionary.md#evt-11) (`stage='start'`) 次数 | 衡量详情富文本与全屏大字跟做体验在真实厨房场景下的实用度与完赛粘性 |
| <a id="met-05"></a>**MET-05** | [FEAT-07](../01-vision-and-scope.md#feat-07) | **菜谱详情收藏率**<br>& **收藏夹复访使用率** | • 详情收藏率 = [EVT-12](./event-dictionary.md#evt-12) (`action='add'`) 次数 ÷ [EVT-09](./event-dictionary.md#evt-09) 详情浏览去重数<br>• 收藏复访点开率 = [EVT-09](./event-dictionary.md#evt-09) (`entry_source='favorites'`) 次数 ÷ 活跃登录用户数 | 验证收藏夹是否真正成为用户日常复做的“私房菜单库”，而非“只收不看吃灰夹” |
