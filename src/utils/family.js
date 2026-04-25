// 家庭/群组管理工具模块（云函数 + 本地缓存混合模式）

export const FAMILY_TYPES = [
  { value: 'couple', label: '情侣/夫妻', icon: '💑', maxMembers: 2 },
  { value: 'family', label: '家庭', icon: '👨‍👩‍👧‍👦', maxMembers: 8 },
  { value: 'roommates', label: '室友/朋友', icon: '🤝', maxMembers: 6 }
]

// 健康标签定义（20种标签，分4类）
export const HEALTH_TAGS = [
  // 人群
  { id: 'elderly', name: '老人', icon: '👴', category: '人群' },
  { id: 'baby', name: '婴幼儿(0-3岁)', icon: '👶', category: '人群' },
  { id: 'child', name: '儿童(4-12岁)', icon: '👦', category: '人群' },
  { id: 'pregnant', name: '孕期', icon: '🤰', category: '人群' },
  { id: 'nursing', name: '哺乳期', icon: '🍼', category: '人群' },
  // 健康
  { id: 'hypertension', name: '高血压', icon: '💊', category: '健康' },
  { id: 'diabetes', name: '糖尿病', icon: '🩸', category: '健康' },
  { id: 'hyperlipidemia', name: '高血脂', icon: '❤️', category: '健康' },
  { id: 'gout', name: '痛风', icon: '🦶', category: '健康' },
  // 过敏
  { id: 'allergy_seafood', name: '海鲜过敏', icon: '🦐', category: '过敏' },
  { id: 'allergy_nut', name: '坚果过敏', icon: '🥜', category: '过敏' },
  { id: 'allergy_egg', name: '鸡蛋过敏', icon: '🥚', category: '过敏' },
  { id: 'allergy_dairy', name: '乳制品过敏', icon: '🥛', category: '过敏' },
  { id: 'allergy_gluten', name: '麸质过敏', icon: '🌾', category: '过敏' },
  // 饮食
  { id: 'lactose_intolerant', name: '乳糖不耐', icon: '🥛', category: '饮食' },
  { id: 'low_sodium', name: '低盐', icon: '🧂', category: '饮食' },
  { id: 'low_fat', name: '低脂', icon: '🥑', category: '饮食' },
  { id: 'low_sugar', name: '低糖', icon: '🍬', category: '饮食' },
  { id: 'vegetarian', name: '素食', icon: '🥬', category: '饮食' }
]

export const HEALTH_TAG_CATEGORIES = ['人群', '健康', '过敏', '饮食']

// 当前用户 ID 管理（使用微信 OpenID，确保前后端一致）
export function getCurrentUserId() {
  // 优先使用微信登录的 OpenID
  const wxContext = uni.getStorageSync('foodfind_wx_context')
  if (wxContext && wxContext.openid) {
    return wxContext.openid
  }
  
  // 兼容旧数据：如果已有自定义 ID，继续使用
  let userId = uni.getStorageSync('foodfind_user_id')
  if (userId) {
    return userId
  }
  
  // 生成临时 ID（未登录状态）
  userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  uni.setStorageSync('foodfind_user_id', userId)
  return userId
}

// 设置微信 OpenID（登录后调用）
export function setWxOpenId(openid) {
  if (openid) {
    uni.setStorageSync('foodfind_wx_context', { openid })
  }
}

// 获取用户昵称
export function getUserNickname() {
  const userInfo = uni.getStorageSync('foodfind_user_info') || {}
  return userInfo.nickname || '美食爱好者'
}

// 家庭群组 CRUD 操作（调用云函数）
export async function createFamilyGroup(name, type) {
  try {
    const userName = getUserNickname()
    const res = await wx.cloud.callFunction({
      name: 'createFamilyGroup',
      data: { name, type, userName }
    })

    if (res.result.success) {
      // 缓存到本地
      uni.setStorageSync('foodfind_family_group', res.result.familyData)
      return { success: true, group: res.result.familyData }
    }
    return { success: false, error: res.result.error }
  } catch (err) {
    console.error('创建家庭失败:', err)
    return { success: false, error: err.message }
  }
}

