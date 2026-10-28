// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function deselectArtwork(){
  cancelVectorHeightMatch();
  clearVectorEditing();state.selected=null;state.selectedType=null;clearMultiSelection();clearLayoutGuides();
  const placement=$('placementSettings');if(placement)placement.open=false;
  syncSelectionControls();render();
}

function roundRectPath(ctx,x,y,w,h,rTL,rTR,rBR,rBL){
  // Circular arcs match CSS border-radius, including its shared radius scaling.
  const ratio=(length,sum)=>sum>0?length/sum:1;
  const factor=Math.min(1,ratio(w,rTL+rTR),ratio(w,rBL+rBR),ratio(h,rTL+rBL),ratio(h,rTR+rBR));
  rTL*=factor;rTR*=factor;rBR*=factor;rBL*=factor;
  ctx.beginPath();ctx.moveTo(x+rTL,y);ctx.lineTo(x+w-rTR,y);
  if(rTR>0)ctx.arc(x+w-rTR,y+rTR,rTR,-Math.PI/2,0);
  ctx.lineTo(x+w,y+h-rBR);
  if(rBR>0)ctx.arc(x+w-rBR,y+h-rBR,rBR,0,Math.PI/2);
  ctx.lineTo(x+rBL,y+h);
  if(rBL>0)ctx.arc(x+rBL,y+h-rBL,rBL,Math.PI/2,Math.PI);
  ctx.lineTo(x,y+rTL);
  if(rTL>0)ctx.arc(x+rTL,y+rTL,rTL,Math.PI,Math.PI*1.5);
  ctx.closePath();
}

function shoulderCssPath(w,h,inset,topH,r,scale=1){
  const commands=[],point=(x,y)=>`${x*scale} ${y*scale}`;
  const sink={beginPath(){commands.length=0;},moveTo(x,y){commands.push('M'+point(x,y));},lineTo(x,y){commands.push('L'+point(x,y));},quadraticCurveTo(x,y,a,b){commands.push('Q'+point(x,y)+' '+point(a,b));},bezierCurveTo(x,y,a,b,e,f){commands.push('C'+point(x,y)+' '+point(a,b)+' '+point(e,f));},closePath(){commands.push('Z');}};
  shoulderRoundedPath(sink,w/scale,h/scale,inset/scale,topH/scale,r/scale);
  return `path("${commands.join(' ')}")`;
}

function shoulderRoundedPath(ctx,w,h,inset,topH,r){
  inset=Math.min(Math.max(0,inset),w*.42);
  topH=Math.min(Math.max(1,topH),h*.58);
  r=Math.min(Math.max(0,r),h*.16,(w-2*inset)/5);
  const shoulderH=Math.min(
    Math.max(h*.10, r*1.2),
    Math.max(1, h-topH-r*1.5)
  );

  const xL=inset;
  const xR=w-inset;
  const yJoin=topH+shoulderH;

  ctx.beginPath();
  ctx.moveTo(xL+r,0);
  ctx.lineTo(xR-r,0);
  ctx.quadraticCurveTo(xR,0,xR,r);
  ctx.lineTo(xR,topH);

  // Single clean shoulder curve to the full width.
  ctx.bezierCurveTo(
    xR, topH+shoulderH*.45,
    w,  yJoin-shoulderH*.45,
    w,  yJoin
  );

  ctx.lineTo(w,h-r);
  ctx.quadraticCurveTo(w,h,w-r,h);
  ctx.lineTo(r,h);
  ctx.quadraticCurveTo(0,h,0,h-r);
  ctx.lineTo(0,yJoin);

  // Mirrored shoulder.
  ctx.bezierCurveTo(
    0,  yJoin-shoulderH*.45,
    xL, topH+shoulderH*.45,
    xL, topH
  );

  ctx.lineTo(xL,r);
  ctx.quadraticCurveTo(xL,0,xL+r,0);
  ctx.closePath();
}

