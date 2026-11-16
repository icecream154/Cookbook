# 03. 各层文档结构化陈述模板与行文规范

本文档定义 `01` ~ `07` 各层规格文档的**行文排版基本法**与**强制性结构模板（含可直接参考的通用填充微示例）**，消除不同编写者文风不一或遗漏关键契约的问题。

---

## 1. 全局行文与 Markdown 排版基本法

1. **表格与矩阵优先，禁止散文砌墙**：凡涉及实体结构、枚举取值、超过 2 个条件组合的分支规则、多端布局差异、页面状态穷举、事件映射，一律使用结构化 Markdown 表格表达；连续纯文本段落不得超过 4 行。
2. **中英文混排加粗安全规范（CommonMark 兼容）**：在标准 CommonMark 解析器中，闭合的 `**` 若内侧紧邻标点（如 `）`、`”`、`」`）且外侧紧邻中文字符而无空格或标点，会导致加粗解析失效。编写时统一**将括号或引号置于 `**` 外侧**（正确示例：`支持**移动端**（<768px）`、按“**可视组件**”拆分；禁止示例：`支持**移动端（<768px）**自适应`）。
3. **Mermaid 图表语法安全规范**：节点标签凡包含括号 `()`、斜杠 `/`、冒号 `:` 或星号 `*`，必须使用英文双引号包裹（如 `N1["[PAGE-CHK-01] 确认订单页 (主视图)"]`），且严禁在节点标签内使用原始 HTML 标签。

---

## 2. 各层标准结构模板与填充示例

### <a id="tpl-vision"></a>2.1 `01-vision-and-scope.md`（愿景、场景与范围）标准模板
固定由 4 节组成：痛点与一句话定位、目标场景表（`SCN-*`）、功能版图与非目标边界（`FEAT-*`）、全局非功能约束表（`NFR-*`）。核心表格填充示范如下：

```markdown
| 场景 ID | 目标人群画像 | 触发情境 (When & Where) | 核心诉求 (Goal) | 现存痛点阻碍 (Pain) |
| :--- | :--- | :--- | :--- | :--- |
| <a id="scn-01"></a>**SCN-01** | 企业行政采购员 | 每月初在电脑端集中采买多部门办公耗材 | 一次导入清单凑齐发票并按部门分拆配送地址 | 传统商城每次只能填单个收货地址，反复下单对账耗时 |
```

```markdown
| 功能 ID | 功能名称 | 归属业务模块 | 支撑场景 | 核心能力边界定义 | 下游核心映射 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="feat-01"></a>**FEAT-01** | 单笔订单多地址拆单配送 | 交易结算 | [SCN-01](#scn-01) | 支持单次结算为不同商品行分配独立收货地址并自动按仓库拆分子订单；暂不支持跨境保税仓混拆 | [RULE-ORD-02](./03-business-rules/fulfillment.md#rule-ord-02), [PAGE-CHK-01](./06-pages/checkout/checkout-main.md#page-chk-01) |
```

---

### <a id="tpl-domain"></a>2.2 `02-domain-model/`（静态领域模型）标准模板
不论业务域采用轻量平铺还是按聚合簇多级嵌套子包（详见 [01-layered-architecture.md 第 3.1 节](./01-layered-architecture.md)），领域模型文件均严格按**业务术语、静态实体、标准枚举**三类契约表编写，必填列与填充示范如下：

- **业务术语表（`terms.md`）**：
  ```markdown
  | 术语 ID | 标准中文名 | 英文标识 | 严格业务定义 | 易混淆反例说明 |
  | :--- | :--- | :--- | :--- | :--- |
  | <a id="term-cat-01"></a>**TERM-CAT-01** | 可售库存 | `SalableStock` | 物理在库总数减去“已锁未付订单数”及“质检冻结数”后的实时可下单余量 | 严禁等同于仓库实际盘点物理库存（`PhysicalStock`） |
  ```

