<template>
  <view class="page">
    <view class="recipe-hero">
      <text class="hero-emoji scale-in">{{ recipe.image || '🍽️' }}</text>
      <view class="hero-overlay">
        <text class="hero-title">{{ recipe.name }}</text>
        <view class="hero-tags">
          <text class="hero-tag">{{ recipe.cuisine_type }}</text>
          <text class="hero-tag">{{ recipe.difficulty || '简单' }}</text>
          <text class="hero-tag">{{ recipe.cooking_time || 15 }}分钟</text>
        </view>
      </view>

      <view
        class="like-btn"
        :class="{ liked: isFavorited }"
        @click="toggleFavorite"
      >
        <text class="lb-icon">{{ isFavorited ? '♥' : '♡' }}</text>
        <text class="lb-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="detail-scroll" :style="{ height: detailHeight }">
      <view class="nutrition-bar slide-up" style="animation-delay:0.1s;opacity:0">
        <view class="nutri-item">
          <text class="nutri-value">{{ recipe.nutrition?.calories || 0 }}</text>
          <text class="nutri-label">千卡</text>
        </view>
        <view class="nutri-divider"></view>
        <view class="nutri-item">
          <text class="nutri-value">{{ recipe.nutrition?.protein || 0 }}g</text>
          <text class="nutri-label">蛋白质</text>
        </view>
        <view class="nutri-divider"></view>
        <view class="nutri-item">
          <text class="nutri-value">{{ recipe.nutrition?.fat || 0 }}g</text>
          <text class="nutri-label">脂肪</text>
        </view>
        <view class="nutri-divider"></view>
        <view class="nutri-item">
          <text class="nutri-value">{{ recipe.nutrition?.carbs || 0 }}g</text>
          <text class="nutri-label">碳水</text>
        </view>
      </view>

      <view class="section-card slide-up" style="animation-delay:0.2s;opacity:0">
        <view class="section-title-row">
          <text class="sec-deco">"</text>
          <text class="sec-title">所需用料用量</text>
          <text class="sec-deco">"</text>
        </view>
        <view class="ing-list">
          <view
            class="ing-item"
            v-for="(ing, idx) in recipe.ingredients"
            :key="idx"
            style="animation: fadeIn 0.3s ease forwards; animation-delay: calc(0.25s + idx * 0.05s); opacity: 0;"
          >
            <text class="ing-name">{{ ing.name }}</text>
            <text class="ing-amount">{{ ing.amount }}</text>
          </view>
        </view>
      </view>

      <view class="section-card slide-up" style="animation-delay:0.35s;opacity:0">
        <view class="section-title-row">
          <text class="sec-deco">"</text>
          <text class="sec-title">操作步骤详解</text>
          <text class="sec-deco">"</text>
        </view>
        <view class="steps-list">
          <view
            class="step-item"
            v-for="(step, idx) in recipe.steps"
            :key="idx"
            style="animation: slideUp 0.3s ease forwards; animation-delay: calc(0.4s + idx * 0.08s); opacity: 0;"
          >
            <view class="step-left">
              <view class="step-num-wrap"><text class="step-num">{{ idx + 1 }}</text></view>
            </view>
            <view class="step-right">
              <text class="step-text">{{ step }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-area">
        <view v-if="selectedRating === 0" class="action-btn pulse-btn" @click="showRatingPanel = true">
        <text class="btn-icon">☆</text><text class="btn-text">评价这道菜</text>
      </view>
        <view v-else class="rated-bar scale-in">
          <text class="rated-text">已评价 {{ selectedRating }} 星 · 感谢反馈！</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="rating-mask" :class="{ show: showRatingPanel }" @click="showRatingPanel = false">
      <view class="rating-sheet" :class="{ show: showRatingPanel }" @click.stop>
        <text class="rating-title">给这道菜打个分吧</text>
        <view class="stars-row">
          <text
            class="star"
            :class="{ active: selectedRating >= s }"
            v-for="s in 5"
            :key="s"
            @click="selectStar(s)"
          >★</text>
        </view>
        <textarea class="feedback-input" placeholder="说说你的感受（可选）..." :value="feedbackText" @input="e => feedbackText = e.detail.value" maxlength="200" />
        <view class="submit-btn" @click="submitFeedback">提交评价</view>
      </view>
    </view>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'

export default {
  data() {
    return {
      recipeId: null,
      recipe: {
        id: 1, name: '番茄炒蛋', image: '🍳', cuisine_type: '家常菜',
        difficulty: '简单', cooking_time: 15,
        nutrition: { calories: 180, protein: 12, fat: 12, carbs: 8 },
        ingredients: [{ name: '番茄', amount: '2个约200g' }, { name: '鸡蛋', amount: '3个约165g' }],
        steps: ['番茄切块', '鸡蛋打散炒熟', '放入番茄一起炒', '加盐调味即可']
      },
      detailHeight: 'calc(100vh - 360rpx)',
      selectedRating: 0,
      feedbackText: '',
      showRatingPanel: false,
      isFavorited: false
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.recipeId = parseInt(options.id)
      this.loadRecipe(this.recipeId)
      this.checkFavorite()
    }
  },
  methods: {
    loadRecipe(id) {
      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const found = allRecipes.find(r => r.id === id)
      if (found) { this.recipe = found }
    },
    checkFavorite() {
      const favorites = uni.getStorageSync('foodfind_favorites') || []
      this.isFavorited = favorites.some(f => f.id === this.recipeId)
    },
    toggleFavorite() {
      let favorites = uni.getStorageSync('foodfind_favorites') || []
      if (this.isFavorited) {
        favorites = favorites.filter(f => f.id !== this.recipeId)
        uni.setStorageSync('foodfind_favorites', favorites)
        this.isFavorited = false
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        favorites.unshift({
          id: this.recipe.id,
          name: this.recipe.name,
          image: this.recipe.image,
          cuisine_type: this.recipe.cuisine_type,
          type: this.recipe.type,
          nutrition: this.recipe.nutrition,
          favoritedAt: new Date().toISOString()
        })
        uni.setStorageSync('foodfind_favorites', favorites)
        this.isFavorited = true
        uni.showToast({ title: '已加入收藏 ✓', icon: 'success' })
      }
    },
    selectStar(s) {
      this.selectedRating = s
    },
    submitFeedback() {
      if (this.selectedRating === 0) { uni.showToast({ title: '请选择评分', icon: 'none' }); return }
      uni.showToast({ title: '提交成功', icon: 'success' })
      this.showRatingPanel = false; this.selectedRating = 0; this.feedbackText = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; }

.recipe-hero {
  height: 380rpx; background: #07c160;
  display: flex; align-items: center; justify-content: center; position: relative;
}
.like-btn {
  position:absolute; top:calc(env(safe-area-inset-top) + 20rpx); right:24rpx;
  display:flex; align-items:center; gap:6rpx;
  padding:12rpx 22rpx; background:rgba(255,255,255,.2);
  border-radius:40rpx;
  transition:all .3s ease;
  &:active { transform:scale(.92); }
  &.liked { background:rgba(255,255,255,.35); }
}
.lb-icon { font-size:28rpx; color:#fff; }
.liked .lb-icon { color:#fff; animation: heartBeat .4s ease; }
.lb-text { font-size:23rpx; color:#fff; font-weight:600; }
.hero-emoji { font-size: 140rpx; }
.hero-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 32rpx; background: rgba(0,0,0,.2);
}
.hero-title {
  font-size: 40rpx; font-weight: 800; color: #fff; display: block;
  margin-bottom: 12rpx; letter-spacing:-1rpx;
}
.hero-tags { display: flex; gap: 10rpx; }
.hero-tag {
  font-size: 22rpx; color: rgba(255,255,255,.85);
  background: rgba(255,255,255,.15); padding: 6rpx 16rpx; border-radius: 16rpx;
}

.detail-scroll { padding-top: 40rpx; padding-bottom: env(safe-area-inset-bottom); }

.nutrition-bar {
  background: #fff; margin: -40rpx 28rpx 24rpx; border-radius: 20rpx;
  padding: 28rpx 20rpx; display: flex; align-items: center; justify-content: space-around;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04); position: relative; z-index: 10;
}
.nutri-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.nutri-value { font-size: 30rpx; font-weight: 700; color: #1a1a1a; }
.nutri-label { font-size: 21rpx; color: #999; }
.nutri-divider { width: 1rpx; height: 48rpx; background: #eee; }

.section-card {
  background: #fff; margin: 0 28rpx 24rpx; border-radius: 24rpx;
  padding: 36rpx 32rpx; box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
}

.section-title-row {
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  margin-bottom: 28rpx;
}
.sec-deco { font-size: 32rpx; color: #ddd; font-weight: 300; line-height: 1; }
.sec-title { font-size: 30rpx; font-weight: 700; color: #1a1a1a; letter-spacing: 2rpx; }

.ing-list { display: flex; flex-direction: column; }
.ing-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22rpx 0; border-bottom: 1rpx solid #f5f5f5;
  transition: background .15s ease;
  &:last-child { border-bottom: none; }
  &:active { background: #f5f6f8; border-radius: 10rpx; }
}
.ing-name { font-size: 28rpx; color: #333; font-weight: 500; }
.ing-amount { font-size: 26rpx; color: #999; }

.steps-list { display: flex; flex-direction: column; gap: 28rpx; margin-top: 8rpx; }
.step-item { display: flex; gap: 18rpx; align-items: flex-start; }
.step-left { flex-shrink: 0; padding-top: 2rpx; }
.step-num-wrap {
  width: 48rpx; height: 48rpx; background: #07c160;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: transform .2s ease;
}
.step-item:active .step-num-wrap { transform: scale(1.15); }
.step-num { color: #fff; font-size: 26rpx; font-weight: 700; }
.step-right { flex: 1; min-width: 0; }
.step-text { font-size: 28rpx; color: #444; line-height: 1.7; }

.action-area { padding: 20rpx 32rpx; }
.action-btn {
  display:flex; align-items:center; justify-content:center; gap:10rpx;
  text-align: center; padding: 28rpx 0;
  background: #07c160;
  color: #fff; font-size: 29rpx; font-weight: 600; border-radius: 48rpx;
  box-shadow:0 2rpx 12rpx rgba(7,193,96,.2);
  &:active { opacity: 0.85; transform: scale(0.97); transition: all 0.15s; }
}
.btn-icon { font-size:32rpx; }
.btn-text { font-size:29rpx; font-weight:600; }
.rated-bar { background: #e8f7ef; padding: 28rpx; border-radius: 20rpx; text-align: center; }
.rated-text { font-size: 27rpx; color: #07c160; font-weight: 600; }
.bottom-spacer { height: 60rpx; }

.rating-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex; align-items: flex-end; z-index: 999;
  pointer-events: none; transition: background .25s ease;
  &.show { background: rgba(0,0,0,.45); pointer-events: auto; }
}
.rating-sheet {
  width: 100%; background: #fff; border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx; padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  transform: translateY(100%); transition: transform .3s cubic-bezier(.4,0,.2,1);
  &.show { transform: translateY(0); }
}
.rating-title { display: block; text-align: center; font-size: 32rpx; font-weight: 600; color: #1a1a1a; margin-bottom: 28rpx; }
.stars-row { display: flex; justify-content: center; gap: 20rpx; margin-bottom: 28rpx; }
.star {
  font-size: 56rpx; color: #ddd; transition: all .15s ease;
  &.active { color: #07c160; transform: scale(1.15); }
  &:active { transform: scale(1.3); }
}
.feedback-input {
  width: 100%; height: 180rpx; background: #f5f6f8; border-radius: 16rpx;
  padding: 20rpx; font-size: 27rpx; color: #333; margin-bottom: 28rpx; box-sizing: border-box;
}
.submit-btn {
  text-align: center; padding: 26rpx 0;
  background: #07c160;
  color: #fff; font-size: 29rpx; font-weight: 600; border-radius: 48rpx;
  &:active { opacity: 0.85; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(36rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.88); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes heartBeat {
  0% { transform: scale(1); }
  30% { transform: scale(1.35); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
</style>