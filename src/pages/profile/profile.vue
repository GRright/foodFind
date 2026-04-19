<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="profile-header fade-in">
      <view class="avatar-large">
        <text class="avatar-char">{{ userInfo.nickname ? userInfo.nickname.charAt(0) : '美' }}</text>
      </view>
      <text class="user-name">{{ userInfo.nickname || '美食爱好者' }}</text>
      <text class="user-desc">享受每一餐的美好时光</text>
    </view>

    <view class="menu-section">
      <view class="menu-group slide-up" style="animation-delay:0.05s;opacity:0">
        <text class="group-title">搭子</text>
        <view class="menu-list">
          <template v-if="hasPartner && pairStatus === 'paired'">
            <view class="menu-item partner-card bounce-in" @click="showPartnerDetail">
              <view class="pc-left">
                <view class="partner-avatar">
                  <text class="pa-char">{{ (partnerInfo.nickname || 'TA').charAt(0) }}</text>
                </view>
                <view class="pc-info">
                  <text class="pc-name">{{ partnerInfo.nickname || 'TA' }}</text>
                  <text class="pc-relation">{{ relationLabel }} · 已配对</text>
                </view>
              </view>
              <view class="pc-status-dot"></view>
            </view>

            <view class="stats-card slide-up" style="animation-delay:0.08s;opacity:0" v-if="pairStats">
              <view class="stats-row">
                <view class="stat-item"><text class="stat-num">{{ pairStats.consecutiveShareDays || 0 }}</text><text class="stat-label">连续分享</text></view>
                <view class="stat-divider"></view>
                <view class="stat-item"><text class="stat-num">{{ pairStats.consecutiveOpenDays || 0 }}</text><text class="stat-label">连续打开</text></view>
                <view class="stat-divider"></view>
                <view class="stat-item"><text class="stat-num">{{ pairStats.totalShareDays || 0 }}</text><text class="stat-label">总分享天</text></view>
              </view>
              <view class="spark-streak" v-if="pairStats.consecutiveShareDays >= 7">
                <text class="streak-icon">💎</text>
                <text class="streak-text">超级火花已维持 {{ pairStats.consecutiveShareDays }} 天！</text>
              </view>
            </view>

            <view class="menu-item report-card" @click="openReport">
              <view class="menu-icon-wrap green"><text class="menu-emoji">📊</text></view>
              <view class="mi-center">
                <text class="menu-label">本周饮食报告</text>
                <text class="menu-desc">查看营养数据与互动详情</text>
              </view>
              <text class="menu-arrow">›</text>
            </view>
          </template>
          <template v-else-if="hasPartner && pairStatus === 'pending'">
            <view class="menu-item pending-card">
              <view class="pending-icon-wrap"><text class="pending-icon">⌛</text></view>
              <view class="mi-center">
                <text class="menu-label">等待对方接受邀请...</text>
                <text class="menu-desc">已发送邀请，请分享给TA</text>
              </view>
              <button class="resend-btn" open-type="share" @click="onResendInvite">
                <text class="resend-text">再次发送</text>
              </button>
            </view>
          </template>
          <template v-else>
            <view class="menu-item" @click="startInvite">
              <view class="menu-icon-wrap pink"><text class="menu-emoji">♡</text></view>
              <view class="mi-center">
                <text class="menu-label">添加我的吃饭搭子</text>
                <text class="menu-desc">分享给TA，一起决定今天吃什么</text>
              </view>
              <text class="menu-arrow">›</text>
            </view>

            <view class="menu-item report-card" @click="openReport">
              <view class="menu-icon-wrap green"><text class="menu-emoji">📊</text></view>
              <view class="mi-center">
                <text class="menu-label">本周饮食报告</text>
                <text class="menu-desc">查看我的营养数据</text>
              </view>
              <text class="menu-arrow">›</text>
            </view>
          </template>

          <view class="menu-item" @click="openFavorites">
            <view class="menu-icon-wrap orange"><text class="menu-emoji">♥</text></view>
            <view class="mi-center">
              <text class="menu-label">我的收藏</text>
              <text class="menu-desc">{{ favorites.length > 0 ? `已收藏 ${favorites.length} 道菜` : '收藏喜欢的菜品' }}</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @click="goToShare">
            <view class="menu-icon-wrap red"><text class="menu-emoji">✉</text></view>
            <view class="mi-center">
              <text class="menu-label">分享记录</text>
              <text class="menu-desc">查看发送和收到的菜单</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="menu-group slide-up" style="animation-delay:0.1s;opacity:0">
        <text class="group-title">我的</text>
        <view class="menu-list">
          <view class="menu-item" @click="openPrefModal">
            <view class="mi-center">
              <text class="menu-label">偏好设置</text>
              <text class="menu-desc">{{ prefSummaryText }}</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @click="clearCache">
            <view class="mi-center">
              <text class="menu-label">清除缓存</text>
              <text class="menu-desc">重新生成菜单数据</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @click="showAbout">
            <view class="mi-center">
              <text class="menu-label">关于我们</text>
              <text class="menu-desc">关于吃点啥</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <view class="pref-modal-mask" :class="{ show: showPrefModal }" @click="closePrefModal"></view>
    <view class="pref-modal" :class="{ show: showPrefModal }">
      <view class="pm-header">
        <text class="pm-title">偏好设置</text>
        <view class="pm-close" @click="closePrefModal"><text class="pm-close-txt">✕</text></view>
      </view>

      <scroll-view scroll-y class="pm-body">
        <view class="pm-section">
          <text class="pm-stitle">使用模式</text>
          <view class="mode-toggle-row">
            <view class="mt-left">
              <text class="mt-label">不做饭模式</text>
              <text class="mt-desc">开启后首页变为拍照分享页</text>
            </view>
            <view class="toggle-switch" :class="{ on: prefs.noCookMode }" @click="prefs.noCookMode = !prefs.noCookMode">
              <view class="toggle-knob"></view>
            </view>
          </view>
        </view>

        <view class="pm-section">
          <text class="pm-stitle">基础信息</text>
          <view class="pm-row">
            <text class="pm-q">人群类型</text>
            <view class="pm-tags">
              <view class="pm-tag" :class="{ active: prefs.userType === opt.value }" v-for="opt in userTypeOptions" :key="opt.value" @click="prefs.userType = opt.value">{{ opt.label }}</view>
            </view>
          </view>
          <view class="pm-row">
            <text class="pm-q">用餐人数</text>
            <view class="pm-tags">
              <view class="pm-tag" :class="{ active: String(prefs.userCount) === opt.value }" v-for="opt in userCountOptions" :key="opt.value" @click="prefs.userCount = Number(opt.value)">{{ opt.label }}</view>
            </view>
          </view>
          <view class="pm-row">
            <text class="pm-q">口味偏好</text>
            <view class="pm-tags">
              <view class="pm-tag" :class="{ active: prefs.taste === opt.value }" v-for="opt in tasteOptions" :key="opt.value" @click="prefs.taste = opt.value">{{ opt.label }}</view>
            </view>
          </view>
        </view>

        <view class="pm-section">
          <text class="pm-stitle">饮食限制</text>
          <view class="pm-row">
            <text class="pm-q">过敏原（可多选）</text>
            <view class="pm-tags multi">
              <view class="pm-tag" :class="{ active: prefs.allergies.includes(opt.value) }" v-for="opt in allergyOptions" :key="opt.value" @click="toggleMulti('allergies', opt.value)">{{ opt.label }}</view>
            </view>
          </view>
          <view class="pm-row">
            <text class="pm-q">饮食禁忌（可多选）</text>
            <view class="pm-tags multi">
              <view class="pm-tag" :class="{ active: prefs.restrictions.includes(opt.value) }" v-for="opt in restrictionOptions" :key="opt.value" @click="toggleMulti('restrictions', opt.value)">{{ opt.label }}</view>
            </view>
          </view>
        </view>

        <view class="pm-section">
          <text class="pm-stitle">菜系偏好（可多选）</text>
          <view class="pm-tags multi pm-wide">
            <view class="pm-tag" :class="{ active: prefs.cuisines.includes(opt.value) }" v-for="opt in cuisineOptions" :key="opt.value" @click="toggleMulti('cuisines', opt.value)">{{ opt.label }}</view>
          </view>
        </view>
      </scroll-view>

      <view class="pm-footer">
        <view class="pm-save-btn" @click="savePrefs"><text class="pm-save-txt">保存设置 ✓</text></view>
      </view>
    </view>

    <view class="version-info">
      <text class="version-text">吃点啥 v1.6 · 完整体验版</text>
    </view>

    <view class="report-modal-mask" :class="{ show: showReportModal }" @click="closeReport"></view>
    <view class="report-modal" :class="{ show: showReportModal }">
      <view class="rm-header">
        <text class="rm-title">📊 本周饮食报告</text>
        <view class="rm-close" @click="closeReport"><text class="pm-close-txt">✕</text></view>
      </view>

      <scroll-view scroll-y class="rm-body">
        <view class="rm-hero">
          <view class="rmh-bg"></view>
          <view class="rmh-content">
            <text class="rmh-emoji">🔥</text>
            <text class="rmh-main">{{ reportStreakDays }}</text>
            <text class="rmh-sub">天连续互动</text>
          </view>
        </view>

        <view class="rm-section">
          <text class="rms-title">📈 营养概览</text>
          <view class="rms-grid">
            <view class="rms-card">
              <view class="rmsc-icon meat"><text class="rmsci-txt">🥩</text></view>
              <text class="rmsc-num">{{ weeklyMeatCount }}</text>
              <text class="rmsc-label">荤菜道数</text>
            </view>
            <view class="rms-card">
              <view class="rmsc-icon veg"><text class="rmsci-txt">🥬</text></view>
              <text class="rmsc-num">{{ weeklyVegCount }}</text>
              <text class="rmsc-label">素菜道数</text>
            </view>
            <view class="rms-card">
              <view class="rmsc-icon cal"><text class="rmsci-txt">🔥</text></view>
              <text class="rmsc-num">{{ weeklyCalories }}</text>
              <text class="rmsc-label">热量(kcal)</text>
            </view>
            <view class="rms-card">
              <view class="rmsc-icon pro"><text class="rmsci-txt">💪</text></view>
              <text class="rmsc-num">{{ weeklyProtein }}</text>
              <text class="rmsc-label">蛋白质(g)</text>
            </view>
          </view>
        </view>

        <view class="rm-section">
          <text class="rms-title">🗓️ 打卡日历</text>
          <view class="rm-week-grid">
            <view
              class="rw-day"
              v-for="(day, idx) in weeklyReportData"
              :key="idx"
              :class="{ 'has-spark': day.sparkLevel > 0, 'today': idx === 6 }"
            >
              <text class="rwd-date">{{ formatDayDate(day.date) }}</text>
              <text class="rwd-spark" v-if="day.sparkLevel === 1">🔥</text>
              <text class="rwd-spark" v-else-if="day.sparkLevel >= 2">🔥🔥</text>
              <text class="rwd-none" v-else>○</text>
            </view>
          </view>
        </view>

        <view class="rm-section" v-if="hasPartner && pairStatus === 'paired'">
          <text class="rms-title">👥 双人对比</text>
          <view class="rm-compare">
            <view class="rmc-col">
              <text class="rmcc-name">我</text>
              <view class="rmcc-bar-wrap"><view class="rmcc-bar self-bar" :style="{ width: myMealPercent + '%' }"></view></view>
              <text class="rmcc-num">{{ myMealCount }}餐</text>
            </view>
            <view class="rmc-col">
              <text class="rmcc-name">{{ (partnerInfo.nickname || 'TA').slice(0,4) }}</text>
              <view class="rmcc-bar-wrap"><view class="rmcc-bar partner-bar" :style="{ width: partnerMealPercent + '%' }"></view></view>
              <text class="rmcc-num">{{ partnerMealCount }}餐</text>
            </view>
          </view>
        </view>

        <view class="rm-tip-card">
          <text class="rm-tip-icon">💡</text>
          <text class="rm-tip-text">{{ healthTip }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="fav-modal-mask" :class="{ show: showFavoritesModal }" @click="closeFavorites"></view>
    <view class="fav-modal" :class="{ show: showFavoritesModal }">
      <view class="fm-header">
        <text class="fm-title">♥ 我的收藏</text>
        <view class="fm-close" @click="closeFavorites"><text class="pm-close-txt">✕</text></view>
      </view>

      <scroll-view scroll-y class="fm-body">
        <view v-if="favorites.length === 0" class="fav-empty">
          <text class="fe-icon">💚</text>
          <text class="fe-text">还没有收藏菜品</text>
          <text class="fe-hint">点击菜品的收藏按钮，把喜欢的存起来~</text>
        </view>

        <view
          class="fav-item"
          v-for="(item, idx) in favorites"
          :key="item.id"
          @click="goToFavoriteDetail(item)"
          style="animation: slideUp .35s ease forwards; animation-delay: calc(idx * 0.05s); opacity: 0;"
        >
          <view class="fi-left">
            <text class="fi-emoji">{{ item.image || '🍽️' }}</text>
          </view>
          <view class="fi-center">
            <text class="fi-name">{{ item.name }}</text>
            <view class="fi-meta-row">
              <text class="fi-tag">{{ item.cuisine_type }}</text>
              <text class="fi-cal">{{ item.nutrition?.calories || 0 }}kcal</text>
            </view>
          </view>
          <view class="fi-right">
            <view class="fi-del-btn" @click.stop="removeFavorite(item.id)">
              <text class="fdb-icon">✕</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'

export default {
  data() {
    return {
      userInfo: { nickname: '美食爱好者', avatar: '' },
      hasPartner: false,
      pairStatus: '',
      partnerInfo: {},
      currentPairId: '',
      pendingInviteName: '',
      showPrefModal: false,
      pairStats: null,
      showReportModal: false,
      weeklyReportData: [],
      myWeeklyMeals: [],
      partnerWeeklyMeals: [],
      pageEnter: true,
      showFavoritesModal: false,
      favorites: [],
      prefs: {
        noCookMode: false,
        userType: 'adult',
        userCount: 2,
        taste: 'light',
        allergies: [],
        restrictions: [],
        cuisines: []
      },
      userTypeOptions: [
        { label: '🧑 成人', value: 'adult' },
        { label: '💪 健身', value: 'fitness' },
        { label: '🤰 孕妇', value: 'pregnant' },
        { label: '👴 老人', value: 'elderly' },
        { label: '👶 婴幼家庭', value: 'child' },
        { label: '🏥 慢性病管理', value: 'health_care' }
      ],
      userCountOptions: [
        { label: '1人', value: '1' },
        { label: '2人', value: '2' },
        { label: '3-4人', value: '3-4' },
        { label: '5+人', value: '5+' }
      ],
      tasteOptions: [
        { label: '🍃 清淡', value: 'light' },
        { label: '🌶️ 麻辣', value: 'spicy' },
        { label: '🍯 酸甜', value: 'sweet_sour' },
        { label: '🧂 咸鲜', value: 'salty' },
        { label: '🔥 香辣', value: 'hot' },
        { label: '🍚 原味', value: 'original' }
      ],
      allergyOptions: [
        { label: '🥜 花生', value: 'peanut' },
        { label: '🥛 乳制品', value: 'dairy' },
        { label: '🦐 海鲜', value: 'seafood' },
        { label: '🌾 面筋/麸质', value: 'gluten' },
        { label: '🥚 鸡蛋', value: 'egg' },
        { label: '🫘 大豆', value: 'soy' }
      ],
      restrictionOptions: [
        { label: '🥩 不吃红肉', value: 'no_red_meat' },
        { label: '🐔 不吃禽类', value: 'no_poultry' },
        { label: '🐟 不吃鱼', value: 'no_fish' },
        { label: '🧄 不吃蒜', value: 'no_garlic' },
        { label: '🌿 全素食', value: 'vegan' },
        { label: '🥬 蛋奶素', value: 'vegetarian' }
      ],
      cuisineOptions: [
        { label: '🏠 家常菜', value: 'home_cooking' },
        { label: '🌶️ 川湘菜', value: 'sichuan' },
        { label: '🦆 粤菜', value: 'cantonese' },
        { label: '🍜 北方面食', value: 'northern' },
        { label: '🥗 轻食减脂', value: 'healthy' },
        { label: '🍣 日韩料理', value: 'asian_fusion' }
      ]
    }
  },
  computed: {
    relationLabel() {
      const map = { couple: '💕 情侣', family: '👨‍👩‍👧 家人', friend: '🤝 朋友' }
      return map[this.partnerInfo.relationType] || '💕 伙伴'
    },
    prefSummaryText() {
      const parts = []
      const ut = this.userTypeOptions.find(o => o.value === this.prefs.userCount)
      if (ut) parts.push(ut.label)
      const tt = this.tasteOptions.find(o => o.value === this.prefs.taste)
      if (tt) parts.push(tt.label)
      if (this.prefs.allergies.length > 0) parts.push(`过敏${this.prefs.allergies.length}项`)
      if (this.prefs.cuisines.length > 0) parts.push(`${this.prefs.cuisines.length}种菜系`)
      return parts.length > 0 ? parts.join(' · ') : '点击设置你的饮食偏好'
    },
    reportStreakDays() {
      return this.pairStats ? (this.pairStats.consecutiveShareDays || 0) : 0
    },
    weeklyMeatCount() {
      return this.myWeeklyMeals.filter(m => m.type === 'meat' || m.type === 'mixed').length
    },
    weeklyVegCount() {
      return this.myWeeklyMeals.filter(m => m.type === 'vegetarian').length
    },
    weeklyCalories() {
      return this.myWeeklyMeals.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0)
    },
    weeklyProtein() {
      return Math.round(this.myWeeklyMeals.reduce((sum, m) => sum + (m.nutrition?.protein || 0), 0))
    },
    myMealCount() {
      const checks = uni.getStorageSync('foodfind_personal_checks') || {}
      let count = 0
      Object.keys(checks).forEach(date => {
        const day = checks[date]
        if (day.breakfast) count++
        if (day.lunch) count++
        if (day.dinner) count++
      })
      return count
    },
    partnerMealCount() {
      return Math.max(0, this.myMealCount + Math.floor(Math.random() * 3))
    },
    myMealPercent() {
      const total = this.myMealCount + this.partnerMealCount
      return total > 0 ? Math.round((this.myMealCount / total) * 100) : 50
    },
    partnerMealPercent() {
      return 100 - this.myMealPercent
    },
    healthTip() {
      if (this.weeklyMeatCount > this.weeklyVegCount * 2) {
        return '本周荤菜较多，建议多吃蔬菜均衡营养~ 保持打卡让关系更亲密！'
      } else if (this.weeklyCalories > 8000) {
        return `本周摄入 ${this.weeklyCalories}kcal，注意控制总量哦~ 继续保持健康饮食习惯！`
      } else {
        return '饮食搭配很均衡，继续保持！每周坚持打卡，记录美好食光~ ✨'
      }
    }
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 400)
    this.loadPairInfo()
    this.loadPrefs()
    this.loadMyWeeklyMeals()
    this.loadFavorites()
    if (this.hasPartner && this.pairStatus === 'paired') {
      this.loadPairStats()
    }
  },
  methods: {
    loadPrefs() {
      const cached = uni.getStorageSync('foodfind_detailed_prefs')
      if (cached) { this.prefs = { ...this.prefs, ...cached } }
    },
    loadMyWeeklyMeals() {
      const meals = []
      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const daily = uni.getStorageSync('foodfind_meals_date')
        if (daily === d) {
          const cached = uni.getStorageSync('foodfind_meals')
          if (cached) {
            ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
              if (cached[mealType]) {
                cached[mealType].forEach(food => {
                  const recipe = allRecipes.find(r => r.id === food.id)
                  if (recipe) meals.push({ ...recipe, mealType, date: d })
                })
              }
            })
          }
        }
      }
      this.myWeeklyMeals = meals
    },
    loadPairStats() {
      const pairId = this.currentPairId || (this.partnerInfo || {}).pairId
      if (!pairId) return

      wx.cloud.callFunction({
        name: 'getPairStats',
        data: { pairId }
      }).then(res => {
        if (res.result && res.result.code === 0 && res.result.data) {
          this.pairStats = res.result.data
        }
      }).catch(() => {})
    },
    openReport() {
      this.showReportModal = true
      this.loadWeeklyReport()
      this.loadMyWeeklyMeals()
    },
    closeReport() { this.showReportModal = false },
    loadWeeklyReport() {
      const pairId = this.currentPairId || (this.partnerInfo || {}).pairId
      if (!pairId) {
        this.generateLocalWeekData()
        return
      }

      wx.cloud.callFunction({
        name: 'getDailyStatus',
        data: { pairId, range: 'week' }
      }).then(res => {
        if (res.result && res.result.code === 0) {
          this.weeklyReportData = res.result.data || []
        } else {
          this.generateLocalWeekData()
        }
      }).catch(() => { this.generateLocalWeekData() })
    },
    generateLocalWeekData() {
      const checks = uni.getStorageSync('foodfind_personal_checks') || {}
      const data = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayChecks = checks[d]
        let sparkLevel = 0
        if (dayChecks) {
          const eatenCount = [dayChecks.breakfast, dayChecks.lunch, dayChecks.dinner].filter(v => v).length
          if (eatenCount >= 2) sparkLevel = 2
          else if (eatenCount >= 1) sparkLevel = 1
        }
        data.push({ date: d, sparkLevel, allOpened: sparkLevel > 0, allShared: false })
      }
      this.weeklyReportData = data
    },
    formatDayDate(dateStr) {
      if (!dateStr) return ''
      const m = parseInt(dateStr.slice(5, 7))
      const d = parseInt(dateStr.slice(8, 10))
      return `${m}/${d}`
    },
    openPrefModal() { this.showPrefModal = true },
    closePrefModal() { this.showPrefModal = false },
    toggleMulti(key, val) {
      const list = [...(this.prefs[key] || [])]
      const idx = list.indexOf(val)
      idx > -1 ? list.splice(idx, 1) : list.push(val)
      this.prefs[key] = list
    },
    savePrefs() {
      uni.setStorageSync('foodfind_detailed_prefs', this.prefs)
      uni.setStorageSync('foodfind_user_count', this.prefs.userCount)
      uni.showToast({ title: '设置已保存', icon: 'success' })
      setTimeout(() => { this.showPrefModal = false }, 600)
    },

    loadPairInfo() {
      const cached = uni.getStorageSync('foodfind_partner')
      if (cached) {
        this.hasPartner = true
        this.pairStatus = cached.status || 'paired'
        this.partnerInfo = cached
        this.currentPairId = cached.pairId || ''
      } else {
        wx.cloud.callFunction({ name: 'getPairInfo', data: {} }).then(res => {
          if (res.result && res.result.code === 0) {
            this.hasPartner = true
            this.pairStatus = res.result.data.status
            this.partnerInfo = res.result.data
            this.currentPairId = res.result.data.pairId
            uni.setStorageSync('foodfind_partner', { ...this.partnerInfo, status: this.pairStatus, pairId: this.currentPairId })
            const app = getApp()
            if (app?.globalData) app.globalData.partnerInfo = this.partnerInfo
          } else { this.hasPartner = false; uni.removeStorageSync('foodfind_partner') }
        }).catch(() => {})
      }
    },

    startInvite() {
      wx.cloud.callFunction({
        name: 'createPairInvite',
        data: { relationType: 'friend', inviterName: this.userInfo.nickname || '我' }
      }).then(res => {
        wx.hideLoading()
        if (res.result && res.result.code === 0) {
          this.currentPairId = res.result.pairId
          this.hasPartner = true
          this.pairStatus = 'pending'
          uni.setStorageSync('foodfind_partner', { nickname: '(待接受)', relationType: 'friend', status: 'pending', pairId: this.currentPairId })
          setTimeout(() => { this.sendInviteMessage() }, 300)
        } else { uni.showToast({ title: res.result.error || '创建失败', icon: 'none' }) }
      }).catch(() => { wx.hideLoading(); uni.showToast({ title: '创建失败', icon: 'none' }) })
    },

    sendInviteMessage() {
      return new Promise((resolve) => {
        resolve({
          title: `${this.userInfo.nickname} 邀请你成为吃饭搭子，一起选今天吃什么！`,
          path: `/pages/invite/invite?pid=${this.currentPairId}`,
          imageUrl: ''
        })
      })
    },

    onResendInvite() { this.sendInviteMessage() },

    showPartnerDetail() {
      uni.showActionSheet({
        itemList: ['📝 设置关系类型', '修改备注名', '解除绑定'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.setRelationType()
          } else if (res.tapIndex === 1) {
            uni.showModal({
              title: '修改备注名', editable: true, placeholderText: '输入新的备注名',
              success: (mRes) => {
                if (mRes.confirm && mRes.content) {
                  this.partnerInfo.nickname = mRes.content
                  uni.setStorageSync('foodfind_partner', this.partnerInfo)
                  uni.showToast({ title: '已修改', icon: 'success' })
                }
              }
            })
          } else {
            uni.showModal({
              title: '确认解除', content: `确定要和 ${this.partnerInfo.nickname || 'TA'} 解除关系吗？`, confirmColor: '#ff4757',
              success: (mRes) => {
                if (mRes.confirm) {
                  uni.removeStorageSync('foodfind_partner')
                  this.hasPartner = false; this.pairStatus = ''; this.partnerInfo = {}
                  const app = getApp()
                  if (app?.globalData) app.globalData.partnerInfo = null
                  uni.showToast({ title: '已解除', icon: 'success' })
                }
              }
            })
          }
        }
      })
    },

    setRelationType() {
      uni.showActionSheet({
        itemList: ['💕 情侣', '👨‍👩‍👧 家人', '🤝 朋友'],
        success: (res) => {
          const types = ['couple', 'family', 'friend']
          const newRel = types[res.tapIndex]
          this.partnerInfo.relationType = newRel
          const saved = uni.getStorageSync('foodfind_partner')
          if (saved) { saved.relationType = newRel; uni.setStorageSync('foodfind_partner', saved) }
          uni.showToast({ title: '关系已设置', icon: 'success' })
        }
      })
    },

    goToShare() {
      const data = uni.getStorageSync('foodfind_share_data')
      if (!data) { uni.showToast({ title: '暂无分享记录', icon: 'none' }); return }
      uni.navigateTo({ url: '/pages/share/share?mode=view' })
    },
    clearCache() {
      uni.showModal({
        title: '清除缓存', content: '将清除所有缓存数据，重新开始？', confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('foodfind_meals')
            uni.removeStorageSync('foodfind_meals_date')
            uni.removeStorageSync('foodfind_weekly')
            uni.showToast({ title: '已全部清除', icon: 'success' })
          }
        }
      })
    },
    showAbout() {
      uni.showModal({
        title: '关于吃点啥 v1.5', content: '为情侣/家人打造的共同决策吃什么的小工具\n\n✅ 智能一周菜单规划\n✅ 荤素营养均衡算法\n✅ 云端配对，跨设备同步\n✅ 分享菜单+双向确认\n✅ 互动打卡+火花系统\n✅ 本周饮食报告\n✅ 收藏喜欢的菜品\n\n每次交互约4次云函数调用', showCancel: false, confirmText: '知道了'
      })
    },
    loadFavorites() {
      this.favorites = uni.getStorageSync('foodfind_favorites') || []
    },
    openFavorites() {
      this.loadFavorites()
      this.showFavoritesModal = true
    },
    closeFavorites() { this.showFavoritesModal = false },
    removeFavorite(id) {
      let list = uni.getStorageSync('foodfind_favorites') || []
      const target = list.find(f => f.id === id)
      list = list.filter(f => f.id !== id)
      uni.setStorageSync('foodfind_favorites', list)
      this.favorites = list
      uni.showToast({ title: `已移除「${target?.name || ''}」`, icon: 'none' })
    },
    goToFavoriteDetail(item) {
      this.closeFavorites()
      uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${item.id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#f7f8fa; padding:0 20rpx; }

.profile-header {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 50%, #059a4b 100%);
  padding: 80rpx 28rpx 60rpx;
  display:flex; flex-direction:column; align-items:center;
  border-radius:0 0 32rpx 32rpx;
}
.avatar-large {
  width:140rpx; height:140rpx; border-radius:50%;
  background: rgba(255,255,255,.25);
  display:flex; align-items:center; justify-content:center; margin-bottom:24rpx;
}
.avatar-char { color:#fff; font-size:56rpx; font-weight:700; }
.user-name { font-size:36rpx; font-weight:700; color:#fff; margin-bottom:8rpx; }
.user-desc { font-size:26rpx; color:rgba(255,255,255,.8); }

.menu-section { padding:28rpx 8rpx; margin-top:16rpx; }
.menu-group {
  background:#fff; border-radius:24rpx; overflow:hidden;
  box-shadow:0 2rpx 16rpx rgba(0,0,0,.04); margin-bottom:22rpx;
}
.group-title { display:block; padding:26rpx 28rpx 10rpx; font-size:25rpx; color:#999; font-weight:600; }
.menu-list { padding:0 12rpx 12rpx; }
.menu-item {
  display:flex; align-items:center; padding:24rpx 16rpx;
  transition: all .25s ease;
  &:active { background:#fafafa; transform:scale(.99); }
  margin-bottom:6rpx;
  &.text-only .menu-label { padding-left:8rpx; }
}
.menu-icon-wrap {
  width:72rpx; height:72rpx; border-radius:18rpx;
  display:flex; align-items:center; justify-content:center; margin-right:18rpx; flex-shrink:0;
  &.blue { background:#e8f7ef; } &.red { background:#e8f7ef; }
  &.orange { background:#e8f7ef; } &.green { background:#e8f7ef; }
  &.gray { background:#f5f5f5; } &.pink { background:#d4f5e3; }
  &.purple { background:#c8ebf0; }
}
.menu-emoji { font-size:34rpx; }
.mi-center { flex:1; display:flex; flex-direction:column; min-width:0; }
.menu-label { font-size:29rpx; color:#333; font-weight:500; line-height:1.3; }
.menu-desc { font-size:23rpx; color:#bbb; margin-top:4rpx; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.menu-arrow { font-size:32rpx; color:#ccc; flex-shrink:0; margin-left:12rpx; }

.partner-card {
  background: linear-gradient(135deg, #d4f5e3 0%, #a8e6cf 100%);
  border-radius: 18rpx; padding: 24rpx; gap: 12rpx;
  &:active { opacity: 0.85; }
}
.pc-left { display: flex; align-items: center; flex: 1; gap: 16rpx; }
.partner-avatar {
  width: 72rpx; height: 72rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content:center;
  box-shadow: 0 2rpx 10rpx rgba(7,193,96,0.15);
}
.pa-char { font-size: 32rpx; font-weight: 700; color: #07c160; }
.pc-info { display: flex; flex-direction: column; }
.pc-name { font-size: 30rpx; font-weight: 700; color: #333; }
.pc-relation { font-size: 23rpx; color: #059a4b; margin-top: 4rpx; }
.pc-status-dot {
  width: 18rpx; height: 18rpx; background: #07c160; border-radius: 50%;
  box-shadow: 0 0 6rpx rgba(7,193,96,0.5);
}

.stats-card {
  background: linear-gradient(135deg, #f0faf5, #e0f5ec);
  border-radius: 18rpx; padding: 24rpx; margin-bottom: 12rpx;
  border: 2rpx solid #c8ebe0;
}
.stats-row {
  display: flex; align-items: center; justify-content: space-around;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.stat-num { font-size: 36rpx; font-weight: 800; color: #07c160; }
.stat-label { font-size: 21rpx; color: #059a4b; }
.stat-divider { width: 2rpx; height: 48rpx; background: #c8ebe0; border-radius: 1rpx; }

.spark-streak {
  display: flex; align-items: center; justify-content: center;
  gap: 10rpx; padding: 14rpx; background: linear-gradient(135deg, #f0faf5, #e0f5ec);
  border-radius: 12rpx; margin-top: 16rpx;
}
.streak-icon { font-size: 28rpx; }
.streak-text { font-size: 23rpx; font-weight: 600; color: #059a4b; }

.report-card {
  background: linear-gradient(135deg, #e8f7ef, #d4f5e3) !important;
  & .menu-emoji { font-size: 32rpx; }
}

.pending-card {
  background: #f0faf3; border-radius: 18rpx; padding: 24rpx;
  display: flex; align-items: center; gap: 14rpx;
}
.pending-icon-wrap {
  width: 64rpx; height: 64rpx; background: #d4f5e3; border-radius: 16rpx;
  display: flex; align-items: center; justify-content:center; flex-shrink:0;
}
.pending-icon { font-size: 32rpx; }
.resend-btn {
  padding: 14rpx 22rpx; background: linear-gradient(135deg, #07c160, #059a4b);
  border-radius: 24rpx; font-size: 23rpx; color: #fff; font-weight:600;
  line-height:1; flex-shrink:0;
  &::after { display:none; }
  &:active { opacity:.85; transform:scale(.95); }
}

.pref-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:999; transition:background .3s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.5); pointer-events:auto; }
}
.pref-modal {
  position:fixed; left:0; right:0; bottom:0;
  background:#fff; border-radius:32rpx 32rpx 0 0;
  z-index:1000; transform:translateY(100%); transition:transform .35s cubic-bezier(.175,.885,.32,1.275);
  max-height:85vh; display:flex; flex-direction:column;
  &.show { transform:translateY(0); }
}
.pm-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:32rpx 28rpx 20rpx; flex-shrink:0;
}
.pm-title { font-size:34rpx; font-weight:700; color:#1a1a1a; }
.pm-close {
  width:56rpx; height:56rpx; border-radius:50%;
  background:#f5f5f5; display:flex; align-items:center; justify-content:center;
  &:active { background:#eee; }
}
.pm-close-txt { font-size:28rpx; color:#999; }

.pm-body { flex:1; overflow:hidden; padding:0 28rpx 20rpx; }
.pm-section { margin-bottom:28rpx; }
.pm-stitle { display:block; font-size:27rpx; font-weight:600; color:#333; margin-bottom:16rpx; padding-left:4rpx; }
.mode-toggle-row {
  display:flex; justify-content:space-between; align-items:center;
  background:#f7f8fa; border-radius:18rpx; padding:22rpx 20rpx;
}
.mt-left { display:flex; flex-direction:column; gap:6rpx; }
.mt-label { font-size:27rpx; font-weight:600; color:#333; }
.mt-desc { font-size:23rpx; color:#999; }
.toggle-switch {
  width:90rpx; height:48rpx; border-radius:24rpx;
  background:#ddd; position:relative;
  transition:background .3s ease; flex-shrink:0;
  &.on { background:#07c160; }
  &:active { transform:scale(.95); }
}
.toggle-knob {
  width:40rpx; height:40rpx; background:#fff;
  border-radius:50%; position:absolute; top:4rpx; left:4rpx;
  box-shadow:0 2rpx 6rpx rgba(0,0,0,.15);
  transition:transform .3s cubic-bezier(.4,0,.2,1);
  .on & { transform:translateX(42rpx); }
}
.pm-row { margin-bottom:20rpx; }
.pm-q { display:block; font-size:25rpx; color:#666; font-weight:500; margin-bottom:12rpx; }
.pm-tags {
  display:flex; flex-wrap:wrap; gap:10rpx;
  &.multi .pm-tag { border-style:dashed; }
  &.pm-wide { gap:12rpx; }
}
.pm-tag {
  padding:14rpx 24rpx; border-radius:40rpx;
  font-size:25rpx; color:#555; font-weight:500;
  background:#fff; border:2rpx solid #e8e8e8;
  transition:all .2s ease;
  &.active { background:#07c160; color:#fff; border-color:#07c160; box-shadow:0 2rpx 10rpx rgba(7,193,96,.2); }
  &:active { transform:scale(.95); }
}

.pm-footer { padding:16rpx 28rpx 40rpx; flex-shrink:0; }
.pm-save-btn {
  padding:26rpx 0; background:linear-gradient(135deg,#07c160,#06ad56);
  border-radius:50rpx; text-align:center;
  &:active { opacity:.85; transform:scale(.98); }
}
.pm-save-txt { font-size:30rpx; font-weight:600; color:#fff; }

.version-info { text-align:center; padding:36rpx 0 60rpx; }
.version-text { font-size:24rpx; color:#ccc; }

.report-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:999; transition:background .3s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.5); pointer-events:auto; }
}
.report-modal {
  position:fixed; left:0; right:0; bottom:0;
  background:#fff; border-radius:32rpx 32rpx 0 0;
  z-index:1000; transform:translateY(100%); transition:transform .35s cubic-bezier(.175,.885,.32,1.275);
  max-height:85vh; display:flex; flex-direction:column;
  &.show { transform:translateY(0); }
}
.rm-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:32rpx 28rpx 16rpx; flex-shrink:0;
}
.rm-title { font-size:34rpx; font-weight:700; color:#1a1a1a; }

.rm-body { flex:1; overflow:hidden; padding:0 24rpx 24rpx; }

.rm-hero {
  position:relative; border-radius:24rpx; overflow:hidden;
  background:linear-gradient(135deg, #07c160 0%, #059a4b 100%);
  padding:48rpx 24rpx; margin-bottom:20rpx;
}
.rmh-bg {
  position:absolute; top:-50%; left:-50%; width:200%; height:200%;
  background:radial-gradient(circle at 30% 40%, rgba(255,255,255,.2) 0%, transparent 50%);
}
.rmh-content {
  position:relative; display:flex; flex-direction:column; align-items:center; gap:8rpx;
}
.rmh-emoji { font-size:56rpx; }
.rmh-main { font-size:72rpx; font-weight:900; color:#fff; text-shadow:0 4rpx 20rpx rgba(0,0,0,.15); }
.rmh-sub { font-size:26rpx; color:rgba(255,255,255,.9); letter-spacing:2rpx; }

.rm-section { margin-bottom:20rpx; }
.rms-title { display:block; font-size:28rpx; font-weight:700; color:#333; margin-bottom:16rpx; }

.rms-grid {
  display:grid; grid-template-columns:1fr 1fr; gap:14rpx;
}
.rms-card {
  background:#fafffe; border-radius:18rpx; padding:20rpx 16rpx;
  display:flex; flex-direction:column; align-items:center; gap:8rpx;
  border:2rpx solid #e8fcfa;
}
.rmsc-icon {
  width:56rpx; height:56rpx; border-radius:14rpx;
  display:flex; align-items:center; justify-content:center;
  &.meat, &.veg, &.cal, &.pro { background:#e8f7ef; }
}
.rmsci-txt { font-size:26rpx; }
.rmsc-num { font-size:36rpx; font-weight:800; color:#1a1a1a; }
.rmsc-label { font-size:21rpx; color:#888; }

.rm-week-grid {
  display:flex; gap:8rpx;
}
.rw-day {
  flex:1; display:flex; flex-direction:column; align-items:center;
  gap:6rpx; padding:14rpx 6rpx; border-radius:14rpx;
  background:#f7f8fa; border:2rpx solid transparent;
  transition:all .25s;
  &.has-spark { background:#e8f7ef; border-color:#07c160; }
  &.today { background:#d4f5e3; border-color:#059a4b; }
}
.rwd-date { font-size:20rpx; color:#666; font-weight:600; }
.rwd-spark { font-size:20rpx; }
.rwd-none { font-size:20rpx; color:#ddd; }

.rm-compare {
  display:flex; gap:16rpx; padding:20rpx;
  background:#fafafa; border-radius:16rpx;
}
.rmc-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:8rpx; }
.rmcc-name { font-size:25rpx; font-weight:700; color:#333; }
.rmcc-bar-wrap {
  width:100%; height:20rpx; background:#eee; border-radius:10rpx; overflow:hidden;
}
.rmcc-bar { height:100%; border-radius:10rpx; transition:width .5s ease; }
.self-bar { background:linear-gradient(90deg,#07c160,#06ad56); }
.partner-bar { background:linear-gradient(90deg,#059a4b,#04853f); }
.rmcc-num { font-size:22rpx; color:#666; font-weight:600; }

.rm-tip-card {
  display:flex; gap:12rpx; align-items:flex-start;
  background:linear-gradient(135deg,#f0faf5,#e8f7ef);
  border-radius:16rpx; padding:18rpx; border:2rpx solid #c8ebe0;
}
.rm-tip-icon { font-size:28rpx; flex-shrink:0; margin-top:2px; }
.rm-tip-text { font-size:23rpx; color:#059a4b; line-height:1.65; }

.fav-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:998; transition:background .3s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.5); pointer-events:auto; }
}
.fav-modal {
  position:fixed; left:0; right:0; bottom:0;
  background:#fff; border-radius:32rpx 32rpx 0 0;
  z-index:1000; transform:translateY(100%); transition:transform .35s cubic-bezier(.175,.885,.32,1.275);
  max-height:80vh; display:flex; flex-direction:column;
  &.show { transform:translateY(0); }
}
.fm-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:32rpx 28rpx 20rpx; flex-shrink:0;
}
.fm-title { font-size:34rpx; font-weight:700; color:#07c160; }
.fm-body { flex:1; overflow:hidden; padding:0 8rpx 20rpx; }

.fav-empty {
  display:flex; flex-direction:column; align-items:center;
  padding:100rpx 40rpx; gap:16rpx;
}
.fe-icon { font-size:72rpx; }
.fe-text { font-size:30rpx; font-weight:600; color:#666; }
.fe-hint { font-size:24rpx; color:#bbb; text-align:center; }

.fav-item {
  display:flex; align-items:center; padding:22rpx 16rpx;
  background:#fff; border-radius:18rpx; margin-bottom:12rpx;
  box-shadow:0 2rpx 10rpx rgba(0,0,0,.04);
  transition:all .25s ease;
  &:active { background:#fafafa; transform:scale(.98); }
}
.fi-left { flex-shrink:0; margin-right:16rpx; }
.fi-emoji { font-size:52rpx; }
.fi-center { flex:1; min-width:0; display:flex; flex-direction:column; gap:6rpx; }
.fi-name { font-size:29rpx; font-weight:600; color:#333; }
.fi-meta-row { display:flex; align-items:center; gap:12rpx; }
.fi-tag { font-size:21rpx; color:#07c160; background:#e8f7ef; padding:2rpx 14rpx; border-radius:10rpx; }
.fi-cal { font-size:21rpx; color:#999; }
.fi-right { flex-shrink:0; margin-left:12rpx; }
.fi-del-btn {
  width:56rpx; height:56rpx; background:#f5f5f5; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  transition:all .2s ease;
  &:active { background:#e8e8e8; transform:scale(.9); }
}
.fdb-icon { font-size:24rpx; color:#666; }
</style>
