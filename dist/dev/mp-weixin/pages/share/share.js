"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const _sfc_main = {
  data() {
    return {
      mode: "view",
      dailyMeals: { breakfast: [], lunch: [], dinner: [] },
      partnerName: "",
      fromName: "",
      isReceiver: false,
      isSender: false,
      shareTime: "",
      status: "pending",
      bodyHeight: "calc(100vh - 420rpx)",
      shareId: "",
      loading: true
    };
  },
  computed: {
    gridRows() {
      return [
        { title: "早餐", icon: "🌅", recipes: this.dailyMeals.breakfast || [] },
        { title: "午餐", icon: "☀️", recipes: this.dailyMeals.lunch || [] },
        { title: "晚餐", icon: "🌙", recipes: this.dailyMeals.dinner || [] }
      ].map((m) => ({
        ...m,
        cal: (m.recipes || []).reduce((s, r) => {
          var _a;
          return s + (((_a = r.nutrition) == null ? void 0 : _a.calories) || 0);
        }, 0)
      }));
    },
    statusClass() {
      return this.status === "confirmed" ? "status-ok" : this.status === "modified" ? "status-modified" : "status-pending";
    },
    statusText() {
      const map = { pending: "待确认", confirmed: "✅ TA已确认", modified: "✏️ TA做了调整" };
      return map[this.status] || "待确认";
    }
  },
  onLoad(options) {
    if (options.sid) {
      this.loadFromCloud(options.sid);
    } else {
      this.loadFromLocal();
    }
  },
  methods: {
    loadFromCloud(sid) {
      this.shareId = sid;
      this.loading = false;
      common_vendor.index.showToast({ title: "云功能暂时不可用", icon: "none" });
      setTimeout(() => {
        common_vendor.index.switchTab({ url: "/pages/index/index" });
      }, 1500);
    },
    loadFromLocal() {
      this.mode = "view";
      const data = common_vendor.index.getStorageSync("foodfind_share_data");
      if (data) {
        this.dailyMeals = data.meals || { breakfast: [], lunch: [], dinner: [] };
        this.partnerName = data.toName || "TA";
        this.fromName = data.fromName || "";
        this.isSender = this.mode === "send";
        this.isReceiver = !this.isSender;
        this.shareTime = data.time || "";
        this.status = data.status || "pending";
        this.loading = false;
      } else {
        this.loading = false;
      }
    },
    refreshStatus() {
      common_vendor.index.showToast({ title: "已是最新状态", icon: "none" });
    },
    viewRecipe(r) {
      common_vendor.index.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${r.id}` });
    },
    confirmMeals() {
      common_vendor.index.showModal({
        title: "确认菜单",
        content: `确定使用这份菜单吗？对方会收到通知哦~`,
        success: (res) => {
          if (res.confirm) {
            this.updateCloudStatus("confirmed");
          }
        }
      });
    },
    modifyMeals() {
      common_vendor.index.showModal({
        title: "调整菜单",
        content: "将为你重新随机生成菜品",
        success: (res) => {
          if (res.confirm) {
            const n = 3;
            const newMeals = {
              breakfast: [...utils_constants.ALL_RECIPES.breakfast].sort(() => Math.random() - 0.5).slice(0, n),
              lunch: this.balanceMeal(utils_constants.ALL_RECIPES.lunch, n),
              dinner: this.balanceMeal(utils_constants.ALL_RECIPES.dinner, n)
            };
            this.dailyMeals = newMeals;
            this.updateCloudStatus("modified", newMeals);
          }
        }
      });
    },
    balanceMeal(recipes, count) {
      const m = recipes.filter((r) => r.type === "meat" || r.type === "mixed");
      const v = recipes.filter((r) => r.type === "vegetarian");
      const mc = Math.ceil(count / 2), vc = count - mc;
      return [...m.sort(() => Math.random() - 0.5).slice(0, mc), ...v.sort(() => Math.random() - 0.5).slice(0, vc)].sort(() => Math.random() - 0.5);
    },
    updateCloudStatus(status, meals) {
      this.status = status;
      if (meals) {
        this.dailyMeals = meals;
      }
      common_vendor.index.setStorageSync("foodfind_meals", this.dailyMeals);
      common_vendor.index.setStorageSync("foodfind_meals_date", (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
      const app = getApp();
      if (app == null ? void 0 : app.globalData)
        app.globalData.dailyMeals = this.dailyMeals;
      common_vendor.index.showToast({ title: status === "confirmed" ? "已确认 ✨" : "已调整", icon: "success" });
    },
    shareBack() {
      common_vendor.index.setStorageSync("foodfind_meals", this.dailyMeals);
      common_vendor.index.setStorageSync("foodfind_meals_date", (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
      const app = getApp();
      if (app == null ? void 0 : app.globalData)
        app.globalData.dailyMeals = this.dailyMeals;
      common_vendor.index.showToast({ title: "已设为今日菜单 ✨", icon: "success", duration: 2e3 });
    },
    resendShare() {
      const n = 3;
      const newMeals = {
        breakfast: [...utils_constants.ALL_RECIPES.breakfast].sort(() => Math.random() - 0.5).slice(0, n),
        lunch: this.balanceMeal(utils_constants.ALL_RECIPES.lunch, n),
        dinner: this.balanceMeal(utils_constants.ALL_RECIPES.dinner, n)
      };
      this.dailyMeals = newMeals;
      common_vendor.index.showToast({ title: "已重新生成", icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.isReceiver ? "✉" : "♥"),
    b: $data.isReceiver
  }, $data.isReceiver ? {
    c: common_vendor.t($data.fromName)
  } : {
    d: common_vendor.t($data.partnerName)
  }, {
    e: $data.isReceiver
  }, $data.isReceiver ? {} : {}, {
    f: common_vendor.t($data.shareTime),
    g: $data.isSender && $data.shareId
  }, $data.isSender && $data.shareId ? {
    h: common_vendor.o((...args) => $options.refreshStatus && $options.refreshStatus(...args))
  } : {}, {
    i: !$data.loading
  }, !$data.loading ? {
    j: common_vendor.t($options.statusText),
    k: common_vendor.n($options.statusClass)
  } : {}, {
    l: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    m: common_vendor.f($options.gridRows, (meal, mi, i0) => {
      return {
        a: common_vendor.t(meal.icon),
        b: common_vendor.t(meal.title),
        c: common_vendor.t(meal.cal),
        d: common_vendor.f(meal.recipes, (food, fi, i1) => {
          return {
            a: common_vendor.t(food.image || "🍽️"),
            b: common_vendor.t(food.name),
            c: common_vendor.t(food.nutrition.calories),
            d: food.id,
            e: common_vendor.o(($event) => $options.viewRecipe(food), food.id)
          };
        }),
        e: mi
      };
    }),
    n: $data.isReceiver
  }, $data.isReceiver ? {
    o: common_vendor.o((...args) => $options.confirmMeals && $options.confirmMeals(...args)),
    p: common_vendor.o((...args) => $options.modifyMeals && $options.modifyMeals(...args)),
    q: common_vendor.o((...args) => $options.shareBack && $options.shareBack(...args))
  } : {
    r: common_vendor.t($data.partnerName),
    s: common_vendor.o((...args) => $options.resendShare && $options.resendShare(...args))
  }), {
    t: $data.bodyHeight
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-74833cb4"]]);
wx.createPage(MiniProgramPage);
