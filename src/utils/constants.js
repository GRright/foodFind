import meanMealsData from './meanMeals.json'
import breakfastData from './breakfast.json'

// 直接使用 JSON 数据，不依赖 lowdb
const recipes = meanMealsData || []
const breakfastRecipes = breakfastData || []

// 提供类似 lowdb 的查询方法
export function getRecipeById(id) {
  return recipes.find(r => r.id === id) || null
}

export function getRecipeByName(name) {
  return recipes.find(r => r.name === name) || null
}

export function getRecipesByType(type) {
  return recipes.filter(r => r.type === type)
}

export function getRecipesByCuisine(cuisine) {
  return recipes.filter(r => r.cuisine_type === cuisine)
}

// 兼容 lowdb API
const db = {
  data: {
    recipes: recipes
  }
}

export { db }

const EMOJI_MAP = {
  '番茄炒蛋': '🍳', '宫保鸡丁': '🍗', '红烧肉': '🍖', '清蒸鲈鱼': '🐟',
  '麻婆豆腐': '🥘', '糖醋排骨': '🍖', '蒜蓉西兰花': '🥦', '鱼香肉丝': '🥩',
  '红烧茄子': '🍆', '干煸四季豆': '🫛', '可乐鸡翅': '🍗', '蒜蓉炒生菜': '🥬',
  '回锅肉': '🥓', '清炒时蔬': '🥗', '啤酒鸭': '🦆', '水煮鱼': '🐟',
  '水煮肉片': '🥩', '毛血旺': '🌶️', '辣子鸡': '🍗', '酸辣土豆丝': '🥔',
  '可乐鸡翅': '🍗', '蚂蚁上树': '🍜', '地三鲜': '🥔', '干锅花菜': '🥦',
  '酸菜鱼': '🐟', '口水鸡': '🍗', '蒜泥白肉': '🥓', '东坡肉': '🍖',
  '糖醋里脊': '🥩', '油焖大虾': '🦐', '白切鸡': '🍗', '蒸蛋羹': '🥚',
  '冬瓜排骨汤': '🍲', '紫菜蛋花汤': '🍲', '西红柿鸡蛋汤': '🍅', '玉米排骨汤': '🍲'
}

function getEmoji(name, type) {
  if (EMOJI_MAP[name]) return EMOJI_MAP[name]
  const typeEmojis = {
    meat: ['🍖', '🍗', '🥩', '🦆', '🐟', '🦐'],
    vegetarian: ['🥬', '🥦', '🍆', '🥔', '🫛', '🥗'],
    mixed: ['🍜', '🥘', '🌶️', '🍲']
  }
  const emojis = typeEmojis[type] || ['🍽️']
  return emojis[name.length % emojis.length]
}

function getImagePath(name, mealType = 'mainMeals') {
  // 使用云存储中的图片
  return `cloud://cloud1-d7gvzylmp17ed1957.636c-cloud1-d7gvzylmp17ed1957-1322628608/${mealType}/${name}.png`
}

function adaptRecipe(recipe, mealType = 'mainMeals') {
  return {
    ...recipe,
    image: getImagePath(recipe.name, mealType),
    calories: recipe.nutrition?.calories || 0
  }
}

function classifyMeal(recipe) {
  const tags = recipe.tags || []
  const time = recipe.cooking_time || 0
  const cal = recipe.nutrition?.calories || 0
  
  if (tags.includes('硬菜') || tags.includes('宴客菜') || cal > 400 || time > 45) {
    return 'dinner'
  }
  if (tags.includes('快手菜') || time <= 15) {
    return 'lunch'
  }
  return Math.random() > 0.5 ? 'lunch' : 'dinner'
}

const lunchRecipes = []
const dinnerRecipes = []
const adaptedBreakfastRecipes = []

meanMealsData.forEach(recipe => {
  const adapted = adaptRecipe(recipe)
  const mealType = classifyMeal(recipe)
  if (mealType === 'lunch') {
    lunchRecipes.push(adapted)
  } else {
    dinnerRecipes.push(adapted)
  }
})

breakfastRecipes.forEach(recipe => {
  adaptedBreakfastRecipes.push(adaptRecipe(recipe, 'breakfast'))
})

lunchRecipes.forEach((r, i) => { r.id = 100 + i })
dinnerRecipes.forEach((r, i) => { r.id = 200 + i })
adaptedBreakfastRecipes.forEach((r, i) => { r.id = 1 + i })

