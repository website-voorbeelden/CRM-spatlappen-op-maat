import {decimalNumber} from '../../shared/decimal-input.js';
import {vatReasonTypes,readVatClassification} from '../../shared/vat-review.js';
export function vatReasonFields(order,state,{esc}){
 const reason=order.vatReason,presets=state.vatReasonPresets||[];
 const code=reason?.code||'',custom=code==='custom';
 return `<section class="form-section" data-vat-reason ${order.vat===21?'hidden':''}><h3>Afwijkende btw</h3><label>Reden<select name="vatReasonCode"><option value="">Kies een reden</option>${vatReasonTypes.map(t=>`<option value="${t.code}" ${code===t.code?'selected':''}>${esc(t.label)}</option>`).join('')}${presets.map((label,n)=>`<option value="saved:${n}">${esc(label)}</option>`).join('')}<option value="custom" ${custom?'selected':''}>Eigen reden…</option></select></label><div data-vat-custom ${custom?'':'hidden'}><label>Eigen reden<input name="vatReasonLabel" maxlength="160" value="${custom?esc(reason.label):''}"></label><label class="check-row"><input name="vatReasonRemember" type="checkbox">Bewaar deze reden voor volgende keer</label></div><label>Toelichting / verwijzing naar bewijs (optioneel)<textarea name="vatReasonNote" maxlength="1000" rows="2">${esc(reason?.note||'')}</textarea></label><p class="form-help">De reden blijft intern bij deze order. Een keuze bevestigt geen fiscale voorwaarden; 0%, verlegd en vrijgesteld zijn verschillende situaties. Controleer ook de vermelding op je factuur.</p></section>`;
}
export function updateVatReasonFields(form){
 const box=form.querySelector('[data-vat-reason]'),rate=form.elements.vat,select=form.elements.vatReasonCode;if(!box||!rate||!select)return;
 const enabled=!rate.disabled&&rate.value.trim()!==''&&decimalNumber(rate.value)!==21;box.hidden=!enabled;
 const custom=select.value==='custom';box.querySelector('[data-vat-custom]').hidden=!custom;
 for(const input of box.querySelectorAll('input,select,textarea'))input.disabled=Boolean(!enabled||input.closest('[data-vat-custom]')&&!custom);
 select.required=enabled;form.elements.vatReasonLabel.required=enabled&&custom;
}
export function installVatReasonFields(form){
 if(!form.querySelector('[data-vat-reason]'))return;
 const update=()=>updateVatReasonFields(form);form.elements.vat.addEventListener('input',update);form.elements.vat.addEventListener('change',update);form.elements.vatReasonCode.addEventListener('change',update);update();
}
export function readVatReasonFields(fd,state){
 const code=String(fd.get('vatReasonCode')||''),saved=code.startsWith('saved:')?(state.vatReasonPresets||[])[Number(code.slice(6))]:null;
 const reason=code?{code:saved?'custom':code,label:saved||String(fd.get('vatReasonLabel')||''),note:String(fd.get('vatReasonNote')||'')}:null;
 return readVatClassification(Number(fd.get('vat')),reason,{required:true});
}
