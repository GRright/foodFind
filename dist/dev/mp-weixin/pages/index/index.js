"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return { userCount: 2, scrollHeight: "calc(100vh - 420rpx)", dailyMeals: { breakfast: [], lunch: [], dinner: [] } };
  },
  computed: {
    currentDate() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getMonth() + 1}月${d.getDate()}日 ${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()]}`;
    },
    gridRows() {
      return [
        { title: "早餐", icon: "🌅", recipes: this.dailyMeals.breakfast },
        { title: "午餐", icon: "☀️", recipes: this.dailyMeals.lunch },
        { title: "晚餐", icon: "🌙", recipes: this.dailyMeals.dinner }
      ].map((m) => ({
        ...m,
        cal: m.recipes.reduce((s, r) => s + r.nutrition.calories * this.userCount, 0)
      }));
    },
    allCells() {
      let cells = [];
      this.gridRows.forEach((row) => {
        cells = [...cells, ...row.recipes];
      });
      return cells;
    },
    totalCalories() {
      return Math.round(this.allCells.reduce((s, r) => s + r.nutrition.calories * this.userCount, 0));
    },
    totalProtein() {
      return Math.round(this.allCells.reduce((s, r) => s + (r.nutrition.protein || 0) * this.userCount, 0));
    },
    totalFat() {
      return Math.round(this.allCells.reduce((s, r) => s + (r.nutrition.fat || 0) * this.userCount, 0));
    },
    totalCarbs() {
      return Math.round(this.allCells.reduce((s, r) => s + (r.nutrition.carbs || 0) * this.userCount, 0));
    },
    calPercent() {
      return Math.min(100, Math.round(this.totalCalories / 2e3 * 100));
    }
  },
  onLoad() {
    this.generateDailyRecipes();
  },
  methods: {
    getRecipeCount() {
      const c = this.userCount;
      if (c === 1)
        return 2;
      if (c === 2)
        return 3;
      if (c <= 4)
        return 4;
      return 5;
    },
    shuffle(arr, n) {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    },
    balanced(recipes, n) {
      const m = recipes.filter((r) => r.type === "meat" || r.type === "mixed");
      const v = recipes.filter((r) => r.type === "vegetarian");
      const mc = Math.ceil(n / 2), vc = n - mc;
      return [...this.shuffle(m, mc), ...this.shuffle(v, vc)].sort(() => Math.random() - 0.5);
    },
    generateDailyRecipes() {
      const n = this.getRecipeCount();
      this.dailyMeals = {
        breakfast: this.shuffle(common_vendor.ALL_RECIPES.breakfast, n),
        lunch: this.balanced(common_vendor.ALL_RECIPES.lunch, n),
        dinner: this.balanced(common_vendor.ALL_RECIPES.dinner, n)
      };
      const app = getApp();
      if (app == null ? void 0 : app.globalData)
        app.globalData.dailyMeals = this.dailyMeals;
    },
    viewRecipe(r) {
      common_vendor.index.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${r.id}` });
    },
    goToMenu() {
      common_vendor.index.switchTab({ url: "/pages/menu/menu" });
    },
    goToMovies() {
      common_vendor.index.switchTab({ url: "/pages/movies/movies" });
    },
    refreshMeals() {
      common_vendor.index.showLoading({ title: "生成中..." });
      setTimeout(() => {
        this.generateDailyRecipes();
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "已更新", icon: "success" });
      }, 500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.currentDate),
    b: common_vendor.t($options.totalCalories),
    c: common_vendor.t($options.totalCalories),
    d: $options.calPercent + "%",
    e: common_vendor.t($options.totalProtein),
    f: common_vendor.t($options.totalFat),
    g: common_vendor.t($options.totalCarbs),
    h: common_vendor.f($options.gridRows, (meal, mi, i0) => {
      return {
        a: common_vendor.t(meal.icon),
        b: common_vendor.t(meal.title),
        c: common_vendor.t(meal.cal),
        d: common_vendor.f(meal.recipes, (food, fi, i1) => {
          return {
            a: common_vendor.t(food.image || "🍽️"),
            b: common_vendor.t(food.name),
            c: common_vendor.t(food.nutrition.calories * $data.userCount),
            d: food.id,
            e: common_vendor.o(($event) => $options.viewRecipe(food), food.id)
          };
        }),
        e: mi
      };
    }),
    i: $data.scrollHeight,
    j: common_vendor.o((...args) => $options.goToMenu && $options.goToMenu(...args)),
    k: common_vendor.o((...args) => $options.goToMovies && $options.goToMovies(...args)),
    l: common_vendor.o((...args) => $options.refreshMeals && $options.refreshMeals(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
