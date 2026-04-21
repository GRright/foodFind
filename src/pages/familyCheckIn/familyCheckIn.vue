<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="header fade-in">
      <text class="header-title">家庭打卡看板</text>
      <text class="header-sub">{{ todayStr }} · 今天谁没好好吃饭一眼看到</text>
      
      <view class="mode-badge">
        <text class="mb-icon">👨‍👩‍👧‍👦</text>
        <text class="mb-text">{{ familyGroup?.name || '家庭' }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view class="member-checkin-section slide-up" style="animation-delay:0.1s;opacity:0">
        <text class="section-title">今日打卡状态</text>
        <view class="member-checkin-list">
          <view class="member-checkin-card" v-for="member in familyGroup?.members || []" :key="member.userId">
            <view class="mc-header">
              <view class="mc-avatar">
                <text class="mc-char">{{ member.name.charAt(0) }}</text>
              </view>
              <view class="mc-info">
                <text class="mc-name">{{ member.name }}</text>
                <text class="mc-tags" v-if="member.healthTags?.length > 0">
                  <text class="mc-tag" v-for="tag in member.healthTags.slice(0, 2)" :key="tag">{{ getHealthTag(tag).icon }}</text>
                </text>
              </view>
              <view class="mc-status" :class="{ good: getMemberTodayCheckIn(member.userId).allChecked }">
                <text class="mc-status-text">{{ getMemberTodayCheckIn(member.userId).allChecked ? '✓ 完成' : '○ 未完成' }}</text>
              </view>
            </view>
            
            <view class="mc-meals">
              <view class="mc-meal" :class="{ checked: getMemberTodayCheckIn(member.userId).breakfast }">
                <view class="mc-meal-icon">🌅</view>
                <text class="mc-meal-name">早餐</text>
                <view class="mc-meal-check" :class="{ done: getMemberTodayCheckIn(member.userId).breakfast }">
                  <text class="mc-check-mark" v-if="getMemberTodayCheckIn(member.userId).breakfast">✓</text>
                </view>
              </view>
              <view class="mc-meal-divider"></view>
              <view class="mc-meal" :class="{ checked: getMemberTodayCheckIn(member.userId).lunch }">
                <view class="mc-meal-icon">☀️</view>
                <text class="mc-meal-name">午餐</text>
                <view class="mc-meal-check" :class="{ done: getMemberTodayCheckIn(member.userId).lunch }">
                  <text class="mc-check-mark" v-if="getMemberTodayCheckIn(member.userId).lunch">✓</text>
                </view>
              </view>
              <view class="mc-meal-divider"></view>
              <view class="mc-meal" :class="{ checked: getMemberTodayCheckIn(member.userId).dinner }">
                <view class="mc-meal-icon">🌙</view>
                <text class="mc-meal-name">晚餐</text>
                <view class="mc-meal-check" :class="{ done: getMemberTodayCheckIn(member.userId).dinner }">
                  <text class="mc-check-mark" v-if="getMemberTodayCheckIn(member.userId).dinner">✓</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="weekly-section slide-up" style="animation-delay:0.15s;opacity:0">
        <text class="section-title">本周打卡趋势</text>
        <view class="weekly-grid">
          <view class="weekly-day" v-for="day in weekDays" :key="day.date">
            <text class="wd-label">{{ day.label }}</text>
            <text class="wd-date">{{ day.date.slice(5) }}</text>
            <view class="wd-dots">
              <view class="wd-dot" v-for="member in familyGroup?.members || []" :key="member.userId" :class="{ checked: isMemberCheckedOnDay(member.userId, day.date) }"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="stats-section slide-up" style="animation-delay:0.2s;opacity:0">
        <text class="section-title">本周统计</text>
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-value">{{ totalCheckInCount }}</text>
            <text class="stat-label">总打卡次数</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ bestMemberName }}</text>
            <text class="stat-label">最佳打卡者</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getFamilyGroup, getCurrentUserId, getFamilyCheckIns, HEALTH_TAGS } from '@/utils/family.js'

