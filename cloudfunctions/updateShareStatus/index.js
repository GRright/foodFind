const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => { try { await db.collection('share_menus').where({ shareId: event.shareId }).update({ data: { status: event.status, updatedAt: new Date() } }); return { code: 0 } } catch (e) { return { code: -1, error: e.message } } }
