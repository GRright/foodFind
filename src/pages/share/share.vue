<template>
  <view class="page">
    <view class="share-hero">
      <text class="hero-emoji">{{ isReceiver ? '✉' : '♥' }}</text>
      <text class="hero-text" v-if="isReceiver">{{ fromName }} 给你分享了今日菜单！</text>
      <text class="hero-text" v-else>已发送给 {{ partnerName }}</text>
      <text class="hero-sub" v-if="isReceiver">看看喜不喜欢，可以确认或调整哦~</text>
      <text class="hero-sub" v-else>等待TA确认菜单...</text>
      <text class="hero-time">{{ shareTime }}</text>
      <view class="refresh-hint" v-if="isSender && shareId">
        <text class="refresh-icon">🔄</text>
        <text class="refresh-text" @click="refreshStatus">刷新查看TA的操作</text>
      </view>
    </view>

    <scroll-view scroll-y class="body-scroll" :style="{ height: bodyHeight }">
      <view class="status-bar" :class="statusClass" v-if="!loading">
        <text class="status-dot"></text>
        <text class="status-text">{{ statusText }}</text>
      </view>

      <view class="loading-card" v-if="loading">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在加载菜单...</text>
      </view>

      <template v-else>
        <view class="meal-section" v-for="(meal, mi) in gridRows" :key="mi">
          <view class="meal-header">
            <text class="mh-icon">{{ meal.icon }}</text>
            <text class="mh-title">{{ meal.title }}</text>
            <text class="mh-cal">{{ meal.cal }} kcal</text>
          </view>
          <view class="food-row">
            <view class="food-card" v-for="(food, fi) in meal.recipes" :key="food.id" @click="viewRecipe(food)">
              <view class="fc-icon-wrap"><text class="fc-icon">{{ food.image || '🍽️' }}</text></view>
              <text class="fc-name">{{ food.name }}</text>
              <text class="fc-kcal">{{ food.nutrition.calories }} kcal</text>
            </view>
          </view>
        </view>

        <view class="action-area" v-if="isReceiver">
          <view class="primary-btn" @click="confirmMeals">
          <text class="btn-icon">✓</text>
          <text class="btn-text">这个菜单不错，就它了！</text>
        </view>
        <view class="secondary-btn" @click="modifyMeals">
          <text class="btn-icon">✎</text>
          <text class="btn-text">我想换几道菜</text>
        </view>
        <view class="tertiary-btn" @click="shareBack">
          <text class="btn-icon">↩</text>
          <text class="btn-text">我也用这个菜单</text>
        </view>
        </view>

        <view class="action-area" v-else>
          <view class="waiting-card">
            <text class="waiting-icon">⌛</text>
            <text class="waiting-text">等待{{ partnerName }}查看并确认...</text>
            <text class="waiting-hint">点击上方「刷新」查看最新状态</text>
          </view>
          <view class="secondary-btn" @click="resendShare">
            <text class="btn-icon">↻</text>
          <text class="btn-text">重新生成并发送</text>
          </view>
        </view>
      </template>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'

