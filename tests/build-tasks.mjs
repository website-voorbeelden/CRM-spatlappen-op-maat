import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {applyTaskChange,validateTaskProgress,taskBaseline} from '../shared/planning/progress.js';
import {items} from '../shared/planning/roadmap.js';
import {handleCrm} from '../cloudflare/api.js';
import {onRequest as middleware} from '../functions/_middleware.js';
import {CloudDatabase} from '../admin/cloud-storage.js';
import {readBuildTasks,saveBuildTask} from '../admin/workspace/build-task-store.js';
import {backupBlob,parseBackup,readBrowserPackage} from '../admin/cloud-migration.js';
const taskId='product-design-alternatives',at='2026-10-17T12:00:00Z',change={id:'event-1',taskId,author:'AI test',status:'doing',note:'Begin met behoud van de bestaande variant.',expectedVersion:0};
const first=applyTaskChange(undefined,change,'spatlappen',{now:at}),before=structuredClone(first);
const second=applyTaskChange(first,{id:'event-2',taskId,author:'Philippe',note:'Ook later bewerkbaar houden.'},'spatlappen');assert.deepEqual(first,before);assert.equal(second.events.length,2);assert.equal(second.status,'doing');
assert.equal(applyTaskChange(second,change,'spatlappen'),second,'lost ack retry does not duplicate a log event');
assert.throws(()=>applyTaskChange(second,{...change,note:'Andere tekst'},'spatlappen'),e=>e.status===409);
assert.throws(()=>applyTaskChange(second,{...change,id:'event-3',status:'done',expectedVersion:1},'spatlappen'),e=>e.status===409);
assert.throws(()=>applyTaskChange(first,change,'maatwerkkunststof'),/bedrijf/);
assert.throws(()=>applyTaskChange(undefined,{...change,status:'done',note:''},'spatlappen'),/afgerond|controle/);
assert.throws(()=>validateTaskProgress({...second,version:3},'spatlappen'),/bouwlog/i);
const complete=applyTaskChange(second,{...change,id:'event-3',status:'done',expectedVersion:2,evidence:'Fictieve regressie geslaagd.'},'spatlappen');assert.equal(complete.delivery,'unknown','done does not imply live');assert.equal(complete.events[0].note,change.note);
assert.equal(taskBaseline(items.find(t=>t.id==='crm-favicon'),'spatlappen').delivery,'live');assert.equal(taskBaseline(items.find(t=>t.id==='crm-favicon'),'maatwerkkunststof').delivery,'local');
const sql=new DatabaseSync(':memory:');for(const file of ['0001_crm.sql','0002_login_tikkie.sql'])sql.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
class Query{constructor(query){this.query=query;this.args=[];}bind(...args){this.args=args;return this;}async first(){return sql.prepare(this.query).get(...this.args)||null;}async all(){return {results:sql.prepare(this.query).all(...this.args)};}}
const DB={prepare:q=>new Query(q),async batch(queries){sql.exec('BEGIN');try{const results=queries.map(q=>{const statement=sql.prepare(q.query);return statement.columns().length?{results:statement.all(...q.args)}:{results:[],meta:statement.run(...q.args)};});sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}},env={DB,CRM_FILES:{},CRM_COMPANY_ID:'spatlappen'};
const state={customers:[{id:'keep-c',company:'Oude klant'}],orders:[],payments:[],documents:[],activities:[]};sql.prepare('INSERT INTO crm_records VALUES(?,?,?,?)').run('state','main',0,JSON.stringify(state));const storedBefore=sql.prepare("SELECT payload FROM crm_records WHERE store='state'").get().payload;
const request=(path,body)=>new Request('https://example.invalid'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
const denied=await middleware({request:request('/api/crm/snapshot?stores=planning'),env:{...env,CRM_COMPANY_ID:undefined,CRM_ALLOWED_EMAIL:'test@example.invalid',CRM_PASSWORD_HASH:'pbkdf2-sha256$100000$'+'a'.repeat(32)+'$'+'b'.repeat(64)},next:()=>new Response('private')});assert.equal(denied.status,401);
const oldFetch=globalThis.fetch,oldWindow=globalThis.window,oldLocation=globalThis.location;globalThis.location={search:''};globalThis.window=new EventTarget();let loseAck=true;
globalThis.fetch=async(path,options={})=>{if(path==='/crm-runtime.json')return Response.json({mode:'cloud',companyId:'spatlappen'});const result=await handleCrm({request:request(path,options.body?JSON.parse(options.body):undefined),env});if(path==='/api/crm/commit'&&loseAck){loseAck=false;throw Error('Fictieve verloren ontvangstbevestiging');}return result;};
try{
 const db=new CloudDatabase();assert.deepEqual(await readBuildTasks('spatlappen',db),[]);
 const saved=await saveBuildTask('spatlappen',change,db);assert.equal(saved.version,1);assert.equal((await readBuildTasks('spatlappen',db))[0].events.length,1);assert.equal(sql.prepare('SELECT COUNT(*) n FROM crm_commits').get().n,1,'one commit despite lost ack');
 await saveBuildTask('spatlappen',{id:'comment-a',taskId,author:'Bouwer B',note:'Andere bouwer.'},db);
 await assert.rejects(()=>saveBuildTask('spatlappen',{...change,id:'stale',expectedVersion:1,status:'done'},db),e=>e.status===409);
 const rows=await readBuildTasks('spatlappen',db);assert.equal(rows[0].version,2);assert.equal(rows[0].events[1].author,'Bouwer B');assert.equal(sql.prepare("SELECT payload FROM crm_records WHERE store='state'").get().payload,storedBefore,'build task writes never rewrite business state');
 const snapshot=await(await handleCrm({request:request('/api/crm/snapshot'),env})).json(),bad=await handleCrm({request:request('/api/crm/commit',{id:'bad-company',companyId:'spatlappen',revision:snapshot.revision,operations:[{store:'planning',action:'put',key:taskId,value:{...rows[0],companyId:'maatwerkkunststof'}}]}),env});assert.equal(bad.status,400);assert.equal((await(await handleCrm({request:request('/api/crm/snapshot'),env})).json()).revision,snapshot.revision);
 const blob=await backupBlob({companyId:'spatlappen',state,files:[],feedback:[],designs:[],planning:rows});const round=await parseBackup(blob,{companyId:'spatlappen'});assert.deepEqual(round.planning,rows);
 const legacy=await parseBackup(new Blob([JSON.stringify({format:'spatlappen-crm-backup',version:1,companyId:'spatlappen',state,files:[]})]),{companyId:'spatlappen'});assert.equal(legacy.planning,undefined,'missing legacy build log stays absent, never means clear');
 // Reading browser data from a cloud screen must still read the local planning DB.
 const localLog=applyTaskChange(undefined,{id:'local-only',taskId:'customer-number-settings',author:'Lokale bouwer',note:'Dit is de lokale bron.'},'spatlappen');
 const oldIndexedDB=globalThis.indexedDB,oldLocalStorage=globalThis.localStorage,opened=[];
 const browserStores={'spatlappen-crm':{state:{main:state},files:[]},'spatlappen-crm-feedback':{reports:[]},'spatlap-preview-designs':{designs:[]},'spatlappen-crm-planning':{planning:[localLog]}};
 globalThis.location.hostname='example.invalid';globalThis.localStorage={length:0};
 globalThis.indexedDB={open(name){opened.push(name);const request={};queueMicrotask(()=>{request.result={close(){},transaction(){const tx={objectStore(store){return {get(key){const r={};queueMicrotask(()=>{r.result=browserStores[name][store][key];r.onsuccess?.();});return r;},getAll(){const r={};queueMicrotask(()=>{r.result=browserStores[name][store];r.onsuccess?.();});return r;}};}};queueMicrotask(()=>queueMicrotask(()=>tx.oncomplete?.()));return tx;}};request.onsuccess?.();});return request;}};
 try{const browserPackage=await readBrowserPackage();assert.deepEqual(browserPackage.planning,[localLog]);assert.ok(opened.includes('spatlappen-crm-planning'));}finally{globalThis.indexedDB=oldIndexedDB;globalThis.localStorage=oldLocalStorage;}

}finally{globalThis.fetch=oldFetch;globalThis.window=oldWindow;globalThis.location=oldLocation;sql.close();}
console.log('✓ Bouwtaken: historie, bedrijfsgrens, geen businesswrites, verloren ACK/dedup, verse comments, statusconflict, afvinken≠live en nieuwe/oude back-up. Geen echte providers.');
