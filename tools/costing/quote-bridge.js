import {inlineTaskClient} from './inline-task-client.js?v=build-triage-20261021';
import {calculationChoice} from '../../shared/costing-link.js';
import {newCostQuote,applyQuoteCalculation,privateCostInputs,quoteSignature} from './quote-domain.js';
import {readCostQuote,saveCostQuote} from './quote-store.js';
export async function installQuoteBridge({query,runtime,api,status}){
 if(query.has('orderId')||query.has('itemId'))return false;
 let quote=query.get('quoteId')?await readCostQuote(query.get('quoteId')):null,expected=quote?quoteSignature(quote):null,dirty=false,busy=false;
 if(quote)api.importState({...privateCostInputs(quote.inputs),selectedScenarioId:quote.selectedScenarioId});
 const panel=document.createElement('div');panel.id='crm-quote-actions';
 const heading=document.createElement('h2');heading.textContent=quote?'CRM-koppeling · '+quote.title:'Berekening bewaren voor het CRM';
 panel.append(heading);const hint=document.createElement('p');hint.textContent='Kies hierboven in de originele calculator een leverancier. Bewaar de gekozen leverancier en berekening als offerteconcept. Je maakt geen order en koppelt geen klantgegevens.';panel.append(hint);
 const sale=document.createElement('label');sale.innerHTML='<input type="checkbox"> Berekende verkoopprijzen ook in de offerte overnemen (excl. btw)';sale.querySelector('input').checked=!quote;
 const confirm=document.createElement('label');confirm.innerHTML='<input type="checkbox"> Ik heb gecontroleerd dat de gekozen leveranciersofferte geldt voor deze maten en aantallen.';
 panel.append(sale,confirm);const actions=document.createElement('div');actions.className='actions';const save=document.createElement('button');save.type='button';save.textContent=quote?'Gekozen leverancier & berekening in offerte bewaren':'Offerteconcept maken met deze berekening';const back=document.createElement('a');back.href='quotes.html'+(quote?'?quoteId='+encodeURIComponent(quote.id):'');back.textContent=quote?'Offerte bewerken →':'Offertewerkplek openen →';actions.append(save,back);panel.append(actions);document.querySelector('#crm-binding').append(panel);
 document.querySelector('#crm-return').href='/admin/#designs';status.textContent=quote?'Offerte geladen. Aanpassingen worden pas overgenomen als je hierboven bewaart.':'Losse berekening. Opslaan maakt uitsluitend een offerteconcept in deze browser.';
 const task=inlineTaskClient({onContext:product=>{if(quote||!product)return;const input=api.exportState();const piece=input.pieces?.[0];if(!piece)return;Object.assign(piece,product);api.importState(input);status.textContent='Nieuwe berekening vooraf ingevuld met bekende productspecificaties uit je formulier. Controleer materiaal, dikte, maten en aantal; sla de berekening daarna zelf op. Er zijn geen klantgegevens meegestuurd.';}}),notify=()=>task?.state({dirty,busy});
 const use=document.createElement('button'),pieces=document.createElement('select');if(task){use.type='button';use.textContent='Berekening gebruiken & terug';use.disabled=true;pieces.setAttribute('aria-label','Product om in je formulier te gebruiken');actions.append(pieces,use);}
 function updateReturn(){if(!task)return;pieces.replaceChildren();if(quote?.result){for(const p of quote.inputs.pieces){const option=document.createElement('option');option.value=p.id;option.textContent=p.name||'Product '+(pieces.options.length+1);pieces.append(option);}}use.disabled=busy||dirty||!quote?.result;pieces.hidden=quote?.inputs.pieces.length<2;}updateReturn();
 use.onclick=()=>{try{if(busy||dirty)throw Error('Bewaar eerst de berekening.');const choice=calculationChoice(quote,pieces.value);task.complete({quoteId:quote.id,pieceId:choice.pieceId});}catch(e){status.textContent=e.message;}};
 const changed=()=>{dirty=true;notify();updateReturn();status.textContent='Berekening gewijzigd · nog niet in de offerte opgeslagen.';};window.addEventListener('crm-costing-change',changed);
 save.onclick=async()=>{if(busy)return;busy=true;notify();updateReturn();save.disabled=true;sale.querySelector('input').disabled=true;confirm.querySelector('input').disabled=true;status.textContent='Offerteberekening opslaan…';try{
  const snapshot=api.calculate(),original=quote||newCostQuote(privateCostInputs(snapshot.calculation.state));
  const next=applyQuoteCalculation(original,snapshot,{copySale:sale.querySelector('input').checked,confirmSupplierQuote:confirm.querySelector('input').checked});
  quote=await saveCostQuote(next,expected);expected=quoteSignature(quote);dirty=false;back.href=task?task.url('quotes.html',{quoteId:quote.id}):'quotes.html?quoteId='+encodeURIComponent(quote.id);history.replaceState(null,'','?'+new URLSearchParams({quoteId:quote.id,...(task?{taskId:query.get('taskId')}:{})}));heading.textContent='Offerteberekening · '+quote.title;save.textContent='Gekozen leverancier & berekening in offerte bewaren';status.textContent='Leverancier en berekening opgeslagen. Er is geen order gemaakt. Je kunt de offerte nu bewerken.';
 }catch(e){status.textContent=e.message;}finally{busy=false;notify();updateReturn();save.disabled=false;sale.querySelector('input').disabled=false;confirm.querySelector('input').disabled=false;}};
 if(task&&quote)back.href=task.url('quotes.html',{quoteId:quote.id});
 back.onclick=event=>{if(busy||dirty&&!window.confirm('De calculator bevat nog niet opgeslagen wijzigingen. Toch naar de offerte?'))event.preventDefault();};window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});return true;
}
