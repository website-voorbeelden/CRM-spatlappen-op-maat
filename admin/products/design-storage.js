import {cloudRequest} from '../cloud-storage.js?v=crm-code-review-20261027';
export function installDesignStorage(context){
 let opening=false;
 const url=cursor=>'/design-storage'+(cursor?'?after='+encodeURIComponent(cursor):'');
 async function fetchPlan(cursor){
  const plan=await cloudRequest(url(cursor));
  if(!plan||!Number.isSafeInteger(plan.count)||plan.count<0||plan.count>20||!Number.isSafeInteger(plan.bytes)||plan.bytes<0||typeof plan.basis!=='string'||plan.basis.length>100000||typeof plan.more!=='boolean'||plan.more&&typeof plan.next!=='string')throw Error('De opslaglijst kon niet betrouwbaar worden gelezen. Er is niets verwijderd.');
  return plan;
 }
 function showPlan(plan,cursor=''){
  context.openForm('Ongebruikte cloudontwerpen vrijmaken',`<p>${plan.count} aantoonbaar losgekoppelde opslagobjecten · ${Math.ceil(plan.bytes/1024)} KB.</p>
   <p>Dit betreft alleen eerder opgeruimde ontwerpvoorstellen in dit bedrijf. Definitieve ontwerpen, goedkeuringsbewijs en nog gekoppelde bestanden zijn uitgesloten. Na verwijderen van deze cloudbytes kan een oude back-up die alleen naar deze opslag verwijst ze niet terughalen; een eigen volledige bestandsback-up is een afzonderlijke kopie.</p>
   ${plan.blocked?`<p class="form-help">${context.esc(plan.blocked)} opslagobject(en) blijven behouden omdat er opnieuw een CRM-verwijzing bestaat. Deze worden niet verwijderd.</p>`:''}
   ${plan.count?'<label class="check-row"><input name="confirm" type="checkbox" required>Deze losgekoppelde cloudbestanden definitief verwijderen.</label>':'<p>Geen bewezen vrij te maken bestanden in deze groep. Oude niet-geregistreerde cloudbestanden worden niet automatisch verwijderd.</p>'}
   ${plan.more?'<details class="form-details"><summary>Meer opslagobjecten</summary><p>Deze groep beoordeelt maximaal 20 opslagobjecten. Je kunt de volgende groep bekijken zonder iets te verwijderen; daar bevestig je opnieuw je keuze.</p><button type="button" data-design-storage-page>Volgende groep bekijken</button></details>':''}`,async fd=>{
    if(!plan.count)return;
    if(!fd.has('confirm'))throw Error('Bevestig het definitieve verwijderen.');
    const result=await cloudRequest(url(cursor),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirm:true,basis:plan.basis})});
    context.toast(result.deleted+' opslagobject(en) verwijderd · '+Math.ceil(result.bytes/1024)+' KB'+(result.more?' · meer groepen beschikbaar':''));
   });
  const dialog=context.$('#dialog'),form=dialog.querySelector('form'),next=form.querySelector('[data-design-storage-page]');
  form.querySelector('[type=submit]').textContent=plan.count?'Cloudbestanden definitief verwijderen':'Sluiten';
  if(next)next.onclick=async()=>{
   if(form.inert)return;
   const status=form.querySelector('#form-status'),error=form.querySelector('#form-error');error.textContent='';status.textContent='Volgende opruimlijst ophalen…';status.hidden=false;form.inert=true;form.setAttribute('aria-busy','true');let following;
   try{following=await fetchPlan(plan.next);}catch(problem){error.textContent=problem.message||'De volgende groep kon niet worden opgehaald.';}
   finally{form.inert=false;form.removeAttribute('aria-busy');status.hidden=true;}
   if(!dialog.open||dialog.querySelector('form')!==form)return;
   if(following)showPlan(following,plan.next);else error.focus();
  };
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-design-storage]');if(!button||button.disabled||opening)return;
  if(context.$('#dialog').open){context.toast('Bewaar of sluit eerst het open formulier.');return;}
  if(context.runtime.mode!=='cloud'){context.toast('Lokale ontwerpbestanden verdwijnen samen met de CRM-verwijzingen uit deze browseropslag. Andere browsers en back-ups zijn afzonderlijke kopieën.');return;}
  opening=true;button.disabled=true;const route=location.hash;
  fetchPlan('').then(plan=>{if(location.hash===route&&!context.$('#dialog').open)showPlan(plan);}).catch(error=>context.toast(error.message)).finally(()=>{opening=false;if(button.isConnected)button.disabled=false;});
 });
}
