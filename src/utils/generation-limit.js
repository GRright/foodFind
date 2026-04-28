// 每日菜单生成次数限制工具

const MAX_DAILY_GENERATIONS = 3
const STORAGE_KEY_PREFIX = 'foodfind_gen_count_'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getTodayCount() {
  const key = STORAGE_KEY_PREFIX + getTodayKey()
  return parseInt(uni.getStorageSync(key) || '0', 10)
}

function setTodayCount(count) {
  const key = STORAGE_KEY_PREFIX + getTodayKey()
  uni.setStorageSync(key, count.toString())
}

function incrementCount() {
  const count = getTodayCount() + 1
  setTodayCount(count)
  return count
}

function canGenerate() {
  return getTodayCount() < MAX_DAILY_GENERATIONS
}

function getRemainingCount() {
  return Math.max(0, MAX_DAILY_GENERATIONS - getTodayCount())
}

function resetTodayCount() {
  setTodayCount(0)
}

function checkAndIncrement() {
  if (!canGenerate()) {
    uni.showToast({
      title: `今日已生成${MAX_DAILY_GENERATIONS}次，明天再来吧~`,
      icon: 'none',
      duration: 2000
    })
    return false
  }
  incrementCount()
  return true
}

export {
  MAX_DAILY_GENERATIONS,
  getTodayCount,
  setTodayCount,
  incrementCount,
  canGenerate,
  getRemainingCount,
  resetTodayCount,
  checkAndIncrement
}
