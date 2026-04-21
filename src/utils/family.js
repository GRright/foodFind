// 家庭/群组管理工具模块

export const FAMILY_TYPES = [
  { value: 'couple', label: '情侣/夫妻', icon: '💑', maxMembers: 2 },
  { value: 'family', label: '家庭', icon: '👨‍👩‍👧‍', maxMembers: 8 },
  { value: 'roommates', label: '室友/朋友', icon: '🤝', maxMembers: 6 }
]

export const HEALTH_TAGS = [
  { id: 'elderly', name: '老人', icon: '👴', category: '人群' },
  { id: 'baby', name: '婴幼儿(0-3岁)', icon: '👶', category: '人群' },
  { id: 'kid', name: '儿童(3-12岁)', icon: '👦', category: '人群' },
  { id: 'pregnant', name: '孕期', icon: '🤰', category: '人群' },
  { id: 'nursing', name: '哺乳期', icon: '🍼', category: '人群' },
  { id: 'hypertension', name: '高血压', icon: '💊', category: '健康' },
  { id: 'diabetes', name: '糖尿病', icon: '🩸', category: '健康' },
  { id: 'high_cholesterol', name: '高血脂', icon: '❤️', category: '健康' },
  { id: 'gout', name: '痛风', icon: '🦶', category: '健康' },
  { id: 'allergy_seafood', name: '海鲜过敏', icon: '🦐', category: '过敏' },
  { id: 'allergy_nut', name: '坚果过敏', icon: '🥜', category: '过敏' },
  { id: 'allergy_egg', name: '鸡蛋过敏', icon: '🥚', category: '过敏' },
  { id: 'allergy_dairy', name: '乳制品过敏', icon: '🥛', category: '过敏' },
  { id: 'allergy_gluten', name: '麸质过敏', icon: '🌾', category: '过敏' },
  { id: 'lactose', name: '乳糖不耐', icon: '🥛', category: '饮食' },
  { id: 'low_sodium', name: '低盐饮食', icon: '🧂', category: '饮食' },
  { id: 'low_fat', name: '低脂饮食', icon: '🥑', category: '饮食' },
  { id: 'low_sugar', name: '低糖饮食', icon: '🍬', category: '饮食' },
  { id: 'vegetarian', name: '素食', icon: '🥬', category: '饮食' }
]

export const HEALTH_TAG_CATEGORIES = ['人群', '健康', '过敏', '饮食']

// 根据健康标签过滤菜谱
export function filterRecipesByHealthTags(recipes, healthTags) {
  if (!healthTags || healthTags.length === 0) return recipes

  const filterRules = {
    // 高血压：低钠，避免高盐
    hypertension: (r) => {
      const name = r.name || ''
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['咸菜', '腊肉', '培根', '火腿', '腌', '酱爆']
      return !badWords.some(w => name.includes(w) || ingredients.includes(w))
    },
    // 糖尿病：低糖，避免高GI
    diabetes: (r) => {
      const name = r.name || ''
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['糖醋', '蜜汁', '拔丝', '糖炒', '甜品', '蛋糕']
      return !badWords.some(w => name.includes(w) || ingredients.includes(w))
    },
    // 海鲜过敏
    allergy_seafood: (r) => {
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['虾', '蟹', '鱼', '贝', '海', '鱿', '鲍', '参']
      return !badWords.some(w => ingredients.includes(w))
    },
    // 坚果过敏
    allergy_nut: (r) => {
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['花生', '核桃', '杏仁', '腰果', '榛子', '芝麻']
      return !badWords.some(w => ingredients.includes(w))
    },
    // 鸡蛋过敏
    allergy_egg: (r) => {
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      return !ingredients.includes('蛋')
    },
    // 乳制品过敏/乳糖不耐
    allergy_dairy: (r) => {
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['奶', '奶酪', '黄油', '奶油', '芝士']
      return !badWords.some(w => ingredients.includes(w))
    },
    // 低盐饮食
    low_sodium: (r) => {
      const name = r.name || ''
      const badWords = ['咸', '酱', '腊', '腌', '熏']
      return !badWords.some(w => name.includes(w))
    },
    // 低脂饮食
    low_fat: (r) => {
      const calories = r.nutrition?.calories || 0
      return calories < 500
    },
    // 低糖饮食
    low_sugar: (r) => {
      const name = r.name || ''
      const badWords = ['糖', '甜', '蜜', '糕', '蛋糕', '甜品']
      return !badWords.some(w => name.includes(w))
    },
    // 素食
    vegetarian: (r) => {
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['肉', '鸡', '鸭', '鱼', '虾', '牛', '猪', '羊', '排']
      return !badWords.some(w => ingredients.includes(w))
    },
    // 痛风：低嘌呤
    gout: (r) => {
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['肝', '肾', '脑', '海鲜', '啤酒', '浓汤', '老火']
      return !badWords.some(w => ingredients.includes(w))
    },
    // 婴幼儿：清淡、易消化
    baby: (r) => {
      const name = r.name || ''
      const ingredients = (r.ingredients || []).map(i => i.name).join('')
      const badWords = ['辣', '麻', '酒', '辣椒', '花椒', '胡椒']
      return !badWords.some(w => name.includes(w) || ingredients.includes(w))
    }
  }

  let filtered = [...recipes]
  for (const tag of healthTags) {
    const rule = filterRules[tag]
    if (rule) {
      filtered = filtered.filter(rule)
    }
  }
  return filtered
}