export async function joinFamilyGroup(inviteCode) {
  try {
    const userName = getUserNickname()
    const res = await wx.cloud.callFunction({
      name: 'joinFamilyGroup',
      data: { inviteCode, userName }
    })

    if (res.result.success) {
      uni.setStorageSync('foodfind_family_group', res.result.familyData)
      return { success: true, group: res.result.familyData }
    }
    return { success: false, error: res.result.error }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function leaveFamilyGroup() {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  const currentUserId = getCurrentUserId()
  const isAdmin = group.creatorId === currentUserId
  const otherMembers = group.members.filter(m => m.userId !== currentUserId)

  try {
    if (isAdmin && otherMembers.length > 0) {
      // 群主离开且有其他成员：转让群主给第一个成员，然后移除自己
      const newAdmin = otherMembers[0]
      await wx.cloud.callFunction({
        name: 'updateFamilyMember',
        data: { 
          familyId: group._id, 
          action: 'transferAndLeave', 
          newAdminId: newAdmin.userId 
        }
      })
    } else if (isAdmin && otherMembers.length === 0) {
      // 群主离开且无其他成员：直接解散家庭
      await wx.cloud.callFunction({
        name: 'updateFamilyMember',
        data: { familyId: group._id, action: 'disband' }
      })
    } else {
      // 普通成员离开：直接移除自己
      await wx.cloud.callFunction({
        name: 'updateFamilyMember',
        data: { familyId: group._id, action: 'remove', userId: currentUserId }
      })
    }
  } catch (e) {
    console.warn('离开家庭云函数调用失败:', e.message)
    // 即使云函数失败，也要清除本地数据，让用户可以重新创建
  }

  // 清除本地数据
  uni.removeStorageSync('foodfind_family_group')
  uni.removeStorageSync('foodfind_family_checkins')
  uni.removeStorageSync('foodfind_family_shopping')
  
  // 清除群主菜谱缓存
  if (group.creatorId) {
    uni.removeStorageSync(`foodfind_weekly_${group.creatorId}`)
  }
  
  // 如果是共享模式，清除菜谱数据以便重新加载
  const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
  if (!prefs.independentMode) {
    uni.removeStorageSync('foodfind_meals')
    uni.removeStorageSync('foodfind_meals_date')
  }
  
  return { success: true }
}

export async function deleteFamilyGroup() {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  const currentUserId = getCurrentUserId()
  if (group.creatorId !== currentUserId) {
    return { success: false, error: '只有群主可以解散家庭' }
  }

  try {
    await wx.cloud.callFunction({
      name: 'updateFamilyMember',
      data: { familyId: group._id, action: 'disband' }
    })
  } catch (e) {
    console.warn('解散家庭云函数调用失败:', e.message)
    // 即使云函数失败，也要清除本地数据，让用户可以重新创建
  }

  // 清除本地数据
  uni.removeStorageSync('foodfind_family_group')
  uni.removeStorageSync('foodfind_family_checkins')
  uni.removeStorageSync('foodfind_family_shopping')
  return { success: true }
}

// 获取家庭群组信息（优先从本地缓存）
export function getFamilyGroup() {
  return uni.getStorageSync('foodfind_family_group') || null
}

// 更新家庭成员信息（调用云函数）
export async function updateFamilyMember(familyId, updates) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'updateFamilyMember',
      data: { familyId, ...updates }
    })

    if (res.result.success) {
      uni.setStorageSync('foodfind_family_group', res.result.familyData)
      return { success: true }
    }
    return { success: false, error: res.result.error }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// 更新我的昵称