export default {
  data() {
    return {
      mode: 'view',
      dailyMeals: { breakfast: [], lunch: [], dinner: [] },
      partnerName: '',
      fromName: '',
      isReceiver: false,
      isSender: false,
      shareTime: '',
      status: 'pending',
      bodyHeight: 'calc(100vh - 420rpx)',
      shareId: '',
      loading: true
    }
  },
  computed: {
    gridRows() {
      return [
        { title: '早餐', icon: '🌅', recipes: this.dailyMeals.breakfast || [] },
        { title: '午餐', icon: '☀️', recipes: this.dailyMeals.lunch || [] },
        { title: '晚餐', icon: '🌙', recipes: this.dailyMeals.dinner || [] }
      ].map(m => ({
        ...m,
        cal: (m.recipes||[]).reduce((s, r) => s + (r.nutrition?.calories||0), 0)
      }))
    },
    statusClass() {
      return this.status === 'confirmed' ? 'status-ok' : this.status === 'modified' ? 'status-modified' : 'status-pending'
    },
    statusText() {
      const map = { pending: '待确认', confirmed: '✅ TA已确认', modified: '✏️ TA做了调整' }
      return map[this.status] || '待确认'
    }
  },
  onLoad(options) {
    if (options.sid) {
      this.loadFromCloud(options.sid)
    } else {
      this.loadFromLocal()
    }
  },
  methods: {
    loadFromCloud(sid) {
      this.shareId = sid
      this.loading = true

      wx.cloud.callFunction({
        name: 'getShareMenu',
        data: { shareId: sid }
      }).then(res => {
        if (res.result && res.result.code === 0) {
          const data = res.result.data
          this.dailyMeals = data.meals || { breakfast: [], lunch: [], dinner: [] }
          this.fromName = data.fromName || 'TA'
          this.partnerName = data.toName || '我'
          this.isReceiver = true
          this.isSender = false
          this.status = data.status || 'pending'
          this.shareTime = data.time || new Date().toLocaleString()
        } else {
          uni.showToast({ title: '分享已过期或不存在', icon: 'none' })
          setTimeout(() => { uni.switchTab({ url: '/pages/index/index' }) }, 1500)
        }
      }).catch(err => {
        console.error('loadFromCloud error:', err)
        uni.showToast({ title: '加载失败，请重试', icon: 'none' })
      }).finally(() => {
        this.loading = false
      })
    },

    loadFromLocal() {
      this.mode = 'view'
      const data = uni.getStorageSync('foodfind_share_data')
      if (data) {
        this.dailyMeals = data.meals || { breakfast: [], lunch: [], dinner: [] }
        this.partnerName = data.toName || 'TA'
        this.fromName = data.fromName || ''
        this.isSender = this.mode === 'send'
        this.isReceiver = !this.isSender
        this.shareTime = data.time || ''
        this.status = data.status || 'pending'
        this.loading = false
      } else {
        this.loading = false
      }
    },

    refreshStatus() {
      if (!this.shareId) return
      wx.showLoading({ title: '刷新中...' })
      wx.cloud.callFunction({
        name: 'getShareMenu',
        data: { shareId: this.shareId }
      }).then(res => {
        if (res.result && res.result.code === 0) {
          const oldStatus = this.status
          const data = res.result.data
          this.dailyMeals = data.meals || this.dailyMeals
          this.status = data.status || 'pending'
          if (oldStatus !== this.status && this.status === 'confirmed') {
            uni.showToast({ title: '✨ TA已经确认啦！', icon: 'success' })
          } else if (oldStatus !== this.status && this.status === 'modified') {
            uni.showToast({ title: 'TA做了些调整~', icon: 'none' })
          } else {
            uni.showToast({ title: '已是最新状态', icon: 'none' })
          }
        }
      }).catch(() => {
        uni.showToast({ title: '刷新失败', icon: 'none' })
      }).finally(() => {
        wx.hideLoading()
      })
    },

    viewRecipe(r) { uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${r.id}` }) },

    confirmMeals() {
      uni.showModal({
        title: '确认菜单',
        content: `确定使用这份菜单吗？对方会收到通知哦~`,
        success: (res) => {
          if (res.confirm) {
            this.updateCloudStatus('confirmed')
          }
        }
      })
    },

    modifyMeals() {
      uni.showModal({
        title: '调整菜单',
        content: '将为你重新随机生成菜品',
        success: (res) => {
          if (res.confirm) {
            const n = 3
            const newMeals = {
              breakfast: [...ALL_RECIPES.breakfast].sort(()=>Math.random()-0.5).slice(0,n),
              lunch: this.balanceMeal(ALL_RECIPES.lunch, n),
              dinner: this.balanceMeal(ALL_RECIPES.dinner, n)
            }
            this.dailyMeals = newMeals
            this.updateCloudStatus('modified', newMeals)
          }
        }
      })
    },

    balanceMeal(recipes, count) {
      const m = recipes.filter(r=>r.type==='meat'||r.type==='mixed')
      const v = recipes.filter(r=>r.type==='vegetarian')
      const mc = Math.ceil(count/2), vc = count-mc
      return [...m.sort(()=>Math.random()-0.5).slice(0,mc),...v.sort(()=>Math.random()-0.5).slice(0,vc)].sort(()=>Math.random()-0.5)
    },

    updateCloudStatus(status, meals) {
      const dataToUpdate = { shareId: this.shareId, status }
      if (meals) { dataToUpdate.meals = meals }

      wx.showLoading({ title: '同步中...' })
      wx.cloud.callFunction({
        name: 'updateShareStatus',
        data: dataToUpdate
      }).then(res => {
        this.status = status
        if (meals) { this.dailyMeals = meals }
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        uni.setStorageSync('foodfind_meals_date', new Date().toDateString())
        const app = getApp()
        if (app?.globalData) app.globalData.dailyMeals = this.dailyMeals
        uni.showToast({ title: status === 'confirmed' ? '已确认 ✨' : '已调整', icon: 'success' })
      }).catch(() => {
        uni.showToast({ title: '同步失败', icon: 'none' })
      }).finally(() => {
        wx.hideLoading()
      })
    },

    shareBack() {
      uni.setStorageSync('foodfind_meals', this.dailyMeals)
      uni.setStorageSync('foodfind_meals_date', new Date().toDateString())
      const app = getApp()
      if (app?.globalData) app.globalData.dailyMeals = this.dailyMeals
      uni.showToast({ title: '已设为今日菜单 ✨', icon: 'success', duration: 2000 })
    },

    resendShare() {
      const n = 3
      const newMeals = {
        breakfast: [...ALL_RECIPES.breakfast].sort(()=>Math.random()-0.5).slice(0,n),
        lunch: this.balanceMeal(ALL_RECIPES.lunch, n),
        dinner: this.balanceMeal(ALL_RECIPES.dinner, n)
      }
      this.dailyMeals = newMeals

      wx.cloud.callFunction({
        name: 'saveShareMenu',
        data: {
          meals: newMeals,
          fromName: getApp()?.globalData?.userInfo?.nickname || '我',
          toName: this.partnerName
        }
      }).then(res => {
        if (res.result && res.result.shareId) {
          this.shareId = res.result.shareId
          this.status = 'pending'
          this.shareTime = new Date().toLocaleString()
          uni.showToast({ title: '已重新生成，请再次转发', icon: 'none' })
        }
      }).catch(() => {
        uni.showToast({ title: '操作失败', icon: 'none' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#f7f8fa; }

.share-hero {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 50%, #059a4b 100%);
  padding: 56rpx 32rpx 40rpx;
  display:flex; flex-direction:column; align-items:center;
}
.hero-emoji { font-size:76rpx; margin-bottom:14rpx; }
.hero-text { font-size:33rpx; font-weight:700; color:#fff; margin-bottom:8rpx; text-align:center; }
.hero-sub { font-size:25rpx; color:rgba(255,255,255,.85); margin-bottom:10rpx; }
.hero-time { font-size:21rpx; color:rgba(255,255,255,.6); }
.refresh-hint {
  display:flex; align-items:center; gap:8rpx; margin-top:14rpx;
  padding:12rpx 24rpx; background:rgba(255,255,255,.2); border-radius:20rpx;
}
.refresh-icon { font-size:24rpx; }
.refresh-text { font-size:23rpx; color:#fff; font-weight:500; &:active { opacity:.7; } }

.body-scroll { padding-bottom: env(safe-area-inset-bottom); }

.status-bar {
  margin: 18rpx 28rpx; padding: 16rpx 22rpx; border-radius: 14rpx;
  display:flex; align-items:center; gap:10rpx;
  &.status-pending { background:#fff8e1; }
  &.status-ok { background:#e8f7ef; }
  &.status-modified { background:#e8e0ff; }
}
.status-dot { width:13rpx; height:13rpx; border-radius:50%; background: currentColor; }
.status-pending .status-dot { color:#ffb800; }
.status-ok .status-dot { color:#07c160; }
.status-modified .status-dot { color:#7c4dff; }
.status-text { font-size:24rpx; font-weight:600; }
.status-pending .status-text { color:#b8860b; }
.status-ok .status-text { color:#07c160; }
.status-modified .status-text { color:#7c4dff; }

.loading-card {
  display:flex; flex-direction:column; align-items:center; gap:16rpx;
  padding:80rpx 32rpx;
}
.loading-icon { font-size:60rpx; animation: spin 1s linear infinite; }
@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
.loading-text { font-size:27rpx; color:#999; }

.meal-section {
  background:#fff; border-radius:20rpx;
  box-shadow:0 2rpx 14rpx rgba(0,0,0,.04);
  margin:0 28rpx 18rpx; overflow:hidden;
}
.meal-header {
  display:flex; align-items:center; padding:20rpx 24rpx 12rpx;
}
.mh-icon { font-size:30rpx; margin-right:10rpx; }
.mh-title { font-size:27rpx; font-weight:700; color:#1a1a1a; flex:1; }
.mh-cal { font-size:23rpx; color:#07c160; font-weight:600; }

.food-row { display:flex; flex-wrap:wrap; padding:0 12rpx 16rpx; gap:10rpx; }
.food-card {
  width:calc(20% - 8rpx); min-width:0;
  background:#fafafa; border-radius:14rpx;
  padding:14rpx 6rpx; display:flex; flex-direction:column; align-items:center;
  transition: all .2s ease;
  &:active { background:#f0f0f0; transform:scale(.92); }
}
.fc-icon-wrap {
  width:64rpx; height:64rpx; background:#fff; border-radius:16rpx;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:8rpx; box-shadow:0 2rpx 8rpx rgba(0,0,0,.04);
}
.fc-icon { font-size:34rpx; }
.fc-name { font-size:21rpx; font-weight:500; color:#333; text-align:center; line-height:1.2; }
.fc-kcal { font-size:18rpx; color:#07c160; font-weight:600; margin-top:4rpx; }

.action-area { padding: 20rpx 32rpx; }
.primary-btn {
  display:flex; align-items:center; justify-content:center; gap:12rpx;
  padding: 26rpx 0; background: linear-gradient(135deg, #07c160, #06ad56);
  border-radius: 48rpx; margin-bottom: 14rpx;
  &:active { opacity: 0.85; transform: scale(0.98); transition: all 0.15s; }
}
.secondary-btn {
  display:flex; align-items:center; justify-content:center; gap:12rpx;
  padding: 22rpx 0; background: #f5f5f5; border-radius: 48rpx; margin-bottom: 10rpx;
  &:active { background: #eee; transform: scale(0.98); transition: all 0.15s; }
}
.tertiary-btn {
  display:flex; align-items:center; justify-content:center; gap:12rpx;
  padding: 22rpx 0; background: #e8f0fe; border-radius: 48rpx;
  &:active { opacity: 0.7; transform: scale(0.98); transition: all 0.15s; }
}
.btn-icon { font-size:29rpx; }
.btn-text { font-size:27rpx; font-weight:600; color: #fff; }
.secondary-btn .btn-text { color: #666; }
.tertiary-btn .btn-text { color: #3366cc; }

.waiting-card {
  background: #fff; border-radius: 20rpx; padding: 34rpx 22rpx;
  display: flex; flex-direction: column; align-items: center; gap: 10rpx;
  margin-bottom: 14rpx; box-shadow: 0 2rpx 14rpx rgba(0,0,0,0.04);
}
.waiting-icon { font-size:44rpx; }
.waiting-text { font-size:26rpx; color: #333; font-weight:500; }
.waiting-hint { font-size:22rpx; color: #999; }

.bottom-spacer { height: 56rpx; }
</style>