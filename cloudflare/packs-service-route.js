import {sealPacksContext,packsContextHeader} from './packs-service-context.js?v=packs-live-link-20261102';
import {authenticated} from './auth.js';
import {handlePacks} from './packs.js?v=packs-workflow-20261102';
import {assertPacksServiceEnvironment,packsServiceHeader,packsServiceKey,packsServiceOrigin} from './packs-service-contract.js?v=packs-live-link-20261102';
import {assertPacksV3Request,packsV3Response} from './packs-v3-bridge.js?v=packs-live-link-20261102';
// One selected executor. A service error NEVER falls back to embedded booking.
export async function routePacks(options){
 const {request,env}=options,mode=env.CRM_PACKS_TRANSPORT||'embedded';
 const fail=(message,status=503)=>Response.json({error:message,traceId:crypto.randomUUID()},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(mode==='embedded'&&!env.CRM_PACKS_WORKER)return handlePacks(options);
 if(mode!=='service')return fail('De PACKS-uitvoeringsroute is niet eenduidig ingesteld.');
 try{
  if(!await authenticated(request,env))return fail('Log opnieuw in om PACKS te gebruiken.',401);
  await assertPacksServiceEnvironment(env);
  if(!packsServiceOrigin(request,env)||!packsServiceKey(env.CRM_PACKS_SERVICE_KEY)||typeof env.CRM_PACKS_WORKER?.fetch!=='function')return fail('De PACKS-dienst of interne verbinding ontbreekt.');
  if(!['GET','POST'].includes(request.method))return fail('Onbekende PACKS-actie.',405);
  if(request.method==='POST'&&(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json'))return fail('Ongeldig PACKS-verzoek.',403);
  const v3=env.CRM_PACKS_SERVICE_CONTRACT!==undefined;
  if(v3)await assertPacksV3Request(options);
  const headers=new Headers(request.headers);headers.set(packsServiceHeader,env.CRM_PACKS_SERVICE_KEY);if(env.CRM_PACKS_CONTEXT_VERSION==='encrypted-v1')headers.set(packsContextHeader,await sealPacksContext(request,env));
  // Keep original URL, Origin and session so the existing guards remain valid.
  const response=await env.CRM_PACKS_WORKER.fetch(new Request(request,{headers,redirect:'manual'}));
  return v3?await packsV3Response(response):response;
 }catch(error){return fail(error.status?error.message:'De PACKS-dienst kon niet worden bevestigd. Onderzoek dezelfde poging; er is geen automatische tweede boeking gestart.',error.status||503);}
}