- **静态实体契约表（`entities.md`）**：
  ```markdown
  ### <a id="dom-ord-order"></a>`DOM-ORD-Order`（交易订单聚合根）
  | 字段标识 | 中文名称 | 数据类型 | 必填 | 取值约束 / 关联实体或枚举 | 业务语义说明 |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | `orderId` | 订单全局单号 | `String` | 是 | 全局唯一，18 位数字串 | 交易主键 |
  | `payableCents` | 实付总金额 | `Int` | 是 | `>= 0`，单位：分 | 扣除全部优惠并加上运费后的最终应付额 |
  | `status` | 订单状态 | `Enum` | 是 | [ENUM-ORD-OrderStatus](./enums.md#enum-ord-orderstatus) | 当前履约生命周期阶段 |
  ```

- **标准枚举字典表（`enums.md`）**：
  ```markdown
  ### <a id="enum-ord-orderstatus"></a>`ENUM-ORD-OrderStatus`（订单状态枚举）
  | 枚举编码 (Code) | 标准展示文案 (Label) | 排序或计算权重 | 业务判定语义说明 |
  | :--- | :--- | :--- | :--- |
  | `PENDING_PAY` | 待付款 | `10` | 已锁库存待买家完成支付，超时未付自动流转至 `CLOSED` |
  | `PAID` | 待发货 | `20` | 支付网关回调确认成功，等待仓库推单出库 |
  ```

---

### <a id="tpl-rule"></a>2.3 `03-business-rules/<capability>.md`（全局业务规则）五要素卡片模板
每条 `RULE-*` 必须严格包含以下 5 个固定要素（分支超过 2 个时必须使用决策矩阵表）：

```markdown
## <a id="rule-pric-01"></a>1. `RULE-PRIC-01`（平台满减券与会员折扣叠加计价规则）

- **1. 触发时机与适用范围**：购物车勾算预览、确认订单页初始化及切换优惠券时实时调用。
- **2. 输入依赖契约**：买家会员等级 [ENUM-USR-VipTier](../02-domain-model/member/enums.md#enum-usr-viptier)、订单商品小计 [DOM-ORD-Order.subtotalCents](../02-domain-model/order/entities.md#dom-ord-order)、所选优惠券类型 [ENUM-PRM-CouponType](../02-domain-model/promotion/enums.md#enum-prm-coupontype)。
- **3. 核心判定矩阵与计算公式**：先按商品原价小计判定是否达到满减券门槛，扣减满减额后再乘以会员等级折扣率（结果按“分”四舍五入）：
  | 优惠券类型 | 普通会员 (`NONE`) | 金卡会员 (`GOLD`, 95折) | 黑金会员 (`PLATINUM`, 90折) |
  | :--- | :--- | :--- | :--- |
  | **平台通用满减券** | `subtotal - couponAmt` | `(subtotal - couponAmt) * 0.95` | `(subtotal - couponAmt) * 0.90` |
  | **特价秒杀专享券** | `subtotal - couponAmt` | 不叠加折上折，取两者更低价 | 不叠加折上折，取两者更低价 |
- **4. 边界与降级兜底（Fallback）**：若折算后金额 `<= 0`，实付商品金额强制保底为 `1` 分（运费另计）；若计价服务超时，降级按商品原价展示并在提交按钮上方提示“优惠计算重试中”。
- **5. 下游消费索引**：[FLOW-CHK-01](../04-ia-and-flows/flows/checkout.md#flow-chk-01) · [PAGE-CHK-01](../06-pages/checkout/checkout-main.md#page-chk-01)
```

---

### <a id="tpl-flow"></a>2.4 `04-ia-and-flows/`（信息架构与端到端流程）标准模板

#### <a id="tpl-ia-shell"></a>2.4.1 `ia-and-shell.md`（全局拓扑与多端响应式容器壳）固定四段式模板
严禁仅放一张粗略框图或把某个具体业务页的私有排版塞入全局壳表，必须严格按以下 **4 个正交小节**输出定量契约：

