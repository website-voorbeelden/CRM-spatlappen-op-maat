import {items,planFor} from './roadmap.js?v=delivery-map-20261021';
import {sourceUpdates} from './source-updates.js?v=delivery-map-20261021';
export const taskStatuses={open:'Open',doing:'Mee bezig',blocked:'Geblokkeerd',review:'Gebouwd · jouw controle',done:'Afgerond'};
export const taskDeliveries={unknown:'Niet vastgelegd',local:'Alleen lokaal',live:'Live gepubliceerd'};
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const key=v=>typeof v==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(v);
const text=(v,max)=>typeof v==='string'&&v.length<=max;
const validTime=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
export function taskSourceEvents(item,companyId){return sourceUpdates.filter(entry=>entry.taskId===item.id&&entry.companies.includes(companyId)).slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));}
export function taskBaseline(item,companyId){const latest=taskSourceEvents(item,companyId).at(-1);return {status:latest?.status||(item.stage==='done'?'done':item.stage==='review'?'review':'open'),delivery:latest?.delivery||(item.delivery==='live-spatlappen'&&companyId==='spatlappen'?'live':/lokaal/i.test(item.effort||'')?'local':'unknown')};}
export const taskFilters={open:'Te bouwen',review:'Jouw controle',done:'Afgerond',all:'Alles'};
export function taskMatchesFilter(status,filter){return filter==='all'||(filter==='open'?!['review','done'].includes(status):status===filter);}
export function validateTaskProgress(record,companyId){
 if(!record||!key(record.id)||record.companyId!==companyId||!['spatlappen','maatwerkkunststof'].includes(companyId)||!Number.isSafeInteger(record.version)||record.version<1||!Object.hasOwn(taskStatuses,record.status)||!Object.hasOwn(taskDeliveries,record.delivery)||!Array.isArray(record.events)||record.events.length!==record.version||record.events.length>1000)fail('Ongeldig bouwlog.');
 const task=items.find(i=>i.id===record.id);if(task&&!task.companies.includes(companyId))fail('Deze bouwtaak hoort bij een ander bedrijf.');
 const ids=new Set();for(const e of record.events){if(!e||!key(e.id)||ids.has(e.id)||!validTime(e.at)||!text(e.author,80)||!e.author.trim()||!text(e.note,6000)||!text(e.evidence,4000)||!Object.hasOwn(taskStatuses,e.status)||!Object.hasOwn(taskDeliveries,e.delivery)||!['comment','update'].includes(e.kind)||!['',...Object.keys(taskStatuses)].includes(e.requestedStatus)||!['',...Object.keys(taskDeliveries)].includes(e.requestedDelivery))fail('Ongeldige bouwlogregel.');ids.add(e.id);}
 const last=record.events.at(-1);if(last.status!==record.status||last.delivery!==record.delivery)fail('Bouwlog en taakstatus verschillen.');return record;
}
export function validateTaskProgressList(records,companyId){if(!Array.isArray(records)||records.length>2000||new Set(records.map(r=>r?.id)).size!==records.length)fail('Ongeldige bouwtakenlijst.');for(const r of records)validateTaskProgress(r,companyId);return records;}
export function applyTaskChange(previous,change,companyId,{now=new Date().toISOString()}={}){
 const task=planFor(companyId).find(i=>i.id===change?.taskId);if(!task)fail('Deze bouwtaak bestaat niet voor dit bedrijf.');
 if(previous)validateTaskProgress(previous,companyId);if(previous&&previous.id!==task.id)fail('Bouwtaak en log horen niet bij elkaar.');
 const author=String(change.author||'').trim(),note=String(change.note||'').trim(),evidence=String(change.evidence||'').trim(),status=change.status||'',delivery=change.delivery||'';
 if(!key(change.id)||!author||author.length>80||note.length>6000||evidence.length>4000||status&&!Object.hasOwn(taskStatuses,status)||delivery&&!Object.hasOwn(taskDeliveries,delivery)||!validTime(now))fail('Vul een bouwer en geldige taakgegevens in.');
 const kind=status||delivery?'update':'comment',same=previous?.events.find(e=>e.id===change.id);
 if(same){if(same.author!==author||same.note!==note||same.evidence!==evidence||same.requestedStatus!==status||same.requestedDelivery!==delivery)fail('Deze bewaaractie is al met andere inhoud verwerkt. Ververs de taak.',409);return previous;}
 if(!status&&!delivery&&!note&&!evidence)fail('Schrijf een opmerking of wijzig de taakstatus.');
 if((status||delivery)&&(change.expectedVersion??0)!==(previous?.version||0))fail('Deze taak is intussen gewijzigd. Je invoer blijft staan; open de taak opnieuw voor een statuswijziging.',409);
 if(['review','done'].includes(status)&&!note&&!evidence)fail('Noteer kort wat is gebouwd of afgerond en wat nog gecontroleerd moet worden.');
 if((previous?.events.length||0)>=1000)fail('Dit bouwlog is vol. Exporteer het log en laat de opslag uitbreiden; er is niets verwijderd.');
 const base=previous||{id:task.id,companyId,version:0,...taskBaseline(task,companyId),events:[]},nextStatus=status||base.status,nextDelivery=delivery||base.delivery;
 const result={...base,version:base.version+1,status:nextStatus,delivery:nextDelivery,events:[...base.events,{id:change.id,at:now,author,note,evidence,kind,requestedStatus:status,requestedDelivery:delivery,status:nextStatus,delivery:nextDelivery}]};return validateTaskProgress(result,companyId);
}
