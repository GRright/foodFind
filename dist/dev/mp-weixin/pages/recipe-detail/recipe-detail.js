"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const _sfc_main = {
  data() {
    return {
      recipeId: null,
      recipe: {
        id: 1,
        name: "番茄炒蛋",
        image: "🍳",
        cuisine_type: "家常菜",
        difficulty: "简单",
        cooking_time: 15,
        nutrition: { calories: 180, protein: 12, fat: 12, carbs: 8 },
        ingredients: [{ name: "番茄", amount: "2个约200g" }, { name: "鸡蛋", amount: "3个约165g" }],
        steps: ["番茄切块", "鸡蛋打散炒熟", "放入番茄一起炒", "加盐调味即可"]
      },
      detailHeight: "calc(100vh - 360rpx)",
      selectedRating: 0,
      feedbackText: "",
      showRatingPanel: false,
      isFavorited: false
    };
  },
  onLoad(options) {
    if (options && options.id) {
      this.recipeId = parseInt(options.id);
      this.loadRecipe(this.recipeId);
      this.checkFavorite();
    }
  },
  methods: {
    loadRecipe(id) {
      const allRecipes = [...utils_constants.ALL_RECIPES.breakfast, ...utils_constants.ALL_RECIPES.lunch, ...utils_constants.ALL_RECIPES.dinner];
      const found = allRecipes.find((r) => r.id === id);
      if (found) {
        this.recipe = found;
      }
    },
    checkFavorite() {
      const favorites = common_vendor.index.getStorageSync("foodfind_favorites") || [];
      this.isFavorited = favorites.some((f) => f.id === this.recipeId);
    },
    toggleFavorite() {
      let favorites = common_vendor.index.getStorageSync("foodfind_favorites") || [];
      if (this.isFavorited) {
        favorites = favorites.filter((f) => f.id !== this.recipeId);
        common_vendor.index.setStorageSync("foodfind_favorites", favorites);
        this.isFavorited = false;
        common_vendor.index.showToast({ title: "已取消收藏", icon: "none" });
      } else {
        favorites.unshift({
          id: this.recipe.id,
          name: this.recipe.name,
          image: this.recipe.image,
          cuisine_type: this.recipe.cuisine_type,
          type: this.recipe.type,
          nutrition: this.recipe.nutrition,
          favoritedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        common_vendor.index.setStorageSync("foodfind_favorites", favorites);
        this.isFavorited = true;
        common_vendor.index.showToast({ title: "已加入收藏 ✓", icon: "success" });
      }
    },
    selectStar(s) {
      this.selectedRating = s;
    },
    submitFeedback() {
      if (this.selectedRating === 0) {
        common_vendor.index.showToast({ title: "请选择评分", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "提交成功", icon: "success" });
      this.showRatingPanel = false;
      this.selectedRating = 0;
      this.feedbackText = "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c, _d;
  return common_vendor.e({
    a: common_vendor.t($data.recipe.image || "🍽️"),
    b: common_vendor.t($data.recipe.name),
    c: common_vendor.t($data.recipe.cuisine_type),
    d: common_vendor.t($data.recipe.difficulty || "简单"),
    e: common_vendor.t($data.recipe.cooking_time || 15),
    f: common_vendor.t($data.isFavorited ? "♥" : "♡"),
    g: common_vendor.t($data.isFavorited ? "已收藏" : "收藏"),
    h: $data.isFavorited ? 1 : "",
    i: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    j: common_vendor.t(((_a = $data.recipe.nutrition) == null ? void 0 : _a.calories) || 0),
    k: common_vendor.t(((_b = $data.recipe.nutrition) == null ? void 0 : _b.protein) || 0),
    l: common_vendor.t(((_c = $data.recipe.nutrition) == null ? void 0 : _c.fat) || 0),
    m: common_vendor.t(((_d = $data.recipe.nutrition) == null ? void 0 : _d.carbs) || 0),
    n: common_vendor.f($data.recipe.ingredients, (ing, idx, i0) => {
      return {
        a: common_vendor.t(ing.name),
        b: common_vendor.t(ing.amount),
        c: idx
      };
    }),
    o: common_vendor.f($data.recipe.steps, (step, idx, i0) => {
      return {
        a: common_vendor.t(idx + 1),
        b: common_vendor.t(step),
        c: idx
      };
    }),
    p: $data.selectedRating === 0
  }, $data.selectedRating === 0 ? {
    q: common_vendor.o(($event) => $data.showRatingPanel = true)
  } : {
    r: common_vendor.t($data.selectedRating)
  }, {
    s: $data.detailHeight,
    t: common_vendor.f(5, (s, k0, i0) => {
      return {
        a: $data.selectedRating >= s ? 1 : "",
        b: s,
        c: common_vendor.o(($event) => $options.selectStar(s), s)
      };
    }),
    v: $data.feedbackText,
    w: common_vendor.o((e) => $data.feedbackText = e.detail.value),
    x: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args)),
    y: $data.showRatingPanel ? 1 : "",
    z: common_vendor.o(() => {
    }),
    A: $data.showRatingPanel ? 1 : "",
    B: common_vendor.o(($event) => $data.showRatingPanel = false)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fd6fa8e"]]);
wx.createPage(MiniProgramPage);
