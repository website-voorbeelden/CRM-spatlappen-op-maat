import {integrationError} from './integration-store.js';
export async function outlookBytes(response,maximum){
 if(Number(response.headers.get('Content-Length'))>maximum){await response.body?.cancel();throw integrationError('Het mailbestand is te groot voor deze invoer.',413);}
 const reader=response.body?.getReader();if(!reader)return new Uint8Array();let size=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw integrationError('Het mailbestand is te groot voor deze invoer.',413);}chunks.push(value);}}finally{reader.releaseLock();}
 // Content-Length describes the HTTP representation, unlike attachment.size.
 // Fetch may decode Content-Encoding, so only compare an identity response.
 const declared=response.headers.get('Content-Length'),encoding=response.headers.get('Content-Encoding');
 if(declared!==null&&/^\d+$/.test(declared)&&(!encoding||encoding.toLowerCase()==='identity')&&Number(declared)!==size)throw integrationError('De Microsoft-download is niet volledig ontvangen. Haal de bron opnieuw op.',502);
 const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
export function outlookGraphUrl(value){
 const url=new URL(value,'https://graph.microsoft.com/v1.0/');
 if(url.origin!=='https://graph.microsoft.com'||url.username||url.password||url.hash||!(url.pathname==='/v1.0/me'||url.pathname.startsWith('/v1.0/me/')||/^\/v1\.0\/users\/[^/]+\/messages(?:\/|$)/.test(url.pathname)))throw integrationError('Ongeldige Microsoft-mailroute.',400);
 return url.href;
}
export async function outlookFetch(url,options={},maximum=1000000,{binary=false}={}){
 let response;try{response=await fetch(url,{...options,redirect:'manual',signal:AbortSignal.timeout(20000)});}catch{throw integrationError('Microsoft-mail reageert niet. Je bestaande invoer blijft staan.',502);}
 if(!response.ok){
  let code='';try{const raw=JSON.parse(new TextDecoder().decode(await outlookBytes(response,32000))),codes=raw.error_codes;code=Array.isArray(codes)&&Number.isSafeInteger(codes[0])?'AADSTS'+codes[0]:typeof raw.error?.code==='string'&&/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(raw.error.code)?raw.error.code:'';}catch{}
  const help={AADSTS7000215:'De Microsoft client-secretwaarde klopt niet. Laat de serverinstelling controleren; gebruik de waarde, niet het geheim-id.',AADSTS7000222:'Het Microsoft client secret is verlopen. Laat dit op de server vervangen.',AADSTS700016:'De Microsoft-app is niet gevonden in de ingestelde tenant.',AADSTS65001:'Voor de leesrechten is nog Microsoft-toestemming nodig. Koppel opnieuw of vraag de tenantbeheerder.',AADSTS50011:'Het Microsoft-terugkeeradres wijkt af van de ingestelde CRM-callback.',InefficientFilter:'Microsoft kon de combinatie van mailfilters niet verwerken.'};
  const message=help[code]||(response.status===401?'De Microsoft-leestoegang is verlopen. Koppel de mailbox opnieuw.':response.status===403?'Microsoft weigert het lezen van deze mailbox. Controleer de toestemming voor Mail.Read.':response.status===429?'Microsoft beperkt het ophalen tijdelijk. Probeer later opnieuw.':'Microsoft-mail kon deze stap niet uitvoeren.');
  const error=integrationError(message+' (Microsoft HTTP '+response.status+(code?' · '+code:'')+')',response.status===401?401:response.status===403?403:response.status===429?429:502);error.providerStatus=response.status;error.providerCode=code;throw error;
 }
 const bytes=await outlookBytes(response,maximum);if(binary)return bytes;
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw integrationError('Microsoft gaf geen leesbaar mailantwoord.',502);}
}
export const outlookGraph=(token,path,maximum=1000000,options={})=>outlookFetch(outlookGraphUrl(path),{headers:{Authorization:'Bearer '+token,Prefer:'IdType="ImmutableId", outlook.body-content-type="text"'}},maximum,options);
export const outlookBase64Url=bytes=>{let value='';for(const n of new Uint8Array(bytes))value+=String.fromCharCode(n);return btoa(value).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
