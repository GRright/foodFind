const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    greeting: '',
    currentDate: '',
    weather: null,
    context: null,
    todayMeals: [
      { meal_type: 'breakfast', name: '早餐', icon: '🌅', recipe: '番茄炒蛋', recipeId: 1 },
      { meal_type: 'lunch', name: '午餐', icon: '☀️', recipe: '红烧肉', recipeId: 2 },
      { meal_type: 'dinner', name: '晚餐', icon: '🌙', recipe: '日式咖喱饭', recipeId: 3 }
    ],
    recommendedMovies: [],
    personalizedRecipes: [],
    showExplanation: false,
    showOnboardingModal: false,
    showPreferenceToast: false,
    preferenceToastMessage: '',
    explorationStats: {}
  },

  onLoad() {
    this.updateGreeting();
    this.setData({
      userInfo: app.globalData.userInfo || {},
      currentDate: this.formatDate(new Date()),
      context: app.globalData.RecommendEngine.getContext()
    });
    
    this.checkAndShowOnboarding();
    this.loadMovies();
    this.loadRecommendations();
    this.updateExplorationStats();
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
    this.updateGreeting();
  },

  // 更新问候语
  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  // 检查并显示引导
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
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  },

  // 加载推荐
  loadRecommendations() {
    const { ExitUploadManager, RecommendEngine } = app.globalData;
    
    // 优先使用预加载包
    const preload = ExitUploadManager.getPreloadPackage();
    let recipes;
    
    if (preload?.recommendations) {
      recipes = preload.recommendations;
    } else {
      recipes = RecommendEngine.getRecommendations(5);
    }

    this.setData({ personalizedRecipes: recipes });
  },

  // 加载电影
  loadMovies() {
    const movies = app.globalData.RecommendEngine.getMovies();
    this.setData({ recommendedMovies: movies });
  },

  // 更新探索统计
  updateExplorationStats() {
    const stats = app.globalData.RecommendEngine.getExplorationStats();
    this.setData({ explorationStats: stats });
  },

  // 统一记录行为
  recordBehavior(actionType, recipe, extra = {}) {
    const { RecommendEngine, ExitUploadManager } = app.globalData;
    
    // 实时调整权重
    if (actionType === 'view') RecommendEngine.recordView(recipe.id);
    if (actionType === 'like') RecommendEngine.recordLike(recipe.id, recipe);
    if (actionType === 'dislike') RecommendEngine.recordDislike(recipe.id, recipe, extra.reason);
    
    // 记录到本地队列（离场时上传）
    ExitUploadManager.recordBehavior(actionType, 'recipe', recipe.id, extra);
  },

  // 查看菜谱
  viewRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.recordBehavior('view', recipe);
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` });
  },

  // 喜欢
  likeRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.recordBehavior('like', recipe);
    
    // 更新UI
    const recipes = this.data.personalizedRecipes.map(r => 
      r.id === recipe.id ? { ...r, liked: true } : r
    );
    this.setData({ personalizedRecipes: recipes });
    
    wx.showToast({ title: '已添加到喜欢', icon: 'success' });
  },

  // 显示不喜欢选项
  showDislikeOptions(e) {
    const recipe = e.currentTarget.dataset.recipe;
    
    wx.showActionSheet({
      itemList: ['太贵了', '不合口味', '不喜欢食材', '其他原因'],
      success: (res) => {
        const reasons = ['太贵了', '不合口味', '不喜欢食材', '其他原因'];
        const reason = reasons[res.tapIndex];
        
        this.recordBehavior('dislike', recipe, { reason });
        
        // 从列表中移除
        const recipes = this.data.personalizedRecipes.filter(r => r.id !== recipe.id);
        this.setData({ personalizedRecipes: recipes });
        
        // 显示反馈提示
        this.showPreferenceToast('已记录，将为你调整推荐');
        
        // 自动补充新推荐
        if (recipes.length < 3) {
          this.loadMoreRecommendations();
        }
      }
    });
  },

  // 加载更多推荐
  loadMoreRecommendations() {
    const newRecipes = app.globalData.RecommendEngine.getRecommendations(2, { skipColdStart: true });
    this.setData({
      personalizedRecipes: [...this.data.personalizedRecipes, ...newRecipes]
    });
  },

  // 显示偏好更新提示
  showPreferenceToast(message) {
    this.setData({ 
      showPreferenceToast: true, 
      preferenceToastMessage: message 
    });
    
    setTimeout(() => {
      this.setData({ showPreferenceToast: false });
    }, 3000);
  },

  // 切换推荐理由显示
  toggleExplanation() {
    this.setData({ showExplanation: !this.data.showExplanation });
  },

  // 导航方法
  goToMenu() { wx.switchTab({ url: '/pages/menu/menu' }); },
  goToMovies() { wx.switchTab({ url: '/pages/movies/movies' }); },
  goToProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
  
  // 弹窗控制
  openOnboarding() { 
    this.setData({ showOnboardingModal: false });
    wx.navigateTo({ url: '/pages/onboarding/onboarding' }); 
  },
  closeOnboardingModal() { this.setData({ showOnboardingModal: false }); },
  stopPropagation() {},

  // 其他方法
  generateMenu() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
  
  searchRecipes() {
    wx.navigateTo({ url: '/pages/menu/menu?search=true' });
  },
  
  viewMealDetail(e) {
    const meal = e.currentTarget.dataset.meal;
    if (meal.recipeId) {
      wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${meal.recipeId}` });
    }
  }
});
