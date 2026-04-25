const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const { pairId, limit = 20 } = event
    
    let notifications = []
    
    if (pairId) {
      const res = await db.collection('notifications')
        .where({ pairId })
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()
      notifications = notifications.concat(res.data || [])
    }
    
    const familyRes = await db.collection('familyNotifications')
      .where({ userId: OPENID })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
    notifications = notifications.concat(familyRes.data || [])
    
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return { code: 0, data: notifications.slice(0, limit) }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
