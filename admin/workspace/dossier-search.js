import {orderPaymentStatusLabel} from '../../shared/order-payment-status.js?v=ui-batch3-followup-20261027';
import {materialKey} from '../../shared/product-metrics.js?v=product-thickness-20261021';
import {customerFinancials} from "../../shared/customer-workspace.js?v=ui-batch234-20261027";
export const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[×✕]/g,'x').replace(/\s+/g,' ').trim();
export const defaultOrderSearch=()=>({text:'',visibility:'active',customerId:'',stage:'',outcome:'',width:'',height:'',quantity:'',printColors:'',material:'',thickness:'',tolerance:'0',from:'',to:'',expanded:false,mode:'orders',sourceOrderId:'',orderIds:[],selectionLabel:''});
export const defaultCustomerSearch=(sort='opened')=>({text:'',visibility:'active',activity:'',country:'',sort,expanded:false});
export const quoteOutcomeOptions=[['','Automatisch uit akkoord / betaling'],['accepted','Akkoord'],['pending','Wacht op antwoord'],['declined','Afgewezen'],['no_response','Geen reactie']];
function localPhone(value){
 const digits=String(value??'').replace(/\D/g,'');
 for(const prefix of ['0031','0032','31','32'])if(digits.startsWith(prefix))return '0'+digits.slice(prefix.length);
 return digits;
}
function textMatches(haystack,query){
 const text=normalizeSearch(haystack),terms=normalizeSearch(query).split(' ').filter(Boolean);
 return terms.every(term=>text.includes(term)||(/^[\d+().-]+$/.test(term)&&term.replace(/\D/g,'').length>=3&&text.replace(/\D/g,'').includes(term.replace(/\D/g,''))));
}
export function quoteResult(o,paid=0){
 if(o.quoteOutcome==='declined')return {key:'declined',label:'Afgewezen'};
 if(o.quoteOutcome==='no_response')return {key:'no_response',label:'Geen reactie'};
 if(o.quoteOutcome==='accepted'||o.quoteAcceptedDate)return {key:'accepted',label:'Akkoord geregistreerd'};
 if(paid>0)return {key:'accepted',label:'Betaling ontvangen'};
 if(['Productie vrijgegeven','Besteld bij leverancier','In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'].includes(o.stage))return {key:'accepted',label:'In uitvoering / afgerond'};
 if(o.quoteOutcome==='pending'||o.quoteSentDate||o.quoteDraft||o.stage==='Offerte verstuurd'||o.stage==='Wachten op betaling')return {key:'pending',label:'Nog geen akkoord geregistreerd'};
 return {key:'unknown',label:'Akkoord nog onbekend'};
}
function paymentsByOrder(data){const paid=new Map();for(const p of data.payments)paid.set(p.orderId,(paid.get(p.orderId)||0)+p.amount);return paid;}
function orderPaymentStatus(o,paid){
 if(!o.items.length||o.packagePrice==null&&o.items.some(i=>i.price==null))return 'Prijs nog onbekend';
 const net=(o.packagePrice??o.items.reduce((sum,i)=>sum+i.quantity*(i.price??0),0))+(o.shippingCharge||0),total=net+Math.round(net*o.vat/100);
 return orderPaymentStatusLabel(o,{priceKnown:true,total,paid});
}
function inScope(record,scope){return scope==='all'||(scope==='archived'?record.archived:!record.archived);}
export function orderFilterError(f){
 for(const [key,label] of [['width','breedte'],['height','hoogte'],['quantity','aantal'],['printColors','drukkleuren'],['thickness','dikte in mm']]){
  if(f[key]===''||f[key]==null)continue;const n=Number(f[key]);
  if(!Number.isFinite(n)||n<(key==='printColors'?0:0.00001)||(['quantity','printColors'].includes(key)&&!Number.isInteger(n))||key==='printColors'&&n>99)return `Vul een geldige ${label} in.`;
 }
 return f.from&&f.to&&f.from>f.to?'De begindatum ligt na de einddatum.':'';
}
export function searchOrderItems(data,f,{includeIncomplete=false}={}){
 if(orderFilterError(f))return [];
 const customers=new Map(data.customers.map(c=>[c.id,c])),paid=paymentsByOrder(data),tolerance=Number(f.tolerance)/100,rows=[];
 for(const o of data.orders){
  if(f.orderIds?.length&&!f.orderIds.includes(o.id)||o.id===f.sourceOrderId||!inScope(o,f.visibility)||f.customerId&&o.customerId!==f.customerId||f.stage&&o.stage!==f.stage&&orderPaymentStatus(o,paid.get(o.id)||0)!==f.stage||f.from&&(!o.date||o.date<f.from)||f.to&&(!o.date||o.date>f.to))continue;
  const result=quoteResult(o,paid.get(o.id)||0);if(f.outcome&&result.key!==f.outcome)continue;
  const c=customers.get(o.customerId),common=[o.number,o.sourceNumber,o.inquiryName,o.inquirySourceSubject,o.stage,o.notes,o.supplier,o.batch,c?.company,c?.contact,c?.email,c?.invoiceEmail,c?.phone,localPhone(c?.phone),c?.shippingAddress,c?.billingAddress].join(' ');
  const incomplete=o.items.length===0,candidates=o.items.length?o.items:includeIncomplete&&f.mode!=='prices'?[{...o.inquirySpecs,description:o.inquiryProduct||'Aanvraag op maat'}]:[];
  for(const item of candidates){
   let distance=0,dimensions=0,matches=true;
   for(const [key,multiplier] of [['width',10],['height',10],['quantity',1]]){
    if(f[key]==='')continue;const wanted=Number(f[key])*multiplier,actual=item[key];
    if(actual==null||!Number.isFinite(actual)||Math.abs(actual-wanted)>Math.max(0.000001,wanted*tolerance)){matches=false;break;}
    distance+=Math.abs(actual-wanted)/wanted;dimensions++;
   }
   if(!matches||f.printColors!==''&&(item.printColors==null||item.printColors!==Number(f.printColors)))continue;
   if(f.material&&materialKey(item.material)!==materialKey(f.material))continue;
   if(f.thickness!==''&&f.thickness!=null&&(typeof item.thickness!=='number'||!Number.isFinite(item.thickness)||Math.abs(item.thickness-Number(f.thickness))>0.000000001))continue;
   const size=item.width&&item.height?`${item.width} ${item.height} ${item.width/10}x${item.height/10} ${item.width}x${item.height}`:'';
   if(!textMatches(common+' '+[item.description,item.specs,item.material,typeof item.thickness==='number'?[String(item.thickness)+'mm',String(item.thickness)+' mm',String(item.thickness).replace('.',',')+'mm',String(item.thickness).replace('.',',')+' mm'].join(' '):'',size].join(' '),f.text))continue;
   rows.push({o,item:incomplete?null:item,c,result,paid:paid.get(o.id)||0,distance:dimensions?distance/dimensions:0});
  }
 }
 return rows.sort((a,b)=>a.distance-b.distance||String(b.o.date).localeCompare(String(a.o.date))||Number(b.o.number)-Number(a.o.number));
}
export function searchCustomers(data,f,{openedAt=()=>0}={}){
 const rows=[];
 for(const c of data.customers){
  if(!inScope(c,f.visibility)||f.country&&c.country!==f.country)continue;
  const orders=data.orders.filter(o=>o.customerId===c.id),open=orders.filter(o=>!o.archived&&o.stage!=='Afgerond'&&!o.deliveredDate);
  const {balance,provisional}=customerFinancials(data,orders);
  if(f.activity==='open'&&!open.length||f.activity==='outstanding'&&balance<=0||f.activity==='single'&&orders.length!==1||f.activity==='repeat'&&orders.length<2||f.activity==='none'&&orders.length||f.activity==='completed'&&(!orders.length||orders.some(o=>o.stage!=='Afgerond'&&!o.deliveredDate)))continue;
  const haystack=[localPhone(c.phone),...(c.contacts||[]).flatMap(person=>[person.name,person.email,person.phone,localPhone(person.phone)]),...Object.values(c).filter(v=>typeof v==='string'),...orders.flatMap(o=>[o.number,o.sourceNumber,o.delivery?.address,...o.items.map(i=>i.description)])].join(' ');
  if(!textMatches(haystack,f.text))continue;
  rows.push({c,orders,open,balance,provisional,lastDate:orders.map(o=>o.date||'').sort().at(-1)||''});
 }
 return rows.sort((a,b)=>f.sort==='opened'?openedAt(b.c.id)-openedAt(a.c.id)||b.lastDate.localeCompare(a.lastDate)||a.c.company.localeCompare(b.c.company,'nl')||String(a.c.id).localeCompare(String(b.c.id)):f.sort==='recent'?b.lastDate.localeCompare(a.lastDate)||a.c.company.localeCompare(b.c.company,'nl'):f.sort==='outstanding'?b.balance-a.balance||a.c.company.localeCompare(b.c.company,'nl'):a.c.company.localeCompare(b.c.company,'nl'));
}

export function orderDossierLabel(order,paid=0){if(quoteResult(order,paid).key==='accepted')return 'Order';if(order.quoteSentDate||order.quoteDraft||order.stage==='Offerte verstuurd')return 'Offerte';return order.inquiryDraft||!order.items.length?'Aanvraag':'Order';}
