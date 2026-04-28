<template>
  <view class="page">
    <view class="friend-hero">
      <text class="hero-emoji">👋</text>
      <text class="hero-text">{{ fromName }} 的今日菜谱</text>
      <text class="hero-sub">来看看好友今天吃什么~</text>
      <text class="hero-time" v-if="shareTime">{{ shareTime }}</text>
    </view>

    <scroll-view scroll-y class="body-scroll" :style="{ height: bodyHeight }">
      <view class="loading-card" v-if="loading">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在加载菜谱...</text>
      </view>

      <template v-else>
        <view v-if="!hasMeals" class="empty-card">
          <text class="empty-icon">🍽️</text>
          <text class="empty-text">暂无菜谱数据</text>
          <text class="empty-hint">好友还没有分享今日菜谱</text>
        </view>

        <template v-else>
          <view class="meal-section" v-for="(meal, mi) in mealSections" :key="mi">
            <view class="meal-header">
              <text class="mh-icon">{{ meal.icon }}</text>
              <text class="mh-title">{{ meal.title }}</text>
              <text class="mh-cal">{{ meal.cal }} kcal</text>
            </view>
            <view class="food-row">
              <view class="food-card" v-for="(food, fi) in meal.recipes" :key="fi" @click="viewRecipe(food)">
                <view class="fc-icon-wrap">
                  <image class="fc-img" :src="food.image" mode="aspectFill" @error="food._imgErr = true" v-if="food.image && food.image.startsWith('/') && !food._imgErr"></image>
                  <text class="fc-icon" v-else>{{ (!food.image || food.image.startsWith('/')) ? '🍽️' : food.image }}</text>
                </view>
                <text class="fc-name">{{ food.name }}</text>
                <text class="fc-kcal">{{ food.nutrition?.calories || 0 }} kcal</text>
              </view>
            </view>
          </view>

          <view class="nutrition-summary" v-if="totalCalories > 0">
            <view class="ns-item">
              <text class="ns-value">{{ totalCalories }}</text>
              <text class="ns-label">总热量(kcal)</text>
            </view>
            <view class="ns-item">
              <text class="ns-value">{{ totalProtein }}g</text>
              <text class="ns-label">蛋白质</text>
            </view>
            <view class="ns-item">
              <text class="ns-value">{{ totalFat }}g</text>
              <text class="ns-label">脂肪</text>
            </view>
            <view class="ns-item">
              <text class="ns-value">{{ totalCarbs }}g</text>
              <text class="ns-label">碳水</text>
            </view>
          </view>

          <view class="action-area">
            <view class="primary-btn" @click="useThisMenu">
              <text class="btn-icon">✓</text>
              <text class="btn-text">我也用这个菜谱</text>
            </view>
            <view class="secondary-btn" @click="goHome">
              <text class="btn-icon">🏠</text>
              <text class="btn-text">返回首页</text>
            </view>
          </view>
        </template>
      </template>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      fromName: '好友',
      meals: {},
      shareTime: '',
      loading: true,
      bodyHeight: 'calc(100vh - 380rpx)'
    }
  },
  computed: {
    hasMeals() {
      return this.meals && (this.meals.breakfast?.length > 0 || this.meals.lunch?.length > 0 || this.meals.dinner?.length > 0)
    },
    mealSections() {
      const sections = [
        { key: 'breakfast', title: '早餐', icon: '🌅', recipes: this.meals.breakfast || [] },
        { key: 'lunch', title: '午餐', icon: '☀️', recipes: this.meals.lunch || [] },
        { key: 'dinner', title: '晚餐', icon: '🌙', recipes: this.meals.dinner || [] }
      ]
      return sections
        .filter(s => s.recipes.length > 0)
        .map(m => ({
          ...m,
          cal: m.recipes.reduce((s, r) => s + (r.nutrition?.calories || 0), 0)
        }))
    },
    totalCalories() {
      let c = 0
      ;['breakfast', 'lunch', 'dinner'].forEach(k => {
        (this.meals[k] || []).forEach(r => { c += r.nutrition?.calories || 0 })
      })
      return Math.round(c)
    },
    totalProtein() {
      let p = 0
      ;['breakfast', 'lunch', 'dinner'].forEach(k => {
        (this.meals[k] || []).forEach(r => { p += r.nutrition?.protein || 0 })
      })
      return Math.round(p)
    },
    totalFat() {
      let f = 0
      ;['breakfast', 'lunch', 'dinner'].forEach(k => {
        (this.meals[k] || []).forEach(r => { f += r.nutrition?.fat || 0 })
      })
      return Math.round(f)
    },
    totalCarbs() {
      let c = 0
      ;['breakfast', 'lunch', 'dinner'].forEach(k => {
        (this.meals[k] || []).forEach(r => { c += r.nutrition?.carbs || 0 })
      })
      return Math.round(c)
    }
  },
  onLoad(options) {
    if (options.from) {
      this.fromName = decodeURIComponent(options.from)
    }
    this.loadSharedMenu()
  },
  methods: {
    loadSharedMenu() {
      const shareData = uni.getStorageSync('foodfind_share_data')
      if (shareData && shareData.meals) {
        this.meals = shareData.meals
        this.shareTime = shareData.time || ''
        shareData.viewCount = (shareData.viewCount || 0) + 1
        uni.setStorageSync('foodfind_share_data', shareData)
      }
      this.loading = false
    },
    viewRecipe(food) {
      if (food.id) {
        uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${food.id}` })
      }
    },
    useThisMenu() {
      // 将好友的菜谱设为自己的菜谱
      uni.setStorageSync('foodfind_meals', this.meals)
      uni.setStorageSync('foodfind_meals_date', new Date().toISOString().split('T')[0])
      const app = getApp()
      if (app?.globalData) app.globalData.dailyMeals = this.meals
      uni.showToast({ title: '已设为今日菜谱 ✨', icon: 'success', duration: 2000 })
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; }

.friend-hero {
  background: linear-gradient(135deg, #07c160, #05a050);
  padding: 48rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-emoji { font-size: 72rpx; margin-bottom: 12rpx; }
.hero-text { font-size: 34rpx; font-weight: 800; color: #fff; margin-bottom: 8rpx; text-align: center; }
.hero-sub { font-size: 26rpx; color: rgba(255,255,255,.85); margin-bottom: 8rpx; }
.hero-time { font-size: 22rpx; color: rgba(255,255,255,.6); }

.body-scroll { padding-bottom: env(safe-area-inset-bottom); }

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
}
.loading-icon { font-size: 60rpx; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
.loading-text { font-size: 27rpx; color: #999; }

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  margin: 28rpx;
}
.empty-icon { font-size: 80rpx; }
.empty-text { font-size: 30rpx; font-weight: 700; color: #333; }
.empty-hint { font-size: 24rpx; color: #999; }

.meal-section {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
  margin: 0 28rpx 18rpx;
  overflow: hidden;
}
.meal-header {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx 12rpx;
}
.mh-icon { font-size: 30rpx; margin-right: 10rpx; }
.mh-title { font-size: 26rpx; font-weight: 700; color: #1a1a1a; flex: 1; }
.mh-cal { font-size: 23rpx; color: #999; font-weight: 600; }

.food-row {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16rpx 20rpx;
  gap: 12rpx;
}
.food-card {
  width: calc(20% - 9.6rpx);
  min-width: 0;
  background: #F5F6FA;
  border-radius: 20rpx;
  padding: 18rpx 8rpx 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all .25s ease;
  &:active { background: #e8e9eb; transform: scale(.92); }
}
.fc-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  background: #fff;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  box-shadow: 0 1rpx 6rpx rgba(0,0,0,.06);
  overflow: hidden;
}
.fc-img { width:100%; height:100%; border-radius:18rpx; }
.fc-icon { font-size: 32rpx; }
.fc-name { font-size: 20rpx; font-weight: 500; color: #333; text-align: center; line-height: 1.3; }
.fc-kcal { font-size: 18rpx; color: #999; font-weight: 600; margin-top: 6rpx; }

.nutrition-summary {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 24rpx;
  margin: 0 28rpx 18rpx;
  padding: 28rpx 20rpx;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
}
.ns-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}
.ns-value { font-size: 32rpx; font-weight: 700; color: #07c160; }
.ns-label { font-size: 20rpx; color: #999; }

.action-area { padding: 20rpx 32rpx; }
.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 26rpx 0;
  background: #07c160;
  border-radius: 48rpx;
  margin-bottom: 14rpx;
  box-shadow: 0 2rpx 12rpx rgba(7,193,96,.2);
  &:active { opacity: 0.85; transform: scale(0.98); transition: all 0.15s; }
}
.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 22rpx 0;
  background: #f5f6f8;
  border-radius: 48rpx;
  &:active { background: #eee; transform: scale(0.98); transition: all 0.15s; }
}
.btn-icon { font-size: 29rpx; }
.btn-text { font-size: 27rpx; font-weight: 600; color: #fff; }
.secondary-btn .btn-text { color: #666; }

.bottom-spacer { height: 56rpx; }
</style>
