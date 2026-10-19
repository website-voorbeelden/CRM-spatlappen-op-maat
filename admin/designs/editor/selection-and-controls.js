// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function updateMobilePreviewTop(){
  const mobile=window.matchMedia('(max-width:700px)').matches;
  document.documentElement.style.setProperty('--mobile-preview-top',Math.max(0,mobile?document.querySelector('.app-header').getBoundingClientRect().bottom:0)+'px');
}

function fitPreviewFrame(){
  const mobile=window.matchMedia('(max-width:700px)').matches,wrap=$('previewWrap'),header=document.querySelector('.app-header'),bar=$('selectionActions');
  const height=SpatlapLayout.previewHeight({w:state.flap.w,h:state.flap.h,availableWidth:Math.max(40,wrap.clientWidth-(mobile?90:150)),viewportHeight:window.innerHeight,headerHeight:header.offsetHeight,selectionHeight:bar.classList.contains('visible')?bar.offsetHeight:0,mobile});
  document.documentElement.style.setProperty(mobile?'--mobile-preview-h':'--adaptive-preview-h',height+'px');updateMobilePreviewTop();
}

function scaleFactor(){
  const w=Math.max(10,state.flap.w),h=Math.max(5,state.flap.h);
  const wrap=$('previewWrap');
  const phone=window.matchMedia('(max-width:700px)').matches;
  const availableW=wrap ? Math.max(phone?120:180,wrap.offsetWidth-(phone?90:150)) : Math.max(180,window.innerWidth-500);
  const availableH=wrap ? Math.max(phone?40:180,wrap.offsetHeight-(phone?104:150)) : 360;
  const maxW=Math.min(980,availableW);
  const maxH=Math.min(360,availableH);
  return Math.max(.1,Math.min(maxW/w,maxH/h))*previewZoom;
}

function setPreviewZoom(value,clientX,clientY){
  const wrap=$('previewWrap'),stage=$('stage');
  const before=stage.getBoundingClientRect(),box=wrap.getBoundingClientRect();
  const x=clientX??box.left+box.width/2,y=clientY??box.top+box.height/2;
  const fractionX=before.width?(x-before.left)/before.width:.5;
  const fractionY=before.height?(y-before.top)/before.height:.5;
  const next=Math.max(.5,Math.min(8,Math.round(value*100)/100));
  if(next===previewZoom)return;
  previewZoom=next;
  render();
  $('zoomLevel').textContent=Math.round(previewZoom*100)+'%';
  const after=stage.getBoundingClientRect();
  wrap.scrollLeft+=after.left+fractionX*after.width-x;
  wrap.scrollTop+=after.top+fractionY*after.height-y;
}

function stopPreviewPan(){
  if(previewPan){
    const pointerId=previewPan.id;
    previewPan=null;
    try{previewPanWrap.releasePointerCapture(pointerId);}catch(e){}
    suppressPanClick=true;
    requestAnimationFrame(()=>{suppressPanClick=false;});
  }
  previewPanWrap.classList.remove('space-panning');
}

function setSpacePanHeld(held){
  spacePanHeld=held;
  previewPanWrap.classList.toggle('space-pan',held);
  if(!held)stopPreviewPan();
}

function isTypingForPan(target){
  const tag=target?.tagName?.toLowerCase();
  if(target?.isContentEditable||tag==='textarea'||tag==='select')return true;
  if(tag!=='input')return false;
  return !['range','checkbox','radio','color','file','button','submit','reset'].includes(target.type?.toLowerCase());
}

function readBaseControls(){
  state.flap.w=Math.max(10,Number($('w').value)||190);
  state.flap.h=Math.max(5,Number($('h').value)||25);
  state.flap.qty=$('qty').value;
  state.flap.shape=$('shape').value;
  state.flap.radius=Math.max(0,Number($('radius').value)||0);
  state.flap.shoulderInset=Math.max(0,Number($('shoulderInset').value)||0);
  state.flap.shoulderTopH=Math.max(0.5,Number($('shoulderTopH').value)||0.5);
  state.flap.color=$('flapColor').value;
  state.holes.on=$('holesOn').checked;
  state.holes.count=Math.max(1,Math.min(20,Number($('holeCount').value)||1));
  state.holes.shape=$('holeShape').value;
  state.holes.top=Math.max(0,Number($('topGap').value)||0);
  state.holes.side=Math.max(0,Number($('sideGap').value)||0);
  state.holes.h=Math.max(.2,Number($('holeH').value)||1);
  state.holes.w=Math.max(.2,Number($('holeW').value)||2);
}

