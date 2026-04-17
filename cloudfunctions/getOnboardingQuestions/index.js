const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

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
]

exports.main = async (event, context) => {
  return {
    questions: onboardingQuestions
  }
}
