const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { openid, nickname, avatar } = event
  const wxContext = cloud.getWXContext()
  
  try {
    const userRes = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()
    
    if (userRes.data.length > 0) {
      const user = userRes.data[0]
      return {
        user: {
          id: user._id,
          openid: user._openid,
          nickname: user.nickname,
          avatar: user.avatar,
          is_new_user: user.is_new_user || false,
          onboarding_completed: user.onboarding_completed || false
        }
      }
    } else {
      const newUser = {
        _openid: wxContext.OPENID,
        nickname: nickname || '美食爱好者',
        avatar: avatar || '',
        is_new_user: true,
        onboarding_completed: false,
        createTime: db.serverDate()
      }
      
      const addRes = await db.collection('users').add({
        data: newUser
      })
      
      return {
        user: {
          id: addRes._id,
          openid: wxContext.OPENID,
          nickname: newUser.nickname,
          avatar: newUser.avatar,
          is_new_user: true,
          onboarding_completed: false
        }
      }
    }
  } catch (err) {
    console.error(err)
    return {
      error: err.message
    }
  }
}
