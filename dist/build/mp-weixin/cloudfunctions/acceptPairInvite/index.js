const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const pairId = event.pairId
    if (!pairId) return { code: -1, msg: '缺少 pairId' }
    const r = await db.collection('pairs').where({ pairId }).get()
    if (!r.data.length) return { code: -2, msg: '邀请不存在' }
    const pair = r.data[0]
    if (pair.status !== 'pending') return { code: -3, msg: pair.status === 'paired' ? '该邀请已经被接受了' : '该邀请已取消' }
    if (pair.inviterOpenid === openid) return { code: -4, msg: '不能接受自己的邀请哦~' }
    if (pair.accepterOpenid && pair.accepterOpenid !== openid) return { code: -5, msg: '该邀请已被其他人接受了' }
    await db.collection('pairs').where({ pairId }).update({
      data: {
        accepterOpenid: openid,
        accepterName: event.accepterName || event.myName || 'TA',
        status: 'paired',
        pairedAt: new Date()
      }
    })
    return {
      code: 0,
      pairId: pairId,
      data: {
        pairId: pairId,
        inviterName: pair.inviterName || '我',
        accepterName: event.accepterName || event.myName || 'TA',
        relationType: pair.relationType || 'friend',
        status: 'paired'
      }
    }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
