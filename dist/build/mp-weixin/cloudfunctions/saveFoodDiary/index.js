const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { date, meals, mood, rating, note } = event
    if (!date) return { code: -1, error: 'Missing date' }
    
    const openid = cloud.getWXContext().OPENID
    const existing = await db.collection('foodDiaries')
      .where({ openid, date })
      .get()
    
    if (existing.data.length > 0) {
      await db.collection('foodDiaries').doc(existing.data[0]._id).update({
        data: { meals, mood, rating, note, updatedAt: new Date() }
      })
    } else {
      await db.collection('foodDiaries').add({
        data: {
          openid,
          date,
          meals: meals || [],
          mood: mood || '',
          rating: rating || 0,
          note: note || '',
          createdAt: new Date()
        }
      })
    }
    
    return { code: 0 }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
