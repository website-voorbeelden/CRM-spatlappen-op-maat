// Read-only elapsed time from current receipts, independent of price, mail,
// production release and the separately agreed delivery-term baseline.
const calendarDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const date=value=>value.split('-').reverse().join('-');
export function orderPaymentWait(state,order,{today=new Date().toISOString().slice(0,10)}={}){
 const result={label:'Sinds eerste betaling',value:'Nog geen betaling',detail:'Teller start bij betaling of aanbetaling',summary:'Nog geen betaling',date:'',days:null};
 const receipts=(state.payments||[]).filter(p=>p.orderId===order.id);
 if(receipts.some(p=>!Number.isSafeInteger(p.amount)||p.amount<0))return {...result,value:'Betalingen controleren',summary:'Betalingen controleren',detail:'Controleer de geregistreerde ontvangstbedragen'};
 const positive=receipts.filter(p=>p.amount>0);
 if(!positive.length)return result;
 if(positive.some(p=>!calendarDate(p.date)))return {...result,value:'Datum ontbreekt',summary:'Betaaldatum controleren',detail:'Controleer de ontvangstdatums van de betalingen'};
 const first=positive.map(p=>p.date).sort()[0],delivered=Boolean(order.deliveredDate),end=delivered?order.deliveredDate:today;
 if(!calendarDate(today)||!calendarDate(end)||positive.some(p=>p.date>today)||first>end||end>today)return {...result,date:first,value:'Datum controleren',summary:'Betaal- of leverdatum controleren',detail:'De geregistreerde betaal- en leverdatums sluiten niet aan'};
 if(order.stage==='Afgerond'&&!delivered)return {...result,date:first,label:'Betaling tot levering',value:'Leverdatum ontbreekt',summary:'Leverdatum ontbreekt',detail:'Vul de werkelijke leverdatum aan om de teller te stoppen'};
 const days=Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(first+'T12:00:00Z'))/86400000),duration=days+' '+(days===1?'dag':'dagen');
 return {...result,date:first,days,label:delivered?'Betaling tot levering':result.label,value:duration,summary:duration+(delivered?' van betaling tot levering':' sinds eerste betaling'),detail:'Vanaf '+date(first)+(delivered?' · geleverd '+date(end):' · aanbetaling telt ook')};
}
