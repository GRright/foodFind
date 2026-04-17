const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    weekStart: '',
    weekDisplay: '',
    weekDays: [],
    currentDateIndex: 0,
    mealSections: [
      { type: 'breakfast', name: '早餐', icon: '🌅' },
      { type: 'lunch', name: '午餐', icon: '☀️' },
      { type: 'dinner', name: '晚餐', icon: '🌙' }
    ],
    weeklyMenu: []
  },

  onLoad(options) {
    const today = new Date();
    this.initWeekDates(today);
    this.loadWeeklyMenu();
  },

  onShow() {
    if (this.data.weekStart) {
      this.loadWeeklyMenu();
    }
  },

  initWeekDates(date) {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    
    const weekDays = [];
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      weekDays.push({
        date: currentDate.toISOString().split('T')[0],
        weekday: weekdays[i],
        day: currentDate.getDate()
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentDateIndex = weekDays.findIndex(d => d.date === today);
    
    const year = weekStart.getFullYear();
    const month = weekStart.getMonth() + 1;
    const endMonth = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).getMonth() + 1;
    
    this.setData({
      weekStart: weekDays[0].date,
      weekDisplay: month === endMonth ? `${year}年${month}月` : `${year}年${month}月-${endMonth}月`,
      weekDays,
      currentDateIndex: currentDateIndex >= 0 ? currentDateIndex : 0
    });
  },

  loadWeeklyMenu() {
    const sampleMenu = this.getSampleMenu();
    this.setData({ weeklyMenu: sampleMenu });
    this.updateMealSections();
  },

  getSampleMenu() {
    const recipes = [
      { id: 1, name: '番茄炒蛋', icon: '🍳', cuisine: '家常菜', calories: 120 },
      { id: 2, name: '宫保鸡丁', icon: '🍗', cuisine: '川菜', calories: 320 },
      { id: 3, name: '红烧肉', icon: '🍖', cuisine: '家常菜', calories: 450 },
      { id: 4, name: '清蒸鲈鱼', icon: '🐟', cuisine: '粤菜', calories: 180 },
      { id: 5, name: '麻婆豆腐', icon: '🥘', cuisine: '川菜', calories: 280 },
      { id: 6, name: '糖醋排骨', icon: '🍖', cuisine: '家常菜', calories: 380 }
    ];
    
    const menu = [];
    this.data.weekDays.forEach(day => {
      this.data.mealSections.forEach(meal => {
        const recipe = recipes[Math.floor(Math.random() * recipes.length)];
        menu.push({
          id: `${day.date}-${meal.type}`,
          date: day.date,
          meal_type: meal.type,
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          cuisine_type: recipe.cuisine,
          nutrition: { calories: recipe.calories },
          is_eating_out: false
        });
      });
    });
    
    return menu;
  },

  updateMealSections() {
    const currentDate = this.data.weekDays[this.data.currentDateIndex].date;
    const dayMenu = this.data.weeklyMenu.filter(m => m.date === currentDate);
    
    const mealSections = this.data.mealSections.map(section => {
      const menu = dayMenu.find(m => m.meal_type === section.type);
      return {
        ...section,
        menu,
        nutrition: menu && menu.nutrition ? menu.nutrition : null
      };
    });
    
    this.setData({ mealSections });
  },

  selectDate(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentDateIndex: index });
    this.updateMealSections();
  },

  prevWeek() {
    const weekStart = new Date(this.data.weekStart);
    weekStart.setDate(weekStart.getDate() - 7);
    this.initWeekDates(weekStart);
    this.loadWeeklyMenu();
  },

  nextWeek() {
    const weekStart = new Date(this.data.weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
    this.initWeekDates(weekStart);
    this.loadWeeklyMenu();
  },

  viewRecipe(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${id}`
    });
  },

  replaceRecipe(e) {
    wx.showToast({
      title: '已替换',
      icon: 'success'
    });
    this.loadWeeklyMenu();
  },

  toggleEatingOut(e) {
    wx.showToast({
      title: '已更新',
      icon: 'success'
    });
    this.loadWeeklyMenu();
  },

  generateWeekMenu() {
    wx.showLoading({
      title: '生成中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '菜单已生成',
        icon: 'success'
      });
      this.loadWeeklyMenu();
    }, 800);
  }
});
