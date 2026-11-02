import {validatePacksShipmentPayload,packsShipmentMatchesPreparation} from '../shared/packs-provider-contract.js?v=packs-workflow-20261102';
import {integrationError,sha256} from './integration-store.js';
import {packsId,validatePacksPlanning,validatePacksPreparation,packsPreparationReview} from '../shared/packs-preparation.js?v=packs-worker-v3-20261102';

// Durable external-action evidence. Never included in order undo/state restore.
// Only the authenticated, release-gated adapter can claim/settle; no public reset.
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const instant=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const states=new Set(['pending','uncertain','booked']);
const positiveId=value=>Number.isSafeInteger(value)&&value>0&&value<=2147483647;
const fail=(message,status=409)=>{throw integrationError(message,status);};
function providerShape(value){
 if(!object(value)||Object.keys(value).some(key=>!['shipmentId','items'].includes(key))||value.shipmentId!==null&&!positiveId(value.shipmentId)||!Array.isArray(value.items)||value.items.length>200)return false;
 if(value.items.some(item=>!object(item)||Object.keys(item).some(key=>!['shipmentItemId','barcode'].includes(key))||item.shipmentItemId!==null&&!positiveId(item.shipmentItemId)||typeof item.barcode!=='string'||item.barcode.length>200||/[\x00-\x1f\x7f]/.test(item.barcode)||item.shipmentItemId===null&&!item.barcode))return false;
 const ids=value.items.map(item=>item.shipmentItemId).filter(id=>id!==null),barcodes=value.items.map(item=>item.barcode).filter(Boolean);
 return new Set(ids).size===ids.length&&new Set(barcodes).size===barcodes.length;
}

