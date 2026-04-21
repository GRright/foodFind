"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_family = require("../../utils/family.js");
const _sfc_main = {
  data() {
    return {
      pageEnter: true,
      hasFamily: false,
      familyGroup: null,
      currentUserId: "",
      form: {
        name: "",
        type: "couple",
        userName: ""
      },
      joinCode: "",
      showInviteCard: false,
      myHealthTags: [],
      familyTypes: utils_family.FAMILY_TYPES,
      healthTags: utils_family.HEALTH_TAGS,
      healthTagCategories: utils_family.HEALTH_TAG_CATEGORIES
    };
  },
  computed: {
    isAdmin() {
      return this.familyGroup && this.familyGroup.creatorId === this.currentUserId;
    },
    familyTypeData() {
      if (!this.familyGroup)
        return {};
      return utils_family.FAMILY_TYPES.find((t) => t.value === this.familyGroup.type) || {};
    }
  },
  onLoad() {
    this.currentUserId = utils_family.getCurrentUserId();
    this.loadFamily();
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
    this.loadFamily();
  },
  methods: {
    loadFamily() {
      const group = utils_family.getFamilyGroup();
      if (group) {
        this.hasFamily = true;
        this.familyGroup = group;
        const me = group.members.find((m) => m.userId === this.currentUserId);
        if (me) {
          this.myHealthTags = [...me.healthTags || []];
        }
      } else {
        this.hasFamily = false;
      }
    },
    getHealthTag(tagId) {
      return utils_family.getHealthTagById(tagId) || { icon: "", name: tagId };
    },
    getTagsByCategory(category) {
      return utils_family.HEALTH_TAGS.filter((t) => t.category === category);
    },
    onCodeInput(e) {
      this.joinCode = e.detail.value.toUpperCase();
    },
    createFamily() {
      if (!this.form.name.trim()) {
        common_vendor.index.showToast({ title: "请输入家庭名称", icon: "none" });
        return;
      }
      if (!this.form.userName.trim()) {
        common_vendor.index.showToast({ title: "请输入你的昵称", icon: "none" });
        return;
      }
      const group = utils_family.createFamilyGroup(this.form.name.trim(), this.form.type, this.form.userName.trim());
      this.hasFamily = true;
      this.familyGroup = group;
      this.showInviteCard = true;
      common_vendor.index.showToast({ title: "家庭创建成功！", icon: "success" });
    },
    joinFamily() {
      if (this.joinCode.length !== 6) {
        common_vendor.index.showToast({ title: "请输入6位邀请码", icon: "none" });
        return;
      }
      const result = utils_family.joinFamilyGroup(this.joinCode, "新成员");
      if (result.success) {
        this.hasFamily = true;
        this.familyGroup = result.group;
        this.loadFamily();
        common_vendor.index.showToast({ title: "加入成功！", icon: "success" });
      } else {
        common_vendor.index.showToast({ title: result.error || "加入失败", icon: "none" });
      }
    },
    toggleHealthTag(tagId) {
      const idx = this.myHealthTags.indexOf(tagId);
      if (idx > -1) {
        this.myHealthTags.splice(idx, 1);
      } else {
        this.myHealthTags.push(tagId);
      }
    },
    saveMyHealthTags() {
      const result = utils_family.updateMyHealthTags(this.myHealthTags);
      if (result.success) {
        this.loadFamily();
        common_vendor.index.showToast({ title: "健康标签已保存", icon: "success" });
      }
    },
    showInviteCode() {
      this.showInviteCard = !this.showInviteCard;
    },
    copyInviteCode() {
      common_vendor.index.setClipboardData({
        data: this.familyGroup.inviteCode,
        success: () => {
          common_vendor.index.showToast({ title: "邀请码已复制", icon: "success" });
        }
      });
    },
    goToFamilyShopping() {
      common_vendor.index.navigateTo({ url: "/pages/shoppingList/shoppingList?mode=family" });
    },
    goToFamilyCheckIn() {
      common_vendor.index.navigateTo({ url: "/pages/familyCheckIn/familyCheckIn" });
    },
    goToFamilyWeeklyReport() {
      common_vendor.index.navigateTo({ url: "/pages/familyReport/familyReport" });
    },
    leaveFamily() {
      common_vendor.index.showModal({
        title: "确认离开",
        content: "确定要离开这个家庭吗？",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            const result = utils_family.leaveFamilyGroup();
            if (result.success) {
              this.loadFamily();
              common_vendor.index.showToast({ title: "已离开家庭", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: result.error || "离开失败", icon: "none" });
            }
          }
        }
      });
    },
    deleteFamily() {
      common_vendor.index.showModal({
        title: "确认解散",
        content: "解散后所有数据将清除，无法恢复！",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            const result = utils_family.deleteFamilyGroup();
            if (result.success) {
              this.loadFamily();
              common_vendor.index.showToast({ title: "家庭已解散", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: result.error || "解散失败", icon: "none" });
            }
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.hasFamily
  }, !$data.hasFamily ? {
    b: $data.form.name,
    c: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    d: common_vendor.f($data.familyTypes, (type, k0, i0) => {
      return {
        a: common_vendor.t(type.icon),
        b: common_vendor.t(type.label),
        c: $data.form.type === type.value ? 1 : "",
        d: type.value,
        e: common_vendor.o(($event) => $data.form.type = type.value, type.value)
      };
    }),
    e: $data.form.userName,
    f: common_vendor.o(($event) => $data.form.userName = $event.detail.value),
    g: common_vendor.o((...args) => $options.createFamily && $options.createFamily(...args)),
    h: common_vendor.o([($event) => $data.joinCode = $event.detail.value, (...args) => $options.onCodeInput && $options.onCodeInput(...args)]),
    i: $data.joinCode,
    j: $data.joinCode.length !== 6 ? 1 : "",
    k: common_vendor.o((...args) => $options.joinFamily && $options.joinFamily(...args))
  } : common_vendor.e({
    l: common_vendor.t($data.familyGroup.name),
    m: common_vendor.t($options.familyTypeData.icon),
    n: common_vendor.t($options.familyTypeData.label),
    o: common_vendor.t($data.familyGroup.members.length),
    p: common_vendor.t($options.familyTypeData.maxMembers),
    q: common_vendor.o((...args) => $options.showInviteCode && $options.showInviteCode(...args)),
    r: $data.showInviteCard
  }, $data.showInviteCard ? {
    s: common_vendor.t($data.familyGroup.inviteCode),
    t: common_vendor.o((...args) => $options.copyInviteCode && $options.copyInviteCode(...args))
  } : {}, {
    v: common_vendor.f($data.familyGroup.members, (member, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(member.name.charAt(0)),
        b: common_vendor.t(member.name),
        c: member.role === "admin"
      }, member.role === "admin" ? {} : {}, {
        d: member.userId === $data.currentUserId
      }, member.userId === $data.currentUserId ? {} : {}, {
        e: member.healthTags && member.healthTags.length > 0
      }, member.healthTags && member.healthTags.length > 0 ? {
        f: common_vendor.f(member.healthTags, (tag, k1, i1) => {
          return {
            a: common_vendor.t($options.getHealthTag(tag).icon),
            b: common_vendor.t($options.getHealthTag(tag).name),
            c: tag
          };
        })
      } : {}, {
        g: member.userId,
        h: member.userId === $data.currentUserId ? 1 : ""
      });
    }),
    w: common_vendor.f($data.healthTagCategories, (category, k0, i0) => {
      return {
        a: common_vendor.t(category),
        b: common_vendor.f($options.getTagsByCategory(category), (tag, k1, i1) => {
          return {
            a: common_vendor.t(tag.icon),
            b: common_vendor.t(tag.name),
            c: $data.myHealthTags.includes(tag.id) ? 1 : "",
            d: tag.id,
            e: common_vendor.o(($event) => $options.toggleHealthTag(tag.id), tag.id)
          };
        }),
        c: category
      };
    }),
    x: common_vendor.o((...args) => $options.saveMyHealthTags && $options.saveMyHealthTags(...args)),
    y: common_vendor.o((...args) => $options.goToFamilyShopping && $options.goToFamilyShopping(...args)),
    z: common_vendor.o((...args) => $options.goToFamilyCheckIn && $options.goToFamilyCheckIn(...args)),
    A: common_vendor.o((...args) => $options.goToFamilyWeeklyReport && $options.goToFamilyWeeklyReport(...args)),
    B: $options.isAdmin
  }, $options.isAdmin ? common_vendor.e({
    C: common_vendor.o((...args) => $options.leaveFamily && $options.leaveFamily(...args)),
    D: $options.isAdmin
  }, $options.isAdmin ? {
    E: common_vendor.o((...args) => $options.deleteFamily && $options.deleteFamily(...args))
  } : {}) : {}), {
    F: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-81db192c"]]);
wx.createPage(MiniProgramPage);
