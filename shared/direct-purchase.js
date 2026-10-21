const money=value=>value===null||Number.isSafeInteger(value)&&value>=0;
export function orderSupplierFiles(state,orderId){return state.documents.filter(file=>file.ownerId===orderId&&file.supplierDocument?.kind==='invoice');}
export function singleOrderPurchase(state,order){const purchase=(state.purchases||[]).find(purchase=>purchase.id===order.purchaseId);return purchase&&state.orders.filter(other=>other.purchaseId===purchase.id).length===1?purchase:null;}
export function applyDirectPurchase(order,input,expected,companyId,{purchase=null}={}){
 if(companyId!=='maatwerkkunststof'||!order||order.purchaseId&&purchase?.id!==order.purchaseId)throw Error('Gebruik voor deze order de gekoppelde inkoopbestelling.');
 if(JSON.stringify(order)!==expected)throw Error('Deze order is intussen gewijzigd. Bewaar je invoer en open Inkoop opnieuw.');
 for(const key of ['supplier','supplierOrderReference'])if(typeof input[key]!=='string'||input[key].length>200||/[\0\r\n]/.test(input[key]))throw Error('Controleer de leverancier en bestelreferentie.');
 if(!money(input.shippingActual)||!money(input.extraCosts)||!Array.isArray(input.costs)||input.costs.length!==order.items.length||new Set(input.costs.map(row=>row.itemId)).size!==order.items.length)throw Error('Controleer de orderkosten.');
 if(purchase&&(!money(input.supplierFreight)||!money(input.purchaseExtraCosts)))throw Error('Controleer de leverancierskosten.');
 const duties=input.duties;
 if(!duties||Object.keys(duties).some(key=>!['dutyMode','dutyAmount','dutyBase','dutyRate'].includes(key))||!['fixed','calculate'].includes(duties.dutyMode)||!money(duties.dutyAmount)||!money(duties.dutyBase)||duties.dutyRate!==null&&(!Number.isFinite(duties.dutyRate)||duties.dutyRate<0||duties.dutyRate>100))throw Error('Controleer de invoerrechten.');
 for(const row of input.costs){const item=order.items.find(item=>item.id===row.itemId);if(!item||!money(row.cost))throw Error('Controleer de inkoopprijs.');if((item.costSource==='supplierInvoice'||purchase?.invoices?.some(invoice=>invoice.lines?.some(line=>line.itemId===item.id)))&&row.cost!==item.cost)throw Error('Deze kostprijs komt uit een leveranciersfactuur. Pas de oorspronkelijke factuurregel aan.');}
 for(const row of input.costs){const item=order.items.find(item=>item.id===row.itemId);if(row.cost!==item.cost){item.cost=row.cost;delete item.costSource;delete item.calculatedCostTotal;delete item.purchaseCostTotal;delete item.purchaseCostQuantity;delete item.provenance?.cost;}}
 Object.assign(order,{supplierOrderReference:input.supplierOrderReference.trim(),shippingActual:input.shippingActual,extraCosts:input.extraCosts});
 if(purchase)Object.assign(purchase,{supplier:input.supplier.trim(),freight:input.supplierFreight,extraCosts:input.purchaseExtraCosts},input.duties);
 else Object.assign(order,{supplier:input.supplier.trim()},input.duties);
}
export function supplierFileMetadata({supplier='',reference='',date=''}={}){
 if([supplier,reference].some(value=>typeof value!=='string'||value.length>200||/[\0\r\n]/.test(value))||typeof date!=='string'||date!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date))throw Error('Controleer de factuurgegevens.');
 return {kind:'invoice',supplier:supplier.trim(),reference:reference.trim(),date};
}
