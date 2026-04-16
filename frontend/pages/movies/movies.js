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
    movies: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadMovies();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreMovies();
    }
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type,
      page: 1,
      movies: [],
      hasMore: true
    });
    this.loadMovies();
  },

  loadMovies() {
    this.setData({ loading: true });
    
    const params = {
      page: this.data.page,
      limit: 10
    };
    
    if (this.data.currentType) {
      params.type = this.data.currentType;
    }
    
    api.getMovies(params)
      .then(res => {
        this.setData({
          movies: res.movies || [],
          loading: false,
          hasMore: (res.movies || []).length >= 10
        });
      })
      .catch(err => {
        console.error('Load movies failed:', err);
        this.setData({ loading: false });
      });
  },

  loadMoreMovies() {
    this.setData({ loading: true });
    
    const params = {
      page: this.data.page + 1,
      limit: 10
    };
    
    if (this.data.currentType) {
      params.type = this.data.currentType;
    }
    
    api.getMovies(params)
      .then(res => {
        const newMovies = res.movies || [];
        this.setData({
          movies: [...this.data.movies, ...newMovies],
          page: this.data.page + 1,
          loading: false,
          hasMore: newMovies.length >= 10
        });
      })
      .catch(err => {
        console.error('Load more movies failed:', err);
        this.setData({ loading: false });
      });
  },

  viewMovie(e) {
    const id = e.currentTarget.dataset.id;
    const movie = this.data.movies.find(m => m.id === id);
    
    if (movie && movie.platform_url) {
      wx.showModal({
        title: '跳转提示',
        content: `即将跳转到${movie.platform}观看`,
        success: (res) => {
          if (res.confirm) {
            wx.showToast({
              title: '正在跳转...',
              icon: 'none'
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: '暂无观看链接',
        icon: 'none'
      });
    }
  }
})
