# 个性化菜单推荐系统 - 增量升级说明

## 概述

本增量升级方案在原有的《智慧三餐·悦享观影》产品基础上，进一步提升个性化推荐精准度与用户体验。

## 新增功能模块

### 1. 用户画像动态更新机制

**核心文件：**
- `backend/services/recommendationEngine.js` - 推荐引擎核心

**功能特性：**
- 实时行为微调：用户每次交互（收藏、删除、评分）后立即更新画像
- 加权平均融合：平滑整合新旧数据，避免画像突变
- 场景触发更新：检测到场景变化时触发即时更新

**数据结构：**
```javascript
// user_profiles 表
{
  taste_weights: { spicy: 0.8, sweet: 0.3, ... },
  cuisine_weights: { chinese: 0.9, japanese: 0.4, ... },
  nutrition_preferences: { low_calorie: false, ... },
  recent_interactions: [],
  exploration_ratio: 0.2
}
```

### 2. 实时推荐引擎优化

**探索-利用（Exploration-Exploitation）策略：**
- 80% 推荐基于当前画像（利用）
- 20% 用于探索用户潜在兴趣（探索）

**动态探索比例：**
- 用户连续多次否定推荐 → 降低探索比例
- 用户长期未反馈 → 增加探索比例避免"信息茧房"

**API 接口：**
```
GET /api/recommendations/:userId?meal_type=dinner&count=5
POST /api/recommendations/behavior
GET /api/recommendations/profile/:userId
```

### 3. 场景化推荐能力增强

**新增场景信号：**
- 天气数据（雨天提升"暖食"权重）
- 节假日/特殊事件
- 时间时段（早餐/午餐/晚餐）
- 是否有同伴用餐
- 用户忙碌状态

**菜品属性扩展：**
- `is_warm_food` - 是否为暖食
- `is_shareable` - 是否适合分享

### 4. 用户反馈闭环与解释性推荐

**主动反馈引导：**
- "为什么推荐这道菜？"入口
- 展示推荐理由（画像依据）
- 喜欢/不喜欢快速反馈

**即时反馈收集：**
- 用户不喜欢时询问原因（太辣/太油腻/不喜欢食材/其他）
- 即时更新画像对应标签
- 动态调整后续推荐

### 5. 冷启动优化

**交互式问卷页面：**
- 路径：`pages/onboarding/onboarding`
- 5个趣味问题快速建立初始画像
- 支持单选/多选
- 进度条显示

**问卷问题：**
1. 辣度接受程度
2. 偏爱烹饪方式
3. 喜欢的菜系
4. 饮食目标
5. 在家用餐时段

## 前端更新

### 新增页面
- **引导问卷页** (`pages/onboarding/onboarding.*`) - 新用户偏好收集

### 首页增强
- 个性化推荐卡片展示
- "为什么推荐？"可展开说明
- 喜欢/不喜欢快捷按钮
- 实时行为追踪

## 后端新增文件

### 服务层
- `backend/services/recommendationEngine.js` - 推荐引擎核心
- `backend/services/onboardingService.js` - 引导问卷服务

### 路由层
- `backend/routes/recommendations.js` - 推荐相关API
- `backend/routes/onboarding.js` - 引导问卷API

### 数据层更新
- 新增 `user_behaviors` 表 - 用户行为记录
- 新增 `user_profiles` 表 - 用户画像存储
- 新增 `scenario_context` 表 - 场景上下文
- 新增 `onboarding_answers` 表 - 引导问卷答案
- 扩展 `recipes` 表 - 新增 `is_warm_food`, `is_shareable`
- 扩展 `menus` 表 - 新增 `recommendation_reason`
- 扩展 `feedback` 表 - 新增 `dislike_reason`
- 扩展 `users` 表 - 新增 `is_new_user`, `onboarding_completed`

## 使用说明

### 启动服务

```bash
# 进入后端目录
cd backend

# 安装依赖（如未安装）
npm install

# 启动服务
npm start
```

### 测试流程

1. **新用户流程：**
   - 首次打开小程序 → 自动跳转到引导问卷
   - 完成5个问题 → 建立初始画像
   - 首页展示个性化推荐

2. **个性化推荐：**
   - 首页展示"为你推荐"卡片
   - 点击"为什么推荐？"查看理由
   - 点击❤️或👎进行反馈
   - 系统即时学习并调整推荐

3. **用户画像查看：**
   - 通过API获取用户画像数据
   - 查看口味、菜系权重分布
   - 了解探索比例设置

## API 接口文档

### 推荐相关

#### 获取个性化推荐
```
GET /api/recommendations/:userId
Query:
  - meal_type: 'breakfast'|'lunch'|'dinner'
  - count: number (default 5)
Response:
  { recommendations: [...] }
```

#### 记录用户行为
```
POST /api/recommendations/behavior
Body:
  {
    user_id: number,
    action_type: 'view'|'like'|'dislike'|'select',
    item_type: 'recipe',
    item_id: number,
    details?: {}
  }
```

#### 获取用户画像
```
GET /api/recommendations/profile/:userId
Response:
  {
    profile: {
      taste_weights: {},
      cuisine_weights: {},
      nutrition_preferences: {},
      exploration_ratio: 0.2,
      recent_interactions: []
    }
  }
```

### 引导问卷相关

#### 获取问卷问题
```
GET /api/onboarding/questions
Response: { questions: [...] }
```

#### 提交问卷答案
```
POST /api/onboarding/answers
Body:
  {
    user_id: number,
    answers: [
      { question_id: string, value: string|string[] }
    ]
  }
```

#### 检查引导状态
```
GET /api/onboarding/status/:userId
Response:
  {
    isNewUser: boolean,
    onboardingCompleted: boolean
  }
```

## 技术亮点

1. **实时画像更新** - 毫秒级响应，用户行为即时影响推荐
2. **探索-利用平衡** - 80/20黄金比例，兼顾精准性与多样性
3. **场景感知** - 多维度信号融合，推荐更贴合当前情境
4. **反馈闭环** - 解释性推荐增强信任，持续学习优化
5. **快速冷启动** - 5个问题构建初始画像，新用户即刻可用

## 扩展建议

1. **接入真实天气API** - 替换模拟天气数据
2. **增加地理位置感知** - 推荐周边特色美食
3. **社交推荐** - 结合好友口味偏好
4. **A/B测试框架** - 持续优化推荐算法
5. **大数据分析** - 深入挖掘用户行为模式
