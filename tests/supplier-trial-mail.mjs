// Prepared only. Run solely after separate permission; memory and stubs only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createMailEngine} from '../shared/mail-service.js';
import {supplierTrialKind,supplierTrialSubject,supplierTrialNotice} from '../shared/supplier-trial-mail.js';
import {limitedRequestJson} from '../cloudflare/request-json.js';
import {packsTrialPathAllowed,packsTrialBindingsReady} from '../cloudflare/packs-trial-policy.js';

function fixture({uncertain=false}={}){
 const original={apiKey:'api-'+ 'x'.repeat(32),sender:'sender@example.invalid',senderName:'Fictief bedrijf',replyTo:'reply@example.invalid',testTo:'control@example.invalid',aliases:[],allowCustomers:false,signature:'',signatureHtml:'',senderByKind:{packing:'sender@example.invalid'},signatureSettingsVersion:'fixture-signatures'};
 const records=new Map([['config',structuredClone(original)]]),calls=[];let queue=Promise.resolve();
 const service=createMailEngine({
  async read(company,name){return structuredClone(records.get(name)??null);},async write(company,name,value){records.set(name,structuredClone(value));},
  exclusive(company,work){const result=queue.then(work);queue=result.catch(()=>{});return result;},digest:async value=>value,
  async fetchImpl(url,options){assert.equal(url,'https://api.smtp2go.com/v3/email/send');calls.push(JSON.parse(options.body));return Response.json(uncertain?{notAcceptedProof:true}:{data:{succeeded:1,failed:0,email_id:'fixture-provider'}});}
 });
 const input={companyId:'maatwerkkunststof',kind:supplierTrialKind,requestId:'fixture-request',orderId:'fixture-order',customerId:'fixture-customer',documentId:'fixture-packing',confirmed:true,to:original.testTo,expectedTestTo:original.testTo,subject:supplierTrialSubject+'Fictieve order',text:supplierTrialNotice+'\nFictieve controle.',expectedSender:original.sender,expectedSenderName:original.senderName,expectedReplyTo:original.replyTo,pdf:{filename:'Pakbon.pdf',fileblob:btoa('%PDF-1.4\nFICTIEVE HEADER - NIET PRINTEN')},attachments:[{filename:'Label.pdf',fileblob:btoa('%PDF-1.4\nFICTIEVE HEADER - GEEN LABEL')}]};
 return {service,records,calls,input,original};
}
test('a proof uses exactly the configured recipient and two PDFs while customer mail stays disabled',async()=>{
 const {service,records,calls,input}=fixture();const result=await service.send('maatwerkkunststof',input);
 assert.equal(result.kind,supplierTrialKind);assert.equal(result.to,input.to);assert.equal(calls.length,1);assert.equal(calls[0].attachments.length,2);assert.ok(calls[0].attachments.every(file=>file.mimetype==='application/pdf'));assert.deepEqual(calls[0].to,[input.to]);assert.equal(records.get('config').allowCustomers,false);
});
for(const [name,mutate] of [
 ['different destination',i=>i.to='other@example.invalid'],['supplier destination',i=>{i.to='info@kunststofbaas.nl';i.expectedTestTo=i.to;}],['changed expected recipient',i=>i.expectedTestTo='older@example.invalid'],['missing proof subject',i=>i.subject='Fictief'],['missing proof body',i=>i.text='Fictief'],['old reply chain',i=>i.replyMessageId='<fixture@example.invalid>'],['third attachment',i=>i.attachments.push({...i.attachments[0],filename:'Extra.pdf'})],['wrong label type',i=>i.attachments[0].filename='Label.txt'],['wrong label header',i=>i.attachments[0].fileblob=btoa('not a PDF')]
])test('proof refuses '+name+' before any transport',async()=>{const {service,input,calls}=fixture();mutate(input);await assert.rejects(service.send('maatwerkkunststof',input));assert.equal(calls.length,0);});
test('company boundary cannot be bypassed by choosing the proof purpose',async()=>{const {service,input,calls}=fixture();input.companyId='spatlappen';await assert.rejects(service.send('spatlappen',input),/Maatwerkkunststof/);assert.equal(calls.length,0);});
test('updating the proof recipient preserves unrelated settings and does not send',async()=>{
 const {service,records,calls,original}=fixture(),change={testTo:'second@example.invalid',expectedTestTo:original.testTo,confirmed:true};
 await service.trialRecipient('maatwerkkunststof',change);await service.trialRecipient('maatwerkkunststof',change);
 assert.deepEqual(records.get('config'),{...original,testTo:change.testTo});assert.equal(calls.length,0);
 await assert.rejects(service.trialRecipient('maatwerkkunststof',{...change,testTo:'third@example.invalid'}),/intussen/);
});
test('proof idempotence keeps one acceptance and never retries an uncertain result',async()=>{
 const good=fixture();await good.service.send('maatwerkkunststof',good.input);assert.equal((await good.service.send('maatwerkkunststof',good.input)).reused,true);assert.equal(good.calls.length,1);
 const lost=fixture({uncertain:true});await assert.rejects(lost.service.send('maatwerkkunststof',lost.input));await assert.rejects(lost.service.send('maatwerkkunststof',{...lost.input,requestId:'another-fixture'}));assert.equal(lost.calls.length,1);assert.equal(lost.records.get('journal')['fixture-request'].status,'uncertain');
});
test('stream limit rejects an oversized body with no Content-Length before parsing',async()=>{
 const request=new Request('https://fixture.example.invalid/mail-send',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(100)});
 await assert.rejects(limitedRequestJson(request,32),error=>error.status===413);
});
test('online proof policy exposes only storage, document and proof-mail routes',()=>{
 for(const path of ['/api/crm/assistant/status','/api/crm/notifications/run','/api/crm/packs/book','/__local/packs/book','/__local/tikkie/create','/__local/tikkie/check','/__local/assistant/gmail-login','/__local/assistant/route-compute'])assert.equal(packsTrialPathAllowed(path),false,path);
 for(const path of ['/api/crm/config','/api/crm/snapshot','/api/crm/files/fixture','/api/crm/packs/review','/__local/assistant/mail-send','/__local/documents/render','/auth/login','/admin/'])assert.equal(packsTrialPathAllowed(path),true,path);
});
test('proof storage cannot open without matching independently provisioned database and bucket markers',async()=>{
 const id='packs-proef-fixture-environment',env={CRM_COMPANY_ID:'maatwerkkunststof',CRM_RELEASE_ENV:'preview',CRM_PACKS_TRIAL_ONLY:'true',CRM_PACKS_TRIAL_ID:id,DB:{prepare(){return {async first(){return {environment_id:id};}};}},CRM_FILES:{async head(key){assert.equal(key,'_packs-trial/'+id);return {key};}}};
 assert.equal(await packsTrialBindingsReady(env),true);
 for(const override of [{CRM_LOCAL_DEV:'true'},{CRM_COMPANY_ID:'spatlappen'},{CRM_RELEASE_ENV:'production'},{CRM_PACKS_TRIAL_ID:'production'},{DB:{prepare(){throw Error('fixture absent marker');}}},{CRM_FILES:{async head(){return null;}}}])assert.equal(await packsTrialBindingsReady({...env,...override}),false);
});
