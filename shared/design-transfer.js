// Portable data only. Customer/order context is deliberately never transferred.
import {hexColor} from './design-colors.js';
export const TRANSFER_LIMIT=24*1024*1024;
export const DESIGN_FORMAT='spatlap-preview-design',SELECTION_FORMAT='spatlap-preview-selection';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const str=(v,max=1000)=>String(v??'').slice(0,max);
function number(v,min,max,label){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(label+' is ongeldig.');return v;}
function color(v){const c=hexColor(v);if(!c)throw Error('Ongeldige kleur in de ontwerptekst.');return c;}
function raster(v){if(typeof v!=='string'||!/^data:image\/(png|jpeg|webp);base64,[a-z\d+/=\s]+$/i.test(v))throw Error('Een afbeelding is niet ingesloten. Importeer die afbeelding opnieuw; losse bestandspaden worden niet meegenomen.');return v;}
function frame(v){if(!object(v))throw Error('Ontwerpkader ontbreekt.');return {x:number(v.x,-100,100,'X'),y:number(v.y,-100,100,'Y'),w:number(v.w,.00001,10000,'Breedte'),h:number(v.h,.00001,10000,'Hoogte'),ratio:number(v.ratio||v.w/v.h,.0000001,10000000,'Verhouding')};}
function crop(v){if(!object(v))throw Error('Ongeldig afbeeldingskader.');return {x:number(v.x,-1000,1000,'Crop X'),y:number(v.y,-1000,1000,'Crop Y'),w:number(v.w,.0000001,1000,'Crop breedte'),h:number(v.h,.0000001,1000,'Crop hoogte')};}
function transforms(v){if(v.rotation!==undefined&&![0,90,180,270].includes(v.rotation)||v.flipX!==undefined&&typeof v.flipX!=='boolean')throw Error('Ongeldige ontwerptransformatie.');return {...(v.rotation!==undefined?{rotation:v.rotation}:{}),...(v.flipX!==undefined?{flipX:v.flipX}:{})};}
function fontDescriptors(value=[]){if(!Array.isArray(value)||value.length>5||new Set(value.map(f=>f?.family)).size!==value.length)throw Error('Ongeldige eigen lettertypen.');return value.map(f=>{if(!/^CRMFont_[a-z0-9]{32}$/.test(f?.family)||typeof f.name!=='string'||f.name.length>100||typeof f.data!=='string'||f.data.length>2900000||!/^data:font\/(?:ttf|otf);base64,[A-Za-z0-9+/=]+$/.test(f.data))throw Error('Een ingesloten lettertype is ongeldig.');return {family:f.family,name:f.name,data:f.data};});}
function outline(v){if(v.outline===undefined)return {};if(!object(v.outline))throw Error('Ongeldige randlijn.');return {outline:{color:color(v.outline.color),width:number(v.outline.width,.01,2,'Randbreedte')}};}
function logo(v,sanitize){
 if(!object(v))throw Error('Ongeldig logo.');const result={id:str(v.id,200),name:str(v.name,500),...frame(v),...transforms(v),...outline(v)};
 if(typeof v.svgMarkup==='string'&&v.svgMarkup.trim()){result.svgMarkup=sanitize(v.svgMarkup);result.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(result.svgMarkup);result.vector=true;}
 else{result.src=raster(v.src);result.svgMarkup=null;result.vector=false;}
 if(v.originalRasterSrc)result.originalRasterSrc=raster(v.originalRasterSrc);
 if(v.vectorCrop)result.vectorCrop=crop(v.vectorCrop);
 if(v.originalVectorMarkup){result.originalVectorMarkup=sanitize(v.originalVectorMarkup);if(v.originalVectorFrame){result.originalVectorFrame=frame(v.originalVectorFrame);if(v.originalVectorFrame.vectorCrop)result.originalVectorFrame.vectorCrop=crop(v.originalVectorFrame.vectorCrop);}}
 for(const key of ['printColors','originalVectorPrintColors'])if(Array.isArray(v[key])){if(v[key].length>100)throw Error('Te veel kleuren.');result[key]=v[key].map(color);}
 return result;
}
function text(v){if(!object(v))throw Error('Ongeldige tekst.');return {id:str(v.id,200),text:str(v.text,20000),tightBounds:v.tightBounds===true,...transforms(v),...outline(v),x:number(v.x,-100,100,'Tekst X'),y:number(v.y,-100,100,'Tekst Y'),size:number(v.size,.00001,10000,'Tekstgrootte'),color:color(v.color),font:str(v.font||'Arimo, sans-serif',200),tracking:number(v.tracking??0,-.5,2,'Letterafstand'),weight:Number(v.weight)===400?400:700,align:['left','center','right'].includes(v.align)?v.align:'center'};}
function textFontFamily(text){return String(text.font||'').split(',')[0].trim().replace(/^['"]|['"]$/g,'');}
function requireTextFont(text,fonts){const family=textFontFamily(text);if(/^CRMFont_/.test(family)&&!fonts.some(f=>f.family===family))throw Error('Het ingesloten lettertype ontbreekt bij de tekst. Kopieer het ontwerp opnieuw inclusief font.');}
export function selectionTransfer(items,sanitize){
 if(!Array.isArray(items)||!items.length||items.length>400)throw Error('Selecteer maximaal 400 onderdelen.');
 return {format:SELECTION_FORMAT,version:1,items:items.map(entry=>{if(!['logo','text'].includes(entry?.type))throw Error('Onbekend soort onderdeel.');const fonts=fontDescriptors(entry.fonts),data=entry.type==='logo'?logo(entry.data,sanitize):text(entry.data);if(entry.type==='text')requireTextFont(data,fonts);return {type:entry.type,data,fonts};})};
}
export function portableDesign(value,sanitize){
 if(value?.format!==DESIGN_FORMAT||value.version!==1||!object(value.design))throw Error('Deze ontwerptekst heeft een onbekend formaat of versie.');
 const {flap:f,holes:h,logos:l,texts:t,ui:u={}}=value.design;if(!object(f)||!object(h)||!Array.isArray(l)||!Array.isArray(t)||l.length+t.length>400)throw Error('Het ontwerp is onvolledig of heeft te veel onderdelen.');
 const quantity=String(f.qty??'').trim();if(quantity&&(!/^\d+$/.test(quantity)||Number(quantity)<1||Number(quantity)>1000000))throw Error('Ongeldig aantal.');
 if(!['square','bottom','all','shoulder'].includes(f.shape))throw Error('Onbekende spatlapvorm.');
 const flap={w:number(f.w,1,10000,'Spatlapbreedte'),h:number(f.h,1,10000,'Spatlaphoogte'),qty:quantity,shape:f.shape,color:color(f.color),radius:number(f.radius??5,0,10000,'Radius'),radiusAuto:f.radiusAuto===true,shoulderAuto:f.shoulderAuto===true,shoulderInset:number(f.shoulderInset??5,0,10000,'Schouderinspringing'),shoulderTopH:number(f.shoulderTopH??5,.001,10000,'Schouderhoogte')};
 const holes={on:h.on===true,count:number(h.count??6,1,100,'Aantal gaten'),shape:h.shape==='pill'?'pill':'round',top:number(h.top??3,0,10000,'Gatenafstand boven'),side:number(h.side??10,0,10000,'Gatenafstand zijkant'),h:number(h.h??1.2,.001,10000,'Gathoogte'),w:number(h.w??2.2,.001,10000,'Gatbreedte')};
 const ui={wideMode:u.wideMode===true,zones:u.zones!==false,zoneCenter:number(u.zoneCenter??(u.zoneSide==null?50:100-u.zoneSide*2),10,90,'Middenzone'),topGuideOn:u.topGuideOn===true,showColorCount:u.showColorCount===true,manualColorCount:str(u.manualColorCount??'',3)};
 if(u.customFonts!==undefined)ui.customFonts=fontDescriptors(u.customFonts);
 if(Array.isArray(u.layerOrder))ui.layerOrder=[...new Set(u.layerOrder.filter(v=>typeof v==='string').slice(0,400).map(v=>v.slice(0,220)))];
 if(Array.isArray(u.snapExcluded))ui.snapExcluded=u.snapExcluded.filter(v=>typeof v==='string').slice(0,400).map(v=>v.slice(0,220));
 if(object(u.contour))ui.contour={on:u.contour.on===true,gap:number(u.contour.gap??1,0,10000,'Contourafstand'),width:number(u.contour.width??2,.001,10000,'Contourbreedte'),underHoles:u.contour.underHoles!==false};
 const texts=t.map(text);for(const entry of texts)requireTextFont(entry,ui.customFonts||[]);
 return {format:DESIGN_FORMAT,version:1,context:{customerId:null,orderId:null,itemId:null,designId:null},name:str(value.name,200),design:{flap,holes,logos:l.map(v=>logo(v,sanitize)),texts,ui}};
}
export function serializeTransfer(value){if(value?.format===SELECTION_FORMAT){const fonts=new Map();for(const entry of value.items)for(const font of entry.fonts||[])fonts.set(font.family,font);value={...value,fonts:fontDescriptors([...fonts.values()]),items:value.items.map(({fonts,...entry})=>entry)};}const result=JSON.stringify(value,null,2);if(result.length>TRANSFER_LIMIT)throw Error('Ontwerpkopie is groter dan 24 MB. Gebruik kleinere afbeeldingsbestanden.');return result;}
export function parseTransfer(source,sanitize){if(typeof source!=='string'||source.length>TRANSFER_LIMIT)throw Error('Ontwerptekst ontbreekt of is groter dan 24 MB.');let value;try{value=JSON.parse(source);}catch{throw Error('Deze ontwerptekst is niet compleet of geen geldige JSON.');}if(value?.format===SELECTION_FORMAT){if(value.version!==1)throw Error('Onbekende selectieversie.');const fonts=fontDescriptors(value.fonts);return selectionTransfer(value.items.map(entry=>({...entry,fonts:entry.fonts||fonts.filter(f=>f.family===textFontFamily(entry.data||{}))})),sanitize);}return portableDesign(value,sanitize);}
