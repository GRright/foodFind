const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { pairId } = event
    if (!pairId) return { code: -1, error: 'Missing pairId' }
    
    const res = await db.collection('recommendations')
      .where({ pairId })
      .orderBy('createdAt', 'desc')
      .get()
    
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
