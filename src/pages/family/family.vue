<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <template v-if="!hasFamily">
      <view class="empty-state fade-in">
        <text class="empty-icon">🏠</text>
        <text class="empty-title">创建或加入家庭群组</text>
        <text class="empty-hint">和家人一起决定今天吃什么</text>
      </view>

      <view class="action-card slide-up" style="animation-delay:0.1s;opacity:0">
        <text class="ac-title">创建家庭</text>
        <text class="ac-desc">你是第一个加入的，来设置家庭信息吧</text>
        
        <view class="form-section">
          <view class="form-row">
            <text class="fr-label">家庭名称</text>
            <input class="fr-input" v-model="form.name" placeholder="例如：温馨小屋" maxlength="20" />
          </view>

          <view class="form-row">
            <text class="fr-label">家庭类型</text>
            <view class="type-options">
              <view class="type-opt" :class="{ active: form.type === type.value }" v-for="type in familyTypes" :key="type.value" @click="form.type = type.value">
                <text class="type-icon">{{ type.icon }}</text>
                <text class="type-label">{{ type.label }}</text>
              </view>
            </view>
          </view>

          <view class="form-row">
            <text class="fr-label">我的昵称</text>
            <input class="fr-input" v-model="form.userName" placeholder="大家怎么称呼你" maxlength="12" />
          </view>
        </view>

        <view class="create-btn" @click="createFamily">
          <text class="cb-text">创建家庭群组</text>
        </view>
      </view>

      <view class="divider-slide-up" style="animation-delay:0.15s;opacity:0">
        <view class="divider-line"></view>
        <text class="divider-text">或者</text>
        <view class="divider-line"></view>
      </view>

      <view class="join-card slide-up" style="animation-delay:0.2s;opacity:0">
        <text class="jc-title">加入家庭</text>
        <text class="jc-desc">输入邀请码加入已有家庭</text>
        
        <view class="join-form">
          <view class="code-input-wrap">
            <input class="code-input" v-model="joinCode" placeholder="输入6位邀请码" maxlength="6" @input="onCodeInput" />
          </view>
          <view class="join-btn" :class="{ disabled: joinCode.length !== 6 }" @click="joinFamily">
            <text class="jb-text">加入家庭</text>
          </view>
        </view>
      </view>
    </template>

    <template v-else>
      <view class="family-header fade-in">
        <view class="fh-info">
          <text class="fh-name">{{ familyGroup.name }}</text>
          <view class="fh-meta">
            <text class="fh-type">{{ familyTypeData.icon }} {{ familyTypeData.label }}</text>
            <text class="fh-members">{{ familyGroup.members.length }}/{{ familyTypeData.maxMembers }}人</text>
          </view>
        </view>
        <view class="fh-actions">
          <view class="invite-btn" @click="showInviteCode">
            <text class="ib-icon">📤</text>
            <text class="ib-text">邀请</text>
          </view>
        </view>
      </view>

      <view class="invite-code-card slide-up" style="animation-delay:0.05s;opacity:0" v-if="showInviteCard">
        <text class="icc-label">邀请码（分享给家人）</text>
        <view class="icc-code-wrap" @click="copyInviteCode">
          <text class="icc-code">{{ familyGroup.inviteCode }}</text>
        </view>
        <text class="icc-hint">点击复制邀请码</text>
      </view>

      <view class="section slide-up" style="animation-delay:0.1s;opacity:0">
        <text class="section-title">家庭成员</text>
        <view class="member-list">
          <view class="member-item" v-for="member in familyGroup.members" :key="member.userId" :class="{ 'is-me': member.userId === currentUserId }">
            <view class="mi-avatar">
              <text class="mi-char">{{ member.name.charAt(0) }}</text>
            </view>
            <view class="mi-info">
              <text class="mi-name">{{ member.name }} <text class="mi-role" v-if="member.role === 'admin'">群主</text><text class="mi-role me" v-if="member.userId === currentUserId">我</text></text>
              <view class="mi-tags" v-if="member.healthTags && member.healthTags.length > 0">
                <text class="mi-tag" v-for="tag in member.healthTags" :key="tag">{{ getHealthTag(tag).icon }} {{ getHealthTag(tag).name }}</text>
              </view>
              <text class="mi-joined" v-else>未设置健康标签</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section slide-up" style="animation-delay:0.15s;opacity:0">
        <text class="section-title">我的健康标签</text>
        <text class="section-desc">设置标签后，推荐菜品时会考虑家庭成员需求</text>
        
        <view class="tag-categories">
          <view class="tag-cat" v-for="category in healthTagCategories" :key="category">
            <text class="tag-cat-title">{{ category }}</text>
            <view class="tag-options">
              <view class="tag-opt" :class="{ active: myHealthTags.includes(tag.id) }" v-for="tag in getTagsByCategory(category)" :key="tag.id" @click="toggleHealthTag(tag.id)">
                <text class="tag-icon">{{ tag.icon }}</text>
                <text class="tag-name">{{ tag.name }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="save-tags-btn" @click="saveMyHealthTags">
          <text class="stb-text">保存健康标签</text>
        </view>
      </view>

      <view class="section slide-up" style="animation-delay:0.2s;opacity:0">
        <text class="section-title">群组功能</text>
        <view class="func-list">
          <view class="func-item" @click="goToFamilyShopping">
            <view class="fi-icon-wrap">🛒</view>
            <view class="fi-center">
              <text class="fi-name">共享购物清单</text>
              <text class="fi-desc">谁买什么一目了然</text>
            </view>
            <text class="fi-arrow">›</text>
          </view>
          <view class="func-item" @click="goToFamilyCheckIn">
            <view class="fi-icon-wrap">📊</view>
            <view class="fi-center">
              <text class="fi-name">打卡看板</text>
              <text class="fi-desc">今天谁没好好吃饭一眼看到</text>
            </view>
            <text class="fi-arrow">›</text>
          </view>
          <view class="func-item" @click="goToFamilyWeeklyReport">
            <view class="fi-icon-wrap">📈</view>
            <view class="fi-center">
              <text class="fi-name">群组周报</text>
              <text class="fi-desc">全家营养总览</text>
            </view>
            <text class="fi-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="danger-zone slide-up" style="animation-delay:0.25s;opacity:0">
        <text class="danger-title">危险操作</text>
        <view class="danger-btns">
          <view class="danger-btn leave" @click="leaveFamily">
            <text class="db-text">离开家庭</text>
          </view>
          <view class="danger-btn delete" @click="deleteFamily" v-if="isAdmin">
            <text class="db-text">解散家庭</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import {
  FAMILY_TYPES,
  HEALTH_TAGS,
  HEALTH_TAG_CATEGORIES,
  createFamilyGroup,
  joinFamilyGroup,
  leaveFamilyGroup,
  deleteFamilyGroup,
  getFamilyGroup,
  getCurrentUserId,
  updateMyHealthTags,
  getHealthTagById
} from '@/utils/family'

export default {
  data() {
    return {
      pageEnter: true,
      hasFamily: false,
      familyGroup: null,
      currentUserId: '',
      form: {
        name: '',
        type: 'couple',
        userName: ''
      },
      joinCode: '',
      showInviteCard: false,
      myHealthTags: [],
      familyTypes: FAMILY_TYPES,
      healthTags: HEALTH_TAGS,
      healthTagCategories: HEALTH_TAG_CATEGORIES
    }
  },
  computed: {
    isAdmin() {
      return this.familyGroup && this.familyGroup.creatorId === this.currentUserId
    },
    familyTypeData() {
      if (!this.familyGroup) return {}
      return FAMILY_TYPES.find(t => t.value === this.familyGroup.type) || {}
    }
  },
  onLoad() {
    this.currentUserId = getCurrentUserId()
    this.loadFamily()
  },
  onShow() {
    this.pageEnter = true
    setTimeout(() => { this.pageEnter = false }, 300)
  },
  methods: {
    loadFamily() {
      const group = getFamilyGroup()
      if (group) {
        this.hasFamily = true
        this.familyGroup = group
        const me = group.members.find(m => m.userId === this.currentUserId)
        if (me) {
          this.myHealthTags = [...(me.healthTags || [])]
        }
      } else {
        this.hasFamily = false
      }
    },
    getHealthTag(tagId) {
      return getHealthTagById(tagId) || { icon: '', name: tagId }
    },
    getTagsByCategory(category) {
      return HEALTH_TAGS.filter(t => t.category === category)
    },
    onCodeInput(e) {
      this.joinCode = e.detail.value.toUpperCase()
    },
    async createFamily() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入家庭名称', icon: 'none' })
        return
      }
      if (!this.form.userName.trim()) {
        uni.showToast({ title: '请输入你的昵称', icon: 'none' })
        return
      }
      const result = await createFamilyGroup(this.form.name.trim(), this.form.type, this.form.userName.trim())
      if (result.success) {
        this.hasFamily = true
        this.familyGroup = result.group
        this.showInviteCard = true
        uni.showToast({ title: '家庭创建成功！', icon: 'success' })
      } else {
        uni.showToast({ title: result.error || '创建失败', icon: 'none' })
      }
    },
    async joinFamily() {
      if (this.joinCode.length !== 6) {
        uni.showToast({ title: '请输入6位邀请码', icon: 'none' })
        return
      }
      const result = await joinFamilyGroup(this.joinCode, '新成员')
      if (result.success) {
        this.hasFamily = true
        this.familyGroup = result.group
        this.loadFamily()
        uni.showToast({ title: '加入成功！', icon: 'success' })
      } else {
        uni.showToast({ title: result.error || '加入失败', icon: 'none' })
      }
    },
    toggleHealthTag(tagId) {
      const idx = this.myHealthTags.indexOf(tagId)
      if (idx > -1) {
        this.myHealthTags.splice(idx, 1)
      } else {
        this.myHealthTags.push(tagId)
      }
    },
    saveMyHealthTags() {
      const result = updateMyHealthTags(this.myHealthTags)
      if (result.success) {
        this.loadFamily()
        uni.showToast({ title: '健康标签已保存', icon: 'success' })
      }
    },
    showInviteCode() {
      this.showInviteCard = !this.showInviteCard
    },
    copyInviteCode() {
      uni.setClipboardData({
        data: this.familyGroup.inviteCode,
        success: () => {
          uni.showToast({ title: '邀请码已复制', icon: 'success' })
        }
      })
    },
    goToFamilyShopping() {
      uni.navigateTo({ url: '/pages/shoppingList/shoppingList?mode=family' })
    },
    goToFamilyCheckIn() {
      uni.navigateTo({ url: '/pages/familyCheckIn/familyCheckIn' })
    },
    goToFamilyWeeklyReport() {
      uni.navigateTo({ url: '/pages/familyReport/familyReport' })
    },
    leaveFamily() {
      uni.showModal({
        title: '确认离开',
        content: '确定要离开这个家庭吗？',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            const result = leaveFamilyGroup()
            if (result.success) {
              this.loadFamily()
              uni.showToast({ title: '已离开家庭', icon: 'success' })
            } else {
              uni.showToast({ title: result.error || '离开失败', icon: 'none' })
            }
          }
        }
      })
    },
    deleteFamily() {
      uni.showModal({
        title: '确认解散',
        content: '解散后所有数据将清除，无法恢复！',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            const result = deleteFamilyGroup()
            if (result.success) {
              this.loadFamily()
              uni.showToast({ title: '家庭已解散', icon: 'success' })
            } else {
              uni.showToast({ title: result.error || '解散失败', icon: 'none' })
            }
          }
        }
      })
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