function syncAutomaticShoulders(){
  if(state.flap.shoulderAuto===true)Object.assign(state.flap,SpatlapLayout.defaultShoulders(state.flap.w,state.flap.h));
  $('shoulderAuto').checked=state.flap.shoulderAuto===true;$('shoulderInset').value=state.flap.shoulderInset??5;$('shoulderTopH').value=state.flap.shoulderTopH??5;
}

function syncUIFromState(){
  syncAutomaticShoulders();
  $('radiusAuto').checked=state.flap.radiusAuto===true;
  $('w').value=state.flap.w;$('h').value=state.flap.h;$('qty').value=state.flap.qty;
  $('shape').value=state.flap.shape;$('radius').value=state.flap.radius;$('shoulderInset').value=state.flap.shoulderInset ?? 5;$('shoulderTopH').value=state.flap.shoulderTopH ?? 5;$('flapColor').value=state.flap.color;
  $('shoulderWrap').style.display=state.flap.shape==='shoulder'?'block':'none';
  $('holesOn').checked=state.holes.on;$('holeCount').value=state.holes.count;$('holeShape').value=state.holes.shape;
  $('topGap').value=state.holes.top;$('sideGap').value=state.holes.side;$('holeH').value=state.holes.h;$('holeW').value=state.holes.w;
  if(!state.ui)state.ui={wideMode:false,zones:true,zoneCenter:50};
  $('wideMode').checked=state.ui.wideMode===true;
  $('zonesOn').checked=state.ui.zones!==false;
  if(state.ui.zoneCenter==null){
    state.ui.zoneCenter=state.ui.zoneSide!=null ? 100-(state.ui.zoneSide*2) : 50;
  }
  state.ui.zoneCenter=Math.max(30,Math.min(90,Number(state.ui.zoneCenter)||50));
  $('zoneCenter').value=state.ui.zoneCenter;
  const sidePct=(100-state.ui.zoneCenter)/2;
  $('wideLayoutNote').textContent=`Links ${sidePct}% · Midden ${state.ui.zoneCenter}% · Rechts ${sidePct}%`;
  $('wideToolsBody').classList.toggle('open',state.ui.wideMode===true);
  $('topGuideOn').checked=state.ui.topGuideOn===true;
  $('showColorCount').checked=state.ui.showColorCount===true;
  $('manualColorCount').value=state.ui.manualColorCount||'';
  syncContourControls();
  syncSelectionControls();
}

function logoSelectionColors(logo){if(!logo?.svgMarkup)return null;const cached=selectionLogoColorCache.get(logo);if(cached?.markup===logo.svgMarkup)return cached.colors;let colors=null;try{const prepared=SpatlapVectorEditor.prepare(logo.svgMarkup);colors=SpatlapVectorEditor.printColours(SpatlapVectorExport.parseLogo(prepared.markup));}catch{}selectionLogoColorCache.set(logo,{markup:logo.svgMarkup,colors});return colors;}

function selectionColorInfo(channel='fill'){
  const refs=allSelectedRefs(),piece=!!vectorEditingLogoId&&!!vectorPieceApi?.selected();
  const enabled=refs.length>0&&(piece||refs.every(ref=>ref.type==='text'||!!itemById(ref.id,ref.type)?.svgMarkup));
  const colors=piece?[SpatlapVectorEditor.colour(vectorPieceApi.selected().getAttribute(channel)|| (channel==='fill'?'#000000':'none'))]:refs.flatMap(ref=>{const obj=itemById(ref.id,ref.type);return ref.type==='text'?[obj?.color]:logoSelectionColors(obj)||[];});
  const unique=[...new Set(colors.filter(Boolean).map(normalizeHex))],known=piece?!!colors[0]:refs.every(ref=>ref.type==='text'||logoSelectionColors(itemById(ref.id,ref.type))?.length);
  return {enabled,wholeLogo:refs.length===1&&refs[0].type==='logo'&&!!itemById(refs[0].id,'logo')?.svgMarkup,piece,color:known&&unique.length===1?unique[0]:null,signature:JSON.stringify(state)+'|'+(selectedVectorPieceId||'')+'|'+channel,reason:enabled?'':'Selecteer tekst of een vectorlogo. Zet een afbeelding eerst om naar vector.',description:piece?`Alleen de ${channel==='stroke'?'lijn':'vulling'} van het geselecteerde vectoronderdeel.`:refs.length===1&&refs[0].type==='logo'?'Het hele geselecteerde logo krijgt deze kleur. Transparantie blijft behouden.':`${refs.length} geselecteerd(e) tekst(en)/vectorlogo(’s) krijgen deze kleur. Transparantie blijft behouden.`};
}

