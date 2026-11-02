import {integrationError} from './integration-store.js';
export async function outlookBytes(response,maximum){
 if(Number(response.headers.get('Content-Length'))>maximum){await response.body?.cancel();throw integrationError('Het mailbestand is te groot voor deze invoer.',413);}
 const reader=response.body?.getReader();if(!reader)return new Uint8Array();let size=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw integrationError('Het mailbestand is te groot voor deze invoer.',413);}chunks.push(value);}}finally{reader.releaseLock();}
 const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
export function outlookGraphUrl(value){
 const url=new URL(value,'https://graph.microsoft.com/v1.0/');
 if(url.origin!=='https://graph.microsoft.com'||url.username||url.password||url.hash||!(url.pathname==='/v1.0/me'||url.pathname.startsWith('/v1.0/me/')||/^\/v1\.0\/users\/[^/]+\/messages(?:\/|$)/.test(url.pathname)))throw integrationError('Ongeldige Microsoft-mailroute.',400);
 return url.href;
}
export async function outlookFetch(url,options={},maximum=1000000,{binary=false}={}){
 let response;try{response=await fetch(url,{...options,redirect:'manual',signal:AbortSignal.timeout(20000)});}catch{throw integrationError('Microsoft-mail reageert niet. Je bestaande invoer blijft staan.',502);}
 if(!response.ok){await response.body?.cancel();throw integrationError(response.status===401?'De Microsoft-leestoegang is verlopen. Koppel de mailbox opnieuw.':response.status===429?'Microsoft beperkt het ophalen tijdelijk. Probeer later opnieuw.':'Microsoft-mail kon deze stap niet uitvoeren.',response.status===401?401:response.status===429?429:502);}
 const bytes=await outlookBytes(response,maximum);if(binary)return bytes;
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw integrationError('Microsoft gaf geen leesbaar mailantwoord.',502);}
}
export const outlookGraph=(token,path,maximum=1000000,options={})=>outlookFetch(outlookGraphUrl(path),{headers:{Authorization:'Bearer '+token,Prefer:'IdType="ImmutableId", outlook.body-content-type="text"'}},maximum,options);
export const outlookBase64Url=bytes=>{let value='';for(const n of new Uint8Array(bytes))value+=String.fromCharCode(n);return btoa(value).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
