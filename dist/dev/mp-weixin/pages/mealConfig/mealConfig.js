"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      pageEnter: true,
      mealConfig: {
        weekday: ["dinner"],
        weekend: ["breakfast", "lunch", "dinner"]
      }
    };
  },
  onLoad() {
    this.loadConfig();
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
  },
  onUnload() {
    this.saveConfig();
  },
  methods: {
    loadConfig() {
      const prefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs");
      if (prefs && prefs.mealConfig) {
        this.mealConfig = { ...this.mealConfig, ...prefs.mealConfig };
      }
    },
    saveConfig() {
      const prefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs") || {};
      prefs.mealConfig = this.mealConfig;
      common_vendor.index.setStorageSync("foodfind_detailed_prefs", prefs);
    },
    toggleWeekdayMeal(mealType) {
      const idx = this.mealConfig.weekday.indexOf(mealType);
      if (idx > -1) {
        this.mealConfig.weekday.splice(idx, 1);
      } else {
        this.mealConfig.weekday.push(mealType);
      }
      this.saveConfig();
    },
    toggleWeekendMeal(mealType) {
      const idx = this.mealConfig.weekend.indexOf(mealType);
      if (idx > -1) {
        this.mealConfig.weekend.splice(idx, 1);
      } else {
        this.mealConfig.weekend.push(mealType);
      }
      this.saveConfig();
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.mealConfig.weekday.includes("breakfast")
  }, $data.mealConfig.weekday.includes("breakfast") ? {} : {}, {
    c: $data.mealConfig.weekday.includes("breakfast") ? 1 : "",
    d: $data.mealConfig.weekday.includes("breakfast") ? 1 : "",
    e: common_vendor.o(($event) => $options.toggleWeekdayMeal("breakfast")),
    f: $data.mealConfig.weekday.includes("lunch")
  }, $data.mealConfig.weekday.includes("lunch") ? {} : {}, {
    g: $data.mealConfig.weekday.includes("lunch") ? 1 : "",
    h: $data.mealConfig.weekday.includes("lunch") ? 1 : "",
    i: common_vendor.o(($event) => $options.toggleWeekdayMeal("lunch")),
    j: $data.mealConfig.weekday.includes("dinner")
  }, $data.mealConfig.weekday.includes("dinner") ? {} : {}, {
    k: $data.mealConfig.weekday.includes("dinner") ? 1 : "",
    l: $data.mealConfig.weekday.includes("dinner") ? 1 : "",
    m: common_vendor.o(($event) => $options.toggleWeekdayMeal("dinner")),
    n: $data.mealConfig.weekend.includes("breakfast")
  }, $data.mealConfig.weekend.includes("breakfast") ? {} : {}, {
    o: $data.mealConfig.weekend.includes("breakfast") ? 1 : "",
    p: $data.mealConfig.weekend.includes("breakfast") ? 1 : "",
    q: common_vendor.o(($event) => $options.toggleWeekendMeal("breakfast")),
    r: $data.mealConfig.weekend.includes("lunch")
  }, $data.mealConfig.weekend.includes("lunch") ? {} : {}, {
    s: $data.mealConfig.weekend.includes("lunch") ? 1 : "",
    t: $data.mealConfig.weekend.includes("lunch") ? 1 : "",
    v: common_vendor.o(($event) => $options.toggleWeekendMeal("lunch")),
    w: $data.mealConfig.weekend.includes("dinner")
  }, $data.mealConfig.weekend.includes("dinner") ? {} : {}, {
    x: $data.mealConfig.weekend.includes("dinner") ? 1 : "",
    y: $data.mealConfig.weekend.includes("dinner") ? 1 : "",
    z: common_vendor.o(($event) => $options.toggleWeekendMeal("dinner")),
    A: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7dfad27b"]]);
wx.createPage(MiniProgramPage);
