import {isReviewMode,reviewPack,reviewSnapshot,readOnlyMessage} from './offline/review.js';
import {companyFor} from '../shared/companies.js';
const clone = value => value===undefined?undefined:structuredClone(value);
let selectedStorage;
export async function storageRuntime() {
  if (!selectedStorage) selectedStorage=(async()=>{
    if(isReviewMode()){const p=await reviewPack({verify:true});return {...p.runtime,offlineReview:true,offlinePreparedAt:p.preparedAt,offlineUntil:p.grant.expiresAt};}
    const response=await fetch('/crm-runtime.json',{cache:'no-store'});
    if (!response.ok) throw Error('De opslaginstellingen ontbreken. Herlaad het CRM.');
    const runtime=await response.json();
    if (new URLSearchParams(location.search).get('storage')==='cloud') runtime.mode='cloud';
    if (runtime.mode==='cloud') {
      const config=await cloudRequest('/config');
      if(runtime.companyId&&runtime.companyId!==config.companyId)throw Error('De CRM-code hoort bij een andere bedrijfsopslag. Publicatie controleren; er is niets gewijzigd.');
      Object.assign(runtime,config);
    }
    runtime.companyId??='spatlappen';companyFor(runtime.companyId);return runtime;
  })();
  return selectedStorage;
}
export async function cloudRequest(path,options={}) {
  if(isReviewMode())throw Error(readOnlyMessage);
  let response;
  try {response=await fetch('/api/crm'+path,{cache:'no-store',...options});}
  catch {throw Error('Geen verbinding met de centrale opslag. Er is niets lokaal als vervanging opgeslagen. Probeer opnieuw.');}
  const data=await response.json().catch(()=>({error:'Start de lokale Cloudflare-server om de centrale opslag te gebruiken.'}));
  if(response.status===401&&typeof location!=='undefined')location.assign('/login.html?next='+encodeURIComponent(location.pathname+location.search+location.hash));
  if (!response.ok) throw Object.assign(Error(data.error||'Opslagverzoek mislukt.'),{status:response.status});
  return data;
}
export function openBrowserDatabase(name,storeNames) {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(name,1);
    request.onupgradeneeded=()=>{for (const store of storeNames) if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store,store==='state'?undefined:{keyPath:'id'});};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(Error('Sluit andere CRM-tabbladen en probeer opnieuw.'));
  });
}
let cloudDatabase;
export async function openCrmDatabase() {
  const runtime=await storageRuntime();
  if (runtime.mode==='cloud') return cloudDatabase??=new CloudDatabase();
  return openBrowserDatabase(companyFor(runtime.companyId).browserDb,['state','files']);
}
export async function openFeedbackDatabase() {
  if ((await storageRuntime()).mode==='cloud') return cloudDatabase??=new CloudDatabase();
  return openBrowserDatabase(companyFor((await storageRuntime()).companyId).feedbackDb,['reports']);
}
export async function openDesignDatabase() {
  if ((await storageRuntime()).mode==='cloud') return cloudDatabase??=new CloudDatabase();
  return openBrowserDatabase(companyFor((await storageRuntime()).companyId).designsDb,['designs']);
}

export async function openPlanningDatabase() {
  const runtime=await storageRuntime();
  if(runtime.mode==='cloud')return cloudDatabase??=new CloudDatabase();
  return openBrowserDatabase(companyFor(runtime.companyId).browserDb+'-planning',['planning']);
}

