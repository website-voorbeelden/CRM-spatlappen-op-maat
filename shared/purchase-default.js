// A suggestion for NEW requests only; existing order/purchase relationships are never moved.
export const isOpenPurchase=p=>Boolean(p&&p.status==='Verzamelen'&&!p.archived&&!p.shippedDate&&!p.arrivedDate);
export function preferredOpenPurchase(purchases,companyId){
 if(companyId!=='spatlappen')return null;
 const open=(purchases||[]).filter(isOpenPurchase);
 const chosen=open.filter(p=>p.defaultForNewOrders);return chosen.length===1?chosen[0]:!chosen.length&&open.length===1?open[0]:null;
}
