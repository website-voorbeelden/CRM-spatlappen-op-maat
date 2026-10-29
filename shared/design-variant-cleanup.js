import {productDesignVariants,currentFinalVariant} from './product-design-variants.js?v=batch1-variants-20261026';
const references=(value,ids)=>typeof value==='string'?ids.has(value):Array.isArray(value)?value.some(v=>references(v,ids)):value&&typeof value==='object'&&Object.values(value).some(v=>references(v,ids));
const orderedDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const protectedDocument=d=>d.generated||d.imageRole==='approved'||d.markedApprovedAt||d.approvalSupersededAt||d.approvalRevokedAt;
// The confirmation and transaction share this read-only plan. Missing ownership
// or approval evidence always keeps a variant; no bucket/orphan inference.
export function designVariantCleanupPlan(state,order,item){
 const variants=productDesignVariants(item),final=currentFinalVariant(item),removable=[],retained=[];
 const finalDocs=final&&[state.documents.find(d=>d.id===final.documentId&&d.ownerId===order.id&&d.itemId===item.id&&d.internalDesign),state.documents.find(d=>d.id===final.previewId&&d.ownerId===order.id&&d.itemId===item.id&&d.productDesignPreview)];
 for(const variant of variants.filter(v=>v.id!==final?.id)){
  const versions=[variant,...(variant.revisions||[])],ids=new Set(versions.flatMap(v=>[v.documentId,v.previewId]).filter(Boolean)),docs=state.documents.filter(d=>ids.has(d.id));let reason='';
  if(!final||!finalDocs.every(Boolean))reason='Geen complete, geldige definitieve ontwerpkeuze.';
  else if(!ids.size||docs.length!==ids.size||docs.some(d=>d.ownerId!==order.id||d.itemId!==item.id||!d.internalDesign&&!d.productDesignPreview))reason='Bestandskoppeling of eigendom is niet volledig bekend.';
  else if(docs.some(protectedDocument))reason='Bevat goedkeuringsbewijs of een beschermd document.';
  else{
   const otherState={...state,documents:state.documents.filter(d=>!ids.has(d.id)),orders:state.orders.map(o=>o.id!==order.id?o:{...o,items:o.items.map(i=>i.id!==item.id?i:{...i,designVariants:variants.filter(v=>v.id!==variant.id)})})};
   if(references(otherState,ids))reason='Nog in gebruik bij een andere versie, hoofdafbeelding, mail of dossierverwijzing.';
  }
  if(reason)retained.push({id:variant.id,name:variant.name,reason});
  else removable.push({id:variant.id,name:variant.name,fileIds:[...ids],versionCount:versions.length,bytes:docs.reduce((n,d)=>n+(Number.isSafeInteger(d.size)&&d.size>=0?d.size:0),0),unknownSize:docs.some(d=>!Number.isSafeInteger(d.size)||d.size<0)});
 }
 const allIds=new Set(variants.flatMap(v=>[v,...(v.revisions||[])].flatMap(v=>[v.documentId,v.previewId]).filter(Boolean)));
 return {ordered:orderedDate(order.supplierOrderedDate),finalName:final?.name||'',removable,retained,basis:JSON.stringify([order.customerId,order.supplierOrderedDate||'',item,removable,retained,state.documents.filter(d=>allIds.has(d.id))])};
}
// Opt-in only; called within the existing state/files transaction. Physical
// cloud removal remains a separate deliberate action after manifest retirement.
export function cleanupOrderedVariants(state,{now=new Date().toISOString()}={}){
 const removed=new Set();
 for(const order of state.orders)for(const item of order.items){
  if(!item.autoPruneDesignVariants)continue;
  const plan=designVariantCleanupPlan(state,order,item);if(!plan.ordered||!plan.removable.length)continue;
  const deleting=new Set(plan.removable.map(v=>v.id)),names=plan.removable.map(v=>v.name),final=currentFinalVariant(item);
  item.designVariants=productDesignVariants(item).filter(v=>!deleting.has(v.id));
  for(const entry of plan.removable)for(const id of entry.fileIds)removed.add(id);
  item.designCleanupHistory=[...(item.designCleanupHistory||[]),{at:now,variantNames:names,keptVariantId:final.id}].slice(-100);
  state.activities.unshift({id:crypto.randomUUID(),message:'Ongebruikte ontwerpvoorstellen opgeruimd na bestellen: '+names.join(', '),time:now});
 }
 state.documents=state.documents.filter(d=>!removed.has(d.id));return [...removed];
}
