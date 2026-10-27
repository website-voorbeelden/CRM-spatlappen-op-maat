import {provenanceFor,provenanceKind,provenanceTip,fieldValue,markProvenance} from '../shared/provenance.js?v=provenance-colors-20261027';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceBindings=new WeakMap();
const sourceClass=p=>provenanceKind(p)==='automatic'?'source-automatic':'source-inferred';

export function provenanceText(record,path,value=fieldValue(record,path)){
 const p=provenanceFor(record,path,value);
 return p?`<span class="source-mark ${sourceClass(p)}" data-source-kind="${provenanceKind(p)}" data-provenance-tip="${esc(provenanceTip(p))}" title="${esc(provenanceTip(p))}" tabindex="0">${esc(value)}</span>`:esc(value);
}

function restoreAttribute(element,name,value,owned){
 if(element.getAttribute(name)!==owned)return;
 if(value==null)element.removeAttribute(name);else element.setAttribute(name,value);
}

// Replace the old source listener when a template becomes an AI proposal.
export function markFormSources(form,record,map={}){
 for(const input of form.querySelectorAll('[name]')){
  const path=map[input.name]||input.name,value=fieldValue(record,path);
  // Partial records (e.g. just sender/to defaults) leave other fields alone.
  if(value===undefined)continue;
  const p=provenanceFor(record,path);
  sourceBindings.get(input)?.dispose();
  if(!p)continue;
  const metadata={...p},kind=provenanceKind(metadata),tip=provenanceTip(metadata),label=input.closest('label')||input;
  const original={title:input.getAttribute('title'),description:input.getAttribute('aria-description'),labelTip:label.getAttribute('data-provenance-tip')};
  const expected=['price','cost','shippingCharge'].includes(input.name)&&typeof value==='number'?String(value/100):String(value);
  function matches(){
   if(input.type==='checkbox'&&typeof value==='boolean')return input.checked===value;
   if(input.type==='radio')return input.checked&&input.value===expected;
   const actual=String(input.value??'');
   return actual.trim()!==''&&(typeof value==='number'?Number(actual)===Number(expected):actual===expected);
  }
  function unmark(){
   input.classList.remove('source-mark','source-automatic','source-inferred');
   delete input.dataset.source;delete input.dataset.sourceKind;
   restoreAttribute(input,'title',original.title,tip);
   restoreAttribute(input,'aria-description',original.description,tip);
   restoreAttribute(label,'data-provenance-tip',original.labelTip,tip);
  }
  function refresh(){
   if(!matches()){unmark();return;}
   input.classList.add('source-mark');
   input.classList.toggle('source-automatic',kind==='automatic');
   input.classList.toggle('source-inferred',kind!=='automatic');
   input.dataset.source=metadata.source;input.dataset.sourceKind=kind;
   input.title=tip;input.setAttribute('aria-description',tip);label.dataset.provenanceTip=tip;
  }
  const binding={metadata,matches,refresh,dispose(){input.removeEventListener('input',refresh);input.removeEventListener('change',refresh);unmark();sourceBindings.delete(input);}};
  sourceBindings.set(input,binding);
  input.addEventListener('input',refresh);input.addEventListener('change',refresh);refresh();
 }
}

export function markGeneratedMail(form,source){
 const record={subject:form.elements.subject.value,body:form.elements.body.value};
 markProvenance(record,['subject','body'],source);markFormSources(form,record);
}

function retainSource(input,data,name){
 const binding=input&&sourceBindings.get(input);
 if(!binding)return;
 // Programmatic edits need not emit input: re-read before saving provenance.
 binding.refresh();
 if(!binding.matches())return;
 const p=binding.metadata;
 markProvenance(data,[name],p.source,{mode:p.mode,at:p.at});
}

export function mailFormProvenance(form,data){
 for(const name of ['subject','body','to','sender'])retainSource(form.elements[name],data,name);
 return data;
}

export function formRecordProvenance(form,record){
 for(const input of form.querySelectorAll('[name]'))if(Object.hasOwn(record,input.name))retainSource(input,record,input.name);
 return record;
}
