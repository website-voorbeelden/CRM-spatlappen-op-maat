// Ordered state initialization and event wiring. Helpers are loaded first by spatlap-preview.html.
const $=id=>document.getElementById(id);
const printFontFamily=value=>SpatlapVectorExport.cssFont(value);
const controls=['w','h','qty','shape','radius','shoulderInset','shoulderTopH','flapColor','holesOn','holeCount','holeShape','topGap','sideGap','holeH','holeW'];
const holesToggleWrap=$('holesOn')?.closest('.summary-toggle');
if(holesToggleWrap){
  holesToggleWrap.addEventListener('click',e=>e.stopPropagation());
  holesToggleWrap.addEventListener('pointerdown',e=>e.stopPropagation());
}

let state={
  logos:[], texts:[], selected:null, selectedType:null,
  flap:{w:190,h:25,qty:'',shape:'bottom',radius:2.5,radiusAuto:true,shoulderAuto:true,shoulderInset:5,shoulderTopH:5,color:'#080808'},
  holes:{on:false,count:6,shape:'round',top:3,side:10,h:1.2,w:2.2},
  ui:{wideMode:false,zones:true,zoneCenter:50,topGuideOn:false,showColorCount:false,manualColorCount:''}
};
let selectionColorTools=null,designTransferTools=null;
const selectionLogoColorCache=new WeakMap();
let vectorEditingLogoId=null,selectedVectorPieceId=null,vectorPieceApi=null;
let pendingLogoReplacement=null,logoReplacementBusy=false;

$('toggleVectorParts').onclick=()=>{
  const logo=itemById(state.selected,'logo');if(!logo?.svgMarkup)return;
  $('vectorPieceStatus').textContent='';
  if(vectorEditingLogoId===logo.id){clearVectorEditing();syncSelectionControls();render();return;}
  try{
    const prepared=SpatlapVectorEditor.prepare(logo.svgMarkup);pushHistory();
    rememberVectorOriginal(logo);
    updateVectorSource(logo,prepared.markup);vectorEditingLogoId=logo.id;selectedVectorPieceId=prepared.first;
    render();syncSelectionControls();
  }catch(error){$('vectorPieceStatus').textContent=error.message||'Dit vectorlogo kon niet worden geopend.';}
};
$('shrinkVectorPart').onclick=()=>mutateVectorPiece(api=>api.scaleBy(.9),true);
$('growVectorPart').onclick=()=>mutateVectorPiece(api=>api.scaleBy(1.1),true);
$('wholeLogoColor').addEventListener('input',()=>{$('wholeLogoColorHex').value=normalizeHex($('wholeLogoColor').value);});
$('wholeLogoColorHex').addEventListener('change',()=>{
  if(/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test($('wholeLogoColorHex').value.trim())){
    const hex=normalizeHex($('wholeLogoColorHex').value);$('wholeLogoColor').value=hex;$('wholeLogoColorHex').value=hex;
  }
});
$('applyWholeLogoColor').onclick=()=>{
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;if(!logo?.svgMarkup)return;
  const status=$('wholeLogoColorStatus');status.dataset.logoId=logo.id;
  try{
    if(typeof window.SpatlapVectorEditor?.recolour!=='function')throw new Error('De vectorcode is nog niet bijgewerkt. Bewaar je ontwerp en ververs de pagina.');
    const value=$('wholeLogoColorHex').value.trim();
    if(!/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value))throw new Error('Vul een geldige HEX-kleur in, bijvoorbeeld #FFFFFF.');
    const hex=normalizeHex(value),root=SpatlapVectorEditor.recolour(logo.svgMarkup,hex);
    pushHistory();rememberVectorOriginal(logo);clearVectorEditing();applyVectorRoot(logo,root);
    logo.printColors=SpatlapVectorEditor.printColours(root)??[hex];
    $('wholeLogoColor').value=hex;$('wholeLogoColorHex').value=hex;
    syncSelectionControls();render();status.textContent=`Het hele logo heeft nu kleur ${hex}.`;
    toast('Kleur van hele logo aangepast');
  }catch(error){status.textContent=error.message||'Kleur aanpassen lukte niet.';}
};
$('restoreVectorOriginal').onclick=()=>{
  const logo=itemById(state.selected,'logo');if(!logo?.originalVectorMarkup)return;
  pushHistory();updateVectorSource(logo,logo.originalVectorMarkup);
  const frame=logo.originalVectorFrame;
  if(frame){for(const key of ['x','y','w','h','ratio'])logo[key]=frame[key];if(frame.vectorCrop)logo.vectorCrop={...frame.vectorCrop};else delete logo.vectorCrop;}
  if(logo.originalVectorPrintColors)logo.printColors=logo.originalVectorPrintColors.slice();else delete logo.printColors;
  discardVectorEditBackup(logo);syncSelectionControls();render();toast('Oorspronkelijk vectorlogo hersteld');
};
$('vectorPartSelect').addEventListener('change',()=>vectorPieceApi?.select($('vectorPartSelect').value));

$('vectorPartFill').addEventListener('change',()=>mutateVectorPiece(api=>api.paint('fill',$('vectorPartFill').value)));
$('vectorPartFillOn').addEventListener('change',()=>mutateVectorPiece(api=>api.paint('fill',$('vectorPartFillOn').checked?$('vectorPartFill').value:'none')));
$('vectorPartStroke').addEventListener('change',()=>mutateVectorPiece(api=>api.paint('stroke',$('vectorPartStroke').value)));
for(const id of ['vectorPartX','vectorPartY'])$(id).addEventListener('change',()=>{
  const x=Number($('vectorPartX').value),y=Number($('vectorPartY').value);
  if(!Number.isFinite(x)||!Number.isFinite(y)){syncVectorPiecePosition();return;}
  mutateVectorPiece(api=>api.moveTo(x,y),true);
});
$('resetVectorPartPosition').onclick=()=>mutateVectorPiece(api=>api.moveTo(0,0),true);
$('duplicateVectorPart').onclick=()=>mutateVectorPiece(api=>api.duplicate(),true);
$('deleteVectorPart').onclick=()=>mutateVectorPiece(api=>api.remove(),true);

let history=[];
let redoHistory=[];
let suppressHistory=false;
let drag=null;
let suppressClickAfterDrag=false;
let multiSelection=[]; // array of {id,type}; primary selection remains state.selected/state.selectedType
let internalClipboard=[];
let pendingHeightMatch=null;
let selectionRatioLocked=true;
let previewZoom=1;
let spacePanHeld=false,previewPan=null,suppressPanClick=false;

$('undo').onclick=undo;
$('redo').onclick=redo;

let toastTimer=null;
// Immediate, screen-visible feedback; completion follows the actual promise.
const previewButtonActivities=new WeakMap();
const previewActivities=new Map();let previewActivityId=0,previewActivityResult=null,previewActivityTimer=null;

$('previewActivityClose').onclick=()=>{previewActivityResult=null;paintPreviewActivity();};

let previewScrollFrame=0;
window.addEventListener('scroll',()=>{if(previewScrollFrame)return;previewScrollFrame=requestAnimationFrame(()=>{previewScrollFrame=0;updateMobilePreviewTop();});},{passive:true});

$('zoomIn').onclick=()=>setPreviewZoom(previewZoom*1.25);
$('zoomOut').onclick=()=>setPreviewZoom(previewZoom/1.25);
$('zoomReset').onclick=()=>setPreviewZoom(1);
$('previewWrap').addEventListener('wheel',event=>{
  if(!event.ctrlKey&&!event.metaKey)return;
  event.preventDefault();
  setPreviewZoom(previewZoom*(event.deltaY<0?1.15:1/1.15),event.clientX,event.clientY);
},{passive:false});
const previewPanWrap=$('previewWrap');

