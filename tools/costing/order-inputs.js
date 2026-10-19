// Only production specifications cross into the calculator; never customer/contact fields.
export function orderInputs(base,item,specs={}){
 const seed=structuredClone(base),p=seed.pieces[0];seed.pieces=[p];
 const s={...specs,...item};p.quantity=item.quantity;
 if(!s.shape&&!s.diameter&&['circle','manhole'].includes(p.shape))s.shape=p.shape;
 if(['circle','round','rond','cirkel','schijf'].includes(s.shape)||s.diameter>0){p.process='mill';p.shape='circle';p.outerDiameter=s.diameter||item.width;p.innerDiameter=s.holeDiameter??p.innerDiameter??0;p.opening=p.innerDiameter>0?'circle':'none';}
 else {if(s.shape==='manhole'){p.process='mill';p.shape='manhole';}else{p.process=p.process==='mill'?'mill':'saw';p.shape='rect';}p.width=item.width??0;p.height=item.height??0;}
 if(s.thickness>0)p.thickness=s.thickness;
 if(typeof s.material==='string'&&s.material.trim())p.material=s.material.trim().slice(0,100);
 return seed;
}
export function productValues(record){const p=record.inputs.pieces[0],round=p.shape==='circle'||p.shape==='ring';return {quantity:record.result.quantity,width:round?p.outerDiameter:p.width,height:round?p.outerDiameter:p.height};}
