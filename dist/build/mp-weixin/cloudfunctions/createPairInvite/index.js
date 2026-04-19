const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
const _ = db.command
exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const existing = await db.collection('pairs').where({
      inviterOpenid: openid,
      status: 'pending'
    }).get()
    if (existing.data.length > 0) {
      return { code: -2, msg: '你已有一个待接受的邀请', pairId: existing.data[0].pairId }
    }
    const pairId = 'pair_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    await db.collection('pairs').add({
      data: {
        pairId,
        inviterOpenid: openid,
        inviterName: event.inviterName || '我',
        accepterOpenid: '',
        accepterName: '',
        relationType: event.relationType || 'friend',
        status: 'pending',
        createdAt: new Date()
      }
    })
    return { code: 0, pairId }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
