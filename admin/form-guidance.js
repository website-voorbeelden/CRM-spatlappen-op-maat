import {installDecimalFields,refreshDecimalFields} from './decimal-fields.js';
import {runGuidedAction} from './guided-actions.js';
export function formProblem(message,{field=null,action=null}={}){return Object.assign(Error(message),{field,action});}
let errorSequence=0;
const errors=new WeakMap();
export function fieldTitle(input){const label=input.labels?.[0];return (label?[...label.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join(' '):input.getAttribute?.('aria-label')||input.name||'Dit veld').replace(/\s+/g,' ').trim();}
export function fieldValidationMessage(input){
 const v=input.validity||{};
 if(v.valueMissing)return input.type==='checkbox'?'Vink deze bevestiging aan.':input.tagName==='SELECT'?'Kies een optie.':'Vul dit veld in.';
 if(v.typeMismatch)return input.type==='email'?'Vul een geldig e-mailadres in.':input.type==='url'?'Vul een geldig webadres in.':'Controleer de invoer.';
 if(v.badInput)return 'Vul een geldig getal in.';
 if(v.rangeUnderflow)return 'Vul minimaal '+input.min+' in.';
 if(v.rangeOverflow)return 'Vul maximaal '+input.max+' in.';
 if(v.stepMismatch)return input.step==='1'?'Gebruik een heel getal.':'Gebruik de juiste stapgrootte'+(input.step?' ('+input.step+')':'')+'.';
 if(v.tooLong)return 'Gebruik maximaal '+input.maxLength+' tekens.';
 if(v.tooShort)return 'Gebruik minimaal '+input.minLength+' tekens.';
 return input.validationMessage||'Controleer de invoer.';
}
export function clearFieldProblem(input){
 const previous=errors.get(input);if(!previous)return;previous.note?.remove();previous.label?.classList.remove('field-needs-attention');input.removeAttribute('aria-invalid');if(previous.describedBy)input.setAttribute('aria-describedby',previous.describedBy);else input.removeAttribute('aria-describedby');errors.delete(input);
}
function markFieldProblem(input,message){
 clearFieldProblem(input);const label=input.closest?.('label')||input,describedBy=input.getAttribute?.('aria-describedby')||'',note=document.createElement('small');note.id='field-error-'+(++errorSequence);note.className='form-field-error';note.textContent=message;
 label.append?.(note);label.classList.add('field-needs-attention');input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',[describedBy,note.id].filter(Boolean).join(' '));errors.set(input,{label,note,describedBy});
 input.addEventListener('input',()=>clearFieldProblem(input),{once:true});input.addEventListener('change',()=>clearFieldProblem(input),{once:true});
}
export function focusFormField(form,field,{invalid=true}={}){
 let target=typeof field==='string'?form.elements.namedItem(field):field;if(target&&typeof target.focus!=='function'&&target.length)target=[...target].find(input=>input.value==='')||target[0];if(!target||typeof target.focus!=='function')return false;
 for(let node=target.parentElement;node&&node!==form;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
 if(invalid&&!errors.has(target))markFieldProblem(target,'Controleer dit veld.');target.focus();target.scrollIntoView?.({block:'center',behavior:'instant'});return true;
}
export function showFormProblem(form,problem,{toast=()=>{},isBusy=()=>false}={}){
 const box=form.querySelector('[data-form-error]')||form.querySelector('#form-error');box.replaceChildren();const text=document.createElement('span');text.textContent='Niet opgeslagen: '+(problem.message||'Controleer je gegevens.');box.append(text);
 if(problem.action?.label&&typeof problem.action.run==='function'){const action=document.createElement('button');action.type='button';action.className='form-error-action';action.textContent=problem.action.label;action.onclick=()=>runGuidedAction(action,problem.action.run,{isBusy,pendingLabel:'Invulhulp openen…',onError:error=>{if(box.isConnected)showFormProblem(form,error,{toast,isBusy});else toast(error.message);}});box.append(action);}
 const issues=problem.issues||[];if(issues.length){const list=document.createElement('div');list.className='form-error-list';for(const issue of issues){markFieldProblem(issue.field,issue.message);const button=document.createElement('button');button.type='button';button.textContent=fieldTitle(issue.field)+': '+issue.message;button.onclick=()=>focusFormField(form,issue.field);list.append(button);}box.append(list);}
 else if(problem.field){const target=typeof problem.field==='string'?form.elements.namedItem(problem.field):problem.field;if(target?.focus)markFieldProblem(target,problem.message);}
 if(!focusFormField(form,problem.field)){box.focus();box.scrollIntoView?.({block:'nearest',behavior:'instant'});}toast('Niet opgeslagen: '+problem.message);
}
export function validateForm(form,options={}){
 refreshDecimalFields(form);
 const fields=form.elements?.[Symbol.iterator]?[...form.elements]:Object.values(form.elements||{});
 const issues=fields.filter(input=>input?.willValidate&&!input.disabled&&!input.readOnly&&input.validity?.valid===false).map(field=>({field,message:fieldValidationMessage(field)}));
 for(const input of fields)if(input?.validity?.valid)clearFieldProblem(input);if(!issues.length)return true;const problem=formProblem(issues.length===1?fieldTitle(issues[0].field)+': '+issues[0].message:'Controleer de '+issues.length+' gemarkeerde velden.',{field:issues[0].field});problem.issues=issues;showFormProblem(form,problem,options);return false;
}
// Form edit protection stores flags only, never field values or credentials.
export function markFormClean(form){delete form.dataset.unsavedEdit;delete form.dataset.pickingFile;}
export function hasActiveFormEdits(root=globalThis.document){
 const active=form=>{const dialog=form?.closest?.('dialog');return !!form&&(!dialog||dialog.open||dialog.hasAttribute('open'));};
 if([...root.querySelectorAll?.('form,[data-crm-edit-owner]')||[]].some(form=>active(form)&&(form.dataset.unsavedEdit==='true'||form.dataset.pickingFile==='true'||form.getAttribute('aria-busy')==='true'||form.inert)))return true;
 const input=root.activeElement||root.ownerDocument?.activeElement,form=input?.form||input?.closest?.('form');return (!root.contains||root.contains(input))&&active(form)&&['INPUT','TEXTAREA','SELECT'].includes(input.tagName);
}
// Delegate to existing and future forms without changing validation or submit
// behavior. Only flags are tracked; values, files and secrets stay in the form.
const protectedRoots=new WeakSet();
export function installFormEditProtection(root=globalThis.document){
 if(protectedRoots.has(root))return;protectedRoots.add(root);
 const owner=input=>{if(!input?.matches?.('input,textarea,select')||input.disabled||input.readOnly)return null;if(input.form)return input.form;if(input.type==='file'){input.dataset.crmEditOwner='true';return input;}return null;};
 const changed=event=>{const input=event.target,target=owner(input);if(!target)return;target.dataset.unsavedEdit='true';if(input.type==='file')delete target.dataset.pickingFile;};
 root.addEventListener('input',changed,true);root.addEventListener('change',changed,true);
 const picking=event=>{if(event.target?.type!=='file')return;const target=owner(event.target);if(target)target.dataset.pickingFile='true';};
 root.addEventListener('click',picking,true);root.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')picking(event);},true);
 root.addEventListener('cancel',event=>{if(event.target?.type==='file'){const target=event.target.form||event.target;delete target.dataset.pickingFile;}},true);
 root.addEventListener('reset',event=>{const form=event.target;if(form?.tagName==='FORM')queueMicrotask(()=>{if(!event.defaultPrevented)markFormClean(form);});},true);
}
export function installFormGuidance(form){
 if(form.dataset.guidanceInstalled)return;form.dataset.guidanceInstalled='true';form.noValidate=true;installDecimalFields(form);
 const touched=new WeakSet();const changed=event=>{if(event.target&&typeof event.target==='object')touched.add(event.target);form.dataset.unsavedEdit='true';if(event.target?.type==='file')delete form.dataset.pickingFile;};
 form.addEventListener('input',changed);form.addEventListener('change',changed);
 const picking=event=>{if(event.target?.type==='file'&&!event.target.disabled)form.dataset.pickingFile='true';};
 form.addEventListener('click',picking,true);form.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')picking(event);},true);
 form.addEventListener('cancel',event=>{if(event.target?.type==='file')delete form.dataset.pickingFile;},true);
 form.addEventListener('focusout',event=>{const input=event.target;if(!input?.willValidate||input.disabled||input.readOnly||(!touched.has(input)&&!errors.has(input)))return;if(input.validity?.valid===false)markFieldProblem(input,fieldValidationMessage(input));else clearFieldProblem(input);});
}
export function textFormValues(form){return Object.fromEntries([...new FormData(form)].filter(([key,value])=>{const input=form.elements.namedItem(key);return key&&typeof value==='string'&&!['file','password','hidden'].includes(input?.type)&&!input?.hasAttribute?.('data-mail-secret');}));}
export function changedFormValues(form,original){return Object.fromEntries(Object.entries(textFormValues(form)).filter(([key,value])=>key!=='display_document_number'&&value!==original[key]));}
export function restoreFormValues(form,values){for(const [name,value] of Object.entries(values||{})){const input=form.elements.namedItem(name);if(input&&typeof value==='string'&&!input.readOnly&&!input.disabled&&!['file','password','hidden'].includes(input.type))input.value=value;}}
