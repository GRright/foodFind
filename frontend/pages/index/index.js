const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    currentDate: '',
    todayMeals: [
      { meal_type: 'breakfast', name: '早餐', icon: '🌅', recipe: '番茄炒蛋', recipeId: 1 },
      { meal_type: 'lunch', name: '午餐', icon: '☀️', recipe: '红烧肉', recipeId: 2 },
      { meal_type: 'dinner', name: '晚餐', icon: '🌙', recipe: '日式咖喱饭', recipeId: 3 }
    ],
    recommendedMovies: [],
    personalizedRecipes: [],
    showRecommendationReason: false
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      currentDate: this.formatDate(new Date())
    });
    this.loadRecommendedMovies();
    this.loadPersonalizedRecommendations();
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo || {}
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekday}`;
  },

  loadRecommendedMovies() {
    api.getMoviesByMealType('dinner')
      .then(res => {
        this.setData({
          recommendedMovies: res.movies || []
        });
      })
      .catch(err => {
        console.error('Load movies failed:', err);
      });
  },

  loadPersonalizedRecommendations() {
    const userId = app.globalData.userId;
    if (!userId) return;

    const hour = new Date().getHours();
    let mealType = 'dinner';
    if (hour >= 5 && hour < 10) mealType = 'breakfast';
    else if (hour >= 10 && hour < 14) mealType = 'lunch';

    api.getRecommendations(userId, { meal_type: mealType, count: 3 })
      .then(res => {
        this.setData({
          personalizedRecipes: res.recommendations || []
        });
      })
      .catch(err => {
        console.error('Load recommendations failed:', err);
      });
  },

  goToMenu() {
    wx.switchTab({
      url: '/pages/menu/menu'
    });
  },

  goToMovies() {
    wx.switchTab({
      url: '/pages/movies/movies'
    });
  },

  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  viewRecipe(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  },

  trackBehavior(actionType, itemType, itemId, details = {}) {
    const userId = app.globalData.userId;
    if (!userId) return;
    
    api.trackBehavior({
      user_id: userId,
      action_type: actionType,
      item_type: itemType,
      item_id: itemId,
      details: details
    }).catch(err => {
      console.error('Track behavior failed:', err);
    });
  },

  viewPersonalizedRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.trackBehavior('view', 'recipe', recipe.id);
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}`
    });
  },

  likeRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.trackBehavior('like', 'recipe', recipe.id);
    
    wx.showToast({
      title: '已添加到喜欢',
      icon: 'success'
    });
    
    const recipes = this.data.personalizedRecipes.map(r => {
      if (r.id === recipe.id) {
        return { ...r, liked: true };
      }
      return r;
    });
    this.setData({ personalizedRecipes: recipes });
  },

  dislikeRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    
    wx.showActionSheet({
      itemList: ['太辣', '太油腻', '不喜欢食材', '其他'],
      success: (res) => {
        const reasons = ['太辣', '太油腻', '不喜欢食材', '其他'];
        const reason = reasons[res.tapIndex];
        
        this.trackBehavior('dislike', 'recipe', recipe.id, { reason });
        
        const recipes = this.data.personalizedRecipes.filter(r => r.id !== recipe.id);
        this.setData({ personalizedRecipes: recipes });
        
        wx.showToast({
          title: '已记录，将为您调整推荐',
          icon: 'none'
        });
      }
    });
  },

  toggleRecommendationReason() {
    this.setData({
      showRecommendationReason: !this.data.showRecommendationReason
    });
  },

  generateMenu() {
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    wx.showLoading({
      title: '生成中...'
    });

    api.generateMenu({
      userId: userId,
      startDate: today,
      days: 7,
      mode: 'balanced'
    })
    .then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '菜单生成成功',
        icon: 'success'
      });
      wx.switchTab({
        url: '/pages/menu/menu'
      });
    })
    .catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    });
  },

  searchRecipes() {
    wx.navigateTo({
      url: '/pages/menu/menu?search=true'
    });
  }
})
