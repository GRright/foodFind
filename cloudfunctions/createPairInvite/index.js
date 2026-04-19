const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
exports.main = async (event) => { try { const pairId = 'pair_' + Date.now() + '_' + Math.random().toString(36).substr(2,9); await db.collection('pairs').add({ data: { pairId, inviterOpenid: cloud.getWXContext().OPENID, inviterName: event.inviterName || '我', accepterOpenid: '', accepterName: '', relationType: event.relationType || 'friend', status: 'pending', createdAt: new Date() } }); return { code: 0, pairId } } catch (e) { return { code: -1, error: e.message } } }
