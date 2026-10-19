// Deliberately small offline projection. No mail, credentials, files or finances.
export const customerFields=['company','contact','email','invoiceEmail','phone','vatNumber','country','shippingRecipient','shippingCountry','shippingAddress','billingAddress','notes'];
export const itemFields=['description','quantity','width','height','material','thickness','specs'];
const copy=x=>structuredClone(x),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>Object.hasOwn(o,k)).map(k=>[k,copy(o[k])]));
const addressKeys=['shippingAddress','shippingRecipient','shippingCountry','billingAddress'];
export function offlineProjection(state){return {customers:(state.customers||[]).map(c=>({...pick(c,['id','number','archived',...customerFields]),addressLocked:(state.orders||[]).some(o=>o.customerId===c.id&&(o.delivery?.source==='custom'||o.billing?.source==='custom'))})),orders:(state.orders||[]).map(o=>({...pick(o,['id','number','sourceNumber','customerId','date','stage','archived','notes']),items:(o.items||[]).map(i=>pick(i,['id',...itemFields]))}))};}
export function changeCount(base,local){return ['customers','orders'].reduce((n,key)=>n+(local[key]||[]).filter(r=>!same(r,(base[key]||[]).find(b=>b.id===r.id))).length,0);}
function validId(id){return typeof id==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(id);}
export function validateOffline(local,base){
 for(const type of ['customers','orders']){
  if(!Array.isArray(local[type])||local[type].length>20000)throw Error('Ongeldige offline gegevens.');
  const ids=new Set();for(const row of local[type]){if(!validId(row.id)||ids.has(row.id))throw Error('Ongeldige of dubbele dossier-ID.');ids.add(row.id);
   for(const [k,v]of Object.entries(row)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Ongeldig veld.');if(typeof v==='string'&&v.length>20000)throw Error('Tekst is te lang.');}
   const previous=base?.[type]?.find(r=>r.id===row.id);if(previous&&same(previous,row))continue;
   if(type==='customers'&&!row.company?.trim())throw Error('Vul een klantnaam in.');
   if(type==='orders'&&!previous){if(!validId(row.customerId)||!local.customers.some(c=>c.id===row.customerId))throw Error('Kies een bestaande klant.');if(!Array.isArray(row.items)||!row.items.length)throw Error('Voeg een product toe.');for(const i of row.items){if(!validId(i.id)||!i.description?.trim()||!Number.isFinite(i.quantity)||i.quantity<=0)throw Error('Vul een product en geldig aantal in.');for(const k of ['width','height','thickness'])if(i[k]!=null&&(!Number.isFinite(i[k])||i[k]<0))throw Error('Controleer de afmetingen.');}}
  }
 }
 return local;
}
// Three-way merge onto a fresh, complete server state. Only allowlisted fields
// are applied. Arrays/provider fields and existing number sequences stay intact.
export function mergeOffline(base,local,remote,{choices={},activityId,time=new Date().toISOString()}={}){
 validateOffline(local,base);const state=copy(remote),conflicts=[],applied=[];
 for(const type of ['customers','orders']){
  for(const old of base[type])if(!local[type].some(r=>r.id===old.id))throw Error('Offline verwijderen wordt niet ondersteund.');
  for(const row of local[type]){
   const old=base[type].find(b=>b.id===row.id);if(same(old,row))continue;
   let target=state[type].find(r=>r.id===row.id);
   const conflict=(field,mine,online,canKeep=true)=>{const key=type+'/'+row.id+'/'+field,choice=choices[key];if(choice&&same(choice.online,online)&&(choice.keep==='online'||canKeep&&choice.keep==='mine'))return choice.keep;conflicts.push({key,type,id:row.id,title:type==='customers'?row.company:'Order '+(row.number||'nieuw'),field,mine:copy(mine),online:copy(online),canKeep});return null;};
   if(!old){
    if(target){if(!same(offlineProjection({customers:type==='customers'?[target]:[],orders:type==='orders'?[target]:[]})[type][0],row))conflict('nieuw dossier',row,target,false);continue;}
    if(type==='customers'){
     const duplicate=state.customers.find(c=>row.email&&c.email?.trim().toLowerCase()===row.email.trim().toLowerCase()||c.company?.trim().toLowerCase()===row.company.trim().toLowerCase());
     if(duplicate&&conflict('mogelijk dubbele klant',row.company,duplicate.company)!=='mine')continue;
     target={id:row.id,archived:false,...pick(row,customerFields)};
     let n=Math.max(state.customerSequence||0,...state.customers.map(c=>Number(/^KL-(\d+)$/.exec(c.number||'')?.[1])||0));target.number='KL-'+String(++n).padStart(4,'0');state.customerSequence=n;
    }else{
     if(!state.customers.some(c=>c.id===row.customerId)){conflict('klant ontbreekt',row.customerId,null,false);continue;}
     target={...pick(row,['id','customerId','date','notes']),number:Math.max(3000,...state.orders.map(o=>Number(o.number)||0))+1,sourceNumber:'',stage:'Ontwerp maken',vat:21,shippingKnown:false,shippingCharge:0,shippingExpected:null,shippingActual:null,extraCosts:null,packagePrice:null,purchaseId:'',archived:false,items:row.items.map(i=>({...pick(i,['id',...itemFields]),price:null,cost:null}))};
    }
    state[type].push(target);applied.push(type+'/'+row.id);continue;
   }
   if(!target){conflict('verwijderd dossier',row,null,false);continue;}
   const allowed=type==='customers'?customerFields:['notes'];
   // Existing products, order status, numbers and financial fields are read-only.
   for(const key of new Set([...Object.keys(old),...Object.keys(row)]))if(!allowed.includes(key)&&!same(old[key],row[key]))throw Error('Dit veld kun je alleen online wijzigen: '+key+'.');
   for(const field of allowed){
    if(same(old[field],row[field]))continue;
    const online=target[field];let keep='mine';
    const addressLocked=type==='customers'&&addressKeys.includes(field)&&state.orders.some(o=>o.customerId===row.id&&(o.delivery?.source==='custom'||o.billing?.source==='custom'));
    if(addressLocked)keep=conflict(field,row[field],online,false);
    else if(!same(old[field],online)&&!same(row[field],online))keep=conflict(field,row[field],online);
    if(keep==='mine'){if(row[field]===undefined)delete target[field];else target[field]=copy(row[field]);applied.push(type+'/'+row.id);}
   }
  }
 }
 if(!conflicts.length&&applied.length&&activityId)state.activities.unshift({id:activityId,message:'Offline klant- en orderwijzigingen gesynchroniseerd ('+new Set(applied).size+' dossiers)',time});
 return {state,conflicts,applied:[...new Set(applied)]};
}
