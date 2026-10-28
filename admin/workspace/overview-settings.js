import {sectionTabsMarkup,syncSectionTabs} from './section-tabs.js?v=calm-workspaces-20261027';
import {keyFactsMarkup} from './key-facts.js?v=calm-workspaces-20261027';
// Same current application state and existing forms; no settings/draft store.
export function createOverviewSettings(context){
 function renderSettings(){
  const {state,esc,button,runtime}=context;
  const tabs=[
   {key:'gmail',label:'Gmail',content:context.inboxUI.settingsMarkup()},
   {key:'sending',label:'Verzenden & handtekening',content:context.emailSettingsMarkup(runtime,context.company)},
   {key:'templates',label:'Mailtemplates',content:context.templatesUI.settingsMarkup()},
   {key:'mobile',label:'Telefoon & meldingen',content:context.mobileNotifications.markup()},
   {key:'preferences',label:'Voorkeuren',content:context.usageUI.markup().replace('data-ux-usage>','data-ux-usage open>')},
   {key:'backup',label:'Back-up & herstel',content:`<section class="panel"><h2>${runtime.mode==='cloud'?'Back-up van centrale opslag':'Opslag in deze browser'}</h2><p>${runtime.mode==='cloud'?'Klanten, orders en betalingen worden centraal opgeslagen. Een volledige back-up bevat ook je bestanden, feedback, opgeslagen '+(context.company.tool==='design'?'ontwerpen':'berekeningen')+' en het bouwlog.':'Gegevens en bestanden staan in deze browser. Browsergegevens wissen verwijdert deze opslag. Maak regelmatig een volledige back-up, ook van je '+(context.company.tool==='design'?'ontwerpen':'berekeningen')+'.'}</p><div class="actions">${button('export','Download volledige back-up','',true)}${button('import','Back-up terugzetten')}</div></section>${context.migrationPanel(runtime)}`},
   {key:'archive',label:'Archief',content:`<section class="panel"><h2>Gearchiveerd</h2>${[...state.customers.filter(c=>c.archived).map(c=>`<p>Klant: ${esc(c.company)} ${button('restore-customer','Herstellen',c.id)}</p>`),...state.orders.filter(o=>o.archived).map(o=>`<p>Order #${esc(o.number)} ${button('restore-order','Herstellen',o.id)}</p>`)].join('')||'<p class="muted">Geen gearchiveerde gegevens.</p>'}</section>`}
  ];
  const key=tabs.some(tab=>tab.key===context.route()[1])?context.route()[1]:'gmail';
  const mounted=document.querySelector('[data-section-workspace="settings"]');
  if(mounted&&context.hasActiveFormEdits(mounted)){
   // A template/archive action can render while another tab still has a dirty
   // or busy mail form. Refresh only these read-only lists, never that form.
   for(const tab of tabs.filter(tab=>['templates','archive'].includes(tab.key)))mounted.querySelector(`[data-section-panel="${tab.key}"]`).innerHTML=tab.content;
   context.templatesUI.installSettings(mounted);syncSectionTabs(document.querySelector('#app'),'settings',key);return;
  }
  context.shell(context.heading('Instellingen','Kies wat je wilt aanpassen.')+sectionTabsMarkup('settings',tabs,key,'Instellingen'),'settings',{section:key,facts:{archivedCustomerCount:state.customers.filter(c=>c.archived).length,archivedOrderCount:state.orders.filter(o=>o.archived).length}});
 }
 function renderDashboard(){
  const {state,esc,button,euro}=context,queue=context.funnelUI.queue(),active=state.orders.filter(o=>!o.archived&&o.stage!=='Afgerond');
  const outstanding=state.orders.filter(o=>!o.archived).reduce((sum,o)=>sum+Math.max(0,context.totals(o).balance),0),incomplete=state.orders.some(o=>!o.archived&&(!context.totals(o).priceKnown||o.shippingKnown!==true));
  const cards=keyFactsMarkup([
   {label:'Te doen',value:queue.tasks.length,detail:queue.high?queue.high+' met prioriteit':'Jouw volgende acties',href:'#dashboard/tasks'},
   {label:'Lopende dossiers',value:active.length,detail:'Aanvragen en orders',href:'#dashboard/orders'},
   {label:'Te ontvangen incl. btw',value:incomplete?(outstanding>0?euro(outstanding)+' · voorlopig':'Nog te bepalen'):euro(outstanding),detail:incomplete?'Prijsafspraken nog niet compleet':'Van niet-gearchiveerde dossiers',href:'#analytics/financial'}
  ],{esc,label:'Vandaag in één oogopslag'});
  const tabs=[
   {key:'tasks',label:'Te doen'+(queue.tasks.length?' ('+queue.tasks.length+')':''),content:context.funnelUI.priorities()},
   {key:'orders',label:'Lopende orders ('+active.length+')',content:`<section class="panel"><div class="section-heading"><h2>Lopende aanvragen & orders</h2><a href="#orders">Alle aanvragen & orders →</a></div>${context.ordersTable(context.sortedOrders(active))}</section>`},
   {key:'activity',label:'Activiteiten',content:`<section class="panel"><h2>Recente activiteiten</h2>${state.activities.slice(0,10).map(a=>`<div class="activity">${esc(a.message)}<small>${new Date(a.time).toLocaleString('nl-NL')}</small></div>`).join('')||'<p class="muted">Je activiteiten verschijnen hier zodra je begint.</p>'}</section>`}
  ];
  const key=tabs.some(tab=>tab.key===context.route()[1])?context.route()[1]:'tasks';
  context.shell(context.heading('Overzicht','Wat vraagt jouw aandacht?',button('new-order','Nieuwe klantorder','',true)+`<details class="quiet-menu"><summary>Meer</summary><div>${button('new-customer','Nieuwe klant')}${button('ai-customer','AI prompt')}</div></details>`)+cards+sectionTabsMarkup('dashboard',tabs,key,'Overzicht'),'dashboard',{section:key,facts:{openOrderCount:active.length,actionCount:queue.tasks.length,highPriorityCount:queue.high,pricingActionCount:queue.pricing,followupActionCount:queue.followup,outstandingInCents:outstanding,inProductionCount:active.filter(o=>o.stage==='In productie').length,...(context.company.tool==='design'?{waitingApprovalCount:active.filter(o=>o.stage==='Wachten op goedkeuring').length}:{})},visible:{entity:'order',ids:[...new Set([...queue.tasks.map(t=>t.orderId),...context.sortedOrders(active).map(o=>o.id)])].slice(0,20),total:active.length}});
 }
 return {renderSettings,renderDashboard};
}
