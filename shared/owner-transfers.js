// Registrations of money already transferred. No bank action, expense, VAT or
// distribution of partnership profit is created by this module.
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(v);
export const financeDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const amount=v=>Number.isSafeInteger(v)&&v>0&&v<=1e12;
const fail=message=>{throw Error(message);};
function validateRecord(r,{historical=false}={}){
 const fields=['id','entityType','person','direction','classification','date','amount','reference','evidenceNote','note','status','createdAt','updatedAt',...(historical?[]:['history'])];
 if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).some(k=>!fields.includes(k))||!id(r.id)||r.entityType!=='vof'||!['to_private','from_private'].includes(r.direction)||!['private','review'].includes(r.classification)||!['active','void'].includes(r.status)||!financeDay(r.date)||!amount(r.amount))fail('Controleer bedrag, datum, richting en soort van de VOF-overboeking.');
 for(const [key,max,required] of [['person',200,true],['reference',200,false],['evidenceNote',2000,false],['note',2000,false]])if(typeof r[key]!=='string'||r[key].length>max||required&&!r[key].trim()||/[\0]/.test(r[key]))fail('Controleer '+key+' bij de overboeking.');
 if(r.classification==='review'&&!r.note.trim())fail('Licht toe wat nog beoordeeld moet worden.');
 if(!Number.isFinite(Date.parse(r.createdAt))||!Number.isFinite(Date.parse(r.updatedAt)))fail('Ongeldig registratiemoment.');
 if(!historical){if(!Array.isArray(r.history)||r.history.length>50)fail('Ongeldige overboekingshistorie.');for(const h of r.history){if(!h||Object.keys(h).some(k=>!['at','reason','before'].includes(k))||!Number.isFinite(Date.parse(h.at))||typeof h.reason!=='string'||!h.reason.trim()||h.reason.length>2000)fail('Controleer de wijzigingsreden.');validateRecord(h.before,{historical:true});}}
}
export function validateOwnerTransfers(state){
 const rows=state.ownerTransfers===undefined?[]:state.ownerTransfers;
 if(!Array.isArray(rows)||rows.length>1000||new Set(rows.map(r=>r?.id)).size!==rows.length)fail('Ongeldige lijst met privéoverboekingen.');
 for(const r of rows)validateRecord(r);
}
export const ownerTransferBasis=(state,id)=>JSON.stringify((state.ownerTransfers||[]).find(r=>r.id===id)||null);
export function similarOwnerTransfers(state,value){return (state.ownerTransfers||[]).filter(r=>r.id!==value.id&&r.status==='active'&&r.direction===value.direction&&r.date===value.date&&r.amount===value.amount&&r.person.trim().toLowerCase()===value.person.trim().toLowerCase());}
export function saveOwnerTransfer(state,input,expected,{confirmed=false,allowSimilar=false,reason='',today}={}){
 const rows=state.ownerTransfers||[],old=rows.find(r=>r.id===input.id),content=r=>JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k])=>!['history','createdAt','updatedAt'].includes(k))));
 if(old&&content(old)===content(input)){validateOwnerTransfers(state);return {alreadySaved:true};}
 if(ownerTransferBasis(state,input.id)!==expected)fail('Deze overboeking is intussen gewijzigd. Je invoer blijft staan; open de actuele registratie opnieuw.');
 if(!confirmed)fail('Bevestig dat deze overboeking al werkelijk is gedaan en bij dit actieve bedrijf hoort.');
 if(!financeDay(today)||input.date>today)fail('Registreer alleen werkelijk gedane overboekingen, uiterlijk vandaag.');
 if(!old&&input.status!=='active')fail('Een nieuwe registratie moet actief zijn.');
 if(input.status==='active'&&similarOwnerTransfers(state,input).length&&!allowSimilar)fail('Er staat al een vergelijkbare overboeking. Controleer die bron en bevestig alleen een afzonderlijke bankmutatie.');
 if(old&&(!reason.trim()||reason.length>2000||old.history.length>=50))fail('Geef een wijzigingsreden op; maximaal 50 wijzigingen.');
 const before=old?structuredClone(old):null;if(before)delete before.history;
 const value={...structuredClone(input),createdAt:old?.createdAt||input.createdAt,history:[...(old?.history||[]),...(before?[{at:input.updatedAt,reason:reason.trim(),before}]:[])]};validateRecord(value);
 if(old)rows[rows.indexOf(old)]=value;else {if(rows.length>=1000)fail('Maximaal 1000 overboekingsregistraties.');rows.push(value);}
 state.ownerTransfers=rows;validateOwnerTransfers(state);return {alreadySaved:false};
}
