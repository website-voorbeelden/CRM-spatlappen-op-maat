// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function clearVectorEditing(){vectorEditingLogoId=null;selectedVectorPieceId=null;vectorPieceApi=null;}

function discardVectorEditBackup(logo){
  delete logo.originalVectorMarkup;delete logo.originalVectorFrame;delete logo.originalVectorPrintColors;
  if(vectorEditingLogoId===logo.id)clearVectorEditing();
}

function rememberVectorOriginal(logo){
  if(logo.originalVectorMarkup)return;
  logo.originalVectorMarkup=logo.svgMarkup;
  logo.originalVectorPrintColors=logo.printColors?logo.printColors.slice():null;
  logo.originalVectorFrame={x:logo.x,y:logo.y,w:logo.w,h:logo.h,ratio:logo.ratio,vectorCrop:logo.vectorCrop?{...logo.vectorCrop}:null};
}

function updateVectorSource(logo,markup){logo.svgMarkup=markup;logo.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);logo.vector=true;}

function applyVectorRoot(logo,root,reframe=false){
  const old=SpatlapVectorEditor.viewBox(root),next=reframe?SpatlapVectorEditor.expandedBox(root):old;
  const [left,top,width,height]=next;
  if(!next.every(Number.isFinite)||width<=0||height<=0)throw new Error('Het vectoronderdeel heeft ongeldige afmetingen.');
  if(reframe){
    // Expand the image viewport without shifting any of its other shapes.
    const oldW=logo.w,oldH=logo.h,oldLeft=logo.x*state.flap.w-oldW/2,oldTop=logo.y*state.flap.h-oldH/2;
    logo.w=oldW*width/old[2];logo.h=oldH*height/old[3];logo.ratio=logo.w/logo.h;
    logo.x=(oldLeft+(left-old[0])*oldW/old[2]+logo.w/2)/state.flap.w;
    logo.y=(oldTop+(top-old[1])*oldH/old[3]+logo.h/2)/state.flap.h;
    if(logo.vectorCrop){const c=logo.vectorCrop;logo.vectorCrop={x:c.x+c.w*(left-old[0])/old[2],y:c.y+c.h*(top-old[1])/old[3],w:c.w*width/old[2],h:c.h*height/old[3]};}
  }
  root.setAttribute('viewBox',next.join(' '));root.setAttribute('width',String(width));root.setAttribute('height',String(height));
  updateVectorSource(logo,SpatlapVectorEditor.serialize(root));
  const colors=SpatlapVectorEditor.printColours(root);
  if(colors)logo.printColors=colors;else delete logo.printColors;
}

function syncVectorPieceControls(){
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;
  if(!logo?.svgMarkup||logo.id!==vectorEditingLogoId||!logo.svgMarkup.includes('data-sp-piece')){if(vectorEditingLogoId)clearVectorEditing();}
  $('vectorPieceControls').style.display=logo?.svgMarkup?'block':'none';
  if($('wholeLogoColorStatus').dataset.logoId!==logo?.id)$('wholeLogoColorStatus').textContent='';
  const editing=logo?.id===vectorEditingLogoId;
  $('toggleVectorParts').textContent=editing?'Klaar met onderdelen bewerken':'Losse vectoronderdelen bewerken';
  $('restoreVectorOriginal').disabled=!logo?.originalVectorMarkup;
  $('vectorPieceEditPanel').style.display=editing?'block':'none';
  $('vectorPieceForm').style.display=editing&&vectorPieceApi?.selected()?'block':'none';
  if(!editing||!vectorPieceApi)return;
  const list=$('vectorPartSelect'),parts=vectorPieceApi.parts();list.replaceChildren();
  for(const part of parts){const option=document.createElement('option');option.value=part.id;option.textContent=part.label;list.append(option);}
  list.value=selectedVectorPieceId||'';
  $('vectorPieceCount').textContent=`${parts.length} losse SVG-onderdelen. Klik op een vorm in de preview of kies hieronder.`;
  const el=vectorPieceApi.selected();if(!el)return;
  const fill=el.getAttribute('fill')||'#000000',stroke=el.getAttribute('stroke')||'none';
  $('vectorPartFillOn').checked=fill!=='none';$('vectorPartFill').disabled=fill==='none';
  $('vectorPartFill').value=SpatlapVectorEditor.colour(fill)||'#FFFFFF';
  $('vectorPartStrokeRow').style.display=stroke==='none'?'none':'block';
  $('vectorPartStroke').value=SpatlapVectorEditor.colour(stroke)||'#FFFFFF';
  $('vectorPartPaintNote').textContent=fill.includes('url(')||stroke.includes('url(')?'Dit onderdeel gebruikt een kleurverloop. Een gekozen kleur vervangt dat verloop op dit onderdeel.':'';
  syncVectorPiecePosition();
}

function syncVectorPiecePosition(){
  if(!vectorPieceApi)return;const p=vectorPieceApi.position();
  if(document.activeElement!==$('vectorPartX'))$('vectorPartX').value=Math.round(p.x*100)/100;
  if(document.activeElement!==$('vectorPartY'))$('vectorPartY').value=Math.round(p.y*100)/100;
}

function mountVectorPieceEditor(host,logo){
  vectorPieceApi=SpatlapVectorEditor.mount(host,logo,{
    partId:selectedVectorPieceId,
    onSelect(id){if(itemById(logo.id,'logo')!==logo)return;selectedVectorPieceId=id;syncVectorPieceControls();selectionColorTools?.refresh();},
    onPreview(){syncVectorPiecePosition();},
    onCommit(root,reframe){
      if(itemById(logo.id,'logo')!==logo)return;
      suppressClickAfterDrag=true;setTimeout(()=>suppressClickAfterDrag=false,120);
      try{pushHistory();applyVectorRoot(logo,root,reframe);syncSelectionControls();render();}
      catch(error){render();toast(error.message||'Verplaatsen lukte niet.');}
    }
  });
}

function mutateVectorPiece(change,reframe=false){
  const logo=itemById(vectorEditingLogoId,'logo');if(!logo||!vectorPieceApi?.selected())return;
  try{pushHistory();change(vectorPieceApi);selectedVectorPieceId=vectorPieceApi.selectedId();applyVectorRoot(logo,vectorPieceApi.root,reframe);render();syncSelectionControls();}
  catch(error){render();toast(error.message||'Vectoronderdeel aanpassen lukte niet.');}
}

function vectorPieceKeydown(e,typing){
  if(typing||!vectorPieceApi||!vectorEditingLogoId)return false;
  if(e.key==='Escape'){e.preventDefault();deselectArtwork();return true;}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();const step=e.shiftKey?1:.1,p=vectorPieceApi.position();
    mutateVectorPiece(api=>api.moveTo(p.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),p.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)),true);return true;
  }
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('deleteVectorPart').click();return true;}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();$('duplicateVectorPart').click();return true;}
  return false;
}
