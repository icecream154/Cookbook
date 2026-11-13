# 菜谱与标准食材域：实体契约（`DOM-RCP-*`）

## <a id="dom-rcp-standardingredient"></a>1. `DOM-RCP-StandardIngredient`（标准食材主数据）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ingredient_id` | 标准食材主键 | `string` | 是 | 全局唯一语义键（如 `ing_tomato`） | 支撑检索过滤与跨菜谱买菜合并的归一化主键 |
| `canonical_name` | 标准食材名称 | `string` | 是 | 如 `番茄`、`鸡蛋`、`牛腩` | 筛选面板与采购汇总表的统一显示名称 |
| `synonyms` | 同义词/俗称集合 | `string[]` | 否 | 如 `["西红柿", "洋柿子"]` | 搜索联想与关键词召回同义扩展依据 |
| `summary_category` | 采购归类分组 | `string` | 是 | 引用 [ENUM-PLN-SummaryCategory](../meal-and-collection/enums.md#enum-pln-summarycategory) | 用于今日食材汇总抽屉自动按超市货架区归类 |
| `avoid_tag` | 关联忌口大类 | `string` | 否 | 引用 [ENUM-USR-AvoidTag](../user-profile/enums.md#enum-usr-avoidtag) | 如虾皮、鲈鱼均归属 `seafood`，支撑一票否决过滤 |

---

## <a id="dom-rcp-recipe"></a>2. `DOM-RCP-Recipe`（菜谱核心聚合根）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `recipe_id` | 菜谱唯一标识 | `string` | 是 | 全局唯一 ID | 菜谱主键 |
| `title` | 菜谱名称 | `string` | 是 | `2 ~ 24` 字符 | 列表与详情主标题 |
| `tagline` | 一句话风味亮点 | `string` | 是 | `<= 40` 字符 | 详情页副标题与推荐摘要 |
| `cover_image_url` | 高清成品封面图 | `string` | 是 | 4:3 或 16:9 图源 URL | 卡片缩略图及视频未播放/弱网兜底海报 |
| `video_url` | 教学视频地址 | `string` | 否 | HLS/MP4 视频流地址 | 顶部主视频源 |
| `video_duration_sec` | 视频总时长秒数 | `int` | 否 | `> 0`（有视频时必填） | 卡片右下角时长角标及播放器进度条上限 |
| `cuisine` | 所属菜系 | `string` | 是 | 单选，引用 [ENUM-RCP-Cuisine](./enums.md#enum-rcp-cuisine) | 复合检索核心维度 |
| `meal_slots` | 适用餐次集合 | `string[]` | 是 | 多选，引用 [ENUM-RCP-MealSlot](./enums.md#enum-rcp-mealslot) | 决定可进入早/午/晚哪几餐候选池 |
| `dish_role` | 配餐角色分类 | `string` | 是 | 单选，引用 [ENUM-RCP-DishRole](./enums.md#enum-rcp-dishrole) | 驱动“两菜一汤/一碗端”配餐结构与同角色换一换 |
| `primary_main_ing_id` | 第一主食材标识 | `string` | 是 | 关联 [DOM-RCP-StandardIngredient](#dom-rcp-standardingredient) | 用于同餐多菜主材互斥校验（防同桌两道番茄菜） |
| `spiciness` | 辣度等级 | `int` | 是 | `0 ~ 3`，引用 [ENUM-RCP-Spiciness](./enums.md#enum-rcp-spiciness) | 检索过滤与个人辣度上限硬校验 |
| `difficulty` | 烹饪难度 | `string` | 是 | 单选，引用 [ENUM-RCP-Difficulty](./enums.md#enum-rcp-difficulty) | 与用户厨艺等级匹配 |
| `prep_time_min` | 备菜切配耗时 | `int` | 是 | 分钟正整数 | 组成总耗时 |
| `cook_time_min` | 开火烹饪耗时 | `int` | 是 | 分钟正整数 | `total_time_min = prep_time_min + cook_time_min` |
| `base_servings` | 配方基准人份 | `int` | 是 | `1 ~ 6`，见 [TERM-RCP-02](./terms.md#term-rcp-02) | 动态换算分母基准 |
| `required_appliances` | 必需厨房厨具 | `string[]` | 是 | 引用 [ENUM-USR-Appliance](../user-profile/enums.md#enum-usr-appliance) | 缺少任一必需厨具则不向该用户自动推荐 |
| `flavor_tags` | 风味属性标签 | `string[]` | 是 | 引用 [ENUM-USR-Flavor](../user-profile/enums.md#enum-usr-flavor) | 风味偏好加权匹配 |
| `health_tags` | 营养健康标签 | `string[]` | 是 | 引用 [ENUM-USR-HealthTag](../user-profile/enums.md#enum-usr-healthtag) | 健康目标匹配与检索筛选 |

---

## <a id="dom-rcp-recipeingredient"></a>3. `DOM-RCP-RecipeIngredient`（菜谱结构化食材项）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ingredient_id` | 标准食材外键 | `string` | 是 | 关联 [DOM-RCP-StandardIngredient](#dom-rcp-standardingredient) | 绑定归一化食材与忌口属性 |
| `display_name` | 部位/形态展示名 | `string` | 是 | 如标准名 `牛肉`，展示名 `带筋牛腩块` | 保留具体选材要求 |
| `group_type` | 清单分组 | `string` | 是 | `main`（主料）/ `sub`（辅料）/ `seasoning`（腌料与调料） | 详情页食材表三段分组渲染依据 |
| `base_amount` | 基准数值 | `float` | 否 | `> 0`（模糊量时为空） | 对应 `base_servings` 下的精确用量 |
| `unit` | 计量单位 | `string` | 是 | 如 `g`、`ml`、`个`、`条`、`勺`、`少许` | 展示与跨菜通约求和单位 |
| `scale_mode` | 换算取整模式 | `string` | 是 | 引用 [ENUM-RCP-ScaleMode](./enums.md#enum-rcp-scalemode) | 决定人数变更时遵循哪套人性化取整公式 |
| `substitute_note` | 忌口替代说明 | `string` | 否 | 如 `忌香菜可直接省去或换葱花` | 命中用户个人忌口时在详情页温和提示 |

---

## <a id="dom-rcp-recipestep"></a>4. `DOM-RCP-RecipeStep`（富文本做法步骤项）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `step_no` | 步骤序号 | `int` | 是 | 从 `1` 连续递增 | 步骤顺序标识 |
| `step_title` | 动作摘要小标题 | `string` | 是 | `4 ~ 18` 字符 | 如 `冷水下锅焯透牛腩` |
| `rich_text_tpl` | 富文本模板正文 | `string` | 是 | 支持加粗及 [TERM-RCP-04 动态占位符](./terms.md#term-rcp-04) | 随当前目标人数同步渲染高亮克数 |
| `media_urls` | 步骤配图/对比图 | `string[]` | 否 | 最多 2 张（支持正确 vs 错误状态对比） | 点击支持全屏预览 |
| `video_anchor_sec` | 关联视频秒数锚点 | `int` | 否 | `0 <= sec < video_duration_sec` | 点击一键将主视频或悬浮小窗跳转至该手法片段 |
| `timer_seconds` | 内置倒计时秒数 | `int` | 否 | `> 0`（如炖煮 `2100` 秒） | 非空时渲染 `[⏱ 启动倒计时]` 触发按钮 |
| `chef_tip` | 防翻车关键贴士 | `string` | 否 | `<= 80` 字符 | 以高亮引用块展示大厨避坑要点 |

---

## <a id="dom-rcp-nutritionchart"></a>5. `DOM-RCP-NutritionChart` & <a id="dom-rcp-timelinechart"></a>`DOM-RCP-TimelineChart`（富文本内嵌双图表契约）

| 归属图表对象 | 字段标识 | 类型 | 业务语义说明 |
| :--- | :--- | :--- | :--- |
| **营养热量构成图**<br>`DOM-RCP-NutritionChart` | `calories_per_serving` | `int` | **恒定以 1 人份为统计口径**的千卡能量值（不随总人数翻倍改变口径） |
| 同上 | `protein_g` / `carbs_g` / `fat_g` | `float` | 单人份三大宏量营养素克数，用于计算供能占比环形图与水平条 |
| 同上 | `sodium_level` | `string` | `low`（低钠）/ `medium`（适中）/ `high`（偏高） |
| **工序火候时间轴图**<br>`DOM-RCP-TimelineChart` | `phases[]` | `Object[]` | 有序阶段数组，每项含：`phase_name`（阶段名）、`duration_min`（分钟）、`heat_level`（引用 [ENUM-RCP-HeatLevel](./enums.md#enum-rcp-heatlevel)）、`target_step_no`（点击定位的步骤号） |
