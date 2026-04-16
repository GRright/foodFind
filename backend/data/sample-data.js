const db = require('../config/database');

const sampleRecipes = [
  {
    name: '番茄炒蛋',
    description: '经典家常菜，酸甜可口',
    ingredients: JSON.stringify([
      { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '3个' },
      { name: '葱花', amount: '适量' },
      { name: '盐', amount: '适量' },
      { name: '糖', amount: '1勺' }
    ]),
    steps: JSON.stringify([
      '番茄洗净切块，鸡蛋打散',
      '锅中放油，炒散鸡蛋盛出',
      '锅中留底油，放入番茄翻炒',
      '加入盐和糖调味',
      '放入炒好的鸡蛋，翻炒均匀',
      '撒上葱花出锅'
    ]),
    nutrition: JSON.stringify({
      calories: 180,
      protein: 12,
      fat: 10,
      carbs: 15,
      fiber: 2
    }),
    tags: JSON.stringify(['快手菜', '家常菜', '下饭菜', '酸甜']),
    cuisine_type: '中餐',
    difficulty: 'easy',
    cooking_time: 15,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 0
  },
  {
    name: '红烧肉',
    description: '肥而不腻，入口即化',
    ingredients: JSON.stringify([
      { name: '五花肉', amount: '500g' },
      { name: '姜', amount: '3片' },
      { name: '葱', amount: '2根' },
      { name: '八角', amount: '2个' },
      { name: '生抽', amount: '2勺' },
      { name: '老抽', amount: '1勺' },
      { name: '冰糖', amount: '适量' }
    ]),
    steps: JSON.stringify([
      '五花肉切块，冷水下锅焯水',
      '锅中放油，放入冰糖炒糖色',
      '放入五花肉翻炒上色',
      '加入葱姜八角',
      '加入生抽、老抽和开水',
      '小火炖1小时，大火收汁'
    ]),
    nutrition: JSON.stringify({
      calories: 520,
      protein: 25,
      fat: 42,
      carbs: 8,
      fiber: 0
    }),
    tags: JSON.stringify(['硬菜', '家常菜', '宴客菜', '咸鲜']),
    cuisine_type: '中餐',
    difficulty: 'medium',
    cooking_time: 90,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 1
  },
  {
    name: '日式咖喱饭',
    description: '浓郁咖喱，香气扑鼻',
    ingredients: JSON.stringify([
      { name: '咖喱块', amount: '1盒' },
      { name: '土豆', amount: '2个' },
      { name: '胡萝卜', amount: '1根' },
      { name: '洋葱', amount: '1个' },
      { name: '鸡肉', amount: '200g' },
      { name: '米饭', amount: '适量' }
    ]),
    steps: JSON.stringify([
      '所有食材切块',
      '锅中放油，炒香洋葱',
      '加入鸡肉翻炒',
      '加入土豆和胡萝卜',
      '加入开水煮15分钟',
      '加入咖喱块，搅拌至融化',
      '浇在米饭上'
    ]),
    nutrition: JSON.stringify({
      calories: 450,
      protein: 20,
      fat: 18,
      carbs: 55,
      fiber: 5
    }),
    tags: JSON.stringify(['日料', '咖喱', '盖饭', '辛辣']),
    cuisine_type: '日料',
    difficulty: 'easy',
    cooking_time: 30,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 0
  },
  {
    name: '麻婆豆腐',
    description: '麻辣鲜香，川菜经典',
    ingredients: JSON.stringify([
      { name: '嫩豆腐', amount: '400g' },
      { name: '肉末', amount: '100g' },
      { name: '郫县豆瓣酱', amount: '2勺' },
      { name: '花椒粉', amount: '适量' },
      { name: '葱花', amount: '适量' }
    ]),
    steps: JSON.stringify([
      '豆腐切块焯水备用',
      '锅中放油，炒香肉末',
      '加入郫县豆瓣酱炒出红油',
      '加入豆腐和适量水',
      '小火煮5分钟，勾芡',
      '撒上花椒粉和葱花'
    ]),
    nutrition: JSON.stringify({
      calories: 280,
      protein: 18,
      fat: 20,
      carbs: 12,
      fiber: 3
    }),
    tags: JSON.stringify(['川菜', '快手菜', '下饭菜', '麻辣', '辛辣']),
    cuisine_type: '中餐',
    difficulty: 'easy',
    cooking_time: 20,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 0
  },
  {
    name: '凉拌黄瓜',
    description: '清爽开胃，夏日必备',
    ingredients: JSON.stringify([
      { name: '黄瓜', amount: '2根' },
      { name: '蒜末', amount: '适量' },
      { name: '生抽', amount: '2勺' },
      { name: '醋', amount: '1勺' },
      { name: '香油', amount: '少许' }
    ]),
    steps: JSON.stringify([
      '黄瓜洗净拍扁切块',
      '加入蒜末、生抽、醋',
      '淋上香油',
      '拌匀后冷藏30分钟更佳'
    ]),
    nutrition: JSON.stringify({
      calories: 50,
      protein: 2,
      fat: 3,
      carbs: 5,
      fiber: 2
    }),
    tags: JSON.stringify(['凉菜', '快手菜', '清淡', '酸辣']),
    cuisine_type: '中餐',
    difficulty: 'easy',
    cooking_time: 10,
    image_url: '',
    is_warm_food: 0,
    is_shareable: 1
  },
  {
    name: '牛排配意面',
    description: '西式经典，浪漫晚餐',
    ingredients: JSON.stringify([
      { name: '牛排', amount: '200g' },
      { name: '意面', amount: '100g' },
      { name: '黑胡椒', amount: '适量' },
      { name: '海盐', amount: '适量' },
      { name: '橄榄油', amount: '适量' }
    ]),
    steps: JSON.stringify([
      '意面煮熟捞出备用',
      '牛排室温回温，撒上海盐和黑胡椒',
      '锅中放橄榄油，煎牛排至喜欢的熟度',
      '牛排静置3分钟，切片',
      '搭配意面装盘'
    ]),
    nutrition: JSON.stringify({
      calories: 550,
      protein: 35,
      fat: 28,
      carbs: 30,
      fiber: 2
    }),
    tags: JSON.stringify(['西餐', '牛排', '意面', '咸鲜']),
    cuisine_type: '西餐',
    difficulty: 'medium',
    cooking_time: 25,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 0
  },
  {
    name: '紫菜蛋花汤',
    description: '简单快手，营养丰富',
    ingredients: JSON.stringify([
      { name: '紫菜', amount: '1片' },
      { name: '鸡蛋', amount: '1个' },
      { name: '葱花', amount: '适量' },
      { name: '盐', amount: '适量' },
      { name: '香油', amount: '少许' }
    ]),
    steps: JSON.stringify([
      '锅中加水烧开',
      '放入紫菜煮2分钟',
      '打散鸡蛋，淋入锅中',
      '加盐调味，撒葱花',
      '滴几滴香油出锅'
    ]),
    nutrition: JSON.stringify({
      calories: 80,
      protein: 6,
      fat: 4,
      carbs: 5,
      fiber: 1
    }),
    tags: JSON.stringify(['汤品', '快手菜', '清淡']),
    cuisine_type: '中餐',
    difficulty: 'easy',
    cooking_time: 10,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 1
  },
  {
    name: '韩式炸鸡',
    description: '外酥里嫩，追剧必备',
    ingredients: JSON.stringify([
      { name: '鸡腿', amount: '4个' },
      { name: '炸鸡粉', amount: '适量' },
      { name: '韩式辣酱', amount: '3勺' },
      { name: '蜂蜜', amount: '1勺' },
      { name: '蒜末', amount: '适量' }
    ]),
    steps: JSON.stringify([
      '鸡腿腌制30分钟',
      '裹上炸鸡粉',
      '油温170度炸8分钟',
      '复炸一次更酥脆',
      '韩式辣酱加蜂蜜和蒜末调成酱汁',
      '炸鸡裹上酱汁'
    ]),
    nutrition: JSON.stringify({
      calories: 650,
      protein: 38,
      fat: 45,
      carbs: 20,
      fiber: 1
    }),
    tags: JSON.stringify(['韩餐', '炸鸡', '追剧小食', '甜辣', '辛辣']),
    cuisine_type: '韩餐',
    difficulty: 'medium',
    cooking_time: 40,
    image_url: '',
    is_warm_food: 1,
    is_shareable: 1
  }
];

