import {displayOrderStage} from '../../shared/companies.js';
import {orderPaymentFact} from './key-facts.js?v=feedback-five-20261029';
// Presentation only. The coordinator supplies the current projections and sort.
export function orderListMarkup(context,list,{sort,ascending}){
 const {esc,badge,euro,totals,purchase,customer,company,funnelUI,planningSummary,orderDossierLabel,guidanceMarkup,route}=context;
 const headings=[['number','Dossier & klant','dossiernummer'],['stage','Status','geregistreerde uitvoeringsstatus'],['date','Wachttijd & planning','aanvraagdatum'],['net','Verkoop excl. btw','verkoopbedrag excl. btw']];
 const header=headings.map(([key,title,sortLabel])=>`<th scope="col" ${key==='net'?'class="list-money"':''} aria-sort="${sort===key?(ascending?'ascending':'descending'):'none'}"><button type="button" title="Sorteren op ${sortLabel}" data-action="sort" data-id="${key}" aria-label="Sorteren op ${sortLabel}${sort===key?(ascending?', nu oplopend':', nu aflopend'):''}">${title} ${sort===key?(ascending?'↑':'↓'):''}</button></th>`).join('');
 const rows=list.map(o=>{
  const t=totals(o),p=purchase(o.purchaseId),c=customer(o.customerId),complete=t.priceKnown&&o.shippingKnown===true;
  const payment=orderPaymentFact(context,o,t);
  return `<tr><td data-label="Dossier & klant"><a class="order-list-link" href="#orders/${esc(o.id)}"><strong>${esc(c?.company||'Onbekend')} · #${esc(o.sourceNumber||o.number)}</strong><small>${o.inquiryName&&o.inquiryName!==c?.company?'Ingediend als: '+esc(o.inquiryName)+' · ':''}${esc(o.items.length?o.items.map(i=>`${i.quantity}× ${i.description}`).join(' · '):(o.inquiryProduct||'Aanvraag · productgegevens nog aanvullen'))}</small></a>${badge(orderDossierLabel(o,t.paid),o.inquiryDraft?'orange':'')}${o.archived?badge('Gearchiveerd'):''}</td>
   <td data-label="Status">${funnelUI.row(o,{compact:true})}${company.id==='maatwerkkunststof'&&sort!=='stage'?'':`<small>Uitvoering: ${esc(displayOrderStage(o.stage,company.id)||'Nog niet vastgelegd')}</small>`}</td>
   <td data-label="Wachttijd & planning">${planningSummary(o)}</td>
   <td class="list-money" data-label="Verkoop excl. btw"><strong class="amount">${t.priceKnown?euro(t.net):'Nog te bepalen'}</strong>${t.priceKnown&&!complete?'<small>Voorlopig · verzending volgt</small>':''}<details class="row-details"><summary>Prijs & inkoop</summary><div>${t.priceKnown?`<p>${euro(t.total)} incl. btw${complete?'':' · voorlopig'}</p>`:''}${p?`<a href="#purchases/${esc(p.id)}">Inkoop: ${esc(p.name)}</a>`:'<p>Nog geen gezamenlijke inkoop gekoppeld.</p>'}</div></details></td>
   <td data-label="Betaling"><strong class="receipt-state" data-tone="${payment.tone}">${esc(payment.value)}</strong><small>${esc(payment.detail)}</small></td></tr>`;
 }).join('');
 const empty='<tr><td colspan="5" class="empty">'+guidanceMarkup({title:'Geen aanvragen of orders gevonden',message:'Maak een order aan of pas je filters aan.',actions:[{id:'create-order',label:'Order aanmaken',primary:true},...(route()[0]==='orders'?[{id:'reset-orders',label:'Filters wissen'}]:[])]})+'</td></tr>';
 return `<div class="tablewrap order-list-wrap"><table class="order-list"><thead><tr>${header}<th scope="col">Betaling</th></tr></thead><tbody>${rows||empty}</tbody></table></div>`;
}
