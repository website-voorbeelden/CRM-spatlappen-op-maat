import {companyFor} from './companies.js';
import {salesFunnel} from './sales-funnel.js?v=maat-cleanup-20261021';
const knownDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value));
export const executionStages=['Besteld bij leverancier','In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'];
export function orderExecution(o){
 const facts=[['supplierOrderedDate','Besteld bij leverancier'],['productionDate','In productie'],['transitDate','Onderweg naar Nederland'],['arrivedDate','Binnen in Nederland'],['shippedDate','Verzonden'],['deliveredDate','Afgerond']];
 // A linked batch is context, never evidence that every part of an order is done.
 const recorded=facts.filter(([key])=>knownDate(o[key]));
 const latest=recorded.at(-1)?.[1],stageIndex=executionStages.indexOf(o.stage),factIndex=executionStages.indexOf(latest);
 const stage=executionStages[Math.max(stageIndex,factIndex)]||'';
 return {stage,label:stage||'Nog niet geregistreerd',delivered:stage==='Afgerond',shipped:['Verzonden','Afgerond'].includes(stage),started:Boolean(stage),facts:recorded};
}
export function orderProgress(state,o,companyId){
 const design=companyFor(companyId).tool==='design',funnel=salesFunnel(state,o,companyId),execution=orderExecution(o),payment=funnel.payment;
 const designApproved=knownDate(o.approvedDate)||(state.documents||[]).some(d=>d.ownerId===o.id&&d.imageRole==='approved');
 const quoteSent=knownDate(o.quoteSentDate)||funnel.events.some(e=>e.phase==='quote'&&(e.source==='mail'||!['pending','dismissed'].includes(e.review)));
 const quotePrepared=Boolean(o.quoteDraft)||(state.documents||[]).some(d=>d.ownerId===o.id&&(d.generated?.kind||d.category)==='quote');
 const firstDone=design?designApproved:!funnel.missing.length&&payment.known;
 const phaseGroup={new:0,welcome:0,specs:0,pricing:0,indication:1,quote:1,received:2,confirmation:2,paid:3,released:3,production:3,delivered:4};
 const current=execution.shipped?4:execution.started?3:phaseGroup[funnel.displayPhase]??0;
 const steps=[
  {key:'intake',label:design?'Ontwerp':'Aanvraag & prijs',tab:'overview',done:firstDone,status:design?(designApproved?'Akkoord geregistreerd':'Ontwerp en akkoord controleren'):funnel.missing.length?funnel.missing.length+' gegevens nog nodig':payment.known?'Specificaties en prijs bekend':'Prijs nog aanvullen'},
  {key:'quote',label:'Offerte',tab:'documents',done:quoteSent,status:quoteSent?'Verstuurd geregistreerd':quotePrepared?'Concept beschikbaar':'Nog niet verstuurd'},
  {key:'payment',label:'Betaling',tab:'payments',done:payment.fullyPaid,status:payment.fullyPaid?'Volledig ontvangen':payment.paid>0?'Deels ontvangen':payment.known?'Nog geen betaling':'Orderbedrag nog onbekend'},
  {key:'execution',label:'Uitvoering',tab:'costs',done:execution.shipped,status:execution.started?execution.label:'Nog niet geregistreerd'},
  {key:'delivery',label:'Levering',tab:'delivery',done:execution.delivered,status:execution.delivered?'Ontvangst geregistreerd':execution.shipped?'Verzonden · ontvangst nog registreren':'Nog niet geleverd'}
 ].map((step,index)=>({...step,current:index===current}));
 return {funnel,execution,steps,purchase:(state.purchases||[]).find(p=>p.id===o.purchaseId)||null};
}
