/**
 * 菜品搭配推荐引擎
 * 基于用户行为数据和菜品属性生成搭配建议
 */

const PAIRING_RULES = {
  // 经典搭配规则
  CLASSIC_PAIRS: [
    { main: ['红烧肉', '糖醋排骨', '烤鸡'], pair: ['清炒时蔬', '凉拌黄瓜', '蒜蓉西兰花'], reason: '荤素搭配，营养均衡' },
    { main: ['番茄炒蛋', '麻婆豆腐', '宫保鸡丁'], pair: ['米饭', '蛋炒饭', '馒头'], reason: '经典下饭搭配' },
    { main: ['火锅', '麻辣烫', '串串香'], pair: ['冰粉', '酸梅汤', '凉茶'], reason: '解辣必备' },
    { main: ['清蒸鲈鱼', '白灼虾', '蒜蓉扇贝'], pair: ['清粥', '蒸蛋', '凉拌木耳'], reason: '清淡互补' },
    { main: ['牛排', '烤羊排', '煎三文鱼'], pair: ['沙拉', '土豆泥', '烤蔬菜'], reason: '西式经典搭配' },
    { main: ['日式咖喱饭', '拉面', '丼饭'], pair: ['味噌汤', '温泉蛋', '日式煎饺'], reason: '日式定食风格' },
    { main: ['韩式拌饭', '炸鸡', '烤肉'], pair: ['泡菜汤', '韩式冷面', '生菜包肉'], reason: '韩式风味搭配' },
    { main: ['意大利面', '披萨', '焗饭'], pair: ['凯撒沙拉', '蒜香面包', '奶油蘑菇汤'], reason: '意式经典组合' }
  ],
  // 场景搭配
  SCENE_PAIRS: {
    breakfast: { pair: ['豆浆', '牛奶', '果汁'], reason: '营养早餐搭配' },
    lunch: { pair: ['汤品', '小菜', '水果'], reason: '午餐均衡搭配' },
    dinner: { pair: ['甜点', '饮品', '汤品'], reason: '晚餐完美组合' }
  },
  // 营养搭配建议
  NUTRITION_PAIRS: {
    high_calorie: { pair: ['清淡', '低卡'], reason: '平衡热量摄入' },
    low_protein: { pair: ['高蛋白', '肉类'], reason: '补充优质蛋白' },
    high_carb: { pair: ['蔬菜', '沙拉'], reason: '增加膳食纤维' }
  }
};

class PairingEngine {
  constructor() {
    this._pairingHistory = null;
    this._userPreferences = null;
    this._loadData();
  }

  // ========== 获取搭配推荐 ==========

  getPairingRecommendations(mainRecipe, context = {}, count = 3) {
    const recommendations = [];

    // 1. 基于经典规则匹配
    const classicPairs = this._matchClassicPairs(mainRecipe);
    if (classicPairs.length > 0) {
      recommendations.push(...classicPairs);
    }

    // 2. 基于历史搭配
    const historyPairs = this._getHistoryPairs(mainRecipe);
    if (historyPairs.length > 0) {
      recommendations.push(...historyPairs);
    }

    // 3. 基于场景搭配
    const scenePairs = this._getScenePairs(context);
    if (scenePairs.length > 0) {
      recommendations.push(...scenePairs);
    }

    // 4. 基于营养搭配
    const nutritionPairs = this._getNutritionPairs(mainRecipe);
    if (nutritionPairs.length > 0) {
      recommendations.push(...nutritionPairs);
    }

    // 去重和排序
    const unique = this._deduplicate(recommendations);
    return unique.slice(0, count);
  }

  // ========== 记录搭配行为 ==========

  recordPairing(mainRecipeId, pairRecipeId, isOrdered = false) {
    const pair = {
      mainId: mainRecipeId,
      pairId: pairRecipeId,
      timestamp: Date.now(),
      ordered: isOrdered
    };

    this._pairingHistory.push(pair);

    // 保持合理长度
    if (this._pairingHistory.length > 100) {
      this._pairingHistory = this._pairingHistory.slice(-100);
    }

    this._saveData();
  }

  // ========== 批量获取搭配 ==========

  getBatchPairings(recipes, context = {}) {
    const pairingsMap = {};
    for (const recipe of recipes) {
      pairingsMap[recipe.id] = this.getPairingRecommendations(recipe, context, 2);
    }
    return pairingsMap;
  }

  // ========== 私有方法 ==========

  _matchClassicPairs(recipe) {
    const results = [];
    const recipeName = recipe.name || '';

    for (const rule of PAIRING_RULES.CLASSIC_PAIRS) {
      const isMatch = rule.main.some(mainDish => 
        recipeName.includes(mainDish) || mainDish.includes(recipeName)
      );

      if (isMatch) {
        for (const pairName of rule.pair) {
          results.push({
            id: `pair_classic_${pairName}`,
            name: pairName,
            reason: rule.reason,
            type: 'classic',
            confidence: 0.9
          });
        }
      }
    }

    return results;
  }

  _getHistoryPairs(mainRecipe) {
    const results = [];
    const history = this._pairingHistory || [];

    // 查找最常一起点的菜品
    const pairCounts = {};
    for (const pair of history) {
      if (pair.mainId === mainRecipe.id) {
        pairCounts[pair.pairId] = (pairCounts[pair.pairId] || 0) + (pair.ordered ? 2 : 1);
      }
    }

    const sorted = Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [pairId, count] of sorted) {
      results.push({
        id: pairId,
        reason: `您经常将这道菜与${mainRecipe.name}搭配`,
        type: 'history',
        confidence: Math.min(0.5 + count * 0.1, 0.95)
      });
    }

    return results;
  }

  _getScenePairs(context) {
    const results = [];
    const mealType = context.mealType || 'lunch';
    const sceneRule = PAIRING_RULES.SCENE_PAIRS[mealType];

    if (sceneRule) {
      for (const pairName of sceneRule.pair) {
        results.push({
          id: `pair_scene_${pairName}`,
          name: pairName,
          reason: sceneRule.reason,
          type: 'scene',
          confidence: 0.7
        });
      }
    }

    return results;
  }

  _getNutritionPairs(recipe) {
    const results = [];
    const nutrition = recipe.nutrition || {};

    for (const [condition, suggestion] of Object.entries(PAIRING_RULES.NUTRITION_PAIRS)) {
      let match = false;
      switch (condition) {
        case 'high_calorie':
          match = nutrition.calories > 400;
          break;
        case 'low_protein':
          match = nutrition.protein < 20;
          break;
        case 'high_carb':
          match = nutrition.carbs > 60;
          break;
      }

      if (match) {
        results.push({
          id: `pair_nutrition_${condition}`,
          reason: suggestion.reason,
          type: 'nutrition',
          confidence: 0.75,
          tags: suggestion.pair
        });
      }
    }

    return results;
  }

  _deduplicate(items) {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  _loadData() {
    try {
      this._pairingHistory = wx.getStorageSync('pairing_history') || [];
      this._userPreferences = wx.getStorageSync('pairing_preferences') || {};
    } catch (e) {
      this._pairingHistory = [];
      this._userPreferences = {};
    }
  }

  _saveData() {
    wx.setStorageSync('pairing_history', this._pairingHistory);
    wx.setStorageSync('pairing_preferences', this._userPreferences);
  }
}

module.exports = new PairingEngine();
