// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function colorCountInfo(){
  const manual=Number(state.ui?.manualColorCount);
  if(state.ui?.manualColorCount!==''&&Number.isInteger(manual)&&manual>0){
    return {label:`${manual} drukkleur${manual===1?'':'en'}`,status:'Handmatig ingevuld; controleer dit vóór je de preview verstuurt.'};
  }
  const colors=new Set();
  if(contourPath())colors.add(contourSettings().color.toUpperCase());
  let unknown=false;
  state.texts.forEach(t=>{if(String(t.text||'').trim()){colors.add(normalizeHex(t.color));if(outlineStyle(t))colors.add(normalizeHex(t.outline.color));}});
  state.logos.forEach(logo=>{
    if(outlineStyle(logo))colors.add(normalizeHex(logo.outline.color));
    if(Array.isArray(logo.printColors))logo.printColors.forEach(c=>colors.add(normalizeHex(c)));
    else unknown=true;
  });
  if(unknown)return {label:'Kleuren: ?',status:'Van minstens één logo is het aantal drukkleuren onbekend. Vul het aantal zelf in voor een klantpreview.'};
  if(!colors.size)return {label:'Geen bedrukking',status:'Voeg eerst een logo of tekst toe.'};
  return {label:`${colors.size} drukkleur${colors.size===1?'':'en'}`,status:'Automatisch geteld uit vectorlogo’s en tekst. De spatlapkleur telt niet mee.'};
}

function topGuideOverlapCount(){
  if(!state.ui?.topGuideOn)return 0;
  const top=3;
  return state.logos.filter(x=>x.y*state.flap.h-x.h/2<top).length+
    state.texts.filter(t=>t.y*state.flap.h-t.size/2<top).length;
}

function contourSettings(){return {on:false,gap:1,width:2,underHoles:true,color:'#ffffff',...state.ui?.contour};}

