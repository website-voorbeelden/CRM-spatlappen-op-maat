import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const bytes='synthetic offline code',asset={path:'/admin/offline/',sha256:createHash('sha256').update(bytes).digest('hex')};
const source=(await readFile(new URL('../admin/offline/worker-template.js',import.meta.url),'utf8')).replace('__CRM_OFFLINE_ASSETS__',JSON.stringify([asset,{...asset,path:'/shared/companies.js'},{...asset,path:'/admin/'},{...asset,path:'/admin/app.js'}])).replace('__CRM_OFFLINE_VERSION__','"fixture"');
const handlers={},saved=new Map();let ready=true,review=false,network='ok',badHash=false;
const context=vm.createContext({URL,Date,Response,Error,Set,crypto,self:{location:{origin:'https://crm.invalid'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{},get:async id=>({url:'https://crm.invalid/admin/'+(id==='review'?'?offline=review':'')})}},caches:{open:async()=>({put:async(key,value)=>saved.set(key,value),match:async key=>saved.get(key)?.clone()}),keys:async()=>['crm-offline-code-fixture'],delete:async()=>true},fetch:async()=>{if(network==='fail')throw TypeError('offline');if(network==='401')return new Response('login',{status:401});if(network==='503')return new Response('server unavailable',{status:503});return new Response(badHash?'different code':bytes);},indexedDB:{open(name){
 const r={result:{objectStoreNames:{contains:()=>true},close(){},transaction(){
  return {objectStore(){return {get(){const q={};queueMicrotask(()=>{q.result=(name==='crm-offline-review-v1'?review:ready)?{schema:1,grant:{expiresAt:Date.now()+100000}}:null;q.onsuccess();});return q;}};}};
 }}};queueMicrotask(()=>r.onsuccess());return r;
}},queueMicrotask});
vm.runInContext(source,context);let waiting;handlers.install({waitUntil:p=>waiting=p});await waiting;assert.equal(await saved.get(asset.path).clone().text(),bytes);
const dispatch=(path,{mode='navigate',method='GET',referrer='https://crm.invalid/admin/offline/app.js',clientId=''}={})=>{let promise;handlers.fetch({clientId,request:{url:'https://crm.invalid'+path,method,mode,referrer},respondWith:p=>promise=p});return promise;};
network='fail';assert.equal(await (await dispatch('/admin/')).text(),bytes);ready=false;await assert.rejects(dispatch('/admin/'),/offline/);ready=true;
for(const status of ['401','503']){network=status;assert.equal((await dispatch('/admin/')).status,Number(status),'server denial must never become an offline fallback');}
network='fail';assert.equal(await (await dispatch('/shared/companies.js')).text(),bytes);assert.equal(await (await dispatch(asset.path)).text(),bytes);assert.equal(await (await dispatch('/admin/offline/index.html')).text(),bytes);for(const path of ['/api/crm/snapshot','/api/crm/commit','/api/crm/files/id','/__local/gmail/thread','/auth/logout','/login.html'])assert.equal(dispatch(path),undefined,'private APIs/login are never cached');assert.equal(dispatch(asset.path,{method:'POST'}),undefined);
assert.equal(dispatch('/shared/companies.js',{referrer:'https://crm.invalid/admin/app.js'}),undefined,'normal CRM modules must not use an older offline code cache');
review=true;network='fail';assert.equal((await dispatch('/admin/')).status,302);assert.equal(await(await dispatch('/admin/?offline=review')).text(),bytes);assert.equal(await(await dispatch('/admin/app.js',{mode:'cors',clientId:'review'})).text(),bytes);assert.equal(await(await dispatch('/shared/companies.js',{mode:'cors',referrer:'https://crm.invalid/admin/app.js',clientId:'review'})).text(),bytes);
for(const path of ['/api/crm/commit','/api/crm/snapshot','/__local/assistant/gmail-send','/auth/logout']){const r=await dispatch(path,{clientId:'review',method:path.includes('snapshot')?'GET':'POST'});assert.equal(r.status,503,'review blocks provider/business access without network');}
network='ok';assert.equal((await dispatch('/api/crm/commit',{clientId:'normal',method:'POST'})).status,200,'ordinary cloud behavior remains network-only');review=false;assert.equal((await dispatch('/admin/?offline=review')).status,503);
network='ok';badHash=true;handlers.install({waitUntil:p=>waiting=p});await assert.rejects(waiting,/release mismatch/);
console.log('Offline worker: exacte gecontroleerde code-assets, echte netwerkfout als fallback, geen fallback bij 401/503, grant verplicht, geen API/auth/provider/file caching of POST-queue.');
