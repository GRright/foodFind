const db = require('../config/database');
const RecommendationEngine = require('./recommendationEngine');

const onboardingQuestions = [
  {
    id: 'spice_level',
    question: '您能接受辣度吗？',
    type: 'single_choice',
    options: [
      { label: '完全不吃辣', value: 'none', taste_weights: { spicy: 0 } },
      { label: '微辣即可', value: 'mild', taste_weights: { spicy: 0.3 } },
      { label: '中等辣度', value: 'medium', taste_weights: { spicy: 0.6 } },
      { label: '无辣不欢', value: 'hot', taste_weights: { spicy: 1 } }
    ]
  },
  {
    id: 'cooking_style',
    question: '您偏爱哪种烹饪方式？',
    type: 'multi_choice',
    options: [
      { label: '快炒', value: 'stir_fry', tags: ['快手菜'] },
      { label: '炖汤', value: 'soup', tags: ['汤品'] },
      { label: '红烧', value: 'braise', tags: ['硬菜'] },
      { label: '清蒸', value: 'steam', tags: ['清淡'] },
      { label: '烤制', value: 'roast', tags: ['烤箱菜'] }
    ]
  },
  {
    id: 'cuisine_preference',
    question: '您喜欢哪些菜系？',
    type: 'multi_choice',
    options: [
      { label: '中餐', value: 'chinese', cuisine_weights: { chinese: 1 } },
      { label: '日料', value: 'japanese', cuisine_weights: { japanese: 1 } },
      { label: '西餐', value: 'western', cuisine_weights: { western: 1 } },
      { label: '韩餐', value: 'korean', cuisine_weights: { korean: 1 } },
      { label: '泰餐', value: 'thai', cuisine_weights: {} }
    ]
  },
  {
    id: 'diet_goal',
    question: '您的饮食目标是什么？',
    type: 'single_choice',
    options: [
      { label: '享受美食', value: 'enjoy', nutrition_preferences: {} },
      { label: '保持健康', value: 'balanced', nutrition_preferences: {} },
      { label: '减脂塑形', value: 'lose_weight', nutrition_preferences: { low_calorie: true } },
      { label: '增肌健身', value: 'build_muscle', nutrition_preferences: { high_protein: true } }
    ]
  },
  {
    id: 'meal_time',
    question: '您通常在家吃哪几餐？',
    type: 'multi_choice',
    options: [
      { label: '早餐', value: 'breakfast' },
      { label: '午餐', value: 'lunch' },
      { label: '晚餐', value: 'dinner' }
    ]
  }
];

class OnboardingService {
  static getQuestions() {
    return onboardingQuestions;
  }

  static async saveAnswers(userId, answers) {
    const savedAnswers = [];
    
    for (const answer of answers) {
      const question = onboardingQuestions.find(q => q.id === answer.question_id);
      if (question) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO onboarding_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
            [userId, answer.question_id, JSON.stringify(answer.value)],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
        savedAnswers.push({ question, answer });
      }
    }

    await this.buildInitialProfile(userId, savedAnswers);

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_new_user = 0, onboarding_completed = 1 WHERE id = ?',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return { success: true };
  }

  static async buildInitialProfile(userId, answers) {
    const engine = new RecommendationEngine(userId);
    await engine.init();

    answers.forEach(({ question, answer }) => {
      const answerValue = Array.isArray(answer.value) ? answer.value : [answer.value];
      
      answerValue.forEach(val => {
        const option = question.options.find(o => o.value === val);
        if (option) {
          if (option.taste_weights) {
            Object.keys(option.taste_weights).forEach(key => {
              engine.userProfile.taste_weights[key] = option.taste_weights[key];
            });
          }
          
          if (option.cuisine_weights) {
            Object.keys(option.cuisine_weights).forEach(key => {
              engine.userProfile.cuisine_weights[key] = option.cuisine_weights[key];
            });
          }
          
          if (option.nutrition_preferences) {
            Object.keys(option.nutrition_preferences).forEach(key => {
              engine.userProfile.nutrition_preferences[key] = option.nutrition_preferences[key];
            });
          }
        }
      });
    });

    await engine.saveUserProfile();
  }

  static async getUserAnswers(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM onboarding_answers WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => ({
              ...row,
              answer: JSON.parse(row.answer)
            })));
          }
        }
      );
    });
  }

  static async checkOnboardingStatus(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT is_new_user, onboarding_completed FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              isNewUser: row ? row.is_new_user === 1 : true,
              onboardingCompleted: row ? row.onboarding_completed === 1 : false
            });
          }
        }
      );
    });
  }
}

module.exports = OnboardingService;
