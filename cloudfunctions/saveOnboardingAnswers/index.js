const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
exports.main = async (event) => { try { await db.collection('onboarding').add({ data: { openid: cloud.getWXContext().OPENID, answers: event.answers, completedAt: new Date() } }); return { code: 0 } } catch (e) { return { code: -1, error: e.message } } }
