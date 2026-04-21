// 云函数：同步家庭购物清单
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, action, item, items } = event

  try {
    // 验证是否是家庭成员
    const family = await db.collection('families').doc(familyId).get()
    if (!family.data) {
      return { success: false, error: '家庭不存在' }
    }

    const isMember = family.data.members.some(m => m.userId === OPENID)
    if (!isMember) {
      return { success: false, error: '不是家庭成员' }
    }

    let shoppingList

    if (action === 'get') {
      // 获取购物清单
      const result = await db.collection('familyShopping').where({ familyId }).get()
      shoppingList = result.data.length > 0 ? result.data[0] : { items: [] }
      
      return {
        success: true,
        shoppingList
      }
    } else if (action === 'update') {
      // 更新整个清单
      const existing = await db.collection('familyShopping').where({ familyId }).get()
      
      if (existing.data.length > 0) {
        await db.collection('familyShopping').doc(existing.data[0]._id).update({
          data: {
            items,
            updatedAt: new Date(),
            updatedBy: OPENID
          }
        })
      } else {
        await db.collection('familyShopping').add({
          data: {
            familyId,
            items,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: OPENID
          }
        })
      }

      return { success: true }
    } else if (action === 'addItem') {
      // 添加单项
      const existing = await db.collection('familyShopping').where({ familyId }).get()
      
      if (existing.data.length > 0) {
        await db.collection('familyShopping').doc(existing.data[0]._id).update({
          data: {
            items: _.push(item),
            updatedAt: new Date(),
            updatedBy: OPENID
          }
        })
      } else {
        await db.collection('familyShopping').add({
          data: {
            familyId,
            items: [item],
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: OPENID
          }
        })
      }

      return { success: true }
    }

    return { success: false, error: '未知操作' }
  } catch (err) {
    console.error('同步购物清单失败:', err)
    return { success: false, error: err.message }
  }
}
