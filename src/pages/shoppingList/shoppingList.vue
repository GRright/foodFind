<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="header fade-in">
      <text class="header-title">{{ isFamilyMode ? '家庭购物清单' : '购物清单' }}</text>
      <text class="header-sub">{{ todayStr }} · {{ totalItems }}项食材</text>
      
      <view class="mode-badge" v-if="isFamilyMode">
        <text class="mb-icon">👨‍👩‍👧‍👦</text>
        <text class="mb-text">{{ familyGroup?.name || '家庭' }}</text>
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
          <view class="dcc-slider">
            <text class="dcc-min">1天</text>
            <view class="dcc-track">
              <view class="dcc-progress" :style="{ width: ((config.customDays - 1) / 13) * 100 + '%' }"></view>
              <input type="range" :min="1" :max="14" :value="config.customDays" @input="onCustomDaysChange" class="dcc-input"/>
            </view>
            <text class="dcc-max">14天</text>
          </view>
          <text class="dcc-value">{{ config.customDays }}天</text>
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
          <text class="btn-text">从菜单生成</text>
        </view>
        <view class="action-btn secondary" @click="clearCompleted" v-if="completedCount > 0">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">清空已购</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view class="category-list" v-if="categorizedItems.length > 0">
        <view class="category-section" v-for="(cat, ci) in categorizedItems" :key="cat.category" :style="{ animationDelay: (ci * 80) + 'ms' }" style="animation: slideUp .4s ease forwards; opacity: 0;">
          <view class="cat-header">
            <text class="cat-icon">{{ cat.icon }}</text>
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-count">{{ cat.items.filter(i => !i.checked).length }}/{{ cat.items.length }}</text>
          </view>
          <view class="item-list">
            <view class="item-row" :class="{ checked: item.checked }" v-for="(item, ii) in cat.items" :key="item.id" @click="toggleItem(item)" :style="{ animationDelay: (ci * 80 + ii * 40) + 'ms' }" style="animation: popIn .35s ease forwards; opacity: 0;">
              <view class="item-check">
                <view class="check-circle" :class="{ checked: item.checked }">
                  <text class="check-mark" v-if="item.checked">✓</text>
                </view>
              </view>
              <view class="item-content">
                <text class="item-name" :class="{ checked: item.checked }">{{ item.name }}</text>
                <text class="item-amount" v-if="item.amount">{{ item.amount }}</text>
                <text class="item-added-by" v-if="isFamilyMode && item.addedBy">由 {{ getMemberName(item.addedBy) }} 添加</text>
              </view>
              <view class="item-delete" @click.stop="deleteItem(item.id)">
                <text class="delete-icon">✕</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else>
        <text class="empty-icon">🛒</text>
        <text class="empty-title">购物清单为空</text>
        <text class="empty-hint">点击「从菜单生成」自动添加食材</text>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="add-bar">
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
import { getFamilyGroup, getCurrentUserId, getFamilyShoppingList, saveFamilyShoppingList, recordFamilyCheckIn } from '@/utils/family.js'

const CATEGORY_MAP = {
  vegetable: { name: '蔬菜', icon: '🥬' },
  meat: { name: '肉蛋禽', icon: '🥩' },
  seasoning: { name: '调料', icon: '🧂' },
  staple: { name: '主食', icon: '🍚' },
  other: { name: '其他', icon: '📦' }
}

