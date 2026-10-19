(function(g){'use strict';
const sub=(a,b)=>a.map((n,i)=>n-b[i]),dot=(a,b)=>a.reduce((s,n,i)=>s+n*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>Math.hypot(...a),unit=a=>a.map(n=>n/norm(a));
function planarCandidates(result,format){if(!result?.success||!result.meshes?.length)throw Error('Het CAD-bestand kon niet als 3D-model worden gelezen.');
 if(result.meshes.length>100)throw Error('Gebruik één onderdeel, geen grote samenstelling.');const candidates=[];let total=0;
 for(let mi=0;mi<result.meshes.length;mi++){const mesh=result.meshes[mi],pos=mesh.attributes.position.array,indices=mesh.index.array;total+=indices.length;if(total>1500000)throw Error('Het model bevat te veel driehoeken.');const vertex=i=>pos.slice(3*i,3*i+3);
 for(let fi=0;fi<(mesh.brep_faces||[]).length;fi++){const face=mesh.brep_faces[fi];if(face.last-face.first>200000)continue;let origin=null,normal=null,basis=null,valid=true;const edges=new Map();let faceArea=0;
  const key=p=>p.map(n=>Math.round(n*1e6)).join(',');
  for(let t=face.first;t<=face.last;t++){const pts=indices.slice(3*t,3*t+3).map(vertex),ab=sub(pts[1],pts[0]),ac=sub(pts[2],pts[0]),c=cross(ab,ac),length=norm(c);if(length<1e-12)continue;const n=unit(c);if(!origin){origin=pts[0];normal=n;basis=unit(ab);}if(Math.abs(dot(n,normal))<1-1e-8||pts.some(p=>Math.abs(dot(sub(p,origin),normal))>1e-5)){valid=false;break;}faceArea+=length/2;
   for(let i=0;i<3;i++){const a=pts[i],b=pts[(i+1)%3],ka=key(a),kb=key(b);if(ka===kb)continue;const k=[ka,kb].sort().join('/');if(edges.has(k))edges.delete(k);else edges.set(k,[a,b]);}
  }
  if(!valid||!origin||faceArea<1e-6)continue;
  // Stable world-aligned basis where possible; arbitrary planar orientations remain supported.
  const axes=[[1,0,0],[0,1,0],[0,0,1]],axis=axes.find(a=>Math.abs(dot(a,normal))<.9);basis=unit(sub(axis,normal.map(n=>n*dot(axis,normal))));const vertical=cross(normal,basis),project=p=>[dot(sub(p,origin),basis),dot(sub(p,origin),vertical)];
  const lines=[...edges.values()].map(([a,b])=>g.CadV2.line(project(a),project(b)));if(lines.length>2000)continue;
  try{const pieces=g.CadV2.components(g.CadV2.stitch(lines),{format,approximation:.02});let low=Infinity,high=-Infinity;for(let i=0;i<pos.length;i+=3){const z=dot(sub(pos.slice(i,i+3),origin),normal);low=Math.min(low,z);high=Math.max(high,z);}pieces.forEach((p,i)=>candidates.push({...p,label:'Onderdeel '+(mi+1)+' · vlak '+(fi+1)+(pieces.length>1?' · contour '+(i+1):''),area:faceArea,depth:high-low}));}catch{/* Other supported planar faces may still provide a usable outline. */}
 }
 }
 candidates.sort((a,b)=>b.area-a.area);if(!candidates.length)throw Error('Geen bruikbaar vlak gevonden. Gebruik een vlakke plaat/pakking of exporteer een gesloten 2D-DXF.');
 return {candidates:candidates.slice(0,40),factor:1,warnings:['Kies het juiste vlak. Dit is een 2D-contour van dat vlak, geen automatische ontvouwing of volledige 3D-bewerking.','Gebogen randen zijn benaderd vanuit het CAD-model (meshinstelling 0,02 mm); controleer het voorbeeld en de dikte.']};
}
g.CadV2Step={planarCandidates};
})(typeof self!=='undefined'?self:window);
