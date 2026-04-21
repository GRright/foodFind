"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/menu/menu.js";
  "./pages/profile/profile.js";
  "./pages/onboarding/onboarding.js";
  "./pages/recipe-detail/recipe-detail.js";
  "./pages/share/share.js";
  "./pages/invite/invite.js";
  "./pages/foodDiary/foodDiary.js";
}
const _sfc_main = {
  onLaunch() {
    console.log("[App] 吃点啥 - 启动中...");
    this.globalData = {
      userInfo: { nickname: "美食爱好者", avatar: "" },
      partnerInfo: null,
      dailyMeals: null,
      weeklyMeals: null,
      currentShareId: null
    };
    const cached = common_vendor.index.getStorageSync("foodfind_partner");
    if (cached) {
      this.globalData.partnerInfo = cached;
    }
  },
  globalData: {
    userInfo: { nickname: "美食爱好者", avatar: "" },
    partnerInfo: null,
    dailyMeals: null,
    weeklyMeals: null,
    currentShareId: null
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
