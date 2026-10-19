// Reuse the CRM's monetary projection; never sum supplier payments as expenses.
export function batchEconomics(state,purchaseId,{totals,economics,purchaseInfo}){
 const purchase=(state.purchases||[]).find(p=>p.id===purchaseId);if(!purchase)throw Error('Deze batch bestaat niet meer.');
 const orders=state.orders.filter(o=>o.purchaseId===purchaseId),rows=orders.map(o=>({order:o,total:totals(o),cost:economics(o)}));
 const info=purchaseInfo?.(purchase),allocated=rows.reduce((sum,r)=>sum+r.cost.shared,0),unallocated=Math.max(0,(info?.shared??allocated)-allocated);
 const sum=fn=>rows.reduce((n,r)=>n+fn(r),0),revenue=sum(r=>r.total.net),cost=sum(r=>r.cost.cost)+unallocated,revenueKnown=rows.every(r=>r.total.priceKnown&&r.order.shippingKnown===true);
 return {purchase,orders,rows,revenue,cost,revenueKnown,provisional:!revenueKnown||info?.sharedKnown===false||rows.some(r=>r.cost.provisional),productCost:sum(r=>r.cost.product),sharedCost:sum(r=>r.cost.shared)+unallocated,otherCost:sum(r=>(r.order.extraCosts??0)+(r.cost.namedTotal??0)),domesticCost:sum(r=>r.order.shippingActual??0),domesticKnown:rows.every(r=>r.order.shippingActual!=null),profit:revenue-cost,missing:[...new Set([...rows.flatMap(r=>r.cost.missing||[]),...(info?.missingShared||[])])]};
}
export function freightScenario(projection,cents){
 if(!Number.isSafeInteger(cents)||cents<0)throw Error('Vul een geldige transportaanname in.');
 if(!projection.orders.length)throw Error('Koppel eerst klantorders aan deze batch.');
 const cost=projection.cost-(projection.purchase.freight??0)+cents;
 return {cost,profit:projection.revenueKnown?projection.revenue-cost:null,provisional:projection.provisional};
}
export function deliveryScenario({kilometres,hours,perKm,perHour,parcelTotal}){
 if([kilometres,hours,perKm,perHour,parcelTotal].some(n=>!Number.isFinite(n)||n<0)||kilometres>100000||hours>10000||[perKm,perHour,parcelTotal].some(n=>!Number.isSafeInteger(n)))throw Error('Vul alle aannames in als niet-negatieve bedragen, afstand en tijd.');
 const self=Math.round(kilometres*perKm+hours*perHour);if(!Number.isSafeInteger(self))throw Error('De berekende kosten zijn te groot.');return {self,parcel:parcelTotal,difference:parcelTotal-self};
}
export function deliveryStops(state,purchaseId){return state.orders.filter(o=>o.purchaseId===purchaseId&&!o.archived&&!o.deliveredDate&&o.stage!=='Afgerond').map(o=>{
 const c=state.customers.find(c=>c.id===o.customerId),address=o.delivery?.source==='custom'?o.delivery:{recipient:c?.shippingRecipient||c?.contact||c?.company,address:c?.shippingAddress,country:c?.shippingCountry||c?.country};
 return {order:o,customer:c,address,eligible:['shipping','delivery'].includes(o.fulfilmentMethod)&&Boolean(address.address?.trim()&&address.country?.trim()&&address.recipient?.trim())};
});}
