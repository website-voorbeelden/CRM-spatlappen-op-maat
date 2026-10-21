// A generated invoice records the order's receipts at creation, not a separate
// allocation of receipts to that invoice. Never substitute today's order state.
const cents=value=>Number.isSafeInteger(value)&&value>=0&&value<=100_000_000;
function grossAmount(payload){
 if(!payload||!Array.isArray(payload.items)||!payload.items.length||payload.items.length>40||!Number.isFinite(payload.vat)||payload.vat<0||payload.vat>100)return null;
 let subtotal=0;
 for(const item of payload.items){
  if(!item||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>100000)return null;
  if(payload.packagePrice==null){if(!cents(item.price))return null;subtotal+=item.price*item.quantity;if(!Number.isSafeInteger(subtotal))return null;}
 }
 if(payload.packagePrice!=null&&!cents(payload.packagePrice))return null;
 if(!cents(payload.shippingCharge??0))return null;
 const net=(payload.packagePrice??subtotal)+(payload.shippingCharge??0);
 // Match the converter's positive Decimal(str(vat)), ROUND_HALF_UP, including
 // fractional rates. No binary floating-point rounding at a half-cent boundary.
 const [coefficient,exponent='0']=String(payload.vat).toLowerCase().split('e'),[whole,fraction='']=coefficient.split('.');
 const scale=fraction.length-Number(exponent),digits=BigInt(whole+fraction);
 const numerator=BigInt(net)*digits*(scale<0?10n**BigInt(-scale):1n),denominator=100n*(scale>0?10n**BigInt(scale):1n);
 const tax=(numerator+denominator/2n)/denominator,total=BigInt(net)+tax;
 return total<=BigInt(Number.MAX_SAFE_INTEGER)?Number(total):null;
}
export function invoicePaymentStatus(payload){
 const total=grossAmount(payload),paid=payload?.paidAmount;
 if(total===null||!cents(paid))return {known:false,label:'Betaalstand niet bewaard',state:'unknown'};
 const state=total===0?'zero':paid>=total?'paid':paid>0?'partial':'unpaid';
 // Floor to one decimal: an unpaid remainder must never display as 100%.
 const percent=total>0?Math.min(100,Math.floor(paid/total*1000)/10):null;
 return {known:true,state,label:{zero:'Geen bedrag te voldoen',paid:'Voldaan',partial:'Aanbetaling voldaan',unpaid:'Nog niet voldaan'}[state],
  paidCents:paid,totalCents:total,openCents:Math.max(0,total-paid),overpaidCents:Math.max(0,paid-total),percent};
}
export function invoicePaymentPercent(status){
 if(!status.known||status.percent===null)return '';
 if(status.paidCents>0&&status.percent===0)return '<0,1%';
 return new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(status.percent)+'%';
}
