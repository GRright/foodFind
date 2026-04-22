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
            <view class="step-right"><text class="step-text">{{ step }}</text></view>
          </view>
        </view>
      </view>

      <view class="section-card slide-up" style="animation-delay:0.5s;opacity:0">
        <view class="section-title-row">
          <text class="sec-deco">"</text>
          <text class="sec-title">小贴士</text>
          <text class="sec-deco">"</text>
        </view>
        <view class="tips-content">
          <view class="tip-item" v-for="(tip, idx) in tips" :key="idx">
            <text class="tip-bullet">•</text>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>
      </view>

      <view class="reaction-section slide-up" style="animation-delay:0.6s;opacity:0">
        <text class="rs-title">这道菜怎么样？</text>
        <view class="reaction-buttons">
          <button class="reaction-btn like-btn" :class="{ active: userReaction === 'like' }" @click="setReaction('like')">
            <text class="reaction-icon">👍</text>
            <text class="reaction-text">喜欢</text>
          </button>
          <button class="reaction-btn dislike-btn" :class="{ active: userReaction === 'dislike' }" @click="setReaction('dislike')">
            <text class="reaction-icon">👎</text>
            <text class="reaction-text">不喜欢</text>
          </button>
        </view>
      </view>

      <view style="height: 80rpx;"></view>
    </scroll-view>
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
        ingredients: [{ name: '番茄', amount: '2 个约 200g' }, { name: '鸡蛋', amount: '3 个约 165g' }],
        steps: ['番茄切块', '鸡蛋打散炒熟', '放入番茄一起炒', '加盐调味即可']
      },
      detailHeight: 'calc(100vh - 420rpx)',
      userReaction: null
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.recipeId = options.id
      this.loadRecipe()
    }
    this.checkUserReaction()
  },
  methods: {
    loadRecipe() {
      const allRecipes = [
        ...ALL_RECIPES.breakfast,
        ...ALL_RECIPES.lunch,
        ...ALL_RECIPES.dinner
      ]
      const found = allRecipes.find(r => r.id == this.recipeId)
      if (found) {
        this.recipe = found
      }
    },
    checkUserReaction() {
      try {
        let favorites = uni.getStorageSync('foodfind_favorites') || []
        const isLiked = favorites.some(f => f.id === this.recipeId)
        if (isLiked) {
          this.userReaction = 'like'
        } else {
          // 检查是否在dislike列表中
          let dislikes = uni.getStorageSync('foodfind_dislikes') || []
          if (dislikes.some(d => d.id === this.recipeId)) {
            this.userReaction = 'dislike'
          }
        }
      } catch (e) {}
    },
    setReaction(type) {
      this.userReaction = type
      try {
        let favorites = uni.getStorageSync('foodfind_favorites') || []
        let dislikes = uni.getStorageSync('foodfind_dislikes') || []
        
        if (type === 'like') {
          // 从dislikes中移除
          dislikes = dislikes.filter(d => d.id !== this.recipeId)
          uni.setStorageSync('foodfind_dislikes', dislikes)
          // 添加到favorites
          if (!favorites.some(f => f.id === this.recipeId)) {
            favorites.unshift(this.recipe)
            uni.setStorageSync('foodfind_favorites', favorites)
          }
          uni.showToast({ title: '已标记为喜欢', icon: 'success' })
        } else if (type === 'dislike') {
          // 从favorites中移除
          favorites = favorites.filter(f => f.id !== this.recipeId)
          uni.setStorageSync('foodfind_favorites', favorites)
          // 添加到dislikes
          if (!dislikes.some(d => d.id === this.recipeId)) {
            dislikes.unshift(this.recipe)
            uni.setStorageSync('foodfind_dislikes', dislikes)
          }
          uni.showToast({ title: '已标记为不喜欢', icon: 'none' })
        }
      } catch (e) {}
    }
  },
  computed: {
    tips() {
      const list = []
      if (this.recipe.difficulty === '简单') {
        list.push('新手友好，不易翻车')
        list.push('火候控制是关键')
      }
      if (this.recipe.nutrition?.protein > 15) {
        list.push('优质蛋白来源')
      }
      if (this.recipe.nutrition?.calories < 300) {
        list.push('热量适中，适合减脂期食用')
      }
      if (!list.length) {
        list.push('用心烹饪，味道更佳')
        list.push('可根据个人口味调整调料用量')
      }
      return list
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; }

.recipe-hero {
  height: 420rpx; background: #07c160;
  display: flex; align-items: center; justify-content: center; position: relative;
  overflow: visible;
}
.hero-emoji { font-size: 140rpx; }
.hero-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 32rpx; background: rgba(0,0,0,.2);
  padding-top: calc(48rpx + env(safe-area-inset-top));
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
  background: #fff; margin: 0 28rpx 24rpx; border-radius: 24rpx;
  padding: 40rpx 28rpx; display: flex; align-items: center; justify-content: space-around;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
}
.nutri-item { display: flex; flex-direction: column; align-items: center; gap: 10rpx; flex: 1; min-width: 0; }
.nutri-value { font-size: 34rpx; font-weight: 700; color: #1a1a1a; white-space: nowrap; }
.nutri-label { font-size: 23rpx; color: #999; white-space: nowrap; }
.nutri-divider { width: 1rpx; height: 56rpx; background: #eee; flex-shrink: 0; }

.section-card {
  background: #fff; margin: 0 28rpx 24rpx; border-radius: 24rpx;
  padding: 36rpx 32rpx; box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
}

.section-title-row {
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  margin-bottom: 28rpx;
}
.sec-deco { font-size: 32rpx; color: #ddd; font-weight: 300; line-height: 1; }
.sec-title { font-size: 30rpx; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5rpx; }

.ing-list { display: flex; flex-direction: column; gap: 18rpx; }
.ing-item {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14rpx; border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; padding-bottom: 0; }
}
.ing-name { font-size: 27rpx; color: #333; font-weight: 500; }
.ing-amount { font-size: 25rpx; color: #999; }

.steps-list { display: flex; flex-direction: column; gap: 32rpx; }
.step-item { display: flex; gap: 20rpx; align-items: flex-start; }
.step-left { flex-shrink: 0; }
.step-num-wrap {
  width: 52rpx; height: 52rpx; background: linear-gradient(135deg, #07c160, #06ad56);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(7,193,96,.25);
}
.step-num { font-size: 26rpx; color: #fff; font-weight: 700; }
.step-right { flex: 1; padding-top: 8rpx; }
.step-text { font-size: 27rpx; color: #333; line-height: 1.7; }

.tips-content { display: flex; flex-direction: column; gap: 16rpx; }
.tip-item { display: flex; gap: 12rpx; align-items: flex-start; }
.tip-bullet { font-size: 30rpx; color: #07c160; font-weight: 700; line-height: 1.3; }
.tip-text { font-size: 26rpx; color: #666; line-height: 1.6; }

.reaction-section {
  margin: 0 28rpx 24rpx; padding: 36rpx 32rpx;
  background: #fff; border-radius: 24rpx;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
  text-align: center;
}
.reaction-section .rs-title { font-size: 30rpx; font-weight: 700; color: #1a1a1a; display: block; margin-bottom: 28rpx; }
.reaction-buttons { display: flex; justify-content: center; gap: 24rpx; }
.reaction-btn {
  flex: 1; max-width: 240rpx;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  padding: 28rpx 0;
  border-radius: 24rpx;
  background: #f5f6f8;
  transition: all .25s ease;
  &::after { display: none; }
  &:active { transform: scale(.96); }
}
.reaction-btn.like-btn {
  background: #f0f9f0;
  &.active { background: #07c160; }
  .reaction-icon, .reaction-text { color: #07c160; }
  &.active .reaction-icon, &.active .reaction-text { color: #fff; }
}
.reaction-btn.dislike-btn {
  background: #fef0f0;
  &.active { background: #ff6b6b; }
  .reaction-icon, .reaction-text { color: #ff6b6b; }
  &.active .reaction-icon, &.active .reaction-text { color: #fff; }
}
.reaction-icon { font-size: 40rpx; }
.reaction-text { font-size: 28rpx; font-weight: 600; }

@keyframes scaleIn {
  from { transform: scale(.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.scale-in { animation: scaleIn .5s cubic-bezier(.17,.67,.29,1.49) both; }
.slide-up { animation: slideUp .45s ease both; }
</style>
