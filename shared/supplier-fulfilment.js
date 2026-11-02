import {renderSupplierOrderText} from './supplier-order-text.js?v=supplier-workflow-ui-20261101';
// Supplier fulfilment uses the existing order and document stores. No provider
// call or inferred shipment/payment fact belongs in this module.
import {supplierTrialRecipient,supplierTrialSubject,supplierTrialNotice} from './supplier-trial-mail.js?v=supplier-batches35-20261101';
import {companyFor} from './companies.js';
import {kunststofbaas} from './kunststofbaas.js?v=supplier-batches35-20261101';
export {kunststofbaas};
import {orderContactDetails} from './customer-contact.js?v=feedback29-batch2-followup';
import {validatePacksPreparation,packsPreparationBasis} from './packs-preparation.js?v=packs-worker-v3-20261102';
const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
const line=(value,max=200)=>typeof value==='string'&&value.length<=max&&!/[\r\n\0]/.test(value);
const email=value=>line(value)&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const trialEmail=value=>{try{return !!supplierTrialRecipient(value);}catch{return false;}};
const day=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const supplierMatches=value=>!value||/^kunststofbaas(?:\.nl)?(?:\s+b\.?v\.?)?$/i.test(value.trim());
export function supplierPackingReferenceEnabled(state,order,companyId){
 const purchase=(state.purchases||[]).find(p=>p.id===order?.purchaseId);
 return companyFor(companyId).supplierFulfilment===kunststofbaas.key&&!!order&&supplierMatches(purchase?.supplier||order.supplier);
}
export function supplierFulfilmentAvailable(state,order,companyId){
 if(companyFor(companyId).supplierFulfilment!==kunststofbaas.key||!order||order.archived||order.mergedIntoOrderId)return false;
 const purchase=(state.purchases||[]).find(p=>p.id===order.purchaseId);
 return supplierMatches(purchase?.supplier||order.supplier)&&!order.items.some(i=>i.productionSource==='local')&&(!order.purchaseId||!!purchase&&state.orders.filter(o=>o.purchaseId===purchase.id).length===1);
}
export function supplierFulfilmentData(state,order){
 const customer=state.customers.find(c=>c.id===order.customerId),custom=order.delivery?.source==='custom',contact=orderContactDetails(customer,order);
 return {orderId:order.id,customerId:order.customerId,contactId:order.contactId||'',number:String(order.number),customerReference:order.sourceNumber||'',customer:customer?.company||'',contact:contact.name,email:contact.email,phone:contact.phone,recipient:custom?order.delivery.recipient:customer?.shippingRecipient||customer?.contact||customer?.company||'',address:custom?order.delivery.address:customer?.shippingAddress||'',country:custom?order.delivery.country:customer?.shippingCountry||customer?.country||'',...(custom&&order.delivery.structuredAddress?{structuredAddress:order.delivery.structuredAddress}:{}),instructions:order.delivery?.instructions||'',fulfilmentMethod:order.fulfilmentMethod||'',items:order.items.map(i=>({id:i.id,description:i.description||'',quantity:i.quantity,width:i.width??null,height:i.height??null,material:i.material||'',thickness:i.thickness??null,specs:i.specs||'',costCalculation:i.costCalculation||null,costQuoteLink:i.costQuoteLink||null}))};
}
// Copyable supplier text is derived from the existing CRM order number. Keep it
// separate from Kunststofbaas' own order number and from a customer's reference.
export const supplierOwnOrderReference=data=>'Maatwerkkunststof order #'+data.number;
export function supplierOrderDescription(data,reference=''){return renderSupplierOrderText(data,reference);}
export function supplierFulfilmentBasis(state,order){return JSON.stringify(supplierFulfilmentData(state,order));}
export function supplierFulfilmentSignature(state,order){return JSON.stringify([order,state.customers.find(c=>c.id===order.customerId),(state.purchases||[]).find(p=>p.id===order.purchaseId)||null]);}
export function supplierFulfilmentInfo(state,order,companyId){
 if(!supplierFulfilmentAvailable(state,order,companyId))throw Error('Deze bestelstroom is alleen voor een losse Maatwerkkunststof-order bij Kunststofbaas.');
 const data=supplierFulfilmentData(state,order),basis=supplierFulfilmentBasis(state,order),workflow=order.supplierFulfilment,reference=order.supplierOrderReference||'';
 const current=!!workflow&&!workflow.referenceReviewRequired&&workflow.orderedBasis===basis&&!!reference;
 const preparation=workflow?.packsPreparation,preparationBasis=packsPreparationBasis(preparation),preparationCurrent=!preparation||preparation.basis===basis&&preparation.reference===reference;
 const label=preparationCurrent?state.documents.find(d=>d.id===workflow?.labelDocumentId&&d.ownerId===order.id&&d.shippingLabel?.basis===basis&&d.shippingLabel?.reference===reference&&d.shippingLabel?.preparationBasis===preparationBasis):null;
 const packing=state.documents.filter(d=>d.ownerId===order.id&&d.type==='application/pdf'&&d.generated?.kind==='packing'&&d.generated.supplierFulfilment?.basis===basis&&d.generated.supplierFulfilment?.reference===reference&&!state.documents.some(other=>other.ownerId===order.id&&other.generated?.kind==='packing'&&(other.generated.seriesId||other.generated.generationId)===(d.generated.seriesId||d.generated.generationId)&&(other.generated.revision||1)>(d.generated.revision||1))).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0];
 const candidates=current&&packing&&label?(order.emailDrafts||[]).filter(d=>typeof d.to==='string'&&d.supplierFulfilmentMail?.basis===basis&&d.supplierFulfilmentMail.reference===reference&&d.supplierFulfilmentMail.labelDocumentId===label.id&&d.supplierFulfilmentMail.packingDocumentId===packing.id).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))):[];
 const mail=candidates.find(d=>!d.supplierFulfilmentMail.trialRecipient&&d.to.toLowerCase()===workflow.recipientEmail.toLowerCase())||null,trialMail=candidates.find(d=>d.supplierFulfilmentMail.trialRecipient&&d.to.toLowerCase()===d.supplierFulfilmentMail.trialRecipient.toLowerCase())||null;
 return {data,basis,reference,workflow,current,tracking:label?.packsLabelBundle?.attemptId===order.packsTracking?.attemptId?order.packsTracking:null,label:current?label:null,packing:current?packing:null,mail,trialMail,signature:supplierFulfilmentSignature(state,order)};
}
// All manual reference writers share the same invalidation rule. Saving a
// number does not renew a confirmed order, even when changed back later.
export function setSupplierOrderReference(order,value){
 if(typeof value!=='string'||value.length>200||/[\r\n\0]/.test(value))throw Error('Controleer het leveranciersbestelnummer.');
 const reference=value.trim();if((order.supplierOrderReference||'')===reference)return;
 order.supplierOrderReference=reference;delete order.provenance?.supplierOrderReference;
 if(order.supplierFulfilment)order.supplierFulfilment.referenceReviewRequired=true;
}

