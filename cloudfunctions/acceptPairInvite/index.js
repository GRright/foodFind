const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
exports.main = async (event) => { try { const r = await db.collection('pairs').where({ pairId: event.pairId }).get(); if (!r.data.length) return { code: -2 }; if (r.data[0].status !== 'pending') return { code: -3 }; if (r.data[0].inviterOpenid === cloud.getWXContext().OPENID) return { code: -4 }; await db.collection('pairs').where({ pairId: event.pairId }).update({ data: { accepterOpenid: cloud.getWXContext().OPENID, accepterName: event.accepterName || 'TA', status: 'paired', pairedAt: new Date() } }); return { code: 0, pairId: event.pairId } } catch (e) { return { code: -1, error: e.message } } }
