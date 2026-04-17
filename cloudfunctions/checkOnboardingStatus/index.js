const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { userId } = event
  const wxContext = cloud.getWXContext()
  
  try {
    const userRes = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()
    
    if (userRes.data.length > 0) {
      const user = userRes.data[0]
      return {
        isNewUser: user.is_new_user === true,
        onboardingCompleted: user.onboarding_completed === true
      }
    }
    
    return {
      isNewUser: true,
      onboardingCompleted: false
    }
  } catch (err) {
    console.error(err)
    return {
      error: err.message,
      isNewUser: true,
      onboardingCompleted: false
    }
  }
}
