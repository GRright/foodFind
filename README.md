# 🍽️ 吃点啥 (foodFind)

> **情侣/家人/朋友共同决策「今天吃什么」的微信小程序**
>
> **当前版本**: v2.6.2 · **系统安全加固版** · **最后更新**: 2026-04-22

---

## ✨ 项目亮点

- 🎯 **智能推荐**：基于营养均衡算法的每日/每周菜单自动生成
- 👥 **双人协作**：云端配对系统，跨设备实时同步菜单决策
- 🏠 **家庭群组**：支持多人家庭/群组模式，共享购物清单和打卡监督
- 🛒 **智能购物清单**：根据菜单自动生成采购清单，分类整理，支持家庭共享
- 📷 **双模式切换**：做饭模式（菜谱推荐）+ 不做饭模式（美食拍照分享）
- 👍 **喜欢/不喜欢**：菜品详情页一键标记喜欢或不喜欢的菜品
- 🎨 **极致UI**：白色 + 绿色纯净色系，12种统一CSS动画
- ☁️ **低成本架构**：菜谱本地缓存 + 云端仅用于配对/分享（每次交互约4次云函数调用）

---

## 📖 项目概述

一个基于 **UniApp 3.0 (Vue 3 Options API)** + **微信云开发** 的智能餐饮推荐小程序。解决情侣、家人、朋友之间"今天吃什么"的永恒难题。

### 核心设计理念

1. **极简操作**：打开即推荐，无需复杂配置
2. **营养均衡**：荤素 55:45 科学配比，避免重复菜品
3. **情感连接**：通过分享和配对增进感情
4. **灵活适配**：支持1-5人用餐，多种口味偏好

---

## 🛠 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **前端框架** | UniApp 3.0 | Vue 3 Options API |
| **编译目标** | mp-weixin | 微信小程序原生格式 |
| **云开发 SDK** | wx-server-sdk 2.6.3 | 云函数 + 云数据库 |
| **UI 色系** | 白色 + 绿色 | #07c160 主色调 |
| **动画系统** | CSS Keyframes | 12 种统一动画 |
| **数据策略** | 本地优先 | 零云函数调用获取菜谱 |
| **构建工具** | @dcloudio/vite-plugin-uni | Vite 编译链路 |

---

## 📂 项目结构

```
d:\project\foodFind/
├── src/                          # 源代码目录
│   ├── pages/                    # 页面组件（12个）
│   │   ├── index/index.vue       # ⭐ 首页（双模式核心）
│   │   ├── menu/menu.vue         # 一周菜单规划页
│   │   ├── profile/profile.vue   # 个人中心 + 偏好设置
│   │   ├── share/share.vue       # 分享确认/查看页
│   │   ├── invite/invite.vue     # 配对邀请接受页
│   │   ├── onboarding/onboarding.vue  # 首次引导4题
│   │   ├── recipe-detail/recipe-detail.vue  # 菜品详情
│   │   ├── shoppingList/shoppingList.vue    # 🛒 智能购物清单
│   │   ├── family/family.vue                # 🏠 家庭群组管理
│   │   ├── familyCheckIn/familyCheckIn.vue  # 家庭打卡看板
│   │   ├── familyReport/familyReport.vue    # 家庭饮食周报
│   │   ├── foodDiary/foodDiary.vue          # 美食日记
│   │   └── mealConfig/mealConfig.vue        # 用餐配置
│   │
│   ├── utils/                    # 工具模块
│   │   ├── constants.js          # 20道完整菜谱数据
│   │   ├── family.js             # 家庭群组相关工具函数
│   │   └── icons.js              # 图标常量 + 色彩定义
│   │
│   ├── App.vue                   # 全局配置 + 动画系统
│   ├── main.js                   # 应用入口
│   ├── pages.json                # 页面路由配置
│   └── manifest.json             # 应用配置（含AppID）
│
├── dist/build/mp-weixin/         # 编译输出目录
│   └── cloudfunctions/           # 34个云函数
│
├── generate-icons.js             # TabBar图标生成脚本
├── README.md                     # 本文档
└── package.json                  # 项目依赖
```

---

## 🎯 核心功能详解

### 1️⃣ 智能菜单生成引擎

#### 每日模式（首页）
- **自动生成**：首次进入或清除缓存后自动生成当日三餐
- **独立刷新**：早餐/午餐/晚餐各有独立的「换一批」按钮
- **菜品数量**：根据用餐人数动态调整（1人=2道，2人=3道，3-4人=4道，5+=5道）
- **交互方式**：
  - 单击菜品 → 弹出操作气泡（♥喜欢 / ✕删除 / ↻换一个）
  - 双击菜品 → 进入菜品详情页
  - 300ms 双击检测算法，区分单击和双击

#### 周计划模式（菜单页）
- **周历导航**：显示周一~周日，支持上下周切换
- **一键生成**：点击「生成本周菜单」按钮，0.8秒内生成7天完整餐单
- **荤素均衡算法**：
  ```
  午餐/晚餐：55% 荤菜(meat/mixed) + 45% 素菜(vegetarian)
  早餐：随机选择（不强制均衡）
  奇偶天交替：第1/3/5/7天 lunch=dinner顺序，第2/4/6天反转
  ```
- **去重机制**：使用 `Set` 数据结构追踪已用菜品ID，7天内不重复
- **首页同步**：选中"今天"时，优先读取首页 `foodfind_meals` 缓存

#### 营养数据展示
- **顶部汇总栏**：显示今日总热量(kcal) + 蛋白质/脂肪/碳水
- **分餐区统计**：每个餐区右侧显示该餐区总热量
- **菜品级数据**：每张菜品卡底部显示单人份热量

---

### 2️⃣ 不做饭模式 📷

#### 触发方式
设置页 → 偏好设置弹窗 → 顶部「使用模式」→ 开启「不做饭模式」开关

#### 功能特性
- **首页变身**：从菜谱推荐页变为美食分享流（Feed）
- **两种上传方式**：
  - 📸 相机拍摄：调用 `uni.chooseImage({ sourceType: ['camera'] })`
  - 🖼️ 相册选择：调用 `uni.chooseImage({ sourceType: ['album'] })`