// 生成邀请码
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 生成用户ID
export function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 获取当前用户ID
export function getCurrentUserId() {
  let userId = uni.getStorageSync('foodfind_user_id')
  if (!userId) {
    userId = generateUserId()
    uni.setStorageSync('foodfind_user_id', userId)
  }
  return userId
}

// 获取家庭群组
export function getFamilyGroup() {
  return uni.getStorageSync('foodfind_family_group') || null
}

// 保存家庭群组
export function saveFamilyGroup(group) {
  uni.setStorageSync('foodfind_family_group', group)
}

// 创建家庭群组
export function createFamilyGroup(name, type, userName) {
  const userId = getCurrentUserId()
  const group = {
    id: 'family_' + Date.now(),
    name: name,
    type: type,
    creatorId: userId,
    createdAt: new Date().toISOString().split('T')[0],
    inviteCode: generateInviteCode(),
    members: [{
      userId: userId,
      name: userName || '我',
      avatar: '',
      role: 'admin',
      joinedAt: new Date().toISOString().split('T')[0],
      healthTags: []
    }]
  }
  saveFamilyGroup(group)
  return group
}

// 加入家庭群组
export function joinFamilyGroup(inviteCode, userName) {
  const existing = getFamilyGroup()
  if (!existing || existing.inviteCode !== inviteCode) {
    return { success: false, error: '邀请码无效' }
  }
  const userId = getCurrentUserId()
  if (existing.members.find(m => m.userId === userId)) {
    return { success: false, error: '你已经是家庭成员' }
  }
  const familyType = FAMILY_TYPES.find(t => t.value === existing.type)
  if (existing.members.length >= (familyType?.maxMembers || 8)) {
    return { success: false, error: '家庭人数已满' }
  }
  existing.members.push({
    userId: userId,
    name: userName || '新成员',
    avatar: '',
    role: 'member',
    joinedAt: new Date().toISOString().split('T')[0],
    healthTags: []
  })
  saveFamilyGroup(existing)
  return { success: true, group: existing }
}

// 离开家庭群组
export function leaveFamilyGroup() {
  const userId = getCurrentUserId()
  const group = getFamilyGroup()
  if (!group) return { success: false }
  if (group.creatorId === userId && group.members.length > 1) {
    return { success: false, error: '创建者不能离开，请先转移权限或删除家庭' }
  }
  group.members = group.members.filter(m => m.userId !== userId)
  if (group.members.length === 0) {
    uni.removeStorageSync('foodfind_family_group')
  } else {
    saveFamilyGroup(group)
  }
  return { success: true }
}

// 删除家庭群组（仅创建者）
export function deleteFamilyGroup() {
  const userId = getCurrentUserId()
  const group = getFamilyGroup()
  if (!group || group.creatorId !== userId) {
    return { success: false, error: '无权限' }
  }
  uni.removeStorageSync('foodfind_family_group')
  return { success: true }
}

// 更新成员信息
export function updateMember(userId, updates) {
  const group = getFamilyGroup()
  if (!group) return { success: false }
  const member = group.members.find(m => m.userId === userId)
  if (!member) return { success: false }
  Object.assign(member, updates)
  saveFamilyGroup(group)
  return { success: true, member }
}

// 更新当前成员健康标签
export function updateMyHealthTags(healthTags) {
  const userId = getCurrentUserId()
  return updateMember(userId, { healthTags })
}

// 获取家庭健康标签汇总
export function getFamilyHealthTags() {
  const group = getFamilyGroup()
  if (!group) return []
  const allTags = new Set()
  group.members.forEach(m => {
    (m.healthTags || []).forEach(tag => allTags.add(tag))
  })
  return Array.from(allTags)
}

// 获取家庭打卡记录
export function getFamilyCheckIns() {
  return uni.getStorageSync('foodfind_family_checkins') || {}
}

// 保存家庭打卡记录
export function saveFamilyCheckIns(checkins) {
  uni.setStorageSync('foodfind_family_checkins', checkins)
}

// 记录家庭打卡
export function recordFamilyCheckIn(date, userId, mealType) {
  const checkins = getFamilyCheckIns()
  if (!checkins[date]) checkins[date] = {}
  if (!checkins[date][userId]) {
    checkins[date][userId] = { breakfast: false, lunch: false, dinner: false }
  }
  checkins[date][userId][mealType] = true
  saveFamilyCheckIns(checkins)
}

// 获取家庭购物清单
export function getFamilyShoppingList() {
  return uni.getStorageSync('foodfind_family_shopping') || { items: [], updatedAt: '', updatedBy: '' }
}

// 保存家庭购物清单
export function saveFamilyShoppingList(list, userId) {
  uni.setStorageSync('foodfind_family_shopping', {
    ...list,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  })
}

// 根据 ID 获取健康标签
export function getHealthTagById(tagId) {
  return HEALTH_TAGS.find(t => t.id === tagId) || null
}

// 清除家庭相关数据
export function clearFamilyData() {
  uni.removeStorageSync('foodfind_family_group')
  uni.removeStorageSync('foodfind_family_checkins')
  uni.removeStorageSync('foodfind_family_shopping')
}
