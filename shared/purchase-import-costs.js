// Purchase amounts are EUR cents. These fields never create tax-ledger entries.
export const purchaseImportKeys=['importVat','importVatRecoverable','importVatIncludedInSupplierPayments','importVatEvidence','freightIncludedInProductCosts'];
export function validatePurchaseImportCosts(p,state,{partial=false}={}){
 if(p.importVat!=null&&(!Number.isSafeInteger(p.importVat)||p.importVat<0))throw Error('Invoer-btw moet een positief bedrag of nul in gehele eurocenten zijn.');
 for(const key of ['importVatRecoverable','importVatIncludedInSupplierPayments','freightIncludedInProductCosts'])if(p[key]!=null&&typeof p[key]!=='boolean')throw Error('Controleer '+key+': kies ja, nee of onbekend.');
 if(p.importVatEvidence!=null&&(typeof p.importVatEvidence!=='string'||p.importVatEvidence.length>2000))throw Error('Gebruik maximaal 2000 tekens voor het invoer-/btw-bewijs.');
 if(p.freightIncludedInProductCosts===true&&(!partial||p.freight!=null)){
  if(p.freight==null||!Number.isSafeInteger(p.freight)||p.freight<0)throw Error('Vul het transportbedrag in dat al in de productkosten zit.');
  if(state&&supplierGoods(state,p).reduce((n,r)=>n+r.amount,0)<p.freight)throw Error('Het inbegrepen transport is hoger dan de gekoppelde productkosten. Vul eerst de productkosten aan of kies transport apart.');
 }
}
export const importVatCost=p=>p.importVatRecoverable===false?(p.importVat??0):0;
export const includedFreight=p=>p.freightIncludedInProductCosts===true?(p.freight??0):0;
const itemTotal=i=>i.costSource==='calculator'&&i.calculatedCostTotal!=null?i.calculatedCostTotal:i.costSource==='supplierInvoice'&&i.purchaseCostTotal!=null?i.purchaseCostTotal:(i.cost??0)*i.quantity;
function supplierGoods(state,p){return state.orders.filter(o=>o.purchaseId===p.id).map(o=>({id:o.id,amount:o.items.filter(i=>i.productionSource!=='local').reduce((n,i)=>n+itemTotal(i),0)}));}
// Remove embedded transport in proportion to its existing product-cost basis,
// then the ordinary freight allocation redistributes that same amount once.
export function embeddedFreightShare(state,p,orderId){
 const amount=includedFreight(p);if(!amount)return 0;
 const rows=supplierGoods(state,p),total=rows.reduce((n,r)=>n+r.amount,0);if(!total)return 0;
 const bounded=Math.min(amount,total);
 for(const row of rows){const raw=bounded*row.amount/total;row.share=Math.floor(raw);row.remainder=raw-row.share;}
 const left=bounded-rows.reduce((n,r)=>n+r.share,0);
 [...rows].sort((a,b)=>b.remainder-a.remainder||a.id.localeCompare(b.id)).slice(0,left).forEach(r=>r.share++);
 return rows.find(r=>r.id===orderId)?.share??0;
}

// One paid VAT amount can already be included in supplier receipts. Unknown
// overlap is left unresolved; a recorded zero is a deliberate amount.
export function purchasePaidOutflow(p,supplierPaid){
 const valid=Number.isSafeInteger(supplierPaid)&&supplierPaid>=0;
 const vat=p.importVat,known=valid&&Number.isSafeInteger(vat)&&vat>=0&&(vat===0||typeof p.importVatIncludedInSupplierPayments==='boolean');
 if(!known)return {known:false,amount:null,reason:vat==null?'Betaalde invoer-btw nog niet vastgelegd':'Controleer of invoer-btw al in leveranciersbetalingen zit'};
 if(p.importVatIncludedInSupplierPayments&&vat>supplierPaid)return {known:false,amount:null,reason:'Inbegrepen invoer-btw is hoger dan de geregistreerde leveranciersbetalingen'};
 const amount=supplierPaid+(p.importVatIncludedInSupplierPayments?0:vat);
 return Number.isSafeInteger(amount)?{known:true,amount,reason:''}:{known:false,amount:null,reason:'Controleer de geregistreerde uitgavenbedragen'};
}
