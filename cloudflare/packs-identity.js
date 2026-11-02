// Read-only account information. Exactly one token POST and one selected
// Identity GET or GetProductInfo POST; no shipment, label or booking methods.
const endpoints=Object.freeze({test:{auth:'https://identityserver-tst.packs.nl/connect/token',identity:'https://packsonlineapp-tst.packs.nl/api/Identity'},live:{auth:'https://identityserver.packs.nl/connect/token',identity:'https://packsonlineapp.packs.nl/api/Identity'}});
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const credential=v=>typeof v==='string'&&v.length>0&&v.length<=4096&&!/[\x00-\x1f\x7f]/.test(v);
const authErrors={invalid_grant:'PACKS heeft de accountgegevens of deze aanmeldmethode afgewezen.',invalid_client:'PACKS heeft de OAuth-client niet geaccepteerd.',unauthorized_client:'Deze OAuth-client is niet toegestaan.',invalid_scope:'PACKS heeft de aangevraagde scope afgewezen.',access_denied:'PACKS heeft toegang geweigerd.',invalid_request:'PACKS heeft het aanmeldverzoek afgewezen.',unsupported_grant_type:'PACKS accepteert deze aanmeldmethode niet.',temporarily_unavailable:'De PACKS-aanmelding is tijdelijk niet beschikbaar.',server_error:'De PACKS-aanmelddienst geeft een serverfout.'};
async function boundedJson(response,maximum){
 const reader=response.body?.getReader();if(!reader)return null;const decoder=new TextDecoder();let size=0,raw='';
 try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>maximum){await reader.cancel();throw Object.assign(Error(),{safeCode:'response_too_large'});}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
 if(!raw.trim())return null;try{return JSON.parse(raw);}catch{throw Object.assign(Error(),{safeCode:'invalid_json'});}
}
function redact(value,secrets,depth=0){
 if(depth>20)return '[afgeschermd: te diep genest]';
 if(typeof value==='string'){for(const secret of secrets)if(secret)value=value.split(secret).join('[afgeschermd]');return value.replace(/\bBearer\s+[^\s"<>]+/gi,'Bearer [afgeschermd]');}
 if(Array.isArray(value))return value.map(row=>redact(row,secrets,depth+1));
 if(object(value)){const sensitive=typeof value.type==='string'&&/(?:password|token|secret|authorization|credential)/i.test(value.type);return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,/(?:password|token|secret|authorization|credential)/i.test(key)||key==='value'&&sensitive?'[afgeschermd]':redact(item,secrets,depth+1)]));}
 return value;
}
export const testPacksIdentity=(config,options)=>readPacksAccount(config,'identity',options);
export const readPacksProducts=(config,options)=>readPacksAccount(config,'products',options);
async function readPacksAccount(config,operation,{fetcher=fetch}={}){
 const environment=config?.environment,host=Object.hasOwn(endpoints,environment)?endpoints[environment]:null,credentials=config?.credentials;
 const endpoint=host?(operation==='identity'?host.identity:host.identity.replace('/api/Identity','/api/Products/GetProductInfo')):null;
 const result={ok:false,attempted:false,environment:host?environment:null,endpoint,authHttpStatus:null,identityHttpStatus:null,productsHttpStatus:null,httpStatus:null,stage:'configuration',response:null,redacted:false,error:null};
 if(config?.companyId!=='maatwerkkunststof'||!host||!object(credentials)||['username','password','clientId','clientSecret','scope'].some(k=>!credential(credentials[k]))){result.error={code:'not_configured',message:'De aparte PACKS-accounttest is nog niet ingesteld op deze server.'};return result;}
 let accessToken='',stage='authentication';
 const failed=(code,message)=>({...result,stage,error:{code,message}});
 try{
  result.attempted=true;result.stage=stage;
  const body=new URLSearchParams({grant_type:'password',username:credentials.username,password:credentials.password,client_id:credentials.clientId,client_secret:credentials.clientSecret,scope:credentials.scope});
  const auth=await fetcher(host.auth,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:body.toString(),redirect:'manual',signal:AbortSignal.timeout(20000)});
  result.authHttpStatus=auth.status;result.httpStatus=auth.status;
  if(!auth.ok){let error;try{error=await boundedJson(auth,65536);}catch{}const code=Object.hasOwn(authErrors,error?.error)?error.error:'authentication_failed';return failed(code,authErrors[code]||'PACKS heeft de aanmelding niet bevestigd. Controleer account, omgeving en OAuth-instellingen.');}
  const token=await boundedJson(auth,65536);
  if(typeof token?.access_token!=='string'||!token.access_token||token.access_token.length>30000||/[\s\x00-\x1f\x7f]/.test(token.access_token)||String(token.token_type).toLowerCase()!=='bearer')return failed('invalid_token_response','PACKS gaf geen geldig Bearer-token terug. Er zijn geen accountgegevens opgevraagd.');
  accessToken=token.access_token;stage=operation;result.stage=stage;result.httpStatus=null;
  const identity=await fetcher(endpoint,{method:operation==='identity'?'GET':'POST',headers:{Authorization:'Bearer '+accessToken,Accept:'application/json','api-version':'1.0','Accept-Language':'nl-NL',...(operation==='products'?{'Content-Type':'application/json'}:{})},...(operation==='products'?{body:'{}'}:{}),redirect:'manual',signal:AbortSignal.timeout(30000)});
  result[operation==='identity'?'identityHttpStatus':'productsHttpStatus']=identity.status;result.httpStatus=identity.status;
  const response=await boundedJson(identity,operation==='identity'?262144:1000000),safe=redact(response,[credentials.password,credentials.clientSecret,accessToken]);result.response=safe;result.redacted=JSON.stringify(safe)!==JSON.stringify(response);
  if(!identity.ok)return failed(operation+'_rejected','PACKS heeft de accountopvraag niet toegestaan of niet kunnen afhandelen.');
  if(operation==='identity'&&(!Array.isArray(response)||response.some(row=>!object(row)||typeof row.type!=='string'||typeof row.value!=='string')))return failed('identity_schema','PACKS heeft geantwoord, maar niet met de verwachte array met type en value.');
  if(operation==='products'&&(!object(response)||!Array.isArray(response.products)||response.products.length>1000))return failed('products_schema','PACKS heeft geen begrensde lijst met accountdiensten teruggegeven.');
  return {...result,ok:true,error:null};
 }catch(error){
  const code=error.safeCode||(['TimeoutError','AbortError'].includes(error.name)?'timeout':'network_failed');
  return failed(code,code==='response_too_large'?'Het antwoord is groter dan de toegestane weergavegrens.':code==='invalid_json'?'PACKS gaf geen leesbare JSON terug.':code==='timeout'?'PACKS heeft niet binnen de wachttijd geantwoord. Er wordt niet automatisch opnieuw geprobeerd.':'De beveiligde verbinding met PACKS kon niet worden voltooid. Er is geen HTTP-antwoord ontvangen voor deze stap.');
 }finally{accessToken='';}
}
