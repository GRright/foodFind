const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
exports.main = async () => ({ code: 0, openid: cloud.getWXContext().OPENID })
