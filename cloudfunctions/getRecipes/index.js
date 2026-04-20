const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => {
  try {
    const { type } = event
    if (type === 'all') { const r = await db.collection('recipes').get(); return { code: 0, data: r.data } }
    if (['breakfast','lunch','dinner'].includes(type)) { const r = await db.collection('recipes').where({ meal_type: type }).get(); return { code: 0, data: r.data } }
    return { code: -1, error: 'Invalid type' }
  } catch (e) { return { code: -1, error: e.message } }
}
