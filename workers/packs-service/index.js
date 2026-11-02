import {openPacksContext} from '../../cloudflare/packs-service-context.js?v=packs-live-link-20261102';
import {handlePacksAccount} from '../../cloudflare/packs-account.js?v=packs-live-link-20261102';
import {handlePacks} from '../../cloudflare/packs.js';
import {assertPacksServiceEnvironment,packsServiceOrigin,verifyPacksServiceKey} from '../../cloudflare/packs-service-contract.js?v=packs-live-link-20261102';
import {loadPacksServiceSnapshot} from './snapshot.js';
import {syncPacksTrackingScheduled} from '../../cloudflare/packs-tracking-sync.js?v=packs-live-link-20261102';
// Private service binding only. Same selected CRM environment, auth, storage and booking registry.
export default {
 async scheduled(controller,env,ctx){
  // Cron only reads existing shipment data; it never books a shipment.
  ctx.waitUntil(syncPacksTrackingScheduled(env).catch(()=>{}));
 },
 async fetch(request,env){
  const json=(error,status)=>Response.json({error,traceId:crypto.randomUUID()},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  try{
   if(!await verifyPacksServiceKey(request,env))return json('Alleen de interne CRM-verbinding is toegestaan.',401);
   env=await openPacksContext(request,env);
   await assertPacksServiceEnvironment(env);
   const url=new URL(request.url);if(!packsServiceOrigin(request,env)||!url.pathname.startsWith('/api/crm/packs/'))return json('Onbekende PACKS-serviceaanvraag.',403);
   if(!['GET','POST'].includes(request.method))return json('Onbekende PACKS-actie.',405);
   // handlePacks authenticates the real CRM session again and owns all effects.
   const account=await handlePacksAccount({request,env});if(account)return account;
   return await handlePacks({request,env,loadSnapshot:()=>loadPacksServiceSnapshot(env)});
  }catch{return json('De PACKS-dienst is nog niet volledig ingericht. Er is geen automatische herboeking.',503);}
 }
};
