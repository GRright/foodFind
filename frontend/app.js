const api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    userId: null,
    baseUrl: 'http://localhost:3000/api'
  },

  onLaunch() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = wx.getStorageSync('userId');
    
    if (userInfo && userId) {
      this.globalData.userInfo = userInfo;
      this.globalData.userId = userId;
      this.checkOnboardingStatus(userId);
    } else {
      this.login();
    }
  },

  async checkOnboardingStatus(userId) {
    try {
      const status = await api.getOnboardingStatus(userId);
      if (status.isNewUser || !status.onboardingCompleted) {
        wx.reLaunch({
          url: '/pages/onboarding/onboarding'
        });
      }
    } catch (error) {
      console.error('Check onboarding status failed:', error);
    }
  },

  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          const mockOpenid = 'mock_openid_' + Date.now();
          
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (profileRes) => {
              this.registerUser(mockOpenid, profileRes.userInfo);
            },
            fail: () => {
              this.registerUser(mockOpenid, {
                nickName: '美食爱好者',
                avatarUrl: ''
              });
            }
          });
        }
      }
    });
  },

  registerUser(openid, userInfo) {
    wx.request({
      url: this.globalData.baseUrl + '/users/login',
      method: 'POST',
      data: {
        openid: openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl
      },
      success: (res) => {
        this.globalData.userInfo = res.data.user;
        this.globalData.userId = res.data.user.id;
        wx.setStorageSync('userInfo', res.data.user);
        wx.setStorageSync('userId', res.data.user.id);
        
        if (res.data.user.is_new_user || !res.data.user.onboarding_completed) {
          wx.reLaunch({
            url: '/pages/onboarding/onboarding'
          });
        }
      },
      fail: (err) => {
        console.error('Login failed:', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  }
})
