import {deliveryAddressProposal} from './order-delivery.js?v=supplier-workflow-ui-20261101';
import {kunststofbaas} from './kunststofbaas.js?v=supplier-batches35-20261101';
// PACKS preparation only. No credentials, provider calls or shipment facts.
export const packsParcelLimit=20; // CRM preparation limit, not a PACKS allowance.
export const packsAddressFields={name:50,nameTo:50,street:50,number:50,numberExt:50,zip:10,place:50,country:2,phone:50,mail:255};
// New preparations use the published Worker's format. Older formats retain
// their exact saved basis until the user deliberately edits/saves them.
export const packsPlanningMode=value=>value?.loadDateMode!==undefined?(value.loadDateMode==='automatic'?'automatic':value.loadDateMode==='manual'?'custom':value.loadDateMode):value?.planningMode===undefined?'custom':value.planningMode;
export function validatePacksPlanning(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==2||Object.keys(value).some(k=>!['loadDate','deliveryDate'].includes(k))||['loadDate','deliveryDate'].some(k=>value[k]!==''&&!packsDay(value[k]))||value.loadDate&&value.deliveryDate&&value.deliveryDate<value.loadDate)throw Error('De door PACKS teruggegeven planning is niet geldig. Onderzoek dezelfde boeking.');
 return value;
}
export function packsPlanningLines(preparation,planning){
 if(!preparation)return [];
 const lines=packsPlanningMode(preparation)==='automatic'?['Planning: PACKS kiest de eerst mogelijke afhaal- en bezorgdatum.']:[preparation.readyOn?'Opgegeven gereeddatum: '+preparation.readyOn:'',preparation.loadDate?'Gewenste afhaaldatum: '+preparation.loadDate:'',preparation.deliveryDate?'Gewenste bezorgdatum: '+preparation.deliveryDate:''];
 if(planning){validatePacksPlanning(planning);lines.push(planning.loadDate?'Door PACKS geplande afhaaldatum: '+planning.loadDate:'PACKS heeft nog geen afhaaldatum teruggegeven.',planning.deliveryDate?'Door PACKS geplande bezorgdatum: '+planning.deliveryDate:'PACKS heeft nog geen bezorgdatum teruggegeven.');}
 return lines.filter(Boolean);
}
export const packsContractBlocks=[
 {id:'PK-01',message:'Het juiste API-account en de gescheiden test-/liveomgeving nog bevestigen.'},
 {id:'PK-02',message:'Direct Booking en kostenvrij testen nog bevestigen.'},
 {id:'PK-03',message:'Meegaan met de dagelijkse ronde van Kunststofbaas; dienst en accountkoppeling bij PACKS nog bevestigen. Geen extra Pickup.'},
 {id:'PK-04',message:'Kunststofbaas is het voorgestelde transportretouradres; akkoord van leverancier en PACKS nog bevestigen.'},
 {id:'PK-05',message:'Tarieven, toeslagen en accountgebonden pakketlimieten nog bevestigen.'},
 {id:'PK-06',message:'Betrouwbare verpakkings- en gewichtsbasis nog vastleggen.'},
 {id:'PK-07',message:'Werkelijke gereedheid voor de gekozen of eerst mogelijke ronde, aanmeldtijd en PACKS-datumafhandeling nog bevestigen.'},
 {id:'PK-08',message:'Herstelprocedure na een onzeker boekingsresultaat nog bevestigen.'},
 {id:'PK-09',message:'Labelherstel, pakketkoppeling en afdrukmogelijkheid nog bevestigen.'},
 {id:'PK-10',message:'Track & Trace-berichten en statusbetekenis nog afspreken.'},
 {id:'PK-11',message:'Correctieprocedure en kosten bij een foutieve boeking nog bevestigen.'}
];
export const packsId=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const text=(value,max)=>typeof value==='string'&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
const fail=(message,field)=>{throw Object.assign(Error(message),{field,status:400});};
export const packsDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function packsLogisticsDay(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(type=>parts.find(part=>part.type===type).value).join('-');
}
// Calendar tomorrow in the supplier's timezone, including weekends. This is
// an editable preference, never a readiness fact or a carrier appointment.
export function packsTomorrow(now=new Date()){
 const day=new Date(packsLogisticsDay(now)+'T12:00:00Z');
 day.setUTCDate(day.getUTCDate()+1);
 return day.toISOString().slice(0,10);
}
export const emptyPacksAddress=()=>Object.fromEntries(Object.keys(packsAddressFields).map(key=>[key,'']));
export const emptyPacksParcel=id=>({id,lengthCm:null,widthCm:null,heightCm:null,weightKg:null});
// Only invalidate the confirmation whose facts were edited. Unknown future
// fields conservatively invalidate all three; an old order basis still requires
// the separate complete review in the existing supplier transaction.
export function packsConfirmationKeys(path){
 if(typeof path==='string'){
  if(path==='packages'||path.startsWith('packages.'))return ['packagesConfirmed'];
  if(['planningMode','loadDateMode','readyOn','loadDate','deliveryDate'].includes(path))return ['readyConfirmed'];
  if(path.startsWith('loadAddress.'))return ['addressesConfirmed','readyConfirmed'];
  if(path==='instructions'||['deliveryAddress.','returnAddress.'].some(prefix=>path.startsWith(prefix)))return ['addressesConfirmed'];
 }
 return ['packagesConfirmed','addressesConfirmed','readyConfirmed'];
}
export function packsSourceKeys(preparation){return new Set([
 'loadDate',
 ...['deliveryAddress','loadAddress','returnAddress'].flatMap(prefix=>Object.keys(packsAddressFields).map(key=>prefix+'.'+key)),
 ...preparation.packages.flatMap(parcel=>['lengthCm','widthCm','heightCm','weightKg'].map(key=>'packages.'+parcel.id+'.'+key))
]);}
export function validatePacksPreparation(value){
 const keys=['schemaVersion','revision','basis','reference','updatedAt','packages','deliveryAddress','loadAddress','returnAddress','planningMode','loadDateMode','readyOn','loadDate','deliveryDate','instructions','packagesConfirmed','addressesConfirmed','readyConfirmed','sources'];
 if(!object(value)||Object.keys(value).some(key=>!keys.includes(key))||value.schemaVersion!==1||!packsId(value.revision)||typeof value.basis!=='string'||!value.basis||value.basis.length>500000||!text(value.reference,200)||!value.reference.trim()||typeof value.updatedAt!=='string'||!Number.isFinite(Date.parse(value.updatedAt)))fail('Controleer de bewaarde PACKS-voorbereiding.');
 if(!Array.isArray(value.packages)||!value.packages.length||value.packages.length>packsParcelLimit||new Set(value.packages.map(parcel=>parcel?.id)).size!==value.packages.length)fail('Bewaar 1 tot '+packsParcelLimit+' pakketten in deze voorbereiding.');
 for(const parcel of value.packages){
  if(!object(parcel)||Object.keys(parcel).some(key=>!['id','lengthCm','widthCm','heightCm','weightKg'].includes(key))||!packsId(parcel.id))fail('Controleer de pakketregels.');
  for(const key of ['lengthCm','widthCm','heightCm','weightKg'])if(parcel[key]!==null&&(typeof parcel[key]!=='number'||!Number.isFinite(parcel[key])||parcel[key]<=0||key!=='weightKg'&&parcel[key]>999))fail('Vul een positief gewicht of een buitenmaat van maximaal 999 cm in.', 'parcel_'+parcel.id+'_'+key);
 }
 for(const prefix of ['deliveryAddress','loadAddress','returnAddress']){
  const address=value[prefix];
  if(!object(address)||Object.keys(address).some(key=>!Object.hasOwn(packsAddressFields,key)))fail('Controleer de PACKS-adresvelden.');
  for(const [key,max] of Object.entries(packsAddressFields))if(!text(address[key],max))fail('Controleer het adresveld (maximaal '+max+' tekens).',prefix+'_'+key);
  if(address.country&&!/^[A-Z]{2}$/.test(address.country))fail('Gebruik een landcode van twee hoofdletters, bijvoorbeeld NL.',prefix+'_country');
  if(address.mail&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address.mail))fail('Controleer het e-mailadres.',prefix+'_mail');
 }
 for(const key of ['readyOn','loadDate','deliveryDate'])if(value[key]!==''&&!packsDay(value[key]))fail('Controleer de datum.',key);
 if(value.loadDateMode!==undefined&&(value.planningMode!==undefined||!['automatic','manual'].includes(value.loadDateMode)))fail('Gebruik één geldige datumkeuze voor de PACKS-dienst.','planningMode');
 if(value.loadDateMode==='manual'&&!value.loadDate)fail('Vul bij handmatige planning de ophaaldatum in.','loadDate');
 if(!['automatic','custom'].includes(packsPlanningMode(value)))fail('Kies de PACKS-planning of een eigen datum.','planningMode');
 if(packsPlanningMode(value)==='automatic'&&['readyOn','loadDate','deliveryDate'].some(k=>value[k]!==''))fail('Bij PACKS-planning blijven de datums leeg. Kies een eigen datum als de bestelling pas later klaar is.','planningMode');
 if(!text(value.instructions,200))fail('Gebruik maximaal 200 tekens zonder regelovergangen voor de afleverinstructie.','instructions');
 for(const key of ['packagesConfirmed','addressesConfirmed','readyConfirmed'])if(typeof value[key]!=='boolean')fail('Controleer de bevestigingen.');
 const allowed=packsSourceKeys(value);
 if(!object(value.sources)||Object.keys(value.sources).length>allowed.size||Object.entries(value.sources).some(([key,source])=>!allowed.has(key)||!['automatic','interpretation'].includes(source)))fail('Controleer de herkomst van de pakketvoorstellen.');
 return value;
}
// Address splitting is an explicit interpretation, never a booking/address edit.
export function packsAddressProposal(data){
 const address=emptyPacksAddress(),sources={};
 const put=(key,value,source='automatic')=>{if(typeof value==='string'&&value&&value.length<=packsAddressFields[key]&&!/[\x00-\x1f\x7f]/.test(value)){address[key]=value;sources['deliveryAddress.'+key]=source;}};
 put('name',data.recipient);put('phone',data.phone);put('mail',data.email);
 const split=deliveryAddressProposal(data);for(const [key,value] of Object.entries(split.fields))put(key,value,split.source);
 return {address,sources};
}
export function packsPreparationSeed(data,{basis,reference,revision,parcelId,now=new Date().toISOString()}={}){
 const delivery=packsAddressProposal(data),parcel=emptyPacksParcel(parcelId),sources={...delivery.sources};
 const item=data.items.length===1&&data.items[0].quantity===1?data.items[0]:null;
 // Bare product dimensions only. Never guess packing thickness, density or mass.
 if(item)for(const [target,key] of [['lengthCm','width'],['widthCm','height'],['heightCm','thickness']])if(Number.isFinite(item[key])&&item[key]>0&&item[key]/10<=999){parcel[target]=item[key]/10;sources['packages.'+parcel.id+'.'+target]='automatic';}
 for(const prefix of ['loadAddress','returnAddress'])for(const [key,value] of Object.entries(kunststofbaas.pickupAddress))if(value)sources[prefix+'.'+key]='automatic';
 return {schemaVersion:1,revision,basis,reference,updatedAt:now,packages:[parcel],deliveryAddress:delivery.address,loadAddress:{...kunststofbaas.pickupAddress},returnAddress:{...kunststofbaas.pickupAddress},loadDateMode:'automatic',readyOn:'',loadDate:'',deliveryDate:'',instructions:'',packagesConfirmed:false,addressesConfirmed:false,readyConfirmed:false,sources};
}
export function packsPreparationReview(preparation,{basis,reference,today=packsLogisticsDay()}={}){
 validatePacksPreparation(preparation);const issues=[];
 const add=(field,message)=>issues.push({field,message});
 if(preparation.basis!==basis||preparation.reference!==reference)add('basis','Order, bestemming of leveranciersnummer gewijzigd: controleer de voorbereiding opnieuw.');
 preparation.packages.forEach((parcel,index)=>{for(const [key,label] of [['lengthCm','lengte'],['widthCm','breedte'],['heightCm','hoogte'],['weightKg','gewicht']])if(parcel[key]===null)add('parcel_'+parcel.id+'_'+key,'Pakket '+(index+1)+': '+label+' nog invullen.');});
 for(const [prefix,label] of [['deliveryAddress','Afleveradres'],['loadAddress','Afhaaladres'],['returnAddress','Transportretouradres']])for(const key of ['name','street','number','zip','place','country'])if(!preparation[prefix][key].trim())add(prefix+'_'+key,label+': '+({name:'naam',street:'straat',number:'huisnummer',zip:'postcode',place:'plaats',country:'land'}[key])+' ontbreekt.');
 if(packsPlanningMode(preparation)==='custom'&&!preparation.loadDate)add('loadDate','Gewenste afhaaldatum nog kiezen.');
 for(const [key,label] of [['loadDate','Afhaaldatum'],['deliveryDate','Bezorgdatum']])if(preparation[key]&&preparation[key]<today)add(key,label+' ligt in het verleden (Nederlandse datum).');
 if(preparation.readyOn&&preparation.loadDate&&preparation.loadDate<preparation.readyOn)add('loadDate','Afhaling ligt vóór de opgegeven gereeddatum.');
 if(preparation.loadDate&&preparation.deliveryDate&&preparation.deliveryDate<preparation.loadDate)add('deliveryDate','Bezorging ligt vóór afhaling.');
 for(const [key,message] of [['packagesConfirmed','Controleer de werkelijke verpakte buitenmaten, het aantal pakketten en gewicht inclusief verpakking.'],['addressesConfirmed','Controleer de drie adressen, het afgesproken transportretouradres en de afleverinstructie.'],['readyConfirmed',packsPlanningMode(preparation)==='automatic'?'Controleer dat de bestelling klaar is voor de eerst mogelijke ronde; kies anders een eigen datum.':'Controleer dat Kunststofbaas uiterlijk op de gewenste afhaaldatum verzendklaar is; een datumvoorstel is geen gereedmelding.']])if(!preparation[key])add(key,message);
 return {issues,preparationComplete:issues.length===0,canBook:false,mode:'preparation-only',contractBlocks:packsContractBlocks.map(block=>({...block}))};
}
// Bind a chosen manual label to the physical preparation without making a
// changed checkbox, source marker or save timestamp invalidate the same label.
export function packsPreparationBasis(value){
 if(value===undefined)return undefined;
 validatePacksPreparation(value);
 const address=prefix=>Object.fromEntries(Object.keys(packsAddressFields).map(key=>[key,value[prefix][key]]));
 // Property order deliberately matches the exact published v3 module. Do not
 // add this field to legacy bases: it would invalidate existing label tags.
 if(value.loadDateMode!==undefined)return JSON.stringify({packages:value.packages.map(parcel=>Object.fromEntries(['lengthCm','widthCm','heightCm','weightKg'].map(key=>[key,parcel[key]]))),deliveryAddress:address('deliveryAddress'),loadAddress:address('loadAddress'),returnAddress:address('returnAddress'),readyOn:value.readyOn,loadDate:value.loadDate,loadDateMode:value.loadDateMode,deliveryDate:value.deliveryDate,instructions:value.instructions});
 return JSON.stringify({packages:value.packages.map(parcel=>Object.fromEntries(['lengthCm','widthCm','heightCm','weightKg'].map(key=>[key,parcel[key]]))),deliveryAddress:address('deliveryAddress'),loadAddress:address('loadAddress'),returnAddress:address('returnAddress'),...(packsPlanningMode(value)==='automatic'?{planningMode:'automatic'}:{}),readyOn:value.readyOn,loadDate:value.loadDate,deliveryDate:value.deliveryDate,instructions:value.instructions});
}