const sampleMovies = [
  {
    title: '舌尖上的中国',
    description: '探索中国各地美食文化的纪录片',
    type: '纪录片',
    genre: '美食',
    cuisine_match: JSON.stringify(['中餐']),
    meal_type_match: JSON.stringify(['lunch', 'dinner']),
    rating: 9.4,
    platform: 'CCTV',
    platform_url: '',
    image_url: '',
    release_year: 2012
  },
  {
    title: '小森林',
    description: '日本治愈系美食电影',
    type: '电影',
    genre: '治愈',
    cuisine_match: JSON.stringify(['日料']),
    meal_type_match: JSON.stringify(['breakfast', 'lunch', 'dinner']),
    rating: 9.0,
    platform: 'Netflix',
    platform_url: '',
    image_url: '',
    release_year: 2014
  },
  {
    title: '孤独的美食家',
    description: '日本美食探店短剧',
    type: '短剧',
    genre: '美食',
    cuisine_match: JSON.stringify(['日料', '中餐', '西餐']),
    meal_type_match: JSON.stringify(['lunch', 'dinner']),
    rating: 9.2,
    platform: '东京电视台',
    platform_url: '',
    image_url: '',
    release_year: 2012
  },
  {
    title: '早餐中国',
    description: '全国各地的早餐美食',
    type: '纪录片',
    genre: '美食',
    cuisine_match: JSON.stringify(['中餐']),
    meal_type_match: JSON.stringify(['breakfast']),
    rating: 8.9,
    platform: '腾讯视频',
    platform_url: '',
    image_url: '',
    release_year: 2019
  }
];

function insertSampleData() {
  console.log('Inserting sample data...');
  
  sampleRecipes.forEach(recipe => {
    db.run(`INSERT OR IGNORE INTO recipes 
      (name, description, ingredients, steps, nutrition, tags, cuisine_type, difficulty, cooking_time, image_url, is_warm_food, is_shareable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recipe.name, recipe.description, recipe.ingredients, recipe.steps, 
       recipe.nutrition, recipe.tags, recipe.cuisine_type, recipe.difficulty, 
       recipe.cooking_time, recipe.image_url, recipe.is_warm_food, recipe.is_shareable]
    );
  });

  sampleMovies.forEach(movie => {
    db.run(`INSERT OR IGNORE INTO movies 
      (title, description, type, genre, cuisine_match, meal_type_match, rating, platform, platform_url, image_url, release_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [movie.title, movie.description, movie.type, movie.genre, 
       movie.cuisine_match, movie.meal_type_match, movie.rating, 
       movie.platform, movie.platform_url, movie.image_url, movie.release_year]
    );
  });

  console.log('Sample data inserted successfully');
}

module.exports = { insertSampleData };
