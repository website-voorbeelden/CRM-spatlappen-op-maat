import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {customerFinancials,customerWorkspace} from '../shared/customer-workspace.js';
import {workQueue} from '../shared/work-queue.js';
import {companyFor} from '../shared/companies.js';
import {searchCustomers,defaultCustomerSearch} from '../admin/dossier-search.js';
import {createCustomerViews} from '../admin/customers/views.js';
import {documentVersionGroups} from '../admin/document-library.js';
import {customerWithSources} from '../shared/inquiries.js';
import {provenanceText} from '../admin/provenance-ui.js';
import {assistantPageContext} from '../shared/assistant-page-context.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const order=(id,customerId='c1',extra={})=>({id,customerId,number:3000+Number(id.slice(1)),date:'2026-10-15',stage:'Ontwerp maken',items:[],shippingKnown:false,shippingCharge:0,vat:21,...extra});
const now=Date.parse('2026-10-16T12:00:00Z');
const fresh=()=>({customers:[{id:'c1',company:'Voorbeeld BV',contact:'Jan',number:'KL-0001',email:'jan@example.invalid'},{id:'c2',company:'Andere klant'}],orders:[order('o1'),order('o2','c2'),order('o3','c1',{archived:true})],payments:[],documents:[],activities:[]});
for(const companyId of ['spatlappen','maatwerkkunststof']){
 const state=fresh(),before=structuredClone(state),m=customerWorkspace(state,'c1',companyId,{now});
 assert.deepEqual(m.orders.map(o=>o.id),['o1','o3']);assert.deepEqual(m.open.map(o=>o.id),['o1']);
 assert.deepEqual(m.tasks,workQueue(state,companyId,{now}).tasks.filter(t=>t.orderId==='o1'));
 assert.equal(m.unknownCount,2);assert.equal(m.provisional,true);assert.equal(m.balance,0);assert.deepEqual(state,before);
 state.orders[0]=order('o1','c1',{shippingKnown:true,items:[{quantity:2,price:1000}]});
 state.orders[2]=order('o3','c1',{archived:true,shippingKnown:true,items:[{quantity:1,price:1000}]});
 state.payments=[{orderId:'o1',amount:500},{orderId:'o3',amount:1410},{orderId:'o2',amount:999999}];
 let financial=customerFinancials(state,state.orders.filter(o=>o.customerId==='c1'));
 assert.deepEqual(financial,{paid:1910,balance:1920,credit:200,unknownCount:0,provisional:false});
 let search=searchCustomers(state,defaultCustomerSearch()).find(r=>r.c.id==='c1');assert.equal(search.balance,financial.balance);assert.equal(search.provisional,false);
 state.orders[0].shippingKnown=false;financial=customerWorkspace(state,'c1',companyId,{now});assert.equal(financial.provisional,true);assert.equal(financial.unknownCount,1);
 state.orders[0].shippingKnown=true;state.orders[0].packagePrice=0;assert.equal(customerWorkspace(state,'c1',companyId,{now}).unknownCount,0,'Een afgesproken nulprijs blijft bekend.');
 state.orders[0].items=[];assert.equal(customerWorkspace(state,'c1',companyId,{now}).unknownCount,1,'Een lege aanvraag is geen bekende nulprijs.');
 assert.equal(searchCustomers(state,{...defaultCustomerSearch(),text:'Andere klant'}).length,1);assert.equal(searchCustomers(state,{...defaultCustomerSearch(),activity:'open'}).length,2);

 // Render the real extracted module with inert adapters for the existing document/mail/address surfaces.
 const button=(action,label,id='',primary=false)=>`<button data-action="${action}" data-id="${esc(id)}" class="${primary?'primary':''}">${label}</button>`;
 const views=createCustomerViews({company:companyFor(companyId),esc,button,badge:t=>`<span>${esc(t)}</span>`,euro:v=>'EUR '+v,date:v=>v||'—',heading:(title,sub,buttons)=>`<h1>${title}</h1><p>${sub}</p>${buttons}`,searchSelect:(group,key,label,entries,value)=>`<select data-${group}-search="${key}">${entries.map(([key,label])=>`<option value="${esc(key)}" ${key===value?'selected':''}>${esc(label)}</option>`).join('')}</select>`,guidanceMarkup:()=>'<p>Geen klanten gevonden</p>',documentVersionGroups,customerWithSources,provenanceText,ordersTable:rows=>rows.map(o=>`<a href="#orders/${o.id}">${o.number}</a>`).join(''),sortedOrders:rows=>[...rows].reverse(),customerAddressSummary:()=>'<p>Adresoverzicht</p>',customerAddresses:()=>'<p>Adresformulier</p>',documents:()=>'<p>Documentbibliotheek</p>',documentsForOwner:()=>state.documents,inboxUI:{customerMarkup:()=>'<p>Mailwerkplek</p>'}});
 const viewState=fresh();for(let n=4;n<=7;n++)viewState.orders.push(order('o'+n));
 viewState.customers[0].notes='<img src=x onerror=bad()> interne notitie';viewState.orders[0].items=[{description:'<script>bad()</script>',quantity:20,price:null}];viewState.orders[0].purchaseId='p1';
 const copy=structuredClone(viewState),c=viewState.customers[0],v=views.dossier(viewState,c);
 assert.equal(v.details.section,'overview');assert.equal(v.details.visible.ids.length,3);assert.equal(v.details.visible.total,5);assert.equal(v.details.facts.outstandingInCents,undefined);
 assert.match(v.markup,/Nog te bepalen/);assert.match(v.markup,/Meer lopende dossiers \(2\)/);assert.match(v.markup,/href="#purchases\/p1"/);assert.match(v.markup,/data-funnel-action="specs"/);
 assert.equal((v.markup.match(/class="primary"/g)||[]).length,1);assert.match(v.markup,/data-action="new-order" data-id="c1"/);assert.ok(!v.markup.includes('<script>')&&!v.markup.includes('<img'));
 for(const [tab,expected] of [['details','Contact & bedrijf'],['orders','Orders van deze klant'],['addresses','Adresformulier'],['documents','Documentbibliotheek'],['mail','Mailwerkplek']]){
  const rendered=views.dossier(viewState,c,tab);assert.equal(rendered.details.section,tab);assert.ok(rendered.markup.includes(expected));
  assert.equal(assistantPageContext({companyId,page:'customers',...rendered.details}).section,tab);
 }
 const unknown=views.dossier(viewState,c,'old-or-invalid');assert.equal(unknown.details.section,'overview');
 assert.equal(assistantPageContext({companyId,page:'customers',...unknown.details}).sectionLabel,'Klantoverzicht');
 assert.deepEqual(viewState,copy,'Weergeven schrijft geen gegevens.');
 const listView=views.list(fresh(),defaultCustomerSearch());assert.match(listView.markup,/Nog te bepalen/);assert.match(listView.markup,/data-customer-search="activity"/);assert.equal(listView.details.visible.total,2);
 const noOrders=views.dossier(fresh(),{id:'empty',company:'Zonder orders'});assert.match(noOrders.markup,/Nog geen aanvraag of order/);assert.equal(noOrders.details.visible.total,0);
}
const app=await readFile(new URL('../admin/app.js',import.meta.url),'utf8');
assert.match(app,/customerViews\.list\(state,customerSearch\)/);assert.match(app,/customerViews\.dossier\(state,c,route\(\)\[2\]\)/);
console.log('✓ Klantwerkplek: beide bedrijven, bestaande prioriteiten/archief, betalingen/tegoed/onbekende bedragen, filters, drie zichtbare dossiers, oude tabs, veilige tekst, AI-context en nul gegevenswijzigingen.');
