const express = require('express');
const router = express.Router();
const RecommendationEngine = require('../services/recommendationEngine');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { meal_type = 'dinner', count = 5 } = req.query;
    
    const engine = new RecommendationEngine(parseInt(userId));
    await engine.init();
    
    const recommendations = await engine.generateRecommendations(meal_type, parseInt(count));
    
    const formattedRecommendations = recommendations.map(rec => ({
      ...rec,
      ingredients: JSON.parse(rec.ingredients),
      steps: JSON.parse(rec.steps),
      nutrition: rec.nutrition ? JSON.parse(rec.nutrition) : {},
      tags: rec.tags ? JSON.parse(rec.tags) : []
    }));
    
    res.json({ recommendations: formattedRecommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/behavior', async (req, res) => {
  try {
    const { user_id, action_type, item_type, item_id, details } = req.body;
    
    const engine = new RecommendationEngine(user_id);
    await engine.init();
    
    await engine.trackBehavior(action_type, item_type, item_id, details);
    await engine.updateProfileFromBehavior(action_type, item_type, item_id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track behavior error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const engine = new RecommendationEngine(parseInt(userId));
    await engine.init();
    
    res.json({ 
      profile: {
        taste_weights: engine.userProfile.taste_weights,
        cuisine_weights: engine.userProfile.cuisine_weights,
        nutrition_preferences: engine.userProfile.nutrition_preferences,
        exploration_ratio: engine.userProfile.exploration_ratio,
        recent_interactions: engine.userProfile.recent_interactions
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
