import {inquiryCustomerReview,inquiryCustomerBasis,resolveInquiryCustomer,customerEmailMatches} from '../../shared/inquiry-customer.js';
import {parseFormInquiry,isFormInquiry} from '../../shared/inquiries.js?v=feedback-followup-20261028';
import {ensureCustomerNumbers} from '../customer-numbers.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createInquiryCustomerUI({getState,company,mergeStoredState,openForm,render,toast}){
 function projection(id){
  const state=getState(),order=state.orders.find(o=>o.id===id);if(!order)return null;
  const source=(state.inquirySources||[]).find(s=>s.orderId===id);
  const message=source&&(state.incomingEmails||[]).find(m=>source.key===JSON.stringify([company.id,m.mailbox,m.gmailId]));
  const fallback=message&&isFormInquiry(message,company.id)?parseFormInquiry(message,company.id).customer:null;
  return inquiryCustomerReview(state,order,fallback);
 }
 function markup(id){
  const review=projection(id);if(!review||!review.pending&&!review.resolved)return '';
  const {customer,source}=review;
  if(review.resolved)return `<details class="inquiry-customer-note"><summary>Klantkoppeling gecontroleerd · ${esc({keep:'bestaande klant behouden',new:'aparte klant',contact:'contactpersoon bij bedrijf'}[review.decision.choice]||'bevestigd')}</summary><p>Aanvraag van ${esc(source.contact||source.company)} · ${esc(source.email)}</p><button type="button" data-inquiry-customer="${esc(id)}">Koppeling opnieuw bekijken</button></details>`;
  return `<section class="notice inquiry-customer-review" role="status"><div class="section-heading"><div><h3>${customerEmailMatches(customer,source.email)?'Zelfde e-mailadres, andere aanvraaggegevens':'Aanvraaggegevens wijken af van klant'}</h3><p>Deze aanvraag is gekoppeld aan <strong>${esc(customer.company)}</strong>. Afwijkend: ${esc(review.differences.join(', '))}.</p><p>Ingevuld: <strong>${esc(source.contact||source.company)}</strong>${source.company&&source.company!==source.contact?' · '+esc(source.company):''} · ${esc(source.email||'e-mailadres niet bewaard')}</p></div><button type="button" data-inquiry-customer="${esc(id)}">Klantkoppeling controleren</button></div></section>`;
 }
 function open(id){
  const review=projection(id),state=getState(),order=state.orders.find(o=>o.id===id);if(!review||!order)return;
  const {customer,source}=review,expected=inquiryCustomerBasis(state,order,source);
  const rows=[['Bedrijfsnaam / klantnaam','company'],['Contactpersoon','contact'],['E-mailadres','email'],['Telefoon','phone']];
  openForm('Bij welke klant hoort deze aanvraag?',`<p>Een gedeeld e-mailadres kan bij meerdere personen horen. Controleer de inzending vóór je verdergaat.</p><div class="table-wrap"><table><thead><tr><th>Gegeven</th><th>Bestaande klant</th><th>In deze aanvraag</th></tr></thead><tbody>${rows.map(([label,key])=>`<tr><th>${label}</th><td>${esc(customer[key])||'—'}</td><td>${esc(source[key])||'Niet bewaard'}</td></tr>`).join('')}</tbody></table></div><fieldset><legend>Kies wat je wilt bewaren</legend><label class="check-row"><input type="radio" name="choice" value="keep" required> Bij ${esc(customer.company)} houden; bestaande gegevens behouden</label><label class="check-row"><input type="radio" name="choice" value="contact"> Extra contactpersoon toevoegen aan dit bedrijf</label><label class="check-row"><input type="radio" name="choice" value="new"> Aparte klant / bedrijf aanmaken voor deze order</label></fieldset><section data-contact-fields hidden><h3 data-contact-heading>Gegevens controleren</h3><div class="fields"><label><span data-name-label>Naam</span><input name="name" maxlength="200" value="${esc(source.contact||source.company)}" disabled></label><label data-new-contact hidden>Contactpersoon<input name="contact" maxlength="200" value="${esc(source.contact)}" disabled></label><label>E-mailadres<input name="email" type="email" maxlength="200" value="${esc(source.email)}" disabled></label><label>Telefoon<input name="phone" maxlength="100" value="${esc(source.phone)}" disabled></label></div></section><p class="form-help" data-choice-help>Er wordt pas iets gewijzigd als je bewaart.</p><p class="notice" data-new-warning hidden>Deze order en de erbij bewaarde mailgesprekken gaan naar de nieuwe klant. Andere orders blijven bij het bestaande bedrijf. Controleer het factuur- en afleveradres daarna. Eerder gemaakte documenten en facturen worden niet herschreven.</p>`,async fd=>{
   await mergeStoredState(next=>{resolveInquiryCustomer(next,id,source,Object.fromEntries(fd),{expected});ensureCustomerNumbers(next);});
   render();toast('Klantkoppeling gecontroleerd en bewaard');
  });
  const form=document.querySelector('#dialog form');
  form.querySelector('[type=submit]').textContent='Keuze bewaren';
  form.addEventListener('change',event=>{
   if(event.target.name!=='choice')return;
   const choice=event.target.value,editing=choice!=='keep',isNew=choice==='new';
   form.querySelector('[data-contact-fields]').hidden=!editing;
   for(const input of form.querySelectorAll('[data-contact-fields] input'))input.disabled=!editing||input.name==='contact'&&!isNew;
   form.elements.namedItem('name').required=editing;
   form.elements.namedItem('name').value=isNew?source.company||source.contact:source.contact||source.company;
   form.querySelector('[data-name-label]').textContent=isNew?'Bedrijfsnaam / klantnaam':'Naam contactpersoon';
   form.querySelector('[data-new-contact]').hidden=!isNew;
   form.querySelector('[data-new-warning]').hidden=!isNew;
   form.querySelector('[data-choice-help]').textContent=choice==='keep'?'Je bevestigt deze koppeling. De oorspronkelijke inzending blijft bij de order bewaard.':choice==='contact'?'De primaire contactpersoon en bedrijfsgegevens blijven behouden. Deze order krijgt de extra contactpersoon.':'Er wordt een apart klantdossier gemaakt met de gegevens hierboven.';
  });
 }
 function install(root){for(const button of root.querySelectorAll('[data-inquiry-customer]'))button.onclick=()=>open(button.dataset.inquiryCustomer);}
 return {markup,open,install};
}
