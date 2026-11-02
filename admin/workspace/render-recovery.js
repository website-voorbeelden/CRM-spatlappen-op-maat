import {ordersRecoveryMarkup} from '../orders/list-recovery.js?v=orders-resilience-20261031';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// No raw exception messages, stacks, field values, storage or network requests.
// Constructing this factory does not render, read state or call a dependency.
export function createRenderRecovery({getRoot,getState,getRoute,canReplace,newOrder,retry,toast}){
 const reported=new Map(),retryRoots=new WeakSet();
 function report(error,scope='page'){
  const source=/^[a-z0-9-]{1,60}$/.test(scope)?scope:'page',kind=['TypeError','ReferenceError','RangeError','SyntaxError','Error'].includes(error?.name)?error.name:'Error',code='CRM-weergave / '+source+' / '+kind;
  const now=Date.now();if(now-(reported.get(code)||0)>2000){reported.set(code,now);if(reported.size>20)reported.delete(reported.keys().next().value);window.dispatchEvent(new CustomEvent('crm-feedback-action-error',{detail:{message:code,source:'render-recovery.js'}}));}
  return code;
 }
 function retryCurrentLink(root){
  if(retryRoots.has(root))return;retryRoots.add(root);
  root.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!root.querySelector('[data-render-recovery]'))return;
   const link=event.target.closest?.('a[href^="#"]');if(!link||link.getAttribute('href')!=='#'+getRoute().join('/'))return;
   event.preventDefault();if(!canReplace()){toast('Rond eerst je geopende invoer af.');return;}retry();
  });
 }
 function recover(error,{page,scope='page',route}={}){
  const code=report(error,scope);
  if(route&&getRoute().join('/')!==route)return;
  if(!canReplace()){toast('Dit scherm kon niet worden bijgewerkt. Je openstaande invoer blijft staan. Bewaar of sluit die eerst.');return;}
  const root=getRoot();if(!root){toast('De pagina kon niet worden getoond. '+code);return;}
  const orders=page==='orders',state=getState();
  let main=root.querySelector('main');
  if(!main){root.innerHTML='<div class="shell"><aside><a class="brand" href="#dashboard">CRM</a><nav><a href="#orders">Aanvragen & orders</a><a href="#customers">Klanten</a><a href="#dashboard">Start</a></nav></aside><main></main></div>';main=root.querySelector('main');}
  main.classList.remove('mail-focused-page','document-focused-page');
  main.innerHTML='<section class="panel" data-render-recovery><header class="page-heading"><div><h1>'+(orders?'Aanvragen & orders · eenvoudige weergave':'Dit onderdeel kon niet worden getoond')+'</h1><p class="notice" role="alert">'+(orders?'De uitgebreide weergave heeft een fout. Je kunt hieronder dossiers zoeken en een nieuwe klantorder maken.':'De weergave heeft een fout. Je kunt naar je orders gaan of een nieuwe klantorder maken.')+' Deze herstelweergave wijzigt geen opgeslagen gegevens.</p></div><div class="actions"><button type="button" class="primary" data-recovery-new>Nieuwe klantorder</button><details class="quiet-menu"><summary>Meer</summary><div><button type="button" data-recovery-retry>Normale weergave opnieuw proberen</button><button type="button" data-feedback-action="start">Feedback melden</button></div></details></div></header><div class="actions"><a class="button" href="#orders">Aanvragen & orders</a><a class="button" href="#customers">Klanten</a><a class="button" href="#dashboard">Start</a></div>'+(orders?ordersRecoveryMarkup(state):'')+'<details class="form-details"><summary>Informatie voor feedback</summary><p>'+esc(code)+'</p><p>Deze melding beschrijft een weergavefout, geen mislukte opslag.</p></details></section>';
  const panel=main.querySelector('[data-render-recovery]');
  retryCurrentLink(root);
  panel.querySelector('[data-recovery-new]').onclick=()=>{if(!canReplace()){toast('Rond eerst je geopende invoer af.');return;}try{newOrder();}catch(error){report(error,'new-order-form');toast('Het orderformulier kon niet worden geopend. Meld dit via Feedback; je gegevens zijn niet gewijzigd.');}};
  panel.querySelector('[data-recovery-retry]').onclick=()=>{if(!canReplace()){toast('Rond eerst je geopende invoer af.');return;}retry();};
  panel.querySelector('[data-recovery-search]')?.addEventListener('input',event=>{const query=event.target.value.trim().toLocaleLowerCase('nl-NL'),rows=[...panel.querySelectorAll('[data-order-recovery-row]')];let visible=0;for(const row of rows){row.hidden=!row.textContent.toLocaleLowerCase('nl-NL').includes(query);if(!row.hidden)visible++;}panel.querySelector('[data-recovery-empty]').hidden=visible>0||!rows.length;});
  for(const link of root.querySelectorAll('aside a[href^="#"]')){const active=link.getAttribute('href')==='#'+page;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
 }
 function run(work,{page=getRoute()[0]||'dashboard',scope='page'}={}){
  const route=getRoute().join('/');
  try{const result=work();if(result&&typeof result.then==='function')return result.catch(error=>{try{recover(error,{page,scope,route});}catch{toast('Deze pagina kon niet worden getoond. Er wordt niets automatisch herladen of opgeslagen.');}});return result;}
  catch(error){try{recover(error,{page,scope,route});}catch{toast('Deze pagina kon niet worden getoond. Er wordt niets automatisch herladen of opgeslagen.');}}
 }
 return {run,report};
}
