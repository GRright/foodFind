<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <!-- ===== 做饭模式（默认）===== -->
    <template v-if="!noCookMode">
      <view class="header fade-in">
        <view class="header-top">
          <view class="header-left">
            <text class="greeting">{{ greetingText }}</text>
            <text class="greeting-sub">{{ greetingSubText }}</text>
          </view>
          <view class="share-btn" open-type="share">
            <text class="sb-icon">♡</text>
            <text class="sb-text">分享</text>
          </view>
        </view>

        <view class="calorie-bar" v-if="totalCalories > 0">
          <view class="cb-left">
            <text class="cb-label">今日推荐</text>
            <text class="cb-value">{{ totalCalories }} kcal</text>
          </view>
          <view class="cb-right">
            <text class="cb-item">蛋白质 {{ totalProtein }}g</text>
            <text class="cb-dot">·</text>
            <text class="cb-item">脂肪 {{ totalFat }}g</text>
            <text class="cb-dot">·</text>
            <text class="cb-item">碳水 {{ totalCarbs }}g</text>
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="meal-scroll" :style="{ height: scrollHeight }" @scrolltolower="loadMore">
        <view
          class="meal-section"
          v-for="(section, si) in mealSections"
          :key="si"
          style="animation: slideUp .45s ease forwards; animation-delay: calc(0.08s * si); opacity: 0;"
        >
          <view class="meal-header">
            <view class="mh-left">
              <text class="mh-icon">{{ section.icon }}</text>
              <text class="mh-title">{{ section.title }}</text>
            </view>
            <view class="mh-right">
              <view
                class="eaten-btn"
                :class="{ eaten: mealCheckIn[section.key] }"
                @click.stop="markMealEaten(section.key)"
              >
                <text class="eb-icon">{{ mealCheckIn[section.key] ? '✓' : '○' }}</text>
                <text class="eb-txt">{{ mealCheckIn[section.key] ? '已打卡' : '打卡' }}</text>
              </view>
              <view class="refresh-btn" :class="{ shimmering: isRefreshing === section.key }" @click.stop="refreshMeal(section.key)">
                <text class="rb-icon">↻</text>
                <text class="rb-text">换一批</text>
              </view>
            </view>
          </view>

          <view class="food-row">
            <view
              class="food-card"
              :class="getCardClass(food.id)"
              :style="getCardStyle(food.id)"
              v-for="(food, fi) in section.recipes"
              :key="food.id"
              @click="goToDetail(food)"
              @touchstart="onSwipeStart(food, section.key, $event)"
              @touchmove.prevent="onSwipeMove($event)"
              @touchend="onSwipeEnd(food, section.key)"
              style="animation: popIn .4s cubic-bezier(.175,.885,.32,1.275) forwards; animation-delay: calc(0.15s + si*0.06s + fi*0.05s); opacity: 0;"
            >
              <view class="fc-inner" :class="{ 'flip-out': flippingCardId === food.id, 'flip-in': newCardId === food.id }">
                <view class="fc-icon-wrap"><text class="fc-icon">{{ food.image || '🍽️' }}</text></view>
                <text class="fc-name">{{ food.name }}</text>
              </view>

              <view class="swap-hint" v-if="swipeCardId === food.id && swipeOffset > 50">
                <text class="sh-icon">✨</text>
                <text class="sh-text">换一道</text>
              </view>

              <view class="delete-hint" v-if="swipeCardId === food.id && swipeOffset < -50">
                <text class="dh-icon">✕</text>
                <text class="dh-text">删除</text>
              </view>

              <view class="sparkle-layer" v-if="showSparkle && sparkleCardId === food.id">
                <text class="sparkle s1">✦</text>
                <text class="sparkle s2">★</text>
                <text class="sparkle s3">✧</text>
                <text class="sparkle s4">✦</text>
                <text class="sparkle s5">★</text>
                <text class="sparkle s6">✧</text>
              </view>
            </view>
          </view>
        </view>

        <view class="bottom-actions">
          <view class="action-btn primary-action bounce-in" @click="regenerateAll">
            <text class="ab-icon">✦</text>
            <text class="ab-text">重新生成今日菜单</text>
          </view>
          <view class="action-hint">
            <text class="ah-text">点击查看详情 · 上滑换菜 · 下滑删除</text>
          </view>
        </view>

        <view class="bottom-spacer"></view>
      </scroll-view>

      <view class="delete-modal-mask" :class="{ show: showDeleteModal }" @click="showDeleteModal = false"></view>
      <view class="delete-modal" :class="{ show: showDeleteModal }">
        <text class="dm-title">确定删除这道菜？</text>
        <text class="dm-food-name">{{ deleteTargetFood?.name }}</text>
        <text class="dm-desc">删除后将从今日菜单中移除，可稍后重新生成</text>
        <view class="dm-btns">
          <view class="dm-btn cancel" @click="showDeleteModal = false"><text class="dmb-text">取消</text></view>
          <view class="dm-btn confirm" @click="confirmDelete"><text class="dmb-text">确认删除</text></view>
        </view>
      </view>

      <view class="gesture-guide-mask" :class="{ show: showGestureGuide }">
        <view class="gesture-modal">
          <view class="gm-top-bar">
            <text class="gm-top-title">👆 新手引导</text>
            <view class="gm-top-close" @click="closeGestureGuide"><text>✕</text></view>
          </view>

          <view class="gm-progress">
            <view class="gm-prog-track">
              <view class="gm-prog-fill" :style="{ width: ((ggStage + 1) / 2 * 100) + '%' }"></view>
            </view>
            <text class="gm-prog-label">{{ ggStage + 1 }} / 2</text>
          </view>

          <view class="gm-guide-area">
            <text class="gm-guide-title">{{ ggOverlayTitle }}</text>
            <text class="gm-guide-sub">{{ ggOverlaySub }}</text>

            <view class="gm-demo-wrap">
              <text class="gm-demo-tag">示例</text>
              <view
                class="gg-demo-card"
                :class="ggDemoCardAnim"
                @touchstart.stop="ggDemoCardTouchStart"
                @touchmove.stop="ggDemoCardTouchMove"
                @touchend.stop="ggDemoCardTouchEnd"
              >
                <view class="ggdc-swipe-hint" :class="ggHintClass">
                  <text class="ggsh-icon">{{ ggHintIcon }}</text>
                  <text class="ggsh-text">{{ ggHintText }}</text>
                </view>
                <view class="ggdc-inner">
                  <view class="ggdc-icon-wrap"><text class="ggdc-icon">{{ ggDemoFood?.image || '🍽️' }}</text></view>
                  <text class="ggdc-name">{{ ggDemoFood?.name || '示例菜品' }}</text>
                </view>
                <view class="ggdc-sparkle-layer" v-if="ggShowSparkle">
                  <text class="ggdc-sparkle gs1">✦</text>
                  <text class="ggdc-sparkle gs2">★</text>
                  <text class="ggdc-sparkle gs3">✧</text>
                  <text class="ggdc-sparkle gs4">✦</text>
                  <text class="ggdc-sparkle gs5">★</text>
                  <text class="ggdc-sparkle gs6">✧</text>
                </view>
              </view>
            </view>
          </view>

          <view class="gm-bottom">
            <view class="gm-btn" @click="ggAct" :class="{ 'gm-btn-disabled': ggLocked }">
              <text class="gmb-icon">{{ ggActIcon }}</text>
              <text class="gmb-text">{{ ggActText }}</text>
            </view>
            <view class="gm-skip" @click="closeGestureGuide"><text>跳过引导 ›</text></view>
          </view>
        </view>
      </view>
    </template>

    <!-- ===== 不做饭模式（分享模式）===== -->
    <template v-else>
      <view class="header fade-in">
        <view class="header-top">
          <text class="greeting">{{ greetingTextNoCook }}</text>
          <view class="mode-tag">
            <text class="mt-icon">📷</text>
            <text class="mt-text">分享模式</text>
          </view>
        </view>
        <text class="mode-desc">拍照记录今天吃了什么，让TA也能看到</text>
      </view>

      <view class="photo-action-area slide-up" style="animation-delay:0.08s;opacity:0">
        <view class="camera-btn bounce-in" @click="takePhoto">
          <text class="cam-icon">📸</text>
          <text class="cam-text">拍一张今天吃的</text>
        </view>
        <view class="pick-btn pop-in" style="animation-delay:0.12s;opacity:0" @click="choosePhoto">
          <text class="cam-icon">🖼️</text>
          <text class="cam-text">从相册选择</text>
        </view>
      </view>

      <scroll-view scroll-y class="feed-scroll" :style="{ height: feedScrollHeight }" @scrolltolower="loadMoreFeed">
        <view class="feed-date-label" v-if="feedList.length > 0">
          <text class="fdl-text">{{ todayLabel }}</text>
        </view>

        <view
          class="feed-card"
          v-for="(item, idx) in feedList"
          :key="item.id"
          style="animation: slideUp .4s ease forwards; animation-delay: calc(0.1s + idx * 0.05s); opacity: 0;"
        >
          <image class="feed-img" :src="item.image" mode="aspectFill" @click="previewImage(item.image)"></image>
          <view class="feed-info">
            <view class="fi-top">
              <view class="fi-avatar">
                <text class="fi-char">{{ (item.fromName || '我').charAt(0) }}</text>
              </view>
              <view class="fi-meta">
                <text class="fi-name">{{ item.fromName || '我' }}</text>
                <text class="fi-time">{{ formatTime(item.createdAt) }}</text>
              </view>
              <text class="fi-self-tag" v-if="item.isSelf">我</text>
              <text class="fi-partner-tag" v-else>TA</text>
            </view>
            <text class="fi-caption" v-if="item.caption">{{ item.caption }}</text>
          </view>
        </view>

        <view class="empty-feed scale-in" v-if="feedList.length === 0">
          <text class="ef-icon">🍽️</text>
          <text class="ef-title">还没有美食分享</text>
          <text class="ef-hint">拍张照，告诉TA你今天吃了什么吧~</text>
        </view>

        <view class="bottom-spacer"></view>
      </scroll-view>
    </template>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'