function drawDesignLogo(ctx,img,obj,cx,cy,width,height){ctx.save();try{ctx.translate(cx,cy);ctx.rotate(artworkRotation(obj)*Math.PI/180);ctx.scale(obj.flipX===true?-1:1,1);const outline=outlineStyle(obj);if(outline){const radius=outline.width*width/obj.w,ratio=Math.min(1,4096/Math.max(width,height)),mask=document.createElement('canvas');mask.width=Math.max(1,Math.ceil(width*ratio));mask.height=Math.max(1,Math.ceil(height*ratio));const paint=mask.getContext('2d');paint.drawImage(img,0,0,mask.width,mask.height);paint.globalCompositeOperation='source-in';paint.fillStyle=outline.color;paint.fillRect(0,0,mask.width,mask.height);for(let step=0;step<48;step++){const angle=step/48*Math.PI*2;ctx.drawImage(mask,-width/2+Math.cos(angle)*radius,-height/2+Math.sin(angle)*radius,width,height);}}ctx.drawImage(img,-width/2,-height/2,width,height);}finally{ctx.restore();}}
function drawDesignText(ctx,t,centerX,y,pxPerCm){
 ctx.save();try{
  ctx.translate(centerX,y);ctx.rotate(artworkRotation(t)*Math.PI/180);ctx.scale(t.flipX===true?-1:1,1);
  const lines=String(t.text||'').split(/\r?\n/),spacing=textTracking(t.tracking)*pxPerCm,lineHeight=t.size*pxPerCm;
  ctx.font=`${textWeight(t.weight)} ${lineHeight}px ${printFontFamily(t.font)}`;ctx.fillStyle=t.color;ctx.textBaseline='middle';
  const glyphs=value=>typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value)].map(p=>p.segment):Array.from(value);
  const width=value=>spacing?glyphs(value).reduce((sum,c)=>sum+ctx.measureText(c).width,0)+Math.max(0,glyphs(value).length-1)*spacing:ctx.measureText(value).width;
  const maxWidth=Math.max(0,...lines.map(width));
  lines.forEach((value,index)=>{const lineWidth=width(value),left=t.align==='left'?-maxWidth/2:t.align==='right'?maxWidth/2-lineWidth:-lineWidth/2,baseline=(index-(lines.length-1)/2)*lineHeight;
   const outline=outlineStyle(t);ctx.textAlign='left';if(outline){ctx.strokeStyle=outline.color;ctx.lineWidth=2*outline.width*pxPerCm;ctx.lineJoin='round';if(!spacing)ctx.strokeText(value,left,baseline);else{let x=left;for(const char of glyphs(value)){ctx.strokeText(char,x,baseline);x+=ctx.measureText(char).width+spacing;}}}if(!spacing){ctx.fillText(value,left,baseline);return;}let x=left;for(const char of glyphs(value)){ctx.fillText(char,x,baseline);x+=ctx.measureText(char).width+spacing;}
  });
 }finally{ctx.restore();}
}

function artworkExportSignature(){return JSON.stringify([state.flap,state.holes,state.logos,state.texts,state.ui]);}
function assertArtworkExportCurrent(expected){if(artworkExportSignature()!==expected)throw Error('Het ontwerp is gewijzigd tijdens het maken van de afbeelding. Je invoer is behouden; start de export opnieuw.');}

