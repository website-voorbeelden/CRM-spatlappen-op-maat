export function batchPackingRows(state,purchaseId){
 const p=(state.purchases||[]).find(p=>p.id===purchaseId);if(!p)throw Error('Deze batch bestaat niet meer.');
 return state.orders.filter(o=>o.purchaseId===purchaseId).map(o=>{
  const c=state.customers.find(c=>c.id===o.customerId),address=o.delivery?.source==='custom'?o.delivery:{recipient:c?.shippingRecipient||c?.contact||c?.company,address:c?.shippingAddress,country:c?.shippingCountry||c?.country};
  const existing=state.documents.filter(d=>d.ownerId===o.id&&(d.generated?.kind||d.category)==='packing'&&(/\.pdf$/i.test(d.name||'')||d.type==='application/pdf')).sort((a,b)=>(b.generated?.revision||1)-(a.generated?.revision||1)||String(b.createdAt||b.date||'').localeCompare(String(a.createdAt||a.date||'')))[0];
  const missing=[];
  if(o.archived||o.deliveredDate||o.stage==='Afgerond')missing.push('Order al afgehandeld');
  if(p.archived)missing.push('Batch gearchiveerd');
  if(!p.orderedDate&&!['Besteld','In productie','Onderweg','Binnen in Nederland'].includes(p.status))missing.push('Bestelling nog niet bevestigd');
  if(!['pickup','shipping','delivery'].includes(o.fulfilmentMethod))missing.push('Leverwijze nog afspreken');
  if(!address.address?.trim()||!address.country?.trim()||!address.recipient?.trim())missing.push('Aflevergegevens voor pakbon nog aanvullen');
  if(!(o.items||[]).length||(o.items||[]).some(i=>!Number.isInteger(i.quantity)||i.quantity<1||!i.description?.trim()))missing.push('Producten / aantallen controleren');
  return {order:o,customer:c,existing,missing,ready:!missing.length};
 });
}
