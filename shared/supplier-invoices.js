export function supplierInvoices(p){
 if(Array.isArray(p.invoices))return p.invoices;
 if(p.supplierInvoiceTotal==null&&p.paidAmount==null)return [];
 return [{id:'legacy-'+p.id,reference:p.supplierInvoiceReference||'Eerder ingevoerd totaal',kind:'invoice',date:'',total:p.supplierInvoiceTotal??null,lines:[],notes:'Overgenomen uit de eerdere leveranciersbetaling. Controleer of dit één document is of meerdere.',payments:p.paidAmount>0?[{id:'legacy-payment-'+p.id,amount:p.paidAmount,date:p.paidDate||'',reference:'Eerder ingevoerde betaling'}]:[]}];
}
