import {termsDocumentFor} from './company-documents.js?v=ui-batch234-20261027';
import {validateDesignVariants} from './product-design-variants.js?v=batch1-variants-20261026';
import {validateInquiryAttribution} from './inquiry-mail-metadata.js';
import {validateWebsiteContacts,websiteUuid} from './website-dossier.js';
import {supplierFileMetadata} from './direct-purchase.js?v=direct-purchase-20261021';
import {validGmailSalesPhase} from './sales-phase-signal.js?v=open-fixes-20261027';
import {validateVatLedger} from './vat-ledger.js?v=feedback28-batch2-20261028';
import {readVatClassification} from './vat-review.js';
import {validateNamedCosts} from './named-costs.js';
import {productImageTypes} from './product-primary-image.js';
import {validFulfilmentMethod} from './inbound-readiness.js?v=feedback-followup-20261028';
import {validSampleDate} from './sample-order.js';
import {validProvenance} from './provenance.js?v=provenance-colors-20261027';
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
 if(state.mailThreadLabels!==undefined){const entries=state.mailThreadLabels;if(!Array.isArray(entries)||entries.length>1000||new Set(entries.map(entry=>entry?.key)).size!==entries.length||entries.some(entry=>!entry||typeof entry.key!=='string'||!entry.key||entry.key.length>2048||!id(entry.ownerId)||!Array.isArray(entry.labels)||entry.labels.length>4||new Set(entry.labels).size!==entry.labels.length||entry.labels.some(label=>!['handled','followup','price-high','price-extreme'].includes(label))||!Number.isFinite(Date.parse(entry.updatedAt))||Object.keys(entry).some(key=>!['key','ownerId','labels','updatedAt'].includes(key))))fail('Controleer de labels bij het mailgesprek.');}
 if(state.mailReplyGuidance!==undefined){const entries=state.mailReplyGuidance;if(!Array.isArray(entries)||entries.length>1000||new Set(entries.map(entry=>entry?.key)).size!==entries.length||entries.some(entry=>!entry||typeof entry.key!=='string'||!entry.key||entry.key.length>1024||!id(entry.ownerId)||typeof entry.notes!=='string'||entry.notes.length>6000||!Number.isFinite(Date.parse(entry.updatedAt))||Object.keys(entry).some(key=>!['key','ownerId','notes','updatedAt'].includes(key))))fail('Controleer de werkinstructies bij het mailgesprek.');}

 for(const document of state.documents)if(document.companyAsset!==undefined){
  const asset=termsDocumentFor('maatwerkkunststof');
  if(document.companyAsset!==asset.key||document.name!==asset.name||document.type!=='application/pdf'||!Number.isSafeInteger(document.size)||document.size<=0||document.size>4_000_000||document.internalDesign||document.generated||!state.orders.some(order=>order.id===document.ownerId))fail('Ongeldige bedrijfsbijlage.');
 }
 for(const document of state.documents)if(document.manualDelivery!==undefined){
  const m=document.manualDelivery,day=m?.sentOn;
  if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).some(key=>!['kind','sentOn','recordedAt','source'].includes(key))||!['invoice','confirmation','quote'].includes(m.kind)||m.source!=='user'||typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day||typeof m.recordedAt!=='string'||!Number.isFinite(Date.parse(m.recordedAt))||!state.orders.some(order=>order.id===document.ownerId)||! /\.pdf$/i.test(document.name||'')||document.supplierDocument||document.generated?.kind&&document.generated.kind!==m.kind)fail('Controleer de handmatig geregistreerde documentverzending.');
 }
 for(const document of state.documents)if(document.supplierDocument!==undefined){const metadata=document.supplierDocument;if(!metadata||metadata.kind!=='invoice'||Object.keys(metadata).some(key=>!['kind','supplier','reference','date'].includes(key))||!state.orders.some(order=>order.id===document.ownerId)||document.generated||document.category!=='other')fail('Ongeldige leveranciersfactuur bij de order.');try{supplierFileMetadata(metadata);}catch(error){fail(error.message);}}
 for(const customer of state.customers)if(customer.contacts!==undefined){
  const contacts=customer.contacts;
  if(!Array.isArray(contacts)||contacts.length>100||new Set(contacts.map(c=>c?.id)).size!==contacts.length||contacts.some(c=>!c||!id(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>200||typeof c.email!=='string'||c.email.length>200||c.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.email)||typeof c.phone!=='string'||c.phone.length>100))fail('Controleer de extra contactpersonen van de klant.');
 }
 for(const order of state.orders){
  if(order.leadTimeDepositPercent!=null&&(!Number.isInteger(order.leadTimeDepositPercent)||order.leadTimeDepositPercent<1||order.leadTimeDepositPercent>100))fail('Ongeldig aanbetalingspercentage voor de levertijd.');
  if(order.salesFunnel?.selection){const selection=order.salesFunnel.selection;if(!['new','welcome','specs','pricing','indication','quote','confirmation','received','paid','released','production','delivered','invoice'].includes(selection.phase)||typeof selection.basis!=='string'||selection.basis.length>64000||Object.keys(selection).some(k=>!['phase','basis'].includes(k)))fail('Ongeldige handmatig gekozen verkoopfase.');}
  if(order.gmailSalesPhase!==undefined&&!validGmailSalesPhase(order.gmailSalesPhase))fail('Ongeldige Gmail-verkoopfasekoppeling.');
  if(order.inquiryCustomer!==undefined&&(!order.inquiryCustomer||typeof order.inquiryCustomer!=='object'||Array.isArray(order.inquiryCustomer)||['company','contact','email','phone'].some(key=>typeof order.inquiryCustomer[key]!=='string'||order.inquiryCustomer[key].length>(key==='phone'?100:200))))fail('Ongeldige bewaarde aanvraagcontactgegevens.');
  for(const decision of [order.inquiryCustomerDecision,...(Array.isArray(order.inquiryCustomerHistory)?order.inquiryCustomerHistory:[])].filter(Boolean))if(!['keep','new','contact'].includes(decision.choice)||!id(decision.customerId)||!id(decision.previousCustomerId)||typeof decision.sourceBasis!=='string'||decision.sourceBasis.length>3000||!Number.isFinite(Date.parse(decision.at)))fail('Ongeldige klantkoppeling bij de aanvraag.');
 }
 if(state.orderMerges!==undefined){
  if(!Array.isArray(state.orderMerges)||state.orderMerges.length>2000||new Set(state.orderMerges.map(m=>m?.id)).size!==state.orderMerges.length)fail('Ongeldige samenvoeghistorie.');
  for(const m of state.orderMerges)if(!m||!id(m.id)||!id(m.sourceOrderId)||!id(m.targetOrderId)||m.sourceOrderId===m.targetOrderId||m.beforeSource?.id!==m.sourceOrderId||m.beforeTarget?.id!==m.targetOrderId||!Array.isArray(m.beforeSource.items)||!Array.isArray(m.beforeTarget.items)||!Array.isArray(m.beforePayments)||!Array.isArray(m.beforeDocuments)||!Number.isFinite(Date.parse(m.at))||typeof m.reason!=='string'||m.reason.trim().length<8||m.reason.length>800||!m.mapping||!m.choices||!m.receipts)fail('Controleer de samenvoegregistratie.');
 }
 for(const name of ['customers','orders','payments','documents','purchases']) {
  const records=state[name]||[];if(records.some(x=>!x||!id(x.id))||new Set(records.map(x=>x.id)).size!==records.length)fail('Ongeldige of dubbele IDs in '+name+'.');
 }
 for(const order of state.orders){if(order.productionDepositPercent!==undefined&&(!Number.isInteger(order.productionDepositPercent)||order.productionDepositPercent<1||order.productionDepositPercent>100))fail('Ongeldige aanbetalingsafspraak.');if(order.fulfilmentMethod!==undefined&&!validFulfilmentMethod(order.fulfilmentMethod))fail('Ongeldige leverwijze.');if(order.isSample!==undefined&&typeof order.isSample!=='boolean'||order.sampleFollowupDone!==undefined&&typeof order.sampleFollowupDone!=='boolean'||order.sampleFollowupDate!==undefined&&order.sampleFollowupDate!==''&&!validSampleDate(order.sampleFollowupDate))fail('Ongeldige teststukopvolging.');if(order.salesFunnel){const f=order.salesFunnel,phases=['new','welcome','received','specs','pricing','indication','quote','confirmation','invoice','paid','released','production','delivered'];if(!Array.isArray(f.events)||new Set(f.events.map(e=>e?.id)).size!==f.events.length||f.events.some(e=>!e||!id(e.id)||!phases.includes(e.phase)||!Number.isFinite(Date.parse(e.at))||typeof e.note!=='string'||e.note.length>2000)||f.followupDays!==undefined&&(!Number.isInteger(f.followupDays)||f.followupDays<1||f.followupDays>365))fail('Ongeldige verkoopfunnelhistorie.');}if(!Array.isArray(order.items))fail('Productregels ontbreken.');if(order.items.some(i=>i.autoPruneDesignVariants!==undefined&&typeof i.autoPruneDesignVariants!=='boolean'))fail('Ongeldige instelling voor ontwerpvoorstellen opruimen.');if(order.items.some(i=>!i||!id(i.id))||new Set(order.items.map(i=>i.id)).size!==order.items.length)fail('Ongeldige of dubbele product-IDs.');}
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
 for(const owner of [...state.customers,...state.orders])validateWebsiteContacts(owner.websiteContacts);
 for(const order of state.orders)validateInquiryAttribution(order.websiteAttribution);
 for(const order of state.orders)if(order.websiteLeadId!=null&&order.websiteLeadId!==''&&!websiteUuid(order.websiteLeadId))fail('Ongeldig website-aanvraagnummer.');
 analyticsExclusions(state.analyticsExclusions);
 if(state.orders.some(o=>o.analyticsInternal!==undefined&&typeof o.analyticsInternal!=='boolean'))fail('Ongeldige interne testmarkering.');
 validateVatLedger(state.vatLedger);
 validateInventory(state);
 try{validateDesignVariants(state);}catch(error){fail(error.message);}
 return state;
}
