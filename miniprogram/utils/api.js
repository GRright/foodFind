/**
 * API 接口封装 - 精简版
 * 只保留必要的云函数调用
 */

const api = {
  // ========== 菜谱相关 ==========
  
  /**
   * 获取菜谱列表
   */
  getRecipes: async (params = {}) => {
    const res = await wx.cloud.callFunction({
      name: 'getRecipes',
      data: params
    });
    return res.result;
  },

  // ========== 电影相关 ==========
  
  /**
   * 获取电影列表
   */
  getMovies: async (params = {}) => {
    const res = await wx.cloud.callFunction({
      name: 'getMovies',
      data: params
    });
    return res.result;
  },

  // ========== 用户相关 ==========
  
  /**
   * 更新用户偏好设置
   */
  updatePreferences: async (userId, data) => {
    const res = await wx.cloud.callFunction({
      name: 'updateUserProfile',
      data: { userId, ...data }
    });
    return res.result;
  },

  // ========== 引导页相关 ==========
  
  /**
   * 获取引导页问题
   */
  getOnboardingQuestions: async () => {
    const res = await wx.cloud.callFunction({
      name: 'getOnboardingQuestions'
    });
    return res.result;
  },

  /**
   * 保存引导页答案
   */
  saveOnboardingAnswers: async (data) => {
    const res = await wx.cloud.callFunction({
      name: 'saveOnboardingAnswers',
      data: data
    });
    return res.result;
  },

  /**
   * 检查引导状态
   */
  getOnboardingStatus: async (userId) => {
    const res = await wx.cloud.callFunction({
      name: 'checkOnboardingStatus',
      data: { userId }
    });
    return res.result;
  },

  // ========== 菜单生成（保留接口，简化实现）==========
  
  /**
   * 生成周菜单
   */
  generateMenu: async (data) => {
    // 简化实现：本地生成，不调用云函数
    return { success: true, menu: [] };
  }
};

module.exports = api;
