// 云函数：获取家庭打卡记录
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, startDate, endDate } = event

  try {
    // 验证是否是家庭成员
    const family = await db.collection('families').doc(familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    const isMember = family.data.members.some(m => m.userId === OPENID)
    if (!isMember) {
      return { success: false, error: '不是家庭成员' }
    }

    // 查询打卡记录
    const query = {
      familyId,
      date: _.gte(startDate).and(_.lte(endDate))
    }

    const checkIns = await db.collection('checkins').where(query).get()

    return {
      success: true,
      checkIns: checkIns.data
    }
  } catch (err) {
    console.error('获取打卡记录失败:', err)
    return { success: false, error: err.message }
  }
}