previewPanWrap.addEventListener('pointerdown',event=>{
  if(!spacePanHeld||event.button!==0)return;
  event.preventDefault();event.stopImmediatePropagation();
  previewPan={id:event.pointerId,x:event.clientX,y:event.clientY,left:previewPanWrap.scrollLeft,top:previewPanWrap.scrollTop};
  previewPanWrap.setPointerCapture(event.pointerId);
  previewPanWrap.classList.add('space-panning');
},true);
previewPanWrap.addEventListener('pointermove',event=>{
  if(!previewPan||event.pointerId!==previewPan.id)return;
  event.preventDefault();event.stopImmediatePropagation();
  previewPanWrap.scrollLeft=previewPan.left+previewPan.x-event.clientX;
  previewPanWrap.scrollTop=previewPan.top+previewPan.y-event.clientY;
},true);
['pointerup','pointercancel','lostpointercapture'].forEach(type=>previewPanWrap.addEventListener(type,event=>{
  if(!previewPan||event.pointerId!==previewPan.id)return;
  event.preventDefault();event.stopImmediatePropagation();stopPreviewPan();
},true));
previewPanWrap.addEventListener('click',event=>{
  if(!spacePanHeld&&!suppressPanClick)return;
  event.preventDefault();event.stopImmediatePropagation();
},true);

window.addEventListener('keydown',event=>{if(savedDesignExportMode)return;
  if(event.code!=='Space'&&event.key!==' '&&event.key!=='Spacebar')return;
  if(event.ctrlKey||event.metaKey||event.altKey||isTypingForPan(event.target))return;
  if($('pdfViewer').classList.contains('open')||$('vectorExportDialog').classList.contains('open'))return;
  event.preventDefault();
  setSpacePanHeld(true);
},true);
window.addEventListener('keypress',event=>{
  if(spacePanHeld&&(event.code==='Space'||event.key===' '||event.key==='Spacebar'))event.preventDefault();
},true);
window.addEventListener('keyup',event=>{
  if(event.code==='Space'||event.key===' '||event.key==='Spacebar')setSpacePanHeld(false);
},true);
window.addEventListener('blur',()=>setSpacePanHeld(false));

controls.forEach(id=>{
  $(id).addEventListener('change',()=>{pushHistory();if(id==='shape'&&$('shape').value==='shoulder'&&state.flap.shape!=='shoulder'&&state.flap.shoulderAuto==null)state.flap.shoulderAuto=true;if(id==='shoulderInset'||id==='shoulderTopH')state.flap.shoulderAuto=false;if(id==='radius')state.flap.radiusAuto=false;readBaseControls();if(state.flap.radiusAuto===true){state.flap.radius=SpatlapLayout.defaultRadius(state.flap.w,state.flap.h);$('radius').value=state.flap.radius;}$('radiusAuto').checked=state.flap.radiusAuto===true;syncAutomaticShoulders();render();});
});

$('radiusAuto').addEventListener('change',()=>{pushHistory();state.flap.radiusAuto=$('radiusAuto').checked;if(state.flap.radiusAuto){state.flap.radius=SpatlapLayout.defaultRadius(state.flap.w,state.flap.h);$('radius').value=state.flap.radius;}render();});

$('shoulderAuto').onchange=()=>{pushHistory();state.flap.shoulderAuto=$('shoulderAuto').checked;syncAutomaticShoulders();render();};

['topGuideOn','showColorCount','manualColorCount'].forEach(id=>{
  $(id).addEventListener('change',()=>{
    pushHistory();
    state.ui.topGuideOn=$('topGuideOn').checked;
    state.ui.showColorCount=$('showColorCount').checked;
    const n=Number($('manualColorCount').value);
    state.ui.manualColorCount=$('manualColorCount').value&&Number.isFinite(n)?Math.max(1,Math.min(99,Math.round(n))):'';
    $('manualColorCount').value=state.ui.manualColorCount;
    render();
  });
});

const vectorStatusCache=new WeakMap();

const pdfJsUrl='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.mjs';
const pdfWorkerUrl='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.mjs';
let pdfJsPromise;

$('replaceLogo').onclick=()=>{
  if(logoReplacementBusy||state.selectedType!=='logo')return;
  pendingLogoReplacement=itemById(state.selected,'logo');
  if(!pendingLogoReplacement)return;
  $('replaceLogoStatus').textContent='';
  $('replacementLogoFile').value='';
  $('replacementLogoFile').click();
};
$('replacementLogoFile').addEventListener('cancel',()=>{pendingLogoReplacement=null;});
$('replacementLogoFile').addEventListener('change',async event=>{
  const file=event.target.files[0],target=pendingLogoReplacement;
  pendingLogoReplacement=null;event.target.value='';
  if(!file||!target||logoReplacementBusy)return;
  const status=$('replaceLogoStatus');status.dataset.logoId=target.id;
  const activity=beginPreviewActivity('Nieuw bestand laden…',['replaceLogo']);
  logoReplacementBusy=true;syncSelectionControls();status.textContent='Nieuw bestand laden...';
  try{
    const data=await readLogoFile(file,false);
    if(!data){status.textContent='Vervangen geannuleerd.';activity.cancel('Vervangen geannuleerd.');return;}
    if(itemById(target.id,'logo')!==target)throw new Error('Dit logo is intussen gewijzigd. Selecteer het opnieuw om het bestand te vervangen.');
    // Preserve the physical frame, including its aspect ratio. Drop backups from the old file.
    const replacement={id:target.id,name:data.name,src:data.src,svgMarkup:data.svgMarkup||null,vector:!!data.vector,
      w:target.w,h:target.h,ratio:target.w/target.h,x:target.x,y:target.y,
      ...(target.rotation!==undefined?{rotation:target.rotation}:{}),...(target.flipX!==undefined?{flipX:target.flipX}:{}),...(target.outline?{outline:{...target.outline}}:{})};
    pushHistory();state.logos[state.logos.indexOf(target)]=replacement;
    clearVectorEditing();clearMultiSelection();state.selected=replacement.id;state.selectedType='logo';
    $('vectorStatus').textContent='';$('vectorPieceStatus').textContent='';
    syncSelectionControls();render();
    status.textContent=`Vervangen door ${data.name}. Formaat en positie behouden.`;
    toast('Logo vervangen');activity.success('Logo vervangen; formaat en positie behouden.');
  }catch(error){activity.error(error);status.textContent=`Vervangen lukte niet: ${error.message||'gebruik PNG, JPG, WebP, SVG of PDF'}`;toast('Logo vervangen lukte niet');}
  finally{logoReplacementBusy=false;syncSelectionControls();}
});

$('file').addEventListener('change',async e=>{
  const files=[...e.target.files];
  if(files.length)await addLogoFiles(files);
  e.target.value='';
});

document.addEventListener('paste',async e=>{if(savedDesignExportMode)return;
  if(e.target instanceof Element&&e.target.closest('input,textarea,[contenteditable="true"]'))return;
  if(designTransferTools?.handlePaste(e))return;
  if(document.querySelector('dialog[open]')||document.querySelector('.app')?.inert)return;
  const files=[...(e.clipboardData?.items||[])]
    .filter(item=>/^image\/(png|jpeg|webp|svg\+xml)$/i.test(item.type))
    .map(item=>item.getAsFile()).filter(Boolean);
  if(!files.length){
    if(internalClipboard.length&&!e.clipboardData?.getData('text/plain')){e.preventDefault();try{pasteInternalClipboard();}catch(error){toast(error.message);}}
    return;
  }
  e.preventDefault();
  await addLogoFiles(files);
});

