"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userInfo: { nickname: "美食爱好者", avatar: "" }
    };
  },
  methods: {
    goToOnboarding() {
      common_vendor.index.navigateTo({ url: "/pages/onboarding/onboarding?mode=edit" });
    },
    showToast(msg) {
      common_vendor.index.showToast({ title: msg, icon: "none" });
    },
    showAbout() {
      common_vendor.index.showModal({
        title: "关于吃点啥",
        content: "吃点啥 v1.0\n\n为您解决每日三餐决策难与用餐观影选择难的双重痛点！",
        showCancel: false,
        confirmText: "知道了"
      });
    },
    showFeedback() {
      common_vendor.index.showModal({
        title: "意见反馈",
        content: "感谢您的反馈！\n邮箱：feedback@foodfind.com",
        showCancel: false,
        confirmText: "知道了"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.userInfo.nickname ? $data.userInfo.nickname.charAt(0) : "美"),
    b: common_vendor.t($data.userInfo.nickname || "美食爱好者"),
    c: common_vendor.o((...args) => $options.goToOnboarding && $options.goToOnboarding(...args)),
    d: common_vendor.o(($event) => $options.showToast("功能开发中")),
    e: common_vendor.o(($event) => $options.showToast("功能开发中")),
    f: common_vendor.o((...args) => $options.showAbout && $options.showAbout(...args)),
    g: common_vendor.o((...args) => $options.showFeedback && $options.showFeedback(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-04d37cba"]]);
wx.createPage(MiniProgramPage);
