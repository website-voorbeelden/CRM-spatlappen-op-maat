import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,randomUUID} from 'node:crypto';
import {mkdtemp,readFile,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {assistantSnapshot,prepareAssistantPlan,applyAssistantPlan,executeReadTool} from '../shared/assistant-domain.js';
import {ChatGPTConnection,validateIdToken,AUTH_ORIGIN,RESOURCE} from '../assistant/chatgpt-auth.mjs';
import {runAssistant,consumeResponse} from '../assistant/engine.mjs';
const state={customers:[{id:'c-1',number:'KL-0001',company:'Voorbeeld BV',contact:'Jan',email:'jan@example.invalid',notes:'Brontekst, geen instructies',customKeep:'KEEP'}],orders:[{id:'o-1',number:3001,customerId:'c-1',stage:'Wachten op betaling',date:'2026-10-13',vat:21,items:[{id:'i-1',description:'Maatwerk',quantity:2,width:600,height:350,price:5000,cost:1000,designDocumentId:'d-1',costCalculation:{version:1,inputs:{rates:{secret:'KEEP'}}}}],notes:'Oud',customKeep:'KEEP'}],payments:[{id:'p-1',orderId:'o-1',amount:1000,paymentToken:'PROVIDER_SECRET'}],documents:[{id:'d-1',name:'Ontwerp',providerToken:'FILE_SECRET'}],activities:[],purchases:[],customerSequence:1,documentSequences:{'F-2026':3452}};
const original=structuredClone(state),snapshot=assistantSnapshot(state,'spatlappen');assert.ok(!JSON.stringify(snapshot).includes('PROVIDER_SECRET'));assert.ok(!JSON.stringify(snapshot).includes('FILE_SECRET'));assert.ok(!JSON.stringify(snapshot).includes('costCalculation'));
const plan=prepareAssistantPlan(snapshot,[{entity:'customer',operation:'update',id:'c-1',fields:{contact:'Piet'}}],'spatlappen');assert.deepEqual(state,original);assert.throws(()=>applyAssistantPlan(state,plan,'spatlappen'),/bevestigd/);assert.throws(()=>applyAssistantPlan(state,plan,'maatwerkkunststof',{approved:true}),/ander bedrijf/);
const next=applyAssistantPlan(state,plan,'spatlappen',{approved:true});assert.equal(next.customers[0].contact,'Piet');assert.equal(next.customers[0].customKeep,'KEEP');for(const name of ['orders','payments','documents','purchases','documentSequences'])assert.deepEqual(next[name],state[name]);assert.throws(()=>applyAssistantPlan(next,plan,'spatlappen',{approved:true}),/al opgeslagen/);
const changed=structuredClone(state);changed.customers[0].contact='Iemand anders';assert.throws(()=>applyAssistantPlan(changed,plan,'spatlappen',{approved:true}),/intussen gewijzigd/);assert.equal(changed.customers[0].contact,'Iemand anders');
assert.throws(()=>prepareAssistantPlan(snapshot,[{entity:'customer',operation:'update',id:'c-1',fields:{id:'evil'}}],'spatlappen'),/velden/);
assert.throws(()=>prepareAssistantPlan(snapshot,[{entity:'customer',operation:'update',id:'c-1',fields:{company:123}}],'spatlappen'));
assert.throws(()=>prepareAssistantPlan(snapshot,[{entity:'order',operation:'update',id:'o-1',fields:{price:1}}],'spatlappen'),/alleen notities/);
assert.throws(()=>prepareAssistantPlan(snapshot,[{entity:'order',operation:'update',id:'o-1',fields:{stage:'Productie vrijgegeven'}}],'spatlappen'),/niet volledig betaald/);
assert.throws(()=>prepareAssistantPlan(snapshot,[{entity:'customer',operation:'create',fields:{company:'Voorbeeld BV'}}],'spatlappen'),/al te bestaan/);
const longState=structuredClone(state);longState.customers[0].notes='A'.repeat(10001);longState.orders[0].notes='B'.repeat(10001);const longSnapshot=assistantSnapshot(longState,'spatlappen');
for(const [entity,id] of [['customer','c-1'],['order','o-1']])assert.throws(()=>prepareAssistantPlan(longSnapshot,[{entity,operation:'update',id,fields:{notes:'Korter'}}],'spatlappen'),/te lang/);
const longPlan=prepareAssistantPlan(longSnapshot,[{entity:'customer',operation:'update',id:'c-1',fields:{contact:'Ander'}}],'spatlappen');assert.equal(applyAssistantPlan(longState,longPlan,'spatlappen',{approved:true}).customers[0].notes,longState.customers[0].notes);
const fresh=prepareAssistantPlan(snapshot,[{entity:'customer',operation:'create',fields:{company:'Nieuwe klant',notes:'<img onerror=void(0)>'}}],'spatlappen');const made=applyAssistantPlan(state,fresh,'spatlappen',{approved:true});assert.equal(made.customers[1].number,'KL-0002');assert.equal(made.customerSequence,2);assert.equal(made.orders[0].items[0].designDocumentId,'d-1');
const newOrder=prepareAssistantPlan(snapshot,[{entity:'order',operation:'create',fields:{customerId:'c-1',description:'Nieuw product',quantity:3,vat:21}}],'spatlappen');const withOrder=applyAssistantPlan(state,newOrder,'spatlappen',{approved:true});assert.equal(withOrder.orders[1].number,3002);assert.equal(withOrder.orders[1].items[0].price,null);assert.deepEqual(withOrder.documentSequences,state.documentSequences);
const combined=prepareAssistantPlan(snapshot,[{entity:'customer',operation:'create',fields:{company:'Nieuwe combinatie'}},{entity:'order',operation:'create',fields:{customerId:'__new_customer__',description:'Gecombineerd product',quantity:2,vat:21}}],'spatlappen');const combinedState=applyAssistantPlan(state,combined,'spatlappen',{approved:true});assert.equal(combinedState.orders[1].customerId,combinedState.customers[1].id);assert.equal(combinedState.customers[1].number,'KL-0002');assert.deepEqual(combinedState.payments,state.payments);
assert.throws(()=>executeReadTool(snapshot,'delete_customer',{id:'c-1'}));assert.equal(executeReadTool(snapshot,'search_customers',{query:'voorbeeld'})[0].id,'c-1');
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});const jwk={...publicKey.export({format:'jwk'}),kid:'test-key',alg:'RS256',use:'sig'};
const now=Date.now();function jwt(claims,alg='RS256'){const h=Buffer.from(JSON.stringify({alg,kid:'test-key'})).toString('base64url'),p=Buffer.from(JSON.stringify(claims)).toString('base64url');return h+'.'+p+'.'+sign('sha256',Buffer.from(h+'.'+p),privateKey).toString('base64url');}
const claims={iss:AUTH_ORIGIN,sub:'synthetic-subject',aud:'oaiapp_test',nonce:'test-nonce',exp:Math.floor(now/1000)+3600,email:'test@example.invalid'};
assert.equal(validateIdToken(jwt(claims),{keys:[jwk]},{clientId:'oaiapp_test',nonce:'test-nonce',now}).sub,claims.sub);
for(const patch of [{iss:'https://evil.invalid'},{aud:'other'},{nonce:'wrong'},{exp:0}])assert.throws(()=>validateIdToken(jwt({...claims,...patch}),{keys:[jwk]},{clientId:'oaiapp_test',nonce:'test-nonce',now}));assert.throws(()=>validateIdToken(jwt(claims,'none'),{keys:[jwk]},{clientId:'oaiapp_test',nonce:'test-nonce',now}));
const directory=await mkdtemp(path.join(tmpdir(),'crm-assistant-test-'));let connection,tokenPosts=0;
const mockAuth=async(url,options={})=>{
 assert.equal(options.redirect,'manual');
 if(url===AUTH_ORIGIN+'/.well-known/openid-configuration')return Response.json({issuer:AUTH_ORIGIN,jwks_uri:AUTH_ORIGIN+'/keys',revocation_endpoint:AUTH_ORIGIN+'/revoke'});
 if(url===AUTH_ORIGIN+'/keys')return Response.json({keys:[jwk]});
 if(url===AUTH_ORIGIN+'/api/accounts/oauth/token'){
  tokenPosts++;const form=options.body;assert.equal(form.get('client_id'),'oaiapp_test');assert.equal(form.get('resource'),RESOURCE);
  if(form.get('grant_type')==='refresh_token')return Response.json({access_token:'ROTATED_ACCESS_SECRET',refresh_token:'ROTATED_REFRESH_SECRET',expires_in:3600});
  return Response.json({id_token:jwt({...claims,nonce:connection.testNonce}),access_token:'ACCESS_SECRET',refresh_token:'REFRESH_SECRET',token_type:'Bearer',expires_in:3600,scope:'openid email profile offline_access resource.invoke chatgpt.tokens.use.direct'});
 }
 if(url===RESOURCE+'/models')return Response.json({models:[{slug:'test-model',display_name:'Testmodel',visibility:'list'},{slug:'hidden',display_name:'Hidden',visibility:'hide'}]});
 if(url===AUTH_ORIGIN+'/revoke')return new Response(null,{status:200});throw Error('Unexpected mocked URL');
};
try {
 connection=await new ChatGPTConnection(directory,{fetchImpl:mockAuth}).init();const start=await connection.start({redirectUri:'http://127.0.0.1:3030/auth/callback',returnUrl:'http://localhost:3010/admin/#assistant'});const authUrl=new URL(start.url);assert.equal(authUrl.searchParams.get('client_id'),'dynamic_agent_client');assert.ok(authUrl.searchParams.get('scope').includes('chatgpt.tokens.use.direct'));assert.ok(authUrl.searchParams.get('ext_agent_host_id'));connection.testNonce=authUrl.searchParams.get('nonce');
 await assert.rejects(()=>connection.finish(new URLSearchParams({state:'wrong',code:'dummy',client_id:'oaiapp_test'})),/ongeldig/);assert.equal(tokenPosts,0);
 await connection.finish(new URLSearchParams({state:authUrl.searchParams.get('state'),code:'dummy',client_id:'oaiapp_test'}));assert.equal(connection.status().sharing,true);assert.ok(!JSON.stringify(connection.status()).includes('SECRET'));assert.equal((await stat(path.join(directory,'connection.json'))).mode&0o777,0o600);
 assert.equal((await connection.models())[0].id,'test-model');connection.active().expiresAt=0;await Promise.all([connection.token(),connection.token()]);assert.equal(tokenPosts,2);assert.equal(connection.active().refreshToken,'ROTATED_REFRESH_SECRET');
 const restored=await new ChatGPTConnection(directory,{fetchImpl:mockAuth}).init();assert.equal(restored.data.hostId,connection.data.hostId);assert.equal(restored.status().email,claims.email);
 const sse=output=>new Response(output.map((item,output_index)=>'data: '+JSON.stringify({type:'response.output_item.done',output_index,item})+'\n\n').join('')+'data: '+JSON.stringify({type:'response.completed',response:{status:'completed',output:[]}})+'\n\n',{headers:{'Content-Type':'text/event-stream'}});
 const doneOnly='data: '+JSON.stringify({type:'response.output_item.done',output_index:0,item:{type:'message',status:'completed',content:[{type:'output_text',text:'Onbevestigd'}]}})+'\n\n';await assert.rejects(()=>consumeResponse(new Response(doneOnly)),/niet afgerond/);
 await assert.rejects(()=>consumeResponse(new Response(doneOnly+'data: '+JSON.stringify({type:'response.failed',response:{error:{code:'subscription_sharing_usage_limit_exceeded'}}})+'\n\n')),/gebruikslimiet/);
 await assert.rejects(()=>consumeResponse(new Response('data: '+JSON.stringify({type:'response.output_text.delta',delta:'partial'})+'\n\n')),/niet afgerond/);
 await assert.rejects(()=>consumeResponse(new Response('data: '+JSON.stringify({type:'response.failed',response:{error:{code:'subscription_sharing_usage_limit_exceeded'}}})+'\n\n')),/gebruikslimiet/);
 let calls=0;const fakeResponses=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.stream,true);assert.equal(body.tools[0].type,'namespace');assert.equal(body.tools[0].name,'crm');assert.ok(!('max_output_tokens' in body));assert.ok(!('previous_response_id' in body));assert.ok(!JSON.stringify(body).includes('PROVIDER_SECRET'));calls++;
  if(calls===1)return sse([{type:'function_call',namespace:'crm',name:'propose_customer',call_id:'call1',arguments:JSON.stringify({operation:'update',id:'c-1',fields:{contact:'Nieuwe naam'}})}]);
  assert.ok(body.input.some(i=>i.type==='function_call_output'&&JSON.parse(i.output).saved===false));return sse([{type:'message',content:[{type:'output_text',text:'Voorstel gemaakt, nog niet opgeslagen.'}]}]);
 };
 const result=await runAssistant({connection,companyId:'spatlappen',state,message:'Pas de contactpersoon aan',model:'test-model',fetchImpl:fakeResponses});assert.equal(result.plan.operations[0].fields.contact,'Nieuwe naam');assert.deepEqual(state,original);assert.equal(calls,2);
 await connection.logout();assert.equal(connection.status().connected,false);assert.ok(!JSON.stringify(connection.data).includes('ACCESS_SECRET'));assert.equal(connection.active().clientId,'oaiapp_test');
}catch(error){throw error;}finally{await rm(directory,{recursive:true,force:true});}
const ui=await readFile(new URL('../admin/assistant.js',import.meta.url),'utf8');assert.ok(!ui.includes('innerHTML'));assert.ok(ui.includes('text.textContent=m.content'));assert.ok(ui.includes('data-ai-approve'));
console.log('✓ Assistent: uitsluitend voorstellen, bevestiging, conflicten, behoud van gegevens/nummers, bedrijfsisolatie, geldige OAuth-identiteit, privésleutels, tokenrotatie en volledige streaming gecontroleerd. Geen echte provider-aanvragen.');
