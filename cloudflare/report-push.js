import {companyFromEnv} from '../shared/companies.js';
import {isReportId,weeklySlot} from '../shared/weekly-analytics.js';
import {integrationStore,integrationError,sha256} from './integration-store.js';
import {activePushDevices,pushDeviceIsCurrent,pushDeviceFingerprint,removePushDeviceIfCurrent} from './push-devices.js';
import {sendWebPush,vapidConfig} from './web-push.js';
import {weeklyExclusionSignature as exclusionSignature} from './weekly-website.js';
const stamp=()=>Math.floor(Date.now()/1000);
const registryName='weekly-report-devices',queueName='weekly-report-push';
async function ownDevice(env,identity,id){
 const device=await env.DB.prepare('SELECT * FROM crm_push_devices WHERE id=? AND company_id=? AND session_hash=?').bind(id,companyFromEnv(env).id,identity.sessionHash).first();
 return device&&await pushDeviceIsCurrent(env,device)?device:null;
}
export async function reportDeviceStatus(env,identity,id){
 if(!/^[a-f0-9]{64}$/.test(id||''))return false;
 try{
  const device=await ownDevice(env,identity,id);if(!device)return false;
  const entry=(await integrationStore(env).read(registryName)).value?.devices?.find(d=>d.id===id);
  return !!entry&&entry.protocol===1&&entry.fingerprint===await pushDeviceFingerprint(device);
 }catch{return false;}
}
export async function registerReportDevice(env,identity,{endpoint,protocol}){
 if(protocol!==1||typeof endpoint!=='string'||!endpoint||endpoint.length>2048)throw integrationError('Werk eerst de CRM-app op dit apparaat bij.');
 const id=await sha256(endpoint),store=integrationStore(env);
 return store.exclusive(registryName,async()=>{
  const device=await ownDevice(env,identity,id);
  if(!device)throw integrationError('Herstel eerst de meldingenkoppeling voor je huidige login op dit apparaat.',409);
  const record=await store.read(registryName),fingerprint=await pushDeviceFingerprint(device);
  if(record.value?.devices?.some(d=>d.id===id&&d.protocol===1&&d.fingerprint===fingerprint))return {reportCapable:true};
  const active=new Set((await activePushDevices(env)).map(d=>d.id));
  const devices=(record.value?.devices||[]).filter(d=>d.id!==id&&active.has(d.id));
  devices.push({id,fingerprint,protocol:1,since:stamp()});
  await store.write(registryName,{devices},record.version);
  return {reportCapable:true};
 });
}
export async function forgetReportDevice(env,id){
 const store=integrationStore(env);
 return store.exclusive(registryName,async()=>{
  const record=await store.read(registryName),devices=record.value?.devices||[];
  if(devices.some(d=>d.id===id))await store.write(registryName,{devices:devices.filter(d=>d.id!==id)},record.version);
 });
}
export async function reportPushSummary(env){
 try{
  const store=integrationStore(env),[registry,queue,devices]=await Promise.all([store.read(registryName),store.read(queueName),activePushDevices(env)]);
  let capable=0;
  // Await fingerprints explicitly; no keys or device identifiers go to the UI.
  for(const device of devices){const fingerprint=await pushDeviceFingerprint(device);if(registry.value?.devices?.some(d=>d.id===device.id&&d.protocol===1&&d.fingerprint===fingerprint))capable++;}
  const last=queue.value?.events?.[0],counts=last?Object.fromEntries(['accepted','pending','failed','cancelled','expired'].map(status=>[status,last.deliveries.filter(d=>(d.status==='pending'&&stamp()-last.createdAt>=86400?'expired':d.status)===status).length])):null;
  return {available:true,capableDevices:capable,registeredDevices:devices.length,last:last?{reportId:last.reportId,...counts}:null};
 }catch{return {available:false,capableDevices:0};}
}
export async function runWeeklyReportPush(env,dependencies,{now=Date.now()}={}){
 // Provider report collection is Friday-only; delivery may retry on Saturday
 // within the separate 24-hour notification window, without querying Google.
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Amsterdam',weekday:'short',hour:'2-digit',hourCycle:'h23'}).formatToParts(now),get=key=>parts.find(p=>p.type===key).value;
 if(env.CRM_RELEASE_ENV!=='production'||env.CRM_PUSH_ENABLED!=='true'||!vapidConfig(env)||!(get('weekday')==='Sat'||get('weekday')==='Fri'&&+get('hour')>=9))return {due:false};
 const store=integrationStore(env),config=await store.read('weekly-report-config');
 if(!config.value?.enabled||config.value.delivery!=='crm-push')return {enabled:false};
 const observed=await store.read(queueName),observedEvent=observed.value?.events?.find(e=>e.reportId===weeklySlot(now).id);
 if(observedEvent&&(stamp()-observedEvent.createdAt>=86400||!observedEvent.deliveries.some(d=>d.status==='pending'&&d.nextAt<=stamp())))return {waiting:true};
 return store.exclusive(queueName,async()=>{
  const currentConfig=await store.read('weekly-report-config');
  if(!currentConfig.value?.enabled||currentConfig.value.delivery!=='crm-push')return {enabled:false};
  const [reports,registry,devices]=await Promise.all([store.read('weekly-reports'),store.read(registryName),activePushDevices(env)]),slot=weeklySlot(now);
  const report=reports.value?.reports?.find(r=>r.id===slot.id&&r.companyId===companyFromEnv(env).id);
  const ready=report&&(!report.partial||reports.value.attempt?.id===report.id&&reports.value.attempt.count>=3);
  if(!ready||!isReportId(report.id)||report.generatedAt<currentConfig.value.enabledAt||now-report.generatedAt>=86400000||report.generatedAt>now+300000)return {waiting:true};
  const snapshot=await dependencies.loadSnapshot(),signature=await exclusionSignature(snapshot.state);
  if(signature!==report.exclusionSignature)return {changed:true};
  let record=await store.read(queueName),events=record.value?.events||[],event=events.find(e=>e.reportId===report.id);
  async function save(){record=await store.write(queueName,{events},record.version);}
  if(!event){
   const createdAt=Math.floor(report.generatedAt/1000),deliveries=[];
   for(const device of devices){
    const fingerprint=await pushDeviceFingerprint(device),capability=registry.value?.devices?.find(d=>d.id===device.id&&d.protocol===1&&d.fingerprint===fingerprint);
    if(capability&&capability.since<=createdAt&&device.created_at<=createdAt)deliveries.push({id:device.id,fingerprint,status:'pending',attempts:0,nextAt:stamp()});
   }
   event={eventId:await sha256(companyFromEnv(env).id+'|weekly-report|'+report.id),reportId:report.id,createdAt,signature,deliveries};
   events=[event,...events].slice(0,12);await save();
  }
  let offers=0;
  for(const delivery of event.deliveries){
   if(offers>=4)break;
   if(delivery.status!=='pending'||delivery.nextAt>stamp())continue;
   const device=devices.find(d=>d.id===delivery.id);
   if(!device||await pushDeviceFingerprint(device)!==delivery.fingerprint){
    delivery.status='cancelled';await save();continue;
   }
   if(delivery.attempts>=8){delivery.status='failed';await save();continue;}
   // Reserve before transport. A lost response can retry the same tagged event;
   // it must not create a fresh event or silently lose the in-flight attempt.
   delivery.attempts++;delivery.nextAt=stamp()+90;await save();
   const [latestConfig,latestRegistry,latestSnapshot,live]=await Promise.all([store.read('weekly-report-config'),store.read(registryName),dependencies.loadSnapshot(),pushDeviceIsCurrent(env,device)]);
   const current=latestRegistry.value?.devices?.find(d=>d.id===delivery.id&&d.protocol===1&&d.fingerprint===delivery.fingerprint);
   if(!live||!current||!latestConfig.value?.enabled||latestConfig.value.delivery!=='crm-push'||report.generatedAt<latestConfig.value.enabledAt||stamp()-event.createdAt>=86400||await exclusionSignature(latestSnapshot.state)!==event.signature){delivery.status='cancelled';await save();continue;}
   let response=0;
   try{response=await sendWebPush(env,device,{version:2,kind:'weekly-report',companyId:companyFromEnv(env).id,eventId:event.eventId,reportId:event.reportId,createdAt:event.createdAt},event.eventId,{ttl:Math.max(1,86400-(stamp()-event.createdAt))});}catch{/* No endpoint, keys, provider body or report figures in logs. */}
   offers++;
   delivery.status=response>=200&&response<300?'accepted':[400,404,410,413].includes(response)||delivery.attempts>=8?'failed':'pending';
   delivery.nextAt=stamp()+Math.min(3600,60*2**delivery.attempts);await save();
   if([404,410].includes(response))await removePushDeviceIfCurrent(env,device);
  }
  return {reportId:event.reportId,offers};
 });
}
