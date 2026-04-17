const api = require('../../utils/api.js');

Page({
  data: {
    movieTypes: [
      { label: '全部', value: '' },
      { label: '电影', value: '电影' },
      { label: '短剧', value: '短剧' },
      { label: '纪录片', value: '纪录片' },
      { label: '综艺', value: '综艺' }
    ],
    currentType: '',
    movies: [
      { id: 1, title: '阿甘正传', genre: '剧情', year: 1994, rating: 9.5, platform: '腾讯视频', icon: '🎬' },
      { id: 2, title: '肖申克的救赎', genre: '剧情', year: 1994, rating: 9.7, platform: '爱奇艺', icon: '🎥' },
      { id: 3, title: '盗梦空间', genre: '科幻', year: 2010, rating: 9.3, platform: '优酷', icon: '🍿' },
      { id: 4, title: '人生一串', genre: '纪录片', year: 2018, rating: 9.0, platform: '哔哩哔哩', icon: '📺' },
      { id: 5, title: '风味人间', genre: '纪录片', year: 2018, rating: 9.1, platform: '腾讯视频', icon: '🎞️' }
    ],
    loading: false
  },

  onLoad() {
    this.loadMovies();
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentType: type });
  },

  loadMovies() {},

  viewMovie(e) {
    wx.showToast({
      title: '即将跳转到视频平台',
      icon: 'none'
    });
  }
});
