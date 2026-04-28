<template>
  <view class="page">
    <view class="header-area fade-in">
      <text class="main-title">让我们了解你</text>
      <text class="sub-title">这样推荐会更符合你的口味</text>

      <view class="progress-wrap">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <view class="step-dots">
          <view
            class="step-dot"
            :class="{ done: i < currentStep, active: i === currentStep }"
            v-for="(q, i) in questions"
            :key="i"
          ></view>
        </view>
        <text class="step-info">{{ currentStep + 1 }} / {{ totalSteps }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="question-scroll" :style="{ height: questionHeight }">
      <view v-if="currentQuestion" class="question-card" :key="currentStep">
          <text class="q-text">{{ currentQuestion.question }}</text>

          <view class="options-list" v-if="currentQuestion.type === 'single_choice'">
            <view
              class="option-item"
              :class="{ active: selectedAnswer === opt.value }"
              v-for="(opt, oi) in currentQuestion.options"
              :key="opt.value"
              @click="selectSingle(opt.value)"
              style="animation: slideUp .35s ease forwards; animation-delay: calc(0.04s * oi); opacity: 0;"
            >
              <view class="radio-circle">
                <view class="radio-dot" v-if="selectedAnswer === opt.value"></view>
              </view>
              <text class="opt-label">{{ opt.label }}</text>
              <text class="check-icon" v-if="selectedAnswer === opt.value">✓</text>
            </view>
          </view>

          <view class="options-list" v-else>
            <view
              class="option-item"
              :class="{ active: isSelected(opt.value) }"
              v-for="(opt, oi) in currentQuestion.options"
              :key="opt.value"
              @click="toggleMulti(opt.value)"
              style="animation: slideUp .35s ease forwards; animation-delay: calc(0.04s * oi); opacity: 0;"
            >
              <view class="check-box">
                <text class="check-mark" v-if="isSelected(opt.value)">✓</text>
              </view>
              <text class="opt-label">{{ opt.label }}</text>
            </view>
          </view>
        </view>

      <view class="footer-btns">
        <view
          class="btn-secondary"
          v-if="currentStep > 0"
          @click="prevStep"
        ><text class="btn-txt">◀ 上一步</text></view>
        <view
          class="btn-primary"
          :class="{ disabled: !canProceed }"
          v-if="currentQuestion && currentQuestion.type !== 'single_choice'"
          @click="handleNext"
        >
          <text class="btn-txt">{{ isLast ? '完成设置 ✓' : '下一步 ▶' }}</text>
        </view>
        <view class="btn-hint" v-if="currentQuestion && currentQuestion.type === 'single_choice' && !selectedAnswer">
          <text class="hint-txt">选择后自动进入下一题</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
import { callFunction } from '../../utils/cloud.js'
export default {
  data() {
    return {
      questions: [
        { id: 1, question: '你属于哪类人群？', type: 'single_choice', options: [
          { label: '🧑 成人（普通）', value: 'adult' },
          { label: '💪 健身人群', value: 'fitness' },
          { label: '🤰 孕妇/哺乳期', value: 'pregnant' },
          { label: '👴 老年人', value: 'elderly' },
          { label: '👶 婴幼儿家庭', value: 'child' },
          { label: '🏥 慢性病管理', value: 'health_care' }
        ]},
        { id: 2, question: '你喜欢什么口味？', type: 'single_choice', options: [
          { label: '🍃 清淡养生', value: 'light' },
          { label: '🌶️ 麻辣过瘾', value: 'spicy' },
          { label: '🍯 酸甜开胃', value: 'sweet_sour' },
          { label: '🧂 咸鲜下饭', value: 'salty' },
          { label: '🔥 香辣重口', value: 'hot' },
          { label: '🍚 原汁原味', value: 'original' }
        ]},
        { id: 3, question: '平时一般几人用餐？', type: 'single_choice', options: [
          { label: '🥢 1人食', value: '1' },
          { label: '🍽️ 2人份（情侣/夫妻）', value: '2' },
          { label: '👨‍👩‍👧 3-4人小家庭', value: '3-4' },
          { label: '🏠 5人以上大家庭', value: '5+' }
        ]},
        { id: 4, question: '你偏好哪些菜系？（可多选）', type: 'multi_choice', options: [
          { label: '🏠 家常菜', value: 'home_cooking' },
          { label: '🌶️ 川菜/湘菜', value: 'sichuan' },
          { label: '🦆 粤菜/广式', value: 'cantonese' },
          { label: '🍜 北方菜/面食', value: 'northern' },
          { label: '🥗 轻食/减脂餐', value: 'healthy' },
          { label: '🍜 日韩料理', value: 'asian_fusion' }
        ]}
      ],
      currentStep: 0,
      selectedAnswer: '',
      selectedAnswers: [],
      answers: [],
      questionHeight: 'calc(100vh - 340rpx)'
    }
  },
  computed: {
    totalSteps() { return this.questions.length },
    currentQuestion() { return this.questions[this.currentStep] },
    isLast() { return this.currentStep === this.totalSteps - 1 },
    progress() { return Math.round(((this.currentStep + 1) / this.totalSteps) * 100) },
    canProceed() {
      if (!this.currentQuestion) return false
      if (this.currentQuestion.type === 'single_choice') return !!this.selectedAnswer
      return this.selectedAnswers.length > 0
    }
  },
  methods: {
    isSelected(val) { return this.selectedAnswers.includes(val) },
    selectSingle(val) {
      this.selectedAnswer = val
      setTimeout(() => {
        if (this.isLast) {
          this.submit()
        } else {
          this.nextStep()
        }
      }, 280)
    },
    toggleMulti(val) {
      let list = [...this.selectedAnswers]
      const idx = list.indexOf(val)
      idx > -1 ? list.splice(idx, 1) : list.push(val)
      this.selectedAnswers = list
    },
    saveCurrent() {
      const q = this.currentQuestion
      const val = q.type === 'single_choice' ? this.selectedAnswer : [...this.selectedAnswers]
      this.answers[this.currentStep] = { question_id: q.id, question: q.question, value: val }
    },
    nextStep() {
      this.saveCurrent()
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++
        this.selectedAnswer = ''
        this.selectedAnswers = []
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
        const prev = this.answers[this.currentStep]
        if (prev) {
          this.currentQuestion.type === 'single_choice'
            ? (this.selectedAnswer = prev.value)
            : (this.selectedAnswers = prev.value)
        }
      }
    },
    handleNext() {
      if (!this.canProceed) return
      if (this.isLast) { this.submit() } else { this.nextStep() }
    },
    submit() {
      this.saveCurrent()
      uni.setStorageSync('foodfind_preferences', this.answers)

      const userCountMap = { '1': 1, '2': 2, '3-4': 3, '5+': 5 }
      const userCountAns = this.answers.find(a => a.question_id === 3)
      if (userCountAns) {
        uni.setStorageSync('foodfind_user_count', userCountMap[userCountAns.value] || 2)
      }

      const prefs = uni.getStorageSync('foodfind_detailed_prefs') || {}
      prefs.userCount = userCountMap[userCountAns?.value] || 2
      if (!prefs.mealConfig) {
        prefs.mealConfig = { weekday: ['breakfast', 'lunch', 'dinner'], weekend: ['breakfast', 'lunch', 'dinner'] }
      }
      uni.setStorageSync('foodfind_detailed_prefs', prefs)

      callFunction('saveOnboardingAnswers', { answers: this.answers }).catch(() => {})

      uni.showToast({ title: '设置完成，开始美食之旅！', icon: 'success', duration: 1500 })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index' })
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6FA; display: flex; flex-direction: column; padding:0 28rpx; }
.header-area { padding: 56rpx 0 32rpx; }
.main-title { display: block; font-size: 44rpx; font-weight: 800; color: #1a1a1a; margin-bottom: 10rpx; letter-spacing:-1rpx; }
.sub-title { display: block; font-size: 24rpx; color: #999; margin-bottom: 30rpx; }

.progress-wrap { position:relative; }
.progress-track { height: 8rpx; background: #eee; border-radius: 4rpx; overflow: hidden; margin-bottom:14rpx; }
.progress-fill { height: 100%; background: #07c160; border-radius: 4rpx; transition: width 0.4s cubic-bezier(.4,0,.2,1); }
.step-dots { display:flex; gap:12rpx; justify-content:center; margin-bottom:12rpx; }
.step-dot {
  width:14rpx; height:14rpx; border-radius:50%;
  background:#e0e0e0; transition:all .3s ease;
  &.done { background:#07c160; transform:scale(1.1); }
  &.active { background:#07c160; box-shadow:0 0 0 4rpx rgba(7,193,96,.2); }
}
.step-info { font-size:23rpx; color:#bbb; text-align:center; display:block; }

.question-scroll { flex: 1; }
.question-card { padding:36rpx 16rpx 16rpx; }
.q-text { display: block; font-size:34rpx; font-weight: 600; color: #1a1a1a; margin-bottom: 28rpx; line-height: 1.5; }
.options-list { display: flex; flex-direction: column; gap: 14rpx; }
.option-item {
  background: #fff; border-radius: 22rpx; padding: 28rpx 24rpx;
  display: flex; align-items: center; border: 3rpx solid transparent;
  box-shadow: 0 1rpx 12rpx rgba(0,0,0,.04);
  transition: all 0.25s cubic-bezier(.4,0,.2,1);
  position:relative;
  &.active { border-color: #07c160; background: #f5f6f8; }
  &:active { transform: scale(0.97); }
}
.radio-circle {
  width: 44rpx; height: 44rpx; border: 3rpx solid #d0d0d0; border-radius: 50%;
  margin-right: 20rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition:all .25s;
  .active & { border-color: #07c160; }
}
.radio-dot { width: 22rpx; height: 22rpx; background: #07c160; border-radius: 50%; animation: popIn .25s ease; }
.check-box {
  width: 44rpx; height: 44rpx; border: 3rpx solid #d0d0d0; border-radius: 12rpx;
  margin-right: 20rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition:all .25s;
  .active & { border-color: #07c160; background: #07c160; }
}
.check-mark { color: #fff; font-size: 26rpx; font-weight: 700; }
.opt-label { font-size: 28rpx; color: #1a1a1a; font-weight: 500; flex:1; }
.check-icon {
  position:absolute; right:24rpx;
  font-size:28rpx; color:#07c160; font-weight:700;
}

.footer-btns { display: flex; gap: 16rpx; padding: 24rpx 16rpx 16rpx; align-items:center; justify-content:center; }
.btn-secondary {
  padding:22rpx 40rpx; background: #f5f6f8;
  color: #333; font-size:27rpx; font-weight:500; border-radius:48rpx;
  transition:background .2s;
  &:active { background: #eee; }
}
.btn-txt { font-size:27rpx; }
.btn-primary {
  flex:1; text-align:center; padding:24rpx 0;
  background: #fff;
  color: #1a1a1a; font-size:28rpx; font-weight:600; border-radius:50rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.08);
  border: 2rpx solid #e8e8e8;
  transition:all .25s;
  &.disabled { opacity:.45; pointer-events:none; }
  &:active { background:#f5f5f5; transform:scale(.98); }
}
.btn-hint { flex:1; text-align:center; }
.hint-txt { font-size:23rpx; color:#bbb; }

.bottom-spacer { height:80rpx; }
</style>