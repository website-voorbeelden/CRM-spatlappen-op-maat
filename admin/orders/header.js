import {orderProgressDetailsMarkup} from './progress.js?v=feedback-followup-20261028';
import {orderKeyFactsMarkup} from './key-facts.js?v=feedback-followup-20261028';
import {revealSelectedTab} from '../workspace/tab-visibility.js?v=calm-workspaces-20261027';

// Shared presentation for every dossier tab. Actions keep their existing routes.
export function orderHeaderMarkup(context,o,{customer,totals,tab,views}){
 const id=context.esc(o.id),number=context.esc(o.sourceNumber||o.number);
 const tabs=views.map(([key,label])=>`<button type="button" id="order-tab-${key}" role="tab" aria-controls="order-content" tabindex="${tab===key?0:-1}" aria-selected="${tab===key}" class="${tab===key?'selected':''}" data-action="order-tab" data-id="${key}">${label}</button>`).join('');
 return `<header class="dossier-header order-dossier-header">
  <div class="breadcrumb"><a href="#orders">← Aanvragen & orders</a></div>
  <div class="order-header">
   <div class="order-header-title"><h1>${context.esc(customer?.company||'Klantorder')}</h1><p><span>Order #${number}</span> <span>Aangemaakt ${context.date(o.date)}</span>${o.archived?' <span>Gearchiveerd</span>':''}</p></div>
   <div class="actions">${context.button('edit-order','Order bewerken',o.id)}<details class="order-more"><summary>Meer</summary><div><button type="button" data-order-history aria-controls="order-phase-history" aria-expanded="false">Fases & voortgang bekijken</button>${context.orderTerms.button(o.id)}${context.button('invoice-mail-start','Factuur mailen',o.id)}${context.button('quote','Offerte maken',o.id)}${context.button('payment','Betaling registreren',o.id)}${context.button('planning','Datums aanpassen',o.id)}${context.button('duplicate','Dupliceren',o.id)}${context.button('order-ai-update','Aanvullen met AI',o.id)}${context.button('merge-order','Vergelijken en samenvoegen',o.id)}${context.button('order-merge-history','Samenvoeghistorie',o.id)}${context.button('archive-order','Archiveren',o.id)}<button type="button" class="delete-order-action" data-action="delete-order" data-id="${id}">Verwijderen</button></div></details></div>
  </div>
  ${orderKeyFactsMarkup(context,o,totals)}
  <details class="order-header-history" id="order-phase-history" hidden><summary>Fases & voortgang</summary>${orderProgressDetailsMarkup(context,o,tab)}</details>
  <div class="order-tabs" role="tablist" aria-label="Orderonderdelen">${tabs}</div>
 </header>`;
}

// One mount per new dossier shell; disclosure state stays in this DOM only.
export function installOrderHeader(root){
 const history=root?.querySelector('.order-header-history'),historyButton=root?.querySelector('[data-order-history]');
 if(history&&historyButton){
  historyButton.onclick=()=>{history.hidden=false;history.open=true;historyButton.setAttribute('aria-expanded','true');history.querySelector(':scope>summary')?.focus({preventScroll:true});};
  history.addEventListener('toggle',()=>{historyButton.setAttribute('aria-expanded',String(history.open));if(!history.open){const focused=history.contains(document.activeElement);history.hidden=true;if(focused)historyButton.closest('details.order-more')?.querySelector(':scope>summary')?.focus({preventScroll:true});}});
 }
 revealOrderTab(root);
}

// Tabs stay on one row. Keep the active tab visible after the existing shell
// rerender, without scrolling the page or moving keyboard focus.
export function revealOrderTab(root){
 revealSelectedTab(root);
}
