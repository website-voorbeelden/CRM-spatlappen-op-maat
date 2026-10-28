import {installGmailLabelReview} from './gmail-label-review.js?v=feedback-followup-20261028';
import {mailThreadLabels,threadLabels,setThreadLabels} from '../../shared/mail-thread-labels.js?v=batch4-crm-20261026';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createThreadLabels({getState,mergeStoredState,toast,request,company}){
 const mounts=new WeakMap();
 function mount(host,{ownerId,key,thread,orderId}){
  if(!host||!ownerId)return;
  const instance={};mounts.set(host,instance);
  host.classList.add('thread-label-toolbar');host.setAttribute('role','group');host.setAttribute('aria-label','CRM-labels bij dit gesprek');
  host.innerHTML='<div class="thread-label-heading"><strong>Gesprekslabels</strong><span data-thread-label-badges></span></div><div class="thread-label-actions"><button type="button" data-thread-handled></button><details class="thread-label-options"><summary>Meer</summary><div class="thread-label-panel"><div class="thread-label-choices">'+mailThreadLabels.filter(([id])=>id!=='handled').map(([id,name])=>`<label class="check-row"><input type="checkbox" data-thread-label="${id}">${esc(name)}</label>`).join('')+'</div><details class="thread-label-explanation"><summary>Uitleg over deze labels</summary><p class="form-help">Deze labels gelden alleen in het CRM. Gmail-labels, verkoopfase en betaalstatus veranderen hierdoor niet. Nieuwe mail maakt Behandeld niet vanzelf ongedaan.</p></details></div></details></div><small data-thread-label-status role="status" aria-live="polite"></small>';
  const integration=document.createElement('details');integration.className='thread-label-settings';const integrationTitle=document.createElement('summary');integrationTitle.textContent='Gmail & fase-instellingen';const integrationBody=document.createElement('div');integration.append(integrationTitle,integrationBody);host.querySelector('.thread-label-panel').append(integration);
  if(orderId){const controls=document.createElement('div');controls.className='actions';controls.innerHTML=`<button type="button" data-phase-auto-review="${esc(orderId)}">Fasesynchronisatie controleren</button><button type="button" data-phase-auto-settings>Fasesynchronisatie instellen</button>`;integrationBody.append(controls);}
  installGmailLabelReview(integrationBody,{thread,orderId,request,company,getState});
  if(company.id==='maatwerkkunststof'&&orderId&&thread?.mailbox&&thread?.threadId){const button=document.createElement('button');button.type='button';button.dataset.gmailPhaseSync=orderId;button.textContent='CRM-fase naar Gmail bijwerken';integrationBody.append(button);}
  if(!integrationBody.childElementCount)integration.remove();
  // A display/compare basis only; canonical labels are read inside the existing transaction.
  let displayed=[...threadLabels(getState(),ownerId,key)],busy=false;
  const controls=[host.querySelector('[data-thread-handled]'),...host.querySelectorAll('[data-thread-label]')];
  const active=()=>mounts.get(host)===instance;
  function paint(){
   if(!active())return;
   host.querySelector('[data-thread-label-badges]').innerHTML=mailThreadLabels.filter(([id])=>displayed.includes(id)).map(([id,name])=>`<span class="badge ${id==='handled'?'green':''}">${esc(name)}</span>`).join('');
   const handled=controls[0];handled.textContent=displayed.includes('handled')?'Behandeld terugdraaien':'Markeren als behandeld';handled.setAttribute('aria-pressed',String(displayed.includes('handled')));
   for(const input of controls.slice(1))input.checked=displayed.includes(input.dataset.threadLabel);
  }
  async function toggle(id){
   if(busy||!active())return;
   busy=true;host.setAttribute('aria-busy','true');for(const control of controls)control.disabled=true;
   const status=host.querySelector('[data-thread-label-status]'),before=[...displayed],labels=before.includes(id)?before.filter(value=>value!==id):[...before,id];status.textContent='Label bewaren…';
   try{
    await mergeStoredState(state=>setThreadLabels(state,{ownerId,key,labels,expected:JSON.stringify(before)}));
    if(!active())return;
    displayed=[...threadLabels(getState(),ownerId,key)];status.textContent='Label in CRM bewaard.';
   }catch(error){
    if(!active())return;
    if(error.code==='THREAD_LABELS_CHANGED'){displayed=[...error.currentLabels];status.textContent='Labels zijn elders gewijzigd. Je ziet nu de actuele labels; kies je wijziging opnieuw. Je bericht blijft behouden.';}
    else{status.textContent=error.message||'Label bewaren lukt niet. Probeer opnieuw.';if(host.isConnected)toast(status.textContent);}
   }finally{
    busy=false;
    if(active()){host.removeAttribute('aria-busy');for(const control of controls)control.disabled=false;paint();}
   }
  }
  controls[0].onclick=()=>toggle('handled');for(const input of controls.slice(1))input.onchange=()=>toggle(input.dataset.threadLabel);paint();
 }
 return {mount};
}
