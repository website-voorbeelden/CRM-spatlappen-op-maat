// A proposal for the next receipt, never a recorded payment or a payment link.
export function paymentDepositSuggestion(order,total,{paid=0}={}){
 const explicit=order.productionDepositPercent??(order.leadTimeBasis==='deposit'?order.leadTimeDepositPercent:null);
 const validPercentage=explicit==null||Number.isInteger(explicit)&&explicit>=1&&explicit<=100;
 const percentage=explicit==null?50:validPercentage?explicit:null;
 const known=validPercentage&&Number.isSafeInteger(total)&&total>0&&Number.isSafeInteger(paid)&&paid>=0;
 const amount=known?Math.round(total*percentage/100):null;
 return {percentage,amount,remaining:known?Math.max(0,amount-paid):null,known,basis:explicit==null?'Standaardaanbetaling':validPercentage?'Afgesproken aanbetaling':'Aanbetalingsafspraak controleren'};
}
