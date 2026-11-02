// The drop target owns the event; never forward a financial source to the
// general document uploader. Retain the File in the existing intake session.
export function installInvoiceDrop(form,{current=()=>form.isConnected,isBusy=()=>false,onFile,onError}={}){
 const zone=form.querySelector('[data-invoice-drop]');if(!zone)return;
 const files=event=>Array.from(event.dataTransfer?.types||[]).includes('Files');
 const clear=()=>zone.classList.remove('is-drag-over');
 zone.addEventListener('dragenter',event=>{if(!files(event))return;event.preventDefault();event.stopPropagation();if(!isBusy())zone.classList.add('is-drag-over');});
 zone.addEventListener('dragover',event=>{event.preventDefault();event.stopPropagation();if(event.dataTransfer)event.dataTransfer.dropEffect=files(event)&&!isBusy()?'copy':'none';if(files(event)&&!isBusy())zone.classList.add('is-drag-over');});
 zone.addEventListener('dragleave',event=>{event.stopPropagation();if(!zone.contains(event.relatedTarget))clear();});
 form.addEventListener('dragend',clear);
 zone.addEventListener('drop',async event=>{
  event.preventDefault();event.stopPropagation();clear();if(!current())return;
  if(isBusy()){onError?.(Error('Wacht tot de huidige factuuractie klaar is. Je eerdere PDF en invoer zijn behouden.'));return;}
  const selected=Array.from(event.dataTransfer?.files||[]);
  if(selected.length!==1){onError?.(Error('Sleep één gedownloade PDF uit Finder of Downloads naar dit vak. Een link, map of meerdere bestanden worden niet overgenomen.'));return;}
  const file=selected[0];
  if(!file.size||file.size>15*1024*1024||! /\.pdf$/i.test(file.name)||file.name.length>240){onError?.(Error('Gebruik één PDF van maximaal 15 MB met een bestandsnaam van maximaal 240 tekens. Je eerdere bestand blijft behouden.'));return;}
  form.inert=true;form.setAttribute('aria-busy','true');let locked=true;
  const release=()=>{if(!locked)return;locked=false;form.inert=false;form.removeAttribute('aria-busy');};
  try{
   if(await file.slice(0,5).text()!=='%PDF-')throw Error('Dit bestand heeft geen PDF-header. Je eerdere PDF en invoer zijn behouden.');
   if(!current())return;release();await onFile(file);
  }catch(error){release();if(current())onError?.(error);}
  finally{release();}
 });
}
