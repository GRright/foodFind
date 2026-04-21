"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_family = require("../../utils/family.js");
const _sfc_main = {
  data() {
    return {
      userCount: 2,
      scrollHeight: "calc(100vh - 580rpx)",
      currentMonday: null,
      selectedDate: null,
      weeklyData: {},
      sparkData: [],
      pairStats: null,
      pageEnter: true
    };
  },
  computed: {
    calMonth() {
      if (!this.currentMonday)
        return "";
      const m = this.currentMonday.getMonth() + 1;
      const y = this.currentMonday.getFullYear();
      return `${y}年${m}月`;
    },
    weekDays() {
      if (!this.currentMonday)
        return [];
      const days = [];
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const weekNames = ["一", "二", "三", "四", "五", "六", "日"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(this.currentMonday);
        d.setDate(d.getDate() + i);
        const ds = this.dateToStr(d);
        const sparkRecord = this.sparkData.find((s) => s.date === ds);
        const sparkLevel = sparkRecord ? sparkRecord.sparkLevel : 0;
        days.push({
          date: d,
          day: d.getDate(),
          weekName: weekNames[i],
          isToday: d.getTime() === today.getTime(),
          isActive: this.selectedDate ? ds === this.dateToStr(this.selectedDate) : false,
          hasData: !!this.weeklyData[ds],
          dateStr: ds,
          sparkLevel
        });
      }
      return days;
    },
    selectedDateStr() {
      return this.selectedDate ? this.dateToStr(this.selectedDate) : "";
    },
    selectedDayMeals() {
      if (!this.selectedDateStr)
        return null;
      if (this.weeklyData[this.selectedDateStr])
        return this.weeklyData[this.selectedDateStr];
      const todayStr = this.getTodayStr();
      if (this.selectedDateStr === todayStr) {
        const homeMeals = common_vendor.index.getStorageSync("foodfind_meals");
        if (homeMeals)
          return homeMeals;
      }
      return null;
    },
    selectedDayLabel() {
      if (!this.selectedDate)
        return "";
      const w = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][this.selectedDate.getDay()];
      return `${this.selectedDate.getMonth() + 1}月${this.selectedDate.getDate()}日 ${w}`;
    },
    mealSections() {
      if (!this.selectedDayMeals)
        return [];
      return [
        { title: "早餐", icon: "☀", recipes: this.selectedDayMeals.breakfast || [] },
        { title: "午餐", icon: "🌞", recipes: this.selectedDayMeals.lunch || [] },
        { title: "晚餐", icon: "🌙", recipes: this.selectedDayMeals.dinner || [] }
      ].map((m) => ({
        ...m,
        cal: m.recipes.reduce((s, r) => {
          var _a;
          return s + (((_a = r.nutrition) == null ? void 0 : _a.calories) || 0) * this.userCount;
        }, 0)
      }));
    },
    selectedDayCal() {
      if (!this.selectedDayMeals)
        return 0;
      let c = 0;
      ["breakfast", "lunch", "dinner"].forEach((k) => {
        (this.selectedDayMeals[k] || []).forEach((r) => {
          var _a;
          c += (((_a = r.nutrition) == null ? void 0 : _a.calories) || 0) * this.userCount;
        });
      });
      return Math.round(c);
    },
    weekNutriSummary() {
      let totalC = 0, totalP = 0, totalF = 0, totalCb = 0, days = 0;
      Object.keys(this.weeklyData).forEach((ds) => {
        const meals = this.weeklyData[ds];
        if (!meals)
          return;
        days++;
        ["breakfast", "lunch", "dinner"].forEach((k) => {
          (meals[k] || []).forEach((r) => {
            var _a, _b, _c, _d;
            totalC += ((_a = r.nutrition) == null ? void 0 : _a.calories) || 0;
            totalP += ((_b = r.nutrition) == null ? void 0 : _b.protein) || 0;
            totalF += ((_c = r.nutrition) == null ? void 0 : _c.fat) || 0;
            totalCb += ((_d = r.nutrition) == null ? void 0 : _d.carbs) || 0;
          });
        });
      });
      if (days === 0)
        return "";
      return `日均${Math.round(totalC / days * this.userCount)}kcal · 蛋白${Math.round(totalP / days)}g`;
    }
  },
  onLoad() {
    this.initCalendar();
    this.loadWeeklyCache();
    this.loadUserPrefs();
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
    if (this.currentMonday) {
      const cached = common_vendor.index.getStorageSync("foodfind_weekly");
      if (cached)
        this.weeklyData = cached;
    }
  },
  methods: {
    getTodayStr() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    goToShoppingList() {
      common_vendor.index.navigateTo({ url: "/pages/shoppingList/shoppingList" });
    },
    loadUserPrefs() {
      const prefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs");
      if (prefs && prefs.userCount)
        this.userCount = prefs.userCount;
      else {
        const uc = common_vendor.index.getStorageSync("foodfind_user_count");
        if (uc)
          this.userCount = uc;
      }
    },
    initCalendar() {
      const now = /* @__PURE__ */ new Date();
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      this.currentMonday = new Date(now);
      this.currentMonday.setDate(now.getDate() + diff);
      this.currentMonday.setHours(0, 0, 0, 0);
      this.selectedDate = new Date(now);
      this.selectedDate.setHours(0, 0, 0, 0);
    },
    dateToStr(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    prevWeek() {
      const d = new Date(this.currentMonday);
      d.setDate(d.getDate() - 7);
      this.currentMonday = d;
      this.selectedDate = new Date(d);
    },
    nextWeek() {
      const d = new Date(this.currentMonday);
      d.setDate(d.getDate() + 7);
      this.currentMonday = d;
      this.selectedDate = new Date(d);
    },
    selectDay(d) {
      this.selectedDate = new Date(d.date);
    },
    loadWeeklyCache() {
      const cached = common_vendor.index.getStorageSync("foodfind_weekly");
      if (cached)
        this.weeklyData = cached;
    },
    loadSparkData() {
      return;
    },
    loadPairStats() {
      return;
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
    shuffle(arr, n) {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    },
    balanced(recipes, n) {
      const meat = recipes.filter((r) => r.type === "meat" || r.type === "mixed");
      const veg = recipes.filter((r) => r.type === "vegetarian");
      const mc = Math.ceil(n * 0.55), vc = n - mc;
      return [...this.shuffle(meat, mc), ...this.shuffle(veg, vc)].sort(() => Math.random() - 0.5);
    },
    nutritionBalanced(dayIndex, allDaysMeals) {
      const usedRecipes = /* @__PURE__ */ new Set();
      allDaysMeals.forEach((dm) => {
        ["breakfast", "lunch", "dinner"].forEach((k) => {
          (dm[k] || []).forEach((r) => usedRecipes.add(r.id));
        });
      });
      const familyTags = utils_family.getFamilyHealthTags();
      const userPrefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs") || {};
      const allHealthTags = [.../* @__PURE__ */ new Set([...familyTags, ...userPrefs.healthTags || []])];
      let availableBreakfast = utils_constants.ALL_RECIPES.breakfast.filter((r) => !usedRecipes.has(r.id));
      let availableLunch = utils_constants.ALL_RECIPES.lunch.filter((r) => !usedRecipes.has(r.id));
      let availableDinner = utils_constants.ALL_RECIPES.dinner.filter((r) => !usedRecipes.has(r.id));
      availableBreakfast = utils_family.filterRecipesByHealthTags(availableBreakfast, allHealthTags);
      availableLunch = utils_family.filterRecipesByHealthTags(availableLunch, allHealthTags);
      availableDinner = utils_family.filterRecipesByHealthTags(availableDinner, allHealthTags);
      const n = this.getRecipeCount();
      let breakfast = availableBreakfast.length >= n ? this.shuffle(availableBreakfast, n) : this.shuffle(utils_constants.ALL_RECIPES.breakfast, n);
      let lunch = availableLunch.length >= n ? this.balanced(availableLunch, n) : this.balanced(utils_constants.ALL_RECIPES.lunch, n);
      let dinner = availableDinner.length >= n ? this.balanced(availableDinner, n) : this.balanced(utils_constants.ALL_RECIPES.dinner, n);
      if (dayIndex % 2 === 1) {
        [lunch, dinner] = [dinner, lunch];
      }
      return { breakfast, lunch, dinner };
    },
    generateWeekPlan() {
      common_vendor.index.showLoading({ title: "智能生成中..." });
      setTimeout(() => {
        const data = {};
        const allDaysMeals = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(this.currentMonday);
          d.setDate(d.getDate() + i);
          const ds = this.dateToStr(d);
          const meals = this.nutritionBalanced(i, allDaysMeals);
          data[ds] = meals;
          allDaysMeals.push(meals);
        }
        this.weeklyData = data;
        common_vendor.index.setStorageSync("foodfind_weekly", data);
        const app = getApp();
        if (app == null ? void 0 : app.globalData)
          app.globalData.weeklyMeals = data;
        if (data[this.selectedDateStr]) {
          const dm = data[this.selectedDateStr];
          common_vendor.index.setStorageSync("foodfind_meals", dm);
          common_vendor.index.setStorageSync("foodfind_meals_date", this.selectedDateStr);
          if (app == null ? void 0 : app.globalData)
            app.globalData.dailyMeals = dm;
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "本周菜单已生成", icon: "success" });
      }, 800);
    },
    viewRecipe(r) {
      common_vendor.index.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${r.id}` });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.pairStats && $data.pairStats.consecutiveShareDays > 0
  }, $data.pairStats && $data.pairStats.consecutiveShareDays > 0 ? common_vendor.e({
    b: common_vendor.t($data.pairStats.consecutiveShareDays),
    c: common_vendor.t($data.pairStats.totalShareDays),
    d: common_vendor.t($data.pairStats.totalOpenDays),
    e: $data.pairStats.consecutiveShareDays >= 7
  }, $data.pairStats.consecutiveShareDays >= 7 ? {} : {}) : {}, {
    f: common_vendor.o((...args) => $options.prevWeek && $options.prevWeek(...args)),
    g: common_vendor.t($options.calMonth),
    h: common_vendor.o((...args) => $options.nextWeek && $options.nextWeek(...args)),
    i: common_vendor.f($options.weekDays, (d, di, i0) => {
      return common_vendor.e({
        a: common_vendor.t(d.weekName),
        b: common_vendor.t(d.day),
        c: d.sparkLevel === 1
      }, d.sparkLevel === 1 ? {} : d.sparkLevel >= 2 ? {} : {}, {
        d: d.sparkLevel >= 2,
        e: d.hasData && d.sparkLevel === 0
      }, d.hasData && d.sparkLevel === 0 ? {} : {}, {
        f: d.isActive ? 1 : "",
        g: d.isToday ? 1 : "",
        h: d.hasData ? 1 : "",
        i: d.sparkLevel > 0 ? 1 : "",
        j: di,
        k: common_vendor.o(($event) => $options.selectDay(d), di)
      });
    }),
    j: common_vendor.o((...args) => $options.generateWeekPlan && $options.generateWeekPlan(...args)),
    k: $data.weeklyData && $data.weeklyData[$options.selectedDateStr]
  }, $data.weeklyData && $data.weeklyData[$options.selectedDateStr] ? {
    l: common_vendor.t($options.weekNutriSummary)
  } : {}, {
    m: $options.selectedDayMeals
  }, $options.selectedDayMeals ? {
    n: common_vendor.t($options.selectedDayLabel),
    o: common_vendor.t($options.selectedDayCal),
    p: common_vendor.f($options.mealSections, (meal, mi, i0) => {
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
            e: common_vendor.o(($event) => $options.viewRecipe(food), food.id),
            f: 180 + mi * 60 + fi * 50 + "ms"
          };
        }),
        e: mi,
        f: mi * 120 + "ms"
      };
    })
  } : {}, {
    q: $data.scrollHeight,
    r: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5f1b9080"]]);
wx.createPage(MiniProgramPage);
