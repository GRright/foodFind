<template>
  <view class="page">
    <view class="header">
    <text class="title">📖 美食日记</text>
    <text class="subtitle">分享美好的美食时光</text>
  </view>

  <view class="today-diary" v-if="viewMode || todayDiary">
    <view class="dc-header">
      <text class="dc-date">{{ (viewMode && diaryList[0]?.date || todayDiary?.date) }}</text>
      <view class="dc-rating">
        <text class="dc-star" v-for="n in (viewMode && diaryList[0]?.rating || todayDiary?.rating)" :key="n">⭐</text>
      </view>
    </view>
    <view class="dc-meals">
      <text class="dc-meal" v-for="(m, j) in (viewMode && diaryList[0]?.meals || todayDiary?.meals)" :key="j">{{ m }}</text>
    </view>
    <view class="dc-mood" v-if="viewMode && diaryList[0]?.mood || todayDiary?.mood">
      <text class="dc-mood-icon">{{ viewMode && diaryList[0]?.mood || todayDiary?.mood }}</text>
    </view>
    <text class="dc-note" v-if="viewMode && diaryList[0]?.note || todayDiary?.note">{{ viewMode && diaryList[0]?.note || todayDiary?.note }}</text>
  </view>

  <template v-if="!viewMode">
    <view class="diary-form" v-if="!todayDiary">
      <view class="form-section">
        <text class="section-title">今天吃了什么？</text>
        <view class="meal-inputs">
          <view class="meal-row" v-for="(meal, i) in meals" :key="i">
            <input class="meal-input" v-model="meals[i]" :placeholder="'第' + (i+1) + '餐'" maxlength="30" />
            <view class="meal-del" v-if="meals.length > 1" @click="removeMeal(i)"><text>✕</text></view>
          </view>
          <view class="add-meal" v-if="meals.length < 5" @click="addMeal"><text>+ 添加一餐</text></view>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">今天心情如何？</text>
        <view class="mood-selector">
          <view class="mood-item" v-for="(m, i) in moods" :key="i" :class="{ selected: selectedMood === m.value }" @click="selectedMood = m.value">
            <text class="mood-icon">{{ m.icon }}</text>
            <text class="mood-text">{{ m.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">给今天的美食评分</text>
        <view class="rating-selector">
          <view class="star" v-for="n in 5" :key="n" :class="{ active: n <= rating }" @click="rating = n">
            <text class="star-icon">⭐</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">写点备注（可选）</text>
        <textarea class="note-input" v-model="note" placeholder="今天的美食体验..." maxlength="200" />
      </view>

      <view class="save-btn" @click="saveDiary">
        <text class="save-text">保存日记</text>
      </view>
    </view>

    <view class="diary-list">
      <text class="list-title">历史日记</text>
      <view class="diary-card" v-for="(d, i) in diaryList" :key="i">
        <view class="dc-header">
          <text class="dc-date">{{ d.date }}</text>
          <view class="dc-rating">
            <text class="dc-star" v-for="n in d.rating" :key="n">⭐</text>
          </view>
        </view>
        <view class="dc-meals">
          <text class="dc-meal" v-for="(m, j) in d.meals" :key="j">{{ m }}</text>
        </view>
        <view class="dc-mood" v-if="d.mood">
          <text class="dc-mood-icon">{{ d.mood }}</text>
        </view>
        <text class="dc-note" v-if="d.note">{{ d.note }}</text>
      </view>
      <view class="empty-diary" v-if="diaryList.length === 0 && !todayDiary">
        <text class="ed-icon">📝</text>
        <text class="ed-text">还没有日记，开始记录吧~</text>
      </view>
    </view>
  </template>
  </view>
</template>

<script>
import { markDirty } from '../../utils/cloud.js'
export default {
  data() {
    return {
      meals: [''],
      moods: [
        { value: '😋', label: '超满足' },
        { value: '😊', label: '开心' },
        { value: '😐', label: '一般' },
        { value: '😕', label: '不太行' },
        { value: '😫', label: '踩雷了' }
      ],
      selectedMood: '',
      rating: 0,
      note: '',
      diaryList: [],
      todayDiary: null,
      viewMode: false
    }
  },
  onLoad(options) {
    this.viewMode = !!options.viewDiary
    this.loadDiaryList()
    this.loadTodayDiary()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
  },
  onShareAppMessage() {
    if (this.todayDiary) {
      return {
        title: `我的美食日记 - ${this.todayDiary.date}`,
        path: `/pages/foodDiary/foodDiary?viewDiary=1`,
        imageUrl: ''
      }
    }
    return {
      title: '看看我的美食日记',
      path: '/pages/foodDiary/foodDiary',
      imageUrl: ''
    }
  },
  methods: {
    addMeal() {
      if (this.meals.length < 5) {
        this.meals.push('')
      }
    },
    removeMeal(i) {
      if (this.meals.length > 1) {
        this.meals.splice(i, 1)
      }
    },
    loadTodayDiary() {
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      
      const diaryList = uni.getStorageSync('foodfind_diary_list') || []
      this.todayDiary = diaryList.find(d => d.date === dateStr)
      
      if (!this.viewMode && !this.todayDiary) {
        this.autoFillFromCheckIn()
      }
    },
    autoFillFromCheckIn() {
      const checks = uni.getStorageSync('foodfind_personal_checks') || {}
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      
      const todayCheck = checks[dateStr]
      if (todayCheck) {
        const meals = []
        if (todayCheck.breakfast) meals.push('早餐')
        if (todayCheck.lunch) meals.push('午餐')
        if (todayCheck.dinner) meals.push('晚餐')
        
        const dailyMeals = uni.getStorageSync('foodfind_meals')
        if (dailyMeals) {
          ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            if (dailyMeals[mealType]) {
              dailyMeals[mealType].forEach(recipe => {
                if (recipe.name) meals.push(recipe.name)
              })
            }
          })
        }
        
        if (meals.length > 0) {
          this.meals = meals.slice(0, 5)
        }
      }
    },
    saveDiary() {
      const validMeals = this.meals.filter(m => m.trim())
      if (validMeals.length === 0) {
        uni.showToast({ title: '至少记录一餐', icon: 'none' })
        return
      }
      if (this.rating === 0) {
        uni.showToast({ title: '请评分', icon: 'none' })
        return
      }

      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

      const diaryEntry = {
        date: dateStr,
        meals: validMeals,
        mood: this.selectedMood,
        rating: this.rating,
        note: this.note,
        createdAt: new Date().toISOString()
      }

      const diaryList = uni.getStorageSync('foodfind_diary_list') || []
      const existingIndex = diaryList.findIndex(d => d.date === dateStr)
      if (existingIndex >= 0) {
        diaryList[existingIndex] = diaryEntry
      } else {
        diaryList.unshift(diaryEntry)
      }
      uni.setStorageSync('foodfind_diary_list', diaryList)
      markDirty('diary_list')

      uni.showToast({ title: '保存成功', icon: 'success' })
      this.meals = ['']
      this.selectedMood = ''
      this.rating = 0
      this.note = ''
      this.loadDiaryList()
      this.loadTodayDiary()
    },
    loadDiaryList() {
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      
      const all = uni.getStorageSync('foodfind_diary_list') || []
      this.diaryList = all.filter(d => d.date !== dateStr)
    },
    shareTodayDiary() {
      uni.showToast({ title: '准备分享', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F6FA; padding:0 28rpx 40rpx; }
.header { padding:56rpx 0 32rpx; text-align:center; }
.title { font-size:44rpx; font-weight:800; color:#1a1a1a; display:block; }
.subtitle { font-size:24rpx; color:#999; margin-top:8rpx; display:block; }

.today-diary { background:#e8f7ef; border-radius:24rpx; padding:32rpx; margin-bottom:24rpx; box-shadow:0 2rpx 12rpx rgba(7,193,96,.1); }

.diary-form { background:#fff; border-radius:24rpx; padding:32rpx; margin-bottom:24rpx; box-shadow:0 2rpx 12rpx rgba(0,0,0,.04); }
.form-section { margin-bottom:28rpx; }
.section-title { font-size:26rpx; font-weight:600; color:#333; margin-bottom:16rpx; display:block; }

.meal-inputs { }
.meal-row { display:flex; align-items:center; gap:12rpx; margin-bottom:12rpx; }
.meal-input { flex:1; height:64rpx; padding:0 20rpx; background:#f5f5f5; border-radius:16rpx; font-size:26rpx; color:#333; }
.meal-del { width:56rpx; height:56rpx; display:flex; align-items:center; justify-content:center; background:#ff4757; border-radius:50%; text { font-size:24rpx; color:#fff; } }
.add-meal { padding:16rpx; text-align:center; text { font-size:24rpx; color:#07c160; font-weight:500; } }

.mood-selector { display:flex; flex-wrap:wrap; gap:16rpx; }
.mood-item { padding:16rpx 24rpx; background:#f5f5f5; border-radius:20rpx; display:flex; align-items:center; gap:8rpx; transition:all .2s ease; &.selected { background:#e8f7ef; border:2rpx solid #07c160; } }
.mood-icon { font-size:32rpx; }
.mood-text { font-size:22rpx; color:#666; font-weight:500; }

.rating-selector { display:flex; gap:12rpx; }
.star { transition:all .2s ease; &.active { transform:scale(1.1); } }
.star-icon { font-size:48rpx; }

.note-input { width:100%; min-height:160rpx; padding:20rpx; background:#f5f5f5; border-radius:16rpx; font-size:26rpx; color:#333; box-sizing:border-box; }

.save-btn { padding:20rpx 0; background:#07c160; border-radius:48rpx; text-align:center; margin-top:24rpx; &:active { opacity:.85; } }
.save-text { font-size:28rpx; color:#fff; font-weight:600; }

.share-btn { padding:20rpx 0; background:#1a1a1a; border-radius:48rpx; text-align:center; margin-top:24rpx; &:active { opacity:.85; } }
.share-text { font-size:28rpx; color:#fff; font-weight:600; }

.diary-list { }
.list-title { font-size:30rpx; font-weight:700; color:#1a1a1a; margin-bottom:16rpx; display:block; }

.diary-card { background:#fff; border-radius:20rpx; padding:24rpx; margin-bottom:16rpx; box-shadow:0 2rpx 12rpx rgba(0,0,0,.04); }
.dc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12rpx; }
.dc-date { font-size:24rpx; font-weight:600; color:#333; }
.dc-rating { display:flex; gap:4rpx; }
.dc-star { font-size:20rpx; }
.dc-meals { display:flex; flex-wrap:wrap; gap:8rpx; margin-bottom:12rpx; }
.dc-meal { padding:8rpx 16rpx; background:#f5f5f5; border-radius:12rpx; font-size:22rpx; color:#666; }
.dc-mood { margin-bottom:8rpx; }
.dc-mood-icon { font-size:32rpx; }
.dc-note { font-size:24rpx; color:#999; line-height:1.5; display:block; }

.empty-diary { display:flex; flex-direction:column; align-items:center; padding:80rpx 0; }
.ed-icon { font-size:60rpx; margin-bottom:16rpx; }
.ed-text { font-size:24rpx; color:#bbb; }
</style>
