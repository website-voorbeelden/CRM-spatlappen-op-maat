import {openCrmDatabase,storageRuntime} from '../../admin/cloud-storage.js';
import {readCostQuote} from '../costing/quote-store.js';
import {orderTarget,seedOrderCalculation,orderCalculationRecord,saveOrderCalculation} from './crm-order-domain.js?v=quick-entry-20261016';
const g=window,api=g.CrmCostCalculator,esc=g.GasketV2Geometry.esc;
const context=document.getElementById('v2-order-context'),entry=document.getElementById('v2-order-link'),status=document.getElementById('v2-status');
const money=cents=>cents==null?'Onbekend':new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(cents/100);
let target=null,busy=false;
const serial=()=>JSON.stringify(api.exportState());
const read=db=>new Promise((resolve,reject)=>{const tx=db.transaction('state'),r=tx.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});
async function connection(){const runtime=await storageRuntime();if(runtime.companyId!=='maatwerkkunststof'||runtime.mode!=='local')throw Error('Orderkoppeling V2 werkt alleen met het lokale Maatwerkkunststof-CRM.');return openCrmDatabase();}
function modal(title){const d=document.createElement('dialog');d.className='v2-help-dialog';d.dataset.orderDialog='';d.setAttribute('aria-label',title);d.innerHTML='<header><h2>'+title+'</h2><button type="button" data-close>Sluiten ×</button></header><div data-body></div>';document.body.append(d);let active=true;const close=()=>{if(busy)return;active=false;d.close();d.remove();};d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});d.showModal();return {d,body:d.querySelector('[data-body]'),close,isActive:()=>active};}
function updateUrl(){const u=new URL(location.href);for(const k of ['orderId','itemId','quoteId'])u.searchParams.delete(k);if(target){u.searchParams.set('orderId',target.order.id);u.searchParams.set('itemId',target.item.id);}history.replaceState(null,'',u.pathname+u.search+u.hash);}
function syncPrimary(){document.getElementById('v2-customer-save').hidden=!!target;for(const button of document.querySelectorAll('[data-customer-save],[data-order-primary]')){if(target){button.removeAttribute('data-customer-save');button.setAttribute('data-order-primary','');button.setAttribute('data-order-review','');button.textContent='Deze uitkomst in de order opslaan';}else{button.removeAttribute('data-order-primary');button.removeAttribute('data-order-review');button.setAttribute('data-customer-save','');button.textContent='Deze berekening bij klant bewaren';}}}
function showContext(){
 syncPrimary();context.hidden=!target;entry.textContent=target?'Andere order kiezen':'Aan order koppelen';if(!target){context.innerHTML='';return;}
 const o=target.order,i=target.item;
 context.innerHTML='<div><strong>Order #'+esc(o.sourceNumber||o.number||o.id)+' · '+esc(target.customer?.company||'Klant')+'</strong><span>'+esc(i.description||'Product')+' · '+esc(i.quantity)+' stuks · '+esc(i.width??'?')+' × '+esc(i.height??'?')+' mm</span></div><div class="v2-order-actions"><button type="button" data-order-review>Uitkomst naar order →</button><a href="/admin/#orders/'+encodeURIComponent(o.id)+'/costs">Order openen ↗</a><details class="v2-order-more"><summary>Meer</summary><div><button type="button" data-order-load>Ordergegevens opnieuw laden</button><button type="button" data-order-unlink>Koppeling losmaken</button></div></details></div>';
}
function bind(value){target=value;showContext();updateUrl();}
function reset(){if(busy)return;target=null;showContext();updateUrl();}
g.addEventListener('crm-v2-reset',reset);g.addEventListener('crm-costing-change',syncPrimary);
async function loadTarget(value,{initial=false}={}){
 if(busy)return;const original=serial();busy=true;let db;
 try{
 db=await connection();const next=orderTarget(await read(db),value.order.id,value.item.id);let quote;
 if(!next.item.costCalculation&&next.item.costQuoteLink?.quoteId)quote=await readCostQuote(next.item.costQuoteLink.quoteId);
 if(serial()!==original)throw Error('De berekening is intussen gewijzigd. Kies Ordergegevens laden opnieuw.');
 const seeded=seedOrderCalculation(next,{Core:g.QuoteCalculatorCore,check:g.GasketV2Storage.check,quote});
 if(serial()!==original)throw Error('De berekening is intussen gewijzigd. Laad de gegevens opnieuw.');
 api.importState(seeded.inputs);bind(next);
 g.dispatchEvent(new CustomEvent('crm-v2-source-loaded',{detail:{snapshot:serial(),label:seeded.stored?'Bewaarde orderberekening geladen':'Ordergegevens geladen · nog niet berekend'}}));status.textContent=seeded.warning;
 }catch(e){status.textContent=e.message;if(initial){target=null;showContext();}}finally{busy=false;db?.close();}
}
function confirmLoad(){if(!target||busy)return;const chosen=target,view=modal('Ordergegevens laden');view.body.innerHTML='<p>Dit vervangt de huidige rekeninvoer door de bewaarde berekening of productgegevens van order #'+esc(chosen.order.sourceNumber||chosen.order.number||chosen.order.id)+'.</p><p>Bewaar je huidige invoer eerst als je die wilt houden. Er wordt niets in de order opgeslagen.</p><button type="button" data-load>Ordergegevens laden</button>';view.body.querySelector('[data-load]').onclick=()=>{view.close();loadTarget(chosen);};}
async function pickOrder(){
 if(busy||document.querySelector('[data-order-dialog]'))return;const view=modal('Order kiezen'),body=view.body;body.innerHTML='<p>Orders laden…</p>';let db;
 try{
 db=await connection();const state=await read(db);if(!view.isActive())return;
 const customers=(state.customers||[]).filter(c=>!c.archived).sort((a,b)=>String(a.company).localeCompare(String(b.company),'nl'));
 body.innerHTML='<p>Kies een bestaande order en productregel. Koppelen bewaart nog niets en laat je huidige berekening staan.</p><label>Klant<select name="customer"><option value="">Kies een klant</option>'+customers.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.company||c.contact||'Klant')+'</option>').join('')+'</select></label><label>Order<select name="order" disabled><option value="">Kies eerst een klant</option></select></label><label>Productregel<select name="item" disabled><option value="">Kies eerst een order</option></select></label><p role="status" data-info></p><p role="alert" data-error></p><button type="button" data-bind disabled>Deze productregel koppelen</button>';
 const field=name=>body.querySelector('[name='+name+']'),button=body.querySelector('[data-bind]'),info=body.querySelector('[data-info]');
 field('customer').onchange=()=>{const orders=state.orders.filter(o=>o.customerId===field('customer').value&&!o.archived);field('order').innerHTML='<option value="">Kies een order</option>'+orders.map(o=>'<option value="'+esc(o.id)+'">#'+esc(o.sourceNumber||o.number||o.id)+' · '+esc(o.stage||'Order')+'</option>').join('');field('order').disabled=!orders.length;field('item').innerHTML='<option value="">Kies eerst een order</option>';field('item').disabled=true;button.disabled=true;info.textContent=orders.length?'':field('customer').value?'Bij deze klant staan nog geen actieve orders. Maak eerst een order aan in het CRM.':'';};
 field('order').onchange=()=>{const order=state.orders.find(o=>o.id===field('order').value);field('item').innerHTML='<option value="">Kies een productregel</option>'+(order?.items||[]).map(i=>'<option value="'+esc(i.id)+'">'+esc(i.description)+' · '+esc(i.quantity)+' stuks · '+esc(i.width??'?')+' × '+esc(i.height??'?')+' mm</option>').join('');field('item').disabled=!order?.items.length;button.disabled=true;info.textContent=order&&!order.items.length?'Deze order heeft nog geen productregels. Voeg die eerst toe in het CRM.':'';};
 field('item').onchange=()=>{button.disabled=!field('item').value;info.textContent=field('item').value?'Je kunt daarna de ordergegevens laden of je huidige uitkomst controleren.':'';};
 button.onclick=async()=>{if(busy||!field('item').value)return;button.disabled=true;busy=true;try{const fresh=await read(db);if(!view.isActive())return;bind(orderTarget(fresh,field('order').value,field('item').value));status.textContent='Productregel gekoppeld. Je huidige berekening is behouden; er is nog niets in de order opgeslagen.';busy=false;view.close();}catch(e){body.querySelector('[data-error]').textContent=e.message;}finally{busy=false;button.disabled=false;}};
 }catch(e){if(view.isActive())body.textContent=e.message;}finally{if(!view.isActive())db?.close();else view.d.addEventListener('close',()=>db?.close(),{once:true});}
}
function review(){
 if(!target||busy||document.querySelector('[data-order-dialog]'))return;
 let record;try{g.GasketV2Storage.check(api.exportState());record=orderCalculationRecord(api.calculate());}catch(e){status.textContent=e.message;const notice=modal('Berekening nog niet klaar');notice.body.innerHTML='<p>'+esc(e.message)+'</p><button type="button" data-fix>Verder rekenen</button>';notice.body.querySelector('[data-fix]').onclick=()=>{notice.close();document.getElementById('resultaten').scrollIntoView({behavior:'smooth'});};return;}
 const snapshot=serial(),chosen=target,p=record.inputs.pieces[0],i=chosen.item,o=chosen.order,qty=record.result.quantity,shape=p.shape==='circle',w=shape?p.outerDiameter:p.width,h=shape?p.outerDiameter:p.height;
 const row=(label,old,next)=>'<tr><th scope="row">'+label+'</th><td>'+esc(old)+'</td><td>'+esc(next)+'</td></tr>';
 const view=modal('Uitkomst naar order'),body=view.body;
 body.innerHTML='<p><strong>Order #'+esc(o.sourceNumber||o.number||o.id)+' · '+esc(chosen.customer?.company||'Klant')+'</strong><br>'+esc(i.description)+'</p><div class="v2-order-review-table"><table><thead><tr><th>Gegeven</th><th>In de order</th><th>Deze berekening</th></tr></thead><tbody>'+row('Aantal',i.quantity,qty)+row('Buitenmaat mm',(i.width??'?')+' × '+(i.height??'?'),w+' × '+h)+row('Materiaal / dikte',(i.material||'?')+' / '+(i.thickness??'?')+' mm',p.material+' / '+p.thickness+' mm')+row('Directe kostprijs / stuk',money(i.cost),money(Math.round(record.result.directCostInCents/qty)))+row('Verkoopprijs / stuk excl. btw',money(i.price),money(Math.round(record.result.salePriceInCents/qty)))+'</tbody></table></div><p class="v2-note">Leverancier: '+esc(record.result.supplier)+'. Gekozen vorm, contour en gatposities worden bij de berekening bewaard. Transport, invoer en overige kosten ('+money(record.result.transportInCents+record.result.dutyInCents+record.result.otherInCents)+') blijven buiten de directe productkostprijs.</p><form><label class="v2-save-confirm"><input type="checkbox" name="product" checked>Aantal, maten, materiaal en dikte overnemen</label><label class="v2-save-confirm"><input type="checkbox" name="cost" '+(i.costSource==='supplierInvoice'?'disabled':'checked')+'>Directe kostprijs overnemen'+(i.costSource==='supplierInvoice'?' · geblokkeerd: afkomstig uit leveranciersfactuur':'')+'</label><label class="v2-save-confirm"><input type="checkbox" name="sale" '+(o.packagePrice!=null?'disabled':'')+'>Verkoopprijs overnemen'+(o.packagePrice!=null?' · deze order heeft een totaalprijs':'')+'</label>'+(record.inputs.scenarios.find(s=>s.id===record.selectedScenarioId).costSource!=='calculated'?'<label class="v2-save-confirm"><input type="checkbox" name="supplier" required>De leveranciersofferte geldt voor deze maten en aantallen.</label>':'')+'<p role="alert"></p><button type="submit">Bevestigen &amp; in order opslaan</button></form>';
 const form=body.querySelector('form'),field=n=>form.querySelector('[name='+n+']');
 form.onsubmit=async e=>{
 e.preventDefault();if(busy||!form.reportValidity())return;busy=true;const submit=form.querySelector('[type=submit]'),error=form.querySelector('[role=alert]');submit.disabled=true;submit.textContent='Orderberekening opslaan…';let db;
 try{
 db=await connection();const saved=await saveOrderCalculation(db,{binding:chosen.binding,record,options:{copyProduct:field('product').checked,copyCost:field('cost').checked&&!field('cost').disabled,copySale:field('sale').checked&&!field('sale').disabled,confirmSupplierQuote:field('supplier')?.checked||false},isCurrent:()=>serial()===snapshot});
 bind(saved);g.dispatchEvent(new CustomEvent('crm-v2-saved',{detail:{snapshot,customer:'order #'+(saved.order.sourceNumber||saved.order.number||saved.order.id)}}));
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('maatwerkkunststof-crm-changes'):null;channel?.postMessage('changed');channel?.close();
 body.innerHTML='<h3>✓ Berekening bewaard in order #'+esc(saved.order.sourceNumber||saved.order.number||saved.order.id)+'</h3><p>De volledige vorm en de gekozen prijsvelden zijn opgeslagen.</p><div class="v2-modal-actions"><a href="/admin/#orders/'+encodeURIComponent(saved.order.id)+'/costs">Terug naar order →</a><button type="button" data-done>Verder rekenen</button></div>';body.querySelector('[data-done]').onclick=view.close;status.textContent='V2-berekening opgeslagen bij de gekozen productregel.';
 }catch(e){error.textContent=e.message;submit.disabled=false;submit.textContent='Opnieuw controleren & opslaan';}finally{busy=false;db?.close();}
 };
}
document.addEventListener('click',event=>{const button=event.target.closest('#v2-order-link,[data-order-load],[data-order-review],[data-order-unlink]');if(!button)return;event.preventDefault();if(busy)return;if(button.id==='v2-order-link')pickOrder();else if(button.hasAttribute('data-order-load'))confirmLoad();else if(button.hasAttribute('data-order-review'))review();else reset();});
const query=new URLSearchParams(location.search);
if(query.has('orderId')||query.has('itemId')){
 const initial=serial();let db;
 try{db=await connection();const value=orderTarget(await read(db),query.get('orderId'),query.get('itemId'));if(serial()!==initial)throw Error('Je hebt de berekening al aangepast. Kies Aan order koppelen om de order bewust te selecteren.');await loadTarget(value,{initial:true});}catch(e){status.textContent=e.message;}finally{db?.close();}
}
