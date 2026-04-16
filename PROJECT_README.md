# 智慧三餐·悦享观影 - 项目进度文档

## 项目概述

本项目是一个集智能三餐管理与场景化观影推荐于一体的微信小程序，旨在解决用户"每日三餐决策难"与"用餐观影选择难"的双重痛点。

## 当前状态

✅ **V1.0版本完成 - 含完整增量升级**

## 技术栈

### 后端
- Node.js
- Express.js
- SQLite3 数据库
- dotenv（环境变量管理）

### 前端
- 微信小程序原生开发
- WXML / WXSS / JavaScript

## 项目结构

```
foodFind/
├── backend/                      # 后端服务
│   ├── config/
│   │   └── database.js          # 数据库配置
│   ├── controllers/              # 控制器层
│   │   ├── userController.js
│   │   ├── recipeController.js
│   │   ├── menuController.js
│   │   ├── movieController.js
│   │   └── feedbackController.js
│   ├── data/
│   │   └── sample-data.js       # 示例数据
│   ├── routes/                   # API路由
│   │   ├── users.js
│   │   ├── recipes.js
│   │   ├── menus.js
│   │   ├── movies.js
│   │   ├── feedback.js
│   │   ├── recommendations.js   # 新增：推荐API
│   │   └── onboarding.js        # 新增：引导问卷API
│   ├── services/                 # 新增：服务层
│   │   ├── recommendationEngine.js  # 推荐引擎核心
│   │   └── onboardingService.js    # 引导问卷服务
│   ├── .env.example             # 环境变量示例
│   ├── package.json
│   └── server.js                # 入口文件
├── frontend/                     # 微信小程序前端
│   ├── pages/
│   │   ├── index/               # 首页（增强版）
│   │   ├── menu/                # 菜单页
│   │   ├── recipe-detail/       # 食谱详情页
│   │   ├── movies/              # 影视页
│   │   ├── profile/             # 个人中心页
│   │   └── onboarding/          # 新增：引导问卷页
│   ├── utils/
│   │   └── api.js               # API工具（增强版）
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   └── sitemap.json
├── .gitignore                    # Git忽略文件
├── README.md                     # 基础说明文档
├── PROJECT_README.md             # 本文档：项目进度
└── INCREMENTAL_UPGRADE.md        # 增量升级说明
```

## 已完成功能

### V1.0 核心功能

1. ✅ **用户系统**
   - 用户登录/注册
   - 用户信息管理
   - 偏好设置

2. ✅ **食谱管理**
   - 食谱浏览
   - 食谱详情
   - 食谱搜索
   - 营养信息展示

3. ✅ **菜单管理**
   - 周菜单生成
   - 菜单查看
   - 菜品替换
   - 外出用餐标记

4. ✅ **影视推荐**
   - 影视列表
   - 按菜品推荐
   - 按餐段推荐

5. ✅ **反馈系统**
   - 评价提交
   - 反馈查看

### 增量升级功能

1. ✅ **用户画像动态更新**
   - 实时行为追踪
   - 加权平均画像更新
   - 场景触发更新

2. ✅ **探索-利用推荐引擎**
   - 80%利用 + 20%探索策略
   - 动态探索比例调整
   - 个性化推荐API

3. ✅ **场景化推荐**
   - 天气感知（模拟）
   - 时间时段感知
   - 菜品属性扩展（暖食、可分享）

4. ✅ **用户反馈闭环**
   - "为什么推荐？"解释
   - 喜欢/不喜欢快速反馈
   - 不喜欢原因收集

5. ✅ **冷启动优化**
   - 5个问题的引导问卷
   - 单选/多选支持
   - 进度条显示
   - 自动新用户检测

## 数据库设计

### 核心表
- `users` - 用户表（扩展：is_new_user, onboarding_completed）
- `recipes` - 食谱表（扩展：is_warm_food, is_shareable）
- `menus` - 菜单表（扩展：recommendation_reason）
- `movies` - 影视表
- `feedback` - 反馈表（扩展：dislike_reason）
- `favorites` - 收藏表

