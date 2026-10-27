import {analyticsExclusions,analyticsExclusionContext} from '../../shared/analytics-exclusions.js';
import {installFormGuidance,markFormClean,validateForm} from '../form-guidance.js?v=crm-code-review-20261027';
export function exclusionMarkup({state,company,esc,editable}){
 const config=analyticsExclusions(state.analyticsExclusions),known=analyticsExclusionContext(state);
 return `<details class="website-details" data-analytics-exclusions><summary>Eigen bezoeken & testaanvragen uitsluiten</summary><p>Je kunt je eigen browser en testaanvragen buiten deze website- en aanvraagcijfers houden. De dossiers blijven bewaard; financiën en btw blijven ongewijzigd.</p><div class="actions"><a class="button" href="https://${esc(company.website)}/?analytics=exclude" target="_blank" rel="noopener noreferrer">Deze websitebrowser uitsluiten ↗</a><a href="https://${esc(company.website)}/?analytics=include" target="_blank" rel="noopener noreferrer">Browser weer meetellen ↗</a><a href="https://${esc(company.website)}/?analytics=check" target="_blank" rel="noopener noreferrer">Uitsluiting controleren ↗</a></div><p class="form-help">Open de eerste link in de browser waarin je de publieke website gebruikt. Een Codex-browser en Safari/Chrome bewaren dit apart; ook www en zonder www kunnen verschillende opslag hebben. Controleer daarna op de website zelf de bevestiging. Geen bevestiging zichtbaar? Dan kan daar nog de oudere websitecode draaien; deze CRM-knop bewijst geen geslaagde uitsluiting. Dit geldt voor onze eigen website-meting, niet voor Search Console, GA4 of de losse Cloudflare-beacon. Dit stopt nieuwe metingen en wist geen oude bezoeken. Oudere bezoeken kunnen alleen via een exact aanvraag-ID worden herkend.</p>${editable?`<form data-exclusions-form><label>Testadressen · één per regel<textarea name="testEmails" rows="3" maxlength="13000">${esc(config.emails.join('\n'))}</textarea></label><p class="form-help">Alle aanvragen van deze adressen worden uitgesloten zodra ze in het CRM bij een klant/order staan. Voor nog niet geïmporteerde mails voeg je hieronder het exacte Aanvraag-ID toe. Het algemene afzenderadres noreply@… uitsluiten zou echte klanten raken.</p><details><summary>Aanvraag-ID’s uit testmails</summary><label>Eén Aanvraag-ID per regel<textarea name="testLeadIds" rows="3" maxlength="19000">${esc(config.leadIds.join('\n'))}</textarea></label><small>Alleen de UUID achter Aanvraag-ID in de mail. Geen Gmail-berichtnummer. Het exact gekoppelde paginabezoek valt ook uit de cijfers.</small></details><p class="form-help" data-exclusions-summary>${known.orderIds.size} CRM-orders en ${known.leadIds.size} bekende aanvraag-ID’s vallen onder deze filters, over alle periodes.</p><p data-form-error class="form-error-box" role="alert" tabindex="-1"></p><button type="submit" class="primary">Uitsluitingen bewaren</button><p role="status" data-exclusions-status></p></form>`:'<p class="muted">Open dit scherm in de volledige CRM-werkplek om testadressen te bewaren.</p>'}</details>`;
}
export function installExclusions(root,{state,save,onSaved}){
 const form=root.querySelector('[data-exclusions-form]');if(!form||!save)return;
 installFormGuidance(form);let expected=analyticsExclusions(state.analyticsExclusions),busy=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!validateForm(form))return;
  const status=form.querySelector('[data-exclusions-status]'),error=form.querySelector('[data-form-error]'),button=form.querySelector('[type=submit]');error.textContent='';
  try{
   const split=value=>String(value||'').split(/[\n;,]+/).map(v=>v.trim()).filter(Boolean),fd=new FormData(form);
   const value=analyticsExclusions({emails:split(fd.get('testEmails')),leadIds:split(fd.get('testLeadIds'))});
   busy=true;form.inert=true;form.setAttribute('aria-busy','true');button.textContent='Bewaren…';status.textContent='Uitsluitingen bewaren…';
   const latest=await save(value,expected);expected=value;markFormClean(form);
   form.elements.testEmails.value=value.emails.join('\n');form.elements.testLeadIds.value=value.leadIds.join('\n');
   const known=analyticsExclusionContext(latest);form.querySelector('[data-exclusions-summary]').textContent=`${known.orderIds.size} CRM-orders en ${known.leadIds.size} bekende aanvraag-ID’s vallen onder deze filters, over alle periodes.`;
   status.textContent='Bewaard. Rapport opnieuw laden…';await onSaved(latest);status.textContent='Bewaard. De rapportstatus hierboven geeft aan of verversen is gelukt.';
  }catch(problem){error.textContent='Niet opgeslagen: '+problem.message;status.textContent='Je invoer is behouden.';}
  finally{busy=false;form.inert=false;form.removeAttribute('aria-busy');button.textContent='Uitsluitingen bewaren';}
 });
}
