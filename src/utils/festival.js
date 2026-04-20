export const FESTIVALS = [
  { month: 1, day: 1, name: '元旦', food: '新年第一餐，吃点好的！' },
  { month: 1, day: 15, name: '元宵节', food: '记得吃汤圆/元宵哦~' },
  { month: 2, day: 14, name: '情人节', food: '和TA一起吃顿浪漫的吧！' },
  { month: 3, day: 8, name: '妇女节', food: '女神节，吃点甜的~' },
  { month: 4, day: 1, name: '愚人节', food: '今天可以开个小玩笑~' },
  { month: 5, day: 1, name: '劳动节', food: '辛苦了，犒劳一下自己！' },
  { month: 5, day: 12, name: '母亲节', food: '别忘了给妈妈做顿饭~' },
  { month: 6, day: 1, name: '儿童节', food: '今天吃点童年回忆~' },
  { month: 6, day: 18, name: '父亲节', food: '给爸爸做顿好吃的！' },
  { month: 8, day: 15, name: '中秋节', food: '记得吃月饼哦~' },
  { month: 10, day: 1, name: '国庆节', food: '假期好好享受美食！' },
  { month: 12, day: 25, name: '圣诞节', food: '圣诞大餐安排起来~' }
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
