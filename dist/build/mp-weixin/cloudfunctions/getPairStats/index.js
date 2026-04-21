const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
exports.main = async (event) => {
  try {
    let pid=event.pairId;if(!pid){const r=await db.collection('pairs').where(db.command.or([{inviterOpenid:cloud.getWXContext().OPENID},{accepterOpenid:cloud.getWXContext().OPENID}])).get();if(r.data.length===0)return{code:0,data:null};pid=r.data[0].pairId}
    const sr=await db.collection('pair_stats').where({pairId:pid}).get()
    if(sr.data.length===0)return{code:0,data:{pairId:pid,consecutiveShareDays:0,consecutiveOpenDays:0,totalShareDays:0,totalOpenDays:0,longestShareStreak:0,longestOpenStreak:0,firstPairDate:null,lastActiveDate:null,todaySpark:0}}
    const s=sr.data[0],t=new Date().toISOString().split('T')[0],tr=await db.collection('daily_checkins').where({pairId:pid,date:t}).get()
    return{code:0,data:{...s,todaySpark:tr.data.length>0?tr.data[0].sparkLevel:0}}
  }catch(e){return{code:-1,error:e.message}}
}
