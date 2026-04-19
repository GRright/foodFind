const cloud = require('wx-server-sdk')
cloud.init({ env: 'foodfind-cloud' })
const db = cloud.database()
exports.main = async (event) => {
  try {
    let pid=event.pairId;if(!pid){const r=await db.collection('pairs').where(db.command.or([{inviterOpenid:cloud.getWXContext().OPENID},{accepterOpenid:cloud.getWXContext().OPENID}])).get();if(r.data.length===0)return{code:0,data:[]};pid=r.data[0].pairId}
    if(event.range==='week'){const records=[];for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400000).toISOString().split('T')[0],r=await db.collection('daily_checkins').where({pairId:pid,date:d}).get();records.push(r.data.length>0?{date:d,sparkLevel:r.data[0].sparkLevel,allOpened:r.data[0].allOpened,allShared:r.data[0].allShared}:{date:d,sparkLevel:0,allOpened:false,allShared:false})}return{code:0,data:records}}
    const dt=event.date||new Date().toISOString().split('T')[0],res=await db.collection('daily_checkins').where({pairId:pid,date:dt}).get()
    if(!res.data.length)return{code:0,data:{date:dt,exists:false,members:[],sparkLevel:0}}
    return{code:0,data:{...res.data[0],myCheckIn:res.data[0].members.find(m=>m.openid===cloud.getWXContext().OPENID)||null}}
  }catch(e){return{code:-1,error:e.message}}
}
