const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

function sanitize(str, maxLen) {
  if (typeof str !== 'string') return str
  return str.substring(0, maxLen).replace(/[<>'"&]/g, '')
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { inviteCode, userName } = event

  try {
    // 安全检查：邀请码格式验证（6位字母数字）
    if (!inviteCode || !/^[A-Z0-9]{6}$/.test(inviteCode)) {
      return { success: false, error: '邀请码格式不正确' }
    }

    // 确保集合存在
    try {
      await db.createCollection('families')
    } catch (e) {}

    const familyResult = await db.collection('families').where({
      inviteCode: inviteCode
    }).get()

    if (familyResult.data.length === 0) {
      return { success: false, error: '邀请码无效' }
    }

    const family = familyResult.data[0]
    const familyType = getFamilyTypeConfig(family.type)

    if (family.members.length >= familyType.maxMembers) {
      return { success: false, error: `家庭人数已满（${familyType.maxMembers}人）` }
    }

    const isAlreadyMember = family.members.some(m => m.userId === OPENID)
    if (isAlreadyMember) {
      return { success: false, error: '您已经是该家庭的成员' }
    }

    const otherFamily = await db.collection('families').where({
      members: _.elemMatch({ userId: OPENID })
    }).get()

    if (otherFamily.data.length > 0) {
      return { success: false, error: '您已经属于另一个家庭群组' }
    }

    await db.collection('families').doc(family._id).update({
      data: {
        members: _.push({
          userId: OPENID,
          name: sanitize(userName || '新成员', 20),
          role: 'member',
          healthTags: [],
          joinedAt: new Date()
        }),
        updatedAt: new Date()
      }
    })

    const updatedFamily = await db.collection('families').doc(family._id).get()

    return {
      success: true,
      familyId: family._id,
      familyData: updatedFamily.data
    }
  } catch (err) {
    console.error('加入家庭失败:', err)
    return { success: false, error: err.message }
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