async function createPreviewPngBlob(){
  const expected=artworkExportSignature();
  await requireDesignFonts();
  if(document.fonts?.ready){try{await document.fonts.ready;}catch(e){}}
  // Draw the preview at its fitted size; screen zoom and scroll never affect downloads.
  const wrap=$('previewWrap');
  const flap=$('flap');
  if(!wrap || !flap)throw new Error('Voorvertoning niet beschikbaar');

  const wrapW=wrap.offsetWidth,wrapH=wrap.offsetHeight;
  const fittedScale=scaleFactor()/previewZoom;
  const fw=state.flap.w*fittedScale,fh=state.flap.h*fittedScale;
  const ox=(wrapW-fw)/2,oy=(wrapH-fh)/2;
  const scale=Math.max(2,Math.min(4,1200/Math.max(1,wrapW)));

  const c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(wrapW*scale));
  c.height=Math.max(1,Math.round(wrapH*scale));
  const ctx=c.getContext('2d');
  ctx.scale(scale,scale);

  const wrapStyle=getComputedStyle(wrap);
  const workspaceBg=wrapStyle.backgroundColor || '#e9edf2';
  ctx.fillStyle=workspaceBg;
  ctx.fillRect(0,0,wrapW,wrapH);
  const pxPerCmX=fw/state.flap.w;
  const pxPerCmY=fh/state.flap.h;
  const rPx=(state.flap.radius||0)*pxPerCmY;

  // Flap shape.
  ctx.save();
  if(state.flap.shape==='square'){
    roundRectPath(ctx,ox,oy,fw,fh,0,0,0,0);
  }else if(state.flap.shape==='bottom'){
    roundRectPath(ctx,ox,oy,fw,fh,0,0,rPx,rPx);
  }else if(state.flap.shape==='all'){
    roundRectPath(ctx,ox,oy,fw,fh,rPx,rPx,rPx,rPx);
  }else if(state.flap.shape==='shoulder'){
    ctx.translate(ox,oy);
    shoulderRoundedPath(
      ctx,fw,fh,
      (state.flap.shoulderInset||5)*pxPerCmX,
      (state.flap.shoulderTopH||5)*pxPerCmY,
      rPx
    );
    ctx.translate(-ox,-oy);
  }
  ctx.clip();
  ctx.fillStyle=getComputedStyle(flap).backgroundColor || state.flap.color;
  ctx.fillRect(ox,oy,fw,fh);

  // Wide-mode guides.
  if(state.ui?.wideMode && state.ui?.zones){
    const center=Math.max(30,Math.min(90,Number(state.ui.zoneCenter)||50));
    const side=(100-center)/2;
    ctx.save();
    ctx.setLineDash([5,4]);
    ctx.strokeStyle='rgba(80,160,255,.75)';
    ctx.lineWidth=1;
    [side,100-side].forEach(p=>{
      const x=ox+fw*(p/100);
      ctx.beginPath();ctx.moveTo(x,oy);ctx.lineTo(x,oy+fh);ctx.stroke();
    });
    ctx.restore();

    ctx.font='700 10px Arial';
    ctx.textAlign='center';
    ctx.textBaseline='top';
    [['LINKS',side/2],['MIDDEN',50],['RECHTS',100-side/2]].forEach(([label,p])=>{
      const tx=ox+fw*(p/100), ty=oy+7;
      const tw=ctx.measureText(label).width+12;
      ctx.fillStyle='rgba(0,0,0,.28)';
      roundRectPath(ctx,tx-tw/2,ty,tw,20,5,5,5,5);
      ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.72)';
      ctx.fillText(label,tx,ty+4);
    });
  }

  // Holes.
  if(state.holes.on){
    const count=state.holes.count, side=state.holes.side, top=state.holes.top;
    const xs=count===1
      ? [state.flap.w/2]
      : Array.from({length:count},(_,i)=>side+(state.flap.w-2*side)*(i/(count-1)));

    ctx.fillStyle=workspaceBg;
    xs.forEach(xcm=>{
      const cx=ox+xcm*pxPerCmX;
      const cy=oy+top*pxPerCmY;
      const hh=state.holes.h*pxPerCmY;
      const hw=(state.holes.shape==='pill'?Math.max(state.holes.h,state.holes.w):state.holes.h)*pxPerCmX;
      ctx.beginPath();
      if(state.holes.shape==='round'){
        ctx.arc(cx,cy,hh/2,0,Math.PI*2);
      }else{
        const rr=hh/2;
        roundRectPath(ctx,cx-hw/2,cy-hh/2,hw,hh,rr,rr,rr,rr);
      }
      ctx.fill();
    });
  }

  // Logos.
  for(const entry of SpatlapVectorExport.orderedItems(state)){
    if(entry.type==='text'){const t=entry.obj;drawDesignText(ctx,t,ox+t.x*fw,oy+t.y*fh,pxPerCmY);continue;}
    const x=entry.obj;await new Promise((resolve,reject)=>{
      const img=new Image(),timer=setTimeout(()=>reject(new Error('Logo '+(x.name||'')+' kon niet op tijd worden geladen.')),20000);
      img.onload=()=>{
        clearTimeout(timer);
        try{
          const iw=x.w*pxPerCmX,ih=x.h*pxPerCmY,ix=ox+x.x*fw-iw/2,iy=oy+x.y*fh-ih/2;
          drawDesignLogo(ctx,img,x,ix+iw/2,iy+ih/2,iw,ih);resolve();
        }catch(error){reject(error);}
      };
      img.onerror=()=>{clearTimeout(timer);reject(new Error('Logo '+(x.name||'')+' kan niet worden gelezen; er is geen onvolledige preview gedownload.'));};
      img.src=x.src;
    });
  }

  // Text.

  drawContour(ctx,ox,oy,pxPerCmX,pxPerCmY);

  if(state.ui?.topGuideOn){
    const guideH=Math.min(3,state.flap.h)*pxPerCmY;
    ctx.fillStyle='rgba(255,169,64,.14)';ctx.fillRect(ox,oy,fw,guideH);
    ctx.save();ctx.setLineDash([7,5]);ctx.strokeStyle='#ffb14f';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(ox,oy+guideH);ctx.lineTo(ox+fw,oy+guideH);ctx.stroke();ctx.restore();
  }

  ctx.restore();

  ctx.font='700 13px Arial';
  ctx.fillStyle=state.flap.color.toLowerCase()==='#f3f3f3'?'#f4f7fb':'#222';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(`${state.flap.w} cm`,ox+fw/2,oy-26);
  ctx.save();ctx.translate(ox-35,oy+fh/2);ctx.rotate(-Math.PI/2);
  ctx.fillText(`${state.flap.h} cm`,0,0);ctx.restore();

  const badges=[];
  if(state.ui?.showColorCount)badges.push(colorCountInfo().label);
  if(String(state.flap.qty).trim())badges.push(`Aantal: ${state.flap.qty}`);
  let badgeX=ox;
  for(const label of badges){
    ctx.font='700 12px Arial';
    const badgeW=ctx.measureText(label).width+20,badgeH=28,badgeY=oy+fh+10;
    ctx.fillStyle='#fff';ctx.strokeStyle='#cbd2da';ctx.lineWidth=1;
    roundRectPath(ctx,badgeX,badgeY,badgeW,badgeH,8,8,8,8);
    ctx.fill();ctx.stroke();
    ctx.fillStyle='#222';ctx.fillText(label,badgeX+badgeW/2,badgeY+badgeH/2);
    badgeX+=badgeW+8;
  }

  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('PNG-preview maken mislukt');
  assertArtworkExportCurrent(expected);
  return blob;
}

