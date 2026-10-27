import {cleanRequestProducts} from './request-products.js';
import {normalizeInquiryMetadata,inquiryAttribution} from './inquiry-mail-metadata.js?v=inquiry-headers-20261023';
import {inquiryIdentity,customerEmailMatches} from './inquiry-customer.js';
import {websiteLeadId} from './site-conversion.js';
import {markProvenance} from './provenance.js?v=provenance-colors-20261027';
import {mailHtmlText,decodeMailEntities,decodeMailHeader} from './mail-content.js?v=form-intake-20261026';
import {inquiryQuantity,inquiryColor} from './inquiry-quantity.js?v=inquiry-form-20261021';
import {companyFor,orderStagesFor} from './companies.js';
import {emailAddresses,saveInboxThread,conversationSignature,gmailConversationKey} from './mail-inbox.js?v=crm-code-review-20261027';
import {ensureCustomerNumbers} from '../admin/customer-numbers.js';
import {validateBusinessState} from './state-validation.js?v=ui-batch234-20261027';
export const specLabels={quantity:'Aantal stuks',material:'Materiaal',shape:'Vorm',width:'Breedte (mm)',height:'Hoogte (mm)',diameter:'Buitendiameter (mm)',holeDiameter:'Gatdiameter (mm)',thickness:'Dikte (mm)',color:'Kleur',printing:'Bedrukking / drukkleuren',design:'Ontwerp / tekening'};
const numbers=new Set(['quantity','width','height','diameter','holeDiameter','thickness']),texts=new Set(Object.keys(specLabels).filter(k=>!numbers.has(k)));
export function cleanInquirySpecs(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!Object.hasOwn(specLabels,k)))throw Error('Ongeldige aanvraaggegevens.');const result={};for(const [key,value] of Object.entries(input)){if(value==null||value===''){result[key]=null;continue;}if(numbers.has(key)){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1000000||(key==='quantity'&&(!Number.isInteger(value)||value<1))||(key!=='holeDiameter'&&value<=0))throw Error('Controleer '+specLabels[key]+'.');result[key]=value;}else if(texts.has(key)){if(typeof value!=='string'||value.length>200||/[\0\r\n]/.test(value))throw Error('Controleer '+specLabels[key]+'.');result[key]=value.trim()||null;}}return result;}
export function detectedSpecs(text,product=''){
 const source=String(text||'').slice(0,30000),number=(pattern)=>{const m=source.match(pattern);return m?Number(m[1].replace(',','.'))*(m[2]?.toLowerCase()==='cm'?10:1):null;},num='([0-9]+(?:[.,][0-9]+)?)',unit='\\s*(mm|cm)\\b';
 const quantity=inquiryQuantity(source).quantity;
 const material=source.match(/\b(PVC|HDPE|PE1000|PE500|POM|PTFE|PMMA|polycarbonaat|acrylaat|plexiglas|EPDM|SBR|NBR|ABS|HPL|PETG|PP)\b/i)?.[1]||null,color=source.match(/\b(zwart(?:e)?|wit(?:te)?|transparant(?:e)?|rood|rode|blauw(?:e)?|groen(?:e)?|grijs(?:e)?)\b/i)?.[1]||null,shape=/schijf|diameter|cirkel|rond/i.test(product+' '+source)?'round':null;
 const specs={quantity,material,color:color?inquiryColor(color):null,shape,diameter:number(new RegExp('(?:buitendiameter|diameter)\\s*:?\\s*'+num+unit,'i')),holeDiameter:number(new RegExp('(?:centraal gat|gatdiameter|gat)\\s*:?\\s*'+num+unit,'i')),thickness:number(new RegExp('dikte\\s*:?\\s*'+num+unit,'i')),width:number(new RegExp('breedte\\s*:?\\s*'+num+unit,'i')),height:number(new RegExp('(?:hoogte|lengte)\\s*:?\\s*'+num+unit,'i'))};
 specs.width??=number(new RegExp(num+unit+'\\s*(?:breed|breedte)\\b','i'));specs.height??=number(new RegExp(num+unit+'\\s*(?:hoog|hoogte|lang|lengte)\\b','i'));
 specs.thickness??=number(new RegExp(num+unit+'\\s*(?:dik|dikte)\\b','i'));
 const paired=source.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*(mm|cm)\s*(?:bij|x|×)\s*([0-9]+(?:[.,][0-9]+)?)\s*(mm|cm)\b/i);if(paired){specs.width??=Number(paired[1].replace(',','.'))*(paired[2].toLowerCase()==='cm'?10:1);specs.height??=Number(paired[3].replace(',','.'))*(paired[4].toLowerCase()==='cm'?10:1);specs.shape??='rectangle';}
 const dims=source.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*[x×]\s*([0-9]+(?:[.,][0-9]+)?)\s*(mm|cm)\b/i);if(dims){specs.width??=Number(dims[1].replace(',','.'))*(dims[3].toLowerCase()==='cm'?10:1);specs.height??=Number(dims[2].replace(',','.'))*(dims[3].toLowerCase()==='cm'?10:1);specs.shape??='rectangle';}if(/geen\s+(?:centraal\s+)?gat/i.test(source))specs.holeDiameter=0;if(specs.width!=null&&specs.height!=null)specs.shape??='rectangle';
 return cleanInquirySpecs(specs);
}
function formField(text,label,next){const match=String(text).match(new RegExp('(?:^|\\n|\\b)'+label+'\\s*:?\\s*([\\s\\S]*?)(?='+next+'|$)','i'));return match?.[1].replace(/^[\s:]+|[\s:]+$/g,'').trim().slice(0,200)||'';}
export function inquiryRule(companyId){companyFor(companyId);return companyId==='maatwerkkunststof'?{sender:'aanvragen@tjworx.nl',subjectPrefix:'Nieuwe offerteaanvraag:',subjectPrefixes:['Nieuwe offerteaanvraag:','Nieuw contactbericht'],website:'maatwerkkunststof.nl'}:{sender:'noreply@spatlappenopmaat.nl',subjectPrefix:'Nieuwe aanvraag spatlappen',website:'spatlappenopmaat.nl',deliveredTo:'spatlappenopmaat@gmail.com'};}
// A candidate can be shown for manual review; it grants no automatic intake.
export function isFormInquiryCandidate(message,companyId,rule=inquiryRule(companyId)){
 companyFor(companyId);return !!rule.sender&&emailAddresses(message.from).length===1&&emailAddresses(message.from)[0]===rule.sender.toLowerCase()&&(rule.subjectPrefixes||[rule.subjectPrefix]).some(prefix=>decodeMailHeader(message.subject).trim().toLowerCase().startsWith(prefix.toLowerCase()));
}
export function isFormInquiry(message,companyId,rule=inquiryRule(companyId)){
 const profile=companyFor(companyId);return isFormInquiryCandidate(message,companyId,rule)&&emailAddresses(message.to).some(a=>a.endsWith('@'+profile.website.toLowerCase())||a===rule.deliveredTo);
}
export function inquiryText(message){
 let source=String(String(message.text||'').trim()?message.text:message.html||'').slice(0,300000);
 // Some form senders serialize line breaks into the plain MIME part.
 const escapedFields=[...source.matchAll(/\\(?:r\\n|n|r)[ \t]*(?:Naam|E-mail|Telefoon|Bericht)\s*:/gi)].length;
 // Old form MIME can mix real wrapping with serialized field separators.
 // Require multiple explicit field boundaries before decoding mixed text.
 if((!/[\r\n]/.test(source)&&escapedFields>0)||escapedFields>=2)source=source.replace(/\\r\\n|\\n|\\r/g,'\n');
 if(/<(?:table|tr|td|p|div|br)\b/i.test(source))source=mailHtmlText(source);else source=decodeMailEntities(source);
 return source.slice(0,30000);
}
export function inquiryAutomationReason(state,message,companyId){
 if(!isFormInquiry(message,companyId))return isFormInquiryCandidate(message,companyId)?'Formulierafzender en onderwerp herkend, maar het ontvangstadres past niet bij de ingestelde formulierroute. Controleer Aan in Gmail en verwerk de aanvraag voorlopig via Aanvraag herkennen; automatische verwerking blijft geblokkeerd.':'Dit bericht is geen herkend formulier voor dit bedrijf.';
 const config=state.inquiryAutomation;
 if(!config?.enabled||config.companyId!==companyId)return 'Automatische aanvraagverwerking staat uit.';
 const key=JSON.stringify([companyId,message.mailbox,message.gmailId]);
 if(state.inquirySources?.some(s=>s.key===key))return 'Deze formulieraanvraag is al verwerkt.';
 if(!Number.isFinite(Date.parse(config.enabledAt))||!Number.isFinite(Date.parse(message.receivedAt)))return 'De ontvangstdatum of startdatum kan niet worden gecontroleerd.';
 if(Date.parse(message.receivedAt)<Date.parse(config.enabledAt))return 'Ontvangen vóór het inschakelen. Gebruik de knop om deze aanvraag gecontroleerd aan te maken.';
 if(!message.formSenderVerified)return 'De afzender is niet door Gmail als geldig ondertekend bevestigd. Controleer deze aanvraag via de knop.';
 const parsed=parseFormInquiry(message,companyId);
 if(parsed.metadataProblem)return 'De technische aanvraaggegevens zijn ongeldig of spreken de oude tekst tegen. Controleer eerst het oorspronkelijke formulierbericht; er is geen aanvraagnummer gegokt.';
 if(parsed.needsReview)return 'Klantgegevens of productgegevens vragen controle. Open de aanvraag via de knop.';
 return '';
}
// Source page is metadata, never an arbitrary link supplied by a sender.
export function inquirySourcePage(value,companyId){
 const raw=String(value||'').trim();if(!raw||raw.length>500||/[\s\\\0-\x1f\x7f]/.test(raw))return '';
 try{const host=companyFor(companyId).website.toLowerCase(),url=new URL(raw,'https://'+host);if(url.protocol!=='https:'||url.hostname.toLowerCase()!==host||url.port||url.username||url.password||(!raw.startsWith('/')&&!/^https:\/\//i.test(raw)))return '';return url.pathname+url.search;}catch{return '';}
}
export function parseFormInquiry(message,companyId){
 companyFor(companyId);const recognized=isFormInquiry(message,companyId);let metadata=null,metadataProblem=false;
 if(recognized&&message.formSenderVerified&&message.formMetadata)try{metadata=normalizeInquiryMetadata(message.formMetadata);}catch{metadataProblem=true;}
 const text=inquiryText(message),next='Contactpersoon|Bedrijfsnaam|Bedrijf\\s*:|E-mail|Telefoon|Product|Aantal|Pagina|Bijlagen?|Specificaties|Bericht|Campagnegegevens|UTM-bron|Verzonden via';
 const email=formField(text,'E-mail',next),customerEmails=emailAddresses(email),reply=emailAddresses(message.replyTo),name=formField(text,'Naam',next),business=formField(text,'(?:Bedrijfsnaam|Bedrijf(?=\\s*:))','Naam|'+next),product=formField(text,'Product',next),phone=formField(text,'Telefoon',next);
 const legacyLead=recognized?websiteLeadId(text):'',leadConflict=!!(metadata&&legacyLead&&metadata.leadId!==legacyLead);
 const quantity=inquiryQuantity(text),ambiguousSpecs=quantity.ambiguous||new Set([...text.matchAll(/\b(PVC|HDPE|PE1000|PE500|POM|PTFE|PMMA|polycarbonaat|acrylaat|plexiglas|EPDM|SBR|NBR|ABS|HPL|PETG|PP)\b/gi)].map(m=>m[1].toLowerCase())).size>1;
 const address=customerEmails.length===1?customerEmails[0]:reply.length===1?reply[0]:'',conflict=customerEmails.length===1&&reply.length===1&&customerEmails[0]!==reply[0],specs=detectedSpecs(text,product);
 // Never mix dimensions/material from several possible products into one row.
 if(ambiguousSpecs)for(const key of Object.keys(specs))specs[key]=null;
 return {companyId,websiteLeadId:recognized&&!metadataProblem&&!leadConflict?(metadata?.leadId||legacyLead):'',websiteAttribution:metadata&&!metadataProblem&&!leadConflict?inquiryAttribution(metadata):null,analyticsInternal:recognized&&(metadata?metadata.internal:/(?:^|\n)\s*Interne test:\s*ja\s*(?=\n|$)/i.test(text.replace(/\\n/g,'\n'))),source:{mailbox:message.mailbox,gmailId:message.gmailId,threadId:message.threadId},customer:{company:business||name,email:address,phone,contact:formField(text,'Contactpersoon',next)||name},product:product||companyFor(companyId).defaultProduct||'Aanvraag op maat',page:inquirySourcePage(formField(text,'Pagina',next),companyId),specs,needsReview:!(business||name)||!address||conflict||ambiguousSpecs||metadataProblem||leadConflict||message.truncated===true,metadataProblem:metadataProblem||leadConflict,conflict,ambiguousSpecs,originalText:text};
}
// Physical specifications belong to each product, never to its neighbours.
// This read-only projection retains the original request without copying it
// into multiple product rows. Spatlappen keeps its existing owned fields.
export function inquiryProductKeys(companyId){return companyId==='maatwerkkunststof'?['quantity','width','height','material','thickness','shape','diameter','holeDiameter']:['quantity','width','height','printing'];}
function productRequirements(order,companyId){
 const explicit=cleanInquirySpecs(order.inquirySpecs||{}),owned=inquiryProductKeys(companyId);
 const common={...explicit};for(const key of owned)delete common[key];
 const products=order.items.map((item,index)=>({itemId:item.id,index,label:item.description||'Product '+(index+1),data:inquiryRequirements({items:[item],inquirySpecs:common,inquiryNotRequired:order.inquiryNotRequired},companyId)}));
 const values={...common},keys=[...new Set(products.flatMap(product=>product.data.fields.map(field=>field.key)))];
 for(const key of new Set([...Object.keys(common),...products.flatMap(product=>Object.keys(product.data.values))])){
  const first=products[0].data.values[key];
  if(first!=null&&first!==''&&products.every(product=>String(product.data.values[key])===String(first)))values[key]=first;
  else delete values[key];
 }
 const fields=keys.map(key=>{
  const rows=products.map(product=>{const field=product.data.fields.find(field=>field.key===key);return {itemId:product.itemId,label:product.label,value:field?.value??null,complete:field?.complete??true,conflict:!!field?.conflict,notRequired:field?.notRequired??true};});
  const relevant=rows.filter(row=>!row.notRequired),complete=rows.every(row=>row.complete),notRequired=!relevant.length,known=relevant.filter(row=>row.complete).length;
  const displayValue=notRequired?'':complete?(values[key]!=null?String(values[key]):'Ingevuld per product'):known+' van '+relevant.length+' producten ingevuld';
  return {key,label:specLabels[key],value:values[key]??null,displayValue,complete,notRequired,conflict:rows.some(row=>row.conflict),multiple:true,products:rows};
 });
 return {values,fields,missing:fields.filter(field=>!field.complete).map(field=>field.key),shape:products[0].data.shape,products};
}
export function inquiryRequirements(order,companyId){companyFor(companyId);if((order.items||[]).length>1)return productRequirements(order,companyId);const explicit=cleanInquirySpecs(order.inquirySpecs||{}),items=order.items||[],item=items.length===1?items[0]:null,values={...explicit},conflicts=new Set();if(item){for(const key of ['quantity','width','height','material',...(companyId==='maatwerkkunststof'?['thickness','diameter','holeDiameter']:[])]){if(item[key]!=null&&item[key]!==''&&(!['thickness','diameter'].includes(key)||item[key]>0)){if(values[key]!=null&&String(values[key])!==String(item[key]))conflicts.add(key);values[key]??=item[key];}}if(companyId==='maatwerkkunststof'&&item.shape)values.shape??=item.shape;if(item.printColors!=null)values.printing??=String(item.printColors);}
 const shape=/^(circle|round|rond|cirkel|schijf|ring)$/i.test(values.shape||'')||values.diameter?'round':'rectangle',required=['quantity',...(companyId==='maatwerkkunststof'?['material']:[]),...(shape==='round'?['diameter']:['width','height']),...(companyId==='maatwerkkunststof'?['thickness']:['printing']),...(shape==='round'?['holeDiameter']:[])];
 const ignored=new Set(order.inquiryNotRequired||[]);return {values,fields:required.map(key=>({key,label:specLabels[key],value:values[key]??null,conflict:conflicts.has(key),notRequired:ignored.has(key),complete:ignored.has(key)||(!conflicts.has(key)&&values[key]!=null&&values[key]!==''),multiple:items.length>1})),missing:required.filter(key=>!ignored.has(key)&&(conflicts.has(key)||values[key]==null||values[key]==='')),shape};}

export function inquiryMailText(order,customer,companyId,kind){const company=companyFor(companyId),contact=(customer.contacts||[]).find(person=>person.id===order.contactId),greeting='Beste '+(contact?.name||customer.contact||customer.company||'klant')+',\n\n';if(kind==='ack')return greeting+'Bedankt voor je aanvraag. We hebben deze goed ontvangen en nemen zo snel mogelijk contact met je op.\n\nMet vriendelijke groet,\n'+company.name;const data=inquiryRequirements(order,companyId);if(!data.missing.length)throw Error('Er ontbreken geen verplichte aanvraaggegevens.');return greeting+'Bedankt voor je aanvraag. Om een passende offerte te maken ontvangen we graag nog:\n\n'+data.fields.filter(f=>!f.complete).flatMap(f=>f.products?f.products.filter(product=>!product.complete).map(product=>'• '+f.label+' — '+product.label):['• '+f.label]).join('\n')+'\n\nJe kunt op deze mail antwoorden. Een tekening of voorbeeld mag je ook meesturen.\n\nMet vriendelijke groet,\n'+company.name;}
export function createInquiry(state,thread,message,input,companyId,{automatic=false,uid=()=>crypto.randomUUID(),now=new Date().toISOString()}={}){
 companyFor(companyId);if(input.companyId!==companyId||!thread.messages.some(m=>m.gmailId===message.gmailId)||message.mailbox!==thread.mailbox||message.threadId!==thread.threadId)throw Error('Deze aanvraag hoort niet bij dit gesprek of bedrijf.');
 const parsed=parseFormInquiry(message,companyId);if(automatic&&(!isFormInquiry(message,companyId)||message.formSenderVerified!==true||parsed.needsReview))throw Error('Automatisch aanmaken vereist een geverifieerde formulierafzender en eenduidige klantgegevens.');
 if(!input.customer?.company?.trim()||emailAddresses(input.customer.email).length!==1||emailAddresses(input.customer.email)[0]!==input.customer.email.toLowerCase())throw Error('Vul een klantnaam en één geldig klantadres in.');const products=input.products==null||Array.isArray(input.products)&&!input.products.length?null:cleanRequestProducts(input.products,cleanInquirySpecs);if(products&&(automatic||products.some(p=>!p.specs.quantity)))throw Error('Controleer meerdere producten handmatig en vul per product het aantal in.');const specs=products?{}:cleanInquirySpecs(input.specs||{}),key=JSON.stringify([companyId,thread.mailbox,message.gmailId]),existing=(state.inquirySources||[]).find(s=>s.key===key);if(existing){if(!state.orders.some(o=>o.id===existing.orderId))throw Error('Deze aanvraag is eerder verwerkt; de order is verwijderd.');return {orderId:existing.orderId,reused:true};}
 const linked=(state.mailThreads||[]).find(t=>t.mailbox===thread.mailbox&&t.gmailThreadId===thread.threadId);if(linked?.orderId)throw Error('Dit gesprek heeft al een order. Open die order en voeg de nieuwe informatie daar na controle toe.');
 const matches=state.customers.filter(c=>customerEmailMatches(c,input.customer.email));let matched=matches.length===1?matches[0]:matches.find(c=>c.id===linked?.customerId);if(matches.length>1&&!matched)throw Error('Dit mailadres hoort bij meerdere klanten. Koppel dit gesprek eerst bewust aan het juiste klantdossier en maak daarna de aanvraag aan.');if(matched?.archived)throw Error('Deze klant is gearchiveerd. Controleer en herstel eerst het juiste klantdossier.');
 const inputContact=String(Object.hasOwn(input.customer,'contact')?input.customer.contact||'':parsed.customer.contact||'').trim().slice(0,200);const next=structuredClone(state);let customer=next.customers.find(c=>c.id===matched?.id);if(!customer){customer={id:uid(),company:input.customer.company.trim().slice(0,200),email:input.customer.email.toLowerCase(),phone:String(input.customer.phone||'').slice(0,100),contact:inputContact,country:'',notes:'',archived:false};for(const field of ['company','email','phone','contact'])if(customer[field]===parsed.customer[field])markProvenance(customer,[field],'form',{at:now});next.customers.push(customer);}
 const order={id:uid(),number:Math.max(3000,...next.orders.map(o=>Number(o.number)||0))+1,customerId:customer.id,date:now.slice(0,10),stage:orderStagesFor(companyId)[0],archived:false,vat:21,shippingKnown:false,shippingCharge:0,packagePrice:null,shippingActual:null,shippingExpected:null,extraCosts:null,items:[],notes:'',inquiryDraft:true,inquiryNew:true,inquiryName:input.customer.company.trim().slice(0,200),inquirySourceSubject:String(message.subject||'').slice(0,200),inquiryProduct:String(input.product||'Aanvraag op maat').slice(0,200),inquirySpecs:specs};
 order.inquiryCustomer=inquiryIdentity({...input.customer,contact:inputContact});
 if(matched)order.inquiryMatchedCustomerId=matched.id;
 const knownContacts=(customer.contacts||[]).filter(person=>[inputContact,input.customer.company].some(name=>String(name||'').trim().toLowerCase()===person.name.trim().toLowerCase())&&person.email.toLowerCase()===input.customer.email.toLowerCase());
 if(knownContacts.length===1)order.contactId=knownContacts[0].id;
 if(isFormInquiry(message,companyId)&&parsed.page)order.inquirySourcePage=parsed.page;
 if(parsed.websiteLeadId)order.websiteLeadId=parsed.websiteLeadId;
 if(parsed.analyticsInternal)order.analyticsInternal=true;
 if(parsed.websiteAttribution)order.websiteAttribution=structuredClone(parsed.websiteAttribution);
 for(const product of products||[{product:order.inquiryProduct,specs}]){const values=product.specs;if(values.quantity)order.items.push({id:uid(),description:product.product,quantity:values.quantity,width:values.width??null,height:values.height??null,...(companyId==='maatwerkkunststof'?{material:values.material??'',thickness:values.thickness??null,shape:values.shape||'',diameter:values.diameter??null,holeDiameter:values.holeDiameter??null}:{}),price:null,cost:null,printColors:companyId==='spatlappen'&&/^\d{1,2}$/.test(values.printing||'')?Number(values.printing):null,specs:[values.material,values.color,values.diameter?'Diameter '+values.diameter+' mm':'',values.thickness?'Dikte '+values.thickness+' mm':'',values.printing?'Bedrukking: '+values.printing:'',values.design?'Ontwerp: '+values.design:''].filter(Boolean).join(' · '),productionSource:'supplier'});}
 for(const field of Object.keys(specs))if(specs[field]===parsed.specs[field])markProvenance(order,['inquirySpecs.'+field],'form',{at:now});for(const item of order.items){for(const field of ['quantity','width','height','material','thickness'])if(item[field]!=null&&item[field]!==''&&item[field]===parsed.specs[field])markProvenance(item,[field],'form',{at:now});}if(order.inquiryProduct===parsed.product)markProvenance(order,['inquiryProduct'],'form',{at:now});markProvenance(order,['vat','stage'],'default',{at:now});next.orders.push(order);saveInboxThread(next,thread,{customerId:customer.id,orderId:order.id,uid,expected:conversationSignature(next,thread.mailbox,thread.threadId),allowMove:false,now});next.inquirySources??=[];next.inquirySources.push({key,orderId:order.id,createdAt:now});next.activities.unshift({id:uid(),message:'Nieuwe offerteaanvraag: '+order.inquiryProduct,time:now});ensureCustomerNumbers(next);validateBusinessState(next);Object.assign(state,next);return {orderId:order.id,customerId:customer.id,reused:false};
}
export function prepareSpecsProposal(snapshot,input,companyId,{now=Date.now(),uuid=()=>crypto.randomUUID()}={}){companyFor(companyId);const order=snapshot.orders.find(o=>o.id===input.orderId);if(snapshot.companyId!==companyId||!order||Object.keys(input).some(k=>!['orderId','fields','evidence'].includes(k))||typeof input.evidence!=='string'||input.evidence.length>2000)throw Error('Ongeldig voorstel voor aanvraaggegevens.');return {format:'crm-inquiry-specs',id:uuid(),companyId,orderId:order.id,fields:cleanInquirySpecs(input.fields),evidence:input.evidence,baseline:JSON.stringify(order),expiresAt:now+30*60000};}
export function reviewSpecsProposal(snapshot,proposal,companyId,{now=Date.now()}={}){if(proposal?.format!=='crm-inquiry-specs'||proposal.companyId!==companyId||!Number.isFinite(proposal.expiresAt)||proposal.expiresAt<now)throw Error('Dit gegevensvoorstel is verlopen of hoort bij een ander bedrijf.');const checked=prepareSpecsProposal(snapshot,{orderId:proposal.orderId,fields:proposal.fields,evidence:proposal.evidence},companyId,{now,uuid:()=>proposal.id});if(checked.baseline!==proposal.baseline)throw Error('Deze order is ondertussen gewijzigd. Vraag een nieuwe analyse.');return checked;}
// Reconstruct only where a preserved source proves the same current value; never label by guess.
export function inquiryWithSources(state,order,companyId){const result=structuredClone(order);const source=(state.inquirySources||[]).find(s=>s.orderId===order.id),message=source&&(state.incomingEmails||[]).find(m=>source.key===JSON.stringify([companyId,m.mailbox,m.gmailId]));if(!message||!isFormInquiry(message,companyId))return result;const parsed=parseFormInquiry(message,companyId);if(!result.inquirySourcePage&&parsed.page)result.inquirySourcePage=parsed.page;for(const [key,value] of Object.entries(parsed.specs)){if(value!=null&&result.inquirySpecs?.[key]===value&&!result.provenance?.['inquirySpecs.'+key])markProvenance(result,['inquirySpecs.'+key],'formMatch',{at:message.receivedAt});for(const item of result.items||[])if(['quantity','width','height','material','thickness'].includes(key)&&result.items.length===1&&item[key]===value&&!item.provenance?.[key])markProvenance(item,[key],'formMatch',{at:message.receivedAt});}return result;}
export function customerWithSources(state,customer,companyId){const result=structuredClone(customer);for(const source of state.inquirySources||[]){if(!state.orders.some(o=>o.id===source.orderId&&o.customerId===customer.id))continue;const message=(state.incomingEmails||[]).find(m=>source.key===JSON.stringify([companyId,m.mailbox,m.gmailId]));if(!message||!isFormInquiry(message,companyId))continue;const parsed=parseFormInquiry(message,companyId);for(const key of ['company','contact','email','phone'])if(result[key]&&result[key]===parsed.customer[key]&&!result.provenance?.[key])markProvenance(result,[key],'formMatch',{at:message.receivedAt});}return result;}
