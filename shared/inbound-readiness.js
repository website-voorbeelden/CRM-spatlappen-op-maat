import {funnelPayment} from './sales-funnel.js?v=ui-batch234-20261027';
// Only saved delivery agreements determine requirements; prices never imply a method.
export const fulfilmentMethods=[['','Nog afspreken'],['pickup','Afhalen'],['shipping','Verzenden'],['delivery','Bezorgen']];
export const validFulfilmentMethod=value=>fulfilmentMethods.some(([id])=>id===value);
export function setFulfilmentMethod(state,id,value,expected){
 if(!validFulfilmentMethod(value))throw Error('Kies een geldige leverwijze.');
 const order=state.orders.find(o=>o.id===id);if(!order)throw Error('Deze order bestaat niet meer.');
 if((order.fulfilmentMethod||'')!==expected)throw Error('De leverwijze is intussen gewijzigd. Open de keuze opnieuw.');
 order.fulfilmentMethod=value;
}
export function inboundReadiness(state,o,companyId){
 const purchase=(state.purchases||[]).find(p=>p.id===o.purchaseId);
 const active=companyId==='spatlappen'&&!o.archived&&!o.deliveredDate&&!o.shippedDate&&!['Afgerond','Verzonden'].includes(o.stage)&&(
 ['Onderweg naar Nederland','Binnen in Nederland'].includes(o.stage)||Boolean(o.transitDate||o.arrivedDate)||['Onderweg','Binnen in Nederland'].includes(purchase?.status));
 if(!active)return {active:false,gaps:[],next:null};
 const c=(state.customers||[]).find(c=>c.id===o.customerId),method=o.fulfilmentMethod||'',address=o.delivery?.source==='custom'?o.delivery:{address:c?.shippingAddress,recipient:c?.shippingRecipient||c?.contact||c?.company,country:c?.shippingCountry||c?.country};
 const gaps=[],add=(key,label,action,cta,reason)=>gaps.push({key,label,complete:false,action,cta,reason});
 if(!validFulfilmentMethod(method)||!method)add('delivery-method','Leverwijze','delivery-details','Leverafspraken aanvullen','Spreek af of de klant afhaalt, of de order wordt verzonden of bezorgd.');
 if(['shipping','delivery'].includes(method)){
  if(!address.address?.trim()||!address.country?.trim())add('delivery-address','Afleveradres en land','delivery-details','Afleveradres aanvullen','Vul het werkelijke afleveradres en land voor deze order in.');
  if(!address.recipient?.trim())add('delivery-recipient','Ontvanger / contactpersoon','delivery-details','Ontvanger aanvullen','Leg vast voor wie de levering bestemd is.');
 }
 if(!c?.email?.trim()&&!c?.phone?.trim())add('delivery-contact','Bereikbaar klantcontact','delivery-details','Contactgegevens aanvullen','Vul een e-mailadres of telefoonnummer in om de leverafspraak af te stemmen. Een apart factuurmailadres is niet verplicht.');
 if((o.items||[]).some(i=>i.cost==null))add('delivery-cost','Kostprijs producten','purchase','Kostprijs controleren','De inkoop- of productiekostprijs is nog niet voor alle producten bekend. Een expliciete kostprijs van €0 is geldig.');
 if(['shipping','delivery'].includes(method)&&o.shippingKnown!==true)add('delivery-price','Verzendprijs klant','order-edit','Verzendprijs aanvullen','Leg de afgesproken verzend- of bezorgprijs vast; vul alleen €0 in als dit werkelijk gratis is.');
 if(!(o.items||[]).length||o.packagePrice==null&&(o.items||[]).some(i=>i.price==null))add('delivery-product-price','Prijsafspraak producten','order-edit','Prijsafspraak aanvullen','De verkoopprijs is nog niet volledig afgesproken. Leg de bekende prijs vast voordat je het restant beoordeelt.');
 const payment=funnelPayment(state,o);
 if(payment.known&&payment.total>payment.paid)add('delivery-payment','Resterende betaling','payment','Betaling controleren','Er staat nog een bedrag open. Controleer de ontvangen betaling en de afgesproken levering.');
 return {active:true,gaps,next:gaps[0]||null};
}
