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
    const userId = app.globalData.userId;
    if (!userId) return;
    
    api.getWeeklyMenu(userId, this.data.weekStart)
      .then(res => {
        this.setData({
          weeklyMenu: res.weeklyMenu || []
        });
        this.updateMealSections();
      })
      .catch(err => {
        console.error('Load weekly menu failed:', err);
      });
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
    const menuId = e.currentTarget.dataset.id;
    
    wx.showLoading({
      title: '替换中...'
    });
    
    api.replaceRecipe({ menuId })
      .then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '替换成功',
          icon: 'success'
        });
        this.loadWeeklyMenu();
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '替换失败',
          icon: 'none'
        });
      });
  },

  toggleEatingOut(e) {
    const menuId = e.currentTarget.dataset.id;
    const isEatingOut = e.currentTarget.dataset.eatingOut;
    
    api.updateMenuItem(menuId, { is_eating_out: isEatingOut ? 1 : 0 })
      .then(res => {
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
        this.loadWeeklyMenu();
      })
      .catch(err => {
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
      });
  },

  addRecipe() {
    wx.showToast({
      title: '请先生成菜单',
      icon: 'none'
    });
  },

  generateWeekMenu() {
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '生成中...'
    });
    
    api.generateMenu({
      userId: userId,
      startDate: this.data.weekStart,
      days: 7,
      mode: 'balanced'
    })
    .then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '菜单生成成功',
        icon: 'success'
      });
      this.loadWeeklyMenu();
    })
    .catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    });
  }
})
