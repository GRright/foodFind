<script>
import { initCloud, getOpenId, batchSyncOnHide, syncOnStartup } from '@/utils/cloud.js'

export default {
  onLaunch() {
    console.log('[App] 吃点啥 - 启动中...')
    
    this.globalData = {
      userInfo: { nickname: '美食爱好者', avatar: '' },
      partnerInfo: null,
      dailyMeals: null,
      weeklyMeals: null,
      currentShareId: null,
      openid: ''
    }

    const cached = uni.getStorageSync('foodfind_partner')
    if (cached) { this.globalData.partnerInfo = cached }

    this.performLogin()
  },
  onHide() {
    batchSyncOnHide()
  },
  methods: {
    performLogin() {
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            console.log('[Auth] 微信登录成功，code:', loginRes.code)
            this.globalData.loginCode = loginRes.code
            
            initCloud()
            getOpenId().then((openid) => {
              if (openid) {
                this.globalData.openid = openid
                console.log('[Auth] 用户身份已获取:', openid)
              }
              syncOnStartup()
            })
          } else {
            console.error('[Auth] 微信登录失败:', loginRes.errMsg)
            uni.showToast({ title: '登录失败，请重试', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('[Auth] 微信登录异常:', err)
          uni.showToast({ title: '登录异常，请重试', icon: 'none' })
        }
      })
    }
  },
  globalData: {
    userInfo: { nickname: '美食爱好者', avatar: '' },
    partnerInfo: null,
    dailyMeals: null,
    weeklyMeals: null,
    currentShareId: null,
    openid: ''
  }
}
</script>

<style lang="scss">
page {
  background-color: #F5F6FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

view, text { box-sizing: border-box; }

.page-enter { animation: pageEnter .35s cubic-bezier(.4,0,.2,1) forwards; }
.page-exit { animation: pageExit .25s ease forwards; }

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pageExit {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10rpx); }
}

.fade-in { animation: fadeIn .4s ease forwards; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-up { animation: slideUp .35s ease forwards; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.scale-in { animation: scaleIn .3s ease forwards; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(.9); }
  to { opacity: 1; transform: scale(1); }
}

.pulse { animation: pulse .3s ease; }

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(.95); }
  100% { transform: scale(1); }
}

.bounce-in { animation: bounceIn .45s cubic-bezier(.68,-.55,.265,1.55) forwards; }

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(.95); }
  100% { opacity: 1; transform: scale(1); }
}

.pop-in { animation: popIn .35s cubic-bezier(.175,.885,.32,1.275) forwards; }

@keyframes popIn {
  from { opacity: 0; transform: scale(.8) translateY(20rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.shimmer { animation: shimmer 1.8s ease-in-out infinite; }

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}

.float-gentle { animation: floatGentle 3s ease-in-out infinite; }

@keyframes floatGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.slide-left { animation: slideLeft .35s ease forwards; }

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

.slide-right { animation: slideRight .35s ease forwards; }

@keyframes slideRight {
  from { opacity: 0; transform: translateX(30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

.glow-pulse { animation: glowPulse 2s ease-in-out infinite; }

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 2rpx 14rpx rgba(7,193,96,0.15); }
  50% { box-shadow: 0 4rpx 24rpx rgba(7,193,96,0.3); }
}
</style>