const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { challengeId } = event
    if (!challengeId) return { code: -1, error: 'Missing challengeId' }
    
    const res = await db.collection('challenges').where({ challengeId }).get()
    if (!res.data.length) return { code: -2, error: 'Challenge not found' }
    
    const challenge = res.data[0]
    const now = new Date()
    if (now > challenge.endDate && challenge.status === 'active') {
      await db.collection('challenges').doc(challenge._id).update({
        data: { status: 'finished' }
      })
      challenge.status = 'finished'
    }
    
    return { code: 0, data: challenge }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
