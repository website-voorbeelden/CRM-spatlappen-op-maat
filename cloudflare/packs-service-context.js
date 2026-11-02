// Request-scoped encrypted context on the PRIVATE service binding. This lets
// the existing Worker revalidate the current CRM session and use the SAME
// integration encryption key without rotating or exporting existing secrets.
const enc=new TextEncoder(),dec=new TextDecoder(),hex=bytes=>[...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');
const unhex=value=>Uint8Array.from(value.match(/../g),n=>parseInt(n,16));
const fail=()=>Object.assign(Error('De beveiligde PACKS-serververbinding kon niet worden bevestigd.'),{status:503});
export const packsContextHeader='X-CRM-Packs-Context';
async function requestBasis(request){
 const clone=request.clone(),reader=clone.body?.getReader();let size=0;const chunks=[];
 if(reader)try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>2100000){await reader.cancel();throw fail();}chunks.push(part.value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return [request.url,request.method,hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))];
}
async function key(env){if(!/^[a-f0-9]{64}$/.test(env.CRM_PACKS_SERVICE_KEY||''))throw fail();return crypto.subtle.importKey('raw',unhex(env.CRM_PACKS_SERVICE_KEY),'AES-GCM',false,['encrypt','decrypt']);}
export async function sealPacksContext(request,env){
 if(!/^[a-f0-9]{64}$/.test(env.CRM_INTEGRATIONS_KEY||'')||typeof env.CRM_PASSWORD_HASH!=='string'||env.CRM_PASSWORD_HASH.length>500)throw fail();
 const iv=crypto.getRandomValues(new Uint8Array(12)),value={v:1,at:Date.now(),basis:await requestBasis(request),company:env.CRM_COMPANY_ID,environment:env.CRM_RELEASE_ENV,storage:env.CRM_PACKS_STORAGE_ID,passwordHash:env.CRM_PASSWORD_HASH,integrationKey:env.CRM_INTEGRATIONS_KEY};
 const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode('crm-packs-service-context:v1')},await key(env),enc.encode(JSON.stringify(value)));
 return hex(iv)+':'+hex(new Uint8Array(bytes));
}
export async function openPacksContext(request,env){
 if(env.CRM_PACKS_CONTEXT_VERSION!=='encrypted-v1')return env;
 const raw=request.headers.get(packsContextHeader)||'';if(raw.length>8000||! /^[a-f0-9]{24}:[a-f0-9]+$/.test(raw))throw fail();
 try{const [iv,cipher]=raw.split(':'),bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unhex(iv),additionalData:enc.encode('crm-packs-service-context:v1')},await key(env),unhex(cipher)),value=JSON.parse(dec.decode(bytes));
  if(value.v!==1||!Number.isSafeInteger(value.at)||Math.abs(Date.now()-value.at)>60000||value.company!==env.CRM_COMPANY_ID||value.environment!==env.CRM_RELEASE_ENV||value.storage!==env.CRM_PACKS_STORAGE_ID||JSON.stringify(value.basis)!==JSON.stringify(await requestBasis(request))||typeof value.passwordHash!=='string'||!/^pbkdf2-sha256\$100000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(value.passwordHash)||! /^[a-f0-9]{64}$/.test(value.integrationKey||''))throw fail();
  return {...env,CRM_PASSWORD_HASH:value.passwordHash,CRM_INTEGRATIONS_KEY:value.integrationKey};
 }catch{throw fail();}
}
