/* Edits SVG geometry; handles are transient and never become printable artwork. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const tags='path,rect,circle,ellipse,line,polyline,polygon';
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const point=(x,y,matrix)=>new DOMPoint(x,y).matrixTransform(matrix);
  const svgNode=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el;};
  function pieces(root){return [...root.querySelectorAll('g[data-sp-piece]')].filter(el=>!el.closest('defs,clipPath,linearGradient,radialGradient'));}
  function geometry(piece){return piece?.querySelector('[data-sp-geometry]');}
  function viewBox(root){return root.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number);}
  function offset(piece){return {x:number(piece.getAttribute('data-sp-x')),y:number(piece.getAttribute('data-sp-y'))};}
  function setOffset(piece,x,y){
    if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error('Dit onderdeel kan niet worden verplaatst met deze transformatie.');
    piece.setAttribute('data-sp-x',String(x));piece.setAttribute('data-sp-y',String(y));piece.setAttribute('transform',`translate(${x} ${y})`);
  }
  function serialize(root){
    const copy=root.cloneNode(true);copy.querySelectorAll('[data-sp-editor-overlay]').forEach(el=>el.remove());
    copy.removeAttribute('style');return new XMLSerializer().serializeToString(copy);
  }
  function prepare(markup){
    const root=SpatlapVectorExport.normalizeLogo(markup,'sp-edit-');
    root.setAttribute('xmlns',NS);
    if(!root.hasAttribute('data-sp-base-viewbox'))root.setAttribute('data-sp-base-viewbox',root.getAttribute('viewBox'));
    let next=1;
    const existing=new Set(pieces(root).map(el=>el.getAttribute('data-sp-piece')));
    for(const el of [...root.querySelectorAll(tags)]){
      if(el.closest('defs,clipPath,linearGradient,radialGradient'))continue;
      if(el.closest('g[data-sp-piece]'))continue;
      while(existing.has('p'+next))next++;
      const piece=svgNode('g',{'data-sp-piece':'p'+next,'data-sp-x':0,'data-sp-y':0});existing.add('p'+next++);
      el.setAttribute('data-sp-geometry','1');el.parentNode.insertBefore(piece,el);piece.append(el);
    }
    if(!pieces(root).length)throw new Error('Dit SVG bevat geen losse vormen die je kunt bewerken.');
    return {markup:serialize(root),first:pieces(root)[0].getAttribute('data-sp-piece')};
  }
  function colour(value){
    const v=String(value||'').trim();
    if(/^#[\da-f]{6}$/i.test(v))return v.toUpperCase();
    if(/^#[\da-f]{3}$/i.test(v))return '#'+v.slice(1).split('').map(c=>c+c).join('').toUpperCase();
    const m=v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    return m?'#'+m.slice(1).map(x=>Math.max(0,Math.min(255,Math.round(Number(x)))).toString(16).padStart(2,'0')).join('').toUpperCase():null;
  }
  function recolour(markup,value){
    const hex=colour(value);if(!hex)throw new Error('Kies een geldige kleur.');
    const root=SpatlapVectorExport.parseLogo(prepare(markup).markup);
    const opacity=value=>Math.max(0,Math.min(1,parseFloat(value)/(String(value).endsWith('%')?100:1)));
    function paint(el,name,opacityName){
      const current=el.getAttribute(name)||(name==='stroke'?'none':'#000000');
      if(current==='none'||/^url\(/i.test(current))return;
      let alpha=current==='transparent'?0:1;
      if(/^rgba\(/i.test(current)||current.includes('/')){
        const match=current.match(/(?:,|\/)\s*([\d.]+%?)\s*\)$/);if(match)alpha=opacity(match[1]);
      }
      if(alpha<1)el.setAttribute(opacityName,String(opacity(el.getAttribute(opacityName)||'1')*alpha));
      el.setAttribute(name,hex);
    }
    // Keeping gradient opacity stops also preserves fades into transparent areas.
    for(const stop of root.querySelectorAll('linearGradient stop,radialGradient stop'))paint(stop,'stop-color','stop-opacity');
    for(const piece of pieces(root)){
      const el=geometry(piece);if(!el)continue;
      // Preserve unpainted shapes, compound holes and clipping geometry.
      paint(el,'fill','fill-opacity');paint(el,'stroke','stroke-opacity');
    }
    return root;
  }
  function printColours(root){
    const result=new Set();let unknown=false;
    for(const piece of pieces(root)){
      const el=geometry(piece);if(!el||el.closest('[display="none"],[visibility="hidden"]'))continue;
      for(const name of ['fill','stroke']){
        const value=el.getAttribute(name)|| (name==='fill'?'#000000':'none');
        if(value==='none')continue;
        const hex=colour(value);if(hex)result.add(hex);else unknown=true;
      }
    }
    return unknown?null:[...result];
  }
  function relativeMatrix(root,el){
    const rootMatrix=root.getScreenCTM(),matrix=el.getScreenCTM();
    if(!rootMatrix||!matrix)throw new Error('De vectorvoorvertoning is nog niet beschikbaar.');
    return rootMatrix.inverse().multiply(matrix);
  }
  function boundsInRoot(root,el,includeStroke=false){
    const box=el.getBBox(),matrix=relativeMatrix(root,el);
    let padding=0;
    if(includeStroke&&el.getAttribute('stroke')!=='none')padding=number(el.getAttribute('stroke-width'))/2*Math.max(1,number(el.getAttribute('stroke-miterlimit')));
    const corners=[point(box.x-padding,box.y-padding,matrix),point(box.x+box.width+padding,box.y-padding,matrix),point(box.x+box.width+padding,box.y+box.height+padding,matrix),point(box.x-padding,box.y+box.height+padding,matrix)];
    return {left:Math.min(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),right:Math.max(...corners.map(p=>p.x)),bottom:Math.max(...corners.map(p=>p.y))};
  }
  function expandedBox(root){
    const base=root.getAttribute('data-sp-base-viewbox');
    const old=base?base.trim().split(/[\s,]+/).map(Number):viewBox(root);let left=old[0],top=old[1],right=left+old[2],bottom=top+old[3];
    for(const piece of pieces(root)){
      const el=geometry(piece);if(!el||el.closest('[display="none"],[visibility="hidden"]'))continue;
      const b=boundsInRoot(root,el,true);
      left=Math.min(left,b.left);top=Math.min(top,b.top);right=Math.max(right,b.right);bottom=Math.max(bottom,b.bottom);
    }
    return [left,top,right-left,bottom-top];
  }
  function mount(host,logo,callbacks={}){
    const root=document.importNode(SpatlapVectorExport.parseLogo(logo.svgMarkup),true);
    const shadow=host.attachShadow({mode:'closed'});shadow.append(root);
    const box=viewBox(root);root.setAttribute('width','100%');root.setAttribute('height','100%');root.setAttribute('preserveAspectRatio','none');
    root.style.cssText='display:block;width:100%;height:100%;overflow:visible;touch-action:none;cursor:default;shape-rendering:geometricPrecision';
    const overlay=svgNode('rect',{'data-sp-editor-overlay':1,fill:'none',stroke:'#61A6FF','stroke-width':1.5,'stroke-dasharray':'5 3','vector-effect':'non-scaling-stroke','pointer-events':'none'});root.append(overlay);
    const list=pieces(root);
    let selected=list.some(el=>el.getAttribute('data-sp-piece')===callbacks.partId)?callbacks.partId:list[0]?.getAttribute('data-sp-piece'),drag=null;
    const selectedPiece=()=>pieces(root).find(el=>el.getAttribute('data-sp-piece')===selected);
    function highlight(){
      const piece=selectedPiece(),el=geometry(piece);
      if(!el||!root.isConnected){overlay.setAttribute('display','none');return;}
      const b=boundsInRoot(root,el,true),pad=Math.max(box[2]/300,box[3]/300);
      overlay.setAttribute('display','inline');overlay.setAttribute('x',String(b.left-pad));overlay.setAttribute('y',String(b.top-pad));overlay.setAttribute('width',String(b.right-b.left+pad*2));overlay.setAttribute('height',String(b.bottom-b.top+pad*2));
    }
    function position(){
      const piece=selectedPiece();if(!piece)return {x:0,y:0};
      const m=relativeMatrix(root,piece.parentElement),p=offset(piece);
      return {x:(m.a*p.x+m.c*p.y)*logo.w/box[2],y:(m.b*p.x+m.d*p.y)*logo.h/box[3]};
    }
    function moveTo(x,y){
      const piece=selectedPiece();if(!piece)return;
      const m=relativeMatrix(root,piece.parentElement).inverse();
      const px=x*box[2]/logo.w,py=y*box[3]/logo.h;
      setOffset(piece,m.a*px+m.c*py,m.b*px+m.d*py);highlight();
    }
    function select(id){selected=id;highlight();callbacks.onSelect?.(id);}
    function finish(event,cancel=false){
      if(!drag||event.pointerId!==drag.id)return;
      const current=drag;drag=null;
      if(cancel)setOffset(current.piece,current.start.x,current.start.y);
      if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId);
      highlight();
      if(current.moved&&!cancel&&root.isConnected)callbacks.onCommit?.(root,true);
      else callbacks.onSelect?.(selected);
    }
    root.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      const piece=event.target.closest?.('g[data-sp-piece]');if(!piece)return;
      event.preventDefault();event.stopPropagation();host.focus({preventScroll:true});select(piece.getAttribute('data-sp-piece'));
      drag={id:event.pointerId,piece,start:offset(piece),x:event.clientX,y:event.clientY,inverse:piece.parentElement.getScreenCTM().inverse(),moved:false};root.setPointerCapture(event.pointerId);
    });
    root.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      if(!drag.moved&&Math.hypot(dx,dy)<3)return;
      drag.moved=true;const m=drag.inverse;
      setOffset(drag.piece,drag.start.x+m.a*dx+m.c*dy,drag.start.y+m.b*dx+m.d*dy);highlight();callbacks.onPreview?.();
    });
    root.addEventListener('pointerup',event=>finish(event));
    root.addEventListener('pointercancel',event=>finish(event,true));
    root.addEventListener('lostpointercapture',event=>{if(drag)finish(event,true);});
    root.addEventListener('click',event=>{if(event.target.closest?.('g[data-sp-piece]')){event.stopPropagation();event.preventDefault();}});
    return {
      root,position,moveTo,select,highlight,
      selectedId:()=>selected,
      selected:()=>geometry(selectedPiece()),
      parts:()=>pieces(root).map((piece,index)=>({id:piece.getAttribute('data-sp-piece'),label:`Onderdeel ${index+1} · ${geometry(piece)?.localName==='path'?'pad':geometry(piece)?.localName||'vorm'}`})),
      paint(name,value){const el=geometry(selectedPiece());if(el)el.setAttribute(name,value);highlight();},
      remove(){const list=pieces(root),index=list.indexOf(selectedPiece());selectedPiece()?.remove();selected=pieces(root)[Math.min(index,pieces(root).length-1)]?.getAttribute('data-sp-piece')||null;highlight();return selected;},
      duplicate(){
        const piece=selectedPiece();if(!piece)return null;
        const copy=piece.cloneNode(true),suffix=Date.now().toString(36)+Math.random().toString(36).slice(2,6),id='p'+suffix;
        copy.setAttribute('data-sp-piece',id);const ids=new Map([...copy.querySelectorAll('[id]')].map(el=>[el.id,el.id+'-'+suffix]));
        for(const el of [copy,...copy.querySelectorAll('*')])for(const attr of [...el.attributes]){
          let value=attr.value;if(attr.name==='id')value=ids.get(value)||value;
          value=value.replace(/url\(#([^)]+)\)/g,(all,id)=>ids.has(id)?`url(#${ids.get(id)})`:all);el.setAttribute(attr.name,value);
        }
        piece.after(copy);selected=id;const p=position();moveTo(p.x+.5,p.y+.5);return id;
      }
    };
  }
  window.SpatlapVectorEditor={prepare,mount,serialize,viewBox,expandedBox,colour,recolour,printColours};
})();