async function exportPNG(){
  if($('download').disabled)return;
  const activity=beginPreviewActivity('Klantpreview maken…',['download']);
  try{
  await previewPaintTick();
  const blob=await createPreviewPngBlob();

  // Download always.
  if(blob){
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.download=`preview-screenshot-${state.flap.w}x${state.flap.h}cm.png`;
    a.href=url;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  // Also copy the exact same PNG to the clipboard when the browser allows it.
  let copied=false;
  try{
    if(blob && navigator.clipboard && window.ClipboardItem){
      await navigator.clipboard.write([
        new ClipboardItem({'image/png':blob})
      ]);
      copied=true;
    }
  }catch(e){
    copied=false;
  }

  if(typeof toast==='function'){
    toast(copied
      ? 'Preview gedownload én naar klembord gekopieerd'
      : 'Preview gedownload · klembord niet beschikbaar in deze browser');
  }
  activity.success('Klantpreview-PNG klaar; download gestart.');
  }catch(error){activity.error(error);toast('Klantpreview downloaden mislukt');}
}

async function buildArtworkCanvas(scale=14,background=null){
  const expected=artworkExportSignature();
  await requireDesignFonts();
  if(document.fonts?.ready){try{await document.fonts.ready;}catch(e){}}
  const W=Math.max(1,Math.round(state.flap.w*scale));
  const H=Math.max(1,Math.round(state.flap.h*scale));
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const ctx=c.getContext('2d');
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,W,H);}

  for(const entry of SpatlapVectorExport.orderedItems(state)){
    if(entry.type==='text'){const t=entry.obj;drawDesignText(ctx,t,t.x*W,t.y*H,scale);continue;}
    const x=entry.obj;await new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{
        try{drawDesignLogo(ctx,img,x,x.x*W,x.y*H,x.w*scale,x.h*scale);resolve();}
        catch(err){reject(err);}
      };
      img.onerror=()=>reject(new Error(`Logo ${x.name||''} kon niet worden geladen`));
      img.src=x.src;
    });
  }


  drawContour(ctx,0,0,scale);
  assertArtworkExportCurrent(expected);
  return c;
}