### 增量表
- `user_behaviors` - 用户行为记录表
- `user_profiles` - 用户画像表
- `scenario_context` - 场景上下文表
- `onboarding_answers` - 引导问卷答案表

## API 接口概览

### 基础API
- `GET /api/health` - 健康检查
- `POST /api/users/login` - 用户登录
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息
- `GET /api/users/:id/preferences` - 获取偏好
- `PUT /api/users/:id/preferences` - 更新偏好
- `GET /api/recipes` - 获取食谱列表
- `GET /api/recipes/:id` - 获取食谱详情
- `GET /api/menus/:userId/week` - 获取周菜单
- `POST /api/menus/generate` - 生成菜单
- `PUT /api/menus/:id` - 更新菜单项
- `POST /api/menus/replace` - 替换菜品
- `GET /api/movies` - 获取影视列表
- `GET /api/movies/recommend/:recipeId` - 按食谱推荐
- `POST /api/feedback` - 提交反馈

### 增量API
- `GET /api/recommendations/:userId` - 获取个性化推荐
- `POST /api/recommendations/behavior` - 记录用户行为
- `GET /api/recommendations/profile/:userId` - 获取用户画像
- `GET /api/onboarding/questions` - 获取引导问卷
- `POST /api/onboarding/answers` - 提交问卷答案
- `GET /api/onboarding/status/:userId` - 检查引导状态

## 部署指南

### 1. 后端部署

#### 环境要求
- Node.js 16+
- npm 或 yarn

#### 安装步骤

```bash
# 克隆项目
git clone https://github.com/GRright/foodFind.git
cd foodFind/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，根据需要修改配置

# 启动服务
npm start
# 或开发模式
npm run dev
```

#### 环境变量配置

在 `backend/.env` 文件中配置：

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DB_PATH=./data/foodfind.db

# CORS - 生产环境配置具体域名
CORS_ORIGIN=https://your-domain.com
```

### 2. 前端部署

#### 微信开发者工具
1. 打开微信开发者工具
2. 导入项目，选择 `frontend` 目录
3. 配置小程序 AppID
4. 修改 `frontend/utils/api.js` 中的 `baseUrl` 为你的服务器地址
5. 上传代码并提交审核

#### 服务器配置
- 生产环境需要配置 HTTPS
- 在微信小程序后台配置服务器域名白名单
- 将 `baseUrl` 改为你的正式域名

## 服务器安全建议

1. **HTTPS 强制** - 生产环境必须使用 HTTPS
2. **CORS 配置** - 限制具体域名，不要使用 `*`
3. **环境变量** - 敏感信息通过环境变量配置
4. **数据库安全** - 定期备份数据库文件
5. **API 限流** - 建议添加请求频率限制
6. **输入验证** - 所有用户输入都需要验证
7. **日志记录** - 记录关键操作日志

## 待优化/未来功能

- [ ] 接入真实天气API
- [ ] 添加地理位置感知
- [ ] 实现用户社交功能
- [ ] 添加A/B测试框架
- [ ] 接入视频平台真实API
- [ ] 添加支付功能（增值服务）
- [ ] 实现消息推送
- [ ] 添加数据分析面板
- [ ] 接入图片存储服务
- [ ] 实现多语言支持

## 快速开始

### 本地开发

```bash
# 启动后端
cd backend
npm install
npm start

# 后端将在 http://localhost:3000 启动
```

然后使用微信开发者工具打开 `frontend` 目录即可！

## 项目文档

- [README.md](./README.md) - 基础使用说明
- [INCREMENTAL_UPGRADE.md](./INCREMENTAL_UPGRADE.md) - 增量升级详细说明

## 许可证

本项目使用 GNU AFFERO GENERAL PUBLIC LICENSE v3。

## 联系方式

如有问题或建议，欢迎提交 Issue！

---

**项目状态**: ✅ 开发完成，可部署
**最后更新**: 2026-04-17
