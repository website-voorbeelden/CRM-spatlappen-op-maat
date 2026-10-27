import {inquiryRequirements,specLabels} from './inquiries.js?v=ui-batch234-20261027';
import {companyFor} from './companies.js';
import {checkMailText} from './mail-templates.js?v=mail-texts-20261027';
export const requestLabels={...specLabels,application:'Toepassing / waar het voor gebruikt wordt',delivery:'Gewenste leverdatum'};
export const defaultRequestFormat={opening:'Bedankt voor je aanvraag. Om een passende offerte te maken ontvangen we graag nog de volgende informatie:',closing:'Je kunt op deze mail antwoorden. Een tekening of voorbeeld mag je ook meesturen. Zodra we deze informatie hebben, werken we je aanvraag verder uit.'};
export function requestBasis(order){return JSON.stringify([order.inquirySpecs||{},order.inquiryNotRequired||[],order.items.map(i=>({id:i.id,description:i.description,quantity:i.quantity,width:i.width,height:i.height,material:i.material,thickness:i.thickness,shape:i.shape,diameter:i.diameter,holeDiameter:i.holeDiameter,printColors:i.printColors,designDocumentId:i.designDocumentId}))]);}
export function requestChoices(order,companyId){
 const info=inquiryRequirements(order,companyId),saved=order.inquiryMailChecklist?.basis===requestBasis(order)?Object.fromEntries((Array.isArray(order.inquiryMailChecklist.statuses)?order.inquiryMailChecklist.statuses:[]).map(s=>[s.field,s.status])):null;
 const keys=[...new Set([...info.fields.map(f=>f.key),'color',...(companyId==='spatlappen'?['design']:[]),'shape','application','delivery'])];
 return keys.flatMap(key=>{
  const field=info.fields.find(f=>f.key===key);
  if(field?.products)return field.products.map((product,index)=>{
   const token=key+'@'+product.itemId;
   return {key:token,label:requestLabels[key]+' — '+(index+1)+'. '+product.label,value:product.value,conflict:!!product.conflict,status:saved?.[token]||(product.notRequired?'skip':product.complete?'have':'ask')};
  });
  const value=(field?.displayValue!=null?field.displayValue:info.values[key])??null;
  return [{key,label:requestLabels[key],value,conflict:!!field?.conflict,status:saved?.[key]||(field?.notRequired?'skip':field?(field.complete?'have':'ask'):value!=null?'have':'skip')}];
 });
}
export function cleanRequestSelection(statuses){
 if(!statuses||typeof statuses!=='object'||Array.isArray(statuses)||Object.entries(statuses).length>600||Object.entries(statuses).some(([key,value])=>{const [field,itemId,...rest]=key.split('@');return !Object.hasOwn(requestLabels,field)||rest.length||itemId!==undefined&&!/^[a-zA-Z0-9._-]{1,160}$/.test(itemId)||!['have','ask','skip'].includes(value);}))throw Error('Ongeldige checklistkeuze.');
 return {...statuses};
}
export function cleanRequestFormat(input){const result={};for(const key of ['opening','closing']){if(typeof input?.[key]!=='string'||input[key].length>3000||input[key].includes('\0')||/\{\{|\}\}/.test(input[key]))throw Error('Controleer de inleiding en afsluiting (maximaal 3.000 tekens, zonder variabelen).');result[key]=input[key].trim();}return result;}
export function requestMail({statuses,customer,companyId,order=null,format=defaultRequestFormat,extra='',subject='Aanvullende gegevens voor je aanvraag'}){const choices=cleanRequestSelection(statuses),textFormat=cleanRequestFormat(format),company=companyFor(companyId);if(typeof extra!=='string'||extra.length>2000||extra.includes('\0'))throw Error('Gebruik maximaal 2.000 tekens voor je extra vraag.');const labels=order?new Map(requestChoices(order,companyId).map(choice=>[choice.key,choice.label])):null;if(labels&&Object.keys(choices).some(key=>!labels.has(key)))throw Error('De productkeuze is veranderd. Open de checklist opnieuw.');const questions=Object.entries(choices).filter(([,v])=>v==='ask').map(([key])=>{if(key.includes('@')&&!labels)throw Error('Kies de order voor productgerichte vragen.');return labels?.get(key)||requestLabels[key];});if(!questions.length&&!extra.trim())throw Error('Vink minstens één gegeven aan bij Nog opvragen, of voeg een extra vraag toe.');const body=['Beste '+(customer.contact||customer.company||'klant')+',',textFormat.opening,[...questions.map(q=>'• '+q),...(extra.trim()?['• '+extra.trim()]:[])].join('\n'),textFormat.closing,'Met vriendelijke groet,\n'+company.name].filter(Boolean).join('\n\n');checkMailText(subject,body);return {subject,body};}
