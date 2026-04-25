// 云函数：记录家庭打卡
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, date, mealType, state } = event
  const checkState = state !== undefined ? state : true

  try {
    const family = await db.collection('families').doc(familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    const isMember = family.data.members.some(m => m.userId === OPENID)
    if (!isMember) {
      return { success: false, error: '不是家庭成员' }
    }

    const existingCheckIn = await db.collection('checkins').where({
      familyId,
      date,
      userId: OPENID
    }).get()

    if (existingCheckIn.data.length > 0) {
      const checkInId = existingCheckIn.data[0]._id
      await db.collection('checkins').doc(checkInId).update({
        data: {
          [mealType]: checkState,
          updatedAt: new Date()
        }
      })
    } else {
      await db.collection('checkins').add({
        data: {
          familyId,
          userId: OPENID,
          userName: getMemberName(family.data, OPENID),
          date,
          breakfast: mealType === 'breakfast' ? checkState : false,
          lunch: mealType === 'lunch' ? checkState : false,
          dinner: mealType === 'dinner' ? checkState : false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return { success: true }
  } catch (err) {
    console.error('记录打卡失败:', err)
    return { success: false, error: err.message }
  }
}

function getMemberName(family, userId) {
  const member = family.members.find(m => m.userId === userId)
  return member ? member.name : '未知'
}
