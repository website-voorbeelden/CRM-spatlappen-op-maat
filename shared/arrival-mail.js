import {customerOrderBalance} from './purchase-customer-balances.js?v=feedback29-batch1-followup';
import {funnelPayment} from './sales-funnel.js?v=feedback29-batch3-followup';
import {documentReplyContext} from './document-mail-context.js?v=crm-code-review-20261027';
export function arrivalMail(state,id,company,{euro}){
 if(company.id!=='spatlappen')throw Error('Deze aankomstmail hoort bij Spatlappen.');
 const o=state.orders.find(o=>o.id===id),p=(state.purchases||[]).find(p=>p.id===o?.purchaseId);
 if(!o||o.archived||o.deliveredDate||o.shippedDate||['Afgerond','Verzonden'].includes(o.stage))throw Error('Deze order is niet beschikbaar voor een aankomstmail.');
 const ownArrival=Boolean(o.arrivedDate||o.stage==='Binnen in Nederland'),supplierPart=o.items.some(i=>i.productionSource!=='local'),batchArrival=supplierPart&&Boolean(p?.arrivedDate||p?.status==='Binnen in Nederland');
 if(!(ownArrival||batchArrival))throw Error('Registreer eerst de werkelijke aankomst in Nederland.');
 const c=state.customers.find(c=>c.id===o.customerId),payment=funnelPayment(state,o),method=o.fulfilmentMethod||'',address=o.delivery?.source==='custom'?o.delivery:{recipient:c?.shippingRecipient||c?.contact||c?.company,address:c?.shippingAddress,country:c?.shippingCountry||c?.country};
 const summary=customerOrderBalance(state,o,payment);if(!summary.valid)throw Error('Controleer eerst de geregistreerde bedragen voordat je de aankomstmail voorbereidt.');
 const balance=summary.open;
 const mixedArrival=batchArrival&&!ownArrival&&o.items.some(i=>i.productionSource==='local');
 const lines=['Beste '+(c?.contact||c?.company||'klant')+',','',mixedArrival?'De zending met de leveranciersproducten voor je bestelling #'+(o.sourceNumber||o.number)+' is binnen in Nederland. We controleren nog of alle onderdelen van je bestelling compleet zijn.':'Je bestelling #'+(o.sourceNumber||o.number)+' is binnen in Nederland.'];
 let variant='arrangement';
 if(balance===null){variant='unknown';lines.push('We stemmen de resterende prijs- en leverafspraken graag met je af.');}
 else if(balance>0){variant='balance';lines.push('Er staat nog '+euro(balance)+' open voor deze bestelling, inclusief de vastgelegde verzendkosten. Wil je dit restant voldoen?');}
 else if(!['pickup','shipping','delivery'].includes(method))lines.push((summary.total===0?'Voor deze bestelling is geen betaling nodig.':'De betaling is volledig ontvangen.')+' Wil je laten weten of je wilt afhalen, of dat we verzending of bezorging afspreken?');
 else {variant='ready';lines.push(summary.total===0?'Voor deze bestelling is geen betaling nodig.':'De betaling is volledig ontvangen.');}
 if(method==='pickup')lines.push('We spreken graag een afhaalmoment met je af.');
 else if(['shipping','delivery'].includes(method)){
  if(address.address?.trim()&&address.country?.trim())lines.push('',(method==='shipping'?'Het afgesproken verzendadres:':'Het afgesproken bezorgadres:'),[address.recipient,address.address,address.country].filter(Boolean).join('\n'),'','We stemmen het verzend- of bezorgmoment nog met je af.');
  else lines.push('Wil je het afleveradres en land nog bevestigen? Daarna stemmen we het levermoment af.');
  if(o.shippingKnown!==true)lines.push('De verzend- of bezorgkosten moeten we nog afspreken.');
 }else if(balance>0||balance===null)lines.push('Ook de leverwijze spreken we nog met je af.');
 return {variant,to:c?.email||'',subject:'Bestelling binnen · #'+(o.sourceNumber||o.number)+' · '+company.website,body:lines.join('\n'),...(documentReplyContext(state,o.id,c?.email)||{})};
}
