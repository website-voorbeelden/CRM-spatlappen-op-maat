import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const source=(await readFile(new URL('../admin/feedback.js',import.meta.url),'utf8')).replace(/^import .*\n/gm,'').replaceAll('export function ','function ');
const report=id=>({id,createdAt:'2026-10-10T10:00:00.000Z',kind:'improvement',status:'open',message:'Fictief <img onerror="evil">',details:'',context:{route:'#feedback',page:'Test'}});
async function setup(mode){
 let legacy=[report('old')],canonical=[{...report('old'),status:'resolved'},report('new')],writes=0,requests=[],fail=false;
 const node=()=>({dataset:{},setAttribute(){},addEventListener(){},append(){},innerHTML:''}),page=node();
 const db={transaction(){let reading=false;const tx={objectStore(){return {getAll(){reading=true;const r={};queueMicrotask(()=>{r.result=structuredClone(legacy);r.onsuccess();tx.oncomplete();});return r;},clear(){writes++;legacy=[];},put(r){writes++;legacy.push(r);}};}};queueMicrotask(()=>{if(!reading)tx.oncomplete?.();});return tx;}};
 const env={pendingFeedback:async()=>[],isReviewMode:()=>false,structuredClone,console,Blob,Date,Promise,location:{hash:'#feedback',host:'localhost:3010'},openFeedbackDatabase:async()=>db,storageRuntime:async()=>({mode,companyId:'spatlappen'}),document:{createElement:node,body:node(),addEventListener(){},querySelector:()=>page},window:{addEventListener(){}},fetch:async(url,options)=>{requests.push(url);if(fail)return Response.json({error:'Dienst gestopt'},{status:503});if(url.endsWith('feedback-list'))return Response.json({reports:canonical});assert.ok(url.endsWith('feedback-import'));for(const r of JSON.parse(options.body).reports)if(!canonical.some(old=>old.id===r.id))canonical.push(r);return Response.json({});}};
 runInNewContext(source+'\nthis.api=installFeedback({downloadBlob:()=>{},today:()=>"2026-10-14",toast:()=>{}});',env);
 return {api:env.api,page,get:()=>({legacy,canonical,writes,requests}),fail:()=>fail=true};
}
const local=await setup('local');
assert.equal((await local.api.list()).length,2);
assert.equal(local.get().requests.filter(p=>p.endsWith('import')).length,1);
await local.api.replaceAll([report('additional'),report('old')]);
assert.equal(local.get().writes,0);assert.equal(local.get().legacy.length,1);
assert.equal(local.get().canonical.find(r=>r.id==='old').status,'resolved');
assert.equal(local.get().canonical.length,3);
assert.ok(local.page.innerHTML.includes('vaste privémap'));
assert.ok(local.page.innerHTML.includes('&lt;img')&&!local.page.innerHTML.includes('<img onerror'));
local.fail();await assert.rejects(()=>local.api.replaceAll([report('failure')]),/Dienst gestopt/);
assert.equal(local.get().writes,0);assert.equal(local.get().canonical.length,3);
const cloud=await setup('cloud');await cloud.api.replaceAll([report('cloud')]);
assert.equal(cloud.get().legacy[0].id,'cloud');assert.equal(cloud.get().requests.length,0);

// Recovered feedback: hide an empty image area, preserving the upload action.
const app=await readFile(new URL('../admin/app.js',import.meta.url),'utf8');
const start=app.indexOf('function productImageActions('),end=app.indexOf('\nfunction uploadProductImage(',start);
let images=[];const e={productImages:()=>images,esc:s=>s,button:()=>'<button>Vergroten</button>',imageTag:()=>'<img>',badge:()=>'<span>Afbeelding</span>'};
runInNewContext(app.slice(start,end),e);
assert.equal(e.productImageCard({id:'o'},{id:'i'}),'');
assert.match(e.productImageActions({id:'o'},{id:'i'}),/Afbeelding uploaden/);
images=[{id:'image',createdAt:'2026-10-14',name:'Fictief.png'}];assert.match(e.productImageCard({id:'o'},{id:'i'}),/product-image-card/);
console.log('Feedback-UI: oude meldingen samengevoegd, status behouden, geen stille fallback/writes in bedrijfsopslag, cloud behouden en leeg afbeeldingsvak verborgen.');
