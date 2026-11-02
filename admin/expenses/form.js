import {expenseCategories,expenseCost,expensePaid,expenseSourceChoices,expenseSourceKey,expenseSourceValue,expenseEditBasis,possibleExpenseDuplicates,saveBusinessExpense,validateBusinessExpenses} from '../../shared/business-expenses.js?v=invoice-intake-review-20261031';
import {installSelectSearch} from '../workspace/select-search.js?v=feedback30-batch3';
import {validateNamedCosts} from '../../shared/named-costs.js?v=invoice-intake-review-20261031';

export function createExpenseForm(context){
 function open(id='',prefill={}){
  const old=(context.state.businessExpenses||[]).find(e=>e.id===id);if(id&&!old)throw Error('Deze uitgave bestaat niet meer.');
  const openedAt=new Date().toISOString(),seed=old?structuredClone(old):{id:context.uid(),label:'',category:'other',counterparty:'',reference:'',date:'',netCents:null,vatCents:null,deductibleVatCents:null,grossCents:null,payments:[],paidVatCents:null,paidVatDate:'',documentIds:[],evidenceNote:'',note:'',target:{kind:'general',ownerId:'',slot:'',costId:''},createdAt:openedAt,updatedAt:openedAt,...prefill};
  const choices=expenseSourceChoices(context.state,seed.id),currentKey=expenseSourceKey(seed.target),sourceBases=new Map(choices.map(c=>[expenseSourceKey(c.target),expenseEditBasis(context.state,seed.id,c.target)]));
  if(old)sourceBases.set(currentKey,expenseEditBasis(context.state,seed.id,seed.target));
  const sourceLabel=choices.find(c=>expenseSourceKey(c.target)===currentKey)?.label||'Bewaarde kostenkoppeling';
  const moneyInput=(name,label,value,extra='')=>context.field(name,label,value==null?'':(value/100).toFixed(2),'number','min="0" step="0.01" '+extra);
  const paymentRow=(p={id:context.uid(),amount:null,date:'',reference:''})=>`<section class="form-section" data-expense-payment="${context.esc(p.id)}"><div class="fields">${moneyInput('expensePayAmount','Werkelijk betaald incl. btw (€)',p.amount,'required')}${context.field('expensePayDate','Werkelijke betaaldatum',p.date,'date','required max="'+context.today()+'"')}${context.field('expensePayReference','Betaalkenmerk',p.reference,'text','maxlength="200"')}</div><button type="button" data-expense-remove-payment>Deze betaalregistratie weglaten</button></section>`;
  const evidence=context.state.documents.filter(d=>seed.documentIds.includes(d.id)||!d.generated&&!d.internalDesign&&!d.invoiceId&&!d.supplierDocument&&!d.vatEvidence&&!(context.state.supplierInvoiceImports||[]).some(r=>r.documentId===d.id||r.history.some(h=>h.before.documentId===d.id))&&/\.(pdf|png|jpe?g)$/i.test(d.name)&&d.ownerId===(seed.target.kind==='general'?seed.id:seed.target.ownerId)&&!(context.state.businessExpenses||[]).some(e=>e.id!==seed.id&&e.documentIds.includes(d.id)));
  const evidenceBases=new Map(evidence.map(d=>[d.id,JSON.stringify(d)]));
  let form;const fileIds=new WeakMap();
  context.openForm(old?'Bedrijfskosten aanpassen':'Bedrijfskosten vastleggen',`
   <p>Leg één uitgave vast. Een betaling is geen tweede kostenpost. Onbekend blijft leeg; btw en aftrek worden niet uit een tarief of bankbedrag geraden.</p>
   <section class="form-section"><h3>Waar horen deze kosten?</h3>${old?'<p>'+context.esc(sourceLabel)+'</p><p class="form-help">Deze bestaande koppeling blijft behouden. Een gewijzigde btw-bron moet je daarna opnieuw in het btw-register controleren.</p>':`<label>Kostenbron<select name="source">${choices.map(c=>`<option value="${context.esc(expenseSourceKey(c.target))}" ${expenseSourceKey(c.target)===currentKey?'selected':''}>${context.esc(c.label)}</option>`).join('')}</select></label>`}<p class="notice" data-expense-source-info></p></section>
   <div class="fields">${context.field('label','Omschrijving',seed.label,'text','required maxlength="200"')}<label>Kostensoort<select name="category">${expenseCategories.map(([key,label])=>`<option value="${key}" ${key===seed.category?'selected':''}>${label}</option>`).join('')}</select></label>${context.field('counterparty','Betaald aan / leverancier',seed.counterparty,'text','maxlength="200"')}${context.field('reference','Factuurnummer / bronreferentie',seed.reference,'text','maxlength="200"')}${context.field('date','Bron- of factuurdatum (leeg = onbekend)',seed.date,'date')}</div>
   <section class="form-section"><h3>Bedragen volgens de bron</h3><div class="fields">${moneyInput('netCents','Bedrag excl. btw (€)',seed.netCents)}${moneyInput('vatCents','Btw volgens de bron (€)',seed.vatCents)}${moneyInput('deductibleVatCents','Daarvan aftrekbaar volgens jouw controle (€)',seed.deductibleVatCents)}${moneyInput('grossCents','Totaal incl. btw (€)',seed.grossCents)}</div><button type="button" data-expense-calculate-gross>Bruto berekenen uit netto + btw</button><p class="form-help">Btw €0 alleen bij expliciet geen btw. Bij positieve btw vul je het aftrekbare deel bewust in, ook als dat €0 is. Deze keuze is nog geen gecontroleerde btw-boeking.</p></section>
   <details class="form-details" ${seed.payments.length?'open':''}><summary>Werkelijk betaald (${seed.payments.length} registraties)</summary><div data-expense-payments>${seed.payments.map(paymentRow).join('')}</div><button type="button" data-expense-add-payment>Betaling registreren</button><p class="form-help">Alleen geld dat daadwerkelijk is overgemaakt. Geen betaling invullen omdat er een factuur staat. Een betaling die al bij een leveranciersdocument staat, registreer je hier niet opnieuw.</p><div class="fields">${moneyInput('paidVatCents','Werkelijk betaalde btw (optioneel, €)',seed.paidVatCents)}${context.field('paidVatDate','Btw betaald op',seed.paidVatDate,'date','max="'+context.today()+'"')}</div><p class="form-help">Betaalde btw wordt niet naar rato van een aanbetaling geschat en niet nogmaals bij de betalingen opgeteld.</p></details>
   <details class="form-details" ${seed.documentIds.length?'open':''}><summary>Factuur / bon / betaalbewijs</summary>${evidence.map(d=>seed.documentIds.includes(d.id)?`<p>${context.esc(d.name)} <button type="button" data-action="download" data-id="${context.esc(d.id)}">Download</button> · blijft bewaard</p>`:`<label class="check-row"><input type="checkbox" name="existingEvidence" value="${context.esc(d.id)}">${context.esc(d.name)}</label>`).join('')}<label>Nieuwe bewijsbestanden<input type="file" name="attachments" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"></label><p class="form-help">Maximaal 5 nieuwe PDF/PNG/JPG-bestanden, 15 MB per bestand en 30 MB samen. Bewijs en uitgave worden samen opgeslagen.</p>${context.area('evidenceNote','Of verwijzing naar extern bewijs',seed.evidenceNote)}</details>
   ${context.area('note','Eigen toelichting',seed.note)}${old?context.area('changeReason','Reden voor deze wijziging (verplicht)'):''}
   <p class="notice" role="status" data-expense-review></p><div data-expense-duplicates></div>
   <label class="check-row" data-expense-cost-change hidden><input type="checkbox" name="confirmCostChange">Ik heb de oude en nieuwe kostprijs gecontroleerd. Deze bestaande dossierkosten mogen worden vervangen.</label>
   <label class="check-row"><input type="checkbox" name="confirmExpense" required>Ik heb bedragen, kostenbron en eventuele werkelijke betalingen gecontroleerd. Deze uitgave wordt één keer geregistreerd.</label>`,async fd=>{
    const selected=sourceChoice(),value=read(fd),chosen=fd.getAll('attachments');
    if(chosen.some(f=>f?.name&&!f.size))throw context.formProblem('Dit bewijsbestand is leeg. Kies het volledige bestand.',{field:'attachments'});
    const files=chosen.filter(f=>f?.size);
    if(files.length>5||files.some(f=>f.size>15*1024*1024||! /\.(pdf|png|jpe?g)$/i.test(f.name))||files.reduce((n,f)=>n+f.size,0)>30*1024*1024)throw context.formProblem('Kies maximaal 5 PDF/PNG/JPG-bestanden van maximaal 15 MB elk en 30 MB samen.',{field:'attachments'});
    const uploads=[];
    for(const file of files){
     let uploadId=fileIds.get(file);if(!uploadId){uploadId=context.uid();fileIds.set(file,uploadId);}
     const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))].map(b=>b.toString(16).padStart(2,'0')).join('');
     uploads.push({blob:file,metadata:{id:uploadId,ownerId:value.target.kind==='general'?value.id:value.target.ownerId,businessExpenseId:value.id,businessExpenseHash:hash,category:'other',name:file.name,size:file.size,type:file.type||'application/octet-stream',date:context.today(),createdAt:openedAt}});
    }
    if(new Set(uploads.map(u=>u.metadata.businessExpenseHash)).size!==uploads.length)throw context.formProblem('Hetzelfde bewijsbestand is meermaals gekozen. Kies elk bestand één keer.',{field:'attachments'});
    const existingDocumentIds=[...value.documentIds];
    value.documentIds=[...new Set([...value.documentIds,...uploads.map(u=>u.metadata.id)])];
    const options={adopting:selected.adopting,confirmed:fd.has('confirmExpense'),allowCostChange:fd.has('confirmCostChange'),allowSimilar:fd.has('confirmSimilar'),changeReason:String(fd.get('changeReason')||''),today:context.today()};
    if(!options.confirmed)throw context.formProblem('Controleer en bevestig de uitgave.',{field:'confirmExpense'});
    const expected=sourceBases.get(expenseSourceKey(value.target));let result;
    const mutate=next=>{
     for(const id of existingDocumentIds)if(!evidenceBases.has(id)||JSON.stringify(next.documents.find(d=>d.id===id))!==evidenceBases.get(id))throw Error('Een gekozen bewijsbestand is intussen gewijzigd. Je invoer blijft staan; open de actuele bron opnieuw.');
     for(const u of uploads){const existing=next.documents.find(d=>d.id===u.metadata.id);if(existing&&JSON.stringify(existing)!==JSON.stringify(u.metadata))throw Error('Een bewijsbestand is intussen gewijzigd. Je invoer blijft staan.');if(!existing)next.documents.push(u.metadata);}
     for(const e of next.businessExpenses||[])if(e.id!==value.id&&uploads.some(u=>e.documentIds.some(docId=>next.documents.find(d=>d.id===docId)?.businessExpenseHash===u.metadata.businessExpenseHash)))throw Error('Dit bewijsbestand staat al bij een andere uitgave. Controleer die registratie om dubbele kosten te voorkomen.');
     result=saveBusinessExpense(next,value,expected,options);if(value.target.kind!=='general')validateNamedCosts((value.target.kind==='order'?next.orders:next.purchases).find(o=>o.id===value.target.ownerId));validateBusinessExpenses(next);
     if(!result.alreadySaved)next.activities.unshift({id:context.uid(),message:'Bedrijfskosten '+(old?'bijgewerkt':'vastgelegd')+': '+value.label,time:new Date().toISOString()});
    };
    if(uploads.length){
     let next;context.beginLocalStateChange();await new Promise((resolve,reject)=>{
      const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),req=ss.get('main');let failure;
      req.onsuccess=()=>{try{next=req.result;if(!next)throw Error('De CRM-opslag ontbreekt.');mutate(next);for(const u of uploads)tx.objectStore('files').put({id:u.metadata.id,blob:u.blob});ss.put(next,'main');}catch(error){failure=error;tx.abort();}};
      tx.oncomplete=resolve;tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||tx.error||Error('Opslaan afgebroken. Je invoer en bestanden blijven staan.'));
     });context.state=next;context.notifyDataChanged();
    }else await context.mergeStoredState(mutate);
    context.toast(result.alreadySaved?'Deze uitgave was al opgeslagen':'Bedrijfskosten opgeslagen');
   },{afterSave:()=>{history.replaceState(null,'','#expenses/'+seed.id);context.render();}});
  form=context.$('#dialog form');form.querySelector('[type=submit]').textContent='Uitgave opslaan';
  if(form.elements.changeReason)form.elements.changeReason.required=true;
  if(!old)installSelectSearch(form.elements.source,{label:'Zoek klant, order of inkoopbestelling'});
  function sourceChoice(){if(old)return {target:old.target,adopting:true};const selected=choices.find(c=>expenseSourceKey(c.target)===form.elements.source.value);if(!selected)throw context.formProblem('Kies een geldige kostenbron.',{field:'source'});return selected;}
  function read(fd){
   const value={...seed,...Object.fromEntries(['label','category','counterparty','reference','date','paidVatDate','evidenceNote','note'].map(key=>[key,String(fd.get(key)||'').trim()])),target:structuredClone(sourceChoice().target),updatedAt:new Date().toISOString()};
   for(const key of ['netCents','vatCents','deductibleVatCents','grossCents','paidVatCents']){const raw=String(fd.get(key)||'').trim();value[key]=raw===''?null:context.cents(raw);if(value[key]!=null&&(!Number.isSafeInteger(value[key])||value[key]<0))throw context.formProblem('Vul een geldig bedrag in of laat onbekend leeg.',{field:key});}
   value.payments=[...form.querySelectorAll('[data-expense-payment]')].map(row=>{const raw=row.querySelector('[name=expensePayAmount]').value,amount=raw.trim()===''?null:context.cents(raw);if(!Number.isSafeInteger(amount)||amount<=0)throw context.formProblem('Vul het werkelijk betaalde bedrag in.',{field:row.querySelector('[name=expensePayAmount]')});return {id:row.dataset.expensePayment,amount,date:row.querySelector('[name=expensePayDate]').value,reference:row.querySelector('[name=expensePayReference]').value.trim()};});
   value.documentIds=[...new Set([...seed.documentIds,...fd.getAll('existingEvidence').map(String)])];return value;
  }
  function paint(){
   const out=form.querySelector('[data-expense-review]'),source=form.querySelector('[data-expense-source-info]'),change=form.querySelector('[data-expense-cost-change]'),dups=form.querySelector('[data-expense-duplicates]');
   try{const e=read(new FormData(form)),selected=sourceChoice(),amount=expenseCost(e),current=expenseSourceValue(context.state,e.target),matches=possibleExpenseDuplicates(context.state,e);
    source.textContent=e.target.kind==='general'?'Deze kosten staan los van klantorders en tellen hier als algemene bedrijfskosten.':(selected.adopting?'Bestaande dossierkosten worden gekoppeld; hetzelfde bedrag wordt niet opnieuw opgeteld.':'Deze kosten worden één keer bij het gekozen dossier opgenomen.')+(current!=null?' Bestaande kostprijs: '+context.euro(current)+'.':'');
    out.textContent='Kostprijs: '+(amount==null?'nog vaststellen':context.euro(amount))+' · geregistreerd betaald: '+context.euro(expensePaid(e))+(e.grossCents==null?' · brutobedrag onbekend':' · nog te betalen: '+context.euro(Math.max(0,e.grossCents-expensePaid(e)))+(expensePaid(e)>e.grossCents?' · meer betaald dan bruto':''))+(e.netCents!=null&&e.vatCents!=null&&e.grossCents!=null&&e.netCents+e.vatCents!==e.grossCents?' · netto + btw sluit niet aan op bruto.':'');
    change.hidden=e.target.kind==='general'||current==null||current===amount;change.querySelector('input').required=!change.hidden;
    const signature=matches.map(row=>row.id).sort().join('/');if(dups.dataset.signature!==signature){dups.dataset.signature=signature;dups.innerHTML=matches.length?'<p class="notice">Mogelijk al geregistreerd: '+matches.map(row=>'<a target="_blank" rel="noopener" href="#expenses/'+context.esc(row.id)+'">'+context.esc(row.label)+'</a>').join(', ')+'.</p><label class="check-row"><input type="checkbox" name="confirmSimilar">Dit is volgens mijn bron werkelijk een afzonderlijke uitgave.</label>':'';}
   }catch(error){out.textContent=error.message;}
  }
  function edit(event){if(!['confirmExpense','confirmCostChange','confirmSimilar','changeReason'].includes(event.target.name)){form.elements.confirmExpense.checked=false;form.elements.confirmCostChange.checked=false;if(form.elements.confirmSimilar)form.elements.confirmSimilar.checked=false;}paint();}
  form.addEventListener('input',edit);form.addEventListener('change',edit);
  form.addEventListener('click',event=>{
   if(event.target.closest('[data-expense-add-payment]')){form.querySelector('[data-expense-payments]').insertAdjacentHTML('beforeend',paymentRow());form.dispatchEvent(new Event('change',{bubbles:true}));}
   const remove=event.target.closest('[data-expense-remove-payment]');if(remove){remove.closest('[data-expense-payment]').remove();form.dispatchEvent(new Event('change',{bubbles:true}));}
   if(event.target.closest('[data-expense-calculate-gross]'))try{const fd=new FormData(form),net=fd.get('netCents'),vat=fd.get('vatCents');if(!String(net).trim()||!String(vat).trim())throw Error('Vul netto en btw volgens de bron in; onbekend is geen nul.');const total=context.cents(net)+context.cents(vat);if(!Number.isSafeInteger(total)||total<0)throw Error('Controleer netto en btw.');form.elements.grossCents.value=(total/100).toFixed(2);form.elements.grossCents.dispatchEvent(new Event('input',{bubbles:true}));}catch(error){context.toast(error.message);}
  });paint();
 }
 return {open};
}
