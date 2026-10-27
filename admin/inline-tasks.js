import {installFormGuidance,validateForm,showFormProblem} from './form-guidance.js?v=crm-code-review-20261027';
import {loading} from './loading.js';
import {costingInlineProduct} from '../shared/costing-inline-context.js';
let active=null;
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Keep the actual parent DOM, handlers, files, selection and private fields in
// place. No form serialization, navigation, draft save or business write here.
function surface(title){
 if(active)throw Error('Rond eerst het geopende venster af.');
 const focus=document.activeElement,parent=focus?.closest?.('form');if(parent?.getAttribute('aria-busy')==='true')throw Error('Wacht tot het huidige formulier klaar is met opslaan.');
 const dialog=document.createElement('dialog');dialog.className='inline-task-dialog';dialog.setAttribute('aria-label',title);document.body.append(dialog);let dirty=false,busy=false,done=false,resolve;
 const promise=new Promise(r=>resolve=r);active=dialog;
 function finish(result){if(done)return;done=true;dialog.close();dialog.remove();active=null;if(focus?.isConnected)focus.focus?.();resolve(result);}
 function cancel(){if(done||busy)return;if(dirty&&!confirm('Je wijzigingen in dit venster zijn nog niet opgeslagen. Terug zonder deze wijzigingen?'))return;finish(null);}
 dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
 return {dialog,promise,cancel,complete:finish,setDirty:v=>dirty=!!v,setBusy:v=>{busy=!!v;dialog.setAttribute('aria-busy',String(busy));},isBusy:()=>busy};
}
export function openInlineFormTask({title,html,submitLabel='Opslaan & terug',onSubmit,focus}){
 if(typeof onSubmit!=='function')throw Error('Opslaan ontbreekt.');const task=surface(title),d=task.dialog;
 d.innerHTML=`<form><div class="dialog-heading"><h2>${escape(title)}</h2></div><div class="dialog-body"><p class="form-help">Na opslaan of annuleren keer je terug naar je huidige formulier. Je eerdere invoer blijft staan.</p>${html}</div><p data-form-error class="form-error-box" role="alert" tabindex="-1"></p><div class="dialog-footer actions"><button type="button" data-task-cancel>← Terug</button><button type="submit" class="primary">${escape(submitLabel)}</button></div></form>`;
 const form=d.querySelector('form'),submit=form.querySelector('[type=submit]'),cancel=form.querySelector('[data-task-cancel]');installFormGuidance(form);
 form.addEventListener('input',()=>task.setDirty(true));form.addEventListener('change',()=>task.setDirty(true));cancel.onclick=task.cancel;
 form.onsubmit=async event=>{event.preventDefault();if(task.isBusy()||!validateForm(form))return;task.setBusy(true);submit.disabled=cancel.disabled=true;const label=submit.textContent;submit.textContent='Opslaan…';let result;
  try{result=await loading.run('Opslaan & terug naar je formulier…',()=>onSubmit(new FormData(form),form,result=>{task.setDirty(false);task.complete(result);}));if(result===false)return;if(result===undefined)throw Error('Opslaan gaf geen resultaat terug.');task.setDirty(false);task.complete(result);}
  catch(e){showFormProblem(form,e);}
  finally{task.setBusy(false);submit.disabled=cancel.disabled=false;submit.textContent=label;}
 };
 d.showModal();(focus?form.elements.namedItem(focus):form.querySelector('input,select,textarea'))?.focus();return task.promise;
}
const toolPaths=new Set(['/tools/costing/quotes.html','/tools/costing/index.html']);
export function openCostingTask({title='Berekening aanmaken',quoteId='',product=null}={}){
 const path='/tools/costing/index.html';if(!toolPaths.has(path))throw Error('Deze tool is niet beschikbaar.');
 if(quoteId&&!/^[-a-zA-Z0-9_]{1,100}$/.test(quoteId))throw Error('Ongeldige berekening.');
 const seed=costingInlineProduct(product);
 const task=surface(title),d=task.dialog,taskId=crypto.randomUUID(),url=new URL(path,location.origin);url.searchParams.set('taskId',taskId);if(quoteId)url.searchParams.set('quoteId',quoteId);
 d.classList.add('inline-tool-dialog');d.innerHTML=`<div class="dialog-heading"><h2>${escape(title)}</h2><button type="button" data-task-cancel>← Terug naar mijn formulier</button></div><p class="inline-tool-status" role="status">Rekentool laden… Je huidige formulier blijft behouden.</p><iframe title="${escape(title)}" sandbox="allow-scripts allow-same-origin allow-downloads"></iframe>`;
 const frame=d.querySelector('iframe'),status=d.querySelector('[role=status]');let timeout;
 function message(event){if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.format!=='crm-inline-task'||event.data.taskId!==taskId)return;
  const data=event.data;if(data.type==='ready'){clearTimeout(timeout);status.textContent='Maak of controleer de berekening. Kies daarna Berekening gebruiken & terug.';frame.contentWindow.postMessage({format:'crm-inline-task',taskId,type:'context',product:seed},location.origin);}
  else if(data.type==='state'){task.setDirty(data.dirty===true);task.setBusy(data.busy===true);d.querySelector('[data-task-cancel]').disabled=data.busy===true;}
  else if(data.type==='cancel')task.cancel();
  else if(data.type==='complete'&&!task.isBusy()&&typeof data.quoteId==='string'&&/^[-a-zA-Z0-9_]{1,100}$/.test(data.quoteId)&&(!data.pieceId||/^[-a-zA-Z0-9_]{1,100}$/.test(data.pieceId))){task.setDirty(false);task.complete({quoteId:data.quoteId,pieceId:data.pieceId||''});}
 }
 window.addEventListener('message',message);task.promise.finally(()=>{clearTimeout(timeout);window.removeEventListener('message',message);});d.querySelector('[data-task-cancel]').onclick=task.cancel;
 timeout=setTimeout(()=>{status.textContent='De rekentool reageert nog niet. Je kunt teruggaan en opnieuw openen; je formulier blijft behouden.';},15000);frame.src=url.href;d.showModal();return task.promise;
}
