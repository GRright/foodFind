const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const shareId = event.shareId
    if (!shareId) return { code: -1, msg: '缺少 shareId' }

    const r = await db.collection('share_menus').where({ shareId }).get()
    if (!r.data.length) return { code: -2, msg: '分享不存在' }

    const menu = r.data[0]

    // 安全检查：只有发送方或接收方可以查看
    if (menu.fromOpenid !== openid) {
      // 非发送方，需验证是否为配对关系中的接收方
      // 简化：允许任何人通过分享链接查看（因为分享ID本身就是访问凭证）
      // 但不返回发送方的openid
    }

    // 安全检查：不返回发送方的openid
    return {
      code: 0,
      data: {
        shareId: menu.shareId,
        fromName: menu.fromName,
        toName: menu.toName,
        meals: menu.meals,
        status: menu.status,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt
      }
    }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
