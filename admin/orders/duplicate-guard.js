import {duplicateOrders,duplicatePayments,duplicateCustomers} from '../../shared/duplicate-records.js?v=duplicate-review-20261028';
export function createDuplicateGuard(context){
 const reviews=new WeakMap();
 return function guard(next,before,{allowDuplicateOrders=false,allowDuplicatePayments=false}={}){
  const messages=[];
  for(const customer of next.customers.filter(c=>!before.customers.has(c.id)))for(const other of duplicateCustomers(next,customer))messages.push({id:other.id,kind:'customers',text:`${other.company} bestaat al met dezelfde naam, e-mail of telefoon. Kies de bestaande klant als dit dezelfde relatie is.`});
  for(const order of next.orders.filter(o=>!before.orders.has(o.id))){
   if(allowDuplicateOrders)continue;
   for(const {order:other,reasons} of duplicateOrders(next,order))messages.push({id:other.id,text:`Order #${other.sourceNumber||other.number}: ${reasons.join('; ')}. Controleer of dit werkelijk een tweede bestelling is.`});
  }
  for(const payment of next.payments.filter(p=>!allowDuplicatePayments&&!before.payments.has(p.id)&&p.source!=='tikkie'&&!String(p.externalId||'').startsWith('tikkie:')))for(const other of duplicatePayments(next,payment)){
   const order=next.orders.find(o=>o.id===other.orderId);messages.push({id:other.orderId,text:`${context.euro(other.amount)} op ${context.date(other.date)} staat al bij order #${order?.sourceNumber||order?.number}. Controleer de bankontvangst; een factuur is geen tweede betaling.`});
  }
  if(!messages.length)return;
  const form=context.$('#dialog[open] form[aria-busy=true]');
  const clean=value=>Array.isArray(value)?value.map(clean):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>!['id','provenance','registeredAt','createdAt'].includes(key)).map(([key,v])=>[key,clean(v)])):value;
  const semantic={customers:next.customers.filter(c=>!before.customers.has(c.id)).map(clean),orders:next.orders.filter(o=>!before.orders.has(o.id)).map(o=>clean({...o,customerId:before.customers.has(o.customerId)?o.customerId:'new-customer'})),payments:next.payments.filter(p=>!before.payments.has(p.id)).map(p=>clean({...p,orderId:before.orders.has(p.orderId)?p.orderId:'new-order'}))};
  const basis=JSON.stringify([messages,semantic]),saved=form&&reviews.get(form);
  if(saved?.basis===basis&&saved.box.querySelector('input').checked)return;
  if(form){
   saved?.box.remove();const box=document.createElement('section');box.className='notice duplicate-review';box.setAttribute('role','alert');
   box.innerHTML=`<h3>Mogelijke dubbele registratie</h3><ul>${messages.map(m=>`<li>${context.esc(m.text)} <a href="#${m.kind||'orders'}/${context.esc(m.id)}" target="_blank" rel="noopener">Bestaand dossier bekijken ↗</a></li>`).join('')}</ul><label class="check-row"><input type="checkbox"><span>Gecontroleerd: dit is bewust een aparte klant, bestelling of werkelijk apart ontvangen betaling.</span></label>`;
   form.querySelector('.dialog-body').prepend(box);reviews.set(form,{basis,box});box.scrollIntoView({block:'nearest'});
   if(!saved){const reset=event=>{const current=reviews.get(form)?.box;if(current&&!current.contains(event.target))current.querySelector('input').checked=false;};form.addEventListener('input',reset);form.addEventListener('change',reset);}
  }
  throw Error('Mogelijke dubbele registratie. Bekijk de bestaande order(s) en bevestig alleen als dit bewust apart is. Je invoer blijft staan.');
 };
}
export const duplicateBaseline=state=>({customers:new Set(state.customers.map(c=>c.id)),orders:new Set(state.orders.map(o=>o.id)),payments:new Set(state.payments.map(p=>p.id))});
