import {protectExpenseCostFields} from '../expenses/linked-costs.js?v=business-expenses-20261031';
import {importCostFields,readImportCostFields} from './import-cost-fields.js?v=finance-period-review-20261031';
import {purchaseCostSummaryMarkup} from './cost-summary.js?v=finance-period-review-20261031';
import {supplierInvoiceBasis} from '../../shared/supplier-invoices.js?v=feedback28-batch2-20261028';
import {validatePurchaseImportCosts} from '../../shared/purchase-import-costs.js?v=finance-period-review-20261031';
import {purchaseCostOverview} from '../../shared/purchase-cost-overview.js?v=finance-period-review-20261031';
import {provenanceFor,markProvenance} from '../../shared/provenance.js?v=invoice-link-review-20261101';

// One cost editor for both companies. Metadata, membership and supplier payments
// remain with their existing editors; this form only commits these cost fields.
export function createPurchaseCostEditor(context,{purchaseInfo,dutyFields,readDuty,updateDutyPreview}){
 function read(fd,original){
  const values={...readImportCostFields(context,fd),...readDuty(fd),allocation:fd.get('allocation')};
  // Switching cost fields must not erase the inactive duty calculation basis.
  for(const key of ['dutyAmount','dutyBase','dutyRate'])if(!fd.has(key))values[key]=original[key]??null;
  for(const key of ['freight','extraCosts']){
   const raw=fd.get(key);values[key]=raw==null||raw===''?null:context.cents(raw);
   if(values[key]!=null&&(!Number.isSafeInteger(values[key])||values[key]<0))throw context.formProblem('Vul een geldig bedrag in, of laat onbekend leeg.',{field:key});
  }
  if(!['equal','area','quantity','cost'].includes(values.allocation))throw context.formProblem('Kies hoe de kosten worden verdeeld.',{field:'allocation'});
  return values;
 }
 function open(id){
  const p=context.state.purchases.find(row=>row.id===id);if(!p)throw Error('Deze inkoopbestelling bestaat niet meer.');
  const expected=supplierInvoiceBasis(context.state,id);
  let form;
  context.openForm('Inkoopkosten & invoer-btw aanpassen',`
   <p>Vul de kosten van deze hele zending in. Leeg betekent onbekend; vul 0 in als een post werkelijk niet van toepassing is.</p>
   <section class="form-section"><h3>Transport & overige kosten</h3><div class="fields">
    ${context.field('freight','Transport leverancier → ontvangst excl. btw (€)',p.freight==null?'':p.freight/100,'number','min="0" step="0.01"')}
    ${context.field('extraCosts','Inklaring / bank / overige gezamenlijke kosten (€)',p.extraCosts==null?'':p.extraCosts/100,'number','min="0" step="0.01"')}
   </div><p class="form-help">Overige kosten zijn zonder transport, invoerrechten of invoer-btw. Kosten die je al afzonderlijk bij Benoemde kosten hebt ingevuld, tel je hier niet opnieuw mee.</p></section>
   ${importCostFields(context,p)}
   <details class="form-details" ${p.dutyMode==='calculate'?'open':''}><summary>Invoerrechten · ${p.dutyMode==='calculate'?'berekende schatting':p.dutyAmount==null?'nog onbekend':context.esc(context.euro(p.dutyAmount))}</summary>${dutyFields(p)}</details>
   <details class="form-details"><summary>Kosten verdelen over de klantorders</summary><label>Verdeelsleutel<select name="allocation">${[['equal','Gelijk per klantorder'],['quantity','Naar aantal stuks'],['area','Naar oppervlakte'],['cost','Naar inkoopwaarde']].map(([value,label])=>`<option value="${value}" ${value===(p.allocation||'equal')?'selected':''}>${label}</option>`).join('')}</select></label></details>
   <p class="notice" role="status" data-purchase-cost-preview-error hidden></p><div data-purchase-cost-preview></div>`,async fd=>{
    const values=read(fd,p);
    await context.mergeStoredState(next=>{
     if(supplierInvoiceBasis(next,id)!==expected)throw Error('De inkoopbestelling, productkosten of koppelingen zijn intussen gewijzigd. Je invoer blijft staan. Open dit formulier opnieuw met de actuele gegevens.');
     const current=next.purchases.find(row=>row.id===id);
     const candidate={...current,...values,provenance:structuredClone(current.provenance||{})};validatePurchaseImportCosts(candidate,next);
     const amounts=purchaseCostOverview(candidate,purchaseInfo(candidate),context.supplierFinance(current),context.namedCostSummary(candidate));
     if(amounts.cost==null||amounts.budget==null)throw context.formProblem('Het samengestelde bedrag is te groot of niet in gehele eurocenten. Controleer de product- en zendingkosten.',{field:'freight'});
     context.formRecordProvenance(form,candidate);
     Object.assign(current,values,{provenance:candidate.provenance});
     next.activities.unshift({id:context.uid(),message:'Kosten en invoer-btw van inkoopbestelling bijgewerkt',time:new Date().toISOString()});
    });
   },{afterSave:()=>{context.render();context.toast('Inkoopkosten en invoer-btw opgeslagen');}});
  form=context.$('#dialog form');protectExpenseCostFields(form,context.state,'purchase',id);form.querySelector('[type=submit]').textContent='Kosten opslaan';
  for(const input of form.querySelectorAll('[name]')){
   const source=provenanceFor(p,input.name);if(!source||p[input.name]==null)continue;
   // Decimal fields already show Dutch commas here. Bind the displayed string;
   // formRecordProvenance signs the stored cents again only while it matches.
   const value=input.value;
   context.markFormSources(input.closest('label'),markProvenance({[input.name]:value},[input.name],source.source,{mode:source.mode,at:source.at}));
  }
  const preview=form.querySelector('[data-purchase-cost-preview]'),error=form.querySelector('[data-purchase-cost-preview-error]');
  function paint(){
   if(!form.isConnected||!context.$('#dialog').open)return;
   try{
    if(supplierInvoiceBasis(context.state,id)!==expected)throw Error('De bron is gewijzigd. Je invoer blijft staan; heropen het formulier voor een actuele vergelijking.');
    const candidate={...p,...read(new FormData(form),p)};validatePurchaseImportCosts(candidate,context.state);
    preview.innerHTML=purchaseCostSummaryMarkup(context,candidate,purchaseInfo(candidate),context.supplierFinance(p),{preview:true});error.hidden=true;preview.hidden=false;
   }catch(problem){error.textContent='Controleoverzicht nog niet beschikbaar: '+problem.message;error.hidden=false;preview.hidden=true;}
  }
  form.addEventListener('input',paint);form.addEventListener('change',()=>{updateDutyPreview();paint();});
  updateDutyPreview();paint();
 }
 return {open};
}