function flapSvgPath(design){
  const f=design.flap,w=f.w,h=f.h,commands=[];
  const sink={beginPath(){commands.length=0;},moveTo(x,y){commands.push(`M${x},${y}`);},lineTo(x,y){commands.push(`L${x},${y}`);},quadraticCurveTo(x,y,a,b){commands.push(`Q${x},${y} ${a},${b}`);},bezierCurveTo(x,y,a,b,e,f){commands.push(`C${x},${y} ${a},${b} ${e},${f}`);},arc(x,y,r,start,end){commands.push(`A${r},${r} 0 0 1 ${x+r*Math.cos(end)},${y+r*Math.sin(end)}`);},closePath(){commands.push('Z');}};
  if(f.shape==='shoulder')shoulderRoundedPath(sink,w,h,f.shoulderInset??5,f.shoulderTopH??5,f.radius);
  else{const upper=f.shape==='all'?f.radius:0,lower=f.shape==='all'||f.shape==='bottom'?f.radius:0;roundRectPath(sink,0,0,w,h,upper,upper,lower,lower);}
  return commands.join(' ');
}

function vectorExportOptions(design,background=null){
  const hs=design.holes,holes=[];
  if(hs.on){
    const xs=hs.count===1?[design.flap.w/2]:Array.from({length:hs.count},(_,i)=>hs.side+(design.flap.w-2*hs.side)*i/(hs.count-1));
    const width=hs.shape==='pill'?Math.max(hs.h,hs.w):hs.h;
    for(const x of xs)holes.push({x:x-width/2,y:hs.top-hs.h/2,w:width,h:hs.h});
  }
  return {background,contour:contourSvg(),flapPath:flapSvgPath(design),holes};
}

function updateExportReadiness(){
  const issues=SpatlapVectorExport.issuesFor(state,contourSvg());
  $('exportReadiness').textContent=issues.length?`${issues.length} onderdeel${issues.length===1?'':'en'} aanpassen vóór vector-export. Klik op PDF voor de uitleg.`:'Vector-export beschikbaar · tekst wordt als contouren meegenomen.';
}

function closeVectorExportDialog(){$('vectorExportDialog').classList.remove('open');}

function showVectorExportError(error){
  clearPdfLinks();
  const modal=$('vectorExportDialog'),list=$('vectorExportIssues');list.replaceChildren();
  $('vectorExportTitle').textContent=error.issues?.length?'Nog niet klaar voor vector-export':'Vector-export gestopt';
  const issues=error.issues?.length?error.issues:[{message:error.message||'Het vectorbestand kon niet worden gemaakt. Probeer opnieuw.'}];
  for(const issue of issues){
    const row=document.createElement('div');row.className='export-issue';
    const message=document.createElement('div');message.textContent=issue.message;row.append(message);
    if(issue.id){
      const button=document.createElement('button');button.type='button';button.textContent=issue.type==='logo'?'Logo aanpassen':'Lettertype aanpassen';
      button.onclick=()=>{
        closeVectorExportDialog();setSelected(issue.id,issue.type);render();
        if(issue.type==='logo'){$('colorTools').open=true;$('colorTools').scrollIntoView({behavior:'smooth',block:'start'});}
        else{const controls=$('textControls');controls.closest('details').open=true;controls.scrollIntoView({behavior:'smooth',block:'center'});$('editTextFont').focus();}
      };
      row.append(button);
    }
    list.append(row);
  }
  $('downloadMenu').open=false;modal.classList.add('open');$('vectorExportClose').focus();
}

function clearPdfLinks(){
  for(const id of ['pdfViewLink','pdfDownloadLink']){const link=$(id);link.style.display='none';link.removeAttribute('href');}
}

