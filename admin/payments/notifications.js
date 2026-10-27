import {isRecentTikkieReceipt} from '../../shared/payment-notifications.js?v=payment-alerts-20261027';
import {createWorkspaceNotifications} from '../workspace/notifications.js?v=payment-alerts-20261027';

// Session-only observation of committed snapshots, independent of phone opt-in.
// Initial history and explicit backup imports are remembered without alerts.
export function createPaymentNotifications({company,getState,euro,toast}){
 const seen=new Set();let notifications;
 function correctionIds(state){for(const correction of state.paymentCorrections||[])if(correction.before?.id)seen.add(correction.before.id);}
 function remember(state){correctionIds(state);for(const payment of state.payments||[])seen.add(payment.id);}
 function observe(state){
  correctionIds(state);
  const orders=new Map((state.orders||[]).map(order=>[order.id,order])),customers=new Map((state.customers||[]).map(customer=>[customer.id,customer]));
  const at=Date.now();
  for(const payment of state.payments||[]){
   if(seen.has(payment.id))continue;
   seen.add(payment.id);
   const order=orders.get(payment.orderId);
   if(!order||!isRecentTikkieReceipt(payment,at))continue;
   const customer=customers.get(order.customerId),number=order.sourceNumber||order.number;
   const stillCurrent=()=>{const current=getState();return current.orders?.some(o=>o.id===order.id)&&current.payments?.some(p=>p.id===payment.id&&p.orderId===order.id&&p.amount===payment.amount&&isRecentTikkieReceipt(p));};
   const item={
    title:'Tikkie-betaling ontvangen',
    label:[euro(payment.amount),customer?.company||customer?.contact||'Klant bij order onbekend',number?'order #'+number:'Order'].join(' · '),
    openLabel:'Bekijken',href:'#orders/'+encodeURIComponent(order.id)+'/payments',
    onOpen:()=>{if(stillCurrent())return false;toast('Deze ontvangst is inmiddels gewijzigd of verwijderd. Bekijk het actuele betalingenoverzicht.');return true;}
   };
   // Presentation after the snapshot has been accepted must not turn a
   // successful storage transaction into an apparent failed payment save.
   queueMicrotask(()=>{
    if(!stillCurrent())return;
    notifications??=createWorkspaceNotifications({companyId:company.id,toast});
    notifications.add('payment:'+payment.id,item);
   });
  }
 }
 remember(getState());
 return {observe,remember};
}
