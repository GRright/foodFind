<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="header fade-in">
      <text class="header-title">{{ isFamilyMode ? '家庭购物清单' : '购物清单' }}</text>
      <text class="header-sub">{{ todayStr }} · {{ totalItems }}项食材</text>

      <view class="mode-badge" v-if="isFamilyMode">
        <text class="mb-icon">👨‍‍👧👦</text>
        <text class="mb-text">{{ familyGroup?.name || '家庭' }}</text>
      </view>

      <view class="completion-banner" v-if="isFamilyMode && isAllComplete">
        <text class="cb-icon">🎉</text>
        <text class="cb-text">今天的食材已准备好！</text>
      </view>

      <view class="day-config" v-if="!isFamilyMode">
        <view class="dc-row">
          <text class="dc-label">准备天数</text>
          <view class="dc-options">
            <view class="dc-option" :class="{ active: isPredefinedMode }" @click="togglePredefinedMode">
              <text class="dc-text">预设</text>
            </view>
            <view class="dc-option" :class="{ active: !isPredefinedMode }" @click="togglePredefinedMode">
              <text class="dc-text">自定义</text>
            </view>
          </view>
        </view>

        <view class="dc-preset" v-if="isPredefinedMode">
          <view class="dc-preset-item" :class="{ active: config.mode === 'today' }" @click="setPreset('today')">
            <text class="dpi-emoji">📅</text>
            <text class="dpi-label">今天</text>
          </view>
          <view class="dc-preset-item" :class="{ active: config.mode === 'weekend' }" @click="setPreset('weekend')">
            <text class="dpi-emoji">🎯</text>
            <text class="dpi-label">周末</text>
          </view>
          <view class="dc-preset-item" :class="{ active: config.mode === 'week' }" @click="setPreset('week')">
            <text class="dpi-emoji">🌱</text>
            <text class="dpi-label">本周</text>
          </view>
        </view>

        <view class="dc-custom" v-else>
          <scroll-view scroll-x class="dc-days-scroll" :show-scrollbar="false">
            <view class="dc-days-list">
              <view
                class="dc-day-item"
                :class="{ active: config.customDays === day }"
                v-for="day in 14"
                :key="day"
                @click="selectDay(day)"
              >
                <text class="dc-day-num">{{ day }}</text>
                <text class="dc-day-text">天</text>
              </view>
            </view>
          </scroll-view>
          <view class="dc-selected-info">
            <text class="dc-selected-label">已选</text>
            <text class="dc-selected-value">{{ config.customDays }} 天</text>
          </view>
        </view>
      </view>

      <view class="meal-config-entry" @click="goToMealConfig" v-if="!isFamilyMode">
        <text class="mce-label">用餐配置</text>
        <text class="mce-summary">{{ mealConfigSummary }}</text>
        <text class="mce-arrow">›</text>
      </view>

      <view class="header-actions">
        <view class="action-btn" @click="generateFromMenu" v-if="!isFamilyMode">
          <text class="btn-icon">✦</text>
          <text class="btn-text">从菜谱生成</text>
        </view>
        <view class="action-btn" @click="generateFamilyList" v-if="isFamilyMode && items.length === 0">
          <text class="btn-icon">✦</text>
          <text class="btn-text">从菜谱生成</text>
        </view>
        <view class="action-btn" @click="resetFamilyList" v-if="isFamilyMode && items.length > 0 && isFamilyModeCreator">
          <text class="btn-icon">↻</text>
          <text class="btn-text">重新生成</text>
        </view>
        <view class="action-btn secondary" @click="clearCompleted" v-if="completedCount > 0 && !isFamilyMode">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">清空已购</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view class="family-recipes-section" v-if="isFamilyMode && todayRecipes.length > 0">
        <view class="frs-header">
          <view class="frs-header-left">
            <text class="frs-icon">🍽️</text>
            <text class="frs-title">今日菜谱</text>
          </view>
          <view class="frs-header-right">
            <view class="frs-refresh-btn" @click="refreshAllRecipes" v-if="isFamilyModeCreator">
              <text class="frs-refresh-icon">↻</text>
              <text class="frs-refresh-text">全部刷新</text>
            </view>
          </view>
        </view>
        <view class="frs-hint">
          <text class="frs-hint-text">上滑菜谱可换菜，点击菜品查看详情</text>
        </view>
        <view class="gesture-tutorial" v-if="showGestureTutorial">
          <view class="gt-arrow gt-arrow-up">
            <text class="gt-arrow-icon">⬆</text>
          </view>
          <text class="gt-text">上滑换菜</text>
          <view class="gt-arrow gt-arrow-down">
            <text class="gt-arrow-icon">⬇</text>
          </view>
          <text class="gt-text">下滑取消</text>
          <view class="gt-close-btn" @click="closeGestureTutorial">
            <text class="gt-close-text">我知道了</text>
          </view>
        </view>
        <view class="frs-meal-group" v-for="meal in ['breakfast', 'lunch', 'dinner']" :key="meal">
          <view class="frs-meal-label" v-if="todayRecipes[meal] && todayRecipes[meal].length > 0">
            <text class="frs-meal-emoji">{{ meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙' }}</text>
            <text class="frs-meal-name">{{ meal === 'breakfast' ? '早餐' : meal === 'lunch' ? '午餐' : '晚餐' }}</text>
          </view>
          <view
            class="frs-recipe-card"
            v-for="recipe in (todayRecipes[meal] || [])"
            :key="recipe.id"
            @click="goToRecipeDetail(recipe.id)"
            @touchstart="onCardTouchStart"
            @touchend="e => onCardTouchEnd(e, recipe, meal)"
          >
            <view class="frs-recipe-info">
              <text class="frs-recipe-name">{{ recipe.name }}</text>
              <text class="frs-recipe-tag" :class="'tag-' + recipe.difficulty">{{ recipe.difficultyText || '家常菜' }}</text>
            </view>
            <view class="frs-recipe-hint">
              <text class="frs-recipe-hint-text">↕ 上滑换菜</text>
            </view>
            <view class="frs-recipe-replace" v-if="swipeRecipeId === recipe.id" @click.stop="replaceRecipe(recipe, meal)">
              <text class="frs-replace-icon">🔄</text>
              <text class="frs-replace-text">换一道</text>
            </view>
            <view class="frs-recipe-delete" @click.stop="deleteRecipe(recipe.id, meal)">
              <text class="frs-delete-icon">🗑️</text>
            </view>
          </view>
        </view>
      </view>

      <view class="category-list" v-if="categorizedItems.length > 0">
        <view class="category-section" v-for="cat in categorizedItems" :key="cat.category">
          <view class="cat-header">
            <text class="cat-icon">{{ cat.icon }}</text>
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-count">{{ cat.items.filter(i => !isItemFullyBought(i)).length }}/{{ cat.items.length }}</text>
          </view>
          <view class="item-list">
            <view
              class="item-row"
              :class="{ fullyBought: isItemFullyBought(item), hasMe: hasCurrentUserBought(item) }"
              v-for="item in cat.items"
              :key="item.id"
              @click="toggleBuyer(item)"
            >
              <view class="item-check">
                <view class="check-circle" :class="{ fullyBought: isItemFullyBought(item) }">
                  <text class="check-mark" v-if="isItemFullyBought(item)">✓</text>
                  <text class="check-buyers" v-else>{{ item.buyers ? item.buyers.length : 0 }}</text>
                </view>
              </view>
              <view class="item-content">
                <text class="item-name" :class="{ fullyBought: isItemFullyBought(item) }">{{ item.name }}</text>
                <text class="item-amount" v-if="item.amount">{{ item.amount }}</text>
                <view class="item-buyers" v-if="isFamilyMode && item.buyers && item.buyers.length > 0">
                  <text class="ib-progress">{{ item.buyers.length }}/{{ memberCount }}人已购</text>
                  <view class="ib-avatars">
                    <view
                      class="ib-avatar"
                      v-for="bid in (item.buyers || []).slice(0, 3)"
                      :key="bid"
                      :style="{ background: getMemberColor(bid) }"
                    >
                      <text class="ib-avatar-char">{{ getMemberChar(bid) }}</text>
                    </view>
                    <text class="ib-more" v-if="item.buyers.length > 3">+{{ item.buyers.length - 3 }}</text>
                  </view>
                </view>
              </view>
              <view class="item-delete" @click.stop="deleteItem(item.id)">
                <text class="delete-icon">✕</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="categorizedItems.length === 0 && items.length === 0">
        <text class="empty-icon">🛒</text>
        <text class="empty-title">购物清单为空</text>
        <text class="empty-hint" v-if="isFamilyMode">点击「从菜谱生成」自动添加食材</text>
        <text class="empty-hint" v-else>点击「从菜谱生成」自动添加食材</text>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="add-bar" v-if="isFamilyMode">
      <input class="add-input" v-model="newItemName" placeholder="添加新物品..." maxlength="30" @confirm="addItem"/>
      <input class="add-amount" v-model="newItemAmount" placeholder="数量" maxlength="20" @confirm="addItem"/>
      <view class="add-btn" :class="{ disabled: !newItemName.trim() }" @click="addItem">
        <text class="add-icon">+</text>
      </view>
    </view>
    <view class="add-bar" v-else>
      <input class="add-input" v-model="newItemName" placeholder="添加新物品..." maxlength="30" @confirm="addItem"/>
      <input class="add-amount" v-model="newItemAmount" placeholder="数量" maxlength="20" @confirm="addItem"/>
      <view class="add-btn" :class="{ disabled: !newItemName.trim() }" @click="addItem">
        <text class="add-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'
import { getFamilyGroup, getCurrentUserId, getFamilyShoppingList, saveFamilyShoppingList, notifyShoppingChange } from '@/utils/family.js'

const CATEGORY_MAP = {
  vegetable: { name: '蔬菜', icon: '🥬' },
  meat: { name: '肉蛋禽', icon: '🥩' },
  staple: { name: '主食', icon: '🍚' },
  other: { name: '其他', icon: '🧃' }
}

const CATEGORY_KEYWORDS = {
  vegetable: ['菜', '豆', '茄', '瓜', '菇', '笋', '藕', '椒', '蒜', '葱', '姜', '花', '叶', '生菜', '萝卜', '番茄', '西兰', '四季'],
  meat: ['肉', '鸡', '鸭', '鱼', '虾', '蛋', '排', '里脊', '牛肉', '猪肉', '鸡胸', '鸡翅', '鸭', '鲈', '皮蛋'],
  seasoning: ['油', '盐', '酱', '醋', '糖', '料酒', '蚝油', '淀粉', '花椒', '八角', '桂皮', '豆瓣', '豉', '芝麻', '辣椒', '泡椒', '甜面', '豆鼓', '冰糖'],
  staple: ['米', '面', '粉', '饼', '油条', '馒头', '粮', '麦', '豆', '黄豆']
}

const MEMBER_COLORS = ['#07c160', '#ff9f43', '#5b9bd5', '#ff6b6b', '#a569bd', '#f0a020', '#1abc9c', '#e74c3c']

const DIFFICULTY_TAGS = {
  easy: '简单',
  medium: '家常',
  hard: '精致'
}

export default {
  data() {
    return {
      items: [],
      pageEnter: true,
      newItemName: '',
      newItemAmount: '',
      config: {
        mode: 'today',
        customDays: 3
      },
      mealConfig: {
        weekday: ['dinner'],
        weekend: ['breakfast', 'lunch', 'dinner']
      },
      isPredefinedMode: true,
      _cachedIngredients: null,
      _cacheKey: '',
      isFamilyMode: false,
      familyGroup: null,
      currentUserId: '',
      todayRecipes: { breakfast: [], lunch: [], dinner: [] },
      swipeRecipeId: null,
      _touchStartY: 0,
      _touchStartX: 0,
      showGestureTutorial: false
    }
  },
  computed: {
    todayStr() {
      const d = new Date()
      return `${d.getMonth() + 1}月${d.getDate()}日`
    },
    totalItems() {
      return this.items.length
    },
    completedCount() {
      return this.items.filter(i => this.isItemFullyBought(i)).length
    },
    categorizedItems() {
      const cats = {}
      this.items.forEach(item => {
        let cat = item.category || 'other'
        if (cat === 'seasoning') return
        if (!cats[cat]) {
          cats[cat] = { category: cat, ...CATEGORY_MAP[cat], items: [] }
        }
        cats[cat].items.push(item)
      })
      const order = ['vegetable', 'meat', 'staple', 'other']
      return order.filter(k => cats[k]).map(k => cats[k])
    },
    mealConfigSummary() {
      const weekdayText = this.mealConfig.weekday.length === 3 ? '三餐' :
        this.mealConfig.weekday.length === 2 ? '两餐' : '一餐'
      const weekendText = this.mealConfig.weekend.length === 3 ? '三餐' :
        this.mealConfig.weekend.length === 2 ? '两餐' : '一餐'
      return `工作日${weekdayText} · 周末${weekendText}`
    },
    memberCount() {
      if (!this.isFamilyMode || !this.familyGroup) return 1
      return this.familyGroup.members.length
    },
    isAllComplete() {
      if (!this.isFamilyMode || this.items.length === 0) return false
      return this.items.every(item => this.isItemFullyBought(item))
    },
    isFamilyModeCreator() {
      return this.isFamilyMode && this.familyGroup && this.familyGroup.creatorId === this.currentUserId
    }
  },
  onLoad(options) {
    this.currentUserId = getCurrentUserId()
    this.loadConfig()

    if (options.mode === 'family') {
      this.loadFamilyData()
    } else {
      this.loadShoppingList()
    }

    const tutorialShown = uni.getStorageSync('foodfind_shopping_gesture_tutorial')
    if (!tutorialShown && this.isFamilyMode) {
      setTimeout(() => { this.showGestureTutorial = true }, 1500)
    }
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)

    if (this.isFamilyMode) {
      this.loadFamilyShoppingList()
      this.loadTodayRecipes()
    }
  },
  methods: {
    loadConfig() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs')
      if (prefs) {
        if (prefs.shoppingConfig) this.config = { ...this.config, ...prefs.shoppingConfig }
        if (prefs.mealConfig) this.mealConfig = { ...this.mealConfig, ...prefs.mealConfig }
      }
      this.isPredefinedMode = ['today', 'weekend', 'week'].includes(this.config.mode)
    },
    saveConfig() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      prefs.shoppingConfig = this.config
      prefs.mealConfig = this.mealConfig
      uni.setStorageSync('foodfind_detailed_prefs', prefs)
    },
    loadShoppingList() {
      const saved = uni.getStorageSync('foodfind_shopping_list')
      const cacheKey = this.getCacheKey()
      if (saved && saved.cacheKey === cacheKey) {
        this.items = saved.items || []
        return
      }
      this.items = []
    },
    saveShoppingList() {
      uni.setStorageSync('foodfind_shopping_list', {
        cacheKey: this.getCacheKey(),
        items: this.items
      })
    },
    getCacheKey() {
      const mode = this.config.mode
      const days = this.config.customDays
      const weekdayMeals = this.mealConfig.weekday.slice().sort().join(',')
      const weekendMeals = this.mealConfig.weekend.slice().sort().join(',')
      return `${mode}-${days}-${weekdayMeals}-${weekendMeals}`
    },
    getTodayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    getDateStr(offset) {
      const d = new Date(Date.now() + offset * 86400000)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    getDayOfWeek(offset) {
      const d = new Date(Date.now() + offset * 86400000)
      return d.getDay()
    },
    classifyIngredient(name) {
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => name.includes(k))) return cat
      }
      return 'other'
    },
    togglePredefinedMode() {
      this.isPredefinedMode = !this.isPredefinedMode
      this.config.mode = this.isPredefinedMode ? 'today' : 'custom'
      this.config.customDays = 3
      this.saveConfig()
      this.loadShoppingList()
      setTimeout(() => { this.autoGenerateIfEmpty() }, 100)
    },
    setPreset(mode) {
      this.config.mode = mode
      this.saveConfig()
      this.loadShoppingList()
      setTimeout(() => { this.autoGenerateIfEmpty() }, 100)
    },
    selectDay(day) {
      this.config.customDays = day
      this.saveConfig()
      this.loadShoppingList()
      setTimeout(() => { this.autoGenerateIfEmpty() }, 100)
    },
    goToMealConfig() {
      uni.navigateTo({ url: '/pages/mealConfig/mealConfig' })
    },
    autoGenerateIfEmpty() {
      if (this.items.length === 0) this.generateFromMenu()
    },
    generateFromMenu() {
      const cacheKey = this.getCacheKey()
      if (this._cacheKey === cacheKey && this._cachedIngredients) {
        this.applyCachedIngredients()
        return
      }

      const weeklyData = uni.getStorageSync('foodfind_weekly')
      const dailyMeals = uni.getStorageSync('foodfind_meals')

      if (!weeklyData && !dailyMeals) {
        uni.showToast({ title: '请先生成菜谱', icon: 'none' })
        return
      }

      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const ingredientMap = new Map()
      const daysToProcess = this.getDaysToProcess()

      for (let i = 0; i < daysToProcess.length; i++) {
        const { dateStr, isWeekend, offset } = daysToProcess[i]
        let dayMeals = null

        if (weeklyData && weeklyData[dateStr]) dayMeals = weeklyData[dateStr]
        else if (offset === 0 && dailyMeals) dayMeals = dailyMeals

        if (dayMeals) {
          const mealTypes = isWeekend ? this.mealConfig.weekend : this.mealConfig.weekday
          mealTypes.forEach(mealType => {
            const recipes = dayMeals[mealType] || []
            recipes.forEach(recipe => {
              const fullRecipe = allRecipes.find(r => r.id === recipe.id)
              if (fullRecipe && fullRecipe.ingredients) {
                fullRecipe.ingredients.forEach(ing => {
                  const cat = this.classifyIngredient(ing.name)
                  if (cat === 'seasoning') return
                  const key = ing.name
                  if (ingredientMap.has(key)) {
                    const existing = ingredientMap.get(key)
                    existing.amount = this.mergeAmount(existing.amount, ing.amount)
                  } else {
                    let displayAmount = ing.amount
                    let displayName = ing.name
                    if (cat === 'other') {
                      if (displayAmount) displayAmount = displayAmount + ' · 可选'
                      else displayName = displayName + ' · 可选'
                    }
                    ingredientMap.set(key, { name: displayName, amount: displayAmount, category: cat })
                  }
                })
              }
            })
          })
        }
      }

      const newItems = Array.from(ingredientMap.values()).map(ing => ({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: ing.name,
        amount: ing.amount,
        category: ing.category,
        buyers: []
      }))

      if (newItems.length === 0) {
        uni.showToast({ title: '未能提取到食材', icon: 'none' })
        return
      }

      this._cachedIngredients = newItems
      this._cacheKey = cacheKey
      this.items = newItems
      this.saveShoppingList()
      uni.showToast({ title: `已添加${newItems.length}项食材`, icon: 'success' })
    },
    getDaysToProcess() {
      const days = []
      if (this.config.mode === 'today') {
        const dateStr = this.getDateStr(0)
        const dayOfWeek = this.getDayOfWeek(0)
        days.push({ dateStr, isWeekend: dayOfWeek === 0 || dayOfWeek === 6, offset: 0 })
      } else if (this.config.mode === 'weekend') {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
        const daysUntilSunday = (0 - dayOfWeek + 7) % 7
        const saturdayOffset = daysUntilSaturday === 0 ? 7 : daysUntilSaturday
        const sundayOffset = daysUntilSunday === 0 ? 7 : daysUntilSunday
        days.push({ dateStr: this.getDateStr(saturdayOffset), isWeekend: true, offset: saturdayOffset })
        days.push({ dateStr: this.getDateStr(sundayOffset), isWeekend: true, offset: sundayOffset })
      } else if (this.config.mode === 'week') {
        for (let offset = 0; offset < 7; offset++) {
          const dateStr = this.getDateStr(offset)
          const dayOfWeek = this.getDayOfWeek(offset)
          days.push({ dateStr, isWeekend: dayOfWeek === 0 || dayOfWeek === 6, offset })
        }
      } else if (this.config.mode === 'custom') {
        for (let offset = 0; offset < this.config.customDays; offset++) {
          const dateStr = this.getDateStr(offset)
          const dayOfWeek = this.getDayOfWeek(offset)
          days.push({ dateStr, isWeekend: dayOfWeek === 0 || dayOfWeek === 6, offset })
        }
      }
      return days
    },
    applyCachedIngredients() {
      const newItems = this._cachedIngredients.map(ing => ({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: ing.name,
        amount: ing.amount,
        category: ing.category,
        buyers: []
      }))
      this.items = newItems
      this.saveShoppingList()
      uni.showToast({ title: `已添加${newItems.length}项食材`, icon: 'success' })
    },
    mergeAmount(amount1, amount2) {
      if (!amount1 || !amount2) return amount1 || amount2
      const num1 = parseFloat(amount1)
      const num2 = parseFloat(amount2)
      if (!isNaN(num1) && !isNaN(num2)) {
        const unit1 = amount1.replace(/[\d.]/g, '')
        const unit2 = amount2.replace(/[\d.]/g, '')
        if (unit1 === unit2) return (num1 + num2) + unit1
      }
      return amount1 + ' + ' + amount2
    },
    clearCompleted() {
      uni.showModal({
        title: '确认清空',
        content: `确定删除已购买的${this.completedCount}项食材吗？`,
        success: (res) => {
          if (res.confirm) {
            this.items = this.items.filter(i => !this.isItemFullyBought(i))
            if (this.isFamilyMode) this.saveFamilyShoppingListData()
            else this.saveShoppingList()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },
    loadFamilyData() {
      this.familyGroup = getFamilyGroup()
      if (this.familyGroup) {
        this.isFamilyMode = true
        this.loadFamilyShoppingList()
        this.loadTodayRecipes()
      }
    },
    loadFamilyShoppingList() {
      const familyData = getFamilyShoppingList()
      this.items = (familyData.items || []).map(item => ({
        ...item,
        buyers: item.buyers || []
      }))
      if (this.items.length === 0) {
        this.generateFamilyList()
      }
    },
    saveFamilyShoppingListData() {
      saveFamilyShoppingList({ items: this.items }, this.currentUserId)
    },
    generateFamilyList() {
      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const weeklyData = uni.getStorageSync('foodfind_weekly')
      const dailyMeals = uni.getStorageSync('foodfind_meals')

      let dayMeals = null
      const todayStr = this.getTodayStr()
      if (weeklyData && weeklyData[todayStr]) dayMeals = weeklyData[todayStr]
      else if (dailyMeals) dayMeals = dailyMeals

      if (!dayMeals) {
        uni.showToast({ title: '请先生成菜谱', icon: 'none' })
        return
      }

      const ingredientMap = new Map()
      ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const recipes = dayMeals[mealType] || []
        recipes.forEach(recipe => {
          const fullRecipe = allRecipes.find(r => r.id === recipe.id)
          if (fullRecipe && fullRecipe.ingredients) {
            fullRecipe.ingredients.forEach(ing => {
              const cat = this.classifyIngredient(ing.name)
              if (cat === 'seasoning') return
              const key = ing.name
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key)
                existing.amount = this.mergeAmount(existing.amount, ing.amount)
              } else {
                let displayAmount = ing.amount
                let displayName = ing.name
                if (cat === 'other') {
                  if (displayAmount) displayAmount = displayAmount + ' · 可选'
                  else displayName = displayName + ' · 可选'
                }
                ingredientMap.set(key, { name: displayName, amount: displayAmount, category: cat })
              }
            })
          }
        })
      })

      const newItems = Array.from(ingredientMap.values()).map(ing => ({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: ing.name,
        amount: ing.amount,
        category: ing.category,
        buyers: [],
        addedBy: this.currentUserId,
        addedAt: new Date().toISOString()
      }))

      if (newItems.length === 0) {
        uni.showToast({ title: '未能提取到食材', icon: 'none' })
        return
      }

      this.items = newItems
      this._cachedIngredients = newItems.map(i => ({ name: i.name, amount: i.amount, category: i.category }))
      this.saveFamilyShoppingListData()
      uni.showToast({ title: `已添加${newItems.length}项食材`, icon: 'success' })
    },
    resetFamilyList() {
      uni.showModal({
        title: '重新生成',
        content: '将重置所有购买记录，确定吗？',
        success: (res) => {
          if (res.confirm) {
            this.generateFamilyList()
          }
        }
      })
    },
    getMemberName(userId) {
      if (!this.familyGroup) return '未知'
      const member = this.familyGroup.members.find(m => m.userId === userId)
      return member ? member.name : '未知'
    },
    getMemberChar(userId) {
      const name = this.getMemberName(userId)
      return name.charAt(0)
    },
    getMemberColor(userId) {
      const idx = this.familyGroup.members.findIndex(m => m.userId === userId)
      return MEMBER_COLORS[idx >= 0 ? idx % MEMBER_COLORS.length : 0]
    },
    isItemFullyBought(item) {
      const buyers = item.buyers || []
      return buyers.length >= this.memberCount && this.memberCount > 0
    },
    hasCurrentUserBought(item) {
      return (item.buyers || []).includes(this.currentUserId)
    },
    toggleBuyer(item) {
      if (!item.buyers) item.buyers = []
      const idx = item.buyers.indexOf(this.currentUserId)
      if (idx > -1) {
        item.buyers.splice(idx, 1)
      } else {
        item.buyers.push(this.currentUserId)
      }

      if (this.isFamilyMode) {
        this.saveFamilyShoppingListData()
        if (this.isItemFullyBought(item)) {
          notifyShoppingChange('buy', item.name)
        }
        if (this.isAllComplete) {
          uni.showToast({ title: '今天的食材已准备好！🎉', icon: 'success', duration: 2500 })
        }
      } else {
        this.saveShoppingList()
      }
    },
    deleteItem(id) {
      const target = this.items.find(i => i.id === id)
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items.splice(idx, 1)
        if (target) notifyShoppingChange('remove', target.name)
        if (this.isFamilyMode) this.saveFamilyShoppingListData()
        else this.saveShoppingList()
      }
    },
    addItem() {
      const name = this.newItemName.trim()
      if (!name) return

      const item = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name,
        amount: this.newItemAmount.trim(),
        category: this.classifyIngredient(name),
        buyers: [],
        addedBy: this.currentUserId,
        addedAt: new Date().toISOString()
      }

      this.items.push(item)
      this.newItemName = ''
      this.newItemAmount = ''

      notifyShoppingChange('add', name)
      if (this.isFamilyMode) this.saveFamilyShoppingListData()
      else this.saveShoppingList()

      uni.showToast({ title: '已添加', icon: 'success' })
    },
    loadTodayRecipes() {
      const weeklyData = uni.getStorageSync('foodfind_weekly')
      const dailyMeals = uni.getStorageSync('foodfind_meals')
      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const todayStr = this.getTodayStr()

      let dayMeals = null
      if (weeklyData && weeklyData[todayStr]) dayMeals = weeklyData[todayStr]
      else if (dailyMeals) dayMeals = dailyMeals

      if (dayMeals) {
        const result = { breakfast: [], lunch: [], dinner: [] }
        ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const recipes = dayMeals[mealType] || []
          result[mealType] = recipes.map(r => {
            const full = allRecipes.find(ar => ar.id === r.id)
            if (full) {
              return {
                ...full,
                difficultyText: DIFFICULTY_TAGS[full.difficulty] || '家常菜'
              }
            }
            return { ...r, difficultyText: '家常菜' }
          })
        })
        this.todayRecipes = result
      }
    },
    onCardTouchStart(e) {
      this._touchStartY = e.touches[0].clientY
      this._touchStartX = e.touches[0].clientX
    },
    onCardTouchEnd(e, recipe, mealType) {
      const deltaY = this._touchStartY - e.changedTouches[0].clientY
      const deltaX = Math.abs(this._touchStartX - e.changedTouches[0].clientX)

      if (deltaY > 80 && deltaX < 50) {
        this.swipeRecipeId = recipe.id
      } else if (deltaY < -80 && deltaX < 50) {
        this.swipeRecipeId = null
      }
    },
    replaceRecipe(oldRecipe, mealType) {
      const allRecipes = ALL_RECIPES[mealType] || []
      const currentIds = new Set(this.todayRecipes[mealType].map(r => r.id))
      const available = allRecipes.filter(r => r.id !== oldRecipe.id && !currentIds.has(r.id))

      if (available.length === 0) {
        uni.showToast({ title: '没有更多菜品可换', icon: 'none' })
        return
      }

      const newRecipe = available[Math.floor(Math.random() * available.length)]
      const idx = this.todayRecipes[mealType].findIndex(r => r.id === oldRecipe.id)
      if (idx > -1) {
        this.todayRecipes.splice(idx, 1, { ...newRecipe, difficultyText: DIFFICULTY_TAGS[newRecipe.difficulty] || '家常菜' })
        this.swipeRecipeId = null
        this.saveTodayRecipesToStorage()
        this.generateFamilyList()
        uni.showToast({ title: `已更换为「${newRecipe.name}」`, icon: 'success' })
      }
    },
    deleteRecipe(recipeId, mealType) {
      uni.showModal({
        title: '删除菜谱',
        content: '确定要删除这道菜吗？',
        success: (res) => {
          if (res.confirm) {
            const idx = this.todayRecipes[mealType].findIndex(r => r.id === recipeId)
            if (idx > -1) {
              this.todayRecipes[mealType].splice(idx, 1)
              this.saveTodayRecipesToStorage()
              this.generateFamilyList()
              uni.showToast({ title: '已删除', icon: 'success' })
            }
          }
        }
      })
    },
    refreshAllRecipes() {
      uni.showModal({
        title: '刷新菜谱',
        content: '将重新生成今日全部菜谱，确定吗？',
        success: (res) => {
          if (res.confirm) {
            this.swipeRecipeId = null
            const weeklyData = uni.getStorageSync('foodfind_weekly')
            const dailyMeals = uni.getStorageSync('foodfind_meals')
            const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
            const todayStr = this.getTodayStr()

            let dayMeals = null
            if (weeklyData && weeklyData[todayStr]) dayMeals = weeklyData[todayStr]
            else if (dailyMeals) dayMeals = dailyMeals

            if (dayMeals) {
              const result = { breakfast: [], lunch: [], dinner: [] }
              ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                const recipes = dayMeals[mealType] || []
                result[mealType] = recipes.map(r => {
                  const full = allRecipes.find(ar => ar.id === r.id)
                  if (full) {
                    return { ...full, difficultyText: DIFFICULTY_TAGS[full.difficulty] || '家常菜' }
                  }
                  return { ...r, difficultyText: '家常菜' }
                })
              })
              this.todayRecipes = result
              this.saveTodayRecipesToStorage()
              this.generateFamilyList()
              uni.showToast({ title: '菜谱已刷新', icon: 'success' })
            }
          }
        }
      })
    },
    saveTodayRecipesToStorage() {
      const key = 'foodfind_family_today_recipes'
      uni.setStorageSync(key, this.todayRecipes)
    },
    closeGestureTutorial() {
      this.showGestureTutorial = false
      uni.setStorageSync('foodfind_shopping_gesture_tutorial', true)
    },
    goToRecipeDetail(recipeId) {
      uni.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipeId}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; display: flex; flex-direction: column; width: 100%; overflow-x: hidden; }
