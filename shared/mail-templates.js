import {formProblem} from '../admin/form-guidance.js?v=crm-code-review-20261027';
import {documentMail} from './mail-workflow.js';
export const templateKinds={general:'Algemeen bericht',invoice:'Factuur', 'invoice-paid':'Betaalde factuur',confirmation:'Orderbevestiging',quote:'Offerte',proforma:'Proforma',packing:'Pakbon',question:'Gegevens opvragen'};
export const variableLabels={contact:'Contactpersoon',klant:'Klant / bedrijf',bedrijf:'Je eigen bedrijf',website:'Je website',order:'Ordernummer',document:'Documentnummer',documenttype:'Documenttype',handtekening:'Handtekening',betaallink:'Betaallink',betaalbedrag:'Bedrag betaallink',geldig_tot:'Geldigheid betaallink'};
export function builtinMailTemplates(){
 const greeting='Beste {{contact}},\n\n',ending='\n\nHeb je vragen? Laat het gerust weten.\n\n{{handtekening}}';
 const invoiceBody=paid=>'Beste relatie,\n\nNogmaals bedankt voor je bestelling!\n'+(paid?'We hebben je betaling in goede orde ontvangen.\n':'')+'In de bijlage vind je factuur {{document}} voor je administratie.\n\nMocht je nog vragen hebben, dan hoor ik het graag!\n\n{{handtekening}}';
 const confirmationBody=deposit=>greeting+'Nogmaals bedankt voor je aanvraag.\nIn de bijlage vind je de orderbevestiging {{document}} voor je bestelling.\n\n'+(deposit?'Je kunt de aanbetaling van 70% ({{betaalbedrag}}) eenvoudig voldoen via onze zakelijke Tikkie-link:':'Je kunt het volledige bedrag van {{betaalbedrag}} eenvoudig voldoen via onze zakelijke Tikkie-link:')+'\n{{betaallink}}\n\nOf rechtstreeks overmaken naar:\nIBAN: NL55 ABNA 0136 1165 66\nT.n.v.: TJ Worx\nBetalingskenmerk: {{order}}\n\n'+(deposit?'Zodra we de aanbetaling hebben ontvangen, kunnen we de bestelling in gang zetten.':'Zodra we de betaling hebben ontvangen, kunnen we de bestelling in gang zetten.')+'\nOp alle bestellingen en leveringen zijn onze algemene voorwaarden van toepassing.\n\nMocht je nog vragen hebben, dan hoor ik het graag!\n\n{{handtekening}}';
 const docs=[['invoice','Factuur'],['confirmation','Orderbevestiging'],['quote','Offerte'],['proforma','Proforma factuur'],['packing','Pakbon']].flatMap(([kind,title])=>{
  const standard={id:'standard-'+kind,name:title,kind,subject:title+' {{document}} · {{website}}',body:kind==='invoice'?invoiceBody(false):greeting+'Bijgevoegd vind je de '+title.toLowerCase()+' {{document}} voor je bestelling.'+ending};
  if(kind!=='confirmation')return [standard];
  return [{...standard,name:'Orderbevestiging · volledige betaling',body:confirmationBody(false)},
   {...standard,id:'standard-confirmation-deposit-70',name:'Orderbevestiging · aanbetaling 70%',body:confirmationBody(true)},
   {...standard,id:'standard-confirmation-other',name:'Orderbevestiging · andere betaalafspraak'}];
 });
 return [...docs,{id:'standard-ack',name:'Aanvraag ontvangen',kind:'general',subject:'Je aanvraag is ontvangen · {{website}}',body:greeting+'Bedankt voor je aanvraag. We hebben deze goed ontvangen en nemen zo snel mogelijk contact met je op.\n\n{{handtekening}}'},{id:'sales-indication',name:'Prijsindicatie',kind:'general',subject:'Prijsindicatie · {{order}} · {{website}}',body:greeting+'Op basis van de besproken gegevens sturen we je graag een eerste prijsindicatie.\n\n[Prijs en uitgangspunten invullen]\n\nDit is een indicatie. Na controle van de definitieve specificaties kunnen we een offerte opstellen.\n\n{{handtekening}}'},{id:'sales-followup',name:'Opvolging aanvraag / prijs',kind:'general',subject:'Even terugkomen op je aanvraag · {{order}}',body:greeting+'We komen graag even terug op ons eerdere bericht over je aanvraag. Heb je dit kunnen bekijken? Laat gerust weten of je nog vragen hebt of iets wilt aanpassen.\n\n{{handtekening}}'},{id:'standard-invoice-paid',name:'Factuur na betaling',kind:'invoice-paid',subject:'Factuur {{document}} · {{website}}',body:invoiceBody(true)},
 {id:'standard-general',name:'Algemeen bericht',kind:'general',subject:'Je aanvraag · {{website}}',body:greeting+'Bedankt voor je aanvraag.\n\n{{handtekening}}'},
 {id:'request-quantity',name:'Aantal ontbreekt',kind:'question',subject:'Welk aantal heb je nodig? · {{website}}',body:greeting+'Om je aanvraag verder uit te werken, ontvangen we graag nog het gewenste aantal stuks. Kun je aangeven hoeveel je nodig hebt?\n\n{{handtekening}}'},
 {id:'request-material',name:'Materiaal ontbreekt',kind:'question',subject:'Welk materiaal heb je nodig? · {{website}}',body:greeting+'Kun je aangeven welk type materiaal je wilt en, indien van toepassing, de gewenste dikte en kleur? Twijfel je over het materiaal? Vertel gerust waarvoor je het wilt gebruiken, dan denken we mee.\n\n{{handtekening}}'},
 {id:'request-dimensions',name:'Afmetingen ontbreken',kind:'question',subject:'Afmetingen voor je aanvraag · {{website}}',body:greeting+'We ontvangen graag nog de gewenste breedte en hoogte in millimeters. Heb je een tekening of voorbeeld? Stuur die dan gerust mee.\n\n{{handtekening}}'},
 {id:'request-design',name:'Ontwerp / logo opvragen',kind:'question',subject:'Ontwerp of logo aanleveren · {{website}}',body:greeting+'Kun je het ontwerp of logo voor je bestelling aanleveren? Een vectorbestand (bijvoorbeeld PDF of SVG) heeft onze voorkeur. Heb je alleen een afbeelding? Stuur die dan gerust mee, dan bekijken we de mogelijkheden.\n\n{{handtekening}}'}];
}
export function mailTemplates(state,companyId){const saved=state.mailTemplates||[];return [...builtinMailTemplates().map(t=>({...t,...saved.find(s=>s.id===t.id),builtin:true})),...saved.filter(s=>!builtinMailTemplates().some(t=>t.id===s.id)).map(t=>({...t,builtin:false}))].filter(t=>companyId!=='maatwerkkunststof'||t.id!=='request-design');}
export const templateNameKey=name=>String(name||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('nl-NL');
export const templatesNamed=(state,name)=>mailTemplates(state).filter(t=>templateNameKey(t.name)===templateNameKey(name));
export function templateOptionLabel(state,template){const duplicates=templatesNamed(state,template.name).length>1;return template.name+(duplicates?' · '+(template.builtin?'standaard':'eigen')+(template.builtin?'':' · '+template.subject.slice(0,55)):'');}
export function templateVariables(template){const names=new Set();for(const text of [template.subject,template.body])for(const match of String(text||'').matchAll(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]{0,39})\s*\}\}/g))names.add(match[1]);return [...names];}
export function validateMailTemplate(input){
 for(const [field,max] of [['name',100],['subject',200],['body',30000]])if(typeof input[field]!=='string'||!input[field].trim()||input[field].length>max||input[field].includes('\0')||field!=='body'&&/[\r\n]/.test(input[field]))throw formProblem('Controleer '+({name:'de templatenaam',subject:'het onderwerp',body:'de berichttekst'}[field])+'.',{field});
 if(!Object.hasOwn(templateKinds,input.kind))throw formProblem('Kies een type template.',{field:'kind'});
 if(!/^[a-zA-Z0-9._-]{1,160}$/.test(input.id))throw Error('Template-ID ontbreekt.');
 for(const text of [input.subject,input.body])if(String(text).replace(/\{\{\s*[a-zA-Z][a-zA-Z0-9_]{0,39}\s*\}\}/g,'').includes('{{')||String(text).replace(/\{\{\s*[a-zA-Z][a-zA-Z0-9_]{0,39}\s*\}\}/g,'').includes('}}'))throw formProblem('Gebruik variabelen zoals {{contact}} of {{materiaal}}.',{field:'body'});
 return {id:input.id,name:input.name.trim(),kind:input.kind,subject:input.subject.trim(),body:input.body.trim()};
}
export function saveMailTemplate(state,input,expected=null){const data=validateMailTemplate(input),current=(state.mailTemplates||[]).find(t=>t.id===data.id)||null;if(JSON.stringify(current)!==JSON.stringify(expected))throw Error('Deze template is in een ander tabblad gewijzigd. Open hem opnieuw.');if(templatesNamed(state,data.name).some(t=>t.id!==data.id))throw formProblem('Template bestaat al. Kies een andere naam of vervang bewust de bestaande template.',{field:'name'});state.mailTemplates??=[];if(state.mailTemplates.length>=100&&!current)throw Error('Je kunt maximaal 100 eigen of aangepaste templates bewaren.');const index=state.mailTemplates.findIndex(t=>t.id===data.id);if(index<0)state.mailTemplates.push(data);else state.mailTemplates[index]=data;return data;}
export function replaceNamedMailTemplates(state,input,{targetId,expectedNamed,expectedSource=null}){
 const data=validateMailTemplate(input),named=templatesNamed(state,data.name),target=named.find(t=>t.id===targetId),source=(state.mailTemplates||[]).find(t=>t.id===data.id)||null;
 const signature=list=>JSON.stringify([...list].sort((a,b)=>a.id.localeCompare(b.id)));
 if(!target||!Array.isArray(expectedNamed)||signature(named)!==signature(expectedNamed)||JSON.stringify(source)!==JSON.stringify(expectedSource))throw Error('Deze templates zijn ondertussen gewijzigd. Controleer de naam opnieuw.');
 if(named.filter(t=>t.builtin).some(t=>t.id!==targetId)||builtinMailTemplates().some(t=>t.id===data.id)&&data.id!==targetId)throw formProblem('Vaste templates kunnen niet worden samengevoegd. Kies een andere naam voor deze template.',{field:'name'});
 const remove=new Set([...named.map(t=>t.id),data.id]),saved=(state.mailTemplates||[]).filter(t=>!remove.has(t.id));
 if(saved.length>=100)throw Error('Je kunt maximaal 100 eigen of aangepaste templates bewaren.');
 const replacement={...data,id:target.id,...(target.builtin?{kind:target.kind}:{})};saved.push(replacement);state.mailTemplates=saved;return replacement;
}
export function templateContext({customer,order,document,link,company,signature='',euro=String}){return {contact:customer?.contact||customer?.company||'',klant:customer?.company||'',bedrijf:company.name,website:company.website,order:order?String(order.sourceNumber||order.number):'',document:document?.generated?.number|| (order?'#'+(order.sourceNumber||order.number):''),documenttype:({invoice:'factuur',confirmation:'orderbevestiging',quote:'offerte',proforma:'proforma factuur',packing:'pakbon'})[document?.generated?.kind||document?.category]||'',handtekening:signature||'Met vriendelijke groet,\n'+company.name+'\n'+company.website,betaallink:link?.url||'',betaalbedrag:link?euro(link.amountInCents):'',geldig_tot:link?.expiryDate||''};}
export function fillMailTemplate(template,context){
 const missing=templateVariables(template).filter(key=>!Object.hasOwn(context,key)||String(context[key]??'').trim()==='');
 const replace=text=>String(text).replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]{0,39})\s*\}\}/g,(whole,key)=>Object.hasOwn(context,key)&&String(context[key]??'').trim()?String(context[key]):whole);
 return {subject:replace(template.subject),body:replace(template.body),missing};
}
function confirmationTemplateKey(link,document){
 // A percent in the text must agree with the chosen request's recorded basis.
 // Older links without that metadata keep the neutral payment wording.
 if(!link)return 'confirmation';
 if(link.documentId&&document?.id&&link.documentId!==document.id)return 'confirmation-other';
 const basis=link.basisTotal,amount=link.amountInCents;
 if(!Number.isSafeInteger(basis)||basis<=0||!Number.isSafeInteger(amount)||amount<=0)return 'confirmation-other';
 if(amount===basis)return 'confirmation';
 if(amount===Math.round(basis*.7))return 'confirmation-deposit-70';
 return 'confirmation-other';
}
export function standardTemplateMail(state,input){
 const base=input.order?documentMail({...input,companyWebsite:input.company.website}):{to:input.customer?.email||input.customer?.invoiceEmail||'',subject:'Je aanvraag · '+input.company.website,body:''};
 const kind=input.document?.generated?.kind||input.document?.category||'general',key=kind==='invoice'&&input.paid?'invoice-paid':kind==='confirmation'?confirmationTemplateKey(input.link,input.document):kind,template=mailTemplates(state,input.company.id).find(t=>t.id==='standard-'+key)||mailTemplates(state,input.company.id).find(t=>t.id==='standard-general');let selected={...template};
 if(input.link&&key!=='invoice-paid'&&!templateVariables(selected).includes('betaallink')){const block='Je kunt {{betaalbedrag}} betalen via deze Tikkie:\n{{betaallink}}\nDe betaallink is geldig tot {{geldig_tot}}.';selected.body=selected.body.includes('{{handtekening}}')?selected.body.replace('{{handtekening}}',block+'\n\n{{handtekening}}'):selected.body+'\n\n'+block;}
 return {...base,...fillMailTemplate(selected,templateContext(input)),templateId:template.id};
}
export function checkMailText(subject,body){if(/\{\{|\}\}/.test(subject))throw formProblem('Vul de overgebleven templatevariabelen in het onderwerp in.',{field:'subject'});if(/\{\{|\}\}/.test(body))throw formProblem('Vul de overgebleven templatevariabelen in het bericht in.',{field:'body'});if(!subject.trim()||subject.length>200||/[\r\n\0]/.test(subject))throw formProblem('Gebruik een onderwerp van maximaal 200 tekens op één regel.',{field:'subject'});if(!body.trim()||body.length>30000||body.includes('\0'))throw formProblem('Gebruik een bericht van maximaal 30.000 tekens.',{field:'body'});}
