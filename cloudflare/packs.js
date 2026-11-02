import {authenticated,sessionFingerprint} from './auth.js';
import {integrationStore,integrationError,sha256} from './integration-store.js';
import {createPacksRegistry} from './packs-registry.js?v=packs-workflow-20261102';
import {createPacksConfiguration} from './packs-configuration.js?v=packs-workflow-20261102';
import {createPacksDiagnostics} from './packs-diagnostics.js?v=packs-worker-v3-20261102';
import {createPacksExecution} from './packs-execution.js?v=packs-workflow-20261102';
import {createPacksProviderClient} from './packs-provider-client.js?v=packs-workflow-20261102';
import {supplierFulfilmentInfo} from '../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {packsId,packsContractBlocks,packsPreparationReview,packsPreparationBasis} from '../shared/packs-preparation.js?v=packs-worker-v3-20261102';
import {buildPacksShipment} from '../shared/packs-provider-contract.js?v=packs-workflow-20261102';
import {packsLabelFileId,validatePacksApiLabels} from '../shared/packs-label-projection.js?v=packs-workflow-20261102';

async function inputJson(request){
 const reader=request.body?.getReader();if(!reader)throw integrationError('PACKS-verzoek ontbreekt.');let size=0,raw='';const decoder=new TextDecoder();
 try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>2100000){await reader.cancel();throw integrationError('PACKS-verzoek te groot.',413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
 let value;try{value=JSON.parse(raw);}catch{throw integrationError('Ongeldig PACKS-verzoek.');}if(!value||typeof value!=='object'||Array.isArray(value))throw integrationError('Ongeldig PACKS-verzoek.');return value;
}
const allowed=(input,keys)=>{if(Object.keys(input).some(k=>!keys.includes(k)))throw integrationError('Onverwachte PACKS-invoer.');};
const base64=bytes=>{let text='';for(let n=0;n<bytes.length;n+=8192)text+=String.fromCharCode(...bytes.subarray(n,n+8192));return btoa(text);};
export async function handlePacks({request,env,loadSnapshot}){
 const traceId=crypto.randomUUID(),started=Date.now();let log;
 const json=(body,status=200)=>Response.json({...body,capabilities:{automaticPlanning:true,planningEvidence:true},traceId},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 try{
  const user=await authenticated(request,env);if(!user)throw integrationError('Log opnieuw in om PACKS te gebruiken.',401);
  if(env.CRM_COMPANY_ID!=='maatwerkkunststof')throw integrationError('PACKS is alleen voor Maatwerkkunststof.',403);
  const url=new URL(request.url),action=url.pathname.replace(/^\/(?:api\/crm|__local)\/packs\//,''),local=user.local||env.CRM_LOCAL_DEV==='true'||!!env.CRM_LOCAL_SERVICES,trial=env.CRM_PACKS_TRIAL_ONLY==='true';
  if(local||trial){
   if(request.method==='GET'&&action==='status')return json({companyId:env.CRM_COMPANY_ID,mode:trial?'mail-trial':'local-only',canBook:false,canRecoverLabels:false,environment:null,configuration:{configured:false,enabled:false},contractBlocks:packsContractBlocks,reason:trial?'Deze omgeving is uitsluitend voor proefmail.':'Deze server gebruikt lokale/testopslag. Boeken vereist de apart ingerichte centrale PACKS-server.'});
   if(!(action==='review'&&request.method==='POST'))throw integrationError('Deze lokale of mailproefomgeving voert geen PACKS-account- of boekingsacties uit.',423);
  }
  let input;
  if(request.method==='POST'){
   if(request.headers.get('Origin')!==url.origin||request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw integrationError('Ongeldig PACKS-verzoek.',403);
   input=await inputJson(request);
  }else if(request.method!=='GET')throw integrationError('Onbekende PACKS-actie.',404);
  const environment=['test','live'].includes(env.CRM_PACKS_ENVIRONMENT)?env.CRM_PACKS_ENVIRONMENT:null;
  const store=local||trial?null:integrationStore(env),configuration=store?createPacksConfiguration(env,store):null;
  if(action==='configuration'&&request.method==='POST'){allowed(input,['profile','credentials','expectedVersion','confirmed']);return json({configuration:await configuration.save(input)});}
  if(action==='initialize-register'&&request.method==='POST'){
   allowed(input,['confirmed','profileVersion']);const profile=await configuration.loadProfile();
   if(input.confirmed!==true||input.profileVersion!==profile.version||env.CRM_PACKS_FRESH_INSTALL!=='true'||!packsId(env.CRM_PACKS_REGISTRY_GENERATION)||environment!==profile.environment)throw integrationError('Registerinrichting vereist een bewust bevestigde eerste installatie en onafhankelijke servergeneratie. Een ontbrekend oud register mag niet opnieuw worden vrijgegeven.',423);
   const name='packs-'+environment+'-guard',previous=await store.read(name);
   if(previous.value){if(previous.value.generation!==env.CRM_PACKS_REGISTRY_GENERATION)throw integrationError('Er staat al een andere registergeneratie. Niet resetten.',409);}
   else await store.write(name,{schemaVersion:1,companyId:store.company,environment,generation:env.CRM_PACKS_REGISTRY_GENERATION,state:'active'},previous.version);
   return json({initialized:true});
  }
  const orderId=request.method==='GET'?url.searchParams.get('orderId'):input.orderId;
  if(!packsId(orderId))throw integrationError('Kies een geldige order.');
  if(!loadSnapshot)throw integrationError('Autoritatieve CRM-opslag ontbreekt.',503);
  const snapshot=await loadSnapshot(),order=snapshot.state?.orders?.find(o=>o.id===orderId);
  if(!order)throw integrationError('Deze order staat niet in deze centrale administratie.',404);
  const info=supplierFulfilmentInfo(snapshot.state,order,env.CRM_COMPANY_ID),preparation=info.workflow?.packsPreparation;
  if(store&&environment)log=createPacksDiagnostics(store,environment,orderId,traceId,input?.attemptId||'');
  if(action==='diagnostics'&&request.method==='GET')return json({environment,events:log?await log.read():[]});
  if(action==='status'&&request.method==='GET'){
   const config=await configuration.status(),registry=environment?await createPacksRegistry(store,environment).status(orderId):null;
   const guard=environment?(await store.read('packs-'+environment+'-guard')).value:null;const guardAligned=guard?.generation===env.CRM_PACKS_REGISTRY_GENERATION;const blockers=[...(config.blockers||[]),...(!registry?.initialized?['Boekingsregister nog niet bewust ingericht.']:registry.reconciliationRequired||!guardAligned?['Register vereist herstel of hoort bij een andere servergeneratie.']:[])];
   const ready=!!config.enabled&&registry?.initialized&&!registry.reconciliationRequired&&guardAligned;
   return json({companyId:env.CRM_COMPANY_ID,mode:'connected',environment,configuration:config,registry,blockers,canBook:ready&&!registry.attempts.length&&!info.workflow?.labelDocumentId&&!snapshot.state.documents.some(d=>d.ownerId===orderId&&d.shippingLabel),canRecoverLabels:ready&&registry?.attempts[0]?.status==='booked',contractBlocks:config.configured?[]:packsContractBlocks});
  }
  if(request.method!=='POST'||!['review','book','recover-labels','projection-ack'].includes(action))throw integrationError('Onbekende PACKS-actie.',404);
  allowed(input,['orderId','preparationRevision','checkService','attemptId','requestId','expectedProfileVersion','expectedOrderSignature','labelText','confirmed','acknowledgeCosts','noExistingShipmentConfirmed']);
  if(!preparation||!packsId(input.preparationRevision)||input.preparationRevision!==preparation.revision||!info.current||order.fulfilmentMethod!=='shipping')throw integrationError('De bestelling of pakketvoorbereiding is gewijzigd. Open de huidige waarden opnieuw.',409);
  const review=packsPreparationReview(preparation,{basis:info.basis,reference:info.reference});
  if(action==='review'&&input.checkService!==true)return json({orderId,...review});
  if(local||trial)throw integrationError('Boeken is niet beschikbaar in deze lokale of mailproefomgeving.',423);
  await log?.append('request');
  const profile=await configuration.loadProfile(action==='book'||action==='review'?undefined:input.expectedProfileVersion);
  if(profile.environment!==environment)throw integrationError('De ingestelde test-/liveomgeving past niet bij dit account.',409);
  const registry=createPacksRegistry(store,environment),actorHash=await sha256(await sessionFingerprint(request,env));
  if(input.expectedProfileVersion!==profile.version||input.expectedOrderSignature!==info.signature)throw integrationError('Account of order verschilt van jouw geopende controle. Bekijk alles opnieuw.',409);
  await log?.append('configuration');
  const command={...input,actorHash},execute=createPacksExecution({env,store,loadSnapshot,loadProfile:configuration.loadProfile,resolveCredentials:configuration.resolveCredentials,authorizeOperation:configuration.authorizeOperation,onEvent:(code,details)=>log?.append(code,details)});
  if(action==='review'){
   if(!review.preparationComplete)throw integrationError('Vul eerst alle pakket-, adres- en gereedheidscontroles in.',409);
   if(!await configuration.authorizeOperation({operation:'book',profile}))throw integrationError('Deze accountversie is nog niet door de server vrijgegeven.',423);
   const status=await registry.status(orderId);if(status.reconciliationRequired||!status.initialized||status.attempts.length||info.workflow.labelDocumentId||snapshot.state.documents.some(d=>d.ownerId===orderId&&d.shippingLabel))throw integrationError('Er is een bestaande poging/label of het register vraagt inrichting/herstel. Niet opnieuw boeken.',409);
   const client=await createPacksProviderClient({store,profile,resolveCredentials:configuration.resolveCredentials,onEvent:(code,details)=>log?.append(code,details)}).prepare(),products=await client.products();
   buildPacksShipment(preparation,profile,{attemptId:input.attemptId,labelText:input.labelText,productInfo:products});await log?.append('review_ok');
   return json({orderId,reviewed:true,environment,profileVersion:profile.version,preparationRevision:preparation.revision,expectedOrderSignature:info.signature,attemptId:input.attemptId,labelText:input.labelText,preparation});
  }
  if(action==='book'){const result=await execute.book(command);await log?.append('finished',{durationMs:Date.now()-started});return json({registry:result});}
  if(action==='recover-labels'){
   if(input.confirmed!==true||!await configuration.authorizeOperation({operation:'labels',profile}))throw integrationError('Bevestig labelherstel in de juiste vrijgegeven omgeving.',423);
   const known=await registry.resolve(orderId,input.attemptId,{configVersion:profile.version,accountKey:profile.accountKey});if(known.status!=='booked')throw integrationError('Deze poging is nog niet als volledig geboekt bevestigd. Niet opnieuw boeken; laat dezelfde poging onderzoeken.',409);let files,evidence;
   if(known.labelEvidence){
    if(packsPreparationBasis(known.preparation)!==packsPreparationBasis(preparation)||known.preparation.basis!==info.basis||known.preparation.reference!==info.reference)throw integrationError('De oorspronkelijke labelbasis is gewijzigd; niet automatisch toepassen.',409);
    evidence=known.labelEvidence;files=[];
    for(const [n,item] of evidence.entries()){const object=await env.CRM_FILES.get(labelCacheKey(environment,orderId,input.attemptId,n,item.sha256));if(!object)throw integrationError('Het bewaarde originele label ontbreekt in de bestandsopslag. Laat dezelfde boeking onderzoeken; boek niet opnieuw.',409);const bytes=new Uint8Array(await object.arrayBuffer());if(bytes.length!==item.size||await sha256Bytes(bytes)!==item.sha256)throw integrationError('Het bewaarde labelbewijs wijkt af. Laat dezelfde boeking onderzoeken.',409);files.push({...item,bytes});}
    await log?.append('labels_ok');
   }else{
    const result=await execute.recoverLabels(command);files=result.files;evidence=[];
    for(const [n,file] of files.entries()){const item={shipmentItemId:file.shipmentItemId,barcode:file.barcode,size:file.bytes.byteLength,sha256:await sha256Bytes(file.bytes)};evidence.push(item);await env.CRM_FILES.put(labelCacheKey(environment,orderId,input.attemptId,n,item.sha256),file.bytes,{httpMetadata:{contentType:'application/pdf'},customMetadata:{sha256:item.sha256}});}
    await registry.labelsReceived(orderId,input.attemptId,evidence);
   }
   return json({attemptId:input.attemptId,environment,shipmentId:known.provider.shipmentId,...(known.planning?{planning:known.planning}:{}),files:files.map((file,n)=>({...evidence[n],base64:base64(file.bytes)}))});
  }
  if(action==='projection-ack'){
   const attempt=await registry.resolve(orderId,input.attemptId,{configVersion:profile.version,accountKey:profile.accountKey}),current=await loadSnapshot();validatePacksApiLabels(current.state);
   const bundleId=packsLabelFileId(environment,input.attemptId,'bundle'),bundle=current.state.documents.find(d=>d.id===bundleId),currentOrder=current.state.orders.find(o=>o.id===orderId);
   if(currentOrder?.supplierFulfilment?.labelDocumentId!==bundleId||!bundle?.packsLabelBundle||!attempt.labelEvidence)throw integrationError('De labelopslag is nog niet bij de centrale order bevestigd. Herstel dezelfde labels.',409);
   if(JSON.stringify(bundle.packsLabelBundle.planning)!==JSON.stringify(attempt.planning))throw integrationError('De bewaarde planning wijkt af van dezelfde PACKS-boeking. Herstel dezelfde labels; boek niet opnieuw.',409);
   for(const [n,file] of attempt.labelEvidence.entries()){
    const id=packsLabelFileId(environment,input.attemptId,'p'+(n+1)),doc=current.state.documents.find(d=>d.id===id),row=await env.DB.prepare('SELECT object_key,sha256,size FROM crm_files WHERE id=?').bind(id).first();
    if(!doc?.packsLabelSource||doc.packsLabelSource.sha256!==file.sha256||doc.packsLabelSource.shipmentItemId!==file.shipmentItemId||doc.packsLabelSource.barcode!==file.barcode||row?.sha256!==file.sha256||row.size!==file.size||!await env.CRM_FILES.head(row.object_key))throw integrationError('Een origineel label ontbreekt of wijkt af. Herstel dezelfde boeking.',409);
   }
   const storedBundle=await env.DB.prepare('SELECT object_key,sha256,size FROM crm_files WHERE id=?').bind(bundleId).first();
   if(storedBundle?.sha256!==bundle.packsLabelBundle.sha256||storedBundle.size!==bundle.size||!await env.CRM_FILES.head(storedBundle.object_key))throw integrationError('De labelbundel is nog niet duurzaam beschikbaar.',409);
   const result=await registry.projected(orderId,input.attemptId);await log?.append('projection_ok');return json({registry:result});
  }
 }catch(error){await log?.append(error.status===423?'blocked':'failed',{httpStatus:error.status||503,durationMs:Date.now()-started});return json({error:error.status?error.message:'De PACKS-stap kon niet worden afgerond. Bekijk de bestaande poging en het log; boek bij twijfel niet opnieuw.',code:'packs_step_failed'},error.status||503);}
}
async function sha256Bytes(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}

const labelCacheKey=(environment,orderId,attemptId,n,hash)=>'_packs-label-evidence/'+environment+'/'+orderId+'/'+attemptId+'/'+(n+1)+'-'+hash+'.pdf';
