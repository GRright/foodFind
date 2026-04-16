const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    recipeId: null,
    recipe: null,
    relatedMovies: [],
    selectedRating: 0,
    feedbackText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recipeId: parseInt(options.id) });
      this.loadRecipeDetail();
      this.loadRelatedMovies();
    }
  },

  loadRecipeDetail() {
    wx.showLoading({
      title: '加载中...'
    });
    
    api.getRecipeById(this.data.recipeId)
      .then(res => {
        wx.hideLoading();
        this.setData({
          recipe: res.recipe
        });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
  },

  loadRelatedMovies() {
    api.getMoviesByRecipe(this.data.recipeId)
      .then(res => {
        this.setData({
          relatedMovies: res.movies || []
        });
      })
      .catch(err => {
        console.error('Load related movies failed:', err);
      });
  },

  selectRating(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({
      selectedRating: rating
    });
  },

  onFeedbackInput(e) {
    this.setData({
      feedbackText: e.detail.value
    });
  },

  submitFeedback() {
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (this.data.selectedRating === 0) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...'
    });

    api.createFeedback({
      user_id: userId,
      type: 'recipe',
      item_id: this.data.recipeId,
      rating: this.data.selectedRating,
      comment: this.data.feedbackText
    })
    .then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });
      this.setData({
        selectedRating: 0,
        feedbackText: ''
      });
    })
    .catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    });
  }
})