function applySelectionColor(hex,expected,channel){
  if(selectionColorInfo(channel).signature!==expected)throw Error('De selectie of het ontwerp is gewijzigd. Kies opnieuw een kleur.');
  if(vectorEditingLogoId&&vectorPieceApi?.selected()){
    pushHistory();vectorPieceApi.paint(channel,hex);const logo=itemById(vectorEditingLogoId,'logo');applyVectorRoot(logo,vectorPieceApi.root);syncSelectionControls();render();return;
  }
  // Prepare every vector before changing anything; one undo for a mixed group.
  const updates=allSelectedRefs().map(ref=>{const obj=itemById(ref.id,ref.type);if(ref.type==='logo'&&!obj?.svgMarkup)throw Error('Afbeelding eerst naar vector omzetten.');return {ref,obj,root:ref.type==='logo'?SpatlapVectorEditor.recolour(obj.svgMarkup,hex):null};});
  if(!updates.length)throw Error('Selecteer eerst een onderdeel.');pushHistory();
  updates.forEach(({ref,obj,root})=>{if(ref.type==='text')obj.color=hex;else{rememberVectorOriginal(obj);applyVectorRoot(obj,root);obj.printColors=SpatlapVectorEditor.printColours(root)??[hex];}});$('wholeLogoColor').value=hex;$('wholeLogoColorHex').value=hex;syncSelectionControls();render();
}

function moveSelectionLayer(direction){
  if(vectorEditingLogoId){toast('Rond eerst het bewerken van losse vectoronderdelen af.');return;}
  const refs=allSelectedRefs();if(!refs.length){toast('Selecteer eerst een logo of tekst.');return;}
  const items=SpatlapVectorExport.orderedItems(state),selected=new Set(refs.map(ref=>selectionKey(ref.id,ref.type)));let changed=false;
  const isSelected=item=>selected.has(selectionKey(item.obj.id,item.type));
  if(direction>0){for(let i=items.length-2;i>=0;i--)if(isSelected(items[i])&&!isSelected(items[i+1])){[items[i],items[i+1]]=[items[i+1],items[i]];changed=true;}}
  else{for(let i=1;i<items.length;i++)if(isSelected(items[i])&&!isSelected(items[i-1])){[items[i],items[i-1]]=[items[i-1],items[i]];changed=true;}}
  if(!changed){toast(direction>0?'Selectie staat al bovenaan.':'Selectie staat al onderaan.');return;}
  pushHistory();state.ui.layerOrder=items.map(item=>selectionKey(item.obj.id,item.type));render();toast(direction>0?'Selectie één laag omhoog':'Selectie één laag omlaag');
}

function selectionKey(id,type){return `${type}:${id}`;}

function allSelectedRefs(){
  const refs=[];
  if(state.selected && state.selectedType) refs.push({id:state.selected,type:state.selectedType});
  multiSelection.forEach(r=>{
    if(!refs.some(x=>x.id===r.id && x.type===r.type)) refs.push({id:r.id,type:r.type});
  });
  return refs;
}

function isSelectedRef(id,type){
  return (state.selected===id && state.selectedType===type) ||
    multiSelection.some(r=>r.id===id && r.type===type);
}

function clearMultiSelection(){
  multiSelection=[];
}

function toggleMultiSelection(id,type){
  const i=multiSelection.findIndex(r=>r.id===id && r.type===type);
  if(i>=0){
    multiSelection.splice(i,1);
    if(state.selected===id && state.selectedType===type){
      const next=multiSelection.shift()||null;
      state.selected=next?.id||null;
      state.selectedType=next?.type||null;
    }
  }else{
    if(state.selected && state.selectedType && !multiSelection.some(r=>r.id===state.selected && r.type===state.selectedType)){
      multiSelection.push({id:state.selected,type:state.selectedType});
    }
    state.selected=id;
    state.selectedType=type;
  }
}

