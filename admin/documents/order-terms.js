import {termsDocumentFor} from '../../shared/company-documents.js?v=ui-batch234-20261027';

// The supplied PDF is kept unchanged. No attachment/state write until an explicit
// Add action; no mail is sent here. Each factory reads the same live context.
export function createOrderTerms(context){
 const config=()=>termsDocumentFor(context.company.id);
 function button(orderId,label='Algemene voorwaarden'){
  return config()?`<button type="button" data-order-terms="${context.esc(orderId)}">${context.esc(label)}</button>`:'';
 }
 function markup(orderId){
  const asset=config();if(!asset)return '';
  return `<section class="order-terms"><div><h3>${asset.title}</h3><p>Maatwerkkunststof · ${asset.edition} · PDF</p></div>${button(orderId,'Downloaden / gebruiken')}</section>`;
 }
 async function readFile(){
  const asset=config();if(!asset)throw Error('Geen algemene voorwaarden voor dit bedrijf ingesteld.');
  const response=await fetch(asset.url,{credentials:'same-origin',redirect:'error',cache:'no-store'});
  if(!response.ok)throw Error('De algemene voorwaarden zijn nu niet beschikbaar.');
  const blob=await response.blob();
  if(!blob.size||blob.size>4_000_000||await blob.slice(0,5).text()!=='%PDF-')throw Error('De algemene voorwaarden zijn geen bruikbare PDF van maximaal 4 MB.');
  return new File([blob],asset.name,{type:'application/pdf'});
 }
 async function ensureAttachment(orderId,{file=null,maximumSize=4_000_000}={}){
  const asset=config();if(!asset||!context.order(orderId))throw Error('Open een bestaande order van Maatwerkkunststof.');
  const pdf=file||await readFile();if(pdf.size>maximumSize)throw Error('Extra bijlagen mogen samen maximaal 8 MB zijn.');let next,record;
  await new Promise((resolve,reject)=>{
   context.beginLocalStateChange();const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),fs=tx.objectStore('files'),request=ss.get('main');
   request.onsuccess=()=>{try{
    next=request.result;if(!next?.orders.some(o=>o.id===orderId))throw Error('Deze order bestaat niet meer.');
    record=next.documents.find(d=>d.ownerId===orderId&&d.companyAsset===asset.key);
    if(record){
     if(record.name!==asset.name||record.type!=='application/pdf'||record.size!==pdf.size||record.internalDesign)throw Error('De bewaarde algemene voorwaarden zijn gewijzigd. Controleer het orderdocument.');
     const stored=fs.get(record.id);stored.onsuccess=()=>{if(!stored.result?.blob||stored.result.blob.size!==pdf.size){tx.abort();reject(Error('Het bewaarde bestand ontbreekt. Verwijder die bijlage bij Documenten en voeg de voorwaarden opnieuw toe.'));}};
    }else{
     record={id:context.uid(),ownerId:orderId,companyAsset:asset.key,category:'other',name:asset.name,type:'application/pdf',size:pdf.size,date:context.today(),createdAt:new Date().toISOString()};
     next.documents.push(record);fs.put({id:record.id,blob:pdf});ss.put(next,'main');
    }
   }catch(error){tx.abort();reject(error);}};
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Toevoegen van de voorwaarden afgebroken.'));
  });
  context.state=next;context.notifyDataChanged();return record;
 }
 function open(orderId){
  const asset=config();if(!asset||!context.order(orderId))throw Error('Open een bestaande order van Maatwerkkunststof.');
  if(document.querySelector('dialog[open]'))throw Error('Bewaar of sluit eerst je huidige invoer.');
  context.openForm('Algemene voorwaarden',`<p class="terms-file-name"><strong>${asset.name}</strong><br>Maatwerkkunststof · ${asset.edition}</p><div class="actions"><a class="download-button" href="${asset.url}" download="${asset.name}">PDF downloaden</a><button type="button" data-terms-copy disabled>Bestand kopiëren</button></div><button type="button" class="terms-drag" data-terms-drag disabled draggable="false">Sleep deze PDF naar je mail</button><p class="form-help">Slepen en plakken hangen af van je browser en mailprogramma. Lukt het niet? Download de PDF en voeg hem vanuit Downloads toe.</p><p role="status" data-terms-status>PDF klaarzetten…</p>`,async()=>{
   const record=await ensureAttachment(orderId,{file});returnRecord=record;
  },{trackChanges:false,afterSave:()=>context.emailDraftForm(orderId,'','','',{newMail:true,attachmentIds:[returnRecord.id]}).catch(error=>context.toast(error.message))});
  const form=context.$('#dialog form'),copy=form.querySelector('[data-terms-copy]'),drag=form.querySelector('[data-terms-drag]'),status=form.querySelector('[data-terms-status]'),submit=form.querySelector('[type=submit]');
  let file=null,returnRecord;submit.textContent='Toevoegen aan nieuwe CRM-mail';submit.disabled=true;
  // Prepare bytes before the user starts dragging; dragstart cannot await reads.
  readFile().then(result=>{if(!form.isConnected||!form.closest('dialog')?.open)return;file=result;submit.disabled=false;copy.disabled=false;drag.disabled=false;drag.draggable=true;status.textContent='PDF gereed. Download, sleep of voeg toe aan een nieuw bericht.';}).catch(error=>{if(form.isConnected)status.textContent=error.message+' Je kunt het downloaden nog proberen.';});
  copy.onclick=async()=>{
   if(!file)return;
   if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined'||!ClipboardItem.supports?.('application/pdf')){status.textContent='Bestanden kopiëren is hier niet beschikbaar. Download de PDF en voeg hem vanuit Downloads toe.';return;}
   copy.disabled=true;try{await navigator.clipboard.write([new ClipboardItem({'application/pdf':file})]);status.textContent='PDF gekopieerd. Plak hem als bijlage in je mailprogramma als dat dit ondersteunt.';}catch{status.textContent='Kopiëren is niet gelukt. Download de PDF om hem toe te voegen.';}finally{copy.disabled=false;}
  };
  drag.ondragstart=event=>{
   if(!file||!event.dataTransfer){event.preventDefault();return;}
   try{if(!event.dataTransfer.items.add(file))throw Error('Bestand niet toegevoegd');event.dataTransfer.effectAllowed='copy';status.textContent='Laat de PDF los bij de bijlagen van je mail. Controleer of hij daar is toegevoegd.';}
   catch{event.preventDefault();status.textContent='Slepen is hier niet beschikbaar. Gebruik PDF downloaden.';}
  };
 }
 function install(root){for(const control of root.querySelectorAll('[data-order-terms]'))control.onclick=()=>{try{open(control.dataset.orderTerms);}catch(error){context.toast(error.message);}};}
 return {button,markup,open,install,ensureAttachment,available:()=>!!config(),isAttachment:record=>!!config()&&record?.companyAsset===config().key};
}
