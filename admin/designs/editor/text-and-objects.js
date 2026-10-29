// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function alignLogo(horizontal,vertical){
  const x=itemById(state.selected,'logo');if(!x)return;
  pushHistory();const footprint=logoFootprint(x);
  if(horizontal==='left')x.x=footprint.w/(2*state.flap.w);
  if(horizontal==='center')x.x=.5;
  if(horizontal==='right')x.x=1-footprint.w/(2*state.flap.w);
  if(vertical)x.y=verticalPlacement(footprint.h,vertical);
  syncSelectionControls();render();
}

function setCustomColor(group,color,commit=false){
  color=normalizeHex(color);
  const hex=$(group+'Hex');
  const picker=$(group);
  if(hex)hex.value=color;
  if(picker && picker.type==='color')picker.value=color;

  const wrap=$(group+'Swatches');
  if(wrap){
    wrap.querySelectorAll('.swatch').forEach(b=>{
      b.classList.toggle('active',normalizeHex(b.dataset.color)===color);
    });
  }

  if(group==='editTextColor'){
    const t=itemById(state.selected,'text');
    if(t){
      if(commit)pushHistory();
      t.color=color;
      render();
    }
  }
}

function firstWord(value){
  const v=String(value||'').trim();
  return v ? v.replace(/\s+/g,' ').slice(0,60)+(v.length>60?'…':'') : 'Voorbeeld';
}

function textTracking(value){return Math.max(-.5,Math.min(2,Number(value)||0));}

function textWeight(value){return Number(value)===400?400:700;}

