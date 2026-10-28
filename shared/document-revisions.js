const editable=new Set(['quote','confirmation','proforma','packing']);
export const documentVersion=d=>Number.isSafeInteger(d.generated?.revision)&&d.generated.revision>0?d.generated.revision:1;
export function documentSeriesKey(d){const g=d.generated;return g?.generationId?JSON.stringify([d.ownerId,g.kind,g.number,g.seriesId||g.generationId]):'file:'+d.id;}
// Replacing an editable document keeps its download name, not its old bytes.
// Different series (and every new invoice) retain their own original name.
export function documentDownloadName(documents,document){
 if(!editable.has(document?.generated?.kind)||!document.generated.generationId)return document?.name||'document';
 const family=documents.filter(d=>documentSeriesKey(d)===documentSeriesKey(document)&&d.type===document.type).sort((a,b)=>documentVersion(a)-documentVersion(b));
 const first=family[0]||document,name=first.name||document.name;
 const suffix='_v'+documentVersion(first),dot=name.lastIndexOf('.');
 return documentVersion(first)>1&&dot>suffix.length&&name.slice(0,dot).endsWith(suffix)?name.slice(0,dot-suffix.length)+name.slice(dot):name;
}
export function documentVersionLabel(documents,d){const older=documents.some(other=>documentSeriesKey(other)===documentSeriesKey(d)&&documentVersion(other)>documentVersion(d));return older?' · eerdere versie '+documentVersion(d):documentVersion(d)>1?' · versie '+documentVersion(d):'';}
export function revisionSource(state,id,companyId){
 const document=state.documents.find(d=>d.id===id),g=document?.generated;
 if(!document||!editable.has(g?.kind)||!g.generationId||!g.payload||g.payload.kind!==g.kind||g.payload.number!==g.number)throw Error('Dit bestand heeft geen bewaarde bewerkbare documentgegevens.');
 const p=g.payload;
 if(!p.fields||typeof p.fields!=='object'||Array.isArray(p.fields)||!Array.isArray(p.items)||!p.items.length||p.items.length>40||p.items.some(i=>typeof i.description!=='string'||!Number.isSafeInteger(i.quantity)||i.quantity<1||!Array.isArray(i.details)||i.details.some(d=>typeof d!=='string')||(g.kind==='packing'?!Number.isSafeInteger(i.deliveredQuantity)||i.deliveredQuantity<0||i.deliveredQuantity>i.quantity:!Number.isSafeInteger(i.price)||i.price<0)))throw Error('De bewaarde productgegevens zijn onvolledig. Maak een nieuw document vanuit de order.');
 if(!['spatlappen','maatwerkkunststof'].includes(companyId))throw Error('Dit documenttype is voor dit bedrijf nog niet ingericht.');
 const order=state.orders.find(o=>o.id===document.ownerId);if(!order)throw Error('De bijbehorende order bestaat niet meer.');
 const family=state.documents.filter(d=>documentSeriesKey(d)===documentSeriesKey(document));
 const current=Math.max(...family.map(documentVersion));if(documentVersion(document)!==current)throw Error('Er is een nieuwere versie. Open Aanpassen bij de nieuwste versie.');
 const peers=family.filter(d=>d.generated.generationId===g.generationId);
 if(peers.length>2||new Set(peers.map(d=>d.type)).size!==peers.length||peers.some(d=>d.generated.payload&&JSON.stringify(d.generated.payload)!==JSON.stringify(g.payload)))throw Error('De bronbestanden zijn niet eenduidig. Controleer dit document eerst.');
 if(family.some(d=>documentVersion(d)===current&&d.generated.generationId!==g.generationId))throw Error('Er zijn twee gelijke versies. Controleer het document eerst.');
 return {document,payload:structuredClone(g.payload),revision:current+1,seriesId:g.seriesId||g.generationId,signature:JSON.stringify([order,family])};
}
export function canReviseDocument(state,id,companyId){try{revisionSource(state,id,companyId);return true;}catch{return false;}}
export function appendDocumentRevision(state,id,expected,{companyId,payload,date,files,generationId,templateRevision,now=new Date().toISOString()}){
 const source=revisionSource(state,id,companyId);if(source.signature!==expected)throw Error('De order of documentversie is ondertussen gewijzigd. Open Aanpassen opnieuw.');
 if(payload?.kind!==source.payload.kind||payload?.number!==source.payload.number||!/^\d{4}-\d{2}-\d{2}$/.test(date)||(!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw Error('Controleer documenttype, nummer en datum.');
 if(!generationId||state.documents.some(d=>d.generated?.generationId===generationId)||!Array.isArray(files)||files.length!==2||new Set(files.map(f=>f.type)).size!==2||!files.some(f=>f.type==='application/pdf')||!files.some(f=>f.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'))throw Error('PDF en Word moeten samen als nieuwe versie worden bewaard.');
 if(new Set(files.map(f=>f.id)).size!==2||files.some(f=>!f.id||state.documents.some(d=>d.id===f.id)||!Number.isSafeInteger(f.size)||f.size<=0))throw Error('De nieuwe bestanden zijn ongeldig.');
 const added=files.map(file=>{
  const previous=state.documents.find(d=>documentSeriesKey(d)===documentSeriesKey(source.document)&&d.type===file.type);
  return {...file,...(previous?{name:documentDownloadName(state.documents,previous)}:{}),ownerId:source.document.ownerId,category:source.document.category,date,createdAt:now,generated:{...(templateRevision?{templateRevision}:{}),kind:payload.kind,number:payload.number,generationId,seriesId:source.seriesId,revision:source.revision,revisionOf:source.document.generated.generationId,payload:structuredClone(payload)}};
 });
 state.documents.push(...added);
 return {documents:added,revision:source.revision};
}
