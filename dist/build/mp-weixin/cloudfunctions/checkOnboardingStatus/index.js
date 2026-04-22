const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
exports.main = async () => { try { const r = await db.collection('onboarding').where({ openid: cloud.getWXContext().OPENID }).count(); return { code: 0, completed: r.total > 0 } } catch (e) { return { code: -1, error: e.message, completed: false } } }
