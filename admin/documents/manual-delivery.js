export function createManualDocumentDelivery(context){
 const supported=d=>d&&context.order(d.ownerId)&&['invoice','confirmation','quote'].includes(d.generated?.kind||d.manualDelivery?.kind||d.category)&&/\.pdf$/i.test(d.name||'');
 function button(d){return supported(d)?`<button type="button" data-document-manual-delivery="${context.esc(d.id)}">${d.manualDelivery?'Externe verzending bekijken':'Al buiten CRM verstuurd'}</button>`:'';}
 function status(d){return d?.manualDelivery?`<small>Extern verstuurd op ${context.date(d.manualDelivery.sentOn)} · zelf geregistreerd</small>`:'';}
 document.addEventListener('click',event=>{
  const control=event.target.closest('[data-document-manual-delivery]');if(!control)return;
  try{
   const d=context.state.documents.find(d=>d.id===control.dataset.documentManualDelivery);if(!supported(d))throw Error('Dit document is niet beschikbaar.');
   const expected=JSON.stringify(d),expectedCustomer=context.order(d.ownerId).customerId,kind=d.generated?.kind||d.manualDelivery?.kind||d.category,key={invoice:'invoiceSentDate',confirmation:'confirmationSentDate',quote:'quoteSentDate'}[kind];
   if(d.manualDelivery){context.openForm('Externe verzending',`<p>Dit document is als buiten het CRM verstuurd geregistreerd op <strong>${context.date(d.manualDelivery.sentOn)}</strong>.</p><p>Dit is jouw registratie, geen aflever- of leesbevestiging.</p>`,async()=>{});const form=context.$('#dialog form');form.querySelector('[type=submit]').textContent='Sluiten';form.querySelector('#cancel').hidden=true;return;}
   context.openForm('Verzending buiten het CRM registreren',`<p><strong>${context.esc(d.name)}</strong></p><p>Registreer dit alleen als je dit document zelf al hebt verstuurd, bijvoorbeeld vanuit Gmail. Deze knop verstuurt niets.</p><label>Verstuurd op<input name="sentOn" type="date" required max="${context.today()}" value="${context.today()}"></label><label class="check-row"><input name="confirm" type="checkbox" required>Ik heb dit document daadwerkelijk buiten het CRM verstuurd.</label>`,async fd=>{
    const sentOn=String(fd.get('sentOn')||'');if(!fd.has('confirm')||!/^\d{4}-\d{2}-\d{2}$/.test(sentOn)||!Number.isFinite(Date.parse(sentOn))||new Date(sentOn).toISOString().slice(0,10)!==sentOn||sentOn>context.today())throw Error('Bevestig de verzending en kies een geldige datum.');
    await context.mergeStoredState(next=>{
     const current=next.documents.find(x=>x.id===d.id),owner=next.orders.find(o=>o.id===d.ownerId);if(!owner||owner.customerId!==expectedCustomer||JSON.stringify(current)!==expected)throw Error('Het document of dossier is intussen gewijzigd. Open deze actie opnieuw.');
     current.manualDelivery={kind,sentOn,recordedAt:new Date().toISOString(),source:'user'};
     // Only a current document advances the dossier's manual milestone.
     const siblings=next.documents.map((file,index)=>({file,index})).filter(({file})=>file.ownerId===d.ownerId&&(file.generated?.kind||file.manualDelivery?.kind||file.category)===kind&&/\.pdf$/i.test(file.name||''));
     const newest=siblings.sort((a,b)=>String(b.file.createdAt||b.file.date||'').localeCompare(String(a.file.createdAt||a.file.date||''))||b.index-a.index)[0]?.file;
     if(newest?.id===d.id&&(!owner[key]||owner[key]<sentOn))owner[key]=sentOn;
     next.activities.unshift({id:context.uid(),message:'Externe documentverzending handmatig geregistreerd',time:current.manualDelivery.recordedAt});
    });context.toast('Externe verzending geregistreerd · er is geen mail verstuurd');
   },{afterSave:context.render});
  }catch(error){context.toast(error.message);}
 });
 return {button,status};
}
