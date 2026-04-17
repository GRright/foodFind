/**
 * 推荐引擎 - 优化版
 * 1. 冷启动优化
 * 2. 探索-利用平衡
 * 3. 场景化推荐
 * 4. 解释性推荐
 */

const { DEFAULT_RECIPES, DEFAULT_MOVIES, MEAL_TIME_CONFIG } = require('./constants.js');
const UserProfileManager = require('./userProfileManager.js');

// 推荐配置
const RECOMMEND_CONFIG = {
  EXPLORE_RATIO: 0.2,           // 20% 探索
  EXPLORE_CATEGORIES: ['新品尝鲜', '跨界融合', '时令推荐'],
  MAX_HISTORY_LENGTH: 50,       // 最大历史记录
  DIVERSITY_PENALTY: 0.1,       // 多样性惩罚
  EXPLAIN_THRESHOLD: 0.6        // 解释阈值
};

class RecommendEngine {
  constructor() {
    this.userProfile = null;
    this.realTimeWeights = {};
    this.sessionId = null;
    this.recommendationHistory = [];
    this.explorationCount = 0;
    this.exploitationCount = 0;
  }

  init() {
    UserProfileManager.init();
    this._loadHistory();
    this._resetSession();
  }

  _loadHistory() {
    try {
      this.recommendationHistory = wx.getStorageSync('recommendation_history') || [];
    } catch (e) {
      this.recommendationHistory = [];
    }
  }

  _saveHistory() {
    wx.setStorageSync('recommendation_history', 
      this.recommendationHistory.slice(-RECOMMEND_CONFIG.MAX_HISTORY_LENGTH)
    );
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
    const month = now.getMonth();
    
    // 判断餐别
    let mealType = 'dinner';
    let mealName = '晚餐';
    if (hour >= MEAL_TIME_CONFIG.breakfast.start && hour < MEAL_TIME_CONFIG.breakfast.end) {
      mealType = 'breakfast';
      mealName = '早餐';
    } else if (hour >= MEAL_TIME_CONFIG.lunch.start && hour < MEAL_TIME_CONFIG.lunch.end) {
      mealType = 'lunch';
      mealName = '午餐';
    }

    // 天气模拟（可根据实际接入天气API）
    const weather = this._getCurrentWeather();

    // 季节
    const seasons = ['冬季', '春季', '夏季', '秋季'];
    const season = seasons[Math.floor(month / 3)];

    return {
      mealType,
      mealName,
      isWeekend: day === 0 || day === 6,
      isHoliday: false, // 可接入节假日API
      weather,
      season,
      hour,
      timestamp: now.getTime()
    };
  }

  _getCurrentWeather() {
    // 简化实现，实际可接入天气API
    const weathers = ['sunny', 'rainy', 'cloudy', 'cold', 'hot'];
    // 根据月份推断
    const month = new Date().getMonth();
    if (month >= 11 || month <= 2) return 'cold';
    if (month >= 6 && month <= 8) return 'hot';
    return 'sunny';
  }

  /**
   * 主推荐方法
   */
  getRecommendations(count = 5, options = {}) {
    const context = this.getContext();
    const profile = UserProfileManager.getProfile();
    
    // 判断是否是冷启动
    const isColdStart = this._isColdStart();
    
    let recommendations;
    
    if (isColdStart && !options.skipColdStart) {
      // 冷启动推荐
      recommendations = this._getColdStartRecommendations(context, count);
    } else {
      // 正常推荐（探索-利用平衡）
      recommendations = this._getBalancedRecommendations(context, profile, count);
    }

    // 添加解释
    recommendations = this._addExplanations(recommendations, context, profile);

    // 记录推荐历史
    this._recordRecommendations(recommendations);

    return recommendations;
  }

  /**
   * 冷启动检测
   */
  _isColdStart() {
    const profile = UserProfileManager.getProfile();
    const history = UserProfileManager.getBehaviorHistory(30);
    
    // 无历史数据或未完成引导
    if (!profile || history.length < 3) {
      return true;
    }
    
    // 新用户（7天内注册）
    if (Date.now() - profile.createdAt < 7 * 24 * 60 * 60 * 1000) {
      return true;
    }

    return false;
  }

