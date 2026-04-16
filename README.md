# 智慧三餐·悦享观影

一个集智能三餐管理与场景化观影推荐于一体的微信小程序项目。

## 项目简介

为用户解决"每日三餐决策难"与"用餐观影选择难"的双重痛点，提供智能化的饮食规划、精准营养分析、场景化影视推荐及便捷烹饪指导。

## 技术栈

### 后端
- Node.js
- Express.js
- SQLite3 数据库

### 前端
- 微信小程序原生开发
- WXML / WXSS / JavaScript

## 项目结构

```
foodFind/
├── backend/                 # 后端服务
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── data/               # 数据和示例数据
│   ├── routes/             # API路由
│   ├── package.json
│   └── server.js           # 入口文件
├── frontend/               # 微信小程序前端
│   ├── pages/              # 页面
│   ├── utils/              # 工具函数
│   ├── app.js
│   ├── app.json
│   └── app.wxss
└── README.md
```

## 快速开始

### 后端启动

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 启动服务
```bash
npm start
```

开发模式（自动重启）：
```bash
npm run dev
```

服务将在 `http://localhost:3000` 启动

### 前端启动

1. 使用微信开发者工具打开 `frontend` 目录
2. 配置小程序 AppID（测试可使用测试号）
3. 修改 `frontend/utils/api.js` 中的 `baseUrl` 为你的后端地址
4. 点击编译运行

## 核心功能

### 1. 智能三餐管理
- 多种周期菜单生成（单日、三天、一周等）
- 营养与热量管理
- 菜品详情与制作步骤
- 智能去重机制

### 2. 场景化观影推荐
- 用餐场景匹配
- 菜品文化关联
- 快捷追剧跳转

### 3. 用户个性化设置
- 饮食偏好配置
- 过敏原信息
- 影视类型偏好

## API 接口

### 用户相关
- `POST /api/users/login` - 用户登录/注册
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息
- `GET /api/users/:id/preferences` - 获取用户偏好
- `PUT /api/users/:id/preferences` - 更新用户偏好

### 食谱相关
- `GET /api/recipes` - 获取食谱列表
- `GET /api/recipes/:id` - 获取食谱详情
- `POST /api/recipes` - 创建食谱
- `PUT /api/recipes/:id` - 更新食谱
- `DELETE /api/recipes/:id` - 删除食谱
- `GET /api/recipes/search/query` - 搜索食谱

### 菜单相关
- `GET /api/menus/:userId` - 获取用户菜单
- `GET /api/menus/:userId/week` - 获取周菜单
- `POST /api/menus/generate` - 生成菜单
- `POST /api/menus/` - 创建菜单项
- `PUT /api/menus/:id` - 更新菜单项
- `DELETE /api/menus/:id` - 删除菜单项
- `POST /api/menus/replace` - 替换菜品

### 影视相关
- `GET /api/movies` - 获取影视列表
- `GET /api/movies/:id` - 获取影视详情
- `GET /api/movies/recommend/:recipeId` - 根据食谱推荐影视
- `GET /api/movies/recommend/meal/:mealType` - 根据餐段推荐影视
- `POST /api/movies` - 创建影视

### 反馈相关
- `POST /api/feedback` - 创建反馈
- `GET /api/feedback/:userId` - 获取用户反馈
- `GET /api/feedback/item/:type/:id` - 获取项目反馈

## 数据库

项目使用 SQLite3 数据库，首次运行时会自动创建数据库文件 `backend/data/foodfind.db` 并初始化表结构和示例数据。

## 开发说明

### 后端开发
- 修改代码后，使用 `npm run dev` 可实现自动重启
- API 基础路径为 `/api`

### 前端开发
- 使用微信开发者工具进行开发调试
- 页面文件位于 `frontend/pages/` 目录
- 工具函数位于 `frontend/utils/` 目录

## 注意事项

1. 小程序需要配置合法域名才能在真机上访问后端接口
2. 开发阶段可以在微信开发者工具中关闭"不校验合法域名"选项
3. 首次运行后端会自动创建数据库和示例数据

## 许可证

MIT License
