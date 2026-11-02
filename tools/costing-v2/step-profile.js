/* Exact LINE/ARC profile for STEP. No mesh, polygonised circle or input writes. */
(function(g){
 'use strict';
 const TAU=2*Math.PI,EPS=1e-7;
 const point=(edge,end=false)=>edge.t==='L'?[...(end?edge.b:edge.a)]:[edge.c[0]+edge.r*Math.cos(edge.start+(end?edge.sweep:0)),edge.c[1]+edge.r*Math.sin(edge.start+(end?edge.sweep:0))];
 const reverse=edge=>edge.t==='L'?{t:'L',a:[...edge.b],b:[...edge.a]}:{...edge,c:[...edge.c],start:edge.start+edge.sweep,sweep:-edge.sweep};
 const polygon=points=>points.map((a,i)=>({t:'L',a:[...a],b:[...points[(i+1)%points.length]]}));
 function rounded(w,h,r){
  if(!Number.isFinite(r)||r<0||r>Math.min(w,h)/2)throw Error('Controleer de radius van de STEP-contour.');
  if(!r)return polygon([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]);
  const result=[],centres=[[w/2-r,h/2-r],[-w/2+r,h/2-r],[-w/2+r,-h/2+r],[w/2-r,-h/2+r]];
  for(let i=0;i<4;i++){
   const arc={t:'A',c:centres[i],r,start:i*Math.PI/2,sweep:Math.PI/2},nextCentre=centres[(i+1)%4],end=point(arc,true),nextAngle=(i+1)*Math.PI/2,next=[nextCentre[0]+r*Math.cos(nextAngle),nextCentre[1]+r*Math.sin(nextAngle)];
   result.push(arc);if(Math.hypot(end[0]-next[0],end[1]-next[1])>EPS)result.push({t:'L',a:end,b:next});
  }
  return result;
 }
 function signedArea(loop){return loop.reduce((sum,e)=>{if(e.t==='L')return sum+(e.a[0]*e.b[1]-e.b[0]*e.a[1])/2;const a=e.start,b=a+e.sweep;return sum+(e.c[0]*e.r*(Math.sin(b)-Math.sin(a))-e.c[1]*e.r*(Math.cos(b)-Math.cos(a))+e.r*e.r*e.sweep)/2;},0);}
 function profile(piece){
  const errors=g.GasketV2Geometry.validate(piece);if(errors.length)throw Error(errors.join('\n'));
  if(!(piece.thickness>EPS&&piece.thickness<=100000))throw Error('STEP vereist een dikte groter dan 0,0000001 en maximaal 100.000 mm.');
  let loops;
  if(piece.shape==='cad'){
   const data=g.CadV2.read(piece.cadGeometry);
   if(data.approximation>0)throw Error('Dit geïmporteerde model bevat benaderde contouren. Exacte STEP-export is daarvoor niet beschikbaar; je oorspronkelijke bestand blijft behouden.');
   loops=data.loops.map(loop=>loop.map(e=>e.t==='L'?{t:'L',a:[...e.a],b:[...e.b]}:{...e,c:[...e.c]}));
  }else{
   const {w,h}=g.GasketV2Geometry.dimensions(piece);
   if(piece.shape==='circle')loops=[[{t:'C',c:[0,0],r:w/2}]];
   else if(piece.shape==='rect'||piece.shape==='manhole')loops=[rounded(w,h,piece.shape==='manhole'?Math.min(w,h)/2:piece.cornerRadius||0)];
   else if(piece.shape==='polygon')loops=[polygon(g.GasketV2Geometry.parseOutline(piece).points)];
   else if(piece.shape==='lshape')loops=[polygon([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2-piece.notchHeight],[w/2-piece.notchWidth,h/2-piece.notchHeight],[w/2-piece.notchWidth,h/2],[-w/2,h/2]])];
   else throw Error('Deze vorm wordt nog niet door STEP-export ondersteund.');
   if(piece.opening==='circle')loops.push([{t:'C',c:[0,0],r:piece.innerDiameter/2}]);
   if(piece.opening==='rect')loops.push(rounded(piece.innerWidth,piece.innerHeight,piece.shape==='manhole'?Math.min(piece.innerWidth,piece.innerHeight)/2:piece.innerRadius||0));
  }
  for(const hole of g.GasketV2Geometry.parseHoles(piece).holes)loops.push([{t:'C',c:[hole.x,hole.y],r:hole.r}]);
  // Quarter-circle patches avoid periodic cylinder seams and closed single edges.
  loops=loops.map((loop,index)=>{
   let edges=loop.flatMap(e=>{if(e.t==='L')return [e];const sweep=e.t==='C'?TAU:e.sweep,start=e.t==='C'?0:e.start,count=Math.ceil(Math.abs(sweep)/(Math.PI/2));return Array.from({length:count},(_,i)=>({t:'A',c:[...e.c],r:e.r,start:start+sweep*i/count,sweep:sweep/count}));});
   const area=signedArea(edges);if(!Number.isFinite(area)||Math.abs(area)<=EPS*EPS)throw Error('Deze STEP-contour heeft geen bruikbaar oppervlak.');
   if((area>0)!==(index===0))edges=edges.reverse().map(reverse);
   for(let i=0;i<edges.length;i++){
    const e=edges[i],a=point(e),b=point(e,true),next=point(edges[(i+1)%edges.length]);
    if([...a,...b].some(v=>!Number.isFinite(v)||Math.abs(v)>100000)||Math.hypot(a[0]-b[0],a[1]-b[1])<=EPS)throw Error('Deze STEP-contour bevat een te klein of ongeldig segment.');
    if(Math.hypot(b[0]-next[0],b[1]-next[1])>EPS)throw Error('Deze contour sluit niet nauwkeurig genoeg voor STEP. Herstel de aansluitingen in het oorspronkelijke CAD-bestand.');
   }
   return edges;
  });
  if(loops.reduce((sum,loop)=>sum+loop.length,0)>2000)throw Error('Deze STEP-contour is te complex (maximaal 2000 lijn-/boogdelen na boogsplitsing).');
  return loops;
 }
 g.GasketV2StepProfile={profile,point,signedArea};
})(window);