- **Feed 流展示**：
  - 按时间倒序排列
  - 显示分享者头像首字 + 昵称 + 时间
  - 标签区分「我」（绿色实心）和「TA」（绿色空心）
  - 点击图片可全屏预览
- **双向同步**：
  - 自己的分享存入 `foodfind_feed` 缓存
  - 搭子的分享存入 `foodfind_partner_feed` 缓存
  - 合并后按时间排序展示
- **云端备份**：如果已配对且状态为 `paired`，自动调用 `saveShareMenu` 云函数备份

---

### 3️⃣ 云端配对系统

#### 完整流程图

```
用户A                              用户B
  │                                  │
  ├─ 点击「添加我的吃饭搭子」          │
  ├─ 调用 createPairInvite            │
  │   返回 pairId                     │
  ├─ 生成微信分享卡片                  │
  │   title: "XXX邀请你成为吃饭搭子"    │
  │   path: /pages/invite?pid=pairId  │
  ├─ 通过微信发送给B ──────────────→  │
  │                                  ├─ 打开卡片，进入invite页
  │                                  ├─ 调用 acceptPairInvite(pid)
  │                                  ├─ 设置备注名
  │                                  ├─ 确认接受 ←──────────────────┤
  │                                  │  云数据库 pairs 集合更新     │
  ├─ A收到通知                        │
  ├─ 点击搭子卡片                      │
  ├─ 选择「设置关系类型」               │
  │   □ 💕 情侣                       │
  │   ░ 👨‍👩‍👧 家人（示例）              │
  │   □ 🤝 朋友                       │
  └─ 完成！双方已配对 ────────────────┘
```

#### 关键技术点
- **唯一标识**：`pairId` 作为关联键，绑定双方的 `openid`
- **状态管理**：
  - `pending`：等待对方接受
  - `paired`：已配对成功
- **关系类型**：由发起方在接受后设定（couple/family/friend）
- **本地缓存**：配对信息存入 `foodfind_partner`，包含 nickname/relationType/status/pairId

---

### 4️⃣ 分享菜单功能

#### 分享流程（首页右上角「♡ 分享」按钮）

```
用户点击分享按钮
  ↓
触发 onShareAppMessage()
  ↓
调用 saveShareMenu 云函数
  参数: { meals, fromName, toName }
  ↓
云函数返回 shareId
  ↓
生成分享卡片:
  title: "TA，今天吃这些怎么样？(Xkcal)"
  path: /pages/share/share?sid=shareId&from=home
  ↓
接收方打开 → getShareMenu(sid) → 展示菜单
  ↓
接收方可选择:
  ✓ 确认 → updateShareStatus({status:'confirmed'})
  ✎ 修改 → updateShareStatus({status:'modified', newMeals})
```

---

### 5️⃣ 个人偏好系统（弹窗式）

#### 入口
我的页面 → 「⚙ 偏好设置」→ 底部弹性弹窗（cubic-bezier 动画）

#### 设置项分类

| 分类 | 选项数 | 类型 | 说明 |
|------|--------|------|------|
| **使用模式** | 1 | 开关 | 不做饭模式（影响首页形态） |
| **人群类型** | 6 | 单选 | 成人/健身/孕妇/老人/婴幼/慢性病 |
| **用餐人数** | 4 | 单选 | 1人/2人/3-4人/5+人 |
| **口味偏好** | 6 | 单选 | 清淡/麻辣/酸甜/咸鲜/香辣/原味 |
| **过敏原** | 6 | 多选 | 花生/乳制品/海鲜/麸质/鸡蛋/大豆 |
| **饮食禁忌** | 6 | 多选 | 不吃红肉/禽类/鱼/蒜/全素食/蛋奶素 |
| **菜系偏好** | 6 | 多选 | 家常菜/川湘菜/粤菜/北方面食/轻食/日韩 |

#### 存储位置
- 详细设置：`foodfind_detailed_prefs`（JSON对象）
- 用餐人数单独存储：`foodfind_user_count`（数字）

---

### 6️⃣ 首次引导系统

#### 引导问题设计（4题）

| 序号 | 问题 | 类型 | 选项数 | 自动跳转 |
|------|------|------|--------|----------|
| ① | 你属于哪类人群？ | 单选 | 6 | ✅ 280ms后跳转 |
| ② | 你喜欢什么口味？ | 单选 | 6 | ✅ 280ms后跳转 |
| ③ | 平时一般几人用餐？ | 单选 | 4 | ✅ 280ms后跳转 |
| ④ | 你偏好哪些菜系？ | 多选 | 6 | ❌ 手动点完成 |

#### UI 特性
- 进度条 + 步骤圆点指示器
- 选项卡片逐个滑入动画（`slideUp`，延迟递增）
- 单选题选中后绿色边框 + 勾选图标
- 多选题虚线边框区分
- 完成后显示 Toast "设置完成，开始美食之旅！"，1.6秒后跳转首页

---

### 7️⃣ 家庭/群组模式【v2.5新增】

#### 创建与加入
- **入口**：我的页面 → 家庭群组
- **创建家庭**：输入家庭名称（2-20字），生成6位邀请码
- **加入家庭**：输入邀请码，即可加入已有家庭
- **群组类型**：支持"家庭"和"朋友群"两种模式

#### 家庭功能
- **共享购物清单**：家庭成员可共同编辑购物清单，实时同步
- **打卡监督**：记录做饭、用餐、采购等打卡行为
- **饮食周报**：统计家庭成员一周的饮食情况
- **成员管理**：群主可管理成员，成员可随时退出

---

### 8️⃣ 智能购物清单【v2.5新增】

#### 自动生成
- **根据菜单生成**：读取当日或一周菜单，自动提取所需食材
- **智能合并**：相同食材自动合并数量
- **分类整理**：按蔬菜、肉蛋禽、主食、其他分类

#### 交互优化
- **准备天数**：支持1-14天自定义，数字输入框+加减按钮操作
- **排除调料**：自动排除油盐酱醋等家庭常备调料
- **勾选状态**：已购食材可勾选标记
- **家庭共享**：家庭模式下清单实时同步给所有成员

---

## ☁️ 云函数架构（34个）

