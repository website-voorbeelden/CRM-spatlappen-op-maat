import {packsPlanningMode} from './packs-preparation.js?v=packs-worker-v3-20261102';
// Read-only comparison format. An export/import never confirms a user review,
// proves a complete deployment, changes CRM data or grants booking permission.
export const packsControlVersion='packs-final-review-20261031';
export const packsControlMaxBytes=128000;
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const string=(value,max)=>typeof value==='string'&&value.length<=max&&!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value);
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const fail=()=>{throw Error('Dit is geen geldig PACKS-controlerapport voor Maatwerkkunststof. Er wordt niets overgenomen.');};
const fixedKeys=['orderBasisHash','recipient','address','country','phone','email','fulfilmentMethod','orderedOn','orderCurrent','preparationPresent','preparationCurrent','planningMode','plannedLoadDate','plannedDeliveryDate','readyOn','loadDate','deliveryDate','instructions','packagesConfirmed','addressesConfirmed','readyConfirmed'];
const addressKeys=['name','nameTo','street','number','numberExt','zip','place','country','phone','mail'];
const addressTitles={name:'Naam',nameTo:'Ter attentie van',street:'Straat',number:'Huisnummer',numberExt:'Toevoeging',zip:'Postcode',place:'Plaats',country:'Land',phone:'Telefoon',mail:'E-mail'};
const addressGroups={deliveryAddress:'Afleveradres',loadAddress:'Afhaaladres',returnAddress:'Transportretouradres'};
const factKey=key=>fixedKeys.includes(key)||/^items\.(?:[0-9]|[12][0-9]|3[0-9])\.(?:description|quantity|material|thickness|width|height)$/.test(key)||/^packages\.(?:[0-9]|1[0-9])\.(?:lengthCm|widthCm|heightCm|weightKg)$/.test(key)||Object.keys(addressGroups).some(prefix=>addressKeys.some(field=>key===prefix+'.'+field));
export function packsControlFacts(info,basisHash){
 const data=info.data,preparation=info.workflow?.packsPreparation,facts=[];
 const add=(key,label,value)=>facts.push({key,label,value:value??null});
 for(const [key,label,value] of [
  ['orderBasisHash','Volledige orderbasis',basisHash],['recipient','Ontvanger',data.recipient],['address','Afleveradres bij order',data.address],['country','Land bij order',data.country],['phone','Telefoon bij order',data.phone],['email','Contactmail bij order',data.email],['fulfilmentMethod','Leverwijze',data.fulfilmentMethod],['orderedOn','Besteldatum',info.orderedOn],['orderCurrent','Bestelling past bij huidige order',info.current],['preparationPresent','Voorbereiding aanwezig',!!preparation]
 ])add(key,label,value);
 data.items.forEach((item,index)=>{for(const [key,label] of [['description','Omschrijving'],['quantity','Aantal'],['material','Materiaal'],['thickness','Dikte (mm)'],['width','Breedte (mm)'],['height','Hoogte (mm)']])add('items.'+index+'.'+key,'Product '+(index+1)+' · '+label,item[key]);});
 if(preparation){
  add('preparationCurrent','Voorbereiding past bij huidige bestelling',preparation.basis===info.basis&&preparation.reference===info.reference);
  add('planningMode','Planningskeuze',packsPlanningMode(preparation));
  const planning=info.label?.packsLabelBundle?.planning;add('plannedLoadDate','Door PACKS geplande afhaaldatum',planning?.loadDate??null);add('plannedDeliveryDate','Door PACKS geplande bezorgdatum',planning?.deliveryDate??null);
  for(const [key,label] of [['readyOn','Gereeddatum'],['loadDate','Gewenste afhaaldatum'],['deliveryDate','Gewenste bezorgdatum'],['instructions','Afleverinstructie'],['packagesConfirmed','Pakketcontrole aangevinkt'],['addressesConfirmed','Adrescontrole aangevinkt'],['readyConfirmed','Gereedheidscontrole aangevinkt']])add(key,label,preparation[key]);
  for(const [prefix,title] of Object.entries(addressGroups))for(const key of addressKeys)add(prefix+'.'+key,title+' · '+addressTitles[key],preparation[prefix][key]);
  preparation.packages.forEach((parcel,index)=>{for(const [key,label] of [['lengthCm','Lengte (cm)'],['widthCm','Breedte (cm)'],['heightCm','Hoogte (cm)'],['weightKg','Gewicht incl. verpakking (kg)']])add('packages.'+index+'.'+key,'Pakket '+(index+1)+' · '+label,parcel[key]);});
 }
 return facts;
}
export function validatePacksControlReport(report){
 const keys=['schemaVersion','kind','companyId','createdAt','controlVersion','environment','orderId','orderNumber','supplierReference','facts','files','automaticBooking','userReviewConfirmed'];
 if(!object(report)||Object.keys(report).some(key=>!keys.includes(key))||report.schemaVersion!==1||report.kind!=='packs-order-control'||report.companyId!=='maatwerkkunststof'||report.automaticBooking!==false||report.userReviewConfirmed!==false||!id(report.orderId)||!string(report.orderNumber,200)||!string(report.supplierReference,200)||!string(report.controlVersion,100)||!report.controlVersion||!string(report.createdAt,40)||!Number.isFinite(Date.parse(report.createdAt)))fail();
 const env=report.environment;
 if(!object(env)||Object.keys(env).some(key=>!['origin','mode','release','localServices','trialOnly'].includes(key))||!string(env.origin,300)||!['local','cloud','unknown'].includes(env.mode)||!string(env.release,160)||typeof env.localServices!=='boolean'||typeof env.trialOnly!=='boolean')fail();
 try{const url=new URL(env.origin);if(url.origin!==env.origin||url.username||url.password||!(url.protocol==='https:'||url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))fail();}catch{fail();}
 if(!Array.isArray(report.facts)||report.facts.length>500||new Set(report.facts.map(fact=>fact?.key)).size!==report.facts.length)fail();
 for(const fact of report.facts)if(!object(fact)||Object.keys(fact).some(key=>!['key','label','value'].includes(key))||typeof fact.key!=='string'||!factKey(fact.key)||!string(fact.label,120)||!(fact.value===null||typeof fact.value==='boolean'||typeof fact.value==='number'&&Number.isFinite(fact.value)||string(fact.value,2000)))fail();
 for(const key of fixedKeys.filter(key=>!['preparationCurrent','planningMode','plannedLoadDate','plannedDeliveryDate','readyOn','loadDate','deliveryDate','instructions','packagesConfirmed','addressesConfirmed','readyConfirmed'].includes(key)))if(!report.facts.some(fact=>fact.key===key))fail();
 if(!hash(report.facts.find(fact=>fact.key==='orderBasisHash').value))fail();
 if(!Array.isArray(report.files)||report.files.length!==2||new Set(report.files.map(file=>file?.role)).size!==2)fail();
 for(const file of report.files){
  if(!object(file)||Object.keys(file).some(key=>!['role','documentId','name','size','bytes','sha256','read','current'].includes(key))||!['label','packing'].includes(file.role)||!(file.documentId===''||id(file.documentId))||!string(file.name,180)||![file.size,file.bytes].every(size=>size===null||Number.isSafeInteger(size)&&size>=0&&size<=32_000_000)||!(file.sha256===''||hash(file.sha256))||!['ok','none','unavailable','invalid','too-large'].includes(file.read)||typeof file.current!=='boolean'||file.read==='ok'&&(!hash(file.sha256)||!file.documentId||file.bytes===null||file.bytes!==file.size||file.bytes<5||file.bytes>(file.role==='label'?4_000_000:2_000_000)))fail();
 }
 if(new TextEncoder().encode(JSON.stringify(report)).length>packsControlMaxBytes)fail();
 return report;
}
export function makePacksControlReport(info,{createdAt,environment,files,basisHash}){
 return validatePacksControlReport({schemaVersion:1,kind:'packs-order-control',companyId:'maatwerkkunststof',createdAt,controlVersion:packsControlVersion,environment,orderId:info.data.orderId,orderNumber:String(info.data.number),supplierReference:info.reference,facts:packsControlFacts(info,basisHash),files,automaticBooking:false,userReviewConfirmed:false});
}
export function comparePacksControlReports(current,other){
 validatePacksControlReport(current);validatePacksControlReport(other);
 if(current.orderId!==other.orderId)throw Error('Dit rapport hoort bij een andere order. Kies dezelfde order in beide omgevingen. Er wordt niets overgenomen.');
 const differences=[],metadata=[];
 const add=(list,key,label,left,right)=>{if(left!==right)list.push({key,label,left:left??null,right:right??null});};
 add(differences,'orderNumber','Ons ordernummer',current.orderNumber,other.orderNumber);add(differences,'supplierReference','Kunststofbaas-bestelnummer',current.supplierReference,other.supplierReference);
 const leftFacts=new Map(current.facts.map(fact=>[fact.key,fact])),rightFacts=new Map(other.facts.map(fact=>[fact.key,fact]));
 for(const key of new Set([...leftFacts.keys(),...rightFacts.keys()])){const left=leftFacts.get(key),right=rightFacts.get(key);if(!left||!right)differences.push({key,label:left?.label||right.label,left:left?left.value:'Niet opgenomen',right:right?right.value:'Niet opgenomen'});else add(differences,key,left.label,left.value,right.value);}
 const fileTitles={documentId:'Document-ID',name:'Bestandsnaam',size:'Bewaarde omvang (bytes)',bytes:'Gelezen omvang (bytes)',sha256:'Bestandsinhoud (SHA-256)',read:'Bestand gelezen',current:'Actueel voor deze bestelling'};
 for(const role of ['label','packing']){const left=current.files.find(file=>file.role===role),right=other.files.find(file=>file.role===role);for(const [key,title] of Object.entries(fileTitles))add(differences,role+'.'+key,(role==='label'?'PACKS-label':'Pakbon')+' · '+title,left[key],right[key]);}
 add(metadata,'controlVersion','Versie van dit controleonderdeel',current.controlVersion,other.controlVersion);
 for(const [key,title] of [['origin','CRM-adres'],['mode','Opslagwijze'],['release','Versieaanduiding CRM'],['localServices','Lokale diensten'],['trialOnly','Afzonderlijke mailproefstand']])add(metadata,key,title,current.environment[key],other.environment[key]);
 const filesComplete=[current,other].every(report=>report.files.every(file=>file.read==='ok'&&file.current));
 return {differences,metadata,filesComplete};
}
