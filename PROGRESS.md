# 吃点啥 - 项目进度文档

> 最后更新: 2026-04-19
> 版本: v1.6.5

---

## v1.6 (当前版本) - 2026-04-19

### 首页交互重构
- **点击进入详情页**: 点击菜品卡片直接进入菜谱详情页（做法、营养、食材）
- **上滑换菜**: 手指按住卡片上滑 > 60rpx，触发 3D 魔方翻转(cardFlipOut/FlipIn) + 6颗金色闪光粒子(sparkleFly)飞散特效 + 新卡片弹入(cardBounceIn)
- **下滑删除**: 手指按住卡片下滑 < -50rpx，弹出居中确认弹窗，确认后从今日菜单移除
- **视觉反馈**: 滑动时卡片 3D X轴旋转 + 透明度渐变，顶部出现「✨ 换一道」或底部「✕ 删除」提示标签
- **移除旧交互**: 删除 action-bubble 弹出按钮(喜欢/删除/换一个)和 tap-mask 遮罩

### 详情页收藏功能
- **收藏按钮**: 详情页右上角毛玻璃胶囊按钮，未收藏显示 `♡ 收藏`(半透明白底)，已收藏显示 `♥ 已收藏`(白色半透明)
- **心跳动画**: 点击收藏时触发 heartBeat 动画(scale 1→1.35→0.95→1)
- **本地存储**: 使用 `foodfind_favorites` 本地缓存，包含 id/name/image/cuisine_type/type/nutrition/favoritedAt
- **评分星星**: 已选星星颜色从黄色(#FFB800)改为绿色(#07c160)

### 我的页面 - 我的收藏
- **入口**: ♥ 图标橙色卡片，显示 "已收藏 N 道菜" 或 "收藏喜欢的菜品"
- **底部弹窗**: 列表展示每道菜(emoji、名称、菜系标签、热量)
- **交互**: 点击进详情页，右侧 ✕ 按钮移除收藏(带 toast 提示)
- **空状态**: 💚 图标 + "还没有收藏菜品" + 引导文案

### 颜色系统统一
- **原则**: 整个应用只使用 绿色 + 白色 + 灰色 三种色系
- **移除的颜色**: 紫色(#667eea/#764ba2)、橙色(#cc5500/#ee8833)、红色(#ff4757)、黄色(#FFB800)
- **我的页面**: 统计卡片/火花背景改为绿色系，统计数字用绿色，进度条双方都用绿色系，收藏标题用绿色，删除按钮用灰色
- **详情页**: Hero 背景改为绿色渐变，收藏按钮已收藏态改为白色半透明，评分星星改为绿色

### 纯文字菜单项
- 「我的」分组下的菜单项(偏好设置/清除缓存/关于我们)移除 emoji 图标，改为纯文字布局
- 搭子分组保留图标(添加搭子/报告等)

### Bug 修复
- `getCardClass is not a function`: computed 不能带参数，将 getCardClass/getCardStyle/swipeOpacity 移到 methods
- `ALL_RECIPES.find is not a function`: ALL_RECIPES 是对象不是数组，loadMyWeeklyMeals 中先展开合并
- 两个 modal mask 透明状态拦截点击事件: 添加 pointer-events: none/auto
- 云函数被配置忽略打包: 设置 ignoreDevUnusedFiles=false, 添加 cloudfunctionRoot
- 云函数同步脚本自动修复 project.config.json 配置

### 构建系统
- `sync-cloudfunctions.js` 新增 fixProjectConfig() 函数，每次构建后自动修复配置文件
- 构建命令: `npm run build:mp-weixin` → 编译 → 同步云函数 → 修复配置

### 手势引导
- 首页首次加载自动弹出引导弹窗，分步展示三个核心手势操作
- 三阶段引导：上滑换菜 → 下滑删除 → 点击查看详情
- 每步有明确的箭头图标、操作说明和结果提示
- 「我试试」按钮逐步推进，可随时「跳过引导」
- 本地存储 `foodfind_gesture_guide` 标记，仅首次展示一次
- 引导弹窗带 0.65 透明度遮罩 + 弹性缩放入场动画

---

## v1.5.2 - TabBar 动画统一
- index.vue/menu.vue/profile.vue 三个 TabBar 页面统一添加 pageEnter 入场动画
- 底部切换时每个页面都有 slide-up + fade-in 效果

## v1.5.1 - Bug 修复 + 报告弹窗美化
- 检查-in 不需要搭子也能标记(个人模式)
- 我的页面点击失效修复(showReportModal 命名冲突)
- 互动报告弹窗完全重写(紫色渐变Hero → 绿色, 4宫格营养卡片, 真实营养计算, 双人对比)

## v1.5 - 互动打卡系统
- recordCheckIn / getPairStats / getDailyStatus 三个新云函数
- 火花系统: 0=无活动, 1=单方完成, 2+=双方完成
- 连续天数追踪, 周历火花标记
- 每日三餐打卡标记

## v1.4 - 云端配对系统
- createPairInvite / acceptPairInvite / getPairInfo 云函数
- 配对邀请/接受流程
- pair_stats 数据表

## v1.3 - 分享菜单功能
- saveShareMenu / getShareMenu / updateShareStatus 云函数
- 分享菜单到搭子
- 双向确认机制

## v1.2 - 云端数据库
- recipes / share_menus / pairs / daily_checkins / pair_stats 数据表

## v1.1 - 基础功能
- 首页三餐推荐(早餐/午餐/晚餐)
- 菜谱详情(做法/营养/食材)
- 本地缓存菜单生成

## v1.0 - 项目初始化
- UniApp 3.0 + Vue 3 Options API
- 微信小程序(mp-weixin)编译目标
- 7个页面: index/menu/profile/onboarding/invite/share/recipe-detail
