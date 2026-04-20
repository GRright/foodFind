# 云函数超时问题 - 完整解决方案

## 问题原因
`Error: timeout` 通常由以下原因导致：
1. 数据库集合不存在
2. 云函数未正确部署
3. 数据库权限设置问题
4. 云函数初始化环境ID不匹配

## 解决步骤

### 步骤1：创建数据库集合

在微信开发者工具中：
1. 点击顶部工具栏的 **云开发** 按钮
2. 进入 **数据库** 页面
3. 点击 **添加集合**，创建以下6个新集合：
   - `notifications`
   - `comments`
   - `votes`
   - `foodDiaries`
   - `recommendations`
   - `challenges`

### 步骤2：设置数据库权限

对每个新创建的集合，设置权限：
1. 点击集合名称进入集合详情
2. 点击右上角 **权限设置**
3. 选择 **所有用户可读写**（或根据需要设置更严格的权限）

### 步骤3：验证云函数部署

在微信开发者工具中：
1. 打开 **云开发** → **云函数**
2. 检查以下13个新函数是否都已部署：
   - sendNotification
   - getNotifications
   - addComment
   - getComments
   - createVote
   - voteOption
   - getVoteResult
   - saveFoodDiary
   - getFoodDiary
   - recommendRecipe
   - getRecommendations
   - createChallenge
   - getChallengeResult

3. 如果某个函数显示"未部署"，右键该函数选择 **上传并部署：云端安装依赖**

### 步骤4：检查环境ID

确保以下配置中的环境ID一致：
- `src/App.vue` 中的 `wx.cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })`
- 所有云函数 `index.js` 中的 `cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })`
- 微信开发者工具云开发控制台显示的环境ID

### 步骤5：重新编译并测试

1. 运行 `npm run build:mp-weixin`
2. 在微信开发者工具中点击 **编译**
3. 打开调试器控制台查看云函数调用日志

## 调试技巧

### 查看云函数日志
在微信开发者工具中：
1. 打开 **云开发** → **云函数**
2. 右键某个函数 → **查看日志**
3. 可以看到函数执行的详细日志和错误信息

### 本地调试云函数
1. 右键云函数 → **开启本地调试**
2. 设置调试参数
3. 点击运行查看本地执行结果

## 常见问题

### Q: 云函数一直显示"部署中"
A: 检查网络连接，或尝试重新部署

### Q: 数据库集合创建后仍然超时
A: 检查权限设置是否为"所有用户可读写"

### Q: 环境ID不一致
A: 确保所有地方的环境ID都是 `cloud1-d7gvzylmp17ed1957`

## 快速验证

在微信开发者工具控制台中运行：
```javascript
wx.cloud.callFunction({
  name: 'login',
  success: res => console.log('云函数正常', res),
  fail: err => console.error('云函数异常', err)
})
```

如果login函数正常返回，说明云开发环境配置正确，问题出在新部署的函数或数据库集合上。