$('pasteLogo').onclick=async()=>{
  const activity=beginPreviewActivity('Klembord lezen…',['pasteLogo']);
  try{
    if(!navigator.clipboard?.read)throw new Error('Klembord niet beschikbaar');
    const items=await navigator.clipboard.read(),files=[];
    for(const item of items){
      const type=item.types.find(type=>/^image\/(svg\+xml|png|jpeg|webp)$/i.test(type));
      if(!type)continue;
      const blob=await item.getType(type);
      const ext=type==='image/svg+xml'?'svg':type.split('/')[1]==='jpeg'?'jpg':type.split('/')[1];
      files.push(new File([blob],`geplakte-afbeelding-${Date.now()}.${ext}`,{type}));
    }
    if(!files.length)throw new Error('Geen afbeelding op het klembord');
    await addLogoFiles(files);activity.cancel('Klembord verwerkt.');
  }catch(err){
    activity.error(new Error('Klembord niet beschikbaar. Gebruik Ctrl/⌘+V of kies een bestand.'));
    $('pasteLogoStatus').textContent='Plakknop niet beschikbaar in deze browser. Klik buiten een tekstveld en druk op Ctrl/⌘+V.';
  }
};

let vectorPreviewTimer,vectorPreviewToken=0,vectorPreviewLogoId=null,vectorPreviewSource=null,vectorPreviewSettings='',vectorPreviewPaused=false,vectorApplyBusy=false,vectorQuickBusy=false;

['vectorLightThreshold','vectorAlphaThreshold','vectorColorCount','vectorSingleColor','vectorWhiteCutout','vectorEdgeStyle'].forEach(id=>{
  $(id).addEventListener('input',scheduleVectorPreview);
  $(id).addEventListener('change',scheduleVectorPreview);
});

