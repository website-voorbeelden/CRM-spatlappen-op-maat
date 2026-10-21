export const leadTimeBases=['payment','deposit','order','manual'];
export const leadTimeDepositPercent=order=>order.leadTimeDepositPercent??order.productionDepositPercent??50;
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
// Pure projection: receipt dates come from actual order payments, never labels,
// payment requests or the later production-release registration.
export function depositLeadTime(state,order,{priceKnown,total}){
 const percentage=leadTimeDepositPercent(order),payments=(state.payments||[]).filter(p=>p.orderId===order.id);
 const result={percentage,date:'',required:null,received:payments.reduce((sum,p)=>sum+(Number.isSafeInteger(p.amount)?p.amount:0),0)};
 if(!Number.isInteger(percentage)||percentage<1||percentage>100)return {...result,reason:'percentage'};
 if(!priceKnown||order.shippingKnown!==true||!Number.isSafeInteger(total))return {...result,reason:'price'};
 if(total<=0)return {...result,reason:'zero'};
 const required=Math.max(1,Math.round(total*percentage/100));
 if(payments.some(p=>!Number.isSafeInteger(p.amount)||p.amount<0||p.amount>0&&!validDate(p.date)))return {...result,required,reason:'payments'};
 let received=0;
 for(const payment of payments.filter(p=>p.amount>0).sort((a,b)=>a.date.localeCompare(b.date))){received+=payment.amount;if(received>=required)return {...result,required,date:payment.date,reason:''};}
 return {...result,required,reason:'unpaid'};
}