function contourPath(){
  const c=contourSettings();if(!c.on)return '';
  const w=state.flap.w,h=state.flap.h,inset=c.gap+c.width/20;
  const top=c.underHoles&&state.holes.on?Math.max(inset,state.holes.top+inset):inset;
  if(w<=2*inset||h-inset<=top)return '';
  const commands=[],sink={beginPath(){commands.length=0;},moveTo(x,y){commands.push(`M${x},${y}`);},lineTo(x,y){commands.push(`L${x},${y}`);},quadraticCurveTo(x,y,a,b){commands.push(`Q${x},${y} ${a},${b}`);},arc(x,y,r,start,end){commands.push(`A${r},${r} 0 0 1 ${x+r*Math.cos(end)},${y+r*Math.sin(end)}`);},closePath(){commands.push('Z');}};
  if(state.flap.shape!=='shoulder'){
    const outerRadius=Math.min(state.flap.radius,w/2,state.flap.shape==='all'?h/2:h);
    const radius=Math.max(0,outerRadius-inset);
    const upper=state.flap.shape==='all'?radius:0,lower=state.flap.shape==='square'?0:radius;
    roundRectPath(sink,inset,top,w-2*inset,h-inset-top,upper,upper,lower,lower);
    return commands.join(' ');
  }
  // Sample the existing shoulder curves and offset their inward normals.
  const points=[];let current;
  const add=(x,y)=>{if(!current||Math.hypot(x-current[0],y-current[1])>1e-7){current=[x,y];points.push(current);}};
  const recorder={beginPath(){},moveTo:add,lineTo:add,closePath(){},quadraticCurveTo(x,y,a,b){const start=current;for(let i=1;i<=24;i++){const t=i/24,u=1-t;add(u*u*start[0]+2*u*t*x+t*t*a,u*u*start[1]+2*u*t*y+t*t*b);}},bezierCurveTo(x,y,a,b,e,f){const start=current;for(let i=1;i<=40;i++){const t=i/40,u=1-t;add(u*u*u*start[0]+3*u*u*t*x+3*u*t*t*a+t*t*t*e,u*u*u*start[1]+3*u*u*t*y+3*u*t*t*b+t*t*t*f);}}};
  shoulderRoundedPath(recorder,w,h,state.flap.shoulderInset??5,state.flap.shoulderTopH??5,state.flap.radius);
  if(Math.hypot(points[0][0]-current[0],points[0][1]-current[1])<1e-7)points.pop();
  let polygon=points.map((p,i)=>{
    const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];
    const l1=Math.hypot(p[0]-a[0],p[1]-a[1]),l2=Math.hypot(b[0]-p[0],b[1]-p[1]);
    const n1=[-(p[1]-a[1])/l1,(p[0]-a[0])/l1],n2=[-(b[1]-p[1])/l2,(b[0]-p[0])/l2],den=1+n1[0]*n2[0]+n1[1]*n2[1];
    return [p[0]+inset*(n1[0]+n2[0])/Math.max(.01,den),p[1]+inset*(n1[1]+n2[1])/Math.max(.01,den)];
  });
  // Measure the upper clearance from the centre of the holes.
  const clipped=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],insideA=a[1]>=top,insideB=b[1]>=top;if(insideA)clipped.push(a);if(insideA!==insideB){const t=(top-a[1])/(b[1]-a[1]);clipped.push([a[0]+t*(b[0]-a[0]),top]);}}
  polygon=clipped;if(polygon.length<3)return '';
  return polygon.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(5)},${y.toFixed(5)}`).join(' ')+' Z';
}

function contourSvg(){const d=contourPath();return d?`<path d="${d}" fill="none" stroke="${normalizeHex(contourSettings().color)}" stroke-width="${contourSettings().width/10}" stroke-linejoin="round"/>`:'';}

function drawContour(ctx,x,y,scaleX,scaleY=scaleX){const d=contourPath();if(!d)return;ctx.save();ctx.translate(x,y);ctx.scale(scaleX,scaleY);ctx.strokeStyle=normalizeHex(contourSettings().color);ctx.lineWidth=contourSettings().width/10;ctx.lineJoin='round';ctx.stroke(new Path2D(d));ctx.restore();}

function syncContourControls(){const c=contourSettings();$('contourColor').value=normalizeHex(c.color);$('contourOn').checked=c.on;$('contourGap').value=c.gap;$('contourWidth').value=c.width;$('contourUnderHoles').checked=c.underHoles;}

function printableTopCm(){return state.ui?.topGuideOn?Math.min(3,state.flap.h):0;}

function verticalPlacement(itemHeightCm,position){
  const h=state.flap.h,top=printableTopCm();
  const half=Math.max(0,itemHeightCm/2);
  const min=Math.min(h/2,top+half);
  const max=Math.max(min,h-half);
  if(position==='top')return min/h;
  if(position==='bottom')return max/h;
  return (min+max)/(2*h);
}

function mountVectorLogoPreview(host,logo){
  let cached=vectorLogoPreviewCache.get(logo);
  if(cached?.markup!==logo.svgMarkup){
    // Use the PDF's resolved vector geometry, rather than enlarging an SVG image surface.
    try{cached={markup:logo.svgMarkup,root:SpatlapVectorExport.normalizeLogo(logo.svgMarkup,`sp-preview-${++vectorLogoPreviewSequence}-`)};}
    catch(error){cached={markup:logo.svgMarkup,error:error.message};}
    vectorLogoPreviewCache.set(logo,cached);
  }
  if(!cached.root){
    // Keep older, unsupported SVGs visible; PDF preflight still explains what needs fixing.
    const image=document.createElement('img');image.src=logo.src;image.draggable=false;
    image.style.cssText='display:block;width:100%;height:100%;pointer-events:none';host.append(image);
    host.title=`Vectorvoorvertoning niet beschikbaar: ${cached.error}`;
    return;
  }
  const root=cached.root.cloneNode(true),shadow=host.attachShadow({mode:'closed'});
  root.setAttribute('x','0');root.setAttribute('y','0');
  root.setAttribute('width','100%');root.setAttribute('height','100%');root.setAttribute('preserveAspectRatio','none');
  root.setAttribute('aria-hidden','true');
  root.style.cssText='display:block;width:100%;height:100%;overflow:hidden;pointer-events:none;shape-rendering:geometricPrecision';
  shadow.append(root);
}

function render(){
  refreshCustomFontManager();
  if(state.selectedType!=='logo'||state.selected!==vectorEditingLogoId||!itemById(vectorEditingLogoId,'logo')?.svgMarkup?.includes('data-sp-piece'))clearVectorEditing();
  vectorPieceApi=null;
  updateSelectionActionBar();
  fitPreviewFrame();
  const w=state.flap.w,h=state.flap.h,s=scaleFactor(),flap=$('flap');
  const isWhite=state.flap.color.toLowerCase()==='#f3f3f3' || state.flap.color.toLowerCase()==='#ffffff';
  const workspaceBg=isWhite?'#3a4049':'#e9edf2';
  flap.style.width=(w*s)+'px';flap.style.height=(h*s)+'px';flap.style.background=state.flap.color;
  $('previewWrap').classList.toggle('white-flap-bg',isWhite);
  const r=state.flap.radius*s;
  $('shoulderWrap').style.display=state.flap.shape==='shoulder'?'block':'none';
  flap.style.clipPath='none';
  if(state.flap.shape==='square'){
    flap.style.borderRadius='0';
  }else if(state.flap.shape==='bottom'){
    flap.style.borderRadius=`0 0 ${r}px ${r}px`;
  }else if(state.flap.shape==='all'){
    flap.style.borderRadius=`${r}px`;
  }else if(state.flap.shape==='shoulder'){
    flap.style.borderRadius='0';
    flap.style.clipPath=shoulderCssPath(
      w*s,
      h*s,
      (state.flap.shoulderInset??5)*s,
      (state.flap.shoulderTopH??5)*s,
      r,s
    );
  }
  $('dimTop').textContent=`${w} cm`;$('dimLeft').textContent=`${h} cm`;
  const q=$('qtyBadge');
  if(String(state.flap.qty).trim()){q.style.display='block';q.textContent=`Aantal: ${state.flap.qty}`;}else q.style.display='none';
  const experiment=$('experimentBadge');experiment.hidden=!vectorExperiment&&!fontPreviewOverride;experiment.textContent=fontPreviewOverride?'Lettertypevoorbeeld · nog niet gekozen':'Vectorvoorbeeld · nog niet toegepast';
  const colorInfo=colorCountInfo(),colorBadge=$('colorBadge');
  colorBadge.textContent=colorInfo.label;
  colorBadge.style.display=state.ui?.showColorCount?'block':'none';
  $('colorCountStatus').textContent=colorInfo.status;

  flap.innerHTML='';

  if(state.ui?.wideMode && state.ui?.zones){
    const center=Math.max(30,Math.min(90,Number(state.ui.zoneCenter)||50));
    const side=(100-center)/2;
    const z=document.createElement('div');
    z.className='zone-overlay';
    z.innerHTML=`
      <div class="zone-line" style="left:${side}%"></div>
      <div class="zone-line" style="left:${100-side}%"></div>
      <div class="zone-label" style="left:${side/2}%;transform:translateX(-50%)">LINKS</div>
      <div class="zone-label" style="left:50%;transform:translateX(-50%)">MIDDEN</div>
      <div class="zone-label" style="left:${100-side/2}%;transform:translateX(-50%)">RECHTS</div>`;
    flap.appendChild(z);
  }

  if(state.holes.on){
    const count=state.holes.count,side=state.holes.side,top=state.holes.top;
    let xs=count===1?[w/2]:Array.from({length:count},(_,i)=>side+(w-2*side)*(i/(count-1)));
    xs.forEach(x=>{
      const d=document.createElement('div');d.className='hole';
      const hh=state.holes.h,hw=state.holes.shape==='pill'?Math.max(hh,state.holes.w):hh;
      d.style.left=(x/w*100)+'%';d.style.top=(top/h*100)+'%';
      d.style.width=(hw*s)+'px';d.style.height=(hh*s)+'px';
      d.style.background=workspaceBg;
      d.style.borderColor=workspaceBg;
      d.style.borderRadius=state.holes.shape==='pill'?(hh*s/2)+'px':'50%';flap.appendChild(d);
    });
  }

  state.logos.forEach(original=>{
    const x=displayLogoObject(original);
    const editing=vectorEditingLogoId===x.id;
    const el=document.createElement(editing||x.svgMarkup?'div':'img');
    if(editing){el.tabIndex=0;el.setAttribute('aria-label','Vectoronderdelen van '+(x.name||'logo')+' bewerken');}
    else if(!x.svgMarkup){el.src=x.src;el.draggable=false;}
    else{el.setAttribute('role','img');el.setAttribute('aria-label',x.name||'Vectorlogo');}
    el.dataset.layoutId=x.id;el.dataset.layoutType='logo';
    el.className='item logo-item'+(editing?' vector-editing':'')+(state.selected===x.id&&state.selectedType==='logo'?' selected':'')+(multiSelection.some(r=>r.id===x.id&&r.type==='logo')?' multi-selected':'');
    el.style.left=(x.x*100)+'%';el.style.top=(x.y*100)+'%';
    el.style.transform=artworkTransform(x);
    el.style.width=(x.w*s)+'px';el.style.height=(x.h*s)+'px';applyOutlinePreview(el,x,s);
    bindDrag(el,original,'logo');el.onclick=e=>{e.stopPropagation();if(!suppressClickAfterDrag&&(state.selected!==x.id||state.selectedType!=='logo'||e.shiftKey))setSelected(x.id,'logo',e.shiftKey)};flap.appendChild(el);applyOutlinePreview(el,x,s);
    el.ondblclick=event=>{event.preventDefault();event.stopPropagation();if(vectorEditingLogoId)return;setSelected(x.id,'logo');openArtworkCrop();};
    if(editing){mountVectorPieceEditor(el,x);vectorPieceApi.highlight();selectedVectorPieceId=vectorPieceApi.selectedId();}
    else if(x.svgMarkup)mountVectorLogoPreview(el,x);
  });
  state.texts.forEach(original=>{
    const t=displayTextObject(original);
    const d=document.createElement('div');d.textContent=t.text;
    d.dataset.layoutId=t.id;d.dataset.layoutType='text';
    d.className='item text-item'+(state.selected===t.id&&state.selectedType==='text'?' selected':'')+(multiSelection.some(r=>r.id===t.id&&r.type==='text')?' multi-selected':'');
    d.style.left=(t.x*100)+'%';d.style.top=(t.y*100)+'%';d.style.fontSize=(t.size*s)+'px';d.style.color=t.color;
    d.style.transform=artworkTransform(t);
    d.style.fontFamily=printFontFamily(t.font);
    d.style.fontWeight=String(textWeight(t.weight));
    d.style.letterSpacing=(textTracking(t.tracking)*s)+'px';
    d.style.fontKerning=textTracking(t.tracking)?'none':'auto';
    d.style.textAlign=t.align||'center';applyOutlinePreview(d,t,s);
    bindDrag(d,original,'text');d.onclick=e=>{e.stopPropagation();if(!suppressClickAfterDrag&&(state.selected!==t.id||state.selectedType!=='text'||e.shiftKey))setSelected(t.id,'text',e.shiftKey)};flap.appendChild(d);applyOutlinePreview(d,t,s);
    if(t.tightBounds&&!/[\r\n]/.test(t.text)&&!artworkRotation(t)&&!t.flipX){const box=textInkRect(t,d),frame=d.getBoundingClientRect();d.classList.add('tight-text');d.style.setProperty('--ink-left',(box.left-frame.left)+'px');d.style.setProperty('--ink-top',(box.top-frame.top)+'px');d.style.setProperty('--ink-width',(box.right-box.left)+'px');d.style.setProperty('--ink-height',(box.bottom-box.top)+'px');}
  });
  pruneOutlinePreviewFilters();
  for(const entry of SpatlapVectorExport.orderedItems(state)){const element=layoutElement({id:entry.obj.id,type:entry.type});if(element)flap.append(element);}
  const contour=contourSvg();
  if(contour){const overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.setAttribute('viewBox',`0 0 ${w} ${h}`);overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:7';overlay.innerHTML=contour;flap.appendChild(overlay);}
  $('contourStatus').textContent=contourSettings().on&&!contour?'Deze afstand of lijndikte past niet binnen de spatlap. Kies een kleinere waarde.':'';
  if(state.ui?.topGuideOn){
    const guide=document.createElement('div');guide.className='top-guide';
    guide.style.height=(printableTopCm()/h*100)+'%';
    flap.appendChild(guide);
    const overlaps=topGuideOverlapCount();
    $('topGuideStatus').textContent=overlaps?`${overlaps} onderdeel${overlaps===1?'':'en'} raakt of overlapt de strook.`:'Geen onderdelen in de strook.';
  }else $('topGuideStatus').textContent='';
  renderLists();
  updateWideToolButtons();
  updateSelectionActionBar();
  updateExportReadiness();
  syncVectorPieceControls();
  updateVectorStatusBadge();
}

function layoutRefs(){return [...state.logos.map(obj=>({id:obj.id,type:'logo'})),...state.texts.map(obj=>({id:obj.id,type:'text'}))];}

function layoutElement(ref){return [...$('flap').querySelectorAll('[data-layout-id]')].find(el=>el.dataset.layoutId===ref.id&&el.dataset.layoutType===ref.type);}

let textInkContext=null;
const textInkMetrics=new Map();
function invalidateTextInkMetrics(){textInkMetrics.clear();}
function textInkRect(text,el){
  const rect=el.getBoundingClientRect();
  if(/[\r\n]/.test(text.text)||artworkRotation(text)||text.flipX)return rect;
  const px=parseFloat(getComputedStyle(el).fontSize),spacing=textTracking(text.tracking)/text.size*1000;
  const key=JSON.stringify([text.text,text.font,textWeight(text.weight),spacing]);let measured=textInkMetrics.get(key);
  if(!measured){
    const ctx=textInkContext??=document.createElement('canvas').getContext('2d');
    ctx.font=`${textWeight(text.weight)} 1000px ${printFontFamily(text.font)}`;
    const hasSpacing='letterSpacing' in ctx;if(hasSpacing)ctx.letterSpacing=spacing+'px';
    if('fontKerning' in ctx)ctx.fontKerning=spacing?'none':'auto';
    measured={metrics:ctx.measureText(text.text),hasSpacing};textInkMetrics.set(key,measured);
    if(textInkMetrics.size>200)textInkMetrics.delete(textInkMetrics.keys().next().value);
  }
  const {metrics:m,hasSpacing}=measured,scale=px/1000,ascent=m.fontBoundingBoxAscent??800,descent=m.fontBoundingBoxDescent??200,baseline=rect.top+rect.height/2+(ascent-descent)*scale/2;
  const left=rect.left-m.actualBoundingBoxLeft*scale,right=rect.left+(m.actualBoundingBoxRight+(hasSpacing?0:spacing*Math.max(0,[...text.text].length-1)))*scale;
  return {left,right,top:baseline-m.actualBoundingBoxAscent*scale,bottom:baseline+m.actualBoundingBoxDescent*scale};
}

function layoutBox(ref){
  const el=layoutElement(ref);if(!el)return null;
  const obj=itemById(ref.id,ref.type),r=ref.type==='text'&&obj?.tightBounds?textInkRect(displayTextObject(obj),el):el.getBoundingClientRect(),f=$('flap').getBoundingClientRect();
  return {left:(r.left-f.left)/f.width*state.flap.w,right:(r.right-f.left)/f.width*state.flap.w,top:(r.top-f.top)/f.height*state.flap.h,bottom:(r.bottom-f.top)/f.height*state.flap.h};
}

function clearLayoutGuides(){$('flap').querySelectorAll('.layout-guide').forEach(el=>el.remove());}

function showLayoutGuides(guides){
  clearLayoutGuides();if(!layoutOptions.guides)return;
  guides.forEach(g=>{if(g.axis==='gap'){const line=document.createElement('div');line.className='layout-guide layout-gap';Object.assign(line.style,{left:g.start/state.flap.w*100+'%',top:g.y/state.flap.h*100+'%',width:(g.end-g.start)/state.flap.w*100+'%'});const label=document.createElement('span');label.textContent=Number(g.gap.toFixed(1))+' cm';line.append(label);$('flap').append(line);return;}const el=document.createElement('div');el.className='layout-guide '+(g.axis==='x'?'vertical':'horizontal');el.style[g.axis==='x'?'left':'top']=(g.value/(g.axis==='x'?state.flap.w:state.flap.h)*100)+'%';$('flap').append(el);});
}

function paintSelectionDimensionError(){const invalid=['selectionWidth','selectionHeight'].map(id=>$(id)).find(input=>input.getAttribute('aria-invalid')==='true');const message=$('selectionDimensionError');if(message)message.textContent=invalid?invalid.validationMessage||'Controleer de selectieafmeting.':'';}
function syncSelectionDimensions(){
  const textSelected=allSelectedRefs().some(ref=>ref.type==='text'),locked=selectionRatioLocked||textSelected,lock=$('selectionRatioLock');
  $('selectionRatioDescription').textContent=locked?' Verhouding behouden (standaard).':' Breedte en hoogte afzonderlijk aanpassen.';lock.textContent=locked?'🔒':'🔓';lock.setAttribute('aria-pressed',String(locked));lock.setAttribute('aria-label',locked?'Verhouding vergrendeld':'Vrij schalen');lock.title=textSelected?'Tekst schaalt proportioneel':locked?'Klik om breedte en hoogte afzonderlijk te wijzigen':'Klik om verhouding te vergrendelen';

  const box=SpatlapLayout.union(allSelectedRefs().map(layoutBox).filter(Boolean));
  for(const [id,value] of [['selectionWidth',box?box.right-box.left:0],['selectionHeight',box?box.bottom-box.top:0]]){
    const input=$(id);input.disabled=!box||!!vectorEditingLogoId;
    const invalidHere=!input.disabled&&input.dataset.invalidSelection===JSON.stringify(allSelectedRefs());
    if(!invalidHere){input.setCustomValidity('');input.removeAttribute('aria-invalid');delete input.dataset.invalidSelection;if(document.activeElement!==input)input.value=box?Number(value.toFixed(2)):'';}
    for(const button of document.querySelectorAll('[data-dimension-step^="'+id+':"]'))button.disabled=input.disabled;
  }
  paintSelectionDimensionError();
}

function resizeLogoSelection(axis,factor){
  if(vectorEditingLogoId)return;
  const refs=allSelectedRefs(),box=SpatlapLayout.union(refs.map(layoutBox).filter(Boolean));if(!box||!Number.isFinite(factor)||factor<=0)return;
  if(refs.some(ref=>ref.type!=='logo'))return;
  const objects=refs.map(ref=>itemById(ref.id,ref.type));
  const dimension=obj=>artworkRotation(obj)%180?(axis==='w'?'h':'w'):axis;
  if(objects.some(obj=>obj[dimension(obj)]*factor<.1||obj[dimension(obj)]*factor>10000)){toast('Dit formaat valt buiten het bruikbare bereik.');return;}
  pushHistory();const center=axis==='w'?(box.left+box.right)/2:(box.top+box.bottom)/2;
  for(const obj of objects){if(axis==='w')obj.x=(center+(obj.x*state.flap.w-center)*factor)/state.flap.w;else obj.y=(center+(obj.y*state.flap.h-center)*factor)/state.flap.h;obj[dimension(obj)]*=factor;obj.ratio=obj.w/obj.h;}
  syncSelectionControls();render();toast('Selectie vrij op maat gezet');
}

function scaleSelectedObjects(factor,message){
  if(vectorEditingLogoId){toast('Klik eerst op Klaar met onderdelen bewerken om het hele logo te schalen.');return;}
  const refs=allSelectedRefs(),boxes=refs.map(layoutBox).filter(Boolean),group=SpatlapLayout.union(boxes);if(!group)return;
  const entries=refs.map(ref=>({ref,obj:itemById(ref.id,ref.type)})).filter(e=>e.obj);
  if(entries.some(({ref,obj})=>(ref.type==='logo'?Math.min(obj.w,obj.h):obj.size)*factor<.1)||Math.max(group.right-group.left,group.bottom-group.top)*factor>10000){toast('Dit formaat valt buiten het bruikbare bereik.');return;}
  pushHistory();const cx=(group.left+group.right)/2,cy=(group.top+group.bottom)/2;
  entries.forEach(({ref,obj})=>{obj.x=(cx+(obj.x*state.flap.w-cx)*factor)/state.flap.w;obj.y=(cy+(obj.y*state.flap.h-cy)*factor)/state.flap.h;
    if(ref.type==='logo'){obj.w*=factor;obj.h*=factor;}else{obj.size*=factor;obj.tracking=textTracking(obj.tracking)*factor;}
  });syncSelectionControls();render();toast(message||(factor>1?'Selectie 10% groter':'Selectie 10% kleiner'));
}

function placeTextVertically(text,position){
  const box=layoutBox({id:text.id,type:'text'});
  if(!box)return;
  const height=box.bottom-box.top,center=(box.top+box.bottom)/2;
  text.y+=(verticalPlacement(height,position)*state.flap.h-center)/state.flap.h;
}

function updateLayoutReferences(refs){
  const select=$('layoutReference');if(!select)return;
  updateSnapReferenceOptions();
  const previous=select.value,available=layoutRefs().filter(r=>!refs.some(s=>s.id===r.id&&s.type===r.type));
  const signature=JSON.stringify(available.map(r=>[r.type,r.id,itemById(r.id,r.type)?.name||itemById(r.id,r.type)?.text]));
  if(select.dataset.options!==signature){select.replaceChildren(new Option('Spatlap','flap'));available.forEach(ref=>{const obj=itemById(ref.id,ref.type);select.add(new Option((ref.type==='logo'?'Logo: ':'Tekst: ')+(obj.name||obj.text||'Onderdeel'),selectionKey(ref.id,ref.type)));});select.value=previous;if(!select.value)select.value='flap';select.dataset.options=signature;}
}

function snapReferenceEnabled(ref){return !(state.ui?.snapExcluded||[]).includes(selectionKey(ref.id,ref.type));}

function updateSnapReferenceOptions(){
  const host=$('snapReferenceOptions');if(!host)return;
  const refs=layoutRefs(),signature=JSON.stringify(refs.map(ref=>[ref.id,ref.type,itemById(ref.id,ref.type)?.name||itemById(ref.id,ref.type)?.text,snapReferenceEnabled(ref)]));
  if(host.dataset.signature===signature)return;host.dataset.signature=signature;host.replaceChildren();
  if(!refs.length){host.textContent='Voeg eerst een logo of tekst toe.';return;}
  for(const ref of refs){const obj=itemById(ref.id,ref.type),label=document.createElement('label'),input=document.createElement('input');label.className='check';input.type='checkbox';input.checked=snapReferenceEnabled(ref);input.onchange=()=>{pushHistory();const excluded=new Set(state.ui.snapExcluded||[]),key=selectionKey(ref.id,ref.type);if(input.checked)excluded.delete(key);else excluded.add(key);state.ui.snapExcluded=[...excluded];clearLayoutGuides();render();};label.append(input,document.createTextNode(' '+(obj.name||obj.text||'Onderdeel')));host.append(label);}
}

function cancelVectorHeightMatch(){pendingHeightMatch=null;$('heightMatchSettings').open=false;$('heightMatchSettings').hidden=true;document.body.classList.remove('matching-vector-height');$('matchVectorHeight').textContent='↕ Hoogte';$('matchVectorHeight').setAttribute('aria-pressed','false');}

function heightMatchMeasurement(obj,type,mode){
  if(artworkRotation(obj)!==0&&mode!=='cap'){const box=layoutBox({id:obj.id,type});if(box)return box.bottom-box.top;}
  if(type==='logo')return obj.h;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  ctx.font=`${textWeight(obj.weight)} 1000px ${printFontFamily(obj.font)}`;
  const metrics=ctx.measureText(mode==='cap'?'H':String(obj.text||' ').split(/\r?\n/).join(' '));
  const pixels=mode==='cap'?metrics.actualBoundingBoxAscent:metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
  return pixels/1000*obj.size+(mode==='cap'?0:(String(obj.text||'').split(/\r?\n/).length-1)*obj.size);
}

function applyVectorHeightMatch(id,type){
  const pending=pendingHeightMatch;if(!pending)return;
  const source=itemById(pending.id,pending.type),reference=itemById(id,type);
  if(!source||JSON.stringify(source)!==pending.snapshot){cancelVectorHeightMatch();toast('De bron is gewijzigd. Start opnieuw.');return;}
  if((id===source.id&&type===pending.type)||!reference||(type==='logo'&&!reference.svgMarkup)){toast('Kies een ander vectorlogo of tekst als hoogtereferentie.');return;}
  if(pending.mode==='style'){
    if(type!=='text'||pending.type!=='text'){toast('Kies twee teksten om tekstopmaak over te nemen, of kies een hoogtemeting.');return;}
    pushHistory();for(const key of ['font','size','weight','tracking','color'])source[key]=reference[key];
    cancelVectorHeightMatch();syncSelectionControls();render();toast('Tekstopmaak overgenomen; tekstinhoud en positie behouden');return;
  }
  if((type==='text'&&!document.fonts.check(`1000px ${printFontFamily(reference.font)}`))||(pending.type==='text'&&!document.fonts.check(`1000px ${printFontFamily(source.font)}`))){toast('Het lettertype laadt nog. Kies de referentie zo opnieuw.');return;}
  const height=heightMatchMeasurement(reference,type,pending.mode),before=heightMatchMeasurement(source,pending.type,pending.mode),factor=height/before;
  const smallest=pending.type==='logo'?Math.min(source.w,source.h):source.size,largest=pending.type==='logo'?Math.max(source.w,source.h):source.size;
  if(!Number.isFinite(factor)||factor<=0||smallest*factor<.1||largest*factor>10000){toast('Deze hoogte valt buiten het bruikbare bereik.');return;}
  pushHistory();if(pending.type==='logo'){source.w*=factor;source.h*=factor;source.ratio=source.w/source.h;}else{source.size*=factor;source.tracking=textTracking(source.tracking)*factor;}
  cancelVectorHeightMatch();state.selected=source.id;state.selectedType=pending.type;clearMultiSelection();syncSelectionControls();render();toast('Hoogte overgenomen: '+Number(height.toFixed(2))+' cm'+(pending.mode==='cap'?' (hoofdletterlijn)':''));
}

function openPlacementSettings(){const panel=$('placementSettings');panel.open=true;panel.scrollIntoView({behavior:'smooth',block:'nearest'});}

function alignLayoutSelection(action){
  if(vectorEditingLogoId){toast('Rond eerst het bewerken van losse vectoronderdelen af.');return;}
  const refs=allSelectedRefs(),box=SpatlapLayout.union(refs.map(layoutBox).filter(Boolean));if(!box)return;
  const reference=layoutRefs().find(r=>selectionKey(r.id,r.type)===$('layoutReference').value),target=reference?layoutBox(reference):{left:0,right:state.flap.w,top:0,bottom:state.flap.h};
  if(!target)return;let dx=0,dy=0,message='Selectie uitgelijnd.';
  if(action==='left')dx=target.left-box.left;
  if(action==='right')dx=target.right-box.right;
  if(action==='centerX')dx=(target.left+target.right-box.left-box.right)/2;
  if(action==='centerY')dy=(target.top+target.bottom-box.top-box.bottom)/2;
  if(action==='top')dy=target.top-box.top;
  if(action==='bottom')dy=target.bottom-box.bottom;
  if(action==='balanceLeft'||action==='balanceRight'){
    if(!reference){$('layoutPlacementStatus').textContent='Kies een ander logo of tekst als referentie voor de ruimte tussen rand en middenlogo.';return;}
    const middle=(target.left+target.right)/2,useCenter=$('layoutSpacingEdge').value==='center',end=useCenter?middle:action==='balanceLeft'?target.left:target.right;
    const start=action==='balanceLeft'?0:end,stop=action==='balanceLeft'?end:state.flap.w,width=box.right-box.left;
    if(stop-start<width){$('layoutPlacementStatus').textContent='De selectie past niet tussen deze referentie en de buitenrand. Maak haar eerst kleiner.';return;}
    dx=(start+stop-box.left-box.right)/2;message='Beide afstanden: '+((stop-start-width)/2).toFixed(2).replace('.',',')+' cm'+(useCenter?' (gemeten tot midden referentie).':'.');
  }
  if(action==='bottomSide'){
    const gap=Math.min(box.left,state.flap.w-box.right);if(gap<0||gap+box.bottom-box.top>state.flap.h){$('layoutPlacementStatus').textContent=gap<0?'Het onderdeel staat buiten de spatlap. Plaats het eerst binnen de rand.':'Onderruimte past niet: zijruimte '+Number(gap.toFixed(1))+' cm + onderdeelhoogte '+Number((box.bottom-box.top).toFixed(1))+' cm is meer dan '+state.flap.h+' cm. Maak het onderdeel kleiner of plaats het dichter bij een zijkant.';toast($('layoutPlacementStatus').textContent);return;}
    dy=state.flap.h-gap-box.bottom;message='Onderruimte en dichtstbijzijnde zijruimte: '+gap.toFixed(2).replace('.',',')+' cm.';
  }
  pushHistory();refs.forEach(ref=>{const obj=itemById(ref.id,ref.type);if(obj){obj.x+=dx/state.flap.w;obj.y+=dy/state.flap.h;}});syncSelectionControls();render();$('layoutPlacementStatus').textContent=message;toast(message);
}

function suppressLayoutClick(){suppressClickAfterDrag=true;setTimeout(()=>suppressClickAfterDrag=false,160);}

function finishMarquee(cancel=false){
  if(!marquee)return;const m=marquee;marquee=null;m.overlay.remove();
  if(m.moved){const refs=cancel?m.previous:m.refs||[];state.selected=refs[0]?.id||null;state.selectedType=refs[0]?.type||null;multiSelection=refs.slice(1);suppressLayoutClick();syncSelectionControls();render();}
  try{$('previewWrap').releasePointerCapture(m.id);}catch{}
}

function bindDrag(el,obj,type){
  el.addEventListener('pointerdown',e=>{
    if(e.defaultPrevented||document.body.classList.contains('feedback-picking')||e.button!==0)return;e.stopPropagation();
    const refs=isSelectedRef(obj.id,type)?allSelectedRefs():e.shiftKey?[...allSelectedRefs(),{id:obj.id,type}]:[{id:obj.id,type}];
    const entries=refs.map(ref=>({ref,obj:itemById(ref.id,ref.type),box:layoutBox(ref)})).filter(entry=>entry.obj&&entry.box);
    drag={obj,type,id:e.pointerId,startClientX:e.clientX,startClientY:e.clientY,moved:false,snapshot:cloneState(),entries:entries.map(entry=>({...entry,x:entry.obj.x,y:entry.obj.y})),box:SpatlapLayout.union(entries.map(e=>e.box)),targets:layoutRefs().filter(r=>snapReferenceEnabled(r)&&!refs.some(s=>r.id===s.id&&r.type===s.type)).map(layoutBox).filter(Boolean)};
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId||drag.obj.id!==obj.id)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.startClientX,e.clientY-drag.startClientY)<3)return;
    if(!drag.moved){drag.moved=true;state.selected=obj.id;state.selectedType=type;multiSelection=drag.entries.map(e=>e.ref).filter(r=>r.id!==obj.id||r.type!==type);syncSelectionControls();renderLists();updateSelectionActionBar();}
    const rect=$('flap').getBoundingClientRect();let dx=(e.clientX-drag.startClientX)/rect.width*state.flap.w,dy=(e.clientY-drag.startClientY)/rect.height*state.flap.h;
    const next=SpatlapLayout.translate(drag.box,dx,dy),targets=[{left:0,top:0,right:state.flap.w,bottom:state.flap.h,centerOnly:true},...drag.targets];
    const adjustment=e.altKey?{dx:0,dy:0,guides:[]}:SpatlapLayout.snap(next,targets,6*state.flap.w/rect.width);
    const balanced=e.altKey?null:SpatlapLayout.equalSideSpace(next,drag.targets,state.flap.w,6*state.flap.w/rect.width);
    if(balanced){adjustment.dx=balanced.dx;adjustment.guides=adjustment.guides.filter(g=>g.axis!=='x');adjustment.guides.push(...balanced.guides);}
    if(layoutOptions.snap){dx+=adjustment.dx;dy+=adjustment.dy;}showLayoutGuides(adjustment.guides);
    drag.entries.forEach(entry=>{entry.obj.x=entry.x+dx/state.flap.w;entry.obj.y=entry.y+dy/state.flap.h;const node=layoutElement(entry.ref);if(node){node.classList.add('multi-selected');node.style.left=entry.obj.x*100+'%';node.style.top=entry.obj.y*100+'%';}});syncSelectionControls();
  });
  function finish(cancel){
    if(!drag||drag.obj.id!==obj.id)return;const d=drag;drag=null;clearLayoutGuides();
    if(d.moved){if(cancel)d.entries.forEach(e=>{e.obj.x=e.x;e.obj.y=e.y;});else{history.push(d.snapshot);if(history.length>50)history.shift();redoHistory=[];updateHistoryButtons();}suppressLayoutClick();syncSelectionControls();render();}
  }
  el.addEventListener('pointerup',()=>finish(false));el.addEventListener('pointercancel',()=>finish(true));el.addEventListener('lostpointercapture',()=>finish(true));
}
