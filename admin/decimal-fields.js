import {decimalNumber,decimalText} from '../shared/decimal-input.js';
function prepare(input){
 if(!input?.matches?.('input[type="number"][step]')||!/^0\.0*[1-9]\d*$/.test(input.step))return;
 const value=input.value;input.dataset.decimalPlaces=String(input.step.split('.')[1].length);input.type='text';input.inputMode='decimal';input.value=value===''?'':decimalText(value,{places:Number(input.dataset.decimalPlaces)});
}
function check(input){
 if(!input?.dataset?.decimalPlaces)return;const raw=input.value.trim(),places=Number(input.dataset.decimalPlaces),n=decimalNumber(raw,{places});let error='';
 if(raw&&!Number.isFinite(n))error='Gebruik een komma of punt en maximaal '+places+' decimalen, zonder duizendtallen.';
 else if(raw&&input.min!==''&&n<Number(input.min))error='Vul minimaal '+input.min+' in.';
 else if(raw&&input.max!==''&&n>Number(input.max))error='Vul maximaal '+input.max+' in.';
 input.setCustomValidity(error);
}
export function refreshDecimalFields(form){for(const input of form.querySelectorAll?.('input[type="number"][step]')||[])prepare(input);for(const input of form.querySelectorAll?.('input[data-decimal-places]')||[])check(input);}
export function installDecimalFields(form){
 refreshDecimalFields(form);
 form.addEventListener('focusin',e=>prepare(e.target));
 form.addEventListener('input',e=>check(e.target));
 form.addEventListener('focusout',e=>{const i=e.target;if(!i?.dataset?.decimalPlaces)return;check(i);if(i.value.trim()&&i.validity.valid)i.value=decimalText(i.value,{places:Number(i.dataset.decimalPlaces)});});
 // Every FormData consumer receives a canonical decimal, while the field stays Dutch on screen.
 form.addEventListener('formdata',e=>{const names=new Map();for(const input of form.querySelectorAll('input[data-decimal-places]')){if(input.disabled||!input.name)continue;check(input);names.set(input.name,Number(input.dataset.decimalPlaces));}for(const [name,places]of names){const values=e.formData.getAll(name);e.formData.delete(name);for(const value of values){const n=decimalNumber(value,{places});e.formData.append(name,Number.isFinite(n)?String(n):value);}}});
 for(const input of form.querySelectorAll?.('input[data-decimal-places]')||[])check(input);
}
