/**
 * 用户画像管理器 - 优化版
 * 行为数据深度分层：显性偏好 + 隐性偏好
 * 时序分析：识别长期偏好演变
 */

const { CACHE_CONFIG } = require('./constants.js');

// 行为权重配置
const BEHAVIOR_WEIGHTS = {
  // 显性偏好（用户主动操作）
  EXPLICIT: {
    SET_PREFERENCE: 15,      // 设置口味偏好
    FAVORITE: 10,            // 收藏菜品
    ORDER: 8,                // 下单
    ADD_TO_CART: 5,          // 加入购物车
    COMPLETE_ONBOARDING: 20  // 完成引导问卷
  },
  // 隐性偏好（通过行为推断）
  IMPLICIT: {
    VIEW_LONG: 3,            // 浏览 > 10秒
    VIEW_SHORT: 1,           // 浏览 < 10秒
    HOVER: 2,                // 悬停/停留
    SCROLL_PAST: -1,         // 快速划过
    CANCEL_ORDER: -5,        // 取消订单
    REMOVE_FROM_CART: -3     // 从购物车移除
  }
};

// 菜系权重衰减配置（时序分析）
const TIME_DECAY = {
  HALF_LIFE_DAYS: 30,        // 30天半衰期
  RECENT_DAYS: 7,            // 最近7天权重加成
  RECENT_BOOST: 1.5          // 近期行为加成系数
};

class UserProfileManager {
  constructor() {
    this.profile = null;
    this.behaviorHistory = [];
    this.preferenceTimeline = [];
  }

  init() {
    this._loadProfile();
    this._loadBehaviorHistory();
  }

  // ========== 数据加载/保存 ==========

  _loadProfile() {
    try {
      this.profile = wx.getStorageSync('user_profile_v2') || this._createDefaultProfile();
    } catch (e) {
      this.profile = this._createDefaultProfile();
    }
  }

  _saveProfile() {
    wx.setStorageSync('user_profile_v2', this.profile);
  }

  _loadBehaviorHistory() {
    try {
      this.behaviorHistory = wx.getStorageSync('behavior_history') || [];
      // 只保留最近90天的行为
      const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
      this.behaviorHistory = this.behaviorHistory.filter(b => b.timestamp > cutoff);
    } catch (e) {
      this.behaviorHistory = [];
    }
  }

  _saveBehaviorHistory() {
    wx.setStorageSync('behavior_history', this.behaviorHistory);
  }

  _createDefaultProfile() {
    return {
      version: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // 显性偏好
      explicit: {
        cuisinePreference: [],      // 喜欢的菜系
        tastePreference: {          // 口味偏好
          spicy: 0.5,               // 辣度 0-1
          sweet: 0.5,
          salty: 0.5,
          sour: 0.5
        },
        dietaryRestrictions: [],    // 饮食限制
        allergies: [],              // 过敏
        priceRange: { min: 0, max: 100 }  // 价格范围
      },
      // 隐性偏好（通过行为推断）
      implicit: {
        cuisineWeights: {},         // 菜系权重（动态计算）
        tagWeights: {},             // 标签权重
        priceSensitivity: 0.5,      // 价格敏感度 0-1
        timePreference: {           // 时间偏好
          breakfast: [],
          lunch: [],
          dinner: []
        }
      },
      // 统计数据
      stats: {
        totalOrders: 0,
        totalViews: 0,
        totalFavorites: 0,
        avgOrderValue: 0,
        lastOrderAt: null
      }
    };
  }

  // ========== 行为记录（分层） ==========

  /**
   * 记录显性偏好行为
   */
  recordExplicitBehavior(actionType, item, details = {}) {
    const behavior = {
      type: 'EXPLICIT',
      action: actionType,
      itemId: item.id,
      itemName: item.name,
      category: item.cuisine_type || item.category,
      tags: item.tags || [],
      price: item.price || 0,
      timestamp: Date.now(),
      weight: BEHAVIOR_WEIGHTS.EXPLICIT[actionType] || 5,
      details
    };

    this.behaviorHistory.push(behavior);
    this._updateExplicitPreference(actionType, item, details);
    this._saveBehaviorHistory();
    
    console.log('[UserProfile] Explicit behavior recorded:', actionType, item.name);
    return behavior;
  }

