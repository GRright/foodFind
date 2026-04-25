const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 安全检查：输入清洗
function sanitize(str, maxLen) {
  if (typeof str !== 'string') return str
  return str.substring(0, maxLen).replace(/[<>'"&]/g, '')
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { name, type, userName } = event

  try {
    // 安全检查：输入验证
    if (!name || name.length > 30) {
      return { success: false, error: '名称格式不正确' }
    }

    // 确保集合存在（自动创建）
    try {
      await db.createCollection('families')
    } catch (e) {
      // 集合已存在或其他错误，忽略
    }

    // 检查用户是否已经属于某个家庭
    let existingFamily
    try {
      existingFamily = await db.collection('families').where({
        members: _.elemMatch({ userId: OPENID })
      }).get()
    } catch (e) {
      existingFamily = { data: [] }
    }

    if (existingFamily.data.length > 0) {
      // 如果用户是群主且是唯一的成员，自动解散旧家庭
      const oldFamily = existingFamily.data[0]
      const isOnlyMember = oldFamily.members.length === 1 && oldFamily.members[0].userId === OPENID
      const isAdmin = oldFamily.creatorId === OPENID
      
      if (isAdmin && isOnlyMember) {
        // 自动解散旧家庭
        try {
          await db.collection('families').doc(oldFamily._id).remove()
        } catch (e) {
          console.warn('自动解散旧家庭失败:', e.message)
        }
      } else {
        return { success: false, error: '您已经属于一个家庭群组' }
      }
    }

    // 生成 6 位邀请码（排除易混淆字符）
    const inviteCode = generateInviteCode()

    const familyData = {
      name: sanitize(name, 30),
      type: type || 'family',
      inviteCode,
      creatorId: OPENID,
      members: [
        {
          userId: OPENID,
          name: sanitize(userName || '群主', 20),
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
    return { success: false, error: err.message }
  }
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
