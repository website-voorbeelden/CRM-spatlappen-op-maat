import {nextOrderNumber} from '../shared/duplicate-records.js?v=duplicate-review-20261028';
import {ensureCustomerNumbers} from "./customers/numbers.js?v=documents-flexible-20261010";
import {supplierInvoices,syncSupplierInvoiceCosts} from "./purchases/costs.js?v=invoices-20261009-2";
// Only the loopback development server exposes this import queue.
const customerKeys=['company','contact','email','invoiceEmail','phone','vatNumber','country','billingAddress','shippingAddress','notes'];
const textKeys=['sourceNumber','date','stage','supplier','batch','expectedDate','notes','quoteAcceptedDate','productionReleasedDate','productionDate','supplierOrderedDate','shippedDate','deliveredDate','leadTimeStartDate','expectedDateFrom','expectedDateTo','purchaseId'];
const money=(value,optional=false)=>optional&&value==null||Number.isSafeInteger(value)&&value>=0;
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;

function alreadyImported(state,entry){
 if(state?.localImports?.includes(entry.key))return true;
 if(entry.data?.format==='spatlappen-crm-purchase-invoice')return state?.purchases?.some(p=>p.id===entry.data.purchaseId&&supplierInvoices(p).some(i=>i.reference.trim().toLowerCase()===entry.data.invoice?.reference?.trim().toLowerCase()));
 return state?.orders.some(o=>o.sourceNumber===entry.data?.order?.sourceNumber);
}
function validatePurchaseInvoice(entry){
 const d=entry.data,i=d.invoice;
 if(d.version!==1||typeof d.purchaseId!=='string'||!i||typeof i.reference!=='string'||!i.reference.trim()||!['offer','invoice'].includes(i.kind)||!validDate(i.date)||!money(i.total)||!Array.isArray(i.lines)||!Array.isArray(i.payments))throw Error('Ongeldige leveranciersfactuur.');
 for(const line of i.lines)if(typeof line.sourceNumber!=='string'||typeof line.description!=='string'||!Number.isInteger(line.quantity)||line.quantity<1||!['piece','pair'].includes(line.unit)||!money(line.price)||!Number.isInteger(line.width)||!Number.isInteger(line.height))throw Error('Controleer leveranciersregels.');
 if(i.lines.reduce((sum,l)=>sum+l.quantity*l.price,0)!==i.total)throw Error('Het totaal van de leveranciersregels wijkt af.');
 for(const payment of i.payments)if(!money(payment.amount)||payment.amount<=0||payment.date&&!validDate(payment.date))throw Error('Controleer leveranciersbetalingen.');
}
function validate(entry,stages){
 if(entry.data?.format==='spatlappen-crm-purchase-invoice'){validatePurchaseInvoice(entry);return;}
 const d=entry.data,o=d?.order,c=d?.customer;
 if(!entry.key||d?.format!=='spatlappen-crm-order'||d.version!==1||!c||!o||!Array.isArray(d.payments)||!Array.isArray(entry.documents))throw Error('Ongeldige lokale import.');
 if(customerKeys.some(k=>typeof c[k]!=='string')||!c.company.trim())throw Error('Controleer de klantgegevens in de lokale import.');
 if(!o.sourceNumber?.trim()||!stages.includes(o.stage)||!validDate(o.date)||!Number.isFinite(o.vat)||o.vat<0||o.vat>100||!money(o.shippingCharge,true)||!money(o.packagePrice,true))throw Error('Controleer ordernummer, datum en bedragen in de lokale import.');
 for(const key of textKeys){if(o[key]!=null&&typeof o[key]!=='string')throw Error('Ongeldig orderveld: '+key);if(key.endsWith('Date')||key==='expectedDateFrom'||key==='expectedDateTo')if(o[key]&&!validDate(o[key]))throw Error('Ongeldige datum: '+key);}
 if(!Array.isArray(o.items)||!o.items.length)throw Error('Orderregels ontbreken.');
 for(const i of o.items){
  if(typeof i.description!=='string'||!i.description.trim()||typeof i.specs!=='string'||!Number.isInteger(i.quantity)||i.quantity<1||!money(i.price,true)||!money(i.cost,true))throw Error('Controleer de orderregels.');
  for(const key of ['width','height'])if(i[key]!=null&&(!Number.isInteger(i[key])||i[key]<1))throw Error('Ongeldige afmeting.');
  if(i.printColors!=null&&(!Number.isInteger(i.printColors)||i.printColors<0||i.printColors>99))throw Error('Controleer het aantal drukkleuren.');
  if(i.productionSource&&!['supplier','local'].includes(i.productionSource))throw Error('Ongeldige productieplek.');
 }
 for(const p of d.payments)if(!money(p.amount)||p.amount<=0||!validDate(p.date)||typeof p.reference!=='string')throw Error('Controleer de ontvangen betalingen.');
 const min=o.leadTimeMinWeeks,max=o.leadTimeMaxWeeks;
 if(o.leadTimeDepositPercent!=null&&(!Number.isInteger(o.leadTimeDepositPercent)||o.leadTimeDepositPercent<1||o.leadTimeDepositPercent>100)||o.leadTimeBasis==='deposit'&&o.leadTimeDepositPercent==null)throw Error('Controleer het afgesproken aanbetalingspercentage voor de levertijd.');
 if(min!=null||max!=null){if(![min,max].every(v=>Number.isInteger(v)&&v>=0&&v<=104)||max<min||!['payment','deposit','order','manual'].includes(o.leadTimeBasis))throw Error('Controleer de levertijd.');}
 if(o.expectedDateFrom&&o.expectedDateTo&&o.expectedDateFrom>o.expectedDateTo)throw Error('Controleer het levervenster.');
 for(const file of entry.documents)if(typeof file.name!=='string'||!['quote','confirmation','proforma','invoice','other'].includes(file.category)||typeof file.file!=='string'||!/^[a-f0-9]{24}\.[a-z0-9]+$/.test(file.file))throw Error('Ongeldige bijlage.');
}

