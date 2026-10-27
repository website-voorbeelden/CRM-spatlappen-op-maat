import {orderProgressMarkup} from './progress.js?v=ui-batch234-20261027';
import {orderMoneySummary} from './money-summary.js?v=ui-batch234-20261027';

// Shared presentation for every dossier tab. Actions keep their existing routes.
export function orderHeaderMarkup(context,o,{customer,totals,costs,wait,tab,views}){
 const id=context.esc(o.id),number=context.esc(o.sourceNumber||o.number);
 const tabs=views.map(([key,label])=>`<button type="button" id="order-tab-${key}" role="tab" aria-controls="order-content" tabindex="${tab===key?0:-1}" aria-selected="${tab===key}" class="${tab===key?'selected':''}" data-action="order-tab" data-id="${key}">${label}</button>`).join('');
 return `<header class="order-dossier-header">
  <div class="breadcrumb"><a href="#orders">← Aanvragen & orders</a></div>
  <div class="order-header">
   <div class="order-header-title"><h1>${context.esc(customer?.company||'Klantorder')}</h1><p><span>Order #${number}</span><span>${context.date(o.date)}</span>${context.badge(context.paymentStatus(o),totals.priceKnown&&o.shippingKnown===true&&totals.total>0&&totals.balance===0?'green':'orange')}</p></div>
   <div class="actions">${context.button('edit-order','Order bewerken',o.id)}<details class="order-more"><summary>Meer</summary><div>${context.orderTerms.button(o.id)}${context.button('invoice-mail-start','Factuur mailen',o.id)}${context.button('quote','Offerte maken',o.id)}${context.button('payment','Betaling registreren',o.id)}${context.button('planning','Datums aanpassen',o.id)}${context.button('duplicate','Dupliceren',o.id)}${context.button('archive-order','Archiveren',o.id)}<button type="button" class="delete-order-action" data-action="delete-order" data-id="${id}">Verwijderen</button></div></details></div>
  </div>
  <div class="order-context-bar"><section class="order-command order-progress" aria-label="Fase en voortgang">${orderProgressMarkup(context,o,tab)}</section>${orderMoneySummary(context,o,{totals,costs,wait})}</div>
  <div class="order-tabs" role="tablist" aria-label="Orderonderdelen">${tabs}</div>
 </header>`;
}

// Tabs stay on one row. Keep the active tab visible after the existing shell
// rerender, without scrolling the page or moving keyboard focus.
export function revealOrderTab(root){
 const list=root?.querySelector('.order-dossier-header [role=tablist]'),selected=list?.querySelector('[aria-selected=true]');
 if(!selected)return;
 const viewport=list.getBoundingClientRect(),item=selected.getBoundingClientRect();
 if(item.left<viewport.left)list.scrollLeft-=viewport.left-item.left+8;
 else if(item.right>viewport.right)list.scrollLeft+=item.right-viewport.right+8;
}
