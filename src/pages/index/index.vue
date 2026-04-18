<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <!-- ===== 做饭模式（默认）===== -->
    <template v-if="!noCookMode">
      <view class="header fade-in">
        <view class="header-top">
          <text class="greeting">{{ greetingText }}</text>
          <view class="share-btn" open-type="share">
            <text class="sb-icon">♡</text>
            <text class="sb-text">分享</text>
          </view>
        </view>

        <view class="calorie-bar" v-if="totalCalories > 0">
          <view class="cb-left">
            <text class="cb-label">今日推荐</text>
            <text class="cb-value">{{ totalCalories }} kcal</text>
          </view>
          <view class="cb-right">
            <text class="cb-item">蛋白质 {{ totalProtein }}g</text>
            <text class="cb-dot">·</text>
            <text class="cb-item">脂肪 {{ totalFat }}g</text>
            <text class="cb-dot">·</text>
            <text class="cb-item">碳水 {{ totalCarbs }}g</text>
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="meal-scroll" :style="{ height: scrollHeight }" @scrolltolower="loadMore">
        <view
          class="meal-section"
          v-for="(section, si) in mealSections"
          :key="si"
          style="animation: slideUp .45s ease forwards; animation-delay: calc(0.08s * si); opacity: 0;"
        >
          <view class="meal-header">
            <view class="mh-left">
              <text class="mh-icon">{{ section.icon }}</text>
              <text class="mh-title">{{ section.title }}</text>
            </view>
            <view class="mh-right">
              <view
                class="eaten-btn"
                :class="{ eaten: mealCheckIn[section.key] }"
                @click.stop="markMealEaten(section.key)"
              >
                <text class="eb-icon">{{ mealCheckIn[section.key] ? '✓' : '○' }}</text>
                <text class="eb-txt">{{ mealCheckIn[section.key] ? '已吃' : '标记' }}</text>
              </view>
              <view class="refresh-btn" :class="{ shimmering: isRefreshing === section.key }" @click.stop="refreshMeal(section.key)">
                <text class="rb-icon">↻</text>
                <text class="rb-text">换一批</text>
              </view>
            </view>
          </view>

          <view class="food-row">
            <view
              class="food-card"
              :class="{ 'show-actions': activeFoodId === food.id }"
              v-for="(food, fi) in section.recipes"
              :key="food.id"
              @click="onFoodClick(food, $event)"
              @dblclick="goToDetail(food)"
              style="animation: popIn .4s cubic-bezier(.175,.885,.32,1.275) forwards; animation-delay: calc(0.15s + si*0.06s + fi*0.05s); opacity: 0;"
            >
              <view class="fc-icon-wrap"><text class="fc-icon">{{ food.image || '🍽️' }}</text></view>
              <text class="fc-name">{{ food.name }}</text>

              <view class="action-bubble" v-if="activeFoodId === food.id" @click.stop>
                <view class="ab-item like-btn" @click="likeFood(food)"><text class="abi-icon">♥</text><text class="abi-text">喜欢</text></view>
                <view class="ab-item del-btn" @click="deleteFood(food, section.key)"><text class="abi-icon">✕</text><text class="abi-text">删除</text></view>
                <view class="ab-item swap-btn" @click="swapOneFood(food, section.key)"><text class="abi-icon">↻</text><text class="abi-text">换一个</text></view>
              </view>
            </view>
          </view>
        </view>

        <view class="bottom-actions">
          <view class="action-btn primary-action bounce-in" @click="regenerateAll">
            <text class="ab-icon">✦</text>
            <text class="ab-text">重新生成今日菜单</text>
          </view>
          <view class="action-hint">
            <text class="ah-text">单击菜品操作 · 双击查看详情</text>
          </view>
        </view>

        <view class="bottom-spacer"></view>
      </scroll-view>

      <view class="tap-mask" v-if="activeFoodId" @click="closeActions"></view>
    </template>

    <!-- ===== 不做饭模式（分享模式）===== -->
    <template v-else>
      <view class="header fade-in">
        <view class="header-top">
          <text class="greeting">{{ greetingTextNoCook }}</text>
          <view class="mode-tag">
            <text class="mt-icon">📷</text>
            <text class="mt-text">分享模式</text>
          </view>
        </view>
        <text class="mode-desc">拍照记录今天吃了什么，让TA也能看到</text>
      </view>

      <view class="photo-action-area slide-up" style="animation-delay:0.08s;opacity:0">
        <view class="camera-btn bounce-in" @click="takePhoto">
          <text class="cam-icon">📸</text>
          <text class="cam-text">拍一张今天吃的</text>
        </view>
        <view class="pick-btn pop-in" style="animation-delay:0.12s;opacity:0" @click="choosePhoto">
          <text class="cam-icon">🖼️</text>
          <text class="cam-text">从相册选择</text>
        </view>
      </view>

      <scroll-view scroll-y class="feed-scroll" :style="{ height: feedScrollHeight }" @scrolltolower="loadMoreFeed">
        <view class="feed-date-label" v-if="feedList.length > 0">
          <text class="fdl-text">{{ todayLabel }}</text>
        </view>

        <view
          class="feed-card"
          v-for="(item, idx) in feedList"
          :key="item.id"
          style="animation: slideUp .4s ease forwards; animation-delay: calc(0.1s + idx * 0.05s); opacity: 0;"
        >
          <image class="feed-img" :src="item.image" mode="aspectFill" @click="previewImage(item.image)"></image>
          <view class="feed-info">
            <view class="fi-top">
              <view class="fi-avatar">
                <text class="fi-char">{{ (item.fromName || '我').charAt(0) }}</text>
              </view>
              <view class="fi-meta">
                <text class="fi-name">{{ item.fromName || '我' }}</text>
                <text class="fi-time">{{ formatTime(item.createdAt) }}</text>
              </view>
              <text class="fi-self-tag" v-if="item.isSelf">我</text>
              <text class="fi-partner-tag" v-else>TA</text>
            </view>
            <text class="fi-caption" v-if="item.caption">{{ item.caption }}</text>
          </view>
        </view>

        <view class="empty-feed scale-in" v-if="feedList.length === 0">
          <text class="ef-icon">🍽️</text>
          <text class="ef-title">还没有美食分享</text>
          <text class="ef-hint">拍张照，告诉TA你今天吃了什么吧~</text>
        </view>

        <view class="bottom-spacer"></view>
      </scroll-view>
    </template>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'

