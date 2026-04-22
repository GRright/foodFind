const CLOUD_ENV = 'cloud1-d7gvzylmp17ed1957'
let _openid = ''
let _cloudReady = false
const _dirtyKeys = new Set()

export function initCloud() {
  if (_cloudReady) return
  try {
    if (typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({ env: CLOUD_ENV, traceUser: true })
      _cloudReady = true
      console.log('[Cloud] 初始化成功')
    }
  } catch (e) {
    console.warn('[Cloud] 初始化失败:', e.message)
  }
}

export async function getOpenId() {
  if (_openid) return _openid
  try {
    const cached = uni.getStorageSync('foodfind_openid')
    if (cached) { _openid = cached; return _openid }
    const res = await callFunction('login', {})
    if (res.code === 0 && res.openid) {
      _openid = res.openid
      uni.setStorageSync('foodfind_openid', _openid)
    }
  } catch (e) {
    console.warn('[Cloud] 获取openid失败:', e.message)
  }
  return _openid
}

export async function callFunction(name, data = {}) {
  if (!_cloudReady) initCloud()
  try {
    const res = await wx.cloud.callFunction({ name, data })
    return res.result
  } catch (e) {
    console.error(`[Cloud] callFunction(${name}) 失败:`, e.message)
    return { code: -1, error: e.message }
  }
}

export function markDirty(key) {
  _dirtyKeys.add(key)
}

export function markClean(key) {
  _dirtyKeys.delete(key)
}

export async function batchSyncOnHide() {
  if (_dirtyKeys.size === 0) return
  if (!_cloudReady) return

  const openid = await getOpenId()
  if (!openid) return

  const tasks = []

  if (_dirtyKeys.has('personal_checks')) {
    const data = uni.getStorageSync('foodfind_personal_checks')
    if (data) {
      tasks.push(callFunction('batchSync', {
        collection: 'personal_checks',
        data: { openid, checks: data, updatedAt: new Date().toISOString() }
      }))
    }
  }

  if (_dirtyKeys.has('daily_meals')) {
    const meals = uni.getStorageSync('foodfind_meals')
    const mealsDate = uni.getStorageSync('foodfind_meals_date')
    if (meals && mealsDate) {
      tasks.push(callFunction('batchSync', {
        collection: 'daily_meals',
        data: { openid, meals, date: mealsDate, updatedAt: new Date().toISOString() }
      }))
    }
  }

  if (_dirtyKeys.has('detailed_prefs')) {
    const prefs = uni.getStorageSync('foodfind_detailed_prefs')
    if (prefs) {
      tasks.push(callFunction('batchSync', {
        collection: 'user_prefs',
        data: { openid, prefs, updatedAt: new Date().toISOString() }
      }))
    }
  }

  if (_dirtyKeys.has('favorites')) {
    const favs = uni.getStorageSync('foodfind_favorites')
    if (favs) {
      tasks.push(callFunction('batchSync', {
        collection: 'user_favorites',
        data: { openid, favorites: favs, updatedAt: new Date().toISOString() }
      }))
    }
  }

  if (_dirtyKeys.has('special_dates')) {
    const dates = uni.getStorageSync('foodfind_special_dates')
    if (dates) {
      tasks.push(callFunction('batchSync', {
        collection: 'user_special_dates',
        data: { openid, specialDates: dates, updatedAt: new Date().toISOString() }
      }))
    }
  }

  if (_dirtyKeys.has('diary_list')) {
    const diary = uni.getStorageSync('foodfind_diary_list')
    if (diary && diary.length > 0) {
      const today = diary[0]
      tasks.push(callFunction('saveFoodDiary', {
        date: today.date,
        meals: today.meals,
        mood: today.mood,
        rating: today.rating,
        note: today.note
      }))
    }
  }

  if (_dirtyKeys.has('weekly')) {
    const weekly = uni.getStorageSync('foodfind_weekly')
    if (weekly) {
      tasks.push(callFunction('batchSync', {
        collection: 'weekly_menus',
        data: { openid, weekly, updatedAt: new Date().toISOString() }
      }))
    }
  }

  if (tasks.length > 0) {
    try {
      await Promise.allSettled(tasks)
      _dirtyKeys.clear()
      console.log(`[Cloud] 批量同步完成，${tasks.length} 项`)
    } catch (e) {
      console.warn('[Cloud] 批量同步部分失败:', e.message)
    }
  }
}

export async function syncOnStartup() {
  if (!_cloudReady) return
  const openid = await getOpenId()
  if (!openid) return

  try {
    const res = await callFunction('batchSync', {
      collection: 'personal_checks',
      data: { openid, action: 'get' }
    })
    if (res.code === 0 && res.data) {
      const local = uni.getStorageSync('foodfind_personal_checks') || {}
      const merged = { ...res.data.checks, ...local }
      uni.setStorageSync('foodfind_personal_checks', merged)
    }
  } catch (e) {
    console.warn('[Cloud] 启动同步失败:', e.message)
  }
}
