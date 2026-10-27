import {displayOrderStage} from '../../shared/companies.js';
// Presentation only. The coordinator supplies the current projections and sort.
export function orderListMarkup(context,list,{sort,ascending}){
 const {esc,badge,euro,totals,purchase,customer,company,funnelUI,planningSummary,paymentStatus,orderDossierLabel,guidanceMarkup,route}=context;
 const headings=[['number','Dossier & klant','dossiernummer'],['stage','Status','geregistreerde uitvoeringsstatus'],['date','Aanvraag & planning','aanvraagdatum'],['net','Verkoop excl. btw','verkoopbedrag excl. btw']];
 const header=headings.map(([key,title,sortLabel])=>`<th scope="col" ${key==='net'?'class="list-money"':''} aria-sort="${sort===key?(ascending?'ascending':'descending'):'none'}"><button type="button" title="Sorteren op ${sortLabel}" data-action="sort" data-id="${key}" aria-label="Sorteren op ${sortLabel}${sort===key?(ascending?', nu oplopend':', nu aflopend'):''}">${title} ${sort===key?(ascending?'↑':'↓'):''}</button></th>`).join('');
 const rows=list.map(o=>{
  const t=totals(o),p=purchase(o.purchaseId),c=customer(o.customerId),complete=t.priceKnown&&o.shippingKnown===true;
  const balance=!t.priceKnown?'Nog geen prijsafspraak':!complete?'Saldo volgt na verzendprijs':t.balance>0?`${euro(t.balance)} open incl. btw`:t.balance<0?`${euro(-t.balance)} te veel ontvangen incl. btw`:'Orderbedrag voldaan';
  return `<tr><td data-label="Dossier & klant"><a class="order-list-link" href="#orders/${esc(o.id)}"><strong>${esc(c?.company||'Onbekend')} · #${esc(o.sourceNumber||o.number)}</strong><small>${o.inquiryName&&o.inquiryName!==c?.company?'Ingediend als: '+esc(o.inquiryName)+' · ':''}${esc(o.items.length?o.items.map(i=>`${i.quantity}× ${i.description}`).join(' · '):(o.inquiryProduct||'Aanvraag · productgegevens nog aanvullen'))}</small></a>${badge(orderDossierLabel(o,t.paid),o.inquiryDraft?'orange':'')}${o.archived?badge('Gearchiveerd'):''}</td>
   <td data-label="Status">${funnelUI.row(o,{compact:true})}${company.id==='maatwerkkunststof'&&sort!=='stage'?'':`<small>Uitvoering: ${esc(displayOrderStage(o.stage,company.id)||'Nog niet vastgelegd')}</small>`}</td>
   <td data-label="Aanvraag & planning">${planningSummary(o)}</td>
   <td class="list-money" data-label="Verkoop excl. btw"><strong class="amount">${t.priceKnown?euro(t.net)+(complete?'':' · voorlopig'):'Nog te bepalen'}</strong><small>${t.priceKnown?euro(t.total)+' incl. btw'+(!complete?' · voorlopig':''):''}</small><small class="${complete&&t.balance>0?'amount-outstanding':''}">${balance}${!o.shippingKnown?' · verzending volgt':''}</small><small>${!complete&&t.paid>0?'Ontvangen '+euro(t.paid)+' incl. btw':paymentStatus(o)}</small></td>
   <td data-label="Inkoop">${p?`<a href="#purchases/${esc(p.id)}">${esc(p.name)}</a>`:'Nog niet gekoppeld'}</td></tr>`;
 }).join('');
 const empty='<tr><td colspan="5" class="empty">'+guidanceMarkup({title:'Geen aanvragen of orders gevonden',message:'Maak een order aan of pas je filters aan.',actions:[{id:'create-order',label:'Order aanmaken',primary:true},...(route()[0]==='orders'?[{id:'reset-orders',label:'Filters wissen'}]:[])]})+'</td></tr>';
 return `<div class="tablewrap order-list-wrap"><table class="order-list"><thead><tr>${header}<th scope="col">Inkoop</th></tr></thead><tbody>${rows||empty}</tbody></table></div>`;
}
