# <a id="page-srch-02"></a>`PAGE-SRCH-02`：多维复合筛选面板 / 常驻侧栏

## 1. 页面元信息

| 属性 | 定义内容 |
| :--- | :--- |
| **页面 ID 与载体** | `PAGE-SRCH-02` · 宿主 `PAGE-SRCH-01` 的复合过滤容器 |
| **访问权限** | 游客可用（仅内部“仅看收藏”分段项受 [PAT-AuthResume](../../05-components-and-patterns/interaction-patterns.md#pat-authresume) 保护） |
| **上游入口** | 手机/平板点击 `PAGE-SRCH-01` 的 `[⚙ 复合筛选]`；Web 桌面端默认内嵌常驻 |
| **下游出口** | 点击底部 `[查看匹配的 N 道菜谱]` 关闭抽屉并刷新 `PAGE-SRCH-01` |
| **配套画板原型** | [recipe-discovery.html](../../08-verification/prototypes/pages/recipe-discovery.html)（切换至 `S5_FilterDrawerOpen` 直达） |

---

## 2. 三端响应式布局差异

| 视口容器壳 | 布局表现 |
| :--- | :--- |
| [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | 底部模态抽屉（`85vh`），底部固定 `[重置全部]` 与实时计数确认主按钮 |
| [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | 右侧滑出模态抽屉（宽 `380px`） |
| [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | 左侧内嵌常驻筛选栏（宽 `280px`），隐藏底部关闭按钮，勾选任意项实时刷新右侧结果流 |

---

## 3. 区块组装与数据绑定清单

| 筛选分组 | 控件构成 | 绑定的领域枚举与字段 | 显隐与交互约束 |
| :--- | :--- | :--- | :--- |
| **1. 收藏范围** | 二选一分段开关：`全部菜谱` / `仅看已收藏` | [DOM-PLN-FavoriteRecord](../../02-domain-model/meal-and-collection/entities.md#dom-pln-favoriterecord) | 与宿主页面外层胶囊双向同步 |
| **2. 需要的食材** | 常见食材多选芯片 + 搜索添加框 + 匹配模式切换器 | [DOM-RCP-StandardIngredient](../../02-domain-model/recipe-catalog/entities.md#dom-rcp-standardingredient)、[ENUM-PLN-IngMatchMode](../../02-domain-model/meal-and-collection/enums.md#enum-pln-ingmatchmode) | 最多选 8 项；当已选 `>= 2` 项时展开 `智能匹配度排序` / `严格全部包含` 切换开关 |
| **3. 排除食材** | `[自动排除个人忌口]` 开关 + 临时排除食材芯片 | [ENUM-USR-AvoidTag](../../02-domain-model/user-profile/enums.md#enum-usr-avoidtag) | 默认关闭不暗中屏蔽（遵循 [RULE-SRCH-03](../../03-business-rules/search-and-matching.md#rule-srch-03)） |
| **4. 菜系分类** | 多选网格芯片 | [ENUM-RCP-Cuisine](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-cuisine) | 组内为 `OR` 并集 |
| **5. 辣度等级** | 4 档多选芯片 | [ENUM-RCP-Spiciness](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-spiciness) | 组内为 `OR` 并集 |
| **6. 耗时与难度** | 耗时上限单选 + 难度多选芯片 | [ENUM-USR-TimeBudget](../../02-domain-model/user-profile/enums.md#enum-usr-timebudget)、[ENUM-RCP-Difficulty](../../02-domain-model/recipe-catalog/enums.md#enum-rcp-difficulty) | 与其他组取 `AND` 交集 |
| **7. 健康与厨具** | 健康标签多选 + 特色厨具多选 | [ENUM-USR-HealthTag](../../02-domain-model/user-profile/enums.md#enum-usr-healthtag)、[ENUM-USR-Appliance](../../02-domain-model/user-profile/enums.md#enum-usr-appliance) | 健康组内 `AND`，厨具组内 `OR` |

---

## 4. 页面级状态枚举

| 状态编码 | 状态名称 | 界面特征说明 |
| :--- | :--- | :--- |
| `S5_FilterDrawerOpen` | 复合筛选抽屉展开与实时计数态 | 展开多食材模式开关，底部主按钮实时动态显示 `查看匹配的 N 道菜谱`（`N=0` 时变更为橙色预警文案） |

---

## 5. 交互事件映射表

| 用户动作（When） | 前置校验 / 模式 | 执行业务规则 | 界面变化或跳转（Then） | 上报关键事件 |
| :--- | :--- | :--- | :--- | :--- |
| 点选/取消任意筛选项或切换食材匹配模式 | 包含食材上限 `<= 8` | [RULE-SRCH-02](../../03-business-rules/search-and-matching.md#rule-srch-02) + [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 实时更新底部命中数 `N`（Web 端同步刷新右侧列表） | — |
| 点击 `[查看匹配的 N 道菜谱]` | — | [RULE-SRCH-04](../../03-business-rules/search-and-matching.md#rule-srch-04) | 收起抽屉并应用条件渲染 `PAGE-SRCH-01` | [EVT-07](../../07-metrics-and-tracking/event-dictionary.md#evt-07) |
| 点击 `[重置全部]` | — | — | 清空全部过滤项并恢复默认排序 | — |
