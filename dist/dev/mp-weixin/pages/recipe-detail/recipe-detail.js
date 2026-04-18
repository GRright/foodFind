"use strict";
const common_vendor = require("../../common/vendor.js");
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
        ingredients: [{ name: "番茄", amount: "2个" }, { name: "鸡蛋", amount: "3个" }],
        steps: ["番茄切块", "鸡蛋打散炒熟", "放入番茄一起炒", "加盐调味即可"]
      },
      detailHeight: "calc(100vh - 360rpx)",
      selectedRating: 0,
      feedbackText: "",
      showRatingPanel: false
    };
  },
  onLoad(options) {
    if (options && options.id) {
      this.recipeId = parseInt(options.id);
      this.loadRecipe(this.recipeId);
    }
  },
  methods: {
    loadRecipe(id) {
      const allRecipes = [...common_vendor.ALL_RECIPES.breakfast, ...common_vendor.ALL_RECIPES.lunch, ...common_vendor.ALL_RECIPES.dinner];
      const found = allRecipes.find((r) => r.id === id);
      if (found) {
        this.recipe = found;
      }
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
  var _a, _b, _c, _d, _e, _f;
  return common_vendor.e({
    a: common_vendor.t($data.recipe.image || "🍽️"),
    b: common_vendor.t($data.recipe.name),
    c: common_vendor.t($data.recipe.cuisine_type),
    d: common_vendor.t($data.recipe.difficulty || "简单"),
    e: common_vendor.t($data.recipe.cooking_time || 15),
    f: common_vendor.t(((_a = $data.recipe.nutrition) == null ? void 0 : _a.calories) || 0),
    g: common_vendor.t(((_b = $data.recipe.nutrition) == null ? void 0 : _b.protein) || 0),
    h: common_vendor.t(((_c = $data.recipe.nutrition) == null ? void 0 : _c.fat) || 0),
    i: common_vendor.t(((_d = $data.recipe.nutrition) == null ? void 0 : _d.carbs) || 0),
    j: common_vendor.t(((_e = $data.recipe.ingredients) == null ? void 0 : _e.length) || 0),
    k: common_vendor.f($data.recipe.ingredients, (ing, idx, i0) => {
      return {
        a: common_vendor.t(ing.name),
        b: common_vendor.t(ing.amount),
        c: idx
      };
    }),
    l: common_vendor.t(((_f = $data.recipe.steps) == null ? void 0 : _f.length) || 0),
    m: common_vendor.f($data.recipe.steps, (step, idx, i0) => {
      return {
        a: common_vendor.t(idx + 1),
        b: common_vendor.t(step),
        c: idx
      };
    }),
    n: $data.selectedRating === 0
  }, $data.selectedRating === 0 ? {
    o: common_vendor.o(($event) => $data.showRatingPanel = true)
  } : {
    p: common_vendor.t($data.selectedRating)
  }, {
    q: $data.detailHeight,
    r: $data.showRatingPanel
  }, $data.showRatingPanel ? {
    s: common_vendor.f(5, (s, k0, i0) => {
      return {
        a: $data.selectedRating >= s ? 1 : "",
        b: s,
        c: common_vendor.o(($event) => $data.selectedRating = s, s)
      };
    }),
    t: $data.feedbackText,
    v: common_vendor.o((e) => $data.feedbackText = e.detail.value),
    w: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args)),
    x: common_vendor.o(() => {
    }),
    y: common_vendor.o(($event) => $data.showRatingPanel = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fd6fa8e"]]);
wx.createPage(MiniProgramPage);
