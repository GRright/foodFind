"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const CATEGORY_MAP = {
  vegetable: { name: "蔬菜", icon: "🥬" },
  meat: { name: "肉蛋禽", icon: "🥩" },
  seasoning: { name: "调料", icon: "🧂" },
  staple: { name: "主食", icon: "🍚" },
  other: { name: "其他", icon: "📦" }
};
const CATEGORY_KEYWORDS = {
  vegetable: ["菜", "豆", "茄", "瓜", "菇", "笋", "藕", "椒", "蒜", "葱", "姜", "花", "叶", "生菜", "萝卜", "番茄", "西兰", "四季"],
  meat: ["肉", "鸡", "鸭", "鱼", "虾", "蛋", "排", "里脊", "牛肉", "猪肉", "鸡胸", "鸡翅", "鸭", "鲈", "皮蛋"],
  seasoning: ["油", "盐", "酱", "醋", "糖", "料酒", "蚝油", "淀粉", "花椒", "八角", "桂皮", "豆瓣", "豉", "芝麻", "辣椒", "泡椒", "甜面", "豆鼓", "冰糖"],
  staple: ["米", "面", "粉", "饼", "油条", "馒头", "粮", "麦", "豆", "黄豆"]
};
const _sfc_main = {
  data() {
    return {
      items: [],
      pageEnter: true,
      newItemName: "",
      newItemAmount: "",
      config: {
        mode: "today",
        customDays: 3
      },
      mealConfig: {
        weekday: ["dinner"],
        weekend: ["breakfast", "lunch", "dinner"]
      },
      isPredefinedMode: true,
      _cachedIngredients: null,
      _cacheKey: ""
    };
  },
  computed: {
    todayStr() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    },
    totalItems() {
      return this.items.length;
    },
    completedCount() {
      return this.items.filter((i) => i.checked).length;
    },
    categorizedItems() {
      const cats = {};
      this.items.forEach((item) => {
        const cat = item.category || "other";
        if (!cats[cat]) {
          cats[cat] = { category: cat, ...CATEGORY_MAP[cat], items: [] };
        }
        cats[cat].items.push(item);
      });
      const order = ["vegetable", "meat", "staple", "seasoning", "other"];
      return order.filter((k) => cats[k]).map((k) => cats[k]);
    },
    mealConfigSummary() {
      const weekdayText = this.mealConfig.weekday.length === 3 ? "三餐" : this.mealConfig.weekday.length === 2 ? "两餐" : "一餐";
      const weekendText = this.mealConfig.weekend.length === 3 ? "三餐" : this.mealConfig.weekend.length === 2 ? "两餐" : "一餐";
      return `工作日${weekdayText} · 周末${weekendText}`;
    }
  },
  onLoad() {
    this.loadConfig();
    this.loadShoppingList();
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
    if (this.items.length === 0) {
      setTimeout(() => {
        this.autoGenerateIfEmpty();
      }, 500);
    }
  },
  methods: {
    loadConfig() {
      const prefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs");
      if (prefs) {
        if (prefs.shoppingConfig) {
          this.config = { ...this.config, ...prefs.shoppingConfig };
        }
        if (prefs.mealConfig) {
          this.mealConfig = { ...this.mealConfig, ...prefs.mealConfig };
        }
      }
      this.isPredefinedMode = ["today", "weekend", "week"].includes(this.config.mode);
    },
    saveConfig() {
      const prefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs") || {};
      prefs.shoppingConfig = this.config;
      prefs.mealConfig = this.mealConfig;
      common_vendor.index.setStorageSync("foodfind_detailed_prefs", prefs);
    },
    loadShoppingList() {
      const saved = common_vendor.index.getStorageSync("foodfind_shopping_list");
      const cacheKey = this.getCacheKey();
      if (saved && saved.cacheKey === cacheKey) {
        this.items = saved.items || [];
        return;
      }
      this.items = [];
    },
    saveShoppingList() {
      common_vendor.index.setStorageSync("foodfind_shopping_list", {
        cacheKey: this.getCacheKey(),
        items: this.items
      });
    },
    getCacheKey() {
      const mode = this.config.mode;
      const days = this.config.customDays;
      const weekdayMeals = this.mealConfig.weekday.slice().sort().join(",");
      const weekendMeals = this.mealConfig.weekend.slice().sort().join(",");
      return `${mode}-${days}-${weekdayMeals}-${weekendMeals}`;
    },
    getTodayStr() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    getDateStr(offset) {
      const d = new Date(Date.now() + offset * 864e5);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    getDayOfWeek(offset) {
      const d = new Date(Date.now() + offset * 864e5);
      return d.getDay();
    },
    classifyIngredient(name) {
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((k) => name.includes(k))) {
          return cat;
        }
      }
      return "other";
    },
    togglePredefinedMode() {
      this.isPredefinedMode = !this.isPredefinedMode;
      this.config.mode = this.isPredefinedMode ? "today" : "custom";
      this.config.customDays = 3;
      this.saveConfig();
      this.loadShoppingList();
      setTimeout(() => {
        this.autoGenerateIfEmpty();
      }, 100);
    },
    setPreset(mode) {
      this.config.mode = mode;
      this.saveConfig();
      this.loadShoppingList();
      setTimeout(() => {
        this.autoGenerateIfEmpty();
      }, 100);
    },
    onCustomDaysChange(e) {
      this.config.customDays = parseInt(e.detail.value);
      this.saveConfig();
      this.loadShoppingList();
      setTimeout(() => {
        this.autoGenerateIfEmpty();
      }, 100);
    },
    goToMealConfig() {
      common_vendor.index.navigateTo({ url: "/pages/mealConfig/mealConfig" });
    },
    autoGenerateIfEmpty() {
      if (this.items.length === 0) {
        this.generateFromMenu();
      }
    },
    generateFromMenu() {
      const cacheKey = this.getCacheKey();
      if (this._cacheKey === cacheKey && this._cachedIngredients) {
        this.applyCachedIngredients();
        return;
      }
      const weeklyData = common_vendor.index.getStorageSync("foodfind_weekly");
      const dailyMeals = common_vendor.index.getStorageSync("foodfind_meals");
      if (!weeklyData && !dailyMeals) {
        common_vendor.index.showToast({ title: "请先生成菜单", icon: "none" });
        return;
      }
      const allRecipes = [...utils_constants.ALL_RECIPES.breakfast, ...utils_constants.ALL_RECIPES.lunch, ...utils_constants.ALL_RECIPES.dinner];
      const ingredientMap = /* @__PURE__ */ new Map();
      const daysToProcess = this.getDaysToProcess();
      for (let i = 0; i < daysToProcess.length; i++) {
        const { dateStr, isWeekend, offset } = daysToProcess[i];
        let dayMeals = null;
        if (weeklyData && weeklyData[dateStr]) {
          dayMeals = weeklyData[dateStr];
        } else if (offset === 0 && dailyMeals) {
          dayMeals = dailyMeals;
        }
        if (dayMeals) {
          const mealTypes = isWeekend ? this.mealConfig.weekend : this.mealConfig.weekday;
          mealTypes.forEach((mealType) => {
            const recipes = dayMeals[mealType] || [];
            recipes.forEach((recipe) => {
              const fullRecipe = allRecipes.find((r) => r.id === recipe.id);
              if (fullRecipe && fullRecipe.ingredients) {
                fullRecipe.ingredients.forEach((ing) => {
                  const key = ing.name;
                  if (ingredientMap.has(key)) {
                    const existing = ingredientMap.get(key);
                    existing.amount = this.mergeAmount(existing.amount, ing.amount);
                  } else {
                    ingredientMap.set(key, {
                      name: ing.name,
                      amount: ing.amount,
                      category: this.classifyIngredient(ing.name)
                    });
                  }
                });
              }
            });
          });
        }
      }
      const newItems = Array.from(ingredientMap.values()).map((ing) => ({
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        name: ing.name,
        amount: ing.amount,
        category: ing.category,
        checked: false
      }));
      if (newItems.length === 0) {
        common_vendor.index.showToast({ title: "未能提取到食材", icon: "none" });
        return;
      }
      this._cachedIngredients = newItems;
      this._cacheKey = cacheKey;
      this.items = newItems;
      this.saveShoppingList();
      common_vendor.index.showToast({ title: `已添加${newItems.length}项食材`, icon: "success" });
    },
    getDaysToProcess() {
      const days = [];
      if (this.config.mode === "today") {
        const dateStr = this.getDateStr(0);
        const dayOfWeek = this.getDayOfWeek(0);
        days.push({
          dateStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          offset: 0
        });
      } else if (this.config.mode === "weekend") {
        const today = /* @__PURE__ */ new Date();
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
        const daysUntilSunday = (0 - dayOfWeek + 7) % 7;
        const saturdayOffset = daysUntilSaturday === 0 ? 7 : daysUntilSaturday;
        const sundayOffset = daysUntilSunday === 0 ? 7 : daysUntilSunday;
        days.push({
          dateStr: this.getDateStr(saturdayOffset),
          isWeekend: true,
          offset: saturdayOffset
        });
        days.push({
          dateStr: this.getDateStr(sundayOffset),
          isWeekend: true,
          offset: sundayOffset
        });
      } else if (this.config.mode === "week") {
        for (let offset = 0; offset < 7; offset++) {
          const dateStr = this.getDateStr(offset);
          const dayOfWeek = this.getDayOfWeek(offset);
          days.push({
            dateStr,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            offset
          });
        }
      } else if (this.config.mode === "custom") {
        for (let offset = 0; offset < this.config.customDays; offset++) {
          const dateStr = this.getDateStr(offset);
          const dayOfWeek = this.getDayOfWeek(offset);
          days.push({
            dateStr,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            offset
          });
        }
      }
      return days;
    },
    applyCachedIngredients() {
      const newItems = this._cachedIngredients.map((ing) => ({
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        name: ing.name,
        amount: ing.amount,
        category: ing.category,
        checked: false
      }));
      this.items = newItems;
      this.saveShoppingList();
      common_vendor.index.showToast({ title: `已添加${newItems.length}项食材`, icon: "success" });
    },
    mergeAmount(amount1, amount2) {
      if (!amount1 || !amount2)
        return amount1 || amount2;
      const num1 = parseFloat(amount1);
      const num2 = parseFloat(amount2);
      if (!isNaN(num1) && !isNaN(num2)) {
        const unit1 = amount1.replace(/[\d.]/g, "");
        const unit2 = amount2.replace(/[\d.]/g, "");
        if (unit1 === unit2) {
          return num1 + num2 + unit1;
        }
      }
      return amount1 + " + " + amount2;
    },
    toggleItem(item) {
      item.checked = !item.checked;
      this.saveShoppingList();
    },
    deleteItem(id) {
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx > -1) {
        this.items.splice(idx, 1);
        this.saveShoppingList();
      }
    },
    addItem() {
      const name = this.newItemName.trim();
      if (!name)
        return;
      const item = {
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        name,
        amount: this.newItemAmount.trim(),
        category: this.classifyIngredient(name),
        checked: false
      };
      this.items.push(item);
      this.newItemName = "";
      this.newItemAmount = "";
      this.saveShoppingList();
      common_vendor.index.showToast({ title: "已添加", icon: "success" });
    },
    clearCompleted() {
      common_vendor.index.showModal({
        title: "确认清空",
        content: `确定删除已购买的${this.completedCount}项食材吗？`,
        success: (res) => {
          if (res.confirm) {
            this.items = this.items.filter((i) => !i.checked);
            this.saveShoppingList();
            common_vendor.index.showToast({ title: "已清空", icon: "success" });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.todayStr),
    b: common_vendor.t($options.totalItems),
    c: $data.isPredefinedMode ? 1 : "",
    d: common_vendor.o((...args) => $options.togglePredefinedMode && $options.togglePredefinedMode(...args)),
    e: !$data.isPredefinedMode ? 1 : "",
    f: common_vendor.o((...args) => $options.togglePredefinedMode && $options.togglePredefinedMode(...args)),
    g: $data.isPredefinedMode
  }, $data.isPredefinedMode ? {
    h: $data.config.mode === "today" ? 1 : "",
    i: common_vendor.o(($event) => $options.setPreset("today")),
    j: $data.config.mode === "weekend" ? 1 : "",
    k: common_vendor.o(($event) => $options.setPreset("weekend")),
    l: $data.config.mode === "week" ? 1 : "",
    m: common_vendor.o(($event) => $options.setPreset("week"))
  } : {
    n: ($data.config.customDays - 1) / 13 * 100 + "%",
    o: $data.config.customDays,
    p: common_vendor.o((...args) => $options.onCustomDaysChange && $options.onCustomDaysChange(...args)),
    q: common_vendor.t($data.config.customDays)
  }, {
    r: common_vendor.t($options.mealConfigSummary),
    s: common_vendor.o((...args) => $options.goToMealConfig && $options.goToMealConfig(...args)),
    t: common_vendor.o((...args) => $options.generateFromMenu && $options.generateFromMenu(...args)),
    v: $options.completedCount > 0
  }, $options.completedCount > 0 ? {
    w: common_vendor.o((...args) => $options.clearCompleted && $options.clearCompleted(...args))
  } : {}, {
    x: $options.categorizedItems.length > 0
  }, $options.categorizedItems.length > 0 ? {
    y: common_vendor.f($options.categorizedItems, (cat, ci, i0) => {
      return {
        a: common_vendor.t(cat.icon),
        b: common_vendor.t(cat.name),
        c: common_vendor.t(cat.items.filter((i) => !i.checked).length),
        d: common_vendor.t(cat.items.length),
        e: common_vendor.f(cat.items, (item, ii, i1) => {
          return common_vendor.e({
            a: item.checked
          }, item.checked ? {} : {}, {
            b: item.checked ? 1 : "",
            c: common_vendor.t(item.name),
            d: item.checked ? 1 : "",
            e: item.amount
          }, item.amount ? {
            f: common_vendor.t(item.amount)
          } : {}, {
            g: common_vendor.o(($event) => $options.deleteItem(item.id), item.id),
            h: item.checked ? 1 : "",
            i: item.id,
            j: common_vendor.o(($event) => $options.toggleItem(item), item.id),
            k: ci * 80 + ii * 40 + "ms"
          });
        }),
        f: cat.category,
        g: ci * 80 + "ms"
      };
    })
  } : {}, {
    z: common_vendor.o((...args) => $options.addItem && $options.addItem(...args)),
    A: $data.newItemName,
    B: common_vendor.o(($event) => $data.newItemName = $event.detail.value),
    C: common_vendor.o((...args) => $options.addItem && $options.addItem(...args)),
    D: $data.newItemAmount,
    E: common_vendor.o(($event) => $data.newItemAmount = $event.detail.value),
    F: !$data.newItemName.trim() ? 1 : "",
    G: common_vendor.o((...args) => $options.addItem && $options.addItem(...args)),
    H: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b8f4481c"]]);
wx.createPage(MiniProgramPage);