$('whitePngVector').onclick=async()=>{
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;
  if(!logo||logo.svgMarkup&&!logo.originalRasterSrc||vectorApplyBusy||vectorQuickBusy)return;
  const signature=JSON.stringify([logo,state.flap]);vectorQuickBusy=true;
  const btn=$('whitePngVector');btn.disabled=true;
  try{
    const img=new Image();img.src=logo.originalRasterSrc||logo.src;await img.decode();
    const scale=Math.min(1,400/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const context=canvas.getContext('2d',{willReadFrequently:true});
    context.drawImage(img,0,0,canvas.width,canvas.height);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    const maskThreshold=pngMaskThreshold(pixels);
    let keepDark=false;if(maskThreshold===null){
      const corners=[0,canvas.width-1,(canvas.height-1)*canvas.width,canvas.width*canvas.height-1];
      const brightness=corners.reduce((sum,index)=>sum+(pixels[index*4]*.2126+pixels[index*4+1]*.7152+pixels[index*4+2]*.0722),0)/4;keepDark=brightness>127;
    }
    if(state.selectedType!=='logo'||state.selected!==logo.id||itemById(logo.id,'logo')!==logo||JSON.stringify([logo,state.flap])!==signature||vectorApplyBusy)throw Error('Logo of selectie gewijzigd. Start de snelle omzetting opnieuw.');
    $('vectorColorCount').value='1';
    $('vectorSingleColor').value='#ffffff';
    $('vectorAlphaThreshold').value=String(maskThreshold??64);
    $('vectorWhiteCutout').checked=maskThreshold===null;
    scheduleVectorPreview();
    await $('vectorizeLogo').onclick({maxSide:1000,keepDark});
  }catch(err){$('vectorStatus').textContent=`PNG openen lukte niet: ${err.message||'probeer opnieuw'}`;}
  finally{vectorQuickBusy=false;syncSelectionControls();}
};

$('colorTools').addEventListener('toggle',()=>{if($('colorTools').open){vectorPreviewPaused=false;scheduleVectorPreview();}else stopVectorExperiment();});
$('stopVectorExperiment').onclick=stopVectorExperiment;
$('vectorizeLogo').onclick=async(options={})=>{
  if(vectorApplyBusy)return;
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;
  if(!logo){$('vectorStatus').textContent='Selecteer eerst een logo.';return;}
  if(logo.svgMarkup&&!logo.originalRasterSrc){$('vectorStatus').textContent='Dit SVG-logo is al vector. Upload de originele PNG/JPG om kleuren te beperken.';return;}
  const count=Math.max(1,Math.min(8,Math.round(Number($('vectorColorCount').value)||1)));
  const singleColor=normalizeHex($('vectorSingleColor').value);
  const whiteCutout=$('vectorWhiteCutout').checked;
  const edgeStyle=$('vectorEdgeStyle').value;
  const lightThreshold=Math.max(0,Math.min(255,Math.round(Number($('vectorLightThreshold').value)||0)));
  const alphaThreshold=Math.max(1,Math.min(255,Math.round(Number($('vectorAlphaThreshold').value)||1)));
  const signature=JSON.stringify([logo,state.flap]),settings=vectorSettingsSignature();
  vectorApplyBusy=true;vectorPreviewPaused=false;vectorPreviewToken++;clearTimeout(vectorPreviewTimer);vectorExperiment=null;render();
  const activity=beginPreviewActivity('Logo naar vector omzetten…',['vectorizeLogo']);
  const btn=$('vectorizeLogo');btn.disabled=true;$('vectorStatus').textContent='Logo omzetten...';
  try{
    await previewPaintTick();
    const result=await vectorizeRasterLogo(logo,count,singleColor,whiteCutout,edgeStyle,lightThreshold,alphaThreshold,options.maxSide,options.keepDark===true);
    if(vectorPreviewPaused){$('vectorStatus').textContent='Omzetten gestopt; het oorspronkelijke artwork is behouden.';activity.cancel('Omzetten gestopt; het oorspronkelijke artwork is behouden.');return;}
    if(state.selectedType!=='logo'||state.selected!==logo.id||itemById(logo.id,'logo')!==logo||JSON.stringify([logo,state.flap])!==signature||vectorSettingsSignature()!==settings)throw Error('Logo, selectie of instellingen zijn gewijzigd. Het oorspronkelijke artwork is behouden.');
    pushHistory();const next=traceLogoObject(logo,result);if(!next.originalRasterSrc)next.originalRasterSrc=logo.src;Object.assign(logo,next);vectorExperiment=null;vectorPreviewPaused=true;discardVectorEditBackup(logo);
    $('vectorStatus').textContent=`Vectorlogo gemaakt met ${result.colors.length} kleuren: ${result.colors.join(', ')}. Controleer de preview.`;
    syncSelectionControls();
    render();activity.success('Vectorlogo gemaakt. Controleer de preview.');
  }catch(err){activity.error(err);console.error(err);$('vectorStatus').textContent=`Omzetten lukte niet: ${err.message||'probeer een andere PNG of JPG'}`;}
  finally{vectorApplyBusy=false;syncSelectionControls();}
};
$('restoreRasterLogo').onclick=()=>{
  const logo=itemById(state.selected,'logo');
  if(!logo?.originalRasterSrc)return;
  pushHistory();
  const crop=logo.vectorCrop||{x:0,y:0,w:1,h:1};
  const fullW=logo.w/crop.w,fullH=logo.h/crop.h;
  offsetArtworkCenter(logo,fullW*(.5-crop.x)-logo.w/2,fullH*(.5-crop.y)-logo.h/2);
  logo.w=fullW;logo.h=fullH;logo.ratio=fullW/fullH;
  logo.src=logo.originalRasterSrc;
  delete logo.originalRasterSrc;delete logo.vectorCrop;
  discardVectorEditBackup(logo);
  logo.svgMarkup=null;logo.vector=false;delete logo.printColors;
  $('vectorStatus').textContent='Originele afbeelding hersteld. Je kunt opnieuw fijn afstellen en omzetten.';
  syncSelectionControls();render();
};

$('logoW').addEventListener('change',()=>{
  const x=itemById(state.selected,'logo');if(!x)return;
  pushHistory();
  if(!x.ratio || !isFinite(x.ratio) || x.ratio<=0) x.ratio=(x.w/x.h)||1;
  x.w=Math.max(.1,Number($('logoW').value)||.1);
  if(selectionRatioLocked)x.h=x.w/x.ratio;else x.ratio=x.w/x.h;
  syncSelectionControls();
  render();
});
$('logoH').addEventListener('change',()=>{
  const x=itemById(state.selected,'logo');if(!x)return;
  pushHistory();
  if(!x.ratio || !isFinite(x.ratio) || x.ratio<=0) x.ratio=(x.w/x.h)||1;
  x.h=Math.max(.1,Number($('logoH').value)||.1);
  if(selectionRatioLocked)x.w=x.h*x.ratio;else x.ratio=x.w/x.h;
  syncSelectionControls();
  render();
});

$('logoLeft').addEventListener('change',()=>{
  const x=itemById(state.selected,'logo');if(!x)return;
  pushHistory();
  const left=Number($('logoLeft').value)||0;
  x.x=(left+logoFootprint(x).w/2)/state.flap.w;
  syncSelectionControls();render();
});
$('logoTop').addEventListener('change',()=>{
  const x=itemById(state.selected,'logo');if(!x)return;
  pushHistory();
  const top=Number($('logoTop').value)||0;
  x.y=(top+logoFootprint(x).h/2)/state.flap.h;
  syncSelectionControls();render();
});

$('alignLogoLeft').onclick=()=>alignLogo('left',null);
$('alignLogoRight').onclick=()=>alignLogo('right',null);
$('alignLogoTop').onclick=()=>alignLogo(null,'top');
$('alignLogoMiddle').onclick=()=>alignLogo(null,'middle');
$('alignLogoBottom').onclick=()=>alignLogo(null,'bottom');

$('centerItem').onclick=()=>{
  const x=itemById(state.selected,'logo');if(!x)return;pushHistory();x.x=.5;syncSelectionControls();render();
};
$('fitItem').onclick=()=>{
  const x=itemById(state.selected,'logo');if(!x)return;pushHistory();
  if(!x.ratio || !isFinite(x.ratio) || x.ratio<=0) x.ratio=(x.w/x.h)||1;
  const footprint=logoFootprint(x),ratio=footprint.w/footprint.h;let w=state.flap.w*.28,h=w/ratio;
  if(h>state.flap.h*.55){h=state.flap.h*.55;w=h*ratio;}
  if(artworkRotation(x)%180){x.w=h;x.h=w;}else{x.w=w;x.h=h;}x.ratio=x.w/x.h;x.x=.5;x.y=verticalPlacement(h,'middle');syncSelectionControls();render();
};
$('deleteItem').onclick=deleteSelectedObject;

$('textColor').addEventListener('input',()=>setCustomColor('textColor',$('textColor').value,false));
$('editTextColor').addEventListener('input',()=>setCustomColor('editTextColor',$('editTextColor').value,true));
$('textColorHex').addEventListener('change',()=>setCustomColor('textColor',$('textColorHex').value,false));
$('editTextColorHex').addEventListener('change',()=>setCustomColor('editTextColor',$('editTextColorHex').value,true));

setCustomColor('textColor','#FFFFFF',false);

$('textValue').addEventListener('input',updateFontPreviews);
$('textFont').addEventListener('change',updateFontPreviews);
$('editText').addEventListener('blur',()=>{editingTextHistoryId=null;});
$('editText').addEventListener('input',()=>{const text=itemById(state.selected,'text');if(text){if(editingTextHistoryId!==text.id){pushHistory();editingTextHistoryId=text.id;}text.text=$('editText').value;scheduleTextArtwork(text);}resizeTextField($('editText'));updateFontPreviews();});
$('textValue').addEventListener('input',()=>resizeTextField($('textValue')));
$('editTextFont').addEventListener('change',updateFontPreviews);
['textTracking','textWeight','textSize','editTextTracking','editTextWeight','editTextSize'].forEach(id=>$(id).addEventListener('input',updateFontPreviews));
installFontGalleries();installFontTools();installOutlineTools();installPlacementTools();
updateFontPreviews();

$('addText').onclick=()=>{
  const v=$('textValue').value.trim();if(!v)return;pushHistory();
  const size=Math.max(.5,Number($('textSize').value)||5);
  const obj={id:'t'+Date.now()+Math.random(),text:v,size,color:normalizeHex($('textColorHex').value),font:$('textFont').value||'Arimo, sans-serif',tracking:textTracking($('textTracking').value),weight:textWeight($('textWeight').value),x:.5,y:verticalPlacement(size,'middle'),align:'center'};
  state.texts.push(obj);clearMultiSelection();state.selected=obj.id;state.selectedType='text';$('textValue').value='';
  syncSelectionControls();render();
};
['editText','editTextSize','editTextAlign','editTextFont','editTextTracking','editTextWeight'].forEach(id=>{
  $(id).addEventListener('change',()=>{
    if(id==='editText')return;
    const t=itemById(state.selected,'text');if(!t)return;pushHistory();
    t.text=$('editText').value;t.size=Math.max(.5,Number($('editTextSize').value)||1);
    t.color=normalizeHex($('editTextColorHex').value);t.align=$('editTextAlign').value;t.font=$('editTextFont').value||'Arial, sans-serif';
    t.tracking=textTracking($('editTextTracking').value);t.weight=textWeight($('editTextWeight').value);render();
  });
});
$('centerText').onclick=()=>{const t=itemById(state.selected,'text');if(!t)return;pushHistory();t.x=.5;placeTextVertically(t,'middle');syncSelectionControls();render();};
['top','middle','bottom'].forEach(position=>{
  const id='alignText'+position[0].toUpperCase()+position.slice(1);
  $(id).onclick=()=>{
    const t=itemById(state.selected,'text');if(!t)return;
    pushHistory();placeTextVertically(t,position);syncSelectionControls();render();
  };
});

$('deleteSelected').onclick=deleteSelectedObject;

// Selecting a heading or checkbox label should not toggle its setting on mouseup.
document.addEventListener('click',event=>{
  if(!event.detail||event.target.closest('input,button,select,textarea,a'))return;
  const label=event.target.closest('summary,label'),selection=window.getSelection();
  if(label&&selection?.toString()&&(label.contains(selection.anchorNode)||label.contains(selection.focusNode)))event.preventDefault();
},true);

$('selectionMoveMode').onclick=finishSelectionSizing;
document.addEventListener('keydown',event=>{if(savedDesignExportMode)return;
  if(event.key!=='Escape'||document.querySelector('dialog[open],.modal-backdrop.open')||document.body.classList.contains('selection-pipette-active'))return;
  const sizing=['selectionWidth','selectionHeight','logoW','logoH','editTextSize'].includes(document.activeElement?.id);
  if(event.repeat){event.preventDefault();event.stopImmediatePropagation();return;}
  if(sizing){event.preventDefault();event.stopImmediatePropagation();finishSelectionSizing();}
},true);
document.addEventListener('keydown',e=>{if(savedDesignExportMode)return;
  if(document.querySelector('dialog[open]')||document.body.classList.contains('selection-pipette-active'))return;
  if($('vectorExportDialog').classList.contains('open')){if(e.key==='Escape')closeVectorExportDialog();return;}
  if($('pdfViewer').classList.contains('open')){
    if(e.key==='Escape'){e.preventDefault();closePdfViewer();}
    return;
  }
  const tag=(document.activeElement?.tagName||'').toLowerCase();
  const editable=document.activeElement?.isContentEditable;
  const typing=tag==='input' || tag==='textarea' || tag==='select' || editable;
  const mod=e.ctrlKey || e.metaKey;
  const key=e.key.toLowerCase();
  // Native text selection/copy takes precedence over artwork shortcuts.
  if(!typing&&window.getSelection()?.toString())return;
  if(!typing&&mod&&e.shiftKey&&['BracketLeft','BracketRight'].includes(e.code)){
    e.preventDefault();if(!e.repeat&&!document.querySelector('.app')?.inert)moveSelectionLayer(e.code==='BracketRight'?1:-1);return;
  }
  if(vectorPieceKeydown(e,typing))return;

  if(!typing&&mod&&['+','=','add','-','_','subtract','0'].includes(key)){
    e.preventDefault();
    if(key==='0')setPreviewZoom(1);
    else setPreviewZoom(previewZoom*(['+','=','add'].includes(key)?1.25:1/1.25));
    return;
  }

  // Standard editor shortcuts only when not typing in a field.
  if(!typing && mod && key==='c'){
    if(!designTransferTools){e.preventDefault();copySelectedObjects();}return;
  }
  // Laat Ctrl/Cmd+V aan het paste-event over: een afbeelding op het systeemklembord gaat voor.
  if(!typing && mod && key==='x'){
    if(!designTransferTools){e.preventDefault();cutSelectedObjects();}return;
  }
  if(!typing && mod && key==='d'){
    e.preventDefault();duplicateSelectedObjects();return;
  }
  if(!typing && mod && key==='z' && !e.shiftKey){
    e.preventDefault();undo();return;
  }
  if(!typing && ((mod && key==='z' && e.shiftKey) || (mod && key==='y'))){
    e.preventDefault();redo();return;
  }

  if(!typing && (e.key==='Delete' || e.key==='Backspace')){
    if(allSelectedRefs().length){
      e.preventDefault();deleteSelectedObject();
    }
    return;
  }

  if(!typing && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    const refs=allSelectedRefs();
    if(!refs.length)return;
    e.preventDefault();

    // Fine movement: 0.5 cm. Hold Shift for 2 cm.
    const step=e.shiftKey?2:.5;
    const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
    const dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;

    pushHistory();
    refs.forEach(r=>{
      const obj=itemById(r.id,r.type);
      if(!obj)return;
      const halfX=r.type==='logo'?Math.min(.5,obj.w/(2*state.flap.w)):0;
      const halfY=Math.min(.5,(r.type==='logo'?obj.h:obj.size)/(2*state.flap.h));
      obj.x=r.type==='logo'?obj.x+dx/state.flap.w:Math.max(halfX,Math.min(1-halfX,obj.x+dx/state.flap.w));
      obj.y=r.type==='logo'?obj.y+dy/state.flap.h:Math.max(halfY,Math.min(1-halfY,obj.y+dy/state.flap.h));
    });
    syncSelectionControls();render();
    return;
  }
});

$('deleteText').onclick=deleteSelectedObject;

$('wideMode').addEventListener('change',()=>{
  if(!state.ui)state.ui={wideMode:false,zones:true,zoneCenter:50};
  pushHistory();
  state.ui.wideMode=$('wideMode').checked;
  $('wideToolsBody').classList.toggle('open',state.ui.wideMode);
  render();
});

$('zoneCenter').addEventListener('change',()=>{
  if(!state.ui)state.ui={wideMode:false,zones:true,zoneCenter:50};
  pushHistory();
  state.ui.zoneCenter=Math.max(30,Math.min(90,Number($('zoneCenter').value)||50));
  $('zoneCenter').value=state.ui.zoneCenter;
  const sidePct=(100-state.ui.zoneCenter)/2;
  $('wideLayoutNote').textContent=`Links ${sidePct}% · Midden ${state.ui.zoneCenter}% · Rechts ${sidePct}%`;
  render();
  toast('Indeling aangepast');
});

$('zonesOn').addEventListener('change',()=>{
  if(!state.ui)state.ui={wideMode:false,zones:true,zoneCenter:50};
  pushHistory();
  state.ui.zones=$('zonesOn').checked;
  render();
});

$('snapLeft').onclick=()=>snapSelected(zoneCenters().left,'Links');
$('snapMid').onclick=()=>snapSelected(.5,'Midden');
$('snapRight').onclick=()=>snapSelected(zoneCenters().right,'Rechts');

$('mirrorCreate').onclick=copyObjectToOtherSide;
$('duplicateOtherSideSelected').onclick=copyObjectToOtherSide;

$('sameY').onclick=()=>{
  const obj=selectedObject(),other=oppositeSideObject();
  if(!obj || !other){toast('Geen onderdeel aan de andere zijde gevonden');return;}
  pushHistory(); obj.y=other.y; syncSelectionControls();render();toast('Hoogte gelijkgemaakt');
};
$('sameSize').onclick=()=>{
  const obj=selectedObject(),other=oppositeSideObject();
  if(!obj || !other){toast('Geen onderdeel aan de andere zijde gevonden');return;}
  pushHistory();
  if(state.selectedType==='logo'){obj.w=other.w;obj.h=other.h;obj.ratio=other.ratio||obj.ratio;}
  else{obj.size=other.size;}
  syncSelectionControls();render();toast('Grootte gelijkgemaakt');
};

$('syncSides').onclick=syncSidePair;

['contourOn','contourGap','contourWidth','contourUnderHoles','contourColor'].forEach(id=>$(id).addEventListener('change',()=>{
  pushHistory();state.ui??={};const gap=Number($('contourGap').value),width=Number($('contourWidth').value);
  state.ui.contour={on:$('contourOn').checked,gap:Number.isFinite(gap)?Math.max(0,gap):1,width:Number.isFinite(width)?Math.max(.1,width):2,underHoles:$('contourUnderHoles').checked,color:normalizeHex($('contourColor').value)};syncContourControls();render();
}));

const vectorLogoPreviewCache=new WeakMap();
let vectorLogoPreviewSequence=0;

// Screen overlays and selection are transient; print/export reads only design artwork.
const layoutOptions={guides:true,snap:true};
let marquee=null;

['layoutGuides','layoutSnap'].forEach(id=>$(id).addEventListener('change',()=>{layoutOptions[id==='layoutGuides'?'guides':'snap']=$(id).checked;clearLayoutGuides();}));
$('selectionRatioLock').onclick=()=>{
  if(allSelectedRefs().some(ref=>ref.type==='text')){toast('Tekst schaalt proportioneel; vrij schalen is beschikbaar voor logo’s.');return;}
  selectionRatioLocked=!selectionRatioLocked;syncSelectionDimensions();
};

for(const [id,axis] of [['selectionWidth','w'],['selectionHeight','h']]){
  $(id).addEventListener('change',()=>{
    const value=Number($(id).value),box=SpatlapLayout.union(allSelectedRefs().map(layoutBox).filter(Boolean));
    if(!box||!Number.isFinite(value)||value<.1||value>10000){toast('Vul een maat tussen 0,1 en 10000 cm in.');$(id).blur();syncSelectionDimensions();return;}
    const current=axis==='w'?box.right-box.left:box.bottom-box.top;
    $(id).blur();if(current>0){if(selectionRatioLocked||allSelectedRefs().some(ref=>ref.type==='text'))scaleSelectedObjects(value/current,'Selectie op maat gezet');else resizeLogoSelection(axis,value/current);}syncSelectionDimensions();
  });
  $(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}});
}

