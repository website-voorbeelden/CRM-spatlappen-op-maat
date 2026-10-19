export const productImageTypes=new Set(['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml']);
export function primaryImageInfo(state,orderId,itemId){
 const order=state.orders.find(o=>o.id===orderId),item=order?.items.find(i=>i.id===itemId);if(!item)throw Error('Het product bestaat niet meer.');
 const images=state.documents.filter(d=>d.ownerId===orderId&&d.itemId===itemId&&productImageTypes.has(d.type));
 return {order,item,images,signature:JSON.stringify([item.primaryImageId||'',images])};
}
export function choosePrimaryImage(state,orderId,itemId,imageId,expected){
 const info=primaryImageInfo(state,orderId,itemId);if(info.signature!==expected)throw Error('De afbeeldingen of hoofdkeuze zijn gewijzigd. Open de keuze opnieuw.');
 if(!info.images.some(d=>d.id===imageId))throw Error('Kies een afbeelding van dit product.');
 info.item.primaryImageId=imageId;
}
