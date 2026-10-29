import {paymentRequestDay} from './order-payment-link.js?v=feedback29-batch3-followup';
import {validReceiptDate} from './manual-receipt.js?v=feedback29-batch3-followup';
export function correctPayment(state,id,expected,{kind,reason,amount,date,reference,correctionId},{now=new Date().toISOString(),today=paymentRequestDay(Date.parse(now))}={}){
 const payment=state.payments.find(p=>p.id===id);if(!payment||JSON.stringify(payment)!==expected)throw Error('De betaling is gewijzigd of al gecorrigeerd. Open de controle opnieuw.');
 reason=String(reason||'').trim();if(reason.length<8||reason.length>1000)throw Error('Beschrijf de correctiereden in 8–1000 tekens.');
 if(!['remove','replace'].includes(kind))throw Error('Kies een correctie.');
 if(kind==='replace'&&(payment.source==='tikkie'||payment.externalId?.startsWith('tikkie:')))throw Error('Wijzig een Tikkie-providerbedrag niet handmatig. Gebruik zo nodig gecontroleerd uit het CRM-saldo halen.');
 if(kind==='replace'&&(!Number.isSafeInteger(amount)||amount<=0||!validReceiptDate(date)||date>today||typeof reference!=='string'||reference.length>2000))throw Error('Controleer bedrag, datum en referentie.');
 if(kind==='replace'&&payment.amount===amount&&payment.date===date&&(payment.reference||'')===reference)throw Error('Je hebt de ontvangst nog niet gewijzigd. Pas iets aan of annuleer.');
 state.paymentCorrections??=[];if(state.paymentCorrections.some(c=>c.id===correctionId))throw Error('Deze correctie bestaat al. Lees de betaalhistorie opnieuw.');
 const before=structuredClone(payment),after=kind==='replace'?{...payment,amount,date,reference}:null;
 const entry={id:correctionId,kind,reason,before,after,at:now};
 if(after)Object.assign(payment,after);else state.payments=state.payments.filter(p=>p.id!==id);
 state.paymentCorrections.push(entry);return entry;
}
export function restoreRemovedPayment(state,id,expected,{now=new Date().toISOString()}={}){
 const record=state.paymentCorrections?.find(c=>c.id===id);if(!record||JSON.stringify(record)!==expected||record.kind!=='remove'||record.restoredAt)throw Error('Deze correctie is gewijzigd of al hersteld. Open opnieuw.');
 const before=record.before;if(!state.orders.some(o=>o.id===before.orderId))throw Error('De oorspronkelijke order bestaat niet meer.');
 if(state.payments.some(p=>p.id===before.id||before.externalId&&p.externalId===before.externalId))throw Error('Deze ontvangst staat al in het CRM. Herstellen zou dubbeltellen.');
 state.payments.push(structuredClone(before));record.restoredAt=now;
}
