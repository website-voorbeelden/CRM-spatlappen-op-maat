export function invoicePaymentSelection(state,orderId,ids){
 if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.length>100)throw Error('Kies geldige, unieke ontvangsten.');
 return ids.map(id=>{const p=state.payments.find(p=>p.id===id&&p.orderId===orderId);if(!p||!Number.isSafeInteger(p.amount)||p.amount<=0)throw Error('Een gekozen ontvangst is gewijzigd of hoort bij een andere order.');return {id:p.id,date:p.date,amount:p.amount,reference:p.reference||''};});
}
export function invoicePaymentNote(receipts,{euro,date}){return receipts.length?'Vermelde ontvangsten:\n'+receipts.map(p=>`${date(p.date)} · ${euro(p.amount)}${p.reference?' · '+p.reference:''}`).join('\n'):'';}
