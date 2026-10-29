import {funnelPayment} from '../../shared/sales-funnel.js?v=feedback29-batch3-followup';
import {paymentDepositSuggestion} from '../../shared/payment-deposit-suggestion.js?v=feedback29-batch3-followup';
import {manualReceiptBasis,similarReceipts,appendManualReceipt,validReceiptDate} from '../../shared/manual-receipt.js?v=feedback29-batch3-followup';
export function createPaymentEntry(context){
 return function paymentForm(id,paymentId){
  if(paymentId)return context.openPaymentCorrection(paymentId);
  let owner=context.order(id);if(!owner)throw Error('Deze order bestaat niet meer.');
  let totals=context.totals(owner),expected=manualReceiptBasis(context.state,id);
  const receiptId=context.uid(),known=()=>{const basis=funnelPayment(context.state,owner);return basis.known&&basis.total>0&&basis.total===totals.total&&basis.paid===totals.paid;},deposit=()=>paymentDepositSuggestion(owner,totals.total,{paid:totals.paid});
  const initial=deposit(),initialPercent=known()&&initial.known&&totals.paid===0?initial.percentage:null,initialAmount=known()&&initial.known&&initial.remaining>0?(initial.remaining/100).toFixed(2):'';
  function readAmount(value){const text=String(value||'').trim();return /^\d+(?:[.,]\d{1,2})?$/.test(text)?Math.round(context.decimalNumber(text)*100):NaN;}
  async function refreshBasis(){
   const latest=await context.store('state','readonly',store=>store.get('main'));if(!latest?.orders?.some(o=>o.id===id))throw Error('Deze order bestaat niet meer.');
   latest.purchases??=[];context.state=latest;owner=context.order(id);totals=context.totals(owner);expected=manualReceiptBasis(latest,id);
   form.elements.confirmReceipt.checked=false;paint();form.querySelector('[data-payment-refresh-note]').textContent='Actueel saldo opgehaald. Je invoer is behouden; controleer het bedrag opnieuw.';
  }
  let form;
  context.openForm('Betaling registreren',`<p class="form-help">Registreer uitsluitend het volledige bedrag dat je werkelijk hebt ontvangen, inclusief btw.</p><div class="payment-entry-basis" data-payment-basis></div><p class="form-help" data-payment-deposit></p><div class="actions payment-entry-presets"><button type="button" data-payment-preset="deposit"></button><button type="button" data-payment-preset="remaining">Openstaand bedrag</button></div><div class="fields">${context.field('amount','Ontvangen bedrag incl. btw (€)',initialAmount,'number','required min="0.01" step="0.01" inputmode="decimal"')}${context.field('paymentPercentage','Of percentage van ordertotaal incl. btw (%)',initialPercent??'','number','min="0.01" max="100" step="0.01"')}${context.field('date','Ontvangstdatum',context.today(),'date','required max="'+context.today()+'"')}${context.field('reference','Referentie / omschrijving','','text','maxlength="2000"')}</div><p class="form-help">Een percentage is een deel van het volledige orderbedrag, niet van het restant. Paarse bedragen zijn rekensuggesties; controleer ze met je bank.</p><div class="payment-entry-review" data-payment-review hidden><p class="notice" data-payment-warning></p><label class="check-row"><input name="confirmReceipt" type="checkbox"><span>Ik heb dit gecontroleerd. Dit is werkelijk een aparte ontvangen betaling en het bedrag klopt.</span></label></div><p data-payment-after role="status"></p><p class="form-help" data-payment-refresh-note></p><section class="form-section"><h3>Actueel saldo</h3><p class="form-help">Bij een gewijzigde order of betaling kun je hier doorgaan met je huidige invoer.</p><button type="button" data-payment-refresh>Actueel saldo ophalen</button></section>`,async fd=>{
   const amount=readAmount(fd.get('amount')),date=String(fd.get('date')||''),reference=String(fd.get('reference')||'').trim();
   if(!Number.isSafeInteger(amount)||amount<=0)throw context.formProblem('Vul een positief bedrag in met maximaal twee decimalen.',{field:'amount'});
   if(!validReceiptDate(date)||date>context.today())throw context.formProblem('Kies de werkelijke ontvangstdatum, uiterlijk vandaag.',{field:'date'});
   const overpaid=known()&&totals.paid+amount>totals.total;let result;
   try{await context.mergeStoredState(next=>{
    result=appendManualReceipt(next,id,expected,{id:receiptId,amount,date,reference,registeredAt:new Date().toISOString()},{acknowledged:fd.has('confirmReceipt'),requiresReview:overpaid,today:context.today()});
    if(!result.alreadySaved)next.activities.unshift({id:context.uid(),message:'Betaling geregistreerd voor order #'+(next.orders.find(o=>o.id===id)?.sourceNumber||owner.number),time:new Date().toISOString()});
   },{allowDuplicatePayments:fd.has('confirmReceipt')});}catch(error){if(error.code==='RECEIPT_BASIS_CHANGED')throw context.formProblem(error.message,{action:{label:'Actueel saldo ophalen',run:refreshBasis}});throw error;}
   context.toast(result.alreadySaved?'Deze ontvangst was al opgeslagen':'Betaling geregistreerd');
  },{afterSave:()=>{context.orderView={id,tab:'payments'};history.replaceState(null,'',`#orders/${id}/payments`);context.renderOrder(id);}});
  form=context.$('#dialog form');const amount=form.elements.amount,percentage=form.elements.paymentPercentage,confirmation=form.elements.confirmReceipt;
  form.querySelector('[type=submit]').textContent='Ontvangst registreren';
  function source(){context.markFormSources(form,context.markProvenance({amount:context.decimalNumber(amount.value)},['amount'],'calculator'));}
  function suggest(cents,percent=''){amount.value=(cents/100).toFixed(2);amount.dispatchEvent(new Event('input',{bubbles:true}));percentage.value=String(percent);source();}
  function paint(){
   form.querySelector('[data-payment-basis]').textContent=known()?'Ordertotaal '+context.euro(totals.total)+' · ontvangen '+context.euro(totals.paid)+' · openstaand '+context.euro(Math.max(0,totals.balance))+' — alles incl. btw':'Orderbedrag nog niet compleet. Je kunt wel een werkelijk ontvangen bedrag registreren.';
   const depositButton=form.querySelector('[data-payment-preset=deposit]'),remainingButton=form.querySelector('[data-payment-preset=remaining]');
   const proposal=deposit();depositButton.textContent=totals.paid>0?'Aanbetaling aanvullen tot '+proposal.percentage+'%':proposal.percentage+'% aanbetaling';depositButton.hidden=!known()||!proposal.known||proposal.remaining<=0;remainingButton.hidden=!known()||totals.balance<=0;
   form.querySelector('[data-payment-deposit]').textContent=!known()?'Een aanbetalingsvoorstel verschijnt bij een complete product- en verzendprijs en geldige ontvangsten.':!proposal.known?proposal.basis+' · controleer de orderprijs en aanbetalingsafspraak.':proposal.basis+': '+proposal.percentage+'% = '+context.euro(proposal.amount)+' incl. btw · '+(proposal.remaining>0?'nog '+context.euro(proposal.remaining)+' tot deze aanbetaling':'aanbetaling bereikt')+'. Het ingevulde bedrag blijft een voorstel; registreer alleen wat werkelijk is ontvangen.';
   percentage.closest('label').hidden=!known();percentage.disabled=!known();
   const value=readAmount(amount.value),date=form.elements.date.value,duplicates=similarReceipts(context.state,id,{amount:value,date}),warnings=[];
   if(duplicates.length)warnings.push('Er staat al '+(duplicates.length===1?'een ontvangst':'meer dan één ontvangst')+' met dit bedrag op deze datum. Controleer of dit geen dubbele registratie is; ook andere orders bij deze klant worden meegenomen.');
   if(known()&&Number.isSafeInteger(value)&&totals.paid+value>totals.total)warnings.push('Na opslaan is er '+context.euro(totals.paid+value-totals.total)+' meer ontvangen dan het orderbedrag.');
   form.querySelector('[data-payment-warning]').textContent=warnings.join(' ');form.querySelector('[data-payment-review]').hidden=!warnings.length;confirmation.required=!!warnings.length;confirmation.disabled=!warnings.length;
   const after=form.querySelector('[data-payment-after]');after.textContent=known()&&Number.isSafeInteger(value)&&value>0?'Na registratie: '+context.euro(totals.paid+value)+' ontvangen · '+context.euro(Math.max(0,totals.balance-value))+' openstaand, incl. btw.':'';
  }
  amount.addEventListener('input',()=>{percentage.value='';confirmation.checked=false;paint();});
  form.elements.date.addEventListener('input',()=>{confirmation.checked=false;paint();});
  form.elements.reference.addEventListener('input',()=>{confirmation.checked=false;});
  percentage.addEventListener('input',()=>{const value=context.decimalNumber(percentage.value);if(!known()||!Number.isFinite(value)||value<=0||value>100)return;suggest(Math.round(totals.total*value/100),value);});
  form.querySelector('[data-payment-preset=deposit]').onclick=()=>{const proposal=deposit();if(known()&&proposal.known&&proposal.remaining>0)suggest(proposal.remaining,totals.paid===0?proposal.percentage:'');};
  form.querySelector('[data-payment-preset=remaining]').onclick=()=>{if(known()&&totals.balance>0)suggest(totals.balance);};
  form.querySelector('[data-payment-refresh]').onclick=async event=>{const button=event.currentTarget;if(form.inert)return;const previousInert=form.inert;button.disabled=true;form.inert=true;form.setAttribute('aria-busy','true');try{await refreshBasis();}catch(error){context.showFormProblem(form,error,{toast:context.toast});}finally{button.disabled=false;form.inert=previousInert;form.removeAttribute('aria-busy');}};
  paint();if(initialAmount)source();
 };
}
