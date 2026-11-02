import {packsWorkerV3,packsV3PreparationCompatible} from '../shared/packs-worker-v3.js?v=packs-worker-v3-20261102';
import {packsId} from '../shared/packs-preparation.js?v=packs-worker-v3-20261102';
import {integrationError} from './integration-store.js';
// Translate the transport contract only. The already published Worker owns
// credentials, preflight, booking, registry, provider IDs and label recovery.
export async function assertPacksV3Request({request,env,loadSnapshot}){
 if(env.CRM_PACKS_SERVICE_CONTRACT!==packsWorkerV3.contract||env.CRM_PACKS_SERVICE_DEPLOYMENT!==packsWorkerV3.deploymentId)throw integrationError('Koppel eerst de bevestigde gepubliceerde PACKS-versie aan deze aparte proefomgeving.',503);
 if(!((env.CRM_RELEASE_ENV==='preview'&&env.CRM_PACKS_ENVIRONMENT==='test')||(env.CRM_RELEASE_ENV==='production'&&env.CRM_PACKS_ENVIRONMENT==='live')))throw integrationError('De CRM-omgeving en PACKS-accountomgeving passen niet bij elkaar.',403);
 const url=new URL(request.url),action=url.pathname.split('/').at(-1);
 if(['configuration','initialize-register','account-identity','account-products'].includes(action))return;
 let orderId=url.searchParams.get('orderId');
 if(request.method==='POST'){
  const input=await readPacksBridgeJson(new Response(request.clone().body),2100000);orderId=input.orderId;
 }
 if(!packsId(orderId)||typeof loadSnapshot!=='function')throw integrationError('Kies een geldige order uit deze proefadministratie.',400);
 const snapshot=await loadSnapshot(),order=snapshot.state?.orders?.find(o=>o.id===orderId);
 if(!order)throw integrationError('Deze order staat niet in deze centrale proefadministratie.',404);
 if(!packsV3PreparationCompatible(order.supplierFulfilment?.packsPreparation))throw integrationError('Deze voorbereiding gebruikt het eerdere lokale datumformaat. Open Pakketgegevens invullen, controleer je waarden en bewaar opnieuw. Bestaande labels en boekingspogingen worden niet gewist.',409);
}
export async function readPacksBridgeJson(response,limit=12000000){
 const reader=response.body?.getReader();if(!reader)throw integrationError('Geen leesbaar antwoord van de PACKS-dienst.',502);let length=0,raw='';const decoder=new TextDecoder();
 try{for(;;){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>limit){await reader.cancel();throw integrationError('Het PACKS-antwoord overschrijdt de invoergrens. Onderzoek dezelfde poging; boek niet opnieuw.',502);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
 let body;try{body=JSON.parse(raw);}catch{throw integrationError('Geen leesbaar PACKS-resultaat. Controleer dezelfde poging; boek niet opnieuw.',502);}
 if(!body||typeof body!=='object'||Array.isArray(body))throw integrationError('Onverwacht PACKS-resultaat; controleer dezelfde poging.',502);
 return body;
}
export async function packsV3Response(response){
 const body=await readPacksBridgeJson(response);
 // v3 supports omission of dates but does NOT store returned planning in its
 // registry/bundle. Do not claim or fabricate that newer local capability.
 return Response.json({...body,capabilities:{automaticPlanning:true,planningEvidence:false,tracking:true,preparationFormat:'loadDateMode',sourceContract:packsWorkerV3.contract}},{status:response.status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
