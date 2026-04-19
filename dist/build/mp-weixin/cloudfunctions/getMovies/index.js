const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
exports.main = async () => { try { const r = await db.collection('movies').limit(10).get(); return { code: 0, data: r.data } } catch (e) { return { code: -1, error: e.message } } }