$('quickAddLogo').onclick=()=>$('file').click();
$('headerAddLogo').onclick=()=>$('file').click();
$('headerAddText').onclick=()=>$('quickAddText').onclick();
$('headerQuickVector').onclick=async()=>{
  const selected=state.selectedType==='logo'?itemById(state.selected,'logo'):null;if(!selected){toast(state.selectedType==='text'?'Tekst wordt al als vector geëxporteerd. Selecteer een afbeelding voor omzetting.':'Selecteer eerst een afbeelding in de preview.');return;}if(selected.svgMarkup&&!selected.originalRasterSrc){toast('Dit logo is al een vector.');return;}
  const logo=itemById(state.selected,'logo'),before=logo?.svgMarkup;
  const activity=beginPreviewActivity('Witte vector maken…',['headerQuickVector']);
  try{await previewPaintTick();await $('whitePngVector').onclick();if(logo?.svgMarkup&&logo.svgMarkup!==before)activity.success('Witte vector gemaakt.');else{const message=$('vectorStatus').textContent||'Omzetten niet voltooid.';activity.error(new Error(message));$('colorTools').open=true;}}catch(error){activity.error(error);}finally{syncSelectionControls();}
};
$('quickAddText').onclick=()=>{const section=$('textValue').closest('details');if(section)section.open=true;$('textValue').focus();$('textValue').scrollIntoView({behavior:'smooth',block:'center'});};
$('trimSelectedVector').onclick=trimSelectedVector;
$('shrinkSelected').onclick=()=>scaleSelectedObjects(.9);$('growSelected').onclick=()=>scaleSelectedObjects(1.1);