### 基础功能层（7个）

```javascript
// 1. getRecipes - 获取菜谱列表（当前未使用，菜谱已本地化）
// 2. getMovies - 获取电影列表（已废弃功能保留接口）
// 3. checkOnboardingStatus - 检查用户是否完成引导
// 4. saveOnboardingAnswers - 保存引导问卷答案到云数据库
// 5. getOnboardingQuestions - 获取引导题目配置
// 6. login - 获取用户openid（静默登录）
// 7. batchSync - 批量同步本地数据到云数据库
```

### 分享功能层（3个）

```javascript
// 8. saveShareMenu - 创建分享记录
//    输入: { meals, fromName, toName }
//    输出: { code: 0, shareId: 'xxx' }
//
// 9. getShareMenu - 通过shareId读取分享内容
//    输入: { shareId }
//    输出: { meals, fromName, toName, status, createdAt }
//
// 10. updateShareStatus - 更新分享状态
//     输入: { shareId, status, newMeals? }
//     状态: 'pending' | 'confirmed' | 'modified'
```

### 配对功能层（3个）

```javascript
// 11. createPairInvite - 创建配对邀请
//     输入: { relationType, inviterName }
//     输出: { code: 0, pairId: 'xxx' }
//
// 12. acceptPairInvite - 接受配对邀请
//     输入: { pairId, accepterName }
//     操作: 在pairs集合中关联双方openid
//
// 13. getPairInfo - 查询当前用户的配对信息
//     输入: {}
//     输出: { partnerOpenid, relationType, status, pairId } 或 null

### 互动打卡功能层（3个）【v1.5新增】

```javascript
// 14. recordCheckIn - 记录打卡行为（核心）
//     输入: { action, pairId, mealType?, data? }
//     action类型:
//       'open_app'    → 记录打开应用
//       'share_food'  → 记录分享美食
//       'eat_meal'    → 记录用餐完成（需mealType: breakfast/lunch/dinner）
//     输出: { code: 0, sparkLevel } 火花等级(0-2)
//
// 15. getPairStats - 获取配对统计信息
//     输入: { pairId? }
//     输出: {
//       consecutiveShareDays, consecutiveOpenDays,
//       totalShareDays, totalOpenDays,
//       longestStreak, todaySpark
//     }
//
// 16. getDailyStatus - 获取某日/一周的打卡状态
//     输入: { pairId, date?, range?: 'week' }
//     range='week': 返回近7天的 [{date, sparkLevel, allOpened, allShared}]
//     无range: 返回指定日期的完整记录 + myCheckIn(当前用户)
```

### 家庭/群组功能层（7个）【v2.5新增】

```javascript
// 17. createFamilyGroup - 创建家庭群组
//     输入: { name, type, userName }
//     输出: { code: 0, groupId, inviteCode }
//
// 18. joinFamilyGroup - 加入家庭群组
//     输入: { inviteCode, userName }
//     输出: { code: 0, groupId }
//
// 19. getFamilyCheckIns - 获取家庭打卡记录
//     输入: { groupId, date? }
//     输出: { checkIns: [{ userId, date, action, timestamp }] }
//
// 20. recordCheckIn - 记录家庭打卡
//     输入: { groupId, userId, action, mealType? }
//     action类型: 'cook' | 'eat' | 'buy'
//
// 21. sendFamilyNotification - 发送家庭通知
//     输入: { groupId, userId, type, message }
//     类型: 'check_in' | 'remind' | 'system'
//
// 22. syncFamilyShopping - 同步家庭购物清单
//     输入: { groupId, items, operation }
//     操作: 'add' | 'update' | 'delete' | 'sync'
//
// 23. updateFamilyMember - 更新家庭成员信息
//     输入: { groupId, userId, name?, role?, isAdmin? }
//
// 24-34. 其他辅助云函数（投票、挑战、评论、日记等）
```
```

### 安全架构【v2.6.2新增】

#### 云函数安全策略
系统已通过全面安全审查，以下机制确保数据安全：

**输入验证与防注入**
- **集合白名单**：`batchSync` 仅允许 7 个合法集合写入，防止恶意注入
- **数据大小限制**：单次提交 50KB 上限，批量 10 条上限
- **XSS 过滤**：所有用户输入统一过滤 `< > ' " &` 字符
- **邀请码校验**：`/^[A-Z0-9]{6}$/` 正则验证，防止非法注入

**权限控制**
- **openid 获取**：云函数统一使用 `cloud.getWXContext()` 获取真实身份
- **前端不存储 openid**：防止身份伪造和数据篡改
- **操作权限验证**：
  - 移除家庭成员：仅群主或本人可操作
  - 解散群组：仅群主可操作
  - 修改成员信息：仅群主或本人可操作

**敏感数据保护**
- **API 响应过滤**：分享菜单不返回 `fromOpenid`，家庭查询不返回 `inviteCode`
- **查询限制**：`getFamilyCheckIns` 限制 365 条记录，防止全表扫描

---

## 🗄️ 云数据库集合设计

| 集合名 | 字段结构 | 用途 | 记录数预估 |
|--------|----------|------|-----------|
| `recipes` | `{ id, name, image, type, nutrition... }` | 20道标准菜谱 | 20条（固定） |
| `movies` | `{ id, title, ... }` | 电影数据（废弃） | 0 |
| `onboarding` | `{ openid, completedAt, answers }` | 用户引导状态 | 1条/用户 |
| `onboarding_questions` | `{ id, question, type, options[] }` | 引导题库 | 4条（固定） |
| `share_menus` | `{ shareId, fromOpenid, toOpenid, meals, status }` | 分享记录 | N条 |
| `pairs` | `{ pairId, inviterOpenid, accepterOpenid, relationType, status }` | 配对关系 | 1条/用户 |
| `daily_checkins` | `{ pairId, date, members[], sparkLevel, allOpened, allShared }` | 每日打卡记录 | N条 |
| `pair_stats` | `{ pairId, consecutiveShareDays, consecutiveOpenDays, ... }` | 配对统计 | 1条/配对 |
| `family_groups` | `{ groupId, name, type, inviteCode, adminId, members[] }` | 家庭群组 | N条 |
| `family_checkins` | `{ groupId, userId, date, action, timestamp }` | 家庭打卡记录 | N条 |
| `shopping_lists` | `{ groupId?, userId?, items[], updatedAt }` | 购物清单 | 1条/用户或家庭 |

