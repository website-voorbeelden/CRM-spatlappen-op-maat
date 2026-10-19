import {offlineProjection,changeCount,mergeOffline,validateOffline} from '/shared/offline-state.js';
import {readPack,updatePack,removePack} from './store.js';
export {readPack,changeCount};
const busyMessage='Synchroniseren is bezig. Wacht even en bewaar daarna je invoer.';
export async function request(path,options={}){
 let response;try{response=await fetch('/api/crm/'+path,{cache:'no-store',...options});}catch{throw Object.assign(Error('Geen internetverbinding. Je offline wijzigingen blijven op dit apparaat staan.'),{network:true});}
 const data=await response.json().catch(()=>({}));if(response.status===401||response.status===403)await lock();if(!response.ok)throw Object.assign(Error(data.error||'Verzoek mislukt.'),{status:response.status});return data;
}
export function available(pack){return pack?.schema===1&&pack.grant.expiresAt>Date.now()&&!pack.locked;}
async function lease(){
 const grant=await request('offline-grant'),pack=await readPack();
 if(pack&&(pack.grant.owner!==grant.owner||pack.grant.companyId!==grant.companyId)){await lock();throw Error('Dit apparaat bevat offline werk voor een andere aanmelding. Er is niets vervangen.');}
 return grant;
}
export async function prepare(){
 const grant=await lease(),old=await readPack();
 if(old&&(changeCount(old.base,old.local)||old.uncertain))throw Error('Synchroniseer eerst je bestaande offline wijzigingen. Er wordt niets overschreven.');
 const snapshot=await request('snapshot?stores=state'),state=snapshot.records.state?.main;if(!state)throw Error('De centrale CRM-gegevens ontbreken.');
 if(!('serviceWorker' in navigator))throw Error('Deze browser ondersteunt offline werken niet. Gebruik een actuele gewone browser.');
 const reg=await navigator.serviceWorker.register('/crm-offline-sw.js',{scope:'/',updateViaCache:'none'});
 await reg.update();
 const worker=reg.installing||reg.waiting||reg.active;if(!worker)throw Error('Offline werkplek installeren lukt niet.');
 if(worker.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Offline installatie duurt te lang. Probeer opnieuw.')),30000);worker.addEventListener('statechange',()=>{if(worker.state==='activated'){clearTimeout(timer);resolve();}if(worker.state==='redundant'){clearTimeout(timer);reject(Error('Offline bestanden konden niet volledig gecontroleerd worden.'));}});});
 await new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('Offline bestanden controleren duurt te lang. Probeer opnieuw.')),30000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();event.data?.ready?resolve():reject(Error('Offline bestanden zijn niet volledig beschikbaar. Probeer opnieuw.'));};worker.postMessage({type:'prepare-offline-code'},[channel.port2]);});
 const projection=offlineProjection(state),pack=await updatePack(old?.version||0,()=>({schema:1,grant,base:projection,local:projection,preparedAt:Date.now(),locked:false,uncertain:null}));
 await navigator.storage?.persist?.().catch(()=>false);return pack;
}
export async function saveDraft(pack,local){if(!available(pack))throw Error('Ga eerst online om de offline werkplek opnieuw te openen. Je werk blijft bewaard.');validateOffline(local,pack.base);const saved=await updatePack(pack.version,old=>{if(old.syncUntil>Date.now())throw Error(busyMessage);old.local=local;return old;});const channel=new BroadcastChannel('crm-offline-workspace');channel.postMessage('changed');channel.close();return saved;}
export async function sync({choices={}}={}){
 const grant=await lease();let pack=await readPack();if(!pack)throw Error('Maak de werkplek eerst offline beschikbaar.');
 const syncId=crypto.randomUUID();pack=await updatePack(pack.version,old=>{if(old.syncUntil>Date.now())throw Error(busyMessage);return {...old,grant,locked:false,syncId,syncUntil:Date.now()+120000};});
 try{
  // A lost acknowledgement must be resolved before rebasing or sending again.
  if(pack.uncertain){const status=await request('commit-status?id='+encodeURIComponent(pack.uncertain.id));if(status.committed){pack=await updatePack(pack.version,old=>({...old,base:old.uncertain.after,uncertain:null}));}else pack=await updatePack(pack.version,old=>({...old,uncertain:null}));}
  const snapshot=await request('snapshot?stores=state'),remote=snapshot.records.state?.main;if(!remote)throw Error('De centrale gegevens ontbreken.');
  const merged=mergeOffline(pack.base,pack.local,remote,{choices,activityId:crypto.randomUUID()});
  if(merged.conflicts.length)return {conflicts:merged.conflicts,pack};
  const projection=offlineProjection(merged.state);
  if(merged.applied.length){
   const id=crypto.randomUUID();
   // Persist this exact attempt before transmitting. No provider/file operations.
   pack=await updatePack(pack.version,old=>({...old,base:offlineProjection(remote),local:projection,uncertain:{id,after:projection}}));
   try{await request('commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,companyId:grant.companyId,revision:snapshot.revision,operations:[{store:'state',action:'put',key:'main',value:merged.state}]})});}
   catch(error){if(error.status&&error.status!==503)pack=await updatePack(pack.version,old=>({...old,uncertain:null}));throw error;}
  }
  pack=await updatePack(pack.version,old=>({...old,base:projection,local:projection,uncertain:null,preparedAt:Date.now()}));
  const channel=new BroadcastChannel(grant.companyId+'-crm-changes');channel.postMessage('changed');channel.close();return {pack,conflicts:[]};
 }catch(error){if(error.status===401||error.status===403)await lock();throw error;}
 finally{const current=await readPack();if(current?.syncId===syncId)await updatePack(current.version,old=>({...old,syncUntil:0,syncId:null}));}
}
export async function lock(){const p=await readPack();if(p)await updatePack(p.version,old=>({...old,locked:true}));}
export async function verifyAccess(){const p=await readPack();if(!p)return {pack:p,connected:navigator.onLine};try{const grant=await lease();return {pack:p.locked||p.grant.expiresAt<Date.now()+3600000?await updatePack(p.version,old=>({...old,grant,locked:false})):p,connected:true};}catch(error){if(!error.network){await lock();throw error;}return {pack:p,connected:false};}}
export async function forget(){const p=await readPack();if(p&&(changeCount(p.base,p.local)||p.uncertain))throw Error('Synchroniseer je offline wijzigingen voordat je deze kopie verwijdert.');if(p)await removePack(p.version);for(const key of await caches.keys())if(key.startsWith('crm-offline-code-'))await caches.delete(key);for(const registration of await navigator.serviceWorker.getRegistrations())if(new URL(registration.active?.scriptURL||registration.waiting?.scriptURL||location.origin).pathname==='/crm-offline-sw.js')await registration.unregister();}
