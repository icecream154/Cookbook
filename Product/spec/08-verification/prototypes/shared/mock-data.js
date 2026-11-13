// Shared Canonical Domain Mock Dataset & Rule Helpers (Aligned with 02-domain-model & 03-business-rules)
window.WB = (function () {
  const RECIPES = [
    {
      id: 'r01', title: '鲜虾玉米滑蛋三明治', emoji: '🥪', cuisine: '西式料理',
      mealSlots: ['breakfast'], dishRole: 'breakfast_main', roleLabel: '主食早点',
      primaryIng: '虾仁', spiciness: 0, difficulty: '简单', totalTime: 10, baseServings: 1, calories: 340,
      macros: { protein: 24, carbs: 34, fat: 11 }, healthTags: ['高蛋白', '减脂低卡'], video: '02:15',
      ingredients: [
        { id: '虾仁', name: '鲜虾仁', group: '主料', cat: '肉禽水产', amount: 60, unit: 'g', mode: 'weight_vol', avoid: '海鲜水产' },
        { id: '鸡蛋', name: '鸡蛋', group: '主料', cat: '蛋奶豆制品与主食', amount: 2, unit: '个', mode: 'whole_int' },
        { id: '全麦吐司', name: '全麦吐司', group: '主料', cat: '蛋奶豆制品与主食', amount: 2, unit: '片', mode: 'half_piece' }
      ],
      timeline: [{ name: '抓腌烘脆', min: 4, heat: 1, step: 1 }, { name: '小火推滑蛋', min: 4, heat: 1, step: 2 }],
      steps: [
        { title: '虾仁抓腌与吐司烘脆', tpl: '{虾仁} 抓匀黑胡椒煎熟，{全麦吐司} 干烘微脆。', sec: 20, img: '吐司烘脆程度示意' },
        { title: '微火推滑蛋组装', tpl: '打散 {鸡蛋} 入锅最小火推 40 秒半凝固铺面。', sec: 65, timer: 40, img: '流心滑蛋特写', tip: '余温会让鸡蛋继续凝固，八分熟即关火。' }
      ]
    },
    {
      id: 'r02', title: '山药南瓜小米养胃粥', emoji: '🥣', cuisine: '家常菜',
      mealSlots: ['breakfast', 'dinner'], dishRole: 'soup', roleLabel: '汤羹粥品',
      primaryIng: '小米', spiciness: 0, difficulty: '简单', totalTime: 25, baseServings: 2, calories: 185,
      macros: { protein: 5, carbs: 38, fat: 2 }, healthTags: ['温和养胃', '少油少盐'], video: '01:50',
      ingredients: [
        { id: '小米', name: '黄小米', group: '主料', cat: '蛋奶豆制品与主食', amount: 80, unit: 'g', mode: 'weight_vol' },
        { id: '南瓜', name: '贝贝南瓜', group: '主料', cat: '新鲜蔬果菌菇', amount: 120, unit: 'g', mode: 'weight_vol' }
      ],
      timeline: [{ name: '切丁淘米', min: 5, heat: 0, step: 1 }, { name: '文火熬米油', min: 20, heat: 1, step: 1 }],
      steps: [{ title: '沸水下米慢熬出油', tpl: '水沸下 {小米} 与切丁 {南瓜} 小火慢熬 20 分钟。', sec: 35, timer: 1200, img: '浓稠米油状态' }]
    },
    {
      id: 'r03', title: '浓郁番茄肥牛一锅焖饭', emoji: '🍲', cuisine: '家常菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'one_bowl', roleLabel: '一碗端',
      primaryIng: '牛肉', spiciness: 0, difficulty: '简单', totalTime: 25, baseServings: 1, calories: 550,
      macros: { protein: 29, carbs: 62, fat: 19 }, healthTags: ['均衡膳食'], video: '03:05',
      ingredients: [
        { id: '牛肉', name: '原切肥牛卷', group: '主料', cat: '肉禽水产', amount: 120, unit: 'g', mode: 'weight_vol', avoid: '牛羊肉' },
        { id: '番茄', name: '熟透红番茄', group: '主料', cat: '新鲜蔬果菌菇', amount: 1, unit: '个', mode: 'half_piece' },
        { id: '生抽', name: '酿造生抽', group: '调料', cat: '常备葱姜蒜与基础调味', amount: 1.5, unit: '勺', mode: 'spoon_step' }
      ],
      timeline: [{ name: '肥牛飞水', min: 3, heat: 3, step: 1 }, { name: '电饭煲同焖', min: 20, heat: 1, step: 2 }],
      steps: [
        { title: '肥牛飞水去沫', tpl: '沸水下 {牛肉} 烫 15 秒捞出。', sec: 22, img: '肥牛变色捞出' },
        { title: '整颗番茄焖饭拌匀', tpl: '米面摆上十字刀 {番茄}，淋 {生抽} 焖熟拌入肥牛。', sec: 80, timer: 1200, img: '番茄焖饭拌开特写' }
      ]
    },
    {
      id: 'r04', title: '经典慢炖番茄牛腩煲', emoji: '🥘', cuisine: '家常菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'main_meat', roleLabel: '主荤硬菜',
      primaryIng: '牛肉', spiciness: 0, difficulty: '适中', totalTime: 48, baseServings: 3, calories: 385,
      macros: { protein: 32, carbs: 16, fat: 21 }, healthTags: ['高蛋白', '温和养胃'], video: '04:30',
      ingredients: [
        { id: '牛肉', name: '带筋牛腩块', group: '主料', cat: '肉禽水产', amount: 500, unit: 'g', mode: 'weight_vol', avoid: '牛羊肉' },
        { id: '番茄', name: '沙瓤红番茄', group: '主料', cat: '新鲜蔬果菌菇', amount: 3, unit: '个', mode: 'half_piece' },
        { id: '土豆', name: '黄心土豆', group: '辅料', cat: '新鲜蔬果菌菇', amount: 200, unit: 'g', mode: 'weight_vol' },
        { id: '香菜', name: '点缀香菜段', group: '辅料', cat: '新鲜蔬果菌菇', amount: 10, unit: 'g', mode: 'weight_vol', avoid: '香菜', note: '忌香菜直接省去或换葱花' },
        { id: '生抽', name: '酿造生抽', group: '调料', cat: '常备葱姜蒜与基础调味', amount: 3, unit: '勺', mode: 'spoon_step' },
        { id: '食盐', name: '海盐', group: '调料', cat: '常备葱姜蒜与基础调味', amount: 0, unit: '少许', mode: 'unscaled' }
      ],
      timeline: [
        { name: '冷水焯牛腩', min: 6, heat: 3, step: 1 },
        { name: '炒透番茄红沙', min: 5, heat: 2, step: 2 },
        { name: '微沸慢炖软烂', min: 30, heat: 1, step: 3 },
        { name: '下土豆大火收汁', min: 7, heat: 3, step: 3 }
      ],
      steps: [
        { title: '冷水下锅焯透牛腩', tpl: '将 {牛肉} 切块冷水入锅，水沸撇沫后用温水洗净沥干。', sec: 35, img: '冷水焯水与温水冲洗对比', tip: '切忌冲冷水激缩肉质，否则久炖不烂！' },
        { title: '煸炒番茄出红油浓沙', tpl: '下三分之二切丁 {番茄} 中火按压炒成红亮酱糊，倒入牛腩与 {生抽} 翻匀上色。', sec: 112, img: '红亮茄汁挂肉状态' },
        { title: '加热水慢炖后下土豆收浓', tpl: '冲入没过食材的热水小火慢炖 30 分钟，加入 {土豆} 大火收浓，加 {食盐} 与 {香菜} 出锅。', sec: 185, timer: 1800, img: '浓汤挂勺成品特写' }
      ]
    },
    {
      id: 'r05', title: '黄金多汁番茄炒蛋', emoji: '🍅', cuisine: '家常菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'main_meat', roleLabel: '主荤硬菜',
      primaryIng: '番茄', spiciness: 0, difficulty: '简单', totalTime: 12, baseServings: 2, calories: 245,
      macros: { protein: 14, carbs: 12, fat: 15 }, healthTags: ['均衡膳食', '温和养胃'], video: '02:10',
      ingredients: [
        { id: '番茄', name: '红番茄', group: '主料', cat: '新鲜蔬果菌菇', amount: 2, unit: '个', mode: 'half_piece' },
        { id: '鸡蛋', name: '土鸡蛋', group: '主料', cat: '蛋奶豆制品与主食', amount: 3, unit: '个', mode: 'whole_int' }
      ],
      timeline: [{ name: '旺火滑蛋', min: 3, heat: 3, step: 1 }, { name: '炒沙合炒', min: 6, heat: 2, step: 1 }],
      steps: [{ title: '滑炒蓬松云朵蛋裹浓汁', tpl: '热油滑熟 {鸡蛋} 盛出，炒出 {番茄} 浓汁后回锅裹匀。', sec: 45, img: '汤汁裹蛋特写' }]
    },
    {
      id: 'r06', title: '蒜蓉西蓝花清炒虾仁', emoji: '🥦', cuisine: '粤菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'side_veg', roleLabel: '清爽时蔬',
      primaryIng: '西蓝花', spiciness: 0, difficulty: '简单', totalTime: 12, baseServings: 2, calories: 165,
      macros: { protein: 19, carbs: 8, fat: 6 }, healthTags: ['减脂低卡', '高蛋白', '少油少盐'], video: '01:55',
      ingredients: [
        { id: '西蓝花', name: '西蓝花朵', group: '主料', cat: '新鲜蔬果菌菇', amount: 260, unit: 'g', mode: 'weight_vol' },
        { id: '虾仁', name: '开背大虾仁', group: '主料', cat: '肉禽水产', amount: 100, unit: 'g', mode: 'weight_vol', avoid: '海鲜水产' }
      ],
      timeline: [{ name: '焯烫断生', min: 4, heat: 3, step: 1 }, { name: '蒜香快炒', min: 4, heat: 3, step: 1 }],
      steps: [{ title: '焯水60秒大火合炒', tpl: '{西蓝花} 焯烫翠绿，与煎红的 {虾仁} 大火翻匀出锅。', sec: 40, timer: 60, img: '翠绿装盘照' }]
    },
    {
      id: 'r07', title: '炝锅手撕脆包菜', emoji: '🥬', cuisine: '湘菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'side_veg', roleLabel: '清爽时蔬',
      primaryIng: '包菜', spiciness: 1, difficulty: '简单', totalTime: 10, baseServings: 2, calories: 120,
      macros: { protein: 3, carbs: 10, fat: 7 }, healthTags: ['减脂低卡'], video: '01:40',
      ingredients: [{ id: '包菜', name: '牛心包菜叶', group: '主料', cat: '新鲜蔬果菌菇', amount: 300, unit: 'g', mode: 'weight_vol' }],
      timeline: [{ name: '手撕沥水', min: 4, heat: 0, step: 1 }, { name: '猛火烹锅边醋', min: 3, heat: 3, step: 1 }],
      steps: [{ title: '猛火快炒激锅气', tpl: '{包菜} 甩干水分猛火快炒 45 秒即成。', sec: 35, img: '锅边烹醋示意' }]
    },
    {
      id: 'r08', title: '紫菜胡萝卜滑蛋靓汤', emoji: '🍲', cuisine: '家常菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'soup', roleLabel: '汤羹粥品',
      primaryIng: '紫菜', spiciness: 0, difficulty: '简单', totalTime: 8, baseServings: 3, calories: 90,
      macros: { protein: 7, carbs: 5, fat: 4 }, healthTags: ['减脂低卡', '少油少盐', '温和养胃'], video: '01:30',
      ingredients: [
        { id: '紫菜', name: '头水紫菜', group: '主料', cat: '新鲜蔬果菌菇', amount: 10, unit: 'g', mode: 'weight_vol' },
        { id: '鸡蛋', name: '鸡蛋', group: '主料', cat: '蛋奶豆制品与主食', amount: 2, unit: '个', mode: 'whole_int' }
      ],
      timeline: [{ name: '滚水煮紫菜', min: 3, heat: 3, step: 1 }, { name: '微沸淋云朵蛋花', min: 2, heat: 1, step: 1 }],
      steps: [{ title: '关小火淋飘逸蛋花', tpl: '煮沸 {紫菜} 后保持微沸细流淋入 {鸡蛋}。', sec: 42, img: '云朵蛋花手法' }]
    },
    {
      id: 'r09', title: '牛肉末麻辣麻婆豆腐', emoji: '🌶️', cuisine: '川菜',
      mealSlots: ['lunch', 'dinner'], dishRole: 'main_meat', roleLabel: '主荤硬菜',
      primaryIng: '豆腐', spiciness: 2, difficulty: '适中', totalTime: 18, baseServings: 2, calories: 275,
      macros: { protein: 20, carbs: 11, fat: 17 }, healthTags: ['高蛋白', '控糖低GI'], video: '03:15',
      ingredients: [
        { id: '豆腐', name: '嫩南豆腐', group: '主料', cat: '蛋奶豆制品与主食', amount: 350, unit: 'g', mode: 'weight_vol' },
        { id: '牛肉', name: '牛肉末', group: '主料', cat: '肉禽水产', amount: 80, unit: 'g', mode: 'weight_vol', avoid: '牛羊肉' }
      ],
      timeline: [{ name: '盐水定型豆腐', min: 4, heat: 2, step: 1 }, { name: '三次勾芡推勺', min: 8, heat: 3, step: 1 }],
      steps: [{ title: '酥炒牛肉末烧豆腐', tpl: '炒酥 {牛肉} 豆瓣红油，下 {豆腐} 分次勾薄芡。', sec: 88, img: '推勺防碎示范' }]
    }
  ];

  // RULE-COOK-02 Smart Human-Friendly Scaling
  function scale(ing, targetSv, baseSv) {
    if (ing.mode === 'unscaled' || !ing.amount) return ing.unit;
    if (targetSv === baseSv) return ing.amount + ing.unit;
    const raw = (ing.amount * targetSv) / baseSv;
    let v = raw;
    if (ing.mode === 'weight_vol') {
      v = raw < 20 ? Math.max(1, Math.round(raw)) : raw <= 100 ? Math.round(raw / 5) * 5 : Math.round(raw / 10) * 10;
    } else if (ing.mode === 'half_piece') {
      v = Math.max(0.5, Math.round(raw * 2) / 2);
    } else if (ing.mode === 'whole_int') {
      v = Math.max(1, Math.round(raw));
    } else if (ing.mode === 'spoon_step') {
      v = Math.max(0.5, Math.round(raw * 2) / 2);
    }
    return v + ing.unit;
  }

  // RULE-COOK-03 Step Dynamic Placeholder Sync
  function formatStep(tpl, recipe, targetSv) {
    return tpl.replace(/\{([^}]+)\}/g, (_, id) => {
      const f = recipe.ingredients.find((x) => x.id === id);
      if (!f) return id;
      return `<span style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;padding:1px 6px;border-radius:4px;font-weight:700;">${f.name} ${scale(f, targetSv, recipe.baseServings)}</span>`;
    });
  }

  function renderNav(activeKey) {
    const items = [
      { k: 'plan', ico: '🍱', l: '今日菜谱', href: '../pages/daily-plan.html' },
      { k: 'srch', ico: '🔍', l: '找菜谱', href: '../pages/recipe-discovery.html' },
      { k: 'fav', ico: '❤️', l: '收藏夹', href: '../pages/favorites.html' },
      { k: 'prof', ico: '👤', l: '我的', href: '../pages/user-profile.html' }
    ];
    return `<nav class="shell-nav">${items
      .map((i) => `<a class="nav-tab ${activeKey === i.k ? 'active' : ''}" href="${i.href}"><span>${i.ico}</span><span>${i.l}</span></a>`)
      .join('')}</nav>`;
  }

  function renderTopBar(cfg) {
    // cfg: { protoId, specHref, specLabel, states: [{id, label}], activeState, onState, vp, onVp }
    return `
      <div class="wb-group">
        <a class="wb-btn" href="../index.html">← 原型总控台</a>
        <span class="wb-tag">${cfg.protoId}</span>
        <a class="wb-btn wb-link" href="${cfg.specHref}">📄 规格书: ${cfg.specLabel}</a>
      </div>
      <div class="wb-group">
        <span class="wb-label">状态预设枚举:</span>
        ${cfg.states
          .map((s) => `<button class="wb-btn ${cfg.activeState === s.id ? 'active' : ''}" onclick="${cfg.onState}('${s.id}')">${s.label}</button>`)
          .join('')}
      </div>
      <div class="wb-group">
        <span class="wb-label">视口壳:</span>
        ${[
          { k: 'mobile', l: '📱 Mobile' },
          { k: 'tablet', l: '📟 Tablet' },
          { k: 'desktop', l: '🖥 Desktop' }
        ]
          .map((v) => `<button class="wb-btn ${cfg.vp === v.k ? 'active' : ''}" onclick="${cfg.onVp}('${v.k}')">${v.l}</button>`)
          .join('')}
      </div>
    `;
  }

  return { RECIPES, scale, formatStep, renderNav, renderTopBar };
})();
