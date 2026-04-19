const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
const _ = db.command
exports.main = async () => { try { const r = await db.collection('pairs').where(_.or([{ inviterOpenid: cloud.getWXContext().OPENID }, { accepterOpenid: cloud.getWXContext().OPENID }])).get(); if (!r.data.length) return { code: 0, data: null }; const p = r.data[0]; return { code: 0, data: { pairId: p.pairId, partnerOpenid: p.inviterOpenid === cloud.getWXContext().OPENID ? p.accepterOpenid : p.inviterOpenid, relationType: p.relationType || 'friend', status: p.status } } } catch (e) { return { code: -1, error: e.message } } }
