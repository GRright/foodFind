const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
exports.main = async () => { try { const r = await db.collection('onboarding_questions').get(); return { code: 0, data: r.data } } catch (e) { return { code: -1, error: e.message } } }
