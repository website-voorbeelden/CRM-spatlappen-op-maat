import {invoicePaymentStatus,invoicePaymentPercent} from '../../shared/invoice-payment-status.js?v=invoice-payment-status-20261021';

export function invoiceStatusMarkup(doc,{esc,euro}){
 if(doc.generated?.kind!=='invoice')return '';
 const status=invoicePaymentStatus(doc.generated.payload);
 if(!status.known)return '<div class="document-invoice-status" data-payment-state="unknown"><strong>Betaalstand niet bewaard</strong><small>Bekijk de factuur; de huidige orderbetalingen zijn geen bewijs van de betaalstand op dit bestand.</small></div>';
 const percentage=invoicePaymentPercent(status);
 return `<div class="document-invoice-status" data-payment-state="${status.state}"><strong>${esc(status.label)}${percentage?' · '+esc(percentage)+' ontvangen':''}</strong><small>Betaalstand bij aanmaken · ${esc(euro(status.paidCents))} van ${esc(euro(status.totalCents))} incl. btw${status.openCents?' · '+esc(euro(status.openCents))+' open':''}${status.overpaidCents?' · '+esc(euro(status.overpaidCents))+' meer ontvangen':''}</small></div>`;
}
