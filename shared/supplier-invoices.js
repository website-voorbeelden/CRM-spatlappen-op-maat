export function supplierInvoices(p){
 if(Array.isArray(p.invoices))return p.invoices;
 if(p.supplierInvoiceTotal==null&&p.paidAmount==null)return [];
 return [{id:'legacy-'+p.id,reference:p.supplierInvoiceReference||'Eerder ingevoerd totaal',kind:'invoice',date:'',total:p.supplierInvoiceTotal??null,lines:[],notes:'Overgenomen uit de eerdere leveranciersbetaling. Controleer of dit één document is of meerdere.',payments:p.paidAmount>0?[{id:'legacy-payment-'+p.id,amount:p.paidAmount,date:p.paidDate||'',reference:'Eerder ingevoerde betaling'}]:[]}];
}

// The open document must still refer to the same batch and supplier products.
// Unrelated mail, activities and customer payments need not stale its form.
export function supplierInvoiceBasis(state,purchaseId,{includeUnlinked=false}={}){
 return JSON.stringify([state.purchases?.find(p=>p.id===purchaseId)||null,state.orders.filter(o=>o.purchaseId===purchaseId||includeUnlinked&&!o.purchaseId).map(o=>[o.id,o.purchaseId||'',o.items])]);
}
