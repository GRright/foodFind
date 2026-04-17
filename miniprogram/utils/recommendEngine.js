/**
 * 推荐引擎 - 优化版
 * 使用常量数据，简化逻辑
 */

const { DEFAULT_RECIPES, DEFAULT_MOVIES, MEAL_TIME_CONFIG } = require('./constants.js');

class RecommendEngine {
  constructor() {
    this.userProfile = null;
    this.realTimeWeights = {};
    this.sessionId = null;
  }

  init() {
    this._loadProfile();
    this._resetSession();
  }

  _loadProfile() {
    try {
      this.userProfile = wx.getStorageSync('user_profile') || null;
    } catch (e) {
      this.userProfile = null;
    }
  }

  _resetSession() {
    this.sessionId = 'sess_' + Date.now();
    this.realTimeWeights = {};
  }

  /**
   * 获取当前场景上下文
   */
  getContext() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    let mealType = 'dinner';
    if (hour >= MEAL_TIME_CONFIG.breakfast.start && hour < MEAL_TIME_CONFIG.breakfast.end) {
      mealType = 'breakfast';
    } else if (hour >= MEAL_TIME_CONFIG.lunch.start && hour < MEAL_TIME_CONFIG.lunch.end) {
      mealType = 'lunch';
    }

    return {
      mealType,
      isWeekend: day === 0 || day === 6,
      hour,
      timestamp: now.getTime()
    };
  }

  /**
   * 获取推荐列表
   */
  getRecommendations(count = 3) {
    const context = this.getContext();
    const recipes = this._scoreAndSortRecipes(context);
    
    // 添加探索项（20%探索率）
    return this._addExploration(recipes, count);
  }

  /**
   * 计算菜谱分数并排序
   */
  _scoreAndSortRecipes(context) {
    return DEFAULT_RECIPES.map(recipe => {
      let score = 0.5;

      // 基于用户画像加分
      if (this.userProfile?.taste_weights?.spicy > 0.5 && recipe.tags.includes('辣')) {
        score += 0.2;
      }
      if (this.userProfile?.cuisine_weights?.[recipe.cuisine_type]) {
        score += 0.15;
      }

      // 基于场景加分
      if (context.mealType === 'breakfast' && recipe.cooking_time <= 20) {
        score += 0.2;
      }
      if (context.isWeekend && recipe.tags.includes('硬菜')) {
        score += 0.1;
      }

      // 基于实时行为加分
      if (this.realTimeWeights[recipe.id]) {
        score += this.realTimeWeights[recipe.id];
      }

      return { ...recipe, score: Math.min(1, Math.max(0, score)) };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * 添加探索项
   */
  _addExploration(sortedRecipes, targetCount) {
    const result = sortedRecipes.slice(0, Math.ceil(targetCount * 0.8));
    const explorationCount = targetCount - result.length;
    
    if (explorationCount > 0) {
      const usedIds = new Set(result.map(r => r.id));
      const available = DEFAULT_RECIPES.filter(r => !usedIds.has(r.id));
      
      for (let i = 0; i < explorationCount && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length);
        result.push({ ...available.splice(idx, 1)[0], isExploration: true });
      }
    }

    return result;
  }

  /**
   * 记录浏览行为
   */
  recordView(recipeId) {
    this.realTimeWeights[recipeId] = (this.realTimeWeights[recipeId] || 0) + 0.1;
  }

  /**
   * 记录喜欢行为
   */
  recordLike(recipeId) {
    this.realTimeWeights[recipeId] = (this.realTimeWeights[recipeId] || 0) + 0.3;
  }

  /**
   * 记录不喜欢行为
   */
  recordDislike(recipeId, reason) {
    this.realTimeWeights[recipeId] = (this.realTimeWeights[recipeId] || 0) - 0.5;
  }

  /**
   * 更新用户画像
   */
  updateProfile(updates) {
    this.userProfile = { ...this.userProfile, ...updates, updatedAt: Date.now() };
    wx.setStorageSync('user_profile', this.userProfile);
  }

  /**
   * 获取默认电影
   */
  getMovies() {
    return DEFAULT_MOVIES;
  }

  /**
   * 获取默认菜谱
   */
  getRecipes() {
    return DEFAULT_RECIPES;
  }
}

// 导出单例
module.exports = new RecommendEngine();