function updateSelectionActionBar(){
  const refs=allSelectedRefs();
  updateLayoutReferences(refs);
  const bar=$('selectionActions');
  if(!bar)return;
  bar.classList.toggle('visible',refs.length>0);
  if(refs.length){
    $('selectionLabel').textContent=vectorEditingLogoId?'Vectoronderdeel geselecteerd':refs.length===1?'1 onderdeel geselecteerd':`${refs.length} onderdelen geselecteerd`;
    $('duplicateOtherSideSelected').setAttribute('aria-label',vectorEditingLogoId?'Logo dupliceren naar andere zijde':'Dupliceren naar andere zijde');
    $('duplicateOtherSideSelected').disabled=refs.length!==1;
    const heightSource=refs.length===1?itemById(refs[0].id,refs[0].type):null;
    $('matchVectorHeight').disabled=!!vectorEditingLogoId||!heightSource||(refs[0].type==='logo'&&!heightSource.svgMarkup);
    $('matchVectorHeight').textContent=pendingHeightMatch?'Kies referentie…':'↕ Hoogte';
    $('matchVectorHeight').setAttribute('aria-pressed',String(!!pendingHeightMatch));
    $('duplicateOtherSideSelected').title=refs.length===1?'Maak een kopie op dezelfde afstand van de andere zijkant.':'Selecteer één onderdeel om het naar de andere zijde te dupliceren.';
    $('trimSelectedVector').hidden=refs.length!==1||!!vectorEditingLogoId;
    $('shrinkSelected').disabled=$('growSelected').disabled=!!vectorEditingLogoId;
    for(const id of ['quickCenterSelection','quickBalanceSelection','quickBottomSide'])$(id).disabled=!!vectorEditingLogoId;
    $('deleteSelected').setAttribute('aria-label',vectorEditingLogoId?'Logo verwijderen':'Selectie verwijderen');
    syncSelectionDimensions();
  }
}

function itemById(id,type){
  return (type==='logo'?state.logos:state.texts).find(x=>x.id===id);
}

function isVectorLogo(logo){
  if(!logo.svgMarkup)return false;
  const cached=vectorStatusCache.get(logo);
  if(cached?.markup===logo.svgMarkup)return cached.vector;
  const doc=new DOMParser().parseFromString(logo.svgMarkup,'image/svg+xml');
  // An SVG extension alone is not proof: SVGs can also contain bitmap images.
  doc.querySelectorAll('metadata').forEach(el=>el.remove());
  const vector=doc.documentElement.localName==='svg'&&!doc.querySelector('parsererror')&&
    ![...doc.documentElement.querySelectorAll('*')].some(el=>['image','foreignObject','filter','feImage'].includes(el.localName));
  vectorStatusCache.set(logo,{markup:logo.svgMarkup,vector});
  return vector;
}

function updateVectorStatusBadge(){
  const badge=$('vectorStatusBadge');
  const refs=allSelectedRefs().filter(ref=>itemById(ref.id,ref.type));
  const selected=refs.length>0;
  const entries=selected?refs.map(ref=>ref.type==='text'||isVectorLogo(itemById(ref.id,ref.type))):[
    ...state.logos.map(isVectorLogo),
    ...state.texts.filter(text=>String(text.text||'').trim()).map(()=>true),
    ...(contourPath()?[true]:[])
  ];
  const total=entries.length,vectors=entries.filter(Boolean).length;
  const level=total&&vectors===total?'vector':vectors?'mixed':'raster';
  const scope=selected?'Selectie':'Ontwerp';
  const label=!total?'Geen artwork':level==='vector'?'Vector':level==='mixed'?'Deels vector':'Geen vector';
  badge.dataset.level=level;
  if($('vectorStatusScope').textContent!==scope)$('vectorStatusScope').textContent=scope;
  if($('vectorStatusLabel').textContent!==label)$('vectorStatusLabel').textContent=label;
  const detail=!total?'Voeg een logo, tekst of contourlijn toe.':
    selected&&total===1?(vectors?'Dit onderdeel is vector.':'Dit onderdeel is geen zuivere vector; het bevat pixels of rastereffecten.'):
    `${vectors} van ${total} onderdelen zijn volledig vector. Tekst en de contourlijn tellen mee; de spatlapachtergrond en gaten niet.`;
  badge.title=detail+' Alleen in de interface; wordt niet gedownload. De PDF-export controleert ook lettertypen en ondersteunde SVG-onderdelen.';
}

