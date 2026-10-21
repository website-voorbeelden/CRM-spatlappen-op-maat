import {customerEmailMatches} from './inquiry-customer.js';
import {companyFor} from './companies.js';
import {emailAddresses,conversationSignature} from './mail-inbox.js?v=workspace-search-20261017';
import {inquiryText,inquiryRequirements,cleanInquirySpecs,specLabels,createInquiry} from './inquiries.js?v=inquiry-form-20261021';
import {splitQuotedMail} from './mail-display.js';
import {inquiryQuantity,inquiryColor} from './inquiry-quantity.js?v=inquiry-form-20261021';
import {markProvenance} from './provenance.js';

// Explicit labels and units only. No network, learned customer data or price inference.
const numeric=new Set(['quantity','width','height','diameter','holeDiameter','thickness']);
const materialPattern=/\b(?:rubber|PVC|HDPE|PE1000|PE500|POM|PTFE|PMMA|polycarbonaat|acrylaat|plexiglas|EPDM|SBR|NBR|ABS|HPL|PETG|PP)\b/gi;
const labels={company:'bedrijfsnaam|bedrijf|company',contact:'contactpersoon|naam|name',email:'e-?mail(?:adres)?|email address',phone:'telefoon(?:nummer)?|tel\\.?|phone',product:'product|onderdeel|aanvraag voor'};
const number='([0-9]+(?:[.,][0-9]+)?)';
const mm=(v,u)=>Number(v.replace(',','.'))*({mm:1,cm:10,m:1000}[u.toLowerCase()]);
export function recognizeRequest(message,companyId){
 const company=companyFor(companyId),original=inquiryText(message),{current,quoted}=splitQuotedMail(original),text=current.slice(0,30000),customer={company:'',contact:'',email:'',phone:''},specs={},evidence={},warnings=[],conflicts=new Set();
 function put(key,value,quote){
  if(value==null||value===''||conflicts.has(key))return;
  const target=Object.hasOwn(customer,key)?customer:specs;
  if(target[key]!=null&&target[key]!==''&&String(target[key]).toLowerCase()!==String(value).toLowerCase()){
   target[key]=Object.hasOwn(customer,key)?'':null;conflicts.add(key);delete evidence[key];warnings.push('Verschillende waarden voor '+(specLabels[key]||{company:'klantnaam',contact:'contactpersoon',email:'e-mail',phone:'telefoon'}[key])+'. Vul de juiste waarde zelf in.');return;
  }
  target[key]=value;evidence[key]=String(quote).slice(0,240);
 }
 for(const [key,label] of Object.entries(labels))for(const match of text.matchAll(new RegExp('(?:^|\\n)\\s*(?:'+label+')\\s*:\\s*([^\\n]+)','gi'))){
  const value=match[1].trim().slice(0,200);
  if(key==='email'){const addresses=emailAddresses(value);if(addresses.length===1)put(key,addresses[0],match[0].trim());}
  else if(key==='product')specs.product=value;
  else put(key,value,match[0].trim());
 }
 const from=emailAddresses(message.from),reply=emailAddresses(message.replyTo);
 if(!customer.email&&!conflicts.has('email')){const addresses=reply.length?reply:from;if(addresses.length===1)put('email',addresses[0],(reply.length?'Reply-To: ':'Afzender: ')+(reply.length?message.replyTo:message.from));}
 if(reply.length===1&&from.length===1&&reply[0]!==from[0])warnings.push('Afzender en Reply-To verschillen. Controleer wie de klant is.');
 const display=String(message.from||'').match(/^\s*"?([^"<>]+?)"?\s*</)?.[1]?.trim();
 if(!customer.contact&&display&&!display.includes('@')&&!conflicts.has('contact'))put('contact',display,'Afzender: '+message.from);
 if(!customer.company&&customer.contact&&!conflicts.has('company')){customer.company=customer.contact;evidence.company=evidence.contact;}
 const quantity=inquiryQuantity(text);
 for(const match of quantity.mentions)put('quantity',match.value,match.text);
 for(const match of text.matchAll(materialPattern)){
  // Negation and alternative choices are unresolved, even when a material is recognized.
  const prefix=text.slice(Math.max(0,match.index-12),match.index);
  if(/(?:geen|niet)\s*$/i.test(prefix)){warnings.push('Materiaal wordt ontkend in de aanvraag. Kies het materiaal zelf.');conflicts.add('material');specs.material=null;delete evidence.material;}
  else put('material',match[0].toUpperCase(),match[0]);
 }
 const dimensions={width:'breedte|breed',height:'hoogte|lengte',diameter:'buitendiameter|diameter|Ø',holeDiameter:'binnendiameter|gatdiameter|middengat|centraal gat',thickness:'dikte|dik'};
 for(const [key,label] of Object.entries(dimensions))for(const match of text.matchAll(new RegExp('(?:^|[\\s,;])(?:'+label+')\\s*:?\\s*'+number+'\\s*(mm|cm|m)\\b','gi')))put(key,mm(match[1],match[2]),match[0].trim());
 for(const [key,label] of Object.entries({width:'breed|breedte',height:'hoog|lang|hoogte|lengte',thickness:'dik|dikte'}))for(const match of text.matchAll(new RegExp('\\b'+number+'[ \t]*(mm|cm|m)[ \t]*(?:'+label+')\\b','gi')))put(key,mm(match[1],match[2]),match[0]);
 // 200 × 100 × 3 mm is ambiguous (third dimension is not silently a thickness).
 const triple=/\b\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?\s*[x×]\s*\d+/i.test(text);
 if(triple)warnings.push('Drie maten achter elkaar: vul breedte, hoogte en dikte afzonderlijk in.');
 else for(const match of text.matchAll(new RegExp('\\b'+number+'\\s*(mm|cm|m)?\\s*(?:x|×|bij)\\s*'+number+'\\s*(mm|cm|m)\\b','gi'))){put('width',mm(match[1],match[2]||match[4]),match[0]);put('height',mm(match[3],match[4]),match[0]);}
 for(const match of text.matchAll(/\b(zwart|zwarte|wit|witte|transparant|transparante|rood|rode|blauw|blauwe|groen|groene|grijs|grijze)\b/gi))put('color',inquiryColor(match[0]),match[0]);
 if(/\b(?:ring|pakking|pakkingen|rond|cirkel|schijf)\b/i.test(text)||specs.diameter!=null)specs.shape='round';
 else if(specs.width!=null&&specs.height!=null)specs.shape='rectangle';
 if(/\b(?:geen|zonder)\s+(?:centraal\s+)?(?:gat|middengat)\b/i.test(text))put('holeDiameter',0,'Zonder middengat');
 if(quoted)warnings.push('Eerdere geciteerde berichten zijn niet gebruikt voor de herkenning.');
 if(message.truncated||original.length>30000)warnings.push('De mailtekst is ingekort. Controleer het volledige oorspronkelijke bericht.');
 const product=specs.product||String(message.subject||'').replace(/^(?:(?:re|fw|fwd):\s*)+/i,'').slice(0,200)||company.defaultProduct;delete specs.product;
 if(quantity.ambiguous){for(const key of Object.keys(specs)){specs[key]=null;delete evidence[key];}warnings.push('Meerdere producten, tegenstrijdige aantallen of een keuze/bereik gevonden. Vul één product bewust in; gegevens worden niet gemengd.');}
 // Limit detection to the valid domain; unreasonable values remain unknown.
 for(const [key,value] of Object.entries(specs))try{cleanInquirySpecs({[key]:value});}catch{specs[key]=null;delete evidence[key];warnings.push('Controleer '+specLabels[key]+': deze waarde valt buiten de toegestane invoer.');}
 return {companyId,customer,product,specs:cleanInquirySpecs(specs),evidence,warnings:[...new Set(warnings)],originalText:text,needsReview:true};
}
export function requestMissing(input,companyId){
 const info=inquiryRequirements({items:[],inquirySpecs:cleanInquirySpecs(input.specs||{})},companyId);
 return [...(!input.customer?.company?.trim()?['Klantnaam']:[]),...(emailAddresses(input.customer?.email).length!==1?['E-mailadres klant']:[]),...info.missing.map(k=>specLabels[k])];
}
const customerBasis=state=>JSON.stringify(state.customers.map(c=>({id:c.id,company:c.company,email:c.email,invoiceEmail:c.invoiceEmail,contact:c.contact,phone:c.phone,contacts:c.contacts,archived:c.archived})));
const messageBasis=message=>JSON.stringify([message.mailbox,message.gmailId,message.threadId,message.text,message.html,message.from,message.replyTo,message.subject,message.truncated]);
export function requestReviewBasis(state,thread,message){return {customers:customerBasis(state),conversation:conversationSignature(state,thread.mailbox,thread.threadId),message:messageBasis(message)};}
export function saveRecognizedRequest(state,thread,message,input,companyId,{approved=false,expected,...options}={}){
 if(message.direction==='outgoing')throw Error('Kies een ontvangen aanvraag.');
 if(input.companyId!==companyId)throw Error('Deze aanvraag hoort bij een ander bedrijf.');
 if(!approved)throw Error('Controleer de aanvraag en bevestig de gegevens eerst.');
 const key=JSON.stringify([companyId,thread.mailbox,message.gmailId]),source=state.inquirySources?.find(s=>s.key===key);
 if(source){if(!state.orders.some(o=>o.id===source.orderId))throw Error('Deze aanvraag is eerder verwerkt; de order is verwijderd.');return {orderId:source.orderId,reused:true};}
 if(JSON.stringify(requestReviewBasis(state,thread,message))!==JSON.stringify(expected))throw Error('De mailkoppeling of klantgegevens zijn intussen gewijzigd. Open de herkenning opnieuw.');
 if(state.customers.some(c=>c.archived&&customerEmailMatches(c,input.customer.email)))throw Error('Deze klant is gearchiveerd. Controleer en herstel eerst het juiste dossier.');
 if(thread.messages.find(m=>m.gmailId===message.gmailId)&&messageBasis(thread.messages.find(m=>m.gmailId===message.gmailId))!==messageBasis(message))throw Error('De bronmail is intussen gewijzigd. Open de herkenning opnieuw.');
 const detected=recognizeRequest(message,companyId),next=structuredClone(state),before=new Map(state.customers.map(c=>[c.id,c]));
 const result=createInquiry(next,thread,message,input,companyId,{...options,automatic:false}),customer=next.customers.find(c=>c.id===result.customerId),order=next.orders.find(o=>o.id===result.orderId);
 // Recognition never edits an existing customer's fields, even when a blank contact is found.
 if(before.has(customer.id))next.customers[next.customers.findIndex(c=>c.id===customer.id)]=structuredClone(before.get(customer.id));
 else for(const field of ['company','email','phone','contact']){delete customer.provenance?.[field];if(customer[field]&&customer[field]===detected.customer[field])markProvenance(customer,[field],'mailRecognition');}
 for(const field of Object.keys(input.specs||{})){delete order.provenance?.['inquirySpecs.'+field];if(input.specs[field]!=null&&input.specs[field]===detected.specs[field])markProvenance(order,['inquirySpecs.'+field],'mailRecognition');}
 for(const item of order.items)for(const field of ['quantity','width','height','material','thickness']){delete item.provenance?.[field];if(item[field]!=null&&item[field]===detected.specs[field])markProvenance(item,[field],'mailRecognition');}
 delete order.provenance?.inquiryProduct;
 Object.assign(state,next);return result;
}
export const requestNumericFields=numeric;