export default {
  data() {
    return {
      pageEnter: true,
      familyGroup: null,
      currentUserId: '',
      checkIns: {},
      todayStr: '',
      weekDays: []
    }
  },
  computed: {
    totalCheckInCount() {
      let count = 0
      const today = this.todayStr
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayCheckins = this.checkIns[d] || {}
        Object.values(dayCheckins).forEach(member => {
          if (member.breakfast) count++
          if (member.lunch) count++
          if (member.dinner) count++
        })
      }
      return count
    },
    bestMemberName() {
      const memberCounts = {}
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayCheckins = this.checkIns[d] || {}
        Object.entries(dayCheckins).forEach(([userId, member]) => {
          if (!memberCounts[userId]) memberCounts[userId] = 0
          if (member.breakfast) memberCounts[userId]++
          if (member.lunch) memberCounts[userId]++
          if (member.dinner) memberCounts[userId]++
        })
      }
      let bestId = ''
      let maxCount = 0
      Object.entries(memberCounts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count
          bestId = id
        }
      })
      if (!bestId) return '暂无'
      const member = this.familyGroup?.members.find(m => m.userId === bestId)
      return member ? member.name : '未知'
    }
  },
  onLoad() {
    this.currentUserId = getCurrentUserId()
    this.familyGroup = getFamilyGroup()
    this.todayStr = new Date().toISOString().split('T')[0]
    this.checkIns = getFamilyCheckIns()
    this.initWeekDays()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
    this.checkIns = getFamilyCheckIns()
  },
  methods: {
    initWeekDays() {
      const days = []
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        const dateStr = d.toISOString().split('T')[0]
        days.push({
          date: dateStr,
          label: '周' + dayNames[d.getDay()]
        })
      }
      this.weekDays = days
    },
    getHealthTag(tagId) {
      return HEALTH_TAGS.find(t => t.id === tagId) || { icon: '' }
    },
    getMemberTodayCheckIn(userId) {
      const today = this.todayStr
      const dayCheckins = this.checkIns[today] || {}
      const member = dayCheckins[userId] || { breakfast: false, lunch: false, dinner: false }
      return {
        ...member,
        allChecked: member.breakfast && member.lunch && member.dinner
      }
    },
    isMemberCheckedOnDay(userId, dateStr) {
      const dayCheckins = this.checkIns[dateStr] || {}
      const member = dayCheckins[userId] || {}
      return member.breakfast || member.lunch || member.dinner
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

.header { padding: 56rpx 0 24rpx; }
.header-title { display: block; font-size: 44rpx; font-weight: 800; color: #1a1a1a; margin-bottom: 8rpx; }
.header-sub { display: block; font-size: 24rpx; color: #999; margin-bottom: 24rpx; }

.mode-badge {
  display: inline-flex; align-items: center; gap: 8rpx;
  background: #e8f7ef; padding: 12rpx 20rpx; border-radius: 28rpx;
  margin-bottom: 24rpx;
}
.mb-icon { font-size: 28rpx; }
.mb-text { font-size: 24rpx; font-weight: 600; color: #07c160; }

.list-scroll { padding-bottom: 48rpx; }

.section-title { font-size: 28rpx; font-weight: 700; color: #1a1a1a; margin-bottom: 16rpx; display: block; }

.member-checkin-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.member-checkin-list { display: flex; flex-direction: column; gap: 20rpx; }

.member-checkin-card {
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 20rpx;
}
.mc-header {
  display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx;
}
.mc-avatar {
  width: 56rpx; height: 56rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mc-char { font-size: 24rpx; font-weight: 700; color: #07c160; }
.mc-info { flex: 1; }
.mc-name { font-size: 24rpx; font-weight: 600; color: #1a1a1a; display: block; }
.mc-tags { display: flex; gap: 4rpx; margin-top: 4rpx; }
.mc-tag { font-size: 18rpx; }
.mc-status {
  padding: 6rpx 16rpx; border-radius: 20rpx; background: #f0f0f0;
  &.good { background: #e8f7ef; }
}
.mc-status-text { font-size: 20rpx; font-weight: 600; color: #999; }
.mc-status.good .mc-status-text { color: #07c160; }

.mc-meals { display: flex; align-items: center; gap: 12rpx; }
.mc-meal {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  padding: 12rpx 8rpx; border-radius: 12rpx; transition: background .2s ease;
  &.checked { background: #e8f7ef; }
}
.mc-meal-icon { font-size: 28rpx; }
.mc-meal-name { font-size: 20rpx; color: #666; font-weight: 500; }
.mc-meal-check {
  width: 32rpx; height: 32rpx; border: 2rpx solid #d0d0d0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &.done { background: #07c160; border-color: #07c160; }
}
.mc-check-mark { font-size: 18rpx; color: #fff; font-weight: 700; }
.mc-meal-divider { width: 2rpx; height: 48rpx; background: #e8e8e8; }

.weekly-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.weekly-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12rpx; }
.weekly-day {
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  padding: 12rpx 4rpx;
}
.wd-label { font-size: 18rpx; color: #999; font-weight: 500; }
.wd-date { font-size: 16rpx; color: #bbb; }
.wd-dots { display: flex; gap: 4rpx; flex-wrap: wrap; justify-content: center; }
.wd-dot {
  width: 12rpx; height: 12rpx; border-radius: 50%; background: #f0f0f0;
  &.checked { background: #07c160; }
}

.stats-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.stat-card {
  background: #f5f6f8; border-radius: 16rpx; padding: 20rpx;
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
}
.stat-value { font-size: 32rpx; font-weight: 800; color: #07c160; text-align: center; }
.stat-label { font-size: 20rpx; color: #999; }
</style>
