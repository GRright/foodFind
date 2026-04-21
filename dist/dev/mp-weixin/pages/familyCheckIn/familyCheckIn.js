"use strict";
const utils_family = require("../../utils/family.js");
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      pageEnter: true,
      familyGroup: null,
      currentUserId: "",
      checkIns: {},
      todayStr: "",
      weekDays: []
    };
  },
  computed: {
    totalCheckInCount() {
      let count = 0;
      this.todayStr;
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const dayCheckins = this.checkIns[d] || {};
        Object.values(dayCheckins).forEach((member) => {
          if (member.breakfast)
            count++;
          if (member.lunch)
            count++;
          if (member.dinner)
            count++;
        });
      }
      return count;
    },
    bestMemberName() {
      var _a;
      const memberCounts = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const dayCheckins = this.checkIns[d] || {};
        Object.entries(dayCheckins).forEach(([userId, member2]) => {
          if (!memberCounts[userId])
            memberCounts[userId] = 0;
          if (member2.breakfast)
            memberCounts[userId]++;
          if (member2.lunch)
            memberCounts[userId]++;
          if (member2.dinner)
            memberCounts[userId]++;
        });
      }
      let bestId = "";
      let maxCount = 0;
      Object.entries(memberCounts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestId = id;
        }
      });
      if (!bestId)
        return "暂无";
      const member = (_a = this.familyGroup) == null ? void 0 : _a.members.find((m) => m.userId === bestId);
      return member ? member.name : "未知";
    }
  },
  onLoad() {
    this.currentUserId = utils_family.getCurrentUserId();
    this.familyGroup = utils_family.getFamilyGroup();
    this.todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    this.checkIns = utils_family.getFamilyCheckIns();
    this.initWeekDays();
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
    this.checkIns = utils_family.getFamilyCheckIns();
  },
  methods: {
    initWeekDays() {
      const days = [];
      const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5);
        const dateStr = d.toISOString().split("T")[0];
        days.push({
          date: dateStr,
          label: "周" + dayNames[d.getDay()]
        });
      }
      this.weekDays = days;
    },
    getHealthTag(tagId) {
      return utils_family.HEALTH_TAGS.find((t) => t.id === tagId) || { icon: "" };
    },
    getMemberTodayCheckIn(userId) {
      const today = this.todayStr;
      const dayCheckins = this.checkIns[today] || {};
      const member = dayCheckins[userId] || { breakfast: false, lunch: false, dinner: false };
      return {
        ...member,
        allChecked: member.breakfast && member.lunch && member.dinner
      };
    },
    isMemberCheckedOnDay(userId, dateStr) {
      const dayCheckins = this.checkIns[dateStr] || {};
      const member = dayCheckins[userId] || {};
      return member.breakfast || member.lunch || member.dinner;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return {
    a: common_vendor.t($data.todayStr),
    b: common_vendor.t(((_a = $data.familyGroup) == null ? void 0 : _a.name) || "家庭"),
    c: common_vendor.f(((_b = $data.familyGroup) == null ? void 0 : _b.members) || [], (member, k0, i0) => {
      var _a2, _b2;
      return common_vendor.e({
        a: common_vendor.t(member.name.charAt(0)),
        b: common_vendor.t(member.name),
        c: ((_a2 = member.healthTags) == null ? void 0 : _a2.length) > 0
      }, ((_b2 = member.healthTags) == null ? void 0 : _b2.length) > 0 ? {
        d: common_vendor.f(member.healthTags.slice(0, 2), (tag, k1, i1) => {
          return {
            a: common_vendor.t($options.getHealthTag(tag).icon),
            b: tag
          };
        })
      } : {}, {
        e: common_vendor.t($options.getMemberTodayCheckIn(member.userId).allChecked ? "✓ 完成" : "○ 未完成"),
        f: $options.getMemberTodayCheckIn(member.userId).allChecked ? 1 : "",
        g: $options.getMemberTodayCheckIn(member.userId).breakfast
      }, $options.getMemberTodayCheckIn(member.userId).breakfast ? {} : {}, {
        h: $options.getMemberTodayCheckIn(member.userId).breakfast ? 1 : "",
        i: $options.getMemberTodayCheckIn(member.userId).breakfast ? 1 : "",
        j: $options.getMemberTodayCheckIn(member.userId).lunch
      }, $options.getMemberTodayCheckIn(member.userId).lunch ? {} : {}, {
        k: $options.getMemberTodayCheckIn(member.userId).lunch ? 1 : "",
        l: $options.getMemberTodayCheckIn(member.userId).lunch ? 1 : "",
        m: $options.getMemberTodayCheckIn(member.userId).dinner
      }, $options.getMemberTodayCheckIn(member.userId).dinner ? {} : {}, {
        n: $options.getMemberTodayCheckIn(member.userId).dinner ? 1 : "",
        o: $options.getMemberTodayCheckIn(member.userId).dinner ? 1 : "",
        p: member.userId
      });
    }),
    d: common_vendor.f($data.weekDays, (day, k0, i0) => {
      var _a2;
      return {
        a: common_vendor.t(day.label),
        b: common_vendor.t(day.date.slice(5)),
        c: common_vendor.f(((_a2 = $data.familyGroup) == null ? void 0 : _a2.members) || [], (member, k1, i1) => {
          return {
            a: member.userId,
            b: $options.isMemberCheckedOnDay(member.userId, day.date) ? 1 : ""
          };
        }),
        d: day.date
      };
    }),
    e: common_vendor.t($options.totalCheckInCount),
    f: common_vendor.t($options.bestMemberName),
    g: $data.pageEnter ? 1 : ""
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a57d9bd5"]]);
wx.createPage(MiniProgramPage);