.page-enter { animation: pageEnter .3s ease forwards; }

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.header { padding: 56rpx 28rpx 24rpx; background: #fff; width: 100%; box-sizing: border-box; }
.header-title { display: block; font-size: 44rpx; font-weight: 800; color: #1a1a1a; margin-bottom: 8rpx; }
.header-sub { display: block; font-size: 24rpx; color: #999; margin-bottom: 24rpx; }

.completion-banner {
  display: flex; align-items: center; gap: 12rpx;
  background: linear-gradient(135deg, #07c160, #06a652);
  padding: 24rpx 28rpx; border-radius: 16rpx;
  margin-bottom: 20rpx; animation: popIn .4s ease;
}
.cb-icon { font-size: 36rpx; }
.cb-text { font-size: 28rpx; font-weight: 700; color: #fff; }

.mode-badge {
  display: inline-flex; align-items: center; gap: 8rpx;
  background: #e8f7ef; padding: 12rpx 20rpx; border-radius: 28rpx;
  margin-bottom: 24rpx;
}
.mb-icon { font-size: 28rpx; }
.mb-text { font-size: 24rpx; font-weight: 600; color: #07c160; }

.day-config { margin-bottom: 20rpx; padding-bottom: 20rpx; border-bottom: 1rpx solid #f5f5f5; width: 100%; }
.dc-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; width: 100%; }
.dc-label { font-size: 26rpx; color: #666; font-weight: 600; }
.dc-options { display: flex; gap: 8rpx; flex-shrink: 0; }
.dc-option {
  padding: 10rpx 24rpx; background: #f5f6f8; border-radius: 28rpx; border: 2rpx solid transparent; transition: all .2s ease;
  &:active { opacity: .8; }
  &.active { background: #07c160; border-color: #07c160; }
}
.dc-text { font-size: 24rpx; color: #666; font-weight: 500; }
.dc-option.active .dc-text { color: #fff; }

.dc-preset { display: flex; gap: 12rpx; width: 100%; }
.dc-preset-item {
  flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center;
  padding: 16rpx; background: #f5f6f8; border-radius: 16rpx; border: 2rpx solid transparent; transition: all .2s ease;
  &:active { opacity: .8; }
  &.active { background: #fff; border-color: #07c160; box-shadow: 0 2rpx 12rpx rgba(7, 193, 96, .15); }
}
.dpi-emoji { font-size: 32rpx; margin-bottom: 6rpx; }
.dpi-label { font-size: 22rpx; color: #666; }

.dc-custom { display: flex; flex-direction: column; gap: 16rpx; width: 100%; }
.dc-days-scroll { width: 100%; white-space: nowrap; }
.dc-days-list { display: inline-flex; gap: 12rpx; padding: 8rpx 0; }
.dc-day-item {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 80rpx; height: 88rpx; padding: 0 16rpx;
  background: #f5f6f8; border-radius: 20rpx; border: 2rpx solid transparent; transition: all .2s ease; flex-shrink: 0;
  &:active { transform: scale(.95); }
  &.active { background: linear-gradient(135deg, #07c160, #06ae56); border-color: #07c160; box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, .3); }
}
.dc-day-num { font-size: 32rpx; font-weight: 700; color: #333; line-height: 1.2; }
.dc-day-item.active .dc-day-num { color: #fff; }
.dc-day-text { font-size: 18rpx; color: #999; line-height: 1.2; }
.dc-day-item.active .dc-day-text { color: rgba(255,255,255,.85); }
.dc-selected-info { display: flex; align-items: center; justify-content: center; gap: 8rpx; }
.dc-selected-label { font-size: 24rpx; color: #999; }
.dc-selected-value { font-size: 26rpx; font-weight: 600; color: #07c160; }

.meal-config-entry { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0; width: 100%; }
.mce-label { font-size: 24rpx; color: #666; }
.mce-summary { font-size: 22rpx; color: #999; flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mce-arrow { font-size: 28rpx; color: #ccc; flex-shrink: 0; }

.header-actions { display: flex; gap: 16rpx; width: 100%; }
.action-btn {
  flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 8rpx;
  padding: 20rpx 0; background: #07c160; border-radius: 48rpx; transition: all .25s ease;
  &:active { opacity: .85; transform: scale(.97); }
  &.secondary { background: #f5f6f8; }
}
.btn-icon { font-size: 26rpx; }
.action-btn.secondary .btn-icon { color: #666; }
.btn-text { font-size: 26rpx; color: #fff; font-weight: 600; }
.action-btn.secondary .btn-text { color: #666; }

.list-scroll { flex: 1; padding: 20rpx 28rpx; width: 100%; box-sizing: border-box; }

.family-recipes-section {
  background: #fff; border-radius: 24rpx; margin-bottom: 20rpx; padding: 24rpx 28rpx;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04); width: 100%;
}
.frs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.frs-header-left { display: flex; align-items: center; gap: 10rpx; }
.frs-icon { font-size: 32rpx; }
.frs-title { font-size: 30rpx; font-weight: 700; color: #1a1a1a; }
.frs-header-right { display: flex; align-items: center; }
.frs-refresh-btn {
  display: flex; align-items: center; gap: 6rpx;
  padding: 10rpx 20rpx; background: #f0faf5; border-radius: 24rpx;
  &:active { opacity: .7; }
}
.frs-refresh-icon { font-size: 24rpx; color: #07c160; }
.frs-refresh-text { font-size: 22rpx; color: #07c160; font-weight: 600; }
.frs-hint { margin-bottom: 12rpx; }
.frs-hint-text { font-size: 22rpx; color: #999; }

.gesture-tutorial {
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  background: linear-gradient(135deg, #f0faf5, #e8f7ef);
  padding: 24rpx 20rpx; border-radius: 20rpx; margin-bottom: 20rpx;
  animation: popIn .5s ease;
}
.gt-arrow { display: flex; align-items: center; justify-content: center; width: 56rpx; height: 56rpx; border-radius: 50%; background: #07c160; }
.gt-arrow-up { animation: bounceUp 1.2s ease infinite; }
.gt-arrow-down { animation: bounceDown 1.2s ease infinite 0.6s; }
.gt-arrow-icon { font-size: 28rpx; color: #fff; font-weight: 700; }
.gt-text { font-size: 24rpx; color: #07c160; font-weight: 600; }
.gt-close-btn {
  margin-top: 8rpx; padding: 12rpx 32rpx;
  background: #07c160; border-radius: 28rpx;
  &:active { opacity: .8; }
}
.gt-close-text { font-size: 24rpx; color: #fff; font-weight: 600; }

@keyframes bounceUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(12rpx); }
}

.frs-meal-group { margin-bottom: 16rpx; }
.frs-meal-label { display: flex; align-items: center; gap: 8rpx; margin-bottom: 10rpx; }
.frs-meal-emoji { font-size: 28rpx; }
.frs-meal-name { font-size: 24rpx; font-weight: 600; color: #666; }

.frs-recipe-card {
  display: flex; align-items: center; gap: 12rpx;
  padding: 20rpx 16rpx; background: #f9f9f9; border-radius: 16rpx;
  margin-bottom: 10rpx; transition: all .2s ease;
  &:active { background: #f0f0f0; }
}
.frs-recipe-info { flex: 1; display: flex; align-items: center; gap: 10rpx; min-width: 0; }
.frs-recipe-name { font-size: 28rpx; font-weight: 600; color: #1a1a1a; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.frs-recipe-tag {
  font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 12rpx; flex-shrink: 0;
  &.tag-easy { background: #e8f7ef; color: #07c160; }
  &.tag-medium { background: #fff3e0; color: #ff9f43; }
  &.tag-hard { background: #fce4ec; color: #e74c3c; }
}
.frs-recipe-hint { flex-shrink: 0; }
.frs-recipe-hint-text { font-size: 20rpx; color: #bbb; }
.frs-recipe-replace {
  display: flex; align-items: center; gap: 6rpx;
  padding: 8rpx 16rpx; background: #07c160; border-radius: 20rpx; flex-shrink: 0;
  animation: popIn .3s ease;
}
.frs-replace-icon { font-size: 20rpx; }
.frs-replace-text { font-size: 22rpx; color: #fff; font-weight: 600; }
.frs-recipe-delete { padding: 8rpx; flex-shrink: 0; }
.frs-delete-icon { font-size: 24rpx; }

.category-section {
  background: #fff; border-radius: 24rpx; margin-bottom: 20rpx; overflow: hidden;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04); width: 100%;
}
.cat-header { display: flex; align-items: center; gap: 12rpx; padding: 24rpx 28rpx; border-bottom: 1rpx solid #f5f5f5; }
.cat-icon { font-size: 32rpx; flex-shrink: 0; }
.cat-name { flex: 1; font-size: 28rpx; font-weight: 700; color: #1a1a1a; min-width: 0; }
.cat-count { font-size: 22rpx; color: #999; flex-shrink: 0; }

.item-list { padding: 8rpx 0; width: 100%; }
.item-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 28rpx; transition: all .2s ease; width: 100%; box-sizing: border-box;
  &:active { background: #f9f9f9; }
  &.fullyBought { opacity: .55; background: #f0faf5; }
}
.item-check { flex-shrink: 0; }
.check-circle {
  width: 44rpx; height: 44rpx; border: 3rpx solid #d0d0d0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all .25s ease;
  &.fullyBought { background: #07c160; border-color: #07c160; }
}
.check-mark { font-size: 24rpx; color: #fff; font-weight: 700; }
.check-buyers { font-size: 18rpx; font-weight: 700; color: #999; }
.item-content { flex: 1; display: flex; flex-direction: column; gap: 4rpx; min-width: 0; }
.item-name { font-size: 28rpx; color: #1a1a1a; font-weight: 500; transition: all .2s ease; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-name.fullyBought { text-decoration: line-through; color: #bbb; }
.item-amount { font-size: 22rpx; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-buyers { display: flex; align-items: center; justify-content: space-between; margin-top: 6rpx; }
.ib-progress { font-size: 20rpx; color: #07c160; font-weight: 500; }
.ib-avatars { display: flex; align-items: center; gap: 4rpx; }
.ib-avatar {
  width: 36rpx; height: 36rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2rpx solid #fff; margin-left: -8rpx;
  &:first-child { margin-left: 0; }
}
.ib-avatar-char { font-size: 16rpx; color: #fff; font-weight: 700; }
.ib-more { font-size: 18rpx; color: #999; margin-left: 4rpx; }
.item-delete {
  width: 52rpx; height: 52rpx; display: flex; align-items: center; justify-content: center; border-radius: 50%;
  transition: all .2s ease; flex-shrink: 0; &:active { background: #f5f5f5; }
}
.delete-icon { font-size: 24rpx; color: #ff6b6b; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 160rpx 40rpx; width: 100%; }
.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; color: #333; margin-bottom: 12rpx; }
.empty-hint { font-size: 24rpx; color: #bbb; text-align: center; }
.bottom-spacer { height: 160rpx; }

.add-bar {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; gap: 12rpx;
  padding: 20rpx 28rpx 40rpx; background: #fff; box-shadow: 0 -2rpx 16rpx rgba(0,0,0,.06);
  width: 100%; box-sizing: border-box;
}
.add-input {
  flex: 1; height: 72rpx; padding: 0 24rpx;
  background: #f5f6f8; border-radius: 36rpx;
  font-size: 28rpx; color: #333; min-width: 0;
}
.add-amount {
  width: 120rpx; height: 72rpx; padding: 0 20rpx;
  background: #f5f6f8; border-radius: 36rpx;
  font-size: 26rpx; color: #666; text-align: center; flex-shrink: 0;
}
.add-btn {
  width: 72rpx; height: 72rpx; background: #07c160; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all .25s ease; flex-shrink: 0;
  &:active { opacity: .85; transform: scale(.95); }
  &.disabled { opacity: .4; pointer-events: none; }
}
.add-icon { font-size: 36rpx; color: #fff; font-weight: 300; }

@keyframes slideUp { from { opacity: 0; transform: translateY(20rpx); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
</style>
