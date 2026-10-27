const exportKind=kind=>{if(!['png','pdf'].includes(kind))throw Error('Kies klantpreview of vector-PDF.');return kind;};
export function savedDesignExportUrl(id,kind,mode='local'){
 const url=new URL('/spatlap-preview.html',location.origin);url.searchParams.set('designExport',exportKind(kind));url.searchParams.set('savedDesign',id);
 if(mode==='cloud')url.searchParams.set('storage','cloud');return url.href;
}
export function productDesignExportUrl(orderId,itemId,kind,mode='local',variantId=''){
 const url=new URL('/spatlap-preview.html',location.origin);if(variantId)url.searchParams.set('variant',variantId);url.searchParams.set('designExport',exportKind(kind));url.searchParams.set('orderId',orderId);url.searchParams.set('itemId',itemId);
 if(mode==='cloud')url.searchParams.set('storage','cloud');return url.href;
}
