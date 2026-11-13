# <a id="page-cook-02"></a>`PAGE-COOK-02`：全屏大字分步跟做视图

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-COOK-02` · 宿主 `PAGE-COOK-01` 的全屏深色高对比专注覆盖层 |
| **访问权限** | 游客与登录用户均可使用 |
| **上游入口** | 点击 [PAGE-COOK-01](./recipe-detail.md#page-cook-01) 中的 `[🍳 开始跟做]` |
| **下游出口** | 最后一步点击 `[🎉 完成出锅]` 或右上角 `[退出跟做 ✕]` 返回 `PAGE-COOK-01` |
| **配套画板原型** | [recipe-consumption.html](../../08-verification/prototypes/pages/recipe-consumption.html)（切换至 `S5_CookFocusTimer` 直达） |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| 全端统一专注壳 | 隐藏全局导航，启用深色高对比背景与 [NFR-03](../../01-vision-and-scope.md#nfr-03) 屏幕常亮锁；手机端一屏单卡大字上下布局，平板与 Web 端左图右大字宽卡布局，底部翻页按钮高度固定 `>= 52px` 防湿手误触 |

---

## 3. 区块组装与数据绑定清单

| 区块名称 | 控件构成 | 绑定字段与规则 | 显隐条件 |
| :--- | :--- | :--- | :--- |
| **专注顶栏** | `● 屏幕常亮已开启` 状态灯 + **跨步骤悬浮倒计时胶囊** + `[退出跟做 ✕]` | 当前 `target_servings`、活跃倒计时器秒数 | 全程常驻 |
| **第 0 页：开火前备料清点卡** | 已按 `target_servings` 折算的主辅料大字核对表 | [DOM-RCP-RecipeIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)、[RULE-COOK-02](../../03-business-rules/portion-and-cooking.md#rule-cook-02) | `step_cursor == 0` 时展示 |
| **第 1..N 页：单步大字专注卡** | `Step X / N` 进度 + `>= 20px` 动态调料高亮正文 + 步骤配图 + `[⏱ 启动本步倒计时]` + 避坑提示 | [DOM-RCP-RecipeStep](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipestep)、[RULE-COOK-03](../../03-business-rules/portion-and-cooking.md#rule-cook-03) | `1 <= step_cursor <= N` 时展示 |
| **超大热区翻页底栏** | 左侧 `[← 上一步]` + 右侧高亮主按钮（`[备齐了，正式开火 →]` / `[下一步 →]` / `[🎉 完成出锅]`） | — | 全程常驻吸底 |

---

## 4. 页面级状态枚举

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S5_CookFocusTimer` | 大字跟做且顶部悬浮倒计时运行态 | 顶栏挂载橙色实时跳秒倒计时胶囊，切换上下步骤时计时不中断 |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 点击步骤内 `[⏱ 启动本步倒计时]` | `timer_seconds > 0` | [FLOW-COOK-02](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 顶栏挂载跨步骤悬浮倒计时并开始跳秒；归零时鸣音闪烁提醒 | — |
| 在最后一步点击 `[🎉 完成出锅]` | `step_cursor == N` | [FLOW-COOK-02](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 释放屏幕常亮锁，关闭覆盖层返回 `PAGE-COOK-01` 并弹出完播反馈 | [EVT-11](../../07-metrics-and-tracking/event-dictionary.md#evt-11) (`stage='complete'`) |
