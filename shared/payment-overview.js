// Read-only projection of current customer receipts. No payer inference,
// provider calls, rematching, deduplication or writes to financial records.
const timestamp=value=>{const parsed=typeof value==='string'?Date.parse(value):NaN;return Number.isFinite(parsed)?parsed:null;};
const receiptDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&timestamp(value)!=null&&new Date(value).toISOString().slice(0,10)===value?value:'';
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('nl-NL');
const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'});
function receivedDay(at){const parts=dayFormat.formatToParts(at);return ['year','month','day'].map(key=>parts.find(p=>p.type===key).value).join('-');}
function searchAmount(text){
 let value=text.trim().replace(/[€\s]/g,'');
 if(/^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(value))value=value.replaceAll('.','').replace(',','.');
 else if(!/^-?\d+(?:\.\d{1,2})?$/.test(value))return null;
 const cents=Math.round(Number(value)*100);return Number.isSafeInteger(cents)?cents:null;
}
export function paymentOverviewRows(state){
 const orders=new Map((state.orders||[]).map(o=>[o.id,o])),customers=new Map((state.customers||[]).map(c=>[c.id,c]));
 const corrections=new Map();
 for(const c of state.paymentCorrections||[]){const list=corrections.get(c.before?.id)||[];list.push(c);corrections.set(c.before?.id,list);}
 return (state.payments||[]).map((payment,index)=>{
  const order=orders.get(payment.orderId),customer=order?customers.get(order.customerId):null;
  const provider=payment.source==='tikkie'||String(payment.externalId||'').startsWith('tikkie:');
  const receivedAt=timestamp(payment.receivedAt),day=receivedAt!=null?receivedDay(receivedAt):receiptDay(payment.date),amount=Number.isSafeInteger(payment.amount)?payment.amount:null;
  const customerName=customer?.company||customer?.contact||'',orderNumber=order?String(order.sourceNumber||order.number||''):'';
  const issues=[];
  if(!order)issues.push('Order ontbreekt');else if(!customer)issues.push('Klant ontbreekt');else if(!customerName)issues.push('Klantnaam ontbreekt');
  if(amount==null)issues.push('Bedrag onbekend');
  if(!day&&receivedAt==null)issues.push('Ontvangstdatum onbekend');
  const label=provider?'Tikkie':'Andere registratie';
  const searchable=normalize([customerName,customer?.contact,customer?.email,orderNumber,payment.reference,label,day,payment.id,amount==null?'':(amount/100).toFixed(2),amount==null?'':(amount/100).toFixed(2).replace('.',','),...issues].filter(v=>v!=null).join(' '));
  return {payment,order,customer,customerName,orderNumber,provider,sourceLabel:label,day,receivedAt,amount,issues,corrections:corrections.get(payment.id)||[],sortAt:receivedAt??-Infinity,index,searchable};
 }).sort((a,b)=>b.day.localeCompare(a.day)||b.sortAt-a.sortAt||String(b.payment.id).localeCompare(String(a.payment.id))||a.index-b.index);
}
export function selectPayments(rows,{text='',source='all',from='',to='',attention=false}={}){
 const terms=normalize(text.trim()).split(/\s+/).filter(Boolean),amount=text.trim()?searchAmount(text):null;
 return rows.filter(row=>
  (source==='all'||source==='tikkie'&&row.provider||source==='other'&&!row.provider)&&
  (!attention||row.issues.length>0)&&
  (!from||row.day&&row.day>=from)&&(!to||row.day&&row.day<=to)&&
  (terms.every(term=>row.searchable.includes(term))||amount!=null&&row.amount===amount)
 );
}
export function paymentOverviewTotals(rows){
 let total=0,unknown=0,overflow=false;
 for(const row of rows){if(row.amount==null)unknown++;else{total+=row.amount;if(!Number.isSafeInteger(total))overflow=true;}}
 return {count:rows.length,total:!overflow&&(!unknown||unknown<rows.length)?total:null,unknown,attention:rows.filter(r=>r.issues.length).length};
}
