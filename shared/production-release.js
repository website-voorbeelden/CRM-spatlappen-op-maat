import {orderDesignApproved} from './product-design-variants.js?v=batch1-variants-20261026';
import {inquiryRequirements} from './inquiries.js?v=ui-batch234-20261027';
export function productionReleaseInfo(state,o,companyId,{payment,percentage=o.productionDepositPercent??50}){
 const purchase=(o.items||[]).some(i=>i.productionSource!=='local')?(state.purchases||[]).find(p=>p.id===o.purchaseId):null;
 const physical=['Onderweg','Binnen in Nederland'].includes(purchase?.status)||Boolean(purchase?.shippedDate||purchase?.arrivedDate)||['In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'].includes(o.stage)||Boolean(o.productionDate||o.transitDate||o.arrivedDate||o.shippedDate||o.deliveredDate);
 const active=companyId==='spatlappen'&&!o.archived&&!physical;
 const approved=(state.documents||[]).filter(d=>d.ownerId===o.id&&d.imageRole==='approved'),specs=inquiryRequirements(o,companyId),reasons=[];
 if(!Number.isInteger(percentage)||percentage<1||percentage>100)reasons.push('Kies een aanbetaling van 1–100%.');
 const sampleZero=o.isSample&&payment.known&&payment.total===0;
 if(o.shippingKnown!==true)reasons.push('De verzendprijs moet expliciet bekend zijn, ook bij gratis verzending.');
 if(!payment.known)reasons.push('Product- en verzendprijs moeten bekend zijn.');
 else if(!sampleZero&&payment.total<=0)reasons.push('Controleer de prijsafspraak; nul heeft alleen een aparte teststukroute.');
 const required=payment.known?Math.round(payment.total*percentage/100):null;
 if(payment.known&&!sampleZero&&(payment.paid<required||payment.paid<=0))reasons.push('De afgesproken aanbetaling is nog niet volledig ontvangen.');
 if(companyId==='spatlappen'&&!orderDesignApproved(state,o))reasons.push('Ontwerpgoedkeuring ontbreekt.');
 if(specs.missing.length)reasons.push('Productspecificaties zijn nog onvolledig.');
 if(!active)reasons.push('Deze order is al in uitvoering of afgehandeld.');
 const requested=(o.paymentLinks||[]).filter(l=>l.amountInCents>0).at(-1)?.amountInCents;
 return {active,eligible:active&&!reasons.length,automatic:active&&!reasons.length&&!sampleZero,reasons,required,sampleZero,percentage,receivedPercent:payment.known&&payment.total>0?payment.paid/payment.total*100:null,linkDifference:requested!=null&&required!=null&&requested!==required,requested,signature:JSON.stringify([o,state.payments.filter(p=>p.orderId===o.id),approved])};
}
export function releaseProduction(state,id,expected,companyId,{payment,percentage,date}){
 const o=state.orders.find(o=>o.id===id);if(!o)throw Error('Deze order bestaat niet meer.');
 const info=productionReleaseInfo(state,o,companyId,{payment,percentage});if(info.signature!==expected)throw Error('Order, betaling of ontwerpgoedkeuring is gewijzigd. Controleer de vrijgave opnieuw.');
 if(o.productionReleasedDate)throw Error('De productievrijgave is al geregistreerd.');
 if(!info.eligible)throw Error(info.reasons.join(' '));if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))throw Error('Kies een geldige vrijgavedatum.');
 o.productionDepositPercent=percentage;o.productionReleasedDate=date;o.stage='Productie vrijgegeven';
}
