# 05. 公共业务组件与全局交互模式总索引

## 1. 公共层准入标准

凡在 **`>= 2` 个独立页面/功能空间**中重复出现的复合业务 UI 单元或跨页面交互状态机，一律提升至本目录统一建模。下游 `06-pages/` 各单页规格书通过 ID 引用，**严禁在单页文档中重复抄写组件字段构成或登录拦截/撤销提示逻辑**。

---

## 2. 注册清单

### 2.1 跨页复用业务组件（[shared-components.md](./shared-components.md)）
- [COMP-RecipeCard](./shared-components.md#comp-recipecard)：菜谱摘要卡片（含今日推荐变体、复合检索变体、收藏夹变体）
- [COMP-ServingsStepper](./shared-components.md#comp-servingsstepper)：目标用餐人数步进与胶囊控件
- [COMP-SearchBar](./shared-components.md#comp-searchbar)：支持历史/热词/标准食材同义联想的搜索输入框

### 2.2 全局通用交互模式（[interaction-patterns.md](./interaction-patterns.md)）
- [PAT-AuthResume](./interaction-patterns.md#pat-authresume)：未登录触发受限操作的拦截与自动动作接续模式
- [PAT-UndoSnackbar](./interaction-patterns.md#pat-undosnackbar)：破坏性列表移除操作的 4 秒底部撤销保护模式
- [PAT-ViewStates](./interaction-patterns.md#pat-viewstates)：全局视图四态契约（骨架加载态 / 引导空数据态 / 弱网异常降级态 / 轻提示 Toast）
