import {keyFactsMarkup} from '../workspace/key-facts.js?v=feedback-five-20261029';
import {captureReceiptFocus,restoreReceiptFocus} from './list-focus.js?v=ui-batch3-followup-20261027';
import {paymentOverviewRows,selectPayments,paymentOverviewTotals} from '../../shared/payment-overview.js?v=payments-overview-20261027';
// The feature keeps only view filters; every paint reads the live central state.
export function createPaymentsWorkspace(context){
 const filters={text:'',source:'all',from:'',to:'',attention:false};let page=0,refreshing=false;
 const pageSize=50;
 const esc=value=>context.esc(value),euro=value=>value==null?'Onbekend':context.euro(value);
 const href=(type,id,tab='')=>'#'+type+'/'+encodeURIComponent(id)+(tab?'/'+tab:'');
 function receiptDate(row){
  if(row.receivedAt!=null)return new Date(row.receivedAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  return row.day?context.date(row.day):'Onbekend';
 }
 function rowMarkup(row){
  const p=row.payment,orderLink=row.order?href('orders',row.order.id,'payments'):null;
  const customerLink=row.customer?href('customers',row.customer.id):null;
  const customer=row.customerName||'Onbekende klant';
  const detail=`<details class="payment-receipt-details" data-receipt-detail="${esc(p.id)}"><summary>Details${row.corrections.length?' · correctiehistorie':''}</summary><dl><div><dt>Omschrijving</dt><dd>${esc(p.reference||'Niet ingevuld')}</dd></div><div><dt>CRM-betalingsnummer</dt><dd>${esc(p.id)}</dd></div>${p.registeredAt?`<div><dt>Geregistreerd</dt><dd>${esc(Number.isFinite(Date.parse(p.registeredAt))?new Date(p.registeredAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'}):'Onbekend')}</dd></div>`:''}${!row.order?`<div><dt>Bewaarde orderverwijzing</dt><dd>${esc(p.orderId||'Ontbreekt')}</dd></div>`:''}</dl>${row.corrections.length?'<p class="form-help">Er zijn correcties bij deze ontvangst. Het bedrag in deze lijst is de huidige registratie; eerdere registraties tellen niet opnieuw mee.</p>':''}${orderLink?`<a href="${esc(orderLink)}">Betaling en correctiehistorie bekijken →</a>`:''}</details>`;
  return `<tr data-payment-row="${esc(p.id)}"><td data-label="Ontvangen">${esc(receiptDate(row))}</td><td data-label="Klant bij order">${orderLink?`<a class="order-list-link" href="${esc(orderLink)}"><strong>${esc(customer)}</strong></a>`:`<strong>${esc(customer)}</strong>`}${customerLink?`<small><a href="${esc(customerLink)}">Klantdossier →</a></small>`:''}</td><td data-label="Order">${orderLink?`<a href="${esc(orderLink)}">${row.orderNumber?'#'+esc(row.orderNumber):'Order openen'}</a>${row.order.archived?'<small>Gearchiveerd</small>':''}`:'<strong>Order ontbreekt</strong>'}</td><td class="list-money" data-label="Bedrag incl. btw"><strong class="amount">${esc(euro(row.amount))}</strong></td><td data-label="Herkomst">${esc(row.sourceLabel)}${row.issues.length?`<small><span class="receipt-attention">${row.issues.map(esc).join(' · ')}</span></small>`:''}</td><td data-label="Omschrijving"><span class="payment-receipt-reference">${esc(p.reference?String(p.reference).slice(0,120)+(String(p.reference).length>120?'…':''):'Geen omschrijving')}</span>${detail}</td></tr>`;
 }
 function paint(root){
  if(!root?.isConnected)return;
  const focus=captureReceiptFocus(root);
  const all=paymentOverviewRows(context.state),rows=selectPayments(all,filters),totals=paymentOverviewTotals(rows),pages=Math.max(1,Math.ceil(rows.length/pageSize));
  page=Math.min(page,pages-1);
  const open=new Set([...root.querySelectorAll('[data-receipt-detail][open]')].map(d=>d.dataset.receiptDetail));
  const invalidRange=!!(filters.from&&filters.to&&filters.from>filters.to);
  for(const field of root.querySelectorAll('[data-payment-filter=from],[data-payment-filter=to]'))field.setAttribute('aria-invalid',String(invalidRange));
  const facts=root.querySelector('[data-payments-facts]');facts.hidden=invalidRange;
  facts.innerHTML=keyFactsMarkup([
   {label:'Ontvangen incl. btw',value:totals.total==null?'Onbekend':euro(totals.total),detail:totals.unknown?'Bekend deel · '+totals.unknown+' onbekende bedragen':'Binnen jouw selectie'},
   {label:'Ontvangsten',value:totals.count,detail:'Nieuwste ontvangsten eerst'},
   {label:'Aandacht nodig',value:totals.attention,detail:totals.attention?'Controleer de gemarkeerde ontvangsten':'Geen geregistreerde aandachtspunten',tone:totals.attention?'warning':'neutral'}
  ],{esc,label:'Ontvangsten in één oogopslag',inset:true});
  root.querySelector('[data-payments-summary]').textContent=invalidRange?'De begindatum ligt na de einddatum. Pas je periode aan.':`${totals.count} ontvangst${totals.count===1?'':'en'} in deze selectie${totals.unknown?' · '+totals.unknown+' onbekende bedragen':''}`;
  const extra=[filters.from,filters.to,filters.attention].filter(Boolean).length;
  root.querySelector('[data-payment-options]').textContent='Meer filters & uitleg'+(extra?' · '+extra+' actief':'');
  root.querySelector('tbody').innerHTML=invalidRange?'<tr><td colspan="6">Kies een geldige periode.</td></tr>':rows.slice(page*pageSize,(page+1)*pageSize).map(rowMarkup).join('')||`<tr><td colspan="6" class="empty">${all.length?'Geen ontvangsten gevonden. Pas je zoekopdracht of filters aan.':'Nog geen ontvangen klantbetalingen geregistreerd.'}</td></tr>`;
  for(const d of root.querySelectorAll('[data-receipt-detail]'))d.open=open.has(d.dataset.receiptDetail);
  root.querySelector('[data-payments-page]').textContent=rows.length?`${page*pageSize+1}–${Math.min(rows.length,(page+1)*pageSize)} van ${rows.length}`:'0 ontvangsten';
  root.querySelector('[data-payments-prev]').disabled=invalidRange||page===0;
  root.querySelector('[data-payments-next]').disabled=invalidRange||page>=pages-1;
  root.querySelector('[data-payments-pagination]').hidden=invalidRange||pages<=1;
  context.$('[data-payments-refresh]').disabled=refreshing;
  restoreReceiptFocus(root,focus);
 }
 function render(){
  let root=context.$('[data-payments-workspace]');
  if(root?.isConnected){paint(root);return;}
  context.shell(context.heading('Betalingen','Ontvangen klantbetalingen · bedragen inclusief btw.',`<button type="button" class="primary" data-payments-refresh>Bijwerken</button>`)+`<section class="order-surface" data-payments-workspace><div data-payments-facts></div><div class="search-main payment-search"><label>Zoeken<input type="search" data-payment-filter="text" value="${esc(filters.text)}" placeholder="Klant, order, bedrag of omschrijving" maxlength="200"></label><label>Herkomst<select data-payment-filter="source"><option value="all">Alle ontvangsten</option><option value="tikkie">Tikkie</option><option value="other">Andere registraties</option></select></label></div><details class="search-details"><summary data-payment-options>Meer filters & uitleg</summary><div class="search-fields"><label>Ontvangen vanaf<input type="date" data-payment-filter="from" value="${esc(filters.from)}"></label><label>Tot en met<input type="date" data-payment-filter="to" value="${esc(filters.to)}"></label><label class="check-row"><input type="checkbox" data-payment-filter="attention" ${filters.attention?'checked':''}>Alleen ontvangsten met een aandachtspunt</label></div><button type="button" data-payments-reset>Filters wissen</button><p class="form-help">De klantnaam komt uit de gekoppelde order; de rekeninghouder is niet apart bewaard. Ook gearchiveerde orders blijven vindbaar. Andere registraties kunnen handmatig ingevoerd of geïmporteerd zijn. Verwijderde ontvangsten staan in het correctielog bij de order en tellen hier niet mee. Dit overzicht bevat klantontvangsten; leveranciersbetalingen staan bij Inkoop.</p></details><p class="search-result-count" data-payments-summary role="status" aria-live="polite"></p><p class="form-help" data-payments-notice role="status"></p><div class="tablewrap payment-receipt-table"><table class="payment-receipt-list"><thead><tr><th scope="col">Ontvangen</th><th scope="col">Klant bij order</th><th scope="col">Order</th><th scope="col" class="list-money">Bedrag incl. btw</th><th scope="col">Herkomst</th><th scope="col">Omschrijving</th></tr></thead><tbody></tbody></table></div><div class="actions" data-payments-pagination><button type="button" data-payments-prev>Vorige</button><span data-payments-page></span><button type="button" data-payments-next>Volgende</button></div><details class="workspace-help"><summary>Over bijwerken & Tikkiecontrole</summary><p class="form-help">Nieuwste ontvangsten eerst. Tikkiecontrole op de server en dit overzicht verversen zijn afzonderlijk: Bijwerken haalt opgeslagen CRM-ontvangsten op, het controleert geen bank of Tikkie. De automatische Tikkiecontrole gebeurt apart; bij veel betaallinks kan een nieuwe ontvangst later zichtbaar worden.</p></details></section>`,'payments');
  root=context.$('[data-payments-workspace]');
  root.querySelector('[data-payment-filter=source]').value=filters.source;
  root.addEventListener('input',event=>{if(event.target.dataset.paymentFilter==='text'){filters.text=event.target.value;page=0;paint(root);}});
  root.addEventListener('change',event=>{const key=event.target.dataset.paymentFilter;if(!key||key==='text')return;filters[key]=key==='attention'?event.target.checked:event.target.value;page=0;paint(root);});
  root.querySelector('[data-payments-reset]').onclick=()=>{Object.assign(filters,{text:'',source:'all',from:'',to:'',attention:false});for(const input of root.querySelectorAll('[data-payment-filter]')){const key=input.dataset.paymentFilter;if(key==='attention')input.checked=false;else input.value=filters[key];}page=0;paint(root);};
  root.querySelector('[data-payments-prev]').onclick=()=>{page=Math.max(0,page-1);paint(root);};
  root.querySelector('[data-payments-next]').onclick=()=>{page++;paint(root);};
  const refresh=context.$('[data-payments-refresh]');
  refresh.onclick=async()=>{
   if(refreshing)return;refreshing=true;refresh.disabled=true;refresh.textContent='Bijwerken…';
   const notice=root.querySelector('[data-payments-notice]');notice.textContent='Opgeslagen ontvangsten ophalen…';
   try{const result=await context.refreshExternalState({throwOnError:true});if(root.isConnected)notice.textContent=result.updated?'Opgeslagen CRM-ontvangsten bijgewerkt.':result.reason||'Bijwerken is nog niet gelukt; de eerdere lijst blijft staan.';}
   catch(error){if(root.isConnected)notice.textContent='Niet bijgewerkt: '+error.message+' De eerdere lijst en filters blijven behouden.';}
   finally{refreshing=false;const current=context.$('[data-payments-workspace]');if(current?.isConnected){context.$('[data-payments-refresh]').textContent='Bijwerken';paint(current);}}
  };
  paint(root);
 }
 return {render};
}
