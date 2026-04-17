const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    menuItems: [
      { icon: '⚙️', title: '偏好设置', action: 'goToPreferences' },
      { icon: '❤️', title: '我的收藏', action: 'goToFavorites' },
      { icon: '📜', title: '历史记录', action: 'goToHistory' }
    ],
    aboutItems: [
      { icon: 'ℹ️', title: '关于我们', action: 'about' },
      { icon: '💬', title: '意见反馈', action: 'feedback' }
    ]
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo || {}
    });
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo || {}
    });
  },

  goToPreferences() {
    wx.navigateTo({
      url: '/pages/onboarding/onboarding?mode=edit'
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

  about() {
    wx.showModal({
      title: '关于吃点啥',
      content: '吃点啥 v1.0\n\n为您解决每日三餐决策难与用餐观影选择难的双重痛点！',
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
});
