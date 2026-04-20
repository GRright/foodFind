const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { pairId, type, title, creatorName } = event
    if (!pairId || !type) return { code: -1, error: 'Missing params' }
    
    const challengeId = 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    await db.collection('challenges').add({
      data: {
        challengeId,
        pairId,
        type,
        title: title || '',
        creatorName: creatorName || '我',
        creatorOpenid: cloud.getWXContext().OPENID,
        participants: [cloud.getWXContext().OPENID],
        scores: {},
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    })
    
    return { code: 0, challengeId }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