export function createPacksRegistry(store,environment){
 if(store.company!=='maatwerkkunststof'||!['test','live'].includes(environment))fail('PACKS is alleen voor de bevestigde Maatwerkkunststof-omgeving.',403);
 const guardKey='packs-'+environment+'-guard';
 const key=orderId=>{if(!packsId(orderId))fail('Ongeldig ordernummer.',400);return 'packs-'+environment+'-order-'+orderId;};
 async function guard(){
  const record=await store.read(guardKey),value=record.value;
  if(!value)return {initialized:false,ready:false,generation:''};
  if(!object(value)||Object.keys(value).some(name=>!['schemaVersion','companyId','environment','generation','state'].includes(name))||value.schemaVersion!==1||value.companyId!==store.company||value.environment!==environment||!packsId(value.generation)||!['active','reconcile'].includes(value.state))fail('Het PACKS-register moet eerst worden onderzocht; opnieuw boeken blijft geblokkeerd.');
  return {initialized:true,ready:value.state==='active',generation:value.generation};
 }
 function validate(value,orderId){
  if(value===null)return;
  if(!object(value)||Object.keys(value).some(name=>!['schemaVersion','companyId','environment','orderId','generation','attempts'].includes(name))||value.schemaVersion!==1||value.companyId!==store.company||value.environment!==environment||value.orderId!==orderId||!packsId(value.generation)||!Array.isArray(value.attempts)||value.attempts.length!==1)fail('Onbekend PACKS-register. Laat het onderzoeken voordat er verder geboekt wordt.');
  // Replacement/rejection release is deliberately absent until PACKS confirms
  // the recovery contract. Never trim an uncertain attempt or replace it by TTL.
  for(const attempt of value.attempts){
   const allowed=['attemptId','requestId','fingerprint','configVersion','actorHash','createdAt','updatedAt','status','preparation','provider','planning','projection','accountKey','providerRequest','labelEvidence'];
   if(!object(attempt)||Object.keys(attempt).some(name=>!allowed.includes(name))||!packsId(attempt.attemptId)||!packsId(attempt.requestId)||!digest(attempt.fingerprint)||!packsId(attempt.configVersion)||!digest(attempt.actorHash)||!instant(attempt.createdAt)||!instant(attempt.updatedAt)||!states.has(attempt.status)||!['pending','complete'].includes(attempt.projection)||!providerShape(attempt.provider))fail('Onbekende PACKS-poging. De boekingsblokkade blijft behouden.');
   if(attempt.labelEvidence!==undefined&&(attempt.status!=='booked'||!Array.isArray(attempt.labelEvidence)||attempt.labelEvidence.length!==attempt.preparation.packages.length||attempt.labelEvidence.some(f=>!object(f)||Object.keys(f).some(k=>!['shipmentItemId','barcode','sha256','size'].includes(k))||!positiveId(f.shipmentItemId)||!digest(f.sha256)||!Number.isSafeInteger(f.size)||f.size<5||f.size>4000000||!attempt.provider.items.some(i=>i.shipmentItemId===f.shipmentItemId&&i.barcode===f.barcode))))fail('Het labelbewijs sluit niet aan op de bekende boeking.');
   if(attempt.providerRequest!==undefined||attempt.accountKey!==undefined){if(!packsId(attempt.accountKey)||attempt.providerRequest?.shipperShipmentId!==attempt.attemptId)fail('De vaste account-/payloadbasis van deze poging klopt niet.');validatePacksShipmentPayload(attempt.providerRequest);if(!packsShipmentMatchesPreparation(attempt.providerRequest,attempt.preparation))fail('De vaste payload wijkt af van de bewaarde voorbereiding.');}
   validatePacksPreparation(attempt.preparation);
   if(attempt.planning!==undefined){if(attempt.status!=='booked')fail('Planning hoort bij een bevestigde PACKS-boeking.');validatePacksPlanning(attempt.planning);}
   if(attempt.status==='booked'&&(!attempt.provider.shipmentId||attempt.provider.items.length!==attempt.preparation.packages.length||attempt.provider.items.some(item=>!positiveId(item.shipmentItemId))))fail('De bekende boeking mist pakketgegevens. Laat de zending onderzoeken.');
  }
 }
 async function read(orderId){const record=await store.read(key(orderId));validate(record.value,orderId);return record;}
 const publicAttempt=attempt=>({attemptId:attempt.attemptId,status:attempt.status,createdAt:attempt.createdAt,updatedAt:attempt.updatedAt,shipmentId:attempt.provider.shipmentId,items:attempt.provider.items.map(item=>({...item})),...(attempt.planning?{planning:{...attempt.planning}}:{}),projection:attempt.projection,configVersion:attempt.configVersion,preparationRevision:attempt.preparation.revision});
 async function status(orderId){
  const readiness=await guard(),record=await read(orderId);
  return {environment,initialized:readiness.initialized,reconciliationRequired:!readiness.ready||!!record.value&&record.value.generation!==readiness.generation,version:record.version,attempts:(record.value?.attempts||[]).map(publicAttempt),canBook:false};
 }
 async function claim(orderId,input){
  // Internal building block only. The handler has no caller for this operation.
  const readiness=await guard();if(!readiness.ready)fail('PACKS-register niet vrijgegeven; eerst inrichting of herstelonderzoek.');
  if(!object(input)||Object.keys(input).some(name=>!['attemptId','requestId','fingerprint','configVersion','actorHash','preparation','accountKey','providerRequest'].includes(name))||!packsId(input.attemptId)||!packsId(input.requestId)||!digest(input.fingerprint)||!packsId(input.configVersion)||!digest(input.actorHash))fail('Ongeldige boekingsidentiteit.',400);
  if(input.providerRequest!==undefined||input.accountKey!==undefined){if(!packsId(input.accountKey)||input.providerRequest?.shipperShipmentId!==input.attemptId)fail('Controleer de vaste account-/payloadbasis.',400);validatePacksShipmentPayload(input.providerRequest);if(!packsShipmentMatchesPreparation(input.providerRequest,input.preparation))fail('De vaste payload wijkt af van de voorbereiding.',400);}
  validatePacksPreparation(input.preparation);
  let basis;try{basis=JSON.parse(input.preparation.basis);}catch{fail('Ongeldige orderbasis.',400);}
  if(basis?.orderId!==orderId)fail('De voorbereiding hoort niet bij deze order.',400);
  const fingerprint=await sha256(JSON.stringify([store.company,environment,orderId,input.configVersion,input.preparation,...(input.providerRequest?[input.accountKey,input.providerRequest]:[])]));
  if(input.fingerprint!==fingerprint)fail('De gecontroleerde voorbereidingsbasis is gewijzigd.',409);
  const record=await read(orderId),previous=record.value?.attempts[0];
  if(previous){
   if(record.value.generation!==readiness.generation)fail('Herstelonderzoek vereist voor deze order.');
   if(previous.requestId===input.requestId&&previous.attemptId===input.attemptId&&previous.fingerprint===input.fingerprint&&previous.configVersion===input.configVersion&&JSON.stringify(previous.preparation)===JSON.stringify(input.preparation)&&previous.accountKey===input.accountKey&&JSON.stringify(previous.providerRequest)===JSON.stringify(input.providerRequest))return {claimed:false,attempt:publicAttempt(previous)};
   fail('Bij deze order bestaat al een PACKS-poging. Controleer die zending; er wordt niet opnieuw geboekt.');
  }
  const reviewed=packsPreparationReview(input.preparation,{basis:input.preparation.basis,reference:input.preparation.reference});
  if(!reviewed.preparationComplete)fail('De fysieke voorbereiding is nog onvolledig.');
  const now=new Date().toISOString(),attempt={...structuredClone(input),createdAt:now,updatedAt:now,status:'pending',provider:{shipmentId:null,items:[]},projection:'pending'};
  const value={schemaVersion:1,companyId:store.company,environment,orderId,generation:readiness.generation,attempts:[attempt]};validate(value,orderId);
  await store.write(key(orderId),value,record.version);
  // Configuration/recovery may change during the asynchronous claim. Keep the
  // intent, but never return dispatch permission from an already closed guard.
  const currentGuard=await guard();
  if(!currentGuard.ready||currentGuard.generation!==readiness.generation)fail('PACKS is tijdens het bewaren geblokkeerd of gewijzigd. De poging blijft bewaard; niet boeken, eerst herstelonderzoek.');
  return {claimed:true,attempt:publicAttempt(attempt)};
 }
 async function settle(orderId,attemptId,{status:outcome,provider,planning}={}){
  if(!packsId(attemptId)||!['uncertain','booked'].includes(outcome)||!providerShape(provider))fail('Ongeldig boekingsresultaat.',400);
  if(planning!==undefined){if(outcome!=='booked')fail('Onzekere planning is geen bevestigd boekingsbewijs.',400);validatePacksPlanning(planning);}
  const record=await read(orderId),value=record.value,attempt=value?.attempts[0];if(!attempt||attempt.attemptId!==attemptId)fail('De oorspronkelijke PACKS-poging ontbreekt. Laat dit onderzoeken.');
  if(attempt.status==='booked'){
   if(outcome==='booked'&&JSON.stringify(provider)===JSON.stringify(attempt.provider)&&JSON.stringify(planning)===JSON.stringify(attempt.planning))return publicAttempt(attempt);
   fail('Een bekende PACKS-boeking kan niet worden teruggezet of overschreven.');
  }
  // Never discard already known provider IDs, including a partial response.
  if(attempt.provider.shipmentId!==null&&provider.shipmentId!==attempt.provider.shipmentId||attempt.provider.items.some(item=>!provider.items.some(next=>(item.shipmentItemId===null||next.shipmentItemId===item.shipmentItemId)&&(!item.barcode||next.barcode===item.barcode))))fail('Dit resultaat verliest eerder bekende PACKS-gegevens. Onderzoek de oorspronkelijke zending.');
  attempt.status=outcome;attempt.provider=structuredClone(provider);if(planning!==undefined)attempt.planning=structuredClone(planning);attempt.updatedAt=new Date().toISOString();validate(value,orderId);
  await store.write(key(orderId),value,record.version);return publicAttempt(attempt);
 }
 async function resolve(orderId,attemptId,{configVersion,accountKey}={}){
  const readiness=await guard(),record=await read(orderId),value=record.value,attempt=value?.attempts[0];
  if(!readiness.ready||!value||value.generation!==readiness.generation||!attempt||attempt.attemptId!==attemptId||!attempt.providerRequest||attempt.configVersion!==configVersion||attempt.accountKey!==accountKey)fail('Herstel vereist de oorspronkelijke poging, accountconfiguratie en registergeneratie.');
  return structuredClone(attempt);
 }
 async function labelsReceived(orderId,attemptId,files){
  const record=await read(orderId),attempt=record.value?.attempts[0];if(!attempt||attempt.attemptId!==attemptId||attempt.status!=='booked')fail('De oorspronkelijke volledige boeking ontbreekt.');
  if(attempt.labelEvidence&&JSON.stringify(attempt.labelEvidence)!==JSON.stringify(files))fail('PACKS leverde andere PDF-bytes dan het bewaarde labelbewijs. Controleer dezelfde zending; niet opnieuw boeken.');
  if(!attempt.labelEvidence){attempt.labelEvidence=structuredClone(files);attempt.updatedAt=new Date().toISOString();validate(record.value,orderId);await store.write(key(orderId),record.value,record.version);}
 }
 async function projected(orderId,attemptId){const record=await read(orderId),attempt=record.value?.attempts[0];if(!attempt||attempt.attemptId!==attemptId||attempt.status!=='booked'||!attempt.labelEvidence)fail('De labelidentiteiten zijn nog niet bewaard.');if(attempt.projection!=='complete'){attempt.projection='complete';attempt.updatedAt=new Date().toISOString();validate(record.value,orderId);await store.write(key(orderId),record.value,record.version);}return status(orderId);}
 return {status,claim,settle,resolve,labelsReceived,projected};
}
