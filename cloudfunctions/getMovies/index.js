const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { recipeId, mealType } = event
  
  try {
    let query = db.collection('movies')
    
    if (recipeId) {
      query = query.where({
        cuisine_match: db.RegExp({
          regexp: '.*',
          options: 'i'
        })
      })
    } else if (mealType) {
      query = query.where({
        meal_type_match: db.RegExp({
          regexp: mealType,
          options: 'i'
        })
      })
    }
    
    const res = await query.limit(20).get()
    
    return {
      movies: res.data
    }
  } catch (err) {
    console.error(err)
    return {
      error: err.message,
      movies: []
    }
  }
}
