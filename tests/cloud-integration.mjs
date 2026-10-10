import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as pause} from 'node:timers/promises';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {onRequest as middleware} from '../functions/_middleware.js';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const port=8790,base=`http://127.0.0.1:${port}`,storage=`.wrangler/test-state/${Date.now()}`;
let log='',browser;const errors=[];
const server=spawn(process.execPath,['scripts/cloud-dev.mjs'],{cwd:root,env:{...process.env,CRM_CLOUD_PORT:String(port),CRM_TEST_STORAGE:storage},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',chunk=>log+=chunk);server.stderr.on('data',chunk=>log+=chunk);
const request=async(path,body,options={})=>{
 const response=await fetch(base+'/api/crm'+path,body===undefined?options:{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...options.headers},body:JSON.stringify(body),...options});
 return {status:response.status,data:await response.json()};
};
const snapshot=async()=>{const result=await request('/snapshot');assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};
const mutate=async(operations,extra={})=>{const current=await snapshot();return request('/commit',{id:crypto.randomUUID(),revision:current.revision,operations,...extra});};
try{
 for(let n=0;n<90;n++){try{if((await request('/config')).status===200)break;}catch{}if(server.exitCode!==null)throw Error(log);await pause(500);if(n===89)throw Error('Lokale server niet gestart: '+log);}
 console.log('✓ Afzonderlijke lokale D1/R2-testopslag gestart');
 const config=(await request('/config')).data;assert.equal(config.allowedEmail,'Tiesjipzakelijk@gmail.com');assert.equal(config.accessReady,false);
 assert.equal((await snapshot()).revision,0);
 assert.equal((await request('/commit',{id:'bad',revision:0,operations:[]},{headers:{Origin:'https://evil.example','Content-Type':'application/json'}})).status,403);
 const blocked=await middleware({request:new Request('https://crm.spatlappenopmaat.nl/admin/'),env:{},next:()=>{throw Error('Production should be blocked');}});assert.equal(blocked.status,503);
 const spoofed=await middleware({request:new Request('http://127.0.0.1/admin/'),env:{},next:()=>{throw Error('Local dev flag required');}});assert.equal(spoofed.status,503);
 for(const path of ['/.local/tikkie.json','/.dev.vars','/dev-server.py','/wrangler.jsonc','/package.json']){const response=await fetch(base+path);const text=await response.text();assert(!text.includes('import json')&&!text.includes('CRM_LOCAL_DEV=true')&&!text.includes('database_id')&&!text.includes('devDependencies'));}
 console.log('✓ Herkomstcontrole, productieblokkade en veilige publicatiemap');
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/admin/#settings');await page.getByRole('heading',{name:'Instellingen & back-up'}).waitFor();
 assert.equal((await snapshot()).revision,0,'Opening an empty CRM must not block migration');
 const fixture={customers:[{id:'test-customer',number:'KL-0010',company:'Test Migratie',contact:'Test',email:'test@example.invalid',invoiceEmail:'',phone:'',country:'Nederland',shippingAddress:'',billingAddress:'',notes:'',archived:false}],customerSequence:10,orders:[{id:'test-order',number:3010,sourceNumber:'TEST-001',customerId:'test-customer',date:'2026-10-01',stage:'Productie vrijgegeven',vat:21,shippingKnown:true,shippingCharge:1000,items:[{id:'test-item',description:'Spatlap test',quantity:2,width:600,height:350,price:10000,cost:4000,productionSource:'supplier',specs:''}],leadTimeMinWeeks:2,leadTimeMaxWeeks:8,leadTimeBasis:'payment',purchaseId:'test-purchase',archived:false,documentDrafts:{confirmation:{production_tolerance:'7%'}},paymentLinks:[],emailDrafts:[{id:'test-draft',message:'Concept blijft behouden'}]}],purchases:[{id:'test-purchase',name:'Test zending',supplier:'Test leverancier',shippingCost:1500,invoices:[{id:'test-invoice',reference:'TEST-INV',kind:'invoice',date:'2026-10-01',total:8000,lines:[{id:'test-line',orderId:'test-order',itemId:'test-item',quantity:2,price:4000,unit:'piece'}],payments:[{id:'test-supplier-payment',amount:8000,date:'2026-10-01'}]}]}],payments:[{id:'test-payment',orderId:'test-order',amount:12000,date:'2026-10-02',method:'Overboeking'}],documents:[{id:'test-file',ownerId:'test-order',name:'test.txt',category:'other',size:6,type:'text/plain',date:'2026-10-01'}],activities:[],documentSequences:{'OB-2026':3457,'OF-2026':3454},localImports:['test-import'],extraFutureField:{text:'x'.repeat(65000)+'😀 Türkiye €',unknown:[null,true,123]}};
 const result=await page.evaluate(async fixture=>{
  const storage=await import('/admin/cloud-storage.js'),migration=await import('/admin/cloud-migration.js');
  const local=await storage.openBrowserDatabase('spatlappen-crm',['state','files']);
  await new Promise((resolve,reject)=>{const tx=local.transaction(['state','files'],'readwrite');tx.objectStore('state').put(fixture,'main');tx.objectStore('files').put({id:'test-file',blob:new Blob(['ABC123'],{type:'text/plain'})});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});local.close();
  const feedbackDb=await storage.openBrowserDatabase('spatlappen-crm-feedback',['reports']);
  await new Promise((resolve,reject)=>{const tx=feedbackDb.transaction('reports','readwrite');tx.objectStore('reports').put({id:'test-feedback',createdAt:'2026-10-01T12:00:00Z',kind:'bug',status:'open',message:'Testfeedback',context:{route:'#orders',page:'Orders'}});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});feedbackDb.close();
  localStorage.setItem('spatlap-preview-design-test-design',JSON.stringify({id:'test-design',name:'Test ontwerp',updatedAt:123456789,payload:{f:{width:600,height:350},l:[],t:[]}}));
  const data=await migration.readBrowserPackage(),fingerprint=await migration.packageFingerprint(data);
  const backup=await migration.backupBlob(data),parsed=await migration.parseBackup(backup);
  if(fingerprint!==await migration.packageFingerprint(parsed))throw Error('Back-up roundtrip mismatch');
  await migration.migratePackage(data);
  const original=await migration.readBrowserPackage();
  return {unchanged:fingerprint===await migration.packageFingerprint(original),backupSize:backup.size};
 },fixture);
 assert.equal(result.unchanged,true);assert(result.backupSize>65000);
 const imported=await snapshot();assert.deepEqual(imported.records.state.main,fixture);assert.equal(imported.files.length,1);assert(imported.records.reports['test-feedback']);assert(imported.records.designs['test-design']);
 const bytes=await(await fetch(base+'/api/crm/files/test-file')).text();assert.equal(bytes,'ABC123');
 await page.reload();await page.getByRole('heading',{name:'Instellingen & back-up'}).waitFor();
 console.log('✓ Migratie + back-up met alle velden, leveranciersfacturen, feedback, ontwerpen en bestanden; browsergegevens behouden');
 const repeated=await request('/commit',{id:crypto.randomUUID(),revision:imported.revision,migration:true,operations:[{store:'state',action:'put',key:'main',value:fixture}]});assert.equal(repeated.status,409);
 const broken=structuredClone(fixture);broken.documents.push({id:'missing-file',name:'ontbreekt.pdf'});
 assert.equal((await mutate([{store:'state',action:'put',key:'main',value:broken}])).status,400);assert.deepEqual((await snapshot()).records.state.main,fixture);
 const forged=await mutate([{store:'files',action:'put',key:'forged-file',value:{objectKey:'uploads/00000000-0000-0000-0000-000000000000',size:1,type:'text/plain',sha256:'0'.repeat(64)}}]);assert.equal(forged.status,400);
 const concurrent=await snapshot(),a=structuredClone(fixture),b=structuredClone(fixture);a.customers[0].notes='A';b.customers[0].notes='B';
 const pa={id:crypto.randomUUID(),revision:concurrent.revision,operations:[{store:'state',action:'put',key:'main',value:a}]},pb={id:crypto.randomUUID(),revision:concurrent.revision,operations:[{store:'state',action:'put',key:'main',value:b}]};
 const responses=await Promise.all([request('/commit',pa),request('/commit',pb)]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 const winning=responses[0].status===200?pa:pb;assert.equal((await request('/commit',winning)).status,200);assert.equal((await snapshot()).revision,concurrent.revision+1);
 console.log('✓ Migratie overschrijft niets; ontbrekende uploads, gelijktijdige wijzigingen en herhaalde opslagverzoeken afgehandeld');
 await page.goto(base+'/admin/#orders');await page.getByRole('heading',{name:'Klantorders',exact:true}).waitFor();
 await page.locator('[data-action="new-order"]').click();await page.locator('#dialog[open]').waitFor();
 await page.locator('[name="newCustomerName"]').fill('Nieuwe testklant');await page.locator('[name="price"]').fill('100');await page.locator('[name="cost"]').fill('40');await page.locator('[name="shippingCharge"]').fill('0');
 assert.equal(await page.locator('[name="leadTimeMinWeeks"]').inputValue(),'2');assert.equal(await page.locator('[name="leadTimeMaxWeeks"]').inputValue(),'8');
 await page.locator('#dialog button[type=submit]').click();await page.locator('#dialog').waitFor({state:'hidden'});
 let current=await snapshot();assert.equal(current.records.state.main.orders.length,2);assert.equal(current.records.state.main.customers.length,2);assert.equal(current.records.state.main.orders[1].items[0].cost,4000);
 const newOrder=current.records.state.main.orders[1];
 const secondContext=await browser.newContext(),secondPage=await secondContext.newPage();secondPage.on('pageerror',e=>errors.push(e.message));await secondPage.goto(base+'/admin/#orders/'+newOrder.id);await secondPage.getByText('Nieuwe testklant',{exact:true}).first().waitFor();
 await page.goto(base+'/admin/#orders/'+newOrder.id+'/documents');await page.locator('[data-drop-owner]').first().waitFor();
 const chooserPromise=page.waitForEvent('filechooser');await page.locator('[data-action="upload"]').first().click();const chooser=await chooserPromise;await chooser.setFiles({name:'testupload.txt',mimeType:'text/plain',buffer:Buffer.from('Nieuwe cloud upload')});
 await page.getByText('testupload.txt',{exact:true}).waitFor();current=await snapshot();assert.equal(current.records.state.main.documents.length,2);
 const uploaded=current.records.state.main.documents.find(d=>d.name==='testupload.txt');assert.equal(await(await fetch(base+'/api/crm/files/'+uploaded.id)).text(),'Nieuwe cloud upload');
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-action="download"][data-id="'+uploaded.id+'"]').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'testupload.txt');
 console.log('✓ CRM-formulier: klant + order + kostprijs opslaan, tweede browsersessie, upload en downloaden');
 // The local Word converter is reached through Pages, without a production service.
 await page.locator('[data-action="make-quote"]').first().click();await page.locator('#dialog[open]').waitFor();
 const quoteDownload=page.waitForEvent('download',{timeout:90000});await page.locator('#dialog button[type=submit]').click();await page.locator('#dialog').waitFor({state:'hidden',timeout:90000});const quotePdf=await quoteDownload;assert.match(quotePdf.suggestedFilename(),/^Offerte_OF-2026-3455\.pdf$/);
 current=await snapshot();const generated=current.records.state.main.documents.filter(d=>d.generated?.kind==='quote');assert.equal(generated.length,2);assert.equal(current.records.state.main.documentSequences['OF-2026'],3455);assert.equal(current.records.state.main.documentSequences['OB-2026'],3457);
 const pdf=await(await fetch(base+'/api/crm/files/'+generated.find(d=>d.type==='application/pdf').id)).arrayBuffer();assert.equal(Buffer.from(pdf).subarray(0,4).toString(),'%PDF');
 const tikkie=await(await fetch(base+'/__local/tikkie/requests?orderId=nonexistent-cloud-test-order')).json();assert.deepEqual(tikkie.links,[]);
 console.log('✓ Lokale Word/PDF-generatie via Pages, PDF + Word in R2 en aparte documentnummering; Tikkie-route bereikbaar zonder betaalverzoek');
 // New designs save centrally and open from a second clean browser session.
 const editor=await context.newPage();editor.on('pageerror',e=>errors.push(e.message));await editor.goto(base+'/spatlap-preview.html');await editor.evaluate(()=>window.SpatlapPreview.ready);
 await editor.locator('#localDesignName').fill('Nieuw cloudontwerp');await editor.locator('#headerSave').click();await editor.waitForURL(url=>url.hash.startsWith('#local='));
 const editorUrl=editor.url();const otherEditor=await secondContext.newPage();otherEditor.on('pageerror',e=>errors.push(e.message));await otherEditor.goto(editorUrl);await otherEditor.evaluate(()=>window.SpatlapPreview.ready);assert.equal(await otherEditor.locator('#localDesignName').inputValue(),'Nieuw cloudontwerp');
 console.log('✓ Ontwerp centraal opslaan en op een tweede browsersessie teruglezen');
 // A stale blind write is rejected by the adapter before it can replace data.
 const staleResult=await page.evaluate(async()=>{
  const {openCrmDatabase}=await import('/admin/cloud-storage.js'),db=await openCrmDatabase();
  const stale=await new Promise((resolve,reject)=>{const tx=db.transaction('state');const r=tx.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});
  const current=await(await fetch('/api/crm/snapshot')).json(),fresh=structuredClone(current.records.state.main);fresh.customers[0].notes='Wijziging op andere laptop';
  const response=await fetch('/api/crm/commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),revision:current.revision,operations:[{store:'state',action:'put',key:'main',value:fresh}]})});if(!response.ok)throw Error('Fixture update failed');
  stale.customers[0].notes='Oude wijziging';
  return new Promise(resolve=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(stale,'main');tx.oncomplete=()=>resolve('overwritten');tx.onerror=()=>resolve(tx.error.status);});
 });assert.equal(staleResult,409);assert.equal((await snapshot()).records.state.main.customers[0].notes,'Wijziging op andere laptop');
 console.log('✓ Oude formuliergegevens kunnen nieuwe laptopgegevens niet overschrijven');
 await page.goto(base+'/admin/#settings');await page.getByRole('heading',{name:'Instellingen & back-up'}).waitFor();
 const backupDownload=page.waitForEvent('download');await page.locator('[data-action="export"]').click();const backup=await backupDownload;const backupData=JSON.parse(await readFile(await backup.path(),'utf8'));assert.equal(backupData.files.length,4);assert.equal(backupData.designs.length,2);assert.equal(backupData.feedback.length,1);assert.equal(backupData.state.orders.length,2);
 console.log('✓ Volledige centrale back-up downloadt inclusief uploads en ontwerpen');
 const modified=structuredClone((await snapshot()).records.state.main);modified.orders[0].notes='Moet door terugzetten verdwijnen';
 assert.equal((await mutate([{store:'state',action:'put',key:'main',value:modified}])).status,200);
 await page.reload();await page.getByRole('heading',{name:'Instellingen & back-up'}).waitFor();
 page.once('dialog',dialog=>dialog.accept());
 const restoreChooserPromise=page.waitForEvent('filechooser');await page.locator('[data-action="import"]').click();const restoreChooser=await restoreChooserPromise;
 await restoreChooser.setFiles({name:'test-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backupData))});
 await page.getByText('Back-up teruggezet',{exact:true}).waitFor();
 const restored=await snapshot();assert.deepEqual(restored.records.state.main,backupData.state);assert.equal(restored.files.length,4);assert.equal(Object.keys(restored.records.reports).length,1);assert.equal(Object.keys(restored.records.designs).length,2);
 console.log('✓ Volledige back-up terugzetten: gegevens, bestanden, feedback en ontwerpen gezamenlijk hersteld');
 // Simulate a storage outage: no silent browser fallback and no false success.
 await page.route('**/api/crm/snapshot*',route=>route.abort());
 const outage=await page.evaluate(async()=>{const {openCrmDatabase}=await import('/admin/cloud-storage.js');const db=await openCrmDatabase();return new Promise(resolve=>{const tx=db.transaction('state');tx.objectStore('state').get('main');tx.oncomplete=()=>resolve('silent-success');tx.onerror=()=>resolve(tx.error.message);});});assert.match(outage,/Geen verbinding/);await page.unroute('**/api/crm/snapshot*');
 assert.deepEqual(errors,[]);
 console.log('✓ Verbindingsfouten zichtbaar; geen stille lokale vervanging; geen JavaScript-fouten');
 console.log('Alle lokale Cloudflare-integratietests geslaagd. Geen productieaanroepen of echte CRM-gegevens gebruikt.');
}catch(error){console.error(error);console.error(log.slice(-6000));process.exitCode=1;}
finally{await browser?.close();server.kill('SIGTERM');await pause(500);}
