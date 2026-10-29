// Vector-area operations via locally bundled Paper.js, after an explicit action.
// Preserve layers and curves; unsupported geometry stays in the original SVG.
let vectorTopologyPromise;
function loadVectorTopology(){
 if(window.paper?.version==='0.12.18')return Promise.resolve(window.paper);
 return vectorTopologyPromise??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='admin/designs/vendor/paper-core-0.12.18.min.js?v=0.12.18';script.onload=()=>{if(window.paper?.version==='0.12.18')resolve(window.paper);else{vectorTopologyPromise=null;script.remove();reject(Error('De vectorbibliotheek kon niet worden geladen. Je logo is behouden.'));}};script.onerror=()=>{vectorTopologyPromise=null;script.remove();reject(Error('De lokale vectorbibliotheek kon niet worden geladen. Probeer opnieuw.'));};document.head.append(script);});
}
async function splitVectorIslands(markup,color,{isCurrent=()=>true}={}){
 const assertCurrent=()=>{if(!isCurrent())throw Error('Het logo of de spatlap is gewijzigd. Kies de kleur opnieuw; er is niets toegepast.');};
 assertCurrent();const root=SpatlapVectorExport.parseLogo(SpatlapVectorEditor.prepare(markup).markup),NS='http://www.w3.org/2000/svg';
 const library=await loadVectorTopology();assertCurrent();const scope=new library.PaperScope();scope.setup(new scope.Size(1,1));scope.view.autoUpdate=false;
 const ids=new Set([...root.querySelectorAll('[data-sp-piece]')].map(el=>el.getAttribute('data-sp-piece'))),byId=new Map([...root.querySelectorAll('[id]')].map(el=>[el.id,el]));
 let next=1,split=0,parts=0,joined=0,skipped=0,curves=0,clipped=0,clipOperations=0;
 const reasons=new Map(),shapes=new Set(['path','rect','circle','ellipse','polygon','polyline']);
 const opacity=value=>parseFloat(value)/(String(value).endsWith('%')?100:1);
 const localMatrix=el=>{const m=el.transform?.baseVal?.consolidate()?.matrix;return m?new DOMMatrix([m.a,m.b,m.c,m.d,m.e,m.f]):new DOMMatrix();};
 function matrixTo(el,stop){const chain=[];for(let node=el;node&&node!==stop;node=node.parentElement)chain.unshift(node);return chain.reduce((m,node)=>m.multiply(localMatrix(node)),new DOMMatrix());}
 function clipGeometry(owner){
  const value=owner.getAttribute('clip-path')||'none';if(value==='none')return null;
  const match=value.match(/^url\(\s*['"]?#([\w:.-]+)['"]?\s*\)$/),clip=match&&byId.get(match[1]);
  const units=clip?.getAttribute('clipPathUnits')||'userSpaceOnUse';
  if(!clip||clip.localName!=='clipPath'||!['userSpaceOnUse','objectBoundingBox'].includes(units))return {reason:'onbekende uitsnedes'};
  if(units==='objectBoundingBox'&&(!shapes.has(owner.localName)||!owner.hasAttribute('data-sp-geometry')))return {reason:'relatieve uitsnedes op groepen'};
  const leaves=[...clip.querySelectorAll('*')].filter(el=>shapes.has(el.localName));
  if(!leaves.length||leaves.length>32||[clip,...clip.querySelectorAll('*')].some(el=>(el!==clip&&!shapes.has(el.localName)&&el.localName!=='g')||(el.getAttribute('clip-path')||'none')!=='none'||(el.getAttribute('display')||'')==='none'||(el.getAttribute('visibility')||'')==='hidden'))return {reason:'samengestelde of verborgen uitsnedes'};
  // Relative clip geometry must use fractions, not viewport-relative lengths.
  if(units==='objectBoundingBox'&&[clip,...clip.querySelectorAll('*')].some(el=>[...el.attributes].some(attr=>['x','y','width','height','cx','cy','r','rx','ry','x1','x2','y1','y2'].includes(attr.name)&&!/^[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?$/i.test(attr.value))))return {reason:'relatieve uitsnedes met lengtematen of percentages'};
  return {owner,clip,leaves,units};
 }
 function candidate(piece,opaque=false){
  if(!piece?.hasAttribute('data-sp-piece')||piece.closest('defs,clipPath'))return null;
  const shape=piece.children[0],hasColour=[...piece.querySelectorAll('[data-sp-geometry]')].some(el=>['fill','stroke'].some(channel=>SpatlapVectorEditor.colour(el.getAttribute(channel))===color));
  if(piece.children.length!==1||!shape?.hasAttribute('data-sp-geometry')||!shapes.has(shape.localName))return hasColour?{reason:'lijnen of gegroepeerde vormen'}:null;
  if(SpatlapVectorEditor.colour(shape.getAttribute('fill'))!==color)return SpatlapVectorEditor.colour(shape.getAttribute('stroke'))===color?{reason:'lijnkleuren'}:null;
  if(shape.getAttribute('stroke')!=='none')return {reason:'vormen met lijnen'};
  const clips=[];
  for(let el=shape;el;el=el.parentElement){
   if(el!==root&&el.localName==='svg')return {reason:'geneste SVG-kaders'};
   if(el.getAttribute('display')==='none'||el.getAttribute('visibility')==='hidden'||opacity(el.getAttribute('opacity')||'1')<=0)return {reason:'verborgen vormen'};
   if(opaque&&Math.abs(opacity(el.getAttribute('opacity')||'1')-1)>1e-8)return null;
   const clip=clipGeometry(el);if(clip?.reason)return clip;if(clip)clips.push(clip);
   if(el===root)break;
  }
  if(opacity(shape.getAttribute('fill-opacity')||'1')<=0||paintAlpha(shape.getAttribute('fill'))<=0)return {reason:'onzichtbare vullingen'};
  if(opaque&&(Math.abs(opacity(shape.getAttribute('fill-opacity')||'1')-1)>1e-8||paintAlpha(shape.getAttribute('fill'))<1))return null;
  return {shape,clips};
 }
 function skip(reason){skipped++;reasons.set(reason,(reasons.get(reason)||0)+1);}
 function importShape(shape,matrix,rule){
  const copy=shape.cloneNode(false);copy.removeAttribute('transform');copy.removeAttribute('clip-path');copy.setAttribute('fill','black');copy.setAttribute('stroke','none');copy.setAttribute('opacity','1');copy.setAttribute('fill-opacity','1');copy.setAttribute('fill-rule',rule||'nonzero');
  const source=scope.project.importSVG(copy,{insert:false,expandShapes:true,applyMatrix:true});
  if(!source||!['Path','CompoundPath'].includes(source.className))throw Error('Een SVG-onderdeel kon niet als contour worden gelezen. Je logo is behouden.');
  const count=source.curves.length;curves+=count;if(count>1500||curves>6000)throw Error('Dit logo heeft te veel contourpunten voor deze bewerking. Gebruik een eenvoudiger SVG; het origineel is behouden.');
  source.transform(new scope.Matrix(matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f));source.fillRule=rule||'nonzero';source.fillColor='black';return source;
 }
 function bounded(area){if(area.curves.length>10000)throw Error('Dit logo levert te veel segmenten op. Het origineel is behouden.');return area;}
 function imported(piece,info){
  let area=importShape(info.shape,new DOMMatrix(),info.shape.getAttribute('fill-rule'));
  const box={x:area.bounds.x,y:area.bounds.y,width:area.bounds.width,height:area.bounds.height};
  const shapeMatrix=matrixTo(info.shape,root);area.transform(new scope.Matrix(shapeMatrix.a,shapeMatrix.b,shapeMatrix.c,shapeMatrix.d,shapeMatrix.e,shapeMatrix.f));
  let prior=area;area=bounded(area.unite(area,{insert:false}));prior.remove();
  for(const entry of info.clips){
   if(++clipOperations>64)throw Error('Dit logo heeft te veel uitsnedes voor deze bewerking. Je oorspronkelijke logo is behouden.');
   let clipArea=null;
   for(const leaf of entry.leaves){
    let ownerMatrix=matrixTo(entry.owner,root);
    if(entry.units==='objectBoundingBox'){if(![box.x,box.y,box.width,box.height].every(Number.isFinite)||box.width<=0||box.height<=0)throw Error('Deze relatieve uitsnede heeft geen geldig bronkader. Het origineel is behouden.');ownerMatrix=ownerMatrix.multiply(new DOMMatrix([box.width,0,0,box.height,box.x,box.y]));}
    const transform=ownerMatrix.multiply(matrixTo(leaf,entry.clip.parentElement));
    const source=importShape(leaf,transform,leaf.getAttribute('clip-rule')||'nonzero');
    if(!clipArea){clipArea=source;continue;}prior=clipArea;clipArea=bounded(prior.unite(source,{insert:false}));prior.remove();source.remove();
   }
   prior=area;area=bounded(prior.intersect(clipArea,{insert:false}));prior.remove();clipArea.remove();
  }
  return area;
 }
 function components(item){
  item.reorient(item.fillRule==='nonzero',true);const paths=item.className==='CompoundPath'?[...item.children]:[item];
  const outers=paths.filter(path=>path.clockwise&&Math.abs(path.area)>0),holes=paths.filter(path=>!path.clockwise&&Math.abs(path.area)>0),groups=outers.map(path=>({outer:path,paths:[path]}));
  if(!groups.length)return [];
  for(const hole of holes){const point=hole.firstSegment.point,parents=groups.filter(group=>group.outer.contains(point)).sort((a,b)=>Math.abs(a.outer.area)-Math.abs(b.outer.area));if(!parents.length)throw Error('De gaten van dit logo konden niet betrouwbaar worden gegroepeerd. Het origineel is behouden.');parents[0].paths.push(hole);}
  let merged=true;while(merged){merged=false;outer:for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(groups[i].paths.some(a=>groups[j].paths.some(b=>a.bounds.intersects(b.bounds)&&a.getIntersections(b).length))){groups[i].paths.push(...groups[j].paths);groups.splice(j,1);merged=true;break outer;}}
  return groups.map(group=>group.paths.map(path=>path.getPathData(null,12)).join(' '));
 }
 try{
  const pieces=[...root.querySelectorAll('g[data-sp-piece]')];if(pieces.length>512)throw Error('Dit logo heeft meer dan 512 onderdelen. Gebruik een eenvoudiger SVG.');
  // A fully opaque, unclipped single-colour logo has no intervening paint
  // layers to preserve. Join its contours across harmless group boundaries.
  const monochrome=pieces.length>1&&pieces.every(piece=>{const info=candidate(piece,true);return info&&!info.reason&&!info.clips.length;});
  const seen=new Set();
  for(const piece of pieces){
   assertCurrent();if(seen.has(piece)||!piece.parentElement)continue;
   const info=candidate(piece);if(!info)continue;if(info.reason){skip(info.reason);continue;}
   const run=monochrome?pieces.map(piece=>({piece,info:candidate(piece,true)})):[{piece,info}];let following=monochrome?null:piece.nextElementSibling;
   while(candidate(piece,true)&&following){const nextInfo=candidate(following,true);if(!nextInfo||nextInfo.reason)break;run.push({piece:following,info:nextInfo});following=following.nextElementSibling;}
   run.forEach(entry=>seen.add(entry.piece));let area=imported(piece,info);
   for(const entry of run.slice(1)){const source=imported(entry.piece,entry.info),prior=area;area=bounded(prior.unite(source,{insert:false}));prior.remove();source.remove();}
   // Work in root coordinates, then return contours to their original parent.
   // This keeps transformed ancestors and the paint order exactly where they were.
   const inverse=matrixTo(monochrome?root:piece.parentElement,root).inverse();
   if(![inverse.a,inverse.b,inverse.c,inverse.d,inverse.e,inverse.f].every(Number.isFinite))throw Error('Deze SVG heeft een ongeldige transformatie. Het origineel is behouden.');
   area.transform(new scope.Matrix(inverse.a,inverse.b,inverse.c,inverse.d,inverse.e,inverse.f));
   const data=components(area),hasClips=run.some(entry=>entry.info.clips.length);
   if(!data.length){skip('geen zichtbaar gevuld oppervlak');area.remove();continue;}
   if(data.length>512)throw Error('Deze kleur heeft meer dan 512 losse segmenten. Het origineel is behouden.');
   if(run.length===1&&data.length===1&&!hasClips){area.remove();continue;}
   const copies=data.map((d,index)=>{
    const group=piece.cloneNode(false),path=document.createElementNS(NS,'path');group.removeAttribute('id');group.removeAttribute('transform');group.removeAttribute('clip-path');
    let id=index===0?piece.getAttribute('data-sp-piece'):null;if(!id){while(ids.has('p'+next))next++;id='p'+next++;ids.add(id);}
    group.setAttribute('data-sp-piece',id);group.setAttribute('data-sp-x','0');group.setAttribute('data-sp-y','0');path.setAttribute('data-sp-geometry','1');path.setAttribute('d',d);
    for(const attr of ['fill','fill-opacity','opacity','visibility','display'])if(info.shape.hasAttribute(attr))path.setAttribute(attr,info.shape.getAttribute(attr));
    path.setAttribute('fill-rule','nonzero');path.setAttribute('stroke','none');group.append(path);return group;
   });
   if(root.querySelectorAll('[data-sp-piece]').length-run.length+copies.length>512)throw Error('Deze bewerking zou meer dan 512 onderdelen maken. Je oorspronkelijke logo is behouden.');
   if(monochrome){let anchor=piece;while(anchor.parentElement!==root)anchor=anchor.parentElement;anchor.before(...copies);for(const entry of run)entry.piece.remove();}
   else{piece.replaceWith(...copies);for(const entry of run.slice(1))entry.piece.remove();}
   split++;parts+=copies.length;joined+=Math.max(0,run.length-copies.length);if(hasClips)clipped+=run.length;area.remove();
   await previewPaintTick();
  }
  assertCurrent();return {root,split,parts,joined,skipped,clipped,reasons:[...reasons].map(([reason,count])=>count+'× '+reason)};
 }finally{scope.project.remove();scope.remove();}
}