try{const mode=localStorage.getItem('spatlap-height-match-mode-v1');if(['ink','cap','style'].includes(mode))$('heightMatchMode').value=mode;}catch{}
$('heightMatchMode').onchange=()=>{const mode=$('heightMatchMode').value;if(pendingHeightMatch)pendingHeightMatch.mode=mode;try{localStorage.setItem('spatlap-height-match-mode-v1',mode);}catch{toast('Meetwijze geldt nu; onthouden in deze browser lukt niet.');}};
$('matchVectorHeight').onclick=()=>{
  if(pendingHeightMatch){cancelVectorHeightMatch();toast('Hoogte overnemen geannuleerd');return;}
  const refs=allSelectedRefs(),ref=refs[0],source=refs.length===1?itemById(ref.id,ref.type):null;
  if(!source||(ref.type==='logo'&&!source.svgMarkup)||vectorEditingLogoId){toast('Selecteer eerst één compleet vectorlogo of tekst.');return;}
  pendingHeightMatch={id:source.id,type:ref.type,mode:$('heightMatchMode').value,snapshot:JSON.stringify(source)};const settings=$('heightMatchSettings');settings.hidden=false;settings.open=true;settings.scrollIntoView({behavior:'smooth',block:'nearest'});document.body.classList.add('matching-vector-height');updateSelectionActionBar();toast('Klik op het logo of de tekst waarvan je de hoogte wilt overnemen. Esc annuleert.');
};

$('flap').addEventListener('pointerdown',event=>{
  if(!pendingHeightMatch||event.button!==0)return;
  const node=event.target.closest('[data-layout-id]');if(!node)return;
  event.preventDefault();event.stopImmediatePropagation();suppressLayoutClick();applyVectorHeightMatch(node.dataset.layoutId,node.dataset.layoutType);
},true);

$('quickCenterSelection').onclick=()=>{openPlacementSettings();$('layoutReference').value='flap';alignLayoutSelection('centerX');toast('Horizontaal gecentreerd op de spatlap');};
$('quickBottomSide').onclick=()=>{openPlacementSettings();alignLayoutSelection('bottomSide');};
$('quickBalanceSelection').onclick=()=>balanceArtwork('x');
$('quickBalanceVertical').onclick=()=>balanceArtwork('y');
$('mirrorArtwork').onclick=()=>transformArtwork('mirror');
$('rotateArtwork').onclick=()=>transformArtwork('rotate');
document.querySelectorAll('[data-layout-align]').forEach(button=>button.onclick=()=>alignLayoutSelection(button.dataset.layoutAlign));

$('previewWrap').addEventListener('pointerdown',e=>{
  if(e.defaultPrevented||document.body.classList.contains('feedback-picking')||e.button!==0||spacePanHeld||vectorEditingLogoId||e.target.closest('.item,button,input,label'))return;
  const f=$('flap').getBoundingClientRect(),x=(e.clientX-f.left)/f.width*state.flap.w,y=(e.clientY-f.top)/f.height*state.flap.h;
  const overlay=document.createElement('div');overlay.className='selection-marquee';$('flap').append(overlay);
  marquee={id:e.pointerId,startX:x,startY:y,startClientX:e.clientX,startClientY:e.clientY,moved:false,overlay,previous:allSelectedRefs(),add:e.shiftKey};
  $('previewWrap').setPointerCapture(e.pointerId);e.preventDefault();
});
$('previewWrap').addEventListener('pointermove',e=>{
  if(!marquee||marquee.id!==e.pointerId)return;
  if(!marquee.moved&&Math.hypot(e.clientX-marquee.startClientX,e.clientY-marquee.startClientY)<3)return;
  marquee.moved=true;const f=$('flap').getBoundingClientRect(),x=(e.clientX-f.left)/f.width*state.flap.w,y=(e.clientY-f.top)/f.height*state.flap.h;
  const box={left:Math.min(x,marquee.startX),right:Math.max(x,marquee.startX),top:Math.min(y,marquee.startY),bottom:Math.max(y,marquee.startY)};
  Object.assign(marquee.overlay.style,{left:box.left/state.flap.w*100+'%',top:box.top/state.flap.h*100+'%',width:(box.right-box.left)/state.flap.w*100+'%',height:(box.bottom-box.top)/state.flap.h*100+'%'});
  const hits=layoutRefs().filter(ref=>{const b=layoutBox(ref);return b&&SpatlapLayout.intersects(box,b);});
  marquee.refs=marquee.add?[...marquee.previous,...hits.filter(r=>!marquee.previous.some(p=>p.id===r.id&&p.type===r.type))]:hits;
  $('flap').querySelectorAll('[data-layout-id]').forEach(el=>el.classList.toggle('multi-selected',marquee.refs.some(r=>r.id===el.dataset.layoutId&&r.type===el.dataset.layoutType)));
});

$('previewWrap').addEventListener('pointerup',()=>finishMarquee());
$('previewWrap').addEventListener('pointercancel',()=>finishMarquee(true));
$('previewWrap').addEventListener('lostpointercapture',()=>finishMarquee(true));
document.addEventListener('keydown',e=>{if(savedDesignExportMode)return;if(e.key!=='Escape')return;if(marquee){e.preventDefault();finishMarquee(true);}if(drag?.entries){e.preventDefault();const cancelled=drag;drag=null;cancelled.entries.forEach(entry=>{entry.obj.x=entry.x;entry.obj.y=entry.y;});clearLayoutGuides();suppressLayoutClick();syncSelectionControls();render();}});

