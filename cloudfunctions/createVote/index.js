const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { pairId, title, options, creatorName } = event
    if (!pairId || !title || !options) return { code: -1, error: 'Missing params' }
    
    const voteId = 'vote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    await db.collection('votes').add({
      data: {
        voteId,
        pairId,
        title,
        options: options.map(opt => ({
          text: opt,
          voters: [],
          count: 0
        })),
        creatorName: creatorName || 'æˆ?,
        creatorOpenid: cloud.getWXContext().OPENID,
        status: 'active',
        createdAt: new Date()
      }
    })
    
    return { code: 0, voteId }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
