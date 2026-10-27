// CRM labels are independent of Gmail labels and never prove payment, sending or delivery.
export const mailThreadLabels=[['handled','Behandeld'],['followup','Opvolgen'],['price-high','Prijs te hoog'],['price-extreme','Belachelijk hoge prijs']];
const ids=new Set(mailThreadLabels.map(([id])=>id));
export const mailLabelKey=(ownerId,key)=>JSON.stringify([ownerId,key]);
export function threadLabels(state,ownerId,key){return state.mailThreadLabels?.find(entry=>entry.key===mailLabelKey(ownerId,key))?.labels||[];}
export function setThreadLabels(state,{ownerId,key,labels,expected},{now=()=>new Date().toISOString()}={}){
 if(![...state.orders,...state.customers].some(record=>record.id===ownerId))throw Error('Koppel het gesprek eerst aan een klant of order.');
 if(typeof key!=='string'||!key||key.length>1024||!Array.isArray(labels)||labels.length>ids.size||new Set(labels).size!==labels.length||labels.some(id=>!ids.has(id)))throw Error('Ongeldige gesprekslabels.');
 if(JSON.stringify(threadLabels(state,ownerId,key))!==expected)throw Object.assign(Error('De labels zijn elders gewijzigd. Controleer de actuele labels en kies je wijziging opnieuw.'),{code:'THREAD_LABELS_CHANGED',currentLabels:[...threadLabels(state,ownerId,key)]});
 const scope=mailLabelKey(ownerId,key),entries=(state.mailThreadLabels||[]).filter(entry=>entry.key!==scope);
 if(labels.length){if(entries.length>=1000)throw Error('Er zijn al labels bij 1.000 gesprekken opgeslagen.');entries.push({key:scope,ownerId,labels:mailThreadLabels.map(([id])=>id).filter(id=>labels.includes(id)),updatedAt:now()});}
 state.mailThreadLabels=entries;
}
