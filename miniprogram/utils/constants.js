/**
 * 常量数据配置
 * 集中管理所有静态数据，便于维护和压缩
 */

// 默认菜谱数据（精简版）
const DEFAULT_RECIPES = [
  { id: 1, name: '番茄炒蛋', cuisine_type: '中餐', tags: ['快手菜', '清淡'], cooking_time: 15, nutrition: { calories: 120 }, image_url: '🍳' },
  { id: 2, name: '红烧肉', cuisine_type: '中餐', tags: ['硬菜', '下饭'], cooking_time: 60, nutrition: { calories: 450 }, image_url: '🍖' },
  { id: 3, name: '日式咖喱饭', cuisine_type: '日料', tags: ['咖喱', '下饭'], cooking_time: 40, nutrition: { calories: 380 }, image_url: '🍛' },
  { id: 4, name: '清蒸鲈鱼', cuisine_type: '中餐', tags: ['清淡', '健康'], cooking_time: 20, nutrition: { calories: 180 }, image_url: '🐟' },
  { id: 5, name: '韩式拌饭', cuisine_type: '韩餐', tags: ['拌饭', '辣'], cooking_time: 25, nutrition: { calories: 420 }, image_url: '🍚' },
  { id: 6, name: '番茄牛肉汤', cuisine_type: '西餐', tags: ['汤品', '暖食'], cooking_time: 45, nutrition: { calories: 280 }, image_url: '🍲' },
  { id: 7, name: '蒜蓉西兰花', cuisine_type: '中餐', tags: ['清淡', '健康', '素菜'], cooking_time: 10, nutrition: { calories: 80 }, image_url: '🥦' },
  { id: 8, name: '蛋炒饭', cuisine_type: '中餐', tags: ['快手菜', '主食'], cooking_time: 10, nutrition: { calories: 320 }, image_url: '🍚' }
];

// 默认电影数据（精简版）
const DEFAULT_MOVIES = [
  { id: 1, title: '饮食男女', rating: 9.0, genre: '剧情', image_url: '🎬' },
  { id: 2, title: '小森林', rating: 9.0, genre: '治愈', image_url: '🌲' },
  { id: 3, title: '舌尖上的中国', rating: 9.4, genre: '纪录片', image_url: '🎥' },
  { id: 4, title: '寿司之神', rating: 8.8, genre: '纪录片', image_url: '🍣' }
];

// 引导页问题配置
const ONBOARDING_QUESTIONS = [
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
      { label: '清蒸', value: 'steam', tags: ['清淡'] }
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
      { label: '韩餐', value: 'korean', cuisine_weights: { korean: 1 } }
    ]
  },
  {
    id: 'diet_goal',
    question: '您的饮食目标是什么？',
    type: 'single_choice',
    options: [
      { label: '享受美食', value: 'enjoy' },
      { label: '保持健康', value: 'balanced' },
      { label: '减脂塑形', value: 'lose_weight', nutrition_preferences: { low_calorie: true } },
      { label: '增肌健身', value: 'build_muscle', nutrition_preferences: { high_protein: true } }
    ]
  }
];

// 缓存配置
const CACHE_CONFIG = {
  USER_PROFILE_TTL: 24 * 60 * 60 * 1000,      // 用户画像缓存1天
  RECOMMENDATIONS_TTL: 10 * 60 * 1000,         // 推荐结果缓存10分钟
  FEEDBACK_BATCH_SIZE: 10,                     // 反馈批量大小
  FEEDBACK_BATCH_INTERVAL: 5 * 60 * 1000,      // 反馈上传间隔5分钟
  HEARTBEAT_INTERVAL: 15 * 60 * 1000,          // 心跳间隔15分钟
  MAX_BEHAVIOR_QUEUE: 50,                      // 行为队列最大长度
  PRELOAD_PACKAGE_TTL: 24 * 60 * 60 * 1000     // 预加载包有效期24小时
};

// 餐别时间段配置
const MEAL_TIME_CONFIG = {
  breakfast: { start: 5, end: 10 },
  lunch: { start: 10, end: 14 },
  dinner: { start: 17, end: 21 }
};

module.exports = {
  DEFAULT_RECIPES,
  DEFAULT_MOVIES,
  ONBOARDING_QUESTIONS,
  CACHE_CONFIG,
  MEAL_TIME_CONFIG
};
