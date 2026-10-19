export async function saveCustomerCalculation(db,{customer,inputs,title,confirmed=false,id=crypto.randomUUID(),now=new Date().toISOString()}){
if(!confirmed||!customer?.id)throw Error('Kies de klant en bevestig dat je de berekening wilt bewaren.');
title=String(title||'').trim();if(!title||title.length>80)throw Error('Vul een naam van maximaal 80 tekens in.');
if(!Array.isArray(inputs?.pieces)||!inputs.pieces.length||!Array.isArray(inputs?.scenarios)||!inputs.scenarios.length)throw Error('De berekening is onvolledig.');
const blob=new Blob([JSON.stringify({format:'gasket-costing-v2',version:1,inputs:structuredClone(inputs)},null,2)],{type:'application/json'});if(blob.size>1000000)throw Error('De berekening is te groot om te bewaren.');
await new Promise((resolve,reject)=>{const tx=db.transaction(['state','files'],'readwrite'),store=tx.objectStore('state'),r=store.get('main');let failure;
r.onsuccess=()=>{try{const next=r.result,current=next?.customers.find(c=>c.id===customer.id);if(!current||current.archived||JSON.stringify(current)!==JSON.stringify(customer))throw Error('De klant is intussen gewijzigd. Open dit venster opnieuw.');next.documents??=[];next.activities??=[];next.documents.push({id,ownerId:customer.id,name:title.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')+'.json',category:'other',costingV2:true,size:blob.size,type:'application/json',date:now.slice(0,10),createdAt:now});tx.objectStore('files').put({id,blob});next.activities.unshift({id:crypto.randomUUID(),message:'Kostprijsberekening bewaard bij '+current.company,time:now});store.put(next,'main');}catch(e){failure=e;tx.abort();}};
tx.oncomplete=resolve;tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||Error('Opslaan afgebroken.'));});return{id,blob};
}

export function customerCalculationFiles(state,customerId){
 return (state?.documents||[]).filter(d=>d.ownerId===customerId&&d.category==='other'&&(d.costingV2===true||d.type==='application/json'&&/\.json$/i.test(d.name||''))).sort((a,b)=>String(b.createdAt||b.date||'').localeCompare(String(a.createdAt||a.date||'')));
}
export async function readCustomerCalculation(db,{customerId,documentId,check}){
 const saved=await new Promise((resolve,reject)=>{
  const tx=db.transaction(['state','files']),r=tx.objectStore('state').get('main');let result,failure;
  r.onsuccess=()=>{try{const state=r.result,customer=state?.customers.find(c=>c.id===customerId),doc=customerCalculationFiles(state,customerId).find(d=>d.id===documentId);if(!customer||!doc)throw Error('Dit bestand of deze klant is intussen verwijderd. Open de lijst opnieuw.');const f=tx.objectStore('files').get(documentId);f.onsuccess=()=>{result={customer,document:doc,blob:f.result?.blob};};}catch(e){failure=e;}};
  tx.oncomplete=()=>failure?reject(failure):resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Bestand openen afgebroken.'));
 });
 if(!saved?.blob||typeof saved.blob.text!=='function')throw Error('Het berekeningsbestand ontbreekt.');if(saved.blob.size>1000000)throw Error('Het bestand is te groot.');
 let raw;try{raw=JSON.parse(await saved.blob.text());}catch{throw Error('Dit bestand bevat geen leesbare berekening.');}
 if(raw?.format!=='gasket-costing-v2'||raw.version!==1)throw Error('Dit is geen ondersteund V2-berekeningsbestand.');
 return {...saved,inputs:check(raw),signature:JSON.stringify({document:saved.document,raw})};
}
