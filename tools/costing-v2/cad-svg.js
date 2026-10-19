(function(g){'use strict';
function fromSvg(text){
 const doc=new DOMParser().parseFromString(text,'image/svg+xml'),root=doc.documentElement;
 if(root.localName!=='svg'||doc.querySelector('parsererror'))throw Error('Dit is geen geldig SVG-bestand.');
 if(doc.querySelector('script,foreignObject,image,use,iframe')||doc.querySelector('svg svg'))throw Error('Gebruik een SVG met zelfstandige vectorcontouren, zonder afbeeldingen, scripts, gekoppelde symbolen of geneste SVG-vakken.');
 const num=v=>{if(v==null||v==='')return 0;if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v.trim()))throw Error('Gebruik gewone numerieke SVG-coördinaten zonder procenten of CSS-eenheden.');return Number(v);};
 function mm(v){const match=/^\s*([\d.+e-]+)\s*(mm|cm|m|in|px|pt)?\s*$/i.exec(v||'');if(!match)return null;return Number(match[1])*({mm:1,cm:10,m:1000,in:25.4,px:25.4/96,pt:25.4/72}[match[2]?.toLowerCase()||'px']);}
 const vb=(root.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number),width=mm(root.getAttribute('width')),height=mm(root.getAttribute('height'));
 let factor=null;if(vb.length===4&&vb.every(Number.isFinite)&&vb[2]>0&&vb[3]>0&&width>0){factor=width/vb[2];if(height>0&&Math.abs(height/vb[3]-factor)>1e-7)throw Error('SVG heeft verschillende schalen voor X en Y. Exporteer met gelijke schaal of zet de afmetingen eerst om naar mm.');}else if(!root.hasAttribute('viewBox')&&width>0)factor=25.4/96;
 for(const node of root.querySelectorAll('style,[style]'))if(/(?:clip-path|mask|transform|display|visibility)\s*:/i.test(node.localName==='style'?node.textContent:node.getAttribute('style')))throw Error('Zet CSS-maskers, verborgen vormen en CSS-transformaties eerst om naar zelfstandige contourpaden.');
 const entities=[],tol=.001;
 function append(a,b){if(Math.hypot(a[0]-b[0],a[1]-b[1])>1e-8)entities.push(g.CadV2.line(a,b));if(entities.length>2000)throw Error('SVG bevat te veel detail (maximaal 2000 lijnsegmenten).');}
 function bezier(a,b,c,d,depth=0){const distance=p=>{const dx=d[0]-a[0],dy=d[1]-a[1];return Math.abs(dx*(a[1]-p[1])-(a[0]-p[0])*dy)/(Math.hypot(dx,dy)||1);};if(Math.max(distance(b),distance(c))<=tol&&Math.max(...[a,b,c,d].map(p=>p[0]))-Math.min(...[a,b,c,d].map(p=>p[0]))<=Math.abs(d[0]-a[0])+tol*2&&Math.max(...[a,b,c,d].map(p=>p[1]))-Math.min(...[a,b,c,d].map(p=>p[1]))<=Math.abs(d[1]-a[1])+tol*2){append(a,d);return;}if(depth>=20)throw Error('Een SVG-curve is te complex.');const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2],ab=mid(a,b),bc=mid(b,c),cd=mid(c,d),abc=mid(ab,bc),bcd=mid(bc,cd),m=mid(abc,bcd);bezier(a,ab,abc,m,depth+1);bezier(m,bcd,cd,d,depth+1);}
 let hadCurves=false,arcError=0,shapes=0;
 for(const el of root.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line')){
  if(el.closest('defs,clipPath,mask,pattern,marker,symbol'))continue;
  if(++shapes>200)throw Error('Maximaal 200 SVG-vormelementen toegestaan.');
  if(el.hasAttribute('clip-path')||el.hasAttribute('mask')||el.closest('[clip-path],[mask]'))throw Error('Knipmaskers worden niet als snijcontour geïmporteerd. Zet ze eerst om naar echte paden.');
  let d='';const n=a=>num(el.getAttribute(a)),tag=el.localName;
  if(tag==='path')d=el.getAttribute('d')||'';
  else if(tag==='circle'||tag==='ellipse'){const x=n('cx'),y=n('cy'),rx=tag==='circle'?n('r'):n('rx'),ry=tag==='circle'?n('r'):n('ry');if(!(rx>0&&ry>0))throw Error('Ongeldige SVG-cirkel of ellips.');d=`M${x-rx},${y}A${rx},${ry} 0 1 0 ${x+rx},${y}A${rx},${ry} 0 1 0 ${x-rx},${y}Z`;}
  else if(tag==='rect'){const x=n('x'),y=n('y'),w=n('width'),h=n('height'),rx=Math.min(n('rx')||n('ry'),w/2),ry=Math.min(n('ry')||n('rx'),h/2);if(!(w>0&&h>0))throw Error('Ongeldige SVG-rechthoek.');d=rx&&ry?`M${x+rx},${y}H${x+w-rx}A${rx},${ry} 0 0 1 ${x+w},${y+ry}V${y+h-ry}A${rx},${ry} 0 0 1 ${x+w-rx},${y+h}H${x+rx}A${rx},${ry} 0 0 1 ${x},${y+h-ry}V${y+ry}A${rx},${ry} 0 0 1 ${x+rx},${y}Z`:`M${x},${y}h${w}v${h}h${-w}Z`;}
  else if(tag==='line')d=`M${n('x1')},${n('y1')}L${n('x2')},${n('y2')}`;
  else {const vals=(el.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number);if(vals.length<4||vals.length%2||vals.some(v=>!Number.isFinite(v)))throw Error('Ongeldige SVG-punten.');d='M'+vals[0]+','+vals[1];for(let i=2;i<vals.length;i+=2)d+='L'+vals[i]+','+vals[i+1];if(tag==='polygon')d+='Z';}
  const transforms=[];for(let parent=el;parent&&parent!==root.parentElement;parent=parent.parentElement){if(parent.hasAttribute('transform'))transforms.unshift(parent.getAttribute('transform'));if(parent===root)break;}
  const parsed=g.svgpath(d);if(parsed.err)throw Error('Het SVG-pad is ongeldig: '+parsed.err);parsed.transform('scale(1,-1) '+transforms.join(' ')).abs().unshort();
  let at=[0,0],first=at;
  for(const seg of parsed.segments){const command=seg[0];if(command==='M'){at=[seg[1],seg[2]];first=at;}else if(command==='Z'){append(at,first);at=first;}else if(command==='L'){const b=[seg[1],seg[2]];append(at,b);at=b;}else if(command==='H'){const b=[seg[1],at[1]];append(at,b);at=b;}else if(command==='V'){const b=[at[0],seg[1]];append(at,b);at=b;}else if(command==='A'){
 const b=[seg[6],seg[7]],rx=Math.abs(seg[1]),ry=Math.abs(seg[2]);
 if(Math.abs(rx-ry)<1e-8){const dx=(at[0]-b[0])/2,dy=(at[1]-b[1])/2,q=dx*dx+dy*dy;if(q>1e-16){const r=Math.max(rx,Math.sqrt(q)),coeff=(seg[4]===seg[5]?-1:1)*Math.sqrt(Math.max(0,(r*r-q)/q)),center=[(at[0]+b[0])/2+coeff*dy,(at[1]+b[1])/2-coeff*dx],start=Math.atan2(at[1]-center[1],at[0]-center[0]);let sweep=(Math.atan2(b[1]-center[1],b[0]-center[0])-start)%(2*Math.PI);if(seg[5]&&sweep<0)sweep+=2*Math.PI;if(!seg[5]&&sweep>0)sweep-=2*Math.PI;entities.push({t:'A',c:center,r,start,sweep});}}else{const arcs=g.svgpath('M'+at.join(',')+seg.join(' ')).unarc();let a=at;for(const part of arcs.segments){if(part[0]==='C'){const end=[part[5],part[6]];bezier(a,[part[1],part[2]],[part[3],part[4]],end);a=end;}else if(part[0]==='L'){const end=[part[1],part[2]];append(a,end);a=end;}}hadCurves=true;arcError=Math.max(arcError,Math.max(rx,ry)*.0003);}at=b;
 }else if(command==='C'){const b=[seg[5],seg[6]];bezier(at,[seg[1],seg[2]],[seg[3],seg[4]],b);at=b;hadCurves=true;}else if(command==='Q'){const cp=[seg[1],seg[2]],b=[seg[3],seg[4]],c1=[at[0]+2/3*(cp[0]-at[0]),at[1]+2/3*(cp[1]-at[1])],c2=[b[0]+2/3*(cp[0]-b[0]),b[1]+2/3*(cp[1]-b[1])];bezier(at,c1,c2,b);at=b;hadCurves=true;}else throw Error('SVG-padcommando '+command+' wordt niet ondersteund.');}
 }
 if(!shapes)throw Error('Geen vectorcontouren gevonden in dit SVG-bestand.');
 return {entities,factor,format:'SVG',approximation:hadCurves?tol+arcError:0,warnings:['Tekst, vulling, kleur en lijndikte tellen niet mee; alleen de vectorcontouren worden gebruikt.']};
}
g.CadV2Svg={fromSvg};
})(window);
