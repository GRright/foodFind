// 云函数：创建家庭群组
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { name, type, userName } = event

  try {
    // 检查用户是否已经属于某个家庭
    const existingFamily = await db.collection('families').where({
      members: _.elemMatch({ userId: OPENID })
    }).get()

    if (existingFamily.data.length > 0) {
      return {
        success: false,
        error: '您已经属于一个家庭群组'
      }
    }

    // 生成 6 位邀请码
    const inviteCode = generateInviteCode()

    // 创建家庭
    const familyData = {
      name,
      type,
      inviteCode,
      creatorId: OPENID,
      members: [
        {
          userId: OPENID,
          name: userName,
          role: 'admin',
          healthTags: [],
          joinedAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('families').add({
      data: familyData
    })

    return {
      success: true,
      familyId: result._id,
      inviteCode,
      familyData
    }
  } catch (err) {
    console.error('创建家庭失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 生成 6 位邀请码
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
