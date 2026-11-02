import {supplierFulfilmentInfo,supplierLabelMetadata} from './supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {packsId,packsPreparationBasis,validatePacksPlanning} from './packs-preparation.js?v=packs-worker-v3-20261102';
import {packsProviderId} from './packs-provider-contract.js?v=packs-workflow-20261102';
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export const packsLabelFileId=(environment,attemptId,part)=>'packs-'+environment+'-'+attemptId+'-'+part;
export function validatePacksApiLabels(state){
 for(const d of state.documents){
  const source=d.packsLabelSource,bundle=d.packsLabelBundle;if(!source&&!bundle)continue;
  const m=source||bundle;
  if(source&&bundle||!m||!['test','live'].includes(m.environment)||!packsId(m.attemptId)||!packsProviderId(m.shipmentId)||!hash(m.sha256)||d.category!=='other'||d.type!=='application/pdf'||!Number.isSafeInteger(d.size)||d.size<5||d.size>4000000||!state.orders.some(o=>o.id===d.ownerId)||d.generated||d.supplierDocument||d.supplierControlDocument)throw Error('Controleer de API-labelbestanden bij de order.');
  if(source){if(d.shippingLabel||Object.keys(source).some(k=>!['environment','attemptId','shipmentId','shipmentItemId','barcode','sha256'].includes(k))||!packsProviderId(source.shipmentItemId)||typeof source.barcode!=='string'||!source.barcode||source.barcode.length>200)throw Error('Ongeldige oorspronkelijke PACKS-labelidentiteit.');}
  if(bundle){if(Object.keys(bundle).some(k=>!['environment','attemptId','shipmentId','sha256','originalIds','planning'].includes(k))||!Array.isArray(bundle.originalIds)||bundle.originalIds.length<1||bundle.originalIds.length>20||new Set(bundle.originalIds).size!==bundle.originalIds.length||!d.shippingLabel)throw Error('De PACKS-labelbundel is onvolledig.');if(bundle.planning!==undefined)validatePacksPlanning(bundle.planning);for(const id of bundle.originalIds){const original=state.documents.find(x=>x.id===id);if(!original?.packsLabelSource||original.ownerId!==d.ownerId||original.packsLabelSource.attemptId!==bundle.attemptId||original.packsLabelSource.environment!==bundle.environment||original.packsLabelSource.shipmentId!==bundle.shipmentId)throw Error('Een origineel pakketlabel ontbreekt bij de bundel.');}}
 }
}
export function applyPacksLabels(state,{orderId,expectedSignature,preparationRevision,attemptId,environment,shipmentId,planning,originals,bundle,now,today}){
 if(!packsId(attemptId)||!['test','live'].includes(environment)||!packsProviderId(shipmentId)||!Array.isArray(originals)||originals.length<1||originals.length>20||!hash(bundle?.sha256))throw Error('De labelopslag mist een geldige boekingsidentiteit.');
 const order=state.orders.find(o=>o.id===orderId),info=supplierFulfilmentInfo(state,order,'maatwerkkunststof'),p=info.workflow?.packsPreparation;
 if(planning!==undefined)validatePacksPlanning(planning);
 const bundleId=packsLabelFileId(environment,attemptId,'bundle');
 if(!info.current||!p||p.revision!==preparationRevision||p.basis!==info.basis||p.reference!==info.reference)throw Error('Order of pakketvoorbereiding is gewijzigd. De boeking blijft bestaan; boek niet opnieuw.');
 const existing=state.documents.find(d=>d.id===bundleId);
 if(existing&&info.workflow.labelDocumentId===bundleId){if(existing.packsLabelBundle?.sha256!==bundle.sha256||JSON.stringify(existing.packsLabelBundle.planning)!==JSON.stringify(planning)||originals.length!==existing.packsLabelBundle.originalIds.length||originals.some((file,n)=>{const source=state.documents.find(d=>d.id===existing.packsLabelBundle.originalIds[n])?.packsLabelSource;return !source||source.sha256!==file.sha256||source.shipmentItemId!==file.shipmentItemId||source.barcode!==file.barcode;}))throw Error('Het herstelde labelbewijs wijkt af van de reeds bewaarde oorspronkelijke bestanden.');validatePacksApiLabels(state);return {alreadySaved:true,bundleId};}
 if(info.signature!==expectedSignature||info.workflow.labelDocumentId&&info.workflow.labelDocumentId!==bundleId)throw Error('De order of gekozen label is gewijzigd. Herstel dezelfde boeking na controle; overschrijf geen ander label.');
 const itemIds=new Set(),barcodes=new Set(),docs=originals.map((file,n)=>{
  if(!packsProviderId(file.shipmentItemId)||typeof file.barcode!=='string'||!file.barcode||file.barcode.length>200||itemIds.has(file.shipmentItemId)||barcodes.has(file.barcode)||!hash(file.sha256)||!Number.isSafeInteger(file.size)||file.size<5||file.size>4000000)throw Error('Niet alle pakketlabels hebben een unieke geldige identiteit.');itemIds.add(file.shipmentItemId);barcodes.add(file.barcode);
  return {id:packsLabelFileId(environment,attemptId,'p'+(n+1)),ownerId:orderId,category:'other',name:'PACKS_'+attemptId+'_pakket_'+(n+1)+'.pdf',type:'application/pdf',size:file.size,date:today,createdAt:now,packsLabelSource:{environment,attemptId,shipmentId,shipmentItemId:file.shipmentItemId,barcode:file.barcode,sha256:file.sha256}};
 });
 if(docs.length!==p.packages.length)throw Error('Het aantal labels sluit niet aan op het aantal bewaarde pakketten.');
 docs.push({id:bundleId,ownerId:orderId,category:'other',name:'PACKS_'+attemptId+'_alle_labels.pdf',type:'application/pdf',size:bundle.size,date:today,createdAt:now,shippingLabel:supplierLabelMetadata(info),packsLabelBundle:{environment,attemptId,shipmentId,sha256:bundle.sha256,originalIds:docs.map(d=>d.id),...(planning?{planning:structuredClone(planning)}:{})}});
 for(const doc of docs){const prior=state.documents.find(d=>d.id===doc.id);if(prior){const identity=d=>JSON.stringify([d.ownerId,d.size,d.packsLabelSource||d.packsLabelBundle]);if(identity(prior)!==identity(doc))throw Error('Een bestaand labelbestand wijkt af; niet overschrijven.');}else state.documents.push(doc);}
 order.supplierFulfilment.labelDocumentId=bundleId;validatePacksApiLabels(state);return {alreadySaved:false,bundleId};
}
