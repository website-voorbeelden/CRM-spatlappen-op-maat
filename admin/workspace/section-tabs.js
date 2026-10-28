import {revealSelectedTab} from './tab-visibility.js?v=calm-workspaces-20261027';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keyFor=(tabs,key)=>tabs.some(tab=>tab.key===key)?key:tabs[0].key;
// Panels stay mounted. Changing a tab never replaces a form or its draft.
export function sectionTabsMarkup(page,tabs,requested,label){
 const active=keyFor(tabs,requested);
 return `<div data-section-workspace="${esc(page)}" data-section-active="${esc(active)}"><div class="order-tabs section-tabs" role="tablist" aria-label="${esc(label)}">${tabs.map(tab=>`<button type="button" role="tab" id="${page}-section-tab-${tab.key}" aria-controls="${page}-section-${tab.key}" aria-selected="${tab.key===active}" tabindex="${tab.key===active?'0':'-1'}" class="${tab.key===active?'selected':''}" data-section-tab="${tab.key}" data-section-page="${page}">${tab.label}</button>`).join('')}</div>${tabs.map(tab=>`<section role="tabpanel" id="${page}-section-${tab.key}" aria-labelledby="${page}-section-tab-${tab.key}" data-section-panel="${tab.key}" ${tab.key===active?'':'hidden'}>${tab.content}</section>`).join('')}</div>`;
}
export function syncSectionTabs(root,page,requested){
 if(!['dashboard','settings'].includes(page))return null;
 const workspace=root.querySelector(`[data-section-workspace="${page}"]`);if(!workspace)return null;
 const tabs=[...workspace.querySelectorAll('[data-section-tab]')],active=tabs.find(tab=>tab.dataset.sectionTab===requested)||tabs[0];
 if(!active)return null;const key=active.dataset.sectionTab,focusTab=root.contains(document.activeElement)&&document.activeElement.matches('[data-section-tab]');
 workspace.dataset.sectionActive=key;
 for(const tab of tabs){const selected=tab===active;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;tab.classList.toggle('selected',selected);}
 for(const panel of workspace.querySelectorAll('[data-section-panel]'))panel.hidden=panel.dataset.sectionPanel!==key;
 if(focusTab)active.focus({preventScroll:true});
 revealSelectedTab(workspace);
 return key;
}
export function installSectionTabs(){
 document.addEventListener('click',event=>{const tab=event.target.closest('[data-section-tab]');if(tab)location.hash=tab.dataset.sectionPage+'/'+tab.dataset.sectionTab;});
 document.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-section-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();event.stopPropagation();const tabs=[...tab.closest('[role=tablist]').querySelectorAll('[data-section-tab]')],index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  tabs[next].focus({preventScroll:true});tabs[next].click();
 });
}