  /**
   * 记录隐性偏好行为
   */
  recordImplicitBehavior(actionType, item, details = {}) {
    const behavior = {
      type: 'IMPLICIT',
      action: actionType,
      itemId: item.id,
      itemName: item.name,
      category: item.cuisine_type || item.category,
      tags: item.tags || [],
      price: item.price || 0,
      timestamp: Date.now(),
      weight: BEHAVIOR_WEIGHTS.IMPLICIT[actionType] || 1,
      details
    };

    this.behaviorHistory.push(behavior);
    this._updateImplicitPreference(actionType, item, details);
    this._saveBehaviorHistory();

    // 检查是否需要自动推断偏好
    this._checkAutoPreferenceInference();

    return behavior;
  }

  // ========== 偏好更新 ==========

  _updateExplicitPreference(actionType, item, details) {
    const explicit = this.profile.explicit;

    switch (actionType) {
      case 'SET_PREFERENCE':
        if (details.taste) {
          Object.assign(explicit.tastePreference, details.taste);
        }
        if (details.cuisine) {
          explicit.cuisinePreference = [...new Set([...explicit.cuisinePreference, ...details.cuisine])];
        }
        break;

      case 'FAVORITE':
        explicit.cuisinePreference = this._addToPreferenceList(
          explicit.cuisinePreference, 
          item.cuisine_type, 
          3
        );
        break;

      case 'ORDER':
        explicit.stats.totalOrders++;
        explicit.stats.lastOrderAt = Date.now();
        // 更新平均订单金额
        const currentAvg = explicit.stats.avgOrderValue;
        const orderValue = details.orderValue || item.price || 0;
        explicit.stats.avgOrderValue = (currentAvg * (explicit.stats.totalOrders - 1) + orderValue) / explicit.stats.totalOrders;
        break;
    }

    this.profile.updatedAt = Date.now();
    this._saveProfile();
  }

  _updateImplicitPreference(actionType, item, details) {
    const implicit = this.profile.implicit;

    // 更新菜系权重
    if (item.cuisine_type) {
      const currentWeight = implicit.cuisineWeights[item.cuisine_type] || 0;
      const weightChange = BEHAVIOR_WEIGHTS.IMPLICIT[actionType] || 0;
      implicit.cuisineWeights[item.cuisine_type] = Math.max(0, currentWeight + weightChange);
    }

    // 更新标签权重
    if (item.tags) {
      item.tags.forEach(tag => {
        const currentWeight = implicit.tagWeights[tag] || 0;
        const weightChange = (BEHAVIOR_WEIGHTS.IMPLICIT[actionType] || 0) * 0.5;
        implicit.tagWeights[tag] = Math.max(0, currentWeight + weightChange);
      });
    }

    // 价格敏感度分析
    if (actionType === 'CANCEL_ORDER' || actionType === 'REMOVE_FROM_CART') {
      if (details.reason === 'too_expensive' || (item.price && item.price > 50)) {
        implicit.priceSensitivity = Math.min(1, implicit.priceSensitivity + 0.1);
      }
    }

    this.profile.updatedAt = Date.now();
    this._saveProfile();
  }

  // ========== 自动偏好推断 ==========

  _checkAutoPreferenceInference() {
    const recentBehaviors = this._getRecentBehaviors(7); // 最近7天

    // 推断辣度偏好
    const spicyBehaviors = recentBehaviors.filter(b => 
      b.tags && b.tags.includes('辣')
    );

    if (spicyBehaviors.length >= 3) {
      const positiveSpicy = spicyBehaviors.filter(b => b.weight > 0).length;
      const negativeSpicy = spicyBehaviors.filter(b => b.weight < 0).length;

      if (negativeSpicy >= 2 && positiveSpicy === 0) {
        // 连续3次对辣菜负面反馈，自动标记不吃辣
        if (this.profile.explicit.tastePreference.spicy > 0.3) {
          this.profile.explicit.tastePreference.spicy = 0.2;
          this._showPreferenceUpdateToast('检测到您可能不太能吃辣，已自动调整推荐');
        }
      }
    }

    // 推断菜系偏好转变
    this._analyzeCuisineShift();
  }

