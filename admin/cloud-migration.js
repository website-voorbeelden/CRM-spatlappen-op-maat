import {validateTaskProgressList} from '../shared/planning/progress.js?v=document-templates-20261028';
import {openBrowserDatabase,openDesignDatabase,cloudRequest,uploadCloudFile,readCloudFile,commitCloud,blobDigest,storageRuntime} from './cloud-storage.js?v=crm-code-review-20261027';

import {validateBusinessState} from '../shared/state-validation.js?v=feedback29-batch1-followup';
import {companyFor} from '../shared/companies.js';
function read(db,names) {
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(names),result={};
    for (const name of names) {
      const r=name==='state'?tx.objectStore(name).get('main'):tx.objectStore(name).getAll();
      r.onsuccess=()=>result[name]=r.result;
    }
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
export async function readDesigns() {
  return (await read(await openDesignDatabase(),['designs'])).designs;
}
export async function readCloudPackage(db) {
  const data=await read(db,['state','files','reports','designs','planning']);
  const result={companyId:(await storageRuntime()).companyId,state:data.state||{customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]},files:data.files,feedback:data.reports,designs:data.designs,planning:data.planning};
  result.tikkieJournal=await readTikkieJournal();
  validatePackage(result);return result;
}
export async function replaceDesigns(designs) {
  const db=await openDesignDatabase();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction('designs','readwrite'),store=tx.objectStore('designs');store.clear();designs.forEach(d=>store.put(d));
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
export async function readBrowserPackage() {
  const company=companyFor((await storageRuntime()).companyId);
  const db=await openBrowserDatabase(company.browserDb,['state','files']);
  const data=await read(db,['state','files']);db.close();
  const feedbackDb=await openBrowserDatabase(company.feedbackDb,['reports']);
  data.feedback=(await read(feedbackDb,['reports'])).reports;feedbackDb.close();
  const designDb=await openBrowserDatabase(company.designsDb,['designs']);
  const designs=new Map((await read(designDb,['designs'])).designs.map(d=>[d.id,d]));designDb.close();
  for (let n=0;n<localStorage.length;n++) {
    const key=localStorage.key(n);if (!key.startsWith(company.localPrefix)) continue;
    const d=JSON.parse(localStorage.getItem(key));
    if (d?.id&&(!designs.has(d.id)||d.updatedAt>designs.get(d.id).updatedAt)) designs.set(d.id,d);
  }
  data.designs=[...designs.values()];data.companyId=company.id;
  const planningDb=await openBrowserDatabase(company.browserDb+'-planning',['planning']);
  data.planning=(await read(planningDb,['planning'])).planning;planningDb.close();
  if(['localhost','127.0.0.1'].includes(location.hostname))data.tikkieJournal=await readTikkieJournal();
  if (!data.state) data.state={customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]};
  validatePackage(data);return data;
}
export function validatePackage(data) {
  validateBusinessState(data?.state);
  if(data.planning!==undefined)validateTaskProgressList(data.planning,data.companyId||'spatlappen');
  if(data.tikkieJournal!==undefined&&(!data.tikkieJournal||typeof data.tikkieJournal!=='object'||Array.isArray(data.tikkieJournal)))throw Error('Ongeldige Tikkie-historie in de back-up.');
  if (!data?.state||!['customers','orders','payments','documents','activities'].every(k=>Array.isArray(data.state[k]))||!Array.isArray(data.files)||!Array.isArray(data.feedback||[])||!Array.isArray(data.designs||[])) throw Error('Ongeldig back-upbestand.');
  for (const records of [data.files,data.feedback||[],data.designs||[]]) if (records.some(r=>!r?.id||typeof r.id!=='string')||new Set(records.map(r=>r.id)).size!==records.length) throw Error('Een ID ontbreekt of komt dubbel voor in de back-up.');
  const files=new Map(data.files.map(f=>[f.id,f]));
  for (const doc of data.state.documents) {
    const f=files.get(doc.id);
    if (!f||!(f.blob instanceof Blob)) throw Error('Het bestand bij '+(doc.name||doc.id)+' ontbreekt. Vul dit eerst aan; de migratie is niet uitgevoerd.');
    if (doc.size!==undefined&&doc.size!==f.blob.size) throw Error('Bestandsgrootte wijkt af bij '+(doc.name||doc.id)+'.');
  }
}
export async function backupBlob(data) {
  validatePackage(data);
  const files=await Promise.all(data.files.map(async f=>({id:f.id,data:await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(f.blob);
  })})));
  return new Blob([JSON.stringify({format:'spatlappen-crm-backup',version:1,companyId:data.companyId||'spatlappen',state:data.state,files,feedback:data.feedback||[],designs:data.designs||[],...(data.tikkieJournal!==undefined?{tikkieJournal:data.tikkieJournal}:{}),...(data.planning!==undefined?{planning:data.planning}:{})})],{type:'application/json'});
}
export async function parseBackup(file,{companyId}={}) {
  const data=JSON.parse(await file.text());
  if (data.format!=='spatlappen-crm-backup'||data.version!==1) throw Error('Onbekend back-upformaat.');
  if(companyId&&(data.companyId||'spatlappen')!==companyId)throw Error('Deze back-up hoort bij een ander bedrijf. Er is niets geïmporteerd.');
  data.files=await Promise.all(data.files.map(async f=>{
    if (typeof f.data!=='string'||!/^data:[^,]*;base64,/.test(f.data)) throw Error('Ongeldig bestand in back-up.');
    return {id:f.id,blob:await(await fetch(f.data)).blob()};
  }));
  data.feedback??=[];data.designs??=[];validatePackage(data);return data;
}
export function packageSummary(data) {
  return `${data.state.customers.length} klanten · ${data.state.orders.length} klantorders · ${data.state.purchases?.length||0} inkoopbestellingen · ${data.state.payments.length} betalingen · ${data.files.length} bestanden · ${data.feedback?.length||0} meldingen · ${data.designs?.length||0} ontwerpen · ${data.planning?.length||0} bouwlogs`;
}
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
export async function packageFingerprint(data) {
  return blobDigest(new Blob([JSON.stringify(canonical({state:data.state,feedback:data.feedback,designs:data.designs,planning:data.planning,tikkieJournal:data.tikkieJournal,files:await Promise.all(data.files.map(async f=>({id:f.id,hash:await blobDigest(f.blob)})))}))]));
}
export async function migratePackage(data,progress=()=>{},beforeCommit=async()=>{}) {
  validatePackage(data);
  const runtime=await storageRuntime();if((data.companyId||'spatlappen')!==runtime.companyId)throw Error('Deze back-up hoort bij een ander bedrijf.');
  const initial=await cloudRequest('/snapshot');
  if (initial.revision!==0||Object.keys(initial.records).length||initial.files.length) throw Error('De centrale opslag is niet leeg. Bestaande gegevens worden niet overschreven.');
  const operations=[{store:'state',action:'put',key:'main',value:data.state}];
  for (const name of ['reports','designs','planning']) for (const record of data[name==='reports'?'feedback':name]||[]) operations.push({store:name,action:'put',key:record.id,value:record});
  for (let n=0;n<data.files.length;n++) {
    progress(`Bestand ${n+1} van ${data.files.length} uploaden en controleren…`);
    const f=data.files[n];operations.push({store:'files',action:'put',key:f.id,value:await uploadCloudFile(f.blob)});
  }
  await beforeCommit();progress('Gegevens gezamenlijk opslaan…');
  if(data.tikkieJournal===undefined&&data.state.orders.some(o=>o.paymentLinks?.length))throw Error('Deze back-up bevat betaallinks maar geen Tikkie-historie. Maak eerst een nieuwe volledige back-up in het lokale CRM.');
  const saved=await commitCloud({id:crypto.randomUUID(),revision:initial.revision,migration:true,operations,...(data.tikkieJournal!==undefined?{tikkieJournal:data.tikkieJournal}:{})});
  progress('Klanten, orders, betalingen, documenten en ontwerpen controleren…');
  const result=await cloudRequest('/snapshot');
  if (result.revision!==saved.revision||!same(result.records.state?.main,data.state)||!same(Object.values(result.records.reports||{}).sort((a,b)=>a.id.localeCompare(b.id)),[...(data.feedback||[])].sort((a,b)=>a.id.localeCompare(b.id)))||!same(Object.values(result.records.designs||{}).sort((a,b)=>a.id.localeCompare(b.id)),[...(data.designs||[])].sort((a,b)=>a.id.localeCompare(b.id)))||result.files.length!==data.files.length) throw Error('De gegevens zijn opgeslagen, maar de nacontrole wijkt af. Je lokale gegevens en back-up blijven behouden. Open de centrale opslag nog niet.');
  if(data.planning!==undefined&&!same(Object.values(result.records.planning||{}).sort((a,b)=>a.id.localeCompare(b.id)),[...data.planning].sort((a,b)=>a.id.localeCompare(b.id))))throw Error('Het bouwlog wijkt af na migratie. Bewaar de back-up.');
  for (let n=0;n<data.files.length;n++) {
    progress(`Opgeslagen bestand ${n+1} van ${data.files.length} opnieuw lezen en controleren…`);
    await readCloudFile(data.files[n].id,result.files.find(f=>f.id===data.files[n].id));
  }
  if(data.tikkieJournal!==undefined&&!same(await readTikkieJournal(),data.tikkieJournal))throw Error('De opgeslagen Tikkie-historie wijkt af. Bewaar je lokale back-up en controleer de migratie.');
  return saved;
}
export function migrationPanel(runtime) {
  return `<div class="panel"><h2>${runtime.mode==='cloud'?'Centrale opslag':'Cloudflare voorbereiden'}</h2><p>${runtime.mode==='cloud'?'Gegevens worden in D1 bewaard; uploads staan privé in R2. Opslaan lukt pas als de server dit bevestigt.':'Je huidige browsergegevens blijven lokaal bewaard. Migratie kopieert de gegevens en bestanden na een volledige back-up en controleert het resultaat.'}</p><p class="notice">${runtime.local!==false?'De Cloudflare-testopslag staat op deze laptop. Online inloggen doe je straks met je e-mailadres en wachtwoord.':'Je gebruikt de online opslag. Je kunt op een andere laptop inloggen met je e-mailadres en wachtwoord.'}</p><div class="actions"><button data-cloud-action="browser">Browsergegevens migreren</button><button data-cloud-action="backup">Migreren vanuit back-up</button>${runtime.mode==='local'?'<a class="download-button" href="?storage=cloud#settings">Open lokale Cloudflare-versie</a>':''}</div><p class="form-help">Alleen naar lege centrale opslag. Originele browsergegevens worden nooit verwijderd. De volledige back-up neemt ook de Tikkie-historie mee.</p></div>`;
}
async function readTikkieJournal(){
  const response=await fetch('/__local/tikkie/journal',{cache:'no-store'});
  if(!response.ok)throw Error('Tikkie-historie ophalen lukt niet. Herstart de lokale CRM-server voordat je een volledige back-up maakt.');
  return response.json();
}
export function installMigration({toast,downloadBlob,feedback,localMode}) {
  let busy=false;
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-cloud-action]');if (!trigger||busy) return;
    void (async()=>{
      busy=true;let data,fromBrowser=trigger.dataset.cloudAction==='browser';
      if (fromBrowser) data=await readBrowserPackage();
      else {
        const input=document.createElement('input');input.type='file';input.accept='.json';
        const file=await new Promise(resolve=>{input.onchange=()=>resolve(input.files[0]);input.oncancel=()=>resolve(null);input.click();});
        if (!file) return;data=await parseBackup(file,{companyId:(await storageRuntime()).companyId});
      }
      feedback.validate(data.feedback||[]);
      await cloudRequest('/config');
      const original=fromBrowser?await packageFingerprint(data):null;
      const dialog=document.createElement('dialog');dialog.className='migration-dialog';
      dialog.innerHTML='<form><div class="dialog-heading"><h2>Gegevens veilig migreren</h2></div><div class="dialog-body"><p data-summary></p><p>Dit kopieert naar de lege Cloudflare-opslag. Je huidige browsergegevens blijven bewaard. Download eerst een volledige back-up.</p><div class="actions"><button type="button" data-backup>1. Download volledige back-up</button></div><label><input type="checkbox" data-confirm disabled> Ik heb de back-up buiten het CRM opgeslagen.</label><p role="status" data-status></p></div><div class="dialog-footer actions"><button type="button" data-close>Sluiten</button><button type="submit" class="primary" disabled>2. Kopiëren en controleren</button></div></form>';
      document.body.append(dialog);dialog.querySelector('[data-summary]').textContent=packageSummary(data);
      const status=dialog.querySelector('[data-status]'),form=dialog.querySelector('form'),submit=dialog.querySelector('[type=submit]'),confirmBox=dialog.querySelector('[data-confirm]');let running=false;
      dialog.oncancel=e=>{if(running)e.preventDefault();};
      dialog.addEventListener('close',()=>dialog.remove());dialog.querySelector('[data-close]').onclick=()=>dialog.close();
      dialog.querySelector('[data-backup]').onclick=async()=>{
        try {if (await downloadBlob(await backupBlob(data),`crm-backup-voor-migratie-${new Date().toISOString().slice(0,10)}.json`)) confirmBox.disabled=false;}
        catch(error) {status.textContent=error.message;}
      };
      confirmBox.onchange=()=>submit.disabled=!confirmBox.checked;
      form.onsubmit=async e=>{
        e.preventDefault();if (running||!confirmBox.checked) return;
        running=true;form.querySelectorAll('button,input').forEach(b=>b.disabled=true);
        try {
          await migratePackage(data,message=>status.textContent=message,async()=>{
            if (fromBrowser&&original!==await packageFingerprint(await readBrowserPackage())) throw Error('De browsergegevens zijn tijdens de migratie gewijzigd. Er is nog niets definitief opgeslagen. Sluit dit venster en begin opnieuw.');
          });
          status.textContent='Migratie voltooid en gecontroleerd. Je lokale gegevens en back-up zijn behouden.';
          const link=document.createElement('a');link.className='download-button';link.href='?storage=cloud#settings';link.textContent='Open centrale opslag';status.after(link);toast('Migratie voltooid · alle gegevens en bestanden gecontroleerd');
        } catch(error) {status.textContent=error.message;toast('Migratie: '+error.message);}
        finally {running=false;dialog.querySelector('[data-close]').disabled=false;}
      };
      dialog.showModal();
    })().catch(error=>toast('Migratie: '+error.message)).finally(()=>busy=false);
  });
}
