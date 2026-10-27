const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,id)=>`<button type="button" data-funnel-action="${esc(action)}" data-id="${esc(id)}">${esc(label)}</button>`;

export function taskListMarkup(queue){
 const card=t=>`<article class="work-task ${t.priority==='hoog'?'work-task-high':''}">
  <div class="work-task-case"><a href="#orders/${esc(t.orderId)}">#${esc(t.number)} · ${esc(t.customer)}</a><small>${esc(t.phase)}</small></div>
  <div class="work-task-content">
   <h3>${esc(t.title)}</h3>
   <p>${esc(t.reason)}</p>${t.gaps?.length?`<small class="task-missing">Nog te controleren: ${t.gaps.map(c=>esc(c.label)).join(' · ')}</small>`:''}
  </div>
  <div class="task-attention"><span class="task-priority ${t.priority==='hoog'?'task-priority-high':''}" title="${esc(t.priorityReason||'Geen verhoogde prioriteit')}">${t.priority==='hoog'?'Hoog':'Normaal'}</span><span>${esc(t.waitLabel)}</span></div>
  <div class="actions">${button(t.action,t.label,t.orderId)}<details class="quiet-menu"><summary>Meer</summary><div><a href="#orders/${esc(t.orderId)}/mail">Mailgesprek openen</a>${['pricing','new'].includes(t.kind)?button('indication','Prijsindicatie opstellen',t.orderId):''}${button('phase','Fase bijwerken',t.orderId)}</div></details></div>
 </article>`;
 return `<section class="panel work-queue"><div class="section-heading"><div><h2>Te doen</h2><p>${queue.tasks.length} ${queue.tasks.length===1?'taak':'taken'} · ${queue.high} met hoge prioriteit</p></div></div>
  ${queue.tasks.length?'<div class="work-task-head" aria-hidden="true"><span>Dossier</span><span>Volgende stap</span><span>Prioriteit / wachttijd</span><span>Actie</span></div>':''}<div class="work-task-list">${queue.tasks.slice(0,6).map(card).join('')||'<p class="muted">Geen open taken gevonden.</p>'}</div>
  ${queue.tasks.length>6?`<details class="work-more-tasks"><summary>Meer taken (${queue.tasks.length-6})</summary><div class="work-task-list">${queue.tasks.slice(6).map(card).join('')}</div></details>`:''}
  ${queue.waiting.length?`<details class="work-waiting"><summary>Overige lopende dossiers (${queue.waiting.length})</summary>${queue.waiting.map(t=>`<div class="work-waiting-row"><a href="#orders/${esc(t.orderId)}">#${esc(t.number)} · ${esc(t.customer)}</a><span>${esc(t.phase)} · ${esc(t.waitLabel)}</span>${button(t.action,t.label,t.orderId)}</div>`).join('')}</details>`:''}
  <details class="work-priority-help"><summary>Waar komt de prioriteit vandaan?</summary><p>Verstreken leverdatums, onzekere verzendingen, ontvangen betalingen, nieuwe reacties en aanvragen vanaf 3 dagen oud krijgen aandacht. De wachttijd volgt geregistreerde mail; zonder maildatum zie je de leeftijd van de aanvraag. Controleer nieuwe mail vóór opvolgen.</p></details>
 </section>`;
}
