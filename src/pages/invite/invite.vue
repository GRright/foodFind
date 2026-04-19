<template>
  <view class="page">
    <view class="invite-hero" :class="{ accepted: isAccepted }">
      <text class="hero-emoji">{{ isAccepted ? '♥' : '✉' }}</text>
      <text class="hero-title" v-if="loading">正在加载邀请...</text>
      <text class="hero-title" v-else-if="error">{{ errorTitle }}</text>
      <text class="hero-title" v-else-if="isAccepted">配对成功！</text>
      <text class="hero-title" v-else>{{ inviterName }} 想和你成为用餐伙伴</text>
      <text class="hero-sub" v-if="!loading && !error && !isAccepted">一起决定今天吃什么吧~</text>
    </view>

    <scroll-view scroll-y class="body-scroll" :style="{ height: bodyHeight }">
      <view class="info-card slide-up" style="animation-delay:0.1s;opacity:0" v-if="!loading && !error">
        <view class="ic-row">
          <text class="ic-label">关系类型</text>
          <text class="ic-value rel-badge">{{ relationLabel }}</text>
        </view>
        <view class="ic-row">
          <text class="ic-label">邀请时间</text>
          <text class="ic-value">{{ createTime || '刚刚' }}</text>
        </view>
      </view>

      <view class="action-area" v-if="!isAccepted && !loading && !error">
        <view class="primary-btn" @click="acceptInvite">
          <text class="btn-icon">♡</text>
          <text class="btn-text">接受邀请</text>
        </view>
        <view class="skip-btn" @click="goHome">
          <text class="skip-text">先看看，稍后再说</text>
        </view>
      </view>

      <view class="success-card slide-up" style="animation-delay:0.15s;opacity:0" v-if="isAccepted">
        <text class="success-icon">✓</text>
        <text class="success-title">你和 {{ inviterName }} 已成为{{ relationLabel }}！</text>
        <text class="success-desc">现在你们可以互相分享菜单、确认菜品啦~</text>
        <view class="success-features">
          <view class="sf-item"><text class="sf-icon">↗</text><text class="sf-txt">分享每日菜单</text></view>
          <view class="sf-item"><text class="sf-icon">◉</text><text class="sf-txt">查看对方选择</text></view>
          <view class="sf-item"><text class="sf-icon">✎</text><text class="sf-txt">调整并反馈</text></view>
        </view>
        <view class="goto-btn" @click="goHome">
          <text class="goto-text">开始使用 →</text>
        </view>
      </view>

      <view class="error-card" v-if="error">
        <text class="err-icon">✘</text>
        <text class="err-text">{{ errorMsg }}</text>
        <view class="retry-btn" @click="loadInvite">
          <text class="retry-text">↻ 重新加载</text>
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
      pairId: '',
      loading: true,
      error: false,
      errorTitle: '',
      errorMsg: '',
      inviterName: '',
      relationType: 'couple',
      createTime: '',
      isAccepted: false,
      bodyHeight: 'calc(100vh - 380rpx)'
    }
  },
  computed: {
    relationLabel() {
      const map = { couple: '💕 情侣', family: '👨‍👩‍👧 家人', friend: '🤝 朋友' }
      return map[this.relationType] || '💕 伙伴'
    }
  },
  onLoad(options) {
    if (options.pid) {
      this.pairId = options.pid
      this.loadInvite()
    } else {
      this.error = true
      this.errorTitle = '无效的邀请链接'
      this.errorMsg = '邀请信息缺失，请让对方重新发送'
      this.loading = false
    }
  },
  methods: {
    loadInvite() {
      this.loading = true
      this.error = false

      wx.cloud.callFunction({
        name: 'getPairInfo',
        data: { pairId: this.pairId }
      }).then(res => {
        if (res.result && res.result.hasPair) {
          const data = res.result.data
          this.inviterName = data.partnerName || 'TA'
          this.relationType = data.relationType || 'couple'
          this.createTime = data.createdAt || ''
          
          if (data.status === 'paired') {
            this.isAccepted = true
            this.savePartnerToLocal(data)
          } else if (data.status === 'pending') {
            const app = getApp()
            if (app?.globalData && data.isInviter === undefined) {
              this.isAccepted = false
            } else if (data.isInviter === false) {
              this.isAccepted = false
            } else {
              this.isAccepted = false
            }
          }
        } else {
          this.error = true
          this.errorTitle = '邀请不存在'
          this.errorMsg = '该邀请可能已被取消或已过期'
        }
      }).catch(err => {
        console.error('loadInvite error:', err)
        this.error = true
        this.errorTitle = '加载失败'
        this.errorMsg = '请检查网络后重试'
      }).finally(() => {
        this.loading = false
      })
    },

    acceptInvite() {
      uni.showModal({
        title: '接受邀请',
        content: `确定要和 ${this.inviterName} 成为${this.relationLabel}吗？`,
        confirmText: '接受',
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '配对中...' })
            wx.cloud.callFunction({
              name: 'acceptPairInvite',
              data: {
                pairId: this.pairId,
                myName: getApp()?.globalData?.userInfo?.nickname || '我'
              }
            }).then(res => {
              wx.hideLoading()
              if (res.result && res.result.code === 0) {
                this.isAccepted = true
                this.savePartnerToLocal({
                  ...res.result.data,
                  status: 'paired',
                  pairId: this.pairId
                })
                uni.showToast({ title: '配对成功 ✨', icon: 'success', duration: 2000 })
              } else {
                let msg = res.result.msg || '操作失败'
                if (res.result.code === -3) msg = '不能接受自己的邀请哦~'
                if (res.result.code === -4) msg = '该邀请已被其他人接受了'
                if (res.result.code === -5) msg = '该邀请已经被接受过了'
                uni.showToast({ title: msg, icon: 'none' })
              }
            }).catch(() => {
              wx.hideLoading()
              uni.showToast({ title: '网络错误', icon: 'none' })
            })
          }
        }
      })
    },

    savePartnerToLocal(data) {
      const partnerInfo = {
        nickname: data.partnerName || this.inviterName,
        relationType: data.relationType || this.relationType,
        status: 'paired',
        pairId: this.pairId
      }
      uni.setStorageSync('foodfind_partner', partnerInfo)
      const app = getApp()
      if (app?.globalData) app.globalData.partnerInfo = partnerInfo
    },

    goHome() {
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F6FA; }

