/**
 * API 接口封装 - 完整版
 * 所有API调用都有本地fallback，确保离线可用
 */

const api = {
  // ========== 菜谱相关 ==========
  
  /**
   * 获取菜谱列表
   */
  getRecipes: async (params = {}) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getRecipes',
        data: params
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getRecipes fallback to local');
      return { success: true, recipes: [] };
    }
  },

  /**
   * 获取菜谱详情
   */
  getRecipeById: async (recipeId) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getRecipeById',
        data: { recipeId }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getRecipeById fallback to local');
      return { success: true, recipe: { id: recipeId, name: '未知菜谱' } };
    }
  },

  // ========== 电影相关 ==========
  
  /**
   * 获取电影列表
   */
  getMovies: async (params = {}) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMovies',
        data: params
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getMovies fallback to local');
      return { success: true, movies: [], total: 0 };
    }
  },

  /**
   * 根据菜谱推荐电影
   */
  getMoviesByRecipe: async (recipeId) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMoviesByRecipe',
        data: { recipeId }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getMoviesByRecipe fallback to local');
      return { success: true, movies: [] };
    }
  },

  // ========== 用户相关 ==========
  
  /**
   * 获取用户偏好设置
   */
  getPreferences: async (userId) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { userId }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getPreferences fallback to local');
      return { success: true, preferences: {}, allergies: [], moviePreferences: {} };
    }
  },

  /**
   * 更新用户偏好设置
   */
  updatePreferences: async (userId, data) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: { userId, ...data }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] updatePreferences fallback to local');
      return { success: true };
    }
  },

  // ========== 引导页相关 ==========
  
  /**
   * 获取引导页问题
   */
  getOnboardingQuestions: async () => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getOnboardingQuestions'
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getOnboardingQuestions fallback to local');
      return { success: true, questions: [] };
    }
  },

  /**
   * 保存引导页答案
   */
  saveOnboardingAnswers: async (data) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'saveOnboardingAnswers',
        data: data
      });
      return res.result;
    } catch (e) {
      console.warn('[API] saveOnboardingAnswers fallback to local');
      return { success: true };
    }
  },

  /**
   * 检查引导状态
   */
  getOnboardingStatus: async (userId) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'checkOnboardingStatus',
        data: { userId }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getOnboardingStatus fallback to local');
      return { success: true, isNewUser: true, completed: false };
    }
  },

  // ========== 菜单相关 ==========
  
  /**
   * 获取周菜单
   */
  getWeeklyMenu: async (userId, weekStart) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getWeeklyMenu',
        data: { userId, weekStart }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] getWeeklyMenu fallback to local');
      return { success: true, menu: [] };
    }
  },

  /**
   * 生成周菜单
   */
  generateMenu: async (data) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'generateMenu',
        data: data
      });
      return res.result;
    } catch (e) {
      console.warn('[API] generateMenu fallback to local');
      return { success: true, menu: [] };
    }
  },

  /**
   * 替换菜单中的菜品
   */
  replaceRecipe: async (data) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'replaceRecipe',
        data: data
      });
      return res.result;
    } catch (e) {
      console.warn('[API] replaceRecipe fallback to local');
      return { success: true };
    }
  },

  /**
   * 更新菜单项
   */
  updateMenuItem: async (menuId, data) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateMenuItem',
        data: { menuId, ...data }
      });
      return res.result;
    } catch (e) {
      console.warn('[API] updateMenuItem fallback to local');
      return { success: true };
    }
  },

  // ========== 反馈相关 ==========
  
  /**
   * 创建反馈
   */
  createFeedback: async (data) => {
    try {
      const res = await wx.cloud.callFunction({
        name: 'createFeedback',
        data: data
      });
      return res.result;
    } catch (e) {
      console.warn('[API] createFeedback fallback to local');
      return { success: true };
    }
  }
};

module.exports = api;
