const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => { try { await db.collection('onboarding').add({ data: { openid: cloud.getWXContext().OPENID, answers: event.answers, completedAt: new Date() } }); return { code: 0 } } catch (e) { return { code: -1, error: e.message } } }