.invite-hero {
  padding: 80rpx 32rpx 56rpx;
  display:flex; flex-direction:column; align-items:center;
  transition: background .5s ease;
  &.accepted { background:#07c160; }
  &.pending { background:#1a1a1a; }
}
.hero-emoji { font-size:80rpx; margin-bottom:20rpx; animation: bounceIn .6s ease; }
@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.hero-title { font-size:34rpx; font-weight:700; color:#fff; text-align:center; line-height:1.4; }
.hero-sub { font-size:26rpx; color:rgba(255,255,255,.8); margin-top:12rpx; }

.body-scroll { padding-bottom: env(safe-area-inset-bottom); }

.info-card {
  margin:24rpx 28rpx; padding:28rpx; background:#fff;
  border-radius:20rpx; box-shadow:0 1rpx 12rpx rgba(0,0,0,.04);
}
.ic-row { display:flex; justify-content:space-between; align-items:center; padding:14rpx 0; &:not(:last-child){ border-bottom:1rpx solid #f5f5f5;} }
.ic-label { font-size:26rpx; color:#999; }
.ic-value { font-size:28rpx; color:#1a1a1a; font-weight:600; }
.rel-badge {
  background:#e8f7ef; color:#07c160; padding:6rpx 18rpx; border-radius:12rpx; font-size:24rpx;
}

.action-area { padding:32rpx 28rpx; }
.primary-btn {
  display:flex; align-items:center; justify-content:center; gap:14rpx;
  padding:30rpx 0; background:#1a1a1a;
  border-radius:48rpx; margin-bottom:20rpx;
  &:active { opacity:.85; transform:scale(.97); transition:all .15s; }
}
.btn-icon { font-size:36rpx; }
.btn-text { font-size:31rpx; font-weight:700; color:#fff; }
.skip-btn { text-align:center; padding:16rpx 0; }
.skip-text { font-size:26rpx; color:#999; &:active { color:#666; } }

.success-card {
  margin:24rpx 28rpx; padding:40rpx 32rpx; background:#fff;
  border-radius:24rpx; box-shadow:0 1rpx 12rpx rgba(0,0,0,.04);
  display:flex; flex-direction:column; align-items:center;
}
.success-icon { font-size:72rpx; margin-bottom:16rpx; animation: popIn .5s ease .3s both; }
@keyframes popIn {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.success-title { font-size:30rpx; font-weight:700; color:#1a1a1a; text-align:center; margin-bottom:10rpx; }
.success-desc { font-size:24rpx; color:#999; text-align:center; margin-bottom:28rpx; }
.success-features { display:flex; flex-direction:column; gap:16rpx; width:100%; margin-bottom:32rpx; }
.sf-item {
  display:flex; align-items:center; gap:14rpx; padding:16rpx 20rpx;
  background:#f5f6f8; border-radius:14rpx;
}
.sf-icon { font-size:28rpx; }
.sf-txt { font-size:26rpx; color:#666; font-weight:500; }
.goto-btn {
  width:100%; text-align:center; padding:24rpx 0;
  background:#07c160; border-radius:40rpx;
  &:active { opacity:.85; }
}
.goto-text { font-size:29rpx; font-weight:600; color:#fff; }

.error-card {
  margin:60rpx 32rpx; display:flex; flex-direction:column; align-items:center; gap:16rpx;
}
.err-icon { font-size:64rpx; }
.err-text { font-size:27rpx; color:#999; text-align:center; }
.retry-btn {
  padding:18rpx 40rpx; background:#f5f5f5; border-radius:24rpx;
  &:active { background:#eee; }
}
.retry-text { font-size:26rpx; color:#666; font-weight:500; }

.bottom-spacer { height:60rpx; }
</style>