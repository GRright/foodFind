// 云函数：发送家庭通知
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, type, content, targetUserId } = event

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

    // 获取发送者姓名
    const sender = family.data.members.find(m => m.userId === OPENID)
    const senderName = sender ? sender.name : '未知'

    // 创建通知
    const notifications = family.data.members
      .filter(m => m.userId !== OPENID) // 不给自己发通知
      .filter(m => !targetUserId || m.userId === targetUserId) // 如果指定了目标用户，只发给该用户
      .map(member => ({
        familyId,
        userId: member.userId,
        type,
        content,
        senderId: OPENID,
        senderName,
        createdAt: new Date(),
        read: false
      }))

    // 批量插入通知
    if (notifications.length > 0) {
      const addPromises = notifications.map(n => 
        db.collection('familyNotifications').add({ data: n })
      )
      await Promise.all(addPromises)
    }

    return { 
      success: true, 
      sentCount: notifications.length 
    }
  } catch (err) {
    console.error('发送通知失败:', err)
    return { success: false, error: err.message }
  }
}