const CATEGORY_KEYWORDS = {
  vegetable: ['菜', '豆', '茄', '瓜', '菇', '笋', '藕', '椒', '蒜', '葱', '姜', '花', '叶', '生菜', '萝卜', '番茄', '西兰', '四季'],
  meat: ['肉', '鸡', '鸭', '鱼', '虾', '蛋', '排', '里脊', '牛肉', '猪肉', '鸡胸', '鸡翅', '鸭', '鲈', '皮蛋'],
  seasoning: ['油', '盐', '酱', '醋', '糖', '料酒', '蚝油', '淀粉', '花椒', '八角', '桂皮', '豆瓣', '豉', '芝麻', '辣椒', '泡椒', '甜面', '豆鼓', '冰糖'],
  staple: ['米', '面', '粉', '饼', '油条', '馒头', '粮', '麦', '豆', '黄豆']
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
      currentUserId: ''
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
      return this.items.filter(i => i.checked).length
    },
    categorizedItems() {
      const cats = {}
      this.items.forEach(item => {
        const cat = item.category || 'other'
        if (!cats[cat]) {
          cats[cat] = { category: cat, ...CATEGORY_MAP[cat], items: [] }
        }
        cats[cat].items.push(item)
      })
      const order = ['vegetable', 'meat', 'staple', 'seasoning', 'other']
      return order.filter(k => cats[k]).map(k => cats[k])
    },
    mealConfigSummary() {
      const weekdayText = this.mealConfig.weekday.length === 3 ? '三餐' :
        this.mealConfig.weekday.length === 2 ? '两餐' : '一餐'
      const weekendText = this.mealConfig.weekend.length === 3 ? '三餐' :
        this.mealConfig.weekend.length === 2 ? '两餐' : '一餐'
      return `工作日${weekdayText} · 周末${weekendText}`
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
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
    
    if (this.isFamilyMode) {
      this.loadFamilyShoppingList()
    } else if (this.items.length === 0) {
      setTimeout(() => {
        this.autoGenerateIfEmpty()
      }, 500)
    }
  },
  methods: {
    loadConfig() {
      const prefs = uni.getStorageSync('foodfind_detailed_prefs')
      if (prefs) {
        if (prefs.shoppingConfig) {
          this.config = { ...this.config, ...prefs.shoppingConfig }
        }
        if (prefs.mealConfig) {
          this.mealConfig = { ...this.mealConfig, ...prefs.mealConfig }
        }
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
        if (keywords.some(k => name.includes(k))) {
          return cat
        }
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
    onCustomDaysChange(e) {
      this.config.customDays = parseInt(e.detail.value)
      this.saveConfig()
      this.loadShoppingList()
      setTimeout(() => { this.autoGenerateIfEmpty() }, 100)
    },
    goToMealConfig() {
      uni.navigateTo({ url: '/pages/mealConfig/mealConfig' })
    },
    autoGenerateIfEmpty() {
      if (this.items.length === 0) {
        this.generateFromMenu()
      }
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
        uni.showToast({ title: '请先生成菜单', icon: 'none' })
        return
      }

      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const ingredientMap = new Map()
      const daysToProcess = this.getDaysToProcess()

      for (let i = 0; i < daysToProcess.length; i++) {
        const { dateStr, isWeekend, offset } = daysToProcess[i]
        let dayMeals = null

        if (weeklyData && weeklyData[dateStr]) {
          dayMeals = weeklyData[dateStr]
        } else if (offset === 0 && dailyMeals) {
          dayMeals = dailyMeals
        }

        if (dayMeals) {
          const mealTypes = isWeekend ? this.mealConfig.weekend : this.mealConfig.weekday
          mealTypes.forEach(mealType => {
            const recipes = dayMeals[mealType] || []
            recipes.forEach(recipe => {
              const fullRecipe = allRecipes.find(r => r.id === recipe.id)
              if (fullRecipe && fullRecipe.ingredients) {
                fullRecipe.ingredients.forEach(ing => {
                  const key = ing.name
                  if (ingredientMap.has(key)) {
                    const existing = ingredientMap.get(key)
                    existing.amount = this.mergeAmount(existing.amount, ing.amount)
                  } else {
                    ingredientMap.set(key, {
                      name: ing.name,
                      amount: ing.amount,
                      category: this.classifyIngredient(ing.name)
                    })
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
        checked: false
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
        days.push({
          dateStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          offset: 0
        })
      } else if (this.config.mode === 'weekend') {
        const today = new Date()
        const dayOfWeek = today.getDay()

        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
        const daysUntilSunday = (0 - dayOfWeek + 7) % 7

        const saturdayOffset = daysUntilSaturday === 0 ? 7 : daysUntilSaturday
        const sundayOffset = daysUntilSunday === 0 ? 7 : daysUntilSunday

        days.push({
          dateStr: this.getDateStr(saturdayOffset),
          isWeekend: true,
          offset: saturdayOffset
        })
        days.push({
          dateStr: this.getDateStr(sundayOffset),
          isWeekend: true,
          offset: sundayOffset
        })
      } else if (this.config.mode === 'week') {
        for (let offset = 0; offset < 7; offset++) {
          const dateStr = this.getDateStr(offset)
          const dayOfWeek = this.getDayOfWeek(offset)
          days.push({
            dateStr,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            offset
          })
        }
      } else if (this.config.mode === 'custom') {
        for (let offset = 0; offset < this.config.customDays; offset++) {
          const dateStr = this.getDateStr(offset)
          const dayOfWeek = this.getDayOfWeek(offset)
          days.push({
            dateStr,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            offset
          })
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
        checked: false
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
        if (unit1 === unit2) {
          return (num1 + num2) + unit1
        }
      }
      return amount1 + ' + ' + amount2
    },
    clearCompleted() {
      uni.showModal({
        title: '确认清空',
        content: `确定删除已购买的${this.completedCount}项食材吗？`,
        success: (res) => {
          if (res.confirm) {
            this.items = this.items.filter(i => !i.checked)
            if (this.isFamilyMode) {
              this.saveFamilyShoppingListData()
            } else {
              this.saveShoppingList()
            }
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
      }
    },
    loadFamilyShoppingList() {
      const familyData = getFamilyShoppingList()
      this.items = familyData.items || []
    },
    saveFamilyShoppingListData() {
      saveFamilyShoppingList({ items: this.items }, this.currentUserId)
    },
    getMemberName(userId) {
      if (!this.familyGroup) return '未知'
      const member = this.familyGroup.members.find(m => m.userId === userId)
      return member ? member.name : '未知'
    },
    toggleItem(item) {
      item.checked = !item.checked
      if (this.isFamilyMode) {
        this.saveFamilyShoppingListData()
      } else {
        this.saveShoppingList()
      }
    },
    deleteItem(id) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items.splice(idx, 1)
        if (this.isFamilyMode) {
          this.saveFamilyShoppingListData()
        } else {
          this.saveShoppingList()
        }
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
        checked: false,
        addedBy: this.currentUserId,
        addedAt: new Date().toISOString()
      }

      this.items.push(item)
      this.newItemName = ''
      this.newItemAmount = ''
      
      if (this.isFamilyMode) {
        this.saveFamilyShoppingListData()
      } else {
        this.saveShoppingList()
      }
      
      uni.showToast({ title: '已添加', icon: 'success' })
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

.mode-badge {
  display: inline-flex; align-items: center; gap: 8rpx;
  background: #e8f7ef; padding: 12rpx 20rpx; border-radius: 28rpx;
  margin-bottom: 24rpx;
}
.mb-icon { font-size: 28rpx; }
.mb-text { font-size: 24rpx; font-weight: 600; color: #07c160; }

.day-config {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  width: 100%;
}
.dc-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16rpx;
  width: 100%;
}
.dc-label { font-size: 26rpx; color: #666; font-weight: 600; }
.dc-options { display: flex; gap: 8rpx; flex-shrink: 0; }
.dc-option {
  padding: 10rpx 24rpx;
  background: #f5f6f8;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
  transition: all .2s ease;
  &:active { opacity: .8; }
  &.active { background: #07c160; border-color: #07c160; }
}
.dc-text { font-size: 24rpx; color: #666; font-weight: 500; }
.dc-option.active .dc-text { color: #fff; }

.dc-preset { display: flex; gap: 12rpx; width: 100%; }
.dc-preset-item {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: 16rpx; background: #f5f6f8; border-radius: 16rpx; border: 2rpx solid transparent;
  transition: all .2s ease;
  &:active { opacity: .8; }
  &.active { background: #fff; border-color: #07c160; box-shadow: 0 2rpx 12rpx rgba(7, 193, 96, .15); }
}
.dpi-emoji { font-size: 32rpx; margin-bottom: 6rpx; }
.dpi-label { font-size: 22rpx; color: #666; }

.dc-custom { display: flex; flex-direction: column; gap: 12rpx; width: 100%; }
.dcc-slider { display: flex; align-items: center; gap: 16rpx; width: 100%; }
.dcc-min, .dcc-max { font-size: 20rpx; color: #999; width: 60rpx; text-align: center; flex-shrink: 0; }
.dcc-track {
  flex: 1; height: 4rpx; background: #f5f6f8; border-radius: 2rpx; position: relative; min-width: 0;
}
.dcc-progress { position: absolute; left: 0; top: 0; height: 100%; background: linear-gradient(90deg, #07c160 0%, #09e370 100%); border-radius: 2rpx; }
.dcc-input { position: absolute; left: -40rpx; right: -40rpx; top: -20rpx; bottom: -20rpx; opacity: 0; }
.dcc-value { text-align: center; font-size: 32rpx; font-weight: 700; color: #07c160; }

.meal-config-entry {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16rpx 0; width: 100%;
}
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
  &.checked { opacity: .6; }
}
.item-check { flex-shrink: 0; }
.check-circle {
  width: 44rpx; height: 44rpx; border: 3rpx solid #d0d0d0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all .25s ease;
  &.checked { background: #07c160; border-color: #07c160; }
}
.check-mark { font-size: 24rpx; color: #fff; font-weight: 700; }
.item-content { flex: 1; display: flex; flex-direction: column; gap: 4rpx; min-width: 0; }
.item-name { font-size: 28rpx; color: #1a1a1a; font-weight: 500; transition: all .2s ease; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-name.checked { text-decoration: line-through; color: #bbb; }
.item-amount { font-size: 22rpx; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-added-by { font-size: 20rpx; color: #07c160; margin-top: 4rpx; }
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
