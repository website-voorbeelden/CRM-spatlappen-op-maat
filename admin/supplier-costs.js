export function supplierInvoices(p){
 if(Array.isArray(p.invoices))return p.invoices;
 if(p.supplierInvoiceTotal==null&&p.paidAmount==null)return [];
 return [{id:'legacy-'+p.id,reference:p.supplierInvoiceReference||'Eerder ingevoerd totaal',kind:'invoice',date:'',total:p.supplierInvoiceTotal??null,lines:[],notes:'Overgenomen uit de eerdere leveranciersbetaling. Controleer of dit één document is of meerdere.',payments:p.paidAmount>0?[{id:'legacy-payment-'+p.id,amount:p.paidAmount,date:p.paidDate||'',reference:'Eerder ingevoerde betaling'}]:[]}];
}
export function invoiceFinance(invoice){
 const paid=(invoice.payments||[]).reduce((sum,p)=>sum+p.amount,0);
 return {paid,total:invoice.total,balance:invoice.total==null?null:invoice.total-paid};
}
export function supplierFinance(p){
 const invoices=supplierInvoices(p),unknown=invoices.filter(i=>i.total==null).length;
 return {invoices,unknown,known:invoices.length>0&&!unknown,total:invoices.reduce((s,i)=>s+(i.total??0),0),paid:invoices.reduce((s,i)=>s+invoiceFinance(i).paid,0),balance:invoices.reduce((s,i)=>s+Math.max(0,invoiceFinance(i).balance??0),0),advance:invoices.reduce((s,i)=>s+Math.max(0,-(invoiceFinance(i).balance??0)),0)};
}
export const physicalQuantity=line=>line.quantity*(line.unit==='pair'?2:1);
export const itemCostTotal=item=>item.costSource==='calculator'&&item.calculatedCostTotal!=null?item.calculatedCostTotal:item.costSource==='supplierInvoice'&&item.purchaseCostTotal!=null?item.purchaseCostTotal:(item.cost??0)*item.quantity;
export function syncSupplierInvoiceCosts(state,p){
 const allocated=new Map();
 for(const invoice of supplierInvoices(p))for(const line of invoice.lines||[]){
  if(!line.itemId)continue;
  const o=state.orders.find(o=>o.id===line.orderId),item=o?.items.find(i=>i.id===line.itemId);
  if(!item||o.purchaseId!==p.id||item.productionSource==='local')throw Error('Een factuurregel is niet meer gekoppeld aan een leveranciersproduct in deze zending.');
  const row=allocated.get(item.id)||{quantity:0,cost:0};row.quantity+=physicalQuantity(line);row.cost+=line.quantity*line.price;allocated.set(item.id,row);
 }
 for(const o of state.orders.filter(o=>o.purchaseId===p.id))for(const item of o.items){
  const row=allocated.get(item.id);
  if(row&&row.quantity>item.quantity)throw Error('Meer stuks gefactureerd dan besteld: '+item.description);
 }
 for(const o of state.orders.filter(o=>o.purchaseId===p.id))for(const item of o.items){
  const row=allocated.get(item.id);
  if(row&&(row.quantity===item.quantity||item.costSource==='supplierInvoice'||item.cost==null)){
   item.cost=row.quantity===item.quantity?Math.round(row.cost/row.quantity):null;
   item.costSource='supplierInvoice';item.purchaseCostTotal=row.cost;item.purchaseCostQuantity=row.quantity;
  }else if(!row&&item.costSource==='supplierInvoice'){item.cost=null;delete item.costSource;delete item.purchaseCostTotal;delete item.purchaseCostQuantity;}
 }
}
