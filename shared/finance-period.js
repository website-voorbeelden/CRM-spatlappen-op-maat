import {expenseCost,expenseIssues} from './business-expenses.js?v=finance-period-20261031';
import {supplierInvoices} from './supplier-invoices.js';
import {financeDay} from './owner-transfers.js?v=finance-period-review-20261031';
import {vatSources,vatEntryIssues} from './vat-ledger.js?v=packs-worker-v3-20261102';
const cents=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e12;
const sum=(rows,key)=>{let value=0;for(const r of rows){const n=typeof key==='function'?key(r):r[key];if(n==null)continue;value+=n;if(!Number.isSafeInteger(value))return null;}return value;};
const norm=v=>String(v||'').trim().toLowerCase();
export function buildFinancePeriod(state,{from='',to='',today}={}){
 if(!financeDay(today)||from&&!financeDay(from)||to&&!financeDay(to)||from&&to&&from>to)throw Error('Kies een geldige periode; de einddatum mag niet vóór de begindatum liggen.');
 const included=date=>financeDay(date)&&date<=today&&(!from||date>=from)&&(!to||date<=to),issues=[],costs=[],allCash=[],excludedCash=[],liabilities=[],legacy=[],paidVat=[],cashKeys=new Set();
 const customers=new Map(state.customers.map(c=>[c.id,c])),orders=new Map(state.orders.map(o=>[o.id,o])),purchases=state.purchases||[],expenses=state.businessExpenses||[],imports=state.supplierInvoiceImports||[];
 const issue=(message,href='')=>issues.push({message,href});
 const cost=row=>costs.push({net:null,vat:null,deductible:null,gross:null,cost:null,documentIds:[],notes:[],evidenceNote:'',...row});
 function cash(row){
  if(cashKeys.has(row.key)){issue('Dubbele bron-ID in betaalregistraties; één keer opgenomen.',row.href);return;}cashKeys.add(row.key);
  if(!cents(row.amount)||row.amount===0){if(row.amount!==0)issue('Een betaalbedrag is ongeldig; niet opgeteld.',row.href);return;}
  allCash.push({...row,validDate:financeDay(row.date)&&row.date<=today});
 }
 function debt(row){liabilities.push({...row,balance:cents(row.gross)&&cents(row.paid)?Math.max(0,row.gross-row.paid):null,advance:cents(row.gross)&&cents(row.paid)?Math.max(0,row.paid-row.gross):null});}
 const sources=vatSources(state),canonical=new Map();for(const source of sources)canonical.set(source.key,source.key);for(const source of sources)for(const alias of source.aliases||[])canonical.set(alias,source.key);
 function reviewedSource(key){const rows=(state.vatLedger?.entries||[]).filter(e=>e.status==='reviewed'&&!e.credit&&!e.duplicateOf&&(canonical.get(e.sourceKey)||e.sourceKey)===key&&!vatEntryIssues(e,state,sources).length);return rows.length===1?rows[0]:null;}
 const billedItems=new Set([...imports.flatMap(r=>r.data.lines.map(l=>l.itemId)),...purchases.flatMap(p=>supplierInvoices(p).filter(i=>i.kind==='invoice').flatMap(i=>(i.lines||[]).map(l=>l.itemId)))]);
 const expenseTargets=new Set(expenses.filter(e=>e.target.kind!=='general').map(e=>[e.target.kind,e.target.ownerId,e.target.slot,e.target.costId||''].join('/')));
 for(const e of expenses){
  const href='#expenses/'+e.id,notes=expenseIssues(e);
  cost({key:'expense:'+e.id,kind:'expense',label:e.label,counterparty:e.counterparty,reference:e.reference,date:e.date,net:e.netCents,vat:e.vatCents,deductible:e.deductibleVatCents,gross:e.grossCents,cost:expenseCost(e),href,documentIds:e.documentIds,notes,evidenceNote:e.evidenceNote,general:e.target.kind==='general'});
  for(const p of e.payments)cash({key:'expense-payment:'+e.id+':'+p.id,kind:'expense',label:e.label,counterparty:e.counterparty,reference:p.reference,date:p.date,amount:p.amount,direction:'out',href});
  debt({kind:'expense',label:e.label,href,gross:e.grossCents,paid:sum(e.payments,'amount')});
  if(e.paidVatCents!=null&&e.paidVatCents>0)paidVat.push({key:'expense:'+e.id,label:e.label,amount:e.paidVatCents,date:e.paidVatDate,href});
  else if(e.vatCents!==0&&e.payments.some(p=>p.amount>0))issue('Betaalde btw nog niet afzonderlijk vastgesteld: '+e.label,href);
 }
 for(const r of imports){
  const d=r.data,href='#orders/'+d.orderIds[0]+'/costs',known=d.vatCents===0||d.deductibleVatCents!==null;
  cost({key:'supplier-import:'+r.id,kind:'supplier-import',label:'Kunststofbaas · '+d.reference,counterparty:'Kunststofbaas',reference:d.reference,date:d.date,net:d.netCents,vat:d.vatCents,deductible:d.deductibleVatCents,gross:d.grossCents,cost:known?d.netCents+d.vatCents-(d.deductibleVatCents??0):null,href,documentIds:[r.documentId],evidenceNote:d.notes,notes:known?[]:['aftrekkeuze ontbreekt']});
  for(const p of r.payments)cash({key:'supplier-import-payment:'+r.id+':'+p.id,kind:'supplier',label:'Kunststofbaas · '+d.reference,counterparty:'Kunststofbaas',reference:p.reference,date:p.date,amount:p.amount,direction:'out',href});
  debt({kind:'supplier',label:'Kunststofbaas · '+d.reference,href,gross:d.grossCents,paid:sum(r.payments,'amount')});
 }
 const purchasePaid=new Map();
 for(const p of purchases){
  const href='#purchases/'+p.id+'/invoices',invoices=supplierInvoices(p);let paid=0;
  for(const inv of invoices){
   const payments=inv.payments||[];paid+=sum(payments,'amount')??0;
   for(const payment of payments)cash({key:'supplier-payment:'+p.id+':'+inv.id+':'+payment.id,kind:'supplier',label:(p.supplier||p.name)+' · '+inv.reference,counterparty:p.supplier||p.name,reference:payment.reference,date:payment.date,amount:payment.amount,direction:'out',href});
   if(inv.kind==='offer')continue;
   const lines=inv.lines||[],net=lines.length&&lines.every(l=>Number.isSafeInteger(l.quantity*l.price)&&l.quantity*l.price>=0)?sum(lines,l=>l.quantity*l.price):null;
   const files=state.documents.filter(d=>d.ownerId===p.id&&d.invoiceId===inv.id);
   const book=reviewedSource('supplier:'+p.id+':'+inv.id),bookNet=book?sum(book.lines,'baseCents'):null,bookVat=book?sum(book.lines,'vatCents'):null,bookDeduct=book?sum(book.lines,'deductCents'):null,foreign=inv.currency&&inv.currency!=='EUR',usable=!foreign&&book?.kind==='purchase'&&book.lines.every(l=>['5b','outside'].includes(l.box))&&cents(bookNet)&&cents(bookVat)&&cents(bookDeduct)&&bookNet+bookVat===inv.total&&(net==null||bookNet>=net);
   if(foreign)issue('Andere documentvaluta niet als EUR-kosten opgeteld: '+inv.reference,href);
   if(usable&&net!=null&&bookNet>net)issue('Gecontroleerde factuurnetto is hoger dan de gekoppelde inkoopregels; controleer bijkomende kostentoerekening: '+inv.reference,href);
   cost({key:'supplier:'+p.id+':'+inv.id,kind:'supplier',label:(p.supplier||p.name)+' · '+inv.reference,counterparty:p.supplier||p.name,reference:inv.reference,date:inv.date||book?.invoiceDate||'',net:foreign?null:usable?bookNet:cents(net)?net:null,vat:usable?bookVat:null,deductible:usable?bookDeduct:null,gross:!foreign&&cents(inv.total)?inv.total:null,cost:usable?bookNet+bookVat-bookDeduct:null,href,documentIds:[...new Set([...files.map(d=>d.id),...(book?.documentIds||[])])],evidenceNote:book?.evidenceNote||'',notes:[...(usable?[]:[foreign?'valuta afstemmen':'netto/btw/aftrek volgens het originele document nog afstemmen']),...(!files.length&&!book?.evidenceNote?.trim()&&!book?.documentIds?.length?['origineel bewijs ontbreekt']:[])]});
   debt({kind:'supplier',label:(p.supplier||p.name)+' · '+inv.reference,href,gross:foreign?null:inv.total,paid:sum(payments,'amount')});
  }
  purchasePaid.set(p.id,paid);
  if(p.importVat>0){
   const known=typeof p.importVatRecoverable==='boolean';
   cost({key:'import-vat:'+p.id,kind:'import-vat',label:'Invoer-btw · '+p.name,counterparty:'Douane / invoer',reference:p.importVatEvidence||'',date:p.importVatDate||'',net:0,vat:p.importVat,deductible:known?(p.importVatRecoverable?p.importVat:0):null,gross:p.importVat,cost:known?(p.importVatRecoverable?0:p.importVat):null,href:'#purchases/'+p.id+'/costs',notes:[...(known?[]:['aftrekbaarheid onbekend']),...(!p.importVatEvidence?.trim()?['invoer-/betaalbewijs ontbreekt']:[])]});
   paidVat.push({key:'import-vat:'+p.id,label:'Invoer-btw · '+p.name,amount:p.importVat,date:p.importVatPaidDate||'',href:'#purchases/'+p.id+'/costs'});
   if(p.importVatIncludedInSupplierPayments===false)cash({key:'import-vat-payment:'+p.id,kind:'import-vat',label:'Apart betaalde invoer-btw · '+p.name,counterparty:'Douane / invoer',reference:p.importVatEvidence||'',date:p.importVatPaidDate||'',amount:p.importVat,direction:'out',href:'#purchases/'+p.id+'/costs'});
   else if(p.importVatIncludedInSupplierPayments===true){if(paid<p.importVat)issue('Inbegrepen invoer-btw is hoger dan de geregistreerde leveranciersbetalingen: '+p.name,'#purchases/'+p.id+'/costs');}
   else issue('Nog bepalen of invoer-btw al in leveranciersbetalingen zit; niet extra bij kasuitgaven opgeteld: '+p.name,'#purchases/'+p.id+'/costs');
  }
 }
 for(const p of state.payments){const o=orders.get(p.orderId);if(!o){issue('Een klantbetaling heeft geen bestaande order; niet opgeteld.');continue;}cash({key:'customer-payment:'+p.id,kind:'customer',label:'Order #'+(o.sourceNumber||o.number),counterparty:customers.get(o.customerId)?.company||'Klant',reference:p.reference,date:p.date,amount:p.amount,direction:'in',href:'#orders/'+o.id+'/payments'});}
 for(const o of state.orders)if(o.supplierPaidAmount>0){
  const structured=(purchasePaid.get(o.purchaseId)||0)>0||imports.some(r=>r.data.orderIds.includes(o.id)&&r.payments.some(p=>p.amount>0));
  if(structured){excludedCash.push({key:'legacy-supplier-payment:'+o.id,label:'Eerder leverancierbetaaltotaal · #'+(o.sourceNumber||o.number),amount:o.supplierPaidAmount,date:o.supplierPaidDate||'',href:'#orders/'+o.id+'/costs'});issue('Oud orderbetaaltotaal kan overlappen met leveranciersbetalingen en is niet nogmaals opgeteld: #'+(o.sourceNumber||o.number),'#orders/'+o.id+'/costs');continue;}
  cash({key:'legacy-supplier-payment:'+o.id,kind:'supplier',label:'Eerder leverancierbetaaltotaal · #'+(o.sourceNumber||o.number),counterparty:o.supplier||'Leverancier',reference:'',date:o.supplierPaidDate||'',amount:o.supplierPaidAmount,direction:'out',href:'#orders/'+o.id+'/costs'});
 }
 for(const r of state.ownerTransfers||[])if(r.status==='active')cash({key:'owner-transfer:'+r.id,kind:r.direction==='to_private'?'private-out':'private-in',label:r.classification==='private'?'Privéopname / inleg':'Overboeking eigen rekening · nog beoordelen',counterparty:r.person,reference:r.reference,date:r.date,amount:r.amount,direction:r.direction==='to_private'?'out':'in',href:'#analytics/money/'+r.id});
 // VAT payment metadata never creates a second cash payment. The source-owned
 // expense/import amount takes precedence over a tax-ledger copy of that fact.
  const documentKeys=new Map();for(const p of purchases)for(const invoice of supplierInvoices(p))for(const doc of state.documents.filter(d=>d.ownerId===p.id&&d.invoiceId===invoice.id))documentKeys.set(doc.id,'supplier:'+p.id+':'+invoice.id);for(const r of imports)for(const id of [r.documentId,...r.history.map(h=>h.before.documentId)])documentKeys.set(id,'supplier-import:'+r.id);for(const e of expenses)for(const id of [ ...e.documentIds,...(e.history||[]).flatMap(h=>h.before.documentIds)])documentKeys.set(id,'expense:'+e.id);
 const groups=new Map();
 for(const e of state.vatLedger?.entries||[])if(e.status!=='void'&&!e.credit&&!e.duplicateOf&&e.paidVat?.amountCents>0){
  const s=sources.find(s=>s.key===e.sourceKey);const manual=e.sourceKey.startsWith('manual:');if(s?.hardIssue)issue('Btw-broncontrole blijft open: '+(s.issue||e.documentNumber),'#analytics/vat/sources');if(!manual&&(!s||s.signature!==e.sourceSignature)){issue('Betaalde btw met gewijzigde/ontbrekende bron niet opgeteld: '+e.documentNumber,'#analytics/vat/sources');continue;}
  if(!['purchase','import'].includes(e.kind)||e.paidVat.amountCents>e.lines.reduce((n,l)=>n+l.vatCents,0)){issue('Betaalde-btw-registratie onvolledig of niet passend bij de bron: '+e.documentNumber,'#analytics/vat/sources');continue;}if(!e.paidVat.reference?.trim())issue('Btw-betaalbewijsreferentie ontbreekt: '+e.documentNumber,'#analytics/vat/sources');if(s?.kind==='invoice'||s?.kind==='receipt'){issue('Een klantdocument/ontvangst is geen bron voor betaalde inkoop-btw: '+e.documentNumber,'#analytics/vat/sources');continue;}const proofKeys=[...new Set(e.documentIds.map(id=>documentKeys.get(id)).filter(Boolean))];if(proofKeys.length>1){issue('Btw-betaalbewijs is aan verschillende kostenbronnen gekoppeld; eerst afstemmen.','#analytics/vat/sources');continue;}const proofKey=proofKeys[0],expense=expenses.find(x=>proofKey==='expense:'+x.id);if(s?.expenseId||expense?.paidVatCents!=null)continue;if(e.kind==='import'&&e.purchaseId&&purchases.some(p=>p.id===e.purchaseId&&p.importVat!=null)){const purchase=purchases.find(p=>p.id===e.purchaseId);if(e.paidVat.amountCents>purchase.importVat)issue('Btw-register en invoer-btw-bedrag van de zending sluiten niet aan: '+purchase.name,'#purchases/'+purchase.id+'/costs');continue;}
  const key=proofKey||canonical.get(s?.key||e.sourceKey)||s?.key||e.sourceKey,list=groups.get(key)||[];list.push({e,s});groups.set(key,list);
 }
 for(const [key,list] of groups){if(list.length!==1){issue('Meerdere btw-betaalregistraties voor dezelfde bron; eerst afstemmen.','#analytics/vat/sources');continue;}const {e}=list[0];paidVat.push({key,label:e.documentNumber,amount:e.paidVat.amountCents,date:e.paidVat.date,href:'#analytics/vat/sources'});}
 for(const r of imports)if(r.data.vatCents>0&&r.payments.some(p=>p.amount>0)&&!paidVat.some(v=>v.key==='supplier-import:'+r.id))issue('Betaalde btw nog vaststellen in het register: Kunststofbaas '+r.data.reference,'#analytics/vat/sources');
 for(const p of purchases)for(const invoice of supplierInvoices(p))if(invoice.kind!=='offer'&&(invoice.payments||[]).some(v=>v.amount>0)){const key='supplier:'+p.id+':'+invoice.id,book=reviewedSource(key);if(!paidVat.some(v=>v.key===key)&&!(book&&sum(book.lines,'vatCents')===0))issue('Betaalde btw nog niet aan deze leveranciersbron afgestemd: '+invoice.reference,'#purchases/'+p.id+'/invoices');}
 // Legacy forecasts have no source date. They stay visible for completeness,
 // without being assigned the customer's order date as an expense date.
 for(const kind of ['order','purchase'])for(const owner of kind==='order'?state.orders:purchases){
  const href=kind==='order'?'#orders/'+owner.id+'/costs':'#purchases/'+owner.id+'/costs',title=kind==='order'?'Order #'+(owner.sourceNumber||owner.number):owner.name;
  for(const slot of kind==='order'?['shippingActual','extraCosts']:['freight','extraCosts','dutyAmount'])if(owner[slot]!==0&&!expenseTargets.has([kind,owner.id,slot,''].join('/'))&&(slot!=='dutyAmount'||owner.dutyMode!=='calculate'))legacy.push({label:title+' · '+({shippingActual:'eigen verzending',extraCosts:'overige vaste kosten',freight:'transport leverancier',dutyAmount:'invoerrechten'})[slot],amount:cents(owner[slot])?owner[slot]:null,href,reason:'Kostenveld zonder afzonderlijke brondatum; niet nogmaals bij documentkosten opgeteld.'});
  if(kind==='order')for(const item of owner.items){const hasBill=billedItems.has(item.id);if(!hasBill){const value=item.costSource==='calculator'?item.calculatedCostTotal:item.costSource==='supplierInvoice'?item.purchaseCostTotal:item.cost==null?null:item.cost*item.quantity;legacy.push({label:title+' · productkostprijs '+item.description,amount:cents(value)?value:null,href,reason:'Productkostprijs / raming zonder gedateerde factuurbron; geen tweede periode-uitgave.'});}}
  for(const row of owner.namedCosts||[])if(row.amount!==0&&!row.businessExpenseId&&!row.supplierInvoiceImportId)legacy.push({label:title+' · '+row.label,amount:row.amount,href,reason:'Benoemde kostprijs zonder gedateerde bronregistratie.'});
 }
 const duplicateCosts=new Map(),blockedCosts=new Set();for(const row of costs)if(row.kind!=='import-vat'&&row.reference?.trim()&&row.counterparty?.trim()){const vendor=/^kunststofbaas(?:\.nl)?(?:\s+b\.?v\.?)?$/i.test(row.counterparty.trim())?'kunststofbaas':norm(row.counterparty),key=JSON.stringify([vendor,norm(row.reference),financeDay(row.date)?row.date.slice(0,4):'onbekend']),list=duplicateCosts.get(key)||[];list.push(row);duplicateCosts.set(key,list);}
 for(const rows of duplicateCosts.values())if(rows.length>1){for(const row of rows)blockedCosts.add(row.key);issue('Mogelijk dezelfde factuur in meerdere kostenbronnen: '+rows[0].reference+'. Deze kostenbronnen staan apart en tellen niet dubbel mee voordat je ze afstemt.',rows[0].href);}
 const overlapCosts=costs.filter(r=>blockedCosts.has(r.key));
 const duplicateCash=new Map();for(const row of allCash)if(row.validDate&&row.reference?.trim()&&!row.key.startsWith('owner-transfer:')){const key=JSON.stringify([row.direction,norm(row.counterparty),row.date,row.amount,norm(row.reference)]),list=duplicateCash.get(key)||[];list.push(row);duplicateCash.set(key,list);}
 for(const rows of duplicateCash.values())if(rows.length>1)issue('Mogelijk dezelfde bankmutatie meermaals geregistreerd: '+rows[0].label+'. De bronrecords zijn niet automatisch verwijderd of samengevoegd.',rows[0].href);
 const periodCosts=costs.filter(r=>included(r.date)&&!blockedCosts.has(r.key)),periodCash=allCash.filter(r=>included(r.date)),periodVat=paidVat.filter(r=>included(r.date)),undatedCosts=costs.filter(r=>!financeDay(r.date)||r.date>today),undatedCash=allCash.filter(r=>!r.validDate),undatedVat=paidVat.filter(r=>!financeDay(r.date)||r.date>today);
 const customerIn=sum(periodCash.filter(r=>r.kind==='customer'),'amount'),businessOut=sum(periodCash.filter(r=>!r.kind.startsWith('private')&&r.direction==='out'),'amount'),privateOut=sum(periodCash.filter(r=>r.kind==='private-out'),'amount'),privateIn=sum(periodCash.filter(r=>r.kind==='private-in'),'amount');
 const checkedDifference=(...values)=>values.some(v=>v==null)||!Number.isSafeInteger(values.reduce((n,v)=>n+v,0))?null:values.reduce((n,v)=>n+v,0);
 const ownerRows=(state.ownerTransfers||[]).filter(r=>included(r.date)),people=new Map();for(const r of ownerRows)if(r.status==='active'){const key=norm(r.person),p=people.get(key)||{person:r.person,out:0,in:0};p[r.direction==='to_private'?'out':'in']+=r.amount;people.set(key,p);}
 const reviewedDeduct=sum((state.vatLedger?.entries||[]).filter(e=>e.status==='reviewed'&&included(e.taxDate)&&!vatEntryIssues(e,state,sources).length),e=>(e.credit?-1:1)*e.lines.reduce((n,l)=>n+l.deductCents,0));
 return {from,to,costs:periodCosts,cash:periodCash,allCash,excludedCash,overlapCosts,liabilities,legacy,issues,undatedCosts,undatedCash,undatedVat,paidVat:periodVat,ownerRows,people:[...people.values()],costTotals:{held:overlapCosts.filter(r=>included(r.date)).length,net:sum(periodCosts,'net'),vat:sum(periodCosts,'vat'),deductibleChoice:sum(periodCosts,'deductible'),cost:sum(periodCosts,'cost'),unknown:periodCosts.filter(r=>r.cost==null||r.notes.length).length+overlapCosts.filter(r=>included(r.date)).length,generalCost:sum(periodCosts.filter(r=>r.general),'cost'),generalUnknown:periodCosts.some(r=>r.general&&r.cost==null)||overlapCosts.some(r=>r.general)},cashTotals:{customerIn,businessOut,privateOut,privateIn,businessNet:checkedDifference(customerIn,businessOut==null?null:-businessOut),net:checkedDifference(customerIn,businessOut==null?null:-businessOut,privateIn,privateOut==null?null:-privateOut)},taxTotals:{paid:sum(periodVat,'amount'),paidIncomplete:undatedVat.length>0||issues.some(i=>/btw|aftrek/i.test(i.message)),reviewedDeduct},outstanding:sum(liabilities,'balance'),unknownOutstanding:liabilities.filter(r=>r.balance==null).length};
}
