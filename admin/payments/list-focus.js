// A refresh replaces receipt rows, not the filters. Keep keyboard focus on
// the same receipt detail/link when it still exists in the current selection.
export function captureReceiptFocus(root){
 const active=document.activeElement,row=active?.closest?.('[data-payment-row]');
 if(!row||!root.contains(row))return null;
 const summary=active.closest('summary');
 if(summary&&row.contains(summary))return {id:row.dataset.paymentRow,summary:true};
 if(active.matches('a')){const href=active.getAttribute('href'),matches=[...row.querySelectorAll('a')].filter(link=>link.getAttribute('href')===href);return {id:row.dataset.paymentRow,href,occurrence:matches.indexOf(active)};}
 return null;
}
export function restoreReceiptFocus(root,focus){
 if(!focus)return;
 const row=[...root.querySelectorAll('[data-payment-row]')].find(row=>row.dataset.paymentRow===focus.id);
 const matches=[...row?.querySelectorAll('a')||[]].filter(link=>link.getAttribute('href')===focus.href);
 const target=focus.summary?row?.querySelector('summary'):matches[focus.occurrence]||matches[0];
 if(target)target.focus({preventScroll:true});
 else root.querySelector('[data-payment-filter="text"]')?.focus();
}