export default {
  data() {
    return {
      dailyMeals: null,
      userCount: 2,
      scrollHeight: 'calc(100vh - 260rpx)',
      isRefreshing: '',
      noCookMode: false,
      feedList: [],
      feedScrollHeight: 'calc(100vh - 380rpx)',
      pageEnter: true,
      mealCheckIn: { breakfast: false, lunch: false, dinner: false },
      swipeCardId: null,
      swipeStartY: 0,
      swipeOffset: 0,
      swipeMealKey: '',
      flippingCardId: null,
      newCardId: null,
      showSparkle: false,
      sparkleCardId: null,
      showDeleteModal: false,
      deleteTargetFood: null,
      deleteTargetMealKey: '',
      showGestureGuide: false,
      ggStage: 0,
      ggDemoFood: null,
      ggSwipeOffset: 0,
      ggDemoCardAnim: '',
      ggShowSparkle: false,
      ggLocked: false
    }
  },
  computed: {
    greetingText() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了，早点休息'
      if (h < 9) return '早上好'
      if (h < 12) return '中午好'
      if (h < 14) return '午休时间'
      if (h < 18) return '下午好'
      return '晚上好'
    },
    greetingTextNoCook() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了'
      if (h < 9) return '早安'
      if (h < 12) return '中午了'
      if (h < 14) return '下午茶时间'
      if (h < 18) return '晚餐时间'
      return '晚上好'
    },
    greetingSubText() {
      const h = new Date().getHours()
      if (h < 9) return '今天吃点好的~'
      if (h < 12) return '午餐想好吃什么了吗'
      if (h < 14) return '吃饱了才有力气'
      if (h < 18) return '晚餐安排起来'
      return '明天也要好好吃饭'
    },
    todayLabel() {
      const d = new Date()
      const w = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]
      return `${d.getMonth()+1}月${d.getDate()}日 ${w}`
    },
    mealSections() {
      if (!this.dailyMeals) return []
      return [
        { key: 'breakfast', title: '早餐', icon: '☀', recipes: this.dailyMeals.breakfast || [] },
        { key: 'lunch', title: '午餐', icon: '🌞', recipes: this.dailyMeals.lunch || [] },
        { key: 'dinner', title: '晚餐', icon: '🌙', recipes: this.dailyMeals.dinner || [] }
      ]
    },
    totalCalories() {
      if (!this.dailyMeals) return 0
      let c = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => c += r.nutrition?.calories||0) })
      return Math.round(c * this.userCount)
    },
    totalProtein() {
      if (!this.dailyMeals) return 0; let p = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => p += r.nutrition?.protein||0) })
      return Math.round(p)
    },
    totalFat() {
      if (!this.dailyMeals) return 0; let f = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => f += r.nutrition?.fat||0) })
      return Math.round(f)
    },
    totalCarbs() {
      if (!this.dailyMeals) return 0; let cb = 0
      ;['breakfast','lunch','dinner'].forEach(k => { (this.dailyMeals[k]||[]).forEach(r => cb += r.nutrition?.carbs||0) })
      return Math.round(cb)
    },
    ggOverlayTitle() {
      const titles = [
        '上滑试试换菜？',
        '下滑试试删除？'
      ]
      return titles[this.ggStage] || '引导完成！'
    },
    ggOverlaySub() {
      const subs = [
        '按住下方菜品，往上滑动试试',
        '按住下方菜品，往下滑动试试'
      ]
      return subs[this.ggStage] || ''
    },
    ggHintClass() {
      const off = this.ggSwipeOffset
      if (this.ggStage === 0 && off > 30) return 'show-up'
      if (this.ggStage === 1 && off < -30) return 'show-down'
      return ''
    },
    ggHintIcon() {
      return this.ggStage === 0 ? '✨' : this.ggStage === 1 ? '✕' : ''
    },
    ggHintText() {
      return this.ggStage === 0 ? '换一道' : this.ggStage === 1 ? '删除' : ''
    },
    ggActIcon() {
      const icons = ['↻', '✕']
      return icons[this.ggStage] || '✓'
    },
    ggActText() {
      const texts = ['上滑换菜 ↑', '下滑删除 ↓']
      return texts[this.ggStage] || '知道了'
    }
  },
  onShow() {
    setTimeout(() => { this.pageEnter = false }, 400)
    this.loadMode()
    if (this.noCookMode) { this.loadFeed() }
    else {
      this.loadMeals()
      this.recordAppOpen()
      this.loadTodayCheckIn()
      this.checkGestureGuide()
    }
  },
  methods: {
    getSwipeOpacity() {
      if (!this.swipeCardId) return 1
      const absOffset = Math.abs(this.swipeOffset)
      if (absOffset < 40) return 1
      if (absOffset > 120) return 0.3
      return 1 - (absOffset - 40) / 80 * 0.7
    },
    getCardClass(id) {
      const classes = []
      if (this.swipeCardId === id) classes.push('swiping')
      if (this.flippingCardId === id) classes.push('flipping')
      if (this.newCardId === id) classes.push('new-card')
      return classes.join(' ')
    },
    getCardStyle(id) {
      if (this.swipeCardId !== id && this.flippingCardId !== id) return ''
      if (this.flippingCardId === id) return 'animation: none;'
      let rotateX = 0
      if (this.swipeOffset > 30) { rotateX = Math.min((this.swipeOffset - 30) / 2, 45) }
      else if (this.swipeOffset < -30) { rotateX = Math.max((this.swipeOffset + 30) / 2, -25) }
      return `transform: translateY(${Math.round(this.swipeOffset * 0.5)}rpx) rotateX(${rotateX}deg); opacity:${this.getSwipeOpacity()};`
    },
    loadMode() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      this.noCookMode = !!prefs.noCookMode
    },
    recordAppOpen() {
      const partner = uni.getStorageSync('foodfind_partner')
      if (!partner || !partner.pairId) return

      wx.cloud.callFunction({
        name: 'recordCheckIn',
        data: { action: 'open_app', pairId: partner.pairId }
      }).catch(() => {})
    },
    loadTodayCheckIn() {
      const todayStr = new Date().toISOString().split('T')[0]
      const personalChecks = uni.getStorageSync('foodfind_personal_checks') || {}
      if (personalChecks[todayStr]) {
        this.mealCheckIn = { ...personalChecks[todayStr] }
      }

      const partner = uni.getStorageSync('foodfind_partner')
      if (!partner || !partner.pairId) return

      wx.cloud.callFunction({
        name: 'getDailyStatus',
        data: { pairId: partner.pairId }
      }).then(res => {
        if (res.result && res.result.code === 0 && res.result.data && res.result.data.myCheckIn) {
          const my = res.result.data.myCheckIn
          this.mealCheckIn = {
            breakfast: my.meals?.breakfast?.eaten || this.mealCheckIn.breakfast,
            lunch: my.meals?.lunch?.eaten || this.mealCheckIn.lunch,
            dinner: my.meals?.dinner?.eaten || this.mealCheckIn.dinner
          }
        }
      }).catch(() => {})
    },
    markMealEaten(mealKey) {
      const newState = !this.mealCheckIn[mealKey]
      this.mealCheckIn[mealKey] = newState

      const personalChecks = uni.getStorageSync('foodfind_personal_checks') || {}
      const todayStr = new Date().toISOString().split('T')[0]
      if (!personalChecks[todayStr]) personalChecks[todayStr] = { breakfast: false, lunch: false, dinner: false }
      personalChecks[todayStr][mealKey] = newState
      uni.setStorageSync('foodfind_personal_checks', personalChecks)

      const partner = uni.getStorageSync('foodfind_partner')
      if (partner && partner.pairId) {
        wx.cloud.callFunction({
          name: 'recordCheckIn',
          data: {
            action: 'eat_meal',
            pairId: partner.pairId,
            mealType: mealKey,
            data: { nickname: getApp()?.globalData?.userInfo?.nickname || '我' }
          }
        }).catch(() => {})
      }

      if (newState) {
        uni.showToast({ title: `${mealKey === 'breakfast' ? '早餐' : mealKey === 'lunch' ? '午餐' : '晚餐'}已打卡 ✓`, icon: 'success' })
      }
    },

    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.addFeedItem(res.tempFilePaths[0])
          }
        }
      })
    },
    choosePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.addFeedItem(res.tempFilePaths[0])
          }
        }
      })
    },
    addFeedItem(imagePath) {
      const app = getApp()
      const item = {
        id: 'feed_' + Date.now(),
        image: imagePath,
        fromName: app?.globalData?.userInfo?.nickname || '我',
        fromOpenid: '',
        caption: '',
        createdAt: new Date().toISOString(),
        isSelf: true
      }

      const feed = [item, ...this.feedList]
      this.feedList = feed

      const saved = uni.getStorageSync('foodfind_feed') || {}
      const todayStr = this.getTodayStr()
      if (!saved[todayStr]) saved[todayStr] = []
      saved[todayStr].unshift(item)
      uni.setStorageSync('foodfind_feed', saved)

      uni.showToast({ title: '已分享', icon: 'success' })

      if (app?.globalData?.partnerInfo && app.globalData.pairStatus === 'paired') {
        wx.cloud.callFunction({ name: 'saveShareMenu', data: { meals: [{ photoShare: true, image: imagePath, caption: '' }], fromName: item.fromName, toName: app.globalData.partnerInfo.nickname || 'TA' } }).catch(() => {})
      }
    },
    loadFeed() {
      const saved = uni.getStorageSync('foodfind_feed') || {}
      const todayStr = this.getTodayStr()
      this.feedList = saved[todayStr] || []

      const partnerFeed = uni.getStorageSync('foodfind_partner_feed') || {}
      if (partnerFeed[todayStr]) {
        const combined = [...this.feedList, ...partnerFeed[todayStr]]
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        this.feedList = combined
      }
    },
    loadMoreFeed() {},
    previewImage(url) {
      const urls = this.feedList.filter(f => f.image).map(f => f.image)
      uni.previewImage({ current: url, urls })
    },
    formatTime(isoStr) {
      try {
        const d = new Date(isoStr)
        const h = String(d.getHours()).padStart(2,'0')
        const m = String(d.getMinutes()).padStart(2,'0')
        return `${h}:${m}`
      } catch(e) { return '' }
    },
    checkGestureGuide() {
      const done = uni.getStorageSync('foodfind_gesture_guide')
      if (!done) {
        this.ggStage = 0
        this.ggLocked = false
        this.ggSwipeOffset = 0
        this.ggShowSparkle = false
        this.ggDemoCardAnim = ''
        const pool = ALL_RECIPES.breakfast || []
        this.ggDemoFood = pool[Math.floor(Math.random() * pool.length)]
        setTimeout(() => { this.showGestureGuide = true }, 800)
      }
    },
    ggDemoCardTouchStart(e) {
      if (this.ggLocked) return
      this._ggTouchStartY = e.touches[0].clientY
      this._ggTouchStartX = e.touches[0].clientX
      this.ggSwipeOffset = 0
      this.ggDemoCardAnim = 'active'
    },
    ggDemoCardTouchMove(e) {
      if (this.ggLocked) return
      const currentY = e.touches[0].clientY
      this.ggSwipeOffset = this._ggTouchStartY - currentY
    },
    ggDemoCardTouchEnd() {
      if (this.ggLocked) return
      this.ggDemoCardAnim = ''
      if (this.ggStage === 0 && this.ggSwipeOffset > 50) {
        this.ggCompleteStage0()
      } else if (this.ggStage === 1 && this.ggSwipeOffset < -50) {
        this.ggCompleteStage1()
      } else {
        this.ggSwipeOffset = 0
      }
    },
    ggCompleteStage0() {
      this.ggLocked = true
      this.ggShowSparkle = true
      this.ggDemoCardAnim = 'flip-out'
      setTimeout(() => {
        const pool = ALL_RECIPES.breakfast || []
        this.ggDemoFood = pool[Math.floor(Math.random() * pool.length)]
        this.ggDemoCardAnim = 'flip-in'
        this.ggSwipeOffset = 0
        setTimeout(() => {
          this.ggShowSparkle = false
          this.ggDemoCardAnim = ''
          this.ggStage = 1
          this.ggLocked = false
        }, 400)
      }, 350)
    },
    ggCompleteStage1() {
      this.ggLocked = true
      this.ggDemoCardAnim = 'swipe-away'
      setTimeout(() => {
        const pool = ALL_RECIPES.lunch || []
        this.ggDemoFood = pool[Math.floor(Math.random() * pool.length)]
        this.ggSwipeOffset = 0
        this.ggDemoCardAnim = 'slide-in'
        setTimeout(() => {
          this.ggDemoCardAnim = ''
          this.closeGestureGuide()
        }, 400)
      }, 400)
    },
    ggAct() {
      if (this.ggLocked) return
      if (this.ggStage === 0) { this.ggSwipeOffset = 100; this.ggCompleteStage0() }
      else if (this.ggStage === 1) { this.ggSwipeOffset = -100; this.ggCompleteStage1() }
    },
    closeGestureGuide() {
      this.showGestureGuide = false
      this.ggStage = 0
      this.ggLocked = false
      this.ggSwipeOffset = 0
      this.ggShowSparkle = false
      this.ggDemoCardAnim = ''
      uni.setStorageSync('foodfind_gesture_guide', true)
    },

    onSwipeStart(food, mealKey, e) {
      this.swipeCardId = food.id
      this.swipeMealKey = mealKey
      this.swipeOffset = 0
      this.swipeStartY = e.touches[0].clientY
    },
    onSwipeMove(e) {
      if (!this.swipeCardId) return
      const currentY = e.touches[0].clientY
      let delta = this.swipeStartY - currentY
      if (delta > 160) delta = 160
      if (delta < -100) delta = -100
      this.swipeOffset = Math.round(delta)
    },
    onSwipeEnd(food, mealKey) {
      if (!this.swipeCardId) return
      const offset = this.swipeOffset

      if (offset >= 60) {
        this.triggerSwapAnimation(food, mealKey)
      } else if (offset <= -50) {
        this.deleteTargetFood = food
        this.deleteTargetMealKey = mealKey
        this.showDeleteModal = true
        this.resetSwipe()
      } else {
        this.resetSwipe()
      }
    },
    resetSwipe() {
      this.swipeCardId = null
      this.swipeOffset = 0
      this.swipeMealKey = ''
    },
    triggerSwapAnimation(food, mealKey) {
      this.flippingCardId = food.id
      this.sparkleCardId = food.id
      this.showSparkle = true
      setTimeout(() => { this.showSparkle = false }, 600)
      setTimeout(() => {
        this.swapOneFood(food, mealKey)
        this.newCardId = food.id
        this.flippingCardId = null
        setTimeout(() => { this.newCardId = null; this.resetSwipe() }, 450)
      }, 350)
    },
    confirmDelete() {
      if (!this.deleteTargetFood || !this.deleteTargetMealKey) return
      const meals = this.dailyMeals[this.deleteTargetMealKey] || []
      const idx = meals.findIndex(r => r.id === this.deleteTargetFood.id)
      if (idx > -1) {
        meals.splice(idx, 1)
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        const wc = uni.getStorageSync('foodfind_weekly') || {}
        wc[this.getTodayStr()] = this.dailyMeals
        uni.setStorageSync('foodfind_weekly', wc)
      }
      uni.showToast({ title: `已删除「${this.deleteTargetFood.name}」`, icon: 'none' })
      this.showDeleteModal = false
      this.deleteTargetFood = null
      this.deleteTargetMealKey = ''
    },
    swapOneFood(food, mealKey) {
      const meals = this.dailyMeals[mealKey] || []
      const idx = meals.findIndex(r => r.id === food.id)
      if (idx > -1) {
        const pool = ALL_RECIPES[mealKey] || []
        const otherIds = new Set(meals.filter(r => r.id !== food.id).map(r => r.id))
        const available = pool.filter(r => !otherIds.has(r.id))
        meals[idx] = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)]
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        const wc = uni.getStorageSync('foodfind_weekly') || {}
        wc[this.getTodayStr()] = this.dailyMeals
        uni.setStorageSync('foodfind_weekly', wc)
      }
      uni.showToast({ title: `已更换「${food.name}」`, icon: 'none' })
    },

    loadMeals() {
      const cached = uni.getStorageSync('foodfind_meals')
      const cachedDate = uni.getStorageSync('foodfind_meals_date')
      if (cached && cachedDate && cachedDate === this.getTodayStr()) {
        this.dailyMeals = cached
        const app = getApp()
        if (app?.globalData) app.globalData.dailyMeals = cached
        return
      }
      const weeklyCache = uni.getStorageSync('foodfind_weekly')
      if (weeklyCache && weeklyCache[this.getTodayStr()]) {
        this.dailyMeals = weeklyCache[this.getTodayStr()]
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        uni.setStorageSync('foodfind_meals_date', this.getTodayStr())
        const app = getApp()
        if (app?.globalData) app.globalData.dailyMeals = this.dailyMeals
        return
      }
      this.generateDailyMeals()
    },
    getTodayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },
    getRecipeCount() {
      const c = this.userCount
      if (c === 1) return 2; if (c === 2) return 3; if (c <= 4) return 4; return 5
    },
    shuffle(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n) },
    balanced(recipes, n) {
      const meat = recipes.filter(r => r.type === 'meat' || r.type === 'mixed')
      const veg = recipes.filter(r => r.type === 'vegetarian')
      const mc = Math.ceil(n * 0.55), vc = n - mc
      return [...this.shuffle(meat, mc), ...this.shuffle(veg, vc)].sort(() => Math.random() - 0.5)
    },
    generateDailyMeals() {
      const n = this.getRecipeCount()
      const dailyMeals = {
        breakfast: this.shuffle(ALL_RECIPES.breakfast, n),
        lunch: this.balanced(ALL_RECIPES.lunch, n),
        dinner: this.balanced(ALL_RECIPES.dinner, n)
      }
      this.dailyMeals = dailyMeals
      const todayStr = this.getTodayStr()
      uni.setStorageSync('foodfind_meals', dailyMeals)
      uni.setStorageSync('foodfind_meals_date', todayStr)
      const app = getApp()
      if (app?.globalData) app.globalData.dailyMeals = dailyMeals
      const weeklyCache = uni.getStorageSync('foodfind_weekly') || {}
      weeklyCache[todayStr] = dailyMeals
      uni.setStorageSync('foodfind_weekly', weeklyCache)
      if (app?.globalData) app.globalData.weeklyMeals = weeklyCache
    },
    refreshMeal(mealKey) {
      if (this.isRefreshing) return
      this.isRefreshing = mealKey
      setTimeout(() => {
        const n = this.getRecipeCount()
        const pool = ALL_RECIPES[mealKey] || []
        const currentIds = new Set((this.dailyMeals[mealKey] || []).map(r => r.id))
        const available = pool.filter(r => !currentIds.has(r.id))
        this.dailyMeals[mealKey] = available.length >= n ? (mealKey === 'breakfast' ? this.shuffle(available, n) : this.balanced(available, n)) : (mealKey === 'breakfast' ? this.shuffle(pool, n) : this.balanced(pool, n))
        uni.setStorageSync('foodfind_meals', this.dailyMeals)
        const wc = uni.getStorageSync('foodfind_weekly') || {}
        wc[this.getTodayStr()] = this.dailyMeals
        uni.setStorageSync('foodfind_weekly', wc)
        this.isRefreshing = ''
        uni.showToast({ title: `已更换${mealKey==='breakfast'?'早餐':mealKey==='lunch'?'午餐':'晚餐'}`, icon: 'none' })
      }, 400)
    },
    regenerateAll() {
      uni.showLoading({ title: '重新生成中...' })
      setTimeout(() => { this.generateDailyMeals(); uni.hideLoading(); uni.showToast({ title: '已重新生成', icon: 'success' }) }, 600)
    },
    goToDetail(recipe) { uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` }) },
    onShareAppMessage() {
      const self = this
      const app = getApp()
      const partnerName = app?.globalData?.partnerInfo?.nickname || 'TA'

      if (self.noCookMode) {
        return { title: `来看看我今天吃了什么~`, path: '/pages/index/index', imageUrl: '' }
      }

      const cal = this.totalCalories
      return new Promise((resolve) => {
        wx.cloud.callFunction({
          name: 'saveShareMenu',
          data: { meals: self.dailyMeals, fromName: app.globalData.userInfo.nickname || '我', toName: partnerName }
        }).then(res => {
          if (res.result && res.result.shareId) {
            resolve({ title: `${partnerName}，今天吃这些怎么样？(${cal}kcal)`, path: `/pages/share/share?sid=${res.result.shareId}&from=home`, imageUrl: '' })
          } else { resolve({ title: `${partnerName}，今天吃这些？(${cal}kcal)`, path: '/pages/index/index', imageUrl: '' }) }
        }).catch(() => resolve({ title: `${partnerName}，今天吃这些？(${cal}kcal)`, path: '/pages/index/index', imageUrl: '' }))
      })
    },
    loadMore() {}
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F6FA; padding:0 28rpx; position:relative; transition: opacity .3s ease; }
.page-enter { animation: pageEnter .35s ease forwards; }

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Header ===== */
.header { padding:56rpx 0 24rpx; }
.header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20rpx; }
.header-left { flex:1; }
.greeting { font-size:44rpx; font-weight:800; color:#1a1a1a; letter-spacing:-1rpx; line-height:1.2; }
.greeting-sub { font-size:24rpx; color:#999; font-weight:400; margin-top:6rpx; display:block; }

.share-btn {
  display:flex; align-items:center; gap:6rpx;
  padding:12rpx 24rpx;
  background:#1a1a1a;
  border-radius:40rpx; transition:all .25s ease;
  &:active { transform:scale(.95); opacity:.85; }
}
.sb-icon { font-size:22rpx; color:#fff; }
.sb-text { font-size:23rpx; color:#fff; font-weight:600; }

.mode-tag {
  display:flex; align-items:center; gap:6rpx;
  padding:10rpx 18rpx; background:#e8f7ef;
  border-radius:24rpx;
}
.mt-icon { font-size:22rpx; }
.mt-text { font-size:22rpx; color:#07c160; font-weight:600; }
.mode-desc { font-size:24rpx; color:#999; font-weight:400; }

/* ===== Calorie Bar ===== */
.calorie-bar {
  display:flex; flex-direction:column; gap:8rpx;
  background:#fff;
  padding:22rpx 24rpx; border-radius:20rpx;
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04);
}
.cb-left { display:flex; align-items:baseline; gap:12rpx; }
.cb-label { font-size:22rpx; color:#999; font-weight:500; }
.cb-value { font-size:34rpx; font-weight:800; color:#07c160; }
.cb-right { display:flex; align-items:center; gap:8rpx; flex-wrap:wrap; }
.cb-item { font-size:20rpx; color:#999; font-weight:400; }
.cb-dot { font-size:20rpx; color:#ddd; }

/* ===== Scroll ===== */
.meal-scroll { }
.feed-scroll { }

/* ===== Meal Section ===== */
.meal-section {
  background:#fff; border-radius:24rpx;
  box-shadow:0 1rpx 12rpx rgba(0,0,0,.04);
  margin-bottom:20rpx; overflow:hidden;
}
.meal-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:24rpx 28rpx 16rpx;
}
.mh-left { display:flex; align-items:center; gap:10rpx; }
.mh-icon { font-size:28rpx; }
.mh-title { font-size:26rpx; font-weight:700; color:#1a1a1a; }
.mh-right { display:flex; align-items:center; gap:10rpx; }

.eaten-btn {
  display:flex; align-items:center; gap:6rpx;
  padding:10rpx 18rpx;
  background:#f5f5f5; border-radius:32rpx;
  transition:all .25s ease;
  &:active { transform:scale(.93); }
  &.eaten { background:#07c160; }
}
.eb-icon { font-size:22rpx; color:#999; }
.eaten-btn.eaten .eb-icon { color:#fff; }
.eb-txt { font-size:20rpx; color:#666; font-weight:500; }
.eaten-btn.eaten .eb-txt { color:#fff; }

.refresh-btn {
  display:flex; align-items:center; gap:6rpx;
  padding:10rpx 18rpx; background:#f7f8fa;
  border-radius:32rpx; transition:all .25s ease;
  &.shimmering { animation: shimmer .8s ease-in-out infinite; }
  &:active { background:#eee; transform:scale(.93); }
}
.rb-icon { font-size:20rpx; color:#666; }
.rb-text { font-size:20rpx; color:#666; font-weight:500; }

/* ===== Food Row ===== */
.food-row { display:flex; flex-wrap:wrap; padding:0 16rpx 24rpx; gap:12rpx; }

.food-card {
  width:calc(20% - 9.6rpx); min-width:0;
  background:#F5F6FA; border-radius:20rpx;
  padding:18rpx 8rpx 14rpx; display:flex; flex-direction:column; align-items:center;
  box-sizing:border-box; transition:all .25s ease; position:relative;
  perspective:400rpx; overflow:visible;
  &.swiping { z-index:10; transition:none; }
  &.flipping { z-index:20; transition:none; }
  &.new-card { animation: cardBounceIn .45s cubic-bezier(.175,.885,.32,1.275) forwards; }
  &:active:not(.swiping):not(.flipping) { background:#e8e9eb; transform:scale(.92); }
}
.fc-inner {
  width:100%; display:flex; flex-direction:column; align-items:center;
  transform-style:preserve-3d; transition:transform .35s cubic-bezier(.4,0,.2,1);
}
.fc-inner.flip-out {
  animation: cardFlipOut .35s ease-in forwards;
}
.fc-inner.flip-in {
  animation: cardFlipIn .4s ease-out .1s both;
}
.fc-icon-wrap {
  width:64rpx; height:64rpx; background:#fff; border-radius:18rpx;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:8rpx; box-shadow:0 1rpx 6rpx rgba(0,0,0,.06);
}
.swiping .fc-icon-wrap, .flipping .fc-icon-wrap { opacity: 0.5; }
.fc-icon { font-size:32rpx; }
.fc-name {
  font-size:20rpx; font-weight:500; color:#333;
  text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  max-width:100%; line-height:1.3;
}

/* ===== Swap/Delete Hints ===== */
.swap-hint {
  position:absolute; top:-6rpx; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:4rpx; padding:6rpx 14rpx;
  background:#07c160; border-radius:20rpx;
  white-space:nowrap; animation: popIn .2s ease; z-index:15;
}
.sh-icon { font-size:18rpx; color:#fff; }
.sh-text { font-size:18rpx; color:#fff; font-weight:600; }

.delete-hint {
  position:absolute; bottom:-6rpx; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:4rpx; padding:6rpx 14rpx;
  background:#666; border-radius:20rpx;
  white-space:nowrap; animation: popIn .2s ease; z-index:15;
}
.dh-icon { font-size:18rpx; color:#fff; }
.dh-text { font-size:18rpx; color:#fff; font-weight:600; }

/* ===== Sparkle ===== */
.sparkle-layer {
  position:absolute; top:0; left:0; right:0; bottom:0;
  pointer-events:none; z-index:25; border-radius:16rpx; overflow:hidden;
}
.sparkle {
  position:absolute; font-size:24rpx; color:#07c160;
  animation: sparkleFly .6s ease-out forwards;
  text-shadow:0 0 8rpx rgba(7,193,96,.6), 0 0 20rpx rgba(7,193,96,.3);
  &.s1 { left:10%; top:20%; animation-delay:0s; }
  &.s2 { left:70%; top:10%; animation-delay:.08s; font-size:28rpx; }
  &.s3 { left:30%; top:70%; animation-delay:.12s; }
  &.s4 { left:80%; top:60%; animation-delay:.04s; font-size:20rpx; }
  &.s5 { left:50%; top:5%; animation-delay:.16s; font-size:22rpx; }
  &.s6 { left:15%; top:45%; animation-delay:.2s; font-size:26rpx; }
}

/* ===== Delete Modal ===== */
.delete-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:998; transition:background .3s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.45); pointer-events:auto; }
}
.delete-modal {
  position:fixed; left:50%; top:50%;
  transform:translate(-50%,-50%) scale(0.85);
  width:560rpx; background:#fff; border-radius:28rpx;
  padding:44rpx 36rpx 36rpx; z-index:999;
  opacity:0; pointer-events:none;
  transition:all .35s cubic-bezier(.175,.885,.32,1.275);
  text-align:center;
  box-shadow:0 16rpx 64rpx rgba(0,0,0,.12);
  &.show { transform:translate(-50%,-50%) scale(1); opacity:1; pointer-events:auto; }
}
.dm-title { display:block; font-size:32rpx; font-weight:700; color:#1a1a1a; margin-bottom:16rpx; }
.dm-food-name { display:block; font-size:28rpx; color:#666; font-weight:600; margin-bottom:12rpx; }
.dm-desc { display:block; font-size:24rpx; color:#bbb; line-height:1.5; margin-bottom:32rpx; }
.dm-btns { display:flex; gap:16rpx; }
.dm-btn {
  flex:1; padding:22rpx 0; border-radius:48rpx; text-align:center;
  transition:all .25s ease;
  &:active { transform:scale(.95); }
}
.dm-btn.cancel { background:#f5f5f5; }
.dm-btn.confirm { background:#1a1a1a; }
.dmb-text { font-size:28rpx; font-weight:600; }
.cancel .dmb-text { color:#666; }
.confirm .dmb-text { color:#fff; }

/* ===== Bottom Actions ===== */
.bottom-actions { display:flex; flex-direction:column; align-items:center; padding:40rpx 24rpx 20rpx; gap:14rpx; }
.primary-action {
  display:flex; align-items:center; gap:10rpx;
  padding:24rpx 56rpx;
  background:#07c160;
  border-radius:50rpx; transition:all .25s ease;
  box-shadow:0 4rpx 20rpx rgba(7,193,96,.25);
  &:active { opacity:.85; transform:scale(.97); }
}
.ab-icon { font-size:28rpx; color:#fff; }
.ab-text { font-size:28rpx; font-weight:600; color:#fff; }
.action-hint { }
.ah-text { font-size:22rpx; color:#ccc; }
.bottom-spacer { height:60rpx; }

/* ===== Share Mode (No Cook) ===== */
.photo-action-area {
  display:flex; gap:16rpx; padding:16rpx 8rpx; margin-bottom:12rpx;
}
.camera-btn, .pick-btn {
  flex:1; display:flex; align-items:center; justify-content:center; gap:10rpx;
  padding:28rpx 0; border-radius:20rpx; transition:all .25s ease;
  &:active { transform:scale(.97); opacity:.85; }
}
.camera-btn { background:#07c160; }
.pick-btn { background:#fff; box-shadow:0 1rpx 8rpx rgba(0,0,0,.04); }
.cam-icon { font-size:34rpx; }
.camera-btn .cam-text { font-size:27rpx; color:#fff; font-weight:600; }
.pick-btn .cam-text { font-size:27rpx; color:#666; font-weight:600; }

/* ===== Feed ===== */
.feed-date-label { padding:20rpx 8rpx 10rpx; }
.fdl-text { font-size:24rpx; color:#999; font-weight:500; }

.feed-card {
  background:#fff; border-radius:24rpx;
  overflow:hidden; margin-bottom:18rpx;
  box-shadow:0 1rpx 12rpx rgba(0,0,0,.04);
}
.feed-img { width:100%; height:420rpx; display:block; }
.feed-info { padding:18rpx 20rpx; }
.fi-top { display:flex; align-items:center; gap:12rpx; margin-bottom:10rpx; }
.fi-avatar {
  width:56rpx; height:56rpx; background:#e8f7ef; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
}
.fi-char { font-size:26rpx; font-weight:700; color:#07c160; }
.fi-meta { flex:1; display:flex; flex-direction:column; }
.fi-name { font-size:26rpx; font-weight:600; color:#333; }
.fi-time { font-size:20rpx; color:#bbb; margin-top:2rpx; }
.fi-self-tag {
  padding:6rpx 16rpx; background:#07c160; color:#fff;
  font-size:20rpx; font-weight:600; border-radius:16rpx;
}
.fi-partner-tag {
  padding:6rpx 16rpx; background:#e8f7ef; color:#07c160;
  font-size:20rpx; font-weight:600; border-radius:16rpx;
}
.fi-caption { font-size:26rpx; color:#555; line-height:1.5; display:block; }

.empty-feed {
  display:flex; flex-direction:column; align-items:center;
  padding:120rpx 40rpx;
}
.ef-icon { font-size:80rpx; margin-bottom:24rpx; }
.ef-title { font-size:30rpx; font-weight:600; color:#333; margin-bottom:12rpx; }
.ef-hint { font-size:24rpx; color:#bbb; text-align:center; }

/* ===== Card Animations ===== */
@keyframes cardFlipOut {
  0% { transform: rotateX(0deg) scale(1); opacity: 1; }
  50% { transform: rotateX(90deg) scale(0.8); opacity: 0.5; }
  100% { transform: rotateX(180deg) scale(0.6); opacity: 0; }
}
@keyframes cardFlipIn {
  0% { transform: rotateX(-90deg) scale(0.6); opacity: 0; }
  60% { transform: rotateX(15deg) scale(1.05); opacity: 1; }
  100% { transform: rotateX(0deg) scale(1); opacity: 1; }
}
@keyframes cardBounceIn {
  0% { transform: scale(0.3) translateY(-20rpx); opacity: 0; }
  50% { transform: scale(1.15) translateY(4rpx); opacity: 1; }
  70% { transform: scale(0.95) translateY(-2rpx); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes sparkleFly {
  0% { opacity: 1; transform: translate(0, 0) scale(0.3) rotate(0deg); }
  100% { opacity: 0; transform: translate(var(--sx, 30rpx), var(--sy, -60rpx)) scale(1.2) rotate(180deg); }
}

/* ===== Gesture Guide ===== */
.gesture-guide-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:10000;
  pointer-events:none; transition:background .4s ease;
  &.show { background:rgba(0,0,0,.82); pointer-events:auto; }
}
.gesture-modal {
  position:fixed; top:50%; left:50%;
  transform:translate(-50%,-50%) scale(.7); opacity:0;
  width:600rpx; max-height:88vh; background:#fff; border-radius:32rpx;
  overflow:hidden; transition:all .45s cubic-bezier(.175,.885,.32,1.275);
  box-shadow:0 24rpx 100rpx rgba(0,0,0,.35);
  display:flex; flex-direction:column;
  .gesture-guide-mask.show & { transform:translate(-50%,-50%) scale(1); opacity:1; }
}
.gm-top-bar {
  display:flex; justify-content:space-between; align-items:center;
  padding:28rpx 32rpx 24rpx;
  background:#07c160;
}
.gm-top-title { font-size:30rpx; color:#fff; font-weight:700; letter-spacing:2rpx; }
.gm-top-close {
  width:56rpx; height:56rpx; display:flex; align-items:center; justify-content:center;
  text { font-size:32rpx; color:rgba(255,255,255,.8); }
}
.gm-progress {
  padding:24rpx 32rpx 0; display:flex; align-items:center; gap:16rpx;
}
.gm-prog-track { flex:1; height:10rpx; background:#e8e8e8; border-radius:5rpx; overflow:hidden; }
.gm-prog-fill { height:100%; background:#07c160; border-radius:5rpx; transition:width .4s ease; }
.gm-prog-label { font-size:22rpx; color:#999; flex-shrink:0; }
.gm-guide-area { padding:24rpx 32rpx 0; display:flex; flex-direction:column; align-items:center; }
.gm-guide-title { font-size:34rpx; font-weight:800; color:#1a1a1a; text-align:center; margin-bottom:8rpx; }
.gm-guide-sub { font-size:24rpx; color:#aaa; text-align:center; margin-bottom:24rpx; }
.gm-demo-wrap {
  width:100%; display:flex; flex-direction:column; align-items:center;
  background:#f5f6f8; border-radius:24rpx;
  padding:32rpx 0 28rpx; position:relative;
}
.gm-demo-tag {
  position:absolute; top:16rpx; left:24rpx;
  padding:4rpx 16rpx; background:rgba(7,193,96,.12); border-radius:10rpx;
  font-size:20rpx; color:#07c160; font-weight:600;
}

.gg-demo-card {
  position:relative; width:220rpx; padding:24rpx 16rpx 18rpx;
  background:#fff; border-radius:20rpx; z-index:10;
  box-shadow:0 8rpx 40rpx rgba(7,193,96,.15);
  transition:transform .3s ease, opacity .3s ease;
  &.active { transform: translateY(var(--gg-offset, 0rpx)) rotateX(var(--gg-rotate, 0deg)); }
  &.flip-out { animation: ggFlipOut .35s ease-in forwards; }
  &.flip-in { animation: ggFlipIn .4s ease-out both; }
  &.swipe-away { animation: ggSwipeAway .4s ease-in forwards; }
  &.slide-in { animation: ggSlideIn .4s cubic-bezier(.175,.885,.32,1.275) both; }
  &.tap-pop { animation: ggTapPop .5s ease forwards; }
}
.ggdc-inner {
  display:flex; flex-direction:column; align-items:center; gap:8rpx;
}
.ggdc-icon-wrap {
  width:96rpx; height:96rpx; background:#f5f6fa; border-radius:22rpx;
  display:flex; align-items:center; justify-content:center;
}
.ggdc-icon { font-size:48rpx; }
.ggdc-name { font-size:24rpx; font-weight:600; color:#333; text-align:center; }

.ggdc-swipe-hint {
  position:absolute; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:4rpx; padding:6rpx 16rpx;
  background:#07c160; border-radius:20rpx;
  white-space:nowrap; opacity:0; transition:opacity .2s ease;
  &.show-up { top:-12rpx; opacity:1; }
  &.show-down { bottom:-12rpx; opacity:1; }
}
.ggsh-icon { font-size:18rpx; color:#fff; }
.ggsh-text { font-size:18rpx; color:#fff; font-weight:600; }

.ggdc-sparkle-layer {
  position:absolute; top:0; left:0; right:0; bottom:0;
  pointer-events:none; z-index:20; border-radius:20rpx; overflow:hidden;
}
.ggdc-sparkle {
  position:absolute; font-size:28rpx; color:#07c160;
  animation: ggSparkleFly .6s ease-out forwards;
  text-shadow:0 0 8rpx rgba(7,193,96,.6), 0 0 20rpx rgba(7,193,96,.3);
  &.gs1 { left:5%; top:15%; animation-delay:0s; }
  &.gs2 { left:75%; top:10%; animation-delay:.08s; font-size:32rpx; }
  &.gs3 { left:25%; top:75%; animation-delay:.12s; }
  &.gs4 { left:85%; top:60%; animation-delay:.04s; font-size:24rpx; }
  &.gs5 { left:45%; top:5%; animation-delay:.16s; font-size:26rpx; }
  &.gs6 { left:10%; top:50%; animation-delay:.2s; font-size:30rpx; }
}

.gm-footer {
  display:flex; flex-direction:column; align-items:center; gap:16rpx;
  padding:24rpx 32rpx 28rpx;
}
.gm-btn {
  width:100%; display:flex; align-items:center; justify-content:center; gap:10rpx;
  padding:22rpx 0; background:#07c160;
  border-radius:48rpx; transition:all .25s ease;
  &:active:not(.gm-btn-disabled) { transform:scale(.96); }
  &.gm-btn-disabled { opacity:.5; }
}
.gmb-icon { font-size:26rpx; color:#fff; }
.gmb-text { font-size:26rpx; color:#fff; font-weight:600; }
.gm-skip { padding:12rpx; text { font-size:24rpx; color:#bbb; } }

@keyframes ggFlipOut {
  0% { transform:rotateX(0) scale(1); opacity:1; }
  50% { transform:rotateX(90deg) scale(.8); opacity:.5; }
  100% { transform:rotateX(180deg) scale(.6); opacity:0; }
}
@keyframes ggFlipIn {
  0% { transform:rotateX(-90deg) scale(.6); opacity:0; }
  60% { transform:rotateX(15deg) scale(1.05); opacity:1; }
  100% { transform:rotateX(0) scale(1); opacity:1; }
}
@keyframes ggSwipeAway {
  0% { transform:translateY(0) rotate(-15deg); opacity:1; }
  100% { transform:translateY(120rpx) rotate(-25deg) scale(.7); opacity:0; }
}
@keyframes ggSlideIn {
  0% { transform:translateY(-80rpx) scale(.5); opacity:0; }
  100% { transform:translateY(0) scale(1); opacity:1; }
}
@keyframes ggTapPop {
  0% { transform:scale(1); opacity:1; }
  30% { transform:scale(1.2); }
  60% { transform:scale(1.1); }
  100% { transform:scale(1); opacity:1; }
}
@keyframes ggSparkleFly {
  0% { opacity:1; transform:translate(0,0) scale(.3) rotate(0); }
  100% { opacity:0; transform:translate(var(--sx,30rpx),var(--sy,-60rpx)) scale(1.2) rotate(180deg); }
}
</style>