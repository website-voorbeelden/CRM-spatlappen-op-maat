// Customer-facing invoice revisions only. These values never update the order,
// receipts, stock or bookkeeping. The document service uses the same limits.
const problem=(message,field)=>Object.assign(Error(message),{field});
export function documentAmountInput(raw,field){
 const text=String(raw??'').trim();if(!/^\d+(?:[.,]\d{1,2})?$/.test(text))throw problem('Vul een bedrag in met maximaal twee decimalen, zonder duizendtallen.',field);
 const [whole,fraction='']=text.replace(',','.').split('.'),cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 if(!Number.isSafeInteger(cents)||cents<0||cents>100_000_000)throw problem('Vul een bedrag tussen € 0 en € 1.000.000 in.',field);return cents;
}
export function revisionAmountBasis(payload){return JSON.stringify([payload.items.map(i=>[i.quantity,payload.packagePrice!=null?null:i.price]),payload.packagePrice??null,payload.shippingCharge??0,payload.vat]);}
export function readInvoiceRevisionAmounts(payload,formData){
 const packageMode=formData.has('usePackagePrice');
 const items=payload.items.map((item,index)=>{
  const raw=String(formData.get('quantity_'+index)??'').trim(),quantity=Number(raw);
  if(!/^\d+$/.test(raw)||!Number.isSafeInteger(quantity)||quantity<1||quantity>100000)throw problem('Vul een heel aantal tussen 1 en 100.000 in.','quantity_'+index);
  return {...item,quantity,...(packageMode?{}:{price:documentAmountInput(formData.get('unitPrice_'+index),'unitPrice_'+index)})};
 });
 return {...payload,items,shippingCharge:documentAmountInput(formData.get('documentShippingCharge'),'documentShippingCharge'),packagePrice:packageMode?documentAmountInput(formData.get('documentPackagePrice'),'documentPackagePrice'):null};
}
export function invoiceDocumentTotals(payload){
 const validAmount=value=>Number.isSafeInteger(value)&&value>=0&&value<=100_000_000;
 if(!Array.isArray(payload.items)||!payload.items.length||payload.items.length>40||payload.items.some(i=>!Number.isSafeInteger(i.quantity)||i.quantity<1||i.quantity>100000||payload.packagePrice==null&&!validAmount(i.price)))throw Error('Controleer aantallen en stukprijzen op de factuur.');
 if(payload.packagePrice!=null&&!validAmount(payload.packagePrice)||!validAmount(payload.shippingCharge??0)||typeof payload.vat!=='number'||!Number.isFinite(payload.vat)||payload.vat<0||payload.vat>100)throw Error('Controleer producttotaal, verzending en btw op de factuur.');
 const products=payload.packagePrice??payload.items.reduce((sum,item)=>sum+item.quantity*item.price,0),net=products+(payload.shippingCharge??0);
 if(!Number.isSafeInteger(net))throw Error('Het factuurtotaal is te groot.');
 // Round positive tax half up in cents, including decimal rates and large sums.
 const [digits,exponent='0']=String(payload.vat).toLowerCase().split('e'),[whole,fraction='']=digits.split('.'),power=fraction.length-Number(exponent);
 const numerator=BigInt(whole+fraction)*(power<0?10n**BigInt(-power):1n),denominator=100n*(power>0?10n**BigInt(power):1n);
 const tax=Number((BigInt(net)*numerator+denominator/2n)/denominator),total=net+tax;
 if(!Number.isSafeInteger(total))throw Error('Het factuurtotaal is te groot.');
 const paid=payload.paidAmount===undefined?null:payload.paidAmount;
 if(payload.paidAmount!==undefined&&!validAmount(payload.paidAmount))throw Error('De bewaarde betaalstand is ongeldig.');
 return {products,shipping:payload.shippingCharge??0,net,tax,total,paid,balance:paid===null?null:total-paid};
}