function updateFontPreviews(){
  for(const [fontId,weightId] of [['textFont','textWeight'],['editTextFont','editTextWeight']]){const family=$(fontId)?.value.split(',')[0].replace(/['"]/g,'').trim(),single=fontIsSingle($(fontId).value),weight=$(weightId);weight.disabled=single;weight.title=single?'Dit lettertype heeft één vaste dikte.':'';if(single)weight.value='400';}
  const apply=()=>{
    for(const [fieldId,previewId,textId,sizeId,weightId,trackingId] of [
      ['textFont','textFontPreview','textValue','textSize','textWeight','textTracking'],
      ['editTextFont','editTextFontPreview','editText','editTextSize','editTextWeight','editTextTracking']
    ]){
      const preview=$(previewId);if(!preview)continue;
      const font=preview.dataset.comparisonFont||$(fieldId).value;
      const family=font.split(',')[0].replace(/['"]/g,'').trim();
      const sample=firstWord($(textId).value);preview.textContent=preview.dataset.uppercase==='true'?sample.toLocaleUpperCase('nl-NL'):sample;
      preview.style.fontFamily=printFontFamily(font);
      preview.style.fontWeight=String(fontIsSingle(font)?400:textWeight($(weightId).value));
      preview.style.letterSpacing=(textTracking($(trackingId).value)*26/Math.max(.5,Number($(sizeId).value)||5))+'px';
      preview.title=(preview.dataset.comparisonFont?'Voorbeeld, nog niet toegepast: ':'Gekozen lettertype: ')+family;
    }
  };
  apply();
  if(document.fonts?.status==='loading'){
    if(!updateFontPreviews.waiting){updateFontPreviews.waiting=true;document.fonts.ready.then(()=>{updateFontPreviews.waiting=false;apply();}).catch(()=>{updateFontPreviews.waiting=false;});}
  }
}

function deleteSelectedObject(){
  const refs=allSelectedRefs();
  if(!refs.length)return;
  pushHistory();
  if(pendingHeightMatch)cancelVectorHeightMatch();
  const logoIds=new Set(refs.filter(r=>r.type==='logo').map(r=>r.id));
  const textIds=new Set(refs.filter(r=>r.type==='text').map(r=>r.id));
  state.logos=state.logos.filter(x=>!logoIds.has(x.id));
  state.texts=state.texts.filter(x=>!textIds.has(x.id));
  state.selected=null;
  state.selectedType=null;
  clearMultiSelection();
  syncSelectionControls();
  render();
  toast(refs.length===1?'Onderdeel verwijderd':`${refs.length} onderdelen verwijderd`);
}

function cloneSelectedForClipboard(){
  const refs=allSelectedRefs();
  return refs.map(r=>{
    const obj=itemById(r.id,r.type);
    return obj?{type:r.type,data:JSON.parse(JSON.stringify(obj)),fonts:r.type==='text'?(state.ui?.customFonts||[]).filter(f=>f.family===SpatlapVectorExport.firstFamily(obj.font)):[]}:null;
  }).filter(Boolean);
}

function copySelectedObjects(){
  const copied=cloneSelectedForClipboard();
  if(!copied.length)return;
  internalClipboard=copied;
  toast(copied.length===1?'Onderdeel gekopieerd':`${copied.length} onderdelen gekopieerd`);
}

function pasteInternalClipboard(offsetCm=.8){
  if(!internalClipboard.length){toast('Niets om te plakken');return;}
  const fontMap=new Map((state.ui?.customFonts||[]).map(f=>[f.family,f]));for(const entry of internalClipboard)for(const font of entry.fonts||[]){if(fontMap.has(font.family)&&fontMap.get(font.family).data!==font.data){throw Error('Een font-ID verwijst naar een ander bestand. Importeer het lettertype opnieuw; bestaande teksten zijn behouden.');}fontMap.set(font.family,font);}if(fontMap.size>5)throw Error('Maximaal vijf eigen lettertypen per ontwerp. Verwijder eerst een ongebruikt font.');
  pushHistory();state.ui.customFonts=[...fontMap.values()];syncCustomFontOptions();void restoreDesignFonts();
  clearMultiSelection();
  let first=null;
  internalClipboard.forEach((entry,i)=>{
    const d=JSON.parse(JSON.stringify(entry.data));
    if(entry.type==='logo'){
      d.id='l'+Date.now()+Math.random();
      d.name=(d.name||'Logo').replace(/\s*\(kopie\)$/,'')+' (kopie)';
      d.x+=offsetCm/state.flap.w;
      d.y+=offsetCm/state.flap.h;
      state.logos.push(d);
    }else{
      d.id='t'+Date.now()+Math.random();
      d.x=Math.min(1,Math.max(0,d.x+offsetCm/state.flap.w));
      d.y=Math.min(1,Math.max(0,d.y+offsetCm/state.flap.h));
      state.texts.push(d);
    }
    if(!first)first={id:d.id,type:entry.type};
    else multiSelection.push({id:d.id,type:entry.type});
  });
  state.selected=first?.id||null;
  state.selectedType=first?.type||null;
  syncSelectionControls();render();
  toast(internalClipboard.length===1?'Onderdeel geplakt':`${internalClipboard.length} onderdelen geplakt`);
}

function duplicateSelectedObjects(){
  const copied=cloneSelectedForClipboard();
  if(!copied.length)return;
  internalClipboard=copied;
  try{pasteInternalClipboard(.8);}catch(error){toast(error.message);return;}
  toast(copied.length===1?'Onderdeel gedupliceerd':`${copied.length} onderdelen gedupliceerd`);
}

function cutSelectedObjects(){
  const copied=cloneSelectedForClipboard();
  if(!copied.length)return;
  internalClipboard=copied;
  deleteSelectedObject();
  toast(copied.length===1?'Onderdeel geknipt':`${copied.length} onderdelen geknipt`);
}

function finishSelectionSizing(){
  const active=document.activeElement;
  if(active?.matches('input,textarea,select'))active.blur();
  const preview=$('previewWrap');preview.setAttribute('tabindex','-1');preview.focus({preventScroll:true});
  toast('Pijltjes verplaatsen nu je selectie. Esc deselecteert.');
}

function selectedObject(){
  if(!state.selected || !state.selectedType)return null;
  return itemById(state.selected,state.selectedType);
}

function updateWideToolButtons(){
  const enabled=!!selectedObject() && !!state.ui?.wideMode;
  ['snapLeft','snapMid','snapRight','mirrorCreate','syncSides','sameY','sameSize'].forEach(id=>{
    const el=$(id);
    if(el)el.disabled=!enabled;
  });
}

function zoneCenters(){
  const center=Math.max(30,Math.min(90,Number(state.ui?.zoneCenter)||50));
  const side=((100-center)/2)/100;
  return {left:side/2,mid:.5,right:1-side/2};
}

function snapSelected(x,label){
  const obj=selectedObject(); if(!obj)return;
  pushHistory(); obj.x=x; syncSelectionControls();render();
  toast(`${label} geplaatst`);
}

function copyObjectToOtherSide(){
  const obj=selectedObject(); if(!obj)return;
  pushHistory();
  const mirroredX=1-obj.x;
  let copy;
  if(state.selectedType==='logo'){
    copy={
      ...JSON.parse(JSON.stringify(obj)),
      id:'l'+Date.now()+Math.random(),
      name:obj.name.replace(/\s*\(kopie\)$/,'')+' (kopie)',
      x:mirroredX
    };
    state.logos.push(copy);
  }else{
    copy={
      ...JSON.parse(JSON.stringify(obj)),
      id:'t'+Date.now()+Math.random(),
      x:mirroredX
    };
    state.texts.push(copy);
  }
  state.selected=copy.id;
  syncSelectionControls();
  render();
  toast(copy.x<.5?'Gedupliceerd aan linkerkant':'Gedupliceerd aan rechterkant');
}

function sideCandidates(type){
  const arr=(type==='logo'?state.logos:state.texts).filter(x=>x.x<.45 || x.x>.55);
  return {
    left:arr.filter(x=>x.x<.5).sort((a,b)=>a.x-b.x)[0] || null,
    right:arr.filter(x=>x.x>.5).sort((a,b)=>b.x-a.x)[0] || null
  };
}

function oppositeSideObject(){
  const obj=selectedObject(); if(!obj)return null;
  const {left,right}=sideCandidates(state.selectedType);
  if(obj.x<.5)return right;
  if(obj.x>.5)return left;
  return null;
}

function syncSidePair(){
  const obj=selectedObject(); if(!obj)return;
  const type=state.selectedType;
  let {left,right}=sideCandidates(type);

  // If one side does not exist, make it automatically.
  if(!left || !right){
    copyObjectToOtherSide();
    return;
  }

  pushHistory();

  // The selected side is the master if it is on a side.
  let master=obj;
  let other;
  if(obj.x<.5){ master=obj; other=right; }
  else if(obj.x>.5){ master=obj; other=left; }
  else {
    master=left; other=right;
  }

  other.x=1-master.x;
  other.y=master.y;

  if(type==='logo'){
    other.w=master.w;
    other.h=master.h;
  }else{
    other.size=master.size;
    other.color=master.color;
  }

  syncSelectionControls();
  render();
  toast('Beide zijden gelijkgemaakt');
}

function renderLists(){
  const ll=$('logoList');ll.innerHTML='';
  state.logos.forEach((x,i)=>{
    const d=document.createElement('div');d.className='list-item'+(state.selected===x.id?' active':'');
    const name=document.createElement('span');name.textContent=`Logo ${i+1}: ${x.name}${x.svgMarkup?' ✓ Vector':''}`;
    const actions=document.createElement('div');actions.className='list-actions';
    const b=document.createElement('button');b.textContent='Selecteer';b.onclick=()=>setSelected(x.id,'logo');
    const dup=document.createElement('button');dup.textContent='⧉';dup.title='Dupliceren';dup.onclick=e=>{e.stopPropagation();setSelected(x.id,'logo');duplicateSelectedObjects();};
    const del=document.createElement('button');del.className='trash';del.textContent='×';del.title='Verwijderen';
    del.onclick=e=>{e.stopPropagation();clearMultiSelection();state.selected=x.id;state.selectedType='logo';deleteSelectedObject();toast('Logo verwijderd');};
    actions.append(b,dup,del);d.append(name,actions);ll.appendChild(d);
  });

  const tl=$('textList');tl.innerHTML='';
  state.texts.forEach((x,i)=>{
    const d=document.createElement('div');d.className='list-item'+(state.selected===x.id?' active':'');
    const name=document.createElement('span');name.textContent=`Tekst ${i+1}: ${x.text.substring(0,24)}`;
    const actions=document.createElement('div');actions.className='list-actions';
    const b=document.createElement('button');b.textContent='Selecteer';b.onclick=()=>setSelected(x.id,'text');
    const dup=document.createElement('button');dup.textContent='⧉';dup.title='Dupliceren';dup.onclick=e=>{e.stopPropagation();setSelected(x.id,'text');duplicateSelectedObjects();};
    const del=document.createElement('button');del.className='trash';del.textContent='×';del.title='Verwijderen';
    del.onclick=e=>{e.stopPropagation();clearMultiSelection();state.selected=x.id;state.selectedType='text';deleteSelectedObject();toast('Tekst verwijderd');};
    actions.append(b,dup,del);d.append(name,actions);tl.appendChild(d);
  });
}

function installFontGalleries(){
 for(const [fieldId,previewId]of [['textFont','textFontPreview'],['editTextFont','editTextFontPreview']]){
  const select=$(fieldId),preview=$(previewId),gallery=document.createElement('details');gallery.className='subdetails font-gallery';
  const summary=document.createElement('summary');summary.textContent='Lettertypen vergelijken · veelgebruikt eerst';const grid=document.createElement('div');grid.className='font-gallery-grid';
  const capsLabel=document.createElement('label');capsLabel.className='check';const caps=document.createElement('input');caps.type='checkbox';caps.checked=preview.dataset.uppercase==='true';capsLabel.append(caps,document.createTextNode('Alleen het lettertypevoorbeeld in HOOFDLETTERS'));caps.onchange=()=>{preview.dataset.uppercase=String(caps.checked);updateFontPreviews();};gallery.append(summary,capsLabel,grid);select.after(gallery);
  let comparisonFrame=0,pendingFont='',fontObserver=null;
  const restore=()=>{if(comparisonFrame)cancelAnimationFrame(comparisonFrame);comparisonFrame=0;pendingFont='';clearArtworkFontPreview();delete preview.dataset.comparisonFont;updateFontPreviews();};
  const compare=font=>{pendingFont=font;if(comparisonFrame)return;comparisonFrame=requestAnimationFrame(()=>{comparisonFrame=0;const font=pendingFont;pendingFont='';if(!gallery.open||!font||preview.dataset.comparisonFont===font)return;preview.dataset.comparisonFont=font;updateFontPreviews();if(fieldId==='editTextFont')previewArtworkFont(font);});};
  function populate(){
   fontObserver?.disconnect();fontObserver=null;grid.replaceChildren();
   const paintSample=button=>{button.style.fontFamily=printFontFamily(button.dataset.galleryFont);button.style.fontWeight=fontIsSingle(button.dataset.galleryFont)?'400':'700';};
   if(typeof IntersectionObserver==='function'){const observer=new IntersectionObserver(entries=>{if(!gallery.open||fontObserver!==observer)return;for(const entry of entries)if(entry.isIntersecting){paintSample(entry.target);observer.unobserve(entry.target);}},{rootMargin:'100px 0px'});fontObserver=observer;}
   const options=[...select.options].filter(o=>o.value&&!o.textContent.includes('alleen preview')).sort((a,b)=>(Number(fontUsage[b.value])||0)-(Number(fontUsage[a.value])||0));
   for(const option of options){const button=document.createElement('button');button.type='button';button.textContent=option.textContent;button.dataset.galleryFont=option.value;button.title=option.textContent;button.onpointerenter=()=>{paintSample(button);compare(option.value);};button.onfocus=()=>{paintSample(button);compare(option.value);};button.onclick=()=>{restore();select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));gallery.open=false;select.focus({preventScroll:true});};grid.append(button);if(fontObserver)fontObserver.observe(button);else paintSample(button);}
  }
  select.addEventListener('fontoptionschange',()=>{restore();if(gallery.open)populate();});gallery.addEventListener('toggle',()=>{if(gallery.open)populate();else{fontObserver?.disconnect();fontObserver=null;restore();}});gallery.addEventListener('pointerleave',restore);gallery.addEventListener('focusout',event=>{if(!gallery.contains(event.relatedTarget))restore();});gallery.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();gallery.open=false;restore();summary.focus({preventScroll:true});}});select.addEventListener('change',()=>{rememberFont(select.value);restore();});
 }
 const help=document.createElement('details');help.className='subdetails';const title=document.createElement('summary');title.textContent='Tekst als vectorcontouren / hulp voor AI';help.append(title);
 const text=document.createElement('p');text.className='field-help';text.textContent='Voor bewerkbare tekst gebruik je Eigen lettertype importeren. Als alternatief kun je tekst als SVG-contouren importeren via Logo toevoegen. Dat blijft vector, maar is daarna geen bewerkbare tekst meer. Gebruik alleen lettertypen waarvoor je gebruiksrechten hebt.';help.append(text);
 const copy=document.createElement('button');copy.type='button';copy.textContent='Uitleg voor AI kopiëren';const status=document.createElement('p');status.className='field-help';status.setAttribute('role','status');
 copy.onclick=async()=>{const prompt='Help mij tekst in een eigen lettertype voor de Spatlappen-ontwerptool voorbereiden. Vraag eerst welke tekst en welk lettertype ik bedoel. Verwacht een zelfstandig SVG-bestand met een geldige viewBox en echte paden: zet letters om naar contouren met het werkelijk aanwezige fontbestand. Geen ingesloten afbeeldingen, webfonts, externe URLs, scripts, filters, maskers of verzonnen contouren. Behoud gaten en kleur. Als het fontbestand ontbreekt, vraag dat eerst; stuur geen nep-SVG of JavaScript. Ik importeer het resultaat via Logo toevoegen. SVG-contouren zijn later als vectorvormen bewerkbaar, niet als gewone tekst. Geef daarom ook de oorspronkelijke tekst apart.';try{await navigator.clipboard.writeText(prompt);status.textContent='Gekopieerd; plak dit in je AI.';}catch{const field=document.createElement('textarea');field.readOnly=true;field.value=prompt;help.append(field);field.select();status.textContent='Kopieer de geselecteerde uitleg.';}};
 help.append(copy,status);$('textSection').querySelector('.section-body').append(help);
}
