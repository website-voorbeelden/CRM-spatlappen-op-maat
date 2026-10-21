import {installGmailLabelReview} from './gmail-label-review.js';
import {mailThreadLabels,threadLabels,setThreadLabels} from '../../shared/mail-thread-labels.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createThreadLabels({getState,mergeStoredState,toast,request,company}){
 function mount(host,{ownerId,key,thread,orderId}){
  if(!host||!ownerId)return;
  host.innerHTML='<div class="actions"><span data-thread-label-badges></span><button type="button" data-thread-handled></button><details class="quiet-menu"><summary>Labels</summary><div>'+mailThreadLabels.filter(([id])=>id!=='handled').map(([id,name])=>`<label class="check-row"><input type="checkbox" data-thread-label="${id}">${esc(name)}</label>`).join('')+'<p class="form-help">CRM-labels bij dit gesprek. Gmail, verkoopfase en betaalstatus blijven afzonderlijk.</p></div></details></div><small data-thread-label-status role="status"></small>';
  if(orderId){const controls=document.createElement('div');controls.className='actions';controls.innerHTML=`<button type="button" data-phase-auto-review="${esc(orderId)}">Fasesynchronisatie controleren</button><button type="button" data-phase-auto-settings>Fasesynchronisatie instellen</button>`;host.querySelector('details>div').append(controls);}
  installGmailLabelReview(host.querySelector('details>div'),{thread,orderId,request,company,getState});
  if(company.id==='maatwerkkunststof'&&orderId&&thread?.mailbox&&thread?.threadId){const button=document.createElement('button');button.type='button';button.dataset.gmailPhaseSync=orderId;button.textContent='CRM-fase naar Gmail bijwerken';host.querySelector('details>div').append(button);}
  let busy=false;
  const paint=()=>{const selected=threadLabels(getState(),ownerId,key);host.querySelector('[data-thread-label-badges]').innerHTML=mailThreadLabels.filter(([id])=>selected.includes(id)).map(([id,name])=>`<span class="badge ${id==='handled'?'green':''}">${esc(name)}</span>`).join('');const handled=host.querySelector('[data-thread-handled]');handled.textContent=selected.includes('handled')?'Behandeld ✓ · ongedaan maken':'Markeren als behandeld';handled.setAttribute('aria-pressed',String(selected.includes('handled')));for(const input of host.querySelectorAll('[data-thread-label]'))input.checked=selected.includes(input.dataset.threadLabel);};
  async function toggle(id){if(busy)return;busy=true;host.setAttribute('aria-busy','true');for(const control of host.querySelectorAll('button,input'))control.disabled=true;const status=host.querySelector('[data-thread-label-status]'),before=threadLabels(getState(),ownerId,key),labels=before.includes(id)?before.filter(value=>value!==id):[...before,id];status.textContent='Label bewaren…';
   try{await mergeStoredState(state=>setThreadLabels(state,{ownerId,key,labels,expected:JSON.stringify(before)}));status.textContent='Label in CRM bewaard.';}
   catch(error){status.textContent=error.message;toast(error.message);}
   finally{busy=false;host.removeAttribute('aria-busy');for(const control of host.querySelectorAll('button,input'))control.disabled=false;paint();}
  }
  host.querySelector('[data-thread-handled]').onclick=()=>toggle('handled');for(const input of host.querySelectorAll('[data-thread-label]'))input.onchange=()=>toggle(input.dataset.threadLabel);paint();
 }
 return {mount};
}