export async function uploadCloudFile(blob) {
  const uploaded=await cloudRequest('/files',{method:'POST',headers:{'Content-Type':blob.type||'application/octet-stream'},body:blob});
  if (uploaded.size!==blob.size||uploaded.sha256!==await blobDigest(blob)) throw Error('Uploadcontrole mislukt. Er is niets opgeslagen.');
  return uploaded;
}
export async function blobDigest(blob) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function readCloudFile(id,metadata) {
  const response=await fetch('/api/crm/files/'+encodeURIComponent(id),{cache:'no-store'});
  if (!response.ok) throw Error((await response.json().catch(()=>({}))).error||'Bestand laden mislukt.');
  const blob=await response.blob();
  if (metadata&&(blob.size!==metadata.size||await blobDigest(blob)!==metadata.sha256)) throw Error('Bestandscontrole mislukt. Download het bestand opnieuw.');
  return {id,blob};
}
export async function commitCloud(body) {
  body={...body,companyId:(await storageRuntime()).companyId};
  const options={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
  try {return await cloudRequest('/commit',options);}
  catch(error) {
    // Retrying the identical token is safe even when the first response got lost.
    if (error.status) throw error;
    return cloudRequest('/commit',options);
  }
}

// A deliberately small transaction facade for the methods used by this CRM.
// Success callbacks fire only after the central transaction has been committed.
// No IndexedDB shadow writes or background upload can pretend a save succeeded.
export class CloudDatabase {
  constructor() {this.queue=Promise.resolve();this.observed=new Map();this.revision=null;}
  transaction(names,mode='readonly') {
    const tx=new CloudTransaction(this,Array.isArray(names)?names:[names],mode);
    this.queue=this.queue.catch(()=>{}).then(()=>tx.run());
    return tx;
  }
  close() {}
}
class CloudTransaction {
  constructor(db,names,mode) {this.db=db;this.names=names;this.mode=mode;this.requests=[];this.operations=[];this.aborted=false;this.done=false;this.readKeys=new Set();}
  abort() {this.aborted=true;}
  objectStore(name) {
    if (!this.names.includes(name)||!['state','files','reports','designs','planning'].includes(name)) throw Error('Onbekende gegevensverzameling.');
    const enqueue=(action,key,value)=>{
      if (this.done||this.aborted) throw Error('Deze opslagbewerking is al afgesloten.');
      if (['put','delete','clear'].includes(action)&&this.mode!=='readwrite') throw Error('Deze opslagbewerking is alleen-lezen.');
      const request={result:undefined,error:null};
      this.requests.push({name,action,key,value:clone(value),request});return request;
    };
    return {get:key=>enqueue('get',String(key)),peek:(key,options={})=>enqueue('peek',String(key),options),getAll:()=>enqueue('getAll'),put:(value,key)=>enqueue('put',String(key??value.id),value),delete:key=>enqueue('delete',String(key)),clear:()=>enqueue('clear')};
  }
  async run() {
    try {
      if (this.aborted) throw Error('Opslaan afgebroken.');
      if(isReviewMode()&&this.mode==='readwrite')throw Error(readOnlyMessage);
      const data=isReviewMode()?await reviewSnapshot(this.names):await cloudRequest('/snapshot?stores='+this.names.join(','));
      const values=new Map(this.names.map(name=>[name,new Map(name==='files'?data.files.map(f=>[f.id,f]):Object.entries(data.records[name]||{}))]));
      this.db.revision=data.revision;
      while (this.requests.length) {
        if (this.aborted) throw Error('Opslaan afgebroken.');
        const {name,action,key,value,request}=this.requests.shift(),map=values.get(name),observedKey=name+'/'+key;
        if (action==='get'||action==='getAll'||action==='peek') {
          const single=action!=='getAll',entries=single?[map.get(key)]:[...map.values()];
          request.result=name==='files'?await Promise.all(entries.map(async f=>{
            if(!f)return undefined;
            if(action!=='peek')return readCloudFile(f.id,f);
            // History must neither download oversized files nor prevent a normal
            // save/delete when its optional copy cannot be fetched.
            this.historyBytesRemaining??=value.budget??Infinity;
            if(f.size>Math.min(value.maxBytes??Infinity,this.historyBytesRemaining)){
              this.historyBytesRemaining=0;return {id:f.id,undoTooLarge:true};
            }
            this.historyBytesRemaining-=f.size;
            try{return await readCloudFile(f.id,f);}catch{return {id:f.id,undoTooLarge:true};}
          })):entries.map(clone);
          if (single) request.result=request.result[0];
          if (name!=='files'&&action!=='peek') for (const [k,v] of single?[[key,map.get(key)]]:map) {
            this.db.observed.set(name+'/'+k,JSON.stringify(v));this.readKeys.add(name+'/'+k);
          }
        } else {
          // Blind saves may originate from a form opened before another device
          // changed this record. Such a save must not overwrite newer values.
          if (action==='put'&&name!=='files'&&!this.readKeys.has(observedKey)&&this.db.observed.has(observedKey)&&this.db.observed.get(observedKey)!==JSON.stringify(map.get(key))) throw Object.assign(Error('Gegevens zijn intussen gewijzigd. Sluit dit formulier en open het opnieuw; je invoer is nog niet opgeslagen.'),{status:409});
          if (action==='clear') map.clear();
          else if (action==='delete') map.delete(key);
          else map.set(key,value);
          this.operations.push({store:name,action,...(key===undefined?{}:{key}),...(action==='put'?{value}: {})});
          request.result=key;
        }
        request.onsuccess?.({target:request});
        // Requests enqueued synchronously from an onsuccess callback are included.
      }
      if (this.aborted) throw Error('Opslaan afgebroken.');
      if (this.operations.length) {
        const operations=[];
        for (const op of this.operations) operations.push(op.store==='files'&&op.action==='put'?{...op,value:await uploadCloudFile(op.value.blob)}:op);
        const saved=await commitCloud({id:crypto.randomUUID(),revision:data.revision,operations});
        this.db.revision=saved.revision;
        for (const op of this.operations) if (op.store!=='files') {
          if (op.action==='clear') {for (const key of this.db.observed.keys()) if (key.startsWith(op.store+'/')) this.db.observed.delete(key);}
          if (op.action!=='clear') this.db.observed.set(op.store+'/'+op.key,JSON.stringify(op.action==='put'?op.value:undefined));
        }
      }
      this.done=true;this.oncomplete?.({target:this});
    } catch(error) {
      this.error=error;this.done=true;
      if (error.status===409) window.dispatchEvent(new Event('crm-cloud-conflict'));
      this.onerror?.({target:this});this.onabort?.({target:this});
    }
  }
}

export function startCloudRefresh({onChanged}) {
  if(isReviewMode())return ()=>{};
  let busy=false;
  async function check() {
    if (busy||document.hidden) return;
    busy=true;
    try {
      const latest=await cloudRequest('/snapshot?stores=state');
      const observed=cloudDatabase?.observed.get('state/main');
      if (observed!==undefined&&JSON.stringify(latest.records.state?.main)!==observed) onChanged();
    } catch { /* Saves and opening a page surface connection failures separately. */ }
    finally {busy=false;}
  }
  const timer=setInterval(check,15000);window.addEventListener('focus',check);
  window.addEventListener('crm-cloud-conflict',onChanged);
  void check();return ()=>clearInterval(timer);
}