1. **第 1 节：全局导航拓扑与路由栈契约（Global IA & Routing Contract）**
   - **拓扑图粒度红线**：节点**仅画到 `06-pages/` 中独立注册 `PAGE-*` 的页面、复杂附属抽屉/面板、全屏专注层与全局模态框为止**（严禁下钻画单页内部局部区块、页内锚点或简单二次确认框）；Mermaid 图按 `L1 一级常驻导航空间`、`L2 空间专属子视图`、`L2/L3 跨空间共享视图`、`G 全局引导与中断层` 四个 `subgraph` 分区；实线标注显式跳转载体（`Push 推入` / `Drawer 展开` / `Fullscreen 接管`），虚线标注条件拦截或软导流（如触发 `[PAT-*]`）。
   - **一级导航席位与路由保活表** + **无历史栈深链回退规则**（示范如下）：
     ```markdown
     | 席位 | 导航标准文案 | 绑定根页面 | 默认首屏 | 角标/状态指示 | 游客可达性 | 切换保活 (Keep-Alive) 与重按行为 |
     | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
     | **Tab 1** | 商城首页 | [PAGE-HOME-01](../06-pages/home/home-main.md#page-home-01) | 是 | 无常驻红点 | 直接可读 | 切换保留滚动位；激活态重按平滑回顶 |
     | **Tab 3** | 购物车 | [PAGE-CART-01](../06-pages/cart/cart-main.md#page-cart-01) | 否 | 显示有效加购件数徽标 | 允许切入展示登录引导空态（禁点 Tab 直接弹框拦截） | 切换保留勾选态；激活态重按回顶并静默刷新库存 |
     ```
2. **第 2 节：多端视口断点、画布栅格与导航壳基线表（`SHELL-*` Master Baseline）**
   必须定量声明断点区间、设计基准宽、安全边距、栅格列数/槽宽、版心上限与导航栏几何尺寸：
   ```markdown
   | 容器壳 ID | 视口断点与设计基准 | 典型场景与输入特征 | 画布版心、安全边距与栅格基线 | 一级导航形态与尺寸契约 |
   | :--- | :--- | :--- | :--- | :--- |
   | <a id="shell-mobile"></a>**SHELL-Mobile** | `< 768px`<br>（基准宽 `390px`） | 手机竖屏单手拇指触控 | 流式 `100%` · 页边距 `16px` · `4` 列栅格（`Gutter 12px`）· 避让 `safe-area-inset-bottom` | **底部固定 Tab 栏**（净高 `56~60px`，图标居上 + `11px` 标签） |
   | <a id="shell-tablet"></a>**SHELL-Tablet** | `768px ~ 1023px`<br>（基准宽 `834/920px`） | 平板横/竖屏桌面支架触控 | 自适应满幅 · 页边距 `24px` · `8` 列栅格（`Gutter 16px`） | **左侧紧凑窄导航轨 Navigation Rail**（固定宽 `76px`，全高 `100dvh`） |
   | <a id="shell-desktop"></a>**SHELL-Desktop** | `>= 1024px`<br>（基准宽 `1280/1440px`） | 桌面键鼠宽屏并发操作 | 主工作区 `max-width: 1200px` 居中 · 页边距 `32px` · `12` 列栅格（`Gutter 24px`） | **左侧展开式常驻侧栏 Sidebar**（固定宽 `220px`，含品牌头 + 横向图标长文案） |
   ```
3. **第 3 节：容器壳插槽解剖、标准分栏骨架与外框退化规则（Shell Anatomy & Degradation）**
   - **三端插槽结构示意**：用紧凑 ASCII 线框标明 `[Slot-Nav]`、`[Slot-Header]`、`[Slot-SubSide]`、`[Slot-Main]`、`[Slot-Aside]`、`[Slot-BottomBar]` 的空间排布。
   - **主画布（`Slot-Main`）标准分栏骨架表**：抽象可跨页复用的通用布局骨架（`Mode-*`），供 `06-pages` 第 2 节按名挂载：
     ```markdown
     | 骨架编码 | 适用视图特征 | SHELL-Mobile 排布 | SHELL-Tablet 排布 | SHELL-Desktop 排布 |
     | :--- | :--- | :--- | :--- | :--- |
     | <a id="mode-cardgrid"></a>**Mode-CardGrid** | 列表/推荐卡片流 | `1` 列纵向卡片流 | `2` 列等宽网格 | `3~4` 列宽幅网格 |
     | <a id="mode-splitdetail"></a>**Mode-SplitDetail** | 富媒体详情与操作 | 单栏流 + 吸底主操作栏 | 左右双栏独立滚动（如 `42%` Sticky + `58%` 流） | 左宽主栏（`64%`）+ 右吸顶工具栏（`36%` Sticky） |
     ```
   - **视图深度与外框显隐退化矩阵**：明确 `L1 一级根页`、`L2 二级标准推入页`（如手机隐藏底部 Tab 切换为吸底栏，平板/桌面保留左侧导航常驻）、`L3 全屏沉浸专注层`（三端统一隐藏全部全局导航壳）的外框切换规则。
