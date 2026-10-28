// Provenance must come from the importer, never a manually entered description.
export const isTikkieReceipt=payment=>payment?.source==='tikkie'&&typeof payment.externalId==='string'&&payment.externalId.startsWith('tikkie:')&&payment.externalId.length>7;
export function paymentPushSummary(state,payment){
 if(!isTikkieReceipt(payment)||!Number.isSafeInteger(payment.amount)||payment.amount<=0)return null;
 const order=state.orders?.find(o=>o.id===payment.orderId);if(!order)return null;
 const customer=state.customers?.find(c=>c.id===order.customerId);
 const raw=typeof customer?.company==='string'?customer.company:'';
 const customerName=Array.from(raw.replace(/[\u0000-\u001f\u007f-\u009f\u2028-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim()).slice(0,80).join('')||'Klant onbekend';
 // Receipt amount, not order total. The label is the linked CRM customer,
 // never an inferred bank-account holder or provider description.
 return {amountCents:payment.amount,customerName};
}
export function isRecentTikkieReceipt(payment,at=Date.now()){
 const registered=Date.parse(payment?.registeredAt||payment?.receivedAt||'');
 return isTikkieReceipt(payment)&&Number.isSafeInteger(payment.amount)&&payment.amount>0&&Number.isFinite(registered)&&registered>=at-7*86400000&&registered<=at+300000;
}