export default {
  data() {
    return {
      dailyMeals: null,
      userCount: 2,
      scrollHeight: 'calc(100vh - 260rpx)',
      isRefreshing: '',
      activeFoodId: null,
      lastTapTime: 0,
      noCookMode: false,
      feedList: [],
      feedScrollHeight: 'calc(100vh - 380rpx)',
      pageEnter: true,
      mealCheckIn: { breakfast: false, lunch: false, dinner: false }
    }
  },
  computed: {
    greetingText() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了，早点休息'
      if (h < 9) return '早上好，今天吃点啥？'
      if (h < 12) return '中午好，该吃午饭了'
      if (h < 14) return '午休时间，吃饱了吗？'
      if (h < 18) return '下午好，晚餐想好了吗？'
      return '晚上好，明天见！'
    },
    greetingTextNoCook() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了'
      if (h < 9) return '早安，今天打算吃什么？'
      if (h < 12) return '中午了，吃饭了吗？'
      if (h < 14) return '下午茶时间到~'
      if (h < 18) return '晚餐时间，今天吃什么？'
      return '晚上好，今天吃得开心吗？'
    },
    todayLabel() {
      const d = new Date()
      const w = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]
      return `${d.getMonth()+1}月${d.getDate()}日 ${w}`
    },
    mealSections() {
      if (!this.dailyMeals) return []
      return [
        { key: 'breakfast', title: '早餐', icon: '☀', recipes: this.dailyMeals.breakfast || [] },
        { key: 'lunch', title: '午餐', icon: '🌞', recipes: this.dailyMeals.lunch || [] },
        { key: 'dinner', title: '晚餐', icon: '🌙', recipes: this.dailyMeals.dinner || [] }
      ]
    },
    totalCalories() {
      if (!this.dailyMeals) return 0
      let c = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => c += r.nutrition?.calories||0) })
      return Math.round(c * this.userCount)
    },
    totalProtein() {
      if (!this.dailyMeals) return 0; let p = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => p += r.nutrition?.protein||0) })
      return Math.round(p)
    },
    totalFat() {
      if (!this.dailyMeals) return 0; let f = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => f += r.nutrition?.fat||0) })
      return Math.round(f)
    },
    totalCarbs() {
      if (!this.dailyMeals) return 0; let cb = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => cb += r.nutrition?.carbs||0) })
      return Math.round(cb)
    }
  },
  onShow() {
    setTimeout(() => { this.pageEnter = false }, 400)
    this.loadMode()
    if (this.noCookMode) { this.loadFeed() }
    else { this.loadMeals(); this.recordAppOpen(); this.loadTodayCheckIn() }
  },
  methods: {
    loadMode() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      this.noCookMode = !!prefs.noCookMode
    },
    recordAppOpen() {
      const partner = uni.getStorageSync('foodfind_partner')
      if (!partner || !partner.pairId) return

      wx.cloud.callFunction({
        name: 'recordCheckIn',
        data: { action: 'open_app', pairId: partner.pairId }
      }).catch(() => {})
    },
    loadTodayCheckIn() {
      const todayStr = new Date().toISOString().split('T')[0]
      const personalChecks = uni.getStorageSync('foodfind_personal_checks') || {}
      if (personalChecks[todayStr]) {
        this.mealCheckIn = { ...personalChecks[todayStr] }
      }

      const partner = uni.getStorageSync('foodfind_partner')
      if (!partner || !partner.pairId) return

      wx.cloud.callFunction({
        name: 'getDailyStatus',
        data: { pairId: partner.pairId }
      }).then(res => {
        if (res.result && res.result.code === 0 && res.result.data && res.result.data.myCheckIn) {
          const my = res.result.data.myCheckIn
          this.mealCheckIn = {
            breakfast: my.meals?.breakfast?.eaten || this.mealCheckIn.breakfast,
            lunch: my.meals?.lunch?.eaten || this.mealCheckIn.lunch,
            dinner: my.meals?.dinner?.eaten || this.mealCheckIn.dinner
          }
        }
      }).catch(() => {})
    },
    markMealEaten(mealKey) {
      const newState = !this.mealCheckIn[mealKey]
      this.mealCheckIn[mealKey] = newState

      const personalChecks = uni.getStorageSync('foodfind_personal_checks') || {}
      const todayStr = new Date().toISOString().split('T')[0]
      if (!personalChecks[todayStr]) personalChecks[todayStr] = { breakfast: false, lunch: false, dinner: false }
      personalChecks[todayStr][mealKey] = newState
      uni.setStorageSync('foodfind_personal_checks', personalChecks)

      const partner = uni.getStorageSync('foodfind_partner')
      if (partner && partner.pairId) {
        wx.cloud.callFunction({
          name: 'recordCheckIn',
          data: {
            action: 'eat_meal',
            pairId: partner.pairId,
            mealType: mealKey,
            data: { nickname: getApp()?.globalData?.userInfo?.nickname || '我' }
          }
        }).catch(() => {})
      }

      if (newState) {
        uni.showToast({ title: `${mealKey === 'breakfast' ? '早餐' : mealKey === 'lunch' ? '午餐' : '晚餐'}已标记 ✓`, icon: 'success' })
      }
    },

    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.addFeedItem(res.tempFilePaths[0])
          }
        }
      })
    },
    choosePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.addFeedItem(res.tempFilePaths[0])
          }
        }
      })
    },
    addFeedItem(imagePath) {
      const app = getApp()
      const item = {
        id: 'feed_' + Date.now(),
        image: imagePath,
        fromName: app?.globalData?.userInfo?.nickname || '我',
        fromOpenid: '',
        caption: '',
        createdAt: new Date().toISOString(),
        isSelf: true
      }

      const feed = [item, ...this.feedList]
      this.feedList = feed

      const saved = uni.getStorageSync('foodfind_feed') || {}
      const todayStr = this.getTodayStr()
      if (!saved[todayStr]) saved[todayStr] = []
      saved[todayStr].unshift(item)
      uni.setStorageSync('foodfind_feed', saved)

      uni.showToast({ title: '已分享', icon: 'success' })

      if (app?.globalData?.partnerInfo && app.globalData.pairStatus === 'paired') {
        wx.cloud.callFunction({ name: 'saveShareMenu', data: { meals: [{ photoShare: true, image: imagePath, caption: '' }], fromName: item.fromName, toName: app.globalData.partnerInfo.nickname || 'TA' } }).catch(() => {})
      }
    },
    loadFeed() {
      const saved = uni.getStorageSync('foodfind_feed') || {}
      const todayStr = this.getTodayStr()
      this.feedList = saved[todayStr] || []

      const partnerFeed = uni.getStorageSync('foodfind_partner_feed') || {}
      if (partnerFeed[todayStr]) {
        const combined = [...this.feedList, ...partnerFeed[todayStr]]
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        this.feedList = combined
      }
    },
    loadMoreFeed() {},
    previewImage(url) {
      const urls = this.feedList.filter(f => f.image).map(f => f.image)
      uni.previewImage({ current: url, urls })
    },
    formatTime(isoStr) {
      try {
        const d = new Date(isoStr)
        const h = String(d.getHours()).padStart(2,'0')
        const m = String(d.getMinutes()).padStart(2,'0')
        return `${h}:${m}`
      } catch(e) { return '' }
    },

    onFoodClick(food, e) {
      const now = Date.now()
      if (now - this.lastTapTime < 300) {
        this.closeActions()
        this.goToDetail(food)
        this.lastTapTime = 0
        return
      }
      this.lastTapTime = now
      if (this.activeFoodId === food.id) { this.closeActions() }
      else { this.activeFoodId = food.id }
    },
    closeActions() { this.activeFoodId = null },
    likeFood(food) { uni.showToast({ title: `已标记「${food.name}」为喜欢`, icon: 'none' }); this.closeActions() },
    deleteFood(food, mealKey) {
      const meals = this.dailyMeals[mealKey] || []
      const idx = meals.findIndex(r => r.id === food.id)
      if (idx > -1) {
        meals.splice(idx, 1)
        const pool = ALL_RECIPES[mealKey] || []
        const currentIds = new Set(meals.map(r => r.id))
        const available = pool.filter(r => !currentIds.has(r.id))
        if (available.length > 0) { meals.push(available[Math.floor(Math.random() * available.length)]) }
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        const wc = uni.getStorageSync('foodfind_weekly') || {}
        wc[this.getTodayStr()] = this.dailyMeals
        uni.setStorageSync('foodfind_weekly', wc)
      }
      this.closeActions()
      uni.showToast({ title: `已替换「${food.name}」`, icon: 'none' })
    },
    swapOneFood(food, mealKey) {
      const meals = this.dailyMeals[mealKey] || []
      const idx = meals.findIndex(r => r.id === food.id)
      if (idx > -1) {
        const pool = ALL_RECIPES[mealKey] || []
        const otherIds = new Set(meals.filter(r => r.id !== food.id).map(r => r.id))
        const available = pool.filter(r => !otherIds.has(r.id))
        meals[idx] = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)]
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        const wc = uni.getStorageSync('foodfind_weekly') || {}
        wc[this.getTodayStr()] = this.dailyMeals
        uni.setStorageSync('foodfind_weekly', wc)
      }
      this.closeActions()
      uni.showToast({ title: `已更换「${food.name}」`, icon: 'none' })
    },

    loadMeals() {
      const cached = uni.getStorageSync('foodfind_meals')
      const cachedDate = uni.getStorageSync('foodfind_meals_date')
      if (cached && cachedDate && cachedDate === this.getTodayStr()) {
        this.dailyMeals = cached
        const app = getApp()
        if (app?.globalData) app.globalData.dailyMeals = cached
        return
      }
      const weeklyCache = uni.getStorageSync('foodfind_weekly')
      if (weeklyCache && weeklyCache[this.getTodayStr()]) {
        this.dailyMeals = weeklyCache[this.getTodayStr()]
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        uni.setStorageSync('foodfind_meals_date', this.getTodayStr())
        const app = getApp()
        if (app?.globalData) app.globalData.dailyMeals = this.dailyMeals
        return
      }
      this.generateDailyMeals()
    },
    getTodayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },
    getRecipeCount() {
      const c = this.userCount
      if (c === 1) return 2; if (c === 2) return 3; if (c <= 4) return 4; return 5
    },
    shuffle(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n) },
    balanced(recipes, n) {
      const meat = recipes.filter(r => r.type === 'meat' || r.type === 'mixed')
      const veg = recipes.filter(r => r.type === 'vegetarian')
      const mc = Math.ceil(n * 0.55), vc = n - mc
      return [...this.shuffle(meat, mc), ...this.shuffle(veg, vc)].sort(() => Math.random() - 0.5)
    },
    generateDailyMeals() {
      const n = this.getRecipeCount()
      const dailyMeals = {
        breakfast: this.shuffle(ALL_RECIPES.breakfast, n),
        lunch: this.balanced(ALL_RECIPES.lunch, n),
        dinner: this.balanced(ALL_RECIPES.dinner, n)
      }
      this.dailyMeals = dailyMeals
      const todayStr = this.getTodayStr()
      uni.setStorageSync('foodfind_meals', dailyMeals)
      uni.setStorageSync('foodfind_meals_date', todayStr)
      const app = getApp()
      if (app?.globalData) app.globalData.dailyMeals = dailyMeals
      const weeklyCache = uni.getStorageSync('foodfind_weekly') || {}
      weeklyCache[todayStr] = dailyMeals
      uni.setStorageSync('foodfind_weekly', weeklyCache)
      if (app?.globalData) app.globalData.weeklyMeals = weeklyCache
    },
    refreshMeal(mealKey) {
      if (this.isRefreshing) return
      this.isRefreshing = mealKey
      setTimeout(() => {
        const n = this.getRecipeCount()
        const pool = ALL_RECIPES[mealKey] || []
        const currentIds = new Set((this.dailyMeals[mealKey] || []).map(r => r.id))
        const available = pool.filter(r => !currentIds.has(r.id))
        this.dailyMeals[mealKey] = available.length >= n ? (mealKey === 'breakfast' ? this.shuffle(available, n) : this.balanced(available, n)) : (mealKey === 'breakfast' ? this.shuffle(pool, n) : this.balanced(pool, n))
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        const wc = uni.getStorageSync('foodfind_weekly') || {}
        wc[this.getTodayStr()] = this.dailyMeals
        uni.setStorageSync('foodfind_weekly', wc)
        this.isRefreshing = ''
        uni.showToast({ title: `已更换${mealKey==='breakfast'?'早餐':mealKey==='lunch'?'午餐':'晚餐'}`, icon: 'none' })
      }, 400)
    },
    regenerateAll() {
      uni.showLoading({ title: '重新生成中...' })
      setTimeout(() => { this.generateDailyMeals(); uni.hideLoading(); uni.showToast({ title: '已重新生成', icon: 'success' }) }, 600)
    },
    goToDetail(recipe) { uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` }) },
    onShareAppMessage() {
      const self = this
      const app = getApp()
      const partnerName = app?.globalData?.partnerInfo?.nickname || 'TA'

      if (self.noCookMode) {
        return { title: `来看看我今天吃了什么~`, path: '/pages/index/index', imageUrl: '' }
      }

      const cal = this.totalCalories
      return new Promise((resolve) => {
        wx.cloud.callFunction({
          name: 'saveShareMenu',
          data: { meals: self.dailyMeals, fromName: app.globalData.userInfo.nickname || '我', toName: partnerName }
        }).then(res => {
          if (res.result && res.result.shareId) {
            resolve({ title: `${partnerName}，今天吃这些怎么样？(${cal}kcal)`, path: `/pages/share/share?sid=${res.result.shareId}&from=home`, imageUrl: '' })
          } else { resolve({ title: `${partnerName}，今天吃这些？(${cal}kcal)`, path: '/pages/index/index', imageUrl: '' }) }
        }).catch(() => resolve({ title: `${partnerName}，今天吃这些？(${cal}kcal)`, path: '/pages/index/index', imageUrl: '' }))
      })
    },
    loadMore() {}
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#f7f8fa; padding:0 20rpx; position:relative; transition: opacity .3s ease; }
.page-enter { animation: pageEnter .35s ease forwards; }

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.header { padding:28rpx 20rpx 16rpx; background:#fff; border-radius:0 0 24rpx 24rpx; margin-bottom:14rpx; }
.header-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:18rpx; }
.greeting { font-size:36rpx; font-weight:700; color:#1a1a1a; }

.share-btn {
  display:flex; align-items:center; gap:6rpx;
  padding:12rpx 22rpx;
  background:linear-gradient(135deg,#07c160,#059a4b);
  border-radius:40rpx; transition:all .25s ease;
  &:active { transform:scale(.95); opacity:.85; }
}
.sb-icon { font-size:24rpx; color:#fff; }
.sb-text { font-size:23rpx; color:#fff; font-weight:600; }

.mode-tag {
  display:flex; align-items:center; gap:6rpx;
  padding:10rpx 18rpx; background:#e8f7ef;
  border-radius:24rpx;
}
.mt-icon { font-size:22rpx; }
.mt-text { font-size:22rpx; color:#07c160; font-weight:600; }
.mode-desc { font-size:25rpx; color:#999; }

.calorie-bar {
  display:flex; flex-direction:column; gap:8rpx;
  background:linear-gradient(135deg,#e8f7ef,#d4f5e3);
  padding:18rpx 20rpx; border-radius:16rpx;
}
.cb-left { display:flex; align-items:baseline; gap:10rpx; }
.cb-label { font-size:23rpx; color:#07c160; font-weight:600; }
.cb-value { font-size:32rpx; font-weight:700; color:#07c160; }
.cb-right { display:flex; align-items:center; gap:8rpx; flex-wrap:wrap; }
.cb-item { font-size:21rpx; color:#666; }
.cb-dot { font-size:21rpx; color:#ccc; }

.meal-scroll { }
.feed-scroll { }

.meal-section {
  background:#fff; border-radius:20rpx;
  box-shadow:0 2rpx 14rpx rgba(0,0,0,.04);
  margin-bottom:22rpx; overflow:hidden;
}
.meal-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:22rpx 24rpx 14rpx;
}
.mh-left { display:flex; align-items:center; gap:10rpx; }
.mh-icon { font-size:30rpx; }
.mh-title { font-size:28rpx; font-weight:700; color:#1a1a1a; }
.mh-right { display:flex; align-items:center; gap:10rpx; }

.eaten-btn {
  display:flex; align-items:center; gap:6rpx;
  padding:10rpx 18rpx;
  background:#f5f5f5; border-radius:32rpx;
  transition:all .25s ease;
  &:active { transform:scale(.93); }
  &.eaten { background:linear-gradient(135deg,#07c160,#059a4b); }
}
.eb-icon { font-size:24rpx; color:#999; }
.eaten-btn.eaten .eb-icon { color:#fff; }
.eb-txt { font-size:21rpx; color:#666; font-weight:500; }
.eaten-btn.eaten .eb-txt { color:#fff; }

.refresh-btn {
  display:flex; align-items:center; gap:6rpx;
  padding:10rpx 18rpx; background:#f0faf3;
  border-radius:32rpx; transition:all .25s ease;
  &.shimmering { animation: shimmer .8s ease-in-out infinite; }
  &:active { background:#d4f5e3; transform:scale(.93); }
}
.rb-icon { font-size:22rpx; color:#07c160; }
.rb-text { font-size:21rpx; color:#07c160; font-weight:500; }

.food-row { display:flex; flex-wrap:wrap; padding:0 12rpx 20rpx; gap:10rpx; }

.food-card {
  width:calc(20% - 8rpx); min-width:0;
  background:#fafafa; border-radius:16rpx;
  padding:16rpx 6rpx 12rpx; display:flex; flex-direction:column; align-items:center;
  box-sizing:border-box; transition:all .25s ease; position:relative;
  &.show-actions { background:#e8f7ef; box-shadow:0 4rpx 20rpx rgba(7,193,96,.15); z-index:10; }
  &:active:not(.show-actions) { background:#f0f0f0; transform:scale(.92); }
}
.fc-icon-wrap {
  width:68rpx; height:68rpx; background:#fff; border-radius:18rpx;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:8rpx; box-shadow:0 2rpx 8rpx rgba(0,0,0,.04);
  transition:transform .25s ease;
}
.show-actions .fc-icon-wrap { transform: scale(0.9); }
.fc-icon { font-size:36rpx; }
.fc-name {
  font-size:21rpx; font-weight:500; color:#333;
  text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  max-width:100%; line-height:1.3;
}

.action-bubble {
  position:absolute; bottom:-8rpx; left:50%; transform:translateX(-50%);
  display:flex; gap:4rpx; padding:6rpx 8px;
  background:#fff; border-radius:24rpx;
  box-shadow:0 4rpx 20rpx rgba(0,0,0,.12);
  animation: popIn .25s cubic-bezier(.175,.885,.32,1.275);
  white-space:nowrap; z-index:20;
}
.ab-item {
  display:flex; align-items:center; gap:4rpx;
  padding:8rpx 14rpx; border-radius:20rpx;
  transition:all .2s ease;
  &:active { transform:scale(.9); }
}
.like-btn { &:active { background:#e8f7ef; } }
.del-btn { &:active { background:#fef0f0; } }
.swap-btn { &:active { background:#f0faf3; } }
.abi-icon { font-size:22rpx; }
.like-btn .abi-icon { color:#ff4757; }
.del-btn .abi-icon { color:#999; }
.swap-btn .abi-icon { color:#07c160; }
.abi-text { font-size:20rpx; font-weight:500; color:#555; }

.tap-mask { position:fixed; top:0; left:0; right:0; bottom:0; z-index:5; }

.bottom-actions { display:flex; flex-direction:column; align-items:center; padding:40rpx 24rpx 20rpx; gap:14rpx; }
.primary-action {
  display:flex; align-items:center; gap:10rpx;
  padding:24rpx 56rpx;
  background:linear-gradient(135deg,#07c160,#06ad56);
  border-radius:50rpx; transition:all .25s ease;
  &:active { opacity:.85; transform:scale(.97); }
}
.ab-icon { font-size:28rpx; color:#fff; }
.ab-text { font-size:28rpx; font-weight:600; color:#fff; }
.action-hint { }
.ah-text { font-size:23rpx; color:#bbb; }
.bottom-spacer { height:60rpx; }

.photo-action-area {
  display:flex; gap:16rpx; padding:16rpx 8rpx; margin-bottom:12rpx;
}
.camera-btn, .pick-btn {
  flex:1; display:flex; align-items:center; justify-content:center; gap:10rpx;
  padding:28rpx 0; border-radius:20rpx; transition:all .25s ease;
  &:active { transform:scale(.97); opacity:.85; }
}
.camera-btn { background:linear-gradient(135deg,#07c160,#06ad56); }
.pick-btn { background:linear-gradient(135deg,#e8f7ef,#d4f5e3); }
.cam-icon { font-size:34rpx; }
.camera-btn .cam-text { font-size:27rpx; color:#fff; font-weight:600; }
.pick-btn .cam-text { font-size:27rpx; color:#07c160; font-weight:600; }

.feed-date-label { padding:20rpx 8rpx 10rpx; }
.fdl-text { font-size:25rpx; color:#999; font-weight:500; }

.feed-card {
  background:#fff; border-radius:20rpx;
  overflow:hidden; margin-bottom:18rpx;
  box-shadow:0 2rpx 14rpx rgba(0,0,0,.04);
}
.feed-img { width:100%; height:420rpx; display:block; }
.feed-info { padding:18rpx 20rpx; }
.fi-top { display:flex; align-items:center; gap:12rpx; margin-bottom:10rpx; }
.fi-avatar {
  width:56rpx; height:56rpx; background:#e8f7ef; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
}
.fi-char { font-size:26rpx; font-weight:700; color:#07c160; }
.fi-meta { flex:1; display:flex; flex-direction:column; }
.fi-name { font-size:26rpx; font-weight:600; color:#333; }
.fi-time { font-size:21rpx; color:#bbb; margin-top:2rpx; }
.fi-self-tag {
  padding:6rpx 16rpx; background:#07c160; color:#fff;
  font-size:20rpx; font-weight:600; border-radius:16rpx;
}
.fi-partner-tag {
  padding:6rpx 16rpx; background:#e8f7ef; color:#07c160;
  font-size:20rpx; font-weight:600; border-radius:16rpx;
}
.fi-caption { font-size:26rpx; color:#555; line-height:1.5; display:block; }

.empty-feed {
  display:flex; flex-direction:column; align-items:center;
  padding:120rpx 40rpx;
}
.ef-icon { font-size:80rpx; margin-bottom:24rpx; }
.ef-title { font-size:30rpx; font-weight:600; color:#333; margin-bottom:12rpx; }
.ef-hint { font-size:25rpx; color:#bbb; text-align:center; }
</style>