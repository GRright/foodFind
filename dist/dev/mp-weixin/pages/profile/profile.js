"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const _sfc_main = {
  data() {
    return {
      userInfo: { nickname: "美食爱好者", avatar: "" },
      hasPartner: false,
      pairStatus: "",
      partnerInfo: {},
      currentPairId: "",
      pendingInviteName: "",
      showPrefModal: false,
      pairStats: null,
      showReportModal: false,
      weeklyReportData: [],
      myWeeklyMeals: [],
      partnerWeeklyMeals: [],
      pageEnter: true,
      showFavoritesModal: false,
      favorites: [],
      prefs: {
        noCookMode: false,
        userType: "adult",
        userCount: 2,
        taste: "light",
        allergies: [],
        restrictions: [],
        cuisines: []
      },
      userTypeOptions: [
        { label: "🧑 成人", value: "adult" },
        { label: "💪 健身", value: "fitness" },
        { label: "🤰 孕妇", value: "pregnant" },
        { label: "👴 老人", value: "elderly" },
        { label: "👶 婴幼家庭", value: "child" },
        { label: "🏥 慢性病管理", value: "health_care" }
      ],
      userCountOptions: [
        { label: "1人", value: "1" },
        { label: "2人", value: "2" },
        { label: "3-4人", value: "3-4" },
        { label: "5+人", value: "5+" }
      ],
      tasteOptions: [
        { label: "🍃 清淡", value: "light" },
        { label: "🌶️ 麻辣", value: "spicy" },
        { label: "🍯 酸甜", value: "sweet_sour" },
        { label: "🧂 咸鲜", value: "salty" },
        { label: "🔥 香辣", value: "hot" },
        { label: "🍚 原味", value: "original" }
      ],
      allergyOptions: [
        { label: "🥜 花生", value: "peanut" },
        { label: "🥛 乳制品", value: "dairy" },
        { label: "🦐 海鲜", value: "seafood" },
        { label: "🌾 面筋/麸质", value: "gluten" },
        { label: "🥚 鸡蛋", value: "egg" },
        { label: "🫘 大豆", value: "soy" }
      ],
      restrictionOptions: [
        { label: "🥩 不吃红肉", value: "no_red_meat" },
        { label: "🐔 不吃禽类", value: "no_poultry" },
        { label: "🐟 不吃鱼", value: "no_fish" },
        { label: "🧄 不吃蒜", value: "no_garlic" },
        { label: "🌿 全素食", value: "vegan" },
        { label: "🥬 蛋奶素", value: "vegetarian" }
      ],
      cuisineOptions: [
        { label: "🏠 家常菜", value: "home_cooking" },
        { label: "🌶️ 川湘菜", value: "sichuan" },
        { label: "🦆 粤菜", value: "cantonese" },
        { label: "🍜 北方面食", value: "northern" },
        { label: "🥗 轻食减脂", value: "healthy" },
        { label: "🍣 日韩料理", value: "asian_fusion" }
      ]
    };
  },
  computed: {
    relationLabel() {
      const map = { couple: "💕 情侣", family: "👨‍👩‍👧 家人", friend: "🤝 朋友" };
      return map[this.partnerInfo.relationType] || "💕 伙伴";
    },
    reportMode() {
      const uc = this.prefs.userCount;
      if (!this.hasPartner || this.pairStatus !== "paired")
        return "solo";
      if (uc === "3-4" || uc === "5+")
        return "family";
      return "pair";
    },
    reportMotto() {
      const days = this.reportStreakDays;
      this.myMealCount;
      if (days === 0)
        return "开始打卡，记录每一餐的美好~";
      if (days < 3)
        return `已坚持${days}天，下周也要好好吃饭哦！`;
      if (days < 7)
        return `${days}天连续打卡，你比想象中更自律！`;
      return `连续${days}天好好吃饭，太棒了！继续加油！`;
    },
    weeklyCheckInDays() {
      const checks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      let days = 0;
      Object.keys(checks).forEach((date) => {
        const day = checks[date];
        if (day.breakfast || day.lunch || day.dinner)
          days++;
      });
      return days;
    },
    prefSummaryText() {
      const parts = [];
      const ut = this.userTypeOptions.find((o) => o.value === this.prefs.userCount);
      if (ut)
        parts.push(ut.label);
      const tt = this.tasteOptions.find((o) => o.value === this.prefs.taste);
      if (tt)
        parts.push(tt.label);
      if (this.prefs.allergies.length > 0)
        parts.push(`过敏${this.prefs.allergies.length}项`);
      if (this.prefs.cuisines.length > 0)
        parts.push(`${this.prefs.cuisines.length}种菜系`);
      return parts.length > 0 ? parts.join(" · ") : "点击设置你的饮食偏好";
    },
    reportStreakDays() {
      return this.pairStats ? this.pairStats.consecutiveShareDays || 0 : 0;
    },
    weeklyMeatCount() {
      return this.myWeeklyMeals.filter((m) => m.type === "meat" || m.type === "mixed").length;
    },
    weeklyVegCount() {
      return this.myWeeklyMeals.filter((m) => m.type === "vegetarian").length;
    },
    weeklyCalories() {
      return this.myWeeklyMeals.reduce((sum, m) => {
        var _a;
        return sum + (((_a = m.nutrition) == null ? void 0 : _a.calories) || 0);
      }, 0);
    },
    weeklyProtein() {
      return Math.round(this.myWeeklyMeals.reduce((sum, m) => {
        var _a;
        return sum + (((_a = m.nutrition) == null ? void 0 : _a.protein) || 0);
      }, 0));
    },
    myMealCount() {
      const checks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      let count = 0;
      Object.keys(checks).forEach((date) => {
        const day = checks[date];
        if (day.breakfast)
          count++;
        if (day.lunch)
          count++;
        if (day.dinner)
          count++;
      });
      return count;
    },
    partnerMealCount() {
      return Math.max(0, this.myMealCount + Math.floor(Math.random() * 3));
    },
    myMealPercent() {
      const total = this.myMealCount + this.partnerMealCount;
      return total > 0 ? Math.round(this.myMealCount / total * 100) : 50;
    },
    partnerMealPercent() {
      return 100 - this.myMealPercent;
    },
    healthTip() {
      const mode = this.reportMode;
      const days = this.weeklyCheckInDays;
      this.weeklyCalories;
      if (mode === "solo") {
        if (days === 0)
          return "还没有开始打卡哦，今天的三餐别忘了记录~ 🍚";
        if (days <= 2)
          return `本周已打卡${days}天，坚持记录饮食是自律的第一步！`;
        if (days <= 5)
          return `本周${days}天有在好好吃饭，继续保持这个好习惯！`;
        return `太棒了！本周每天都打卡了，你是最棒的干饭人！🎉`;
      }
      if (mode === "pair") {
        if (days <= 3)
          return `两人本周互动${days}天，多关心TA有没有好好吃饭吧~`;
        if (this.myMealCount > this.partnerMealCount)
          return "你比TA更勤快打卡哦，提醒TA也要好好吃饭~";
        return `本周互动很频繁，继续一起好好吃饭，感情升温中！💕`;
      }
      return `全家本周打卡${days}天，一起吃饭才是最温暖的时光~ 👨‍‍👧👦`;
    }
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 400);
    this.loadPairInfo();
    this.loadPrefs();
    this.loadMyWeeklyMeals();
    this.loadFavorites();
    if (this.hasPartner && this.pairStatus === "paired") {
      this.loadPairStats();
    }
  },
  methods: {
    loadPrefs() {
      const cached = common_vendor.index.getStorageSync("foodfind_detailed_prefs");
      if (cached) {
        this.prefs = { ...this.prefs, ...cached };
      }
    },
    loadMyWeeklyMeals() {
      const meals = [];
      const allRecipes = [...utils_constants.ALL_RECIPES.breakfast, ...utils_constants.ALL_RECIPES.lunch, ...utils_constants.ALL_RECIPES.dinner];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const daily = common_vendor.index.getStorageSync("foodfind_meals_date");
        if (daily === d) {
          const cached = common_vendor.index.getStorageSync("foodfind_meals");
          if (cached) {
            ["breakfast", "lunch", "dinner"].forEach((mealType) => {
              if (cached[mealType]) {
                cached[mealType].forEach((food) => {
                  const recipe = allRecipes.find((r) => r.id === food.id);
                  if (recipe)
                    meals.push({ ...recipe, mealType, date: d });
                });
              }
            });
          }
        }
      }
      this.myWeeklyMeals = meals;
    },
    loadPairStats() {
      return;
    },
    openReport() {
      this.showReportModal = true;
      this.loadWeeklyReport();
      this.loadMyWeeklyMeals();
    },
    closeReport() {
      this.showReportModal = false;
    },
    loadWeeklyReport() {
      this.generateLocalWeekData();
    },
    generateLocalWeekData() {
      const checks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
        const dayChecks = checks[d];
        let sparkLevel = 0;
        let mealCount = 0;
        if (dayChecks) {
          const eatenCount = [dayChecks.breakfast, dayChecks.lunch, dayChecks.dinner].filter((v) => v).length;
          mealCount = eatenCount;
          if (eatenCount >= 2)
            sparkLevel = 2;
          else if (eatenCount >= 1)
            sparkLevel = 1;
        }
        data.push({ date: d, sparkLevel, mealCount, allOpened: sparkLevel > 0, allShared: false });
      }
      this.weeklyReportData = data;
    },
    formatDayDate(dateStr) {
      if (!dateStr)
        return "";
      const m = parseInt(dateStr.slice(5, 7));
      const d = parseInt(dateStr.slice(8, 10));
      return `${m}/${d}`;
    },
    formatWeekDateRange() {
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getTime() - 6 * 864e5);
      const startMon = start.getMonth() + 1;
      const startDay = start.getDate();
      const endMon = end.getMonth() + 1;
      const endDay = end.getDate();
      return `${startMon}月${startDay}日 - ${endMon}月${endDay}日`;
    },
    openPrefModal() {
      this.showPrefModal = true;
    },
    closePrefModal() {
      this.showPrefModal = false;
    },
    toggleMulti(key, val) {
      const list = [...this.prefs[key] || []];
      const idx = list.indexOf(val);
      idx > -1 ? list.splice(idx, 1) : list.push(val);
      this.prefs[key] = list;
    },
    savePrefs() {
      common_vendor.index.setStorageSync("foodfind_detailed_prefs", this.prefs);
      common_vendor.index.setStorageSync("foodfind_user_count", this.prefs.userCount);
      common_vendor.index.showToast({ title: "设置已保存", icon: "success" });
      setTimeout(() => {
        this.showPrefModal = false;
      }, 600);
    },
    loadPairInfo() {
      const cached = common_vendor.index.getStorageSync("foodfind_partner");
      if (cached) {
        this.hasPartner = true;
        this.pairStatus = cached.status || "paired";
        this.partnerInfo = cached;
        this.currentPairId = cached.pairId || "";
      } else {
        this.hasPartner = false;
      }
    },
    startInvite() {
      common_vendor.index.showToast({ title: "配对功能暂时不可用", icon: "none" });
    },
    sendInviteMessage() {
      return new Promise((resolve) => {
        resolve({
          title: `${this.userInfo.nickname} 邀请你成为吃饭搭子，一起选今天吃什么！`,
          path: `/pages/invite/invite?pid=${this.currentPairId}`,
          imageUrl: ""
        });
      });
    },
    onResendInvite() {
      this.sendInviteMessage();
    },
    showPartnerDetail() {
      common_vendor.index.showActionSheet({
        itemList: ["📝 设置关系类型", "修改备注名", "解除绑定"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.setRelationType();
          } else if (res.tapIndex === 1) {
            common_vendor.index.showModal({
              title: "修改备注名",
              editable: true,
              placeholderText: "输入新的备注名",
              success: (mRes) => {
                if (mRes.confirm && mRes.content) {
                  this.partnerInfo.nickname = mRes.content;
                  common_vendor.index.setStorageSync("foodfind_partner", this.partnerInfo);
                  common_vendor.index.showToast({ title: "已修改", icon: "success" });
                }
              }
            });
          } else {
            common_vendor.index.showModal({
              title: "确认解除",
              content: `确定要和 ${this.partnerInfo.nickname || "TA"} 解除关系吗？`,
              confirmColor: "#ff4757",
              success: (mRes) => {
                if (mRes.confirm) {
                  common_vendor.index.removeStorageSync("foodfind_partner");
                  this.hasPartner = false;
                  this.pairStatus = "";
                  this.partnerInfo = {};
                  const app = getApp();
                  if (app == null ? void 0 : app.globalData)
                    app.globalData.partnerInfo = null;
                  common_vendor.index.showToast({ title: "已解除", icon: "success" });
                }
              }
            });
          }
        }
      });
    },
    setRelationType() {
      common_vendor.index.showActionSheet({
        itemList: ["💕 情侣", "👨‍👩‍👧 家人", "🤝 朋友"],
        success: (res) => {
          const types = ["couple", "family", "friend"];
          const newRel = types[res.tapIndex];
          this.partnerInfo.relationType = newRel;
          const saved = common_vendor.index.getStorageSync("foodfind_partner");
          if (saved) {
            saved.relationType = newRel;
            common_vendor.index.setStorageSync("foodfind_partner", saved);
          }
          common_vendor.index.showToast({ title: "关系已设置", icon: "success" });
        }
      });
    },
    goToShare() {
      const data = common_vendor.index.getStorageSync("foodfind_share_data");
      if (!data) {
        common_vendor.index.showToast({ title: "暂无分享记录", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/share/share?mode=view" });
    },
    clearCache() {
      common_vendor.index.showModal({
        title: "清除缓存",
        content: "将清除所有缓存数据，重新开始？",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("foodfind_meals");
            common_vendor.index.removeStorageSync("foodfind_meals_date");
            common_vendor.index.removeStorageSync("foodfind_weekly");
            common_vendor.index.showToast({ title: "已全部清除", icon: "success" });
          }
        }
      });
    },
    showAbout() {
      common_vendor.index.showModal({
        title: "关于吃点啥 v1.5",
        content: "为情侣/家人打造的共同决策吃什么的小工具\n\n✅ 智能一周菜单规划\n✅ 荤素营养均衡算法\n✅ 云端配对，跨设备同步\n✅ 分享菜单+双向确认\n✅ 互动打卡+火花系统\n✅ 本周饮食报告\n✅ 收藏喜欢的菜品\n\n每次交互约4次云函数调用",
        showCancel: false,
        confirmText: "知道了"
      });
    },
    loadFavorites() {
      this.favorites = common_vendor.index.getStorageSync("foodfind_favorites") || [];
    },
    openFavorites() {
      this.loadFavorites();
      this.showFavoritesModal = true;
    },
    closeFavorites() {
      this.showFavoritesModal = false;
    },
    removeFavorite(id) {
      let list = common_vendor.index.getStorageSync("foodfind_favorites") || [];
      const target = list.find((f) => f.id === id);
      list = list.filter((f) => f.id !== id);
      common_vendor.index.setStorageSync("foodfind_favorites", list);
      this.favorites = list;
      common_vendor.index.showToast({ title: `已移除「${(target == null ? void 0 : target.name) || ""}」`, icon: "none" });
    },
    goToFavoriteDetail(item) {
      this.closeFavorites();
      common_vendor.index.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${item.id}` });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.userInfo.nickname ? $data.userInfo.nickname.charAt(0) : "美"),
    b: common_vendor.t($data.userInfo.nickname || "美食爱好者"),
    c: $data.hasPartner && $data.pairStatus === "paired"
  }, $data.hasPartner && $data.pairStatus === "paired" ? common_vendor.e({
    d: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    e: common_vendor.t($data.partnerInfo.nickname || "TA"),
    f: common_vendor.t($options.relationLabel),
    g: common_vendor.o((...args) => $options.showPartnerDetail && $options.showPartnerDetail(...args)),
    h: $data.pairStats
  }, $data.pairStats ? common_vendor.e({
    i: common_vendor.t($data.pairStats.consecutiveShareDays || 0),
    j: common_vendor.t($data.pairStats.consecutiveOpenDays || 0),
    k: common_vendor.t($data.pairStats.totalShareDays || 0),
    l: $data.pairStats.consecutiveShareDays >= 7
  }, $data.pairStats.consecutiveShareDays >= 7 ? {
    m: common_vendor.t($data.pairStats.consecutiveShareDays)
  } : {}) : {}, {
    n: common_vendor.o((...args) => $options.openReport && $options.openReport(...args))
  }) : $data.hasPartner && $data.pairStatus === "pending" ? {
    p: common_vendor.o((...args) => $options.onResendInvite && $options.onResendInvite(...args))
  } : {
    q: common_vendor.o((...args) => $options.startInvite && $options.startInvite(...args)),
    r: common_vendor.o((...args) => $options.openReport && $options.openReport(...args))
  }, {
    o: $data.hasPartner && $data.pairStatus === "pending",
    s: common_vendor.t($data.favorites.length > 0 ? `已收藏 ${$data.favorites.length} 道菜` : "收藏喜欢的菜品"),
    t: common_vendor.o((...args) => $options.openFavorites && $options.openFavorites(...args)),
    v: common_vendor.o((...args) => $options.goToShare && $options.goToShare(...args)),
    w: common_vendor.t($options.prefSummaryText),
    x: common_vendor.o((...args) => $options.openPrefModal && $options.openPrefModal(...args)),
    y: common_vendor.o((...args) => $options.clearCache && $options.clearCache(...args)),
    z: common_vendor.o((...args) => $options.showAbout && $options.showAbout(...args)),
    A: $data.showPrefModal ? 1 : "",
    B: common_vendor.o((...args) => $options.closePrefModal && $options.closePrefModal(...args)),
    C: common_vendor.o((...args) => $options.closePrefModal && $options.closePrefModal(...args)),
    D: $data.prefs.noCookMode ? 1 : "",
    E: common_vendor.o(($event) => $data.prefs.noCookMode = !$data.prefs.noCookMode),
    F: common_vendor.f($data.userTypeOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.userType === opt.value ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $data.prefs.userType = opt.value, opt.value)
      };
    }),
    G: common_vendor.f($data.userCountOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: String($data.prefs.userCount) === opt.value ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $data.prefs.userCount = Number(opt.value), opt.value)
      };
    }),
    H: common_vendor.f($data.tasteOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.taste === opt.value ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $data.prefs.taste = opt.value, opt.value)
      };
    }),
    I: common_vendor.f($data.allergyOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.allergies.includes(opt.value) ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $options.toggleMulti("allergies", opt.value), opt.value)
      };
    }),
    J: common_vendor.f($data.restrictionOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.restrictions.includes(opt.value) ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $options.toggleMulti("restrictions", opt.value), opt.value)
      };
    }),
    K: common_vendor.f($data.cuisineOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.cuisines.includes(opt.value) ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $options.toggleMulti("cuisines", opt.value), opt.value)
      };
    }),
    L: common_vendor.o((...args) => $options.savePrefs && $options.savePrefs(...args)),
    M: $data.showPrefModal ? 1 : "",
    N: $data.showReportModal ? 1 : "",
    O: common_vendor.o((...args) => $options.closeReport && $options.closeReport(...args)),
    P: common_vendor.t($options.formatWeekDateRange()),
    Q: common_vendor.o((...args) => $options.closeReport && $options.closeReport(...args)),
    R: $options.reportMode === "solo"
  }, $options.reportMode === "solo" ? {
    S: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    T: common_vendor.t($options.reportStreakDays),
    U: common_vendor.t($options.reportMotto)
  } : $options.reportMode === "pair" ? {
    W: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    X: common_vendor.t($options.relationLabel),
    Y: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    Z: common_vendor.t($options.reportStreakDays)
  } : {
    aa: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    ab: common_vendor.t($data.prefs.userCount),
    ac: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    ad: common_vendor.t($options.reportStreakDays)
  }, {
    V: $options.reportMode === "pair",
    ae: common_vendor.t($options.weeklyCalories),
    af: common_vendor.t($options.myMealCount),
    ag: common_vendor.t($options.weeklyCheckInDays),
    ah: common_vendor.t($options.weeklyProtein),
    ai: common_vendor.f($data.weeklyReportData, (day, idx, i0) => {
      return common_vendor.e({
        a: day.mealCount > 0
      }, day.mealCount > 0 ? {
        b: common_vendor.t(day.mealCount)
      } : {}, {
        c: Math.max(10, day.mealCount / 3 * 100) + "%",
        d: common_vendor.t($options.formatDayDate(day.date)),
        e: idx
      });
    }),
    aj: $data.hasPartner && $data.pairStatus === "paired"
  }, $data.hasPartner && $data.pairStatus === "paired" ? {
    ak: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    al: Math.min(100, $options.myMealPercent) + "%",
    am: common_vendor.t($options.myMealCount),
    an: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    ao: common_vendor.t(($data.partnerInfo.nickname || "TA").slice(0, 4)),
    ap: Math.min(100, $options.partnerMealPercent) + "%",
    aq: common_vendor.t($options.partnerMealCount)
  } : {}, {
    ar: $data.showReportModal ? 1 : "",
    as: $data.showFavoritesModal ? 1 : "",
    at: common_vendor.o((...args) => $options.closeFavorites && $options.closeFavorites(...args)),
    av: common_vendor.o((...args) => $options.closeFavorites && $options.closeFavorites(...args)),
    aw: $data.favorites.length === 0
  }, $data.favorites.length === 0 ? {} : {}, {
    ax: common_vendor.f($data.favorites, (item, idx, i0) => {
      var _a;
      return {
        a: common_vendor.t(item.image || "🍽️"),
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.cuisine_type),
        d: common_vendor.t(((_a = item.nutrition) == null ? void 0 : _a.calories) || 0),
        e: common_vendor.o(($event) => $options.removeFavorite(item.id), item.id),
        f: item.id,
        g: common_vendor.o(($event) => $options.goToFavoriteDetail(item), item.id)
      };
    }),
    ay: $data.showFavoritesModal ? 1 : "",
    az: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-04d37cba"]]);
wx.createPage(MiniProgramPage);