---

## 💾 本地缓存策略

### 缓存 Key 总表

| Key 名 | 数据类型 | 存储时机 | 过期策略 | 用途 |
|--------|----------|----------|----------|------|
| `foodfind_meals` | Object | 生成菜单时 | 按日期失效 | 当日三餐数据 |
| `foodfind_meals_date` | String | 保存meals时 | - | 当日日期标记 |
| `foodfind_weekly` | Object | 生成周计划时 | 手动清除 | 7天完整餐单 |
| `foodfind_partner` | Object | 配对成功/接受时 | 解除时删除 | 搭子信息+状态 |
| `foodfind_detailed_prefs` | Object | 保存偏好时 | - | 全部偏好设置JSON |
| `foodfind_user_count` | Number | 保存偏好时 | - | 用餐人数（快捷访问） |
| `foodfind_preferences` | Array | 完成引导时 | - | 4题引导结果 |
| `foodfind_feed` | Object | 分享美食时 | 按日期分组 | 自己的美食分享 |
| `foodfind_partner_feed` | Object | 接收分享时 | 按日期分组 | 搭子的美食分享 |
| `foodfind_family_group` | Object | 加入/创建家庭时 | 退出时删除 | 家庭群组信息 |
| `foodfind_shopping_list` | Object | 更新购物清单时 | 手动清除 | 个人购物清单 |
| `foodfind_family_shopping` | Object | 家庭清单更新时 | 退出家庭时删除 | 家庭共享购物清单 |
| `foodfind_family_checkins` | Object | 打卡时 | 按日期失效 | 家庭打卡记录 |

### 数据流向图

```
用户操作
  ↓
【本地缓存层】← 优先读取（零延迟）
  │
  ├─ foodfind_meals → 首页展示
  ├─ foodfind_weekly → 菜单页展示
  ├─ foodfind_partner → 搭子状态
  └─ foodfind_detailed_prefs → 偏好过滤
  │
  ↓ （仅在配对/分享时）
【云函数层】← 按需调用（~4次/交互）
  │
  ├─ createPairInvite / acceptPairInvite
  ├─ saveShareMenu / getShareMenu / updateShareStatus
  └─ getPairInfo
  │
  ↓
【云数据库层】← 持久化存储
  └─ pairs / share_menus 集合
```

---

## 🎨 设计规范

### 色彩系统（严格白+绿双色）

#### 主色调（绿色系）

| 色值 | 名称 | 使用场景 |
|------|------|----------|
| `#07c160` | 微信绿 | 主按钮、图标、强调文字、选中态 |
| `#06ad56` | 深绿 | 渐变终点、次级强调 |
| `#059a4b` | 暗绿 | 渐变终点、搭子关系文字 |
| `#e8f7ef` | 浅绿背景 | 输入框背景、模式标签、菜单图标包裹 |
| `#d4f5e3` | 薄荷绿 | 搭子卡片渐变起点、开关开启态 |
| `#a8e6cf` | 翠绿 | 搭子卡片渐变终点 |

#### 中性色（白色系）

| 色值 | 名称 | 使用场景 |
|------|------|----------|
| `#ffffff` | 纯白 | 卡片背景、内容区域 |
| `#fafafa` | 灰白 | 菜品卡片底色、输入框 |
| `#f7f8fa` | 页面底色 | 全局页面背景 |
| `#f5f5f5` | 浅灰 | 关闭按钮、禁用态背景 |

#### 文字色阶

| 色值 | 层级 | 使用场景 |
|------|------|----------|
| `#1a1a1a` | 主文字 | 标题、重要信息 |
| `#333` | 次要文字 | 菜品名、菜单项标题 |
| `#666` | 辅助文字 | 营养数值、描述文字 |
| `#999` | 提示文字 | 占位符、次要提示 |
| `#ccc` | 禁用文字 | 箭头、分割线 |
| `#bbb` | 弱提示 | hint文字 |

