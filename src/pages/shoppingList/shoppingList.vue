<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <view class="header fade-in">
      <text class="header-title">购物清单</text>
      <text class="header-sub">{{ todayStr }} · {{ totalItems }}项食材</text>
      <view class="header-actions">
        <view class="action-btn" @click="generateFromMenu">
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
        <view
          class="category-section"
          v-for="(cat, ci) in categorizedItems"
          :key="cat.category"
          :style="{ animationDelay: (ci * 80) + 'ms' }"
          style="animation: slideUp .4s ease forwards; opacity: 0;"
        >
          <view class="cat-header">
            <text class="cat-icon">{{ cat.icon }}</text>
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-count">{{ cat.items.filter(i => !i.checked).length }}/{{ cat.items.length }}</text>
          </view>
          <view class="item-list">
            <view
              class="item-row"
              :class="{ checked: item.checked }"
              v-for="(item, ii) in cat.items"
              :key="item.id"
              @click="toggleItem(item)"
              :style="{ animationDelay: (ci * 80 + ii * 40) + 'ms' }"
              style="animation: popIn .35s ease forwards; opacity: 0;"
            >
              <view class="item-check">
                <view class="check-circle" :class="{ checked: item.checked }">
                  <text class="check-mark" v-if="item.checked">✓</text>
                </view>
              </view>
              <view class="item-content">
                <text class="item-name" :class="{ checked: item.checked }">{{ item.name }}</text>
                <text class="item-amount" v-if="item.amount">{{ item.amount }}</text>
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
        <text class="empty-hint">点击「从菜单生成」自动添加今日所需食材</text>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="add-bar">
      <input
        class="add-input"
        v-model="newItemName"
        placeholder="添加新物品..."
        maxlength="30"
        @confirm="addItem"
      />
      <input
        class="add-amount"
        v-model="newItemAmount"
        placeholder="数量"
        maxlength="20"
        @confirm="addItem"
      />
      <view class="add-btn" :class="{ disabled: !newItemName.trim() }" @click="addItem">
        <text class="add-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ALL_RECIPES } from '@/utils/constants.js'

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
      newItemAmount: ''
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
    }
  },
  onLoad() {
    this.loadShoppingList()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
  },
  methods: {
    loadShoppingList() {
      const saved = uni.getStorageSync('foodfind_shopping_list')
      if (saved && saved.date === this.getTodayStr()) {
        this.items = saved.items || []
      } else {
        this.items = []
      }
    },
    saveShoppingList() {
      uni.setStorageSync('foodfind_shopping_list', {
        date: this.getTodayStr(),
        items: this.items
      })
    },
    getTodayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    classifyIngredient(name) {
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => name.includes(k))) {
          return cat
        }
      }
      return 'other'
    },
    generateFromMenu() {
      const dailyMeals = uni.getStorageSync('foodfind_meals')
      if (!dailyMeals) {
        uni.showToast({ title: '请先生成今日菜单', icon: 'none' })
        return
      }

      const allRecipes = [...ALL_RECIPES.breakfast, ...ALL_RECIPES.lunch, ...ALL_RECIPES.dinner]
      const ingredientMap = new Map()

      ;['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const recipes = dailyMeals[mealType] || []
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
    toggleItem(item) {
      item.checked = !item.checked
      this.saveShoppingList()
    },
    deleteItem(id) {
      const idx = this.items.findIndex(i => i.id === id)
      if (idx > -1) {
        this.items.splice(idx, 1)
        this.saveShoppingList()
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
        checked: false
      }

      this.items.push(item)
      this.newItemName = ''
      this.newItemAmount = ''
      this.saveShoppingList()
      uni.showToast({ title: '已添加', icon: 'success' })
    },
    clearCompleted() {
      uni.showModal({
        title: '确认清空',
        content: `确定删除已购买的${this.completedCount}项食材吗？`,
        success: (res) => {
          if (res.confirm) {
            this.items = this.items.filter(i => !i.checked)
            this.saveShoppingList()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; display: flex; flex-direction: column; }
.page-enter { animation: pageEnter .3s ease forwards; }

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.header { padding: 56rpx 28rpx 24rpx; background: #fff; }
.header-title { display: block; font-size: 44rpx; font-weight: 800; color: #1a1a1a; margin-bottom: 8rpx; }
.header-sub { display: block; font-size: 24rpx; color: #999; margin-bottom: 24rpx; }
.header-actions { display: flex; gap: 16rpx; }
.action-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8rpx;
  padding: 20rpx 0; background: #07c160; border-radius: 48rpx;
  transition: all .25s ease;
  &:active { opacity: .85; transform: scale(.97); }
  &.secondary { background: #f5f6f8; }
}
.btn-icon { font-size: 26rpx; }
.action-btn.secondary .btn-icon { color: #666; }
.btn-text { font-size: 26rpx; color: #fff; font-weight: 600; }
.action-btn.secondary .btn-text { color: #666; }

/* List Scroll */
.list-scroll { flex: 1; padding: 20rpx 28rpx; }

/* Category Section */
.category-section {
  background: #fff; border-radius: 24rpx;
  margin-bottom: 20rpx; overflow: hidden;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
}
.cat-header {
  display: flex; align-items: center; gap: 12rpx;
  padding: 24rpx 28rpx; border-bottom: 1rpx solid #f5f5f5;
}
.cat-icon { font-size: 32rpx; }
.cat-name { flex: 1; font-size: 28rpx; font-weight: 700; color: #1a1a1a; }
.cat-count { font-size: 22rpx; color: #999; }

/* Item List */
.item-list { padding: 8rpx 0; }
.item-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 28rpx; transition: all .2s ease;
  &:active { background: #f9f9f9; }
  &.checked { opacity: .6; }
}
.item-check { flex-shrink: 0; }
.check-circle {
  width: 44rpx; height: 44rpx; border: 3rpx solid #d0d0d0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all .25s ease;
  &.checked { background: #07c160; border-color: #07c160; }
}
.check-mark { font-size: 24rpx; color: #fff; font-weight: 700; }
.item-content { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
.item-name { font-size: 28rpx; color: #1a1a1a; font-weight: 500; transition: all .2s ease; }
.item-name.checked { text-decoration: line-through; color: #bbb; }
.item-amount { font-size: 22rpx; color: #999; }
.item-delete {
  width: 52rpx; height: 52rpx; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; transition: all .2s ease;
  &:active { background: #f5f5f5; }
}
.delete-icon { font-size: 24rpx; color: #ff6b6b; }

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 160rpx 40rpx;
}
.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; color: #333; margin-bottom: 12rpx; }
.empty-hint { font-size: 24rpx; color: #bbb; text-align: center; }
.bottom-spacer { height: 160rpx; }

/* Add Bar */
.add-bar {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; gap: 12rpx;
  padding: 20rpx 28rpx 40rpx; background: #fff;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,.06);
}
.add-input {
  flex: 1; height: 72rpx; padding: 0 24rpx;
  background: #f5f6f8; border-radius: 36rpx;
  font-size: 28rpx; color: #333;
}
.add-amount {
  width: 120rpx; height: 72rpx; padding: 0 20rpx;
  background: #f5f6f8; border-radius: 36rpx;
  font-size: 26rpx; color: #666; text-align: center;
}
.add-btn {
  width: 72rpx; height: 72rpx;
  background: #07c160; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all .25s ease;
  &:active { opacity: .85; transform: scale(.95); }
  &.disabled { opacity: .4; pointer-events: none; }
}
.add-icon { font-size: 36rpx; color: #fff; font-weight: 300; }

/* Animations */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
