import {designRetirementReady,retiredDesignFiles,appendDesignRetirements,handleDesignStorage,incomingRetiredReferences} from './design-file-retirement.js';
import {handleNotifications} from './notifications.js';
import {handleWeeklyReports} from './weekly-reports.js';
import {handleOnlineAssistant,hostedAgentReady} from './assistant.js?v=feedback-followup-20261028';
import {validateTaskProgress} from '../shared/planning/progress.js?v=feedback-followup-20261028';
import {handleMarketing} from './marketing.js';
import {websiteAnalytics} from './site-analytics.js';
import {websiteJourney} from './website-journey.js';
import {companyFromEnv} from '../shared/companies.js';
import {validateBusinessState} from '../shared/state-validation.js?v=import-vat-20261029';
import {authReady,localBypass,authenticated} from './auth.js';
import {tikkieReady,validateJournal} from './tikkie.js';
import {documentsReady} from './documents.js';
const stores = new Set(['state','reports','designs','planning']);
const validKey = key => typeof key === 'string' && /^[a-zA-Z0-9._-]{1,160}$/.test(key);
const MAX_JSON = 32_000_000, MAX_FILE = 32_000_000;
const json = (data,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail = (message,status=400) => {throw Object.assign(Error(message),{status});};
const digest = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
const encoder = new TextEncoder();

function decode(rows) {
  const result = {}, grouped = new Map();
  for (const row of rows) {
    const id = JSON.stringify([row.store,row.record_key]);
    if (!grouped.has(id)) grouped.set(id,{store:row.store,key:row.record_key,parts:[]});
    grouped.get(id).parts[row.part] = row.payload;
  }
  for (const {store,key,parts} of grouped.values()) {
    result[store] ??= {};
    Object.defineProperty(result[store],key,{value:JSON.parse(parts.join('')),enumerable:true});
  }
  return result;
}

async function snapshot(db,selected) {
  const args = selected.filter(s=>stores.has(s));
  const queries = [db.prepare('SELECT revision, updated_at FROM crm_workspace WHERE id=1')];
  queries.push(args.length ? db.prepare(`SELECT * FROM crm_records WHERE store IN (${args.map(()=>'?').join(',')}) ORDER BY store, record_key, part`).bind(...args) : db.prepare('SELECT * FROM crm_records WHERE 0'));
  queries.push(db.prepare(selected.includes('files')?'SELECT * FROM crm_files':'SELECT * FROM crm_files WHERE 0'));
  // D1 batch is a single consistent read, avoiding a revision/data race.
  const results = await db.batch(queries);
  return {revision:results[0].results[0].revision,updatedAt:results[0].results[0].updated_at,
    records:decode(results[1].results),files:results[2].results.map(f=>({id:f.id,objectKey:f.object_key,size:f.size,type:f.type,sha256:f.sha256}))};
}

function validateState(state) {
  validateBusinessState(state);
  if (!state || typeof state!=='object' || !['customers','orders','payments','documents','activities'].every(k=>Array.isArray(state[k])) || state.purchases!==undefined&&!Array.isArray(state.purchases)) fail('Ongeldige CRM-gegevens.');
  for (const name of ['customers','orders','payments','documents','purchases']) {
    const entries = state[name]||[];
    if (entries.some(x=>!x||!validKey(x.id)) || new Set(entries.map(x=>x.id)).size!==entries.length) fail('Ongeldige of dubbele IDs in '+name+'.');
  }
}

function packJson(rows) {
  const batches=[];let parts=[],bytes=2;
  for (const row of rows) {
    const part=JSON.stringify(row),size=encoder.encode(part).length+1;
    if (bytes+size>1_500_000&&parts.length) {batches.push('['+parts.join(',')+']');parts=[];bytes=2;}
    parts.push(part);bytes+=size;
  }
  if (parts.length) batches.push('['+parts.join(',')+']');return batches;
}

async function commit(env,body) {
  const {DB:db,CRM_FILES:bucket}=env;
  if (!validKey(body.id)||!Number.isSafeInteger(body.revision)||body.revision<0||!Array.isArray(body.operations)||!body.operations.length||body.operations.length>10000) fail('Ongeldig opslagverzoek.');
  const hash = await digest(encoder.encode(JSON.stringify(body)));
  const previous = await db.prepare('SELECT revision,digest FROM crm_commits WHERE id=?').bind(body.id).first();
  if (previous) {
    if (previous.digest!==hash) fail('Dit opslagverzoek is al met andere gegevens gebruikt.',409);
    return {revision:previous.revision,replayed:true};
  }
  const current = await snapshot(db,['state','files','designs','reports','planning']);
  const retirementReady=await designRetirementReady(db);
  if (current.revision!==body.revision) fail('Gegevens zijn intussen op een andere laptop of in een ander tabblad gewijzigd. Open de bewerking opnieuw.',409);
  if (body.migration && current.revision!==0) fail('Migratie kan alleen naar lege opslag; bestaande gegevens worden niet overschreven.',409);
  if(body.tikkieJournal!==undefined&&!body.migration)fail('Betaalhistorie wordt alleen bij de eerste migratie overgenomen.');
  const journal=body.tikkieJournal===undefined?[]:validateJournal(body.tikkieJournal);
  const files = new Map(current.files.map(f=>[f.id,f]));
  let nextState = current.records.state?.main;
  for (const op of body.operations) {
    if (!['put','delete','clear'].includes(op.action)||!['state','files','reports','designs','planning'].includes(op.store)||op.action!=='clear'&&!validKey(op.key)) fail('Ongeldige opslagbewerking.');
    if (op.store==='state'&&(op.key!=='main'||op.action!=='put')) fail('CRM-gegevens kunnen alleen als geheel worden opgeslagen.');
    if (op.action==='put'&&op.store!=='files') {
      if (op.value===undefined) fail('Een waarde ontbreekt.');
      if (op.store==='state') {validateState(op.value);nextState=op.value;}
      else if (!op.value||op.value.id!==op.key) fail('De record-ID wijkt af.');
      if(op.store==='planning')validateTaskProgress(op.value,companyFromEnv(env).id);
    }
    if (op.store!=='files') continue;
    if (op.action==='clear') files.clear();
    else if (op.action==='delete') files.delete(op.key);
    else {
      const f=op.value;
      if (!f||!/^uploads\/[a-f0-9-]{36}$/.test(f.objectKey)||!Number.isSafeInteger(f.size)||f.size<0||f.size>MAX_FILE||typeof f.type!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256)) fail('Ongeldige upload.');
      const object=await bucket.head(f.objectKey);
      if (!object||object.size!==f.size||object.customMetadata?.sha256!==f.sha256||object.customMetadata?.type!==f.type) fail('Upload ontbreekt of is beschadigd. Upload het bestand opnieuw.');
      files.set(op.key,{...f,id:op.key});
    }
  }
  if (nextState) for (const doc of nextState.documents) {
    const f=files.get(doc.id);
    if (!f) fail('Bestand ontbreekt bij document '+(doc.name||doc.id)+'. Er is niets opgeslagen.');
    if (doc.size!==undefined&&doc.size!==f.size) fail('Bestandsgrootte wijkt af bij '+(doc.name||doc.id)+'.');
  }
  const knownMerges=new Set((current.records.state?.main?.orderMerges||[]).map(m=>m.id));
  const mergedSources=(nextState?.orderMerges||[]).filter(m=>!knownMerges.has(m.id)).map(m=>m.sourceOrderId);
  if(mergedSources.length>20)fail('Voeg orders afzonderlijk samen.');
  for(const sourceId of mergedSources){
    const linked=await db.prepare('SELECT id FROM crm_tikkie_requests WHERE order_id=? LIMIT 1').bind(sourceId).first();
    if(linked)fail('De bronorder heeft bewaarde Tikkie-betaalhistorie. Kies dat dossier als de order die blijft. Er is niets samengevoegd.',409);
  }
  const revision=body.revision+1, now=new Date().toISOString(),retired=retirementReady?retiredDesignFiles(current,nextState,files,body.operations):[];
  const guard='EXISTS (SELECT 1 FROM crm_workspace WHERE id=1 AND revision=? AND commit_token=?)';
  const guardArgs=[revision,body.id];
  const mergeGuard=mergedSources.length?` AND NOT EXISTS (SELECT 1 FROM crm_tikkie_requests WHERE order_id IN (${mergedSources.map(()=>'?').join(',')}))`:'';
  const incomingKeys=body.operations.filter(op=>op.store==='files'&&op.action==='put').map(op=>op.value.objectKey),incomingReferences=retirementReady?incomingRetiredReferences(body.operations,files):'[]';
  if(retirementReady){
   const retiredReference=await db.prepare('SELECT 1 FROM crm_design_file_retirements AS retired, json_each(retired.file_ids) AS retired_id WHERE EXISTS (SELECT 1 FROM json_each(?) AS incoming_reference WHERE incoming_reference.value=retired_id.value OR incoming_reference.value=retired.object_key) LIMIT 1').bind(incomingReferences).first();
   if(retiredReference)fail('Deze wijziging verwijst naar een opgeruimd ontwerpbestand. Open de actuele order opnieuw, of herstel de volledige bestandsback-up met de bijbehorende inhoud. Er is niets opgeslagen.',409);
  }
  const retirementGuard=retirementReady?' AND NOT EXISTS (SELECT 1 FROM crm_design_file_retirements WHERE object_key IN (SELECT value FROM json_each(?))) AND NOT EXISTS (SELECT 1 FROM crm_design_file_retirements AS retired, json_each(retired.file_ids) AS retired_id WHERE EXISTS (SELECT 1 FROM json_each(?) AS incoming_reference WHERE incoming_reference.value=retired_id.value OR incoming_reference.value=retired.object_key))':'';
  const queries=[db.prepare('UPDATE crm_workspace SET revision=?,commit_token=?,updated_at=? WHERE id=1 AND revision=?'+mergeGuard+retirementGuard).bind(revision,body.id,now,body.revision,...mergedSources,...(retirementReady?[JSON.stringify(incomingKeys),incomingReferences]:[]))];
  // Collapse repeated writes and submit manifests/chunks as bounded JSON batches,
  // rather than spending two D1 queries per file in a larger migration.
  const cleared=new Set(),pending=new Map();
  for (const op of body.operations) {
    if (op.action==='clear') {
      cleared.add(op.store);
      for (const [key,value] of pending) if (value.store===op.store) pending.delete(key);
    } else pending.set(JSON.stringify([op.store,op.key]),op);
  }
  const compact=[...pending.values()];
  const recordDeletes=compact.filter(op=>op.store!=='files').map(op=>({store:op.store,key:op.key}));
  const fileDeletes=compact.filter(op=>op.store==='files').map(op=>op.key);
  queries.push(db.prepare(`DELETE FROM crm_records WHERE ${guard} AND (store IN (SELECT value FROM json_each(?)) OR EXISTS (SELECT 1 FROM json_each(?) AS change WHERE json_extract(change.value,'$.store')=crm_records.store AND json_extract(change.value,'$.key')=crm_records.record_key))`).bind(...guardArgs,JSON.stringify([...cleared].filter(s=>s!=='files')),JSON.stringify(recordDeletes)));
  queries.push(db.prepare(`DELETE FROM crm_files WHERE ${guard} AND (? OR id IN (SELECT value FROM json_each(?)))`).bind(...guardArgs,cleared.has('files')?1:0,JSON.stringify(fileDeletes)));
  const rows=[],fileRows=[];
  for (const op of compact) {
    if (op.action!=='put') continue;
    if (op.store==='files') {fileRows.push({id:op.key,...op.value});continue;}
    const value=JSON.stringify(op.value);
    for (let offset=0,part=0;offset<value.length;part++) {
      let end=Math.min(value.length,offset+60000);
      const last=value.charCodeAt(end-1);if (last>=0xD800&&last<=0xDBFF) end--;
      rows.push({store:op.store,key:op.key,part,payload:value.slice(offset,end)});offset=end;
    }
  }
  for (const batch of packJson(rows)) queries.push(db.prepare(`INSERT INTO crm_records (store,record_key,part,payload) SELECT json_extract(value,'$.store'),json_extract(value,'$.key'),json_extract(value,'$.part'),json_extract(value,'$.payload') FROM json_each(?) WHERE ${guard}`).bind(batch,...guardArgs));
  for (const batch of packJson(fileRows)) queries.push(db.prepare(`INSERT INTO crm_files (id,object_key,size,type,sha256) SELECT json_extract(value,'$.id'),json_extract(value,'$.objectKey'),json_extract(value,'$.size'),json_extract(value,'$.type'),json_extract(value,'$.sha256') FROM json_each(?) WHERE ${guard}`).bind(batch,...guardArgs));
  if(retirementReady)appendDesignRetirements(queries,db,retired,guard,guardArgs,now);
  for(const row of journal)queries.push(db.prepare(`INSERT INTO crm_tikkie_requests(id,order_id,identity,status,result,created_at) SELECT ?,?,?,?,?,? WHERE ${guard}`).bind(row.id,row.orderId,row.identity,row.status,row.result,row.createdAt,...guardArgs));
  queries.push(db.prepare(`INSERT INTO crm_commits (id,revision,digest,created_at) SELECT ?,?,?,? WHERE ${guard}`).bind(body.id,revision,hash,now,...guardArgs));
  queries.push(db.prepare('SELECT revision FROM crm_commits WHERE id=?').bind(body.id));
  // Every mutation is conditional on the same token. A losing CAS writes nothing.
  const results=await db.batch(queries);
  const saved=results.at(-1).results[0];
  if (!saved) fail('Gegevens zijn tijdens het opslaan gewijzigd. Er is niets overschreven. Open de bewerking opnieuw.',409);
  return {revision:saved.revision};
}

