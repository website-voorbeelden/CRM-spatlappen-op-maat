// Exact vector-area operations via the locally bundled Paper.js library.
// Only an explicit action loads it; no remote SVGs, raster tracing or provider calls.
let vectorTopologyPromise;
function loadVectorTopology(){
 if(window.paper?.version==='0.12.18')return Promise.resolve(window.paper);
 return vectorTopologyPromise??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='admin/designs/vendor/paper-core-0.12.18.min.js?v=0.12.18';script.onload=()=>{if(window.paper?.version==='0.12.18')resolve(window.paper);else{vectorTopologyPromise=null;script.remove();reject(Error('De vectorbibliotheek kon niet worden geladen. Je logo is behouden.'));}};script.onerror=()=>{vectorTopologyPromise=null;script.remove();reject(Error('De lokale vectorbibliotheek kon niet worden geladen. Probeer opnieuw.'));};document.head.append(script);});
}
async function splitVectorIslands(markup,color){
 const root=SpatlapVectorExport.parseLogo(SpatlapVectorEditor.prepare(markup).markup),NS='http://www.w3.org/2000/svg';
 const library=await loadVectorTopology(),scope=new library.PaperScope();scope.setup(new scope.Size(1,1));scope.view.autoUpdate=false;
 const ids=new Set([...root.querySelectorAll('[data-sp-piece]')].map(el=>el.getAttribute('data-sp-piece')));let next=1,split=0,parts=0,joined=0,skipped=0,curves=0;
 const opacity=value=>parseFloat(value)/(String(value).endsWith('%')?100:1);
 function eligible(piece,opaque=false){
  const shape=piece.children[0];if(!piece.hasAttribute('data-sp-piece')||piece.children.length!==1||!shape?.hasAttribute('data-sp-geometry')||!['path','rect','circle','ellipse','polygon','polyline'].includes(shape.localName)||piece.closest('defs,clipPath')||SpatlapVectorEditor.colour(shape.getAttribute('fill'))!==color)return null;
  if(shape.getAttribute('stroke')!=='none'||shape.getAttribute('fill')?.includes('url(')||shape.getAttribute('fill')==='transparent')return null;
  for(let el=shape;el;el=el.parentElement){if(el!==root&&el.localName==='svg'||el.getAttribute('display')==='none'||el.getAttribute('visibility')==='hidden'||(el.getAttribute('clip-path')||'none')!=='none'||opacity(el.getAttribute('opacity')||'1')<=0||opaque&&Math.abs(opacity(el.getAttribute('opacity')||'1')-1)>1e-8)return null;if(el===root)break;}
  if(opacity(shape.getAttribute('fill-opacity')||'1')<=0||paintAlpha(shape.getAttribute('fill'))<=0||opaque&&(Math.abs(opacity(shape.getAttribute('fill-opacity')||'1')-1)>1e-8||paintAlpha(shape.getAttribute('fill'))<1))return null;
  return shape;
 }
 function imported(piece){
  const shape=eligible(piece),source=scope.project.importSVG(shape.cloneNode(true),{insert:false,expandShapes:true,applyMatrix:true});
  if(!source||!['Path','CompoundPath'].includes(source.className))throw Error('Een SVG-onderdeel kon niet als contour worden gelezen. Het logo is behouden.');
  const count=source.curves.length;curves+=count;if(count>1500||curves>6000)throw Error('Dit logo heeft te veel contourpunten voor deze bewerking. Gebruik een eenvoudiger SVG; het origineel is behouden.');
  const transform=piece.transform?.baseVal?.consolidate()?.matrix;if(transform)source.transform(new scope.Matrix(transform.a,transform.b,transform.c,transform.d,transform.e,transform.f));
  source.fillRule=shape.getAttribute('fill-rule')||'nonzero';source.fillColor='black';return source;
 }
 function components(item){
  // Boolean preparation resolves crossings and winding. Outer contours are
  // clockwise; every hole belongs to its smallest containing outer contour.
  item.reorient(item.fillRule==='nonzero',true);const paths=item.className==='CompoundPath'?[...item.children]:[item];
  const outers=paths.filter(path=>path.clockwise&&Math.abs(path.area)>0),holes=paths.filter(path=>!path.clockwise&&Math.abs(path.area)>0),groups=outers.map(path=>({outer:path,paths:[path]}));
  if(!groups.length)throw Error('Deze kleur levert geen gesloten gevuld oppervlak op. Het logo is behouden.');
  for(const hole of holes){const point=hole.firstSegment.point,parents=groups.filter(group=>group.outer.contains(point)).sort((a,b)=>Math.abs(a.outer.area)-Math.abs(b.outer.area));if(!parents.length)throw Error('De gaten van dit logo konden niet betrouwbaar worden gegroepeerd. Het origineel is behouden.');parents[0].paths.push(hole);}
  // Touching outer contours are a single selectable component too.
  let merged=true;while(merged){merged=false;outer:for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(groups[i].paths.some(a=>groups[j].paths.some(b=>a.bounds.intersects(b.bounds)&&a.getIntersections(b).length))){groups[i].paths.push(...groups[j].paths);groups.splice(j,1);merged=true;break outer;}}
  return groups.map(group=>group.paths.map(path=>path.getPathData(null,12)).join(' '));
 }
 try{
  const pieces=[...root.querySelectorAll('g[data-sp-piece]')];if(pieces.length>512)throw Error('Dit logo heeft meer dan 512 onderdelen. Gebruik een eenvoudiger SVG.');
  const seen=new Set();
  for(const piece of pieces){
   if(seen.has(piece)||!piece.parentElement)continue;const shape=eligible(piece);if(!shape){if(piece.querySelector('[data-sp-geometry]'))skipped++;continue;}
   const run=[piece];let following=piece.nextElementSibling;while(eligible(piece,true)&&following&&eligible(following,true)){run.push(following);following=following.nextElementSibling;}
   run.forEach(item=>seen.add(item));
   let area=imported(run[0]);area=area.unite(area,{insert:false});for(const other of run.slice(1)){const source=imported(other),prior=area;area=area.unite(source,{insert:false});prior.remove();source.remove();}
   if(area.curves.length>10000)throw Error('Dit logo levert te veel segmenten op. Het origineel is behouden.');
   const data=components(area);if(data.length>512)throw Error('Deze kleur heeft meer dan 512 losse segmenten. Het origineel is behouden.');if(run.length===1&&data.length===1){area.remove();continue;}
   const copies=data.map((d,index)=>{const group=piece.cloneNode(false),path=document.createElementNS(NS,'path');group.removeAttribute('id');group.removeAttribute('transform');let id=index===0?piece.getAttribute('data-sp-piece'):null;if(!id){while(ids.has('p'+next))next++;id='p'+next++;ids.add(id);}group.setAttribute('data-sp-piece',id);group.setAttribute('data-sp-x','0');group.setAttribute('data-sp-y','0');path.setAttribute('data-sp-geometry','1');path.setAttribute('d',d);for(const attr of ['fill','fill-opacity','opacity','visibility','display'])if(shape.hasAttribute(attr))path.setAttribute(attr,shape.getAttribute(attr));path.setAttribute('fill-rule','nonzero');path.setAttribute('stroke','none');group.append(path);return group;});
   piece.replaceWith(...copies);for(const other of run.slice(1))other.remove();split++;parts+=copies.length;joined+=Math.max(0,run.length-copies.length);area.remove();
   await previewPaintTick();
  }
  return {root,split,parts,joined,skipped};
 }finally{scope.project.remove();scope.remove();}
}