function addPdfColourInfo(pdf,design){
  pdf.addPage('a4','portrait');pdf.setFont('helvetica','normal');
  pdf.setFontSize(18);pdf.text('Artwork en kleuren',20,25);pdf.setFontSize(11);
  let y=39;
  const line=value=>{
    const rows=pdf.splitTextToSize(value,170);
    for(const row of rows){if(y>258){pdf.addPage('a4','portrait');y=25;}pdf.text(row,20,y);y+=6;}
    y+=3;
  };
  line(`Pagina 1: vector-artwork, ${design.flap.w} x ${design.flap.h} cm, schaal 1:1.`);
  line('Zonder achtergrond. Tekst is omgezet naar contouren.');
  for(const logo of design.logos)line(logo.printColors?`${logo.name}: ${logo.printColors.join(', ')}`:`${logo.name}: kleuren volgens het SVG-logo; geen automatische kleurmeting.`);
  for(const t of design.texts)line(`Tekst: ${t.color||'#FFFFFF'}`);
  for(const obj of [...design.logos,...design.texts])if(outlineStyle(obj))line(`Randlijn: ${obj.outline.color} · ${obj.outline.width*10} mm`);
  if(design.ui?.contour?.on)line('Contourlijn: '+normalizeHex(design.ui.contour.color||'#ffffff'));
  pdf.setFontSize(9);line('Kleuren zijn RGB / HEX. Er zijn geen Pantone- of steunkleuren ingesteld. Deze informatiepagina hoort niet bij het te printen artwork.');
}

async function makeArtworkPdfBlob(background=null,withInfo=false){
  const design=cloneState(),options=vectorExportOptions(design,background);
  if(withInfo)options.addInfo=addPdfColourInfo;
  return SpatlapVectorExport.createPdf(design,options);
}

function showPdfLinks(blob,filename){
  const url=URL.createObjectURL(blob);
  pdfBlobUrls.push(url);
  while(pdfBlobUrls.length>6)URL.revokeObjectURL(pdfBlobUrls.shift());
  const view=$('pdfViewLink'),download=$('pdfDownloadLink');
  view.href=url;view.textContent=`Bekijk ${filename}`;view.style.display='inline-block';
  download.href=url;download.download=filename;
  download.textContent=`PDF klaar — download ${filename}`;download.style.display='inline-block';
  return url;
}

function showPdfViewer(url,filename){
  $('pdfViewerFrame').src=url;
  $('pdfViewerImageFallback').style.display='none';
  $('pdfViewerOpenTab').href=url;
  $('pdfViewerDownload').href=url;
  $('pdfViewerDownload').download=filename;
  $('pdfViewer').classList.add('open');
  $('pdfViewerClose').focus();
}

function closePdfViewer(){
  $('pdfViewer').classList.remove('open');
  $('pdfViewerFrame').src='about:blank';
}

function triggerPdfDownload(url,filename){
  const a=document.createElement('a');
  a.href=url;a.download=filename;a.style.display='none';
  document.body.appendChild(a);a.click();a.remove();
}

async function blackPdfAction(mode){
  const btn=$(mode==='view'?'viewBlackPdf':'downloadBlackPdf');
  const oldLabel=btn.textContent;
  const activity=beginPreviewActivity('PDF maken…',mode==='view'?['viewBlackPdf']:['downloadBlackPdf']);
  clearPdfLinks();
  btn.disabled=true;btn.textContent='PDF maken...';
  try{
    const filename=`vector-zwarte-achtergrond-${state.flap.w}x${state.flap.h}cm.pdf`;
    const blob=await makeArtworkPdfBlob('#080808');
    const url=showPdfLinks(blob,filename);
    if(mode==='view'){
      showPdfViewer(url,filename);
    }else{
      try{triggerPdfDownload(url,filename);toast('Vector-PDF met zwarte achtergrond gedownload');}
      catch(e){$('downloadMenu').open=true;toast('PDF klaar — klik op de downloadlink in Download');}
    }
    activity.success(mode==='view'?'PDF klaar; voorbeeld geopend.':'PDF klaar. Download beschikbaar onder Download.');
  }catch(err){
    activity.error(err);
    console.error(err);
    showVectorExportError(err);
  }finally{btn.disabled=false;btn.textContent=oldLabel;}
}
