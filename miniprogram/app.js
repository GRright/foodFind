const api = require('./utils/api.js');
const RecommendEngine = require('./utils/recommendEngine.js');
const ExitUploadManager = require('./utils/exitUploadManager.js');
const UserProfileManager = require('./utils/userProfileManager.js');

App({
  globalData: {
    userInfo: null,
    userId: null,
    RecommendEngine,
    ExitUploadManager,
    UserProfileManager
  },

  async onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d7gvzylmp17ed1957',
        traceUser: true
      });
    }
    
    // 初始化各个管理器
    UserProfileManager.init();
    RecommendEngine.init();
    ExitUploadManager.resetSession();
    
    // 启动时补传
    await ExitUploadManager.syncOnLaunch();
    
    // 启动心跳定时器
    ExitUploadManager.startHeartbeat();
    
    this.checkLoginStatus();
  },

  async onHide() {
    // 离场上传
    await ExitUploadManager.syncOnExit();
    ExitUploadManager.stopHeartbeat();
  },

  onShow() {
    ExitUploadManager.startHeartbeat();
  },

  onError(error) {
    console.error('[App] Error:', error);
    ExitUploadManager.syncOnExit();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = wx.getStorageSync('userId');
    
    if (userInfo && userId) {
      this.globalData.userInfo = userInfo;
      this.globalData.userId = userId;
    } else {
      this.login();
    }
  },

  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          this.registerUser();
        }
      }
    });
  },

  async registerUser() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          nickname: '美食爱好者',
          avatar: ''
        }
      });
      
      if (res.result?.user) {
        this.globalData.userInfo = res.result.user;
        this.globalData.userId = res.result.user.id;
        wx.setStorageSync('userInfo', res.result.user);
        wx.setStorageSync('userId', res.result.user.id);
        
        // 初始化用户画像
        UserProfileManager.init();
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  }
})
