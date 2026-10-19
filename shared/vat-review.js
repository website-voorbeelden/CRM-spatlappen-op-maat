// Classification entered by the user; never infer tax treatment from country.
export const vatReasonTypes=[
 {code:'eu_goods',label:'Goederenlevering binnen de EU · 0%',rate:0},
 {code:'export',label:'Uitvoer buiten de EU · 0%',rate:0},
 {code:'reverse_charge',label:'Btw verlegd',rate:0},
 {code:'exempt',label:'Vrijgesteld van btw',rate:0},
 {code:'reduced',label:'Verlaagd tarief · 9%',rate:9},
 {code:'foreign',label:'Buitenlandse btw',rate:null}
];
const problem=(message,field='vatReasonCode')=>Object.assign(Error(message),{field});
export const validVatRate=rate=>typeof rate==='number'&&Number.isFinite(rate)&&rate>=0&&rate<=100;
export function readVatClassification(rate,reason,{required=false}={}){
 if(!validVatRate(rate))throw problem('Vul een geldig btw-percentage in.','vat');
 if(rate===21)return null;
 if(reason==null){if(required)throw problem('Kies waarom je afwijkt van 21% btw.');return null;}
 if(typeof reason!=='object'||Array.isArray(reason))throw problem('Controleer de btw-reden.');
 const type=vatReasonTypes.find(t=>t.code===reason.code),custom=reason.code==='custom';
 if(!type&&!custom)throw problem('Kies een geldige btw-reden.');
 if(type?.rate!=null&&type.rate!==rate)throw problem('Deze reden hoort bij '+type.rate+'% btw. Kies een passende reden of vul een eigen reden in.');
 const label=custom?String(reason.label||'').trim():type.label,note=String(reason.note||'').trim();
 if(!label||label.length>160)throw problem('Vul een eigen reden van maximaal 160 tekens in.','vatReasonLabel');
 if(note.length>1000)throw problem('Gebruik maximaal 1000 tekens voor de toelichting.','vatReasonNote');
 return {code:reason.code,label,note};
}
export function rememberVatReason(state,reason,remember){
 if(!remember||reason?.code!=='custom')return;
 const current=state.vatReasonPresets||[];
 if(current.some(label=>label.toLocaleLowerCase('nl')===reason.label.toLocaleLowerCase('nl')))return;
 if(current.length>=100)throw problem('Er zijn al 100 eigen btw-redenen bewaard. Gebruik een bestaande reden of bewaar deze alleen bij de order.','vatReasonRemember');
 state.vatReasonPresets=[...current,reason.label];
}
export function vatReviewRows(state){
 return state.orders.map(order=>{
  let reason=null,issue='';
  try{reason=readVatClassification(order.vat,order.vatReason);if(order.vat!==21&&!reason)issue='Reden ontbreekt';}catch{issue=validVatRate(order.vat)?'Reden controleren':'Btw-percentage ontbreekt of is ongeldig';}
  return {order,reason,issue,exception:order.vat!==21,rateKnown:validVatRate(order.vat)};
 });
}