  _analyzeCuisineShift() {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;

    // 分析最近30天 vs 30-90天的菜系偏好变化
    const recentBehaviors = this.behaviorHistory.filter(b => b.timestamp > monthAgo);
    const olderBehaviors = this.behaviorHistory.filter(b => 
      b.timestamp > threeMonthsAgo && b.timestamp <= monthAgo
    );

    const recentCuisines = this._countByCategory(recentBehaviors);
    const olderCuisines = this._countByCategory(olderBehaviors);

    // 检测偏好转变
    Object.keys(recentCuisines).forEach(cuisine => {
      const recentCount = recentCuisines[cuisine] || 0;
      const olderCount = olderCuisines[cuisine] || 0;

      if (recentCount > 5 && olderCount < 2) {
        // 新出现的偏好
        console.log(`[UserProfile] Detected new preference for ${cuisine}`);
      }
    });
  }

  // ========== 时序分析 ==========

  /**
   * 获取带时间衰减的权重分数
   */
  getTimeDecayScore(category, tag) {
    const relevantBehaviors = this.behaviorHistory.filter(b => 
      b.category === category || (b.tags && b.tags.includes(tag))
    );

    let totalScore = 0;
    const now = Date.now();

    relevantBehaviors.forEach(behavior => {
      const daysAgo = (now - behavior.timestamp) / (24 * 60 * 60 * 1000);
      
      // 时间衰减公式：权重 * (0.5 ^ (天数/半衰期))
      const decayFactor = Math.pow(0.5, daysAgo / TIME_DECAY.HALF_LIFE_DAYS);
      
      // 近期加成
      const recentBoost = daysAgo <= TIME_DECAY.RECENT_DAYS ? TIME_DECAY.RECENT_BOOST : 1;
      
      totalScore += behavior.weight * decayFactor * recentBoost;
    });

    return totalScore;
  }

  /**
   * 获取用户偏好时间线
   */
  getPreferenceTimeline() {
    const timeline = [];
    const months = 3; // 最近3个月

    for (let i = 0; i < months; i++) {
      const endTime = Date.now() - i * 30 * 24 * 60 * 60 * 1000;
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000;

      const monthBehaviors = this.behaviorHistory.filter(b => 
        b.timestamp >= startTime && b.timestamp < endTime
      );

      const cuisineCounts = this._countByCategory(monthBehaviors);
      const topCuisine = Object.entries(cuisineCounts)
        .sort((a, b) => b[1] - a[1])[0];

      timeline.push({
        month: i,
        period: new Date(startTime).toLocaleDateString('zh-CN', { month: 'short' }),
        topCuisine: topCuisine ? topCuisine[0] : null,
        totalBehaviors: monthBehaviors.length,
        cuisines: cuisineCounts
      });
    }

    return timeline;
  }

  // ========== 辅助方法 ==========

  _getRecentBehaviors(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.behaviorHistory.filter(b => b.timestamp > cutoff);
  }

  _addToPreferenceList(list, item, maxLength = 5) {
    const newList = [...list];
    if (!newList.includes(item)) {
      newList.unshift(item);
      if (newList.length > maxLength) {
        newList.pop();
      }
    }
    return newList;
  }

  _countByCategory(behaviors) {
    const counts = {};
    behaviors.forEach(b => {
      if (b.category) {
        counts[b.category] = (counts[b.category] || 0) + 1;
      }
    });
    return counts;
  }

