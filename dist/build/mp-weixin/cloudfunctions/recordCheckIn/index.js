const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d7gvzylmp17ed1957' })
const db = cloud.database()
const _ = db.command
exports.main = async (event) => {
  try {
    const { action, pairId, mealType, data } = event
    if (!pairId) return { code: -1, error: 'Missing pairId' }
    const today = new Date().toISOString().split('T')[0], openid = cloud.getWXContext().OPENID
    let rec; const ex = await db.collection('daily_checkins').where({ pairId, date: today }).get()
    if (ex.data.length > 0) rec = ex.data[0]
    else rec = { pairId, date: today, members: [], allOpened:false, allShared:false, allBreakfastEaten:false, allLunchEaten:false, allDinnerEaten:false, sparkLevel:0, createdAt:new Date(), updatedAt:new Date() }
    const mi = rec.members.findIndex(m => m.openid === openid)
    let member
    if (mi > -1) member = rec.members[mi]
    else member = { openid, nickname:data?.nickname||'', hasOpenedApp:false, openTime:null, hasSharedFood:false, shareTime:null, meals:{ breakfast:{eaten:false,eatTime:'',recipeId:null,photo:''}, lunch:{eaten:false,eatTime:'',recipeId:null,photo:''}, dinner:{eaten:false,eatTime:'',recipeId:null,photo:''} } }
    switch(action){ case'open_app':member.hasOpenedApp=true;member.openTime=new Date().toISOString();break; case'share_food':member.hasSharedFood=true;member.shareTime=new Date().toISOString();break; case'eat_meal':if(!['breakfast','lunch','dinner'].includes(mealType))return{code:-2};member.meals[mealType]={eaten:true,eatTime:new Date().toTimeString().substring(0,5),recipeId:data?.recipeId||null,photo:data?.photo||''};break; default:return{code:-3} }
    if(mi>-1)rec.members[mi]=member;else rec.members.push(member)
    rec.allOpened=rec.members.length>=2&&rec.members.every(m=>m.hasOpenedApp);rec.allShared=rec.members.length>=2&&rec.members.every(m=>m.hasSharedFood);rec.allBreakfastEaten=rec.members.length>=2&&rec.members.every(m=>m.meals.breakfast.eaten);rec.allLunchEaten=rec.members.length>=2&&rec.members.every(m=>m.meals.lunch.eaten);rec.allDinnerEaten=rec.members.length>=2&&rec.members.every(m=>m.meals.dinner.eaten)
    const checks=[rec.allOpened,rec.allShared,rec.allBreakfastEaten,rec.allLunchEaten,rec.allDinnerEaten];rec.sparkLevel=checks.filter(v=>v).length===0?0:(checks.filter(v=>v).length>=2?2:1);rec.updatedAt=new Date()
    if(ex.data.length>0)await db.collection('daily_checkins').where({_id:rec._id}).update({data:rec});else await db.collection('daily_checkins').add({data:rec})
    updateStats(pairId,today,rec).catch(()=>{});return{code:0,sparkLevel:rec.sparkLevel}
  }catch(e){return{code:-1,error:e.message}}
}
async function updateStats(pid,date,daily){
  try{
    let stats;const ex=await db.collection('pair_stats').where({pairId:pid}).get()
    if(ex.data.length>0)stats=ex.data[0];else stats={pairId:pid,consecutiveShareDays:0,consecutiveOpenDays:0,totalShareDays:0,totalOpenDays:0,longestShareStreak:0,longestOpenStreak:0,lastActiveDate:date,createdAt:new Date(),updatedAt:new Date()}
    const y=new Date(Date.now()-86400000).toISOString().split('T')[0],yr=await db.collection('daily_checkins').where({pairId:pid,date:y}).get(),had=yr.data.length>0&&yr.data[0].sparkLevel>0
    if(daily.allShared){stats.consecutiveShareDays=(had&&yr.data[0].allShared)?stats.consecutiveShareDays+1:1;stats.totalShareDays++;if(stats.consecutiveShareDays>stats.longestShareStreak)stats.longestShareStreak=stats.consecutiveShareDays}else stats.consecutiveShareDays=0
    if(daily.allOpened){stats.consecutiveOpenDays=(had&&yr.data[0].allOpened)?stats.consecutiveOpenDays+1:1;stats.totalOpenDays++;if(stats.consecutiveOpenDays>stats.longestOpenStreak)stats.longestOpenStreak=stats.consecutiveOpenDays}else stats.consecutiveOpenDays=0
    stats.lastActiveDate=date;stats.updatedAt=new Date();if(ex.data.length>0)await db.collection('pair_stats').where({_id:stats._id}).update({data:stats});else await db.collection('pair_stats').add({data:stats})
  }catch(e){}
}