.empty-state {
  padding: 80rpx 0 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon { font-size: 120rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 36rpx; font-weight: 800; color: #1a1a1a; margin-bottom: 12rpx; }
.empty-hint { font-size: 26rpx; color: #999; }

.action-card, .join-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  margin-bottom: 24rpx;
}
.ac-title, .jc-title { font-size: 32rpx; font-weight: 700; color: #1a1a1a; margin-bottom: 8rpx; }
.ac-desc, .jc-desc { font-size: 24rpx; color: #999; margin-bottom: 24rpx; }

.form-section { margin-bottom: 24rpx; }
.form-row { margin-bottom: 24rpx; }
.fr-label { font-size: 26rpx; font-weight: 600; color: #1a1a1a; margin-bottom: 12rpx; display: block; }
.fr-input {
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #1a1a1a;
}

.type-options {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}
.type-opt {
  flex: 1;
  min-width: 160rpx;
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid transparent;
  transition: all .2s ease;
  &.active {
    background: #e8f7ef;
    border-color: #07c160;
  }
}
.type-icon { font-size: 40rpx; }
.type-label { font-size: 24rpx; font-weight: 600; color: #666; }

.create-btn {
  background: #07c160;
  border-radius: 50rpx;
  padding: 26rpx;
  text-align: center;
  margin-top: 8rpx;
  &:active { opacity: .85; transform: scale(.98); }
}
.cb-text { font-size: 30rpx; font-weight: 600; color: #fff; }

.divider-slide-up {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 32rpx 0;
}
.divider-line { flex: 1; height: 2rpx; background: #e8e8e8; }
.divider-text { font-size: 24rpx; color: #ccc; }

.join-form { display: flex; flex-direction: column; gap: 20rpx; }
.code-input-wrap {
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
}
.code-input {
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 8rpx;
  text-align: center;
  color: #1a1a1a;
}
.join-btn {
  background: #07c160;
  border-radius: 50rpx;
  padding: 26rpx;
  text-align: center;
  transition: opacity .2s ease;
  &.disabled { opacity: .5; }
  &:active { opacity: .85; }
}
.jb-text { font-size: 30rpx; font-weight: 600; color: #fff; }

.family-header {
  background: linear-gradient(135deg, #07c160 0%, #06a652 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(7,193,96,.25);
}
.fh-name { font-size: 36rpx; font-weight: 800; color: #fff; margin-bottom: 8rpx; display: block; }
.fh-meta { display: flex; gap: 16rpx; align-items: center; }
.fh-type { font-size: 24rpx; color: rgba(255,255,255,.9); }
.fh-members { font-size: 24rpx; color: rgba(255,255,255,.7); }
.invite-btn {
  background: rgba(255,255,255,.2);
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  &:active { opacity: .85; }
}
.ib-icon { font-size: 28rpx; }
.ib-text { font-size: 24rpx; font-weight: 600; color: #fff; }

.invite-code-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.icc-label { font-size: 24rpx; color: #999; margin-bottom: 16rpx; }
.icc-code-wrap {
  background: #f5f6f8;
  border-radius: 16rpx;
  padding: 24rpx 48rpx;
  margin-bottom: 12rpx;
  &:active { background: #e8f7ef; }
}
.icc-code { font-size: 48rpx; font-weight: 900; color: #07c160; letter-spacing: 12rpx; }
.icc-hint { font-size: 22rpx; color: #bbb; }

.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.section-title { font-size: 28rpx; font-weight: 700; color: #1a1a1a; margin-bottom: 8rpx; }
.section-desc { font-size: 23rpx; color: #999; margin-bottom: 20rpx; }

.member-list { display: flex; flex-direction: column; gap: 16rpx; }
.member-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #f5f6f8;
  border-radius: 16rpx;
  &.is-me { background: #e8f7ef; }
}
.mi-avatar {
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mi-char { font-size: 28rpx; font-weight: 700; color: #07c160; }
.mi-info { flex: 1; }
.mi-name { font-size: 26rpx; font-weight: 600; color: #1a1a1a; }
.mi-role {
  font-size: 20rpx;
  color: #999;
  background: #f0f0f0;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  margin-left: 8rpx;
  &.me { background: #07c160; color: #fff; }
}
.mi-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 8rpx; }
.mi-tag { font-size: 21rpx; color: #666; background: #f5f6f8; padding: 4rpx 12rpx; border-radius: 10rpx; }
.mi-joined { font-size: 22rpx; color: #bbb; margin-top: 4rpx; }

.tag-categories { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 24rpx; }
.tag-cat-title { font-size: 24rpx; font-weight: 600; color: #666; margin-bottom: 12rpx; display: block; }
.tag-options { display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag-opt {
  background: #f5f6f8;
  border-radius: 40rpx;
  padding: 14rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid transparent;
  transition: all .2s ease;
  &.active {
    background: #e8f7ef;
    border-color: #07c160;
  }
}
.tag-icon { font-size: 24rpx; }
.tag-name { font-size: 23rpx; color: #666; }

.save-tags-btn {
  background: #07c160;
  border-radius: 50rpx;
  padding: 24rpx;
  text-align: center;
  &:active { opacity: .85; transform: scale(.98); }
}
.stb-text { font-size: 28rpx; font-weight: 600; color: #fff; }

.func-list { display: flex; flex-direction: column; gap: 12rpx; }
.func-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f5f6f8;
  border-radius: 16rpx;
  &:active { background: #e8f7ef; }
}
.fi-icon-wrap { font-size: 40rpx; flex-shrink: 0; }
.fi-center { flex: 1; }
.fi-name { font-size: 26rpx; font-weight: 600; color: #1a1a1a; display: block; }
.fi-desc { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.fi-arrow { font-size: 32rpx; color: #ddd; flex-shrink: 0; }

.danger-zone {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.danger-title { font-size: 26rpx; font-weight: 600; color: #ff4757; margin-bottom: 20rpx; display: block; }
.danger-btns { display: flex; gap: 16rpx; }
.danger-btn {
  flex: 1;
  padding: 22rpx;
  border-radius: 40rpx;
  text-align: center;
  &:active { opacity: .85; }
  &.leave { background: #f5f6f8; }
  &.delete { background: #fff0f0; }
}
.db-text { font-size: 26rpx; font-weight: 600; color: #ff4757; }
</style>
