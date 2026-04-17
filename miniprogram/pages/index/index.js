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
    showRecommendationReason: false,
    showOnboardingModal: false
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      currentDate: this.formatDate(new Date())
    });
    
    this.checkAndShowOnboarding();
    this.loadMovies();
    this.loadRecommendations();
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
  },

  async checkAndShowOnboarding() {
    const userId = app.globalData.userId;
    if (!userId) return;
    
    try {
      const status = await api.getOnboardingStatus(userId);
      if (status.isNewUser || !status.onboardingCompleted) {
        this.setData({ showOnboardingModal: true });
      }
    } catch (error) {
      console.error('Check onboarding failed:', error);
    }
  },

  formatDate(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  },

  loadMovies() {
    const movies = app.globalData.RecommendEngine.getMovies();
    this.setData({ recommendedMovies: movies });
  },

  loadRecommendations() {
    const { ExitUploadManager, RecommendEngine } = app.globalData;
    
    // 优先使用预加载包
    const preload = ExitUploadManager.getPreloadPackage();
    if (preload?.recommendations) {
      this.setData({ personalizedRecipes: preload.recommendations });
    } else {
      this.setData({ personalizedRecipes: RecommendEngine.getRecommendations(3) });
    }
  },

  // 统一行为记录方法
  record(action, recipe, extra = {}) {
    const { RecommendEngine, ExitUploadManager } = app.globalData;
    
    // 实时调整权重
    if (action === 'view') RecommendEngine.recordView(recipe.id);
    if (action === 'like') RecommendEngine.recordLike(recipe.id);
    if (action === 'dislike') RecommendEngine.recordDislike(recipe.id, extra.reason);
    
    // 记录到本地队列（离场时上传）
    ExitUploadManager.recordBehavior(action, 'recipe', recipe.id, extra);
  },

  viewRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.record('view', recipe);
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` });
  },

  likeRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.record('like', recipe);
    
    wx.showToast({ title: '已添加到喜欢', icon: 'success' });
    
    this.setData({
      personalizedRecipes: this.data.personalizedRecipes.map(r => 
        r.id === recipe.id ? { ...r, liked: true } : r
      )
    });
  },

  dislikeRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    
    wx.showActionSheet({
      itemList: ['太辣', '太油腻', '不喜欢食材', '其他'],
      success: (res) => {
        const reasons = ['太辣', '太油腻', '不喜欢食材', '其他'];
        this.record('dislike', recipe, { reason: reasons[res.tapIndex] });
        
        this.setData({
          personalizedRecipes: this.data.personalizedRecipes.filter(r => r.id !== recipe.id)
        });
        
        wx.showToast({ title: '已记录，将调整推荐', icon: 'none' });
      }
    });
  },

  // 导航方法
  goToMenu() { wx.switchTab({ url: '/pages/menu/menu' }); },
  goToMovies() { wx.switchTab({ url: '/pages/movies/movies' }); },
  goToProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
  
  // 弹窗控制
  openOnboarding() { wx.navigateTo({ url: '/pages/onboarding/onboarding' }); },
  closeOnboardingModal() { this.setData({ showOnboardingModal: false }); },
  stopPropagation() {}
})
