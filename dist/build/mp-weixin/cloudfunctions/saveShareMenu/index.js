const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => { try { const shareId = 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2,9); await db.collection('share_menus').add({ data: { shareId, fromOpenid: cloud.getWXContext().OPENID, fromName: event.fromName || '我', toName: event.toName || 'TA', meals: event.meals || {}, status: 'pending', createdAt: new Date() } }); return { code: 0, shareId } } catch (e) { return { code: -1, error: e.message } } }
