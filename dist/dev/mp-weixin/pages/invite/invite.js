"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      pairId: "",
      loading: true,
      error: false,
      errorTitle: "",
      errorMsg: "",
      inviterName: "",
      relationType: "couple",
      createTime: "",
      isAccepted: false,
      bodyHeight: "calc(100vh - 380rpx)"
    };
  },
  computed: {
    relationLabel() {
      const map = { couple: "💕 情侣", family: "👨‍👩‍👧 家人", friend: "🤝 朋友" };
      return map[this.relationType] || "💕 伙伴";
    }
  },
  onLoad(options) {
    if (options.pid) {
      this.pairId = options.pid;
      this.loadInvite();
    } else {
      this.error = true;
      this.errorTitle = "无效的邀请链接";
      this.errorMsg = "邀请信息缺失，请让对方重新发送";
      this.loading = false;
    }
  },
  methods: {
    loadInvite() {
      this.loading = false;
      this.error = true;
      this.errorTitle = "云功能暂时不可用";
      this.errorMsg = "配对功能需要云端支持，请稍后重试";
    },
    acceptInvite() {
      common_vendor.index.showToast({ title: "配对功能暂时不可用", icon: "none" });
    },
    savePartnerToLocal(data) {
      const partnerInfo = {
        nickname: data.inviterName || this.inviterName,
        relationType: data.relationType || this.relationType,
        status: "paired",
        pairId: this.pairId
      };
      common_vendor.index.setStorageSync("foodfind_partner", partnerInfo);
      const app = getApp();
      if (app == null ? void 0 : app.globalData)
        app.globalData.partnerInfo = partnerInfo;
    },
    goHome() {
      setTimeout(() => {
        common_vendor.index.switchTab({ url: "/pages/index/index" });
      }, 300);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.isAccepted ? "♥" : "✉"),
    b: $data.loading
  }, $data.loading ? {} : $data.error ? {
    d: common_vendor.t($data.errorTitle)
  } : $data.isAccepted ? {} : {
    f: common_vendor.t($data.inviterName)
  }, {
    c: $data.error,
    e: $data.isAccepted,
    g: !$data.loading && !$data.error && !$data.isAccepted
  }, !$data.loading && !$data.error && !$data.isAccepted ? {} : {}, {
    h: $data.isAccepted ? 1 : "",
    i: !$data.loading && !$data.error
  }, !$data.loading && !$data.error ? {
    j: common_vendor.t($options.relationLabel),
    k: common_vendor.t($data.createTime || "刚刚")
  } : {}, {
    l: !$data.isAccepted && !$data.loading && !$data.error
  }, !$data.isAccepted && !$data.loading && !$data.error ? {
    m: common_vendor.o((...args) => $options.acceptInvite && $options.acceptInvite(...args)),
    n: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {}, {
    o: $data.isAccepted
  }, $data.isAccepted ? {
    p: common_vendor.t($data.inviterName),
    q: common_vendor.t($options.relationLabel),
    r: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  } : {}, {
    s: $data.error
  }, $data.error ? {
    t: common_vendor.t($data.errorMsg),
    v: common_vendor.o((...args) => $options.loadInvite && $options.loadInvite(...args))
  } : {}, {
    w: $data.bodyHeight
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dcaa6964"]]);
wx.createPage(MiniProgramPage);
