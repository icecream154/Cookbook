# 菜谱与标准食材域：实体契约（`DOM-RCP-*`）

## <a id="dom-rcp-standardingredient"></a>1. `DOM-RCP-StandardIngredient`（标准食材主数据）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用（附代表项速查） | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ingredient_id` | 标准食材主键 | `string` | 是 | 全局唯一语义键（如 `ing_tomato`） | 支撑检索过滤与跨菜谱买菜合并的归一化主键 |
| `canonical_name` | 标准食材名称 | `string` | 是 | 如 `番茄`、`鸡蛋`、`牛腩` | 筛选面板与采购汇总表的统一显示名称 |
| `synonyms` | 同义词/俗称集合 | `string[]` | 否 | 如 `["西红柿", "洋柿子"]` | 搜索联想与关键词召回同义扩展依据 |
| `summary_category` | 采购归类分组 | `string` | 是 | 引用 [ENUM-PLN-SummaryCategory 采购货架分组](../meal-and-collection/enums.md#enum-pln-summarycategory)（肉禽水产/蔬果菌菇/蛋奶主食/常备调味 4 组） | 用于今日食材汇总抽屉自动按超市货架区归类 |
| `avoid_tag` | 关联忌口大类 | `string` | 否 | 引用 [ENUM-USR-AvoidTag 高频忌口大类](../user-profile/enums.md#enum-usr-avoidtag)（如虾皮、鲈鱼均归属海鲜 `seafood`） | 支撑按忌口大类一键穿透剔除全部下属食材 |

---

## <a id="dom-rcp-recipe"></a>2. `DOM-RCP-Recipe`（菜谱核心聚合根）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用（附代表项速查） | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `recipe_id` | 菜谱唯一标识 | `string` | 是 | 全局唯一 ID | 菜谱主键 |
| `title` | 菜谱名称 | `string` | 是 | `2 ~ 24` 字符 | 列表与详情主标题 |
| `tagline` | 一句话风味亮点 | `string` | 是 | `<= 40` 字符 | 详情页副标题与推荐摘要 |
| `cover_image_url` | 高清成品封面图 | `string` | 是 | 4:3 或 16:9 图源 URL | 卡片缩略图及视频未播放/弱网失败时的兜底静态海报 |
| `video_url` | 教学视频地址 | `string` | 否 | HLS/MP4 视频流地址 | 详情页顶部主视频源（允许部分图文菜谱无视频） |
| `video_duration_sec` | 视频总时长秒数 | `int` | 否 | `> 0`（有视频时必填） | 卡片右下角时长角标及播放器进度条上限 |
| `cuisine` | 所属菜系 | `string` | 是 | 单选，引用 [ENUM-RCP-Cuisine 菜系分类枚举](./enums.md#enum-rcp-cuisine)（家常/川/粤/湘/西式/轻食等 10 类） | 复合检索核心过滤维度 |
| `meal_slots` | 适用餐次集合 | `string[]` | 是 | 多选，引用 [ENUM-RCP-MealSlot 每日餐次槽位](./enums.md#enum-rcp-mealslot)（早餐/午餐/晚餐） | 决定可进入早、午、晚哪几餐推荐候选池 |
| `dish_role` | 配餐角色分类 | `string` | 是 | 单选，引用 [ENUM-RCP-DishRole 套餐配餐角色](./enums.md#enum-rcp-dishrole)（主食早点/一碗端/主荤/时蔬/汤羹 5 类） | 驱动“两菜一汤/一碗端”配餐结构与同角色换一换 |
| `primary_main_ing_id` | 第一主食材标识 | `string` | 是 | 关联 [DOM-RCP-StandardIngredient 标准食材主数据](#dom-rcp-standardingredient) | 用于同餐多菜主材互斥校验（防同桌两道番茄菜） |
| `spiciness` | 辣度等级 | `int` | 是 | `0 ~ 3`，引用 [ENUM-RCP-Spiciness 通用辣度分级](./enums.md#enum-rcp-spiciness)（0不辣 ~ 3重辣） | 检索过滤与个人辣度上限硬校验依据 |
| `difficulty` | 烹饪难度 | `string` | 是 | 单选，引用 [ENUM-RCP-Difficulty 烹饪难度枚举](./enums.md#enum-rcp-difficulty)（简单/适中/挑战 3 档） | 与用户厨艺等级匹配过滤 |
| `prep_time_min` | 备菜切配耗时 | `int` | 是 | 分钟正整数 | 组成单菜总耗时 |
| `cook_time_min` | 开火烹饪耗时 | `int` | 是 | 分钟正整数 | 总耗时 `total_time_min = prep_time_min + cook_time_min` |
| `base_servings` | 配方基准人份 | `int` | 是 | `1 ~ 6`，见 [TERM-RCP-02 基准人份定义](./terms.md#term-rcp-02) | 动态分量换算时的比例分母基准 |
| `required_appliances` | 必需厨房厨具 | `string[]` | 是 | 引用 [ENUM-USR-Appliance 可用厨具枚举](../user-profile/enums.md#enum-usr-appliance) | 缺少任一必需厨具则不向该用户自动推荐 |
| `flavor_tags` | 风味属性标签 | `string[]` | 是 | 引用 [ENUM-USR-Flavor 风味喜好枚举](../user-profile/enums.md#enum-usr-flavor) | 风味偏好加权匹配依据 |
| `health_tags` | 营养健康标签 | `string[]` | 是 | 引用 [ENUM-USR-HealthTag 健康饮食标签](../user-profile/enums.md#enum-usr-healthtag) | 健康目标匹配与检索筛选依据 |

---

## <a id="dom-rcp-recipeingredient"></a>3. `DOM-RCP-RecipeIngredient`（菜谱结构化食材项）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用（附代表项速查） | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ingredient_id` | 标准食材外键 | `string` | 是 | 关联 [DOM-RCP-StandardIngredient 标准食材主数据](#dom-rcp-standardingredient) | 绑定归一化标准食材与过敏忌口属性 |
| `display_name` | 部位/形态展示名 | `string` | 是 | 如标准名 `牛肉`，展示名 `带筋牛腩块` | 在详情页保留具体切配与选材要求 |
| `group_type` | 清单分组 | `string` | 是 | `'main'`（主料）/ `'sub'`（辅料）/ `'seasoning'`（腌料与调料） | 详情页食材表三段分组渲染依据 |
| `base_amount` | 基准数值 | `float` | 否 | `> 0`（少许/适量等模糊量时为空） | 对应配方基准人份（`base_servings`）下的精确用量 |
| `unit` | 计量单位 | `string` | 是 | 如 `g`、`ml`、`个`、`条`、`勺`、`少许` | 展示与跨菜谱通约求和单位 |
| `scale_mode` | 换算取整模式 | `string` | 是 | 引用 [ENUM-RCP-ScaleMode 食材取整模式](./enums.md#enum-rcp-scalemode)（称重阶梯/半个/整颗正整数/半勺/固定不缩放 5 类） | 决定人数变更时遵循哪套人性化取整公式 |
| `substitute_note` | 忌口替代说明 | `string` | 否 | 如 `忌香菜可直接省去或换葱花` | 命中用户个人忌口时在详情页展示温和替代贴士 |

---

## <a id="dom-rcp-recipestep"></a>4. `DOM-RCP-RecipeStep`（富文本做法步骤项）

| 字段标识 | 中文名称 | 类型 | 必填 | 取值约束 / 关联引用 | 业务语义说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `step_no` | 步骤序号 | `int` | 是 | 从 `1` 连续递增 | 步骤顺序标识 |
| `step_title` | 动作摘要小标题 | `string` | 是 | `4 ~ 18` 字符 | 如 `冷水下锅焯透牛腩` |
| `rich_text_tpl` | 富文本模板正文 | `string` | 是 | 支持加粗及 [TERM-RCP-04 步骤动态占位符](./terms.md#term-rcp-04)（如 `{ing_soy_sauce}`） | 随当前目标人数同步重算并高亮渲染内嵌调料克数 |
| `media_urls` | 步骤配图/对比图 | `string[]` | 否 | 最多 2 张（支持正确 vs 易错状态对比） | 点击支持大图预览 |
| `video_anchor_sec` | 关联视频秒数锚点 | `int` | 否 | `0 <= sec < video_duration_sec`（视频总时长） | 点击一键将主视频或悬浮小窗定位至对应手法片段 |
| `timer_seconds` | 内置倒计时秒数 | `int` | 否 | `> 0`（如慢炖 `2100` 秒） | 非空时在步骤卡渲染 `[⏱ 启动倒计时]` 按钮 |
| `chef_tip` | 防翻车关键贴士 | `string` | 否 | `<= 80` 字符 | 以高亮提示块展示大厨火候避坑要点 |

---

## <a id="dom-rcp-nutritionchart"></a>5. `DOM-RCP-NutritionChart` & <a id="dom-rcp-timelinechart"></a>`DOM-RCP-TimelineChart`（富文本内嵌双图表契约）

| 归属图表对象 | 字段标识 | 类型 | 业务语义说明 |
| :--- | :--- | :--- | :--- |
| **营养热量构成图**<br>`DOM-RCP-NutritionChart` | `calories_per_serving` | `int` | **恒定以 1 人份为统计口径**的千卡能量值（不随总人数翻倍改变口径） |
| 同上 | `protein_g` / `carbs_g` / `fat_g` | `float` | 单人份蛋白质、碳水、脂肪克数，用于计算供能占比环形图与水平进度条 |
| 同上 | `sodium_level` | `string` | 钠含量分级：`'low'`（低钠）/ `'medium'`（适中）/ `'high'`（偏高） |
| **工序火候时间轴图**<br>`DOM-RCP-TimelineChart` | `phases[]` | `Object[]` | 有序工序阶段数组，每项含阶段名（`phase_name`）、耗时分钟（`duration_min`）、火力等级（`heat_level`，引用 [ENUM-RCP-HeatLevel 火力等级枚举](./enums.md#enum-rcp-heatlevel) 0无火~3猛火）及点击跳转目标步骤号（`target_step_no`） |
