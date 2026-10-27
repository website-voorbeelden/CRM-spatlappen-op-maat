// Dedicated download tab. Reuses the editor's renderer without starting its
// storage/init/feedback flows; never opens or replaces the originating draft.
export async function runSavedDesignDownload(){
 const params=new URLSearchParams(location.search),kind=params.get('designExport'),box=document.getElementById('previewBoot'),message=document.getElementById('previewBootMessage'),spinner=document.getElementById('previewBootSpinner');
 const app=document.querySelector('.app');app.inert=true;app.setAttribute('aria-hidden','true');
 document.title=kind==='pdf'?'Vector-PDF downloaden':'Klantpreview downloaden';
 const actions=document.createElement('div');actions.className='saved-download-actions';box.append(actions);
 let url='',expired=false;
 const sourceUrl=new URL(location.href);sourceUrl.searchParams.delete('designExport');const savedId=params.get('savedDesign');sourceUrl.searchParams.delete('savedDesign');if(savedId)sourceUrl.hash='local='+encodeURIComponent(savedId);
 const edit=document.createElement('a');edit.href=sourceUrl.href;edit.textContent='Opgeslagen ontwerp bekijken / aanpassen';
 const deadline=setTimeout(()=>{expired=true;spinner.hidden=true;message.textContent='Het maken duurt te lang. Probeer opnieuw; je opgeslagen ontwerp is niet gewijzigd.';actions.replaceChildren(edit);},90000);
 const fingerprint=record=>JSON.stringify(record);
 try{
  if(!['png','pdf'].includes(kind))throw Error('Onbekend downloadformaat.');
  if((await (await storageModule()).storageRuntime()).companyId!=='spatlappen')throw Error('Deze ontwerpdownload hoort bij Spatlappen op maat.');
  let binding=null,record=null;
  const read=async()=>{
   if(params.has('orderId')||params.has('itemId')){
    if(savedId||!params.get('orderId')||!params.get('itemId'))throw Error('De ontwerpselectie is onvolledig. Open de download vanuit het product.');
    const next=await (await productModule()).loadProductDesign(params.get('orderId'),params.get('itemId'),{variantId:params.get('variant')||''});
    if(!next.record)throw Error('Bewaar eerst een ontwerp bij dit product.');
    if(kind==='pdf'&&!params.get('variant')&&next.requiresFinalChoice)throw Error('Kies eerst het definitieve ontwerp bij het product. Een voorstel-PDF staat bij Meer van de variant.');
    return {binding:next,record:next.record};
   }
   if(!savedId)throw Error('Kies eerst een opgeslagen ontwerp.');
   const value=await readLocalDesign(savedId);if(!value?.payload)throw Error('Het opgeslagen ontwerp ontbreekt. Er is niets overschreven.');
   return {binding:null,record:value};
  };
  ({binding,record}=await read());const expected=fingerprint(record),expectedBinding=binding?.signature;
  const dimensions=record.payload?.f;
  if(!dimensions||![dimensions.w,dimensions.h].every(value=>Number.isFinite(Number(value))&&Number(value)>0&&Number(value)<=508))throw Error('De opgeslagen maatvoering is ongeldig. Controleer het ontwerp.');
  if(binding){
   const size=(await productModule()).designMeasurements(dimensions);
   if(size.width!==binding.width||size.height!==binding.height||size.quantity!==null&&size.quantity!==binding.quantity)throw Error('De productmaten of het aantal wijken af van het opgeslagen ontwerp. Open het ontwerp vanuit de order en bewaar eerst de juiste versie.');
  }
  const snapshot=structuredClone(record.payload);
  assertDurableLogoSources(snapshot.l||[]);
  for(const logo of snapshot.l||[]){
   if(logo.svgMarkup){
    if(kind==='pdf')SpatlapVectorExport.parseLogo(logo.svgMarkup);
    else logo.svgMarkup=safeSvgMarkup(logo.svgMarkup);
    logo.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(logo.svgMarkup);
   }
   if(!/^data:image\//i.test(logo.src||''))throw Error('Een logo gebruikt geen ingebedde afbeelding. Open en bewaar het ontwerp opnieuw.');
  }
  if(!applyCompactState(snapshot))throw Error('Het opgeslagen ontwerp is onvolledig.');
  // PNG must not silently omit an unreadable logo. Keep the regular editor's
  // exported pixels, but verify its stored sources before calling that renderer.
  if(kind==='png')await Promise.all(state.logos.map(logo=>new Promise((resolve,reject)=>{
   let src=logo.src;
   if(logo.svgMarkup)src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(safeSvgMarkup(logo.svgMarkup));
   if(!/^data:image\//i.test(src||'')){reject(Error('Een logo gebruikt geen ingebedde afbeelding. Open en bewaar het ontwerp opnieuw.'));return;}
   logo.src=src;const img=new Image(),timer=setTimeout(()=>reject(Error('Een logo kon niet op tijd worden geladen.')),15000);
   img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(Error('Een opgeslagen logo kan niet worden gelezen.'));};img.src=src;
  })));
  message.textContent=kind==='pdf'?'Vector-PDF op ware grootte maken…':'Klantpreview maken…';
  await customFontReady;
  if(kind==='png')for(const text of state.texts){const loaded=await document.fonts.load(`${textWeight(text.weight)} 20px ${printFontFamily(text.font)}`);if(SpatlapVectorExport.families.includes(SpatlapVectorExport.firstFamily(text.font))&&!loaded.length)throw Error('Een opgeslagen lettertype kon niet worden geladen.');}
  await document.fonts.ready;await previewPaintTick();
  const blob=kind==='pdf'?await makeArtworkPdfBlob():await createPreviewPngBlob();
  const latest=await read();if(fingerprint(latest.record)!==expected||latest.binding?.signature!==expectedBinding)throw Error('Het opgeslagen ontwerp of product is intussen gewijzigd. Start de download opnieuw voor de nieuwste versie.');
  if(expired)return;
  const name=String(record.name||'ontwerp').replace(/[^\p{L}\p{N}._-]+/gu,'-').slice(0,80)||'ontwerp';
  const filename=(kind==='pdf'?'drukbestand-vector-':'klantpreview-')+name+'-'+state.flap.w+'x'+state.flap.h+'cm.'+kind;
  url=URL.createObjectURL(blob);const download=document.createElement('a');download.href=url;download.download=filename;download.textContent=kind==='pdf'?'Vector-PDF downloaden':'Klantpreview downloaden';
  actions.replaceChildren(download,edit);message.textContent='Bestand klaar. Klik op downloaden als de download niet automatisch begint. Je opgeslagen ontwerp is niet gewijzigd.';download.click();
 }catch(error){
  if(expired)return;
  message.textContent=error.message||'Download maken lukt niet.';
  const issues=error.issues||[];if(issues.length){const list=document.createElement('ul');list.className='saved-download-issues';for(const issue of issues){const li=document.createElement('li');li.textContent=issue.message;list.append(li);}actions.replaceChildren(list,edit);}else actions.replaceChildren(edit);
 }finally{clearTimeout(deadline);spinner.hidden=true;}
 window.addEventListener('pagehide',()=>{if(url)URL.revokeObjectURL(url);},{once:true});
}
