const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
exports.main = async () => ({ code: 0, openid: cloud.getWXContext().OPENID })
