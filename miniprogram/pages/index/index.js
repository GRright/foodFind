const app = getApp();

Page({
  data: {
    userInfo: {},
    greeting: '',
    currentDate: '',
    userCount: 2,
    userCountOptions: [1, 2, 3, 4, 5, 6],
    showCountPicker: false,
    allRecipes: {
      breakfast: [
        { id: 1, name: '白粥配小菜', image: '🥣', calories: 150, cuisine_type: '家常菜', type: 'vegetarian', cooking_time: 20, difficulty: '简单', tags: ['早餐', '养胃', '清淡'], nutrition: { calories: 150, protein: 5, fat: 3, carbs: 28 }, ingredients: [{ name: '大米', amount: '50g' }, { name: '萝卜干', amount: '20g' }], steps: ['大米洗净加水煮粥', '萝卜干切碎备用', '粥煮好后配萝卜干食用'] },
        { id: 2, name: '豆浆油条', image: '🥖', calories: 380, cuisine_type: '传统早餐', type: 'mixed', cooking_time: 15, difficulty: '简单', tags: ['早餐', '经典', '饱腹'], nutrition: { calories: 380, protein: 12, fat: 18, carbs: 42 }, ingredients: [{ name: '黄豆', amount: '30g' }, { name: '油条', amount: '2根' }], steps: ['黄豆泡发后打豆浆', '油条加热', '配豆浆食用'] },
        { id: 3, name: '包子', image: '🥟', calories: 280, cuisine_type: '面食', type: 'mixed', cooking_time: 30, difficulty: '中等', tags: ['早餐', '面食', '咸香'], nutrition: { calories: 280, protein: 15, fat: 10, carbs: 35 }, ingredients: [{ name: '面粉', amount: '100g' }, { name: '猪肉馅', amount: '50g' }], steps: ['面粉加水揉成面团', '猪肉馅调味', '包成包子后蒸熟'] },
        { id: 4, name: '鸡蛋灌饼', image: '🌯', calories: 320, cuisine_type: '面食', type: 'mixed', cooking_time: 10, difficulty: '简单', tags: ['早餐', '快手', '美味'], nutrition: { calories: 320, protein: 14, fat: 16, carbs: 32 }, ingredients: [{ name: '饼皮', amount: '1张' }, { name: '鸡蛋', amount: '1个' }], steps: ['饼皮加热', '打鸡蛋灌进去', '卷起即可食用'] },
        { id: 5, name: '皮蛋瘦肉粥', image: '🍚', calories: 220, cuisine_type: '粤菜', type: 'mixed', cooking_time: 40, difficulty: '中等', tags: ['早餐', '养胃', '咸香'], nutrition: { calories: 220, protein: 18, fat: 6, carbs: 25 }, ingredients: [{ name: '大米', amount: '50g' }, { name: '皮蛋', amount: '1个' }, { name: '瘦肉', amount: '30g' }], steps: ['大米煮成粥', '瘦肉切丝', '皮蛋切碎', '一起放入粥中煮熟调味'] }
      ],
      lunch: [
        { id: 6, name: '番茄炒蛋', image: '🍳', calories: 180, cuisine_type: '家常菜', type: 'mixed', cooking_time: 15, difficulty: '简单', tags: ['快手', '下饭', '酸甜'], nutrition: { calories: 180, protein: 12, fat: 12, carbs: 8 }, ingredients: [{ name: '番茄', amount: '2个' }, { name: '鸡蛋', amount: '3个' }], steps: ['番茄切块', '鸡蛋打散炒熟', '放入番茄一起炒', '加盐调味即可'] },
        { id: 7, name: '宫保鸡丁', image: '🍗', calories: 350, cuisine_type: '川菜', type: 'meat', cooking_time: 25, difficulty: '中等', tags: ['辣', '下饭', '经典'], nutrition: { calories: 350, protein: 28, fat: 20, carbs: 15 }, ingredients: [{ name: '鸡胸肉', amount: '200g' }, { name: '花生米', amount: '30g' }, { name: '干辣椒', amount: '5个' }], steps: ['鸡胸肉切丁腌制', '干辣椒爆香', '放入鸡丁翻炒', '加入花生米和调味汁'] },
        { id: 8, name: '红烧肉', image: '🍖', calories: 520, cuisine_type: '家常菜', type: 'meat', cooking_time: 60, difficulty: '中等', tags: ['下饭', '咸香', '经典'], nutrition: { calories: 520, protein: 25, fat: 42, carbs: 8 }, ingredients: [{ name: '五花肉', amount: '300g' }, { name: '冰糖', amount: '30g' }, { name: '生抽', amount: '2勺' }], steps: ['五花肉切块焯水', '冰糖炒糖色', '放入五花肉翻炒上色', '加水炖煮1小时'] },
        { id: 9, name: '清蒸鲈鱼', image: '🐟', calories: 200, cuisine_type: '粤菜', type: 'meat', cooking_time: 20, difficulty: '简单', tags: ['清淡', '健康', '鲜嫩'], nutrition: { calories: 200, protein: 35, fat: 6, carbs: 2 }, ingredients: [{ name: '鲈鱼', amount: '1条' }, { name: '葱丝', amount: '适量' }, { name: '蒸鱼豉油', amount: '2勺' }], steps: ['鲈鱼处理干净', '放上葱丝姜丝', '蒸8分钟', '倒掉水加蒸鱼豉油，淋热油'] },
        { id: 10, name: '麻婆豆腐', image: '🥘', calories: 280, cuisine_type: '川菜', type: 'mixed', cooking_time: 15, difficulty: '简单', tags: ['辣', '下饭', '豆腐'], nutrition: { calories: 280, protein: 18, fat: 20, carbs: 10 }, ingredients: [{ name: '嫩豆腐', amount: '1块' }, { name: '肉末', amount: '50g' }, { name: '豆瓣酱', amount: '1勺' }], steps: ['豆腐切块焯水', '肉末炒散', '加豆瓣酱炒出红油', '放入豆腐煮3分钟'] },
        { id: 11, name: '糖醋排骨', image: '🍖', calories: 450, cuisine_type: '家常菜', type: 'meat', cooking_time: 45, difficulty: '中等', tags: ['酸甜', '下饭', '经典'], nutrition: { calories: 450, protein: 28, fat: 28, carbs: 25 }, ingredients: [{ name: '排骨', amount: '300g' }, { name: '醋', amount: '2勺' }, { name: '糖', amount: '3勺' }], steps: ['排骨焯水', '糖醋汁调好', '排骨煎至金黄', '倒入糖醋汁收干'] },
        { id: 12, name: '蒜蓉西兰花', image: '🥦', calories: 120, cuisine_type: '家常菜', type: 'vegetarian', cooking_time: 10, difficulty: '简单', tags: ['清淡', '健康', '快手'], nutrition: { calories: 120, protein: 8, fat: 6, carbs: 10 }, ingredients: [{ name: '西兰花', amount: '200g' }, { name: '蒜末', amount: '适量' }], steps: ['西兰花切小朵焯水', '蒜末爆香', '放入西兰花快炒', '加盐调味'] },
        { id: 13, name: '鱼香肉丝', image: '🥩', calories: 320, cuisine_type: '川菜', type: 'meat', cooking_time: 20, difficulty: '中等', tags: ['下饭', '酸甜', '经典'], nutrition: { calories: 320, protein: 25, fat: 18, carbs: 16 }, ingredients: [{ name: '猪肉丝', amount: '150g' }, { name: '木耳', amount: '30g' }, { name: '胡萝卜', amount: '50g' }], steps: ['肉丝腌制', '木耳胡萝卜切丝', '鱼香汁调好', '一起快炒'] }
      ],
      dinner: [
        { id: 14, name: '红烧茄子', image: '🍆', calories: 220, cuisine_type: '家常菜', type: 'vegetarian', cooking_time: 25, difficulty: '简单', tags: ['下饭', '咸香', '素食'], nutrition: { calories: 220, protein: 4, fat: 15, carbs: 18 }, ingredients: [{ name: '茄子', amount: '2个' }, { name: '蒜末', amount: '适量' }], steps: ['茄子切块', '油煎至软', '加蒜末和调味', '煮3分钟即可'] },
        { id: 15, name: '干煸四季豆', image: '🫛', calories: 250, cuisine_type: '川菜', type: 'vegetarian', cooking_time: 20, difficulty: '中等', tags: ['辣', '下饭', '干香'], nutrition: { calories: 250, protein: 8, fat: 18, carbs: 15 }, ingredients: [{ name: '四季豆', amount: '200g' }, { name: '干辣椒', amount: '5个' }, { name: '肉末', amount: '30g' }], steps: ['四季豆去筋', '油炸至起泡', '干辣椒爆香', '放入肉末和四季豆一起炒'] },
        { id: 16, name: '可乐鸡翅', image: '🍗', calories: 380, cuisine_type: '家常菜', type: 'meat', cooking_time: 30, difficulty: '简单', tags: ['甜香', '下饭', '快手'], nutrition: { calories: 380, protein: 28, fat: 22, carbs: 18 }, ingredients: [{ name: '鸡翅', amount: '8个' }, { name: '可乐', amount: '1罐' }, { name: '生抽', amount: '2勺' }], steps: ['鸡翅焯水', '煎至两面金黄', '倒入可乐和生抽', '煮至收干'] },
        { id: 17, name: '蒜蓉炒生菜', image: '🥬', calories: 80, cuisine_type: '家常菜', type: 'vegetarian', cooking_time: 5, difficulty: '简单', tags: ['清淡', '健康', '快手'], nutrition: { calories: 80, protein: 3, fat: 5, carbs: 6 }, ingredients: [{ name: '生菜', amount: '200g' }, { name: '蒜末', amount: '适量' }], steps: ['生菜洗净', '蒜末爆香', '放入生菜快炒', '加盐调味'] },
        { id: 18, name: '回锅肉', image: '🥓', calories: 480, cuisine_type: '川菜', type: 'meat', cooking_time: 25, difficulty: '中等', tags: ['辣', '下饭', '经典'], nutrition: { calories: 480, protein: 22, fat: 40, carbs: 8 }, ingredients: [{ name: '五花肉', amount: '200g' }, { name: '青蒜', amount: '2根' }, { name: '豆瓣酱', amount: '1勺' }], steps: ['五花肉煮熟切片', '煎至微卷', '豆瓣酱炒香', '放入青蒜和肉片一起炒'] },
        { id: 19, name: '清炒时蔬', image: '🥗', calories: 100, cuisine_type: '家常菜', type: 'vegetarian', cooking_time: 8, difficulty: '简单', tags: ['清淡', '健康', '时蔬'], nutrition: { calories: 100, protein: 5, fat: 6, carbs: 8 }, ingredients: [{ name: '时令蔬菜', amount: '200g' }, { name: '蒜末', amount: '适量' }], steps: ['蔬菜洗净切好', '蒜末爆香', '放入蔬菜快炒', '加盐调味'] },
        { id: 20, name: '啤酒鸭', image: '🦆', calories: 420, cuisine_type: '家常菜', type: 'meat', cooking_time: 50, difficulty: '中等', tags: ['酒香', '下饭', '浓郁'], nutrition: { calories: 420, protein: 32, fat: 28, carbs: 10 }, ingredients: [{ name: '鸭肉', amount: '300g' }, { name: '啤酒', amount: '1罐' }, { name: '姜片', amount: '适量' }], steps: ['鸭肉切块焯水', '姜片爆香', '放入鸭肉翻炒', '倒入啤酒炖煮'] }
      ]
    },
    dailyMeals: {
      breakfast: { title: '早餐', icon: '🌅', recipes: [] },
      lunch: { title: '午餐', icon: '☀️', recipes: [] },
      dinner: { title: '晚餐', icon: '🌙', recipes: [] }
    },
    showOnboardingModal: false
  },

  onLoad() {
    this.updateGreeting();
    this.setData({
      userInfo: app.globalData.userInfo || {},
      currentDate: this.formatDate(new Date())
    });
    this.generateDailyRecipes();
    this.checkAndShowOnboarding();
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
    this.updateGreeting();
  },

  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  formatDate(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  },

  getRecipeCount() {
    const count = this.data.userCount;
    if (count === 1) return 2;
    if (count === 2) return 3;
    if (count <= 4) return 4;
    return 5;
  },

  generateDailyRecipes() {
    const recipeCount = this.getRecipeCount();
    
    if (app.globalData && app.globalData.dailyMeals) {
      const savedMeals = app.globalData.dailyMeals;
      this.setData({
        dailyMeals: {
          breakfast: { title: '早餐', icon: '🌅', recipes: savedMeals.breakfast || [] },
          lunch: { title: '午餐', icon: '☀️', recipes: savedMeals.lunch || [] },
          dinner: { title: '晚餐', icon: '🌙', recipes: savedMeals.dinner || [] }
        }
      });
    } else {
      const dailyMeals = {
        breakfast: {
          title: '早餐',
          icon: '🌅',
          recipes: this.getRandomRecipes(this.data.allRecipes.breakfast, recipeCount)
        },
        lunch: {
          title: '午餐',
          icon: '☀️',
          recipes: this.getBalancedRecipes(this.data.allRecipes.lunch, recipeCount)
        },
        dinner: {
          title: '晚餐',
          icon: '🌙',
          recipes: this.getBalancedRecipes(this.data.allRecipes.dinner, recipeCount)
        }
      };
      
      this.setData({ dailyMeals });
    }
  },

  getRandomRecipes(recipes, count) {
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getBalancedRecipes(recipes, count) {
    const meatRecipes = recipes.filter(r => r.type === 'meat' || r.type === 'mixed');
    const vegRecipes = recipes.filter(r => r.type === 'vegetarian');
    
    const meatCount = Math.ceil(count / 2);
    const vegCount = count - meatCount;
    
    const selectedMeat = this.getRandomRecipes(meatRecipes, Math.min(meatCount, meatRecipes.length));
    const selectedVeg = this.getRandomRecipes(vegRecipes, Math.min(vegCount, vegRecipes.length));
    
    const result = [...selectedMeat, ...selectedVeg];
    
    if (result.length < count) {
      const remaining = count - result.length;
      const allRecipes = [...recipes].filter(r => !result.find(s => s.id === r.id));
      result.push(...this.getRandomRecipes(allRecipes, remaining));
    }
    
    return result.sort(() => Math.random() - 0.5);
  },

  onUserCountChange(e) {
    this.setData({ userCount: this.data.userCountOptions[e.detail.value] });
    this.generateDailyRecipes();
  },

  checkAndShowOnboarding() {
    // 暂时移除云函数调用
  },

  viewMealRecipe(e) {
    const recipe = e.currentTarget.dataset.recipe;
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}` });
  },

  goToMenu() { wx.switchTab({ url: '/pages/menu/menu' }); },
  goToMovies() { wx.switchTab({ url: '/pages/movies/movies' }); },
  goToProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
  
  openOnboarding() { 
    this.setData({ showOnboardingModal: false });
    wx.navigateTo({ url: '/pages/onboarding/onboarding' }); 
  },
  closeOnboardingModal() { this.setData({ showOnboardingModal: false }); },
  stopPropagation() {},
  showCountPicker() { this.setData({ showCountPicker: true }); },
  hideCountPicker() { this.setData({ showCountPicker: false }); },
  selectCount(e) {
    const count = e.currentTarget.dataset.count;
    this.setData({ userCount: count });
    this.generateDailyRecipes();
  }
});
