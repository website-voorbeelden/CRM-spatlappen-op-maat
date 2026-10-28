import {supplierInvoiceBasis} from '../../shared/supplier-invoices.js?v=feedback28-batch2-20261028';
import {supplierDocumentAiMarkup,installSupplierDocumentAi} from './document-ai.js?v=feedback28-batch2-20261028';
import {provenanceFor,markProvenance} from '../../shared/provenance.js?v=provenance-colors-20261027';
import {vatDate} from '../../shared/vat-ledger.js?v=feedback28-batch2-20261028';

export function createSupplierDocumentForm(context,{purchase,lineFields,updateTotal,persist}){
 function open(purchaseId,invoiceId){
  const p=purchase(purchaseId);if(!p)throw Error('Deze zending bestaat niet meer.');
  const saved=context.supplierInvoices(p).find(i=>i.id===invoiceId);
  if(invoiceId&&!saved)throw Error('Dit leveranciersdocument bestaat niet meer.');
  const invoice=saved?structuredClone(saved):{id:context.uid(),kind:'invoice',date:'',payments:[],lines:[],total:null};
  const expectedBasis=supplierInvoiceBasis(context.state,p.id),sum=(invoice.lines||[]).reduce((n,l)=>n+l.quantity*l.price,0),auto=invoice.total!=null&&invoice.lines?.length&&invoice.total===sum;
  context.openForm(invoiceId?'Leveranciersdocument bewerken':'Factuur / offerte toevoegen',`
   <p class="form-help">Inkoopregels zijn excl. btw voor de kostprijs. Het documenttotaal neem je apart over zoals op de bron. Btw en invoerbewijs leg je na bewaren vast via Btw vastleggen; die worden niet automatisch berekend of bij kosten opgeteld.</p>
   ${invoiceId?'':supplierDocumentAiMarkup(context,p)}
   <div class="fields">${context.field('reference','Factuur- / offertenummer',invoice.reference,'text','required maxlength="200"')}
    <label>Documentsoort<select name="kind"><option value="invoice" ${invoice.kind!=='offer'?'selected':''}>Factuur</option><option value="offer" ${invoice.kind==='offer'?'selected':''}>Offerte / pro forma</option></select></label>
    ${context.field('date','Documentdatum (leeg = onbekend)',invoice.date,'date')}
    ${context.field('total','Totaal zoals op leveranciersdocument (€)',invoice.total==null?'':invoice.total/100,'number','required min="0" step="0.01"')}
   </div>
   <label class="check-row"><input type="checkbox" name="autoInvoiceTotal" ${auto?'checked':''}>Documenttotaal gelijk aan som inkoopregels</label>
   <p class="form-help" id="ai-invoice-total"></p>
   <p class="form-help">Automatisch optellen voegt geen btw toe. Transport en niet aan producten gekoppelde kosten controleer je apart bij Kosten & zending.</p>
   <p class="form-help">Vervangt deze factuur een al ingevoerde offerte voor dezelfde producten? Bewerk dan dat bestaande document, zodat dezelfde stuks niet dubbel gekoppeld worden.</p><h3>Inkoopregels koppelen</h3><p class="form-help">1 paar = 2 fysieke stuks. Alleen leveranciersproducten uit deze zending zijn selecteerbaar. Bij volledige dekking wordt de kostprijs bijgewerkt. Een onbekende koppeling laat je leeg.</p>
   <div id="supplier-lines">${(invoice.lines||[]).map(l=>lineFields(p,l)).join('')}</div>
   ${context.button('add-supplier-line','Inkoopregel toevoegen',purchaseId)}
   ${context.area('notes','Afspraken / notities',invoice.notes)}
   <label>Origineel document / overige bijlagen<input type="file" name="attachments" multiple></label>
   <p class="form-help">Nieuwe bijlagen: maximaal 20 bestanden, 15 MB per bestand en 30 MB samen. Bestaande bestanden en betalingen blijven behouden.</p>`,async fd=>{
    if(context.company.tool==='costing')await context.validateCostingSources(form);
    const rows=[...form.querySelectorAll('#supplier-lines .supplier-line')];
    if(rows.length>100)throw Error('Gebruik maximaal 100 inkoopregels per document.');
    const lines=rows.map(el=>{
     const get=k=>el.querySelector(`[name=${k}]`).value,itemId=get('itemId'),o=context.state.orders.find(o=>o.purchaseId===p.id&&o.items.some(i=>i.id===itemId&&i.productionSource!=='local'));
     const previous=(invoice.lines||[]).find(l=>l.id===el.dataset.sourceLine);
     const line={...previous,id:previous?.id||context.uid(),description:get('description').trim(),quantity:Number(get('quantity')),unit:get('unit'),price:context.cents(get('price')),itemId,orderId:o?.id||''};
     const invalid=itemId&&!o?'itemId':!line.description||line.description.length>2000?'description':!Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>1000000?'quantity':!['piece','pair'].includes(line.unit)?'unit':get('price')===''||!Number.isSafeInteger(line.price)||line.price<0||!Number.isSafeInteger(line.quantity*line.price)?'price':null;
     if(invalid)throw context.formProblem('Controleer deze inkoopregel.',{field:el.querySelector('[name='+invalid+']')});
     if(context.company.tool==='costing'){const link=context.readCostingLink(el);if(link)line.costQuoteLink=link;else delete line.costQuoteLink;}
     context.formRecordProvenance(el,line);return line;
    });
    const sum=lines.reduce((n,l)=>n+l.quantity*l.price,0),total=lines.length&&fd.has('autoInvoiceTotal')?sum:fd.get('total')===''?null:context.cents(fd.get('total'));
    if(total==null||!Number.isSafeInteger(sum)||!Number.isSafeInteger(total)||total<sum)throw context.formProblem('Controleer het documenttotaal en de som van de regels.',{field:'total'});
    const value={...invoice,reference:fd.get('reference').trim(),kind:fd.get('kind'),date:fd.get('date'),total,lines,notes:fd.get('notes')};
    if(!value.reference||value.reference.length>200)throw context.formProblem('Vul een documentnummer in van maximaal 200 tekens.',{field:'reference'});
    if(!['offer','invoice'].includes(value.kind))throw context.formProblem('Kies factuur of offerte / pro forma.',{field:'kind'});
    if(value.date&&!vatDate(value.date))throw context.formProblem('Controleer de documentdatum.',{field:'date'});
    context.formRecordProvenance(form,value);
    await persist(p.id,value,fd.getAll('attachments'),{expectedBasis});
   });
  const form=context.$('#dialog form');
  // total is displayed in EUR, while the stored invoice uses cents. Bind the
  // display value; formRecordProvenance re-signs the final stored value.
  context.markFormSources(form,invoice);
  const source=provenanceFor(invoice,'total');if(source)context.markFormSources(form,markProvenance({total:invoice.total/100},['total'],source.source,{mode:source.mode,at:source.at}));
  for(const row of form.querySelectorAll('.supplier-line')){const line=invoice.lines.find(l=>l.id===row.dataset.sourceLine);if(line)context.markFormSources(row,line);}
  const installPickers=()=>context.installCostingPickers(form,{company:context.company,direction:'purchase',getOriginal:el=>(invoice.lines||[]).find(l=>l.id===el.dataset.sourceLine),onChange:updateTotal,canPush:()=>form.elements.kind.value==='offer'&&!(invoice.payments||[]).length});
  updateTotal();installPickers();
  installSupplierDocumentAi(context,form,p,{lineFields,updateTotal:()=>{updateTotal();installPickers();}});
 }
 return {open};
}
