// Shared receipt import; the provider is queried only by existing server adapters.
export function tikkiePaymentDay(when,timeZone){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(when));
 const get=key=>parts.find(p=>p.type===key).value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function applyTikkiePayments(data,order,links,{uid,timeZone}){
 let added=0;
 order.paymentLinks??=[];
 for(const link of links){
  const existing=order.paymentLinks.find(l=>l.id===link.id);
  if(existing)Object.assign(existing,link);else order.paymentLinks.push(link);
  for(const payment of link.payments||[]){
   if(!Number.isSafeInteger(payment.amountInCents)||payment.amountInCents<=0||!payment.paymentToken)throw Error('Tikkie gaf een ongeldige betaling terug.');
   const externalId=`tikkie:${payment.paymentToken}`,old=data.payments.find(p=>p.externalId===externalId);
   const correction=(data.paymentCorrections||[]).find(c=>c.kind==='remove'&&!c.restoredAt&&c.before?.externalId===externalId);
   if(correction){if(correction.before.orderId!==order.id)throw Error('Deze gecorrigeerde Tikkie-betaling hoort bij een andere order.');continue;}
   if(old){if(old.orderId!==order.id)throw Error('Deze Tikkie-betaling staat al bij een andere order.');continue;}
   data.payments.push({id:uid(),orderId:order.id,externalId,paymentLinkId:link.id,source:'tikkie',
    amount:payment.amountInCents,date:tikkiePaymentDay(payment.createdAt,timeZone),
    receivedAt:payment.createdAt,reference:`Tikkie · ${payment.description||link.description}`});
   added++;
  }
 }
 return added;
}
