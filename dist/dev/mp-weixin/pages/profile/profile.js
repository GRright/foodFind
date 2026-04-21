"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_family = require("../../utils/family.js");
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
      _weeklyCheckInDays: 0,
      _myMealCount: 0,
      _weeklyNutritionCache: null,
      _familyGroup: null,
      prefs: {
        noCookMode: false,
        userType: "adult",
        userCount: 2,
        taste: "light",
        allergies: [],
        restrictions: [],
        cuisines: [],
        healthTags: []
      },
      healthTags: utils_family.HEALTH_TAGS,
      healthTagCategories: utils_family.HEALTH_TAG_CATEGORIES,
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
      return this._weeklyCheckInDays;
    },
    familySummary() {
      if (!this._familyGroup)
        return "创建或加入家庭群组";
      return this._familyGroup.name + " · " + this._familyGroup.members.length + "人";
    },
    hasFamily() {
      return this._familyGroup !== null && this._familyGroup !== void 0;
    },
    prefSummaryText() {
      const parts = [];
      const ut = this.userTypeOptions.find((o) => o.value === this.prefs.userType);
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
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition();
      }
      return this._weeklyNutritionCache.calories;
    },
    weeklyProtein() {
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition();
      }
      return this._weeklyNutritionCache.protein;
    },
    weeklyFat() {
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition();
      }
      return this._weeklyNutritionCache.fat;
    },
    weeklyCarbs() {
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition();
      }
      return this._weeklyNutritionCache.carbs;
    },
    nutritionTotal() {
      return this.weeklyProtein + this.weeklyFat + this.weeklyCarbs;
    },
    proteinPercent() {
      const t = this.nutritionTotal;
      return t > 0 ? Math.round(this.weeklyProtein / t * 100) : 33;
    },
    fatPercent() {
      const t = this.nutritionTotal;
      return t > 0 ? Math.round(this.weeklyFat / t * 100) : 33;
    },
    carbsPercent() {
      const t = this.nutritionTotal;
      return t > 0 ? 100 - this.proteinPercent - this.fatPercent : 34;
    },
    pieChartStyle() {
      const p = this.proteinPercent;
      const f = this.fatPercent;
      this.carbsPercent;
      return `background: conic-gradient(#07c160 0% ${p}%, #ff9f43 ${p}% ${p + f}%, #5b9bd5 ${p + f}% 100%)`;
    },
    myMealCount() {
      return this._myMealCount;
    },
    partnerMealCount() {
      const partnerChecks = common_vendor.index.getStorageSync("foodfind_partner_checks");
      if (partnerChecks) {
        let count = 0;
        Object.keys(partnerChecks).forEach((date) => {
          const day = partnerChecks[date];
          if (day.breakfast)
            count++;
          if (day.lunch)
            count++;
          if (day.dinner)
            count++;
        });
        return count;
      }
      return 0;
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
  onLoad() {
    this.loadPairInfo();
    this.loadPrefs();
    this.loadCachedStats();
    this.loadFavorites();
    this.loadFamilyData();
  },
  onShow() {
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
  },
  methods: {
    loadCachedStats() {
      const checks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      let days = 0;
      let count = 0;
      Object.keys(checks).forEach((date) => {
        const day = checks[date];
        if (day.breakfast || day.lunch || day.dinner)
          days++;
        if (day.breakfast)
          count++;
        if (day.lunch)
          count++;
        if (day.dinner)
          count++;
      });
      this._weeklyCheckInDays = days;
      this._myMealCount = count;
    },
    loadPrefs() {
      const cached = common_vendor.index.getStorageSync("foodfind_detailed_prefs");
      if (cached) {
        this.prefs = { ...this.prefs, ...cached };
      }
    },
    loadMyWeeklyMeals() {
      const meals = [];
      const allRecipes = [...utils_constants.ALL_RECIPES.breakfast, ...utils_constants.ALL_RECIPES.lunch, ...utils_constants.ALL_RECIPES.dinner];
      const cachedDate = common_vendor.index.getStorageSync("foodfind_meals_date");
      const cachedMeals = common_vendor.index.getStorageSync("foodfind_meals");
      if (cachedDate && cachedMeals) {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
          if (cachedDate === d) {
            ["breakfast", "lunch", "dinner"].forEach((mealType) => {
              if (cachedMeals[mealType]) {
                cachedMeals[mealType].forEach((food) => {
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
      this._weeklyNutritionCache = null;
    },
    calcWeeklyNutrition() {
      return this.myWeeklyMeals.reduce((acc, m) => {
        var _a, _b, _c, _d;
        acc.calories += ((_a = m.nutrition) == null ? void 0 : _a.calories) || 0;
        acc.protein += ((_b = m.nutrition) == null ? void 0 : _b.protein) || 0;
        acc.fat += ((_c = m.nutrition) == null ? void 0 : _c.fat) || 0;
        acc.carbs += ((_d = m.nutrition) == null ? void 0 : _d.carbs) || 0;
        return acc;
      }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
    },
    loadPairStats() {
      return;
    },
    openReport() {
      this.showReportModal = true;
      this.loadWeeklyReport();
      this.loadMyWeeklyMeals();
      this.loadCachedStats();
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
      if (this.hasFamily) {
        const { updateMyHealthTags } = require("@/utils/family.js");
        updateMyHealthTags(this.prefs.healthTags);
      }
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
    openSpecialDates() {
      common_vendor.index.navigateTo({ url: "/pages/index/index?openSpecial=1" });
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
        title: "关于吃点啥 v2.4",
        content: "为情侣/家人打造的共同决策吃什么的小工具\n\n✅ 智能一周菜单规划\n✅ 荤素营养均衡算法\n✅ 云端配对，跨设备同步\n✅ 分享菜单+双向确认\n✅ 互动打卡+火花系统\n✅ 本周饮食报告+营养饼图\n✅ 收藏喜欢的菜品\n✅ 生日/纪念日特别菜单",
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
    },
    loadFamilyData() {
      this._familyGroup = utils_family.getFamilyGroup();
    },
    goToFamily() {
      common_vendor.index.navigateTo({ url: "/pages/family/family" });
    },
    getTagsByCategory(category) {
      return utils_family.HEALTH_TAGS.filter((t) => t.category === category);
    },
    toggleHealthTag(tagId) {
      const idx = this.prefs.healthTags.indexOf(tagId);
      if (idx > -1) {
        this.prefs.healthTags.splice(idx, 1);
      } else {
        this.prefs.healthTags.push(tagId);
      }
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
    r: common_vendor.t($options.familySummary),
    s: common_vendor.o((...args) => $options.goToFamily && $options.goToFamily(...args)),
    t: common_vendor.o((...args) => $options.openReport && $options.openReport(...args))
  }, {
    o: $data.hasPartner && $data.pairStatus === "pending",
    v: common_vendor.t($data.favorites.length > 0 ? `已收藏 ${$data.favorites.length} 道菜` : "收藏喜欢的菜品"),
    w: common_vendor.o((...args) => $options.openFavorites && $options.openFavorites(...args)),
    x: common_vendor.o((...args) => $options.goToShare && $options.goToShare(...args)),
    y: common_vendor.o((...args) => $options.openSpecialDates && $options.openSpecialDates(...args)),
    z: common_vendor.t($options.prefSummaryText),
    A: common_vendor.o((...args) => $options.openPrefModal && $options.openPrefModal(...args)),
    B: common_vendor.o((...args) => $options.clearCache && $options.clearCache(...args)),
    C: common_vendor.o((...args) => $options.showAbout && $options.showAbout(...args)),
    D: $data.showPrefModal ? 1 : "",
    E: common_vendor.o((...args) => $options.closePrefModal && $options.closePrefModal(...args)),
    F: common_vendor.o((...args) => $options.closePrefModal && $options.closePrefModal(...args)),
    G: $data.prefs.noCookMode ? 1 : "",
    H: common_vendor.o(($event) => $data.prefs.noCookMode = !$data.prefs.noCookMode),
    I: common_vendor.f($data.userTypeOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.userType === opt.value ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $data.prefs.userType = opt.value, opt.value)
      };
    }),
    J: common_vendor.f($data.userCountOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: String($data.prefs.userCount) === opt.value ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $data.prefs.userCount = Number(opt.value), opt.value)
      };
    }),
    K: common_vendor.f($data.tasteOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.taste === opt.value ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $data.prefs.taste = opt.value, opt.value)
      };
    }),
    L: common_vendor.f($data.allergyOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.allergies.includes(opt.value) ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $options.toggleMulti("allergies", opt.value), opt.value)
      };
    }),
    M: common_vendor.f($data.restrictionOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.restrictions.includes(opt.value) ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $options.toggleMulti("restrictions", opt.value), opt.value)
      };
    }),
    N: common_vendor.f($data.cuisineOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: $data.prefs.cuisines.includes(opt.value) ? 1 : "",
        c: opt.value,
        d: common_vendor.o(($event) => $options.toggleMulti("cuisines", opt.value), opt.value)
      };
    }),
    O: $options.hasFamily
  }, $options.hasFamily ? {
    P: common_vendor.f($data.healthTagCategories, (category, k0, i0) => {
      return {
        a: common_vendor.t(category),
        b: common_vendor.f($options.getTagsByCategory(category), (tag, k1, i1) => {
          return {
            a: common_vendor.t(tag.icon),
            b: common_vendor.t(tag.name),
            c: $data.prefs.healthTags.includes(tag.id) ? 1 : "",
            d: tag.id,
            e: common_vendor.o(($event) => $options.toggleHealthTag(tag.id), tag.id)
          };
        }),
        c: category
      };
    })
  } : {}, {
    Q: common_vendor.o((...args) => $options.savePrefs && $options.savePrefs(...args)),
    R: $data.showPrefModal ? 1 : "",
    S: $data.showReportModal ? 1 : "",
    T: common_vendor.o((...args) => $options.closeReport && $options.closeReport(...args)),
    U: common_vendor.t($options.formatWeekDateRange()),
    V: common_vendor.o((...args) => $options.closeReport && $options.closeReport(...args)),
    W: $options.reportMode === "solo"
  }, $options.reportMode === "solo" ? {
    X: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    Y: common_vendor.t($options.reportStreakDays),
    Z: common_vendor.t($options.reportMotto)
  } : $options.reportMode === "pair" ? {
    ab: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    ac: common_vendor.t($options.relationLabel),
    ad: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    ae: common_vendor.t($options.reportStreakDays)
  } : {
    af: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    ag: common_vendor.t($data.prefs.userCount),
    ah: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    ai: common_vendor.t($options.reportStreakDays)
  }, {
    aa: $options.reportMode === "pair",
    aj: common_vendor.t($options.weeklyCalories),
    ak: common_vendor.t($options.myMealCount),
    al: common_vendor.t($options.weeklyCheckInDays),
    am: common_vendor.t($options.weeklyProtein),
    an: common_vendor.t($options.nutritionTotal),
    ao: common_vendor.s($options.pieChartStyle),
    ap: common_vendor.t($options.weeklyProtein),
    aq: common_vendor.t($options.proteinPercent),
    ar: common_vendor.t($options.weeklyFat),
    as: common_vendor.t($options.fatPercent),
    at: common_vendor.t($options.weeklyCarbs),
    av: common_vendor.t($options.carbsPercent),
    aw: common_vendor.f($data.weeklyReportData, (day, idx, i0) => {
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
    ax: $data.hasPartner && $data.pairStatus === "paired"
  }, $data.hasPartner && $data.pairStatus === "paired" ? {
    ay: common_vendor.t(($data.userInfo.nickname || "我").charAt(0)),
    az: Math.min(100, $options.myMealPercent) + "%",
    aA: common_vendor.t($options.myMealCount),
    aB: common_vendor.t(($data.partnerInfo.nickname || "TA").charAt(0)),
    aC: common_vendor.t(($data.partnerInfo.nickname || "TA").slice(0, 4)),
    aD: Math.min(100, $options.partnerMealPercent) + "%",
    aE: common_vendor.t($options.partnerMealCount)
  } : {}, {
    aF: $data.showReportModal ? 1 : "",
    aG: $data.showFavoritesModal ? 1 : "",
    aH: common_vendor.o((...args) => $options.closeFavorites && $options.closeFavorites(...args)),
    aI: common_vendor.o((...args) => $options.closeFavorites && $options.closeFavorites(...args)),
    aJ: $data.favorites.length === 0
  }, $data.favorites.length === 0 ? {} : {}, {
    aK: common_vendor.f($data.favorites, (item, idx, i0) => {
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
    aL: $data.showFavoritesModal ? 1 : "",
    aM: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-04d37cba"]]);
wx.createPage(MiniProgramPage);
