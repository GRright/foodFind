const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    questions: [],
    currentStep: 0,
    totalSteps: 0,
    currentQuestion: null,
    selectedAnswer: '',
    selectedAnswers: [],
    answers: [],
    progress: 0
  },

  onLoad() {
    this.loadQuestions();
  },

  async loadQuestions() {
    try {
      const res = await api.getOnboardingQuestions();
      this.setData({
        questions: res.questions,
        totalSteps: res.questions.length,
        currentQuestion: res.questions[0],
        progress: (1 / res.questions.length) * 100
      });
    } catch (error) {
      console.error('Load questions failed:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  selectSingleOption(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      selectedAnswer: value
    });
  },

  toggleMultiOption(e) {
    const value = e.currentTarget.dataset.value;
    let selectedAnswers = [...this.data.selectedAnswers];
    const index = selectedAnswers.indexOf(value);
    
    if (index > -1) {
      selectedAnswers.splice(index, 1);
    } else {
      selectedAnswers.push(value);
    }
    
    this.setData({ selectedAnswers });
  },

  get canProceed() {
    if (!this.data.currentQuestion) return false;
    
    if (this.data.currentQuestion.type === 'single_choice') {
      return !!this.data.selectedAnswer;
    } else {
      return this.data.selectedAnswers.length > 0;
    }
  },

  saveCurrentAnswer() {
    const question = this.data.currentQuestion;
    let answer;
    
    if (question.type === 'single_choice') {
      answer = this.data.selectedAnswer;
    } else {
      answer = [...this.data.selectedAnswers];
    }
    
    const answers = [...this.data.answers];
    answers[this.data.currentStep] = {
      question_id: question.id,
      value: answer
    };
    
    this.setData({ answers });
  },

  nextStep() {
    if (!this.canProceed) return;
    
    this.saveCurrentAnswer();
    
    const nextStep = this.data.currentStep + 1;
    if (nextStep < this.data.totalSteps) {
      const nextQuestion = this.data.questions[nextStep];
      this.setData({
        currentStep: nextStep,
        currentQuestion: nextQuestion,
        selectedAnswer: '',
        selectedAnswers: [],
        progress: ((nextStep + 1) / this.data.totalSteps) * 100
      });
    }
  },

  prevStep() {
    if (this.data.currentStep > 0) {
      const prevStep = this.data.currentStep - 1;
      const prevQuestion = this.data.questions[prevStep];
      const prevAnswer = this.data.answers[prevStep];
      
      let selectedAnswer = '';
      let selectedAnswers = [];
      
      if (prevQuestion.type === 'single_choice') {
        selectedAnswer = prevAnswer ? prevAnswer.value : '';
      } else {
        selectedAnswers = prevAnswer ? prevAnswer.value : [];
      }
      
      this.setData({
        currentStep: prevStep,
        currentQuestion: prevQuestion,
        selectedAnswer,
        selectedAnswers,
        progress: ((prevStep + 1) / this.data.totalSteps) * 100
      });
    }
  },

  async submit() {
    if (!this.canProceed) return;
    
    this.saveCurrentAnswer();
    
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });
    
    try {
      await api.saveOnboardingAnswers({
        user_id: userId,
        answers: this.data.answers
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '设置完成',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('Submit answers failed:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
})
