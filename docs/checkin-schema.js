// 互动打卡系统 - 数据结构设计文档
// 版本: v1.5.0
// 功能: 提升用户粘性的社交打卡功能

/*
===========================================
  1. daily_checkins 集合 - 每日打卡记录
===========================================
*/
const DailyCheckInSchema = {
  _id: 'auto',
  pairId: 'pair_xxx',                    // 配对ID
  date: '2026-04-19',                     // 日期 YYYY-MM-DD
  members: [
    {
      openid: 'user_a_openid',
      nickname: '小明',
      hasOpenedApp: true,                 // 是否打开应用
      openTime: '2026-04-19T08:30:00Z',   // 打开时间
      hasSharedFood: true,                // 是否分享美食
      shareTime: '2026-04-19T12:00:00Z',  // 分享时间
      meals: {
        breakfast: {
          eaten: true,                    // 是否标记已吃
          eatTime: '08:30',              // 吃的时间
          recipeId: 1,                   // 吃的菜品ID（可选）
          photo: ''                      // 拍照记录（可选）
        },
        lunch: {
          eaten: false,
          eatTime: '',
          recipeId: null,
          photo: ''
        },
        dinner: {
          eaten: false,
          eatTime: '',
          recipeId: null,
          photo: ''
        }
      }
    },
    {
      openid: 'user_b_openid',
      nickname: '小红',
      hasOpenedApp: true,
      openTime: '2026-04-19T09:15:00Z',
      hasSharedFood: false,
      shareTime: null,
      meals: { /* 同上 */ }
    }
  ],
  // 计算字段（由云函数计算）
  allOpened: false,                       // 所有人都打开了应用
  allShared: false,                       // 所有人都分享了美食
  allBreakfastEaten: false,               // 所有人都吃了早餐
  allLunchEaten: false,                   // 所有人都吃了午餐
  allDinnerEaten: false,                  // 所有人都吃了晚餐
  sparkLevel: 0,                          // 火花等级 (0-3)
  createdAt: new Date(),
  updatedAt: new Date()
}

/*
===========================================
  2. pair_stats 集合 - 配对统计数据
===========================================
*/
const PairStatsSchema = {
  _id: 'auto',
  pairId: 'pair_xxx',

  // 连续天数统计
  consecutiveShareDays: 15,               // 连续分享天数
  consecutiveOpenDays: 20,                // 连续打开应用天数
  consecutiveMealDays: {                  // 连续用餐天数（按餐）
    breakfast: 10,
    lunch: 8,
    dinner: 12
  },

  // 总计统计
  totalShareDays: 45,                     // 总分享天数
  totalOpenDays: 60,                      // 总打开天数
  totalMealsEaten: 180,                   // 总用餐次数

  // 历史记录
  longestShareStreak: 30,                 // 最长连续分享
  longestOpenStreak: 45,                  // 最长连续打开
  firstPairDate: '2026-03-01',            // 首次配对日期

  // 火花等级说明:
  // 0: 无火花（当天无互动）
  // 1: 🔥 单火花（一方完成）
  // 2: 🔥🔥 双火花（双方完成，连续1-6天）
  // 3: 💎 超级火花（连续7天+）

  updatedAt: new Date()
}

/*
===========================================
  3. 火花等级规则
===========================================
Spark Level Rules:
┌─────────────┬──────────────────────────────────────┐
│ Level       │ 条件                                  │
├─────────────┼──────────────────────────────────────┤
│ 0 (无)      │ 当天无人完成任何互动                    │
│ 1 (单火花)  │ 至少一人完成了分享/打开/用餐            │
│ 2 (双火花)  │ 双方都完成了同一项互动，且连续1-6天     │
│ 3 (超级)    │ 双方都完成且连续≥7天                   │
└─────────────┴──────────────────────────────────────┘

日历显示示例:
┌──────────────────────────────────┐
│  一     二     三     四     五  │
│  14     15     16     17    18  │
│         🔥     🔥🔥   🔥🔥  🔥  │  ← 火花标记
│  19                               │
│  🔥💎                             │  ← 今天超级火花(连续8天)
└──────────────────────────────────┘
*/

module.exports = {
  DailyCheckInSchema,
  PairStatsSchema
}
