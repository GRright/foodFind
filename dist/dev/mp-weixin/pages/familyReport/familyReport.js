"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_family = require("../../utils/family.js");
const _sfc_main = {
  data() {
    return {
      pageEnter: true,
      familyGroup: null,
      currentUserId: "",
      checkIns: {},
      weekData: [],
      _totalCalories: 0,
      _totalProtein: 0,
      _totalFat: 0,
      _totalCarbs: 0,
      familyHealthTags: [],
      viewMode: "all",
      selectedMember: null,
      showMemberDropdown: true,
      isMemberSelectOpen: false
    };
  },
  computed: {
    dateRange() {
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getTime() - 6 * 864e5);
      return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
    },
    familyCheckInDays() {
      let days = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const dayCheckins = this.checkIns[d] || {};
        if (this.viewMode === "all") {
          const hasAnyCheckIn = Object.values(dayCheckins).some((m) => m.breakfast || m.lunch || m.dinner);
          if (hasAnyCheckIn)
            days++;
        } else if (this.viewMode === "self") {
          const member = dayCheckins[this.currentUserId];
          if (member && (member.breakfast || member.lunch || member.dinner))
            days++;
        } else if (this.viewMode === "member" && this.selectedMember) {
          const member = dayCheckins[this.selectedMember.userId];
          if (member && (member.breakfast || member.lunch || member.dinner))
            days++;
        }
      }
      return days;
    },
    totalCalories() {
      return this._totalCalories;
    },
    totalProtein() {
      return this._totalProtein;
    },
    totalFat() {
      return this._totalFat;
    },
    totalCarbs() {
      return this._totalCarbs;
    },
    memberRankings() {
      var _a;
      const memberCounts = {};
      const members = ((_a = this.familyGroup) == null ? void 0 : _a.members) || [];
      members.forEach((m) => {
        memberCounts[m.userId] = { ...m, count: 0 };
      });
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const dayCheckins = this.checkIns[d] || {};
        Object.entries(dayCheckins).forEach(([userId, member]) => {
          if (memberCounts[userId]) {
            if (member.breakfast)
              memberCounts[userId].count++;
            if (member.lunch)
              memberCounts[userId].count++;
            if (member.dinner)
              memberCounts[userId].count++;
          }
        });
      }
      const sorted = Object.values(memberCounts).sort((a, b) => b.count - a.count);
      const maxCount = sorted.length > 0 ? sorted[0].count : 1;
      return sorted.map((m) => ({ ...m, percent: maxCount > 0 ? m.count / maxCount * 100 : 0 }));
    }
  },
  onLoad() {
    this.currentUserId = utils_family.getCurrentUserId();
    this.familyGroup = utils_family.getFamilyGroup();
    this.checkIns = utils_family.getFamilyCheckIns();
    this.initWeekData();
    this.calcWeeklyNutrition();
    this.familyHealthTags = utils_family.getFamilyHealthTags().map((id) => utils_family.HEALTH_TAGS.find((t) => t.id === id)).filter(Boolean);
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
    this.checkIns = utils_family.getFamilyCheckIns();
    this.initWeekData();
  },
  methods: {
    initWeekData() {
      const days = [];
      const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5);
        const dateStr = d.toISOString().split("T")[0];
        const dayCheckins = this.checkIns[dateStr] || {};
        let mealCount = 0;
        if (this.viewMode === "all") {
          Object.values(dayCheckins).forEach((member) => {
            if (member.breakfast)
              mealCount++;
            if (member.lunch)
              mealCount++;
            if (member.dinner)
              mealCount++;
          });
        } else if (this.viewMode === "self") {
          const member = dayCheckins[this.currentUserId];
          if (member) {
            if (member.breakfast)
              mealCount++;
            if (member.lunch)
              mealCount++;
            if (member.dinner)
              mealCount++;
          }
        } else if (this.viewMode === "member" && this.selectedMember) {
          const member = dayCheckins[this.selectedMember.userId];
          if (member) {
            if (member.breakfast)
              mealCount++;
            if (member.lunch)
              mealCount++;
            if (member.dinner)
              mealCount++;
          }
        }
        days.push({
          date: dateStr,
          label: "周" + dayNames[d.getDay()],
          shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
          mealCount
        });
      }
      this.weekData = days;
    },
    calcWeeklyNutrition() {
      const weeklyData = common_vendor.index.getStorageSync("foodfind_weekly") || {};
      let calories = 0, protein = 0, fat = 0, carbs = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const dayMeals = weeklyData[d];
        if (dayMeals) {
          ["breakfast", "lunch", "dinner"].forEach((mealType) => {
            const recipes = dayMeals[mealType] || [];
            recipes.forEach((recipe) => {
              var _a, _b, _c, _d;
              calories += ((_a = recipe.nutrition) == null ? void 0 : _a.calories) || 0;
              protein += ((_b = recipe.nutrition) == null ? void 0 : _b.protein) || 0;
              fat += ((_c = recipe.nutrition) == null ? void 0 : _c.fat) || 0;
              carbs += ((_d = recipe.nutrition) == null ? void 0 : _d.carbs) || 0;
            });
          });
        }
      }
      this._totalCalories = Math.round(calories);
      this._totalProtein = Math.round(protein);
      this._totalFat = Math.round(fat);
      this._totalCarbs = Math.round(carbs);
    },
    setViewMode(mode) {
      this.viewMode = mode;
      if (mode === "self") {
        this.selectedMember = null;
      }
      this.isMemberSelectOpen = false;
      this.initWeekData();
      this.calcWeeklyNutrition();
    },
    toggleMemberSelect() {
      this.isMemberSelectOpen = !this.isMemberSelectOpen;
    },
    selectMember(member) {
      this.selectedMember = member;
      this.viewMode = "member";
      this.isMemberSelectOpen = false;
      this.initWeekData();
      this.calcWeeklyNutrition();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c;
  return common_vendor.e({
    a: common_vendor.t($options.dateRange),
    b: common_vendor.t($data.viewMode === "all" ? "全家营养总览" : ((_a = $data.selectedMember) == null ? void 0 : _a.name) + "的饮食记录"),
    c: $data.viewMode === "all" ? 1 : "",
    d: common_vendor.o(($event) => $options.setViewMode("all")),
    e: $data.viewMode === "self" ? 1 : "",
    f: common_vendor.o(($event) => $options.setViewMode("self")),
    g: $data.showMemberDropdown
  }, $data.showMemberDropdown ? common_vendor.e({
    h: $data.viewMode === "member" && $data.selectedMember ? 1 : "",
    i: common_vendor.o((...args) => $options.toggleMemberSelect && $options.toggleMemberSelect(...args)),
    j: $data.isMemberSelectOpen
  }, $data.isMemberSelectOpen ? {
    k: common_vendor.f(((_b = $data.familyGroup) == null ? void 0 : _b.members) || [], (member, k0, i0) => {
      var _a2, _b2;
      return common_vendor.e({
        a: common_vendor.t(member.name.charAt(0)),
        b: common_vendor.t(member.name),
        c: ((_a2 = $data.selectedMember) == null ? void 0 : _a2.userId) === member.userId
      }, ((_b2 = $data.selectedMember) == null ? void 0 : _b2.userId) === member.userId ? {} : {}, {
        d: member.userId,
        e: common_vendor.o(($event) => $options.selectMember(member), member.userId)
      });
    })
  } : {}) : {}, {
    l: common_vendor.t($options.familyCheckInDays),
    m: common_vendor.f(((_c = $data.familyGroup) == null ? void 0 : _c.members) || [], (member, k0, i0) => {
      return {
        a: common_vendor.t(member.name.charAt(0)),
        b: member.userId
      };
    }),
    n: common_vendor.t($options.totalCalories),
    o: common_vendor.t($options.totalProtein),
    p: common_vendor.t($options.totalFat),
    q: common_vendor.t($options.totalCarbs),
    r: common_vendor.f($data.weekData, (day, k0, i0) => {
      return common_vendor.e({
        a: day.mealCount > 0
      }, day.mealCount > 0 ? {
        b: common_vendor.t(day.mealCount)
      } : {}, {
        c: Math.max(10, day.mealCount / 21 * 100) + "%",
        d: common_vendor.t(day.label),
        e: common_vendor.t(day.shortDate),
        f: day.date
      });
    }),
    s: $data.viewMode === "all"
  }, $data.viewMode === "all" ? {
    t: common_vendor.f($options.memberRankings, (member, idx, i0) => {
      return {
        a: common_vendor.t(idx + 1),
        b: idx === 0 ? 1 : "",
        c: idx === 1 ? 1 : "",
        d: idx === 2 ? 1 : "",
        e: common_vendor.t(member.name.charAt(0)),
        f: common_vendor.t(member.name),
        g: member.percent + "%",
        h: common_vendor.t(member.count),
        i: member.userId,
        j: idx === 0 ? 1 : ""
      };
    })
  } : {}, {
    v: $data.familyHealthTags.length > 0
  }, $data.familyHealthTags.length > 0 ? {
    w: common_vendor.f($data.familyHealthTags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag.icon),
        b: common_vendor.t(tag.name),
        c: tag.id
      };
    })
  } : {}, {
    x: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-34ddcf3c"]]);
wx.createPage(MiniProgramPage);