export async function handleCrm({request,env}) {
  try {
    const company=companyFromEnv(env);
    const url=new URL(request.url),path=url.pathname.replace(/^\/api\/crm\/?/,'');
    if (request.method==='GET'&&path==='config') {
      const local=localBypass(request,env),localServices=local&&['http://127.0.0.1:3000','http://127.0.0.1:3010'].includes(env.CRM_LOCAL_SERVICES)&&company.id==='spatlappen';
      return json({storage:'cloud',companyId:company.id,release:env.CRM_RELEASE||'2.0.0',local,allowedEmail:env.CRM_ALLOWED_EMAIL,authEnabled:authReady(env)&&!local,tikkieReady:localServices||tikkieReady(env),documentsReady:localServices||documentsReady(env),agentReady:hostedAgentReady(env),gmailReady:/^[a-f0-9]{64}$/.test(env.CRM_INTEGRATIONS_KEY||''),mailReady:/^[a-f0-9]{64}$/.test(env.CRM_INTEGRATIONS_KEY||''),localServices});
    }
    if(request.method==='GET'&&path==='offline-grant'){
      const user=await authenticated(request,env);if(!user)return json({error:'Log opnieuw in om offline werken klaar te zetten.'},401);
      return json({companyId:company.id,owner:await digest(encoder.encode('offline-v1|'+company.id+'|'+user.email)),expiresAt:Date.now()+24*3600*1000});
    }
    if(request.method==='GET'&&path==='commit-status'){
      const id=url.searchParams.get('id');if(!validKey(id))fail('Ongeldig opslagnummer.');
      const found=await env.DB.prepare('SELECT revision FROM crm_commits WHERE id=?').bind(id).first();return json({committed:!!found,...(found?{revision:found.revision}:{})});
    }
    if(path.startsWith('assistant/'))return handleOnlineAssistant({request,env,
      loadSnapshot:async()=>{const s=await snapshot(env.DB,['state']);return {revision:s.revision,state:s.records.state?.main||{customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]}};},
      loadCommit:async id=>await env.DB.prepare('SELECT revision FROM crm_commits WHERE id=?').bind(id).first(),
      commitState:(state,{id,revision})=>commit(env,{id,revision,companyId:company.id,operations:[{action:'put',store:'state',key:'main',value:state}]})
    });
    if(path.startsWith('notifications/'))return handleNotifications({request,env,dependencies:{
      loadSnapshot:async()=>{const s=await snapshot(env.DB,['state']);return {revision:s.revision,state:s.records.state?.main||{orders:[],payments:[],activities:[]}};},
      commitState:(state,{id,revision})=>commit(env,{id,revision,companyId:company.id,operations:[{action:'put',store:'state',key:'main',value:state}]})
    }});
    if(path.startsWith('marketing/'))return handleMarketing({request,env});
    if(path==='design-storage')return await handleDesignStorage(request,env);
    if(path==='weekly-reports'||path.startsWith('weekly-reports/'))return handleWeeklyReports({request,env,loadSnapshot:async()=>{const s=await snapshot(env.DB,['state']);return {state:s.records.state?.main||{}};}});
    if (request.method==='GET'&&['website-analytics','website-journey'].includes(path)) {
      const current=env.DB?await snapshot(env.DB,['state']):null;
      return (path==='website-journey'?websiteJourney:websiteAnalytics)({request,env,state:current?.records.state?.main||{}});
    }
    if (!env.DB||!env.CRM_FILES) fail('Database- of bestandsbinding ontbreekt.',503);
    if (request.method==='GET'&&path==='snapshot') {
      const selected=(url.searchParams.get('stores')||'state,files,reports,designs,planning').split(',');
      if (selected.some(s=>!stores.has(s)&&s!=='files')) fail('Onbekende gegevensverzameling.');
      return json(await snapshot(env.DB,selected));
    }
    if (request.method==='POST'&&path==='commit') {
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) fail('JSON verwacht.',415);
      const raw=await request.text();if (encoder.encode(raw).length>MAX_JSON) fail('Opslagverzoek is te groot.',413);
      const body=JSON.parse(raw);if((body.companyId||'spatlappen')!==company.id)fail('Dit opslagverzoek hoort bij een ander bedrijf. Herlaad het CRM.',409);
      return json(await commit(env,body));
    }
    if (request.method==='POST'&&path==='files') {
      const bytes=await request.arrayBuffer();if (bytes.byteLength>MAX_FILE) fail('Bestanden mogen maximaal 32 MB zijn.',413);
      const objectKey='uploads/'+crypto.randomUUID(),sha256=await digest(bytes),type=request.headers.get('Content-Type')||'application/octet-stream';
      if (type.length>250) fail('Ongeldig bestandstype.');
      await env.CRM_FILES.put(objectKey,bytes,{httpMetadata:{contentType:type},customMetadata:{sha256,type}});
      return json({objectKey,size:bytes.byteLength,type,sha256},201);
    }
    if (request.method==='GET'&&path.startsWith('files/')) {
      const id=decodeURIComponent(path.slice(6));if (!validKey(id)) fail('Ongeldig bestand.');
      const f=await env.DB.prepare('SELECT * FROM crm_files WHERE id=?').bind(id).first();if (!f) fail('Bestand ontbreekt.',404);
      const object=await env.CRM_FILES.get(f.object_key);if (!object) fail('Het opgeslagen bestand ontbreekt.',404);
      const requested=url.searchParams.get('name')||'document',name=requested.slice(0,200).replace(/[\x00-\x1f/\\]/g,'_'),fallback=name.replace(/[^\x20-\x7e]|["\\]/g,'_');
      return new Response(object.body,{headers:{'Content-Type':f.type,'Content-Length':String(f.size),'X-Content-Type-Options':'nosniff','Content-Disposition':`attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16))}`,'Cache-Control':'no-store','X-CRM-SHA256':f.sha256}});
    }
    return json({error:'Onbekend CRM-verzoek.'},404);
  } catch(error) {
    if (error instanceof SyntaxError) return json({error:'Ongeldige JSON.'},400);
    if (error.status) return json({error:error.message},error.status);
    console.error('CRM storage error:',error.message);
    return json({error:'Opslaan of laden is mislukt. Controleer de lokale database en probeer opnieuw.'},503);
  }
}