function setSelected(id,type,additive=false){
  if(pendingHeightMatch){applyVectorHeightMatch(id,type);return;}
  if(additive){
    toggleMultiSelection(id,type);
  }else{
    state.selected=id;state.selectedType=type;clearMultiSelection();
  }
  if(type==='logo' && $('logosSection')) $('logosSection').open=true;
  syncSelectionControls();render();
}

function syncSelectionControls(){
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;
  $('logoControls').style.display=logo?'block':'none';
  $('replaceLogo').disabled=!logo||logoReplacementBusy;
  $('replaceLogo').textContent=logoReplacementBusy?'Bestand laden...':'Bestand vervangen';
  if($('replaceLogoStatus').dataset.logoId!==logo?.id)$('replaceLogoStatus').textContent='';
  const canTrace=!!logo&&(!logo.svgMarkup||!!logo.originalRasterSrc);
  $('vectorizeLogo').disabled=!canTrace;
  $('whitePngVector').disabled=!canTrace||!/\.png$/i.test(logo.name||'');
  $('headerQuickVector').disabled=false;$('headerQuickVector').classList.toggle('vector-ready',!!canTrace);$('headerQuickVector').title=canTrace?'Geselecteerde afbeelding snel naar witte vector omzetten':state.selectedType==='text'?'Tekst wordt al als vector geëxporteerd':'Selecteer een afbeelding om die om te zetten';
  $('restoreRasterLogo').disabled=!logo?.originalRasterSrc;
  $('vectorTarget').textContent=logo
    ? canTrace?`Geselecteerd: ${logo.name||'afbeelding'}. Alleen deze afbeelding wordt omgezet; het kleurenaantal van het hele ontwerp staat hieronder.`:`Geselecteerd: ${logo.name||'SVG'}. Dit is al een vectorbestand. Kies een PNG/JPG/WebP om kleuren te beperken.`
    :'Selecteer een PNG, JPG, WebP of geïmporteerde PDF-pagina in de preview. De omzetting geldt voor die afbeelding; het kleurenaantal hieronder voor het hele ontwerp.';
  if(logo){
    $('selectedLogoVectorCheck').checked=!!logo.svgMarkup;
    $('selectedLogoVectorLabel').textContent=logo.svgMarkup?'Vectorbestand ✓':'Nog geen vectorbestand';
    if(!logo.ratio || !isFinite(logo.ratio) || logo.ratio<=0) logo.ratio=(logo.w/logo.h)||1;
    $('logoW').value=Math.round(logo.w*100)/100;
    $('logoH').value=Math.round(logo.h*100)/100;

    const left=logo.x*state.flap.w-logo.w/2;
    const top=logo.y*state.flap.h-logo.h/2;
    $('logoLeft').value=Math.round(left*100)/100;
    $('logoTop').value=Math.round(top*100)/100;
  }

  const txt=state.selectedType==='text'?itemById(state.selected,'text'):null;
  $('textControls').style.display=txt?'block':'none';
  if(txt){
    if(!txt.font)txt.font='Arial, sans-serif';
    $('editText').value=txt.text;$('editTextSize').value=txt.size;
    $('editTextTracking').value=txt.tracking??0;
    $('editTextWeight').value=String(txt.weight||700);
    $('editTextColor').value=normalizeHex(txt.color);
    $('editTextColorHex').value=normalizeHex(txt.color).toUpperCase();
    $('editTextAlign').value=txt.align||'center';
    $('editTextFont').value=txt.font;
    if(typeof updateFontPreviews==='function')updateFontPreviews();
  }
  updateSelectionActionBar();
  scheduleVectorPreview();
  syncVectorPieceControls();
  updateVectorStatusBadge();
  selectionColorTools?.refresh();
}

function normalizeHex(value){
  let v=String(value||'').trim();
  if(!v.startsWith('#'))v='#'+v;
  if(/^#[0-9a-fA-F]{3}$/.test(v)){
    v='#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
  }
  if(!/^#[0-9a-fA-F]{6}$/.test(v))return '#FFFFFF';
  return v.toUpperCase();
}
