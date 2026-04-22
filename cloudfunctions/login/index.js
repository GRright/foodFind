const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
exports.main = async () => ({ code: 0, openid: cloud.getWXContext().OPENID })