  _showPreferenceUpdateToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  }

  // ========== 用户分层 ==========

  getUserTier() {
    const stats = this.profile.stats || {};
    const now = Date.now();
    const daysSinceCreation = (now - this.profile.createdAt) / (24 * 60 * 60 * 1000);
    const daysSinceLastActive = stats.lastActiveAt ? (now - stats.lastActiveAt) / (24 * 60 * 60 * 1000) : 0;
    const totalInteractions = stats.totalOrders + stats.totalViews + stats.totalFavorites;

    if (daysSinceLastActive > 7) {
      return {
        id: 'churning',
        name: '流失风险',
        icon: '⚠️',
        color: '#FF9800',
        recommendStrategy: 'recall'
      };
    }

    if (daysSinceCreation <= 3 && totalInteractions < 10) {
      return {
        id: 'new',
        name: '新用户',
        icon: '🌱',
        color: '#4CAF50',
        recommendStrategy: 'explore'
      };
    }

    if (totalInteractions >= 50 || stats.totalOrders >= 10) {
      return {
        id: 'loyal',
        name: '忠实用户',
        icon: '💎',
        color: '#2196F3',
        recommendStrategy: 'personalized',
        exclusive: true
      };
    }

    return {
      id: 'active',
      name: '活跃用户',
      icon: '🔥',
      color: '#FF5722',
      recommendStrategy: 'balanced'
    };
  }

  getTierRecommendStrategy() {
    const tier = this.getUserTier();
    const strategies = {
      new: {
        exploreRatio: 0.4,
        showExplanation: true,
        enablePersonalization: false,
        enableCollaborative: false,
        focusOn: 'hot_and_popular'
      },
      active: {
        exploreRatio: 0.25,
        showExplanation: true,
        enablePersonalization: true,
        enableCollaborative: true,
        focusOn: 'personalized_and_diverse'
      },
      loyal: {
        exploreRatio: 0.15,
        showExplanation: true,
        enablePersonalization: true,
        enableCollaborative: true,
        enableExclusive: true,
        focusOn: 'premium_and_new'
      },
      churning: {
        exploreRatio: 0.3,
        showExplanation: true,
        enablePersonalization: true,
        enableRecall: true,
        focusOn: 'favorites_and_recall'
      }
    };
    return strategies[tier.id] || strategies.active;
  }

  // ========== 动态标签生成 ==========

  generateDynamicTags() {
    const tags = [];
    const implicit = this.profile.implicit;
    const explicit = this.profile.explicit;

    // 口味标签
    const tastePreferences = [];
    if (explicit.tastePreference.spicy > 0.6) {
      tastePreferences.push('嗜辣');
    } else if (explicit.tastePreference.spicy < 0.3) {
      tastePreferences.push('不吃辣');
    }
    
    if (explicit.tastePreference.sweet > 0.6) {
      tastePreferences.push('嗜甜');
    }

    if (tastePreferences.length > 0) {
      tags.push(...tastePreferences);
    }

    // 菜系标签
    const topCuisines = this.getTopCuisines(2);
    if (topCuisines.length > 0) {
      topCuisines.forEach(c => {
        if (c.weight > 10) {
          tags.push(`常点${c.cuisine}`);
        }
      });
    }

    // 时间偏好标签
    const timePref = implicit.timePreference;
    if (timePref.breakfast && timePref.breakfast.length > 0) {
      tags.push('早餐达人');
    }
    if (timePref.dinner && timePref.dinner.length > 0) {
      tags.push('晚餐常客');
    }

    // 价格敏感度标签
    if (this.isPriceSensitive()) {
      tags.push('价格敏感');
    }

    // 行为标签
    const stats = this.profile.stats;
    if (stats.totalOrders >= 10) {
      tags.push('美食达人');
    }
    if (stats.totalFavorites >= 20) {
      tags.push('收藏达人');
    }

    // 探索标签
    const exploreRatio = this.getExploreRatio();
    if (exploreRatio > 0.3) {
      tags.push('美食探险家');
    }

    return tags;
  }

  getExploreRatio() {
    const history = this.behaviorHistory;
    if (history.length === 0) return 0;
    
    const exploreActions = history.filter(b => 
      b.details?.isExploration || b.action === 'VIEW_NEW_CATEGORY'
    ).length;
    
    return exploreActions / history.length;
  }

  /**
   * 更新用户动态标签
   */
  updateDynamicTags() {
    const tags = this.generateDynamicTags();
    this.profile.dynamicTags = tags;
    this.profile.tagsUpdatedAt = Date.now();
    this._saveProfile();
    return tags;
  }

  /**
   * 获取用户动态标签
   */
  getDynamicTags() {
    if (!this.profile.dynamicTags || 
        Date.now() - (this.profile.tagsUpdatedAt || 0) > 24 * 60 * 60 * 1000) {
      return this.updateDynamicTags();
    }
    return this.profile.dynamicTags || [];
  }

  // ========== 用户生命周期阶段 ==========

  getLifecycleStage() {
    const stats = this.profile.stats || {};
    const now = Date.now();
    const daysSinceCreation = (now - this.profile.createdAt) / (24 * 60 * 60 * 1000);
    const lastActiveDays = stats.lastActiveAt ? (now - stats.lastActiveAt) / (24 * 60 * 60 * 1000) : 0;
    const totalInteractions = stats.totalOrders + stats.totalViews + stats.totalFavorites;

    if (daysSinceCreation <= 7) {
      return {
        id: 'exploration',
        name: '探索期',
        icon: '🌱',
        color: '#4CAF50',
        description: '正在发现美食的新用户'
      };
    } else if (daysSinceCreation <= 30 && totalInteractions >= 5) {
      return {
        id: 'growth',
        name: '成长期',
        icon: '🌿',
        color: '#8BC34A',
        description: '正在建立偏好的活跃用户'
      };
    } else if (totalInteractions >= 30) {
      return {
        id: 'maturity',
        name: '成熟期',
        icon: '🌳',
        color: '#009688',
        description: '已形成稳定偏好的老用户'
      };
    } else if (lastActiveDays > 7) {
      return {
        id: 'dormant',
        name: '休眠期',
        icon: '🍂',
        color: '#795548',
        description: '需要召回的非活跃用户'
      };
    }

    return {
      id: 'unknown',
      name: '未知阶段',
      icon: '❓',
      color: '#9E9E9E',
      description: '用户状态未知'
    };
  }

  // ========== 用户敏感度评分 ==========

  getSensitivityScore() {
    const stats = this.profile.stats || {};
    const likeRate = stats.totalViews > 0 ? stats.totalLikes / stats.totalViews : 0;
    const dislikeRate = stats.totalViews > 0 ? stats.totalDislikes / stats.totalViews : 0;
    const feedbackRate = stats.totalViews > 0 ? (stats.totalLikes + stats.totalDislikes) / stats.totalViews : 0;

    if (feedbackRate > 0.5 && likeRate > 0.3) {
      return {
        id: 'positive_sensitive',
        name: '正向敏感',
        icon: '😊',
        color: '#FF5722',
        recommendation: '快速响应，加大资源投放'
      };
    } else if (feedbackRate > 0.4 && dislikeRate > 0.3) {
      return {
        id: 'negative_sensitive',
        name: '负向敏感',
        icon: '😐',
        color: '#607D8B',
        recommendation: '减少干预，精准推送'
      };
    } else if (feedbackRate > 0.2) {
      return {
        id: 'neutral',
        name: '中性反应',
        icon: '😀',
        color: '#FFB74D',
        recommendation: '适度干预，均衡推荐'
      };
    } else {
      return {
        id: 'unresponsive',
        name: '无反应',
        icon: '😴',
        color: '#BDBDBD',
        recommendation: '尝试新的干预方式'
      };
    }
  }

  // ========== 公共API ==========

  getProfile() {
    return this.profile;
  }

  getExplicitPreference() {
    return this.profile.explicit;
  }

  getImplicitPreference() {
    return this.profile.implicit;
  }

  getBehaviorHistory(limit = 100) {
    return this.behaviorHistory.slice(-limit);
  }

  isPriceSensitive() {
    return this.profile.implicit.priceSensitivity > 0.6;
  }

  getTopCuisines(limit = 3) {
    return Object.entries(this.profile.implicit.cuisineWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cuisine, weight]) => ({ cuisine, weight }));
  }

  getFavoriteRecipes() {
    const favorites = this.behaviorHistory
      .filter(b => b.action === 'FAVORITE' || b.action === 'ORDER')
      .reduce((acc, b) => {
        acc[b.itemId] = (acc[b.itemId] || 0) + b.weight;
        return acc;
      }, {});
    
    return Object.entries(favorites)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, score]) => ({ id, score }));
  }

  /**
   * 导出数据（用于云端同步）
   */
  exportForSync() {
    return {
      profile: this.profile,
      recentBehaviors: this._getRecentBehaviors(30),
      timeline: this.getPreferenceTimeline(),
      tier: this.getUserTier(),
      exportAt: Date.now()
    };
  }
}

module.exports = new UserProfileManager();
