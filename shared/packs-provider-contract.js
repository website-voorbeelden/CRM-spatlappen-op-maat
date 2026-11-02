import {packsId,packsDay,packsLogisticsDay,packsPlanningMode,validatePacksPlanning,packsAddressFields,validatePacksPreparation,packsPreparationReview} from './packs-preparation.js?v=packs-worker-v3-20261102';

// Pure mapping of a separately confirmed server profile. Nothing here selects
// an account, invents limits/prices, performs I/O or grants booking permission.
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const line=(value,max)=>typeof value==='string'&&!!value.trim()&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
export const packsProviderId=value=>Number.isSafeInteger(value)&&value>0&&value<=2147483647;
const fail=message=>{throw Object.assign(Error(message),{status:409,code:'packs_contract'});};
const handlers=['Packs','HPD','A7','Circuit','JBM','FRL','Merenpost','PietSpoed','EfficientLogistics','InControlLogistics','MTH'];
const networks=['NextDay','Sunday','Evening','InNight','NXPAL','PalletNextDay'];
export function validatePacksProviderProfile(profile){
 const keys=['schemaVersion','companyId','environment','version','accountKey','handler','network','product','productId','maxColli','maxWeightKg','maxDimensionsCm','dateMode','shipperIdMaxLength','bookingStatus','printLabel','countries','sizeLimit','contractEvidence'];
 if(!object(profile)||Object.keys(profile).some(key=>!keys.includes(key)))fail('Onbekende velden in het PACKS-profiel; credentials horen apart op de server.');
 if(!object(profile)||profile.schemaVersion!==1||profile.companyId!=='maatwerkkunststof'||!['test','live'].includes(profile.environment)||!packsId(profile.version)||!packsId(profile.accountKey)||!handlers.includes(profile.handler)||!networks.includes(profile.network)||!line(profile.product,20)||!packsProviderId(profile.productId))fail('Het bevestigde PACKS-account-/dienstprofiel ontbreekt.');
 if(!Number.isInteger(profile.maxColli)||profile.maxColli<1||profile.maxColli>20||!positive(profile.maxWeightKg)||!object(profile.maxDimensionsCm)||!['length','width','height'].every(key=>positive(profile.maxDimensionsCm[key])&&profile.maxDimensionsCm[key]<=999))fail('Leg eerst de bevestigde pakketlimieten vast (maximaal 20 in dit CRM).');
 if(!['date-only','amsterdam-midnight'].includes(profile.dateMode)||!Number.isInteger(profile.shipperIdMaxLength)||profile.shipperIdMaxLength<1||profile.shipperIdMaxLength>160||!['Create','Manifest','Done'].includes(profile.bookingStatus)||typeof profile.printLabel!=='boolean')fail('PACKS-datumformaat, referentielimiet en boekingsinstellingen zijn nog niet bevestigd.');
 if(!Array.isArray(profile.countries)||!profile.countries.length||profile.countries.some(country=>typeof country!=='string'||!/^[A-Z]{2}$/.test(country)))fail('Leg eerst de bevestigde bestemmingslanden vast.');
 if(profile.sizeLimit!==null&&(!object(profile.sizeLimit)||!['longest-side','sum-of-sides','length-plus-girth','volume'].includes(profile.sizeLimit.formula)||!positive(profile.sizeLimit.maximum)))fail('De betekenis van de PACKS-maatlimiet is nog niet bevestigd.');
 if(!object(profile.contractEvidence)||Array.from({length:11},(_,index)=>'PK-'+String(index+1).padStart(2,'0')).some(key=>!line(profile.contractEvidence[key],500)))fail('De vereiste PACKS-/leveranciersafspraken zijn nog niet vastgelegd.');
 return profile;
}
function providerDay(day,mode){
 if(!packsDay(day))fail('Controleer de logistieke datum.');
 if(mode==='date-only')return day;
 const zone=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',timeZoneName:'longOffset'}).formatToParts(new Date(day+'T00:00:00Z')).find(part=>part.type==='timeZoneName')?.value;
 if(!/^GMT\+0[12]:00$/.test(zone||''))fail('De Nederlandse datum kan niet veilig worden omgezet.');
 return day+'T00:00:00'+zone.slice(3);
}
function accountProduct(profile,productInfo,now){
 const matches=Array.isArray(productInfo?.products)?productInfo.products.filter(product=>object(product)&&product.productId===profile.productId&&product.product===profile.product&&product.handler===profile.handler&&product.network===profile.network):[];
 if(matches.length!==1)fail('De gekozen dienst staat niet eenduidig bij dit PACKS-account.');
 const product=matches[0],from=Date.parse(product.validFrom),until=product.validUntil==null?Infinity:Date.parse(product.validUntil);
 if(!Number.isFinite(from)||from>now||!(until>=now)||!Number.isInteger(product.maxColli)||product.maxColli<1||!Array.isArray(product.countries))fail('De actuele productgeldigheid of pakketlimieten zijn niet bruikbaar.');
 if(product.productWeightMax!=null&&!positive(product.productWeightMax))fail('De gewichtslimiet uit PACKS is niet bruikbaar.');
 if(product.productSizeMax!=null&&(!positive(product.productSizeMax)||profile.sizeLimit?.maximum!==product.productSizeMax)||product.productSizeMax==null&&profile.sizeLimit!==null)fail('De actuele maatlimiet past niet bij het bevestigde profiel.');
 return product;
}
export function buildPacksShipment(preparation,profile,{attemptId,labelText,productInfo,now=Date.now()}={}){
 validatePacksPreparation(preparation);validatePacksProviderProfile(profile);
 if(!packsPreparationReview(preparation,{basis:preparation.basis,reference:preparation.reference}).preparationComplete)fail('Controleer eerst alle pakket-, adres- en datumgegevens.');
 if(!packsId(attemptId)||attemptId.length>profile.shipperIdMaxLength||!line(labelText,50))fail('Controleer de bevestigde pogingreferentie en labeltekst (maximaal 50 tekens).');
 const product=accountProduct(profile,productInfo,now),count=preparation.packages.length;
 if(count>Math.min(profile.maxColli,product.maxColli)||!profile.countries.includes(preparation.deliveryAddress.country)||!product.countries.some(country=>country?.alpha2===preparation.deliveryAddress.country))fail('Aantal pakketten of bestemming valt buiten de bevestigde dienst.');
 const shipmentItems=preparation.packages.map((parcel,index)=>{
  const values={length:parcel.lengthCm,width:parcel.widthCm,height:parcel.heightCm},dimensions=Object.values(values).sort((a,b)=>b-a);
  if(parcel.weightKg>profile.maxWeightKg||product.productWeightMax!=null&&parcel.weightKg>product.productWeightMax||Object.entries(values).some(([key,value])=>value>profile.maxDimensionsCm[key]))fail('Pakket '+(index+1)+' overschrijdt de bevestigde gewicht- of buitenmaatlimiet.');
  if(profile.sizeLimit){const size={'longest-side':dimensions[0],'sum-of-sides':dimensions.reduce((sum,value)=>sum+value,0),'length-plus-girth':dimensions[0]+2*(dimensions[1]+dimensions[2]),volume:dimensions.reduce((total,value)=>total*value,1)}[profile.sizeLimit.formula];if(size>profile.sizeLimit.maximum)fail('Pakket '+(index+1)+' overschrijdt de bevestigde samengestelde maatlimiet.');}
  const text=count===1?labelText:labelText+' · '+(index+1)+'/'+count;if(!line(text,50))fail('Maak de labeltekst korter; ook het pakketnummer moet binnen 50 tekens passen.');
  return {product:profile.product,...values,weight:parcel.weightKg,labelText:text,fileType:'Pdf',rotate:false,returnOrder:false,surcharges:[]};
 });
 const address=value=>Object.fromEntries(Object.entries(value).filter(([,value])=>value!==''));
 const payload={shipperShipmentId:attemptId,shipmentType:'Shipment',handler:profile.handler,network:profile.network,status:profile.bookingStatus,printLabel:profile.printLabel,loadAddress:address(preparation.loadAddress),deliveryAddress:address(preparation.deliveryAddress),returnAddress:address(preparation.returnAddress),shipmentItems,surcharges:[]};
 if(preparation.loadDate)payload.loadDate=providerDay(preparation.loadDate,profile.dateMode);
 if(preparation.deliveryDate)payload.deliveryDate=providerDay(preparation.deliveryDate,profile.dateMode);
 if(preparation.instructions)payload.deliveryInstructions=preparation.instructions;
 validatePacksShipmentPayload(payload);return payload;
}
export function validatePacksShipmentPayload(payload){
 if(!object(payload)||JSON.stringify(payload).length>20000||!packsId(payload.shipperShipmentId)||payload.shipmentType!=='Shipment'||!handlers.includes(payload.handler)||!networks.includes(payload.network)||!['Create','Manifest','Done'].includes(payload.status)||typeof payload.printLabel!=='boolean'||!Array.isArray(payload.shipmentItems)||payload.shipmentItems.length<1||payload.shipmentItems.length>20)fail('Ongeldige vaste PACKS-boekingsgegevens.');
 const allowed=['shipperShipmentId','shipmentType','handler','network','status','printLabel','loadDate','deliveryDate','loadAddress','deliveryAddress','returnAddress','shipmentItems','surcharges','deliveryInstructions'];
 if(Object.keys(payload).some(key=>!allowed.includes(key))||!Array.isArray(payload.surcharges)||payload.surcharges.length)fail('Onverwachte PACKS-boekingsvelden of toeslagen.');
 for(const key of ['loadDate','deliveryDate'])if(payload[key]!==undefined&&(typeof payload[key]!=='string'||!packsDay(payload[key].slice(0,10))||!/^\d{4}-\d{2}-\d{2}(?:T00:00:00\+0[12]:00)?$/.test(payload[key])))fail('Ongeldige vaste PACKS-datum.');
 if(payload.deliveryDate!==undefined&&payload.loadDate===undefined)fail('Een eigen bezorgdatum vraagt ook een gecontroleerde afhaaldatum.');
 for(const key of ['loadAddress','deliveryAddress','returnAddress']){const address=payload[key];if(!object(address)||Object.keys(address).some(key=>!Object.hasOwn(packsAddressFields,key))||['name','street','number','zip','place','country'].some(key=>!line(address[key],packsAddressFields[key]))||Object.entries(address).some(([key,value])=>typeof value!=='string'||value.length>packsAddressFields[key]||/[\x00-\x1f\x7f]/.test(value))||!/^[A-Z]{2}$/.test(address.country))fail('Ongeldige vaste PACKS-adresgegevens.');}
 if(payload.deliveryInstructions!==undefined&&(typeof payload.deliveryInstructions!=='string'||payload.deliveryInstructions.length>200||/[\x00-\x1f\x7f]/.test(payload.deliveryInstructions)))fail('Ongeldige vaste PACKS-afleverinstructie.');
 for(const item of payload.shipmentItems)if(!object(item)||Object.keys(item).some(key=>!['product','length','width','height','weight','labelText','fileType','rotate','returnOrder','surcharges'].includes(key))||!line(item.product,20)||!['length','width','height','weight'].every(key=>positive(item[key]))||['length','width','height'].some(key=>item[key]>999)||!line(item.labelText,50)||item.fileType!=='Pdf'||item.rotate!==false||item.returnOrder!==false||!Array.isArray(item.surcharges)||item.surcharges.length)fail('Ongeldige vaste PACKS-pakketgegevens.');
 return payload;
}
export function packsShipmentMatchesPreparation(payload,preparation){
 validatePacksShipmentPayload(payload);validatePacksPreparation(preparation);
 const addresses=['loadAddress','deliveryAddress','returnAddress'].every(key=>JSON.stringify(Object.fromEntries(Object.entries(payload[key]).sort(([a],[b])=>a.localeCompare(b))))===JSON.stringify(Object.fromEntries(Object.entries(preparation[key]).filter(([,value])=>value!=='').sort(([a],[b])=>a.localeCompare(b)))));
 const dates=packsPlanningMode(preparation)==='automatic'?payload.loadDate===undefined&&payload.deliveryDate===undefined:typeof payload.loadDate==='string'&&payload.loadDate.slice(0,10)===preparation.loadDate&&(payload.deliveryDate||'').slice(0,10)===preparation.deliveryDate;
 return addresses&&dates&&(payload.deliveryInstructions||'')===preparation.instructions&&payload.shipmentItems.length===preparation.packages.length&&payload.shipmentItems.every((item,index)=>{const parcel=preparation.packages[index];return item.length===parcel.lengthCm&&item.width===parcel.widthCm&&item.height===parcel.heightCm&&item.weight===parcel.weightKg;});
}
function returnedPlanning(body){
 try{
  const day=value=>{if(value===null||value===undefined||value==='')return '';if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value)||!packsDay(value.slice(0,10))||!Number.isFinite(Date.parse(value)))throw Error('PACKS_DATE');return /(?:Z|[+-]\d{2}:\d{2})$/.test(value)?packsLogisticsDay(new Date(value)):value.slice(0,10);};
  return validatePacksPlanning({loadDate:day(body?.loadDate),deliveryDate:day(body?.deliveryDate)});
 }catch{return null;}
}
export function packsBookingResult(body,payload,{httpOk=false}={}){
 validatePacksShipmentPayload(payload);
 const provider={shipmentId:packsProviderId(body?.shipmentId)?body.shipmentId:null,items:[]},rows=Array.isArray(body?.shipmentItems)?body.shipmentItems:[];
 if(rows.length>200)fail('PACKS gaf meer pakketregels terug dan de begrensde bewijsopslag kan vastleggen. Onderzoek de oorspronkelijke poging.');
 let identityConflict=false;
 for(const row of rows){
  const item={shipmentItemId:packsProviderId(row?.shipmentItemId)?row.shipmentItemId:null,barcode:typeof row?.barcode==='string'&&row.barcode.length<=200&&!/[\x00-\x1f\x7f]/.test(row.barcode)?row.barcode:''};
  if(item.shipmentItemId===null&&!item.barcode)continue;
  const knownId=item.shipmentItemId!==null&&provider.items.some(known=>known.shipmentItemId===item.shipmentItemId),knownBarcode=!!item.barcode&&provider.items.some(known=>known.barcode===item.barcode);
  // Keep every distinct known ID/barcode even in a contradictory response, but
  // do not certify its package association or release labels in that case.
  if(knownId||knownBarcode){identityConflict=true;if(knownId)item.shipmentItemId=null;if(knownBarcode)item.barcode='';}
  if(item.shipmentItemId!==null||item.barcode)provider.items.push(item);
 }
 const matched=payload.shipmentItems.map(expected=>rows.filter(row=>row?.labelText===expected.labelText&&row.product===expected.product&&['length','width','height','weight'].every(key=>row[key]===expected[key])));
 const planning=returnedPlanning(body),addressesMatch=['loadAddress','deliveryAddress','returnAddress'].every(key=>Object.entries(payload[key]).every(([field,value])=>body?.[key]?.[field]===value)),datesMatch=!!planning&&['loadDate','deliveryDate'].every(key=>payload[key]===undefined||typeof body?.[key]==='string'&&(payload[key].length===10?planning[key]===payload[key]:Date.parse(body[key])===Date.parse(payload[key])));
 const complete=httpOk&&!identityConflict&&addressesMatch&&datesMatch&&['Create','Manifest','Done'].includes(body?.status)&&(payload.deliveryInstructions===undefined||body.deliveryInstructions===payload.deliveryInstructions)&&provider.shipmentId!==null&&body.shipperShipmentId===payload.shipperShipmentId&&body.shipmentType===payload.shipmentType&&body.handler===payload.handler&&body.network===payload.network&&rows.length===payload.shipmentItems.length&&matched.every(rows=>rows.length===1&&rows[0].fileType==='Pdf'&&packsProviderId(rows[0].shipmentItemId)&&line(rows[0].barcode,200));
 if(complete)provider.items=matched.map(([row])=>({shipmentItemId:row.shipmentItemId,barcode:row.barcode}));
 return {status:complete?'booked':'uncertain',provider,...(complete?{planning}:{}),checks:{httpOk,identitiesUnique:!identityConflict,addressesMatch,datesMatch,referenceMatch:body?.shipperShipmentId===payload.shipperShipmentId,handlerMatch:body?.handler===payload.handler,networkMatch:body?.network===payload.network,packetCountMatch:rows.length===payload.shipmentItems.length,packetFieldsMatch:matched.every(rows=>rows.length===1),shipmentIdPresent:provider.shipmentId!==null}};
}
export function packsLabelsRequest(provider){
 if(!packsProviderId(provider?.shipmentId)||!Array.isArray(provider.items)||provider.items.length<1||provider.items.length>20||provider.items.some(item=>!packsProviderId(item.shipmentItemId)||!line(item.barcode,200)))fail('De bekende zending mist eenduidige pakket-ID’s voor labelherstel.');
 if(provider.items.some(item=>Object.keys(item).some(key=>!['shipmentItemId','barcode'].includes(key)))||new Set(provider.items.map(item=>item.shipmentItemId)).size!==provider.items.length||new Set(provider.items.map(item=>item.barcode)).size!==provider.items.length)fail('De labelopvraag bevat dubbele of onbekende pakketvelden.');
 return {mergeLabels:false,shipmentItems:provider.items.map(item=>({shipmentId:provider.shipmentId,...item}))};
}
export function packsLabelFiles(body,provider){
 const request=packsLabelsRequest(provider),rows=body?.labels;
 if(!Array.isArray(rows)||rows.length!==request.shipmentItems.length)fail('Niet alle labels zijn ontvangen; boek niet opnieuw.');
 let total=0;
 return request.shipmentItems.map(expected=>{
  const matches=rows.filter(row=>row?.shipmentId===expected.shipmentId&&row.shipmentItemId===expected.shipmentItemId&&row.barcode===expected.barcode);
  if(matches.length!==1||matches[0].fileType!=='Pdf'||typeof matches[0].labelObject!=='string'||matches[0].labelObject.length>5_333_336)fail('De labelidentiteit of het PDF-formaat klopt niet; boek niet opnieuw.');
  let binary;try{binary=atob(matches[0].labelObject);}catch{fail('Het label is geen geldige base64-PDF.');}
  total+=binary.length;if(binary.length<5||binary.length>4_000_000||total>4_000_000||btoa(binary)!==matches[0].labelObject||binary.slice(0,5)!=='%PDF-')fail('De ontvangen PDF-labels zijn ongeldig of samen groter dan 4 MB. Boek niet opnieuw.');
  return {...expected,bytes:Uint8Array.from(binary,char=>char.charCodeAt(0))};
 });
}
