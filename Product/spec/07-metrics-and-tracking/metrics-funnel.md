# 07-1. 核心业务数据指标体系与转化漏斗（`MET-*`）

本文档严格遵循元规范 [03-authoring-templates.md 第 2.7.1 节](../../meta/03-authoring-templates.md#tpl-metric-funnel) 与 [02-id-and-traceability.md 铁律 5](../../meta/02-id-and-traceability.md#rule-5)，定义【菜谱 Cookbook】的**北极星指标**、**五大功能漏斗主公式与护栏口径**及**全链路事件跃迁拓扑**。所有公式 100% 锚定至 [event-dictionary.md](./event-dictionary.md) 中的 `EVT-*` 事件与属性，杜绝不可计算的模糊口号。

---

## 1. 北极星指标定义表（North Star Metric）

| 指标 ID | 指标名称 | 统计粒度与窗口 | 精确计算口径（基于 `EVT-*` 及属性过滤条件） | 核心价值论证与反虚荣说明 |
| :--- | :--- | :--- | :--- | :--- |
| <a id="met-nsm"></a>**MET-NSM** | **周有效下厨采纳活跃用户数**<br>（Weekly Active Cooks, WAC） | 去重用户/设备数（已登录按 `account_id`，游客按 `device_id` 归一）· 自然周（周一 `00:00` ~ 周日 `23:59`） | 自然周内至少触发以下任一**深度备餐/实操事件** `>= 1` 次的去重主体数：<br>1. 启动全屏跟做：[EVT-11](./event-dictionary.md#evt-11)（`stage == 'start'`）<br>2. 手动折算用餐份量：[EVT-10](./event-dictionary.md#evt-10)<br>3. 导出/复制今日采购清单：[EVT-06](./event-dictionary.md#evt-06)（`action == 'copy'`） | 摒弃纯页面浏览 UV 等虚荣流量口径——唯有发生份量换算、采购清单导出或启动厨房跟做，才证明产品真正帮用户完成了从“纠结吃什么”到“实际动手下厨”的核心价值交付。 |

---

## 2. 核心业务漏斗与过程诊断指标表（`MET-01 ~ MET-05`）

| 指标 ID | 归属功能 | 指标名称 | 统计粒度与窗口 | 精确计算公式（主漏斗公式 + 配套护栏口径） | 异常阈值与业务归因诊断 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="met-01"></a>**MET-01** | [FEAT-01](../01-vision-and-scope.md#feat-01) | **偏好建档完成率与拦截认证接续率** | 去重设备数 / 触发次数 · 自然日/周 | • **向导建档完成率** = 触发 [EVT-02](./event-dictionary.md#evt-02)（`source == 'wizard'`）去重设备数 ÷ 触发 [EVT-01](./event-dictionary.md#evt-01)（`action == 'enter'`）去重设备数<br>• **拦截登录接续率** = 触发 [EVT-03](./event-dictionary.md#evt-03)（`has_pending_action == true`）次数 ÷ 游客触发受限动作唤起 `PAGE-COMM-02` 总次数 | • 若向导建档完成率 `< 65%`，需按 `EVT-01`（`action == 'skip'`）上报的 `step_no` 定位流失最高的步骤并精简选项<br>• 若拦截登录接续率 `< 45%`，需检查弹窗接续提示文案或短信下发延迟 |
| <a id="met-02"></a>**MET-02** | [FEAT-02](../01-vision-and-scope.md#feat-02)<br>[FEAT-03](../01-vision-and-scope.md#feat-03) | **今日三餐推荐采纳率与换菜健康度** | 去重会话数（Session）· 自然日 | • **主推荐采纳率** = 触发 [EVT-09](./event-dictionary.md#evt-09)（`entry_source == 'daily_plan'`）或 [EVT-06](./event-dictionary.md#evt-06)（`action == 'open'`）的去重会话数 ÷ 触发 [EVT-04](./event-dictionary.md#evt-04) 的去重会话数<br>• **护栏：单会话平均换菜频次** = [EVT-05](./event-dictionary.md#evt-05) 总次数 ÷ `EVT-04` 去重会话数 | 若单会话换菜频次 `> 4.0` 次且主推荐采纳率 `< 30%`，表明推荐打分与用户风味偏好错位，或特定忌口组合下候选菜谱池过窄导致重复轮换 |
| <a id="met-03"></a>**MET-03** | [FEAT-04](../01-vision-and-scope.md#feat-04) | **复合检索有效点击率与零结果挽回率** | 检索请求次数 / 去重会话 · 自然日/周 | • **检索点击转化率** = 触发 [EVT-09](./event-dictionary.md#evt-09)（`entry_source == 'search'`）会话数 ÷ 触发 [EVT-07](./event-dictionary.md#evt-07) 会话数<br>• **护栏：检索零结果率** = `EVT-07`（`result_count == 0`）次数 ÷ `EVT-07` 总次数<br>• **放宽挽回率** = 触发 [EVT-08](./event-dictionary.md#evt-08)（`recovered_count > 0`）次数 ÷ `EVT-07`（`result_count == 0`）次数 | 若零结果率 `> 10%`，按搜索词与筛选项组合聚类排查 [DOM-RCP-StandardIngredient](../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient) 同义词缺失或长尾快手菜供给盲区 |
| <a id="met-04"></a>**MET-04** | [FEAT-05](../01-vision-and-scope.md#feat-05)<br>[FEAT-06](../01-vision-and-scope.md#feat-06) | **厨房跟做启动率与完播率** | 事件次数 · 自然周（支持按 `viewport_shell` 分端拆解） | • **跟做启动率** = [EVT-11](./event-dictionary.md#evt-11)（`stage == 'start'`）次数 ÷ [EVT-09](./event-dictionary.md#evt-09) 总次数<br>• **跟做完播率** = `EVT-11`（`stage == 'complete'`）次数 ÷ `EVT-11`（`stage == 'start'`）次数 | 对比 `tablet` 与 `mobile` 端的完播率差异；若跟做完播率 `< 50%`，需排查步骤切分是否过碎或倒计时交互阻碍翻页 |
| <a id="met-05"></a>**MET-05** | [FEAT-07](../01-vision-and-scope.md#feat-07) | **详情净收藏率与私房收藏复访率** | 去重用户数 · 自然周 | • **详情净收藏率** =（[EVT-12](./event-dictionary.md#evt-12) `action == 'add'` 次数 − `action == 'remove'` 次数 + `action == 'undo_restore'` 次数）÷ [EVT-09](./event-dictionary.md#evt-09) 浏览次数<br>• **收藏周复访点开率** = 触发 `EVT-09`（`entry_source == 'favorites'`）去重登录用户数 ÷ 当周总活跃登录用户数 | 若净收藏率高但收藏周复访点开率 `< 15%`，说明收藏夹沦为“只收不看吃灰夹”，需强化检索“仅看收藏”联动入口与角色快筛体验 |

---

## 3. 全链路下厨转化事件跃迁拓扑图

```mermaid
flowchart LR
    subgraph S1_ACTIVATE ["1. 冷启动建档与认证 (MET-01)"]
        E01["EVT-01 开启/跳过向导"] --> E02["EVT-02 保存饮食档案"]
        E03["EVT-03 拦截认证与档案合并"]
    end

    subgraph S2_DECIDE ["2. 规划与复合发现 (MET-02 / MET-03)"]
        E04["EVT-04 今日三餐渲染"] --> E05["EVT-05 单菜/整餐换一换"]
        E04 --> E06["EVT-06 食材汇总打开/复制"]
        E07["EVT-07 复合检索执行"] --> E08["EVT-08 零结果一键放宽"]
    end

    subgraph S3_COOK ["3. 深度消费与厨房实操 (MET-04 / MET-05)"]
        E09["EVT-09 菜谱详情浏览"] --> E10["EVT-10 动态份量换算"]
        E09 --> E11["EVT-11 全屏跟做启动/完播"]
        E09 --> E12["EVT-12 收藏增删与4秒撤销"]
    end

    NSM(["★ 北极星 MET-NSM: 周有效下厨采纳活跃用户"])

    E02 & E03 --> E04
    E04 & E07 & E12 --> E09
    E06 & E10 & E11 ==> NSM
```
