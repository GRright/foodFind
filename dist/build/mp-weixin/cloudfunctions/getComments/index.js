const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { feedId } = event
    if (!feedId) return { code: -1, error: 'Missing feedId' }
    
    const res = await db.collection('comments')
      .where({ feedId })
      .orderBy('createdAt', 'asc')
      .get()
    
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
