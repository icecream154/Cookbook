# <a id="page-cook-02"></a>`PAGE-COOK-02`：全屏大字分步跟做视图

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-COOK-02` · 全屏防息屏大字分步跟做视图 |
| **视图载体与层级** | `L3` 宿主菜谱详情页的全屏深色高对比专注覆盖层（挂载于 `Z50` 层，三端统一隐藏全部全局一级导航壳） |
| **访问权限与游客策略** | 游客与已登录用户均可无门槛完整使用 |
| **路由入参与上下文继承** | 继承宿主详情页当前选定的菜谱主键（`recipe_id`）与实时折算后的目标人数（`target_servings`） |
| **上游进入入口** | 点击 [PAGE-COOK-01 多媒体菜谱详情页](./recipe-detail.md#page-cook-01) 中的 `[🍳 开始跟做]` 主按钮 |
| **下游跳转出口与无栈兜底** | 第 N 步点击 `[🎉 完成出锅]` 或顶栏 `[退出跟做 ✕]` 关闭专注覆盖层返回宿主详情页（若 URL 直达则自动先初始化 `PAGE-COOK-01`） |
| **关联可交互画板** | [recipe-consumption.html](../../08-verification/prototypes/pages/recipe-consumption.html)（顶栏切换至 `S5_CookFocusTimer` 直达） |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载分栏骨架 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile 手机竖屏壳 (<768px)](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-FocusedForm 专注大卡骨架](../../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | 隐藏全局导航，接管 `100vw × 100dvh` 深色背景并开启 [NFR-03 厨房屏幕常亮与大热区易用性](../../01-vision-and-scope.md#nfr-03)；一屏单步上下排布（上图下文，正文 `>= 20px`），底部固定高 `>= 52px` 超大防油污翻页双按钮 |
| [SHELL-Tablet 平板横屏壳 (768~1023px)](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-FocusedForm 专注大卡骨架](../../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | **隐藏左侧 `76px` 导航轨**；全视口深色横屏画布，中部升级为**左步骤配图**（`45%`）+ **右大字正文与计时卡**（`55%`）并排布局，远距离灶台视角一屏免滚 |
| [SHELL-Desktop 桌面宽屏壳 (>=1024px)](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-FocusedForm 专注大卡骨架](../../04-ia-and-flows/ia-and-shell.md#mode-focusedform) | **隐藏左侧 `220px` 侧栏**；`max-width: 960px` 居中宽屏双区专注大卡，额外支持键盘左右方向键 `← / →` 翻步与 `Esc` 退出 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（附字段与代表项说明） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 专注顶栏与跨步悬浮计时槽 | `● 屏幕常亮已开启` 绿灯标识 + **全局跨步悬浮倒计时胶囊** + `[退出跟做 ✕]` | 当前目标人数（`target_servings`）、活跃倒计时剩余秒数 | 全程常驻吸顶；无运行计时器时隐藏中间计时胶囊 |
| **B2** | 第 0 页：开火前备料清点大卡 | `开火前备料核对（已按 N 人份折算）` 大字标题 + 主辅料大字复选网格 | [DOM-RCP-RecipeIngredient 结构化食材项](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipeingredient)、[RULE-COOK-02 多量纲人性化取整](../../03-business-rules/portion-and-cooking.md#rule-cook-02) | 仅当步骤游标处于备料页（`step_cursor == 0`）时展示 |
| **B3** | 第 1..N 页：单步大字专注卡 | `Step X / N` 进度标 + 火候徽章 + `>= 20px` 动态调料高亮正文 + 步骤配图 + `[⏱ 启动本步倒计时 (mm:ss)]` 大按钮 + 避坑提示框 | [DOM-RCP-RecipeStep 富文本做法步骤项](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-recipestep)、[ENUM-RCP-HeatLevel 图表火力等级](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-heatlevel)（无火/小火/中火/猛火）、[RULE-COOK-03 步骤正文动态同步](../../03-business-rules/portion-and-cooking.md#rule-cook-03) | `1 <= step_cursor <= N` 时展示；倒计时按钮仅在内置秒数（`timer_seconds > 0`）的步骤显现 |
| **B4** | 防湿手超大热区翻页底栏 | 左 `[← 上一步]`（高度 `>= 52px`）+ 右高亮主按钮（动态文案：`[备齐了，正式开火 →]` / `[下一步 →]` / `[🎉 完成出锅]`） | 步骤游标（`step_cursor`）、总步数（`total_steps`） | 全程常驻吸底；第 0 备料页禁用上一步 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S5_CookFocusTimer` | 大字跟做且顶部悬浮倒计时运行态 | 进入全屏跟做步骤卡并点击某炖煮/腌制步骤的 `[⏱ 启动倒计时]` 按钮 | 深色高对比界面，顶栏挂载橙色跳秒胶囊 `⏱ 炖煮收汁 07:42 [暂停/重置]`，翻至前后其他步骤备菜时计时器持续悬浮运行不中断；归零时鸣音闪烁 | 暂停/重置计时器、点击上下步切换卡片、点击 `[🎉 完成出锅]` 或 `[退出跟做 ✕]` |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程（附语义短名） | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 第 0 页点击 `[备齐了，正式开火 →]` | — | [FLOW-COOK-02 全屏跟做与悬浮计时流](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 步骤游标推进至 `1`，展示第 1 步大字实操卡 | — |
| 点击步骤内 `[⏱ 启动本步倒计时]` | 内置秒数 `timer_seconds > 0` | [FLOW-COOK-02 全屏跟做与悬浮计时流](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 顶栏挂载跨步骤悬浮倒计时胶囊（`S5_CookFocusTimer`）开始每秒递减；归零时播放清脆提示音并橙光闪烁 | 置内存标记 `used_timer = true` |
| 点击 `[← 上一步]` / `[下一步 →]`（或桌面按 `← / →` 键） | `0 <= step_cursor <= N` | — | 即时切换步骤卡，顶栏运行中的悬浮倒计时保持连续跳秒不受影响 | — |
| 在第 N 步点击 `[🎉 完成出锅]` | 已达最后一步 | [FLOW-COOK-02 全屏跟做与悬浮计时流](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 释放屏幕常亮锁、清理计时器，关闭覆盖层返回宿主详情页并弹出完赛鼓励轻提示 | [EVT-11 全屏跟做完播埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-11) (`stage='complete', used_timer`) |
| 中途点击右上角 `[退出跟做 ✕]` | 若有运行中计时器先弹轻确认防误触 | [FLOW-COOK-02 全屏跟做与悬浮计时流](../../04-ia-and-flows/flows/detail-and-cooking.md#flow-cook-02) | 释放屏幕常亮锁，关闭覆盖层返回宿主详情页（保留详情页原人数与滚动位） | — |
