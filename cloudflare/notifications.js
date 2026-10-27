import {notificationIntervalMinutes,notificationHeartbeatGraceSeconds} from '../shared/notification-schedule.js';
import {companyFromEnv} from '../shared/companies.js';
import {notificationIdentity,authReady} from './auth.js';
import {validatePushSubscription,vapidConfig,sendWebPush} from './web-push.js';
import {checkTikkiePayments,tikkieReady} from './tikkie.js';
import {applyTikkiePayments} from '../shared/tikkie-payments.js';
import {isTikkieReceipt,isRecentTikkieReceipt} from '../shared/payment-notifications.js';
import {runWeeklyReports} from './weekly-reports.js';
import {activePushDevices as currentDevices,pushDeviceIsCurrent,removePushDeviceIfCurrent} from './push-devices.js';
import {reportDeviceStatus,registerReportDevice,forgetReportDevice,runWeeklyReportPush} from './report-push.js';
import {paymentDeliveryStatus} from './payment-delivery-status.js';
const now=()=>Math.floor(Date.now()/1000);
const paymentPollIntervalSeconds=notificationIntervalMinutes*60;
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const hash=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
// Only imported provider receipts warrant a phone alert. Manually entering an
// amount is already known to the user; manually checking Tikkie still imports
// provider receipts through the same shared importer as background polling.
export function notificationEnabled(env){return env.CRM_PUSH_ENABLED==='true'&&env.CRM_RELEASE_ENV==='production';}
export function validNotificationJob(request,env){
 if(!authReady(env)||!['spatlappen','maatwerkkunststof'].includes(env.CRM_COMPANY_ID)||!notificationEnabled(env)||request.method!=='POST'||! /^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||''))return false;
 try{if(new URL(env.CRM_PUBLIC_URL).origin!==new URL(request.url).origin)return false;}catch{return false;}
 const given=request.headers.get('Authorization')||'',expected='Bearer '+env.CRM_NOTIFICATION_JOB_KEY;
 if(given.length!==expected.length)return false;let difference=0;for(let i=0;i<expected.length;i++)difference|=given.charCodeAt(i)^expected.charCodeAt(i);return difference===0;
}
function jobReady(request,env){
 try{return /^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||'')&&new URL(env.CRM_PUBLIC_URL).origin===new URL(request.url).origin;}catch{return false;}
}
async function control(env){try{return await env.DB.prepare('SELECT * FROM crm_notification_control WHERE id=1').first();}catch{return null;}}
async function parseBody(request){
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail('JSON verwacht.',415);
 const raw=await request.text();if(new TextEncoder().encode(raw).length>10000)fail('Meldingenverzoek is te groot.',413);
 try{return JSON.parse(raw);}catch{fail('Ongeldig meldingenverzoek.');}
}
async function observePayments(env,state,lease,{baseline=false}={}){
 const existing=new Set((await env.DB.prepare('SELECT payment_id FROM crm_notification_seen').all()).results.map(r=>r.payment_id));
 const queries=[],stamp=now(),orders=new Set((state.orders||[]).map(o=>o.id));
 const guard='EXISTS(SELECT 1 FROM crm_notification_control WHERE id=1 AND lease_token=?)';
 for(const payment of state.payments||[]){
  if(!id(payment.id)||existing.has(payment.id))continue;
  if(!baseline&&isRecentTikkieReceipt(payment,stamp*1000)&&orders.has(payment.orderId)&&id(payment.orderId)){
   const eventId=await hash(companyFromEnv(env).id+'|payment|'+payment.id);
   queries.push(env.DB.prepare(`INSERT OR IGNORE INTO crm_notification_events(id,payment_id,order_id,created_at) SELECT ?,?,?,? WHERE ${guard}`).bind(eventId,payment.id,payment.orderId,stamp,lease));
  }
  // Queue before marking seen: an interrupted bounded batch cannot lose an event.
  queries.push(env.DB.prepare(`INSERT OR IGNORE INTO crm_notification_seen(payment_id,seen_at) SELECT ?,? WHERE ${guard}`).bind(payment.id,stamp,lease));
 }
 // Keep D1 batches bounded; the lease gates each individual mutation.
 for(let offset=0;offset<queries.length;offset+=60)await env.DB.batch(queries.slice(offset,offset+60));
}
// Establish history before confirming the first device; receipts after opt-in
// must not disappear into the first cron baseline.
async function initializeBaseline(env,dependencies){
 const row=await control(env);if(row?.seeded)return;
 const lease=crypto.randomUUID(),stamp=now();
 const claim=await env.DB.prepare('UPDATE crm_notification_control SET lease_until=?,lease_token=? WHERE id=1 AND seeded=0 AND lease_until<=?').bind(stamp+480,lease,stamp).run();
 if(claim.meta.changes!==1){if((await control(env))?.seeded)return;fail('De eerste controle wordt nog voorbereid. Probeer het aanzetten zo opnieuw.',409);}
 try{
  const snapshot=await dependencies.loadSnapshot();await observePayments(env,snapshot.state,lease,{baseline:true});
  const saved=await env.DB.prepare('UPDATE crm_notification_control SET seeded=1 WHERE id=1 AND lease_token=?').bind(lease).run();
  if(saved.meta.changes!==1)fail('De eerste controle is intussen gewijzigd. Probeer opnieuw.',409);
 }finally{await env.DB.prepare('UPDATE crm_notification_control SET lease_until=0,lease_token=NULL WHERE id=1 AND lease_token=?').bind(lease).run();}
}
async function pollProvider(env,dependencies,controlRow,lease,knownState){
 if(env.CRM_PAYMENT_POLL_ENABLED!=='true')return;
 if(!tikkieReady(env))return false;
 const stamp=now();if(!controlRow.provider_cursor&&Math.floor(stamp/paymentPollIntervalSeconds)<=Math.floor((controlRow.provider_checked_at||0)/paymentPollIntervalSeconds))return;
 // A provider response is saved before the separate CRM commit. If that commit
 // conflicted/interrupted, even a now-closed link must be verified again until
 // its receipts are imported (or deliberately removed by the user).
 const knownReceipts=JSON.stringify([...new Set([
  ...(knownState.payments||[]).map(p=>p.externalId),
  ...(knownState.paymentCorrections||[]).filter(c=>c.kind==='remove'&&!c.restoredAt).map(c=>c.before?.externalId)
 ].filter(value=>typeof value==='string'&&value.startsWith('tikkie:')))]);
 let rows=(await env.DB.prepare(`SELECT r.id,r.order_id FROM crm_tikkie_requests r
  WHERE r.status='created' AND r.id>? AND json_extract(r.result,'$.expiryDate')>=date('now','-7 days')
  AND (coalesce(json_extract(r.result,'$.status'),'OPEN') NOT IN ('CLOSED','EXPIRED')
   OR EXISTS(SELECT 1 FROM json_each(r.result,'$.payments') receipt
    WHERE json_extract(receipt.value,'$.paymentToken') IS NOT NULL
     AND NOT EXISTS(SELECT 1 FROM json_each(?) known WHERE known.value='tikkie:'||json_extract(receipt.value,'$.paymentToken'))))
  ORDER BY r.id LIMIT 3`).bind(controlRow.provider_cursor||'',knownReceipts).all()).results;
 const more=rows.length>2;rows=rows.slice(0,2);let failed=false;
 for(const row of rows){
  try{
  let snapshot=await dependencies.loadSnapshot();
  const owner=snapshot.state.orders?.find(o=>o.id===row.order_id);if(!owner)continue;
  const result=await checkTikkiePayments(env,{orderId:row.order_id,linkId:row.id},{maxPages:2,requestTimeoutMs:6000});
  for(let attempt=0;attempt<3;attempt++){
   snapshot=await dependencies.loadSnapshot();const next=structuredClone(snapshot.state),order=next.orders?.find(o=>o.id===row.order_id);if(!order)break;
   const added=applyTikkiePayments(next,order,result.links,{uid:()=>crypto.randomUUID(),timeZone:'Europe/Amsterdam'});
   if(!added)break; // Polling itself does not create activity or business-state writes.
   next.activities??=[];next.activities.unshift({id:crypto.randomUUID(),message:'Ontvangen Tikkie-betaling automatisch geregistreerd',time:new Date().toISOString()});
   try{await dependencies.commitState(next,{id:crypto.randomUUID(),revision:snapshot.revision});break;}catch(error){if(error.status!==409||attempt===2)throw error;}
  }
  }catch{failed=true;}
 }
 await env.DB.prepare('UPDATE crm_notification_control SET provider_cursor=?,provider_checked_at=? WHERE id=1 AND lease_token=?').bind(more?rows.at(-1).id:'',more?controlRow.provider_checked_at:stamp,lease).run();
 return !failed;
}
async function drain(env,state){
 const stamp=now(),devices=await currentDevices(env);
 for(const device of devices){
  await env.DB.prepare("INSERT OR IGNORE INTO crm_notification_deliveries(event_id,device_id) SELECT id,? FROM crm_notification_events WHERE created_at>=? AND created_at>=?").bind(device.id,stamp-86400,device.created_at).run();
 }
 if(!devices.length)return;
 const rows=(await env.DB.prepare(`SELECT n.*,e.payment_id,e.order_id,e.created_at FROM crm_notification_deliveries n JOIN crm_notification_events e ON e.id=n.event_id WHERE n.device_id IN (${devices.map(()=>'?').join(',')}) AND n.status='pending' AND n.next_at<=? AND n.lease_until<=? AND e.created_at>=? ORDER BY e.created_at LIMIT 4`).bind(...devices.map(d=>d.id),stamp,stamp,stamp-86400).all()).results;
 for(const row of rows){
  const device=devices.find(d=>d.id===row.device_id);if(!device)continue;
  // Reapply the policy before transport, including manual entries queued by an
  // older release. Keep event/seen history; cancel only the pending delivery.
  if(!state.payments?.some(p=>p.id===row.payment_id&&p.orderId===row.order_id&&isTikkieReceipt(p)&&Number.isSafeInteger(p.amount)&&p.amount>0)||!state.orders?.some(o=>o.id===row.order_id)){
   await env.DB.prepare("UPDATE crm_notification_deliveries SET status='cancelled' WHERE event_id=? AND device_id=? AND status='pending'").bind(row.event_id,row.device_id).run();continue;
  }
  const token=crypto.randomUUID(),claim=await env.DB.prepare("UPDATE crm_notification_deliveries SET lease_until=?,lease_token=? WHERE event_id=? AND device_id=? AND status='pending' AND lease_until<=?").bind(now()+90,token,row.event_id,row.device_id,now()).run();
  if(claim.meta.changes!==1)continue;
  // Re-read immediately before transport: logout/reconnect/revocation may have
  // happened while an earlier delivery was being offered. In-flight push cannot
  // be recalled, but a stale device snapshot must not start a new offer.
  const live=await pushDeviceIsCurrent(env,device);
  if(!live){await env.DB.prepare("UPDATE crm_notification_deliveries SET status='cancelled',lease_until=0,lease_token=NULL WHERE event_id=? AND device_id=? AND lease_token=?").bind(row.event_id,row.device_id,token).run();continue;}
  let status=0;try{status=await sendWebPush(env,device,{version:1,companyId:companyFromEnv(env).id,eventId:row.event_id,orderId:row.order_id,createdAt:row.created_at},row.event_id);}catch{/* Do not log subscriptions, keys or provider response bodies. */}
  const accepted=status>=200&&status<300,permanent=[400,404,410,413].includes(status),attempts=row.attempts+1;
  await env.DB.prepare('UPDATE crm_notification_deliveries SET status=?,attempts=?,next_at=?,lease_until=0,lease_token=NULL WHERE event_id=? AND device_id=? AND lease_token=?').bind(accepted?'accepted':permanent||attempts>=8?'failed':'pending',attempts,now()+Math.min(3600,60*2**attempts),row.event_id,row.device_id,token).run();
  if([404,410].includes(status))await removePushDeviceIfCurrent(env,device);
 }
}
export async function runNotifications(env,dependencies){
 const row=await control(env);if(!row||!vapidConfig(env))fail('Rond eerst de meldingeninrichting af.',503);
 const lease=crypto.randomUUID(),stamp=now();
 const claimed=await env.DB.prepare('UPDATE crm_notification_control SET lease_until=?,lease_token=? WHERE id=1 AND lease_until<=?').bind(stamp+480,lease,stamp).run();
 if(claimed.meta.changes!==1)return {busy:true};
 let providerFailed=false;
 try{
  const activeRow=await control(env);
  const before=await dependencies.loadSnapshot();await observePayments(env,before.state,lease,{baseline:!activeRow.seeded});
  await env.DB.prepare('UPDATE crm_notification_control SET seeded=1 WHERE id=1 AND lease_token=?').bind(lease).run();
  try{if(await pollProvider(env,dependencies,activeRow,lease,before.state)===false)providerFailed=true;}catch{providerFailed=true;}
  const after=await dependencies.loadSnapshot();await observePayments(env,after.state,lease);
  await drain(env,after.state);
  await env.DB.prepare("DELETE FROM crm_push_devices WHERE session_hash NOT IN(SELECT token_hash FROM crm_sessions WHERE expires_at>?)").bind(now()).run();
  await env.DB.batch([env.DB.prepare('DELETE FROM crm_notification_deliveries WHERE event_id IN(SELECT id FROM crm_notification_events WHERE created_at<?) OR device_id NOT IN(SELECT id FROM crm_push_devices)').bind(now()-7*86400),env.DB.prepare('DELETE FROM crm_notification_events WHERE created_at<?').bind(now()-7*86400)]);
  await env.DB.prepare('UPDATE crm_notification_control SET checked_at=?,last_error=? WHERE id=1 AND lease_token=?').bind(now(),providerFailed?'Betalingscontrole niet gelukt; bestaande betalingen blijven behouden.':null,lease).run();
  if(providerFailed)fail('Betalingscontrole moet opnieuw worden geprobeerd.',503);
  return {ok:true};
 }catch(error){
  await env.DB.prepare('UPDATE crm_notification_control SET last_error=? WHERE id=1 AND lease_token=?').bind('De achtergrondcontrole is onderbroken. De volgende ronde probeert opnieuw; bestaande betalingen blijven behouden.',lease).run();throw error;
 }finally{await env.DB.prepare('UPDATE crm_notification_control SET lease_until=0,lease_token=NULL WHERE id=1 AND lease_token=?').bind(lease).run();}
}
export async function handleNotifications({request,env,dependencies}){
 try{
  const action=new URL(request.url).pathname.split('/').at(-1);
  if(action==='run'){
   if(!validNotificationJob(request,env))fail('Geen toegang.',401);
   // Report failure must not roll back receipts or change payment-job status.
   // Keep the two results separate, even when payment polling needs a retry.
   let result,paymentError,weekly,reportPush;
   try{result=await runNotifications(env,dependencies);}catch(error){paymentError=error;}
   try{weekly=await runWeeklyReports(env,dependencies);}catch{weekly={error:'Weekrapport wordt bij een volgende ronde opnieuw geprobeerd.'};}
   try{reportPush=await runWeeklyReportPush(env,dependencies);}catch{reportPush={error:'Rapportmeldingen worden bij een volgende ronde opnieuw geprobeerd.'};}
   if(paymentError)throw paymentError;
   return json({...result,weekly,reportPush});
  }
  const identity=await notificationIdentity(request,env),company=companyFromEnv(env).id,enabled=notificationEnabled(env),config=vapidConfig(env),row=await control(env);
  if(request.method==='GET'&&action==='status'){
   const deviceId=new URL(request.url).searchParams.get('device'),device=row&&/^[a-f0-9]{64}$/.test(deviceId||'')?await env.DB.prepare('SELECT session_hash,created_at FROM crm_push_devices WHERE id=? AND company_id=?').bind(deviceId,company).first():null;
   const subscribed=device?.session_hash===identity.sessionHash,ready=!!(enabled&&config&&row&&jobReady(request,env));
   const issues=row?(await env.DB.prepare("SELECT count(*) AS total FROM crm_notification_deliveries n JOIN crm_push_devices d ON d.id=n.device_id WHERE d.session_hash=? AND d.company_id=? AND n.attempts>0 AND n.status IN ('pending','failed')").bind(identity.sessionHash,company).first()).total:0;
   return json({paymentDelivery:subscribed?await paymentDeliveryStatus(env,deviceId,device):null,reportCapable:await reportDeviceStatus(env,identity,deviceId),deliveryIssues:issues,subscribed,requiresReconnect:!!device&&!subscribed,enabled,ready,publicKey:ready?config.publicKey:null,paymentPolling:env.CRM_PAYMENT_POLL_ENABLED==='true'&&tikkieReady(env),paymentPollingEnabled:env.CRM_PAYMENT_POLL_ENABLED==='true',paymentPollingIntervalMinutes:notificationIntervalMinutes,backgroundIntervalMinutes:notificationIntervalMinutes,backgroundGraceMinutes:notificationHeartbeatGraceSeconds/60,lastPaymentCheckAt:row?.provider_checked_at?new Date(row.provider_checked_at*1000).toISOString():null,lastCheckedAt:row?.checked_at?new Date(row.checked_at*1000).toISOString():null,backgroundHealthy:!!row?.checked_at&&row.checked_at>=now()-notificationHeartbeatGraceSeconds,lastError:row?.last_error||null,reason:!enabled?'Mobiele meldingen zijn nog niet online geactiveerd.':!row?'De meldingenmigratie moet nog worden toegepast.':!config?'De pushsleutels moeten nog worden ingesteld.':!jobReady(request,env)?'De beveiligde achtergrondtaak moet nog worden ingesteld.':null});
  }
  if(request.method!=='POST'||!['subscribe','unsubscribe','report-device'].includes(action))fail('Onbekend meldingenverzoek.',404);
  const body=await parseBody(request);
  if(body?.companyId!==company)fail('Dit verzoek hoort bij een ander bedrijf.',409);
  // Revocation must remain possible after a feature flag/key is disabled, and
  // after this same company account logs in again on the same browser.
  if(action==='unsubscribe'){
   if(typeof body.endpoint!=='string'||!body.endpoint||body.endpoint.length>2048)fail('Het meldingenadres ontbreekt.');
   const deviceId=await hash(body.endpoint);
   // Each company deployment has one authenticated allowed account. The endpoint
   // is supplied by its own browser, never exposed by a device enumeration API.
   if(row)await env.DB.batch([
    env.DB.prepare('DELETE FROM crm_notification_deliveries WHERE device_id IN(SELECT id FROM crm_push_devices WHERE id=? AND company_id=?)').bind(deviceId,company),
    env.DB.prepare('DELETE FROM crm_push_devices WHERE id=? AND company_id=?').bind(deviceId,company)
   ]);
   // Revocation still succeeds without integrations storage; the actual device
   // deletion already prevents transport. Fingerprints also bind reconnects.
   try{await forgetReportDevice(env,deviceId);}catch{}
   return json({ok:true});
  }
  if(!enabled||!config||!row||!jobReady(request,env))fail('Mobiele meldingen zijn nog niet volledig ingericht.',503);
  if(action==='report-device')return json(await registerReportDevice(env,identity,body));
  let sub;try{sub=await validatePushSubscription(body.subscription);}catch{fail('De browserkoppeling is ongeldig. Zet meldingen opnieuw aan.');}
  const deviceId=await hash(sub.endpoint);
  // Inactive sessions must not fill the device cap before a first cron can run.
  await env.DB.prepare('DELETE FROM crm_push_devices WHERE session_hash NOT IN(SELECT token_hash FROM crm_sessions WHERE expires_at>? AND auth_version=? AND email=?)').bind(now(),identity.authVersion,identity.email).run();
  const existing=await env.DB.prepare('SELECT session_hash FROM crm_push_devices WHERE id=? AND company_id=?').bind(deviceId,company).first();
  if(!existing&&(await env.DB.prepare('SELECT count(*) AS total FROM crm_push_devices').first()).total>=20)fail('Er zijn al twintig apparaten gekoppeld. Zet meldingen op een ongebruikt apparaat uit en probeer opnieuw.');
  await initializeBaseline(env,dependencies);
  await env.DB.prepare('INSERT INTO crm_push_devices(id,company_id,session_hash,endpoint,p256dh,auth,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET session_hash=excluded.session_hash,p256dh=excluded.p256dh,auth=excluded.auth,created_at=CASE WHEN crm_push_devices.session_hash=excluded.session_hash AND crm_push_devices.p256dh=excluded.p256dh AND crm_push_devices.auth=excluded.auth THEN crm_push_devices.created_at ELSE excluded.created_at END,updated_at=excluded.updated_at').bind(deviceId,company,identity.sessionHash,sub.endpoint,sub.p256dh,sub.auth,now(),now()).run();
  return json({ok:true});
 }catch(error){return json({error:error.status?error.message:'Meldingen zijn tijdelijk niet beschikbaar. Er zijn geen betaalgegevens gewijzigd.'},error.status||503);}
}