export async function importLocalOrders({db,stages,today,beforeCommit,companyId='spatlappen'}){
 if(companyId!=='spatlappen')return null;
 if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))return null;
 const response=await fetch('/__local/imports',{cache:'no-store'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('Lokale import kon niet worden opgehaald.');
 const queue=await response.json();
 if(queue.version!==1||!Array.isArray(queue.orders))throw Error('Ongeldige lokale importlijst.');
 if(!queue.orders.length)return null;
 const current=await new Promise((resolve,reject)=>{const tx=db.transaction('state','readonly');const r=tx.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const pending=queue.orders.filter(e=>!alreadyImported(current,e));
 if(!pending.length)return null;
 const prepared=[];
 for(const entry of pending){
  validate(entry,stages);
  for(const f of entry.documents||[])if(typeof f.name!=='string'||!['quote','confirmation','proforma','invoice','other'].includes(f.category)||typeof f.file!=='string'||!/^[a-f0-9]{24}\.[a-z0-9]+$/.test(f.file))throw Error('Ongeldige bijlage.');
  const files=[];
  for(const doc of entry.documents){const r=await fetch('/__local/files/'+doc.file,{cache:'no-store'});if(!r.ok)throw Error('Bijlage ontbreekt: '+doc.name);files.push({...doc,blob:await r.blob()});}
  prepared.push({...entry,files});
 }
 beforeCommit();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state');
  let result;
  const r=ss.get('main');
  r.onsuccess=()=>{
   try{
    const next=r.result||{customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]};next.purchases??=[];next.localImports??=[];
    const ids=[];let targetRoute='';
    for(const entry of prepared){
     if(alreadyImported(next,entry))continue;
     if(entry.data.format==='spatlappen-crm-purchase-invoice'){
      const d=entry.data,p=next.purchases.find(p=>p.id===d.purchaseId);if(!p)throw Error('Inkoopbestelling ontbreekt.');
      const invoice={...d.invoice,id:crypto.randomUUID(),payments:d.invoice.payments.map(pay=>({...pay,id:crypto.randomUUID()})),lines:[]};
      for(const line of d.invoice.lines){
       const o=next.orders.find(o=>o.sourceNumber===line.sourceNumber||String(o.number)===line.sourceNumber);
       const matches=o?.items.filter(i=>i.productionSource!=='local'&&i.width===line.width&&i.height===line.height)||[];
       if(matches.length!==1)throw Error('Geen uniek leveranciersproduct gevonden voor '+line.sourceNumber+' / '+line.description);
       if(o.purchaseId&&o.purchaseId!==p.id)throw Error('Klantorder hoort al bij een andere zending.');
       o.purchaseId=p.id;invoice.lines.push({...line,id:crypto.randomUUID(),orderId:o.id,itemId:matches[0].id});
      }
      p.invoices=[...supplierInvoices(p),invoice];
      for(const key of ['supplier','supplierContact','supplierEmail','supplierPhone','supplierAddress','deliveryTerms'])if(typeof d.supplier?.[key]==='string')p[key]=d.supplier[key];
      syncSupplierInvoiceCosts(next,p);
      for(const file of entry.files){const id=crypto.randomUUID();tx.objectStore('files').put({id,blob:file.blob});next.documents.push({id,ownerId:p.id,invoiceId:invoice.id,name:file.name,category:file.category,size:file.blob.size,type:file.blob.type,date:today});}
      next.localImports.push(entry.key);ids.push(invoice.id);targetRoute=`purchases/${p.id}/invoices`;
      next.activities.unshift({id:crypto.randomUUID(),message:`Leveranciersdocument ${invoice.reference} toegevoegd met betalingen en kostprijzen`,time:new Date().toISOString()});
      continue;
     }
     const {customer:c,order:o,payments}=entry.data;
     // Recheck inside the serialized transaction so other tabs cannot duplicate an order.
     if(next.localImports.includes(entry.key)||next.orders.some(x=>x.sourceNumber===o.sourceNumber)){continue;}
     if(o.purchaseId&&!next.purchases.some(p=>p.id===o.purchaseId))throw Error('De gekoppelde inkoopbestelling bestaat niet meer.');
     let client=next.customers.find(x=>x.company.trim().toLowerCase()===c.company.trim().toLowerCase()||c.email&&x.email?.toLowerCase()===c.email.toLowerCase());
     if(!client){client={id:crypto.randomUUID(),archived:false};for(const key of customerKeys)client[key]=c[key].trim();next.customers.push(client);}
     const item={id:crypto.randomUUID(),number:nextOrderNumber(next),customerId:client.id,archived:false,vat:o.vat,shippingKnown:o.shippingCharge!=null,shippingCharge:o.shippingCharge??0,packagePrice:o.packagePrice??null,shippingExpected:null,shippingActual:null,extraCosts:null,leadTimeMinWeeks:o.leadTimeMinWeeks??null,leadTimeMaxWeeks:o.leadTimeMaxWeeks??null,leadTimeBasis:o.leadTimeBasis||'payment',...(o.leadTimeDepositPercent!=null?{leadTimeDepositPercent:o.leadTimeDepositPercent}:{})};
     for(const key of textKeys)item[key]=o[key]||'';
     item.items=o.items.map(i=>({id:crypto.randomUUID(),description:i.description.trim(),quantity:i.quantity,width:i.width??null,height:i.height??null,price:i.price??null,cost:i.cost??null,printColors:i.printColors??null,specs:i.specs,productionSource:i.productionSource||'supplier'}));
     next.orders.push(item);ids.push(item.id);targetRoute=`orders/${item.id}`;
     for(const p of payments)next.payments.push({...p,id:crypto.randomUUID(),orderId:item.id});
     for(const file of entry.files){const id=crypto.randomUUID();tx.objectStore('files').put({id,blob:file.blob});next.documents.push({id,ownerId:item.id,name:file.name,category:file.category,size:file.blob.size,type:file.blob.type,date:today});}
     next.localImports.push(entry.key);
     next.activities.unshift({id:crypto.randomUUID(),message:`Order ${item.sourceNumber} toegevoegd via lokale import`,time:new Date().toISOString()});
    }
    if(ids.length){ensureCustomerNumbers(next);ss.put(next,'main');}
    result=ids.length?{state:next,ids,route:targetRoute}:null;
   }catch(error){tx.abort();reject(error);}
  };
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Lokale import afgebroken.'));
 });
}
