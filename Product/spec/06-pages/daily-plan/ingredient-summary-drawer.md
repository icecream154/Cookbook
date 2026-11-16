# <a id="page-plan-02"></a>`PAGE-PLAN-02`：今日食材汇总核对抽屉

## 1. 页面元信息与路由契约

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与名称** | `PAGE-PLAN-02` · 今日食材汇总核对抽屉 |
| **视图载体与层级** | `L2` 宿主今日菜谱主页的附属对照核对抽屉（挂载于 `Z50` 层） |
| **访问权限与游客策略** | 游客与已登录用户均可完整勾选核对与复制采购文本清单（已备齐勾选态按日期持久化至本地缓存） |
| **路由入参与上下文继承** | 实时读取宿主 `PAGE-PLAN-01` 当前生效的 [DOM-PLN-DailyMealPlan 每日三餐单](../../02-domain-model/meal-and-collection/entities.md#dom-pln-dailymealplan) 菜品列表与生效人数（`applied_servings`） |
| **上游进入入口** | 点击 [PAGE-PLAN-01 今日菜谱主页](./daily-meal-plan.md#page-plan-01) 页头右上角 `[🛒 今日食材汇总]` |
| **下游跳转出口与无栈兜底** | 点击 `[完成核对]`、`✕` 或遮罩收起抽屉返回宿主今日菜谱页；若 URL 直达则自动先挂载 `PAGE-PLAN-01` 再展开本抽屉 |
| **关联可交互画板** | [daily-plan.html](../../08-verification/prototypes/pages/daily-plan.html)（顶栏切换至 `S5_IngSummaryDrawer` / `S6_EmptyMealSelected` 直达） |

---

## 2. 多端响应式布局与容器挂载

| 视口容器壳 | 挂载容器形态 | 区块排布、滚动分配与吸顶/吸底差异 |
| :--- | :--- | :--- |
| [SHELL-Mobile 手机竖屏壳 (<768px)](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 底部模态抽屉 Bottom Sheet（`max-height: 85vh`） | 顶部固定标题与餐次范围胶囊条，中部独立纵向滚动分类食材复选行，底部固定复制与完成双按钮 |
| [SHELL-Tablet 平板横屏壳 (768~1023px)](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 右侧滑出抽屉 Side Drawer（固定宽 `420px`，高 `100dvh`） | 从视口右边缘滑出，左侧仍露出部分今日菜单卡片供视线对照 |
| [SHELL-Desktop 桌面宽屏壳 (>=1024px)](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 右侧滑出抽屉 Side Drawer（固定宽 `420px`，高 `100dvh`） | 右侧全高常驻滑层，支持键盘 `Esc` 一键关闭，对照左侧宽屏三餐网格核对冰箱存货 |

---

## 3. 区块组装与数据绑定表

| 区块编号 | 区块名称 | 复用组件或原子控件 | 绑定领域实体/枚举（附字段与代表项说明） | 显隐条件与边界截断约束 |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 抽屉头与餐次范围开关栏 | 标题（含 `按 N 人份合并` 徽章）+ `✕` + `[✓ 早餐]` `[✓ 午餐]` `[✓ 晚餐]` 多选开关胶囊 | [ENUM-RCP-MealSlot 每日餐次槽位](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-mealslot)（早/午/晚）、当前生效人数（`applied_servings`） | 常驻吸顶；默认三餐全勾 |
| **B2** | 货架分类合并食材清单 | 分类小标题 + 可点击打勾的食材行（标准名 + 合并后人性化总量 + 关联菜谱来源副标） | [ENUM-PLN-SummaryCategory 采购货架分组](../../02-domain-model/meal-and-collection/enums.md#enum-pln-summarycategory)（肉禽水产/蔬果菌菇/蛋奶主食/常备调味 4 组）、[DOM-PLN-IngredientSummaryItem 跨菜谱食材合并项](../../02-domain-model/meal-and-collection/entities.md#dom-pln-ingredientsummaryitem)（合并展示量 `merged_display_amount`、菜谱溯源 `source_traces`） | 勾选餐次 `>= 1` 时显示；已打勾“家里已有”的食材自动划线置灰弱化 |
| **B3** | 无餐次勾选空状态引导块 | 图标 + 引导文案 + `[恢复勾选全部三餐]` 按钮 | 遵循 [PAT-ViewStates 全局视图四态契约](../../05-components-and-patterns/interaction-patterns.md#pat-viewstates) | 仅当早/午/晚 3 个胶囊全部点灭（`S6_EmptyMealSelected`）时显示 |
| **B4** | 底部采购导出工具栏 | 左侧 `[📋 复制买菜清单]` 按钮 + 右侧 `[完成核对]` 主按钮 | — | 常驻吸底；处于 `S6` 空态时 `[📋 复制买菜清单]` 置灰禁用 |

---

## 4. 页面级状态枚举表（与画板原型顶栏 1:1 咬合）

| 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
| :--- | :--- | :--- | :--- | :--- |
| `S5_IngSummaryDrawer` | 多餐合并与勾选核对正常态 | 打开抽屉且至少勾选早/午/晚中 `>= 1` 个餐次 | 按 4 大超市货架区展示合并总量与来源（如 `鸡蛋 5个 · 来自北非蛋+番茄炒蛋`） | 切换餐次胶囊实时重算、点击行打勾核对已有食材、复制清单或关闭抽屉 |
| `S6_EmptyMealSelected` | 三餐全部取消勾选空态 | 用户手动将早、午、晚 3 颗餐次胶囊全部点灭 | 隐藏分组列表，展示可行动空状态：“请至少勾选一餐以汇总所需食材”及一键恢复按钮，复制按钮置灰 | 重新点亮任一餐次胶囊或点击 `[恢复勾选全部三餐]` 切回 `S5_IngSummaryDrawer` |

---

## 5. 交互事件与规则埋点映射表

| 用户操作或生命周期（When） | 前置校验 / 交互契约 | 调用业务规则 / 流程（附语义短名） | 界面反馈或路由跳转（Then） | 触发埋点及属性快照 |
| :--- | :--- | :--- | :--- | :--- |
| 切换 `[早餐 / 午餐 / 晚餐]` 任一胶囊开关 | — | [RULE-PLAN-05 跨菜谱同类食材合并](../../03-business-rules/meal-recommendation.md#rule-plan-05)（先累加原值再统一取整） | 实时剔除或并入对应餐次食材并重算求和；若 3 餐全灭则切至 `S6_EmptyMealSelected` | — |
| 点击任意一行汇总食材项 | — | — | 切换该标准食材的已备齐标记（`is_checked`：划线置灰“家里已有” ↔ 恢复“待买”），持久化至当日缓存 | — |
| 点击 `[📋 复制买菜清单]` | 勾选餐次 `>= 1` 且待买项非空 | [FLOW-PLAN-01 三餐生成与买菜合并流](../../04-ia-and-flows/flows/meal-planning.md#flow-plan-01) | 仅提取“未打勾待采购”食材按货架分类拼接纯文本写入系统剪贴板，弹出 `已复制待买清单` 轻提示 | [EVT-06 使用今日食材汇总埋点](../../07-metrics-and-tracking/event-dictionary.md#evt-06) (`action='copy'`) |
| 点击 `[完成核对]`、`✕` 或遮罩 | — | — | 收起抽屉返回宿主今日菜谱主页 | — |
