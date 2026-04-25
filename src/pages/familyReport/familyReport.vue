<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="header fade-in">
      <text class="header-title">家庭周报</text>
      <text class="header-sub">{{ dateRange }} · {{ viewMode === 'all' ? '全家营养总览' : viewMode === 'self' ? '我的饮食记录' : (selectedMember?.name || '成员') + '的饮食记录' }}</text>
      
      <view class="view-mode-selector">
        <view class="vms-item" :class="{ active: viewMode === 'all' }" @click="setViewMode('all')">
          <text class="vms-icon">👨‍👩‍👧‍👦</text>
          <text class="vms-label">全家</text>
        </view>
        <view class="vms-item" :class="{ active: viewMode === 'self' }" @click="setViewMode('self')">
          <text class="vms-icon">👤</text>
          <text class="vms-label">只看我</text>
        </view>
        <picker mode="selector" :range="memberNames" :value="memberIndex" @change="onMemberPickerChange" v-if="showMemberDropdown">
          <view class="vms-item" :class="{ active: viewMode === 'member' && selectedMember }">
            <text class="vms-icon">👥</text>
            <text class="vms-label">{{ selectedMember ? selectedMember.name : '看某人' }}</text>
            <text class="vms-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view class="hero-section slide-up" style="animation-delay:0.1s;opacity:0">
        <view class="hero-card">
          <text class="hero-label">全家本周坚持</text>
          <view class="hero-value-wrap">
            <text class="hero-value">{{ familyCheckInDays }}</text>
            <text class="hero-unit">天</text>
          </view>
          <text class="hero-sub">好好吃饭</text>
          <view class="hero-members">
            <view class="hm-avatar" v-for="member in familyGroup?.members || []" :key="member.userId">
              <text class="hma-char">{{ member.name.charAt(0) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="nutrition-section slide-up" style="animation-delay:0.15s;opacity:0">
        <text class="section-title">营养总览</text>
        <view class="nutrition-grid">
          <view class="nutrition-card">
            <view class="nc-icon-wrap"><text class="nc-icon">🔥</text></view>
            <text class="nc-value">{{ totalCalories }}</text>
            <text class="nc-label">总热量(kcal)</text>
          </view>
          <view class="nutrition-card">
            <view class="nc-icon-wrap"><text class="nc-icon">🥩</text></view>
            <text class="nc-value">{{ totalProtein }}</text>
            <text class="nc-label">蛋白质(g)</text>
          </view>
          <view class="nutrition-card">
            <view class="nc-icon-wrap"><text class="nc-icon">🥑</text></view>
            <text class="nc-value">{{ totalFat }}</text>
            <text class="nc-label">脂肪(g)</text>
          </view>
          <view class="nutrition-card">
            <view class="nc-icon-wrap"><text class="nc-icon">🍚</text></view>
            <text class="nc-value">{{ totalCarbs }}</text>
            <text class="nc-label">碳水(g)</text>
          </view>
        </view>
      </view>

      <view class="trend-section slide-up" style="animation-delay:0.2s;opacity:0">
        <text class="section-title">每日打卡趋势</text>
        <view class="trend-chart">
          <view class="trend-bars">
            <view class="trend-bar" v-for="day in weekData" :key="day.date">
              <view class="tb-fill" :style="{ height: Math.max(10, (day.mealCount / 21) * 100) + '%' }">
                <text class="tb-value" v-if="day.mealCount > 0">{{ day.mealCount }}</text>
              </view>
              <text class="tb-label">{{ day.label }}</text>
              <text class="tb-date">{{ day.shortDate }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="members-section slide-up" style="animation-delay:0.25s;opacity:0" v-if="viewMode === 'all'">
        <text class="section-title">成员排行</text>
        <view class="member-rank-list">
          <view class="member-rank-item" v-for="(member, idx) in memberRankings" :key="member.userId" :class="{ 'is-top': idx === 0 }">
            <view class="mri-rank">
              <text class="mri-rank-num" :class="{ 'gold': idx === 0, 'silver': idx === 1, 'bronze': idx === 2 }">{{ idx + 1 }}</text>
            </view>
            <view class="mri-avatar">
              <text class="mri-char">{{ member.name.charAt(0) }}</text>
            </view>
            <view class="mri-info">
              <text class="mri-name">{{ member.name }}</text>
              <view class="mri-bar-wrap">
                <view class="mri-bar" :style="{ width: member.percent + '%' }"></view>
              </view>
            </view>
            <text class="mri-count">{{ member.count }}餐</text>
          </view>
        </view>
      </view>

      <view class="health-section slide-up" style="animation-delay:0.3s;opacity:0" v-if="familyHealthTags.length > 0">
        <text class="section-title">家庭健康关注</text>
        <view class="health-tags-list">
          <view class="htl-item" v-for="tag in familyHealthTags" :key="tag.id">
            <text class="htl-icon">{{ tag.icon }}</text>
            <text class="htl-name">{{ tag.name }}</text>
            <text class="htl-hint">已为您过滤不合适菜品</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getFamilyGroup, getCurrentUserId, getFamilyCheckIns, fetchFamilyCheckIns, getFamilyHealthTags, HEALTH_TAGS } from '@/utils/family.js'

export default {
  data() {
    return {
      pageEnter: true,
      familyGroup: null,
      currentUserId: '',
      checkIns: {},
      weekData: [],
      _totalCalories: 0,
      _totalProtein: 0,
      _totalFat: 0,
      _totalCarbs: 0,
      familyHealthTags: [],
      viewMode: 'all',
      selectedMember: null,
      showMemberDropdown: true
    }
  },
  computed: {
    dateRange() {
      const end = new Date()
      const start = new Date(end.getTime() - 6 * 86400000)
      return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
    },
    memberNames() {
      return (this.familyGroup?.members || []).map(m => m.name)
    },
    memberIndex() {
      if (!this.selectedMember) return 0
      const idx = (this.familyGroup?.members || []).findIndex(m => m.userId === this.selectedMember.userId)
      return idx >= 0 ? idx : 0
    },
    familyCheckInDays() {
      let days = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayCheckins = this.checkIns[d] || {}
        
        if (this.viewMode === 'all') {
          const hasAnyCheckIn = Object.values(dayCheckins).some(m => m.breakfast || m.lunch || m.dinner)
          if (hasAnyCheckIn) days++
        } else if (this.viewMode === 'self') {
          const member = dayCheckins[this.currentUserId]
          if (member && (member.breakfast || member.lunch || member.dinner)) days++
        } else if (this.viewMode === 'member' && this.selectedMember) {
          const member = dayCheckins[this.selectedMember.userId]
          if (member && (member.breakfast || member.lunch || member.dinner)) days++
        }
      }
      return days
    },
    totalCalories() {
      return this._totalCalories
    },
    totalProtein() {
      return this._totalProtein
    },
    totalFat() {
      return this._totalFat
    },
    totalCarbs() {
      return this._totalCarbs
    },
    memberRankings() {
      const memberCounts = {}
      const members = this.familyGroup?.members || []
      members.forEach(m => { memberCounts[m.userId] = { ...m, count: 0 } })
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayCheckins = this.checkIns[d] || {}
        Object.entries(dayCheckins).forEach(([userId, member]) => {
          if (memberCounts[userId]) {
            if (member.breakfast) memberCounts[userId].count++
            if (member.lunch) memberCounts[userId].count++
            if (member.dinner) memberCounts[userId].count++
          }
        })
      }
      
      const sorted = Object.values(memberCounts).sort((a, b) => b.count - a.count)
      const maxCount = sorted.length > 0 ? sorted[0].count : 1
      return sorted.map(m => ({ ...m, percent: maxCount > 0 ? (m.count / maxCount) * 100 : 0 }))
    }
  },
  onLoad() {
    this.currentUserId = getCurrentUserId()
    this.familyGroup = getFamilyGroup()
    this.checkIns = getFamilyCheckIns()
    this.initWeekData()
    this.calcWeeklyNutrition()
    this.familyHealthTags = getFamilyHealthTags().map(id => HEALTH_TAGS.find(t => t.id === id)).filter(Boolean)
    this.syncFromCloud()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
    this.checkIns = getFamilyCheckIns()
    this.initWeekData()
    this.syncFromCloud()
  },
  methods: {
    async syncFromCloud() {
      if (!this.familyGroup) return
      const today = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const result = await fetchFamilyCheckIns(startDate, today)
      if (result.success) {
        this.checkIns = getFamilyCheckIns()
        this.initWeekData()
        this.calcWeeklyNutrition()
      }
    },
    initWeekData() {
      const days = []
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        const dateStr = d.toISOString().split('T')[0]
        const dayCheckins = this.checkIns[dateStr] || {}
        
        let mealCount = 0
        
        if (this.viewMode === 'all') {
          Object.values(dayCheckins).forEach(member => {
            if (member.breakfast) mealCount++
            if (member.lunch) mealCount++
            if (member.dinner) mealCount++
          })
        } else if (this.viewMode === 'self') {
          const member = dayCheckins[this.currentUserId]
          if (member) {
            if (member.breakfast) mealCount++
            if (member.lunch) mealCount++
            if (member.dinner) mealCount++
          }
        } else if (this.viewMode === 'member' && this.selectedMember) {
          const member = dayCheckins[this.selectedMember.userId]
          if (member) {
            if (member.breakfast) mealCount++
            if (member.lunch) mealCount++
            if (member.dinner) mealCount++
          }
        }
        
        days.push({
          date: dateStr,
          label: '周' + dayNames[d.getDay()],
          shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
          mealCount
        })
      }
      this.weekData = days
    },
    calcWeeklyNutrition() {
      const weeklyData = uni.getStorageSync('foodfind_weekly') || {}
      let calories = 0, protein = 0, fat = 0, carbs = 0
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayMeals = weeklyData[d]
        if (dayMeals) {
          ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            const recipes = dayMeals[mealType] || []
            recipes.forEach(recipe => {
              calories += recipe.nutrition?.calories || 0
              protein += recipe.nutrition?.protein || 0
              fat += recipe.nutrition?.fat || 0
              carbs += recipe.nutrition?.carbs || 0
            })
          })
        }
      }
      
      this._totalCalories = Math.round(calories)
      this._totalProtein = Math.round(protein)
      this._totalFat = Math.round(fat)
      this._totalCarbs = Math.round(carbs)
    },
    setViewMode(mode) {
      this.viewMode = mode
      if (mode === 'self') {
        this.selectedMember = null
      }
      this.initWeekData()
      this.calcWeeklyNutrition()
    },
    onMemberPickerChange(e) {
      const idx = e.detail.value
      const members = this.familyGroup?.members || []
      if (members[idx]) {
        this.selectedMember = members[idx]
        this.viewMode = 'member'
        this.initWeekData()
        this.calcWeeklyNutrition()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F6FA;
  padding: 0 28rpx;
}

.header { padding: 56rpx 0 24rpx; overflow: visible; }
.header-title { display: block; font-size: 44rpx; font-weight: 800; color: #1a1a1a; margin-bottom: 8rpx; }
.header-sub { display: block; font-size: 24rpx; color: #999; margin-bottom: 24rpx; }

.view-mode-selector {
  display: flex; gap: 12rpx; margin-bottom: 24rpx; position: relative;
}
.vms-item {
  display: flex; align-items: center; gap: 6rpx;
  background: #fff; padding: 12rpx 20rpx; border-radius: 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,.06);
  transition: all .2s ease;
  &:active { transform: scale(.95); }
  &.active {
    background: #07c160;
    .vms-icon, .vms-label { color: #fff; }
  }
}
.vms-icon { font-size: 24rpx; }
.vms-label { font-size: 22rpx; font-weight: 600; color: #666; }
.vms-arrow { font-size: 20rpx; color: #ccc; margin-left: 4rpx; }

.list-scroll { padding-bottom: 48rpx; }

.section-title { font-size: 28rpx; font-weight: 700; color: #1a1a1a; margin-bottom: 16rpx; display: block; }

.hero-section { margin-bottom: 24rpx; }
.hero-card {
  background: linear-gradient(135deg, #07c160 0%, #06a652 100%);
  border-radius: 28rpx; padding: 48rpx 32rpx; text-align: center;
  box-shadow: 0 8rpx 30rpx rgba(7,193,96,.25);
}
.hero-label { font-size: 24rpx; color: rgba(255,255,255,.85); display: block; margin-bottom: 16rpx; }
.hero-value-wrap { display: flex; align-items: baseline; justify-content: center; gap: 8rpx; }
.hero-value { font-size: 80rpx; font-weight: 900; color: #fff; line-height: 1; }
.hero-unit { font-size: 32rpx; font-weight: 700; color: rgba(255,255,255,.9); }
.hero-sub { font-size: 26rpx; color: rgba(255,255,255,.85); display: block; margin-top: 8rpx; }
.hero-members { display: flex; gap: 12rpx; justify-content: center; margin-top: 24rpx; }
.hm-avatar {
  width: 56rpx; height: 56rpx; background: rgba(255,255,255,.25); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2rpx solid rgba(255,255,255,.35);
}
.hma-char { font-size: 24rpx; font-weight: 700; color: #fff; }

.nutrition-section {
  background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.nutrition-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.nutrition-card {
  background: #f5f6f8; border-radius: 20rpx; padding: 24rpx; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
}
.nc-icon-wrap { width: 64rpx; height: 64rpx; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.nc-icon { font-size: 32rpx; }
.nc-value { font-size: 36rpx; font-weight: 800; color: #1a1a1a; }
.nc-label { font-size: 22rpx; color: #999; }

.trend-section {
  background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.trend-chart { padding: 16rpx 0; }
.trend-bars { display: flex; justify-content: space-between; align-items: flex-end; gap: 12rpx; height: 200rpx; }
.trend-bar { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 8rpx; }
.tb-fill {
  width: 100%; background: linear-gradient(180deg, #07c160 0%, #06a552 100%); border-radius: 14rpx 14rpx 6rpx 6rpx;
  display: flex; align-items: center; justify-content: center; min-height: 20rpx; transition: height .6s ease;
}
.tb-value { font-size: 22rpx; color: #fff; font-weight: 700; }
.tb-label { font-size: 20rpx; color: #666; font-weight: 500; }
.tb-date { font-size: 18rpx; color: #bbb; }

.members-section {
  background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.member-rank-list { display: flex; flex-direction: column; gap: 16rpx; }
.member-rank-item {
  display: flex; align-items: center; gap: 16rpx; padding: 16rpx; background: #f5f6f8; border-radius: 16rpx;
  &.is-top { background: #e8f7ef; }
}
.mri-rank { width: 40rpx; text-align: center; flex-shrink: 0; }
.mri-rank-num { font-size: 24rpx; font-weight: 700; color: #999; }
.mri-rank-num.gold { color: #f39c12; }
.mri-rank-num.silver { color: #7f8c8d; }
.mri-rank-num.bronze { color: #d35400; }
.mri-avatar {
  width: 56rpx; height: 56rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mri-char { font-size: 24rpx; font-weight: 700; color: #07c160; }
.mri-info { flex: 1; }
.mri-name { font-size: 24rpx; font-weight: 600; color: #1a1a1a; display: block; margin-bottom: 8rpx; }
.mri-bar-wrap { width: 100%; height: 12rpx; background: #e8e8e8; border-radius: 6rpx; overflow: hidden; }
.mri-bar { height: 100%; background: linear-gradient(90deg, #07c160, #09e370); border-radius: 6rpx; transition: width .6s ease; }
.mri-count { font-size: 24rpx; font-weight: 700; color: #07c160; flex-shrink: 0; }

.health-section {
  background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.health-tags-list { display: flex; flex-direction: column; gap: 12rpx; }
.htl-item {
  display: flex; align-items: center; gap: 12rpx; padding: 16rpx; background: #f5f6f8; border-radius: 12rpx;
}
.htl-icon { font-size: 28rpx; }
.htl-name { font-size: 24rpx; font-weight: 600; color: #1a1a1a; flex: 1; }
.htl-hint { font-size: 20rpx; color: #07c160; }
</style>
