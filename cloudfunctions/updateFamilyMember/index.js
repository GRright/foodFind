// 云函数：更新家庭成员信息
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, healthTags, name } = event

  try {
    const family = await db.collection('families').doc(familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    const memberIndex = family.data.members.findIndex(m => m.userId === OPENID)
    if (memberIndex === -1) {
      return { success: false, error: '不是家庭成员' }
    }

    // 构建更新字段
    const updateFields = {}
    if (healthTags !== undefined) updateFields[`members.${memberIndex}.healthTags`] = healthTags
    if (name !== undefined) updateFields[`members.${memberIndex}.name`] = name
    updateFields.updatedAt = new Date()

    await db.collection('families').doc(familyId).update({
      data: updateFields
    })

    // 返回更新后的家庭数据
    const updatedFamily = await db.collection('families').doc(familyId).get()

    return {
      success: true,
      familyData: updatedFamily.data
    }
  } catch (err) {
    console.error('更新成员信息失败:', err)
    return { success: false, error: err.message }
  }
}
