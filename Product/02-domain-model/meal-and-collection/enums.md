# 膳食规划与收藏域：标准枚举字典（`ENUM-PLN-*`）

## <a id="enum-pln-ingmatchmode"></a>1. `ENUM-PLN-IngMatchMode`（多食材检索匹配模式）

| 枚举编码 | 标准展示文案 | 适用激活前提 | 业务判定语义 |
| :--- | :--- | :--- | :--- |
| `smart_rank` | 智能匹配度排序 | 包含食材数 `>= 2` 时默认选中 | 并集（`OR`）召回至少命中 1 项所选食材的菜谱，按命中数量降序排列并标注所缺食材 |
| `strict_all` | 严格全部包含 | 包含食材数 `>= 2` 时可切换 | 交集（`AND`）过滤，仅展示同时用到全部所选食材的菜谱 |

---

## <a id="enum-pln-sortorder"></a>2. `ENUM-PLN-SortOrder`（检索与收藏列表排序方式）

| 枚举编码 | 标准展示文案 | 排序规则说明 |
| :--- | :--- | :--- |
| `comprehensive` | 综合推荐 | 默认排序；综合偏好契合度与菜谱精选权重 |
| `ing_match_desc` | 食材匹配最多 | 当勾选 `>= 2` 项包含食材且处于 `smart_rank` 时自动激活 |
| `time_asc` | 耗时最短 | 按 `prep_time_min + cook_time_min` 升序排列 |
| `calories_asc` | 热量最低 | 按 `calories_per_serving` 升序排列 |
| `fav_recent` | 最近收藏 | 仅用于收藏夹页，按 `favorited_at` 降序排列 |

---

## <a id="enum-pln-summarycategory"></a>3. `ENUM-PLN-SummaryCategory`（采购汇总货架分组）

| 枚举编码 | 标准展示文案 | 展示顺序 |
| :--- | :--- | :--- |
| `meat_seafood` | 肉禽水产 | 1 |
| `veg_fungi` | 新鲜蔬果菌菇 | 2 |
| `egg_dairy_staple` | 蛋奶豆制品与主食 | 3 |
| `pantry_seasoning` | 常备葱姜蒜与基础调味 | 4（置底展示） |
