const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 默认推荐菜品（用于预加载包）
const DEFAULT_RECIPES = [
  { id: 1, name: '番茄炒蛋', cuisine_type: '中餐', tags: ['快手菜', '清淡'], cooking_time: 15, nutrition: { calories: 120 }, image_url: '🍳', score: 0.9 },
  { id: 2, name: '红烧肉', cuisine_type: '中餐', tags: ['硬菜', '下饭'], cooking_time: 60, nutrition: { calories: 450 }, image_url: '🍖', score: 0.85 },
  { id: 3, name: '日式咖喱饭', cuisine_type: '日料', tags: ['咖喱', '下饭'], cooking_time: 40, nutrition: { calories: 380 }, image_url: '🍛', score: 0.8 },
  { id: 4, name: '清蒸鲈鱼', cuisine_type: '中餐', tags: ['清淡', '健康'], cooking_time: 20, nutrition: { calories: 180 }, image_url: '🐟', score: 0.75 },
  { id: 5, name: '韩式拌饭', cuisine_type: '韩餐', tags: ['拌饭', '辣'], cooking_time: 25, nutrition: { calories: 420 }, image_url: '🍚', score: 0.7 },
  { id: 6, name: '番茄牛肉汤', cuisine_type: '西餐', tags: ['汤品', '暖食'], cooking_time: 45, nutrition: { calories: 280 }, image_url: '🍲', score: 0.65 }
]

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { behaviors, profile, sessionSummary, syncTime } = event
  
  console.log('[BatchSync] Received sync request from:', wxContext.OPENID)
  console.log('[BatchSync] Behaviors count:', behaviors ? behaviors.length : 0)
  
  try {
    const userOpenId = wxContext.OPENID
    
    // 1. 批量写入用户行为数据
    if (behaviors && behaviors.length > 0) {
      await saveBehaviors(userOpenId, behaviors)
    }
    
    // 2. 更新用户画像
    if (profile) {
      await updateUserProfile(userOpenId, profile)
    }
    
    // 3. 分析用户偏好并生成更新后的画像
    const updatedProfile = await analyzeUserPreferences(userOpenId, behaviors, sessionSummary)
    
    // 4. 生成预加载推荐包
    const preloadPackage = generatePreloadPackage(updatedProfile)
    
    console.log('[BatchSync] Sync completed successfully')
    
    return {
      success: true,
      message: 'Sync completed',
      data: {
        behaviorsSaved: behaviors ? behaviors.length : 0,
        profileUpdated: !!profile,
        sessionAnalyzed: !!sessionSummary
      },
      preloadPackage: preloadPackage
    }
    
  } catch (err) {
    console.error('[BatchSync] Error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

/**
 * 批量保存用户行为
 */
async function saveBehaviors(openid, behaviors) {
  const batch = behaviors.map(behavior => ({
    _openid: openid,
    action_type: behavior.action_type,
    item_type: behavior.item_type,
    item_id: behavior.item_id,
    details: behavior.details,
    timestamp: behavior.timestamp,
    session_id: behavior.session_id,
    createTime: db.serverDate()
  }))
  
  // 使用 Promise.all 并行写入
  const promises = batch.map(data => 
    db.collection('user_behaviors').add({ data })
  )
  
  await Promise.all(promises)
  console.log('[BatchSync] Saved', batch.length, 'behaviors')
}

/**
 * 更新用户画像
 */
async function updateUserProfile(openid, profile) {
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get()
  
  if (userRes.data.length > 0) {
    const userId = userRes.data[0]._id
    await db.collection('users').doc(userId).update({
      data: {
        preferences: profile.preferences || {},
        allergies: profile.allergies || [],
        taste_weights: profile.taste_weights || {},
        cuisine_weights: profile.cuisine_weights || {},
        updateTime: db.serverDate()
      }
    })
    console.log('[BatchSync] Updated user profile')
  }
}

/**
 * 分析用户偏好（简化版）
 */
async function analyzeUserPreferences(openid, behaviors, sessionSummary) {
  // 从数据库获取当前画像
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get()
  
  let profile = {}
  if (userRes.data.length > 0) {
    profile = userRes.data[0]
  }
  
  // 基于本次会话更新权重
  if (sessionSummary) {
    const tasteWeights = profile.taste_weights || {}
    const cuisineWeights = profile.cuisine_weights || {}
    
    // 根据喜欢/不喜欢调整权重
    if (sessionSummary.likedRecipes && sessionSummary.likedRecipes.length > 0) {
      // 增加相关标签权重
      tasteWeights.spicy = (tasteWeights.spicy || 0.5) + 0.05
    }
    
    if (sessionSummary.dislikedRecipes && sessionSummary.dislikedRecipes.length > 0) {
      // 降低相关标签权重
      tasteWeights.spicy = (tasteWeights.spicy || 0.5) - 0.05
    }
    
    // 确保权重在 0-1 范围内
    tasteWeights.spicy = Math.max(0, Math.min(1, tasteWeights.spicy || 0.5))
    
    profile.taste_weights = tasteWeights
    profile.cuisine_weights = cuisineWeights
  }
  
  return profile
}

/**
 * 生成预加载推荐包
 */
function generatePreloadPackage(profile) {
  const now = new Date()
  const hour = now.getHours()
  
  // 根据时间判断餐别
  let mealType = 'dinner'
  if (hour >= 5 && hour < 10) mealType = 'breakfast'
  else if (hour >= 10 && hour < 14) mealType = 'lunch'
  
  // 基于画像筛选推荐
  let recommendations = [...DEFAULT_RECIPES]
  
  // 根据口味偏好排序
  if (profile && profile.taste_weights) {
    recommendations = recommendations.map(recipe => {
      let score = recipe.score || 0.5
      
      // 根据口味偏好调整分数
      if (profile.taste_weights.spicy > 0.6 && recipe.tags.includes('辣')) {
        score += 0.15
      }
      
      return { ...recipe, score }
    }).sort((a, b) => b.score - a.score)
  }
  
  // 取前5个作为预加载包
  const topRecommendations = recommendations.slice(0, 5)
  
  return {
    recommendations: topRecommendations,
    mealType: mealType,
    generatedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000  // 24小时后过期
  }
}
