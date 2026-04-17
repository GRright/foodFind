/**
 * 推荐引擎 - 优化版
 * 1. 冷启动优化
 * 2. 探索-利用平衡
 * 3. 场景化推荐
 * 4. 解释性推荐
 * 5. 用户分层策略
 * 6. 召回推荐
 * 7. 协同过滤
 */

const { DEFAULT_RECIPES, DEFAULT_MOVIES, MEAL_TIME_CONFIG } = require('./constants.js');
const UserProfileManager = require('./userProfileManager.js');
const PairingEngine = require('./pairingEngine.js');

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
   * 获取当前场景上下文（增强版多维场景感知）
   */
  getContext() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();
    
    // 1. 餐别识别
    let mealType = 'dinner';
    let mealName = '晚餐';
    if (hour >= MEAL_TIME_CONFIG.breakfast.start && hour < MEAL_TIME_CONFIG.breakfast.end) {
      mealType = 'breakfast';
      mealName = '早餐';
    } else if (hour >= MEAL_TIME_CONFIG.lunch.start && hour < MEAL_TIME_CONFIG.lunch.end) {
      mealType = 'lunch';
      mealName = '午餐';
    }

    // 2. 天气识别
    const weather = this._getCurrentWeather();

    // 3. 季节识别
    const seasons = ['冬季', '春季', '夏季', '秋季'];
    const season = seasons[Math.floor(month / 3)];

    // 4. 社交场景推断（基于访问时间模式）
    const socialContext = this._inferSocialContext(hour, day);

    // 5. 情绪感知（基于时间模式）
    const moodContext = this._inferMoodContext(hour, day);

    // 6. 生理场景（基于用户行为历史）
    const physiologicalContext = this._inferPhysiologicalContext();

    return {
      mealType,
      mealName,
      isWeekend: day === 0 || day === 6,
      isHoliday: false,
      weather,
      season,
      hour,
      timestamp: now.getTime(),
      social: socialContext,
      mood: moodContext,
      physiological: physiologicalContext
    };
  }

  /**
   * 社交场景推断
   */
  _inferSocialContext(hour, day) {
    const isWeekend = day === 0 || day === 6;
    const isDinnerTime = hour >= 18 && hour <= 22;
    const isLunchTime = hour >= 11 && hour <= 14;
    
    if (isWeekend && isDinnerTime) {
      return {
        id: 'family_dinner',
        name: '家庭聚餐',
        icon: '👨‍👩‍👧‍👦',
        recommendation: '多人份菜品优先'
      };
    } else if (!isWeekend && (hour >= 7 && hour <= 9)) {
      return {
        id: 'solo_breakfast',
        name: '独自早餐',
        icon: '🥐',
        recommendation: '快速便捷'
      };
    } else if (isLunchTime && !isWeekend) {
      return {
        id: 'work_lunch',
        name: '工作午餐',
        icon: '💼',
        recommendation: '营养均衡'
      };
    }
    
    return {
      id: 'unknown',
      name: '一般场景',
      icon: '🍽️',
      recommendation: '均衡推荐'
    };
  }

  /**
   * 情绪感知
   */
  _inferMoodContext(hour, day) {
    const isMonday = day === 1;
    const isFriday = day === 5;
    const isLateNight = hour >= 22 && hour <= 2;
    
    if (isMonday && hour <= 12) {
      return {
        id: 'monday_blues',
        name: '周一焦虑',
        icon: '☕',
        recommendation: '推荐热饮和能量食物'
      };
    } else if (isFriday && hour >= 18) {
      return {
        id: 'friday_fun',
        name: '周五快乐',
        icon: '🎉',
        recommendation: '推荐美食和甜点'
      };
    } else if (isLateNight) {
      return {
        id: 'late_night',
        name: '深夜',
        icon: '🌙',
        recommendation: '推荐宵夜'
      };
    } else if (hour >= 6 && hour <= 10) {
      return {
        id: 'morning_fresh',
        name: '清晨',
        icon: '🌅',
        recommendation: '推荐轻食和健康食品'
      };
    }
    
    return {
      id: 'neutral',
      name: '中性情绪',
      icon: '😀',
      recommendation: '均衡推荐'
    };
  }

  /**
   * 生理场景推断
   */
  _inferPhysiologicalContext() {
    const preferences = UserProfileManager.getProfile().implicit || {};
    const recentOrders = UserProfileManager.getBehaviorHistory(10);
    
    const hasOrderedHealthy = recentOrders.some(b => 
      ['低卡', '健康', '轻食'].includes(b.itemId?.tags?.[0])
    );
    
    const hasOrderedSpicy = recentOrders.some(b => 
      ['辣', '麻辣', '香辣'].includes(b.itemId?.tags?.[0])
    );

    if (hasOrderedHealthy) {
      return {
        id: 'health_focused',
        name: '健康关注',
        icon: '🥗',
        recommendation: '低卡高蛋白'
      };
    } else if (hasOrderedSpicy) {
      return {
        id: 'spicy_lover',
        name: '嗜辣',
        icon: '🌶️',
        recommendation: '推荐辣味菜品'
      };
    }
    
    return {
      id: 'general',
      name: '一般偏好',
      icon: '🍽️',
      recommendation: '均衡推荐'
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
    const tier = UserProfileManager.getUserTier();
    const tierStrategy = UserProfileManager.getTierRecommendStrategy();
    
    // 根据用户分层动态调整探索比例
    const originalExploreRatio = RECOMMEND_CONFIG.EXPLORE_RATIO;
    RECOMMEND_CONFIG.EXPLORE_RATIO = tierStrategy.exploreRatio;
    
    let recommendations;
    const isColdStart = this._isColdStart();
    
    if (isColdStart && !options.skipColdStart) {
      recommendations = this._getColdStartRecommendations(context, count);
    } else if (tier.id === 'churning' && tierStrategy.enableRecall) {
      // 流失风险用户：召回推荐
      recommendations = this._getRecallRecommendations(context, profile, count);
    } else if (tierStrategy.enableExclusive) {
      // 忠实用户：专属推荐
      recommendations = this._getExclusiveRecommendations(context, profile, count);
    } else {
      recommendations = this._getBalancedRecommendations(context, profile, count);
    }

    // 恢复原始探索比例
    RECOMMEND_CONFIG.EXPLORE_RATIO = originalExploreRatio;

    // 添加解释
    recommendations = this._addExplanations(recommendations, context, profile, tier);

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
  _addExplanations(recommendations, context, profile, tier = null) {
    return recommendations.map(recipe => {
      let explanation = '';

      if (recipe.isColdStart) {
        if (context.weather === 'cold' && recipe.tags.includes('暖食')) {
          explanation = `天气寒冷，推荐暖身的${recipe.name}`;
        } else if (context.mealType === 'breakfast') {
          explanation = '快手早餐，开启活力一天';
        } else {
          explanation = '热门推荐，深受用户喜爱';
        }
      } else if (recipe.isExploration) {
        explanation = '新品尝鲜，拓展你的美食地图';
      } else if (recipe.isRecall) {
        explanation = `你曾经喜爱的${recipe.name}，再次推荐给你`;
      } else if (recipe.isExclusive) {
        explanation = '💎 忠实用户专属推荐';
      } else if (recipe.type === 'collaborative') {
        explanation = recipe.explanation || '喜欢这道菜的用户也推荐这个';
      } else {
        if (recipe.reasons && recipe.reasons.length > 0) {
          explanation = recipe.reasons[0];
        } else {
          explanation = '为你精选的个性化推荐';
        }
      }

      // 添加用户分层标签
      if (tier && tier.name && recipe.isExclusive) {
        explanation = `${explanation} · ${tier.name}专属`;
      }

      return {
        ...recipe,
        explanation
      };
    });
  }

  /**
   * 召回推荐（针对流失风险用户）
   */
  _getRecallRecommendations(context, profile, count) {
    const recipes = [...DEFAULT_RECIPES];
    const favorites = UserProfileManager.getFavoriteRecipes();
    
    // 1. 优先召回历史最爱
    const recallRecipes = favorites.slice(0, Math.ceil(count * 0.6)).map(fav => {
      const recipe = recipes.find(r => r.id === fav.id);
      if (!recipe) return null;
      
      return {
        ...recipe,
        score: 0.8 + (fav.score / 100),
        reasons: ['历史最爱'],
        type: 'recall',
        isRecall: true
      };
    }).filter(Boolean);

    // 2. 补充个性化推荐
    const remaining = count - recallRecipes.length;
    if (remaining > 0) {
      const balanced = this._getBalancedRecommendations(context, profile, remaining);
      recallRecipes.push(...balanced);
    }

    return recallRecipes.slice(0, count);
  }

  /**
   * 专属推荐（针对忠实用户）
   */
  _getExclusiveRecommendations(context, profile, count) {
    const recipes = [...DEFAULT_RECIPES];
    
    // 1. 高匹配度推荐
    let scoredRecipes = recipes.map(recipe => {
      let score = 0.6; // 基础分更高
      let reasons = [];

      // 深度个性化
      const cuisineWeights = profile.implicit.cuisineWeights || {};
      const topCuisines = Object.entries(cuisineWeights)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      for (const [cuisine, weight] of topCuisines) {
        if (recipe.cuisine_type === cuisine) {
          score += 0.3;
          reasons.push(`深度匹配${cuisine}偏好`);
          break;
        }
      }

      // 新菜品优先（忠实用户更适合尝试新品）
      if (!this._wasRecentlyRecommended(recipe.id, 48)) {
        score += 0.15;
        reasons.push('精选新品');
      }

      return {
        ...recipe,
        score: Math.min(score, 1),
        reasons,
        type: 'exclusive',
        isExclusive: true
      };
    });

    scoredRecipes.sort((a, b) => b.score - a.score);
    return scoredRecipes.slice(0, count);
  }

  /**
   * 协同过滤推荐
   */
  getCollaborativeRecommendations(count = 3) {
    const recipes = [...DEFAULT_RECIPES];
    const profile = UserProfileManager.getProfile();
    
    // 基于用户画像推断相似用户群体
    const topCuisines = UserProfileManager.getTopCuisines(2);
    const cuisineTags = topCuisines.map(c => c.cuisine);
    
    // 模拟协同过滤（基于标签权重）
    const tagWeights = profile.implicit.tagWeights || {};
    const topTags = Object.entries(tagWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // 基于相似标签推荐
    let scoredRecipes = recipes.map(recipe => {
      let score = 0.4; // 基础分
      let matchTags = [];

      // 标签匹配度
      recipe.tags?.forEach(tag => {
        if (topTags.includes(tag)) {
          score += 0.15;
          matchTags.push(tag);
        }
      });

      // 菜系匹配
      if (cuisineTags.includes(recipe.cuisine_type)) {
        score += 0.2;
      }

      return {
        ...recipe,
        score,
        matchTags,
        type: 'collaborative',
        explanation: matchTags.length > 0 
          ? `喜欢${matchTags.slice(0, 2).join('、')}口味的用户也推荐`
          : '相似用户的选择'
      };
    });

    scoredRecipes.sort((a, b) => b.score - a.score);
    return scoredRecipes.slice(0, count);
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

  getUserTier() {
    return UserProfileManager.getUserTier();
  }

  getTierStrategy() {
    return UserProfileManager.getTierRecommendStrategy();
  }

  getPairingRecommendations(recipe, context, count = 2) {
    return PairingEngine.getPairingRecommendations(recipe, context, count);
  }

  getLifecycleStage() {
    return UserProfileManager.getLifecycleStage();
  }

  getSensitivityScore() {
    return UserProfileManager.getSensitivityScore();
  }

  // ========== 反馈价值挖掘 - 动态权重调整 ==========

  recordFeedback(recipeId, feedbackType, feedbackDetails = {}) {
    const feedbackKey = `feedback_${recipeId}`;
    let feedbackHistory = [];
    
    try {
      feedbackHistory = wx.getStorageSync(feedbackKey) || [];
    } catch (e) {
      feedbackHistory = [];
    }

    const feedback = {
      recipeId,
      type: feedbackType,
      details: feedbackDetails,
      timestamp: Date.now(),
      weight: this._calculateFeedbackWeight(feedbackType, feedbackDetails)
    };

    feedbackHistory.push(feedback);
    
    if (feedbackHistory.length > 50) {
      feedbackHistory = feedbackHistory.slice(-50);
    }

    wx.setStorageSync(feedbackKey, feedbackHistory);

    this._updateFeedbackInference(feedback);
  }

  _calculateFeedbackWeight(feedbackType, feedbackDetails) {
    let baseWeight = 0;
    
    switch (feedbackType) {
      case 'like':
        baseWeight = 1.0;
        break;
      case 'dislike':
        baseWeight = -1.0;
        break;
      case 'view_long':
        baseWeight = 0.3;
        break;
      case 'order':
        baseWeight = 2.0;
        break;
      case 'favorite':
        baseWeight = 1.5;
        break;
    }

    if (feedbackDetails.isRepeat) {
      baseWeight *= 1.5;
    }

    if (feedbackDetails.isVerified) {
      baseWeight *= 2.0;
    }

    return baseWeight;
  }

  _updateFeedbackInference(feedback) {
    const feedbackAggregation = {};
    
    try {
      feedbackAggregation = wx.getStorageSync('feedback_aggregation') || {};
    } catch (e) {
      feedbackAggregation = {};
    }

    const recipeId = feedback.recipeId;
    
    if (!feedbackAggregation[recipeId]) {
      feedbackAggregation[recipeId] = {
        totalFeedback: 0,
        totalWeight: 0,
        lastFeedback: Date.now()
      };
    }

    feedbackAggregation[recipeId].totalFeedback++;
    feedbackAggregation[recipeId].totalWeight += feedback.weight;
    feedbackAggregation[recipeId].lastFeedback = Date.now();

    wx.setStorageSync('feedback_aggregation', feedbackAggregation);
  }

  getFeedbackWeight(recipeId) {
    const feedbackAggregation = wx.getStorageSync('feedback_aggregation') || {};
    const aggregation = feedbackAggregation[recipeId];
    
    if (!aggregation) return 0;

    const daysSinceLastFeedback = (Date.now() - aggregation.lastFeedback) / (24 * 60 * 60 * 1000);
    const timeDecay = Math.pow(0.5, daysSinceLastFeedback / 30);

    return aggregation.totalWeight * timeDecay;
  }

  analyzeFeedbackPatterns() {
    const feedbackAggregation = wx.getStorageSync('feedback_aggregation') || {};
    const patterns = {
      positiveRecipes: [],
      negativeRecipes: [],
      hotTags: {},
      coldTags: {}
    };

    for (const [recipeId, aggregation] of Object.entries(feedbackAggregation)) {
      if (aggregation.totalWeight > 3) {
        patterns.positiveRecipes.push(recipeId);
      } else if (aggregation.totalWeight < -2) {
        patterns.negativeRecipes.push(recipeId);
      }
    }

    return patterns;
  }
}

module.exports = new RecommendEngine();
