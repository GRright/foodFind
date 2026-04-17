const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    recipeId: null,
    recipe: {
      id: 1,
      name: '番茄炒蛋',
      image: '🍳',
      tags: ['家常菜', '快手菜'],
      cooking_time: 10,
      difficulty: '简单',
      cuisine_type: '家常菜',
      nutrition: { calories: 120, protein: 8, fat: 6, carbs: 5 },
      ingredients: [
        { name: '鸡蛋', amount: '2个' },
        { name: '番茄', amount: '2个' },
        { name: '葱花', amount: '适量' },
        { name: '盐', amount: '少许' },
        { name: '生抽', amount: '1勺' }
      ],
      steps: [
        '鸡蛋打散，加少许盐搅匀',
        '番茄洗净切块',
        '锅中热油，倒入蛋液炒散盛出',
        '锅中再加少许油，放入番茄翻炒出汁',
        '加入炒好的鸡蛋，加盐和生抽调味',
        '撒上葱花即可出锅'
      ]
    },
    relatedMovies: [],
    selectedRating: 0,
    feedbackText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recipeId: parseInt(options.id) });
    }
  },

  selectRating(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({ selectedRating: rating });
  },

  onFeedbackInput(e) {
    this.setData({ feedbackText: e.detail.value });
  },

  submitFeedback() {
    if (this.data.selectedRating === 0) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }

    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });
    
    this.setData({
      selectedRating: 0,
      feedbackText: ''
    });
  }
});
