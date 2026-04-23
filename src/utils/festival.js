export const FESTIVALS = [
  { month: 1, day: 1, name: '元旦', food: '新年第一餐，吃点好的！', icon: '🎉' },
  { month: 1, day: 15, name: '元宵节', food: '记得吃汤圆/元宵哦~', icon: '🏮' },
  { month: 2, day: 14, name: '情人节', food: '和TA一起吃顿浪漫的吧！', icon: '💕' },
  { month: 3, day: 8, name: '妇女节', food: '女神节，吃点甜的~', icon: '💐' },
  { month: 4, day: 1, name: '愚人节', food: '今天可以开个小玩笑~', icon: '🤪' },
  { month: 5, day: 1, name: '劳动节', food: '辛苦了，犒劳一下自己！', icon: '💪' },
  { month: 5, day: 12, name: '母亲节', food: '别忘了给妈妈做顿饭~', icon: '👩' },
  { month: 6, day: 1, name: '儿童节', food: '今天吃点童年回忆~', icon: '🎈' },
  { month: 6, day: 18, name: '父亲节', food: '给爸爸做顿好吃的！', icon: '👨' },
  { month: 8, day: 15, name: '中秋节', food: '记得吃月饼哦~', icon: '🥮' },
  { month: 10, day: 1, name: '国庆节', food: '假期好好享受美食！', icon: '🇨🇳' },
  { month: 12, day: 25, name: '圣诞节', food: '圣诞大餐安排起来~', icon: '🎄' }
]

export function getTodayFestival() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  return FESTIVALS.find(f => f.month === month && f.day === day)
}

export function getUpcomingFestival() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const upcoming = FESTIVALS.filter(f => {
    if (f.month > month) return true
    if (f.month === month && f.day > day) return true
    return false
  }).sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month
    return a.day - b.day
  })
  return upcoming[0] || null
}

export function checkFestivalReminder() {
  const today = getTodayFestival()
  if (today) {
    const lastShown = uni.getStorageSync('foodfind_festival_shown')
    const todayStr = `${new Date().getFullYear()}-${today.month}-${today.day}`
    if (lastShown !== todayStr) {
      uni.setStorageSync('foodfind_festival_shown', todayStr)
      return today
    }
  }
  return null
}

export function getSpecialDates() {
  return uni.getStorageSync('foodfind_special_dates') || []
}

export function saveSpecialDates(dates) {
  uni.setStorageSync('foodfind_special_dates', dates)
}

export function addSpecialDate(date) {
  const dates = getSpecialDates()
  const id = 'sd_' + Date.now()
  dates.push({ id, ...date })
  saveSpecialDates(dates)
  return id
}

export function removeSpecialDate(id) {
  const dates = getSpecialDates().filter(d => d.id !== id)
  saveSpecialDates(dates)
}

export function checkSpecialDateToday() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const dates = getSpecialDates()
  return dates.find(d => d.month === month && d.day === day)
}

export function getUpcomingSpecialDates(withinDays = 7) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  const dates = getSpecialDates()
  return dates.filter(d => {
    let diff = 0
    if (d.month > currentMonth || (d.month === currentMonth && d.day > currentDay)) {
      if (d.month === currentMonth) diff = d.day - currentDay
      else {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        diff = (daysInMonth - currentDay) + d.day
        if (d.month > currentMonth + 1) diff += 30
      }
    }
    return diff > 0 && diff <= withinDays
  }).sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month
    return a.day - b.day
  })
}

export function getBirthdayMenuRecommendation() {
  const special = checkSpecialDateToday()
  const festival = getTodayFestival()
  const event = special || festival
  if (!event) return null
  const isBirthday = event.type === 'birthday'
  const isAnniversary = event.type === 'anniversary'
  return {
    title: isBirthday ? '🎂 生日快乐！' : isAnniversary ? '💝 纪念日快乐！' : `${event.icon || '🎉'} ${event.name}`,
    subtitle: isBirthday
      ? '今天你是主角，来顿生日大餐吧！'
      : isAnniversary
        ? '一起吃顿好的庆祝一下吧！'
        : event.food || '今天是个特别的日子！',
    emoji: isBirthday ? '🎂' : isAnniversary ? '💝' : (event.icon || '🎉'),
    name: event.name || (isBirthday ? '生日' : '纪念日')
  }
}

