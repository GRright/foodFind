"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      weekDays: [],
      currentDateIndex: 0,
      weekDisplay: "",
      weeklyMenu: [],
      userCount: 2,
      mealScrollHeight: "calc(100vh - 320rpx)"
    };
  },
  computed: {
    currentMealSections() {
      const types = [
        { type: "breakfast", name: "早餐", icon: "🌅" },
        { type: "lunch", name: "午餐", icon: "☀️" },
        { type: "dinner", name: "晚餐", icon: "🌙" }
      ];
      const currentDay = this.weekDays[this.currentDateIndex];
      if (!currentDay)
        return types.map((t) => ({ ...t, menus: [] }));
      const dayMenus = this.weeklyMenu.filter((m) => m.date === currentDay.date);
      return types.map((section) => ({
        ...section,
        menus: dayMenus.filter((m) => m.meal_type === section.type)
      }));
    }
  },
  onLoad() {
    this.initWeekDates(/* @__PURE__ */ new Date());
    this.loadWeeklyMenu();
  },
  methods: {
    formatLocalDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    initWeekDates(date) {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const days = [];
      const labels = ["一", "二", "三", "四", "五", "六", "日"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push({
          date: this.formatLocalDate(d),
          weekday: labels[i],
          day: d.getDate()
        });
      }
      const today = this.formatLocalDate(/* @__PURE__ */ new Date());
      const todayIdx = days.findIndex((d) => d.date === today);
      const year = start.getFullYear();
      const month = start.getMonth() + 1;
      this.weekDays = days;
      this.currentDateIndex = todayIdx >= 0 ? todayIdx : 0;
      this.weekDisplay = `${year}年${month}月`;
    },
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
    getRandomRecipes(recipes, count) {
      return [...recipes].sort(() => Math.random() - 0.5).slice(0, count);
    },
    getBalancedRecipes(recipes, count) {
      const meat = recipes.filter((r) => r.type === "meat" || r.type === "mixed");
      const veg = recipes.filter((r) => r.type === "vegetarian");
      const meatCount = Math.ceil(count / 2);
      const vegCount = Math.floor(count / 2);
      return [
        ...this.getRandomRecipes(meat, meatCount),
        ...this.getRandomRecipes(veg, vegCount)
      ].sort(() => Math.random() - 0.5);
    },
    loadWeeklyMenu() {
      const menu = [];
      this.formatLocalDate(/* @__PURE__ */ new Date());
      const recipeCount = this.getRecipeCount();
      this.weekDays.forEach((day) => {
        let breakfast, lunch, dinner;
        breakfast = this.getRandomRecipes(common_vendor.ALL_RECIPES.breakfast, recipeCount);
        lunch = this.getBalancedRecipes(common_vendor.ALL_RECIPES.lunch, recipeCount);
        dinner = this.getBalancedRecipes(common_vendor.ALL_RECIPES.dinner, recipeCount);
        [
          { type: "breakfast", recipes: breakfast },
          { type: "lunch", recipes: lunch },
          { type: "dinner", recipes: dinner }
        ].forEach((meal) => {
          meal.recipes.forEach((recipe, idx) => {
            menu.push({
              id: `${day.date}-${meal.type}-${idx}`,
              date: day.date,
              meal_type: meal.type,
              recipe_id: recipe.id,
              recipe_name: recipe.name,
              cuisine_type: recipe.cuisine_type,
              nutrition: recipe.nutrition,
              is_eating_out: false,
              recipe_index: idx
            });
          });
        });
      });
      this.weeklyMenu = menu;
    },
    selectDate(index) {
      this.currentDateIndex = index;
    },
    prevWeek() {
      const d = new Date(this.weekDays[0].date);
      d.setDate(d.getDate() - 7);
      this.initWeekDates(d);
      this.loadWeeklyMenu();
    },
    nextWeek() {
      const d = new Date(this.weekDays[0].date);
      d.setDate(d.getDate() + 7);
      this.initWeekDates(d);
      this.loadWeeklyMenu();
    },
    getRecipeEmoji(recipeId) {
      const all = [...common_vendor.ALL_RECIPES.breakfast, ...common_vendor.ALL_RECIPES.lunch, ...common_vendor.ALL_RECIPES.dinner];
      const found = all.find((r) => r.id === recipeId);
      return found ? found.image || "🍽️" : "🍽️";
    },
    viewRecipe(menu) {
      common_vendor.index.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${menu.recipe_id}` });
    },
    generateWeekMenu() {
      common_vendor.index.showLoading({ title: "生成中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "菜单已生成", icon: "success" });
        this.loadWeeklyMenu();
      }, 800);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.prevWeek && $options.prevWeek(...args)),
    b: common_vendor.t($data.weekDisplay),
    c: common_vendor.o((...args) => $options.nextWeek && $options.nextWeek(...args)),
    d: common_vendor.f($data.weekDays, (day, index, i0) => {
      return {
        a: common_vendor.t(day.weekday),
        b: common_vendor.t(day.day),
        c: $data.currentDateIndex === index ? 1 : "",
        d: day.date,
        e: common_vendor.o(($event) => $options.selectDate(index), day.date)
      };
    }),
    e: common_vendor.f($options.currentMealSections, (section, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(section.icon),
        b: common_vendor.t(section.name),
        c: section.menus && section.menus.length
      }, section.menus && section.menus.length ? {
        d: common_vendor.t(section.menus.length)
      } : {}, {
        e: section.menus && section.menus.length > 0
      }, section.menus && section.menus.length > 0 ? {
        f: common_vendor.f(section.menus, (menu, k1, i1) => {
          return common_vendor.e({
            a: common_vendor.t($options.getRecipeEmoji(menu.recipe_id)),
            b: common_vendor.t(menu.recipe_name),
            c: common_vendor.t(menu.cuisine_type),
            d: menu.nutrition
          }, menu.nutrition ? {
            e: common_vendor.t(menu.nutrition.calories)
          } : {}, {
            f: menu.id,
            g: common_vendor.o(($event) => $options.viewRecipe(menu), menu.id)
          });
        })
      } : {}, {
        g: section.type
      });
    }),
    f: common_vendor.o((...args) => $options.generateWeekMenu && $options.generateWeekMenu(...args)),
    g: $data.mealScrollHeight
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5f1b9080"]]);
wx.createPage(MiniProgramPage);
