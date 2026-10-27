import {financialGroups} from '../../shared/financial-chart.js';
let dimension='month',metric='revenue';
export function financialChartMarkup(){return '<section class="order-surface analytics-financial-panel"><div class="section-heading"><div><h2>Waar komt het resultaat vandaan?</h2><p class="form-help">Klik op een regel voor de bijbehorende dossiers. De gekozen periode geldt voor alle groepen, inclusief archief.</p></div></div><div data-financial-chart><div class="fields analytics-chart-filters"><label>Groeperen op<select data-chart-dimension><option value="month">Maand</option><option value="customer">Klant</option><option value="purchase">Inkoopbatch</option><option value="country">Land klant</option></select></label><label>Vergelijken<select data-chart-metric><option value="revenue">Orderwaarde excl. btw</option><option value="count">Aantal dossiers</option><option value="margin">Marge excl. btw</option></select></label></div><div data-chart-results></div></div></section>';}
export function mountFinancialChart(root,{state,orders,totals,economics,euro,esc,onDrilldown}){
 if(!root)return;root.querySelector('[data-chart-dimension]').value=dimension;root.querySelector('[data-chart-metric]').value=metric;let groups=[];
 function draw(){
  groups=financialGroups(state,orders,{dimension,metric,totals,economics});const max=Math.max(1,...groups.map(g=>Math.abs(g.value)));
  const row=(g,index)=>{
   const label=dimension==='month'&&/^\d{4}-\d{2}$/.test(g.label)?new Date(g.label+'-01T12:00:00').toLocaleDateString('nl-NL',{month:'long',year:'numeric'}):g.label;
   const value=(!g.known?(g.value?'Voorlopig ':'Nog te bepalen'):'')+(g.known||g.value?(metric==='count'?String(g.value):euro(g.value)):'');
   return `<button type="button" class="analytics-financial-row ${g.value<0?'is-negative':''}" data-chart-group="${index}"><span class="analytics-financial-label"><strong>${esc(label)}</strong><small>${g.orderIds.length} dossier${g.orderIds.length===1?'':'s'}</small><meter min="0" max="${max}" value="${Math.abs(g.value)}" aria-label="${esc(label+': '+value)}">${esc(value)}</meter></span><strong>${esc(value)}</strong><span class="analytics-row-arrow" aria-hidden="true">→</span></button>`;
  };
  const cutoff=dimension==='month'?Math.max(0,groups.length-12):Math.min(10,groups.length),visible=dimension==='month'?groups.slice(cutoff):groups.slice(0,cutoff),more=dimension==='month'?groups.slice(0,cutoff):groups.slice(cutoff);
  root.querySelector('[data-chart-results]').innerHTML=visible.map(g=>row(g,groups.indexOf(g))).join('')+(more.length?`<details class="website-details"><summary>${dimension==='month'?'Eerdere maanden':'Overige groepen'} (${more.length})</summary>${more.map(g=>row(g,groups.indexOf(g))).join('')}</details>`:'')+(groups.length?'':'<p class="muted">Geen dossiers in deze periode. Kies een andere periode of <a href="#orders">open aanvragen & orders</a>.</p>');
 }
 root.addEventListener('change',event=>{if(event.target.matches('[data-chart-dimension]'))dimension=event.target.value;else if(event.target.matches('[data-chart-metric]'))metric=event.target.value;else return;draw();});
 root.addEventListener('click',event=>{const b=event.target.closest('[data-chart-group]');if(!b)return;const group=groups[Number(b.dataset.chartGroup)];if(group)onDrilldown(group);});draw();
}
