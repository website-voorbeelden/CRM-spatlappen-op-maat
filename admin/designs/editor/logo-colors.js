let vectorExperiment=null,paletteSplitBusy=false;
const logoPaletteCache=new WeakMap();
function paletteOpacity(value){return parseFloat(value)/(String(value).endsWith('%')?100:1);}
function paintAlpha(value){const match=String(value).match(/(?:,|\/)\s*([\d.]+%?)\s*\)$/);return match&&(/^rgba\(/i.test(value)||String(value).includes('/'))?Math.max(0,Math.min(1,parseFloat(match[1])/(match[1].endsWith('%')?100:1))):1;}
function paletteGeometry(root){return [...root.querySelectorAll('[data-sp-geometry]')].filter(shape=>!shape.closest('defs,clipPath,linearGradient,radialGradient,[display="none"],[visibility="hidden"]'));}
function visiblePaint(shape,channel){
 const paint=shape.getAttribute(channel)||(channel==='fill'?'#000000':'none');
 if(paint==='none'||paint==='transparent'||paintAlpha(paint)===0||paletteOpacity(shape.getAttribute(channel+'-opacity')||'1')===0)return null;
 for(let parent=shape;parent;parent=parent.parentElement)if(paletteOpacity(parent.getAttribute('opacity')||'1')===0)return null;
 return paint;
}
function logoPalette(logo){
 const cached=logoPaletteCache.get(logo);if(cached?.markup===logo.svgMarkup)return cached;
 const prepared=SpatlapVectorEditor.prepare(logo.svgMarkup),root=SpatlapVectorExport.parseLogo(prepared.markup),colors=new Map();let complex=false;
 for(const shape of paletteGeometry(root))for(const channel of ['fill','stroke']){
  const paint=visiblePaint(shape,channel);if(!paint)continue;const hex=SpatlapVectorEditor.colour(paint);if(!hex){complex=true;continue;}
  const piece=shape.closest('[data-sp-piece]');if(!piece)continue;const entries=colors.get(hex)||[];entries.push({piece:piece.getAttribute('data-sp-piece'),channel});colors.set(hex,entries);
 }
 const result={markup:logo.svgMarkup,prepared,colors,complex};logoPaletteCache.set(logo,result);return result;
}
function changeLogoPalette(logo,from,to){
 const expected=JSON.stringify(logo),palette=logoPalette(logo),root=SpatlapVectorExport.parseLogo(palette.prepared.markup);let changed=false;
 for(const shape of paletteGeometry(root))for(const channel of ['fill','stroke']){
  const paint=visiblePaint(shape,channel);if(!paint||SpatlapVectorEditor.colour(paint)!==from)continue;
  if(to){const alpha=paintAlpha(paint),prior=shape.getAttribute(channel+'-opacity')||'1';if(alpha<1)shape.setAttribute(channel+'-opacity',String((parseFloat(prior)/(prior.endsWith('%')?100:1))*alpha));}
  if(shape.getAttribute(channel)!==(to||'none')){shape.setAttribute(channel,to||'none');changed=true;}
 }
 if(!changed){toast('Deze kleur is al ingesteld.');return;}
 if(itemById(logo.id,'logo')!==logo||JSON.stringify(logo)!==expected)throw Error('Het logo is gewijzigd. Kies de kleur opnieuw.');
 pushHistory();rememberVectorOriginal(logo);clearVectorEditing();applyVectorRoot(logo,root);syncSelectionControls();render();
}
async function separatePaletteIslands(logo,color){
 if(paletteSplitBusy){toast('De kleursegmenten worden al herkend.');return;}paletteSplitBusy=true;
 const expected=JSON.stringify([logo,state.flap]),activity=beginPreviewActivity('Losse vectordelen herkennen…');
 try{
  await previewPaintTick();const result=await splitVectorIslands(logo.svgMarkup,color);
  if(state.selectedType!=='logo'||state.selected!==logo.id||itemById(logo.id,'logo')!==logo||JSON.stringify([logo,state.flap])!==expected)throw Error('Het logo of de spatlap is gewijzigd. Kies de kleur opnieuw.');
  if(!result.split){activity.cancel('Deze kleur heeft geen extra bewerkbare segmenten. Lijnen en uitsnedes blijven ongewijzigd.');return;}
  pushHistory();rememberVectorOriginal(logo);clearVectorEditing();applyVectorRoot(logo,result.root);syncSelectionControls();render();activity.success(result.parts+' kleursegmenten beschikbaar bij Meer. Gaten blijven bij de buitenvorm en de contouren blijven vector.'+(result.skipped?' Lijnen, andere kleuren of uitsnedes zijn overgeslagen.':''));
 }catch(error){activity.error(error);}finally{paletteSplitBusy=false;}
}
function syncLogoPalette(){
 const host=$('logoPalette'),logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;if(!host)return;
 if(!logo?.svgMarkup){host.replaceChildren();host.dataset.signature='';host.paletteLogo=null;return;}
 const signature=logo.id+':'+logo.svgMarkup;if(host.dataset.signature===signature&&host.paletteLogo===logo)return;host.dataset.signature=signature;host.paletteLogo=logo;host.replaceChildren();
 try{
  const palette=logoPalette(logo),title=document.createElement('p');title.textContent=palette.colors.size+' vaste kleur(en) in dit logo';host.append(title);
  for(const [color,entries]of palette.colors){
   const row=document.createElement('div');row.className='logo-palette-row';const label=document.createElement('label');label.textContent=color;
   const field=document.createElement('input');field.type='color';field.value=color;field.setAttribute('aria-label','Nieuwe kleur in plaats van '+color);label.append(field);
   const apply=document.createElement('button');apply.type='button';apply.textContent='Kleur aanpassen';apply.onclick=()=>{try{changeLogoPalette(logo,color,field.value);}catch(error){toast(error.message);}};
   const more=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Meer';more.append(summary);
   const remove=document.createElement('button');remove.type='button';remove.textContent='Deze kleur weghalen';remove.onclick=()=>{if(window.confirm('Alle zichtbare vullingen en lijnen met '+color+' uit dit logo weghalen? Andere kleuren blijven behouden.'))try{changeLogoPalette(logo,color,null);}catch(error){toast(error.message);}};more.append(remove);
   const details=document.createElement('details'),partsTitle=document.createElement('summary');partsTitle.textContent='Losse delen bewerken';details.append(partsTitle);
   const split=document.createElement('button');split.type='button';split.textContent='Losse eilanden herkennen';split.onclick=()=>separatePaletteIslands(logo,color);details.append(split);
   const note=document.createElement('p');note.className='field-help';note.textContent='Herkent gevulde kleursegmenten met hun gaten, ook bij overlappende kaders. Aangrenzende ondoorzichtige vormen van dezelfde kleur worden samengenomen als hun lagen naast elkaar staan. Transparante vormen worden afzonderlijk behandeld; lijnen en uitsnedes blijven ongewijzigd. Kies daarna een deel om het te verplaatsen of te kleuren.';details.append(note);
   for(const id of new Set(entries.map(entry=>entry.piece))){const button=document.createElement('button');button.type='button';button.textContent='Deel '+id.replace(/^p/,'');button.onclick=()=>{if(itemById(logo.id,'logo')!==logo){toast('Kies het logo opnieuw.');return;}if(vectorEditingLogoId!==logo.id)$('toggleVectorParts').click();vectorPieceApi?.select(id);$('vectorAdvanced').open=true;};details.append(button);}
   more.append(details);row.append(label,apply,more);host.append(row);
  }
  if(palette.complex){const note=document.createElement('p');note.className='field-help';note.textContent='Kleurverlopen staan bij Meer van het logo. Deze lijst groepeert de zichtbare vaste kleuren.';host.append(note);}
 }catch(error){const note=document.createElement('p');note.className='field-help';note.textContent=error.message;host.append(note);}
}
function traceLogoObject(logo,result){
 const copy={...logo},old=logo.vectorCrop||{x:0,y:0,w:1,h:1},next={x:result.crop.x/result.sourceW,y:result.crop.y/result.sourceH,w:result.crop.w/result.sourceW,h:result.crop.h/result.sourceH};
 const w=logo.w*next.w/old.w,h=logo.h*next.h/old.h;
 offsetArtworkCenter(copy,logo.w*(next.x-old.x)/old.w+(w-logo.w)/2,logo.h*(next.y-old.y)/old.h+(h-logo.h)/2);
 Object.assign(copy,{w,h,ratio:w/h,vectorCrop:next,src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(result.markup),svgMarkup:result.markup,vector:true,printColors:result.colors});return copy;
}
function displayLogoObject(logo){if(vectorExperiment?.id===logo.id&&vectorExperiment.signature===JSON.stringify([logo,state.flap]))return vectorExperiment.display??=traceLogoObject(logo,vectorExperiment.result);return logo;}
function stopVectorExperiment(){vectorPreviewPaused=true;vectorExperiment=null;vectorPreviewToken++;vectorPreviewSettings='';clearTimeout(vectorPreviewTimer);$('vectorOriginalPreview').removeAttribute('src');$('vectorResultPreview').removeAttribute('src');$('vectorPreviewStatus').textContent='Voorbeeld gestopt; het opgeslagen artwork is niet aangepast.';render();}
