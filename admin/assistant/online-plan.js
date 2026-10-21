const labels={company:'Klantnaam',contact:'Contactpersoon',email:'E-mail',invoiceEmail:'Factuurmail',phone:'Telefoon',vatNumber:'Btw-nummer',country:'Land',billingAddress:'Factuuradres',shippingAddress:'Afleveradres',notes:'Notities',customerId:'Klant-ID',description:'Omschrijving',quantity:'Aantal',width:'Breedte (mm)',height:'Hoogte (mm)',price:'Verkoop per stuk excl. btw',vat:'Btw (%)',date:'Orderdatum',expectedDate:'Verwachte levering',stage:'Status'};
const valueLabel=(key,value)=>value==null?'Onbekend':key==='price'?new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(value/100):String(value);
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Human-only review dialog; the server, not this browser, owns the actual plan.
export async function saveOnlineAssistantPlan(plan,{openForm,onApplied,fetcher=fetch}){
 const proposalId=plan?.onlineApproval?.proposalId;if(!proposalId)throw Error('Dit voorstel heeft geen online goedkeuring. Vraag een nieuw voorstel.');
 async function call(action,body,confirm=false){
  let response;try{response=await fetcher('/api/crm/assistant/'+action,{method:'POST',headers:{'Content-Type':'application/json',...(confirm?{'X-CRM-Confirmation':'human-review'}:{})},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(30000)});}catch{throw Error('De opslagstatus is onzeker. Probeer dezelfde bevestiging opnieuw; maak geen tweede voorstel.');}
  let result;try{result=await response.json();}catch{throw Error('Geen opslagbevestiging ontvangen. Probeer hetzelfde voorstel opnieuw om de status op te halen.');}if(!response.ok)throw Error(result.error||'Bevestiging niet opgeslagen.');return result;
 }
 const review=await call('review',{proposalId});
 if(review.applied){await onApplied(review);return review;}
 const {onlineApproval,...shown}=plan;if(JSON.stringify(review.plan)!==JSON.stringify(shown))throw Error('Het servervoorstel wijkt af. Vraag een nieuw voorstel; er is niets opgeslagen.');
 return new Promise((resolve,reject)=>{
  let result,attempted=false;
  openForm('AI-wijzigingen controleren & bevestigen',`<p>Deze bevestiging is twee minuten geldig. Alleen onderstaande wijzigingen worden opgeslagen. Er worden geen mails verstuurd, betalingen uitgevoerd of bestanden verwijderd.</p>${review.plan.operations.map(op=>`<section class="form-section"><h3>${op.entity==='customer'?'Klant':'Order'} ${op.operation==='create'?'toevoegen':'bijwerken'} · ${escape(op.id)}</h3><dl class="detail">${Object.entries(op.fields).map(([key,value])=>`<dt>${escape(labels[key]||key)}</dt><dd>${escape(valueLabel(key,value))}</dd>`).join('')}</dl></section>`).join('')}<label class="check-row"><input type="checkbox" name="confirmAssistant" required>Ik heb de wijzigingen bekeken en geef toestemming om deze op te slaan.</label>`,async fd=>{
   if(!fd.has('confirmAssistant'))throw Error('Bevestig de wijzigingen eerst.');
   attempted=true;result=await call('approve',{proposalId,reviewToken:review.reviewToken,confirmation:'Deze wijzigingen opslaan'},true);
  },{afterSave:async()=>{try{await onApplied(result);resolve(result);}catch{reject(Error('Het voorstel is opgeslagen, maar het overzicht kon niet worden vernieuwd. Herlaad na het bewaren van eventuele andere invoer.'));}},afterCancel:()=>reject(Error(attempted?'De opslagstatus is niet bevestigd. Open hetzelfde voorstel opnieuw om de status op te halen.':'Geannuleerd vóór bevestiging. Er is niets gewijzigd.')),trackChanges:false});
 });
}
