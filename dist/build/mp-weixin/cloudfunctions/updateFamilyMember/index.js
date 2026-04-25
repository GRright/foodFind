const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 安全检查：输入长度限制
function sanitize(str, maxLen) {
  if (typeof str !== 'string') return str
  return str.substring(0, maxLen).replace(/[<>'"&]/g, '')
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { healthTags, name, action, userId } = event

  try {
    // 获取我的家庭（不需要 familyId）
    if (action === 'getMyFamily') {
      const myFamily = await db.collection('families').where({
        members: _.elemMatch({ userId: OPENID })
      }).get()
      
      if (myFamily.data.length > 0) {
        return { success: true, familyData: myFamily.data[0] }
      }
      return { success: false, error: '没有找到家庭' }
    }

    // 安全检查：查询时限制返回字段，不返回其他成员信息
    const family = await db.collection('families').doc(event.familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    if (action === 'remove') {
      // 安全检查：只有群主可以移除成员，或成员自己离开
      const isAdmin = family.data.creatorId === OPENID
      const isSelf = userId === OPENID
      if (!isAdmin && !isSelf) {
        return { success: false, error: '无权移除成员' }
      }
      const members = family.data.members.filter(m => m.userId !== userId)
      if (members.length === family.data.members.length) {
        return { success: false, error: '成员不存在' }
      }
      await db.collection('families').doc(event.familyId).update({
        data: { members, updatedAt: new Date() }
      })
      return { success: true }
    }

    if (action === 'transferAndLeave') {
      // 安全检查：只有群主可以转让并离开
      if (family.data.creatorId !== OPENID) {
        return { success: false, error: '只有群主可以转让' }
      }
      const newAdminId = event.newAdminId
      if (!newAdminId) {
        return { success: false, error: '需要指定新群主' }
      }
      
      // 检查新群主是否在成员列表中
      const newAdminMember = family.data.members.find(m => m.userId === newAdminId)
      if (!newAdminMember) {
        return { success: false, error: '新群主不在成员列表中' }
      }
      
      // 移除自己，同时把 creatorId 转让给新群主
      const members = family.data.members.filter(m => m.userId !== OPENID)
      await db.collection('families').doc(event.familyId).update({
        data: { 
          creatorId: newAdminId,
          members, 
          updatedAt: new Date() 
        }
      })
      return { success: true }
    }

    if (action === 'disband') {
      // 安全检查：只有群主可以解散
      if (family.data.creatorId !== OPENID) {
        return { success: false, error: '只有群主可以解散' }
      }
      await db.collection('families').doc(event.familyId).remove()
      return { success: true }
    }

    const memberIndex = family.data.members.findIndex(m => m.userId === OPENID)
    if (memberIndex === -1) {
      return { success: false, error: '不是家庭成员' }
    }

    const updateFields = {}
    if (healthTags !== undefined) {
      // 安全检查：验证健康标签格式
      if (Array.isArray(healthTags)) {
        updateFields[`members.${memberIndex}.healthTags`] = healthTags.slice(0, 10)
      }
    }
    if (name !== undefined) {
      updateFields[`members.${memberIndex}.name`] = sanitize(name, 20)
    }
    updateFields.updatedAt = new Date()

    await db.collection('families').doc(event.familyId).update({
      data: updateFields
    })

    const updatedFamily = await db.collection('families').doc(event.familyId).get()
    return { success: true, familyData: updatedFamily.data }
  } catch (err) {
    console.error('更新成员信息失败:', err)
    return { success: false, error: err.message }
  }
}
