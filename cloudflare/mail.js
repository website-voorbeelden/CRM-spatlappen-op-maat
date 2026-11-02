import {verifyCloudSupplierTrial,verifyCloudSupplierDocument} from './supplier-trial-evidence.js?v=packs-worker-v3-20261102';
import {limitedRequestJson} from './request-json.js';
import {packsTrialOnly} from './packs-trial-policy.js';
import {supplierTrialKind} from '../shared/supplier-trial-mail.js?v=supplier-batches35-20261101';
import {createMailEngine} from '../shared/mail-service.js?v=supplier-batches35-20261101';
import {integrationStore,integrationError,sha256} from './integration-store.js';
import {sessionFingerprint} from './auth.js';
export function createCloudMail(env,{fetcher=fetch}={}){
 const store=integrationStore(env),versions=new Map();
 return createMailEngine({
  async read(company,name){if(company!==store.company)throw integrationError('Deze aanvraag hoort bij een ander bedrijf.',403);const record=await store.read('mail-'+name);versions.set(name,record.version);return record.value;},
  async write(company,name,value){if(company!==store.company)throw integrationError('Deze aanvraag hoort bij een ander bedrijf.',403);const record=await store.write('mail-'+name,value,versions.get(name)||'');versions.set(name,record.version);},
  verifySupplierTrial:(company,input)=>verifyCloudSupplierTrial(env,input),
  verifySupplierDocument:(company,input)=>company==='maatwerkkunststof'?verifyCloudSupplierDocument(env,input):null,
  exclusive:(company,fn)=>{if(company!==store.company)throw integrationError('Deze aanvraag hoort bij een ander bedrijf.',403);return store.exclusive('mail',fn);},fetchImpl:fetcher,digest:sha256
 });
}
export async function handleMail({request,env},{fetcher=fetch}={}){
 const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 try{
  await sessionFingerprint(request,env);const url=new URL(request.url),action=url.pathname.replace('/__local/assistant/mail-',''),service=createCloudMail(env,{fetcher});
  if(request.method==='GET'&&['status','journal'].includes(action))return json(await service[action](env.CRM_COMPANY_ID));
  if(request.method!=='POST'||request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json')||!['configure','send','trial-recipient'].includes(action))throw integrationError('Ongeldig mailverzoek.',403);
  const input=await limitedRequestJson(request,action==='send'?15_000_000:4_000_000);
  if(action==='send'&&(env.CRM_RELEASE_ENV==='preview'||packsTrialOnly(env))&&input.kind!==supplierTrialKind)throw integrationError('Gewone mailverzending staat uit in de proefomgeving. Alleen de beveiligde leveranciersproefmail is toegestaan.',403);
  return json(await service[action==='trial-recipient'?'trialRecipient':action](env.CRM_COMPANY_ID,input));
 }catch(e){return json({error:e.message,...(e.field?{field:e.field}:{}),...(e.mailStatus?{mailStatus:e.mailStatus}:{})},e.status||400);}
}
