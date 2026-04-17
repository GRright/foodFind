const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    greeting: '',
    currentDate: '',
    userCount: 2,
    userCountOptions: [1, 2, 3, 4, 5, 6],
    allRecipes: {
      breakfast: [
        { id: 101, name: '番茄炒蛋', image: '🍳', calories: 120, time: 10, type: 'mixed' },
        { id: 102, name: '豆浆油条', image: '🥖', calories: 280, time: 5, type: 'vegetarian' },
        { id: 103, name: '皮蛋瘦肉粥', image: '🥣', calories: 180, time: 20, type: 'mixed' },
        { id: 104, name: '煎饺', image: '🥟', calories: 220, time: 15, type: 'mixed' },
        { id: 105, name: '三明治', image: '🥪', calories: 150, time: 5, type: 'mixed' },
        { id: 106, name: '包子', image: '🥡', calories: 200, time: 10, type: 'mixed' },
        { id: 107, name: '牛奶燕麦', image: '🥛', calories: 180, time: 5, type: 'vegetarian' }
      ],
      lunch: [
        { id: 201, name: '红烧肉', image: '🍖', calories: 450, time: 60, type: 'meat' },
        { id: 202, name: '宫保鸡丁', image: '🍗', calories: 320, time: 25, type: 'meat' },
        { id: 203, name: '麻婆豆腐', image: '🥘', calories: 280, time: 20, type: 'mixed' },
        { id: 204, name: '糖醋排骨', image: '🍖', calories: 380, time: 45, type: 'meat' },
        { id: 205, name: '清蒸鲈鱼', image: '🐟', calories: 180, time: 20, type: 'meat' },
        { id: 206, name: '回锅肉', image: '🥓', calories: 420, time: 30, type: 'meat' },
        { id: 207, name: '水煮鱼', image: '🐟', calories: 380, time: 35, type: 'meat' },
        { id: 208, name: '干煸四季豆', image: '🫛', calories: 150, time: 15, type: 'vegetarian' },
        { id: 209, name: '蒜蓉西兰花', image: '🥦', calories: 80, time: 10, type: 'vegetarian' },
        { id: 210, name: '地三鲜', image: '🍆', calories: 200, time: 20, type: 'vegetarian' },
        { id: 211, name: '土豆丝', image: '🥔', calories: 120, time: 10, type: 'vegetarian' },
        { id: 212, name: '红烧茄子', image: '🍆', calories: 180, time: 25, type: 'vegetarian' }
      ],
      dinner: [
        { id: 301, name: '日式咖喱饭', image: '🍛', calories: 380, time: 40, type: 'mixed' },
        { id: 302, name: '番茄牛肉汤', image: '🍲', calories: 280, time: 45, type: 'mixed' },
        { id: 303, name: '蒜蓉西兰花', image: '🥦', calories: 80, time: 10, type: 'vegetarian' },
        { id: 304, name: '蛋炒饭', image: '🍚', calories: 320, time: 10, type: 'mixed' },
        { id: 305, name: '韩式拌饭', image: '🍚', calories: 420, time: 25, type: 'mixed' },
        { id: 306, name: '青菜豆腐汤', image: '🥬', calories: 60, time: 10, type: 'vegetarian' },
        { id: 307, name: '可乐鸡翅', image: '🍗', calories: 350, time: 30, type: 'meat' },
        { id: 308, name: '蒸蛋羹', image: '🥚', calories: 100, time: 15, type: 'vegetarian' },
        { id: 309, name: '红烧排骨', image: '🍖', calories: 400, time: 50, type: 'meat' },
        { id: 310, name: '清炒时蔬', image: '🥗', calories: 50, time: 8, type: 'vegetarian' },
        { id: 311, name: '香煎豆腐', image: '🧈', calories: 150, time: 15, type: 'vegetarian' },
        { id: 312, name: '糖醋里脊', image: '🍖', calories: 380, time: 30, type: 'meat' }
      ]
    },
    dailyMeals: {
      breakfast: { title: '早餐', icon: '🌅', recipes: [] },
      lunch: { title: '午餐', icon: '☀️', recipes: [] },
      dinner: { title: '晚餐', icon: '🌙', recipes: [] }
    },
    showOnboardingModal: false
  },

  onLoad() {
    this.updateGreeting();
    this.setData({
      userInfo: app.globalData.userInfo || {},
      currentDate: this.formatDate(new Date())
    });
    this.generateDailyRecipes();
    this.checkAndShowOnboarding();
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
    this.updateGreeting();
  },

  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  formatDate(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  },

  getRecipeCount() {
    const count = this.data.userCount;
    if (count === 1) return 2;
    if (count === 2) return 3;
    if (count <= 4) return 4;
    return 5;
  },

  generateDailyRecipes() {
    const recipeCount = this.getRecipeCount();
    
    const dailyMeals = {
      breakfast: {
        title: '早餐',
        icon: '🌅',
        recipes: this.getRandomRecipes(this.data.allRecipes.breakfast, recipeCount)
      },
      lunch: {
        title: '午餐',
        icon: '☀️',
        recipes: this.getBalancedRecipes(this.data.allRecipes.lunch, recipeCount)
      },
      dinner: {
        title: '晚餐',
        icon: '🌙',
        recipes: this.getBalancedRecipes(this.data.allRecipes.dinner, recipeCount)
      }
    };
    
    this.setData({ dailyMeals });
  },

  getRandomRecipes(recipes, count) {
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getBalancedRecipes(recipes, count) {
    const meatRecipes = recipes.filter(r => r.type === 'meat' || r.type === 'mixed');
    const vegRecipes = recipes.filter(r => r.type === 'vegetarian');
    
    const meatCount = Math.ceil(count / 2);
    const vegCount = count - meatCount;
    
    const selectedMeat = this.getRandomRecipes(meatRecipes, Math.min(meatCount, meatRecipes.length));
    const selectedVeg = this.getRandomRecipes(vegRecipes, Math.min(vegCount, vegRecipes.length));
    
    const result = [...selectedMeat, ...selectedVeg];
    
    if (result.length < count) {
      const remaining = count - result.length;
      const allRecipes = [...recipes].filter(r => !result.find(s => s.id === r.id));
      result.push(...this.getRandomRecipes(allRecipes, remaining));
    }
    
    return result.sort(() => Math.random() - 0.5);
  },

  onUserCountChange(e) {
    this.setData({ userCount: this.data.userCountOptions[e.detail.value] });
    this.generateDailyRecipes();
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

  viewMealRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` });
  },

  goToMenu() { wx.switchTab({ url: '/pages/menu/menu' }); },
  goToMovies() { wx.switchTab({ url: '/pages/movies/movies' }); },
  goToProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
  
  openOnboarding() { 
    this.setData({ showOnboardingModal: false });
    wx.navigateTo({ url: '/pages/onboarding/onboarding' }); 
  },
  closeOnboardingModal() { this.setData({ showOnboardingModal: false }); },
  stopPropagation() {}
});
