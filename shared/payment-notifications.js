// Provenance must come from the importer, never a manually entered description.
export const isTikkieReceipt=payment=>payment?.source==='tikkie'&&typeof payment.externalId==='string'&&payment.externalId.startsWith('tikkie:')&&payment.externalId.length>7;
export function isRecentTikkieReceipt(payment,at=Date.now()){
 const registered=Date.parse(payment?.registeredAt||payment?.receivedAt||'');
 return isTikkieReceipt(payment)&&Number.isSafeInteger(payment.amount)&&payment.amount>0&&Number.isFinite(registered)&&registered>=at-7*86400000&&registered<=at+300000;
}
