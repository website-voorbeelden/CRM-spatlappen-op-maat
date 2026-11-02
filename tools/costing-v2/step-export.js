/* ISO 10303 AP214 manifold BREP: planar caps, exact lines/circles and
 * cylindrical side faces. Shared edges/vertices close one extruded part in mm.
 */
(function(g){
 'use strict';
 function linearLoops(piece){
  const errors=g.GasketV2Geometry.validate(piece);if(errors.length)throw Error(errors.join('\n'));
  if(g.GasketV2Geometry.parseHoles(piece).holes.length)throw Error('STEP-export van ronde gaten is nog niet beschikbaar. Gebruik de bestaande DXF met exacte cirkels.');
  let loops;
  if(piece.shape==='cad'){
   const data=g.CadV2.read(piece.cadGeometry);
   if(data.approximation>0||data.loops.some(loop=>loop.some(edge=>edge.t!=='L')))throw Error('Deze import bevat bogen of benaderde geometrie. Exacte STEP-export daarvoor is nog niet beschikbaar; je oorspronkelijke bestand blijft behouden.');
   loops=data.loops.map(loop=>loop.map(edge=>[...edge.a]));
  }else{
   if(piece.shape==='circle'||piece.shape==='manhole'||piece.shape==='rect'&&piece.cornerRadius>0)throw Error('STEP-export van ronde vormen en afgeronde hoeken is nog niet beschikbaar. De DXF bewaart de exacte cirkels en bogen.');
   if(!['rect','lshape','polygon'].includes(piece.shape))throw Error('Deze vorm wordt nog niet door STEP-export ondersteund.');
   const w=piece.width,h=piece.height;
   const outline=piece.shape==='polygon'?g.GasketV2Geometry.parseOutline(piece).points:piece.shape==='lshape'?[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2-piece.notchHeight],[w/2-piece.notchWidth,h/2-piece.notchHeight],[w/2-piece.notchWidth,h/2],[-w/2,h/2]]:[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
   loops=[outline];
   if(piece.opening==='circle'||piece.opening==='rect'&&piece.innerRadius>0)throw Error('STEP-export van een ronde of afgeronde middenuitsparing is nog niet beschikbaar. Gebruik hiervoor de DXF.');
   if(piece.opening==='rect'){const a=piece.innerWidth/2,b=piece.innerHeight/2;loops.push([[-a,-b],[a,-b],[a,b],[-a,b]]);}
  }
  const total=loops.reduce((sum,loop)=>sum+loop.length,0);if(total>2000)throw Error('Deze contour heeft te veel hoekpunten voor deze STEP-export (maximaal 2000).');
  return loops.map((loop,index)=>{const copy=loop.map(point=>[...point]),area=g.CadV2.area(copy);if(copy.length<3||Math.abs(area)<1e-10)throw Error('Deze contour heeft geen bruikbaar oppervlak.');if((area>0)!==(index===0))copy.reverse();return copy;});
 }
 function exportStep(piece){
  const loops=g.GasketV2StepProfile.profile(piece),rows=[];
  const add=text=>{rows.push('#'+(rows.length+1)+'='+text+';');return '#'+rows.length;};
  const string=value=>"'"+String(value||'').slice(0,200).replace(/[^\x20-\x7e]/g,'_').replace(/'/g,"''")+"'";
  const real=value=>{if(!Number.isFinite(value))throw Error('Ongeldig STEP-coördinaat.');const number=Number(value.toFixed(12)),text=String(Object.is(number,-0)?0:number).toUpperCase();if(text.includes('E')){const [mantissa,exponent]=text.split('E');return (mantissa.includes('.')?mantissa:mantissa+'.')+'E'+exponent;}return text.includes('.')?text:text+'.';};
  const app=add("APPLICATION_CONTEXT('automotive design')");add("APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,"+app+")");
  const pc=add("PRODUCT_CONTEXT('',"+app+",'mechanical')"),product=add('PRODUCT(\'part\','+string(piece.name||'Onderdeel')+",'',("+pc+'))'),formation=add("PRODUCT_DEFINITION_FORMATION('','',"+product+")"),dc=add("PRODUCT_DEFINITION_CONTEXT('part definition',"+app+",'design')"),definition=add("PRODUCT_DEFINITION('design','',"+formation+','+dc+')'),shape=add("PRODUCT_DEFINITION_SHAPE('','',"+definition+")");
  const mm=add('(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))'),rad=add('(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.))'),sr=add('(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT())'),uncertainty=add("UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-7),"+mm+",'distance_accuracy_value','')"),context=add("(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT(("+uncertainty+")) GLOBAL_UNIT_ASSIGNED_CONTEXT(("+[mm,rad,sr].join(',')+")) REPRESENTATION_CONTEXT('',''))");
  const bool=value=>value?'.T.':'.F.',point3=p=>add("CARTESIAN_POINT('',("+p.map(real).join(',')+'))'),direction=v=>add("DIRECTION('',("+v.map(real).join(',')+'))');
  const up=direction([0,0,1]),down=direction([0,0,-1]),xAxis=direction([1,0,0]);
  const placement=(p,normal=up,reference=xAxis)=>add("AXIS2_PLACEMENT_3D('',"+point3(p)+','+normal+','+reference+')');
  const plane=(p,normal,reference=xAxis)=>add("PLANE('',"+placement(p,normal,reference)+')');
  const vertex=p=>({p,id:add("VERTEX_POINT('',"+point3(p)+')')});
  function edge(a,b,curve,sense=true){return add("EDGE_CURVE('',"+a.id+','+b.id+','+curve+','+bool(sense)+')');}
  function line(a,b){const delta=b.p.map((n,i)=>n-a.p[i]),length=Math.hypot(...delta);if(!(length>1e-7))throw Error('Te kleine STEP-rand.');const vector=add("VECTOR('',"+direction(delta.map(n=>n/length))+','+real(length)+')');return edge(a,b,add("LINE('',"+point3(a.p)+','+vector+')'));}
  const oriented=(id,forward=true)=>add("ORIENTED_EDGE('',*,*,"+id+','+bool(forward)+')');
  function bound(edges,outer=true){const loop=add("EDGE_LOOP('',("+edges.map(([id,forward])=>oriented(id,forward)).join(',')+'))');return add((outer?'FACE_OUTER_BOUND':'FACE_BOUND')+"('',"+loop+",.T.)");}
  const face=(bounds,surface,sense=true)=>add("ADVANCED_FACE('',("+bounds.join(',')+'),'+surface+','+bool(sense)+')');
  const faces=[],topBounds=[],bottomBounds=[];
  loops.forEach((loop,loopIndex)=>{
   const bottom=loop.map(e=>{const [x,y]=g.GasketV2StepProfile.point(e);return vertex([x,y,0]);}),top=bottom.map(v=>vertex([v.p[0],v.p[1],piece.thickness]));
   const vertical=bottom.map((v,i)=>line(v,top[i])),low=[],high=[];
   loop.forEach((e,i)=>{
    const j=(i+1)%loop.length;let surface,sense=true;
    if(e.t==='L'){
     low.push(line(bottom[i],bottom[j]));high.push(line(top[i],top[j]));
     const dx=bottom[j].p[0]-bottom[i].p[0],dy=bottom[j].p[1]-bottom[i].p[1],length=Math.hypot(dx,dy);
     surface=plane(bottom[i].p,direction([dy/length,-dx/length,0]),direction([dx/length,dy/length,0]));
    }else{
     const circle=z=>add("CIRCLE('',"+placement([e.c[0],e.c[1],z])+','+real(e.r)+')');
     low.push(edge(bottom[i],bottom[j],circle(0),e.sweep>0));high.push(edge(top[i],top[j],circle(piece.thickness),e.sweep>0));
     surface=add("CYLINDRICAL_SURFACE('',"+placement([e.c[0],e.c[1],0],up,direction([Math.cos(e.start),Math.sin(e.start),0]))+','+real(e.r)+')');sense=e.sweep>0;
    }
    // The material is left of every profile edge. This loop points outward,
    // including clockwise hole walls and concave circular CAD segments.
    faces.push(face([bound([[low[i],true],[vertical[j],true],[high[i],false],[vertical[i],false]])],surface,sense));
   });
   topBounds.push(bound(high.map(id=>[id,true]),loopIndex===0));
   bottomBounds.push(bound([...low].reverse().map(id=>[id,false]),loopIndex===0));
  });
  faces.push(face(topBounds,plane([0,0,piece.thickness],up)),face(bottomBounds,plane([0,0,0],down)));
  const shell=add("CLOSED_SHELL('',("+faces.join(',')+'))'),brep=add('MANIFOLD_SOLID_BREP('+string(piece.name||'Onderdeel')+','+shell+')'),representation=add("ADVANCED_BREP_SHAPE_REPRESENTATION('',("+brep+'),'+context+')');add('SHAPE_DEFINITION_REPRESENTATION('+shape+','+representation+')');
  return "ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Exact line/circle profile extrusion; one piece; millimetres'),'2;1');\nFILE_NAME('onderdeel.step',"+string(new Date().toISOString())+",(''),(''),'CRM','Maatwerkkunststof','');\nFILE_SCHEMA(('AUTOMOTIVE_DESIGN'));\nENDSEC;\nDATA;\n"+rows.join('\n')+'\nENDSEC;\nEND-ISO-10303-21;\n';
 }
 g.GasketV2StepExport={linearLoops,exportStep};
})(window);
