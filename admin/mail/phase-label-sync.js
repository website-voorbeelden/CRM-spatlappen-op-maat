import {salesFunnel} from '../../shared/sales-funnel.js?v=ui-batch234-20261027';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createPhaseLabelSync({company,getState,request,openForm,toast}){
 async function review(orderId,thread){
  const state=getState(),order=state.orders.find(o=>o.id===orderId);
  if(!order)throw Error('Deze order bestaat niet meer.');
  const phase=salesFunnel(state,order,company.id).displayPhase;
  const proposal=await request('phase-review',{orderId,threadId:thread.gmailThreadId,mailbox:thread.mailbox,phase});
  if(proposal.already){toast('Gmail staat al op deze verkoopfase.');return;}
  if(proposal.needsConsent){
   let login;
   openForm('Google-toestemming voor faselabels',`<p>Je huidige koppeling leest alleen mail. Voor het label <strong>${esc(proposal.target)}</strong> is aanvullende Gmail-toestemming nodig.</p><p>Google noemt dit lezen en wijzigen van e-mails (gmail.modify). Deze CRM-route gebruikt dit uitsluitend om bestaande verkoopfaselabels bij één gecontroleerd gesprek bij te werken. Hij verstuurt of verwijdert geen mail. Andere Gmail-acties blijven geblokkeerd.</p><label class="check-row"><input name="consent" type="checkbox" required>Ik wil de aanvullende Google-aanmelding zelf openen.</label>`,async fd=>{if(!fd.has('consent'))throw Error('Kies eerst of je aanvullende toegang wilt aanvragen.');login=await request('login',{enablePhaseLabels:true});},{afterSave:()=>openForm('Aanmelden bij Google',`<p>Open Google en geef zelf toestemming. Bestaande mailverzending blijft via SMTP2GO. Keer daarna terug en kies opnieuw Gmail-fase bijwerken; er wordt niets automatisch ingehaald.</p><a href="${esc(login.url)}" target="_blank" rel="noopener noreferrer">Google-aanmelding openen →</a>`,async()=>{}, {trackChanges:false}),trackChanges:false});
   return;
  }
  openForm('Gmail-verkoopfase bijwerken',`<p><strong>${esc(proposal.mailbox)}</strong><br>${esc(proposal.subject)}</p><p>Toevoegen: <strong>${esc(proposal.target)}</strong></p><p>Verwijderen: ${proposal.removeNames.length?proposal.removeNames.map(esc).join(', '):'geen andere verkoopfaselabels'}. Alle overige labels blijven staan. Dit geldt voor alle berichten in dit gesprek.</p><p class="form-help">Deze bevestiging verloopt na twee minuten. Er wordt geen mail verstuurd, gelezen gemarkeerd, gearchiveerd of verwijderd.</p><label class="check-row"><input type="checkbox" name="confirm" required>Ik geef toestemming voor precies deze Gmail-labelwijziging.</label>`,async fd=>{
   if(!fd.has('confirm'))throw Error('Bevestig de labelwijziging eerst.');
   const latest=getState().orders.find(o=>o.id===orderId);if(!latest||salesFunnel(getState(),latest,company.id).displayPhase!==phase||!getState().mailThreads?.some(t=>t.orderId===orderId&&t.mailbox===thread.mailbox&&t.gmailThreadId===thread.gmailThreadId))throw Error('De orderfase of koppeling is gewijzigd. Open een nieuw voorstel.');
   await request('phase-apply',{id:proposal.id,reviewToken:proposal.reviewToken,confirmation:'Gmail-faselabels bijwerken'},{phaseConfirmation:true});
  },{afterSave:()=>toast('Gmail-verkoopfase bijgewerkt'),trackChanges:false});
  const submit=document.querySelector('#dialog [type=submit]');if(submit)submit.textContent='Gmail-labels bijwerken';
 }
 async function open(orderId){
  if(company.id!=='maatwerkkunststof')throw Error('Deze faselabels horen bij Maatwerkkunststof.');
  const links=(getState().mailThreads||[]).filter(t=>t.orderId===orderId&&t.gmailThreadId&&t.mailbox);
  if(!links.length)throw Error('Koppel eerst het Gmail-gesprek via E-mail bij deze order.');
  if(links.length===1)return review(orderId,links[0]);
  let choice;
  openForm('Welk Gmail-gesprek bijwerken?',`<p>Er zijn meerdere gekoppelde gesprekken. Kies er één; de andere gesprekken veranderen niet.</p><label>Gesprek<select name="thread" required><option value="">Kies een gesprek</option>${links.map((t,i)=>`<option value="${i}">${esc(t.subject||t.gmailThreadId)} · ${esc(t.mailbox)}</option>`).join('')}</select></label>`,async fd=>{const index=Number(fd.get('thread'));if(fd.get('thread')===''||!Number.isInteger(index)||!links[index])throw Error('Kies een gesprek.');choice=links[index];},{afterSave:()=>review(orderId,choice).catch(error=>toast(error.message)),trackChanges:false});
 }
 return {open};
}
