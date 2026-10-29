import {fulfilmentMethods} from '../../shared/inbound-readiness.js?v=feedback-followup-20261028';
import {purchaseCustomerBalances} from '../../shared/purchase-customer-balances.js?v=feedback29-batch1-followup';
import {keyFactsMarkup} from '../workspace/key-facts.js?v=feedback-five-20261029';

// Only table controls live in this feature's memory; business data is always
// read through the current context and the existing totals projection.
export function createPurchaseCustomerPayments(context){
 const drafts=new Map();
 const draftFor=id=>{if(!drafts.has(id))drafts.set(id,{filter:'active',query:''});return drafts.get(id);};
 const archived=o=>o.archived||o.deliveredDate||o.shippedDate||['Afgerond','Verzonden'].includes(o.stage);
 const deliveryState=o=>o.archived?'gearchiveerd':o.deliveredDate||o.stage==='Afgerond'?'afgerond':o.shippedDate||o.stage==='Verzonden'?'verzonden':'';
 function markup(p){
  const {esc,euro}=context,view=purchaseCustomerBalances(context.state,p,{totals:context.totals}),draft=draftFor(p.id);
  const rank={attention:0,unknown:1,open:2,credit:3,paid:4,zero:5};
  const rows=[...view.rows].sort((a,b)=>Number(!!archived(a.order))-Number(!!archived(b.order))||rank[a.balance.category]-rank[b.balance.category]||(b.balance.open??0)-(a.balance.open??0)||String(a.customer?.company||'').localeCompare(String(b.customer?.company||''),'nl')||a.order.id.localeCompare(b.order.id));
  const facts=keyFactsMarkup([
   {label:'Nog te ontvangen incl. btw',value:view.outstanding==null?'Bedragen controleren':euro(view.outstanding),detail:'Zendingtotaal van complete prijsafspraken; onbekende bedragen zijn niet meegeteld'},
   {label:'Volledig betaald',value:view.paid+' van '+view.rows.length,detail:view.zero?view.zero+' order(s) zonder betaalbedrag apart':'Inclusief eventuele overbetaling'},
   {label:'Prijs / betaling aanvullen',value:String(view.unknown),detail:view.credit?euro(view.credit)+' te veel ontvangen, apart van openstaande bedragen':'Productprijs én verzendprijs moeten bekend zijn'}
  ],{esc,label:'Klantbetalingen van deze zending',inset:true});
  function primary(o,b){
   if(b.category==='attention')return `<a href="#orders/${esc(o.id)}/payments">Betalingen controleren →</a>`;
   if(!b.complete)return b.priceKnown?`<button type="button" data-payment-shipping="${esc(o.id)}">Verzendprijs aanvullen</button>`:context.button('edit-order','Prijsafspraak aanvullen',o.id);
   if(archived(o))return `<a href="#orders/${esc(o.id)}/overview">Dossier bekijken →</a>`;
   return context.arrivalButton(context.state,o,context.company,{esc})||`<a href="#orders/${esc(o.id)}/mail">Mail voorbereiden →</a>`;
  }
  return `<section class="order-surface" data-purchase-customer-payments><div class="section-heading"><div><h2>Klantbetalingen & levering</h2><p>Eén overzicht voor de hele zending. Bereid per klant een mail voor en controleer die vóór verzenden.</p></div><a href="#order-map/${esc(p.id)}">Zending op kaart →</a></div>${facts}<div class="toolbar"><label>Zoek klant of order<input type="search" data-purchase-payment-search value="${esc(draft.query)}" maxlength="200" autocomplete="off"></label><label>Toon<select data-purchase-payment-filter>${[['active','Nog te verzenden / afhalen'],['open','Nog te betalen'],['settled','Geen restant'],['unknown','Prijs / betaling aanvullen'],['credit','Te veel ontvangen'],['all','Alle orders, ook afgerond']].map(([key,label])=>`<option value="${key}" ${key===draft.filter?'selected':''}>${label}</option>`).join('')}</select></label><span class="muted" data-purchase-payment-count role="status"></span></div><div class="tablewrap"><table><thead><tr>${['Klant / order','Totaal incl. btw','Ontvangen incl. btw','Nog te betalen incl. btw','Leverafspraak','Volgende actie'].map(label=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${rows.map(({order:o,customer:c,balance:b})=>{
   const search=[c?.company,o.sourceNumber,o.number].filter(Boolean).join(' ').toLocaleLowerCase('nl');
   return `<tr data-purchase-payment-row="${esc(b.category)}" data-payment-closed="${archived(o)?'true':'false'}" data-payment-search="${esc(search)}"><td data-label="Klant / order"><a href="#orders/${esc(o.id)}/payments"><strong>${esc(c?.company||'Klant onbekend')}</strong> · #${esc(o.sourceNumber||o.number)}</a><small>${esc(b.label)}${archived(o)?' · '+esc(deliveryState(o)):''}</small></td><td data-label="Totaal incl. btw">${b.complete?euro(b.total):'Nog te bepalen'}</td><td data-label="Ontvangen incl. btw">${b.paid==null?'Controleren':euro(b.paid)}</td><td data-label="Nog te betalen incl. btw">${b.complete?euro(b.open)+(b.credit?`<small>${euro(b.credit)} te veel ontvangen</small>`:''):'Onbekend'}</td><td data-label="Leverafspraak">${esc(fulfilmentMethods.find(([key])=>key===o.fulfilmentMethod)?.[1]||'Nog afspreken')}<small>${o.shippingKnown===true?euro(o.shippingCharge||0)+' excl. btw':'Verzendprijs nog onbekend'}</small></td><td data-label="Volgende actie">${primary(o,b)}</td></tr>`;
  }).join('')}</tbody></table></div><p data-purchase-payment-empty hidden>Geen klantorders in deze selectie. Pas je zoekterm of filter aan.</p><details class="form-details"><summary>Wat telt dit overzicht mee?</summary><p>De drie totalen gelden voor de volledige zending, inclusief afgeronde orders. De filter verandert alleen de getoonde regels. Te veel ontvangen wordt niet verrekend met wat andere klanten nog moeten betalen. Alleen een bekende product- én verzendprijs levert een definitieve betaalstand op. Een nulorder is geen ontvangen betaling. Leveranciersbetalingen staan apart bij Facturen & betalingen.</p><p>Aankomstmail is beschikbaar na de geregistreerde aankomst. Onbekende bedragen vul je eerst aan. Een mail voorbereiden registreert geen verzending, levering of betaling.</p></details></section>`;
 }
 function install(root,p){
  const panel=root.querySelector('[data-purchase-customer-payments]');if(!panel)return;
  const draft=draftFor(p.id),filter=panel.querySelector('[data-purchase-payment-filter]'),search=panel.querySelector('[data-purchase-payment-search]');
  function paint(){const query=draft.query.trim().toLocaleLowerCase('nl');let shown=0,total=0;for(const row of panel.querySelectorAll('[data-purchase-payment-row]')){
   const category=row.dataset.purchasePaymentRow,match=draft.filter==='all'||draft.filter==='active'&&row.dataset.paymentClosed!=='true'||draft.filter==='settled'&&['paid','credit','zero'].includes(category)||draft.filter==='unknown'&&['unknown','attention'].includes(category)||draft.filter===category;
   row.hidden=!match||!row.dataset.paymentSearch.includes(query);total++;if(!row.hidden)shown++;
  }panel.querySelector('[data-purchase-payment-empty]').hidden=shown>0;panel.querySelector('[data-purchase-payment-count]').textContent=shown+' van '+total+' orders';}
  filter.onchange=()=>{draft.filter=filter.value;paint();};search.oninput=()=>{draft.query=search.value;paint();};paint();
 }
 return {markup,install};
}
