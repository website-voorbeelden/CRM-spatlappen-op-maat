// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function makeCompressedDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.naturalWidth,h=img.naturalHeight;
        const lossless=file.type==='image/png'||file.type==='image/webp';
        const maxW=lossless?1200:900,maxH=lossless?800:500,scale=Math.min(1,maxW/w,maxH/h);
        w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const ctx=c.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
        try{resolve({src:c.toDataURL(lossless?'image/png':'image/webp',0.9),ratio:w/h,name:file.name});}
        catch(e){resolve({src:reader.result,ratio:w/h,name:file.name});}
      };
      img.onerror=reject;img.src=reader.result;
    };
    reader.onerror=reject;reader.readAsDataURL(file);
  });
}

function safeSvgMarkup(source){
  const doc=new DOMParser().parseFromString(source,'image/svg+xml');
  const root=doc.documentElement;
  SpatlapVectorExport.parseLogo(source);
  if(root.localName!=='svg'||doc.querySelector('parsererror'))throw new Error('Ongeldige SVG');
  const blocked=new Set(['script','foreignObject','iframe','object','embed','image','use','animate','animateTransform','set']);
  const walker=doc.createTreeWalker(root,NodeFilter.SHOW_ELEMENT);
  const nodes=[root];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const el of nodes){
    if(blocked.has(el.localName)){el.remove();continue;}
    if(el.localName==='style'){
      const css=el.textContent.replace(/url\(\s*(['"]?)#[\w.-]+\1\s*\)/gi,'');
      if(/@import|url\s*\(|expression\s*\(|javascript:|data:/i.test(css)){el.remove();continue;}
    }
    for(const attr of [...el.attributes]){
      const name=attr.name.toLowerCase(),value=attr.value;
      const withoutLocalPaint=value.replace(/url\(\s*(['"]?)#[\w.-]+\1\s*\)/gi,'');
      if(name.startsWith('on')||name==='href'||name.endsWith(':href')||/url\s*\(|javascript:|data:/i.test(withoutLocalPaint))el.removeAttribute(attr.name);
    }
  }
  root.setAttribute('xmlns','http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(root);
}

async function tightSvgFrame(markup){
  // Measure rendered alpha, so strokes, transforms and clipping are included.
  // The original SVG geometry stays vector; this bitmap is only a measuring aid.
  const root=new DOMParser().parseFromString(markup,'image/svg+xml').documentElement;
  const parsed=(root.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
  const box=parsed.length===4&&parsed.every(Number.isFinite)&&parsed[2]>0&&parsed[3]>0?parsed:[0,0,parseFloat(root.getAttribute('width'))||1,parseFloat(root.getAttribute('height'))||1];
  if(box[2]<=0||box[3]<=0)return null;
  const scale=Math.min(2048/box[2],2048/box[3]),width=Math.max(1,Math.ceil(box[2]*scale)),height=Math.max(1,Math.ceil(box[3]*scale));
  root.setAttribute('viewBox',box.join(' '));root.setAttribute('width',String(width));root.setAttribute('height',String(height));root.setAttribute('preserveAspectRatio','none');
  const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(root));await image.decode();
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,width,height);
  const data=ctx.getImageData(0,0,width,height).data;let left=width,top=height,right=-1,bottom=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)return null;
  // Keep one pixel of transparent safety around anti-aliased details.
  left=Math.max(0,left-1);top=Math.max(0,top-1);right=Math.min(width,right+2);bottom=Math.min(height,bottom+2);
  const crop={x:left/width,y:top/height,w:(right-left)/width,h:(bottom-top)/height};
  const next=[box[0]+crop.x*box[2],box[1]+crop.y*box[3],crop.w*box[2],crop.h*box[3]];
  root.setAttribute('viewBox',next.join(' '));root.setAttribute('width',String(next[2]));root.setAttribute('height',String(next[3]));root.setAttribute('preserveAspectRatio','xMidYMid meet');
  return {markup:new XMLSerializer().serializeToString(root),crop,ratio:next[2]/next[3]};
}

async function trimRasterLogo(logo){
  const signature=JSON.stringify(logo),operation=beginPreviewActivity('Transparante randen bepalen…',['trimSelectedVector']);
  try{
    const image=new Image();image.src=logo.src;await image.decode();
    const w=image.naturalWidth,h=image.naturalHeight;if(!w||!h||w*h>32000000)throw Error('Deze afbeelding is te groot om veilig bij te snijden (max.32 megapixel).');
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,w,h).data;let left=w,top=h,right=-1,bottom=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    if(right<left)throw Error('Deze afbeelding bevat geen zichtbare pixels.');
    left=Math.max(0,left-1);top=Math.max(0,top-1);right=Math.min(w,right+2);bottom=Math.min(h,bottom+2);
    if(left===0&&top===0&&right===w&&bottom===h){operation.cancel('Geen lege transparante randen gevonden. Een witte achtergrond is geen transparantie.');return;}
    const result=document.createElement('canvas');result.width=right-left;result.height=bottom-top;result.getContext('2d').drawImage(canvas,left,top,result.width,result.height,0,0,result.width,result.height);const src=result.toDataURL('image/png');
    if(itemById(logo.id,'logo')!==logo||JSON.stringify(logo)!==signature)throw Error('Logo is intussen gewijzigd; probeer opnieuw.');
    pushHistory();logo.x+=((left+result.width/2)/w-.5)*logo.w/state.flap.w;logo.y+=((top+result.height/2)/h-.5)*logo.h/state.flap.h;logo.w*=result.width/w;logo.h*=result.height/h;logo.ratio=logo.w/logo.h;logo.src=src;logo.name=(logo.name||'Logo').replace(/\.[^.]+$/,'')+'.png';
    syncSelectionControls();render();operation.success('Transparante randen weggehaald; zichtbare pixels op dezelfde plek.');
  }catch(error){operation.error(error);}
}

async function trimSelectedVector(){
  if(state.selectedType==='text'){
    const text=itemById(state.selected,'text');if(!text)return;
    if(!document.fonts.check(`${textWeight(text.weight)} 1000px ${printFontFamily(text.font)}`)){toast('Het lettertype laadt nog. Probeer zo opnieuw.');return;}
    if(!text.text.trim()){toast('Deze tekst heeft geen zichtbare letters.');return;}
    pushHistory();text.tightBounds=true;syncSelectionControls();render();toast('Tekstkader sluit nu aan op de letters; tekst blijft bewerkbaar.');return;
  }
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;
  if(!logo||vectorEditingLogoId){toast('Selecteer één compleet logo.');return;}
  if(!logo.svgMarkup){await trimRasterLogo(logo);return;}
  const activity=beginPreviewActivity('Vectorgrenzen bepalen…',['trimSelectedVector']);
  const signature=JSON.stringify(logo);$('trimSelectedVector').disabled=true;
  try{
    const result=await tightSvgFrame(logo.svgMarkup);if(!result)throw Error('Geen zichtbare vectorgrenzen gevonden.');
    if(itemById(logo.id,'logo')!==logo||JSON.stringify(logo)!==signature)throw Error('Logo is intussen gewijzigd; probeer opnieuw.');
    pushHistory();const oldW=logo.w,oldH=logo.h,c=result.crop;
    logo.x+=(c.x+c.w/2-.5)*oldW/state.flap.w;logo.y+=(c.y+c.h/2-.5)*oldH/state.flap.h;
    logo.w=oldW*c.w;logo.h=oldH*c.h;logo.ratio=logo.w/logo.h;
    if(logo.vectorCrop){const previous=logo.vectorCrop;logo.vectorCrop={x:previous.x+c.x*previous.w,y:previous.y+c.y*previous.h,w:previous.w*c.w,h:previous.h*c.h};}
    discardVectorEditBackup(logo);updateVectorSource(logo,result.markup);syncSelectionControls();render();toast('Selectiekader aangesnoeid; zichtbare tekening op dezelfde plek.');activity.success('Lege vectorranden weggehaald; positie behouden.');
  }catch(error){activity.error(error);toast(error.message||'Bijsnijden lukt niet; oorspronkelijke vector behouden.');}finally{$('trimSelectedVector').disabled=false;}
}

async function svgLogoData(file,trim=true){
  let markup=safeSvgMarkup(await file.text());
  let measured=null;
  if(trim){try{measured=await tightSvgFrame(markup);if(measured)markup=measured.markup;}catch{/* Preserve unusual SVGs when measurement fails. */}}
  const root=new DOMParser().parseFromString(markup,'image/svg+xml').documentElement;
  const box=(root.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
  const w=box.length===4&&box[2]>0?box[2]:parseFloat(root.getAttribute('width'))||1;
  const h=box.length===4&&box[3]>0?box[3]:parseFloat(root.getAttribute('height'))||1;
  return {src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup),svgMarkup:markup,ratio:w/h,name:file.name,vector:true};
}

function loadPdfJs(){
  if(!pdfJsPromise)pdfJsPromise=import(pdfJsUrl).then(lib=>({lib,worker:pdfWorkerUrl}))
    .catch(()=>import('https://unpkg.com/pdfjs-dist@6.3.289/build/pdf.mjs').then(lib=>({lib,worker:'https://unpkg.com/pdfjs-dist@6.3.289/build/pdf.worker.mjs'})))
    .then(({lib,worker})=>{lib.GlobalWorkerOptions.workerSrc=worker;return lib;})
    .catch(()=>{pdfJsPromise=null;throw new Error('PDF-lezer laden lukte niet. Controleer je internetverbinding.');});
  return pdfJsPromise;
}

async function renderPdfPage(pdf,pageNumber,maxSide){
  const page=await pdf.getPage(pageNumber);
  const base=page.getViewport({scale:1});
  const scale=Math.min(2.5,maxSide/Math.max(base.width,base.height));
  const viewport=page.getViewport({scale});
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(viewport.width));
  canvas.height=Math.max(1,Math.round(viewport.height));
  const context=canvas.getContext('2d',{alpha:true});
  await page.render({canvas,canvasContext:context,viewport,background:'rgba(0,0,0,0)'}).promise;
  page.cleanup();
  return canvas;
}

function choosePdfPage(pdf,filename){
  return new Promise(resolve=>{
    const modal=$('pdfImportModal'),host=$('pdfImportCanvasHost');
    let pageNumber=1,request=0,finished=false;
    $('pdfImportName').textContent=filename;
    modal.classList.add('open');
    const finish=value=>{
      if(finished)return;
      finished=true;request++;
      modal.classList.remove('open');host.replaceChildren();
      document.removeEventListener('keydown',onKey);
      resolve(value);
    };
    const onKey=event=>{if(event.key==='Escape')finish(null);};
    document.addEventListener('keydown',onKey);
    const update=async()=>{
      const current=++request;
      $('pdfImportPageInfo').textContent=`Pagina ${pageNumber} van ${pdf.numPages}`;
      $('pdfImportPrev').disabled=pageNumber===1;
      $('pdfImportNext').disabled=pageNumber===pdf.numPages;
      $('pdfImportAdd').disabled=true;
      $('pdfImportStatus').textContent='Voorbeeld laden...';
      try{
        const canvas=await renderPdfPage(pdf,pageNumber,850);
        if(finished||current!==request)return;
        host.replaceChildren(canvas);
        $('pdfImportStatus').textContent='Deze pagina wordt als afbeelding toegevoegd. Je kunt die daarna naar vector omzetten.';
        $('pdfImportAdd').disabled=false;
      }catch(err){
        if(!finished&&current===request)$('pdfImportStatus').textContent='Deze pagina kon niet worden weergegeven.';
      }
    };
    $('pdfImportPrev').onclick=()=>{if(pageNumber>1){pageNumber--;update();}};
    $('pdfImportNext').onclick=()=>{if(pageNumber<pdf.numPages){pageNumber++;update();}};
    $('pdfImportCancel').onclick=()=>finish(null);
    $('pdfImportAdd').onclick=()=>finish(pageNumber);
    modal.onclick=event=>{if(event.target===modal)finish(null);};
    update();
  });
}

async function pdfLogoData(file){
  if(file.size>50*1024*1024)throw new Error('PDF is groter dan 50 MB. Gebruik een kleiner bestand.');
  const pdfjs=await loadPdfJs();
  const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
  try{
    const pdf=await task.promise;
    const pageNumber=pdf.numPages===1?1:await choosePdfPage(pdf,file.name);
    if(pageNumber==null)return null;
    const canvas=await renderPdfPage(pdf,pageNumber,1600);
    return {src:canvas.toDataURL('image/png'),ratio:canvas.width/canvas.height,name:`${file.name} · pagina ${pageNumber}`,pdfPage:pageNumber};
  }finally{await task.destroy();}
}

async function readLogoFile(file,trim=true){
  if(file.type==='application/pdf'||/\.pdf$/i.test(file.name))return pdfLogoData(file);
  if(file.type==='image/svg+xml'||/\.svg$/i.test(file.name))return svgLogoData(file,trim);
  return makeCompressedDataUrl(file);
}

async function addLogoFiles(files){
  const activity=beginPreviewActivity('Afbeelding laden…',['file','pasteLogo']);
  try{
  let added=0;
  const errors=[];
  for(const f of files){
    try{
      const d=await readLogoFile(f);
      if(!d)continue;
      const placement=SpatlapLayout.initialLogo(state.flap,d.ratio,state.logos.length),lw=placement.w,lh=placement.h;
      const obj={id:'l'+Date.now()+Math.random(),name:d.name,src:d.src,svgMarkup:d.svgMarkup||null,vector:!!d.vector,w:lw,h:lh,ratio:(d.ratio||lw/lh||1),x:placement.x,y:placement.y};
      if(!added)pushHistory();
      state.logos.push(obj);state.selected=obj.id;state.selectedType='logo';
      added++;
    }catch(err){console.error('Logo toevoegen mislukt',err);errors.push(`${f.name}: ${err.message||'openen mislukt'}`);}
  }
  if(added){
    if($('logosSection'))$('logosSection').open=true;
    syncSelectionControls();render();
    $('pasteLogoStatus').textContent=`${added} afbeelding${added===1?'':'en'} toegevoegd.${errors.length?' '+errors.join(' '):''}`;
  }else $('pasteLogoStatus').textContent=errors.length?errors.join(' '):'Geen bestand toegevoegd. Gebruik PNG, JPG, WebP, SVG of PDF.';
  if(errors.length)activity.error(new Error((added?added+' afbeelding(en) toegevoegd. ':'')+errors.join(' ')));else if(added)activity.success(added+' afbeelding(en) toegevoegd.');else activity.cancel('Geen afbeelding toegevoegd.');
  return added;
  }catch(error){activity.error(error);throw error;}
}

async function vectorizeRasterLogo(logo,count,singleColor,whiteCutout,edgeStyle,lightThreshold,alphaThreshold,maxSideOverride=0,keepDark=false){
  const img=new Image();
  img.src=logo.originalRasterSrc||logo.src;
  await img.decode();
  const maxSide=maxSideOverride||(edgeStyle==='detail'?500:400),scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
  const w=Math.max(1,Math.round(img.naturalWidth*scale));
  const h=Math.max(1,Math.round(img.naturalHeight*scale));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
  const rgba=ctx.getImageData(0,0,w,h).data;
  let transparentPixels=0;
  for(let i=3;i<rgba.length;i+=4)if(rgba[i]<250)transparentPixels++;
  const hasTransparency=transparentPixels>w*h*.01;
  const visible=new Uint8Array(w*h);
  let pixels=0;
  for(let p=0;p<visible.length;p++){
    const i=p*4;
    if(rgba[i+3]<alphaThreshold)continue;
    if(whiteCutout&&!hasTransparency){const brightness=rgba[i]*.2126+rgba[i+1]*.7152+rgba[i+2]*.0722;if(keepDark?brightness>=lightThreshold:brightness<lightThreshold)continue;}
    visible[p]=1;pixels++;
  }
  if(!pixels)throw new Error('Geen zichtbare logodelen gevonden. Verlaag de lichtgrens of transparantiegrens.');

  // Remove isolated compression specks before finding the bounds. Larger details remain intact.
  if(pixels>100){
    const seen=new Uint8Array(visible.length),queue=new Int32Array(visible.length);
    for(let start=0;start<visible.length;start++){
      if(!visible[start]||seen[start])continue;
      let head=0,tail=1;queue[0]=start;seen[start]=1;
      while(head<tail){
        const p=queue[head++],x=p%w,y=Math.floor(p/w);
        if(x>0&&visible[p-1]&&!seen[p-1]){seen[p-1]=1;queue[tail++]=p-1;}
        if(x<w-1&&visible[p+1]&&!seen[p+1]){seen[p+1]=1;queue[tail++]=p+1;}
        if(y>0&&visible[p-w]&&!seen[p-w]){seen[p-w]=1;queue[tail++]=p-w;}
        if(y<h-1&&visible[p+w]&&!seen[p+w]){seen[p+w]=1;queue[tail++]=p+w;}
      }
      if(tail<=2)for(let j=0;j<tail;j++)visible[queue[j]]=0;
    }
  }
  let minX=w,minY=h,maxX=-1,maxY=-1;
  for(let p=0;p<visible.length;p++)if(visible[p]){
    const x=p%w,y=Math.floor(p/w);
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
  }
  if(maxX<0)throw new Error('Geen zichtbare logodelen gevonden');
  const crop={x:Math.max(0,minX-1),y:Math.max(0,minY-1)};
  crop.w=Math.min(w,maxX+2)-crop.x;crop.h=Math.min(h,maxY+2)-crop.y;
  const cropped=new Uint8ClampedArray(crop.w*crop.h*4);
  const samples=[];
  const sampleStep=Math.max(1,Math.ceil(pixels/40000));
  let visibleIndex=0;
  for(let y=0;y<crop.h;y++)for(let x=0;x<crop.w;x++){
    const source=((y+crop.y)*w+x+crop.x),i=source*4,d=(y*crop.w+x)*4;
    if(!visible[source])continue;
    cropped[d]=rgba[i];cropped[d+1]=rgba[i+1];cropped[d+2]=rgba[i+2];cropped[d+3]=255;
    if(visibleIndex++%sampleStep===0)samples.push([rgba[i],rgba[i+1],rgba[i+2]]);
  }
  const styles={
    smooth:{ltres:.2,qtres:1.5,pathomit:2,rightangleenhance:false},
    sharp:{ltres:.5,qtres:.5,pathomit:1,rightangleenhance:true},
    detail:{ltres:.08,qtres:.55,pathomit:0,rightangleenhance:false}
  };
  if(count===1){
    for(let i=0;i<cropped.length;i+=4){
      if(cropped[i+3])cropped[i]=cropped[i+1]=cropped[i+2]=255;
    }
  }
  let palette=[];
  if(count===1)palette=[[255,255,255]];
  else{
    if(!samples.length){
      for(let i=0;i<cropped.length;i+=4)if(cropped[i+3]){samples.push([cropped[i],cropped[i+1],cropped[i+2]]);break;}
    }
    const buckets=new Map();
    for(const p of samples){
      const key=((p[0]>>3)<<10)|((p[1]>>3)<<5)|(p[2]>>3);
      const b=buckets.get(key)||[0,0,0,0];b[0]+=p[0];b[1]+=p[1];b[2]+=p[2];b[3]++;buckets.set(key,b);
    }
    const bins=[...buckets.values()].map(b=>({rgb:b.slice(0,3).map(v=>Math.round(v/b[3])),n:b[3]}));
    bins.sort((a,b)=>b.n-a.n);
    palette=[bins[0].rgb.slice()];
    while(palette.length<Math.min(count,bins.length)){
      let best=null,score=-1;
      for(const bin of bins){
        const d=Math.min(...palette.map(p=>(p[0]-bin.rgb[0])**2+(p[1]-bin.rgb[1])**2+(p[2]-bin.rgb[2])**2));
        const s=d*Math.sqrt(bin.n);
        if(s>score){score=s;best=bin.rgb;}
      }
      if(!best||score===0)break;
      palette.push(best.slice());
    }
  }
  const nearest=(r,g,b)=>{
    let best=0,dist=Infinity;
    palette.forEach((p,j)=>{const d=(r-p[0])**2+(g-p[1])**2+(b-p[2])**2;if(d<dist){dist=d;best=j;}});
    return best;
  };
  for(let step=0;step<(count===1?0:12);step++){
    const sums=palette.map(()=>[0,0,0,0]);
    for(const [r,g,b] of samples){const s=sums[nearest(r,g,b)];s[0]+=r;s[1]+=g;s[2]+=b;s[3]++;}
    sums.forEach((s,j)=>{if(s[3])palette[j]=s.slice(0,3).map(v=>Math.round(v/s[3]));});
  }
  const hex=p=>'#'+p.map(n=>Math.max(0,Math.min(255,n)).toString(16).padStart(2,'0')).join('');
  for(let i=0;i<cropped.length;i+=4){
    if(!cropped[i+3])continue;
    const j=nearest(cropped[i],cropped[i+1],cropped[i+2]);
    cropped[i]=palette[j][0];cropped[i+1]=palette[j][1];cropped[i+2]=palette[j][2];
  }
  const pal=[{r:0,g:0,b:0,a:0},...palette.map(p=>({r:p[0],g:p[1],b:p[2],a:255}))];
  const traced=ImageTracer.imagedataToSVG({width:crop.w,height:crop.h,data:cropped},{
    pal,colorquantcycles:1,...(styles[edgeStyle]||styles.smooth),
    strokewidth:0,linefilter:true,viewbox:true,roundcoords:2,desc:false
  });
  const doc=new DOMParser().parseFromString(traced,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw new Error('Vectorpaden maken mislukt');
  let paths=0;
  const retainedColors=new Set();
  doc.querySelectorAll('path').forEach(path=>{
    if(path.hasAttribute('opacity')&&Number(path.getAttribute('opacity'))===0){path.remove();return;}
    if(count===1)path.setAttribute('fill',singleColor);
    else{
      const match=path.getAttribute('fill')?.match(/rgb\((\d+),(\d+),(\d+)\)/);
      if(match)retainedColors.add(hex(match.slice(1).map(Number)).toUpperCase());
    }
    path.setAttribute('stroke','none');path.removeAttribute('opacity');paths++;
  });
  if(!paths)throw new Error('Geen vectorpaden gevonden. Kies Meer detail.');
  doc.documentElement.setAttribute('width',String(crop.w));
  doc.documentElement.setAttribute('height',String(crop.h));
  return {markup:new XMLSerializer().serializeToString(doc.documentElement),colors:count===1?[singleColor.toUpperCase()]:[...retainedColors],crop,sourceW:w,sourceH:h};
}

function pngMaskThreshold(rgba){
  const histogram=new Uint32Array(256);
  for(let i=3;i<rgba.length;i+=4)histogram[rgba[i]]++;
  const total=rgba.length/4;
  let transparent=0;
  for(let a=0;a<255;a++)transparent+=histogram[a];
  if(transparent<total*.005)return null;
  let sum=0;
  for(let a=0;a<256;a++)sum+=a*histogram[a];
  let lowerCount=0,lowerSum=0,bestScore=-1,split=0;
  for(let a=0;a<255;a++){
    lowerCount+=histogram[a];lowerSum+=a*histogram[a];
    if(!lowerCount||lowerCount===total)continue;
    const upperCount=total-lowerCount;
    const difference=lowerSum/lowerCount-(sum-lowerSum)/upperCount;
    const score=lowerCount*upperCount*difference*difference;
    if(score>bestScore){bestScore=score;split=a;}
  }
  // Alpha 1 often represents export noise, not printable artwork.
  const threshold=Math.max(64,Math.min(255,split+1));
  let visible=0;
  for(let a=threshold;a<256;a++)visible+=histogram[a];
  if(visible>total*.95)return null;
  return threshold;
}

function scheduleVectorPreview(){
  $('vectorLightValue').textContent=$('vectorLightThreshold').value;
  $('vectorAlphaValue').textContent=$('vectorAlphaThreshold').value;
  const logo=state.selectedType==='logo'?itemById(state.selected,'logo'):null;
  const source=logo?.originalRasterSrc||logo?.src||null;
  const canTrace=!!logo&&(!logo.svgMarkup||!!logo.originalRasterSrc);
  const settings=[
    $('vectorColorCount').value,$('vectorSingleColor').value,$('vectorWhiteCutout').checked,
    $('vectorEdgeStyle').value,$('vectorLightThreshold').value,$('vectorAlphaThreshold').value
  ].join('|');
  if(logo?.id===vectorPreviewLogoId&&source===vectorPreviewSource&&settings===vectorPreviewSettings)return;
  vectorPreviewLogoId=logo?.id||null;vectorPreviewSource=source;vectorPreviewSettings=settings;
  const token=++vectorPreviewToken;
  clearTimeout(vectorPreviewTimer);
  const original=$('vectorOriginalPreview'),resultImage=$('vectorResultPreview'),status=$('vectorPreviewStatus');
  if(!canTrace){
    original.removeAttribute('src');resultImage.removeAttribute('src');
    status.textContent=logo?'Dit SVG-bestand is al vector.':'Selecteer een afbeelding om het resultaat te bekijken.';
    return;
  }
  original.src=source;resultImage.removeAttribute('src');
  status.textContent='Voorbeeld wordt bijgewerkt...';
  vectorPreviewTimer=setTimeout(async()=>{
    try{
      const count=Math.max(1,Math.min(8,Math.round(Number($('vectorColorCount').value)||1)));
      const light=Math.max(0,Math.min(255,Number($('vectorLightThreshold').value)||0));
      const alpha=Math.max(1,Math.min(255,Number($('vectorAlphaThreshold').value)||1));
      const traced=await vectorizeRasterLogo(logo,count,normalizeHex($('vectorSingleColor').value),$('vectorWhiteCutout').checked,$('vectorEdgeStyle').value,light,alpha);
      if(token!==vectorPreviewToken)return;
      resultImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(traced.markup);
      status.textContent=`Live vectorvoorbeeld: ${traced.colors.length} kleur${traced.colors.length===1?'':'en'}. Klik op ‘Zet afbeelding om naar vector’ om dit toe te passen.`;
    }catch(err){
      if(token!==vectorPreviewToken)return;
      resultImage.removeAttribute('src');
      status.textContent=err.message||'Voorbeeld maken lukte niet.';
    }
  },220);
}
