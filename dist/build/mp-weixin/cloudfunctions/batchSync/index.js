const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  try {
    const { data, collection, action } = event
    const openid = cloud.getWXContext().OPENID

    if (action === 'get') {
      const r = await db.collection(collection).where({ openid }).orderBy('syncedAt', 'desc').limit(1).get()
      if (r.data.length > 0) {
        return { code: 0, data: r.data[0] }
      }
      return { code: 0, data: null }
    }

    const arr = Array.isArray(data) ? data : [data]
    let upserted = 0

    for (const item of arr) {
      const existing = await db.collection(collection).where({ openid }).limit(1).get()
      if (existing.data.length > 0) {
        await db.collection(collection).doc(existing.data[0]._id).update({
          data: { ...item, openid, syncedAt: new Date() }
        })
      } else {
        await db.collection(collection).add({
          data: { ...item, openid, syncedAt: new Date() }
        })
      }
      upserted++
    }

    return { code: 0, count: upserted }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
