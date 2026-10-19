// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function alignLogo(horizontal,vertical){
  const x=itemById(state.selected,'logo');if(!x)return;
  pushHistory();
  if(horizontal==='left')x.x=x.w/(2*state.flap.w);
  if(horizontal==='center')x.x=.5;
  if(horizontal==='right')x.x=1-x.w/(2*state.flap.w);
  if(vertical)x.y=verticalPlacement(x.h,vertical);
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
  return v ? v.split(/\s+/)[0] : 'Voorbeeld';
}

function textTracking(value){return Math.max(-.5,Math.min(2,Number(value)||0));}

function textWeight(value){return Number(value)===400?400:700;}

function updateFontPreviews(){
  const apply=()=>{
    const p=$('textFontPreview');
    if(p){
      p.textContent=firstWord($('textValue')?.value);
      p.style.fontFamily=printFontFamily($('textFont')?.value);
      p.style.fontWeight=String(textWeight($('textWeight').value));
      p.style.letterSpacing=(textTracking($('textTracking').value)*26/Math.max(.5,Number($('textSize').value)||5))+'px';
    }
    const ep=$('editTextFontPreview');
    if(ep){
      ep.textContent=firstWord($('editText')?.value);
      ep.style.fontFamily=printFontFamily($('editTextFont')?.value);
      ep.style.fontWeight=String(textWeight($('editTextWeight').value));
      ep.style.letterSpacing=(textTracking($('editTextTracking').value)*26/Math.max(.5,Number($('editTextSize').value)||5))+'px';
    }
  };
  if(document.fonts?.ready){
    document.fonts.ready.then(apply).catch(apply);
  }else{
    apply();
  }
}

function deleteSelectedObject(){
  const refs=allSelectedRefs();
  if(!refs.length)return;
  pushHistory();
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
    return obj?{type:r.type,data:JSON.parse(JSON.stringify(obj))}:null;
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
  pushHistory();
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
  pasteInternalClipboard(.8);
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
    del.onclick=e=>{e.stopPropagation();state.selected=x.id;state.selectedType='logo';deleteSelectedObject();toast('Logo verwijderd');};
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
    del.onclick=e=>{e.stopPropagation();state.selected=x.id;state.selectedType='text';deleteSelectedObject();toast('Tekst verwijderd');};
    actions.append(b,dup,del);d.append(name,actions);tl.appendChild(d);
  });
}