  /**
   * 冷启动推荐策略
   */
  _getColdStartRecommendations(context, count) {
    const recipes = [...DEFAULT_RECIPES];
    let scoredRecipes = [];

    // 1. 场景化默认推荐
    recipes.forEach(recipe => {
      let score = 0.5;
      let reasons = [];

      // 时段匹配
      if (context.mealType === 'breakfast') {
        if (recipe.cooking_time <= 15) {
          score += 0.3;
          reasons.push('快手早餐');
        }
      } else if (context.mealType === 'dinner') {
        if (recipe.tags.includes('硬菜')) {
          score += 0.2;
          reasons.push('丰盛晚餐');
        }
      }

      // 天气匹配
      if (context.weather === 'cold' && recipe.tags.includes('暖食')) {
        score += 0.25;
        reasons.push('暖身推荐');
      }
      if (context.weather === 'hot' && recipe.tags.includes('清爽')) {
        score += 0.25;
        reasons.push('清爽解暑');
      }

      // 季节匹配
      if (context.season === '冬季' && recipe.tags.includes('暖食')) {
        score += 0.15;
      }

      scoredRecipes.push({
        ...recipe,
        score,
        reasons,
        isColdStart: true
      });
    });

    // 2. 热门推荐 + 多样性
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // 确保多样性：不同菜系
    const diverseRecipes = this._ensureDiversity(scoredRecipes, count);

    return diverseRecipes;
  }

  /**
   * 探索-利用平衡推荐
   */
  _getBalancedRecommendations(context, profile, count) {
    const recipes = [...DEFAULT_RECIPES];
    const explicit = profile?.explicit || {};
    const implicit = profile?.implicit || {};

    // 计算探索 vs 利用的数量
    const exploreCount = Math.ceil(count * RECOMMEND_CONFIG.EXPLORE_RATIO);
    const exploitCount = count - exploreCount;

    // 1. 利用（基于用户画像）
    let exploitedRecipes = recipes.map(recipe => {
      let score = 0.5;
      let reasons = [];

      // 显性偏好匹配
      if (explicit.cuisinePreference?.includes(recipe.cuisine_type)) {
        score += 0.25;
        reasons.push(`你喜欢的${recipe.cuisine_type}`);
      }

      // 口味匹配
      if (explicit.tastePreference?.spicy > 0.6 && recipe.tags.includes('辣')) {
        score += 0.2;
        reasons.push('符合你的辣度偏好');
      } else if (explicit.tastePreference?.spicy < 0.3 && !recipe.tags.includes('辣')) {
        score += 0.15;
        reasons.push('不辣，适合你');
      }

      // 隐性偏好（时序加权）
      const cuisineScore = UserProfileManager.getTimeDecayScore(recipe.cuisine_type);
      if (cuisineScore > 10) {
        score += Math.min(0.2, cuisineScore / 100);
        reasons.push('最近常点这类');
      }

      // 标签匹配
      recipe.tags?.forEach(tag => {
        const tagWeight = implicit.tagWeights?.[tag] || 0;
        if (tagWeight > 5) {
          score += 0.05;
        }
      });

      // 场景匹配
      if (context.mealType === 'breakfast' && recipe.cooking_time <= 15) {
        score += 0.15;
        reasons.push('快手早餐');
      }

      // 实时行为权重
      if (this.realTimeWeights[recipe.id]) {
        const weight = this.realTimeWeights[recipe.id];
        score += weight;
        if (weight > 0.2) {
          reasons.push('你最近喜欢这类');
        }
      }

      // 多样性惩罚（避免重复推荐）
      if (this._wasRecentlyRecommended(recipe.id)) {
        score -= RECOMMEND_CONFIG.DIVERSITY_PENALTY;
      }

      return {
        ...recipe,
        score: Math.max(0, Math.min(1, score)),
        reasons,
        type: 'exploit'
      };
    });

    exploitedRecipes.sort((a, b) => b.score - a.score);
    const selectedExploit = exploitedRecipes.slice(0, exploitCount);

    // 2. 探索（新品类）
    const exploredRecipes = this._getExplorationRecipes(recipes, selectedExploit, exploreCount);

    // 3. 合并并打乱（保持一定随机性）
    const mixed = [...selectedExploit, ...exploredRecipes];
    return this._shuffleWithPriority(mixed);
  }

