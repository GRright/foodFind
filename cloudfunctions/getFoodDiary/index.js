const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { startDate, endDate } = event
    const openid = cloud.getWXContext().OPENID
    
    const query = { openid }
    if (startDate && endDate) {
      query.date = db.command.gte(startDate).and(db.command.lte(endDate))
    }
    
    const res = await db.collection('foodDiaries')
      .where(query)
      .orderBy('date', 'desc')
      .get()
    
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
