// Temporary font experiments never mutate artwork or history until a choice is applied.
let fontPreviewOverride=null,fontHoverRevision=0,customFontReady=Promise.resolve(),fontOptionsSignature='',pendingTextFrame=0,fontUsage={};
const fontPreviewLoads=new Map();
try{fontUsage=JSON.parse(localStorage.getItem('spatlap-font-use-v1')||'{}');if(!fontUsage||typeof fontUsage!=='object'||Array.isArray(fontUsage))fontUsage={};}catch{}
function fontIsSingle(font){return ['Metal Mania','Rye','Germania One','Bungee','Fredericka the Great','Ewert'].includes(SpatlapVectorExport.firstFamily(font))||/^CRMFont_/.test(SpatlapVectorExport.firstFamily(font));}
function sortFontOptions(select){if(!select)return;const value=select.value;for(const option of [...select.options].sort((a,b)=>(Number(fontUsage[b.value])||0)-(Number(fontUsage[a.value])||0)))select.append(option);select.value=value;}
function rememberFont(font){if(typeof font!=='string'||font.length>200)return;fontUsage[font]=Math.min(100000,(Number(fontUsage[font])||0)+1);fontUsage=Object.fromEntries(Object.entries(fontUsage).sort((a,b)=>(Number(b[1])||0)-(Number(a[1])||0)).slice(0,100));try{localStorage.setItem('spatlap-font-use-v1',JSON.stringify(fontUsage));}catch{}for(const id of ['textFont','editTextFont'])sortFontOptions($(id));}
function syncCustomFontOptions(){
 refreshCustomFontManager();
 const fonts=state.ui?.customFonts||[],signature=JSON.stringify(fonts.map(f=>[f.family,f.name]));if(signature===fontOptionsSignature)return; fontOptionsSignature=signature;
 for(const id of ['textFont','editTextFont']){const select=$(id),value=select.value;select.querySelectorAll('[data-custom-font]').forEach(option=>option.remove());for(const font of fonts){const option=new Option(font.name+' · eigen font',font.family);option.dataset.customFont='1';select.add(option);}if([...select.options].some(o=>o.value===value))select.value=value;sortFontOptions(select);select.dispatchEvent(new Event('fontoptionschange'));}
}
function restoreDesignFonts(){
 const ui=state.ui;syncCustomFontOptions();customFontReady=SpatlapVectorExport.ensureCustomFonts(ui?.customFonts||[]).then(()=>{if(state.ui===ui){invalidateTextInkMetrics();SpatlapVectorExport.discardUnusedCustomFonts(ui?.customFonts||[]);syncSelectionControls();render();}});customFontReady.catch(error=>{if(state.ui===ui)toast(error.message);});return customFontReady;
}
function displayTextObject(text){return state.selectedType==='text'&&state.selected===text.id&&fontPreviewOverride?.id===text.id?{...text,font:fontPreviewOverride.font,weight:fontIsSingle(fontPreviewOverride.font)?400:text.weight}:text;}
function refreshTextArtwork(text){
 const el=layoutElement({id:text.id,type:'text'});if(!el)return;
 const shown=displayTextObject(text),scale=scaleFactor();el.textContent=shown.text;el.style.fontFamily=printFontFamily(shown.font);el.style.fontSize=shown.size*scale+'px';el.style.fontWeight=String(textWeight(shown.weight));el.style.letterSpacing=textTracking(shown.tracking)*scale+'px';el.style.textAlign=shown.align||'center';el.style.color=shown.color;
 el.style.fontKerning=textTracking(shown.tracking)?'none':'auto';el.style.filter='';applyOutlinePreview(el,shown,scale);el.classList.remove('tight-text');
 if(shown.tightBounds&&!/[\r\n]/.test(shown.text)&&!artworkRotation(shown)&&!shown.flipX){const box=textInkRect(shown,el),frame=el.getBoundingClientRect();el.classList.add('tight-text');for(const [key,value]of Object.entries({left:box.left-frame.left,top:box.top-frame.top,width:box.right-box.left,height:box.bottom-box.top}))el.style.setProperty('--ink-'+key,value+'px');}
 syncSelectionDimensions();
}
function scheduleTextArtwork(text){if(pendingTextFrame)cancelAnimationFrame(pendingTextFrame);pendingTextFrame=requestAnimationFrame(()=>{pendingTextFrame=0;if(itemById(text.id,'text')===text){refreshTextArtwork(text);const index=state.texts.indexOf(text),label=$('textList').children[index]?.querySelector('span');if(label)label.textContent='Tekst '+(index+1)+': '+text.text.substring(0,24);}});}
function previewArtworkFont(font){
 const text=state.selectedType==='text'?itemById(state.selected,'text'):null;if(!text)return;
 if(fontPreviewOverride?.id===text.id&&fontPreviewOverride.font===font)return;
 const revision=++fontHoverRevision; fontPreviewOverride={id:text.id,font};const badge=$('experimentBadge');badge.hidden=false;badge.textContent='Lettertypevoorbeeld · nog niet gekozen';refreshTextArtwork(text);
 const key=`${fontIsSingle(font)?400:textWeight(text.weight)} 30px ${printFontFamily(font)}`;if(document.fonts.check(key))return;let pending=fontPreviewLoads.get(key);if(!pending){pending=document.fonts.load(key);fontPreviewLoads.set(key,pending);if(fontPreviewLoads.size>128)fontPreviewLoads.delete(fontPreviewLoads.keys().next().value);pending.catch(()=>{if(fontPreviewLoads.get(key)===pending)fontPreviewLoads.delete(key);});}
 pending.then(()=>{if(revision===fontHoverRevision&&itemById(text.id,'text')===text){invalidateTextInkMetrics();refreshTextArtwork(text);}}).catch(()=>{});
}
function clearArtworkFontPreview(){fontHoverRevision++;const id=fontPreviewOverride?.id;fontPreviewOverride=null;let compared=false;for(const key of ['textFontPreview','editTextFontPreview']){const preview=$(key);if(preview?.dataset.comparisonFont){delete preview.dataset.comparisonFont;compared=true;}}if(compared)updateFontPreviews();const badge=$('experimentBadge');if(badge){badge.hidden=!vectorExperiment;badge.textContent='Vectorvoorbeeld · nog niet toegepast';}const text=id&&itemById(id,'text');if(text)refreshTextArtwork(text);}
function refreshCustomFontManager(){
 const host=$('customFontManager');if(!host)return;
 const fonts=state.ui?.customFonts||[],signature=JSON.stringify(fonts.map(font=>[font.family,font.name,state.texts.filter(text=>SpatlapVectorExport.firstFamily(text.font)===font.family).length]));
 if(host.dataset.signature===signature)return;host.dataset.signature=signature;host.replaceChildren();
 if(!fonts.length){host.textContent='Nog geen eigen lettertypen in dit ontwerp.';return;}
 for(const font of fonts){
  const count=state.texts.filter(text=>SpatlapVectorExport.firstFamily(text.font)===font.family).length,row=document.createElement('div'),label=document.createElement('span'),remove=document.createElement('button');row.className='custom-font-row';label.textContent=font.name+' · '+count+' tekst'+(count===1?'':'en');remove.type='button';remove.textContent='Verwijderen';remove.disabled=count>0;remove.title=count?'Kies eerst een ander lettertype voor deze teksten.':'Verwijder dit ongebruikte font; ongedaan maken blijft mogelijk.';
  remove.onclick=()=>{if(state.texts.some(text=>SpatlapVectorExport.firstFamily(text.font)===font.family)){refreshCustomFontManager();return;}clearArtworkFontPreview();pushHistory();state.ui.customFonts=(state.ui.customFonts||[]).filter(entry=>entry.family!==font.family);syncCustomFontOptions();void restoreDesignFonts();};row.append(label,remove);host.append(row);
 }
}
function installFontTools(){
 document.fonts.addEventListener?.('loadingdone',invalidateTextInkMetrics);
 const controls=$('textControls').querySelector('.subdetails-body');
 const caps=document.createElement('button');caps.type='button';caps.textContent='Tekst in HOOFDLETTERS';caps.onclick=()=>{const text=itemById(state.selected,'text');if(!text||text.text===text.text.toLocaleUpperCase('nl'))return;clearArtworkFontPreview();pushHistory();text.text=text.text.toLocaleUpperCase('nl');syncSelectionControls();render();};controls.prepend(caps);
 const help=document.createElement('details');help.className='subdetails';const summary=document.createElement('summary');summary.textContent='Eigen lettertype importeren';help.append(summary);
 const label=document.createElement('label');label.textContent='TTF of OTF · maximaal 2 MB';const input=document.createElement('input');input.type='file';input.accept='.ttf,.otf';label.append(input);const status=document.createElement('p');status.className='field-help';status.setAttribute('role','status');
 input.onchange=async()=>{
  const file=input.files?.[0];input.value='';if(!file)return;
  const ui=state.ui,target=state.selectedType==='text'?itemById(state.selected,'text'):null,targetFont=target?.font,activity=beginPreviewActivity('Lettertype laden…');input.disabled=true;
  try{
   const imported=await SpatlapVectorExport.importFontFile(file);
   if(state.ui!==ui)throw Error('Het ontwerp is intussen gewijzigd. Importeer het lettertype opnieuw.');
   const fonts=state.ui.customFonts||[],existing=fonts.find(font=>font.data.slice(font.data.indexOf(',')+1)===imported.data.slice(imported.data.indexOf(',')+1)),descriptor=existing||imported;
   if(!existing&&fonts.length>=5)throw Error('Maximaal vijf eigen lettertypen per ontwerp. Verwijder hieronder een ongebruikt font om ruimte te maken.');
   const apply=target&&state.selectedType==='text'&&state.selected===target.id&&itemById(target.id,'text')===target&&target.font===targetFont;
   clearArtworkFontPreview();
   if(!existing||apply&&(target.font!==descriptor.family||target.weight!==400))pushHistory();
   if(!existing)state.ui.customFonts=[...fonts,descriptor];
   syncCustomFontOptions();$('textFont').value=descriptor.family;
   if(apply){target.font=descriptor.family;target.weight=400;rememberFont(descriptor.family);}
   syncSelectionControls();render();await restoreDesignFonts();
   if(state.ui!==ui){activity.cancel('Ontwerp gewisseld; de huidige versie is behouden.');return;}
   status.textContent=existing?'Dit font stond al in het ontwerp en is opnieuw gekozen.':'Lettertype toegevoegd. Het bestand reist mee met dit ontwerp en de PDF.';activity.success(existing?'Bestaand eigen lettertype gekozen.':'Eigen lettertype toegevoegd.');
  }catch(error){status.textContent=error.message;activity.error(error);}
  finally{input.disabled=false;SpatlapVectorExport.discardUnusedCustomFonts(state.ui?.customFonts||[]);}
 };
 const manager=document.createElement('div');manager.id='customFontManager';
 const note=document.createElement('p');note.className='field-help';note.textContent='Gebruik een font dat je voor dit ontwerp mag gebruiken. Het fontbestand wordt met het ontwerp bewaard; tekst blijft bewerkbaar. Kies een statisch font met gewone contouren. Variabele, kleuren- en bitmapfonts worden niet geïmporteerd.';help.append(label,status,manager,note);$('textSection').querySelector('.section-body').append(help);refreshCustomFontManager();
}

async function requireDesignFonts(){await customFontReady.catch(()=>{});for(const text of state.texts){const family=SpatlapVectorExport.firstFamily(text.font);if(/^CRMFont_/.test(family)&&!(state.ui?.customFonts||[]).some(f=>f.family===family))throw Error('Het eigen lettertype ontbreekt bij deze tekst. Importeer het font opnieuw of kies een beschikbaar lettertype.');}await SpatlapVectorExport.ensureCustomFonts(state.ui?.customFonts||[]);await SpatlapVectorExport.validateCustomTextFonts(state.texts,state.ui?.customFonts||[]);}
