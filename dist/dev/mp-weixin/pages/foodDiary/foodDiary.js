"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const _sfc_main = {
  data() {
    return {
      meals: [""],
      moods: [
        { value: "😋", label: "超满足" },
        { value: "😊", label: "开心" },
        { value: "😐", label: "一般" },
        { value: "😕", label: "不太行" },
        { value: "😫", label: "踩雷了" }
      ],
      selectedMood: "",
      rating: 0,
      note: "",
      diaryList: [],
      todayDiary: null,
      viewMode: false
    };
  },
  onLoad(options) {
    this.viewMode = !!options.viewDiary;
  },
  onShow() {
    this.loadDiaryList();
    this.loadTodayDiary();
  },
  onShareAppMessage() {
    if (this.todayDiary) {
      return {
        title: `我的美食日记 - ${this.todayDiary.date}`,
        path: `/pages/foodDiary/foodDiary?viewDiary=1`,
        imageUrl: ""
      };
    }
    return {
      title: "看看我的美食日记",
      path: "/pages/foodDiary/foodDiary",
      imageUrl: ""
    };
  },
  methods: {
    addMeal() {
      if (this.meals.length < 5) {
        this.meals.push("");
      }
    },
    removeMeal(i) {
      if (this.meals.length > 1) {
        this.meals.splice(i, 1);
      }
    },
    loadTodayDiary() {
      const today = /* @__PURE__ */ new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const diaryList = common_vendor.index.getStorageSync("foodfind_diary_list") || [];
      this.todayDiary = diaryList.find((d) => d.date === dateStr);
      if (!this.viewMode && !this.todayDiary) {
        this.autoFillFromCheckIn();
      }
    },
    autoFillFromCheckIn() {
      const checks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      const today = /* @__PURE__ */ new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const todayCheck = checks[dateStr];
      if (todayCheck) {
        const meals = [];
        [...utils_constants.ALL_RECIPES.breakfast, ...utils_constants.ALL_RECIPES.lunch, ...utils_constants.ALL_RECIPES.dinner];
        if (todayCheck.breakfast)
          meals.push("早餐");
        if (todayCheck.lunch)
          meals.push("午餐");
        if (todayCheck.dinner)
          meals.push("晚餐");
        const dailyMeals = common_vendor.index.getStorageSync("foodfind_meals");
        if (dailyMeals) {
          ["breakfast", "lunch", "dinner"].forEach((mealType) => {
            if (dailyMeals[mealType]) {
              dailyMeals[mealType].forEach((recipe) => {
                if (recipe.name)
                  meals.push(recipe.name);
              });
            }
          });
        }
        if (meals.length > 0) {
          this.meals = meals.slice(0, 5);
        }
      }
    },
    saveDiary() {
      const validMeals = this.meals.filter((m) => m.trim());
      if (validMeals.length === 0) {
        common_vendor.index.showToast({ title: "至少记录一餐", icon: "none" });
        return;
      }
      if (this.rating === 0) {
        common_vendor.index.showToast({ title: "请评分", icon: "none" });
        return;
      }
      const today = /* @__PURE__ */ new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const diaryEntry = {
        date: dateStr,
        meals: validMeals,
        mood: this.selectedMood,
        rating: this.rating,
        note: this.note,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const diaryList = common_vendor.index.getStorageSync("foodfind_diary_list") || [];
      const existingIndex = diaryList.findIndex((d) => d.date === dateStr);
      if (existingIndex >= 0) {
        diaryList[existingIndex] = diaryEntry;
      } else {
        diaryList.unshift(diaryEntry);
      }
      common_vendor.index.setStorageSync("foodfind_diary_list", diaryList);
      common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      this.meals = [""];
      this.selectedMood = "";
      this.rating = 0;
      this.note = "";
      this.loadDiaryList();
      this.loadTodayDiary();
    },
    loadDiaryList() {
      const today = /* @__PURE__ */ new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const all = common_vendor.index.getStorageSync("foodfind_diary_list") || [];
      this.diaryList = all.filter((d) => d.date !== dateStr);
    },
    shareTodayDiary() {
      common_vendor.index.showToast({ title: "准备分享", icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
  return common_vendor.e({
    a: $data.viewMode || $data.todayDiary
  }, $data.viewMode || $data.todayDiary ? common_vendor.e({
    b: common_vendor.t($data.viewMode && ((_a = $data.diaryList[0]) == null ? void 0 : _a.date) || ((_b = $data.todayDiary) == null ? void 0 : _b.date)),
    c: common_vendor.f($data.viewMode && ((_c = $data.diaryList[0]) == null ? void 0 : _c.rating) || ((_d = $data.todayDiary) == null ? void 0 : _d.rating), (n, k0, i0) => {
      return {
        a: n
      };
    }),
    d: common_vendor.f($data.viewMode && ((_e = $data.diaryList[0]) == null ? void 0 : _e.meals) || ((_f = $data.todayDiary) == null ? void 0 : _f.meals), (m, j, i0) => {
      return {
        a: common_vendor.t(m),
        b: j
      };
    }),
    e: $data.viewMode && ((_g = $data.diaryList[0]) == null ? void 0 : _g.mood) || ((_h = $data.todayDiary) == null ? void 0 : _h.mood)
  }, $data.viewMode && ((_i = $data.diaryList[0]) == null ? void 0 : _i.mood) || ((_j = $data.todayDiary) == null ? void 0 : _j.mood) ? {
    f: common_vendor.t($data.viewMode && ((_k = $data.diaryList[0]) == null ? void 0 : _k.mood) || ((_l = $data.todayDiary) == null ? void 0 : _l.mood))
  } : {}, {
    g: $data.viewMode && ((_m = $data.diaryList[0]) == null ? void 0 : _m.note) || ((_n = $data.todayDiary) == null ? void 0 : _n.note)
  }, $data.viewMode && ((_o = $data.diaryList[0]) == null ? void 0 : _o.note) || ((_p = $data.todayDiary) == null ? void 0 : _p.note) ? {
    h: common_vendor.t($data.viewMode && ((_q = $data.diaryList[0]) == null ? void 0 : _q.note) || ((_r = $data.todayDiary) == null ? void 0 : _r.note))
  } : {}) : {}, {
    i: !$data.viewMode
  }, !$data.viewMode ? common_vendor.e({
    j: !$data.todayDiary
  }, !$data.todayDiary ? common_vendor.e({
    k: common_vendor.f($data.meals, (meal, i, i0) => {
      return common_vendor.e({
        a: "第" + (i + 1) + "餐",
        b: $data.meals[i],
        c: common_vendor.o(($event) => $data.meals[i] = $event.detail.value, i)
      }, $data.meals.length > 1 ? {
        d: common_vendor.o(($event) => $options.removeMeal(i), i)
      } : {}, {
        e: i
      });
    }),
    l: $data.meals.length > 1,
    m: $data.meals.length < 5
  }, $data.meals.length < 5 ? {
    n: common_vendor.o((...args) => $options.addMeal && $options.addMeal(...args))
  } : {}, {
    o: common_vendor.f($data.moods, (m, i, i0) => {
      return {
        a: common_vendor.t(m.icon),
        b: common_vendor.t(m.label),
        c: i,
        d: $data.selectedMood === m.value ? 1 : "",
        e: common_vendor.o(($event) => $data.selectedMood = m.value, i)
      };
    }),
    p: common_vendor.f(5, (n, k0, i0) => {
      return {
        a: n,
        b: n <= $data.rating ? 1 : "",
        c: common_vendor.o(($event) => $data.rating = n, n)
      };
    }),
    q: $data.note,
    r: common_vendor.o(($event) => $data.note = $event.detail.value),
    s: common_vendor.o((...args) => $options.saveDiary && $options.saveDiary(...args))
  }) : {}, {
    t: common_vendor.f($data.diaryList, (d, i, i0) => {
      return common_vendor.e({
        a: common_vendor.t(d.date),
        b: common_vendor.f(d.rating, (n, k1, i1) => {
          return {
            a: n
          };
        }),
        c: common_vendor.f(d.meals, (m, j, i1) => {
          return {
            a: common_vendor.t(m),
            b: j
          };
        }),
        d: d.mood
      }, d.mood ? {
        e: common_vendor.t(d.mood)
      } : {}, {
        f: d.note
      }, d.note ? {
        g: common_vendor.t(d.note)
      } : {}, {
        h: i
      });
    }),
    v: $data.diaryList.length === 0 && !$data.todayDiary
  }, $data.diaryList.length === 0 && !$data.todayDiary ? {} : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-23ac15e4"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
