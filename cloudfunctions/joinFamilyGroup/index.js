// 云函数：加入家庭群组
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { inviteCode, userName } = event

  try {
    // 查找对应邀请码的家庭
    const familyResult = await db.collection('families').where({
      inviteCode: inviteCode
    }).get()

    if (familyResult.data.length === 0) {
      return {
        success: false,
        error: '邀请码无效'
      }
    }

    const family = familyResult.data[0]
    const familyType = getFamilyTypeConfig(family.type)

    // 检查人数限制
    if (family.members.length >= familyType.maxMembers) {
      return {
        success: false,
        error: `家庭人数已满（${familyType.maxMembers}人）`
      }
    }

    // 检查是否已经是成员
    const isAlreadyMember = family.members.some(m => m.userId === OPENID)
    if (isAlreadyMember) {
      return {
        success: false,
        error: '您已经是该家庭的成员'
      }
    }

    // 检查用户是否属于其他家庭
    const otherFamily = await db.collection('families').where({
      members: _.elemMatch({ userId: OPENID })
    }).get()

    if (otherFamily.data.length > 0) {
      return {
        success: false,
        error: '您已经属于另一个家庭群组'
      }
    }

    // 添加新成员
    await db.collection('families').doc(family._id).update({
      data: {
        members: _.push({
          userId: OPENID,
          name: userName || '新成员',
          role: 'member',
          healthTags: [],
          joinedAt: new Date()
        }),
        updatedAt: new Date()
      }
    })

    // 获取更新后的家庭数据
    const updatedFamily = await db.collection('families').doc(family._id).get()

    return {
      success: true,
      familyId: family._id,
      familyData: updatedFamily.data
    }
  } catch (err) {
    console.error('加入家庭失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

function getFamilyTypeConfig(type) {
  const types = {
    couple: { maxMembers: 2 },
    family: { maxMembers: 8 },
    roommates: { maxMembers: 6 }
  }
  return types[type] || { maxMembers: 6 }
}
