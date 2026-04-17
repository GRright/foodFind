const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { user_id, answers } = event
  const wxContext = cloud.getWXContext()
  
  try {
    for (const answer of answers) {
      await db.collection('onboarding_answers').add({
        data: {
          _openid: wxContext.OPENID,
          user_id: user_id,
          question_id: answer.question_id,
          answer: answer.value,
          createTime: db.serverDate()
        }
      })
    }
    
    await db.collection('users').where({
      _openid: wxContext.OPENID
    }).update({
      data: {
        is_new_user: false,
        onboarding_completed: true,
        updateTime: db.serverDate()
      }
    })
    
    return {
      success: true
    }
  } catch (err) {
    console.error(err)
    return {
      error: err.message,
      success: false
    }
  }
}
