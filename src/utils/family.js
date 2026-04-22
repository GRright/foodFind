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

// 当前用户 ID 管理
export function getCurrentUserId() {
  let userId = uni.getStorageSync('foodfind_user_id')
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    uni.setStorageSync('foodfind_user_id', userId)
  }
  return userId
}

// 家庭群组 CRUD 操作（调用云函数）
export async function createFamilyGroup(name, type, userName) {
  try {
    const res = await uniCloud.callFunction({
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

export async function joinFamilyGroup(inviteCode, userName) {
  try {
    const res = await uniCloud.callFunction({
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
  if (group.creatorId === currentUserId) {
    return { success: false, error: '群主不能离开，请先转让或解散' }
  }

  try {
    await uniCloud.callFunction({
      name: 'updateFamilyMember',
      data: { familyId: group._id, action: 'remove', userId: currentUserId }
    })
  } catch (e) {
    console.warn('离开家庭云函数调用失败，仍清除本地:', e.message)
  }

  uni.removeStorageSync('foodfind_family_group')
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
    await uniCloud.callFunction({
      name: 'updateFamilyMember',
      data: { familyId: group._id, action: 'disband' }
    })
  } catch (e) {
    console.warn('解散家庭云函数调用失败，仍清除本地:', e.message)
  }

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
    const res = await uniCloud.callFunction({
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

// 更新我的健康标签
export async function updateMyHealthTags(healthTags) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  const currentUserId = getCurrentUserId()
  return await updateFamilyMember(group._id, { healthTags })
}

// 打卡相关
export async function recordFamilyCheckIn(date, userId, mealType) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  try {
    await uniCloud.callFunction({
      name: 'recordCheckIn',
      data: { familyId: group._id, date, mealType }
    })

    // 更新本地缓存
    const checkins = getFamilyCheckIns()
    if (!checkins[date]) checkins[date] = {}
    if (!checkins[date][userId]) {
      checkins[date][userId] = { breakfast: false, lunch: false, dinner: false }
    }
    checkins[date][userId][mealType] = true
    uni.setStorageSync('foodfind_family_checkins', checkins)

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export function getFamilyCheckIns() {
  return uni.getStorageSync('foodfind_family_checkins') || {}
}

// 获取家庭打卡记录（调用云函数）
export async function fetchFamilyCheckIns(startDate, endDate) {
  const group = getFamilyGroup()
  if (!group) return { success: false, error: '不在任何家庭中' }

  try {
    const res = await uniCloud.callFunction({
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
    const res = await uniCloud.callFunction({
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
    await uniCloud.callFunction({
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
    await uniCloud.callFunction({
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

// 清除家庭相关数据
export function clearFamilyData() {
  uni.removeStorageSync('foodfind_family_group')
  uni.removeStorageSync('foodfind_family_checkins')
  uni.removeStorageSync('foodfind_family_shopping')
}
