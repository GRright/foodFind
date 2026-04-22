const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId } = event

  try {
    // 安全检查：查询时不返回邀请码
    const family = await db.collection('families').doc(familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    const isMember = family.data.members.some(m => m.userId === OPENID)
    if (!isMember) {
      return { success: false, error: '不是家庭成员' }
    }

    // 安全检查：查询打卡记录时添加数量限制
    const query = {
      familyId,
      date: _.gte(event.startDate || '1900-01-01').and(_.lte(event.endDate || '2099-12-31'))
    }

    const checkIns = await db.collection('checkins').where(query).orderBy('date', 'desc').limit(365).get()

    // 安全检查：不返回邀请码
    const safeFamilyData = {
      _id: family.data._id,
      name: family.data.name,
      type: family.data.type,
      creatorId: family.data.creatorId,
      members: family.data.members.map(m => ({
        userId: m.userId,
        name: m.name,
        role: m.role,
        healthTags: m.healthTags || [],
        joinedAt: m.joinedAt
      })),
      createdAt: family.data.createdAt
    }

    return {
      success: true,
      checkIns: checkIns.data,
      familyData: safeFamilyData
    }
  } catch (err) {
    console.error('获取打卡记录失败:', err)
    return { success: false, error: err.message }
  }
}
