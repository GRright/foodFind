<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="header fade-in">
      <view class="header-top">
        <text class="header-title">用餐配置</text>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="config-section">
        <view class="section-header">
          <text class="section-icon">📅</text>
          <text class="section-title">工作日用餐</text>
        </view>
        <view class="meal-options">
          <view
            class="meal-option"
            :class="{ active: mealConfig.weekday.includes('breakfast') }"
            @click="toggleWeekdayMeal('breakfast')"
          >
            <text class="option-check" :class="{ checked: mealConfig.weekday.includes('breakfast') }">
              <text v-if="mealConfig.weekday.includes('breakfast')" class="check-mark">✓</text>
            </text>
            <text class="option-name">早餐</text>
          </view>
          <view
            class="meal-option"
            :class="{ active: mealConfig.weekday.includes('lunch') }"
            @click="toggleWeekdayMeal('lunch')"
          >
            <text class="option-check" :class="{ checked: mealConfig.weekday.includes('lunch') }">
              <text v-if="mealConfig.weekday.includes('lunch')" class="check-mark">✓</text>
            </text>
            <text class="option-name">午餐</text>
          </view>
          <view
            class="meal-option"
            :class="{ active: mealConfig.weekday.includes('dinner') }"
            @click="toggleWeekdayMeal('dinner')"
          >
            <text class="option-check" :class="{ checked: mealConfig.weekday.includes('dinner') }">
              <text v-if="mealConfig.weekday.includes('dinner')" class="check-mark">✓</text>
            </text>
            <text class="option-name">晚餐</text>
          </view>
        </view>
      </view>

      <view class="config-section">
        <view class="section-header">
          <text class="section-icon">🎉</text>
          <text class="section-title">周末用餐</text>
        </view>
        <view class="meal-options">
          <view
            class="meal-option"
            :class="{ active: mealConfig.weekend.includes('breakfast') }"
            @click="toggleWeekendMeal('breakfast')"
          >
            <text class="option-check" :class="{ checked: mealConfig.weekend.includes('breakfast') }">
              <text v-if="mealConfig.weekend.includes('breakfast')" class="check-mark">✓</text>
            </text>
            <text class="option-name">早餐</text>
          </view>
          <view
            class="meal-option"
            :class="{ active: mealConfig.weekend.includes('lunch') }"
            @click="toggleWeekendMeal('lunch')"
          >
            <text class="option-check" :class="{ checked: mealConfig.weekend.includes('lunch') }">
              <text v-if="mealConfig.weekend.includes('lunch')" class="check-mark">✓</text>
            </text>
            <text class="option-name">午餐</text>
          </view>
          <view
            class="meal-option"
            :class="{ active: mealConfig.weekend.includes('dinner') }"
            @click="toggleWeekendMeal('dinner')"
          >
            <text class="option-check" :class="{ checked: mealConfig.weekend.includes('dinner') }">
              <text v-if="mealConfig.weekend.includes('dinner')" class="check-mark">✓</text>
            </text>
            <text class="option-name">晚餐</text>
          </view>
        </view>
      </view>

      <view class="config-section">
        <view class="section-header">
          <text class="section-icon">📋</text>
          <text class="section-title">配置说明</text>
        </view>
        <view class="info-text">
          <text>选择您在工作日和周末需要准备的餐次，购物清单将根据此配置自动生成。</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pageEnter: true,
      mealConfig: {
        weekday: ['breakfast', 'lunch', 'dinner'],
        weekend: ['breakfast', 'lunch', 'dinner']
      }
    }
  },
  onLoad() {
    this.loadConfig()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
  },
  onUnload() {
    this.saveConfig()
  },
  methods: {
    loadConfig() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs')
      if (prefs && prefs.mealConfig) {
        this.mealConfig = { ...this.mealConfig, ...prefs.mealConfig }
      }
    },
    saveConfig() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      prefs.mealConfig = this.mealConfig
      uni.setStorageSync('foodfind_detailed_prefs', prefs)
    },
    toggleWeekdayMeal(mealType) {
      const idx = this.mealConfig.weekday.indexOf(mealType)
      if (idx > -1) {
        this.mealConfig.weekday.splice(idx, 1)
      } else {
        this.mealConfig.weekday.push(mealType)
      }
      this.saveConfig()
    },
    toggleWeekendMeal(mealType) {
      const idx = this.mealConfig.weekend.indexOf(mealType)
      if (idx > -1) {
        this.mealConfig.weekend.splice(idx, 1)
      } else {
        this.mealConfig.weekend.push(mealType)
      }
      this.saveConfig()
    },

  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; display: flex; flex-direction: column; width: 100%; overflow-x: hidden; }
.page-enter { animation: pageEnter .3s ease forwards; }

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.header { padding: 56rpx 28rpx 20rpx; background: #fff; width: 100%; box-sizing: border-box; }
.header-top { display: flex; align-items: center; gap: 16rpx; }

.header-title { display: block; font-size: 36rpx; font-weight: 800; color: #1a1a1a; }

.content-scroll { flex: 1; padding: 20rpx 28rpx; width: 100%; box-sizing: border-box; }

.config-section {
  background: #fff; border-radius: 24rpx; margin-bottom: 20rpx;
  padding: 24rpx 28rpx; box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04); width: 100%; box-sizing: border-box;
}

.section-header {
  display: flex; align-items: center; gap: 12rpx; margin-bottom: 20rpx;
}
.section-icon { font-size: 32rpx; }
.section-title { font-size: 28rpx; font-weight: 700; color: #1a1a1a; }

.meal-options { display: flex; gap: 16rpx; width: 100%; }
.meal-option {
  flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  padding: 24rpx 16rpx; background: #f5f6f8; border-radius: 16rpx; border: 2rpx solid transparent;
  transition: all .25s ease; &:active { opacity: .8; } &.active { background: #fff; border-color: #07c160; box-shadow: 0 2rpx 12rpx rgba(7, 193, 96, .15); }
}

.option-check {
  width: 44rpx; height: 44rpx; border: 3rpx solid #d0d0d0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all .25s ease;
  &.checked { background: #07c160; border-color: #07c160; }
}
.check-mark { font-size: 24rpx; color: #fff; font-weight: 700; }
.option-name { font-size: 24rpx; color: #666; font-weight: 500; }
.meal-option.active .option-name { color: #1a1a1a; }

.info-text { font-size: 24rpx; color: #999; line-height: 1.6; }

.bottom-spacer { height: 120rpx; }
</style>
