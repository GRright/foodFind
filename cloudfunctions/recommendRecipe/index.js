const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { pairId, recipeId, recipeName, fromName } = event
    if (!pairId || !recipeId) return { code: -1, error: 'Missing params' }
    
    await db.collection('recommendations').add({
      data: {
        pairId,
        recipeId,
        recipeName: recipeName || '',
        fromName: fromName || '我',
        fromOpenid: cloud.getWXContext().OPENID,
        status: 'pending',
        createdAt: new Date()
      }
    })
    
    return { code: 0 }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
