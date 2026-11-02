// Read-only presentation order. Resolve one key per dossier, outside the
// comparator; unrelated sort keys never depend on financial projections.
const text=value=>value==null?'':String(value);
const compare=(a,b)=>a.localeCompare(b,'nl',{numeric:true});
const byNumber=(a,b)=>compare(text(b?.sourceNumber||b?.number),text(a?.sourceNumber||a?.number))||compare(text(a?.id),text(b?.id));

export function sortOrderList(list,{sort,ascending=false,customer,totals,openedAt,onError}={}){
 let unavailable=0;
 const rows=list.map(order=>{
  let value=null;
  try{
   if(sort==='opened')value=openedAt(order.id);
   else if(sort==='number')value=order.sourceNumber||order.number;
   else if(sort==='customer')value=customer(order.customerId)?.company;
   else if(sort==='net'){
    const amount=totals(order);
    if(amount.priceKnown&&Number.isSafeInteger(amount.net))value=amount.net;
   }else value=order[sort];
   if(typeof value==='number'&&!Number.isFinite(value))value=null;
  }catch(error){unavailable++;try{onError?.(error,'order-sort-key');}catch{}}
  return {order,value};
 });
 rows.sort((a,b)=>{
  // Unknown is never a fabricated zero and stays last in either direction.
  const aUnknown=a.value==null||a.value==='',bUnknown=b.value==null||b.value==='';
  if(aUnknown!==bUnknown)return aUnknown?1:-1;
  let result=0;
  if(!aUnknown)result=typeof a.value==='number'&&typeof b.value==='number'?a.value-b.value:compare(text(a.value),text(b.value));
  if(result)return result*(sort==='opened'||!ascending?-1:1);
  if(sort==='opened')return compare(text(b.order?.date),text(a.order?.date))||byNumber(a.order,b.order);
  return byNumber(a.order,b.order);
 });
 return {orders:rows.map(row=>row.order),unavailable};
}
