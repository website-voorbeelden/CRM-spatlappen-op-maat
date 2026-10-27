import {openInlineFormTask} from '../inline-tasks.js?v=crm-code-review-20261027';
import {markGeneratedMail,mailFormProvenance} from "../provenance-ui.js?v=provenance-colors-20261027";
import {mailTemplates,templatesNamed,templateNameKey,templateOptionLabel,replaceNamedMailTemplates,templateKinds,variableLabels,validateMailTemplate,saveMailTemplate,fillMailTemplate} from "../../shared/mail-templates.js?v=mail-texts-20261027";
import {showFormProblem} from "../form-guidance.js?v=crm-code-review-20261027";
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createMailTemplatesUI({company,getState,mergeStoredState,openForm,toast,render,uid=()=>crypto.randomUUID()}){
 function editor(id='',prefill={},afterSave){
  let collision=null,replaceRequested=false,savedId='';const inline=typeof afterSave==='function';
  function openEditorForm(title,html,onSave,options){
   if(!inline){openForm(title,html,onSave,options);return;}
   const pending=openInlineFormTask({title,html,focus:'name',submitLabel:'Template opslaan & terug',onSubmit:async fd=>{const result=await onSave(fd);return result===false?false:{id:savedId};}});
   pending.then(result=>afterSave(result?.id||'',!!result)).catch(error=>toast(error.message));
  }
  const original=(getState().mailTemplates||[]).find(t=>t.id===id)||null,existing=mailTemplates(getState(),company?.id).find(t=>t.id===id),values=existing||{id:uid(),name:'',kind:'general',subject:'',body:'',...prefill};
  openEditorForm(existing?'Mailtemplate aanpassen':'Nieuwe mailtemplate',`<p>Bewaar deze tekst voor toekomstige berichten. Bestaande concepten blijven zoals ze zijn.</p><div class="fields"><label>Naam<input name="name" value="${esc(values.name)}" required maxlength="100"></label><label>Gebruik voor<select name="kind">${Object.entries(templateKinds).map(([key,label])=>`<option value="${key}" ${values.kind===key?'selected':''}>${label}</option>`).join('')}</select></label></div><div class="notice" data-template-collision hidden><p data-template-collision-message></p><div class="actions"><button type="button" data-template-rename>Andere naam kiezen</button><button type="button" data-template-replace>Bestaande template vervangen</button></div></div><label>Onderwerp<input name="subject" value="${esc(values.subject)}" required maxlength="200"></label><label>Bericht<textarea name="body" rows="13" required maxlength="30000">${esc(values.body)}</textarea></label><details class="form-details"><summary>Variabelen gebruiken</summary><p>Deze velden worden ingevuld vanuit het dossier. Klik om ze in het laatst gebruikte tekstveld te zetten.</p><div class="template-variable-buttons">${Object.entries(variableLabels).map(([key,label])=>`<button type="button" data-insert-variable="${key}">${esc(label)} · {{${key}}}</button>`).join('')}</div><p class="form-help">Een eigen invulveld kan ook, bijvoorbeeld {{materiaal}} of {{ontbreekt}}. Je vult dat zelf in wanneer je de template gebruikt.</p></details>${existing?.builtin?'<p class="form-help">Dit past de standaardtekst voor toekomstige berichten van dit bedrijf aan.</p>':''}`,async fd=>{
   const input=validateMailTemplate({id:values.id,name:fd.get('name'),kind:fd.get('kind'),subject:fd.get('subject'),body:fd.get('body')});
   const requested=replaceRequested;replaceRequested=false;
   const named=templatesNamed(getState(),input.name),duplicates=named.filter(t=>t.id!==input.id);
   if(duplicates.length&&!requested){paintCollision(input.name);form.elements.name.focus();return false;}
   if(requested){
    if(!collision||templateNameKey(collision.name)!==templateNameKey(input.name)||!collision.canReplace){paintCollision(input.name);return false;}
    const message=`Je vervangt ‘${collision.target.name}’ door het onderwerp en bericht hierboven.${collision.named.length>1?' Templates met dezelfde naam worden samengevoegd tot één template.':''}\n\nDit geldt voor toekomstige mails. Bestaande concepten en verstuurde mails blijven behouden. Weet je het zeker?`;
    if(!confirm(message))return false;
    await mergeStoredState(next=>{savedId=replaceNamedMailTemplates(next,input,{targetId:collision.target.id,expectedNamed:collision.named,expectedSource:original}).id;});
   }else await mergeStoredState(next=>{savedId=saveMailTemplate(next,input,original).id;});
   if(!inline)render();toast('Mailtemplate opgeslagen');
  },{afterSave:()=>afterSave?.(savedId,!!savedId),afterCancel:()=>afterSave?.('',false)});
  const form=document.querySelector(inline?'.inline-task-dialog form':'#dialog form');let target=form.elements.body;for(const name of ['subject','body'])form.elements[name].addEventListener('focus',()=>target=form.elements[name]);for(const button of form.querySelectorAll('[data-insert-variable]'))button.onclick=()=>{target.setRangeText('{{'+button.dataset.insertVariable+'}}',target.selectionStart,target.selectionEnd,'end');target.dispatchEvent(new Event('input',{bubbles:true}));target.focus();};
  function paintCollision(name){
   const named=templatesNamed(getState(),name),duplicates=named.filter(t=>t.id!==values.id),box=form.querySelector('[data-template-collision]');box.hidden=!duplicates.length;collision=null;
   if(!duplicates.length)return;
   const target=named.find(t=>t.builtin)||duplicates[0],canReplace=named.filter(t=>t.builtin).length<=1&&(!existing?.builtin||existing.id===target.id);
   collision={name,target,named:structuredClone(named),canReplace};
   form.querySelector('[data-template-collision-message]').textContent='Template bestaat al: '+target.name+'. Kies een andere naam'+(canReplace?' of vervang de bestaande template na bevestiging. Dubbele eigen templates met deze naam worden dan samengevoegd.':'. Vaste templates kunnen niet met elkaar worden samengevoegd.');
   form.querySelector('[data-template-replace]').hidden=!canReplace;
  }
  form.elements.name.addEventListener('input',()=>{replaceRequested=false;paintCollision(form.elements.name.value);});
  form.querySelector('[data-template-rename]').onclick=()=>{form.elements.name.focus();form.elements.name.select();};
  form.querySelector('[data-template-replace]').onclick=()=>{replaceRequested=true;form.requestSubmit();};
  paintCollision(values.name);
  form.querySelector('[type=submit]').textContent='Template opslaan';
 }
 function settingsMarkup(){return `<section class="panel" data-template-library><div class="section-heading"><div><h2>Mailtemplates & standaardteksten</h2><p>Bewaar je eigen teksten voor ${esc(getState().companyName||'dit bedrijf')}. Elke mail blijft eerst een bewerkbaar concept. Eigen versies blijven behouden; Standaard herstellen gebruikt de huidige basistekst.</p></div><button type="button" data-template-new>Nieuwe template</button></div><div class="template-library">${mailTemplates(getState(),company?.id).map(t=>`<article class="template-card"><div><strong>${esc(t.name)}</strong><small>${esc(templateKinds[t.kind])}${t.builtin?(getState().mailTemplates||[]).some(saved=>saved.id===t.id)?' · eigen aanpassing':' · standaard':''}</small><p>${esc(t.subject)}</p></div><div class="actions"><button type="button" data-template-edit="${esc(t.id)}">Aanpassen</button>${t.builtin?(getState().mailTemplates||[]).some(s=>s.id===t.id)?`<button type="button" data-template-remove="${esc(t.id)}">Standaard herstellen</button>`:'':`<button type="button" data-template-remove="${esc(t.id)}">Verwijderen</button>`}</div></article>`).join('')}</div></section>`;}
 function installSettings(root){const panel=root.querySelector('[data-template-library]');if(!panel)return;panel.querySelector('[data-template-new]').onclick=()=>editor();for(const b of panel.querySelectorAll('[data-template-edit]'))b.onclick=()=>editor(b.dataset.templateEdit);for(const b of panel.querySelectorAll('[data-template-remove]'))b.onclick=async()=>{const id=b.dataset.templateRemove,expected=(getState().mailTemplates||[]).find(t=>t.id===id);if(!confirm('Deze template verwijderen of de oorspronkelijke standaardtekst herstellen? Bestaande mails blijven behouden.'))return;b.disabled=true;try{await mergeStoredState(next=>{if(JSON.stringify((next.mailTemplates||[]).find(t=>t.id===id))!==JSON.stringify(expected))throw Error('Deze template is ondertussen gewijzigd. Open hem opnieuw.');next.mailTemplates=(next.mailTemplates||[]).filter(t=>t.id!==id);});render();toast('Template bijgewerkt');}catch(error){toast(error.message);b.disabled=false;}};}
 function composerMarkup({selectedId=''}={}){return `<section class="mail-template-picker"><div class="mail-template-row"><label>Standaardtekst<select name="templateId" data-mail-template><option value="">Kies een mailtemplate…</option>${mailTemplates(getState(),company?.id).map(t=>`<option value="${esc(t.id)}" ${t.id===selectedId?'selected':''}>${esc(templateOptionLabel(getState(),t))}</option>`).join('')}</select></label><button type="button" data-template-apply>Tekst invullen</button><button type="button" data-template-edit-current>Template bewerken</button><details class="quiet-menu"><summary>Meer</summary><div><button type="button" data-template-save>Als nieuwe template bewaren</button></div></details></div><div data-template-fill></div><p class="form-help" data-template-help>Invullen vervangt de tekst na jouw bevestiging; bij een antwoord blijft het gespreksonderwerp behouden. Template bewerken bewaart de standaardtekst voor toekomstige mails.</p></section>`;}

 function installComposer(form,{getContext,resume,resumeValues={},keepReplySubject=()=>false}){
  const chooser=form.querySelector('[data-mail-template]');if(!chooser)return;
  const selected=()=>mailTemplates(getState(),company?.id).find(t=>t.id===chooser.value);
  function snapshot(){return mailFormProvenance(form,{...Object.fromEntries(new FormData(form)),funnelPurpose:form.dataset.funnelPurpose||'',templateValues:Object.fromEntries([...form.querySelectorAll('[data-template-value]')].map(i=>[i.dataset.templateValue,i.value]))});}
  function update(){const template=selected(),missing=template?fillMailTemplate(template,getContext()).missing:[];form.querySelector('[data-template-fill]').innerHTML=missing.map((key,index)=>`<label>${esc(variableLabels[key]||key)}<input data-template-value="${esc(key)}" name="template_value_${index}" maxlength="2000" placeholder="Invullen voor deze mail"></label>`).join('');form.querySelector('[data-template-edit-current]').disabled=!template;}
  chooser.onchange=update;
  function apply(){try{const template=selected();if(!template){chooser.focus();toast('Kies eerst een template');return false;}const context={...getContext()};for(const input of form.querySelectorAll('[data-template-value]'))if(input.value.trim())context[input.dataset.templateValue]=input.value.trim();const result=fillMailTemplate(template,context);if(result.missing.length){const input=[...form.querySelectorAll('[data-template-value]')].find(i=>result.missing.includes(i.dataset.templateValue));input?.focus();toast('Vul eerst in: '+result.missing.map(k=>variableLabels[k]||k).join(', '));return false;}const preserveSubject=keepReplySubject();if((form.elements.subject.value||form.elements.body.value)&&!confirm(preserveSubject?'Bericht vervangen door deze template? Het onderwerp van je antwoord blijft behouden.':'Onderwerp en bericht vervangen door deze template?'))return false;form.dataset.funnelPurpose=template.id==='sales-indication'?'indication':template.id==='sales-followup'?'followup':template.kind==='question'?'specs':'';if(!preserveSubject)form.elements.subject.value=result.subject;form.elements.body.value=result.body;markGeneratedMail(form,'template');form.dispatchEvent(new Event('input',{bubbles:true}));form.querySelector('[data-template-help]').textContent=preserveSubject?'Template ingevuld; onderwerp en gesprek van je antwoord zijn behouden. Controleer het voorbeeld vóór versturen.':'Template ingevuld. Pas de tekst gerust aan en controleer het voorbeeld vóór versturen.';return true;}catch(error){showFormProblem(form,error,{toast});return false;}}
  form.querySelector('[data-template-apply]').onclick=apply;
  function afterTemplateEdit(id,saved){
   if(!saved||!form.isConnected)return;
   const previous=snapshot(),options=[document.createElement('option')];options[0].value='';options[0].textContent='Kies een mailtemplate…';
   for(const item of mailTemplates(getState(),company?.id)){const option=document.createElement('option');option.value=item.id;option.textContent=templateOptionLabel(getState(),item);options.push(option);}
   chooser.replaceChildren(...options);chooser.value=id||previous.templateId;update();
   for(const input of form.querySelectorAll('[data-template-value]'))if(typeof previous.templateValues?.[input.dataset.templateValue]==='string')input.value=previous.templateValues[input.dataset.templateValue];
   form.querySelector('[data-template-help]').textContent='Template opgeslagen voor toekomstige mails. Je huidige tekst, bijlagen en gesprek zijn behouden. Kies Template invullen om deze mail te vervangen.';
   form.dispatchEvent(new Event('input',{bubbles:true}));
  }
  form.querySelector('[data-template-edit-current]').onclick=()=>{const template=selected();if(template)editor(template.id,{},afterTemplateEdit);};
  form.querySelector('[data-template-save]').onclick=()=>{const values=snapshot();editor('',{name:'',kind:selected()?.kind||'general',subject:values.subject,body:values.body},afterTemplateEdit);};
  update();for(const input of form.querySelectorAll('[data-template-value]'))if(typeof resumeValues.templateValues?.[input.dataset.templateValue]==='string')input.value=resumeValues.templateValues[input.dataset.templateValue];
  if(resumeValues.templateUpdated)form.querySelector('[data-template-help]').textContent='Template opgeslagen. Je mailtekst is behouden; klik op Template invullen om de bijgewerkte template in deze mail te gebruiken.';
  return {update,apply,snapshot};
 }

 return {settingsMarkup,installSettings,composerMarkup,installComposer,editor};
}
