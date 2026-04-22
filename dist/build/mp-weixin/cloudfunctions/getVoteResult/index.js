const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { voteId } = event
    if (!voteId) return { code: -1, error: 'Missing voteId' }
    
    const res = await db.collection('votes').where({ voteId }).get()
    if (!res.data.length) return { code: -2, error: 'Vote not found' }
    
    return { code: 0, data: res.data[0] }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
