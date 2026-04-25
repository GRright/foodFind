const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 允许批量同步的集合白名单（防止用户写入任意集合）
const ALLOWED_COLLECTIONS = [
  'personal_checks',
  'daily_meals',
  'user_prefs',
  'user_favorites',
  'user_special_dates',
  'weekly_menus',
  'user_my_info'
]

exports.main = async (event) => {
  try {
    const { data, collection, action } = event
    const openid = cloud.getWXContext().OPENID

    // 安全检查：白名单校验
    if (!ALLOWED_COLLECTIONS.includes(collection)) {
      return { code: -1, error: '无权操作此集合' }
    }

    // 安全检查：数据大小限制（防止大对象攻击）
    const dataStr = JSON.stringify(data)
    if (dataStr.length > 50000) {
      return { code: -1, error: '数据过大' }
    }

    if (action === 'get') {
      let query = db.collection(collection).where({ openid })
      
      if (event.targetOpenid && ALLOWED_COLLECTIONS.includes(collection)) {
        const family = await db.collection('families').where({
          members: _.elemMatch({ userId: openid })
        }).get()
        
        if (family.data.length > 0) {
          const isFamilyMember = family.data[0].members.some(m => m.userId === event.targetOpenid)
          if (isFamilyMember) {
            query = db.collection(collection).where({ openid: event.targetOpenid })
          }
        }
      }
      
      const r = await query.orderBy('syncedAt', 'desc').limit(1).get()
      if (r.data.length > 0) {
        return { code: 0, data: r.data[0] }
      }
      return { code: 0, data: null }
    }

    const arr = Array.isArray(data) ? data : [data]

    // 安全检查：批量操作数量限制
    if (arr.length > 10) {
      return { code: -1, error: '批量操作数量超限' }
    }

    let upserted = 0

    for (const item of arr) {
      const existing = await db.collection(collection).where({ openid }).limit(1).get()
      if (existing.data.length > 0) {
        await db.collection(collection).doc(existing.data[0]._id).update({
          data: { ...item, openid, syncedAt: new Date() }
        })
      } else {
        await db.collection(collection).add({
          data: { ...item, openid, syncedAt: new Date() }
        })
      }
      upserted++
    }

    return { code: 0, count: upserted }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