  /**
   * 获取探索推荐（新品类）
   */
  _getExplorationRecipes(allRecipes, selectedExploit, count) {
    const usedIds = new Set(selectedExploit.map(r => r.id));
    const profile = UserProfileManager.getProfile();
    
    // 找出用户没尝试过的菜系
    const triedCuisines = new Set(profile?.explicit?.cuisinePreference || []);
    const unexploredRecipes = allRecipes.filter(r => 
      !usedIds.has(r.id) && !triedCuisines.has(r.cuisine_type)
    );

    // 随机选择，但优先高分菜品
    const shuffled = unexploredRecipes.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, count).map(recipe => ({
      ...recipe,
      score: 0.4,
      reasons: ['新品尝鲜，拓展口味'],
      type: 'explore',
      isExploration: true
    }));
  }

  /**
   * 确保多样性（不同菜系）
   */
  _ensureDiversity(recipes, count) {
    const selected = [];
    const usedCuisines = new Set();

    // 优先选择不同菜系
    for (const recipe of recipes) {
      if (selected.length >= count) break;
      
      if (!usedCuisines.has(recipe.cuisine_type) || selected.length < count - 2) {
        selected.push(recipe);
        usedCuisines.add(recipe.cuisine_type);
      }
    }

    return selected;
  }

  /**
   * 添加推荐理由解释
   */
  _addExplanations(recommendations, context, profile) {
    return recommendations.map(recipe => {
      let explanation = '';

      if (recipe.isColdStart) {
        // 冷启动解释
        if (context.weather === 'cold' && recipe.tags.includes('暖食')) {
          explanation = `天气寒冷，推荐暖身的${recipe.name}`;
        } else if (context.mealType === 'breakfast') {
          explanation = '快手早餐，开启活力一天';
        } else {
          explanation = '热门推荐，深受用户喜爱';
        }
      } else if (recipe.isExploration) {
        // 探索解释
        explanation = '新品尝鲜，拓展你的美食地图';
      } else {
        // 个性化解释
        if (recipe.reasons && recipe.reasons.length > 0) {
          explanation = recipe.reasons[0];
        } else {
          explanation = '为你精选的个性化推荐';
        }
      }

      return {
        ...recipe,
        explanation
      };
    });
  }

  /**
   * 检查是否最近推荐过
   */
  _wasRecentlyRecommended(recipeId, hours = 24) {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.recommendationHistory.some(h => 
      h.recipeId === recipeId && h.timestamp > cutoff
    );
  }

  /**
   * 记录推荐历史
   */
  _recordRecommendations(recommendations) {
    recommendations.forEach(r => {
      this.recommendationHistory.push({
        recipeId: r.id,
        timestamp: Date.now(),
        type: r.type || 'normal'
      });

      if (r.type === 'explore') {
        this.explorationCount++;
      } else {
        this.exploitationCount++;
      }
    });

    this._saveHistory();
  }

  /**
   * 带优先级的打乱
   */
  _shuffleWithPriority(array) {
    // 高分项目优先，但保持一定随机性
    return array.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 0.2) {
        return scoreDiff; // 分数差距大，按分数排序
      }
      return Math.random() - 0.5; // 分数接近，随机排序
    });
  }

  // ========== 实时反馈调整 ==========

  recordView(recipeId) {
    this.realTimeWeights[recipeId] = (this.realTimeWeights[recipeId] || 0) + 0.1;
    UserProfileManager.recordImplicitBehavior('VIEW_LONG', { id: recipeId });
  }

  recordLike(recipeId, recipe) {
    this.realTimeWeights[recipeId] = (this.realTimeWeights[recipeId] || 0) + 0.3;
    UserProfileManager.recordExplicitBehavior('FAVORITE', recipe);
  }

  recordDislike(recipeId, recipe, reason) {
    this.realTimeWeights[recipeId] = (this.realTimeWeights[recipeId] || 0) - 0.5;
    UserProfileManager.recordImplicitBehavior('REMOVE_FROM_CART', recipe, { reason });
  }

  recordOrder(recipeId, recipe, orderValue) {
    UserProfileManager.recordExplicitBehavior('ORDER', recipe, { orderValue });
  }

  // ========== 公共API ==========

  getMovies() {
    return DEFAULT_MOVIES;
  }

  getRecipes() {
    return DEFAULT_RECIPES;
  }

  getExplorationStats() {
    const total = this.explorationCount + this.exploitationCount;
    return {
      explorationRate: total > 0 ? this.explorationCount / total : 0,
      explorationCount: this.explorationCount,
      exploitationCount: this.exploitationCount
    };
  }
}

module.exports = new RecommendEngine();
