import {navigationGroups} from './navigation.js?v=home-20261028';
import {navigationIcon} from './navigation-icons.js?v=payments-overview-20261027';
import {paymentOverviewRows} from '../../shared/payment-overview.js?v=payments-overview-20261027';
import {markFormClean} from '../form-guidance.js?v=crm-code-review-20261027';

const descriptions={dashboard:'Je taken, lopende dossiers en activiteiten',mail:'Gesprekken lezen en beantwoorden',orders:'Aanvragen, offertes en klantorders',payments:'Ontvangen geld en bijbehorende orders',customers:'Contactgegevens en klantdossiers','order-map':'Productie, leveringen en bezorgroutes',purchases:'Leveranciers, zendingen en inkoopkosten',inventory:'Voorraad en beschikbare producten',designs:'Ontwerpen of kostprijzen voorbereiden',analytics:'Cijfers, websitegebruik en rapporten',feedback:'Een fout of verbeteridee vastleggen',development:'Bouwvoortgang en open verbeteringen',settings:'Koppelingen, mailteksten en back-ups'};

// Reuse current business records and existing per-company visit preferences.
// Only the unfinished search query lives in this page factory, never in storage.
export function createHomeWorkspace(context){
 let query='';
 function markup(){
  const {state,company,esc,euro}=context;
  context.dossierPreferences.refresh();
  const orders=state.orders.filter(o=>context.dossierPreferences.openedAt('orders',o.id)>0).sort((a,b)=>context.dossierPreferences.openedAt('orders',b.id)-context.dossierPreferences.openedAt('orders',a.id)||String(a.id).localeCompare(String(b.id))).slice(0,4);
  const today=context.today(),since=new Date(today+'T12:00:00Z');since.setUTCDate(since.getUTCDate()-6);
  const receipts=paymentOverviewRows(state).filter(row=>row.amount>0&&row.day&&row.day>=since.toISOString().slice(0,10)&&row.day<=today).slice(0,4);
  const recentOrders=orders.map(o=>{const customer=state.customers.find(c=>c.id===o.customerId);return `<a class="home-recent-link" href="#orders/${esc(o.id)}"><span><strong>${esc(customer?.company||customer?.contact||'Klant onbekend')}</strong><small>Order #${esc(o.sourceNumber||o.number)}${o.archived?' · gearchiveerd':''}</small></span><span aria-hidden="true">→</span></a>`;}).join('');
  const recentPayments=receipts.map(row=>`<a class="home-recent-link" href="${row.order?'#orders/'+esc(row.order.id)+'/payments':'#payments'}"><span><strong>${esc(row.customerName||'Klant niet gekoppeld')}</strong><small>${row.order?'Order #'+esc(row.orderNumber)+' · ':''}${context.date(row.day)} · ${esc(row.sourceLabel)}</small></span><strong class="home-receipt-amount">${euro(row.amount)}</strong></a>`).join('');
  const tiles=navigationGroups(company).flatMap(group=>group.links).filter(([id])=>!['development','feedback'].includes(id)).map(([id,label])=>`<a class="home-tile" href="#${id==='dashboard'?'dashboard/tasks':id}"><span class="home-tile-icon" aria-hidden="true">${navigationIcon(id)}</span><strong>${esc(id==='dashboard'?'Te doen & overzicht':label)}</strong><span>${esc(id==='designs'?(company.tool==='design'?'Ontwerpen en opgeslagen varianten':'Kostprijzen en berekeningen voorbereiden'):descriptions[id])}</span></a>`).join('');
  return `<div class="home-workspace">${context.heading('Waar wil je mee aan de slag?',esc(company.name))}<section class="home-search-surface" aria-labelledby="home-search-heading"><h2 id="home-search-heading">Zoeken in je CRM</h2><form class="home-search" data-home-search role="search"><label for="home-search-input">Klant, order, factuur of pagina zoeken</label><input type="search" id="home-search-input" name="query" maxlength="200" autocomplete="off" spellcheck="false" placeholder="Zoek een klant, order, factuur of pagina…" value="${esc(query)}"><button type="submit" class="primary">Zoeken</button></form><p class="form-help">Zoek op naam, nummer of onderwerp.</p></section><section class="home-modules" aria-labelledby="home-modules-heading"><h2 id="home-modules-heading">Snel naar</h2><div class="home-navigation-grid">${tiles}</div></section><div class="home-recent-grid"><section class="order-surface" aria-labelledby="home-recent-orders"><div class="section-heading"><h2 id="home-recent-orders">Laatst geopende orders</h2><a href="#orders">Alle orders →</a></div>${recentOrders||'<p class="muted">Open een order om die hier snel terug te vinden.</p>'}<p class="form-help">In deze browser, voor dit bedrijf.</p></section><section class="order-surface" aria-labelledby="home-recent-payments"><div class="section-heading"><h2 id="home-recent-payments">Recent ontvangen</h2><a href="#payments">Alle betalingen →</a></div>${recentPayments||'<p class="muted">Geen geregistreerde ontvangsten in de afgelopen 7 dagen.</p>'}<p class="form-help">Afgelopen 7 dagen · bedragen inclusief btw.</p></section></div></div>`;
 }
 function mount(root){
  const form=root.querySelector('[data-home-search]');if(!form)return;
  const input=form.elements.namedItem('query');
  input.addEventListener('input',()=>{query=input.value;});
  form.addEventListener('submit',event=>{event.preventDefault();query=input.value;markFormClean(form);context.globalSearch.open({query});});
 }
 return {markup,mount};
}

const homeLinkHandlers=new WeakMap();
export function installHomeLinks(root,{canNavigate,onBlocked}){
 const previous=homeLinkHandlers.get(root);if(previous)root.removeEventListener('click',previous);
 const handler=event=>{
  if(!event.target.closest('[data-home-link]'))return;
  if(!canNavigate()){event.preventDefault();onBlocked();return;}
  root.querySelector('[data-mobile-close]')?.click();
 };
 root.addEventListener('click',handler);homeLinkHandlers.set(root,handler);
}
