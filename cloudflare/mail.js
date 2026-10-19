import {createMailEngine} from '../shared/mail-service.js';
import {integrationStore,integrationError,sha256} from './integration-store.js';
import {sessionFingerprint} from './auth.js';
export function createCloudMail(env,{fetcher=fetch}={}){
 const store=integrationStore(env),versions=new Map();
 return createMailEngine({
  async read(company,name){if(company!==store.company)throw integrationError('Deze aanvraag hoort bij een ander bedrijf.',403);const record=await store.read('mail-'+name);versions.set(name,record.version);return record.value;},
  async write(company,name,value){if(company!==store.company)throw integrationError('Deze aanvraag hoort bij een ander bedrijf.',403);const record=await store.write('mail-'+name,value,versions.get(name)||'');versions.set(name,record.version);},
  exclusive:(company,fn)=>{if(company!==store.company)throw integrationError('Deze aanvraag hoort bij een ander bedrijf.',403);return store.exclusive('mail',fn);},fetchImpl:fetcher,digest:sha256
 });
}
export async function handleMail({request,env},{fetcher=fetch}={}){
 const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 try{
  await sessionFingerprint(request,env);const url=new URL(request.url),action=url.pathname.replace('/__local/assistant/mail-',''),service=createCloudMail(env,{fetcher});
  if(request.method==='GET'&&['status','journal'].includes(action))return json(await service[action](env.CRM_COMPANY_ID));
  if(request.method!=='POST'||request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json')||!['configure','send'].includes(action))throw integrationError('Ongeldig mailverzoek.',403);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>(action==='send'?15_000_000:650000))throw integrationError('Het mailverzoek is te groot.',413);
  let input;try{input=JSON.parse(raw);}catch{throw integrationError('Ongeldig mailverzoek.');}if(!input||typeof input!=='object'||Array.isArray(input))throw integrationError('Ongeldig mailverzoek.');
  if(action==='send'&&env.CRM_RELEASE_ENV==='preview')throw integrationError('Echte mailverzending staat uit in de testomgeving.',403);
  return json(await service[action](env.CRM_COMPANY_ID,input));
 }catch(e){return json({error:e.message,...(e.field?{field:e.field}:{}),...(e.mailStatus?{mailStatus:e.mailStatus}:{})},e.status||400);}
}
