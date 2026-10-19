// Pure formatting and arithmetic shared by the payment-link and email forms.
export function paymentBasis(order, document, currentTotal) {
 const p=document?.generated?.payload;
 if(!p)return currentTotal;
 const net=(p.packagePrice!=null?p.packagePrice:p.items.reduce((sum,i)=>sum+i.quantity*(i.price||0),0))+(p.shippingCharge||0);
 return net+Math.round(net*p.vat/100);
}
export function requestedAmount(total, percentage){return Math.round(total*percentage/100);}
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
export function defaultMail({customer,order,document,link,euro,companyWebsite='Spatlappenopmaat.nl'}){
 const number=order.sourceNumber||order.number;
 const name=customer?.contact||customer?.company||'';
 const title={quote:'Offerte',confirmation:'Orderbevestiging',proforma:'Proforma factuur',invoice:'Factuur'}[document?.generated?.kind||document?.category]||'Document',kind=title.toLowerCase();
 const reference=document?.generated?.number||`order #${number}`;
 const subject=document?`${title} ${reference} · ${companyWebsite}`:`Order #${number} · ${companyWebsite}`;
 const body=[`Beste ${name||'klant'},`,'',document?`Bijgevoegd vind je de ${kind} voor je bestelling.`:`Hierbij de informatie over je bestelling #${number}.`,
  ...(link?['',`Je kunt ${euro(link.amountInCents)} betalen via deze Tikkie:`,link.url,`De betaallink is geldig tot ${new Date(link.expiryDate+'T12:00:00').toLocaleDateString('nl-NL')}.`]:[]),
  '', 'Heb je vragen? Laat het gerust weten.','', 'Met vriendelijke groet,',companyWebsite].join('\n');
 return {to:(kind==='offerte'?customer?.email||customer?.invoiceEmail:customer?.invoiceEmail||customer?.email)||'',subject,body};
}
