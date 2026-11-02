import {allocateCents} from './money-allocation.js?v=feedback-five-20261029';
// Purchase amounts are EUR cents. These fields never create tax-ledger entries.
export const purchaseImportKeys=['importVat','importVatRecoverable','importVatIncludedInSupplierPayments','importVatEvidence','importVatDate','importVatPaidDate','freightIncludedInProductCosts'];
const day=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const problem=(message,field)=>Object.assign(Error(message),{field});
export function validatePurchaseImportCosts(p,state,{partial=false}={}){
 for(const key of ['importVatDate','importVatPaidDate'])if(p[key]!=null&&p[key]!==''&&!day(p[key]))throw problem('Kies een geldige datum of laat onbekend leeg.',key);
 if(p.importVat!=null&&(!Number.isSafeInteger(p.importVat)||p.importVat<0))throw problem('Invoer-btw moet een positief bedrag of nul in gehele eurocenten zijn.','importVat');
 for(const key of ['importVatRecoverable','importVatIncludedInSupplierPayments','freightIncludedInProductCosts'])if(p[key]!=null&&typeof p[key]!=='boolean')throw problem('Controleer '+key+': kies ja, nee of onbekend.',key);
 if(p.importVatEvidence!=null&&(typeof p.importVatEvidence!=='string'||p.importVatEvidence.length>2000))throw problem('Gebruik maximaal 2000 tekens voor het invoer-/btw-bewijs.','importVatEvidence');
 if(p.freightIncludedInProductCosts===true&&(!partial||p.freight!=null)){
  if(p.freight==null||!Number.isSafeInteger(p.freight)||p.freight<0)throw problem('Vul het transportbedrag in dat al in de productkosten zit.','freight');
  if(state&&supplierGoods(state,p).reduce((n,r)=>n+r.amount,0)<p.freight)throw problem('Het inbegrepen transport is hoger dan de gekoppelde productkosten. Vul eerst de productkosten aan of kies transport apart.','freightIncludedInProductCosts');
 }
}
export const importVatCost=p=>p.importVatRecoverable===false?(p.importVat??0):0;
export const importVatCostKnown=p=>Number.isSafeInteger(p.importVat)&&p.importVat>=0&&(p.importVat===0||typeof p.importVatRecoverable==='boolean');
export const freightBasisKnown=p=>p.freight===0||Number.isSafeInteger(p.freight)&&p.freight>0&&typeof p.freightIncludedInProductCosts==='boolean';
export function purchaseImportIssues(p){
 const issues=[];
 if(p.importVat==null)issues.push('betaalde invoer-btw (of expliciet €0)');
 else if(p.importVat>0&&p.importVatRecoverable==null)issues.push('aftrekbaarheid invoer-btw');
 if(p.importVat>0&&p.importVatRecoverable===true&&!p.importVatEvidence?.trim())issues.push('invoer-/btw-betaalbewijs');
 if(p.freight>0&&!freightBasisKnown(p))issues.push('transport apart of al in productkosten');
 return issues;
}
export const includedFreight=p=>p.freightIncludedInProductCosts===true?(p.freight??0):0;
const itemTotal=i=>i.costSource==='calculator'&&i.calculatedCostTotal!=null?i.calculatedCostTotal:['supplierInvoice','supplierInvoiceImport'].includes(i.costSource)&&i.purchaseCostTotal!=null?i.purchaseCostTotal:(i.cost??0)*i.quantity;
function supplierGoods(state,p){return state.orders.filter(o=>o.purchaseId===p.id).map(o=>({id:o.id,amount:o.items.filter(i=>i.productionSource!=='local').reduce((n,i)=>n+itemTotal(i),0)}));}
// Remove embedded transport in proportion to its existing product-cost basis,
// then the ordinary freight allocation redistributes that same amount once.
export function embeddedFreightShare(state,p,orderId){
 const amount=includedFreight(p);if(!amount)return 0;
 const rows=supplierGoods(state,p),total=rows.reduce((n,r)=>n+r.amount,0);if(!total)return 0;
 const bounded=Math.min(amount,total);
 return allocateCents(bounded,rows.map(row=>({id:row.id,weight:row.amount}))).get(orderId)??0;
}

// One paid VAT amount can already be included in supplier receipts. Unknown
// overlap is left unresolved; a recorded zero is a deliberate amount.
export function purchasePaidOutflow(p,supplierPaid){
 const valid=Number.isSafeInteger(supplierPaid)&&supplierPaid>=0;
 if(!valid)return {known:false,amount:null,reason:'Leveranciersbetalingen nog niet vastgelegd'};
 const vat=p.importVat,known=valid&&Number.isSafeInteger(vat)&&vat>=0&&(vat===0||typeof p.importVatIncludedInSupplierPayments==='boolean');
 if(!known)return {known:false,amount:null,reason:vat==null?'Betaalde invoer-btw nog niet vastgelegd':'Controleer of invoer-btw al in leveranciersbetalingen zit'};
 if(p.importVatIncludedInSupplierPayments&&vat>supplierPaid)return {known:false,amount:null,reason:'Inbegrepen invoer-btw is hoger dan de geregistreerde leveranciersbetalingen'};
 const amount=supplierPaid+(p.importVatIncludedInSupplierPayments?0:vat);
 return Number.isSafeInteger(amount)?{known:true,amount,reason:''}:{known:false,amount:null,reason:'Controleer de geregistreerde uitgavenbedragen'};
}
