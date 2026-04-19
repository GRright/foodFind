const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
const _ = db.command
exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const pairId = event ? event.pairId : null
    let pair
    if (pairId) {
      const r = await db.collection('pairs').where({ pairId }).get()
      if (r.data.length === 0) {
        return { code: 0, hasPair: false, data: null }
      }
      pair = r.data[0]
      if (pair.inviterOpenid !== openid && pair.accepterOpenid !== openid) {
        return { code: 0, hasPair: false, data: null }
      }
    } else {
      const r = await db.collection('pairs').where(_.or([
        { inviterOpenid: openid },
        { accepterOpenid: openid }
      ])).get()
      if (r.data.length === 0) {
        return { code: 0, hasPair: false, data: null }
      }
      pair = r.data[0]
    }
    const isInviter = pair.inviterOpenid === openid
    return {
      code: 0,
      hasPair: true,
      data: {
        pairId: pair.pairId,
        partnerName: isInviter ? (pair.accepterName || 'TA') : (pair.inviterName || '我'),
        partnerOpenid: isInviter ? pair.accepterOpenid : pair.inviterOpenid,
        inviterName: pair.inviterName || '我',
        accepterName: pair.accepterName || 'TA',
        relationType: pair.relationType || 'friend',
        status: pair.status,
        createdAt: pair.createdAt ? pair.createdAt.toLocaleString() : '',
        isInviter: isInviter
      }
    }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
