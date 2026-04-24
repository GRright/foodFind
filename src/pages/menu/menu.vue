<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <!-- 骨架屏 -->
    <view class="skeleton-container" v-if="isLoading">
      <view class="skeleton-header">
        <view class="skeleton-line skeleton-line-short"></view>
        <view class="skeleton-line skeleton-line-shorter"></view>
      </view>
      <view class="skeleton-calendar">
        <view class="skeleton-cal-nav">
          <view class="skeleton-line skeleton-line-nav"></view>
        </view>
        <view class="skeleton-week">
          <view class="skeleton-day-cell" v-for="i in 7" :key="i">
            <view class="skeleton-dot"></view>
            <view class="skeleton-line skeleton-line-day"></view>
          </view>
        </view>
      </view>
      <view class="skeleton-action">
        <view class="skeleton-btn"></view>
      </view>
      <view class="skeleton-meals" v-for="i in 3" :key="i">
        <view class="skeleton-meal-header">
          <view class="skeleton-line skeleton-line-short"></view>
        </view>
        <view class="skeleton-food-row">
          <view class="skeleton-food-card" v-for="j in 3" :key="j">
            <view class="skeleton-food-icon"></view>
            <view class="skeleton-line skeleton-line-card"></view>
          </view>
        </view>
      </view>
    </view>

    <view class="header fade-in" v-if="!isLoading">
      <text class="header-title">一周菜谱</text>
      <text class="header-sub">点击日期查看 · 智能荤素搭配</text>
    </view>

    <view class="spark-banner pop-in" v-if="!isLoading && pairStats && pairStats.consecutiveShareDays > 0" style="animation-delay:0.1s;opacity:0">
      <view class="spark-icon-wrap"><text class="spark-emoji">🔥</text></view>
      <view class="spark-info">
        <text class="spark-main">{{ pairStats.consecutiveShareDays }}天连续互动</text>
        <text class="spark-sub">分享{{ pairStats.totalShareDays }}天 · 打开{{ pairStats.totalOpenDays }}次</text>
      </view>
      <view class="spark-badge" v-if="pairStats.consecutiveShareDays >= 7"><text class="badge-txt">💎</text></view>
    </view>

    <view class="calendar-wrap slide-up" style="animation-delay:0.08s" v-if="!isLoading">
      <view class="cal-nav">
        <view class="nav-btn" @click="prevWeek"><text class="nav-arrow">◀</text><text class="nav-txt">上一周</text></view>
        <view class="cal-center">
          <text class="cal-month">{{ calMonth }}</text>
          <text class="back-today" v-if="!isThisWeek" @click="backToThisWeek">回本周</text>
        </view>
        <view class="nav-btn" @click="nextWeek"><text class="nav-txt">下一周</text><text class="nav-arrow">▶</text></view>
      </view>

      <view class="week-row">
        <view
          class="day-cell"
          :class="{ active: d.isActive, 'is-today': d.isToday, 'has-data': d.hasData, 'has-spark': d.sparkLevel > 0 }"
          v-for="(d, di) in weekDays"
          :key="di"
          @click="selectDay(d)"
        >
          <text class="day-week">{{ d.weekName }}</text>
          <text class="day-num">{{ d.day }}</text>
          <view class="spark-icon" v-if="d.sparkLevel === 1"><text class="si-txt">🔥</text></view>
          <view class="spark-icon double" v-else-if="d.sparkLevel >= 2"><text class="si-txt">🔥🔥</text></view>
          <view class="dot-row" v-if="d.hasData && d.sparkLevel === 0">
            <view class="nutri-dot" :class="{ 'checked': d.checkInStatus.breakfast, 'unchecked': !d.checkInStatus.breakfast }"></view>
            <view class="nutri-dot" :class="{ 'checked': d.checkInStatus.lunch, 'unchecked': !d.checkInStatus.lunch }"></view>
            <view class="nutri-dot" :class="{ 'checked': d.checkInStatus.dinner, 'unchecked': !d.checkInStatus.dinner }"></view>
          </view>
        </view>
      </view>
    </view>

    <view class="action-bar pop-in" style="animation-delay:0.15s" v-if="!isLoading">
      <view class="gen-btn" @click="generateWeekPlan">
        <text class="gen-icon">✦</text>
        <text class="gen-text">{{ genBtnText }}</text>
      </view>
      <text class="gen-hint" v-if="weeklyData && weeklyData[selectedDateStr]">{{ genHintPrefix }} · {{ weekNutriSummary }}</text>
    </view>

    <scroll-view scroll-y class="meal-scroll" :style="{ height: scrollHeight }" v-if="!isLoading">
      <view v-if="selectedDayMeals" class="day-meals">
        <view class="day-label bounce-in">
          <text class="dl-date">{{ selectedDayLabel }}</text>
          <text class="dl-cal">{{ selectedDayCal }} kcal</text>
        </view>

        <view
          class="meal-section"
          v-for="(meal, mi) in mealSections"
          :key="mi"
          :style="{ animationDelay: (mi * 120) + 'ms' }"
          style="animation: slideUp .45s ease forwards; opacity: 0;"
        >
          <view class="meal-header">
            <view class="mh-left">
              <image class="mh-icon" :src="meal.icon" mode="aspectFit"></image>
              <text class="mh-title">{{ meal.title }}</text>
            </view>
            <text class="mh-cal">{{ meal.cal }} kcal</text>
          </view>
          <view class="food-row">
            <view
              class="food-card"
              v-for="(food, fi) in meal.recipes"
              :key="food.id"
              @click="viewRecipe(food)"
              :style="{ animationDelay: (180 + mi*60 + fi*50) + 'ms' }"
              style="animation: popIn .4s cubic-bezier(.175,.885,.32,1.275) forwards; opacity: 0;"
            >
              <view class="fc-icon-wrap"><text class="fc-icon">{{ food.image || '🍽️' }}</text></view>
              <text class="fc-name">{{ food.name }}</text>
              <text class="fc-kcal">{{ food.nutrition.calories * effectiveUserCount }} kcal</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state scale-in">
        <text class="empty-icon">📅</text>
        <text class="empty-title">该日暂无菜谱</text>
        <text class="empty-hint">{{ emptyHintText }}</text>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'