export async function updateMyNickname(nickname) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  const currentUserId = getCurrentUserId()
  let updated = false
  const finalNickname = nickname || getUserNickname()

  if (group.members) {
    group.members.forEach(m => {
      if (m.userId === currentUserId) {
        m.name = finalNickname
        updated = true
      }
    })
  }

  if (updated) {
    // 先保存到本地缓存
    uni.setStorageSync('foodfind_family_group', group)
    
    // 同步到云端
    try {
      const res = await updateFamilyMember(group._id, { name: finalNickname })
      return res
    } catch (e) {
      // 云端同步失败，但本地已经更新
      console.warn('云端同步昵称失败:', e)
      return { success: true, warning: '云端同步失败，但本地已更新' }
    }
  }
  return { success: false, error: '未在家庭成员中找到自己' }
}

// 更新我的健康标签（允许为空数组，表示无特殊健康需求）
export async function updateMyHealthTags(healthTags) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }
  if (!group._id) return { success: false, error: '家庭信息不完整，请重新加入家庭' }

  // healthTags 可以为空数组，表示无过敏源、无健康问题
  return await updateFamilyMember(group._id, { healthTags })
}

// 打卡相关
export async function recordFamilyCheckIn(date, userId, mealType, state) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  try {
    await wx.cloud.callFunction({
      name: 'recordCheckIn',
      data: { familyId: group._id, date, mealType, state: state !== undefined ? state : true }
    })

    // 更新本地缓存
    const checkins = getFamilyCheckIns()
    if (!checkins[date]) checkins[date] = {}
    if (!checkins[date][userId]) {
      checkins[date][userId] = { breakfast: false, lunch: false, dinner: false }
    }
    checkins[date][userId][mealType] = state !== undefined ? state : true
    uni.setStorageSync('foodfind_family_checkins', checkins)

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export function getFamilyCheckIns() {
  const familyCheckins = uni.getStorageSync('foodfind_family_checkins') || {}
  const personalChecks = uni.getStorageSync('foodfind_personal_checks') || {}
  const currentUserId = getCurrentUserId()
  const group = getFamilyGroup()
  
  // 如果在家庭中，将我的个人打卡数据合并到家庭打卡中
  if (group) {
    // 遍历所有个人打卡日期
    Object.keys(personalChecks).forEach(date => {
      if (!familyCheckins[date]) {
        familyCheckins[date] = {}
      }
      // 将我的个人打卡数据同步到家庭打卡中我的 userId 对应的条目中
      familyCheckins[date][currentUserId] = {
        ...familyCheckins[date][currentUserId],
        ...personalChecks[date]
      }
    })
  }
  
  return familyCheckins
}

// 获取家庭打卡记录（调用云函数）
export async function fetchFamilyCheckIns(startDate, endDate) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  try {
    const res = await wx.cloud.callFunction({
      name: 'getFamilyCheckIns',
      data: { familyId: group._id, startDate, endDate }
    })

    if (res.result.success) {
      // 转换为本地格式并缓存
      const checkins = {}
      res.result.checkIns.forEach(record => {
        if (!checkins[record.date]) checkins[record.date] = {}
        checkins[record.date][record.userId] = {
          breakfast: record.breakfast,
          lunch: record.lunch,
          dinner: record.dinner
        }
      })
      uni.setStorageSync('foodfind_family_checkins', checkins)
      return { success: true, checkins }
    }
    return { success: false, error: res.result.error }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// 购物清单相关
export async function getFamilyShoppingList() {
  const group = getFamilyGroup()
  if (!group) return { items: [] }

  // 先从本地缓存获取
  const cached = uni.getStorageSync('foodfind_family_shopping')
  
  // 同步获取云端数据
  try {
    const res = await wx.cloud.callFunction({
      name: 'syncFamilyShopping',
      data: { familyId: group._id, action: 'get' }
    })

    if (res.result.success) {
      uni.setStorageSync('foodfind_family_shopping', res.result.shoppingList)
      return res.result.shoppingList
    }
  } catch (err) {
    console.error('获取云端购物清单失败:', err)
  }

  return cached || { items: [] }
}

export async function saveFamilyShoppingList(list, userId) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  // 先更新本地缓存
  uni.setStorageSync('foodfind_family_shopping', {
    ...list,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  })

  // 异步同步到云端
  try {
    await wx.cloud.callFunction({
      name: 'syncFamilyShopping',
      data: { familyId: group._id, action: 'update', items: list.items }
    })
  } catch (err) {
    console.error('同步购物清单到云端失败:', err)
  }

  return { success: true }
}

// 发送家庭通知
export async function sendFamilyNotification(type, content, targetUserId) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  try {
    await wx.cloud.callFunction({
      name: 'sendFamilyNotification',
      data: { familyId: group._id, type, content, targetUserId }
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// 获取家庭所有成员的健康标签汇总
export function getFamilyHealthTags() {
  const group = getFamilyGroup()
  if (!group) return []

  const allTags = new Set()
  group.members.forEach(member => {
    if (member.healthTags) {
      member.healthTags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags)
}

// 根据 ID 获取健康标签
export function getHealthTagById(tagId) {
  return HEALTH_TAGS.find(t => t.id === tagId) || null
}

// 根据健康标签过滤菜谱
export function filterRecipesByHealthTags(recipes, healthTags) {
  if (!healthTags || healthTags.length === 0) return recipes

  const filterRules = {
    // 高血压：避免高钠食物
    hypertension: (r) => {
      const highSodium = ['咸菜', '腊肉', '腌', '酱', '咸鱼', '泡椒', '榨菜']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !highSodium.some(w => text.includes(w))
    },

    // 糖尿病：避免高糖食物
    diabetes: (r) => {
      const highSugar = ['糖醋', '蜜汁', '甜', '糖排', '甜品', '蛋糕', '冰淇淋', '巧克力']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !highSugar.some(w => text.includes(w))
    },

    // 海鲜过敏
    allergy_seafood: (r) => {
      const seafood = ['虾', '蟹', '贝', '蛤', '牡蛎', '鲍鱼', '鱼翅', '海参', '鱿鱼', '章鱼']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !seafood.some(w => text.includes(w))
    },

    // 坚果过敏
    allergy_nut: (r) => {
      const nuts = ['花生', '核桃', '杏仁', '腰果', '榛子', '开心果', '松子']
      const ingredients = (r.ingredients || []).join(',')
      return !nuts.some(w => ingredients.includes(w))
    },

    // 鸡蛋过敏
    allergy_egg: (r) => {
      const ingredients = (r.ingredients || []).join(',')
      return !ingredients.includes('鸡蛋')
    },

    // 乳制品过敏
    allergy_dairy: (r) => {
      const dairy = ['牛奶', '奶油', '芝士', '奶酪', '黄油', '酸奶']
      const ingredients = (r.ingredients || []).join(',')
      return !dairy.some(w => ingredients.includes(w))
    },

    // 麸质过敏
    allergy_gluten: (r) => {
      const gluten = ['面粉', '面包', '面条', '馒头', '包子', '饺子', '馄饨', '蛋糕', '饼干']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !gluten.some(w => text.includes(w))
    },

    // 痛风：避免高嘌呤食物
    gout: (r) => {
      const highPurine = ['内脏', '肝', '肾', '脑', '海鲜', '浓汤', '火锅', '啤酒']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !highPurine.some(w => text.includes(w))
    },

    // 婴幼儿：避免辛辣刺激
    baby: (r) => {
      const spicy = ['辣', '麻辣', '香辣', '酸辣', '剁椒', '泡椒', '火锅']
      const hard = ['硬', '炸', '煎']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !spicy.some(w => text.includes(w)) && !hard.some(w => text.includes(w))
    },

    // 素食：过滤所有肉类
    vegetarian: (r) => {
      const meat = ['肉', '鸡', '鸭', '鱼', '牛', '羊', '猪', '虾', '蟹', '排骨', '肠', '腿', '翅']
      const name = r.name || ''
      const ingredients = (r.ingredients || []).join(',')
      const text = name + ingredients
      return !meat.some(w => text.includes(w))
    }
  }

  // 应用所有标签的过滤规则
  return recipes.filter(recipe => {
    for (const tag of healthTags) {
      if (filterRules[tag] && !filterRules[tag](recipe)) {
        return false
      }
    }
    return true
  })
}

const ALLERGY_MAP = {
  peanut: ['花生'],
  dairy: ['牛奶', '奶油', '芝士', '奶酪', '黄油', '酸奶'],
  seafood: ['虾', '蟹', '贝', '蛤', '牡蛎', '鲍鱼', '鱼翅', '海参', '鱿鱼', '章鱼', '鲈鱼'],
  gluten: ['面粉', '中筋面粉', '面包', '面条', '馒头', '包子', '饺子', '馄饨', '蛋糕', '饼干', '油条', '饼皮'],
  egg: ['鸡蛋'],
  soy: ['黄豆', '大豆', '豆腐', '豆浆']
}

const RESTRICTION_MAP = {
  no_red_meat: ['五花肉', '猪里脊', '牛肉', '羊肉', '排骨', '肋排'],
  no_poultry: ['鸡胸肉', '鸡翅', '鸭', '禽类'],
  no_fish: ['鲈鱼', '鱼', '海鲜'],
  no_garlic: ['大蒜', '蒜蓉', '蒜末'],
  vegan: ['肉', '鸡', '鸭', '鱼', '牛', '羊', '猪', '虾', '蟹', '排骨', '蛋', '奶', '奶油', '芝士', '奶酪', '黄油'],
  vegetarian: ['肉', '鸡', '鸭', '鱼', '牛', '羊', '猪', '虾', '蟹', '排骨']
}

const CUISINE_MAP = {
  home_cooking: ['家常菜'],
  sichuan: ['川菜', '川湘菜'],
  cantonese: ['粤菜'],
  northern: ['面食', '北方面食'],
  healthy: [],
  asian_fusion: []
}

export function filterRecipesByUserPrefs(recipes, userPrefs) {
  if (!userPrefs) return recipes
  const { allergies, restrictions, cuisines } = userPrefs

  return recipes.filter(recipe => {
    const name = recipe.name || ''
    const ingredients = (recipe.ingredients || []).map(i => i.name || '').join(',')
    const cuisineType = recipe.cuisine_type || ''
    const text = name + ',' + ingredients

    if (allergies && allergies.length > 0) {
      for (const a of allergies) {
        const keywords = ALLERGY_MAP[a]
        if (keywords && keywords.some(k => text.includes(k))) {
          return false
        }
      }
    }

    if (restrictions && restrictions.length > 0) {
      for (const r of restrictions) {
        const keywords = RESTRICTION_MAP[r]
        if (keywords && keywords.some(k => text.includes(k))) {
          return false
        }
      }
    }

    if (cuisines && cuisines.length > 0) {
      const matchedCuisine = cuisines.some(c => {
        const keywords = CUISINE_MAP[c]
        if (!keywords || keywords.length === 0) return true
        return keywords.some(k => cuisineType.includes(k))
      })
      if (!matchedCuisine) return false
    }

    return true
  })
}

// 清除家庭相关数据
export function clearFamilyData() {
  uni.removeStorageSync('foodfind_family_group')
  uni.removeStorageSync('foodfind_family_checkins')
  uni.removeStorageSync('foodfind_family_shopping')
}

export function addLocalNotification(notif) {
  const list = uni.getStorageSync('foodfind_notifications') || []
  list.unshift({
    id: 'n_' + Date.now(),
    read: false,
    createdAt: new Date().toISOString(),
    ...notif
  })
  if (list.length > 50) list.length = 50
  uni.setStorageSync('foodfind_notifications', list)
  return list
}

export function getLocalNotifications() {
  return uni.getStorageSync('foodfind_notifications') || []
}

export function markNotificationRead(id) {
  const list = uni.getStorageSync('foodfind_notifications') || []
  const item = list.find(n => n.id === id)
  if (item) item.read = true
  uni.setStorageSync('foodfind_notifications', list)
}

export function markAllNotificationsRead() {
  const list = uni.getStorageSync('foodfind_notifications') || []
  list.forEach(n => { n.read = true })
  uni.setStorageSync('foodfind_notifications', list)
}

export function getUnreadNotificationCount() {
  const list = uni.getStorageSync('foodfind_notifications') || []
  return list.filter(n => !n.read).length
}

export function notifyShoppingChange(action, itemName) {
  const myName = getUserNickname()
  const content = action === 'add' ? `添加了「${itemName}」到购物清单` : action === 'buy' ? `购买了「${itemName}」` : `从购物清单移除了「${itemName}」`
  addLocalNotification({
    type: 'shopping',
    fromName: myName,
    content
  })
  
  const group = getFamilyGroup()
  if (group) {
    sendFamilyNotification('shopping', content).catch(() => {})
  }
}

export function notifyCheckIn(mealType) {
  const myName = getUserNickname()
  const mealName = mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'
  const content = `完成了${mealName}打卡 🎉`
  addLocalNotification({
    type: 'checkin',
    fromName: myName,
    content
  })
  
  const group = getFamilyGroup()
  if (group) {
    sendFamilyNotification('checkin', content).catch(() => {})
  }
}

export function notifyRecipeLike(recipeName) {
  const myName = getUserNickname()
  addLocalNotification({
    type: 'like',
    fromName: myName,
    content: `喜欢了「${recipeName}」`
  })
}

export function getFamilyCheckInToday() {
  const todayStr = new Date().toISOString().split('T')[0]
  const familyCheckins = uni.getStorageSync('foodfind_family_checkins') || {}
  const personalChecks = uni.getStorageSync('foodfind_personal_checks') || {}
  const myChecks = personalChecks[todayStr] || {}
  const group = getFamilyGroup()
  const currentUserId = getCurrentUserId()
  const result = []
  
  // 获取用户设置的昵称
  const myNickname = getUserNickname()
  
  // 如果不在家庭中，直接返回空数组
  if (!group || !group.members) {
    return []
  }
  
  // 确保 checks 对象总是包含完整字段
  const ensureChecks = (checks) => {
    return {
      breakfast: checks?.breakfast || false,
      lunch: checks?.lunch || false,
      dinner: checks?.dinner || false
    }
  }
  
  // 检查当前用户是否在家庭成员中（兼容旧数据）
  let foundSelf = false
  let selfMember = null
  
  // 首先尝试精确匹配
  selfMember = group.members.find(m => m.userId === currentUserId)
  
  // 如果没找到，尝试通过其他方式识别（如角色为 admin 且只有一个 admin）
  if (!selfMember) {
    const admins = group.members.filter(m => m.role === 'admin')
    if (admins.length === 1) {
      selfMember = admins[0]
    }
  }
  
  // 遍历所有家庭成员
  group.members.forEach(m => {
    const isSelf = (m.userId === currentUserId) || (selfMember && m.userId === selfMember.userId)
    
    if (isSelf) {
      foundSelf = true
      // 我自己 - 优先使用用户设置的昵称
      const checksFromFamily = familyCheckins[todayStr]?.[m.userId] || {}
      // 合并：个人打卡和家庭缓存中的数据
      // 同时检查以 currentUserId 为 key 的数据（兼容新 ID 格式）
      const checksFromNewId = familyCheckins[todayStr]?.[currentUserId] || {}
      const finalChecks = {
        ...myChecks,
        ...checksFromFamily,
        ...checksFromNewId
      }
      
      result.push({
        name: myNickname || m.name || '我',
        isSelf: true,
        checks: ensureChecks(finalChecks)
      })
    } else {
      // 其他成员
      const memberChecks = familyCheckins[todayStr]?.[m.userId] || {}
      result.push({
        name: m.name || 'TA',
        isSelf: false,
        checks: ensureChecks(memberChecks)
      })
    }
  })
  
  // 如果还是没找到自己，但有个人打卡数据，添加一个自己的条目
  if (!foundSelf && (myChecks.breakfast || myChecks.lunch || myChecks.dinner)) {
    result.unshift({
      name: myNickname || '我',
      isSelf: true,
      checks: ensureChecks(myChecks)
    })
  }
  
  return result
}
