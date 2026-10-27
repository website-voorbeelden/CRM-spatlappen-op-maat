// Pure formatting and arithmetic shared by the payment-link and email forms.
export function paymentBasis(order, document, currentTotal) {
 const p=document?.generated?.payload;
 if(!p)return currentTotal;
 const net=(p.packagePrice!=null?p.packagePrice:p.items.reduce((sum,i)=>sum+i.quantity*(i.price||0),0))+(p.shippingCharge||0);
 return net+Math.round(net*p.vat/100);
}
export function requestedAmount(total, percentage){return Math.round(total*percentage/100);}
export {tikkiePaymentDay,applyTikkiePayments} from '../../shared/tikkie-payments.js?v=mobile-push-20261023';
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
