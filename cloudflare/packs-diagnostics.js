import {packsLogEvent} from '../shared/packs-diagnostics.js?v=packs-worker-v3-20261102';
// Strict allowlist: never persist payloads, error messages, addresses, tokens,
// account names, PDF bytes or arbitrary provider responses in diagnostics.
export function createPacksDiagnostics(store,environment,orderId,traceId,attemptId=''){
 const key='packs-'+environment+'-diagnostics-'+orderId;
 async function append(code,details={}){
  try{
   const row=packsLogEvent({code,orderId,traceId,attemptId,...details});
   for(let n=0;n<2;n++){const saved=await store.read(key),events=saved.value?.events||[];if(!Array.isArray(events))return false;try{await store.write(key,{schemaVersion:1,events:[...events.slice(-199),row]},saved.version);return true;}catch(error){if(error.status!==409)return false;}}
  }catch{}return false;
 }
 async function read(){const saved=await store.read(key);if(!saved.value)return [];if(saved.value.schemaVersion!==1||!Array.isArray(saved.value.events)||saved.value.events.length>200)throw Error('PACKS-log heeft een onbekende structuur.');return saved.value.events.map(row=>({...packsLogEvent(row),at:row.at}));}
 return {append,read};
}
