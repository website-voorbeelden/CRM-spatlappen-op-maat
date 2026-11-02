// Read-only commercial scope. A quote, link, invoice or phase is never receipt
// evidence. Invalid/future receipts stay visible for correction, not as sales.
const day=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function financialSalesScope(state,{orders=state.orders,today,range={}}){
 if(!day(today))throw Error('De datum voor het financiële overzicht is niet geldig.');
 const known=new Set(state.orders.map(order=>order.id)),received=new Map(),invalid=new Set(),payments=[];
 for(const payment of state.payments){
  if(!known.has(payment.orderId))continue;
  if(!Number.isSafeInteger(payment.amount)||payment.amount<0||payment.amount>0&&(!day(payment.date)||payment.date>today)){invalid.add(payment.orderId);continue;}
  if(payment.amount===0)continue;
  received.set(payment.orderId,(received.get(payment.orderId)||0)+payment.amount);
  if((!range.start||payment.date>=range.start)&&(!range.end||payment.date<=range.end))payments.push(payment);
 }
 const sales=[],pipeline=[],review=[];
 for(const order of orders){if(invalid.has(order.id))review.push(order);else if((received.get(order.id)||0)>0)sales.push(order);else pipeline.push(order);}
 return {sales,pipeline,review,payments,invalidOrderIds:[...invalid]};
}
