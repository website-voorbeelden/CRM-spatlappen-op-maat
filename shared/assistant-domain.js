import {markProvenance} from './provenance.js';
import {companyFor} from './companies.js';
import {validateBusinessState} from './state-validation.js';
import {ensureCustomerNumbers} from '../admin/customer-numbers.js';
import {normalizeAssistantPageContext} from './assistant-page-context.js';
export const customerFields=['company','contact','email','invoiceEmail','phone','vatNumber','country','billingAddress','shippingAddress','notes'];
export const orderFields=['customerId','description','quantity','width','height','price','vat','date','expectedDate','notes','stage'];
export const stages=['Ontwerp maken','Wachten op goedkeuring','Ontwerp goedgekeurd','Offerte verstuurd','Wachten op betaling','Productie vrijgegeven','Besteld bij leverancier','In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'];
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const fail=message=>{throw Error(message);};
const clone=v=>structuredClone(v);
const fingerprint=v=>JSON.stringify(v);
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(id);
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Makassar'}).format(new Date());
const pick=(record,keys)=>Object.fromEntries(keys.filter(k=>record[k]!==undefined).map(k=>[k,record[k]]));
export function assistantTransportState(state){
 validateBusinessState(state);
 return {customers:state.customers.map(c=>pick(c,['id','number','archived',...customerFields])),
  orders:state.orders.map(o=>({...pick(o,['id','number','sourceNumber','customerId','date','expectedDate','stage','notes','archived','vat','shippingCharge','shippingKnown','packagePrice','inquirySpecs']),items:o.items.map(i=>pick(i,['id','description','quantity','width','height','price']))})),
  payments:state.payments.map(p=>pick(p,['id','orderId','amount'])),documents:[],activities:[],purchases:[]};
}
export function assistantContext(snapshot,context){
 if(!context)return null;
 if(context.kind==='page'){
  const page=normalizeAssistantPageContext(context,snapshot.companyId);
  if(page.selected)page.selected=assistantContext(snapshot,page.selected);
  if(page.visible)for(const id of page.visible.ids)assistantContext(snapshot,{entity:page.visible.entity,id});
  return page;
 }
 if(!object(context)||!['customer','order'].includes(context.entity)||!validId(context.id))fail('Ongeldig huidig dossier.');
 const record=(context.entity==='customer'?snapshot.customers:snapshot.orders).find(r=>r.id===context.id);
 if(!record)fail('Het geopende dossier bestaat niet meer. Open het opnieuw of schakel dossiercontext uit.');
 return {entity:context.entity,id:record.id,label:context.entity==='customer'?record.company:'Order #'+record.number};
}
export function appendNotesRequest(snapshot,{entity,id,text}){
 if(!['customer','order'].includes(entity)||!validId(id)||typeof text!=='string'||!text.trim())fail('Kies een dossier en schrijf de toe te voegen notitie.');
 const record=(entity==='customer'?snapshot.customers:snapshot.orders).find(r=>r.id===id);
 if(!record||record.truncatedFields.includes('notes'))fail('De bestaande notities kunnen niet volledig worden gecontroleerd. Gebruik het CRM-formulier.');
 return {entity,operation:'update',id,fields:{notes:record.notes+(record.notes&&!record.notes.endsWith('\n')?'\n':'')+text.trim()}};
}
export function cleanFields(input,allowed){
 if(!object(input)||Object.keys(input).some(k=>!allowed.includes(k)))fail('Het voorstel bevat velden die de assistent niet mag wijzigen.');
 const out={};for(const [key,value] of Object.entries(input)){if(value===null)continue;if(typeof value==='string'){if(value.length>10000||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value))fail('Tekstveld is te lang of ongeldig.');out[key]=key==='notes'?value:value.trim();}else if(typeof value==='number'&&Number.isFinite(value)&&(key==='vat'||Number.isSafeInteger(value))&&value>=0&&['quantity','width','height','price','vat'].includes(key))out[key]=value;else fail('Ongeldige waarde in '+key+'.');}
 for(const key of ['quantity','width','height','price','vat'])if(out[key]!==undefined&&typeof out[key]!=='number')fail('Een getal ontbreekt in '+key+'.');
 for(const key of ['date','expectedDate'])if(out[key]!==undefined&&out[key]!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(out[key])||!Number.isFinite(Date.parse(out[key]))||new Date(out[key]).toISOString().slice(0,10)!==out[key]))fail('Ongeldige datum.');
 if(out.vat!==undefined&&out.vat>100)fail('Btw moet tussen 0 en 100 liggen.');
 if(out.quantity===0||out.width===0||out.height===0)fail('Aantal en maten moeten positief zijn.');
 if(out.stage!==undefined&&!stages.includes(out.stage))fail('Onbekende orderstatus.');
 for(const key of ['email','invoiceEmail'])if(out[key]&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out[key])))fail('Ongeldig e-mailadres.');
 if(out.customerId!==undefined&&!validId(out.customerId))fail('Ongeldige klantkoppeling.');
 return out;
}
export function assistantSnapshot(state,companyId){
 companyFor(companyId);validateBusinessState(state);
 // Files, design payloads, provider tokens and activity journals are excluded.
 const customers=state.customers.map(c=>({id:c.id,number:c.number||'',archived:!!c.archived,truncatedFields:customerFields.filter(k=>String(c[k]??'').length>10000),...Object.fromEntries(customerFields.map(k=>[k,String(c[k]??'').slice(0,10000)]))}));
 const orders=state.orders.map(o=>({id:o.id,number:o.sourceNumber||o.number,customerId:o.customerId,date:o.date||'',expectedDate:o.expectedDate||'',stage:o.stage||'',notes:String(o.notes||'').slice(0,10000),archived:!!o.archived,vat:o.vat??null,shippingCharge:o.shippingCharge||0,shippingKnown:o.shippingKnown!==false,inquirySpecs:structuredClone(o.inquirySpecs||{}),packagePrice:o.packagePrice??null,
  truncatedFields:String(o.notes||'').length>10000?['notes']:[],items:o.items.map(i=>({id:i.id,description:String(i.description||'').slice(0,10000),quantity:i.quantity,width:i.width??null,height:i.height??null,price:i.price??null})),
  paidInCents:state.payments.filter(p=>p.orderId===o.id).reduce((sum,p)=>sum+p.amount,0)}));
 return {companyId,customers,orders};
}
function recordList(snapshot,entity){return entity==='customer'?snapshot.customers:snapshot.orders;}
export function prepareAssistantPlan(snapshot,requests,companyId,{uuid=()=>crypto.randomUUID(),now=Date.now(),preserveCreateIds=false}={}) {
 if(snapshot.companyId!==companyId||!Array.isArray(requests)||!requests.length||requests.length>10)fail('Ongeldig voorstel of ander bedrijf.');
 const seen=new Set(),operations=[];
 for(const req of requests){
  if(!object(req)||!['customer','order'].includes(req.entity)||!['create','update'].includes(req.operation))fail('Onbekende bewerking.');
  const fields=cleanFields(req.fields,req.entity==='customer'?customerFields:orderFields),creating=req.operation==='create';
  const id=creating?(preserveCreateIds&&req.id?req.id:uuid()):req.id;if(!validId(id))fail('Record-ID ontbreekt.');
  const key=req.entity+'/'+id;if(seen.has(key))fail('Hetzelfde dossier komt twee keer in het voorstel voor.');seen.add(key);
  if(creating&&recordList(snapshot,req.entity).some(x=>x.id===id))fail('Het nieuwe dossier-ID bestaat al.');
  const base=creating?null:recordList(snapshot,req.entity).find(x=>x.id===id);if(!creating&&!base)fail('Het dossier bestaat niet in dit bedrijf.');
  if(!Object.keys(fields).length)fail('Het voorstel bevat geen wijzigingen.');
  if(base?.truncatedFields?.some(k=>Object.hasOwn(fields,k)))fail('Dit tekstveld is te lang om volledig te controleren. Bewerk het via het normale CRM-formulier.');
  if(req.entity==='customer'){
   if(creating&&!fields.company||fields.company==='')fail('De klantnaam ontbreekt.');
   if(creating&&[...snapshot.customers,...operations.filter(o=>o.entity==='customer'&&o.operation==='create').map(o=>o.fields)].some(c=>c.company.trim().toLowerCase()===fields.company.toLowerCase()||fields.email&&c.email?.toLowerCase()===fields.email.toLowerCase()))fail('Deze klant lijkt al te bestaan. Laat de assistent het bestaande dossier kiezen.');
  }else if(creating){
   if(fields.customerId==='__new_customer__'){const created=operations.filter(o=>o.entity==='customer'&&o.operation==='create');if(created.length!==1)fail('Kies één nieuwe klant voor de gecombineerde order.');fields.customerId=created[0].id;}
   if(!fields.customerId||!snapshot.customers.some(c=>c.id===fields.customerId)&&!operations.some(o=>o.entity==='customer'&&o.operation==='create'&&o.id===fields.customerId))fail('Kies een bestaande klant of neem de nieuwe klant op in hetzelfde voorstel.');
   if(!fields.description||!fields.quantity)fail('Omschrijving en aantal ontbreken voor de nieuwe order.');
   if(fields.vat===undefined)fail('Btw ontbreekt. Vraag het percentage eerst aan de gebruiker.');
   if(fields.vat!==21)fail('Maak een order met afwijkende btw via Nieuwe order of AI-import, zodat je zelf de verplichte btw-reden kunt kiezen.');
   if((fields.width===undefined)!==(fields.height===undefined))fail('Vul beide maten in of laat beide onbekend.');
   if(fields.price!==undefined&&!Number.isSafeInteger(fields.price*fields.quantity))fail('De orderwaarde is te groot.');
   if(fields.stage&&fields.stage!==stages[0])fail('Een nieuwe order begint bij de eerste status.');
  }else{
   if(Object.keys(fields).some(k=>!['notes','stage','date','expectedDate'].includes(k)))fail('De assistent kan bij bestaande orders alleen notities, status en datums voorstellen. Pas producten en bedragen in het CRM-formulier aan.');
   if(fields.stage&&stages.indexOf(fields.stage)>=stages.indexOf('Productie vrijgegeven')&&fields.stage!==base.stage){
    if(!base.items.length||base.items.some(i=>i.price==null)&&base.packagePrice==null)fail('Productie vrijgeven kan niet met onbekende verkoopprijzen.');
    const net=(base.packagePrice??base.items.reduce((s,i)=>s+i.quantity*i.price,0))+(base.shippingCharge||0),total=net+Math.round(net*(base.vat||0)/100);
    if(base.paidInCents<total)fail('De order is nog niet volledig betaald. Gebruik de normale productieactie voor een afwijkende afspraak.');
   }
  }
  operations.push({entity:req.entity,operation:req.operation,id,fields,baseline:base?fingerprint(base):null,itemId:creating&&req.entity==='order'?uuid():null});
 }
 return {id:uuid(),companyId,createdAt:now,expiresAt:now+30*60*1000,operations};
}
export function applyAssistantPlan(state,plan,companyId,{approved=false,now=Date.now()}={}) {
 if(!approved)fail('Het voorstel is nog niet bevestigd.');
 if(plan?.companyId!==companyId||!validId(plan.id)||!Number.isFinite(plan.expiresAt)||plan.expiresAt<now)fail('Het voorstel is verlopen of hoort bij een ander bedrijf.');
 if(state.assistantAppliedPlans?.some(p=>p.id===plan.id))fail('Dit voorstel is al opgeslagen.');
 const current=assistantSnapshot(state,companyId);
 // Revalidate all changes and compare every affected record before mutating anything.
 prepareAssistantPlan(current,plan.operations.map(o=>({entity:o.entity,operation:o.operation,id:o.id,fields:o.fields})),companyId,{uuid:()=>crypto.randomUUID(),now,preserveCreateIds:true});
 for(const op of plan.operations){const list=recordList(current,op.entity),existing=list.find(r=>r.id===op.id);if(op.operation==='create'&&existing||op.operation==='update'&&fingerprint(existing)!==op.baseline)fail('Dit dossier is intussen gewijzigd. Vraag een nieuw voorstel; er is niets overschreven.');}
 const next=clone(state);
 for(const op of plan.operations){
  if(op.entity==='customer'){
   if(op.operation==='create')next.customers.push({id:op.id,archived:false,...Object.fromEntries(customerFields.map(k=>[k,''])),...op.fields});
   else Object.assign(next.customers.find(c=>c.id===op.id),op.fields);
  }else if(op.operation==='create'){
   const f=op.fields,number=Math.max(3000,...next.orders.map(o=>Number(o.number)||0))+1;
   next.orders.push({id:op.id,number,customerId:f.customerId,date:f.date||today(),stage:stages[0],archived:false,vat:f.vat,notes:f.notes||'',expectedDate:f.expectedDate||'',shippingCharge:0,shippingKnown:false,shippingActual:null,shippingExpected:null,extraCosts:null,packagePrice:null,leadTimeMinWeeks:2,leadTimeMaxWeeks:8,leadTimeBasis:'payment',
    items:[{id:op.itemId,description:f.description,quantity:f.quantity,width:f.width??null,height:f.height??null,price:f.price??null,cost:null,printColors:null,specs:'',productionSource:'supplier'}]});
  }else Object.assign(next.orders.find(o=>o.id===op.id),op.fields);
  const changed=(op.entity==='customer'?next.customers:next.orders).find(r=>r.id===op.id);markProvenance(changed,Object.keys(op.fields).filter(k=>Object.hasOwn(changed,k)),'ai',{at:new Date(now).toISOString()});if(op.entity==='order'&&op.operation==='create')markProvenance(changed.items[0],['description','quantity','width','height','price'],'ai',{at:new Date(now).toISOString()});
  next.activities.unshift({id:crypto.randomUUID(),message:'Assistentvoorstel bevestigd: '+(op.entity==='customer'?'klant':'order')+' '+(op.operation==='create'?'toegevoegd':'bijgewerkt'),time:new Date(now).toISOString()});
 }
 ensureCustomerNumbers(next);validateBusinessState(next);
 next.assistantAppliedPlans=[...(next.assistantAppliedPlans||[]),{id:plan.id,time:new Date(now).toISOString()}].slice(-200);
 return next;
}
export function executeReadTool(snapshot,name,args){
 if(!object(args))fail('Ongeldige zoekopdracht.');
 if(name==='get_summary'){
  const active=snapshot.orders.filter(o=>!o.archived),known=active.filter(o=>o.packagePrice!=null||o.items.every(i=>i.price!=null));
  const outstanding=known.reduce((sum,o)=>{const net=(o.packagePrice??o.items.reduce((s,i)=>s+i.quantity*i.price,0))+o.shippingCharge;return sum+Math.max(0,net+Math.round(net*(o.vat||0)/100)-o.paidInCents);},0);
  return {companyId:snapshot.companyId,activeCustomers:snapshot.customers.filter(c=>!c.archived).length,activeOrders:active.length,openOrders:active.filter(o=>o.stage!=='Afgerond').length,ordersByStage:Object.fromEntries(stages.map(stage=>[stage,active.filter(o=>o.stage===stage).length])),outstandingInCents:outstanding,ordersWithUnknownPrice:active.length-known.length,note:'Openstaande bedragen zijn alleen berekend voor orders met bekende verkoopprijzen. Geen omzet-/winstboekhouding.'};
 }
 if(name==='search_customers'){const query=String(args.query||'').toLowerCase();return snapshot.customers.filter(c=>[c.company,c.contact,c.email,c.number].some(v=>String(v||'').toLowerCase().includes(query))).slice(0,30).map(c=>({id:c.id,number:c.number,company:c.company,contact:c.contact,email:c.email,archived:c.archived}));}
 if(name==='search_orders'){const query=String(args.query||'').toLowerCase();return snapshot.orders.filter(o=>(!args.customerId||o.customerId===args.customerId)&&(!args.stage||o.stage===args.stage)&&(!query||String(o.number).toLowerCase().includes(query)||o.items.some(i=>i.description.toLowerCase().includes(query)))).slice(0,30).map(o=>({id:o.id,number:o.number,customerId:o.customerId,stage:o.stage,date:o.date,paidInCents:o.paidInCents}));}
 if(name==='get_customer'||name==='get_order'){if(!validId(args.id))fail('Ongeldige dossier-ID.');const value=recordList(snapshot,name==='get_customer'?'customer':'order').find(r=>r.id===args.id);if(!value)fail('Dossier niet gevonden in dit bedrijf.');return clone(value);}
 fail('De assistent mag deze actie niet uitvoeren.');
}