const HEALTH_TAG_TO_KEYWORDS = {
  elderly: { avoid: [], extraCheck: (r) => false },
  child: { avoid: [], extraCheck: (r) => false },
  baby: { avoid: ['儿童'], extraCheck: (r) => {
    const tags = r.tags || []
    return tags.includes('辣') || tags.includes('麻辣') || tags.includes('特辣')
  }},
  pregnant: { avoid: [], extraCheck: (r) => {
    const tags = r.tags || []
    return tags.includes('特辣')
  }},
  nursing: { avoid: [], extraCheck: (r) => {
    const tags = r.tags || []
    return tags.includes('特辣')
  }},
  hypertension: { avoid: ['高血脂'], extraCheck: (r) => (r.oil_salt_level === '高油盐' || r.nutrition?.sodium > 600) },
  diabetes: { avoid: ['糖尿病患者'], extraCheck: (r) => r.nutrition?.carbs > 30 },
  hyperlipidemia: { avoid: ['高血脂', '肥胖人群'], extraCheck: (r) => (r.oil_salt_level === '高油盐' || r.nutrition?.fat > 30) },
  gout: { avoid: ['痛风患者'], extraCheck: (r) => r.name.includes('啤酒') || r.name.includes('内脏') },
  allergy_seafood: { avoid: [], extraCheck: (r) => {
    const name = r.name || ''
    const ingredients = (r.ingredients || []).map(i => i.name || '').join(',')
    const text = name + ingredients
    return ['虾', '蟹', '贝', '蛤', '牡蛎', '鲍鱼', '鱼', '鱿鱼', '章鱼'].some(w => text.includes(w))
  }},
  allergy_nut: { avoid: ['花生过敏者'], extraCheck: (r) => {
    const ingredients = (r.ingredients || []).map(i => i.name || '').join(',')
    return ['花生', '核桃', '杏仁', '腰果'].some(w => ingredients.includes(w))
  }},
  allergy_egg: { avoid: [], extraCheck: (r) => {
    const ingredients = (r.ingredients || []).map(i => i.name || '').join(',')
    return ingredients.includes('鸡蛋')
  }},
  allergy_dairy: { avoid: [], extraCheck: (r) => {
    const ingredients = (r.ingredients || []).map(i => i.name || '').join(',')
    return ['牛奶', '奶油', '芝士', '奶酪', '黄油', '酸奶'].some(w => ingredients.includes(w))
  }},
  vegetarian: { avoid: [], extraCheck: (r) => r.type === 'meat' },
  low_sodium: { avoid: [], extraCheck: (r) => r.oil_salt_level === '高油盐' || r.nutrition?.sodium > 500 },
  low_fat: { avoid: ['减肥人群', '高血脂', '肥胖人群'], extraCheck: (r) => r.nutrition?.fat > 25 },
  low_sugar: { avoid: ['糖尿病患者'], extraCheck: (r) => r.tags?.includes('酸甜') }
}

export function filterByUserSuitability(recipes, healthTags) {
  if (!healthTags || healthTags.length === 0) return recipes

  return recipes.filter(recipe => {
    for (const tag of healthTags) {
      const rule = HEALTH_TAG_TO_KEYWORDS[tag]
      if (!rule) continue

      if (rule.avoid && rule.avoid.length > 0) {
        const recipeAvoidList = recipe.avoid_for || []
        for (const keyword of rule.avoid) {
          if (recipeAvoidList.some(a => a.includes(keyword) || keyword.includes(a))) {
            return false
          }
        }
      }

      if (rule.extraCheck && rule.extraCheck(recipe)) {
        return false
      }
    }
    return true
  })
}

export function getFilteredRecipes(mealType, healthTags) {
  let recipes = []
  if (mealType === 'breakfast') recipes = [...ALL_RECIPES.breakfast]
  else if (mealType === 'lunch') recipes = [...ALL_RECIPES.lunch]
  else if (mealType === 'dinner') recipes = [...ALL_RECIPES.dinner]

  if (healthTags && healthTags.length > 0) {
    recipes = filterByUserSuitability(recipes, healthTags)
  }

  return recipes
}

export const ALL_RECIPES = {
  breakfast: adaptedBreakfastRecipes,
  lunch: lunchRecipes,
  dinner: dinnerRecipes
}