export function getFamilyMemberSpecialToday() {
  const group = uni.getStorageSync('foodfind_family_group')
  if (!group || !group.members) return null
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const myId = uni.getStorageSync('foodfind_user_id') || ''
  for (const member of group.members) {
    if (member.userId === myId) continue
    if (member.specialDates && member.specialDates.length > 0) {
      const found = member.specialDates.find(d => d.month === month && d.day === day)
      if (found) {
        return {
          memberName: member.name,
          eventType: found.type,
          eventName: found.name,
          emoji: found.type === 'birthday' ? '🎂' : '💝'
        }
      }
    }
  }
  return null
}

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export const SEASONAL_FOODS = {
  spring: {
    name: '春季',
    keywords: ['春笋', '菠菜', '韭菜', '荠菜', '豌豆', '香椿', '莴笋', '草莓'],
    tags: ['清淡', '养肝', '新鲜'],
    avoid: ['火锅', '啤酒']
  },
  summer: {
    name: '夏季',
    keywords: ['黄瓜', '番茄', '丝瓜', '冬瓜', '苦瓜', '西瓜', '绿豆', '凉面'],
    tags: ['清淡', '消暑', '凉拌'],
    avoid: ['红烧肉', '啤酒鸭']
  },
  autumn: {
    name: '秋季',
    keywords: ['南瓜', '莲藕', '山药', '板栗', '柿子', '螃蟹', '银耳', '百合'],
    tags: ['润燥', '滋补', '养肺'],
    avoid: []
  },
  winter: {
    name: '冬季',
    keywords: ['萝卜', '白菜', '羊肉', '牛肉', '红薯', '火锅', '饺子', '汤圆'],
    tags: ['暖胃', '滋补', '炖煮'],
    avoid: ['凉拌']
  }
}

export function filterRecipesBySeason(recipes) {
  const season = getCurrentSeason()
  const seasonData = SEASONAL_FOODS[season]
  if (!seasonData) return recipes

  return recipes.map(recipe => {
    let score = 0
    const name = recipe.name || ''
    const ingredients = (recipe.ingredients || []).map(i => i.name).join(',')
    const tags = recipe.tags || []
    const text = name + ingredients

    seasonData.keywords.forEach(kw => {
      if (text.includes(kw)) score += 3
    })
    seasonData.tags.forEach(tag => {
      if (tags.includes(tag)) score += 2
    })
    seasonData.avoid.forEach(avoid => {
      if (name.includes(avoid)) score -= 2
    })

    return { ...recipe, _seasonScore: score }
  }).sort((a, b) => b._seasonScore - a._seasonScore)
}

export function filterRecipesByPreference(recipes) {
  const favorites = uni.getStorageSync('foodfind_favorites') || []
  const dislikes = uni.getStorageSync('foodfind_dislikes') || []
  const likedIds = new Set(favorites.map(f => f.id))
  const dislikedIds = new Set(dislikes.map(d => d.id))

  const likedCuisineTypes = {}
  const likedTags = {}
  favorites.forEach(f => {
    if (f.cuisine_type) likedCuisineTypes[f.cuisine_type] = (likedCuisineTypes[f.cuisine_type] || 0) + 1
    if (f.tags) f.tags.forEach(t => { likedTags[t] = (likedTags[t] || 0) + 1 })
  })

  const dislikedNames = new Set()
  dislikes.forEach(d => {
    if (d.name) dislikedNames.add(d.name)
  })

  return recipes.map(recipe => {
    if (dislikedIds.has(recipe.id) || dislikedNames.has(recipe.name)) {
      return { ...recipe, _prefScore: -100 }
    }
    if (likedIds.has(recipe.id)) {
      return { ...recipe, _prefScore: 10 }
    }

    let score = 0
    if (recipe.cuisine_type && likedCuisineTypes[recipe.cuisine_type]) {
      score += likedCuisineTypes[recipe.cuisine_type] * 2
    }
    if (recipe.tags) {
      recipe.tags.forEach(t => {
        if (likedTags[t]) score += likedTags[t]
      })
    }
    return { ...recipe, _prefScore: score }
  }).sort((a, b) => b._prefScore - a._prefScore)
}

export function getPersonalizedRecipes(recipes) {
  const withPref = filterRecipesByPreference(recipes)
  const withSeason = filterRecipesBySeason(withPref)
  return withSeason.map(r => {
    const { _prefScore, _seasonScore, ...clean } = r
    return clean
  })
}