$('previewWrap').addEventListener('click',event=>{
  if(suppressClickAfterDrag||spacePanHeld||suppressPanClick||document.body.classList.contains('selection-pipette-active')||document.body.classList.contains('feedback-picking'))return;
  if(event.target.closest('[data-layout-id],button,input,select,textarea,a'))return;
  deselectArtwork();
});
document.addEventListener('keydown',event=>{if(savedDesignExportMode)return;
  if(event.key!=='Escape'||document.querySelector('dialog[open],.modal-backdrop.open')||document.body.classList.contains('selection-pipette-active'))return;
  if(event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(allSelectedRefs().length||vectorEditingLogoId){event.preventDefault();deselectArtwork();}
});

let imageFallbackUrl=null;
$('copyBlackArtwork').onclick=async()=>{
  const pngPromise=(async()=>{
    const c=await buildArtworkCanvas(14,'#080808');
    const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('Afbeelding maken mislukt');
    return blob;
  })();
  try{
    if(!navigator.clipboard?.write||!window.ClipboardItem)throw new Error('Klembord niet beschikbaar');
    await navigator.clipboard.write([new ClipboardItem({'image/png':pngPromise})]);
    $('imageFallbackLink').style.display='none';
    $('pdfViewerImageFallback').style.display='none';
    toast('Zwart artwork gekopieerd — plak het als afbeelding');
  }catch(err){
    console.error(err);
    try{
      const blob=await pngPromise;
      if(imageFallbackUrl)URL.revokeObjectURL(imageFallbackUrl);
      imageFallbackUrl=URL.createObjectURL(blob);
      const link=$('imageFallbackLink');
      link.href=imageFallbackUrl;
      link.download=`artwork-zwarte-achtergrond-${state.flap.w}x${state.flap.h}cm.png`;
      link.style.display='inline-block';
      const viewerLink=$('pdfViewerImageFallback');
      viewerLink.href=imageFallbackUrl;viewerLink.download=link.download;
      viewerLink.style.display=$('pdfViewer').classList.contains('open')?'inline-flex':'none';
      toast('Kopiëren niet beschikbaar — downloadlink staat in het menu');
    }catch(imageError){console.error(imageError);toast('Afbeelding maken lukte niet');}
  }
};

$('vectorExportClose').onclick=closeVectorExportDialog;
$('vectorExportDialog').addEventListener('click',e=>{if(e.target===$('vectorExportDialog'))closeVectorExportDialog();});

const pdfBlobUrls=[];

$('downloadVectorPdf').onclick=async()=>{
  const btn=$('downloadVectorPdf'),oldLabel=btn.textContent;
  clearPdfLinks();btn.disabled=true;btn.textContent='Vector-PDF maken...';
  const activity=beginPreviewActivity('Vector-PDF maken…',["downloadVectorPdf"]);
  try{
    const filename=`drukbestand-vector-kleurinfo-${state.flap.w}x${state.flap.h}cm.pdf`;
    const blob=await makeArtworkPdfBlob(null,true);
    const url=showPdfLinks(blob,filename);triggerPdfDownload(url,filename);toast('Vector-PDF met kleurinformatie gedownload');
    activity.success('Vector-PDF met kleurinformatie klaar; download gestart.');
  }catch(error){activity.error(error);console.error(error);showVectorExportError(error);}
  finally{btn.disabled=false;btn.textContent=oldLabel;}
};
$('downloadArtworkSvg').onclick=async()=>{
  const btn=$('downloadArtworkSvg'),oldLabel=btn.textContent;btn.disabled=true;btn.textContent='SVG maken...';
  const activity=beginPreviewActivity('SVG maken…',["downloadArtworkSvg"]);
  try{
    const design=cloneState(),root=await SpatlapVectorExport.artwork(design,vectorExportOptions(design));
    const blob=new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);triggerPdfDownload(url,`drukbestand-vector-${design.flap.w}x${design.flap.h}cm.svg`);
    setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Vector-SVG gedownload');
    activity.success('Vector-SVG klaar; download gestart.');
  }catch(error){activity.error(error);console.error(error);showVectorExportError(error);}
  finally{btn.disabled=false;btn.textContent=oldLabel;}
};

$('pdfViewerClose').onclick=closePdfViewer;
$('pdfViewerCopy').onclick=()=>$('copyBlackArtwork').click();
$('pdfViewer').addEventListener('click',e=>{if(e.target===$('pdfViewer'))closePdfViewer();});

$('viewBlackPdf').onclick=()=>blackPdfAction('view');
$('downloadBlackPdf').onclick=()=>blackPdfAction('download');

$('downloadArtworkPdf').onclick=async()=>{
  const btn=$('downloadArtworkPdf'),oldLabel=btn.textContent;
  clearPdfLinks();
  btn.disabled=true;btn.textContent='PDF maken...';
  const activity=beginPreviewActivity('Drukbestand-PDF maken…',["downloadArtworkPdf"]);
  try{
    const filename=`drukbestand-vector-${state.flap.w}x${state.flap.h}cm.pdf`;
    const blob=await makeArtworkPdfBlob();
    const url=showPdfLinks(blob,filename);
    try{triggerPdfDownload(url,filename);toast('Vector-drukbestand gedownload');}
    catch(e){$('downloadMenu').open=true;toast('PDF klaar — klik op de downloadlink in Download');}
    activity.success('Drukbestand-PDF klaar. Download beschikbaar onder Download.');
  }catch(err){activity.error(err);console.error(err);showVectorExportError(err);}
  finally{btn.disabled=false;btn.textContent=oldLabel;}
};

$('download').onclick=exportPNG;

