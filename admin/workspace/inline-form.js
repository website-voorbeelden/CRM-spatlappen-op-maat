import {installFormGuidance,validateForm,showFormProblem,markFormClean} from '../form-guidance.js?v=crm-code-review-20261027';
// Same guidance/validation/edit flags as modal forms; values/files stay in DOM.
export function openInlineForm(target,title,html,onSubmit,{afterSave,afterCancel,toast=()=>{}}={}){
 target.innerHTML='<form><div class="section-heading"><h2></h2></div><p class="form-status" data-inline-status role="status" hidden></p>'+html+'<p class="danger" data-form-error role="alert" tabindex="-1"></p><div class="actions"><button type="submit" class="primary">Opslaan</button><button type="button" data-inline-cancel>Invoer wissen</button></div></form>';
 const form=target.querySelector('form');form.querySelector('h2').textContent=title;installFormGuidance(form);let saving=false;
 const active=()=>form.isConnected&&target.querySelector('form')===form,busy=()=>saving||form.inert||form.getAttribute('aria-busy')==='true';
 form.addEventListener('submit',async event=>{event.preventDefault();if(busy()||!validateForm(form,{toast,isBusy:busy}))return;const submit=form.querySelector('[type=submit]'),label=submit.textContent,status=form.querySelector('[data-inline-status]');let completed=false;saving=true;form.inert=true;form.setAttribute('aria-busy','true');submit.disabled=true;submit.textContent='Bewaren…';status.textContent='Bezig met bewaren…';status.hidden=false;form.querySelector('[data-form-error]').textContent='';
  try{if(await onSubmit(new FormData(form))!==false){completed=true;markFormClean(form);}}catch(error){form.inert=false;if(active())showFormProblem(form,error,{toast});}
  finally{saving=false;form.inert=false;form.removeAttribute('aria-busy');submit.disabled=false;submit.textContent=label;status.hidden=true;}
  if(completed&&active())try{await afterSave?.();}catch{toast('Bewaard; de weergave kon niet worden bijgewerkt. Open het dossier opnieuw.');}
 });
 form.querySelector('[data-inline-cancel]').onclick=async()=>{if(busy()||!active())return;if(form.dataset.unsavedEdit==='true'&&!window.confirm('Deze nog niet bewaarde factuurinvoer en gekozen bestanden wissen?'))return;markFormClean(form);try{await afterCancel?.();}catch{toast('De invoer kon niet opnieuw worden geopend.');}};
 return form;
}