4. **第 4 节：次级容器跨端变形与 Z 轴叠放梯队（Overlay Adaptation & Z-Index）**
   - **次级容器变形矩阵**：按职责类别（`复合过滤容器`、`对照侧滑抽屉`、`表单/中断认证框`、`多步向导`、`非阻塞悬浮层/Snackbar`）规定三端形态尺寸（如手机 `Bottom Sheet 85vh` → 平板 `Side Drawer 380px` → 桌面 `内嵌常驻栏 280px` 或 `Centered Modal 420px`）及遮罩锁滚/关闭契约。
   - **全局 Z-Index 叠放梯队表**：明确 `主画布 < Sticky 栏 < 页内悬浮小窗 < 全局导航栏 < 业务抽屉 < 全局认证拦截弹窗 < 全局 Snackbar/Toast` 的相对叠放序与安全避让偏移量（防止抽屉内唤起登录框被遮挡、底部提示条被 Tab 栏盖住）。

#### <a id="tpl-flows-doc"></a>2.4.2 `flows/_index.md` 与 `flows/<stage>.md`（跨页流程）标准模板
- **`flows/_index.md`**：包含“旅程阶段分包表”与“**全局跨页面状态同步总矩阵**”（必填列：`源页面与触发动作 | 变更底层状态源 (链接 DOM-*) | 受影响目标页面 (链接 PAGE-*) | 响应时机与展示同步契约`）。
- **`flows/<stage>.md` 四要素卡片模板**（每条 `FLOW-*` 必须完整包含前置条件、标注了 `[PAGE-*]` 与 `[RULE-*]`/`[PAT-*]` 的流程图、中断回退及跨页同步影响）：
  ````markdown
  ## <a id="flow-chk-01"></a>1. `FLOW-CHK-01`：购物车合并结算至支付闭环流

  - **1. 关联范围与前置条件**（Given）：支撑 [FEAT-01](../../01-vision-and-scope.md#feat-01)；用户已登录且在 [PAGE-CART-01](../../06-pages/cart/cart-main.md#page-cart-01) 勾选 `>= 1` 件有效可售商品。
  - **2. 端到端交互与规则流转图**：
    ```mermaid
    flowchart TD
        START(["[PAGE-CART-01] 点击去结算"]) --> CHECK_STK{"校验可售库存 [RULE-INV-01]"}
        CHECK_STK -- "库存不足" --> TOAST_ERR["原页拦截提示缺货商品并刷新列表"]
        CHECK_STK -- "校验通过" --> CHK_MAIN["Push 进入 [PAGE-CHK-01] 确认订单页并执行计价 [RULE-PRIC-01]"]
        CHK_MAIN -- "提交订单成功" --> PAY_RES["锁库生单, 跳转 [PAGE-CHK-03] 支付结果页"]
    ```
  - **3. 中断与异常回退**：在 `PAGE-CHK-01` 未提交直接返回购物车时，不锁定库存、不扣减优惠券；提交后未支付退出时订单进入待付款倒计时。
  - **4. 跨页状态与缓存同步影响**：订单提交成功后，立即从 `PAGE-CART-01` 缓存中移除本次已结算商品行并重算底栏合计，同时触发 `PAGE-PROF-01`“待付款/待发货”角标计数刷新。
  ````

---

### <a id="tpl-comp"></a>2.5 `05-components-and-patterns/`（公共组件与交互契约）标准模板

#### <a id="tpl-comp-shared"></a>2.5.1 `shared-components.md`（有形复用组件 `COMP-*`）固定四段式模板
每个 `COMP-*`（必须在 `>= 2` 个独立页面复用）严格由 **视觉解剖与防误触约束、输入属性契约表、场景变体矩阵表、内部状态与事件透出表** 四部分构成：

```markdown
## <a id="comp-productcard"></a>1. `COMP-ProductCard`（跨页商品摘要卡片）

### 1.1 复用范围与视觉解剖契约
挂载于首页推荐、搜索结果、收藏夹（`>= 3` 处）；由 `1:1` 封面图区、两行截断标题区、价格标签行及右上独立收藏热区（最小触控 `32×32px`，阻止事件冒泡穿透主卡片）构成；封面加载失败回退默认占位图。

### 1.2 输入属性与数据绑定表（Props Contract）
| 属性标识 | 数据类型 / 绑定源 | 必填 | 默认值 / 边界约束 | 渲染说明 |
| :--- | :--- | :--- | :--- | :--- |
| `item` | [DOM-CAT-Sku](../02-domain-model/catalog/entities.md#dom-cat-sku) | 是 | 标题超 2 行末尾 `...` 截断 | 渲染主图、标题与销售价 |
| `variant` | `'home_feed' \| 'search_hit' \| 'fav_list'` | 是 | `'search_hit'` | 控制下方差异化信息与操作按钮 |

### 1.3 场景变体矩阵表（Variants Matrix）
| 变体编码 | 挂载宿主页面 | 差异化展示字段与规则绑定 | 专属局部操作按钮 | 主热区跳转与传参 |
| :--- | :--- | :--- | :--- | :--- |
| `home_feed` | [PAGE-HOME-01](../06-pages/home/home-main.md#page-home-01) | 展示个性化推荐理由胶囊（最多 2 个） | `[不感兴趣]` 负反馈按钮 | 跳 `PAGE-PRD-01` 并透传 `from='home'` |
| `fav_list` | [PAGE-FAV-01](../06-pages/fav/fav-main.md#page-fav-01) | 降价时高亮展示“比收藏时降 X 元”徽章 | 点击红心移除触发 [PAT-UndoSnackbar](./interaction-patterns.md#pat-undosnackbar) | 跳 `PAGE-PRD-01` 并透传 `from='fav'` |

### 1.4 内部状态与事件透出表（States & Emitted Events）
| 触发子热区 / 内部状态 | 防抖或置灰边界约束 | 透出事件语义（交由宿主绑定规则与埋点） | 组件局部即时反馈 |
| :--- | :--- | :--- | :--- |
| 点击右上红心热区 | `300ms` 节流防连点 | `onToggleFav(skuId)` → 宿主接入 [PAT-AuthResume](./interaction-patterns.md#pat-authresume) | 已登录态乐观切换实心/空心红心 |
| 点击卡片主区域 | 售罄态仍允许进详情看补货 | `onOpenDetail(skuId, context)` | 触发按压缩放微反馈后路由跳转 |
```

#### <a id="tpl-pat-doc"></a>2.5.2 `interaction-patterns.md`（无形交互契约 `PAT-*`）固定四段式模板
每条 `PAT-*` 必须包含：**1. 适用触发范围与设计原则** → **2. Mermaid `stateDiagram-v2` 状态机图** → **3. 时序参数与多端表现契约表** → **4. 并发冲突、中断与异常恢复边界表**：

```markdown
| 异常或并发边界场景 | 系统确定性裁决与恢复行为 | 严禁出现的体验反例 |
| :--- | :--- | :--- |
| 倒计时 4000ms 内连续移除了第 2 条记录 | 立即提交第 1 条的物理删除，底部提示条文案无缝刷新为第 2 条并重置 `4000ms` 计时器 | 屏幕堆叠多条悬浮条，或点撤销误把两条一起恢复 |
| 挂起受限动作弹登录框后，用户手动点 `✕` 关闭 | 立即清空内存 `pendingAction`，宿主页面保持点击前原貌零副作用 | 关闭弹窗后按钮卡在 Loading 态，或下次无关登录时意外重放旧动作 |
```

---

### <a id="tpl-page"></a>2.6 `06-pages/<space>/<view>.md`（单页与子视图规格）固定五段式模板
任何 `PAGE-*` 文档严格由以下 **5 个固定小节**构成，严守“**三不抄铁律**”（枚举全集链接 `02`、计算公式链接 `03`、公共组件与通用状态机链接 `05`）：

1. **第 1 节：页面元信息与路由契约表**
   必填行：`页面 ID 与名称`、`视图载体与层级`（标注 `L1/L2/L3/G` 及主页面/抽屉形态）、`访问权限与游客策略`、`路由入参与上下文继承`（上游透传参数及缺省回退值）、`上游进入入口`、`下游跳转出口与无栈兜底`、`关联可交互画板`。
2. **第 2 节：多端响应式布局与容器挂载表**
   必须显式完整覆盖 `SHELL-Mobile`、`SHELL-Tablet`、`SHELL-Desktop` 三个视口容器壳链接，并标明所挂载的 `04` 标准分栏骨架（`Mode-*`）或次级容器变形规则：
   ```markdown
   | 视口容器壳 | 挂载分栏骨架 / 容器形态 | 区块排布、滚动分配与吸顶/吸底差异 |
   | :--- | :--- | :--- |
   | [SHELL-Mobile](../../04-ia-and-flows/ia-and-shell.md#shell-mobile) | [Mode-SplitDetail](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 单栏纵向滚动；顶部导航吸顶，结算主按钮固定于 `Slot-BottomBar` |
   | [SHELL-Tablet](../../04-ia-and-flows/ia-and-shell.md#shell-tablet) | [Mode-SplitDetail](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 左侧 `76px` 导航轨常驻；主区左右分栏独立滚动（左 `55%` 商品清单，右 `45%` Sticky 账单卡） |
   | [SHELL-Desktop](../../04-ia-and-flows/ia-and-shell.md#shell-desktop) | [Mode-SplitDetail](../../04-ia-and-flows/ia-and-shell.md#mode-splitdetail) | 左侧 `220px` 侧栏常驻；`1200px` 版心内左主栏（`66%`）+ 右吸顶结算台（`34%` Sticky） |
   ```
3. **第 3 节：区块组装与数据绑定表**
   ```markdown
   | 区块编号 | 区块名称 | 复用组件 (链接 COMP-*) 或原子控件 | 绑定领域实体/枚举 (链接 DOM-*/ENUM-*) | 显隐条件与边界截断约束 |
   | :--- | :--- | :--- | :--- | :--- |
   | **B1** | 收货地址栏 | 地址摘要卡 + `[切换地址 >]` | [DOM-USR-Address](../../02-domain-model/member/entities.md#dom-usr-address) | 常驻；无默认地址时高亮显示 `+ 新建收货地址` |
   | **B2** | 确认商品列表 | [COMP-QuantityStepper](../../05-components-and-patterns/shared-components.md#comp-quantitystepper) + 行卡片 | [DOM-ORD-OrderItem](../../02-domain-model/order/entities.md#dom-ord-orderitem) | 常驻；超长规格名最多 1 行截断 |
   ```
4. **第 4 节：页面级状态枚举表**（硬性铁律 6：状态编码 `S1/S2/...` 必须与 `08` 画板顶栏按钮 **1:1 同名且数量一致**）
   ```markdown
   | 状态编码 | 状态名称 | 精确触发条件 | 界面视觉与提示特征 | 允许的用户恢复/迁移操作 |
   | :--- | :--- | :--- | :--- | :--- |
   | `S1_NormalReady` | 正常可提交结算态 | 地址有效且全部商品可售库存充足 | 渲染优惠明细，吸底 `[提交订单]` 主按钮高亮可点 | 切换优惠券、改数量或点击提交 |
   | `S2_HasInvalidSku` | 含失效/缺货商品阻断态 | 至少 1 件结算商品在锁库前下架或售罄 | 对应行置灰标 `已售罄`，顶部横幅提示，`[提交订单]` 置灰禁用 | 点击 `[一键移除失效商品]` 恢复至 `S1` |
   ```
5. **第 5 节：交互事件与规则埋点映射表**
   ```markdown
   | 用户操作或生命周期 (When) | 前置校验 / 交互契约 (链接 PAT-*) | 调用业务规则 / 流程 (链接 RULE-*/FLOW-*) | 界面反馈或路由跳转 (Then) | 触发埋点及属性快照 (链接 EVT-*) |
   | :--- | :--- | :--- | :--- | :--- |
   | 勾选或取消平台满减券 | `200ms` 防连点 | [RULE-PRIC-01](../../03-business-rules/pricing.md#rule-pric-01) | 实时重算优惠抵扣额与实付总额 | — |
   | 点击 `[提交订单]` 主按钮 | 校验地址非空且无失效行 | [FLOW-CHK-01](../../04-ia-and-flows/flows/checkout.md#flow-chk-01) | 锁库生单并唤起收银台；若并发缺货切至 `S2_HasInvalidSku` | [EVT-04](../../07-metrics-and-tracking/event-dictionary.md#evt-04) |
   ```

---

### <a id="tpl-metric"></a>2.7 `07-metrics-and-tracking/`（核心指标与事件字典）标准模板

#### <a id="tpl-metric-funnel"></a>2.7.1 `metrics-funnel.md`（北极星与转化漏斗 `MET-*`）标准模板
严格由 **1. 北极星指标表（`MET-NSM`）** → **2. 核心业务漏斗与护栏诊断表（`MET-01 ~ MET-NN`）** → **3. 全链路事件跃迁漏斗图（Mermaid）** 三节构成，每个指标必须写清去重统计粒度、时间窗口及精确到 `EVT-*` 属性过滤条件的分子/分母：

```markdown
| 指标 ID | 归属功能 | 指标名称 | 统计粒度与窗口 | 精确计算公式（主漏斗公式 + 配套护栏口径，必须链接 `EVT-*`） | 异常阈值与业务归因诊断 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="met-01"></a>**MET-01** | [FEAT-02](../01-vision-and-scope.md#feat-02) | **搜索至加购转化率** | 去重会话数（Session）· 自然日/周 | • **主转化率** = 触发 [EVT-03](./event-dictionary.md#evt-03)（`source='search'`）的会话数 ÷ 触发 [EVT-02](./event-dictionary.md#evt-02) 的会话数<br>• **辅看零结果率** = `EVT-02`（`result_total == 0`）次数 ÷ `EVT-02` 总次数 | 若零结果率 `> 8%`，需排查同义词词典缺口或长尾供给不足 |
```

#### <a id="tpl-event-dict"></a>2.7.2 `event-dictionary.md`（底层埋点字典 `EVT-*`）标准模板
严格由 **1. 全局公共上下文属性表（Super Properties）** → **2. 上报去重、防抖与幂等通用规约**（规定曝光去重、输入防抖后上报、乐观更新与失败回滚口径）→ **3. 关键业务事件注册表** 三节构成：

```markdown
| 事件 ID | 事件英文标识与中文名 | 触发载体 (`PAGE-*` / `COMP-*`) | 精确触发时机与防重条件 | 必传私有属性契约（`字段名: 类型 = 约束/枚举链接`） | 消费指标 (`MET-*`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <a id="evt-02"></a>**EVT-02** | `search_executed`<br>执行商品检索 | [PAGE-SRCH-01](../06-pages/search/search-main.md#page-srch-01) | 关键词提交或筛选变更在防抖（`250ms`）后接口返回结果列表时上报（输入拼音过程不报） | • `has_query`: `Boolean`（是否含关键词）<br>• `sort_by`: `Enum`（[ENUM-CAT-SortType](../02-domain-model/catalog/enums.md#enum-cat-sorttype)）<br>• `result_total`: `Int`（`>= 0`，命中总数） | [MET-01](./metrics-funnel.md#met-01) |
```
