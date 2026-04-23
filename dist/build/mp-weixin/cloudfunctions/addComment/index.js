const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { feedId, content, fromName } = event
    if (!feedId || !content) return { code: -1, error: 'Missing params' }
    
    await db.collection('comments').add({
      data: {
        feedId,
        content,
        fromName: fromName || 'æˆ?,
        fromOpenid: cloud.getWXContext().OPENID,
        createdAt: new Date()
      }
    })
    
    return { code: 0 }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
