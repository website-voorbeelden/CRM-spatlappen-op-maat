import {integrationError,sha256} from './integration-store.js';
import {createPacksRegistry} from './packs-registry.js?v=packs-workflow-20261102';
import {createPacksProviderClient} from './packs-provider-client.js?v=packs-workflow-20261102';
import {supplierFulfilmentInfo} from '../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {packsId,packsPreparationBasis} from '../shared/packs-preparation.js?v=packs-worker-v3-20261102';
import {validatePacksProviderProfile,buildPacksShipment,packsBookingResult,packsLabelFiles} from '../shared/packs-provider-contract.js?v=packs-workflow-20261102';

// Server execution behind authenticated packs.js. The adapter supplies the
// current server actor/config/release, authoritative snapshots and explicit
// authorization; source presence never activates an account.
export function createPacksExecution({env,store,loadSnapshot,loadProfile,resolveCredentials,authorizeOperation,fetchImpl,onEvent}){
 const emit=async(code,details)=>{try{await onEvent?.(code,details);}catch{}};
 const fail=(message,status=409)=>{throw integrationError(message,status);};
 async function profileFor(command,operation){
  if(env.CRM_COMPANY_ID!=='maatwerkkunststof'||store.company!==env.CRM_COMPANY_ID||env.CRM_PACKS_TRIAL_ONLY==='true'||env.CRM_LOCAL_DEV==='true'||env.CRM_LOCAL_SERVICES)fail('PACKS-uitvoering staat uit in deze bedrijfs-, lokale of mailproefomgeving.',403);
  if(command.confirmed!==true||!packsId(command.orderId)||!packsId(command.attemptId)||!packsId(command.expectedProfileVersion)||!packsId(command.preparationRevision)||typeof command.expectedOrderSignature!=='string'||command.expectedOrderSignature.length>500000||!command.expectedOrderSignature||!/^[a-f0-9]{64}$/.test(command.actorHash||''))fail('De expliciet gecontroleerde serverbasis ontbreekt.',400);
  const profile=structuredClone(await loadProfile(operation==='labels'?command.expectedProfileVersion:undefined));validatePacksProviderProfile(profile);
  if(profile.version!==command.expectedProfileVersion||env.CRM_RELEASE_ENV!==(profile.environment==='live'?'production':'preview'))fail('Accountversie en test-/liveomgeving komen niet overeen.');
  if(typeof authorizeOperation!=='function'||await authorizeOperation({operation,profile:structuredClone(profile),command:structuredClone(command)})!==true)fail('De PACKS-uitvoering is nog niet afzonderlijk vrijgegeven.',423);
  return profile;
 }
 async function current(command){
  const snapshot=await loadSnapshot(),order=snapshot.state?.orders?.find(order=>order.id===command.orderId),info=supplierFulfilmentInfo(snapshot.state,order,env.CRM_COMPANY_ID),preparation=info.workflow?.packsPreparation;
  if(!info.current||order.fulfilmentMethod!=='shipping'||info.signature!==command.expectedOrderSignature||!preparation||preparation.revision!==command.preparationRevision||preparation.basis!==info.basis||preparation.reference!==info.reference)fail('De order of pakketvoorbereiding is gewijzigd. Bekijk de huidige waarden opnieuw.');
  return {info,preparation:structuredClone(preparation),hasExistingLabel:!!info.workflow.labelDocumentId||snapshot.state.documents.some(document=>document.ownerId===order.id&&document.shippingLabel?.carrier==='packs')};
 }
 const clientFor=profile=>createPacksProviderClient({store,profile,resolveCredentials,onEvent:emit,...(fetchImpl?{fetchImpl}:{})});
 async function settleEvidence(registry,orderId,attemptId,outcome){
  try{return await registry.settle(orderId,attemptId,outcome);}
  catch{
   // One retry of the SAME evidence write only. A lost acknowledgement may
   // already have committed it; settle is monotonic and recognizes that case.
   // This never invokes a carrier call or claims a new attempt.
   try{return await registry.settle(orderId,attemptId,outcome);}
   catch{fail('Het PACKS-resultaat kon niet duurzaam worden bevestigd. De bestaande poging blijft blokkeren; niet opnieuw boeken.',503);}
  }
 }
 async function book(command){
  const profile=await profileFor(command,'book'),registry=createPacksRegistry(store,profile.environment);
  if(!packsId(command.requestId)||command.acknowledgeCosts!==true||command.noExistingShipmentConfirmed!==true)fail('Bevestig de boekingsactie, tariefafspraak en dat er ook handmatig nog geen zending is geboekt.',400);
  const previous=await registry.status(command.orderId);
  if(previous.reconciliationRequired||!previous.initialized)fail('Het PACKS-register is nog niet vrijgegeven of vereist herstelonderzoek.');
  if(previous.attempts.length){await emit('claim_existing');return {...previous,dispatched:false};}
  const {info,preparation,hasExistingLabel}=await current(command);
  if(hasExistingLabel)fail('Bij deze order staat al een PACKS-label. Controleer die bestaande zending; er wordt niet nogmaals geboekt.');
  await emit('review_ok');const provider=await clientFor(profile).prepare(),productInfo=await provider.products();
  const providerRequest=buildPacksShipment(preparation,profile,{attemptId:command.attemptId,labelText:command.labelText,productInfo});
  const fingerprint=await sha256(JSON.stringify([store.company,profile.environment,command.orderId,profile.version,preparation,profile.accountKey,providerRequest]));
  const claim=await registry.claim(command.orderId,{attemptId:command.attemptId,requestId:command.requestId,fingerprint,configVersion:profile.version,actorHash:command.actorHash,preparation,accountKey:profile.accountKey,providerRequest});
  if(!claim.claimed){await emit('claim_existing');return {...await registry.status(command.orderId),dispatched:false};}
  await emit('claim_ok');
  let outcome={status:'uncertain',provider:{shipmentId:null,items:[]}};
  try{
   const latestProfile=await profileFor(command,'book');if(JSON.stringify(latestProfile)!==JSON.stringify(profile))fail('Het PACKS-profiel is gewijzigd na het vastleggen van de poging.');
   const latest=await current(command);if(latest.info.signature!==info.signature||latest.hasExistingLabel)fail('De order is gewijzigd of er is inmiddels een PACKS-label toegevoegd.');
   const persisted=await registry.resolve(command.orderId,command.attemptId,{configVersion:profile.version,accountKey:profile.accountKey});
   if(persisted.status!=='pending'||persisted.fingerprint!==fingerprint)fail('De oorspronkelijke boekingsintentie past niet meer.');
   // Exactly one call in the successful CAS winner; no transport retry, token
   // refresh, expired-lease retry or GetShipments-based automatic release.
   await emit('dispatch');const result=await provider.bookShipment(providerRequest);
   outcome=packsBookingResult(result.body,providerRequest,{httpOk:result.httpOk});
  }catch{
   await emit('uncertain');await settleEvidence(registry,command.orderId,command.attemptId,{status:'uncertain',provider:outcome.provider});
   fail('Deze PACKS-poging blijft geblokkeerd voor herstelonderzoek. Er wordt niet opnieuw geboekt.');
  }
  // Preserve external IDs BEFORE any PDF decoding, fetching or projection.
  // A failed settlement leaves durable pending, never permission to rebook.
  await settleEvidence(registry,command.orderId,command.attemptId,outcome);await emit(outcome.status==='booked'?'booked':'uncertain',{checks:outcome.checks});
  return {...await registry.status(command.orderId),dispatched:true};
 }
 async function recoverLabels(command){
  const profile=await profileFor(command,'labels'),registry=createPacksRegistry(store,profile.environment),attempt=await registry.resolve(command.orderId,command.attemptId,{configVersion:profile.version,accountKey:profile.accountKey});
  if(attempt.status!=='booked')fail('Zonder volledig bekende boeking eerst PACKS laten reconciliëren; niet opnieuw boeken.');
  const before=await current(command);
  if(attempt.preparation.basis!==before.info.basis||attempt.preparation.reference!==before.info.reference||packsPreparationBasis(attempt.preparation)!==packsPreparationBasis(before.preparation))fail('Het bestaande label hoort bij eerdere waarden. Laat de oorspronkelijke zending beoordelen.');
  await emit('labels_start');let files;try{const provider=await clientFor(profile).prepare(),body=await provider.labels(attempt.provider);files=packsLabelFiles(body,attempt.provider);}catch(error){await emit('labels_failed');throw error;}await emit('labels_ok');
  const after=await current(command);if(after.info.signature!==before.info.signature)fail('De order wijzigde tijdens labelherstel. De bekende boeking blijft behouden.');
  await registry.resolve(command.orderId,command.attemptId,{configVersion:profile.version,accountKey:profile.accountKey});
  // Private bytes for a future idempotent state/files projector, not an HTTP
  // status payload. No existing file is overwritten or selected by this method.
  return {attemptId:attempt.attemptId,provider:structuredClone(attempt.provider),environment:profile.environment,preparation:structuredClone(attempt.preparation),files,projection:'pending'};
 }
 return {book,recoverLabels};
}
