// Manual receipt safeguards. Existing totals and provider import remain leading.
export function validReceiptDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function manualReceiptBasis(state,orderId){
 const order=state.orders.find(o=>o.id===orderId);if(!order)throw Error('Deze order bestaat niet meer.');
 return JSON.stringify([order.customerId,order.vat,order.packagePrice,order.shippingKnown,order.shippingCharge,order.productionDepositPercent,(order.items||[]).map(i=>[i.id,i.quantity,i.price]),state.payments.filter(p=>p.orderId===orderId).map(p=>[p.id,p.amount,p.date,p.reference,p.externalId]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])))]);
}
export function similarReceipts(state,orderId,{amount,date}){return state.payments.filter(p=>p.orderId===orderId&&p.amount===amount&&p.date===date);}
export function appendManualReceipt(state,orderId,expected,receipt,{acknowledged=false,requiresReview=false,today}={}){
 if(typeof receipt?.id!=='string'||!/^[-a-zA-Z0-9._]{1,160}$/.test(receipt.id))throw Error('De ontvangst heeft geen geldige registratie-ID.');
 const existing=state.payments.find(p=>p.id===receipt.id);
 if(existing){if(existing.orderId===orderId&&existing.amount===receipt.amount&&existing.date===receipt.date&&(existing.reference||'')===receipt.reference)return {alreadySaved:true};throw Error('Deze ontvangst is al met andere gegevens opgeslagen. Open de order opnieuw.');}
 if(manualReceiptBasis(state,orderId)!==expected)throw Object.assign(Error('De prijsafspraak of ontvangen betalingen zijn intussen gewijzigd. Haal het actuele saldo op en controleer je invoer.'),{code:'RECEIPT_BASIS_CHANGED'});
 if(!Number.isSafeInteger(receipt.amount)||receipt.amount<=0||!validReceiptDate(receipt.date)||today&&receipt.date>today||typeof receipt.reference!=='string'||receipt.reference.length>2000||typeof receipt.registeredAt!=='string'||!Number.isFinite(Date.parse(receipt.registeredAt)))throw Error('Controleer bedrag, ontvangstdatum en referentie.');
 if((requiresReview||similarReceipts(state,orderId,receipt).length)&&!acknowledged)throw Error('Bevestig eerst dat dit werkelijk een aparte ontvangen betaling is.');
 const paid=state.payments.filter(p=>p.orderId===orderId).reduce((sum,p)=>sum+p.amount,0);if(!Number.isSafeInteger(paid+receipt.amount))throw Error('Het totaal van de ontvangsten is te groot. Controleer de bedragen.');
 state.payments.push({...receipt,orderId});return {alreadySaved:false};
}
