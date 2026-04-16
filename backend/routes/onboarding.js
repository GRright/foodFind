const express = require('express');
const router = express.Router();
const OnboardingService = require('../services/onboardingService');

router.get('/questions', (req, res) => {
  try {
    const questions = OnboardingService.getQuestions();
    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/answers', async (req, res) => {
  try {
    const { user_id, answers } = req.body;
    
    if (!user_id || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await OnboardingService.saveAnswers(user_id, answers);
    res.json(result);
  } catch (error) {
    console.error('Save answers error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await OnboardingService.checkOnboardingStatus(parseInt(userId));
    res.json(status);
  } catch (error) {
    console.error('Check onboarding status error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/answers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const answers = await OnboardingService.getUserAnswers(parseInt(userId));
    res.json({ answers });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
