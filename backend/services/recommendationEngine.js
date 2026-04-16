const db = require('../config/database');

class RecommendationEngine {
  constructor(userId) {
    this.userId = userId;
    this.userProfile = null;
    this.scenarioContext = null;
  }

  async init() {
    await this.loadUserProfile();
    await this.loadScenarioContext();
  }

  async loadUserProfile() {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [this.userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            this.userProfile = row ? {
              ...row,
              taste_weights: row.taste_weights ? JSON.parse(row.taste_weights) : {},
              cuisine_weights: row.cuisine_weights ? JSON.parse(row.cuisine_weights) : {},
              nutrition_preferences: row.nutrition_preferences ? JSON.parse(row.nutrition_preferences) : {},
              recent_interactions: row.recent_interactions ? JSON.parse(row.recent_interactions) : []
            } : this.createDefaultProfile();
            resolve(this.userProfile);
          }
        }
      );
    });
  }

  async loadScenarioContext() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    this.scenarioContext = {
      is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
      time_of_day: this.getTimeOfDay(hour),
      weather: 'sunny',
      temperature: 22,
      is_holiday: false,
      has_companions: false,
      is_busy: false
    };
    
    return this.scenarioContext;
  }

  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 10) return 'breakfast';
    if (hour >= 10 && hour < 14) return 'lunch';
    if (hour >= 17 && hour < 21) return 'dinner';
    return 'snack';
  }

  createDefaultProfile() {
    return {
      taste_weights: {
        spicy: 0.5,
        sweet: 0.5,
        sour: 0.5,
        salty: 0.5,
        light: 0.5
      },
      cuisine_weights: {
        chinese: 0.6,
        japanese: 0.3,
        western: 0.3,
        korean: 0.2
      },
      nutrition_preferences: {
        low_calorie: false,
        high_protein: false,
        low_carb: false
      },
      recent_interactions: [],
      exploration_ratio: 0.2
    };
  }

  async trackBehavior(actionType, itemType, itemId, details = {}) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO user_behaviors (user_id, action_type, item_type, item_id, details, context)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          this.userId,
          actionType,
          itemType,
          itemId,
          JSON.stringify(details),
          JSON.stringify(this.scenarioContext)
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async updateProfileFromBehavior(actionType, itemType, itemId) {
    if (itemType === 'recipe' && itemId) {
      const recipe = await this.getRecipeById(itemId);
      if (recipe) {
        await this.adjustWeights(recipe, actionType);
      }
    }
  }

  async adjustWeights(recipe, actionType) {
    const weightMultiplier = this.getWeightMultiplier(actionType);
    const tags = recipe.tags ? JSON.parse(recipe.tags) : [];
    
    tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      if (this.userProfile.taste_weights.hasOwnProperty(normalizedTag)) {
        this.userProfile.taste_weights[normalizedTag] = this.weightedAverage(
          this.userProfile.taste_weights[normalizedTag],
          1,
          weightMultiplier
        );
      }
    });

    if (recipe.cuisine_type) {
      const cuisineKey = recipe.cuisine_type.toLowerCase();
      if (this.userProfile.cuisine_weights.hasOwnProperty(cuisineKey)) {
        this.userProfile.cuisine_weights[cuisineKey] = this.weightedAverage(
          this.userProfile.cuisine_weights[cuisineKey],
          1,
          weightMultiplier
        );
      }
    }

    this.userProfile.recent_interactions.unshift({
      item_type: 'recipe',
      item_id: recipe.id,
      timestamp: new Date().toISOString()
    });

    if (this.userProfile.recent_interactions.length > 20) {
      this.userProfile.recent_interactions = this.userProfile.recent_interactions.slice(0, 20);
    }

    await this.saveUserProfile();
  }

  getWeightMultiplier(actionType) {
    const multipliers = {
      'like': 0.3,
      'dislike': -0.3,
      'view': 0.05,
      'favorite': 0.4,
      'select': 0.2
    };
    return multipliers[actionType] || 0.1;
  }

  weightedAverage(oldValue, newValue, weight) {
    return Math.max(0, Math.min(1, oldValue * (1 - weight) + newValue * weight));
  }

  async saveUserProfile() {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO user_profiles 
         (user_id, taste_weights, cuisine_weights, nutrition_preferences, recent_interactions, exploration_ratio, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          this.userId,
          JSON.stringify(this.userProfile.taste_weights),
          JSON.stringify(this.userProfile.cuisine_weights),
          JSON.stringify(this.userProfile.nutrition_preferences),
          JSON.stringify(this.userProfile.recent_interactions),
          this.userProfile.exploration_ratio
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getRecipeById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async generateRecommendations(mealType, count = 5) {
    const allRecipes = await this.getAllRecipes();
    const recentIds = this.userProfile.recent_interactions
      .filter(i => i.item_type === 'recipe')
      .slice(0, 10)
      .map(i => i.item_id);

    const availableRecipes = allRecipes.filter(r => !recentIds.includes(r.id));

    const scoredRecipes = availableRecipes.map(recipe => ({
      recipe,
      score: this.calculateRecipeScore(recipe, mealType)
    }));

    scoredRecipes.sort((a, b) => b.score - a.score);

    const exploitationCount = Math.floor(count * (1 - this.userProfile.exploration_ratio));
    const explorationCount = count - exploitationCount;

    const exploitationRecipes = scoredRecipes.slice(0, exploitationCount);
    
    const explorationPool = scoredRecipes.slice(exploitationCount);
    const explorationRecipes = [];
    for (let i = 0; i < explorationCount && explorationPool.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * explorationPool.length);
      explorationRecipes.push(explorationPool.splice(randomIndex, 1)[0]);
    }

    const finalRecommendations = [...exploitationRecipes, ...explorationRecipes];
    finalRecommendations.sort((a, b) => b.score - a.score);

    return finalRecommendations.map(item => ({
      ...item.recipe,
      score: item.score,
      recommendation_reason: this.generateRecommendationReason(item.recipe, item.score)
    }));
  }

  calculateRecipeScore(recipe, mealType) {
    let score = 0;

    const tags = recipe.tags ? JSON.parse(recipe.tags) : [];
    tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      if (this.userProfile.taste_weights.hasOwnProperty(normalizedTag)) {
        score += this.userProfile.taste_weights[normalizedTag] * 0.3;
      }
    });

    if (recipe.cuisine_type) {
      const cuisineKey = recipe.cuisine_type.toLowerCase();
      if (this.userProfile.cuisine_weights.hasOwnProperty(cuisineKey)) {
        score += this.userProfile.cuisine_weights[cuisineKey] * 0.3;
      }
    }

    score += this.calculateScenarioScore(recipe, mealType) * 0.25;

    score += Math.random() * 0.15;

    return Math.min(1, score);
  }

  calculateScenarioScore(recipe, mealType) {
    let score = 0;

    if (this.scenarioContext.weather === 'rainy' && recipe.is_warm_food) {
      score += 0.3;
    }

    if (this.scenarioContext.has_companions && recipe.is_shareable) {
      score += 0.2;
    }

    if (this.scenarioContext.is_busy && recipe.cooking_time && recipe.cooking_time < 30) {
      score += 0.3;
    }

    if (this.scenarioContext.is_weekend) {
      score += 0.1;
    }

    return score;
  }

  generateRecommendationReason(recipe, score) {
    const reasons = [];
    
    if (score > 0.7) {
      reasons.push('根据您的口味偏好精心挑选');
    } else if (score > 0.4) {
      reasons.push('发现您可能喜欢的新菜品');
    } else {
      reasons.push('为您推荐的探索性菜品');
    }

    if (recipe.cuisine_type) {
      reasons.push(`您常吃${recipe.cuisine_type}菜系`);
    }

    return reasons.join('，');
  }

  async getAllRecipes() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM recipes', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async adjustExplorationRatio(successRate) {
    if (successRate < 0.3) {
      this.userProfile.exploration_ratio = Math.max(0.05, this.userProfile.exploration_ratio - 0.05);
    } else if (successRate > 0.7) {
      this.userProfile.exploration_ratio = Math.min(0.4, this.userProfile.exploration_ratio + 0.05);
    }
    await this.saveUserProfile();
  }
}

module.exports = RecommendationEngine;
