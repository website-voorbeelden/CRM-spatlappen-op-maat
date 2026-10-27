import {navigationIcon} from './navigation-icons.js?v=payments-overview-20261027';
// Navigation belongs to the workspace; existing route IDs remain stable.
export function navigationGroups(company) {
 return [
  {id:'daily',label:'Werkdag',links:[['dashboard','Overzicht','⌂'],['mail','E-mail','✉']]},
  {id:'sales',label:'Verkoop & relaties',links:[['orders','Aanvragen & orders','▤'],['payments','Betalingen','€'],['customers','Klanten','♙'],['order-map','Orderkaart','◇']]},
  {id:'operations',label:'Uitvoering',links:[['purchases','Inkoopbestellingen','⇣'],['inventory','Voorraad','▦'],['designs',company.toolLabel,company.tool==='design'?'✎':'∑']]},
  {id:'management',label:'Beheer',links:[['analytics','Analytics','◴'],['feedback','Feedback','☏'],['development','Bouwtaken','≡'],['settings','Instellingen & back-up','⚙']]}
 ];
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function navigationMarkup({company,page,ordersNavigation=''}) {
 return navigationGroups(company).map(group=>`<section class="workspace-nav-group" aria-labelledby="nav-${group.id}"><h2 id="nav-${group.id}">${esc(group.label)}</h2>${group.links.map(([id,label])=>`<div class="sidebar-entry"><a href="#${id}" title="${esc(label)}" aria-label="${esc(label)}" ${page===id?'class="active" aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${navigationIcon(id)}</span><span class="nav-label">${esc(label)}</span></a>${id==='orders'?ordersNavigation:''}</div>`).join('')}</section>`).join('');
}
export function workspaceContextMarkup({company,page}){
 const label=navigationGroups(company).flatMap(group=>group.links).find(([id])=>id===page)?.[1]||'CRM';
 return `<div class="workspace-context"><span class="workspace-module">${esc(label)}</span><span class="workspace-company">${esc(company.name)}</span></div>`;
}
