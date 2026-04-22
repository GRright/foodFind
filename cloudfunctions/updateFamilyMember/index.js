const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, healthTags, name, action, userId } = event

  try {
    const family = await db.collection('families').doc(familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    if (action === 'remove') {
      const members = family.data.members.filter(m => m.userId !== userId)
      if (members.length === family.data.members.length) {
        return { success: false, error: '成员不存在' }
      }
      await db.collection('families').doc(familyId).update({
        data: { members, updatedAt: new Date() }
      })
      return { success: true }
    }

    if (action === 'disband') {
      await db.collection('families').doc(familyId).remove()
      return { success: true }
    }

    const memberIndex = family.data.members.findIndex(m => m.userId === OPENID)
    if (memberIndex === -1) {
      return { success: false, error: '不是家庭成员' }
    }

    const updateFields = {}
    if (healthTags !== undefined) updateFields[`members.${memberIndex}.healthTags`] = healthTags
    if (name !== undefined) updateFields[`members.${memberIndex}.name`] = name
    updateFields.updatedAt = new Date()

    await db.collection('families').doc(familyId).update({
      data: updateFields
    })

    const updatedFamily = await db.collection('families').doc(familyId).get()
    return { success: true, familyData: updatedFamily.data }
  } catch (err) {
    console.error('更新成员信息失败:', err)
    return { success: false, error: err.message }
  }
}
