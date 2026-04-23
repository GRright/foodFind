const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { pairId, type, content, fromName } = event
    if (!pairId) return { code: -1, error: 'Missing pairId' }
    
    await db.collection('notifications').add({
      data: {
        pairId,
        type,
        content,
        fromName: fromName || 'æˆ?,
        fromOpenid: cloud.getWXContext().OPENID,
        read: false,
        createdAt: new Date()
      }
    })
    
    return { code: 0 }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
