import {validateVatLedger} from './vat-ledger.js';
import {readVatClassification} from './vat-review.js';
import {validateNamedCosts} from './named-costs.js';
import {productImageTypes} from './product-primary-image.js';
import {validFulfilmentMethod} from './inbound-readiness.js';
import {validSampleDate} from './sample-order.js';
import {validProvenance} from './provenance.js';
import {validateInventory} from './inventory.js?v=workspace-search-20261017';
const fail=message=>{throw Object.assign(Error(message),{status:400});};
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
// Provider references are not CRM record IDs. The existing Tikkie importer
// stores "tikkie:<paymentToken>" to prevent importing the same payment twice.
const externalPaymentId=value=>typeof value==='string'&&/^tikkie:[a-zA-Z0-9._-]{1,160}$/.test(value);
const numeric=new Set(['quantity','width','height','printColors','price','cost','vat','amount','packagePrice','shippingCharge','shippingActual','shippingExpected','extraCosts','freight','dutyAmount','dutyBase','dutyRate','total','purchaseCostTotal','purchaseCostQuantity','calculatedCostTotal']);
import {analyticsExclusions} from './analytics-exclusions.js';
export function validateBusinessState(state) {
 if(!state||typeof state!=='object'||Array.isArray(state)||!['customers','orders','payments','documents','activities'].every(k=>Array.isArray(state[k])))fail('Ongeldige CRM-gegevens.');
 if(state.purchases!==undefined&&!Array.isArray(state.purchases))fail('Ongeldige inkooplijst.');
 function visit(value,depth=0) {
  if(depth>50)fail('De gegevens bevatten te veel geneste velden.');
  if(Array.isArray(value)){for(const child of value)visit(child,depth+1);return;}
  if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)) {
   if(key==='provenance'){if(!validProvenance(child))fail('Ongeldige herkomstmarkering.');continue;}
   if(['__proto__','constructor','prototype'].includes(key))fail('Ongeldige gegevenssleutel.');
   if((key==='id'||key.endsWith('Id'))&&child!=null&&child!==''&&!id(child)&&!(key==='externalId'&&externalPaymentId(child)))fail('Ongeldige ID in '+key+'.');
   // Only validate business numeric fields outside stored tool/provider payloads.
   if(numeric.has(key)&&child!=null&&(typeof child!=='number'||!Number.isFinite(child)||child<0))fail('Ongeldig getal in '+key+'.');
   if(typeof child==='string'&&child.length>2_000_000)fail('Tekstveld is te groot.');
   if(!['costCalculation','generated','result','payload','identity','paymentLinks','documentDrafts','confirmationDraft','quoteDraft','emailDrafts'].includes(key))visit(child,depth+1);
  }
 }
 visit(state);
 for(const customer of state.customers)if(customer.contacts!==undefined){
  const contacts=customer.contacts;
  if(!Array.isArray(contacts)||contacts.length>100||new Set(contacts.map(c=>c?.id)).size!==contacts.length||contacts.some(c=>!c||!id(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>200||typeof c.email!=='string'||c.email.length>200||c.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.email)||typeof c.phone!=='string'||c.phone.length>100))fail('Controleer de extra contactpersonen van de klant.');
 }
 for(const order of state.orders){
  if(order.inquiryCustomer!==undefined&&(!order.inquiryCustomer||typeof order.inquiryCustomer!=='object'||Array.isArray(order.inquiryCustomer)||['company','contact','email','phone'].some(key=>typeof order.inquiryCustomer[key]!=='string'||order.inquiryCustomer[key].length>(key==='phone'?100:200))))fail('Ongeldige bewaarde aanvraagcontactgegevens.');
  for(const decision of [order.inquiryCustomerDecision,...(Array.isArray(order.inquiryCustomerHistory)?order.inquiryCustomerHistory:[])].filter(Boolean))if(!['keep','new','contact'].includes(decision.choice)||!id(decision.customerId)||!id(decision.previousCustomerId)||typeof decision.sourceBasis!=='string'||decision.sourceBasis.length>3000||!Number.isFinite(Date.parse(decision.at)))fail('Ongeldige klantkoppeling bij de aanvraag.');
 }
 for(const name of ['customers','orders','payments','documents','purchases']) {
  const records=state[name]||[];if(records.some(x=>!x||!id(x.id))||new Set(records.map(x=>x.id)).size!==records.length)fail('Ongeldige of dubbele IDs in '+name+'.');
 }
 for(const order of state.orders){if(order.productionDepositPercent!==undefined&&(!Number.isInteger(order.productionDepositPercent)||order.productionDepositPercent<1||order.productionDepositPercent>100))fail('Ongeldige aanbetalingsafspraak.');if(order.fulfilmentMethod!==undefined&&!validFulfilmentMethod(order.fulfilmentMethod))fail('Ongeldige leverwijze.');if(order.isSample!==undefined&&typeof order.isSample!=='boolean'||order.sampleFollowupDone!==undefined&&typeof order.sampleFollowupDone!=='boolean'||order.sampleFollowupDate!==undefined&&order.sampleFollowupDate!==''&&!validSampleDate(order.sampleFollowupDate))fail('Ongeldige teststukopvolging.');if(order.salesFunnel){const f=order.salesFunnel,phases=['new','specs','pricing','indication','quote','confirmation','invoice','paid','released','production','delivered'];if(!Array.isArray(f.events)||new Set(f.events.map(e=>e?.id)).size!==f.events.length||f.events.some(e=>!e||!id(e.id)||!phases.includes(e.phase)||!Number.isFinite(Date.parse(e.at))||typeof e.note!=='string'||e.note.length>2000)||f.followupDays!==undefined&&(!Number.isInteger(f.followupDays)||f.followupDays<1||f.followupDays>365))fail('Ongeldige verkoopfunnelhistorie.');}if(!Array.isArray(order.items))fail('Productregels ontbreken.');if(order.items.some(i=>!i||!id(i.id))||new Set(order.items.map(i=>i.id)).size!==order.items.length)fail('Ongeldige of dubbele product-IDs.');}
 for(const order of state.orders)if(order.vatReason!=null){try{readVatClassification(order.vat,order.vatReason,{required:true});}catch(error){fail(error.message);}}
 if(state.vatReasonPresets!==undefined&&(!Array.isArray(state.vatReasonPresets)||state.vatReasonPresets.length>100||state.vatReasonPresets.some(label=>typeof label!=='string'||!label.trim()||label.length>160)))fail('Ongeldige bewaarde btw-redenen.');
 for(const record of [...state.customers,...state.orders,...state.orders.flatMap(o=>o.items||[]),...[...state.customers,...state.orders].flatMap(o=>o.emailDrafts||[])])if(record.provenance!==undefined&&!validProvenance(record.provenance))fail('Ongeldige herkomstmarkering.');
 for(const o of state.orders)for(const d of o.emailDrafts||[])if(d.funnelReview!==undefined&&!['pending','confirmed','dismissed'].includes(d.funnelReview))fail('Ongeldig fasevoorstel bij e-mail.');
 for(const p of state.purchases||[])if(p.archived!==undefined&&typeof p.archived!=='boolean')fail('Ongeldig batcharchief.');
 for(const p of state.purchases||[])if(p.defaultForNewOrders!==undefined&&typeof p.defaultForNewOrders!=='boolean')fail('Ongeldige voorkeursbatch.');
 for(const order of state.orders)for(const item of order.items||[]){if(item.holeFinish!==undefined&&!['','none','holes'].includes(item.holeFinish))fail('Ongeldige keuze voor bevestigingsgaten.');if(item.surfaceFinish!==undefined&&!['','smooth','anti-spray'].includes(item.surfaceFinish))fail('Ongeldige keuze voor oppervlak.');}
 for(const o of state.orders)for(const i of o.items)if(i.primaryImageId&&!state.documents.some(d=>d.id===i.primaryImageId&&d.ownerId===o.id&&d.itemId===i.id&&productImageTypes.has(d.type)))fail('De hoofdafbeelding hoort niet bij dit product.');
 if(state.customerNumberStart!==undefined&&(!Number.isSafeInteger(state.customerNumberStart)||state.customerNumberStart<1||state.customerNumberStart>999999999)||state.customerNumberPadding!==undefined&&(!Number.isInteger(state.customerNumberPadding)||state.customerNumberPadding<0||state.customerNumberPadding>8))fail('Ongeldige klantnummerinstellingen.');
 if(state.paymentCorrections!==undefined){if(!Array.isArray(state.paymentCorrections)||state.paymentCorrections.length>10000||new Set(state.paymentCorrections.map(c=>c?.id)).size!==state.paymentCorrections.length||state.paymentCorrections.some(c=>!c||!id(c.id)||!['remove','replace'].includes(c.kind)||typeof c.reason!=='string'||c.reason.trim().length<8||c.reason.length>1000||!c.before||!id(c.before.id)||!id(c.before.orderId)||!Number.isSafeInteger(c.before.amount)||c.before.amount<=0||!Number.isFinite(Date.parse(c.at))||c.restoredAt&&!Number.isFinite(Date.parse(c.restoredAt))))fail('Ongeldig betaalcorrectielog.');}
 try{for(const owner of [...state.orders,...(state.purchases||[])])validateNamedCosts(owner);}catch(error){fail(error.message);}
 analyticsExclusions(state.analyticsExclusions);
 if(state.orders.some(o=>o.analyticsInternal!==undefined&&typeof o.analyticsInternal!=='boolean'))fail('Ongeldige interne testmarkering.');
 validateVatLedger(state.vatLedger);
 validateInventory(state);
 return state;
}
