// Personal view preferences only: no dossier content or business-state writes.
export const orderSortOptions=[
 ['opened:desc','Laatst geopend'],
 ['number:desc','Dossiernummer · hoogste eerst'],['number:asc','Dossiernummer · laagste eerst'],
 ['date:desc','Aanvraagdatum · nieuwste eerst'],['date:asc','Aanvraagdatum · oudste eerst'],
 ['customer:asc','Klantnaam · A–Z'],['customer:desc','Klantnaam · Z–A'],
 ['stage:asc','Uitvoeringsstatus · A–Z'],['stage:desc','Uitvoeringsstatus · Z–A'],
 ['net:desc','Verkoop excl. btw · hoogste eerst'],['net:asc','Verkoop excl. btw · laagste eerst']
];
export const customerSortOptions=[['opened','Laatst geopend'],['name','Klantnaam A–Z'],['recent','Laatste bestelling eerst'],['outstanding','Hoogste openstaande bedrag']];
const limit=1000;
const validId=id=>typeof id==='string'&&id.length>0&&id.length<=200;
const trim=entries=>[...entries].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit);
function visits(value){
 const result=new Map();
 if(Array.isArray(value))for(const entry of value.slice(0,limit)){
  if(!Array.isArray(entry)||!validId(entry[0])||!Number.isSafeInteger(entry[1])||entry[1]<=0||entry[1]>Date.now()+86400000)continue;
  result.set(entry[0],Math.max(result.get(entry[0])||0,entry[1]));
 }
 return result;
}
export function createDossierPreferences(companyId){
 const storageKey=companyId+':dossier-view-v1';
 let data={orderSort:'opened:desc',customerSort:'opened',orders:new Map(),customers:new Map()},active='',readFailed=false,writeFailed=false;
 function read(){
  try{
   const raw=globalThis.localStorage.getItem(storageKey);
   if(raw&&raw.length<=600000){
    const saved=JSON.parse(raw);
    if(saved?.version===1){
     if(!writeFailed){
      if(orderSortOptions.some(([key])=>key===saved.orderSort))data.orderSort=saved.orderSort;
      if(customerSortOptions.some(([key])=>key===saved.customerSort))data.customerSort=saved.customerSort;
     }
     for(const group of ['orders','customers']){
      for(const [id,at] of visits(saved[group]))data[group].set(id,Math.max(data[group].get(id)||0,at));
      data[group]=new Map(trim(data[group]));
     }
    }
   }
   readFailed=false;
  }catch{readFailed=true;}
 }
 function write(){
  try{
   const raw=JSON.stringify({version:1,orderSort:data.orderSort,customerSort:data.customerSort,orders:trim(data.orders),customers:trim(data.customers)});
   globalThis.localStorage.setItem(storageKey,raw);
   writeFailed=globalThis.localStorage.getItem(storageKey)!==raw;
  }catch{writeFailed=true;}
 }
 read();
 return {
  refresh:read,
  orderSort:()=>data.orderSort,
  customerSort:()=>data.customerSort,
  setOrderSort(value){if(!orderSortOptions.some(([key])=>key===value))return false;read();data.orderSort=value;write();return true;},
  setCustomerSort(value){if(!customerSortOptions.some(([key])=>key===value))return false;read();data.customerSort=value;write();return true;},
  openedAt:(group,id)=>data[group]?.get(id)||0,
  visit(group,id){
   const next=['orders','customers'].includes(group)&&validId(id)?group+':'+id:'';
   if(next===active)return;
   active=next;
   if(!next)return;
   read();
   data[group].set(id,Math.max(Date.now(),(data[group].get(id)||0)+1));
   data[group]=new Map(trim(data[group]));write();
  },
  help(group,currentSort){
   const opened=group==='orders'?(currentSort||data.orderSort)==='opened:desc':(currentSort||data.customerSort)==='opened';
   return (opened?'Laatst geopend in deze browser. Nog niet geopend? '+(group==='orders'?'Nieuwste aanvraagdatum eerst.':'Laatste bestelling eerst.')+' ':'')+(readFailed||writeFailed?'Browseropslag niet beschikbaar; je volgorde blijft alleen in dit tabblad bewaard.':'Je sorteerkeuze wordt per browser en bedrijf onthouden.');
  }
 };
}
