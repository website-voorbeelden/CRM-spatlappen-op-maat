import {productDesignVariants,currentFinalVariant} from './product-design-variants.js?v=batch1-variants-20261026';
const references=(value,ids)=>typeof value==='string'?ids.has(value):Array.isArray(value)?value.some(v=>references(v,ids)):value&&typeof value==='object'&&Object.values(value).some(v=>references(v,ids));
// Opt-in only. Never removes the chosen design, approval evidence, attachments
// referenced elsewhere, or files whose ownership cannot be proven.
export function cleanupOrderedVariants(state,{now=new Date().toISOString()}={}){
 const removed=[];
 for(const order of state.orders){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(order.supplierOrderedDate||''))continue;
  for(const item of order.items){
   const final=currentFinalVariant(item);if(!item.autoPruneDesignVariants||!final)continue;
   const variants=productDesignVariants(item),deleted=[];
   for(const variant of variants.filter(v=>v.id!==final.id)){
    const versions=[variant,...(variant.revisions||[])],ids=new Set(versions.flatMap(v=>[v.documentId,v.previewId]).filter(Boolean)),docs=state.documents.filter(d=>ids.has(d.id));
    if(docs.length!==ids.size||docs.some(d=>d.ownerId!==order.id||d.itemId!==item.id||!d.internalDesign&&!d.productDesignPreview||d.imageRole==='approved'||d.markedApprovedAt||d.approvalSupersededAt||d.approvalRevokedAt))continue;
    const otherState={...state,documents:state.documents.filter(d=>!ids.has(d.id)),orders:state.orders.map(o=>o.id!==order.id?o:{...o,items:o.items.map(i=>i.id!==item.id?i:{...i,designVariants:variants.filter(v=>v.id!==variant.id)})})};
    if(references(otherState,ids))continue;
    deleted.push(variant);removed.push(...ids);
   }
   if(deleted.length){const names=deleted.map(v=>v.name);item.designVariants=variants.filter(v=>!deleted.includes(v));item.designCleanupHistory=[...(item.designCleanupHistory||[]),{at:now,variantNames:names,keptVariantId:final.id}].slice(-100);state.activities.unshift({id:crypto.randomUUID(),message:'Ongebruikte ontwerpvoorstellen opgeruimd na bestellen: '+names.join(', '),time:now});}
  }
 }
 const ids=new Set(removed);state.documents=state.documents.filter(d=>!ids.has(d.id));return [...ids];
}
