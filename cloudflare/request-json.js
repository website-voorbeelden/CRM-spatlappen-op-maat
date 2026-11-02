import {integrationError} from './integration-store.js';
// Enforce the bound while reading, also when Content-Length is absent.
export async function limitedRequestJson(request,maxBytes){
 const reader=request.body?.getReader();if(!reader)throw integrationError('Geen geldig JSON-verzoek.');
 const decoder=new TextDecoder();let size=0,raw='';
 try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>maxBytes){await reader.cancel();throw integrationError('Het mailverzoek is te groot.',413);}raw+=decoder.decode(chunk.value,{stream:true});}raw+=decoder.decode();}
 finally{reader.releaseLock();}
 let input;try{input=JSON.parse(raw);}catch{throw integrationError('Ongeldig mailverzoek.');}
 if(!input||typeof input!=='object'||Array.isArray(input))throw integrationError('Ongeldig mailverzoek.');
 return input;
}
