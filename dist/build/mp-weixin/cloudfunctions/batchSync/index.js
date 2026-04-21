const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => { try { const { data, collection } = event; const arr = Array.isArray(data) ? data : [data]; for (const item of arr) await db.collection(collection).add({ data: { ...item, openid: cloud.getWXContext().OPENID, syncedAt: new Date() } }); return { code: 0, count: arr.length } } catch (e) { return { code: -1, error: e.message } } }