import { filterRecipesByHealthTags, getFamilyHealthTags } from '@/utils/family.js'
import { getPersonalizedRecipes } from '@/utils/festival.js'

export default {
  data() {
    return {
      userCount: 2,
      scrollHeight: 'calc(100vh - 580rpx)',
      currentMonday: null,
      selectedDate: null,
      weeklyData: {},
      sparkData: [],
      pairStats: null,
      pageEnter: true,
      todayHomeMeals: null,
      isLoading: true
    }
  },
  computed: {
    effectiveUserCount() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      return prefs.independentMode ? 1 : this.userCount
    },
    calMonth() {
      if (!this.currentMonday) return ''
      const m = this.currentMonday.getMonth() + 1
      const y = this.currentMonday.getFullYear()
      return `${y}年${m}月`
    },
    isThisWeek() {
      if (!this.currentMonday) return true
      const now = new Date()
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day
      const thisMonday = new Date(now)
      thisMonday.setDate(now.getDate() + diff)
      thisMonday.setHours(0,0,0,0)
      return this.currentMonday.getTime() === thisMonday.getTime()
    },
    weekHasData() {
      if (!this.currentMonday || !this.weeklyData) return false
      for (let i = 0; i < 7; i++) {
        const d = new Date(this.currentMonday)
        d.setDate(d.getDate() + i)
        const ds = this.dateToStr(d)
        if (this.weeklyData[ds]) return true
      }
      return false
    },
    genBtnText() {
      return this.weekHasData ? '刷新本周菜谱' : '生成本周菜谱'
    },
    genHintPrefix() {
      return this.weekHasData ? '已刷新' : '已生成'
    },
    emptyHintText() {
      return this.weekHasData ? '点击上方「刷新本周菜谱」重新规划' : '点击上方「生成本周菜谱」一键规划'
    },
    weekDays() {
      if (!this.currentMonday) return []
      const days = []
      const today = new Date()
      today.setHours(0,0,0,0)
      const weekNames = ['一','二','三','四','五','六','日']
      const checks = uni.getStorageSync('foodfind_personal_checks') || {}
      for (let i = 0; i < 7; i++) {
        const d = new Date(this.currentMonday)
        d.setDate(d.getDate() + i)
        const ds = this.dateToStr(d)

        const sparkRecord = this.sparkData.find(s => s.date === ds)
        const sparkLevel = sparkRecord ? sparkRecord.sparkLevel : 0
        const dayChecks = checks[ds] || {}

        days.push({
          date: d,
          day: d.getDate(),
          weekName: weekNames[i],
          isToday: d.getTime() === today.getTime(),
          isActive: this.selectedDate ? ds === this.dateToStr(this.selectedDate) : false,
          hasData: !!this.weeklyData[ds],
          dateStr: ds,
          sparkLevel,
          checkInStatus: {
            breakfast: !!dayChecks.breakfast,
            lunch: !!dayChecks.lunch,
            dinner: !!dayChecks.dinner
          }
        })
      }
      return days
    },
    selectedDateStr() { return this.selectedDate ? this.dateToStr(this.selectedDate) : '' },
    selectedDayMeals() {
      if (!this.selectedDateStr) return null
      if (this.weeklyData[this.selectedDateStr]) return this.weeklyData[this.selectedDateStr]
      const todayStr = this.getTodayStr()
      if (this.selectedDateStr === todayStr && this.todayHomeMeals) {
        return this.todayHomeMeals
      }
      return null
    },
    selectedDayLabel() {
      if (!this.selectedDate) return ''
      const w = ['周日','周一','周二','周三','周四','周五','周六'][this.selectedDate.getDay()]
      return `${this.selectedDate.getMonth()+1}月${this.selectedDate.getDate()}日 ${w}`
    },
    mealSections() {
      if (!this.selectedDayMeals) return []
      const isWeekend = this.selectedDate && (this.selectedDate.getDay() === 0 || this.selectedDate.getDay() === 6)
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      const mealConfig = prefs.mealConfig || { weekday: ['breakfast', 'lunch', 'dinner'], weekend: ['breakfast', 'lunch', 'dinner'] }
      const activeMeals = isWeekend ? mealConfig.weekend : mealConfig.weekday
      const sections = [
        { key: 'breakfast', title: '早餐', icon: '/static/icons/breakfast.png', recipes: this.selectedDayMeals.breakfast || [] },
        { key: 'lunch', title: '午餐', icon: '/static/icons/lunch.png', recipes: this.selectedDayMeals.lunch || [] },
        { key: 'dinner', title: '晚餐', icon: '/static/icons/dinner.png', recipes: this.selectedDayMeals.dinner || [] }
      ].filter(s => activeMeals.includes(s.key))
      return sections.map(m => ({
        ...m,
        cal: m.recipes.reduce((s, r) => s + (r.nutrition?.calories||0) * this.effectiveUserCount, 0)
      }))
    },
    selectedDayCal() {
      if (!this.selectedDayMeals) return 0
      const isWeekend = this.selectedDate && (this.selectedDate.getDay() === 0 || this.selectedDate.getDay() === 6)
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      const mealConfig = prefs.mealConfig || { weekday: ['breakfast', 'lunch', 'dinner'], weekend: ['breakfast', 'lunch', 'dinner'] }
      const activeMeals = isWeekend ? mealConfig.weekend : mealConfig.weekday
      let c = 0
      activeMeals.forEach(k => {
        (this.selectedDayMeals[k]||[]).forEach(r => { c += (r.nutrition?.calories||0) * this.effectiveUserCount })
      })
      return Math.round(c)
    },
    weekNutriSummary() {
      let totalC = 0, totalP = 0, totalF = 0, totalCb = 0, days = 0
      Object.keys(this.weeklyData).forEach(ds => {
        const meals = this.weeklyData[ds]
        if (!meals) return
        days++
        ;['breakfast','lunch','dinner'].forEach(k => {
          (meals[k]||[]).forEach(r => {
            totalC += r.nutrition?.calories||0
            totalP += r.nutrition?.protein||0
            totalF += r.nutrition?.fat||0
            totalCb += r.nutrition?.carbs||0
          })
        })
      })
      if (days === 0) return ''
      return `日均${Math.round(totalC/days*this.effectiveUserCount)}kcal · 蛋白${Math.round(totalP/days)}g`
    }
  },
  onLoad() {
    this.initCalendar()
    this.loadWeeklyCache()
    this.loadUserPrefs()
    setTimeout(() => { this.isLoading = false }, 500)
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
    this.todayHomeMeals = uni.getStorageSync('foodfind_meals') || null
    if (this.currentMonday) {
      const cached = uni.getStorageSync('foodfind_weekly')
      if (cached) this.weeklyData = cached
    }
  },
  methods: {
    getTodayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },
    goToShoppingList() {
      uni.navigateTo({ url: '/pages/shoppingList/shoppingList' })
    },
    loadUserPrefs() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs')
      if (prefs && prefs.userCount) this.userCount = prefs.userCount
      else {
        const uc = uni.getStorageSync('foodfind_user_count')
        if (uc) this.userCount = uc
      }
    },
    initCalendar() {
      const now = new Date()
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day
      this.currentMonday = new Date(now)
      this.currentMonday.setDate(now.getDate() + diff)
      this.currentMonday.setHours(0,0,0,0)
      this.selectedDate = new Date(now)
      this.selectedDate.setHours(0,0,0,0)
    },
    dateToStr(d) {
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },
    prevWeek() {
      const d = new Date(this.currentMonday)
      d.setDate(d.getDate() - 7)
      this.currentMonday = d
      // 切换到上一周后，如果是当前周则选中今天，否则选中周一
      const now = new Date()
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day
      const thisMonday = new Date(now)
      thisMonday.setDate(now.getDate() + diff)
      thisMonday.setHours(0, 0, 0, 0)
      if (d.getTime() === thisMonday.getTime()) {
        now.setHours(0, 0, 0, 0)
        this.selectedDate = now
      } else {
        this.selectedDate = new Date(d)
      }
    },
    nextWeek() {
      const d = new Date(this.currentMonday)
      d.setDate(d.getDate() + 7)
      this.currentMonday = d
      // 切换到下一周后，如果是当前周则选中今天，否则选中周一
      const now = new Date()
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day
      const thisMonday = new Date(now)
      thisMonday.setDate(now.getDate() + diff)
      thisMonday.setHours(0, 0, 0, 0)
      if (d.getTime() === thisMonday.getTime()) {
        now.setHours(0, 0, 0, 0)
        this.selectedDate = now
      } else {
        this.selectedDate = new Date(d)
      }
    },
    backToThisWeek() {
      const now = new Date()
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day
      this.currentMonday = new Date(now)
      this.currentMonday.setDate(now.getDate() + diff)
      this.currentMonday.setHours(0,0,0,0)
      // 回到本周时，自动选中今天
      this.selectedDate = new Date(now)
      this.selectedDate.setHours(0,0,0,0)
    },
    selectDay(d) {
      this.selectedDate = new Date(d.date)
    },
    loadWeeklyCache() {
      const cached = uni.getStorageSync('foodfind_weekly')
      if (cached) this.weeklyData = cached
    },
    loadSparkData() {
      return
    },
    loadPairStats() {
      return
    },
    getRecipeCount() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      if (prefs.independentMode) return 2
      const c = this.userCount
      if (c === 1) return 2
      if (c === 2) return 3
      if (c <= 4) return 4
      return 5
    },
    shuffle(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n) },
    balanced(recipes, n) {
      const meat = recipes.filter(r => r.type === 'meat' || r.type === 'mixed')
      const veg = recipes.filter(r => r.type === 'vegetarian')
      const mc = Math.ceil(n * 0.55), vc = n - mc
      return [...this.shuffle(meat, mc), ...this.shuffle(veg, vc)].sort(() => Math.random() - 0.5)
    },
    nutritionBalanced(dayIndex, allDaysMeals, cachedPrefs) {
      const usedRecipes = new Set()
      allDaysMeals.forEach(dm => {
        ;['breakfast','lunch','dinner'].forEach(k => { (dm[k]||[]).forEach(r => usedRecipes.add(r.id)) })
      })

      const familyTags = getFamilyHealthTags()
      const userPrefs = cachedPrefs || {}
      const allHealthTags = [...new Set([...familyTags, ...(userPrefs.healthTags || [])])]

      let availableBreakfast = ALL_RECIPES.breakfast.filter(r => !usedRecipes.has(r.id))
      let availableLunch = ALL_RECIPES.lunch.filter(r => !usedRecipes.has(r.id))
      let availableDinner = ALL_RECIPES.dinner.filter(r => !usedRecipes.has(r.id))

      availableBreakfast = filterRecipesByHealthTags(availableBreakfast, allHealthTags)
      availableLunch = filterRecipesByHealthTags(availableLunch, allHealthTags)
      availableDinner = filterRecipesByHealthTags(availableDinner, allHealthTags)

      availableBreakfast = getPersonalizedRecipes(availableBreakfast)
      availableLunch = getPersonalizedRecipes(availableLunch)
      availableDinner = getPersonalizedRecipes(availableDinner)

      const n = this.getRecipeCount()

      let breakfast = availableBreakfast.length >= n ? this.shuffle(availableBreakfast, n) : this.shuffle(ALL_RECIPES.breakfast, n)
      let lunch = availableLunch.length >= n ? this.balanced(availableLunch, n) : this.balanced(ALL_RECIPES.lunch, n)
      let dinner = availableDinner.length >= n ? this.balanced(availableDinner, n) : this.balanced(ALL_RECIPES.dinner, n)

      if (dayIndex % 2 === 1) { [lunch, dinner] = [dinner, lunch] }

      return { breakfast, lunch, dinner }
    },
    generateWeekPlan() {
      uni.showLoading({ title: '智能生成中...' })
      setTimeout(() => {
        const data = {}
        const allDaysMeals = []
        const cachedPrefs = uni.getStorageSync('foodfind_detailed_prefs') || {}

        for (let i = 0; i < 7; i++) {
          const d = new Date(this.currentMonday)
          d.setDate(d.getDate() + i)
          const ds = this.dateToStr(d)

          const meals = this.nutritionBalanced(i, allDaysMeals, cachedPrefs)
          data[ds] = meals
          allDaysMeals.push(meals)
        }

        this.weeklyData = data
        uni.setStorageSync('foodfind_weekly', data)

        const app = getApp()
        if (app?.globalData) app.globalData.weeklyMeals = data

        if (data[this.selectedDateStr]) {
          const dm = data[this.selectedDateStr]
          uni.setStorageSync('foodfind_meals', dm)
          uni.setStorageSync('foodfind_meals_date', this.selectedDateStr)
          if (app?.globalData) app.globalData.dailyMeals = dm
        }

        uni.hideLoading()
        uni.showToast({ title: '本周菜谱已生成', icon: 'success' })
      }, 800)
    },
    viewRecipe(r) {
      uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${r.id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F6FA; padding:0 28rpx; }

/* ===== Skeleton Screen ===== */
.skeleton-container { padding:56rpx 0 24rpx; }
.skeleton-header { margin-bottom:32rpx; }
.skeleton-calendar { background:#e8e8e8; border-radius:20rpx; padding:24rpx; margin-bottom:24rpx; }
.skeleton-cal-nav { display:flex; justify-content:center; margin-bottom:24rpx; }
.skeleton-week { display:flex; justify-content:space-between; }
.skeleton-day-cell { display:flex; flex-direction:column; align-items:center; gap:12rpx; }
.skeleton-dot { width:48rpx; height:48rpx; background:#d0d0d0; border-radius:50%; }
.skeleton-action { display:flex; justify-content:center; margin-bottom:32rpx; }
.skeleton-btn { width:280rpx; height:76rpx; background:#e0e0e0; border-radius:38rpx; }
.skeleton-meals { margin-bottom:32rpx; }
.skeleton-meal-header { margin-bottom:16rpx; }
.skeleton-food-row { display:flex; gap:16rpx; }
.skeleton-food-card {
  flex:1; height:220rpx; background:#e8e8e8; border-radius:20rpx;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16rpx;
  padding:20rpx;
}
.skeleton-food-icon { width:80rpx; height:80rpx; background:#d0d0d0; border-radius:50%; }
.skeleton-line { background:#e0e0e0; border-radius:8rpx; height:24rpx; animation: skeletonPulse 1.5s ease-in-out infinite; }
.skeleton-line-short { width:140rpx; margin-bottom:12rpx; }
.skeleton-line-shorter { width:100rpx; }
.skeleton-line-nav { width:200rpx; }
.skeleton-line-day { width:40rpx; height:20rpx; }
.skeleton-line-card { width:80%; height:20rpx; }
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== Header ===== */
.header {
  padding:56rpx 0 24rpx;
  display:flex; flex-direction:column; gap:6rpx;
}
.header-title { font-size:44rpx; font-weight:800; color:#1a1a1a; letter-spacing:-1rpx; }
.header-sub { font-size:24rpx; color:#999; font-weight:400; }

/* ===== Spark Banner ===== */
.spark-banner {
  display:flex; align-items:center; gap:16rpx;
  background:#fff;
  padding:20rpx 24rpx; border-radius:20rpx;
  margin:0 0 16rpx;
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04);
}
.spark-icon-wrap {
  width:64rpx; height:64rpx; background:#e8f7ef;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
}
.spark-emoji { font-size:32rpx; }
.spark-info { flex:1; display:flex; flex-direction:column; gap:4rpx; }
.spark-main { font-size:28rpx; font-weight:700; color:#1a1a1a; }
.spark-sub { font-size:22rpx; color:#999; }
.spark-badge {
  width:56rpx; height:56rpx; background:#07c160;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  animation: glowPulse 2s ease-in-out infinite;
}
.badge-txt { font-size:28rpx; }

/* ===== Calendar ===== */
.calendar-wrap {
  background:#fff; border-radius:24rpx;
  padding:24rpx 16rpx 20rpx;
  box-shadow:0 1rpx 12rpx rgba(0,0,0,.04);
  margin-bottom:16rpx;
}

.cal-nav {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:20rpx;
}
.nav-btn {
  display:flex; align-items:center; gap:8rpx;
  padding:10rpx 18rpx;
  border-radius:12rpx;
  transition:background .2s;
  &:active { background:#f5f5f5; }
}
.nav-arrow { font-size:22rpx; color:#999; }
.nav-txt { font-size:24rpx; color:#666; }
.cal-month { font-size:30rpx; font-weight:700; color:#1a1a1a; }

.week-row { display:flex; justify-content:space-between; }

.day-cell {
  width:90rpx; display:flex; flex-direction:column; align-items:center;
  padding:14rpx 0 10rpx; border-radius:16rpx;
  transition:all .25s ease; position:relative;
  &:active { transform:scale(.95); }
  &.active { background:#e8f7ef; }
  &.has-spark { background:#e8f7ef; }
  &.is-today {
    .day-num {
      color:#07c160; font-weight:800;
      text-decoration: underline;
      text-decoration-color: rgba(7,193,96,.4);
      text-underline-offset: 6rpx;
    }
  }
}
.day-week { font-size:21rpx; color:#999; margin-bottom:6rpx; }
.day-num { font-size:32rpx; font-weight:700; color:#333; line-height:1.2; }
.active.is-today .day-num {
  color:#07c160;
  background:#e8f7ef;
  width:48rpx; height:48rpx; line-height:48rpx;
  text-align:center; border-radius:14rpx;
  text-decoration:none;
}

.dot-row { display:flex; gap:6rpx; margin-top:8rpx; }
.nutri-dot { width:10rpx; height:10rpx; border-radius:50%; transition:all .3s ease; }
.nutri-dot.checked { background:#07c160; }
.nutri-dot.unchecked { background:#ddd; }

.spark-icon {
  position:absolute; bottom:4rpx;
  display:flex; align-items:center; justify-content:center;
  animation: shimmer 1.5s ease-in-out infinite;
  &.double { bottom:2rpx; }
}
.si-txt { font-size:16rpx; }

/* ===== Action Bar ===== */
.action-bar {
  display:flex; align-items:center; justify-content:space-between;
  padding:16rpx 8rpx; margin-bottom:12rpx;
}
.gen-btn {
  display:flex; align-items:center; gap:10rpx;
  padding:18rpx 36rpx;
  background:#07c160;
  border-radius:48rpx;
  transition:all .25s ease;
  box-shadow:0 2rpx 12rpx rgba(7,193,96,.2);
  &:active { opacity:.85; transform:scale(.97); }
}
.gen-icon { font-size:28rpx; color:#fff; }
.gen-text { font-size:27rpx; font-weight:600; color:#fff; }
.gen-hint { font-size:23rpx; color:#999; font-weight:500; }

/* ===== Meal List ===== */
.meal-scroll { }

.day-meals { }
.day-label {
  display:flex; justify-content:space-between; align-items:center;
  padding:24rpx 8rpx 18rpx;
}
.dl-date { font-size:30rpx; font-weight:700; color:#1a1a1a; }
.dl-cal { font-size:26rpx; color:#999; font-weight:600; }

.meal-section {
  background:#fff; border-radius:24rpx;
  box-shadow:0 1rpx 12rpx rgba(0,0,0,.04);
  margin-bottom:20rpx; overflow:hidden;
}

.meal-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:24rpx 28rpx 16rpx;
}
.mh-left { display:flex; align-items:center; gap:12rpx; }
.mh-icon { width:40rpx; height:40rpx; }
.mh-title { font-size:26rpx; font-weight:700; color:#1a1a1a; }
.mh-cal { font-size:24rpx; color:#999; font-weight:600; }

.food-row {
  display:flex; flex-wrap:wrap;
  padding:0 16rpx 24rpx; gap:12rpx;
}

.food-card {
  width:calc(20% - 9.6rpx); min-width:0;
  background:#F5F6FA; border-radius:20rpx;
  padding:18rpx 8rpx 14rpx; display:flex; flex-direction:column; align-items:center;
  box-sizing:border-box; transition: all .25s ease;
  &:active { background:#e8e9eb; transform:scale(.92); }
}
.fc-icon-wrap {
  width:64rpx; height:64rpx; background:#fff; border-radius:18rpx;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:8rpx; box-shadow:0 1rpx 6rpx rgba(0,0,0,.06);
  transition: transform .25s ease;
}
.food-card:active .fc-icon-wrap { transform: scale(0.9); }
.fc-icon { font-size:32rpx; }
.fc-name {
  font-size:20rpx; font-weight:500; color:#333;
  text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  max-width:100%; line-height:1.3;
}
.fc-kcal { font-size:18rpx; color:#999; font-weight:600; margin-top:6rpx; }

.empty-state {
  display:flex; flex-direction:column; align-items:center;
  padding:120rpx 40rpx;
}
.empty-icon { font-size:80rpx; margin-bottom:24rpx; }
.empty-title { font-size:30rpx; font-weight:600; color:#333; margin-bottom:12rpx; }
.empty-hint { font-size:24rpx; color:#bbb; text-align:center; }

.bottom-spacer { height:60rpx; }
</style>