// In this order workspace the user enters the supplier number AFTER placing it.
// Record that deliberate action without inventing an actual supplier order date.
export function confirmSupplierReference(state,id,expected,companyId,{now=new Date().toISOString()}={}){
 const order=state.orders.find(o=>o.id===id),info=supplierFulfilmentInfo(state,order,companyId);
 if(info.signature!==expected)throw Error('De order is intussen gewijzigd. Je invoer blijft staan.');
 if(!info.reference)throw Error('Vul eerst het bestelnummer van Kunststofbaas in.');
 if(!order.fulfilmentMethod)order.fulfilmentMethod='shipping';
 if(!order.purchaseId)order.supplier=kunststofbaas.name;
 order.supplierFulfilment={...order.supplierFulfilment,supplierKey:kunststofbaas.key,recipientEmail:info.workflow?.recipientEmail||kunststofbaas.email,orderedBasis:supplierFulfilmentBasis(state,order),recordedAt:now};
 delete order.supplierFulfilment.referenceReviewRequired;
 return order;
}
export function recordSupplierOrder(state,orderId,input,expected,companyId,{now=new Date().toISOString(),today}={}){
 const order=state.orders.find(o=>o.id===orderId);const info=supplierFulfilmentInfo(state,order,companyId);
 if(info.signature!==expected)throw Error('De order, klant of inkoop is intussen gewijzigd. Je invoer blijft staan; open Bestellen opnieuw.');
 if(!input.confirmed||!input.shipDirectly)throw Error('Bevestig de geplaatste bestelling en de rechtstreekse verzending naar de klant.');
 if(!line(input.reference)||!input.reference.trim()||!email(input.recipientEmail)||!day(input.orderedOn)||input.orderedOn>today)throw Error('Controleer bestelnummer, besteldatum en leveranciersadres.');
 if(!info.data.items.length||info.data.items.length>40||info.data.items.some(i=>!i.description||i.description.length>200||!i.material||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>100000||!Number.isFinite(i.thickness)||i.thickness<=0))throw Error('Vul eerst omschrijving, materiaal, dikte en geldige aantallen bij de order in (maximaal 40 productregels).');
 if(!info.data.recipient||!info.data.address||!info.data.country)throw Error('Vul eerst naam, afleveradres en land bij de order in.');
 const purchase=(state.purchases||[]).find(p=>p.id===order.purchaseId);
 if(!purchase)order.supplier=kunststofbaas.name;
 order.supplierOrderReference=input.reference.trim();order.supplierOrderedDate=input.orderedOn;order.fulfilmentMethod='shipping';
 order.supplierFulfilment={...order.supplierFulfilment,supplierKey:kunststofbaas.key,recipientEmail:input.recipientEmail.trim(),orderedBasis:supplierFulfilmentBasis(state,order),recordedAt:now};
 delete order.supplierFulfilment.referenceReviewRequired;
 return order;
}
export function supplierPackingNote(reference,notes=''){
 const prefix='Bestelnummer Kunststofbaas: '+reference;
 const result=[prefix,String(notes).trim()].filter(Boolean).join('\n');
 if(result.length>500)throw Error('Het leveranciersnummer en de pakbonopmerkingen mogen samen maximaal 500 tekens zijn.');
 return result;
}
// A revision keeps the original shipment/order association. It must not turn
// an old packing slip into a packing slip for a different destination/reference.
export const supplierPackingRevisionFields=Object.freeze(['shipping_company','shipping_attention','shipping_street','shipping_postal_city','shipping_country','order_number','customer_reference','supplier_order_reference']);
export function supplierPackingRevisionTag(document,payload){
 const tag=document.generated?.supplierFulfilment;if(!tag)return undefined;
 if(document.generated.kind!=='packing'||payload.kind!=='packing'||tag.supplierKey!==kunststofbaas.key)throw Error('Controleer de leverancierskoppeling van deze pakbon.');
 const original=document.generated.payload?.fields;
 if(!original||!payload.fields)throw Error('De oorspronkelijke pakbongegevens ontbreken. Maak een nieuwe pakbon via Bestelling openen.');
 for(const key of supplierPackingRevisionFields)if(String(payload.fields[key]??'')!==String(original[key]??''))throw Object.assign(Error('Deze pakbon hoort bij een leveranciersbestelling. Wijzig afleveradres, ordernummer of klantreferentie via de order en maak daarna een nieuwe pakbon bij Bestelling openen.'),{field:key});
 if(String(payload.fields.customer_reference??'').trim()!==tag.reference&&!String(payload.fields.delivery_notes??'').split(/\r?\n/).some(note=>note.trim()===supplierPackingNote(tag.reference)))throw Object.assign(Error('Laat het bestelnummer van Kunststofbaas in de opmerkingen staan. Het hoort bij deze pakbon en het gekozen label.'),{field:'delivery_notes'});
 return structuredClone(tag);
}
export function supplierLabelMetadata(info){
 if(!info.current||info.data.fulfilmentMethod!=='shipping')throw Error('Leg eerst de actuele bestelling met leverwijze Verzenden vast.');
 const preparation=info.workflow.packsPreparation;
 if(preparation&&(preparation.basis!==info.basis||preparation.reference!==info.reference))throw Error('De PACKS-voorbereiding hoort bij eerdere ordergegevens. Open PACKS voorbereiden, vergelijk je invoer met de huidige bestelling en bewaar die opnieuw vóór je het label toevoegt.');
 return {carrier:'packs',supplierKey:kunststofbaas.key,reference:info.reference,basis:info.basis,...(preparation?{preparationBasis:packsPreparationBasis(preparation)}:{})};
}
export function recordPacksPreparation(state,orderId,input,expected,companyId){
 const order=state.orders.find(candidate=>candidate.id===orderId),info=supplierFulfilmentInfo(state,order,companyId);
 if(info.signature!==expected||!info.current||order.fulfilmentMethod!=='shipping')throw Error('De bestelling, klant of voorbereiding is intussen gewijzigd. Je invoer blijft staan; open de actuele bestelling opnieuw.');
 validatePacksPreparation(input);
 if(input.basis!==info.basis||input.reference!==info.reference)throw Error('De PACKS-voorbereiding hoort bij een andere orderbasis of een ander bestelnummer.');
 // Only a preparation. Does not select a label, record a shipment or alter costs.
 order.supplierFulfilment={...order.supplierFulfilment,packsPreparation:structuredClone(input)};
 return order;
}
export function supplierMailTag(info,{trialRecipient=''}={}){if(trialRecipient)supplierTrialRecipient(trialRecipient);return {supplierKey:kunststofbaas.key,reference:info.reference,basis:info.basis,labelDocumentId:info.label.id,packingDocumentId:info.packing.id,...(trialRecipient?{trialRecipient}:{})};}
export function assertSupplierMail(state,orderId,draft,companyId){
 const tag=draft.supplierFulfilmentMail;if(!tag)return;
 const order=state.orders.find(o=>o.id===orderId),info=supplierFulfilmentInfo(state,order,companyId);
 if(!info.current||!info.label||!info.packing||tag.supplierKey!==kunststofbaas.key||tag.reference!==info.reference||tag.basis!==info.basis||tag.labelDocumentId!==info.label.id||tag.packingDocumentId!==info.packing.id)throw Error('De leveranciersbestelling, bestemming of bijlagen zijn gewijzigd. Open Bestellen opnieuw en maak een actueel mailvoorstel.');
 if(info.label?.packsLabelBundle?.environment==='test'&&!tag.trialRecipient)throw Error('Een PACKS-testlabel mag alleen naar het gekozen proefmailadres, niet als leveranciersopdracht.');
 const to=tag.trialRecipient?supplierTrialRecipient(tag.trialRecipient):info.workflow.recipientEmail;
 if(tag.trialRecipient&&to.toLowerCase()===info.workflow.recipientEmail.toLowerCase())throw Error('De proefmail mag niet naar de vastgelegde leveranciersontvanger.');
 if(tag.trialRecipient&&(!draft.subject.startsWith(supplierTrialSubject)||!draft.body.startsWith(supplierTrialNotice)||draft.replyMessageId||draft.references?.length))throw Error('Dit proefbericht moet herkenbaar een proef zijn en losstaan van eerdere gesprekken.');
 if(draft.to.trim().toLowerCase()!==to.toLowerCase()||draft.documentId!==info.packing.id||draft.attachmentIds?.length!==1||draft.attachmentIds[0]!==info.label.id||draft.paymentLinkId)throw Error('Deze leveranciersmail moet naar het vastgelegde leveranciersadres, met alleen de actuele pakbon en het PACKS-label en zonder klantbetaallink.');
 if(!draft.subject.includes(info.reference)&&!draft.body.includes(info.reference))throw Error('Vermeld het bestelnummer van Kunststofbaas in het onderwerp of bericht.');
}
export function validateSupplierFulfilment(state){
 const validTag=(value,mail=false)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>['supplierKey','reference','basis',...(mail?['labelDocumentId','packingDocumentId','trialRecipient']:[])].includes(k))&&value.supplierKey===kunststofbaas.key&&line(value.reference)&&!!value.reference.trim()&&typeof value.basis==='string'&&value.basis.length<=500000&&(!mail||validId(value.labelDocumentId)&&validId(value.packingDocumentId)&&(value.trialRecipient===undefined||trialEmail(value.trialRecipient)));
 for(const order of state.orders){
  const value=order.supplierFulfilment;if(value===undefined)continue;
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['supplierKey','recipientEmail','orderedBasis','recordedAt','labelDocumentId','packsPreparation','referenceReviewRequired'].includes(k))||value.supplierKey!==kunststofbaas.key||!email(value.recipientEmail)||typeof value.orderedBasis!=='string'||value.orderedBasis.length>500000||!Number.isFinite(Date.parse(value.recordedAt))||value.labelDocumentId!==undefined&&!validId(value.labelDocumentId)||value.referenceReviewRequired!==undefined&&typeof value.referenceReviewRequired!=='boolean')throw Error('Controleer de leveranciersbestelling bij de order.');
  if(value.packsPreparation!==undefined)validatePacksPreparation(value.packsPreparation);
 }
 for(const document of state.documents)if(document.shippingLabel!==undefined){const value=document.shippingLabel;if(!value||Object.keys(value).some(k=>!['carrier','supplierKey','reference','basis','preparationBasis'].includes(k))||value.carrier!=='packs'||value.supplierKey!==kunststofbaas.key||!line(value.reference)||!value.reference.trim()||typeof value.basis!=='string'||value.basis.length>500000||value.preparationBasis!==undefined&&(typeof value.preparationBasis!=='string'||value.preparationBasis.length>20000)||document.category!=='other'||document.type!=='application/pdf'||!Number.isSafeInteger(document.size)||document.size<=0||document.size>4000000||!state.orders.some(o=>o.id===document.ownerId))throw Error('Controleer het PACKS-label bij de order.');}
 for(const document of state.documents)if(document.generated?.supplierFulfilment!==undefined&&(!validTag(document.generated.supplierFulfilment)||document.generated.kind!=='packing'||!state.orders.some(o=>o.id===document.ownerId)))throw Error('Controleer de leverancierskoppeling bij de pakbon.');
 for(const owner of [...state.orders,...state.customers])for(const draft of owner.emailDrafts||[])if(draft.supplierFulfilmentMail!==undefined&&(!validTag(draft.supplierFulfilmentMail,true)||!state.orders.some(o=>o.id===owner.id)))throw Error('Controleer de leverancierskoppeling bij het mailconcept.');
}
