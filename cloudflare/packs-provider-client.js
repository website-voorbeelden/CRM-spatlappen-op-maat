import {integrationError} from './integration-store.js';
import {validatePacksProviderProfile,validatePacksShipmentPayload,packsLabelsRequest} from '../shared/packs-provider-contract.js?v=packs-workflow-20261102';

const hosts={
 test:{identity:'https://identityserver-tst.packs.nl',api:'https://packsonlineapp-tst.packs.nl'},
 live:{identity:'https://identityserver.packs.nl',api:'https://packsonlineapp.packs.nl'}
};
const tokenLine=value=>typeof value==='string'&&value.length>0&&value.length<=16384&&!/[\s\x00-\x1f\x7f]/.test(value);
async function responseJson(response,limit){
 const reader=response.body?.getReader();if(!reader)throw integrationError('PACKS gaf geen leesbaar antwoord.',502);
 let size=0,raw='';const decoder=new TextDecoder();
 try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>limit){await reader.cancel();throw integrationError('PACKS-antwoord groter dan de veilige verwerkingsgrens.',502);}raw+=decoder.decode(chunk.value,{stream:true});}raw+=decoder.decode();}
 finally{reader.releaseLock();}
 try{const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw integrationError('PACKS gaf geen bruikbaar JSON-antwoord.',502);}
}
// Server-only, dependency-injected behind the authenticated PACKS adapter. No
// constructor I/O, arbitrary host, redirects, automatic retry or live fallback.
export function createPacksProviderClient({store,profile,resolveCredentials,fetchImpl=fetch,now=Date.now,onEvent}){
 validatePacksProviderProfile(profile);
 if(store.company!==profile.companyId||typeof resolveCredentials!=='function')throw integrationError('Het juiste serveraccount voor PACKS ontbreekt.',503);
 const emit=async(code,details)=>{try{await onEvent?.(code,details);}catch{}};
 profile=structuredClone(profile);const host=hosts[profile.environment],tokenKey='packs-'+profile.environment+'-token';let activeToken=null;
 async function token(){
  if(activeToken)return activeToken;
  const work=store.exclusive('packs-'+profile.environment+'-auth',async()=>{
   const cached=await store.read(tokenKey),saved=cached.value;
   if(saved&&(saved.schemaVersion!==1||Object.keys(saved).some(key=>!['schemaVersion','accountKey','configVersion','accessToken','expiresAt'].includes(key))||!tokenLine(saved.accessToken)||!Number.isSafeInteger(saved.expiresAt)))throw integrationError('Het bewaarde PACKS-token heeft een onbekende structuur. Controleer de koppeling; niet overschrijven met een nieuwe login.',503);
   if(saved&&saved.schemaVersion===1&&saved.accountKey===profile.accountKey&&saved.configVersion===profile.version&&tokenLine(saved.accessToken)&&Number.isFinite(saved.expiresAt)&&saved.expiresAt>now()+120000){await emit('auth_cached');return {value:saved.accessToken,expiresAt:saved.expiresAt};}
   const credentials=await resolveCredentials(profile);
   if(!credentials||credentials.accountKey!==profile.accountKey||credentials.configVersion!==profile.version||['clientId','clientSecret','scope','username','password'].some(key=>typeof credentials[key]!=='string'||!credentials[key]||credentials[key].length>4096||/[\x00-\x1f\x7f]/.test(credentials[key])))throw integrationError('De bevestigde PACKS-credentials passen niet bij dit profiel.',503);
   await emit('auth_start');
   const started=now(),form=new URLSearchParams({client_id:credentials.clientId,client_secret:credentials.clientSecret,scope:credentials.scope,grant_type:'password',username:credentials.username,password:credentials.password});
   let body;
   try{const response=await fetchImpl(host.identity+'/connect/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:form.toString(),redirect:'manual',signal:AbortSignal.timeout(20000)});if(!response.ok){await response.body?.cancel();throw Error();}body=await responseJson(response,64000);}catch{await emit('auth_failed');throw integrationError('PACKS-aanmelding niet bevestigd. Controleer account en omgeving; er wordt niet automatisch opnieuw ingelogd.',502);}
   if(!tokenLine(body.access_token)||typeof body.token_type!=='string'||body.token_type.toLowerCase()!=='bearer'||typeof body.expires_in!=='number'||!Number.isFinite(body.expires_in)||body.expires_in<=120||!Number.isSafeInteger(Math.ceil(started+body.expires_in*1000)))throw integrationError('PACKS gaf geen bruikbaar token met vervaltijd.',502);
   const expiresAt=Math.floor(started+body.expires_in*1000);if(expiresAt<=now()+120000)throw integrationError('Het PACKS-token is bij ontvangst al te kort geldig.',502);
   await store.write(tokenKey,{schemaVersion:1,accountKey:profile.accountKey,configVersion:profile.version,accessToken:body.access_token,expiresAt},cached.version);
   await emit('auth_ok',{durationMs:now()-started});return {value:body.access_token,expiresAt};
  });
  activeToken=work;try{return await work;}finally{if(activeToken===work)activeToken=null;}
 }
 async function prepare(){
  const authorization=await token();
  async function post(path,payload,limit,{booking=false}={}){
   if(authorization.expiresAt<=now()+5000)throw integrationError('Het PACKS-token is te kort geldig. Stop deze poging; er wordt niet automatisch opnieuw ingelogd of geboekt.',409);
   let response,body;
   try{response=await fetchImpl(host.api+path,{method:'POST',headers:{Authorization:'Bearer '+authorization.value,Accept:'application/json','Accept-Language':'nl-NL','Content-Type':'application/json; api-version=1.0'},body:JSON.stringify(payload),redirect:'manual',signal:AbortSignal.timeout(30000)});body=await responseJson(response,limit);}
   catch{throw integrationError(booking?'Het PACKS-boekingsresultaat is onzeker. Niet opnieuw boeken; onderzoek dezelfde poging.':'Het PACKS-antwoord is niet bruikbaar. Er is geen nieuwe boeking uitgevoerd.',502);}
   if(!booking&&!response.ok)throw integrationError('PACKS heeft de opvraag niet bevestigd. Controleer account, rechten en omgeving; er volgt geen automatische tokenverversing of boeking.',502);
   return {httpOk:response.ok,body};
  }
  return {
   async products(){await emit('products_start');try{const body=(await post('/api/Products/GetProductInfo',{handler:profile.handler,network:profile.network},1_000_000)).body;await emit('products_ok');return body;}catch(error){await emit('products_failed');throw error;}},
   async bookShipment(payload){validatePacksShipmentPayload(payload);if(payload.handler!==profile.handler||payload.network!==profile.network||payload.shipmentItems.some(item=>item.product!==profile.product))throw integrationError('De boeking past niet bij het vaste PACKS-profiel.',409);return post('/api/Shipments/BookShipment',payload,8_000_000,{booking:true});},
   async labels(provider){return (await post('/api/Shipments/GetLabels',packsLabelsRequest(provider),8_000_000)).body;}
  };
 }
 return {prepare};
}
