import {integrationStore,integrationError} from './integration-store.js';
import {createPacksRegistry} from './packs-registry.js';
import {createPacksConfiguration} from './packs-configuration.js';
import {createPacksProviderClient} from './packs-provider-client.js';
import {packsId} from '../shared/packs-preparation.js';

// Only information from GetShipment is cached. PACKS 'Done' is NOT delivery proof.
// This module never sends BookShipment, retries a booking or modifies CRM orders.
const validId=x=>Number.isSafeInteger(x)&&x>0&&x<=2147483647;
const bounded=(x,max=240)=>typeof x==='string'?x.slice(0,max):null;
const trackingKey=(environment,orderId)=>'packs-'+environment+'-tracking-'+orderId;
export function normalizedPacksTracking({orderId,attempt,shipment,environment,now=new Date().toISOString()}){
 if(!packsId(orderId)||!attempt||attempt.status!=='booked'||!validId(attempt.provider?.shipmentId)||!shipment||shipment.shipmentId!==attempt.provider.shipmentId||shipment.shipperShipmentId!==attempt.attemptId)
  throw integrationError('PACKS-antwoord hoort niet bij de bestaande bevestigde zending.',409);
 const items=attempt.provider.items||[];
 return {schemaVersion:1,companyId:'maatwerkkunststof',environment,orderId,attemptId:attempt.attemptId,shipmentId:attempt.provider.shipmentId,
  barcodes:items.map(i=>bounded(i.barcode,200)).filter(Boolean),
  bookingStatus:bounded(shipment.status),logisticsStatus:bounded(shipment.logisticsStatus),
  trackAndTraceUrl:typeof shipment.trackAndTraceUrl==='string'&&/^https:\/\//i.test(shipment.trackAndTraceUrl)&&shipment.trackAndTraceUrl.length<=2000?shipment.trackAndTraceUrl:null,
  loadDate:bounded(shipment.loadDate,48),deliveryDate:bounded(shipment.deliveryDate,48),
  // A planned date or status 'Done' must never be presented as delivered.
  deliveredAt:null,checkedAt:now};
}
export async function writePacksTrackingSnapshot(store,environment,orderId,attempt,shipment){
 if(!['test','live'].includes(environment))throw integrationError('PACKS-omgeving onbekend.',503);
 const next=normalizedPacksTracking({orderId,attempt,shipment,environment});
 const key=trackingKey(environment,orderId);
 for(let tries=0;tries<2;tries++){
  const old=await store.read(key);
  if(old.value&&(old.value.shipmentId!==next.shipmentId||old.value.attemptId!==next.attemptId))throw integrationError('TRACK & TRACE hoort bij een andere oorspronkelijke zending.',409);
  try{return (await store.write(key,next,old.version)).value;}catch(error){if(error.status!==409||tries===1)throw error;}
 }
}
export async function readPacksTrackingSnapshot(store,environment,orderId){
 if(!packsId(orderId)||!['test','live'].includes(environment))throw integrationError('Ongeldig TRACK & TRACE-verzoek.',400);
 const item=(await store.read(trackingKey(environment,orderId))).value;
 return item?.schemaVersion===1&&item?.orderId===orderId&&item?.environment===environment?item:null;
}

// Run from Cloudflare Cron (not the public HTTP route).
// Fail closed until the SAME CRM D1, encrypted registry and profile are configured.
export async function syncPacksTrackingScheduled(env,{maxShipments=10,clock=()=>Date.now()}={}){
 const report={checked:0,changed:0,skipped:0,failed:0};
 if(env.CRM_PACKS_TRACKING_ENABLED!=='true'||env.CRM_COMPANY_ID!=='maatwerkkunststof'||env.CRM_LOCAL_DEV==='true'||env.CRM_LOCAL_SERVICES||env.CRM_PACKS_TRIAL_ONLY==='true')return {...report,disabled:true};
 const environment=env.CRM_PACKS_ENVIRONMENT;
 if(!['test','live'].includes(environment)||env.CRM_RELEASE_ENV!==(environment==='live'?'production':'preview'))return {...report,disabled:true};
 const store=integrationStore(env);
 const config=createPacksConfiguration(env,store),check=await config.status();
 if(!check.enabled)return {...report,disabled:true};
 const items=await env.DB.prepare('SELECT name FROM crm_integrations WHERE company_id=? AND name LIKE ? ORDER BY updated_at DESC LIMIT 400')
  .bind(store.company,'packs-'+environment+'-order-%').all();
 const candidates=[];
 for(const row of items.results||[]){
  const orderId=row.name.slice(('packs-'+environment+'-order-').length);
  if(!packsId(orderId))continue;
  try{
   const status=await createPacksRegistry(store,environment).status(orderId);
   const attempt=status.attempts[0];
   if(attempt?.status!=='booked'||!validId(attempt.shipmentId)||!status.initialized||status.reconciliationRequired){report.skipped++;continue;}
   const cached=await readPacksTrackingSnapshot(store,environment,orderId);
   // Poll newest bookkeeping first, but prioritize the least recently checked.
   candidates.push({orderId,attempt,checkedMs:cached?.checkedAt?Date.parse(cached.checkedAt):0});
  }catch{report.skipped++;}
 }
 candidates.sort((a,b)=>(a.checkedMs||0)-(b.checkedMs||0));
 for(const item of candidates.slice(0,Math.min(25,Math.max(0,maxShipments)))){
  try{
   const registry=createPacksRegistry(store,environment);
   const profile=await config.loadProfile(item.attempt.configVersion);
   if(!await config.authorizeOperation({operation:'labels',profile})){report.skipped++;continue;}
   const evidence=await registry.resolve(item.orderId,item.attempt.attemptId,{configVersion:profile.version,accountKey:profile.accountKey});
   if(evidence.status!=='booked'||evidence.provider.shipmentId!==item.attempt.shipmentId){report.skipped++;continue;}
   const client=await createPacksProviderClient({store,profile,resolveCredentials:config.resolveCredentials}).prepare();
   const shipment=await client.shipment(evidence.provider.shipmentId);
   await writePacksTrackingSnapshot(store,environment,item.orderId,evidence,shipment);
   report.checked++;report.changed++;
  }catch{report.failed++;}
 }
 return report;
}
