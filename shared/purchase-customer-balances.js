// Read-only guard around the CRM's existing totals. Never creates receipts,
// assumes a free delivery, or changes financial source values.
const cents=value=>Number.isSafeInteger(value)&&value>=0;
export function customerOrderBalance(state,order,total){
 const receipts=(state.payments||[]).filter(p=>p.orderId===order.id),priceKnown=total.priceKnown===true||total.known===true;
 const balance=total.balance??total.total-total.paid;
 const receiptTotal=receipts.reduce((sum,p)=>sum+p.amount,0);
 const productBasis=order.items.length>0&&order.items.every(i=>Number.isSafeInteger(i.quantity)&&i.quantity>0&&(i.price==null||cents(i.price)))&&(order.packagePrice==null||cents(order.packagePrice));
 const valid=(!priceKnown||productBasis)&&(order.shippingKnown!==true||cents(order.shippingCharge))&&cents(receiptTotal)&&total.paid===receiptTotal&&cents(total.total)&&cents(total.paid)&&Number.isSafeInteger(balance)&&balance===total.total-total.paid&&receipts.every(p=>cents(p.amount));
 const complete=valid&&priceKnown&&order.shippingKnown===true;
 const category=!valid?'attention':!complete?'unknown':balance>0?'open':balance<0?'credit':total.total===0?'zero':'paid';
 const label={attention:'Bedragen controleren',unknown:'Prijsafspraak aanvullen',open:'Nog te betalen',credit:'Te veel ontvangen',zero:'Geen betaling nodig',paid:'Volledig betaald'}[category];
 return {valid,complete,category,label,paid:cents(total.paid)?total.paid:null,total:complete?total.total:null,balance:complete?balance:null,open:complete?Math.max(0,balance):null,credit:complete?Math.max(0,-balance):null,priceKnown,shippingKnown:order.shippingKnown===true};
}
export function purchaseCustomerBalances(state,purchase,{totals}){
 const rows=state.orders.filter(order=>order.purchaseId===purchase.id).map(order=>({order,customer:state.customers.find(c=>c.id===order.customerId),balance:customerOrderBalance(state,order,totals(order))}));
 const sum=key=>{const value=rows.reduce((n,r)=>n+(r.balance[key]??0),0);return cents(value)?value:null;};
 return {rows,outstanding:sum('open'),credit:sum('credit'),paid:rows.filter(r=>['paid','credit'].includes(r.balance.category)).length,zero:rows.filter(r=>r.balance.category==='zero').length,unknown:rows.filter(r=>!r.balance.complete).length};
}
