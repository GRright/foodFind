const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    userId: null,
    showPreferences: false,
    dietGoals: ['均衡饮食', '减脂', '增肌', '增重'],
    dietGoalIndex: 0,
    tasteOptions: ['清淡', '麻辣', '酸甜', '咸鲜', '香辣', '原味'],
    tastePreferences: [],
    allergyOptions: ['海鲜', '花生', '牛奶', '鸡蛋', '小麦', '大豆'],
    allergies: [],
    movieGenreOptions: ['喜剧', '动作', '爱情', '科幻', '悬疑', '纪录片', '动画'],
    movieGenres: []
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      userId: app.globalData.userId
    });
    this.loadPreferences();
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo || {}
    });
  },

  loadPreferences() {
    const userId = app.globalData.userId;
    if (!userId) return;
    
    api.getPreferences(userId)
      .then(res => {
        const preferences = res.preferences || {};
        const allergies = res.allergies || [];
        const moviePreferences = res.moviePreferences || {};
        
        const dietGoalIndex = this.data.dietGoals.indexOf(preferences.dietGoal || '均衡饮食');
        
        this.setData({
          dietGoalIndex: dietGoalIndex >= 0 ? dietGoalIndex : 0,
          tastePreferences: preferences.tastes || [],
          allergies: allergies,
          movieGenres: moviePreferences.genres || []
        });
      })
      .catch(err => {
        console.error('Load preferences failed:', err);
      });
  },

  goToPreferences() {
    this.setData({
      showPreferences: !this.data.showPreferences
    });
  },

  goToFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goToHistory() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  onDietGoalChange(e) {
    this.setData({
      dietGoalIndex: parseInt(e.detail.value)
    });
  },

  toggleTaste(e) {
    const taste = e.currentTarget.dataset.taste;
    const tastePreferences = [...this.data.tastePreferences];
    const index = tastePreferences.indexOf(taste);
    
    if (index > -1) {
      tastePreferences.splice(index, 1);
    } else {
      tastePreferences.push(taste);
    }
    
    this.setData({ tastePreferences });
  },

  toggleAllergy(e) {
    const allergy = e.currentTarget.dataset.allergy;
    const allergies = [...this.data.allergies];
    const index = allergies.indexOf(allergy);
    
    if (index > -1) {
      allergies.splice(index, 1);
    } else {
      allergies.push(allergy);
    }
    
    this.setData({ allergies });
  },

  toggleMovieGenre(e) {
    const genre = e.currentTarget.dataset.genre;
    const movieGenres = [...this.data.movieGenres];
    const index = movieGenres.indexOf(genre);
    
    if (index > -1) {
      movieGenres.splice(index, 1);
    } else {
      movieGenres.push(genre);
    }
    
    this.setData({ movieGenres });
  },

  savePreferences() {
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });
    
    api.updatePreferences(userId, {
      preferences: {
        dietGoal: this.data.dietGoals[this.data.dietGoalIndex],
        tastes: this.data.tastePreferences
      },
      allergies: this.data.allergies,
      moviePreferences: {
        genres: this.data.movieGenres
      }
    })
    .then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.setData({
        showPreferences: false
      });
    })
    .catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    });
  },

  about() {
    wx.showModal({
      title: '关于智慧三餐·悦享观影',
      content: '智慧三餐·悦享观影 v1.0\n\n为您解决每日三餐决策难与用餐观影选择难的双重痛点！',
      showCancel: false
    });
  },

  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的反馈！\n您可以通过以下方式联系我们：\n邮箱：feedback@foodfind.com',
      showCancel: false
    });
  }
})
