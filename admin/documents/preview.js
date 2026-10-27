import {loading} from "../loading.js";
const images={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',avif:'image/avif',svg:'image/svg+xml'};
export function documentPreviewKind(file){
 const ext=String(file?.name||'').split('.').at(-1).toLowerCase();
 if(ext==='pdf'||file?.type==='application/pdf')return {kind:'pdf',mime:'application/pdf',limit:10_000_000};
 if(images[ext]||Object.values(images).includes(file?.type))return {kind:'image',mime:images[ext]||file.type,limit:20_000_000};
 if(['txt','csv','json'].includes(ext)||file?.type==='text/plain')return {kind:'text',mime:'text/plain',limit:1_000_000};
 return null;
}
export function previewDocument(files,id){
 const d=files.find(f=>f.id===id&&!f.internalDesign);if(!d)return null;if(documentPreviewKind(d))return d;
 if(!/\.docx$/i.test(d.name)||!d.generated?.generationId)return null;
 const g=d.generated,candidates=files.filter(f=>!f.internalDesign&&f.ownerId===d.ownerId&&f.generated?.generationId===g.generationId&&f.generated?.kind===g.kind&&f.generated?.number===g.number&&documentPreviewKind(f)?.kind==='pdf');
 return candidates.length===1?candidates[0]:null;
}
export async function previewPdfData(blob){
 if(!(blob instanceof Blob)||blob.size>10_000_000||(await blob.slice(0,5).text())!=='%PDF-')throw Error('Kies een geldige PDF van maximaal 10 MB.');
 const bytes=new Uint8Array(await blob.arrayBuffer()),parts=[];for(let i=0;i<bytes.length;i+=8192)parts.push(String.fromCharCode(...bytes.subarray(i,i+8192)));return btoa(parts.join(''));
}
export async function loadPdfPreview(data,page,{signal,fetchImpl=globalThis.fetch}={}){
 if(!Number.isInteger(page)||page<1||page>200)throw Error('Ongeldig paginanummer.');
 const response=await fetchImpl('/__local/documents/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,page}),signal}),result=await response.json().catch(()=>({error:'Het PDF-voorbeeld is niet beschikbaar.'}));
 if(!response.ok||result.error)throw Error(result.error||'Het PDF-voorbeeld kon niet worden geladen.');
 if(result.page!==page||!Number.isInteger(result.pages)||result.pages<page||result.pages>200||typeof result.image!=='string'||result.image.length>6_700_000||!/^iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(result.image))throw Error('Het PDF-voorbeeld is onvolledig. Probeer opnieuw.');
 return result;
}
export function createDocumentPreview({getFiles,readFile,openForm,document=globalThis.document,urlAPI=globalThis.URL,pdfPage=loadPdfPreview}){
 let active;
 async function open(id){
  const d=previewDocument(getFiles(),id);if(!d)throw Error('Voor dit bestand is geen voorbeeld beschikbaar. Gebruik Download.');
  const type=documentPreviewKind(d),signature=JSON.stringify(d);active?.dispose();
  let form,objectUrl,observer,resizeObserver,busy=false,page=1,pages=1,encoded,closed=false;const cache=new Map(),controller=new AbortController();
  const dispose=()=>{if(closed)return;closed=true;controller.abort();observer?.disconnect();resizeObserver?.disconnect();cache.clear();if(objectUrl)urlAPI.revokeObjectURL(objectUrl);if(active?.form===form)active=null;const dialog=document.querySelector('#dialog');dialog?.classList.remove('document-preview-dialog');dialog?.removeEventListener('close',dispose);};
  openForm('Documentvoorbeeld',`<p class="document-preview-name"></p><div class="saved-document-preview-toolbar"><button type="button" data-preview-prev disabled>← Vorige</button><span data-preview-page></span><button type="button" data-preview-next disabled>Volgende →</button><button type="button" data-preview-zoom-out aria-label="Uitzoomen">−</button><span data-preview-zoom>Hele pagina</span><button type="button" data-preview-fit>Hele pagina</button><button type="button" data-preview-zoom-in aria-label="Inzoomen">+</button></div><p data-preview-status role="status">Voorbeeld laden…</p><div class="actions"><button type="button" data-preview-retry hidden>Opnieuw proberen</button></div><div class="saved-document-preview" aria-busy="true"></div><div class="actions"><button type="button" data-action="download" data-id="${String(d.id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}">Origineel downloaden</button></div>`,async()=>{}, {afterSave:dispose,afterCancel:dispose});
  const dialog=document.querySelector('#dialog');form=dialog.querySelector('form');active={form,dispose};dialog.classList.add('document-preview-dialog');dialog.addEventListener('close',dispose,{once:true});
  const current=()=>!closed&&form.isConnected&&dialog.open;
  const status=form.querySelector('[data-preview-status]'),view=form.querySelector('.saved-document-preview'),prev=form.querySelector('[data-preview-prev]'),next=form.querySelector('[data-preview-next]'),pageLabel=form.querySelector('[data-preview-page]');
  form.querySelector('.document-preview-name').textContent=d.name;form.querySelector('[type=submit]').textContent='Sluiten';form.querySelector('#cancel').hidden=true;
  const Observer=globalThis.MutationObserver;if(Observer){observer=new Observer(()=>{if(!form.isConnected)dispose();});observer.observe(dialog,{childList:true});}
  const retryButton=form.querySelector('[data-preview-retry]');let retryTask=()=>open(d.id);
  function showError(error,task=()=>open(d.id)){if(!current())return;status.textContent=error.message;status.classList.add('danger');retryTask=task;retryButton.hidden=false;}
  retryButton.onclick=async()=>{retryButton.disabled=true;try{await retryTask();}finally{if(current())retryButton.disabled=false;}};
  let zoom=100,fit=true;
  function fitPercent(){const img=view.querySelector('img');if(!img?.naturalWidth||!img.naturalHeight)return 100;return Math.max(1,Math.min(100,(view.clientHeight-30)*img.naturalWidth/img.naturalHeight/Math.max(1,view.clientWidth-30)*100));}
  function paintZoom(){const percent=fit?fitPercent():zoom;view.style.setProperty('--document-preview-width',Math.max(1,view.clientWidth-30)*percent/100+'px');form.querySelector('[data-preview-zoom]').textContent=fit?'Pagina passend':Math.round(zoom)+'%';form.querySelector('[data-preview-fit]').setAttribute('aria-pressed',String(fit));}
  form.querySelector('[data-preview-fit]').onclick=()=>{fit=true;paintZoom();view.scrollTop=0;view.scrollLeft=0;};
  form.querySelector('[data-preview-zoom-out]').onclick=()=>{zoom=Math.max(10,(fit?fitPercent():zoom)-10);fit=false;paintZoom();};form.querySelector('[data-preview-zoom-in]').onclick=()=>{zoom=Math.min(300,(fit?fitPercent():zoom)+10);fit=false;paintZoom();};
  if(globalThis.ResizeObserver){resizeObserver=new ResizeObserver(()=>{if(current())paintZoom();});resizeObserver.observe(view);}
  function prepareImage(img){img.addEventListener('load',()=>{if(current())paintZoom();},{once:true});return img;}
  function valid(){if(JSON.stringify(getFiles().find(f=>f.id===d.id))!==signature)throw Error('Dit document is ondertussen gewijzigd of verwijderd. Open het voorbeeld opnieuw.');}
  async function showPage(wanted){if(busy||!current())return;busy=true;prev.disabled=next.disabled=true;view.setAttribute('aria-busy','true');status.classList.remove('danger');status.textContent='Pagina laden…';retryButton.hidden=true;
   try{const result=cache.get(wanted)||await loading.run('Documentpagina laden…',()=>pdfPage(encoded,wanted,{signal:controller.signal}));if(!current())return;valid();pages=result.pages;page=result.page;cache.set(page,result);if(cache.size>3)cache.delete(cache.keys().next().value);
    const img=prepareImage(document.createElement('img'));img.src='data:image/png;base64,'+result.image;img.alt=d.name+' · pagina '+page+' van '+pages;view.replaceChildren(img);pageLabel.textContent='Pagina '+page+' van '+pages;status.textContent='';
   }catch(error){showError(error,()=>showPage(wanted));}
   finally{busy=false;if(current()){prev.disabled=page<=1;next.disabled=page>=pages;view.setAttribute('aria-busy','false');}}
  }
  prev.onclick=()=>showPage(page-1);next.onclick=()=>showPage(page+1);
  try{await loading.run('Document openen…',async()=>{if(d.size>type.limit)throw Error('Dit bestand is te groot voor een voorbeeld. Gebruik Download.');const file=await readFile(d.id);if(!current())return;valid();const blob=file?.blob;if(!(blob instanceof Blob))throw Error('Het opgeslagen bestand ontbreekt.');if(blob.size>type.limit)throw Error('Dit bestand is te groot voor een voorbeeld. Gebruik Download.');
    if(type.kind==='pdf'){encoded=await previewPdfData(blob);if(current())await showPage(1);}
    else{form.querySelector('.saved-document-preview-toolbar').hidden=type.kind==='text';prev.hidden=next.hidden=pageLabel.hidden=true;
     if(type.kind==='image'){objectUrl=urlAPI.createObjectURL(new Blob([blob],{type:type.mime}));const img=prepareImage(document.createElement('img'));img.src=objectUrl;img.alt=d.name;img.onerror=()=>showError(Error('Deze afbeelding kan niet worden weergegeven.'));view.replaceChildren(img);}
     else{const text=await blob.text();if(!current())return;valid();const pre=document.createElement('pre');pre.textContent=text;view.replaceChildren(pre);}
     if(current()){status.textContent='';view.setAttribute('aria-busy','false');}
    }
   });}catch(error){showError(error);if(current())view.setAttribute('aria-busy','false');}
 }
 return {open,dispose:()=>active?.dispose()};
}
