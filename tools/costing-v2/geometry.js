/* V2 geometry: one millimetre model for validation, preview, toolpath and DXF.
 * Origin at centre of outer bounding box; X right, Y up. No nesting in voids.
 * Rounded rectangle LINE/ARC construction follows the supplied configurator's core.
 */
(function (g) {
  'use strict';
  const n=v=>Number(v), eps=1e-7, TAU=2*Math.PI;
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dimensions(p){return p.shape==='circle'?{w:p.outerDiameter,h:p.outerDiameter}:{w:p.width,h:p.height};}
  function parseHoles(p){
    const errors=[], holes=[], text=String(p.holeCoordinates||'');
    if(text.length>16000)return {holes,errors:['Maximaal 200 coördinaatgaten toegestaan.']};
    text.split(/\r?\n/).forEach((line,i)=>{
      if(!line.trim())return;
      const values=line.trim().split(/\s*;\s*/).map(v=>v.trim());
      const nums=values.map(v=>Number(v.replace(',','.')));
      if(values.length!==3||values.some(v=>!v)||nums.some(v=>!Number.isFinite(v))||!(nums[2]>0))errors.push('Gatregel '+(i+1)+': gebruik X; Y; diameter, met een positieve diameter.');
      else holes.push({x:nums[0],y:nums[1],r:nums[2]/2});
    });
    if(holes.length>200)errors.push('Maximaal 200 coördinaatgaten toegestaan.');
    return {holes:holes.slice(0,200),errors};
  }
  function parseOutline(p) {
    const points=[],errors=[];
    const text=String(p.outlineCoordinates||'');
    if(text.length>8000)return {points,errors:['De buitencontour is te lang.']};
    text.split(/\r?\n/).forEach((line,i)=>{if(!line.trim())return;const v=line.split(';').map(v=>v.trim());const nums=v.map(v=>Number(v.replace(',','.')));if(v.length!==2||v.some(v=>!v)||nums.some(v=>!Number.isFinite(v)||Math.abs(v)>50000))errors.push('Contourregel '+(i+1)+': gebruik X; Y in mm.');else points.push(nums);});
    if(points.length<3||points.length>100)errors.push('Gebruik 3–100 hoekpunten voor de buitencontour.');
    function cross(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
    function on(a,b,c){return Math.abs(cross(a,b,c))<eps&&c[0]>=Math.min(a[0],b[0])-eps&&c[0]<=Math.max(a[0],b[0])+eps&&c[1]>=Math.min(a[1],b[1])-eps&&c[1]<=Math.max(a[1],b[1])+eps;}
    function intersects(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);}
    if(points.length>=3&&points.length<=100){let area=0;points.forEach((a,i)=>{const b=points[(i+1)%points.length];area+=a[0]*b[1]-b[0]*a[1];const prev=points[(i+points.length-1)%points.length];if(Math.abs(cross(prev,a,b))<eps&&(prev[0]-a[0])*(b[0]-a[0])+(prev[1]-a[1])*(b[1]-a[1])>eps)errors.push('De contour loopt over zichzelf terug.');if(Math.hypot(a[0]-b[0],a[1]-b[1])<eps)errors.push('De contour bevat dubbele opeenvolgende punten.');for(let j=i+1;j<points.length;j++){if(j===i+1||i===0&&j===points.length-1)continue;if(intersects(a,b,points[j],points[(j+1)%points.length]))errors.push('De buitencontour kruist of raakt zichzelf.');}});if(Math.abs(area)<eps)errors.push('De buitencontour heeft geen oppervlak.');}
    return {points:points.slice(0,100),errors:[...new Set(errors)]};
  }
  function roundedDistance(x,y,w,h,r){r=Math.max(0,Math.min(r||0,w/2,h/2));const dx=Math.abs(x)-w/2+r,dy=Math.abs(y)-h/2+r;return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;}
  function lPoints(p){const {w,h}=dimensions(p),a=p.notchWidth,b=p.notchHeight;return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2-b],[w/2-a,h/2-b],[w/2-a,h/2],[-w/2,h/2]];}
  function polygonDistance(x,y,pts){let inside=false,min=Infinity;for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const a=pts[j],b=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
    min=Math.min(min,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return inside?-min:min;}
  function outerDistance(p,x,y){if(p.shape==='cad')return g.CadV2.signedDistance(g.CadV2.read(p.cadGeometry).loops[0],[x,y]);const {w,h}=dimensions(p);if(p.shape==='circle')return Math.hypot(x,y)-w/2;
    if(p.shape==='lshape'||p.shape==='polygon')return polygonDistance(x,y,p.shape==='lshape'?lPoints(p):parseOutline(p).points);
    return roundedDistance(x,y,w,h,p.shape==='manhole'?Math.min(w,h)/2:p.cornerRadius);
  }
  function openingDistance(p,x,y){if(p.shape==='cad'){const loops=g.CadV2.read(p.cadGeometry).loops.slice(1);return loops.length?Math.min(...loops.map(loop=>g.CadV2.signedDistance(loop,[x,y]))):Infinity;}if(p.opening==='circle')return Math.hypot(x,y)-p.innerDiameter/2;if(p.opening==='rect')return roundedDistance(x,y,p.innerWidth,p.innerHeight,p.shape==='manhole'?Math.min(p.innerWidth,p.innerHeight)/2:p.innerRadius);return Infinity;}
  function validate(p){const errors=[],{w,h}=dimensions(p),parsed=parseHoles(p);
    if(p.shape==='cad'){try{g.CadV2.read(p.cadGeometry);}catch(e){return [e.message];}if(p.opening!=='none')errors.push('De binnencontouren komen uit het geïmporteerde bestand.');}
    if(![w,h,p.thickness].every(v=>Number.isFinite(v)&&v>0))errors.push('Vul positieve buitenmaten en dikte in.');
    if(p.shape==='lshape'&&!(p.notchWidth>0&&p.notchWidth<w&&p.notchHeight>0&&p.notchHeight<h))errors.push('De hoekuitsparing moet positief en kleiner dan de buitenmaten zijn.');
    if(p.shape==='polygon')errors.push(...parseOutline(p).errors);
    if((p.shape==='lshape'||p.shape==='polygon')&&p.opening!=='none')errors.push('Gebruik bij een L-vorm of vrije contour geen middenuitsparing.');
    if((p.cornerRadius||0)>Math.min(w,h)/2)errors.push('De buitenradius is groter dan de halve kleinste buitenmaat.');
    if(p.opening==='rect'&&(p.innerRadius||0)>Math.min(p.innerWidth,p.innerHeight)/2)errors.push('De binnenradius is groter dan de halve kleinste binnenmaat.');
    if(p.opening==='circle'&&!(p.innerDiameter>0&&p.innerDiameter<Math.min(w,h)))errors.push('Het middengat moet binnen de buitenvorm liggen.');
    if(p.opening==='rect'){
      if(!(p.innerWidth>0&&p.innerHeight>0&&p.innerWidth<w&&p.innerHeight<h))errors.push('De binnenmaten moeten positief en kleiner dan de buitenmaten zijn.');
      const ri=p.shape==='manhole'?Math.min(p.innerWidth,p.innerHeight)/2:Math.min(p.innerRadius||0,p.innerWidth/2,p.innerHeight/2);
      let clearance;
      if(p.shape==='circle') clearance=w/2-Math.hypot(p.innerWidth/2-ri,p.innerHeight/2-ri)-ri;
      else {const ro=p.shape==='manhole'?Math.min(w,h)/2:Math.min(p.cornerRadius||0,w/2,h/2),dx=(w-p.innerWidth)/2-ro+ri,dy=(h-p.innerHeight)/2-ro+ri;
        clearance=Math.min((w-p.innerWidth)/2,(h-p.innerHeight)/2,dx<0&&dy<0?ro-ri-Math.hypot(dx,dy):Infinity);}
      if(clearance<=eps)errors.push('De middenuitsparing raakt of kruist de buitenvorm.');
    }
    if(p.holeMode!=='coordinates'&&p.holes>0)errors.push('Leg de bestaande schematische gaten eerst vast met coördinaten voor een productietekening.');
    errors.push(...parsed.errors);
    parsed.holes.forEach((hole,i)=>{
      if(outerDistance(p,hole.x,hole.y)>=-hole.r-eps)errors.push('Gat '+(i+1)+' raakt of kruist de buitenrand.');
      if(openingDistance(p,hole.x,hole.y)<=hole.r+(p.shape==='cad'?.021:eps))errors.push('Gat '+(i+1)+' raakt of kruist de middenuitsparing.');
      parsed.holes.slice(0,i).forEach((other,j)=>{if(Math.hypot(hole.x-other.x,hole.y-other.y)<=hole.r+other.r+eps)errors.push('Gaten '+(j+1)+' en '+(i+1)+' raken of overlappen.');});
    });return [...new Set(errors)];
  }
  function roundedPoints(w,h,r){r=Math.max(0,Math.min(r||0,w/2,h/2));if(!r)return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];let pts=[];[[w/2-r,h/2-r,0],[-w/2+r,h/2-r,90],[-w/2+r,-h/2+r,180],[w/2-r,-h/2+r,270]].forEach(([x,y,start])=>{for(let i=0;i<=24;i++){const a=(start+i*90/24)*Math.PI/180;pts.push([x+r*Math.cos(a),y+r*Math.sin(a)]);}});return pts;}
  function boundary(p){if(p.shape==='cad')return g.CadV2.points(g.CadV2.read(p.cadGeometry).loops[0]);const {w,h}=dimensions(p);if(p.shape==='circle')return Array.from({length:192},(_,i)=>[w/2*Math.cos(TAU*i/192),w/2*Math.sin(TAU*i/192)]);return p.shape==='polygon'?parseOutline(p).points:p.shape==='lshape'?lPoints(p):roundedPoints(w,h,p.shape==='manhole'?Math.min(w,h)/2:p.cornerRadius);}
  function perimeter(w,h,r){r=Math.max(0,Math.min(r||0,w/2,h/2));return 2*(w+h-4*r)+TAU*r;}
  function cutLength(p){const {w,h}=dimensions(p);let length=p.shape==='circle'?Math.PI*w:perimeter(w,h,p.shape==='manhole'?Math.min(w,h)/2:p.shape==='lshape'?0:p.cornerRadius);
    if(p.shape==='polygon'){const pts=parseOutline(p).points;length=pts.reduce((sum,pt,i)=>sum+Math.hypot(pt[0]-pts[(i+1)%pts.length][0],pt[1]-pts[(i+1)%pts.length][1]),0);}
    if(p.shape==='cad')length=g.CadV2.read(p.cadGeometry).loops.flat().reduce((sum,e)=>sum+g.CadV2.length(e),0);
    if(p.opening==='circle')length+=Math.PI*p.innerDiameter;
    if(p.opening==='rect')length+=perimeter(p.innerWidth,p.innerHeight,p.shape==='manhole'?Math.min(p.innerWidth,p.innerHeight)/2:p.innerRadius);
    return length+parseHoles(p).holes.reduce((sum,hole)=>sum+TAU*hole.r,0);
  }
  function path(points){return 'M'+points.map(pt=>pt[0]+','+(-pt[1])).join('L')+'Z';}
  let maskSequence=0;
  function geometryPaths(p){const outer=p.shape==='cad'?g.CadV2.path(g.CadV2.read(p.cadGeometry).loops[0]):path(boundary(p));let inner=p.shape==='cad'?g.CadV2.read(p.cadGeometry).loops.slice(1).map(g.CadV2.path).join(''):'';
    function circlePath(x,y,r){return 'M'+(x-r)+','+(-y)+'a'+r+','+r+' 0 1 0 '+(2*r)+',0a'+r+','+r+' 0 1 0 '+(-2*r)+',0Z';}
    if(p.opening==='circle')inner+=circlePath(0,0,p.innerDiameter/2);
    if(p.opening==='rect')inner+=path(roundedPoints(p.innerWidth,p.innerHeight,p.shape==='manhole'?Math.min(p.innerWidth,p.innerHeight)/2:p.innerRadius));
    parseHoles(p).holes.forEach(h=>{inner+=circlePath(h.x,h.y,h.r);});
    return {outer,inner};
  }
  function svgShape(p,fill){const {outer,inner}=geometryPaths(p);
    const {w,h}=dimensions(p),id='v2-material-'+(++maskSequence);
    return '<defs><mask id="'+id+'" maskUnits="userSpaceOnUse" x="'+(-w/2)+'" y="'+(-h/2)+'" width="'+w+'" height="'+h+'"><path d="'+outer+'" fill="white"/>'+(inner?'<path d="'+inner+'" fill="black"/>':'')+'</mask></defs><path d="'+outer+'" fill="'+fill+'" mask="url(#'+id+')" stroke="#1e553c" stroke-width="1" vector-effect="non-scaling-stroke"/>';
  }

  function svg(p){const errors=validate(p);if(errors.length)throw Error(errors.join('\n'));const {w,h}=dimensions(p),pad=0;return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'mm" height="'+h+'mm" viewBox="'+[-w/2-pad,-h/2-pad,w+2*pad,h+2*pad].join(' ')+'">'+'<path d="'+geometryPaths(p).outer+geometryPaths(p).inner+'" fill="#438863" fill-rule="evenodd"/>'+'</svg>';}
  function dxf(p){const errors=validate(p);if(errors.length)throw Error(errors.join('\n'));const lines=[];const add=(...args)=>args.forEach(a=>lines.push(typeof a==='number'?Number(a.toFixed(8)).toString():a));
    add(0,'SECTION',2,'HEADER',9,'$ACADVER',1,'AC1015',9,'$INSUNITS',70,4,9,'$MEASUREMENT',70,1,0,'ENDSEC',0,'SECTION',2,'TABLES',0,'TABLE',2,'LAYER',70,3);
    ['CUT_OUTER','CUT_INNER','CUT_HOLES'].forEach((layer,i)=>add(0,'LAYER',2,layer,70,0,62,i+1,6,'CONTINUOUS'));add(0,'ENDTAB',0,'ENDSEC',0,'SECTION',2,'ENTITIES');
    function circle(layer,x,y,r){add(0,'CIRCLE',8,layer,10,x,20,y,30,0,40,r);}
    function rect(layer,w,h,r){g.GasketConfiguratorCore.roundedRectEntities(w,h,r).forEach(e=>{if(e.type==='arc')add(0,'ARC',8,layer,10,e.cx,20,e.cy,30,0,40,e.r,50,e.startAngle,51,e.endAngle);else add(0,'LINE',8,layer,10,e.x1,20,e.y1,30,0,11,e.x2,21,e.y2,31,0);});}
    const {w,h}=dimensions(p);
    if(p.shape==='cad')g.CadV2.dxfEntities(g.CadV2.read(p.cadGeometry),add);else if(p.shape==='circle')circle('CUT_OUTER',0,0,w/2);else if(p.shape==='lshape'||p.shape==='polygon'){const pts=p.shape==='lshape'?lPoints(p):parseOutline(p).points;add(0,'LWPOLYLINE',8,'CUT_OUTER',90,pts.length,70,1);pts.forEach(pt=>add(10,pt[0],20,pt[1]));}else rect('CUT_OUTER',w,h,p.shape==='manhole'?Math.min(w,h)/2:p.cornerRadius);
    if(p.opening==='circle')circle('CUT_INNER',0,0,p.innerDiameter/2);if(p.opening==='rect')rect('CUT_INNER',p.innerWidth,p.innerHeight,p.shape==='manhole'?Math.min(p.innerWidth,p.innerHeight)/2:p.innerRadius);
    parseHoles(p).holes.forEach(h=>circle('CUT_HOLES',h.x,h.y,h.r));add(0,'ENDSEC',0,'EOF');return lines.join('\r\n')+'\r\n';
  }
  g.GasketV2Geometry={dimensions,parseHoles,parseOutline,validate,cutLength,svgShape,svg,dxf,esc,outerDistance};
})(window);
