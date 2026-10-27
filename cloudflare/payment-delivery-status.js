// Read-only diagnostics for this browser's own authenticated subscription.
// No event, endpoint, keys, customer, order or payment identifiers leave here.
export async function paymentDeliveryStatus(env,deviceId,device){
 if(!device)return null;
 try{
  const stamp=Math.floor(Date.now()/1000);
  const row=await env.DB.prepare(`SELECT e.created_at,n.status,n.attempts,n.next_at
   FROM crm_notification_events e LEFT JOIN crm_notification_deliveries n ON n.event_id=e.id AND n.device_id=?
   WHERE e.created_at>=? AND e.created_at>=? ORDER BY e.created_at DESC,e.id DESC LIMIT 1`).bind(deviceId,stamp-7*86400,device.created_at).first();
  if(!row)return {available:true,latest:null};
  const raw=row.status||'not-prepared';
  const status=['pending','not-prepared'].includes(raw)&&row.created_at<stamp-86400?'expired':raw;
  return {available:true,latest:{createdAt:new Date(row.created_at*1000).toISOString(),status,attempts:row.attempts||0,nextAttemptAt:status==='pending'&&row.next_at?new Date(row.next_at*1000).toISOString():null}};
 }catch{return {available:false,latest:null};}
}
