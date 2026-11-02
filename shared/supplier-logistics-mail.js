import {packsPlanningLines} from './packs-preparation.js?v=packs-worker-v3-20261102';
import {supplierTrialSubject,supplierTrialNotice} from './supplier-trial-mail.js?v=supplier-batches35-20261101';
// New proposals only. Saved user drafts/signatures are never rewritten.
export function supplierLogisticsMail(info,{trial=false}={}){
 const subject=(trial?supplierTrialSubject:'')+'Pakbon '+info.reference+' - Order '+info.data.number;
 if(subject.length>200)throw Error('Het volledige bestelnummer en ons nummer passen niet in het mailonderwerp. Controleer het leveranciersnummer.');
 const count=info.data.items.length&&info.data.items.every(i=>Number.isSafeInteger(i.quantity)&&i.quantity>0)?info.data.items.reduce((n,i)=>n+i.quantity,0):null;
 const address=[info.data.recipient,info.data.address,info.data.country].filter(Boolean).join('\n');
 const body=[trial?supplierTrialNotice:'',trial?'Controle van onze pakbon en het PACKS-label.':'Beste Kunststofbaas,',
  'Bijgaand de pakbon en het PACKS-label voor jullie bestelling '+info.reference+' (onze order '+info.data.number+').',
  'Aflevering:\n'+address,count===null?'Aantal producten: zie pakbon.':'Aantal producten: '+count,
  packsPlanningLines(info.workflow.packsPreparation,info.label?.packsLabelBundle?.planning||info.tracking?.planning).join('\n')].filter(Boolean).join('\n\n');
 return {subject,body};
}
