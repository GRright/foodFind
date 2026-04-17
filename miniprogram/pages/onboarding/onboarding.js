Page({
  data: {
    questions: [
      { 
        id: 1, 
        question: '你属于哪类人群？', 
        type: 'single_choice', 
        options: [
          { label: '成人', value: 'adult' },
          { label: '儿童', value: 'child' },
          { label: '老年人', value: 'elderly' },
          { label: '孕妇', value: 'pregnant' },
          { label: '健身人群', value: 'fitness' },
          { label: '高血脂/高血压', value: 'health_care' }
        ]
      },
      { 
        id: 2, 
        question: '你喜欢什么口味？', 
        type: 'multi_choice', 
        options: [
          { label: '清淡', value: 'light' },
          { label: '麻辣', value: 'spicy' },
          { label: '酸甜', value: 'sweet_sour' },
          { label: '咸鲜', value: 'salty' },
          { label: '香辣', value: 'hot' },
          { label: '原味', value: 'original' }
        ]
      },
      { 
        id: 3, 
        question: '你倾向于哪个菜系？', 
        type: 'multi_choice', 
        options: [
          { label: '川菜（偏辣）', value: 'sichuan' },
          { label: '粤菜（偏清淡）', value: 'cantonese' },
          { label: '鲁菜', value: 'shandong' },
          { label: '苏菜', value: 'jiangsu' },
          { label: '浙菜', value: 'zhejiang' },
          { label: '闽菜', value: 'fujian' },
          { label: '湘菜', value: 'hunan' },
          { label: '徽菜', value: 'anhui' },
          { label: '西餐', value: 'western' },
          { label: '日料', value: 'japanese' }
        ]
      },
      { 
        id: 4, 
        question: '每餐大概吃几个菜？', 
        type: 'single_choice', 
        options: [
          { label: '1-2个菜', value: '1-2' },
          { label: '3-4个菜', value: '3-4' },
          { label: '5-6个菜', value: '5-6' },
          { label: '7个菜以上', value: '7+' }
        ]
      },
      { 
        id: 5, 
        question: '每日目标卡路里是多少？', 
        type: 'single_choice', 
        options: [
          { label: '1200-1500 kcal（减脂）', value: '1200-1500' },
          { label: '1500-1800 kcal（女性）', value: '1500-1800' },
          { label: '1800-2200 kcal（男性）', value: '1800-2200' },
          { label: '2200-2800 kcal（健身）', value: '2200-2800' },
          { label: '2800 kcal以上', value: '2800+' },
          { label: '不限制', value: 'unlimited' }
        ]
      },
      { 
        id: 6, 
        question: '有什么饮食禁忌吗？（可多选）', 
        type: 'multi_choice', 
        options: [
          { label: '不吃猪肉', value: 'no_pork' },
          { label: '不吃牛肉', value: 'no_beef' },
          { label: '不吃羊肉', value: 'no_lamb' },
          { label: '不吃海鲜', value: 'no_seafood' },
          { label: '不吃香菜', value: 'no_coriander' },
          { label: '不吃葱姜蒜', value: 'no_allium' },
          { label: '不吃辣', value: 'no_spicy' },
          { label: '不吃甜食', value: 'no_sweet' },
          { label: '素食主义', value: 'vegetarian' },
          { label: '无禁忌', value: 'none' }
        ]
      }
    ],
    currentStep: 0,
    totalSteps: 6,
    currentQuestion: null,
    selectedAnswer: '',
    selectedAnswers: [],
    answers: [],
    progress: 0,
    canProceed: false
  },

  onLoad() {
    this.setData({
      currentQuestion: this.data.questions[0],
      progress: Math.round((1 / this.data.totalSteps) * 100)
    });
  },

  checkCanProceed() {
    const canProceed = this.data.currentQuestion 
      ? (this.data.currentQuestion.type === 'single_choice' 
          ? !!this.data.selectedAnswer 
          : this.data.selectedAnswers.length > 0)
      : false;
    this.setData({ canProceed });
  },

  selectSingleOption(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ selectedAnswer: value });
    this.checkCanProceed();
  },

  toggleMultiOption(e) {
    const value = e.currentTarget.dataset.value;
    let selectedAnswers = [...this.data.selectedAnswers];
    
    if (value === 'none') {
      selectedAnswers = selectedAnswers.length === 1 && selectedAnswers[0] === 'none' ? [] : ['none'];
    } else {
      selectedAnswers = selectedAnswers.filter(a => a !== 'none');
      const index = selectedAnswers.indexOf(value);
      index > -1 ? selectedAnswers.splice(index, 1) : selectedAnswers.push(value);
    }
    
    this.setData({ selectedAnswers });
    this.checkCanProceed();
  },

  saveCurrentAnswer() {
    const question = this.data.currentQuestion;
    const answer = question.type === 'single_choice' 
      ? this.data.selectedAnswer 
      : [...this.data.selectedAnswers];
    
    const answers = [...this.data.answers];
    answers[this.data.currentStep] = { question_id: question.id, value: answer };
    this.setData({ answers });
  },

  nextStep() {
    if (!this.data.canProceed) return;
    this.saveCurrentAnswer();
    
    const nextStep = this.data.currentStep + 1;
    if (nextStep < this.data.totalSteps) {
      const nextQuestion = this.data.questions[nextStep];
      this.setData({
        currentStep: nextStep,
        currentQuestion: nextQuestion,
        selectedAnswer: '',
        selectedAnswers: [],
        canProceed: false,
        progress: Math.round(((nextStep + 1) / this.data.totalSteps) * 100)
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
        progress: Math.round(((prevStep + 1) / this.data.totalSteps) * 100)
      }, () => {
        this.checkCanProceed();
      });
    }
  },

  handleNext() {
    if (!this.data.canProceed) return;
    if (this.data.currentStep === this.data.totalSteps - 1) {
      this.submit();
    } else {
      this.nextStep();
    }
  },

  submit() {
    this.saveCurrentAnswer();
    
    wx.showLoading({ title: '保存中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '设置完成',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    }, 800);
  }
});
