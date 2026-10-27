import {companyFromEnv} from '../shared/companies.js';
import {weeklySlot,weeklyFindings,isReportId} from '../shared/weekly-analytics.js';
import {integrationStore,integrationError} from './integration-store.js';
import {weeklyGoogleReport} from './marketing.js';
import {weeklyWebsiteReport,weeklyExclusionSignature as exclusionSignature} from './weekly-website.js';
import {reportPushSummary} from './report-push.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const settings=record=>({version:record.version,enabled:record.value?.enabled===true,enabledAt:record.value?.enabledAt||null,schedule:'Vrijdag 09.00 uur · Nederlandse tijd',delivery:record.value?.delivery||'crm'});
const localDate=now=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(key=>parts.find(part=>part.type===key).value).join('-');};
function compactSearch(search){
 if(search.status!=='ready')return search;
 return {...search,queries:search.queries.slice(0,30),previousQueries:search.previousQueries.slice(0,30),pages:search.pages.slice(0,30),previousPages:search.previousPages.slice(0,30)};
}
async function collect(env,state,slot,now,marketingVersion){
 const [google,website]=await Promise.all([
  weeklyGoogleReport(env,{ranges:slot.ranges,now}).catch(()=>({configVersion:marketingVersion,search:{status:'unavailable',error:'De beveiligde Google-koppeling is nu niet beschikbaar.'},ga:{status:'unavailable',error:'De beveiligde Google-koppeling is nu niet beschikbaar.'}})),
  weeklyWebsiteReport(env,state,slot.ranges)
 ]);
 const report={id:slot.id,companyId:companyFromEnv(env).id,site:companyFromEnv(env).website.toLowerCase(),ranges:slot.ranges,generatedAt:now,google,website,exclusionSignature:await exclusionSignature(state)};
 for(const source of [google.search,google.ga,website])if(source.status==='ready')source.capturedAt=now;
 Object.assign(report,weeklyFindings(report));
 report.google.search=compactSearch(google.search);
 report.partial=[google.search,google.ga,website].some(s=>s.status==='unavailable');
 return report;
}
function keepAvailableSources(report,previous){
 if(!previous||previous.exclusionSignature!==report.exclusionSignature)return report;
 for(const key of ['search','ga'])if(report.google.configVersion===previous.google.configVersion&&report.google[key].status==='unavailable'&&previous.google[key].status==='ready')report.google[key]={...previous.google[key],retained:true};
 if(report.website.status==='unavailable'&&previous.website.status==='ready')report.website={...previous.website,retained:true};
 Object.assign(report,weeklyFindings(report));return report;
}
export async function runWeeklyReports(env,dependencies,{now=Date.now()}={}){
 // Reuse the existing quarter-hour job. No additional Worker or round-the-clock
 // polling: only Fridays from 09:00 local time can touch report storage/providers.
 const slot=weeklySlot(now);
 if(env.CRM_RELEASE_ENV!=='production'||slot.id!==localDate(now))return {due:false};
 const store=integrationStore(env),config=await store.read('weekly-report-config');
 if(!config.value?.enabled||slot.id<localDate(config.value.enabledAt))return {enabled:false};
 const held=await store.read('weekly-reports'),seen=held.value?.attempt;
 if(seen?.id===slot.id&&(seen.complete||seen.count>=3||now-seen.at<3600000))return {waiting:true};
 return store.exclusive('weekly-reports',async()=>{
  const latest=await store.read('weekly-report-config');if(!latest.value?.enabled)return {enabled:false};
  const record=await store.read('weekly-reports'),old=record.value||{reports:[]},attempt=old.attempt;
  if(attempt?.id===slot.id&&(attempt.complete||attempt.count>=3||now-attempt.at<3600000))return {waiting:true};
  const count=attempt?.id===slot.id?attempt.count+1:1;
  // Persist the bounded attempt before provider I/O. An interrupted request may
  // retry hourly, but cannot silently restart provider traffic every 15 minutes.
  const reserved=await store.write('weekly-reports',{...old,attempt:{id:slot.id,count,at:now,complete:false}},record.version);
  const before=await dependencies.loadSnapshot(),marketingBefore=await store.read('marketing'),fresh=await collect(env,before.state,slot,now,marketingBefore.version);
  const report=keepAvailableSources(fresh,(old.reports||[]).find(r=>r.id===slot.id));
  // Exclusion/config edits during collection must not silently enter a snapshot.
  const after=await dependencies.loadSnapshot(),currentConfig=await store.read('weekly-report-config'),marketing=await store.read('marketing');
  if(!currentConfig.value?.enabled||currentConfig.version!==latest.version||marketingBefore.version!==marketing.version||await exclusionSignature(after.state)!==report.exclusionSignature)return {changed:true};
  await store.write('weekly-reports',{reports:[report,...(old.reports||[]).filter(r=>r.id!==slot.id)].slice(0,12),attempt:{id:slot.id,count,at:now,complete:!report.partial}},reserved.version);
  return {saved:true,id:slot.id,partial:report.partial};
 });
}
export async function handleWeeklyReports({request,env,loadSnapshot},{now=Date.now()}={}){
 try{
  const store=integrationStore(env),url=new URL(request.url),action=url.pathname.split('/weekly-reports')[1]||'';
  if(request.method==='GET'&&action===''){
   const [config,reports,snapshot]=await Promise.all([store.read('weekly-report-config'),store.read('weekly-reports'),loadSnapshot()]);
   const signature=await exclusionSignature(snapshot.state);
   return json({status:'ready',config:settings(config),push:await reportPushSummary(env),lastAttempt:reports.value?.attempt||null,schedulerAvailable:env.CRM_RELEASE_ENV==='production'&&env.CRM_PUSH_ENABLED==='true'&&/^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||''),reports:(reports.value?.reports||[]).map(report=>({...report,exclusionsChanged:signature!==report.exclusionSignature}))});
  }
  if(request.method!=='POST'||!request.headers.get('Content-Type')?.startsWith('application/json'))throw integrationError('Onbekend rapportverzoek.',404);
  const raw=await request.text();if(raw.length>2000)throw integrationError('Rapportverzoek is te groot.',413);
  const input=JSON.parse(raw);
  if(!input||typeof input!=='object'||Array.isArray(input))throw integrationError('Ongeldig rapportverzoek.');
  if(action==='/config'){
   if(typeof input.enabled!=='boolean'||typeof input.version!=='string')throw integrationError('Controleer de rapportinstelling.');
   if(env.CRM_RELEASE_ENV!=='production'&&input.enabled)throw integrationError('Automatische rapporten staan alleen in het online productie-CRM aan. Je kunt wel een voorbeeld bekijken.');
   if(input.enabled&&(env.CRM_PUSH_ENABLED!=='true'||!/^[a-f0-9]{64}$/.test(env.CRM_NOTIFICATION_JOB_KEY||'')))throw integrationError('De bestaande beveiligde achtergrondtaak moet eerst online worden ingericht. Je keuze is niet bewaard.',503);
   return await store.exclusive('weekly-reports',async()=>{
    const record=await store.read('weekly-report-config');if(record.version!==input.version)throw integrationError('De instelling is intussen gewijzigd. Open Rapporten opnieuw; je keuze is nog niet bewaard.',409);
    const saved=await store.write('weekly-report-config',{enabled:input.enabled,delivery:'crm-push',enabledAt:input.enabled?(record.value?.enabled&&record.value.delivery==='crm-push'?record.value.enabledAt:now):null},record.version);
    return json(settings(saved));
   });
  }
  if(action==='/preview'){
   const slot=weeklySlot(now);
   if(!isReportId(slot.id))throw integrationError('Deze rapportweek is niet beschikbaar.');
   return await store.exclusive('weekly-report-preview',async()=>{
    const snapshot=await loadSnapshot(),signature=await exclusionSignature(snapshot.state),marketing=await store.read('marketing'),cache=await store.read('weekly-report-preview');
    if(cache.value?.id===slot.id&&cache.value.configVersion===marketing.version&&cache.value.report.exclusionSignature===signature&&cache.value.at>now-15*60000)return json({...cache.value.report,preview:true,cached:true});
    const report=await collect(env,snapshot.state,slot,now,marketing.version),latest=await loadSnapshot(),configNow=await store.read('marketing');
    if(await exclusionSignature(latest.state)!==signature||configNow.version!==marketing.version)throw integrationError('Meetuitsluitingen of de Google-koppeling zijn intussen gewijzigd. Vraag het voorbeeld opnieuw op.',409);
    await store.write('weekly-report-preview',{id:slot.id,at:now,configVersion:marketing.version,report},cache.version);
    return json({...report,preview:true});
   });
  }
  throw integrationError('Onbekend rapportverzoek.',404);
 }catch(error){return json({error:error instanceof SyntaxError?'Ongeldig rapportverzoek.':error.status?error.message:'Het weekrapport is nu niet beschikbaar. Bewaarde rapporten blijven behouden.'},error.status||503);}
}
