import {orderExecution} from '../../shared/order-progress.js?v=feedback-followup-20261028';
import {orderPaymentWait} from '../../shared/order-payment-wait.js?v=payment-wait-20261028';
import {keyFactsMarkup} from '../workspace/key-facts.js?v=feedback-five-20261029';

const calendarDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;

// Presentation of existing receipts and planning only. No amounts, dates or
// workflow facts are registered here, and an unknown price never means paid.
export function orderPaymentFact(context,order,totals){
 const complete=totals.priceKnown&&order.shippingKnown===true;
 const fullyPaid=complete&&totals.total>0&&totals.paid>=totals.total;
 const payment={label:'Betaling',value:'Nog geen betaling',detail:'Orderprijs nog invullen',tone:'neutral',tab:'payments'};
 if(!Number.isSafeInteger(totals.paid)||(context.state.payments||[]).some(p=>p.orderId===order.id&&!Number.isSafeInteger(p.amount)))return {...payment,value:'Betalingen controleren',detail:'Een ontvangstbedrag is ongeldig; controleer de geregistreerde betalingen.',tone:'warning'};
 if(totals.paid<0){payment.value='Betalingen controleren';payment.detail='Netto ontvangen '+context.euro(totals.paid);payment.tone='warning';}
 else if(!complete){
  if(totals.paid>0){payment.value='Betaling ontvangen';payment.detail=context.euro(totals.paid)+' incl. btw ontvangen · '+(totals.priceKnown?'verzendprijs':'orderprijs')+' nog invullen';}
  else if(totals.priceKnown)payment.detail='Verzendprijs nog invullen';
 }else if(totals.balance<0){payment.value='Te veel ontvangen';payment.detail=context.euro(-totals.balance)+' incl. btw meer dan het orderbedrag';payment.tone='warning';}
 else if(fullyPaid){payment.value='Volledig betaald';payment.detail=context.euro(totals.paid)+' incl. btw ontvangen';payment.tone='success';}
 else if(totals.total===0){payment.value='Geen betaling nodig';payment.detail='Orderbedrag '+context.euro(0)+' incl. btw';}
 else if(totals.paid>0){payment.value='Deels betaald';payment.detail=context.euro(totals.paid)+' ontvangen · '+context.euro(totals.balance)+' open (incl. btw)';payment.tone='warning';}
 else{payment.value='Niet betaald';payment.detail=context.euro(totals.total)+' incl. btw open';payment.tone='warning';}
 return payment;
}

export function orderKeyFacts(context,order,totals){
 const complete=totals.priceKnown&&order.shippingKnown===true;
 const fullyPaid=complete&&totals.total>0&&totals.paid>=totals.total;
 const execution=orderExecution(order),delivered=calendarDate(order.deliveredDate),today=context.today(),payment=orderPaymentFact(context,order,totals);
 const wait={...orderPaymentWait(context.state,order,{today}),tone:'neutral',tab:'payments'};

 const window=context.deliveryWindow(order);
 // A date derived from full payment needs a complete price too. Fixed agreed
 // dates and other existing lead-time bases remain independent of that guard.
 const fixed=Boolean(order.expectedDateFrom||order.expectedDateTo);
 const paymentPending=!fixed&&order.leadTimeMinWeeks!=null&&(order.leadTimeBasis||'payment')==='payment'&&!fullyPaid;
 const from=!paymentPending&&calendarDate(window.from)?window.from:'';
 const to=!paymentPending&&calendarDate(window.to)?window.to:'';
 const range=from&&to&&from!==to?context.date(from)+' – '+context.date(to):context.date(to||from);
 const delivery={label:'Uitvoering & levering',value:execution.started?execution.label:from||to?'Levering gepland':'Nog niet ingepland',detail:from||to?'Levering '+range:window.pending||paymentPending?window.terms:'Nog geen leverdatum',tone:'neutral',tab:'delivery'};
 if(delivered){delivery.value='Geleverd';delivery.detail='Op '+context.date(order.deliveredDate);delivery.tone='success';}
 else if(execution.delivered){delivery.value='Afgerond';delivery.detail='Leverdatum nog vastleggen';}
 else if(to&&calendarDate(today)&&to<today){delivery.detail='Leverdatum verstreken · '+context.date(to);delivery.tone='warning';}
 else if(calendarDate(order.shippedDate))delivery.detail='Verzonden op '+context.date(order.shippedDate)+(to?' · verwacht '+context.date(to):'');
 const quantity=order.items.reduce((sum,item)=>sum+(Number.isFinite(item.quantity)?item.quantity:0),0);
 const noPayment=totals.paid===0&&!(context.state.payments||[]).some(p=>p.orderId===order.id&&(!Number.isSafeInteger(p.amount)||p.amount<0))&&!(context.state.payments||[]).some(p=>p.orderId===order.id&&p.amount>0);
 const relevantPayment=noPayment?(totals.priceKnown?{label:'Verkoopprijs',value:context.euro(order.shippingKnown===true?totals.net:context.productRevenue(order))+' excl. btw',detail:order.shippingKnown===true?'Producten en verzending':'Productprijs bekend · verzending nog aanvullen',tone:'neutral',tab:'costs'}:{label:'Producten',value:quantity?quantity+' stuks':'Aanvraag',detail:order.items.length?order.items.length+' productregel'+(order.items.length===1?'':'s'):'Productgegevens nog aanvullen',tone:'neutral',tab:'overview'}):payment;
 const start=calendarDate(order.date)?order.date:'',age=start&&calendarDate(today)&&start<=today?Math.round((Date.parse(today+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000):null;
 const relevantWait=noPayment?{label:'Sinds aanvraag',value:age==null?'Datum aanvullen':age+' '+(age===1?'dag':'dagen'),detail:start?'Aanvraag '+context.date(start):'Aanvraagdatum nog onbekend',tone:'neutral',tab:'overview'}:wait;
 const hasDelivery=execution.started||from||to||delivered||execution.delivered;
 const relevantDelivery=!hasDelivery?{label:totals.priceKnown||!noPayment?'Producten':'Klant',value:totals.priceKnown||!noPayment?(quantity?quantity+' stuks':'Gegevens aanvullen'):(context.customer(order.customerId)?.company||'Klant onbekend'),detail:totals.priceKnown||!noPayment?order.items.length+' productregel'+(order.items.length===1?'':'s'):(order.inquiryProduct||'Nieuwe aanvraag'),tone:'neutral',tab:'overview'}:delivery;
 return [relevantPayment,relevantWait,relevantDelivery];
}

export function orderKeyFactsMarkup(context,order,totals){
 return keyFactsMarkup(orderKeyFacts(context,order,totals).map(fact=>({...fact,href:'#orders/'+order.id+'/'+fact.tab})),{esc:context.esc,label:'Order in één oogopslag',inset:true});
}
