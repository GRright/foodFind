const app = getApp();

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.baseUrl + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

const api = {
  getRecipes: (params) => request('/recipes', 'GET', params),
  getRecipeById: (id) => request(`/recipes/${id}`),
  searchRecipes: (q) => request('/recipes/search/query', 'GET', { q }),
  
  getWeeklyMenu: (userId, weekStart) => request(`/menus/${userId}/week`, 'GET', { weekStart }),
  generateMenu: (data) => request('/menus/generate', 'POST', data),
  updateMenuItem: (id, data) => request(`/menus/${id}`, 'PUT', data),
  replaceRecipe: (data) => request('/menus/replace', 'POST', data),
  
  getMovies: (params) => request('/movies', 'GET', params),
  getMoviesByRecipe: (recipeId) => request(`/movies/recommend/${recipeId}`),
  getMoviesByMealType: (mealType) => request(`/movies/recommend/meal/${mealType}`),
  
  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, data) => request(`/users/${id}`, 'PUT', data),
  getPreferences: (id) => request(`/users/${id}/preferences`),
  updatePreferences: (id, data) => request(`/users/${id}/preferences`, 'PUT', data),
  
  createFeedback: (data) => request('/feedback', 'POST', data),
  getItemFeedback: (type, id) => request(`/feedback/item/${type}/${id}`),
  
  getRecommendations: (userId, params) => request(`/recommendations/${userId}`, 'GET', params),
  trackBehavior: (data) => request('/recommendations/behavior', 'POST', data),
  getUserProfile: (userId) => request(`/recommendations/profile/${userId}`),
  
  getOnboardingQuestions: () => request('/onboarding/questions'),
  saveOnboardingAnswers: (data) => request('/onboarding/answers', 'POST', data),
  getOnboardingStatus: (userId) => request(`/onboarding/status/${userId}`),
  getOnboardingAnswers: (userId) => request(`/onboarding/answers/${userId}`)
};

module.exports = api;
