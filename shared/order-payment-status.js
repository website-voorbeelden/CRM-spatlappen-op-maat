// Labels only, using already calculated totals. Never register a payment or
// infer a final balance while the full customer price is not known.
export function orderPaymentStatusLabel(order,{priceKnown,total,paid,balance=total-paid}){
 if(!priceKnown)return 'Prijs nog onbekend';
 if(order.shippingKnown!==true)return 'Verzendprijs nog onbekend';
 return total===0&&paid===0?'Geen bedrag':balance<0?'Te veel ontvangen':balance===0?'Betaald':paid>0?'Deels betaald':'Onbetaald';
}
