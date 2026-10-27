// Variant metadata only. Artwork remains in the existing transactional file store.
export function productDesignVariants(item){
 if(Array.isArray(item.designVariants))return item.designVariants;
 if(!item.designDocumentId)return [];
 return [{id:item.designId||item.designDocumentId,name:'Ontwerp A',designId:item.designId||item.designDocumentId,documentId:item.designDocumentId,previewId:item.designPreviewId||'',updatedAt:item.designUpdatedAt||'',legacy:true,revisions:[]}];
}
export function validDesignSourceBasis(basis){return Boolean(basis&&Number.isSafeInteger(basis.width)&&basis.width>0&&Number.isSafeInteger(basis.height)&&basis.height>0&&(basis.quantity===null||Number.isSafeInteger(basis.quantity)&&basis.quantity>0));}
export function variantMatchesProduct(item,variant){const basis=variant.sourceBasis;return validDesignSourceBasis(basis)&&basis.width===item.width&&basis.height===item.height&&(basis.quantity===null||basis.quantity===item.quantity);}
export function designVariantSignature(order,item){return JSON.stringify([order.customerId,item.id,item.width,item.height,item.quantity,productDesignVariants(item),item.designFinalVariantId||'',item.designFinalUpdatedAt||'',item.designFinalBasis||'']);}
export const designVariantBasis=(item,variant)=>JSON.stringify([item.width,item.height,item.quantity,variant.documentId,variant.previewId]);
export function currentFinalVariant(item){return productDesignVariants(item).find(v=>v.id===item.designFinalVariantId&&v.updatedAt===item.designFinalUpdatedAt&&item.designFinalBasis===designVariantBasis(item,v)&&variantMatchesProduct(item,v))||null;}
export function orderDesignApproved(state,order){
 const managed=order.items.filter(item=>Array.isArray(item.designVariants)&&item.designVariants.length);
 if(managed.some(item=>!currentFinalVariant(item)))return false;
 const legacy=order.items.filter(item=>!Array.isArray(item.designVariants)||!item.designVariants.length);
 const orderApproved=Boolean(order.approvedDate&&Number.isFinite(Date.parse(order.approvedDate))),approved=(state.documents||[]).filter(d=>d.ownerId===order.id&&d.imageRole==='approved');
 if(!managed.length)return orderApproved||approved.length>0;
 return legacy.every(item=>orderApproved||approved.some(d=>d.itemId===item.id));
}
export function selectFinalVariant(state,orderId,itemId,variantId,expected,{sourceBasis,now=new Date().toISOString()}={}){
 const order=state.orders.find(o=>o.id===orderId),item=order?.items.find(i=>i.id===itemId);
 if(!item||designVariantSignature(order,item)!==expected)throw Error('Product of ontwerpen zijn gewijzigd. Open de keuze opnieuw.');
 const variants=productDesignVariants(item),variant=variants.find(v=>v.id===variantId);
 if(!variant||!state.documents.some(d=>d.id===variant.documentId&&d.ownerId===orderId&&d.itemId===itemId&&d.internalDesign)||!state.documents.some(d=>d.id===variant.previewId&&d.ownerId===orderId&&d.itemId===itemId&&d.productDesignPreview))throw Error('Het ontwerp of voorbeeld ontbreekt. Open en bewaar het ontwerp opnieuw.');
 if(!variantMatchesProduct(item,{sourceBasis}))throw Error('De opgeslagen ontwerpmaat of het aantal wijkt af van dit product. Open deze variant, controleer de nieuwe maat en bewaar eerst een nieuwe versie.');
 variant.sourceBasis={...sourceBasis};
 for(const document of state.documents)if(document.ownerId===orderId&&document.itemId===itemId&&document.imageRole==='approved'){document.imageRole='reference';document.approvalSupersededAt=now;}
 const preview=state.documents.find(d=>d.id===variant.previewId);preview.imageRole='approved';preview.markedApprovedAt=now;
 item.designVariants=structuredClone(variants);item.designFinalVariantId=variant.id;item.designFinalUpdatedAt=variant.updatedAt;item.designFinalBasis=designVariantBasis(item,variant);item.designFinalChosenAt=now;
 Object.assign(item,{designId:variant.designId,designDocumentId:variant.documentId,designPreviewId:variant.previewId,designUpdatedAt:variant.updatedAt,primaryImageId:variant.previewId});
 state.activities.unshift({id:crypto.randomUUID(),message:'Definitief ontwerp gekozen: '+variant.name+' · order #'+(order.sourceNumber||order.number),time:now});
}
export function clearFinalVariant(state,orderId,itemId,expected,{now=new Date().toISOString()}={}){
 const order=state.orders.find(o=>o.id===orderId),item=order?.items.find(i=>i.id===itemId);if(!item||designVariantSignature(order,item)!==expected)throw Error('Product of ontwerpkeuze is gewijzigd. Open de keuze opnieuw.');
 // A changed product can already have invalidated the choice; clear its old
 // approval marker too, while retaining every file and physical stage.
 const final=productDesignVariants(item).find(v=>v.id===item.designFinalVariantId),preview=final&&state.documents.find(d=>d.id===final.previewId);if(preview?.imageRole==='approved'){preview.imageRole='reference';preview.approvalRevokedAt=now;}
 for(const key of ['designFinalVariantId','designFinalUpdatedAt','designFinalBasis','designFinalChosenAt'])delete item[key];
 state.activities.unshift({id:crypto.randomUUID(),message:'Definitieve ontwerpkeuze opgeheven · order #'+(order.sourceNumber||order.number),time:now});
}
export function validateDesignVariants(state){
 const documents=new Map(state.documents.map(document=>[document.id,document]));
 const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
 for(const order of state.orders)for(const item of order.items){
  if(item.designVariants===undefined)continue;
  const variants=item.designVariants;
  if(!Array.isArray(variants)||!variants.length||variants.length>100||new Set(variants.map(v=>v?.id)).size!==variants.length)throw Error('Ongeldige ontwerpvarianten.');
  for(const variant of variants){
   if(!variant||![variant.id,variant.designId,variant.documentId].every(validId)||typeof variant.name!=='string'||!variant.name.trim()||variant.name.length>100||!Array.isArray(variant.revisions)||variant.revisions.length>500)throw Error('Controleer naam en bestanden van de ontwerpvariant.');
   for(const version of [variant,...variant.revisions]){
    // Only explicitly retained legacy versions may lack their old timestamp or
    // PNG. New saves always require a complete JSON/PNG pair.
    const legacy=version.legacy===true;
    if(!validId(version.documentId)||!(validId(version.previewId)||legacy&&version.previewId==='')||!(Number.isFinite(Date.parse(version.updatedAt))||legacy&&version.updatedAt==='')||version.sourceBasis!==undefined&&!validDesignSourceBasis(version.sourceBasis))throw Error('Ongeldige ontwerprevisie.');
    const artwork=documents.get(version.documentId),preview=documents.get(version.previewId);
    if(!artwork||artwork.ownerId!==order.id||artwork.itemId!==item.id||!artwork.internalDesign||!preview&&!legacy||preview&&(preview.ownerId!==order.id||preview.itemId!==item.id||!preview.productDesignPreview))throw Error('Een ontwerpversie of voorbeeld ontbreekt bij het product.');
   }
  }
  if(item.designFinalVariantId&&!variants.some(v=>v.id===item.designFinalVariantId))throw Error('De definitieve ontwerpkeuze ontbreekt.');
  if(item.designFinalUpdatedAt&&!variants.some(v=>v.id===item.designFinalVariantId&&v.updatedAt===item.designFinalUpdatedAt))throw Error('Bevestig de gewijzigde definitieve ontwerpkeuze opnieuw.');
 }
}