> ❌ **禁止使用的颜色**：粉色(#ff6b9d)、红色(#ff4757)、橙色(#ffb800)、紫色(#7c4dff)、黄色(#ffc107)
>
> ✅ 如需警示色，统一使用绿色透明度变化（如 `rgba(7,193,96,0.15)`）

---

### 间距规范

| 元素 | 内边距 | 外边距 | 圆角 |
|------|--------|--------|------|
| 页面容器 | `padding: 0 20rpx` | - | - |
| 卡片 | `padding: 24rpx` | `margin-bottom: 22rpx` | `border-radius: 20rpx` |
| 头部区域 | `padding: 28rpx 24rpx` | `margin-bottom: 16rpx` | `border-radius: 0 0 24rpx 24rpx` |
| 按钮 | `padding: 24rpx 56rpx` | - | `border-radius: 50rpx`（胶囊形） |
| 标签/Tag | `padding: 14rpx 24rpx` | `gap: 10rpx` | `border-radius: 40rpx`（药丸形） |
| 图标包裹 | `72rpx × 72rpx` | `margin-right: 18rpx` | `border-radius: 18rpx` |

---

## 🎬 动画系统

### 全局动画类（定义在 [App.vue](src/App.vue)）

| 类名 | 动画效果 | 时长 | 缓动函数 | 使用场景 |
|------|----------|------|----------|----------|
| `.page-enter` | 从下方20rpx淡入 | 0.35s | `cubic-bezier(.4,0,.2,1)` | TabBar页面切换 |
| `.page-exit` | 向上10rpx淡出 | 0.25s | `ease` | 页面离开（预留） |
| `.fade-in` | 向上16rpx淡入 | 0.4s | `ease` | 头部区域、标题 |
| `.slide-up` | 从下方40rpx滑入 | 0.35s | `ease` | 卡片区块入场 |
| `.scale-in` | 从0.9倍缩放淡入 | 0.3s | `ease` | 小组件、徽章 |
| `.pulse` | 缩放1→0.95→1 | 0.3s | `ease` | 点击反馈 |
| `.bounce-in` | 弹性缩放0.3→1.05→0.95→1 | 0.45s | `cubic-bezier(.68,-.55,.265,1.55)` | 强调元素（搭子卡片） |
| `.pop-in` | 缩放0.8+上移20rpx | 0.35s | `cubic-bezier(.175,.885,.32,1.275)` | 列表项弹出 |
| `.shimmer` | 透明度1→0.6→1循环 | 1.8s∞ | `ease-in-out` | 加载中闪烁（换一批按钮） |
| `.float-gentle` | 上下8rpx漂浮 | 3s∞ | `ease-in-out` | 待机状态元素 |
| `.slide-left` | 从左30rpx滑入 | 0.35s | `ease` | 左侧入场 |
| `.slide-right` | 从右30rpx滑入 | 0.35s | `ease` | 右侧入场 |
| `.glow-pulse` | 绿色光晕呼吸 | 2s∞ | `ease-in-out` | 强调卡片发光效果 |

### 页面内联动画（延迟递增）

```vue
<!-- 卡片列表逐个入场 -->
<style>
.meal-section {
  animation: slideUp .45s ease forwards;
  animation-delay: calc(0.08s * si);  /* 第si个区块 */
  opacity: 0;
}

.food-card {
  animation: popIn .4s cubic-bezier(.175,.885,.32,1.275) forwards;
  animation-delay: calc(0.15s + si*0.06s + fi*0.05s);  /* 区块+菜品双重延迟 */
  opacity: 0;
}
</style>
```

---

## 📱 页面路由配置

[pages.json](src/pages.json) 中注册的7个页面：

| 路径 | 名称 | 是否TabBar | 导航栏样式 |
|------|------|-----------|-----------|
| `/pages/index/index` | 首页 | ✅ 是（默认） | 白底黑字 |
| `/pages/menu/menu` | 菜单 | ✅ 是 | 白底黑字 |
| `/pages/profile/profile` | 我的 | ✅ 是 | 白底黑字 |
| `/pages/share/share` | 分享确认 | ❌ 否 | 白底黑字 |
| `/pages/invite/invite` | 邀请接受 | ❌ 否 | 自定义（透明） |
| `/pages/onboarding/onboarding` | 引导 | ❌ 否 | 自定义（透明） |
| `/pages/recipe-detail/recipe-detail` | 菜品详情 | ❌ 否 | 白底黑字 |

### TabBar 配置

```json
{
  "color": "#999999",
  "selectedColor": "#07c160",
  "list": [
    { "pagePath": "pages/index/index", "text": "首页", "iconPath": "static/tabbar/home.png", "selectedIconPath": "static/tabbar/home-active.png" },
    { "pagePath": "pages/menu/menu", "text": "菜单", "iconPath": "static/tabbar/menu.png", "selectedIconPath": "static/tabbar/menu-active.png" },
    { "pagePath": "pages/profile/profile", "text": "我的", "iconPath": "static/tabbar/profile.png", "selectedIconPath": "static/tabbar/profile-active.png" }
  ]
}
```

---

## 🔧 构建与部署

### 环境要求

- Node.js >= 16.x（推荐 18.x 或 20.x）
- npm 或 yarn 包管理器
- 微信开发者工具（最新稳定版）

### 构建步骤

#### 1️⃣ 安装依赖

```bash
cd d:\project\foodFind
npm install
```

#### 2️⃣ 生成 TabBar 图标（首次需要）

```bash
node generate-icons.js
```

> 生成6个PNG图标到 `src/static/tabbar/` 目录

#### 3️⃣ 编译项目

```bash
cd d:\project\foodFind
node "node_modules/@dcloudio/vite-plugin-uni/bin/uni.js" build -p mp-weixin
```

**输出目录**：`dist/build/mp-weixin/`

#### 4️⃣ 恢复云函数（重要！⚠️）

> 每次编译会**清空并重建** `dist/build/mp-weixin/` 目录，因此必须重新创建云函数文件夹

需要在 `dist/build/mp-weixin/cloudfunctions/` 下创建以下16个子目录：

```
cloudfunctions/
├── getRecipes/
│   ├── index.js
│   └── package.json
├── getMovies/
│   ├── index.js
│   └── package.json
├── checkOnboardingStatus/
│   ├── index.js
│   └── package.json
├── saveOnboardingAnswers/
│   ├── index.js
│   └── package.json
├── getOnboardingQuestions/
│   ├── index.js
│   └── package.json
├── login/
│   ├── index.js
│   └── package.json
├── batchSync/
│   ├── index.js
│   └── package.json
├── saveShareMenu/
│   ├── index.js
│   └── package.json
├── getShareMenu/
│   ├── index.js
│   └── package.json
├── updateShareStatus/
│   ├── index.js
│   └── package.json
├── createPairInvite/
│   ├── index.js
│   └── package.json
├── acceptPairInvite/
│   ├── index.js
│   └── package.json
├── getPairInfo/
│   ├── index.js
│   └── package.json
├── recordCheckIn/              【v1.5新增】
│   ├── index.js
│   └── package.json
├── getPairStats/               【v1.5新增】
│   ├── index.js
│   └── package.json
└── getDailyStatus/             【v1.5新增】
    ├── index.js
    └── package.json
```

每个云函数的标准结构：

```javascript
// index.js 示例（以 saveShareMenu 为例）
const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  // 业务逻辑...
  return { code: 0, shareId: 'xxx' }
}
```

```json
// package.json
{
  "name": "saveShareMenu",
  "version": "1.0.0",
  "description": "创建分享菜单记录",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

#### 5️⃣ 配置 project.config.json

确保 `dist/build/mp-weixin/project.config.json` 包含：

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "appid": "wx76ea0fc78e202d6b",
  "projectname": "foodFind"
}
```

#### 6️⃣ 导入微信开发者工具

1. 打开微信开发者工具
2. 选择「导入项目」
3. 目录选择：`d:\project\foodFind\dist\build\mp-weixin`
4. AppID：`wx76ea0fc78e202d6b`
5. 点击「导入」

#### 7️⃣ 上传代码

在微信开发者工具中：
1. 点击右上角「上传」按钮
2. 填写版本号（如 `1.4.0`）
3. 填写项目备注（如 "智能周餐版 - 不做饭模式"）
4. 点击「上传」

---

## 📊 开发进度记录

### v1.0 - 基础版（2026-04初始）

**目标**：搭建可运行的最小可行产品（MVP）

- [x] UniApp 3.0 + Vue 3 项目初始化
- [x] 微信小程序配置（AppID: wx76ea0fc78e202d6b）
- [x] 20道完整菜谱数据建模（含食材用量、营养信息、做法步骤）
- [x] 首页每日三餐自动生成逻辑
- [x] 菜品详情页（食材清单 + 做法 + 营养数据）
- [x] 菜单列表页基础布局
- [x] TabBar 三页结构（首页/菜单/我的）
- [x] 7个云函数基础骨架

**技术突破**：
- 解决了 UniApp 编译到微信小程序的兼容性问题
- 实现了菜谱数据的本地化缓存策略（减少云函数调用）

---

### v1.1 - 交互增强版

**目标**：增加动画系统和云端协作能力

- [x] 移除影视功能（聚焦餐饮核心）
- [x] 全局CSS动画系统（fadeIn/slideUp/popIn等8种基础动画）
- [x] 云端分享菜单功能（3个云函数：saveShareMenu/getShareMenu/updateShareStatus）
- [x] 配对关系系统（3个云函数：createPairInvite/acceptPairInvite/getPairInfo）
- [x] 微信原生分享能力集成（open-type="share"）
- [x] 云数据库集合设计（share_menus/pairs）

**技术突破**：
- 设计了基于 pairId 的跨设备关联方案（无需手机号）
- 利用微信分享卡片作为邀请传输媒介
- 实现了本地缓存 + 云端DB的混合存储架构

---

### v1.2 - UI/UX 重构版

**目标**：提升视觉品质和用户体验

- [x] 首页改为分餐区卡片布局（早餐/午餐/晚餐独立区块）
- [x] 菜单页增加周历日历组件（周一~周日可视化）
- [x] 一键生成7天完整周计划功能
- [x] 荤素均衡算法实现（午餐/晚餐 55% meat/mixed + 45% vegetarian）
- [x] 菜品去重机制（7天内不重复，使用 Set 追踪 ID）
- [x] 引导页重构（4题设计：人群/口味/人数/菜系）
- [x] 单选题自动跳转（280ms 延迟，无需"下一步"按钮）
- [x] 偏好设置详细化（过敏原6种/饮食禁忌6种/菜系6种/人群6种）
- [x] 偏好设置改为**底部弹窗模式**（非内联展开）
- [x] 全应用色系统一为**白色 + 绿色**（移除所有粉/红/橙/紫/黄色）
- [x] 所有页面添加内边距（padding: 0 20rpx，不贴手机边缘）
- [x] 卡片间距优化（gap: 10rpx ~ 22rpx）

**技术突破**：
- 实现了营养均衡的随机算法（shuffle + balanced 组合）
- 解决了 `<transition>` 组件在微信小程序中的兼容性问题
- 统一了全局色彩系统，提升了品牌一致性

---

### v1.3 - 体验优化版

**目标**：打磨交互细节和数据一致性

- [x] 菜品单击交互：弹出操作气泡（♥喜欢 / ✕删除 / ↻换一个）
- [x] 菜品双击交互：直接进入菜品详情页
- [x] 300ms 双击检测算法（区分单击和双击）
- [x] 首页精简：去掉每道菜的 kcal 显示和每餐区的 kcal 汇总（仅保留顶部总览）
- [x] 每个餐区独立的「换一批」按钮（带 shimmer 加载动画）
- [x] 日历"今天"只保留蓝色下划线高亮（移除双层黄色+蓝色高亮）
- [x] 菜单页与首页数据同步（menu.vue 的 selectedDayMeals 读取首页缓存）
- [x] 我的页面改名：「绑定用餐伙伴」→ **「添加我的吃饭搭子」**
- [x] 配对流程重构：先分享 → 对方同意 → **再设定关系类型**（非预选）
- [x] 修复头部与搭子卡片重叠问题（margin-top: -30rpx → 16rpx）
- [x] 分享按钮颜色修正：粉色(#ff6b9d) → 绿色(#07c160)
- [x] TabBar PNG 图标程序化生成（generate-icons.js 脚本）
- [x] 清理14个冗余文件（build-*.txt/dev-*.txt/index.html/movies目录等）

**技术突破**：
- 实现了移动端的单击/双击手势识别
- 解决了日历日期选择的视觉冲突问题
- 优化了配对流程的用户心理模型（降低决策压力）

---

### v1.4 - 当前版本（智能周餐版）🎉

**目标**：新增不做饭模式，完善文档，准备上线

- [x] **不做饭模式**功能（首页双形态架构）
  - [x] 设置页增加模式切换开关（toggle-switch 组件）
  - [x] 开启后首页从菜谱推荐变为**美食分享Feed流**
  - [x] 支持相机拍摄（`sourceType: ['camera']`）
  - [x] 支持相册选择（`sourceType: ['album']`）
  - [x] Feed 流按时间倒序展示
  - [x] 区分自己和搭子的分享（绿色实心/空心标签）
  - [x] 点击图片全屏预览
  - [x] 云端备份（配对状态下自动调用 saveShareMenu）
- [x] TabBar 切换页面过渡特效（`.page-enter` 类）
  - [x] App.vue 定义 pageEnter/pageExit 全局动画
  - [x] 每个 TabBar 页面的根 view 添加动态 class 绑定
  - [x] onShow 时触发动画，400ms 后移除 class
- [x] 代码审查与清理
  - [x] 审查全部7个页面源文件（语法/逻辑正确）
  - [x] 审查工具模块（constants.js/icons.js）
  - [x] 审查全局配置（App.vue/pages.json/manifest.json）
  - [x] 发现并记录2个小问题（icons.js 冗余颜色、index.vue 重复动画定义）
- [x] README.md 文档精细化编写
  - [x] 从229行扩展至 **600+行**（更详细的技术文档）
  - [x] 新增：架构图、数据流图、配色规范表、动画参数表
  - [x] 新增：完整的构建部署步骤
  - [x] 新增：版本迭代的详细技术突破记录
- [x] 最终编译验证准备

**技术突破**：
- 实现了同一组件的双模式条件渲染架构（v-if/v-else）
- 设计了本地 Feed 缓存 + 云端备份的混合存储策略
- 建立了完整的文档体系（便于团队协作和后续维护）

---

### v1.5 - 互动打卡版（当前版本）🔥

**目标**：增加用户粘性的社交互动系统，类似QQ火花/情侣打卡

- [x] **互动打卡系统架构设计**
  - [x] 数据结构设计（daily_checkins + pair_stats 集合）
  - [x] 火花等级规则（0=无 / 1=单火花 / 2=双火花 / 3=超级火花💎）
  - [x] 打卡类型定义（打开应用 / 分享美食 / 用餐完成）
- [x] **新增3个云函数**
  - [x] `recordCheckIn` - 记录打卡行为（支持3种动作）
  - [x] `getPairStats` - 获取配对统计（连续天数/总天数/最长记录）
  - [x] `getDailyStatus` - 获取某日或一周的打卡状态
- [x] **菜单页日历火花标记**
  - [x] 加载一周打卡数据并在日历显示
  - [x] 🔥 单火花图标（一方完成）
  - [x] 🔥🔥 双火花图标（双方都完成）
  - [x] 日期单元格橙色渐变背景（有火花的日期）
  - [x] 顶部连续互动天数横幅（显示连续分享/打开次数）
  - [x] 连续7天以上显示 💎 超级火花徽章
- [x] **首页用餐打卡功能**
  - [x] 每个餐区（早餐/午餐/晚餐）添加「○ 标记 / ✓ 已吃」按钮
  - [x] 点击切换状态并调用云函数记录
  - [x] 已吃状态：绿色渐变背景 + 白色文字
  - [x] 未吃状态：灰色背景 + 灰色文字
  - [x] 自动记录用户打开应用行为（onShow 时调用）
  - [x] 页面加载时恢复当日已打卡状态
- [x] **我的页面互动报告**
  - [x] 搭子卡片下方显示统计卡片：
    - 连续分享天数
    - 连续打开应用天数
    - 总分享天数
  - [x] 超级火花提示条（连续≥7天时显示）
  - [x] 「📊 互动报告」入口（绿色高亮卡片）
  - [x] 互动报告弹窗（底部弹出）：
    - 本周统计概览
    - 7天日历网格（显示每日火花/无标记）
    - 今日高亮（绿色边框）
    - 火花规则说明

**技术突破**：
- 设计了完整的社交互动数据模型（成员维度 + 时间维度 + 行为维度）
- 实现了连续天数的自动计算与断续重置逻辑
- 创新性地将"火花"概念引入餐饮场景（增强情感连接）
- 双向数据同步：本地状态 + 云端持久化

**用户体验提升**：
- 🎯 增加打开应用的仪式感（每次进入都算一次互动）
- 🍽️ 用餐打卡让菜品推荐更有意义（不只是看，还要"吃"）
- 📊 可视化统计数据激励持续使用
- 🔥 火花系统创造"不想断掉"的心理（类似QQ火花）
- 💎 超级火花徽章提供成就感（连续7天+）

---

### v1.5.1 - 精美报告版（当前版本）✨

**目标**：修复交互问题 + 精美化互动报告弹窗

- [x] **修复"我的"页面点击无反应问题**
  - [x] 根本原因：`showReportModal` 同时作为 data 属性和 method 方法名导致冲突
  - [x] 解决方案：方法改名为 `openReport()` / `closeReport()`
  - [x] 所有按钮（偏好设置/清除缓存/关于我们/搭子管理）均可正常点击
- [x] **首页打卡功能优化**
  - [x] 去掉搭子限制：**个人也能给自己打卡**（自己看也很有意义）
  - [x] 本地优先存储：`foodfind_personal_checks` 缓存
  - [x] 有搭子时自动同步云端，无搭子时纯本地模式
  - [x] 页面加载时恢复当日已打卡状态
- [x] **精美互动报告弹窗重设计**
  - [x] 🎨 **紫色渐变 Hero 区域**：大号数字显示连续互动天数 + 🔥 emoji + 光晕效果
  - [x] 📊 **4宫格营养数据卡片**：
    - 🥩 荤菜道数（红色图标）
    - 🥬 素菜道数（绿色图标）
    - 🔥 总热量 kcal（橙色图标）
    - 💪 蛋白质 g（蓝色图标）
  - [x] 数据来源：读取本周 `foodfind_meals` 缓存，匹配 `ALL_RECIPES` 获取真实营养信息
  - [x] 🗓️ **7天打卡日历**：显示每日火花状态（🔥单/🔥🔥双/○无）
  - [x] 👥 **双人对比条形图**（有搭子时显示）
    - 绿色条 = 我的用餐次数
    - 紫色条 = 搭子的用餐次数
    - 百分比动态计算
  - [x] 💡 **智能健康提示**：
    - 荤菜过多 → "建议多吃蔬菜均衡营养"
    - 热量过高 → "注意控制总量"
    - 均衡 → "继续保持！记录美好食光~ ✨"
  - [x] **无搭子也能查看报告**：
    - 个人模式：只显示自己的营养数据
    - 不显示双人对比区域
    - 日历根据本地 personal_checks 生成
- [x] **代码质量提升**
  - [x] 引入 `ALL_RECIPES` 常量用于真实营养计算
  - [x] 新增 computed 属性：`weeklyMeatCount`, `weeklyVegCount`, `weeklyCalories`, `weeklyProtein`
  - [x] 新增 `generateLocalWeekData()` 方法支持纯本地模式
  - [x] 新增 `loadMyWeeklyMeals()` 从缓存提取本周菜品

**用户体验提升**：
- 🎯 打卡不再依赖搭子，降低使用门槛
- 📈 报告弹窗视觉升级，增加期待感（类似年度报告）
- 🧠 智能健康提示让用户感受到被关心
- 🔄 双人对比增强社交属性和竞争感

---

### v1.5.2 - 完整体验版（当前版本）🎬

**目标**：修复TabBar切换页面无过渡特效，统一全应用动画风格

- [x] **修复TabBar切换页面动画缺失问题**
  - [x] **根本原因**：只有 index.vue 实现了 `pageEnter` 动画，menu.vue 和 profile.vue 缺失
  - [x] **menu.vue 修复**：
    - 添加 `<view class="page" :class="{ 'page-enter': pageEnter }">` 绑定
    - data 中添加 `pageEnter: true` 属性
    - onShow 中触发：`this.pageEnter = true; setTimeout(() => { this.pageEnter = false }, 400)`
  - [x] **profile.vue 修复**：
    - 同样添加 pageEnter class 绑定 + data 属性 + onShow 触发逻辑
- [x] **统一动画风格**
  - [x] 所有3个TabBar页面使用相同的 `pageEnter` 动画（0.35s cubic-bezier 从下方20rpx淡入）
  - [x] 动画参数完全一致：
    ```
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(20rpx); }
      to   { opacity: 1; transform: translateY(0); }
    }
    ```
  - [x] 时长：350ms（足够明显但不拖沓）
  - [x] 缓动函数：cubic-bezier(.4,0,.2,1)（自然减速）
- [x] **用户体验提升**
  - 📱 每次切换TabBar都有流畅的过渡效果
  - 🎬 首次进入和后续切换都有动画
  - ✨ 统一的视觉风格增强专业感
  - 🔄 页面切换不再"生硬跳转"，而是"平滑滑入"

**技术细节**：
```vue
<!-- 统一的实现模式 -->
<template>
  <view class="page" :class="{ 'page-enter': pageEnter }">
    <!-- 页面内容 -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      pageEnter: true  // 初始值为true，首次加载即触发动画
    }
  },
  onShow() {
    this.pageEnter = true                    // 每次显示时重置为true
    setTimeout(() => { this.pageEnter = false }, 400)  // 400ms后移除class
  }
}
</script>
```

---

## 🚀 待办事项（TODO）

### 高优先级

- [ ] **不做饭模式图片云存储**
  - 当前：图片仅存在本地临时路径（tempFilePath）
  - 目标：上传至微信云存储，生成永久 URL
  - 方案：调用 `wx.cloud.uploadFile()` API
  - 影响：搭子端可持久查看历史分享

- [ ] **搭子端接收流程完善**
  - 当前：搭子分享存入 partner_feed 缓存（模拟）
  - 目标：通过云数据库实时推送
  - 方案：saveShareMenu 时写入 share_menus 集合，搭子端轮询或监听

- [ ] **基于偏好的菜品过滤**
  - 当前：生成菜品时未考虑过敏原/禁忌/菜系偏好
  - 目标：读取 detailed_prefs，过滤掉不匹配的菜品
  - 实现：在 balanced() 方法前增加 filter 步骤

### 中优先级

- [ ] **营养均衡算法精细化**
  - 当前：简单的 55:45 随机分配
  - 目标：考虑卡路里总量控制、蛋白质最低保障
  - 方案：引入权重评分系统

- [ ] **菜品数据扩展**
  - 当前：20道菜（早餐8 + 午餐7 + 晚餐5）
  - 目标：扩展至 50+ 道，覆盖更多菜系
  - 影响：降低重复率，提升用户体验

- [ ] **离线模式优化**
  - 当前：完全依赖本地缓存
  - 目标：Service Worker 缓存策略，支持断网使用

### 低优先级

- [ ] 深色模式适配（Dark Mode）
- [ ] 国际化（i18n）支持
- [ ] 小程序码分享（生成带参数的小程序码）
- [ ] 数据统计面板（用户行为分析）
- [ ] 餐厅推荐集成（接入美团/大众点评API）

---

## 🐛 已知问题

| 问题 | 严重程度 | 状态 | 备注 |
|------|----------|------|------|
| icons.js 定义了非绿色系颜色常量（warning/danger/info/purple） | 低 | 可接受 | 当前未在页面中使用，保留供未来可能的功能扩展 |
| index.vue 中 pageEnter 动画重复定义（与 App.vue 全局定义重复） | 低 | 可接受 | 不影响功能，浏览器/CSS 会以后定义为准 |
| 不做饭模式下图片仅为临时路径 | 中 | 待修复 | 重启小程序后会丢失（TODO第1项） |
| 搭子分享为模拟数据（partner_feed） | 中 | 待修复 | 需要真实的云端推送机制（TODO第2项） |

---

## 📝 开发注意事项

### Node.js 兼容性

如果使用 Node.js v22+，需要 patch 编译工具链：

```javascript
// 文件：node_modules/@dcloudio/uni-mp-vite/dist/index.js
// 位置：约第109行
// 将 node: 前缀移除或降级 Node 版本至 20.x
```

### 微信开发者工具设置

1. **不校验合法域名**：开发阶段需勾选「详情 → 本地设置 → 不校验合法域名」
2. **云开发环境**：确保云函数环境 ID 为 `foodfind-cloud`
3. **ES6 转 ES5**：建议勾选（兼容旧版微信客户端）

### 性能优化建议

1. **菜谱数据**：已本地化（constants.js），无需网络请求 ✅
2. **图片资源**：使用 emoji 替代真实图片（减少包体积）✅
3. **云函数调用**：仅在配对/分享时触发（约4次/交互）✅
4. **动画性能**：使用 transform + opacity（触发 GPU 加速）✅
5. **列表渲染**：使用 :key 绑定唯一 ID（优化 diff 算法）✅

---

## 📄 许可证

本项目仅供学习和交流使用。

---

## 🙏 致谢

- **UniApp 团队**：提供优秀的跨平台开发框架
- **微信团队**：提供强大的云开发能力
- **所有测试用户**：提供的宝贵反馈意见

---

## 📞 联系方式

- **AppID**：`wx76ea0fc78e202d6b`
- **云开发环境**：`foodfind-cloud`
- **最后更新**：2026-04-22
- **当前版本**：v2.5.3（交互体验优化版）

---

> 🎉 **感谢使用「吃点啥」！希望这个小程序能帮你和TA轻松决定每一顿饭吃什么~**
