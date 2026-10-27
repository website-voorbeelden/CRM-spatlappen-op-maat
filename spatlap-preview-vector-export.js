/* Local, vector-only export. No canvas images or fallback fonts are accepted. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const families=['Arimo','Anton','Bebas Neue','Black Ops One','Grenze Gotisch','New Rocker','Oswald','Pirata One','Rajdhani','Russo One','Teko','UnifrakturMaguntia','Metal Mania','Rye','Germania One','Bungee','Fredericka the Great','Ewert'];
  const supported=new Set(families);
  const scripts=new Map(),fonts=new Map();
  let manifestPromise;
  const firstFamily=value=>String(value||'Arial').split(',')[0].trim().replace(/^['"]|['"]$/g,'');
  const cssFont=value=>supported.has(firstFamily(value))?`"SP ${firstFamily(value)}"`:value||'Arial, sans-serif';
  const node=(tag,attributes={})=>{const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));return el;};
  class ExportError extends Error { constructor(message,issues=[]){super(message);this.issues=issues;} }

  async function fetchLocal(path){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
    try{const response=await fetch(path,{signal:controller.signal});if(!response.ok)throw new Error(`HTTP ${response.status}`);return await response.arrayBuffer();}
    catch(error){throw new ExportError(`Exportbestand ${path.split('/').pop()} kon niet worden geladen. Probeer opnieuw.`);}
    finally{clearTimeout(timer);}
  }
  function loadScript(path,ready){
    if(ready())return Promise.resolve();
    if(scripts.has(path))return scripts.get(path);
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');let finished=false;
      const timer=setTimeout(()=>finish(new Error('Laden duurde te lang')),20000);
      function finish(error){if(finished)return;finished=true;clearTimeout(timer);if(error){script.remove();reject(new ExportError('Vector-exportbibliotheek kon niet worden geladen. Probeer opnieuw.'));}else resolve();}
      script.src=path;script.onload=()=>finish(ready()?null:new Error('Bibliotheek niet beschikbaar'));script.onerror=()=>finish(new Error('Laden mislukt'));document.head.appendChild(script);
    }).catch(error=>{scripts.delete(path);throw error;});
    scripts.set(path,promise);return promise;
  }
  const customFaces=new Map();
  function fontBytes(data){const raw=atob(data.split(',')[1]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes.buffer;}
  async function ensureCustomFonts(descriptors=[]){
    if(!Array.isArray(descriptors)||descriptors.length>5)throw new ExportError('Maximaal vijf eigen lettertypen per ontwerp.');
    for(const descriptor of descriptors){
      if(!descriptor||!/^CRMFont_[a-z0-9]{32}$/.test(descriptor.family)||typeof descriptor.data!=='string'||descriptor.data.length>2900000||!/^data:font\/(?:ttf|otf);base64,[A-Za-z0-9+/=]+$/.test(descriptor.data))throw new ExportError('Een eigen lettertype is ongeldig.');
      let entry=customFaces.get(descriptor.family);
      if(entry&&entry.data!==descriptor.data)throw new ExportError('Een font-ID verwijst naar verschillende bestanden. Importeer het font opnieuw.');
      if(!entry){
        entry={data:descriptor.data,faces:[]};customFaces.set(descriptor.family,entry);
        entry.ready=(async()=>{
          const bytes=fontBytes(descriptor.data),faces=await Promise.all([400,700].map(async weight=>{const face=new FontFace(descriptor.family,bytes,{weight:String(weight)});await face.load();return face;}));
          // A different design may have removed this pending entry already.
          if(customFaces.get(descriptor.family)===entry){entry.faces=faces;for(const face of faces)document.fonts.add(face);}
        })().catch(error=>{if(customFaces.get(descriptor.family)===entry)customFaces.delete(descriptor.family);throw new ExportError('Het eigen lettertype kon niet worden geladen. Importeer het bestand opnieuw.');});
      }
      await entry.ready;
    }
  }
  function discardUnusedCustomFonts(descriptors=[]){const keep=new Set(descriptors.map(f=>f.family));for(const [family,entry]of customFaces)if(!keep.has(family)){for(const face of entry.faces)document.fonts.delete(face);customFaces.delete(family);for(const key of fonts.keys())if(key.startsWith(family+':'))fonts.delete(key);}}
  async function importFontFile(file){
    if(!/\.(ttf|otf)$/i.test(file.name)||!file.size||file.size>2*1024*1024)throw new ExportError('Kies een TTF- of OTF-bestand van maximaal 2 MB.');
    await loadScript('print-assets/opentype.min.js',()=>!!window.opentype);
    const bytes=await file.arrayBuffer(),font=window.opentype.parse(bytes);
    if(font.tables.fvar||font.tables.colr||font.tables.cpal||font.tables.cbdt||font.tables.sbix)throw new ExportError('Kies een statisch TTF/OTF-font met gewone lettercontouren; variabele en kleurenfonts worden niet geïmporteerd.');
    if(!font.numGlyphs||font.numGlyphs>100000)throw new ExportError('Dit font heeft geen ondersteunde lettercontouren.');
    let raw='';const array=new Uint8Array(bytes);for(let i=0;i<array.length;i+=16384)raw+=String.fromCharCode(...array.subarray(i,i+16384));
    const descriptor={family:'CRMFont_'+crypto.randomUUID().replace(/-/g,''),name:String(font.names.fontFamily?.en||file.name).slice(0,100),data:'data:font/'+(/\.otf$/i.test(file.name)?'otf':'ttf')+';base64,'+btoa(raw)};
    // Validate browser readability without registering a font that the user may
    // no longer be importing into the current design.
    try{await new FontFace(descriptor.family,bytes,{weight:'400'}).load();}catch{throw new ExportError('Dit font kan niet in de browser worden geopend. Kies een ander statisch TTF/OTF-bestand.');}return descriptor;
  }
  async function loadFont(family,weight,custom){
    const key=custom?family+':'+custom.data:family+':'+weight;
    if(fonts.has(key))return fonts.get(key);
    const promise=(async()=>{
      await loadScript('print-assets/opentype.min.js',()=>!!window.opentype);
      if(custom){await ensureCustomFonts([custom]);return window.opentype.parse(fontBytes(custom.data));}
      manifestPromise??=fetchLocal('print-assets/fonts.json?v=four-parts-20261026').then(bytes=>JSON.parse(new TextDecoder().decode(bytes))).catch(error=>{manifestPromise=null;throw error;});
      const manifest=await manifestPromise,file=manifest[family]?.[weight];
      if(!file)throw new ExportError(`Lettertype ${family} is niet beschikbaar voor vector-export.`);
      const font=window.opentype.parse(await fetchLocal('print-assets/'+file));
      // The preview and outlines must use the exact same local font file.
      const loaded=await document.fonts.load(`${weight} 1000px "SP ${family}"`);
      if(!loaded.length)throw new ExportError(`Lettertype ${family} kon niet worden geladen. Er wordt geen vervangend lettertype gebruikt.`);
      return font;
    })().catch(error=>{fonts.delete(key);throw error;});
    fonts.set(key,promise);return promise;
  }
  async function validateCustomTextFonts(texts,descriptors=[]){
    for(const text of texts){
      const family=firstFamily(text.font);if(!/^CRMFont_/.test(family))continue;
      const custom=descriptors.find(entry=>entry.family===family);if(!custom)throw new ExportError('Het eigen lettertype ontbreekt bij deze tekst.');
      const font=await loadFont(family,400,custom),lines=String(text.text||'').split(/\r?\n/);
      if(lines.some(line=>font.stringToGlyphs(line).some(glyph=>glyph.index===0)))throw new ExportError('De tekst bevat tekens die het eigen lettertype niet ondersteunt. Kies een passend lettertype; er is niets vervangen.',[{id:text.id,type:'text',message:'Dit eigen lettertype mist één of meer gebruikte tekens.'}]);
    }
  }
  function parseLogo(markup){
    const doc=new DOMParser().parseFromString(markup,'image/svg+xml');
    if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw new ExportError('Dit SVG-bestand is ongeldig.');
    // Metadata from drawing applications has no visible artwork.
    doc.documentElement.querySelectorAll('metadata').forEach(el=>el.remove());
    for(const el of [...doc.documentElement.querySelectorAll('*')])if(el.namespaceURI&&el.namespaceURI!==NS)el.remove();
    const allowed=new Set(['svg','g','defs','style','title','desc','metadata','path','rect','circle','ellipse','line','polyline','polygon','clipPath','linearGradient','radialGradient','stop']);
    for(const el of [doc.documentElement,...doc.documentElement.querySelectorAll('*')]){
      if(['text','tspan','textPath'].includes(el.localName))throw new ExportError('Dit SVG bevat nog lettertypen. Exporteer het originele logo met tekst omgezet naar contouren.');
      if(el.localName==='image')throw new ExportError('Dit SVG bevat een afbeelding. Gebruik een SVG met echte vectorpaden of zet het originele logo eerst naar vector om.');
      if(!allowed.has(el.localName))throw new ExportError(`Dit SVG bevat een niet ondersteund onderdeel (${el.localName}). Exporteer het logo als gewone vectorpaden, zonder effecten.`);
      for(const attr of [...el.attributes]){
        const name=attr.name.toLowerCase(),value=attr.value;
        if(name.startsWith('on'))throw new ExportError('Dit SVG bevat actieve inhoud. Exporteer het logo als gewone vectorpaden.');
        const local=value.replace(/url\(\s*(['"]?)#[\w:.-]+\1\s*\)/gi,'');
        if(/url\s*\(|javascript:|data:/i.test(local))throw new ExportError('Dit SVG verwijst naar externe inhoud. Gebruik een zelfstandig SVG-bestand.');
        if((name==='href'||name.endsWith(':href'))&&!/^#[\w:.-]+$/.test(value))throw new ExportError('Dit SVG verwijst naar externe inhoud. Gebruik een zelfstandig SVG-bestand.');
        if(name==='filter'||name==='mask')throw new ExportError('Dit SVG gebruikt effecten. Exporteer het logo als gewone vectorpaden, zonder filters of maskers.');
      }
      if(el.localName==='style'){
        const local=el.textContent.replace(/url\(\s*(['"]?)#[\w:.-]+\1\s*\)/gi,'');
        if(/@|url\s*\(|filter\s*:|mask\s*:|transform\s*:|animation\s*:|transition\s*:|javascript:|data:/i.test(local))throw new ExportError('Dit SVG gebruikt niet ondersteunde stijlen. Exporteer het logo als gewone vectorpaden.');
      }
      if([el.style?.transform,el.style?.filter,el.style?.mask].some(value=>value&&value!=='none'))throw new ExportError('Dit SVG gebruikt effecten. Exporteer het logo als gewone vectorpaden, met transformaties in het SVG zelf.');
    }
    return doc.documentElement;
  }
  const outlineRatioCache=new WeakMap();
  function outlineOpacity(value){return parseFloat(value)/(String(value).endsWith('%')?100:1);}
  function outlineAlpha(value){const match=String(value).match(/(?:,|\/)\s*([\d.]+%?)\s*\)$/);return match&&(/^rgba\(/i.test(value)||String(value).includes('/'))?outlineOpacity(match[1]):1;}
  function makeLogoOutline(root,logo){
    if(root.querySelector('svg'))throw new ExportError('Deze SVG heeft geneste tekenvlakken. Verwijder de randlijn of gebruik een SVG met één tekenvlak voor een betrouwbare vectorrand.');
    const box=root.getAttribute('viewBox').split(/[\s,]+/).map(Number),extra=2*logo.outline.width*box[2]/logo.w;
    for(const shape of [...root.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon')]){
      if(shape.closest('defs,clipPath'))continue;
      const fill=shape.getAttribute('fill')||'#000000',stroke=shape.getAttribute('stroke')||'none',parents=[];let opacity=1,scale=1;
      for(let parent=shape;parent;parent=parent.parentElement){parents.push(parent);opacity*=outlineOpacity(parent.getAttribute('opacity')||'1');if(parent===root)break;}
      const filled=shape.localName!=='line'&&!['none','transparent'].includes(fill)&&outlineAlpha(fill)>0&&outlineOpacity(shape.getAttribute('fill-opacity')||'1')>0;
      const stroked=!['none','transparent'].includes(stroke)&&outlineAlpha(stroke)>0&&outlineOpacity(shape.getAttribute('stroke-opacity')||'1')>0&&parseFloat(shape.getAttribute('stroke-width')||'1')>0;
      if(shape.closest('[display="none"],[visibility="hidden"]')||opacity===0||!filled&&!stroked){shape.remove();continue;}
      for(const parent of parents){
        const matrix=parent.transform?.baseVal?.consolidate()?.matrix;
        if(matrix){const x=Math.hypot(matrix.a,matrix.b),y=Math.hypot(matrix.c,matrix.d),dot=matrix.a*matrix.c+matrix.b*matrix.d;if(!Number.isFinite(x)||!Number.isFinite(y)||x<=0||y<=0||Math.abs(x-y)>Math.max(x,y)*1e-7||Math.abs(dot)>x*y*1e-7)throw new ExportError('Deze SVG bevat uitgerekte of scheve onderdelen. Verwijder de randlijn of gebruik onuitgerekte contouren voor een betrouwbare vectorrand.');scale*=x;}
        if((parent.getAttribute('clip-path')||'none')!=='none')throw new ExportError('Deze SVG gebruikt uitsnedes. Verwijder de randlijn of gebruik uitgesneden contouren voor een betrouwbare vectorrand.');
      }
      if(stroked)throw new ExportError('Deze SVG bevat zichtbare lijnen. Voor een betrouwbare vectorrand zijn gevulde contouren nodig; zet lijnen om naar contouren of verwijder de randlijn.');
      if(fill.includes('url(')||Math.abs(opacity-1)>1e-8||Math.abs(outlineAlpha(fill)-1)>1e-8||Math.abs(outlineOpacity(shape.getAttribute('fill-opacity')||'1')-1)>1e-8)throw new ExportError('Deze SVG heeft transparantie of kleurverlopen. Verwijder de randlijn voor vector-PDF of gebruik ondoorzichtige contouren.');
      shape.setAttribute('fill',logo.outline.color);shape.setAttribute('stroke',logo.outline.color);shape.setAttribute('fill-opacity','1');shape.setAttribute('stroke-opacity','1');shape.setAttribute('stroke-width',String(extra/scale));shape.setAttribute('stroke-linejoin','round');shape.setAttribute('stroke-dasharray','none');shape.setAttribute('stroke-dashoffset','0');shape.setAttribute('vector-effect','none');
    }
    root.setAttribute('overflow','visible');return root;
  }
  function outlineSourceInfo(logo){
    const prior=outlineRatioCache.get(logo);if(prior?.markup===logo.svgMarkup)return prior;
    const root=normalizeLogo(logo.svgMarkup,'sp-border-check-'),box=root.getAttribute('viewBox').split(/[\s,]+/).map(Number),entry={markup:logo.svgMarkup,ratio:box[2]/box[3],error:''};
    try{makeLogoOutline(root,logo);}catch(error){entry.error=error.message;}outlineRatioCache.set(logo,entry);return entry;
  }
  function issuesFor(design,contour){
    const issues=[];
    const w=Number(design.flap.w),h=Number(design.flap.h);
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0||w>508||h>508)issues.push({message:'Het PDF-formaat moet groter dan 0 en maximaal 508 × 508 cm zijn. De export schaalt je ontwerp niet automatisch.'});
    for(const object of [...design.logos,...design.texts])if(object.outline&&(!/^#[0-9a-f]{6}$/i.test(object.outline.color)||!Number.isFinite(object.outline.width)||object.outline.width<.01||object.outline.width>2))issues.push({message:'Een randlijn is ongeldig. Kies opnieuw 0,1–20 mm.',id:object.id,type:design.logos.includes(object)?'logo':'text'});
    for(const logo of design.logos){
      if(!logo.svgMarkup){issues.push({message:`${logo.name||'Logo'} is nog een afbeelding. Zet dit logo eerst naar vector om.`,id:logo.id,type:'logo'});continue;}
      if(logo.outline){try{const info=outlineSourceInfo(logo);if(info.error)issues.push({message:info.error,id:logo.id,type:'logo'});if(Math.abs(logo.w/logo.h-info.ratio)>1e-5)issues.push({message:'Dit logo is uitgerekt. Herstel de oorspronkelijke verhouding of verwijder de randlijn voor een betrouwbare vector-randbreedte.',id:logo.id,type:'logo'});}catch(error){issues.push({message:error.message,id:logo.id,type:'logo'});}}
      try{parseLogo(logo.svgMarkup);}catch(error){issues.push({message:`${logo.name||'Logo'}: ${error.message}`,id:logo.id,type:'logo'});}
      if(![logo.x,logo.y,logo.w,logo.h].every(Number.isFinite)||logo.w<=0||logo.h<=0)issues.push({message:`${logo.name||'Logo'} heeft een ongeldig formaat.`,id:logo.id,type:'logo'});
    }
    for(const text of design.texts){
      if(!supported.has(firstFamily(text.font))&&!(design.ui?.customFonts||[]).some(entry=>entry.family===firstFamily(text.font)))issues.push({message:`Tekst “${String(text.text).slice(0,45)}” gebruikt ${firstFamily(text.font)}. Kies een van de beschikbare vectorlettertypen, bijvoorbeeld Arimo, Anton of Bebas Neue.`,id:text.id,type:'text'});
      if(![text.x,text.y,text.size].every(Number.isFinite)||text.size<=0)issues.push({message:'Een tekst heeft een ongeldig formaat.',id:text.id,type:'text'});
    }
    if(design.ui?.contour?.on&&!contour)issues.push({message:'De contourlijn past niet binnen de spatlap. Maak de afstand of lijndikte kleiner.'});
    return issues;
  }
  function svgLength(value){
    const match=String(value||'').trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))(px|cm|mm|in|pt|pc)?$/i);
    if(!match)return null;
    return Number(match[1])*({px:1,cm:96/2.54,mm:96/25.4,in:96,pt:96/72,pc:16}[match[2]?.toLowerCase()||'px']);
  }
  function normalizeLogo(markup,prefix){
    const root=document.importNode(parseLogo(markup),true);
    // Isolate each logo's CSS before inlining it: .st0 in one logo cannot colour another.
    const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;width:1000px;height:1000px;opacity:0;pointer-events:none;color:#000000';
    const shadow=host.attachShadow({mode:'closed'});shadow.append(root);document.body.append(host);
    try{
      const properties=['fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','opacity','display','visibility','color','stop-color','stop-opacity','clip-path','clip-rule'];
      const elements=[root,...root.querySelectorAll('*')];
      for(const el of elements){
        if(['style','title','desc','metadata','defs'].includes(el.localName))continue;
        const style=getComputedStyle(el);
        for(const property of properties){
          let value=style.getPropertyValue(property);
          if(value)value=value.replace(/url\(["']?[^#)]*#([^"')]+)["']?\)/g,'url(#$1)');
          if(value)el.setAttribute(property,value);
        }
      }
      // SVG2PDF reads attributes; resolved styles now preserve root paints and local CSS.
      root.querySelectorAll('style,title,desc,metadata').forEach(el=>el.remove());
      const ids=new Map(elements.filter(el=>el.id).map(el=>[el.id,prefix+el.id]));
      for(const el of elements){
        el.removeAttribute('style');el.removeAttribute('class');
        for(const attr of [...el.attributes]){
          let value=attr.value.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g,(_,quote,id)=>`url(#${ids.get(id)||prefix+id})`);
          if(attr.name==='id')value=ids.get(value)||value;
          if((attr.name==='href'||attr.name.endsWith(':href'))&&value.startsWith('#'))value='#'+(ids.get(value.slice(1))||prefix+value.slice(1));
          el.setAttribute(attr.name,value);
        }
      }
      let viewBox=root.getAttribute('viewBox');
      if(!viewBox){
        const width=svgLength(root.getAttribute('width')),height=svgLength(root.getAttribute('height'));
        if(!width||!height)throw new ExportError('Het SVG-logo heeft geen viewBox of vaste afmetingen. Exporteer het logo met een viewBox.');
        viewBox=`0 0 ${width} ${height}`;
      }
      const box=viewBox.trim().split(/[\s,]+/).map(Number);
      if(box.length!==4||!box.every(Number.isFinite)||box[2]<=0||box[3]<=0)throw new ExportError('Het logo heeft geen geldig SVG-formaat.');
      root.setAttribute('viewBox',viewBox);root.setAttribute('preserveAspectRatio','none');
      return root;
    }finally{host.remove();}
  }
  function orderedItems(design){
    const entries=[...design.logos.map(obj=>({type:'logo',obj})),...design.texts.map(obj=>({type:'text',obj}))],order=new Map((design.ui?.layerOrder||[]).map((key,index)=>[key,index]));
    return entries.map((entry,index)=>({...entry,rank:order.get(entry.type+':'+entry.obj.id)??order.size+index})).sort((a,b)=>a.rank-b.rank);
  }
  function transformed(obj,element,w,h){
    if(obj.rotation!==undefined&&![0,90,180,270].includes(obj.rotation)||obj.flipX!==undefined&&typeof obj.flipX!=='boolean')throw new ExportError('Een onderdeel heeft een ongeldige transformatie.');
    if(!obj.rotation&&!obj.flipX)return element;
    const x=obj.x*w,y=obj.y*h,group=node('g',{transform:`translate(${x} ${y}) rotate(${obj.rotation||0}) scale(${obj.flipX?-1:1} 1) translate(${-x} ${-y})`});group.append(element);return group;
  }
  async function outlineText(text,w,h,customFonts=[]){
    const family=firstFamily(text.font),weight=Number(text.weight)===400?400:700,font=await loadFont(family,weight,customFonts.find(entry=>entry.family===family)),lines=String(text.text||'').split(/\r?\n/);
    const tracking=Math.max(-.5,Math.min(2,Number(text.tracking)||0)),options={kerning:!tracking,letterSpacing:tracking/text.size,features:{liga:!tracking,rlig:true}};
    if(lines.some(value=>font.stringToGlyphs(value).some(glyph=>glyph.index===0)))throw new ExportError('De tekst bevat tekens die dit lettertype niet ondersteunt. Er wordt geen vervangend teken gebruikt.',[{id:text.id,type:'text',message:'Kies een lettertype dat alle tekens ondersteunt.'}]);
    const widths=lines.map(value=>font.getAdvanceWidth(value,text.size,options)),maxWidth=Math.max(0,...widths),ctx=document.createElement('canvas').getContext('2d');ctx.font=`${weight} 1000px ${cssFont(text.font)}`;
    const metrics=ctx.measureText(lines.join(' ')),ascent=metrics.fontBoundingBoxAscent??font.ascender/font.unitsPerEm*1000,descent=metrics.fontBoundingBoxDescent??-font.descender/font.unitsPerEm*1000,group=node('g');
    const outlines=node('g');group.append(outlines);
    lines.forEach((value,index)=>{const width=widths[index],x=text.x*w+(text.align==='left'?-maxWidth/2:text.align==='right'?maxWidth/2-width:-width/2),baseline=text.y*h+(index-(lines.length-1)/2)*text.size+(ascent-descent)/2000*text.size;
      const path=font.getPath(value,x,baseline,text.size,options),d=path.toPathData(5);if(text.outline){const border=node('path',{d,fill:'none',stroke:text.outline.color,'stroke-width':2*text.outline.width,'stroke-linejoin':'round'});outlines.append(border);}group.append(node('path',{d,fill:text.color||'#FFFFFF'}));
    });return transformed(text,group,w,h);
  }
  async function artwork(design,{background=null,contour='',flapPath='',holes=[]}={}){
    const issues=issuesFor(design,contour);
    if(issues.length)throw new ExportError('Nog niet klaar voor vector-export',issues);
    const w=Number(design.flap.w),h=Number(design.flap.h);
    const root=node('svg',{xmlns:NS,width:w+'cm',height:h+'cm',viewBox:`0 0 ${w} ${h}`});
    if(/NaN|Infinity/.test(flapPath+contour))throw new ExportError('De spatlap of contourlijn heeft ongeldige afmetingen. Controleer de maten.');
    const defs=node('defs'),clip=node('clipPath',{id:'spatlap-print-boundary',clipPathUnits:'userSpaceOnUse'});
    clip.append(node('path',{d:flapPath||`M0 0H${w}V${h}H0Z`}));defs.append(clip);root.append(defs);
    const group=node('g',{'clip-path':'url(#spatlap-print-boundary)'});root.append(group);
    if(background)group.append(node('path',{d:flapPath||`M0 0H${w}V${h}H0Z`,fill:background}));
    for(const [i,entry] of orderedItems(design).entries()){
      if(entry.type==='text'){group.append(await outlineText(entry.obj,w,h,design.ui?.customFonts||[]));continue;}
      const logo=entry.obj;const svg=normalizeLogo(logo.svgMarkup,`sp-logo-${i}-`);
      for(const [key,value] of Object.entries({x:logo.x*w-logo.w/2,y:logo.y*h-logo.h/2,width:logo.w,height:logo.h}))svg.setAttribute(key,String(value));
      if(logo.outline){const border=makeLogoOutline(normalizeLogo(logo.svgMarkup,`sp-outline-${i}-`),logo);for(const key of ['x','y','width','height'])border.setAttribute(key,svg.getAttribute(key));group.append(transformed(logo,border,w,h));}
      group.append(transformed(logo,svg,w,h));
    }
    if(contour){const wrapper=new DOMParser().parseFromString(`<svg xmlns="${NS}">${contour}</svg>`,'image/svg+xml');group.append(document.importNode(wrapper.documentElement.firstElementChild,true));}
    if(background)for(const hole of holes)group.append(node('rect',{x:hole.x,y:hole.y,width:hole.w,height:hole.h,rx:hole.h/2,fill:'#FFFFFF'}));
    if(root.querySelector('image,text,tspan,textPath,foreignObject,filter,mask'))throw new ExportError('De vectorcontrole is mislukt. Er wordt geen PDF als afbeelding gemaakt.');
    return root;
  }
  async function createPdf(design,options={}){
    const root=await artwork(design,options);
    await loadScript('print-assets/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
    await loadScript('print-assets/svg2pdf.umd.min.js',()=>!!window.jspdf?.jsPDF?.API?.svg);
    const w=Number(design.flap.w)*10,h=Number(design.flap.h)*10;
    const pdf=new window.jspdf.jsPDF({orientation:w>=h?'landscape':'portrait',unit:'mm',format:[w,h],compress:true,putOnlyUsedFonts:true,precision:5});
    if(Math.abs(pdf.internal.pageSize.getWidth()-w)>.01||Math.abs(pdf.internal.pageSize.getHeight()-h)>.01)throw new ExportError('Het PDF-formaat wijkt af van de spatlap. De export is gestopt.');
    // SVG viewBox coordinates are cm; the PDF viewport below is explicitly mm.
    root.setAttribute('width',String(w));root.setAttribute('height',String(h));
    pdf.setProperties({title:`Spatlap ${design.flap.w} x ${design.flap.h} cm - vector`,creator:'Spatlap ontwerptool',subject:'Vector-artwork op ware grootte; tekst als contouren'});
    pdf.addImage=()=>{throw new ExportError('Een onderdeel zou als afbeelding worden opgeslagen. De export is gestopt.');};
    const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;pointer-events:none';host.append(root);document.body.append(host);
    try{await pdf.svg(root,{x:0,y:0,width:w,height:h});}finally{host.remove();}
    if(options.addInfo)options.addInfo(pdf,design);
    const buffer=pdf.output('arraybuffer');
    if(/\/Subtype\s*\/Image\b/.test(new TextDecoder('latin1').decode(buffer)))throw new ExportError('De PDF bevat een rasterafbeelding. De export is gestopt.');
    return new Blob([buffer],{type:'application/pdf'});
  }
  window.SpatlapVectorExport={validateCustomTextFonts,discardUnusedCustomFonts,ensureCustomFonts,importFontFile,orderedItems,cssFont,firstFamily,families,issuesFor,parseLogo,normalizeLogo,artwork,createPdf,ExportError};
})();
