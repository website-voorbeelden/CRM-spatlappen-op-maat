import {signatureProfiles,signatureForSender} from '../../shared/mail-signature-profiles.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// One choice shared by full composer and quick reply. Does not change message text.
export function installSignatureChoice(host,{config,sender,initial='',onChange=()=>{}}){
 host.innerHTML='<label>Handtekening<select name="signatureChoice"></select></label><small data-signature-choice-status role="status"></small>';
 const select=host.querySelector('select'),status=host.querySelector('small');
 function refresh(value=select.value){select.innerHTML=`<option value="">Automatisch bij dit afzenderadres</option>${signatureProfiles(config).map(profile=>`<option value="${esc(profile.id)}">${esc(profile.name)}</option>`).join('')}<option value="none">Geen handtekening</option>`;if([...select.options].some(option=>option.value===value))select.value=value;else if(value){const missing=document.createElement('option');missing.value=value;missing.textContent='Eerdere handtekening ontbreekt · kies opnieuw';select.append(missing);select.value=value;}update();}
 const update=()=>{try{const profile=signatureForSender(config,sender(),select.value);status.textContent=(select.value?'Voor deze mail: ':'Bij '+sender()+': ')+profile.name+'. Wordt toegevoegd in de verzendpreview.';}catch(error){status.textContent=error.message;}};
 select.onchange=()=>{update();onChange();};refresh(initial);return {update,refresh};
}
