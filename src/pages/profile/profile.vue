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
              <button class="resend-btn" @click="onResendInvite">
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

          <view class="menu-item" @click="openSpecialDates">
            <view class="menu-icon-wrap pink"><text class="menu-emoji">🎂</text></view>
            <view class="mi-center">
              <text class="menu-label">特别日子</text>
              <text class="menu-desc">生日、纪念日，特别菜单推荐</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="menu-group slide-up" style="animation-delay:0.1s;opacity:0">
        <text class="group-title">我的</text>
        <view class="menu-list">
          <view class="menu-item" @click="goToFamily">
            <view class="menu-icon-wrap green"><text class="menu-emoji">🏠</text></view>
            <view class="mi-center">
              <text class="menu-label">家庭群组</text>
              <text class="menu-desc">{{ familySummary }}</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>

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

        <view class="pm-section" v-if="hasFamily">
          <text class="pm-stitle">家庭健康标签</text>
          <text class="pm-hint">设置后推荐菜品时会考虑家庭成员需求</text>
          <view class="pm-row" v-for="category in healthTagCategories" :key="category">
            <text class="pm-q">{{ category }}</text>
            <view class="pm-tags multi">
              <view class="pm-tag" :class="{ active: prefs.healthTags.includes(tag.id) }" v-for="tag in getTagsByCategory(category)" :key="tag.id" @click="toggleHealthTag(tag.id)">{{ tag.icon }} {{ tag.name }}</view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="pm-footer">
        <view class="pm-save-btn" @click="savePrefs"><text class="pm-save-txt">保存设置 ✓</text></view>
      </view>
    </view>

    <view class="version-info">
      <text class="version-text">吃点啥 v2.4 · 营养可视化+特别日子</text>
    </view>

    <view class="report-modal-mask" :class="{ show: showReportModal }" @click="closeReport"></view>
    <view class="report-modal" :class="{ show: showReportModal }">
      <view class="rm-header">
        <view class="rm-header-left">
          <text class="rm-title">📊 本周饮食报告</text>
          <text class="rm-subtitle">{{ formatWeekDateRange() }}</text>
        </view>
        <view class="rm-close" @click="closeReport"><text class="pm-close-txt">✕</text></view>
      </view>

      <scroll-view scroll-y class="rm-body">
        <view class="rm-hero">
          <view class="rmh-content">
            <view v-if="reportMode === 'solo'" class="rmh-solo">
              <view class="rmh-avatar-wrap">
                <view class="rmh-avatar solo-av"><text class="rmhav-txt">{{ (userInfo.nickname || '我').charAt(0) }}</text></view>
                <view class="rmh-streak-circle">
                  <text class="rmh-solo-streak">{{ reportStreakDays }}</text>
                </view>
              </view>
              <text class="rmh-solo-label">天连续打卡</text>
              <text class="rmh-motto">{{ reportMotto }}</text>
            </view>
            <view v-else-if="reportMode === 'pair'" class="rmh-pair">
              <view class="rmh-pair-avatars">
                <view class="rmh-avatar"><text class="rmhav-txt">{{ (userInfo.nickname || '我').charAt(0) }}</text></view>
                <view class="rmh-connector">
                  <view class="rmh-line"></view>
                  <view class="rmh-relation-badge"><text class="rmhrl-txt">{{ relationLabel }}</text></view>
                </view>
                <view class="rmh-avatar"><text class="rmhav-txt">{{ (partnerInfo.nickname || 'TA').charAt(0) }}</text></view>
              </view>
              <view class="rmh-streak-wrap">
                <text class="rmhps-num">{{ reportStreakDays }}</text>
                <text class="rmhps-label">天连续互动</text>
              </view>
            </view>
            <view v-else class="rmh-family">
              <view class="rmh-fam-avatars">
                <view class="rmh-avatar fam-av"><text class="rmhav-txt">{{ (userInfo.nickname || '我').charAt(0) }}</text></view>
                <view class="rmh-connector">
                  <view class="rmh-line fam-line"></view>
                  <view class="rmh-relation-badge"><text class="rmhrl-txt">👨‍👩‍👧‍👦 {{ prefs.userCount }}人</text></view>
                </view>
                <view class="rmh-avatar fam-av"><text class="rmhav-txt">{{ (partnerInfo.nickname || 'TA').charAt(0) }}</text></view>
              </view>
              <view class="rmh-streak-wrap">
                <text class="rmhfs-num">{{ reportStreakDays }}</text>
                <text class="rmhfs-label">天全家坚持</text>
              </view>
            </view>
          </view>
        </view>

        <view class="rm-stats-row">
          <view class="rm-stat-card large">
            <text class="rm-stat-value">{{ weeklyCalories }}</text>
            <text class="rm-stat-label">总热量(kcal)</text>
          </view>
          <view class="rm-stat-card">
            <text class="rm-stat-value">{{ myMealCount }}</text>
            <text class="rm-stat-label">已打卡餐数</text>
          </view>
          <view class="rm-stat-card">
            <text class="rm-stat-value">{{ weeklyCheckInDays }}</text>
            <text class="rm-stat-label">打卡天数</text>
          </view>
          <view class="rm-stat-card">
            <text class="rm-stat-value">{{ weeklyProtein }}</text>
            <text class="rm-stat-label">蛋白质(g)</text>
          </view>
        </view>

        <view class="rm-section">
          <view class="rm-section-header">
            <text class="rms-title">🥗 营养摄入</text>
            <text class="rms-desc">本周三大营养素占比</text>
          </view>
          <view class="rm-pie-card">
            <view class="rm-pie-row">
              <view class="rm-pie-chart">
                <view class="rm-pie-outer" :style="pieChartStyle">
                  <view class="rm-pie-inner">
                    <text class="rm-pie-center-val">{{ nutritionTotal }}</text>
                    <text class="rm-pie-center-label">总克数</text>
                  </view>
                </view>
              </view>
              <view class="rm-pie-legend">
                <view class="rm-legend-item">
                  <view class="rm-legend-dot" style="background:#07c160"></view>
                  <view class="rm-legend-info">
                    <text class="rm-legend-name">蛋白质</text>
                    <text class="rm-legend-val">{{ weeklyProtein }}g · {{ proteinPercent }}%</text>
                  </view>
                </view>
                <view class="rm-legend-item">
                  <view class="rm-legend-dot" style="background:#ff9f43"></view>
                  <view class="rm-legend-info">
                    <text class="rm-legend-name">脂肪</text>
                    <text class="rm-legend-val">{{ weeklyFat }}g · {{ fatPercent }}%</text>
                  </view>
                </view>
                <view class="rm-legend-item">
                  <view class="rm-legend-dot" style="background:#5b9bd5"></view>
                  <view class="rm-legend-info">
                    <text class="rm-legend-name">碳水</text>
                    <text class="rm-legend-val">{{ weeklyCarbs }}g · {{ carbsPercent }}%</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="rm-section">
          <view class="rm-section-header">
            <text class="rms-title">🤝 互动趋势</text>
          </view>
          <view class="rm-chart-card">
            <view class="rm-chart-bars">
              <view class="rm-chart-bar" v-for="(day, idx) in weeklyReportData" :key="idx">
                <view class="rm-bar" :style="{ height: Math.max(10, (day.mealCount / 3) * 100) + '%' }">
                  <text class="rm-bar-meals" v-if="day.mealCount > 0">{{ day.mealCount }}</text>
                </view>
                <text class="rm-bar-label">{{ formatDayDate(day.date) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="rm-section" v-if="hasPartner && pairStatus === 'paired'">
          <view class="rm-section-header">
            <text class="rms-title">👥 双人对比</text>
            <text class="rms-desc">一起好好吃饭</text>
          </view>
          <view class="rm-compare-card">
            <view class="rmc-col">
              <view class="rmc-avatar">
                <text class="rmc-char">{{ (userInfo.nickname || '我').charAt(0) }}</text>
              </view>
              <text class="rmcc-name">我</text>
              <view class="rmcc-bar-wrap">
                <view class="rmcc-bar self-bar" :style="{ width: Math.min(100, myMealPercent) + '%' }"></view>
              </view>
              <text class="rmcc-num">{{ myMealCount }}餐</text>
            </view>
            <view class="rmc-col">
              <view class="rmc-avatar partner">
                <text class="rmc-char">{{ (partnerInfo.nickname || 'TA').charAt(0) }}</text>
              </view>
              <text class="rmcc-name">{{ (partnerInfo.nickname || 'TA').slice(0,4) }}</text>
              <view class="rmcc-bar-wrap">
                <view class="rmcc-bar partner-bar" :style="{ width: Math.min(100, partnerMealPercent) + '%' }"></view>
              </view>
              <text class="rmcc-num">{{ partnerMealCount }}餐</text>
            </view>
          </view>
        </view>

        <view class="rm-footer-spacer"></view>
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
import { HEALTH_TAGS, HEALTH_TAG_CATEGORIES, getFamilyGroup, getCurrentUserId } from '@/utils/family.js'

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
      _weeklyCheckInDays: 0,
      _myMealCount: 0,
      _weeklyNutritionCache: null,
      _familyGroup: null,
      prefs: {
        noCookMode: false,
        userType: 'adult',
        userCount: 2,
        taste: 'light',
        allergies: [],
        restrictions: [],
        cuisines: [],
        healthTags: []
      },
      healthTags: HEALTH_TAGS,
      healthTagCategories: HEALTH_TAG_CATEGORIES,
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
    reportMode() {
      const uc = this.prefs.userCount
      if (!this.hasPartner || this.pairStatus !== 'paired') return 'solo'
      if (uc === '3-4' || uc === '5+') return 'family'
      return 'pair'
    },
    reportMotto() {
      const days = this.reportStreakDays
      const meals = this.myMealCount
      if (days === 0) return '开始打卡，记录每一餐的美好~'
      if (days < 3) return `已坚持${days}天，下周也要好好吃饭哦！`
      if (days < 7) return `${days}天连续打卡，你比想象中更自律！`
      return `连续${days}天好好吃饭，太棒了！继续加油！`
    },
    weeklyCheckInDays() {
      return this._weeklyCheckInDays
    },
    familySummary() {
      if (!this._familyGroup) return '创建或加入家庭群组'
      return this._familyGroup.name + ' · ' + this._familyGroup.members.length + '人'
    },
    hasFamily() {
      return this._familyGroup !== null && this._familyGroup !== undefined
    },
    prefSummaryText() {
      const parts = []
      const ut = this.userTypeOptions.find(o => o.value === this.prefs.userType)
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
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition()
      }
      return this._weeklyNutritionCache.calories
    },
    weeklyProtein() {
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition()
      }
      return this._weeklyNutritionCache.protein
    },
    weeklyFat() {
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition()
      }
      return this._weeklyNutritionCache.fat
    },
    weeklyCarbs() {
      if (!this._weeklyNutritionCache) {
        this._weeklyNutritionCache = this.calcWeeklyNutrition()
      }
      return this._weeklyNutritionCache.carbs
    },
    nutritionTotal() {
      return this.weeklyProtein + this.weeklyFat + this.weeklyCarbs
    },
    proteinPercent() {
      const t = this.nutritionTotal
      return t > 0 ? Math.round((this.weeklyProtein / t) * 100) : 33
    },
    fatPercent() {
      const t = this.nutritionTotal
      return t > 0 ? Math.round((this.weeklyFat / t) * 100) : 33
    },
    carbsPercent() {
      const t = this.nutritionTotal
      return t > 0 ? 100 - this.proteinPercent - this.fatPercent : 34
    },
    pieChartStyle() {
      const p = this.proteinPercent
      const f = this.fatPercent
      const c = this.carbsPercent
      return `background: conic-gradient(#07c160 0% ${p}%, #ff9f43 ${p}% ${p + f}%, #5b9bd5 ${p + f}% 100%)`
    },
    myMealCount() {
      return this._myMealCount
    },
    partnerMealCount() {
      const partnerChecks = uni.getStorageSync('foodfind_partner_checks')
      if (partnerChecks) {
        let count = 0
        Object.keys(partnerChecks).forEach(date => {
          const day = partnerChecks[date]
          if (day.breakfast) count++
          if (day.lunch) count++
          if (day.dinner) count++
        })
        return count
      }
      return 0
    },
    myMealPercent() {
      const total = this.myMealCount + this.partnerMealCount
      return total > 0 ? Math.round((this.myMealCount / total) * 100) : 50
    },
    partnerMealPercent() {
      return 100 - this.myMealPercent
    },
    healthTip() {
      const mode = this.reportMode
      const days = this.weeklyCheckInDays
      const cal = this.weeklyCalories
      if (mode === 'solo') {
        if (days === 0) return '还没有开始打卡哦，今天的三餐别忘了记录~ 🍚'
        if (days <= 2) return `本周已打卡${days}天，坚持记录饮食是自律的第一步！`
        if (days <= 5) return `本周${days}天有在好好吃饭，继续保持这个好习惯！`
        return `太棒了！本周每天都打卡了，你是最棒的干饭人！🎉`
      }
      if (mode === 'pair') {
        if (days <= 3) return `两人本周互动${days}天，多关心TA有没有好好吃饭吧~`
        if (this.myMealCount > this.partnerMealCount) return '你比TA更勤快打卡哦，提醒TA也要好好吃饭~'
        return `本周互动很频繁，继续一起好好吃饭，感情升温中！💕`
      }
      return `全家本周打卡${days}天，一起吃饭才是最温暖的时光~ 👨‍‍👧👦`
    }
  },
  onLoad() {
    this.loadPairInfo()
    this.loadPrefs()
    this.loadCachedStats()
    this.loadFavorites()
    this.loadFamilyData()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
  },
  methods: {
    loadCachedStats() {
      const checks = uni.getStorageSync('foodfind_personal_checks') || {}
      let days = 0
      let count = 0
      Object.keys(checks).forEach(date => {
        const day = checks[date]
        if (day.breakfast || day.lunch || day.dinner) days++
        if (day.breakfast) count++
        if (day.lunch) count++
        if (day.dinner) count++
      })
      this._weeklyCheckInDays = days
      this._myMealCount = count
    },
    loadPrefs() {
      const cached = uni.getStorageSync('foodfind_detailed_prefs')
      if (cached) { this.prefs = { ...this.prefs, ...cached } }
    },
    loadMyWeeklyMeals() {
      const meals = []
      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const cachedDate = uni.getStorageSync('foodfind_meals_date')
      const cachedMeals = uni.getStorageSync('foodfind_meals')
      if (cachedDate && cachedMeals) {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
          if (cachedDate === d) {
            ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
              if (cachedMeals[mealType]) {
                cachedMeals[mealType].forEach(food => {
                  const recipe = allRecipes.find(r => r.id === food.id)
                  if (recipe) meals.push({ ...recipe, mealType, date: d })
                })
              }
            })
          }
        }
      }
      this.myWeeklyMeals = meals
      this._weeklyNutritionCache = null
    },
    calcWeeklyNutrition() {
      return this.myWeeklyMeals.reduce((acc, m) => {
        acc.calories += m.nutrition?.calories || 0
        acc.protein += m.nutrition?.protein || 0
        acc.fat += m.nutrition?.fat || 0
        acc.carbs += m.nutrition?.carbs || 0
        return acc
      }, { calories: 0, protein: 0, fat: 0, carbs: 0 })
    },
    loadPairStats() {
      return
    },
    openReport() {
      this.showReportModal = true
      this.loadWeeklyReport()
      this.loadMyWeeklyMeals()
      this.loadCachedStats()
    },
    closeReport() { this.showReportModal = false },
    loadWeeklyReport() {
      this.generateLocalWeekData()
    },
    generateLocalWeekData() {
      const checks = uni.getStorageSync('foodfind_personal_checks') || {}
      const data = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        const dayChecks = checks[d]
        let sparkLevel = 0
        let mealCount = 0
        if (dayChecks) {
          const eatenCount = [dayChecks.breakfast, dayChecks.lunch, dayChecks.dinner].filter(v => v).length
          mealCount = eatenCount
          if (eatenCount >= 2) sparkLevel = 2
          else if (eatenCount >= 1) sparkLevel = 1
        }
        data.push({ date: d, sparkLevel, mealCount, allOpened: sparkLevel > 0, allShared: false })
      }
      this.weeklyReportData = data
    },
    formatDayDate(dateStr) {
      if (!dateStr) return ''
      const m = parseInt(dateStr.slice(5, 7))
      const d = parseInt(dateStr.slice(8, 10))
      return `${m}/${d}`
    },
    formatWeekDateRange() {
      const end = new Date()
      const start = new Date(end.getTime() - 6 * 86400000)
      const startMon = start.getMonth() + 1
      const startDay = start.getDate()
      const endMon = end.getMonth() + 1
      const endDay = end.getDate()
      return `${startMon}月${startDay}日 - ${endMon}月${endDay}日`
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
      if (this.hasFamily) {
        const { updateMyHealthTags } = require('@/utils/family.js')
        updateMyHealthTags(this.prefs.healthTags)
      }
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
        this.hasPartner = false
      }
    },

    startInvite() {
      uni.showToast({ title: '配对功能暂时不可用', icon: 'none' })
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

    openSpecialDates() {
      uni.navigateTo({ url: '/pages/index/index?openSpecial=1' })
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
        title: '关于吃点啥 v2.4', content: '为情侣/家人打造的共同决策吃什么的小工具\n\n✅ 智能一周菜单规划\n✅ 荤素营养均衡算法\n✅ 云端配对，跨设备同步\n✅ 分享菜单+双向确认\n✅ 互动打卡+火花系统\n✅ 本周饮食报告+营养饼图\n✅ 收藏喜欢的菜品\n✅ 生日/纪念日特别菜单', showCancel: false, confirmText: '知道了'
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
    },
    loadFamilyData() {
      this._familyGroup = getFamilyGroup()
    },
    goToFamily() {
      uni.navigateTo({ url: '/pages/family/family' })
    },
    getTagsByCategory(category) {
      return HEALTH_TAGS.filter(t => t.category === category)
    },
    toggleHealthTag(tagId) {
      const idx = this.prefs.healthTags.indexOf(tagId)
      if (idx > -1) {
        this.prefs.healthTags.splice(idx, 1)
      } else {
        this.prefs.healthTags.push(tagId)
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F6FA; padding:0 28rpx; }

/* ===== Profile Header ===== */
.profile-header {
  padding:56rpx 0 48rpx;
  display:flex; flex-direction:column; align-items:center;
}
.avatar-large {
  width:128rpx; height:128rpx; border-radius:50%;
  background:#fff;
  display:flex; align-items:center; justify-content:center; margin-bottom:24rpx;
  box-shadow:0 4rpx 24rpx rgba(0,0,0,.06);
}
.avatar-char { color:#07c160; font-size:52rpx; font-weight:700; }
.user-name { font-size:40rpx; font-weight:800; color:#1a1a1a; margin-bottom:8rpx; letter-spacing:-1rpx; }
.user-desc { font-size:24rpx; color:#999; }

/* ===== Menu Section ===== */
.menu-section { padding:16rpx 0 28rpx; }
.menu-group {
  background:#fff; border-radius:24rpx; overflow:hidden;
  box-shadow:0 1rpx 12rpx rgba(0,0,0,.04); margin-bottom:16rpx;
}
.group-title { display:block; padding:24rpx 28rpx 10rpx; font-size:23rpx; color:#999; font-weight:600; }
.menu-list { padding:0 12rpx 12rpx; }
.menu-item {
  display:flex; align-items:center; padding:22rpx 16rpx;
  transition: all .25s ease;
  &:active { background:#f5f6f8; transform:scale(.99); }
  margin-bottom:4rpx; border-radius:16rpx;
  &.text-only .menu-label { padding-left:8rpx; }
}
.menu-icon-wrap {
  width:72rpx; height:72rpx; border-radius:18rpx;
  display:flex; align-items:center; justify-content:center; margin-right:18rpx; flex-shrink:0;
  &.blue, &.red, &.orange, &.green, &.pink, &.purple { background:#f5f6f8; }
  &.gray { background:#f0f1f3; }
}
.menu-emoji { font-size:34rpx; }
.mi-center { flex:1; display:flex; flex-direction:column; min-width:0; }
.menu-label { font-size:28rpx; color:#1a1a1a; font-weight:600; line-height:1.3; }
.menu-desc { font-size:22rpx; color:#bbb; margin-top:4rpx; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.menu-arrow { font-size:32rpx; color:#ddd; flex-shrink:0; margin-left:12rpx; }

/* ===== Partner Card ===== */
.partner-card {
  background:#fff;
  border-radius:20rpx; padding:24rpx; gap:12rpx;
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04);
  &:active { opacity:0.85; }
}
.pc-left { display: flex; align-items: center; flex: 1; gap: 16rpx; }
.partner-avatar {
  width: 72rpx; height: 72rpx; background:#e8f7ef; border-radius: 50%;
  display: flex; align-items: center; justify-content:center;
}
.pa-char { font-size: 32rpx; font-weight: 700; color: #07c160; }
.pc-info { display: flex; flex-direction: column; }
.pc-name { font-size: 30rpx; font-weight: 700; color: #1a1a1a; }
.pc-relation { font-size: 23rpx; color: #999; margin-top: 4rpx; }
.pc-status-dot {
  width: 18rpx; height: 18rpx; background: #07c160; border-radius: 50%;
  box-shadow: 0 0 6rpx rgba(7,193,96,.5);
}

/* ===== Stats Card ===== */
.stats-card {
  background:#fff;
  border-radius:20rpx; padding:24rpx; margin-bottom:12rpx;
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04);
}
.stats-row { display: flex; align-items: center; justify-content: space-around; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.stat-num { font-size: 36rpx; font-weight: 800; color: #07c160; }
.stat-label { font-size: 21rpx; color: #999; }
.stat-divider { width: 2rpx; height: 48rpx; background: #eee; border-radius: 1rpx; }

.spark-streak {
  display: flex; align-items: center; justify-content: center;
  gap: 10rpx; padding: 14rpx; background: #f5f6f8;
  border-radius: 14rpx; margin-top: 16rpx;
}
.streak-icon { font-size: 28rpx; }
.streak-text { font-size: 23rpx; font-weight: 600; color: #666; }

.report-card {
  background:#fff !important;
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04) !important;
  & .menu-emoji { font-size: 32rpx; }
}

.pending-card {
  background:#fff; border-radius:20rpx; padding:24rpx;
  display: flex; align-items: center; gap: 14rpx;
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04);
}
.pending-icon-wrap {
  width: 64rpx; height: 64rpx; background:#f5f6f8; border-radius: 16rpx;
  display: flex; align-items: center; justify-content:center; flex-shrink:0;
}
.pending-icon { font-size: 32rpx; }
.resend-btn {
  padding: 14rpx 22rpx; background: #07c160;
  border-radius: 24rpx; font-size: 23rpx; color: #fff; font-weight:600;
  line-height:1; flex-shrink:0;
  &::after { display:none; }
  &:active { opacity:.85; transform:scale(.95); }
}

/* ===== Preference Modal ===== */
.pref-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:999; transition:background .3s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.45); pointer-events:auto; }
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
.pm-stitle { display:block; font-size:26rpx; font-weight:600; color:#1a1a1a; margin-bottom:16rpx; padding-left:4rpx; }
.pm-hint { display:block; font-size:22rpx; color:#999; margin-bottom:16rpx; padding-left:4rpx; }
.mode-toggle-row {
  display:flex; justify-content:space-between; align-items:center;
  background:#f5f6f8; border-radius:18rpx; padding:22rpx 20rpx;
}
.mt-left { display:flex; flex-direction:column; gap:6rpx; }
.mt-label { font-size:27rpx; font-weight:600; color:#1a1a1a; }
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
.pm-q { display:block; font-size:24rpx; color:#666; font-weight:500; margin-bottom:12rpx; }
.pm-tags {
  display:flex; flex-wrap:wrap; gap:10rpx;
  &.multi .pm-tag { border-style:dashed; }
  &.pm-wide { gap:12rpx; }
}
.pm-tag {
  padding:14rpx 24rpx; border-radius:40rpx;
  font-size:24rpx; color:#555; font-weight:500;
  background:#fff; border:2rpx solid #e8e8e8;
  transition:all .2s ease;
  &.active { background:#07c160; color:#fff; border-color:#07c160; }
  &:active { transform:scale(.95); }
}

.pm-footer { padding:16rpx 28rpx 40rpx; flex-shrink:0; }
.pm-save-btn {
  padding:26rpx 0; background:#07c160;
  border-radius:50rpx; text-align:center;
  &:active { opacity:.85; transform:scale(.98); }
}
.pm-save-txt { font-size:30rpx; font-weight:600; color:#fff; }

.version-info { text-align:center; padding:36rpx 0 60rpx; }
.version-text { font-size:24rpx; color:#ccc; }

/* ===== Report Modal ===== */
.report-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:999; transition:background .35s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.55); pointer-events:auto; }
}
.report-modal {
  position:fixed; left:0; right:0; bottom:0;
  background:#fafafa; border-radius:36rpx 36rpx 0 0;
  z-index:1000; transform:translateY(100%); transition:transform .4s cubic-bezier(.175,.885,.32,1.275);
  max-height:88vh; display:flex; flex-direction:column;
  box-shadow:0 -10rpx 60rpx rgba(0,0,0,.15);
  &.show { transform:translateY(0); }
}
.rm-header {
  display:flex; justify-content:space-between; align-items:flex-start;
  padding:36rpx 32rpx 24rpx; flex-shrink:0;
  background:#fff;
}
.rm-header-left { display:flex; flex-direction:column; gap:6rpx; }
.rm-title { font-size:36rpx; font-weight:800; color:#1a1a1a; letter-spacing:-1rpx; }
.rm-subtitle { font-size:23rpx; color:#999; }

.rm-body { flex:1; overflow:hidden; padding:0 32rpx 24rpx; box-sizing:border-box; }

.rm-hero {
  position:relative; border-radius:28rpx; overflow:hidden;
  background:linear-gradient(135deg,#07c160 0%,#06a652 50%,#058a43 100%);
  padding:48rpx 32rpx 36rpx; margin-bottom:24rpx;
  box-shadow:0 8rpx 30rpx rgba(7,193,96,.25);
}
.rmh-content { position:relative; display:flex; flex-direction:column; align-items:center; }

.rmh-solo { display:flex; flex-direction:column; align-items:center; gap:16rpx; }
.rmh-avatar-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
.rmh-avatar {
  width:96rpx; height:96rpx; border-radius:50%;
  background:rgba(255,255,255,.25);
  display:flex; align-items:center; justify-content:center;
  border:3rpx solid rgba(255,255,255,.35);
  &.solo-av { width:104rpx; height:104rpx; }
  &.fam-av { width:76rpx; height:76rpx; }
}
.rmh-streak-circle {
  position:absolute; right:-20rpx; bottom:-10rpx;
  width:56rpx; height:56rpx; border-radius:50%;
  background:#fff; display:flex; align-items:center; justify-content:center;
  box-shadow:0 4rpx 18rpx rgba(0,0,0,.2);
}
.rmhav-txt { font-size:38rpx; color:#fff; font-weight:700; }
.rmh-solo-streak { font-size:34rpx; font-weight:900; color:#07c160; line-height:1; }
.rmh-solo-label { font-size:26rpx; color:rgba(255,255,255,.9); letter-spacing:1rpx; }
.rmh-motto { font-size:24rpx; color:rgba(255,255,255,.82); margin-top:8rpx; text-align:center; line-height:1.5; }

.rmh-pair { display:flex; flex-direction:column; align-items:center; gap:18rpx; width:100%; }
.rmh-pair-avatars { display:flex; align-items:center; justify-content:center; width:100%; }
.rmh-connector {
  position:relative; display:flex; align-items:center; justify-content:center;
  margin:0 8rpx;
}
.rmh-line {
  width:130rpx; height:4rpx; background:rgba(255,255,255,.35);
  border-radius:2rpx; flex-shrink:0;
  &.fam-line { width:110rpx; }
}
.rmh-relation-badge {
  position:absolute; top:50%; left:50%;
  transform:translate(-50%,-50%);
  background:#fff; border-radius:24rpx;
  padding:6rpx 18rpx; white-space:nowrap;
  box-shadow:0 4rpx 16rpx rgba(0,0,0,.15);
}
.rmhrl-txt { font-size:19rpx; color:#07c160; font-weight:700; }
.rmh-streak-wrap { display:flex; flex-direction:column; align-items:center; gap:6rpx; }
.rmhps-num { font-size:56rpx; font-weight:900; color:#fff; text-shadow:0 2rpx 10rpx rgba(0,0,0,.1); }
.rmhps-label { font-size:24rpx; color:rgba(255,255,255,.9); letter-spacing:1rpx; }

.rmh-family { display:flex; flex-direction:column; align-items:center; gap:16rpx; width:100%; }
.rmh-fam-avatars { display:flex; align-items:center; justify-content:center; gap:0; }
.rmh-fam-streak { display:flex; flex-direction:column; align-items:center; gap:6rpx; }
.rmhfs-num { font-size:52rpx; font-weight:900; color:#fff; text-shadow:0 2rpx 10rpx rgba(0,0,0,.1); }
.rmhfs-label { font-size:23rpx; color:rgba(255,255,255,.9); }

.rm-stats-row { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:12rpx; margin-bottom:24rpx; }
.rm-stat-card {
  background:#fff; border-radius:20rpx; padding:24rpx 16rpx;
  display:flex; flex-direction:column; align-items:center; gap:6rpx;
  box-shadow:0 2rpx 12rpx rgba(0,0,0,.06);
  &.large { padding:30rpx 20rpx; }
}
.rm-stat-value { font-size:36rpx; font-weight:800; color:#1a1a1a; }
.rm-stat-label { font-size:20rpx; color:#999; font-weight:500; }

.rm-section { margin-bottom:24rpx; }
.rm-section-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:14rpx;
}
.rms-title { font-size:28rpx; font-weight:700; color:#1a1a1a; }
.rms-desc { font-size:22rpx; color:#999; font-weight:500; }

.rm-chart-card {
  background:#fff; border-radius:24rpx; padding:28rpx 24rpx 24rpx;
  box-shadow:0 2rpx 12rpx rgba(0,0,0,.06);
}
.rm-pie-card {
  background:#fff; border-radius:24rpx; padding:28rpx 24rpx;
  box-shadow:0 2rpx 12rpx rgba(0,0,0,.06);
}
.rm-pie-row { display:flex; align-items:center; gap:28rpx; }
.rm-pie-chart { flex-shrink:0; }
.rm-pie-outer {
  width:180rpx; height:180rpx; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4rpx 20rpx rgba(0,0,0,.08);
}
.rm-pie-inner {
  width:110rpx; height:110rpx; border-radius:50%;
  background:#fff; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
}
.rm-pie-center-val { font-size:28rpx; font-weight:800; color:#1a1a1a; }
.rm-pie-center-label { font-size:18rpx; color:#999; }
.rm-pie-legend { flex:1; display:flex; flex-direction:column; gap:16rpx; }
.rm-legend-item { display:flex; align-items:center; gap:12rpx; }
.rm-legend-dot { width:20rpx; height:20rpx; border-radius:6rpx; flex-shrink:0; }
.rm-legend-info { display:flex; flex-direction:column; gap:2rpx; }
.rm-legend-name { font-size:24rpx; font-weight:600; color:#1a1a1a; }
.rm-legend-val { font-size:21rpx; color:#999; }
.rm-chart-bars { display:flex; justify-content:space-between; align-items:flex-end; gap:10rpx; height:180rpx; }
.rm-chart-bar {
  flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  gap:8rpx; height:100%;
}
.rm-bar {
  width:100%; background:linear-gradient(180deg,#07c160 0%,#06a552 100%);
  border-radius:14rpx 14rpx 6rpx 6rpx;
  display:flex; align-items:center; justify-content:center;
  transition:height .6s cubic-bezier(.4,0,.2,1);
  min-height:20rpx;
}
.rm-bar-meals { font-size:22rpx; color:#fff; font-weight:700; }
.rm-bar-label { font-size:20rpx; color:#999; font-weight:500; }

.rm-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:8rpx; }
.rm-cal-day {
  position:relative; display:flex; flex-direction:column; align-items:center;
  gap:10rpx; padding:18rpx 8rpx; border-radius:18rpx;
  background:#fff; border:2rpx solid transparent;
  box-shadow:0 2rpx 8rpx rgba(0,0,0,.04);
  transition:all .3s ease;
  &.active { border-color:#07c160; background:#f0faf5; }
  &.today {
    border-color:#07c160;
    &::before {
      content:''; position:absolute; top:6rpx; right:6rpx;
      width:14rpx; height:14rpx; border-radius:50%;
      background:#07c160;
    }
  }
  &:active { transform:scale(.96); }
}
.rm-cal-date { font-size:21rpx; color:#666; font-weight:700; }
.rm-cal-streak { display:flex; align-items:center; justify-content:center; height:40rpx; }
.rm-cal-spark { font-size:22rpx; }
.rm-cal-check { font-size:28rpx; color:#07c160; font-weight:800; }
.rm-cal-none { font-size:26rpx; color:#ddd; }
.rm-cal-meals { font-size:19rpx; color:#999; font-weight:600; }

.rm-compare-card {
  display:flex; gap:20rpx; padding:24rpx;
  background:#fff; border-radius:24rpx;
  box-shadow:0 2rpx 12rpx rgba(0,0,0,.06);
}
.rmc-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:10rpx; }
.rmc-avatar {
  width:64rpx; height:64rpx; border-radius:50%;
  background:#e8f7ef; display:flex; align-items:center; justify-content:center;
  border:2rpx solid rgba(7,193,96,.15);
  &.partner { background:#f0f6f8; border-color:rgba(5,138,67,.15); }
}
.rmc-char { font-size:28rpx; font-weight:800; color:#07c160; }
.rmcc-name { font-size:25rpx; font-weight:700; color:#1a1a1a; }
.rmcc-bar-wrap { width:100%; height:24rpx; background:#eee; border-radius:12rpx; overflow:hidden; }
.rmcc-bar { height:100%; border-radius:12rpx; transition:width .7s cubic-bezier(.4,0,.2,1); }
.self-bar { background:linear-gradient(90deg,#07c160,#06a652); }
.partner-bar { background:linear-gradient(90deg,#058a43,#047739); }
.rmcc-num { font-size:22rpx; color:#666; font-weight:700; }

.rm-tip-card {
  display:flex; gap:16rpx; align-items:flex-start;
  background:#fff; border-radius:20rpx; padding:20rpx 22rpx;
  box-shadow:0 2rpx 12rpx rgba(0,0,0,.06);
}
.rm-tip-icon-wrap {
  width:56rpx; height:56rpx; border-radius:14rpx;
  background:#e8f7ef; display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.rm-tip-icon { font-size:28rpx; }
.rm-tip-content { flex:1; }
.rm-tip-text { font-size:24rpx; color:#666; line-height:1.7; font-weight:500; }

.rm-footer-spacer { height:80rpx; }

/* ===== Favorites Modal ===== */
.fav-modal-mask {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0); z-index:998; transition:background .3s ease;
  pointer-events:none;
  &.show { background:rgba(0,0,0,.45); pointer-events:auto; }
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
.fm-title { font-size:34rpx; font-weight:700; color:#1a1a1a; }
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
  box-shadow:0 1rpx 8rpx rgba(0,0,0,.04);
  transition:all .25s ease;
  &:active { background:#f5f6f8; transform:scale(.98); }
}
.fi-left { flex-shrink:0; margin-right:16rpx; }
.fi-emoji { font-size:52rpx; }
.fi-center { flex:1; min-width:0; display:flex; flex-direction:column; gap:6rpx; }
.fi-name { font-size:28rpx; font-weight:600; color:#1a1a1a; }
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
.fdb-icon { font-size:24rpx; color:#999; }
</style>