$('copyAiPrompt').onclick=async()=>{
  const base=location.href.split(/[?#]/)[0];
  const prompt=`Je helpt met het maken van een configuratie-URL voor deze Spatlap Preview Tool.

TOOL-URL:
${base}

Ik plak hieronder een beschrijving, aanvraag of gewenste uitvoering. Lees die tekst en geef daarna ALLEEN:
1. één korte samenvatting van wat je hebt ingevuld;
2. daaronder één klikbare configuratie-URL.

Gebruik alleen informatie die redelijk duidelijk uit de beschrijving blijkt. Laat onbekende parameters weg; verzin geen maten of aantallen.

De tool accepteert deze queryparameters:
- w = breedte spatlap in cm
- h = hoogte spatlap in cm
- qty = aantal
- color = black of white
- shape = square, bottom, all of shoulder
- radius = radius in cm
- shoulderInset = inspringing per zijde in cm, alleen bij shoulder
- shoulderTopH = hoogte van het smallere bovenstuk in cm, alleen bij shoulder
- holes = 1 of 0
- holeCount = aantal gaten
- holeShape = round of pill
- topGap = afstand hart gaten tot bovenkant in cm
- sideGap = afstand hart buitenste gaten tot zijkant in cm
- holeH = diameter van rond gat of hoogte van pilgat in cm
- holeW = breedte pilgat in cm
- wideMode = 1 bij een extra brede spatlap met links/midden/rechts-indeling
- zoneCenter = breedte van het middenvak in procenten, standaard 50; links en rechts delen automatisch de rest
- text = tekst die op de spatlap moet komen
- textSize = teksthoogte in cm als die bekend of duidelijk gewenst is
- textColor = hexcode zoals %23FFFFFF
- textFont = bijvoorbeeld Arial%2C%20sans-serif of Impact%2C%20sans-serif
- textTracking = letterafstand in cm, van -0.5 tot 2
- textWeight = 400 (normaal) of 700 (vet)
- textX = horizontale positie van de tekst als fractie 0 t/m 1
- textY = verticale positie van de tekst als fractie 0 t/m 1

BELANGRIJK:
- Gebruik URL-encoding voor tekst en voor # in hexkleuren.
- Als er alleen een logo gewenst is, kan het echte logobestand niet in deze AI-URL. Vul dan wel alle spatlap-, gaten- en layoutgegevens in; ik upload het logo daarna zelf.
- Als de beschrijving zegt logo links én rechts en tekst in het midden, zet wideMode=1 en zet textX=0.5.
- Breedte en hoogte zijn altijd in cm.
- "Geen gaten genoemd" betekent NIET automatisch holes=0; laat holes dan weg.
- Voor zwart gebruik color=black, voor wit color=white.

Voorbeeld:
${base}?w=240&h=38&qty=10&color=black&wideMode=1&text=TRUCK%20SERVICE%20JAGER&textColor=%23FFFFFF&textX=0.5&textY=0.55

Beschrijving:
[PLAK HIER DE BESCHRIJVING]`;

  try{
    await navigator.clipboard.writeText(prompt);
    $('aiStatus').textContent='AI-instructie gekopieerd ✓';
  }catch(e){
    $('aiStatus').textContent='Kopiëren lukte niet automatisch.';
  }
};

let currentLocalDesignId=null;
let localDbPromise=null;
const localStoragePrefix='spatlap-preview-design-';
let designStorageModule;

const designFormat='spatlap-preview-design';
const designFormatVersion=1;
let integrationContext={customerId:null,orderId:null,itemId:null,designId:null};
let crmBinding=null,crmBindingError=null,productDesignModule=null,activeDesignSave=null;

let centralStorageAdapter=null;

$('saveLocal').onclick=async()=>{
  try{const id=await saveCurrentLocally();showLocalLink(id,crmBinding?'Ontwerp en voorbeeld bewaard bij dit product.':await usesCloudDesigns()?'Ontwerp bewaard in de centrale opslag.':'Ontwerp bewaard in deze browser.');toast(crmBinding?'Ontwerp en afbeelding bijgewerkt in CRM':'Ontwerp bewaard');}
  catch(err){$('shareStatus').textContent=err.message||'Bewaren lukte niet in deze browser.';}
};
$('headerSave').onclick=()=>$('saveLocal').click();
$('headerLink').onclick=()=>$('copyLocalUrl').click();
document.addEventListener('pointerdown',event=>{
  const menu=$('downloadMenu');
  if(menu.open&&!menu.contains(event.target))menu.open=false;
});
$('copyLocalUrl').onclick=async()=>{
  let id;
  try{id=await saveCurrentLocally();}
  catch(err){$('shareStatus').textContent=err.message||'Bewaren lukte niet in deze browser.';return;}
  try{
    await navigator.clipboard.writeText(localDesignUrl(id));
    $('shareStatus').textContent=await usesCloudDesigns()?'Link naar centraal opgeslagen ontwerp gekopieerd.':'Korte lokale link gekopieerd. Deze werkt alleen hier in deze browser.';
    toast('Korte link gekopieerd');
  }catch(err){showLocalLink(id,'Ontwerp bewaard, maar kopiëren lukte niet.');}
};
$('openCopy').onclick=async()=>{
 const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
 const activity=beginPreviewActivity('Losse kopie maken…',['openCopy']);
 try{
  clearArtworkFontPreview();
  const id=crypto.randomUUID(),record={id,name:('Kopie van '+($('localDesignName').value||'ontwerp')).slice(0,200),updatedAt:Date.now(),payload:JSON.parse(JSON.stringify(compactDesignState())),context:normalizeIntegrationContext({})};
  assertDurableLogoSources(record.payload.l);await writeLocalDesign(record);
  const url=new URL(location.href),mode=url.searchParams.get('storage');url.search='';url.hash='local='+encodeURIComponent(id);if(mode==='cloud')url.searchParams.set('storage','cloud');
  const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener';link.textContent='Open de nieuwe ontwerpkopie';$('shareStatus').replaceChildren(document.createTextNode('Losse kopie bewaard. '),link);
  // Closing or navigating the new tab while storage is busy must not turn a
  // successful save into an error, or replace a page the user opened there.
  try{if(popup&&!popup.closed&&popup.location.href==='about:blank')popup.location.replace(url.href);}catch{}
  activity.success('Losse kopie bewaard; het oorspronkelijke ontwerp is behouden.');
 }catch(error){try{if(popup&&!popup.closed&&popup.location.href==='about:blank')popup.close();}catch{}activity.error(error);}
};
$('copyUrl').onclick=async()=>{
  try{
    const url=currentShareUrl();
    if(url.length>180000){
      $('shareStatus').textContent='Deelbare link te groot door de logo-bestanden. Bewaar het ontwerp lokaal voor een korte link, of gebruik kleinere logo’s om te delen.';
      return;
    }
    await navigator.clipboard.writeText(url);
    $('shareStatus').textContent=`Link gekopieerd (${Math.round(url.length/1000)} kB).`;toast('Link gekopieerd');
  }catch(e){
    $('shareStatus').textContent='Kopiëren lukte niet automatisch. Open deze tool via https/GitHub Pages en probeer opnieuw.';
  }
};

$('reset').onclick=()=>{$('resetModal').classList.add('open');};
$('cancelReset').onclick=()=>{$('resetModal').classList.remove('open');};
$('resetModal').addEventListener('click',e=>{
  if(e.target===$('resetModal'))$('resetModal').classList.remove('open');
});
$('confirmReset').onclick=()=>{
  $('resetModal').classList.remove('open');
  pushHistory();
  currentLocalDesignId=null;$('localDesignName').value='';
  if(location.hash)location.hash='';
  state={logos:[],texts:[],selected:null,selectedType:null,
    flap:{w:190,h:25,qty:'',shape:'bottom',radius:5,radiusAuto:true,shoulderAuto:true,shoulderInset:5,shoulderTopH:5,color:'#080808'},
    holes:{on:false,count:6,shape:'round',top:3,side:10,h:1.2,w:2.2},
    ui:{wideMode:false,zones:true,zoneCenter:50,topGuideOn:false,showColorCount:false,manualColorCount:''}};
  if(crmBinding){if(crmBinding.width)state.flap.w=crmBinding.width/10;if(crmBinding.height)state.flap.h=crmBinding.height/10;state.flap.qty=String(crmBinding.quantity);}
  state.flap.radius=SpatlapLayout.defaultRadius(state.flap.w,state.flap.h);
  syncUIFromState();render();
  toast('Nieuw ontwerp gestart');
};

document.addEventListener('wheel',e=>{
  const el=e.target;
  if(el && el.matches && el.matches('input[type="number"]') && document.activeElement===el){
    e.preventDefault();
  }
},{passive:false});

window.addEventListener('resize',render);

const savedDesignExportMode=['png','pdf'].includes(new URLSearchParams(location.search).get('designExport'));
const previewReady=savedDesignExportMode?Promise.resolve():initDesign();
window.SpatlapPreview=Object.freeze({
  ready:previewReady,
  format:designFormat,
  formatVersion:designFormatVersion,
  exportDesign:exportDesignDocument,
  importDesign:async documentData=>{await previewReady;return importDesignDocument(documentData);},
  setContext:value=>{integrationContext=normalizeIntegrationContext(value);},
  getContext:()=>({...integrationContext}),
  createPreviewPngBlob:async()=>{await previewReady;return createPreviewPngBlob();},
  setStorageAdapter:setCentralStorageAdapter,
  saveToStorage:async()=>{
    await previewReady;
    if(!centralStorageAdapter)throw new Error('Er is nog geen centrale opslag gekoppeld');
    return centralStorageAdapter.save(exportDesignDocument(),await createPreviewPngBlob());
  },
  loadFromStorage:async designId=>{
    await previewReady;
    if(!centralStorageAdapter)throw new Error('Er is nog geen centrale opslag gekoppeld');
    const documentData=await centralStorageAdapter.load(designId,{...integrationContext});
    return importDesignDocument(documentData);
  }
});

// Comfortable dimension controls use the existing input/change resize path.
for(const button of document.querySelectorAll('[data-dimension-step]'))button.onclick=event=>{event.preventDefault();const [id,direction]=button.dataset.dimensionStep.split(':'),input=$(id);if(input.disabled||previewActivities.size)return;try{input.stepUp(Number(direction));input.dispatchEvent(new Event('change',{bubbles:true}));}catch(error){toast(error.message);}};
const logoDrop=$('logoDropTarget');logoDrop.classList.add('logo-drop-target');logoDrop.insertAdjacentHTML('beforeend','<span class="field-help">Of sleep logo’s hierheen (PNG, JPG, WebP, SVG of PDF).</span>');
for(const type of ['dragenter','dragover'])logoDrop.addEventListener(type,event=>{if(!event.dataTransfer?.types.includes('Files'))return;event.preventDefault();logoDrop.classList.add('is-dragover');});
logoDrop.addEventListener('dragleave',event=>{if(!logoDrop.contains(event.relatedTarget))logoDrop.classList.remove('is-dragover');});
logoDrop.addEventListener('drop',async event=>{event.preventDefault();event.stopPropagation();logoDrop.classList.remove('is-dragover');if(previewActivities.size)return;const files=[...(event.dataTransfer?.files||[])];if(files.length)try{await addLogoFiles(files);}catch(error){toast(error.message);}});

$('cropArtwork').onclick=openArtworkCrop;

$('saveNewProductVariant').onclick=saveAsNewProductVariant;
