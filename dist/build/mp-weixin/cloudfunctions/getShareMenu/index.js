const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => { try { const r = await db.collection('share_menus').where({ shareId: event.shareId }).get(); if (!r.data.length) return { code: -2 }; return { code: 0, data: r.data[0] } } catch (e) { return { code: -1, error: e.message } } }
