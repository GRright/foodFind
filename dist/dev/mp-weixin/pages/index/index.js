"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_family = require("../../utils/family.js");
const utils_festival = require("../../utils/festival.js");
const _sfc_main = {
  data() {
    return {
      dailyMeals: null,
      userCount: 2,
      scrollHeight: "calc(100vh - 260rpx)",
      isRefreshing: "",
      noCookMode: false,
      feedList: [],
      feedScrollHeight: "calc(100vh - 380rpx)",
      pageEnter: true,
      mealCheckIn: { breakfast: false, lunch: false, dinner: false },
      swipeCardId: null,
      swipeStartY: 0,
      swipeOffset: 0,
      swipeMealKey: "",
      flippingCardId: null,
      newCardId: null,
      showSparkle: false,
      sparkleCardId: null,
      showDeleteModal: false,
      deleteTargetFood: null,
      deleteTargetMealKey: "",
      showGestureGuide: false,
      shareBtnClicked: false,
      ggStage: 0,
      ggDemoFood: null,
      ggSwipeOffset: 0,
      ggDemoCardAnim: "",
      ggShowSparkle: false,
      ggLocked: false,
      showNotifPanel: false,
      notifList: [],
      unreadCount: 0,
      showCommentModal: false,
      commentList: [],
      commentInput: "",
      currentFeedItem: null,
      showVoteModal: false,
      voteTitle: "今天吃什么？",
      voteOptions: ["火锅", "烧烤", "日料"],
      currentVote: null,
      showAchievementModal: false,
      streakDays: 0,
      achievements: [],
      pairId: "",
      pageReady: false,
      _nutritionCache: null,
      specialBanner: null,
      showSpecialModal: false,
      specialDateForm: { name: "", month: 1, day: 1, type: "birthday" }
    };
  },
  computed: {
    greetingText() {
      const h = (/* @__PURE__ */ new Date()).getHours();
      if (h < 6)
        return "夜深了，早点休息";
      if (h < 9)
        return "早上好";
      if (h < 12)
        return "中午好";
      if (h < 14)
        return "午休时间";
      if (h < 18)
        return "下午好";
      return "晚上好";
    },
    greetingTextNoCook() {
      const h = (/* @__PURE__ */ new Date()).getHours();
      if (h < 6)
        return "夜深了";
      if (h < 9)
        return "早安";
      if (h < 12)
        return "中午了";
      if (h < 14)
        return "下午茶时间";
      if (h < 18)
        return "晚餐时间";
      return "晚上好";
    },
    greetingSubText() {
      const h = (/* @__PURE__ */ new Date()).getHours();
      if (h < 9)
        return "今天吃点好的~";
      if (h < 12)
        return "午餐想好吃什么了吗";
      if (h < 14)
        return "吃饱了才有力气";
      if (h < 18)
        return "晚餐安排起来";
      return "明天也要好好吃饭";
    },
    todayLabel() {
      const d = /* @__PURE__ */ new Date();
      const w = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
      return `${d.getMonth() + 1}月${d.getDate()}日 ${w}`;
    },
    mealSections() {
      if (!this.dailyMeals)
        return [];
      return [
        { key: "breakfast", title: "早餐", icon: "☀", recipes: this.dailyMeals.breakfast || [] },
        { key: "lunch", title: "午餐", icon: "🌞", recipes: this.dailyMeals.lunch || [] },
        { key: "dinner", title: "晚餐", icon: "🌙", recipes: this.dailyMeals.dinner || [] }
      ];
    },
    totalCalories() {
      if (this._nutritionCache)
        return this._nutritionCache.calories;
      if (!this.dailyMeals)
        return 0;
      let c = 0, p = 0, f = 0, cb = 0;
      ["breakfast", "lunch", "dinner"].forEach((k) => {
        (this.dailyMeals[k] || []).forEach((r) => {
          var _a, _b, _c, _d;
          c += ((_a = r.nutrition) == null ? void 0 : _a.calories) || 0;
          p += ((_b = r.nutrition) == null ? void 0 : _b.protein) || 0;
          f += ((_c = r.nutrition) == null ? void 0 : _c.fat) || 0;
          cb += ((_d = r.nutrition) == null ? void 0 : _d.carbs) || 0;
        });
      });
      this._nutritionCache = { calories: Math.round(c * this.userCount), protein: Math.round(p), fat: Math.round(f), carbs: Math.round(cb) };
      return this._nutritionCache.calories;
    },
    totalProtein() {
      if (this._nutritionCache)
        return this._nutritionCache.protein;
      return 0;
    },
    totalFat() {
      if (this._nutritionCache)
        return this._nutritionCache.fat;
      return 0;
    },
    totalCarbs() {
      if (this._nutritionCache)
        return this._nutritionCache.carbs;
      return 0;
    },
    ggOverlayTitle() {
      const titles = [
        "上滑试试换菜？",
        "下滑试试删除？"
      ];
      return titles[this.ggStage] || "引导完成！";
    },
    ggOverlaySub() {
      const subs = [
        "按住下方菜品，往上滑动试试",
        "按住下方菜品，往下滑动试试"
      ];
      return subs[this.ggStage] || "";
    },
    ggHintClass() {
      const off = this.ggSwipeOffset;
      if (this.ggStage === 0 && off > 30)
        return "show-up";
      if (this.ggStage === 1 && off < -30)
        return "show-down";
      return "";
    },
    ggHintIcon() {
      return this.ggStage === 0 ? "✨" : this.ggStage === 1 ? "✕" : "";
    },
    ggHintText() {
      return this.ggStage === 0 ? "换一道" : this.ggStage === 1 ? "删除" : "";
    },
    ggActIcon() {
      const icons = ["↻", "✕"];
      return icons[this.ggStage] || "✓";
    },
    ggActText() {
      const texts = ["上滑换菜 ↑", "下滑删除 ↓"];
      return texts[this.ggStage] || "知道了";
    }
  },
  onLoad(options) {
    this.loadMode();
    this.loadPairId();
    this.loadSpecialBanner();
    this.preloadMeals();
    this.$nextTick(() => {
      this.loadTodayCheckIn();
      this.loadStreak();
      this.loadAchievements();
      this.checkGestureGuide();
      if (options && options.openSpecial === "1") {
        setTimeout(() => {
          this.showSpecialModal = true;
        }, 500);
      }
    });
  },
  onReady() {
    this.pageReady = true;
  },
  onShow() {
    this.shareBtnClicked = false;
    this.pageEnter = true;
    setTimeout(() => {
      this.pageEnter = false;
    }, 300);
    this.loadMeals();
    this.loadTodayCheckIn();
  },
  methods: {
    getSwipeOpacity() {
      if (!this.swipeCardId)
        return 1;
      const absOffset = Math.abs(this.swipeOffset);
      if (absOffset < 40)
        return 1;
      if (absOffset > 120)
        return 0.3;
      return 1 - (absOffset - 40) / 80 * 0.7;
    },
    getCardClass(id) {
      const classes = [];
      if (this.swipeCardId === id)
        classes.push("swiping");
      if (this.flippingCardId === id)
        classes.push("flipping");
      if (this.newCardId === id)
        classes.push("new-card");
      return classes.join(" ");
    },
    getCardStyle(id) {
      if (this.swipeCardId !== id && this.flippingCardId !== id)
        return "";
      if (this.flippingCardId === id)
        return "animation: none;";
      let rotateX = 0;
      if (this.swipeOffset > 30) {
        rotateX = Math.min((this.swipeOffset - 30) / 2, 45);
      } else if (this.swipeOffset < -30) {
        rotateX = Math.max((this.swipeOffset + 30) / 2, -25);
      }
      return `transform: translateY(${Math.round(this.swipeOffset * 0.5)}rpx) rotateX(${rotateX}deg); opacity:${this.getSwipeOpacity()};`;
    },
    loadMode() {
      const prefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs") || {};
      this.noCookMode = !!prefs.noCookMode;
    },
    recordAppOpen() {
      return;
    },
    loadTodayCheckIn() {
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const personalChecks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      if (personalChecks[todayStr]) {
        this.mealCheckIn = { ...personalChecks[todayStr] };
      }
    },
    markMealEaten(mealKey) {
      const newState = !this.mealCheckIn[mealKey];
      this.mealCheckIn[mealKey] = newState;
      const personalChecks = common_vendor.index.getStorageSync("foodfind_personal_checks") || {};
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      if (!personalChecks[todayStr])
        personalChecks[todayStr] = { breakfast: false, lunch: false, dinner: false };
      personalChecks[todayStr][mealKey] = newState;
      common_vendor.index.setStorageSync("foodfind_personal_checks", personalChecks);
      if (newState) {
        common_vendor.index.showToast({ title: `${mealKey === "breakfast" ? "早餐" : mealKey === "lunch" ? "午餐" : "晚餐"}已打卡 ✓`, icon: "success" });
      }
    },
    takePhoto() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.addFeedItem(res.tempFilePaths[0]);
          }
        }
      });
    },
    choosePhoto() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.addFeedItem(res.tempFilePaths[0]);
          }
        }
      });
    },
    addFeedItem(imagePath) {
      var _a, _b, _c;
      const app = getApp();
      const item = {
        id: "feed_" + Date.now(),
        image: imagePath,
        fromName: ((_b = (_a = app == null ? void 0 : app.globalData) == null ? void 0 : _a.userInfo) == null ? void 0 : _b.nickname) || "我",
        fromOpenid: "",
        caption: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isSelf: true
      };
      const feed = [item, ...this.feedList];
      this.feedList = feed;
      const saved = common_vendor.index.getStorageSync("foodfind_feed") || {};
      const todayStr = this.getTodayStr();
      if (!saved[todayStr])
        saved[todayStr] = [];
      saved[todayStr].unshift(item);
      common_vendor.index.setStorageSync("foodfind_feed", saved);
      common_vendor.index.showToast({ title: "已分享", icon: "success" });
      if (((_c = app == null ? void 0 : app.globalData) == null ? void 0 : _c.partnerInfo) && app.globalData.pairStatus === "paired")
        ;
    },
    loadFeed() {
      const saved = common_vendor.index.getStorageSync("foodfind_feed") || {};
      const todayStr = this.getTodayStr();
      this.feedList = saved[todayStr] || [];
      const partnerFeed = common_vendor.index.getStorageSync("foodfind_partner_feed") || {};
      if (partnerFeed[todayStr]) {
        const combined = [...this.feedList, ...partnerFeed[todayStr]];
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        this.feedList = combined;
      }
    },
    loadMoreFeed() {
    },
    previewImage(url) {
      const urls = this.feedList.filter((f) => f.image).map((f) => f.image);
      common_vendor.index.previewImage({ current: url, urls });
    },
    formatTime(isoStr) {
      try {
        const d = new Date(isoStr);
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
      } catch (e) {
        return "";
      }
    },
    checkGestureGuide() {
      const done = common_vendor.index.getStorageSync("foodfind_gesture_guide");
      if (done)
        return;
      this.showGestureGuide = true;
    },
    ggDemoCardTouchStart(e) {
      if (this.ggLocked)
        return;
      this._ggTouchStartY = e.touches[0].clientY;
      this._ggTouchStartX = e.touches[0].clientX;
      this.ggSwipeOffset = 0;
      this.ggDemoCardAnim = "active";
    },
    ggDemoCardTouchMove(e) {
      if (this.ggLocked)
        return;
      const currentY = e.touches[0].clientY;
      this.ggSwipeOffset = this._ggTouchStartY - currentY;
    },
    ggDemoCardTouchEnd() {
      if (this.ggLocked)
        return;
      this.ggDemoCardAnim = "";
      if (this.ggStage === 0 && this.ggSwipeOffset > 50) {
        this.ggCompleteStage0();
      } else if (this.ggStage === 1 && this.ggSwipeOffset < -50) {
        this.ggCompleteStage1();
      } else {
        this.ggSwipeOffset = 0;
      }
    },
    ggCompleteStage0() {
      this.ggLocked = true;
      this.ggShowSparkle = true;
      this.ggDemoCardAnim = "flip-out";
      setTimeout(() => {
        const pool = utils_constants.ALL_RECIPES.breakfast || [];
        this.ggDemoFood = pool[Math.floor(Math.random() * pool.length)];
        this.ggDemoCardAnim = "flip-in";
        this.ggSwipeOffset = 0;
        setTimeout(() => {
          this.ggShowSparkle = false;
          this.ggDemoCardAnim = "";
          this.ggStage = 1;
          this.ggLocked = false;
        }, 400);
      }, 350);
    },
    ggCompleteStage1() {
      this.ggLocked = true;
      this.ggDemoCardAnim = "swipe-away";
      setTimeout(() => {
        const pool = utils_constants.ALL_RECIPES.lunch || [];
        this.ggDemoFood = pool[Math.floor(Math.random() * pool.length)];
        this.ggSwipeOffset = 0;
        this.ggDemoCardAnim = "slide-in";
        setTimeout(() => {
          this.ggDemoCardAnim = "";
          this.closeGestureGuide();
        }, 400);
      }, 400);
    },
    ggAct() {
      if (this.ggLocked)
        return;
      if (this.ggStage === 0) {
        this.ggSwipeOffset = 100;
        this.ggCompleteStage0();
      } else if (this.ggStage === 1) {
        this.ggSwipeOffset = -100;
        this.ggCompleteStage1();
      }
    },
    closeGestureGuide() {
      this.showGestureGuide = false;
      this.ggStage = 0;
      this.ggLocked = false;
      this.ggSwipeOffset = 0;
      this.ggShowSparkle = false;
      this.ggDemoCardAnim = "";
      common_vendor.index.setStorageSync("foodfind_gesture_guide", true);
    },
    onSwipeStart(food, mealKey, e) {
      this.swipeCardId = food.id;
      this.swipeMealKey = mealKey;
      this.swipeOffset = 0;
      this.swipeStartY = e.touches[0].clientY;
    },
    onSwipeMove(e) {
      if (!this.swipeCardId)
        return;
      const currentY = e.touches[0].clientY;
      let delta = this.swipeStartY - currentY;
      if (delta > 160)
        delta = 160;
      if (delta < -100)
        delta = -100;
      this.swipeOffset = Math.round(delta);
    },
    onSwipeEnd(food, mealKey) {
      if (!this.swipeCardId)
        return;
      const offset = this.swipeOffset;
      if (offset >= 60) {
        this.triggerSwapAnimation(food, mealKey);
      } else if (offset <= -50) {
        this.deleteTargetFood = food;
        this.deleteTargetMealKey = mealKey;
        this.showDeleteModal = true;
        this.resetSwipe();
      } else {
        this.resetSwipe();
      }
    },
    resetSwipe() {
      this.swipeCardId = null;
      this.swipeOffset = 0;
      this.swipeMealKey = "";
    },
    triggerSwapAnimation(food, mealKey) {
      this.flippingCardId = food.id;
      this.sparkleCardId = food.id;
      this.showSparkle = true;
      setTimeout(() => {
        this.showSparkle = false;
      }, 600);
      setTimeout(() => {
        this.swapOneFood(food, mealKey);
        this.newCardId = food.id;
        this.flippingCardId = null;
        setTimeout(() => {
          this.newCardId = null;
          this.resetSwipe();
        }, 450);
      }, 350);
    },
    confirmDelete() {
      if (!this.deleteTargetFood || !this.deleteTargetMealKey)
        return;
      const meals = this.dailyMeals[this.deleteTargetMealKey] || [];
      const idx = meals.findIndex((r) => r.id === this.deleteTargetFood.id);
      if (idx > -1) {
        meals.splice(idx, 1);
        common_vendor.index.setStorageSync("foodfind_meals", this.dailyMeals);
        const wc = common_vendor.index.getStorageSync("foodfind_weekly") || {};
        wc[this.getTodayStr()] = this.dailyMeals;
        common_vendor.index.setStorageSync("foodfind_weekly", wc);
      }
      common_vendor.index.showToast({ title: `已删除「${this.deleteTargetFood.name}」`, icon: "none" });
      this.showDeleteModal = false;
      this.deleteTargetFood = null;
      this.deleteTargetMealKey = "";
    },
    swapOneFood(food, mealKey) {
      const meals = this.dailyMeals[mealKey] || [];
      const idx = meals.findIndex((r) => r.id === food.id);
      if (idx > -1) {
        const pool = utils_constants.ALL_RECIPES[mealKey] || [];
        const otherIds = new Set(meals.filter((r) => r.id !== food.id).map((r) => r.id));
        const available = pool.filter((r) => !otherIds.has(r.id));
        meals[idx] = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)];
        common_vendor.index.setStorageSync("foodfind_meals", this.dailyMeals);
        const wc = common_vendor.index.getStorageSync("foodfind_weekly") || {};
        wc[this.getTodayStr()] = this.dailyMeals;
        common_vendor.index.setStorageSync("foodfind_weekly", wc);
      }
      common_vendor.index.showToast({ title: `已更换「${food.name}」`, icon: "none" });
    },
    preloadMeals() {
      const cached = common_vendor.index.getStorageSync("foodfind_meals");
      const cachedDate = common_vendor.index.getStorageSync("foodfind_meals_date");
      if (cached && cachedDate && cachedDate === this.getTodayStr()) {
        this.dailyMeals = cached;
        const app = getApp();
        if (app == null ? void 0 : app.globalData)
          app.globalData.dailyMeals = cached;
        return;
      }
      const weeklyCache = common_vendor.index.getStorageSync("foodfind_weekly");
      if (weeklyCache && weeklyCache[this.getTodayStr()]) {
        this.dailyMeals = weeklyCache[this.getTodayStr()];
        common_vendor.index.setStorageSync("foodfind_meals", this.dailyMeals);
        common_vendor.index.setStorageSync("foodfind_meals_date", this.getTodayStr());
        const app = getApp();
        if (app == null ? void 0 : app.globalData)
          app.globalData.dailyMeals = this.dailyMeals;
        return;
      }
      this.generateDailyMeals();
    },
    loadMeals() {
      this._nutritionCache = null;
      if (!this.dailyMeals) {
        this.preloadMeals();
      }
    },
    getTodayStr() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    getRecipeCount() {
      const c = this.userCount;
      if (c === 1)
        return 2;
      if (c === 2)
        return 3;
      if (c <= 4)
        return 4;
      return 5;
    },
    shuffle(arr, n) {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    },
    balanced(recipes, n) {
      const meat = recipes.filter((r) => r.type === "meat" || r.type === "mixed");
      const veg = recipes.filter((r) => r.type === "vegetarian");
      const mc = Math.ceil(n * 0.55), vc = n - mc;
      return [...this.shuffle(meat, mc), ...this.shuffle(veg, vc)].sort(() => Math.random() - 0.5);
    },
    generateDailyMeals() {
      const n = this.getRecipeCount();
      const familyTags = utils_family.getFamilyHealthTags();
      const userPrefs = common_vendor.index.getStorageSync("foodfind_detailed_prefs") || {};
      const allHealthTags = [.../* @__PURE__ */ new Set([...familyTags, ...userPrefs.healthTags || []])];
      let breakfastPool = utils_constants.ALL_RECIPES.breakfast;
      let lunchPool = utils_constants.ALL_RECIPES.lunch;
      let dinnerPool = utils_constants.ALL_RECIPES.dinner;
      if (allHealthTags.length > 0) {
        breakfastPool = utils_family.filterRecipesByHealthTags(breakfastPool, allHealthTags);
        lunchPool = utils_family.filterRecipesByHealthTags(lunchPool, allHealthTags);
        dinnerPool = utils_family.filterRecipesByHealthTags(dinnerPool, allHealthTags);
      }
      if (breakfastPool.length === 0)
        breakfastPool = utils_constants.ALL_RECIPES.breakfast;
      if (lunchPool.length === 0)
        lunchPool = utils_constants.ALL_RECIPES.lunch;
      if (dinnerPool.length === 0)
        dinnerPool = utils_constants.ALL_RECIPES.dinner;
      const dailyMeals = {
        breakfast: this.shuffle(breakfastPool, n),
        lunch: this.balanced(lunchPool, n),
        dinner: this.balanced(dinnerPool, n)
      };
      this.dailyMeals = dailyMeals;
      const todayStr = this.getTodayStr();
      common_vendor.index.setStorageSync("foodfind_meals", dailyMeals);
      common_vendor.index.setStorageSync("foodfind_meals_date", todayStr);
      const app = getApp();
      if (app == null ? void 0 : app.globalData)
        app.globalData.dailyMeals = dailyMeals;
      const weeklyCache = common_vendor.index.getStorageSync("foodfind_weekly") || {};
      weeklyCache[todayStr] = dailyMeals;
      common_vendor.index.setStorageSync("foodfind_weekly", weeklyCache);
      if (app == null ? void 0 : app.globalData)
        app.globalData.weeklyMeals = weeklyCache;
    },
    refreshMeal(mealKey) {
      if (this.isRefreshing)
        return;
      this.isRefreshing = mealKey;
      setTimeout(() => {
        const n = this.getRecipeCount();
        const pool = utils_constants.ALL_RECIPES[mealKey] || [];
        const currentIds = new Set((this.dailyMeals[mealKey] || []).map((r) => r.id));
        const available = pool.filter((r) => !currentIds.has(r.id));
        this.dailyMeals[mealKey] = available.length >= n ? mealKey === "breakfast" ? this.shuffle(available, n) : this.balanced(available, n) : mealKey === "breakfast" ? this.shuffle(pool, n) : this.balanced(pool, n);
        common_vendor.index.setStorageSync("foodfind_meals", this.dailyMeals);
        const wc = common_vendor.index.getStorageSync("foodfind_weekly") || {};
        wc[this.getTodayStr()] = this.dailyMeals;
        common_vendor.index.setStorageSync("foodfind_weekly", wc);
        this.isRefreshing = "";
        common_vendor.index.showToast({ title: `已更换${mealKey === "breakfast" ? "早餐" : mealKey === "lunch" ? "午餐" : "晚餐"}`, icon: "none" });
      }, 400);
    },
    regenerateAll() {
      common_vendor.index.showToast({ title: "已重新生成", icon: "success" });
      setTimeout(() => {
        this.generateDailyMeals();
      }, 300);
    },
    goToDetail(recipe) {
      common_vendor.index.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` });
    },
    goToShoppingList() {
      common_vendor.index.navigateTo({ url: "/pages/shoppingList/shoppingList" });
    },
    loadSpecialBanner() {
      this.specialBanner = utils_festival.getBirthdayMenuRecommendation();
    },
    onSpecialBannerClick() {
      if (this.specialBanner) {
        common_vendor.index.showToast({ title: this.specialBanner.subtitle, icon: "none", duration: 2e3 });
      }
    },
    onSpecialDatePick(e) {
      const parts = e.detail.value.split("-");
      if (parts.length >= 3) {
        this.specialDateForm.month = parseInt(parts[1]);
        this.specialDateForm.day = parseInt(parts[2]);
      }
    },
    saveSpecialDate() {
      if (!this.specialDateForm.name.trim()) {
        common_vendor.index.showToast({ title: "请输入名称", icon: "none" });
        return;
      }
      utils_festival.addSpecialDate({
        name: this.specialDateForm.name.trim(),
        month: this.specialDateForm.month,
        day: this.specialDateForm.day,
        type: this.specialDateForm.type
      });
      common_vendor.index.showToast({ title: "已保存", icon: "success" });
      this.showSpecialModal = false;
      this.loadSpecialBanner();
    },
    onShareClick() {
      this.shareBtnClicked = true;
      common_vendor.index.showToast({ title: "请点击右上角分享", icon: "none" });
    },
    onShareAppMessage() {
      var _a, _b;
      const app = getApp();
      const partnerName = ((_b = (_a = app == null ? void 0 : app.globalData) == null ? void 0 : _a.partnerInfo) == null ? void 0 : _b.nickname) || "TA";
      if (this.noCookMode) {
        return { title: `来看看我今天吃了什么~`, path: "/pages/index/index", imageUrl: "" };
      }
      const cal = this.totalCalories;
      return { title: `${partnerName}，今天吃这些？(${cal}kcal)`, path: "/pages/index/index", imageUrl: "" };
    },
    loadMore() {
    },
    loadPairId() {
      const partner = common_vendor.index.getStorageSync("foodfind_partner");
      if (partner && partner.pairId) {
        this.pairId = partner.pairId;
      }
    },
    loadNotifications() {
      return;
    },
    showNotifications() {
      this.showNotifPanel = true;
    },
    openComment(item) {
      this.currentFeedItem = item;
      this.showCommentModal = true;
      this.commentInput = "";
      this.commentList = [];
    },
    submitComment() {
      if (!this.commentInput.trim() || !this.currentFeedItem)
        return;
      this.commentInput = "";
      this.showCommentModal = false;
      if (this.currentFeedItem) {
        this.currentFeedItem.commentCount = (this.currentFeedItem.commentCount || 0) + 1;
      }
      common_vendor.index.showToast({ title: "评论成功", icon: "success" });
    },
    toggleLike(item) {
      item.liked = !item.liked;
      if (item.liked) {
        item.likeCount = (item.likeCount || 0) + 1;
      } else {
        item.likeCount = Math.max(0, (item.likeCount || 0) - 1);
      }
      const saved = common_vendor.index.getStorageSync("foodfind_feed") || {};
      const todayStr = this.getTodayStr();
      if (saved[todayStr]) {
        const idx = saved[todayStr].findIndex((f) => f.id === item.id);
        if (idx > -1) {
          saved[todayStr][idx].liked = item.liked;
          saved[todayStr][idx].likeCount = item.likeCount;
          common_vendor.index.setStorageSync("foodfind_feed", saved);
        }
      }
    },
    addVoteOption() {
      if (this.voteOptions.length < 5) {
        this.voteOptions.push("");
      }
    },
    removeVoteOption(i) {
      if (this.voteOptions.length > 2) {
        this.voteOptions.splice(i, 1);
      }
    },
    createVoteAction() {
      if (!this.voteTitle.trim()) {
        common_vendor.index.showToast({ title: "请输入投票标题", icon: "none" });
        return;
      }
      const opts = this.voteOptions.filter((o) => o.trim());
      if (opts.length < 2) {
        common_vendor.index.showToast({ title: "至少需要2个选项", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "投票已创建", icon: "success" });
      this.showVoteModal = false;
    },
    loadActiveVote() {
      return;
    },
    doVote(optionIndex) {
      common_vendor.index.showToast({ title: "投票成功", icon: "success" });
      this.showVoteModal = false;
    },
    getVotePercent(opt, vote) {
      const total = vote.options.reduce((sum, o) => sum + o.count, 0);
      if (total === 0)
        return 0;
      return Math.round(opt.count / total * 100);
    },
    loadStreak() {
      const streak = common_vendor.index.getStorageSync("foodfind_streak") || { days: 0, lastDate: "" };
      const today = this.getTodayStr();
      if (streak.lastDate === today) {
        this.streakDays = streak.days;
      } else {
        const yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (streak.lastDate === yStr) {
          this.streakDays = streak.days;
        } else if (streak.lastDate !== today) {
          this.streakDays = 0;
        }
      }
    },
    updateStreak() {
      const today = this.getTodayStr();
      const streak = common_vendor.index.getStorageSync("foodfind_streak") || { days: 0, lastDate: "" };
      if (streak.lastDate === today)
        return;
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
      if (streak.lastDate === yStr) {
        streak.days += 1;
      } else {
        streak.days = 1;
      }
      streak.lastDate = today;
      common_vendor.index.setStorageSync("foodfind_streak", streak);
      this.streakDays = streak.days;
      this.checkAchievements();
    },
    loadAchievements() {
      const defaultAchievements = [
        { id: "streak_3", name: "初出茅庐", desc: "连续打卡3天", icon: "🌱", condition: () => this.streakDays >= 3 },
        { id: "streak_7", name: "坚持不懈", desc: "连续打卡7天", icon: "🔥", condition: () => this.streakDays >= 7 },
        { id: "streak_14", name: "美食达人", desc: "连续打卡14天", icon: "⭐", condition: () => this.streakDays >= 14 },
        { id: "streak_30", name: "食神", desc: "连续打卡30天", icon: "👑", condition: () => this.streakDays >= 30 },
        { id: "share_5", name: "分享使者", desc: "分享5次美食", icon: "📤", condition: () => (common_vendor.index.getStorageSync("foodfind_share_count") || 0) >= 5 },
        { id: "comment_10", name: "评论达人", desc: "评论10次", icon: "💬", condition: () => (common_vendor.index.getStorageSync("foodfind_comment_count") || 0) >= 10 },
        { id: "vote_3", name: "选择困难", desc: "发起3次投票", icon: "🗳️", condition: () => (common_vendor.index.getStorageSync("foodfind_vote_count") || 0) >= 3 }
      ];
      const unlocked = common_vendor.index.getStorageSync("foodfind_achievements") || [];
      this.achievements = defaultAchievements.map((a) => ({
        ...a,
        unlocked: unlocked.includes(a.id) || a.condition()
      }));
      this.achievements.forEach((a) => {
        if (a.unlocked && !unlocked.includes(a.id)) {
          unlocked.push(a.id);
          common_vendor.index.setStorageSync("foodfind_achievements", unlocked);
        }
      });
    },
    checkAchievements() {
      const unlocked = common_vendor.index.getStorageSync("foodfind_achievements") || [];
      let newUnlock = false;
      this.achievements.forEach((a) => {
        if (!unlocked.includes(a.id) && a.condition()) {
          unlocked.push(a.id);
          newUnlock = true;
        }
      });
      if (newUnlock) {
        common_vendor.index.setStorageSync("foodfind_achievements", unlocked);
        common_vendor.index.showToast({ title: "🏆 解锁新成就！", icon: "none", duration: 2e3 });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c;
  return common_vendor.e({
    a: !$data.noCookMode
  }, !$data.noCookMode ? common_vendor.e({
    b: common_vendor.t($options.greetingText),
    c: common_vendor.t($options.greetingSubText),
    d: common_vendor.o((...args) => $options.goToShoppingList && $options.goToShoppingList(...args)),
    e: $data.unreadCount > 0
  }, $data.unreadCount > 0 ? {
    f: common_vendor.t($data.unreadCount > 9 ? "9+" : $data.unreadCount)
  } : {}, {
    g: $data.unreadCount > 0 ? 1 : "",
    h: common_vendor.o((...args) => $options.showNotifications && $options.showNotifications(...args)),
    i: common_vendor.t($data.shareBtnClicked ? "已分享" : "分享"),
    j: $data.shareBtnClicked ? 1 : "",
    k: common_vendor.o((...args) => $options.onShareClick && $options.onShareClick(...args)),
    l: $options.totalCalories > 0
  }, $options.totalCalories > 0 ? {
    m: common_vendor.t($options.totalCalories),
    n: common_vendor.t($options.totalProtein),
    o: common_vendor.t($options.totalFat),
    p: common_vendor.t($options.totalCarbs)
  } : {}, {
    q: $data.specialBanner
  }, $data.specialBanner ? {
    r: common_vendor.t($data.specialBanner.emoji),
    s: common_vendor.t($data.specialBanner.title),
    t: common_vendor.t($data.specialBanner.subtitle),
    v: common_vendor.o((...args) => $options.onSpecialBannerClick && $options.onSpecialBannerClick(...args))
  } : {}, {
    w: common_vendor.f($options.mealSections, (section, si, i0) => {
      return {
        a: common_vendor.t(section.icon),
        b: common_vendor.t(section.title),
        c: common_vendor.t($data.mealCheckIn[section.key] ? "✓" : "○"),
        d: common_vendor.t($data.mealCheckIn[section.key] ? "已打卡" : "打卡"),
        e: $data.mealCheckIn[section.key] ? 1 : "",
        f: common_vendor.o(($event) => $options.markMealEaten(section.key), si),
        g: $data.isRefreshing === section.key ? 1 : "",
        h: common_vendor.o(($event) => $options.refreshMeal(section.key), si),
        i: common_vendor.f(section.recipes, (food, fi, i1) => {
          return common_vendor.e({
            a: common_vendor.t(food.image || "🍽️"),
            b: common_vendor.t(food.name),
            c: $data.flippingCardId === food.id ? 1 : "",
            d: $data.newCardId === food.id ? 1 : "",
            e: $data.swipeCardId === food.id && $data.swipeOffset > 50
          }, $data.swipeCardId === food.id && $data.swipeOffset > 50 ? {} : {}, {
            f: $data.swipeCardId === food.id && $data.swipeOffset < -50
          }, $data.swipeCardId === food.id && $data.swipeOffset < -50 ? {} : {}, {
            g: $data.showSparkle && $data.sparkleCardId === food.id
          }, $data.showSparkle && $data.sparkleCardId === food.id ? {} : {}, {
            h: common_vendor.n($options.getCardClass(food.id)),
            i: common_vendor.s($options.getCardStyle(food.id) + ";animation-delay:" + (150 + si * 60 + fi * 50) + "ms"),
            j: food.id,
            k: common_vendor.o(($event) => $options.goToDetail(food), food.id),
            l: common_vendor.o(($event) => $options.onSwipeStart(food, section.key, $event), food.id),
            m: common_vendor.o(($event) => $options.onSwipeMove($event), food.id),
            n: common_vendor.o(($event) => $options.onSwipeEnd(food, section.key), food.id)
          });
        }),
        j: si,
        k: si * 80 + "ms"
      };
    }),
    x: common_vendor.o((...args) => $options.regenerateAll && $options.regenerateAll(...args)),
    y: $data.scrollHeight,
    z: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    A: $data.showDeleteModal ? 1 : "",
    B: common_vendor.o(($event) => $data.showDeleteModal = false),
    C: common_vendor.t((_a = $data.deleteTargetFood) == null ? void 0 : _a.name),
    D: common_vendor.o(($event) => $data.showDeleteModal = false),
    E: common_vendor.o((...args) => $options.confirmDelete && $options.confirmDelete(...args)),
    F: $data.showDeleteModal ? 1 : "",
    G: common_vendor.o((...args) => $options.closeGestureGuide && $options.closeGestureGuide(...args)),
    H: ($data.ggStage + 1) / 2 * 100 + "%",
    I: common_vendor.t($data.ggStage + 1),
    J: common_vendor.t($options.ggOverlayTitle),
    K: common_vendor.t($options.ggOverlaySub),
    L: common_vendor.t($options.ggHintIcon),
    M: common_vendor.t($options.ggHintText),
    N: common_vendor.n($options.ggHintClass),
    O: common_vendor.t(((_b = $data.ggDemoFood) == null ? void 0 : _b.image) || "🍽️"),
    P: common_vendor.t(((_c = $data.ggDemoFood) == null ? void 0 : _c.name) || "示例菜品"),
    Q: $data.ggShowSparkle
  }, $data.ggShowSparkle ? {} : {}, {
    R: common_vendor.n($data.ggDemoCardAnim),
    S: common_vendor.o((...args) => $options.ggDemoCardTouchStart && $options.ggDemoCardTouchStart(...args)),
    T: common_vendor.o((...args) => $options.ggDemoCardTouchMove && $options.ggDemoCardTouchMove(...args)),
    U: common_vendor.o((...args) => $options.ggDemoCardTouchEnd && $options.ggDemoCardTouchEnd(...args)),
    V: common_vendor.t($options.ggActIcon),
    W: common_vendor.t($options.ggActText),
    X: common_vendor.o((...args) => $options.ggAct && $options.ggAct(...args)),
    Y: $data.ggLocked ? 1 : "",
    Z: common_vendor.o((...args) => $options.closeGestureGuide && $options.closeGestureGuide(...args)),
    aa: $data.showGestureGuide ? 1 : ""
  }) : common_vendor.e({
    ab: common_vendor.t($options.greetingTextNoCook),
    ac: common_vendor.o((...args) => $options.takePhoto && $options.takePhoto(...args)),
    ad: common_vendor.o((...args) => $options.choosePhoto && $options.choosePhoto(...args)),
    ae: $data.feedList.length > 0
  }, $data.feedList.length > 0 ? {
    af: common_vendor.t($options.todayLabel)
  } : {}, {
    ag: common_vendor.f($data.feedList, (item, idx, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.o(($event) => $options.previewImage(item.image), item.id),
        c: common_vendor.t((item.fromName || "我").charAt(0)),
        d: common_vendor.t(item.fromName || "我"),
        e: common_vendor.t($options.formatTime(item.createdAt)),
        f: item.isSelf
      }, item.isSelf ? {} : {}, {
        g: item.caption
      }, item.caption ? {
        h: common_vendor.t(item.caption)
      } : {}, $data.noCookMode ? {
        i: common_vendor.t(item.commentCount || 0),
        j: common_vendor.o(($event) => $options.openComment(item), item.id),
        k: common_vendor.t(item.liked ? "❤️" : "🤍"),
        l: common_vendor.t(item.likeCount || 0),
        m: common_vendor.o(($event) => $options.toggleLike(item), item.id)
      } : {}, {
        n: item.id
      });
    }),
    ah: $data.noCookMode,
    ai: $data.feedList.length === 0
  }, $data.feedList.length === 0 ? {} : {}, {
    aj: $data.feedScrollHeight,
    ak: common_vendor.o((...args) => $options.loadMoreFeed && $options.loadMoreFeed(...args))
  }), {
    al: $data.showNotifPanel ? 1 : "",
    am: common_vendor.o(($event) => $data.showNotifPanel = false),
    an: common_vendor.o(($event) => $data.showNotifPanel = false),
    ao: common_vendor.f($data.notifList, (n, i, i0) => {
      return {
        a: common_vendor.t(n.type === "checkin" ? "🍽️" : n.type === "comment" ? "💬" : n.type === "vote" ? "🗳️" : "🔔"),
        b: common_vendor.t(n.fromName),
        c: common_vendor.t(n.content),
        d: common_vendor.t($options.formatTime(n.createdAt)),
        e: i,
        f: !n.read ? 1 : ""
      };
    }),
    ap: $data.notifList.length === 0
  }, $data.notifList.length === 0 ? {} : {}, {
    aq: $data.showNotifPanel ? 1 : "",
    ar: $data.showCommentModal ? 1 : "",
    as: common_vendor.o(($event) => $data.showCommentModal = false),
    at: common_vendor.o(($event) => $data.showCommentModal = false),
    av: common_vendor.f($data.commentList, (c, i, i0) => {
      return {
        a: common_vendor.t(c.fromName.charAt(0)),
        b: common_vendor.t(c.fromName),
        c: common_vendor.t(c.content),
        d: common_vendor.t($options.formatTime(c.createdAt)),
        e: i
      };
    }),
    aw: $data.commentList.length === 0
  }, $data.commentList.length === 0 ? {} : {}, {
    ax: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    ay: $data.commentInput,
    az: common_vendor.o(($event) => $data.commentInput = $event.detail.value),
    aA: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    aB: $data.showCommentModal ? 1 : "",
    aC: $data.showVoteModal ? 1 : "",
    aD: common_vendor.o(($event) => $data.showVoteModal = false),
    aE: common_vendor.o(($event) => $data.showVoteModal = false),
    aF: !$data.currentVote
  }, !$data.currentVote ? common_vendor.e({
    aG: $data.voteTitle,
    aH: common_vendor.o(($event) => $data.voteTitle = $event.detail.value),
    aI: common_vendor.f($data.voteOptions, (opt, i, i0) => {
      return common_vendor.e({
        a: "选项" + (i + 1),
        b: $data.voteOptions[i],
        c: common_vendor.o(($event) => $data.voteOptions[i] = $event.detail.value, i)
      }, $data.voteOptions.length > 2 ? {
        d: common_vendor.o(($event) => $options.removeVoteOption(i), i)
      } : {}, {
        e: i
      });
    }),
    aJ: $data.voteOptions.length > 2,
    aK: $data.voteOptions.length < 5
  }, $data.voteOptions.length < 5 ? {
    aL: common_vendor.o((...args) => $options.addVoteOption && $options.addVoteOption(...args))
  } : {}, {
    aM: common_vendor.o((...args) => $options.createVoteAction && $options.createVoteAction(...args))
  }) : {}, {
    aN: $data.currentVote
  }, $data.currentVote ? {
    aO: common_vendor.t($data.currentVote.title),
    aP: common_vendor.f($data.currentVote.options, (opt, i, i0) => {
      return {
        a: common_vendor.t(opt.text),
        b: common_vendor.t(opt.count),
        c: $options.getVotePercent(opt, $data.currentVote) + "%",
        d: i,
        e: common_vendor.o(($event) => $options.doVote(i), i)
      };
    }),
    aQ: common_vendor.t($data.currentVote.status === "active" ? "投票进行中" : "投票已结束")
  } : {}, {
    aR: $data.showVoteModal ? 1 : "",
    aS: $data.showAchievementModal ? 1 : "",
    aT: common_vendor.o(($event) => $data.showAchievementModal = false),
    aU: common_vendor.o(($event) => $data.showAchievementModal = false),
    aV: common_vendor.f($data.achievements, (a, i, i0) => {
      return {
        a: common_vendor.t(a.icon),
        b: common_vendor.t(a.name),
        c: common_vendor.t(a.desc),
        d: common_vendor.t(a.unlocked ? "✓ 已解锁" : "🔒 未解锁"),
        e: i,
        f: a.unlocked ? 1 : ""
      };
    }),
    aW: common_vendor.t($data.streakDays),
    aX: common_vendor.o(($event) => $data.showAchievementModal = false),
    aY: $data.showAchievementModal ? 1 : "",
    aZ: $data.noCookMode && $data.pairId
  }, $data.noCookMode && $data.pairId ? {
    ba: common_vendor.o(($event) => $data.showVoteModal = true)
  } : {}, {
    bb: $data.noCookMode
  }, $data.noCookMode ? {
    bc: common_vendor.o(($event) => $data.showAchievementModal = true)
  } : {}, {
    bd: $data.showSpecialModal ? 1 : "",
    be: common_vendor.o(($event) => $data.showSpecialModal = false),
    bf: common_vendor.o(($event) => $data.showSpecialModal = false),
    bg: $data.specialDateForm.name,
    bh: common_vendor.o(($event) => $data.specialDateForm.name = $event.detail.value),
    bi: $data.specialDateForm.type === "birthday" ? 1 : "",
    bj: common_vendor.o(($event) => $data.specialDateForm.type = "birthday"),
    bk: $data.specialDateForm.type === "anniversary" ? 1 : "",
    bl: common_vendor.o(($event) => $data.specialDateForm.type = "anniversary"),
    bm: common_vendor.t($data.specialDateForm.month),
    bn: common_vendor.t($data.specialDateForm.day),
    bo: $data.specialDateForm.month + "-" + $data.specialDateForm.day,
    bp: common_vendor.o((...args) => $options.onSpecialDatePick && $options.onSpecialDatePick(...args)),
    bq: common_vendor.o((...args) => $options.saveSpecialDate && $options.saveSpecialDate(...args)),
    br: $data.showSpecialModal ? 1 : "",
    bs: $data.pageEnter ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
