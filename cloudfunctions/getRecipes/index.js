const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { q } = event
  
  try {
    let query = db.collection('recipes')
    
    if (q) {
      query = query.where({
        name: db.RegExp({
          regexp: q,
          options: 'i'
        })
      })
    }
    
    const res = await query.limit(20).get()
    
    return {
      recipes: res.data
    }
  } catch (err) {
    console.error(err)
    return {
      error: err.message,
      recipes: []
    }
  }
}
