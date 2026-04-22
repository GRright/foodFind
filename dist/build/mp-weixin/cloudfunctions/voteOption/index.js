const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const { voteId, optionIndex } = event
    if (!voteId || optionIndex === undefined) return { code: -1, error: 'Missing params' }
    
    const openid = cloud.getWXContext().OPENID
    const res = await db.collection('votes').where({ voteId }).get()
    
    if (!res.data.length) return { code: -2, error: 'Vote not found' }
    
    const vote = res.data[0]
    if (vote.status !== 'active') return { code: -3, error: 'Vote closed' }
    
    const alreadyVoted = vote.options.some(opt => opt.voters.includes(openid))
    if (alreadyVoted) return { code: -4, error: 'Already voted' }
    
    const options = vote.options
    options[optionIndex].voters.push(openid)
    options[optionIndex].count += 1
    
    await db.collection('votes').doc(vote._id).update({
      data: { options }
    })
    
    return { code: 0, data: options }
  } catch (e) {
    return { code: -1, error: e.message }
  }
}
