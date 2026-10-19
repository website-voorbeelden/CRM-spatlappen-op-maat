import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createGmailActions,normalizeGmailAction} from '../assistant/gmail-actions.mjs';
import {gmailScopes,hasGmailScope} from '../shared/gmail-capabilities.js';
import {startAssistantServer} from '../assistant/server.mjs';
import {assistantTools} from '../assistant/engine.mjs';
const directory=await mkdtemp(path.join(tmpdir(),'gmail-approval-')),context={session:'a'.repeat(64),channel:'human'},model={...context,channel:'model'};
let time=1000000,who={connected:true,mailbox:'owner@example.invalid',revision:'v1',scopes:[gmailScopes.read]},calls=[],target={labelIds:['INBOX']};
const options={directory,getIdentity:async()=>who,now:()=>time},input={operation:'messages.send',reason:'Door gebruiker gevraagd antwoord',payload:{to:['client@example.invalid'],subject:'Fictieve test',text:'FAKE_BODY'}};
try{
 const prepared=createGmailActions(options),p=await prepared.propose('spatlappen',input,model);assert.equal(prepared.capabilities().executionEnabled,false);assert.equal(p.reviewNonce,undefined);assert.ok(!JSON.stringify(prepared.list('spatlappen',context)).includes('reviewNonce'));
 await assert.rejects(()=>prepared.confirm('spatlappen',{id:p.id,revision:p.revision,confirmed:true},context),/Onbekend veld/);
 await assert.rejects(()=>prepared.review('spatlappen',{id:p.id,revision:p.revision},model),/Alleen/);
 await assert.rejects(()=>prepared.review('maatwerkkunststof',{id:p.id,revision:p.revision},context),/andere sessie/);
 await assert.rejects(()=>prepared.review('spatlappen',{id:p.id,revision:p.revision},{...context,session:'b'.repeat(64)}),/andere sessie/);
 const review=await prepared.review('spatlappen',{id:p.id,revision:p.revision},context),confirmation={id:p.id,revision:p.revision,reviewNonce:review.reviewNonce,statement:p.statement};
 await assert.rejects(()=>prepared.confirm('spatlappen',confirmation,model),/AI mag niet/);
 await assert.rejects(()=>prepared.confirm('spatlappen',{...confirmation,payload:{text:'ALTERED'}},context),/Onbekend/);
 await assert.rejects(()=>prepared.confirm('spatlappen',{...confirmation,statement:'ja'},context),/precies/);
 const result=await prepared.confirm('spatlappen',confirmation,context);assert.equal(result.executed,false);assert.equal(result.status,'reviewed-only');await assert.rejects(()=>prepared.confirm('spatlappen',confirmation,context),/opnieuw/);
 const journal=await readFile(path.join(directory,'spatlappen',p.id+'.json'),'utf8');assert.ok(!journal.includes('FAKE_BODY'));assert.equal((await stat(path.join(directory,'spatlappen',p.id+'.json'))).mode&0o777,0o600);
 assert.equal(createGmailActions(options).list('spatlappen',context).length,0); // restart never resurrects approvals
 const gate=createGmailActions({...options,readTarget:async()=>target,executor:async action=>{calls.push(action);}});
 async function proposeAndReview(operation='messages.modify',payload={id:'aabb',addLabelIds:['Label_1'],removeLabelIds:[]}){const p=await gate.propose('spatlappen',{operation,payload,reason:'Fictieve controle'},context);const r=await gate.review('spatlappen',{id:p.id,revision:p.revision},context);return {id:p.id,revision:p.revision,reviewNonce:r.reviewNonce,statement:p.statement};}
 const stale=await proposeAndReview();who={...who,revision:'v2'};await assert.rejects(()=>gate.confirm('spatlappen',stale,context),/toestemming is gewijzigd/);who={...who,revision:'v1'};
 const wrongMailbox=await proposeAndReview();who={...who,mailbox:'other@example.invalid'};await assert.rejects(()=>gate.confirm('spatlappen',wrongMailbox,context),/account of de toestemming/);who={...who,mailbox:'owner@example.invalid'};
 const missing=await proposeAndReview();await assert.rejects(()=>gate.confirm('spatlappen',missing,context),/Google-toestemming ontbreekt/);assert.equal(calls.length,0);
 who={...who,scopes:[gmailScopes.modify]};const changed=await proposeAndReview();target={labelIds:['STARRED']};await assert.rejects(()=>gate.confirm('spatlappen',changed,context),/oorspronkelijke mail/);assert.equal(calls.length,0);
 const expired=await proposeAndReview();time+=120001;await assert.rejects(()=>gate.confirm('spatlappen',expired,context),/opnieuw/);
 const single=await proposeAndReview();const concurrent=await Promise.allSettled([gate.confirm('spatlappen',single,context),gate.confirm('spatlappen',single,context)]);assert.equal(concurrent.filter(v=>v.status==='fulfilled').length,1);assert.equal(calls.length,1);assert.equal(calls[0].companyId,'spatlappen');
 const critical=await proposeAndReview('settings.vacation',{enabled:true,subject:'Vakantie',text:'Fictief'});await assert.rejects(()=>gate.confirm('spatlappen',critical,context),/extra identiteitscontrole/);assert.equal(calls.length,1);
 const uncertain=createGmailActions({...options,readTarget:async()=>target,executor:async()=>{calls.push('uncertain');throw Error('Network failure after provider accepted');}});const up=await uncertain.propose('spatlappen',input,context),ur=await uncertain.review('spatlappen',{id:up.id,revision:up.revision},context),uc={id:up.id,revision:up.revision,reviewNonce:ur.reviewNonce,statement:up.statement};await assert.rejects(()=>uncertain.confirm('spatlappen',uc,context),/uitkomst is onzeker/);await assert.rejects(()=>uncertain.confirm('spatlappen',uc,context),/opnieuw/);assert.equal(calls.length,2);
 for(const operation of ['messages.delete','messages.batchDelete','settings.forwarding','settings.delegates','genericRequest'])assert.throws(()=>normalizeGmailAction(operation,{id:'aabb'}));
 assert.throws(()=>normalizeGmailAction('messages.send',{...input.payload,subject:'Test\nBcc: injected@example.invalid'}),/mailkop/);assert.equal(normalizeGmailAction('drafts.create',{to:[],subject:'Later afmaken',text:''}).payload.to.length,0);assert.throws(()=>normalizeGmailAction('messages.send',{...input.payload,raw:'SECRET'}),/Onbekend/);assert.throws(()=>normalizeGmailAction('messages.send',{...input.payload,to:['x@example.invalid\nBcc:y@example.invalid']}),/e-mailadres/);assert.throws(()=>normalizeGmailAction('messages.modify',{id:'aabb',addLabelIds:['TRASH']}),/Systeemlabels/);assert.throws(()=>normalizeGmailAction('labels.create',{name:'X',url:'https://evil.invalid'}),/Onbekend/);
 assert.equal(hasGmailScope([gmailScopes.read],gmailScopes.send),false);assert.equal(hasGmailScope([gmailScopes.compose],gmailScopes.send),true);assert.equal(hasGmailScope([gmailScopes.modify],gmailScopes.settings),false);assert.equal(hasGmailScope([gmailScopes.modify],gmailScopes.labels),true);
 assert.ok(!JSON.stringify(assistantTools).includes('confirm'));assert.ok(!JSON.stringify(assistantTools).includes('reviewNonce')); // no model approval or HTTP tools
 const helper=await startAssistantServer({key:'x'.repeat(64),port:0,gmailDirectory:path.join(directory,'http'),mailDirectory:path.join(directory,'smtp'),connection:{status:()=>({})},speech:{status:()=>({ready:false})},fetchImpl:async()=>{throw Error('No provider access allowed');}});
 try{const base='http://127.0.0.1:'+helper.port,headers={Authorization:'Bearer '+'x'.repeat(64),'X-CRM-Company':'spatlappen','X-CRM-Origin':'http://localhost:3010/','Content-Type':'application/json'};
  assert.equal((await fetch(base+'/gmail-actions-capabilities')).status,403);const response=await fetch(base+'/gmail-actions-capabilities',{headers});assert.equal(response.status,200);assert.equal((await response.json()).executionEnabled,false);
  assert.equal((await fetch(base+'/gmail-actions-confirm',{method:'POST',headers,body:JSON.stringify({confirmed:true})})).status,400);
  assert.equal((await fetch(base+'/gmail-actions-capabilities',{headers:{...headers,'X-CRM-Company':'maatwerkkunststof'}})).status,400);
  assert.equal((await fetch(base+'/gmail-actions-execute',{method:'POST',headers,body:'{}'})).status,404);
 }finally{await helper.close();}
 console.log('✓ Gmail preparation: disabled production writes, exact proposals, independent human reviews, per-company/mailbox/session guards, expiry, typed confirmation, scope/state checks, one-time concurrency, private journal, no retry after uncertainty, critical actions blocked.');
}finally{await rm(directory,{recursive:true,force:true});}
