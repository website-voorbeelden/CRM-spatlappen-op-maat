/* Geometry only: centimetres, no saved design data or browser storage. */
(function(root){
 'use strict';
 const defaultRadius=(w,h)=>Math.round(Math.min(w,h))/10;
 const defaultShoulders=(w,h)=>({shoulderInset:Math.round(Math.min(w*.1,h*.2)*10)/10,shoulderTopH:Math.max(.1,Math.round(h*.2*10)/10)});
 const union=boxes=>boxes.length?{left:Math.min(...boxes.map(b=>b.left)),top:Math.min(...boxes.map(b=>b.top)),right:Math.max(...boxes.map(b=>b.right)),bottom:Math.max(...boxes.map(b=>b.bottom))}:null;
 const translate=(b,x,y)=>({left:b.left+x,right:b.right+x,top:b.top+y,bottom:b.bottom+y});
 const intersects=(a,b)=>a.left<=b.right&&a.right>=b.left&&a.top<=b.bottom&&a.bottom>=b.top;
 function snap(box,targets,tolerance){
  const axes=[['left','right'],['top','bottom']],out={dx:0,dy:0,guides:[]};
  axes.forEach(([start,end],axis)=>{
   const points=[box[start],(box[start]+box[end])/2,box[end]];let best=null;
   targets.forEach(target=>{
    const values=target.centerOnly?[(target[start]+target[end])/2]:[target[start],(target[start]+target[end])/2,target[end]];
    values.forEach(value=>points.forEach(point=>{const delta=value-point;if(Math.abs(delta)<=tolerance&&(!best||Math.abs(delta)<Math.abs(best.delta)))best={delta,value,target};}));
   });
   if(best){out[axis?'dy':'dx']=best.delta;out.guides.push({axis:axis?'y':'x',value:best.value});}
  });return out;
 }
 // Balance a smaller selection between an outside edge and a larger central mark.
 function equalSideSpace(box,targets,width,tolerance){
  const w=box.right-box.left;let best=null;
  for(const target of targets){
   const center=(target.left+target.right)/2;
   if(target.centerOnly||target.right-target.left<=w||Math.abs(center-width/2)>width*.2||box.bottom<target.top||box.top>target.bottom)continue;
   for(const side of ['left','right']){
    const start=side==='left'?0:target.right,end=side==='left'?target.left:width;
    if(end-start<w)continue;
    const left=(start+end-w)/2,delta=left-box.left;
    if(Math.abs(delta)>tolerance||(best&&Math.abs(delta)>=Math.abs(best.dx)))continue;
    const gap=(end-start-w)/2,y=(box.top+box.bottom)/2;
    best={dx:delta,guides:[{axis:'gap',start,end:left,y,gap},{axis:'gap',start:left+w,end,y,gap}]};
   }
  }return best;
 }
 function initialLogo(flap,ratio,index=0){
  ratio=Number.isFinite(ratio)&&ratio>0?ratio:1;
  const margin=Math.max(.5,Math.min(2,flap.h*.06)),w=Math.min(flap.w*.38,70,(flap.h-margin*2)*.75*ratio),h=w/ratio;
  // A bounded stagger makes a second import visible instead of hiding the first.
  const offset=index?Math.min(flap.w*.12,4)*(index%3===1?-1:1):0;
  return {w,h,x:Math.max(w/2,Math.min(flap.w-w/2,flap.w/2+offset))/flap.w,y:(flap.h-margin-h/2-Math.min(index,3)*margin*.4)/flap.h};
 }
 function previewHeight({w,h,availableWidth,viewportHeight,headerHeight=0,selectionHeight=0,mobile=false}){
  const min=mobile?134:200;
  const max=mobile?Math.max(min,Math.min(360,viewportHeight*.42)):Math.max(min,Math.min(520,viewportHeight-headerHeight-selectionHeight-56));
  return Math.round(Math.max(min,Math.min(max,availableWidth*h/Math.max(1,w)+(mobile?108:150))));
 }
 root.SpatlapLayout=Object.freeze({union,translate,intersects,snap,equalSideSpace,initialLogo,defaultRadius,defaultShoulders,previewHeight});
})(globalThis);
