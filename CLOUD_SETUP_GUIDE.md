# 微信小程序云开发部署指南

## 📁 当前项目结构

```
foodFind/
├── cloudfunctions/          # 🔥 云函数目录
│   ├── login/
│   │   ├── index.js
│   │   └── package.json
│   ├── getOnboardingQuestions/
│   ├── saveOnboardingAnswers/
│   ├── checkOnboardingStatus/
│   ├── getRecipes/
│   └── getMovies/
│
├── miniprogram/             # 🌟 小程序前端代码
│   ├── pages/
│   ├── utils/
│   ├── app.js
│   ├── app.json
│   └── app.wxss
│
└── project.config.json       # 项目配置文件
```

## 🚀 部署步骤

### 第一步：开通云开发环境

1. 打开微信开发者工具
2. 打开项目：`c:\myProject\foodFind`
3. 点击顶部菜单 **云开发**
4. 点击 **开通**，按照提示创建云开发环境
5. 记录你的 **环境 ID**（类似：`cloud1-xxx`）

### 第二步：配置环境 ID

修改 `miniprogram/app.js` 第 14 行：

```javascript
wx.cloud.init({
  env: '你的环境ID',  // 替换为你的云环境 ID
  traceUser: true
});
```

### 第三步：创建云数据库集合

在云开发控制台 → **数据库** 中，创建以下集合：

1. `users` - 用户信息
2. `recipes` - 菜谱数据
3. `movies` - 电影数据
4. `onboarding_answers` - 引导页答案

### 第四步：上传并部署云函数

1. 在微信开发者工具中，右键点击 `cloudfunctions` 文件夹
2. 选择 **当前环境** → 选择你刚创建的环境
3. 右键点击每个云函数文件夹（如 `login`）
4. 选择 **上传并部署：云端安装依赖**
5. 等待部署完成（每个云函数都要部署）

需要部署的云函数：
- ✅ login
- ✅ getOnboardingQuestions
- ✅ saveOnboardingAnswers
- ✅ checkOnboardingStatus
- ✅ getRecipes
- ✅ getMovies

### 第五步：编译运行

1. 点击微信开发者工具的 **编译** 按钮
2. 小程序应该可以正常运行了！

## 📝 注意事项

1. **云函数部署**：每次修改云函数代码后，都需要重新上传部署
2. **数据库权限**：确保数据库集合的权限设置为"所有用户可读，仅创建者可写"
3. **环境 ID**：确保 `app.js` 中的环境 ID 正确
4. **旧代码**：`backend` 和 `frontend` 文件夹可以删除（已保留作为参考）

## 🎯 下一步

部署完成后，你可以：
- 在云数据库中添加示例菜谱和电影数据
- 继续开发更多云函数
- 完善小程序功能

祝开发顺利！🎉
