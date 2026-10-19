(function(g){
 'use strict';
 const catalog=Object.fromEntries([1,2,3,4,5,6,8,10].map(t=>[t,{}]));
 const rubber=p=>/^(rubber|epdm|nbr|sbr)(\b|$)/i.test(p.material.trim());
 function normalize(state){state.pieces.forEach(p=>{
   if(p.shape==='polygon'){const pts=g.GasketV2Geometry.parseOutline(p).points;p.width=2*Math.max(0,...pts.map(pt=>Math.abs(pt[0])));p.height=2*Math.max(0,...pts.map(pt=>Math.abs(pt[1])));}
   let cadCount=0;if(p.shape==='cad'){const data=g.CadV2.read(p.cadGeometry),b=g.CadV2.bounds(data.loops);p.width=b.maxX-b.minX;p.height=b.maxY-b.minY;cadCount=data.loops.length-1;}
   p.holeMode=p.holeMode==='coordinates'?'coordinates':'schematic';
   p.holeCoordinates=String(p.holeCoordinates||'');
   p.notchWidth=Math.max(0,Number(p.notchWidth)||0);p.notchHeight=Math.max(0,Number(p.notchHeight)||0);
   if(p.holeMode==='coordinates')p.holes=g.GasketV2Geometry.parseHoles(p).holes.length+cadCount;
 });
 state.scenarios.forEach(s=>{if(!s.rubberAuto)return;
   s.rubberHourRate=s.rubberHourRate==null?null:Math.max(0,Number(s.rubberHourRate)||0);
   s.rubberSetupMinutes=s.rubberSetupMinutes==null?0:Math.max(0,Number(s.rubberSetupMinutes)||0);
   s.rubberPierceSeconds=s.rubberPierceSeconds==null?0:Math.max(0,Number(s.rubberPierceSeconds)||0);
   s.rubberCutSpeed=s.rubberCutSpeed==null?null:Math.max(0,Number(s.rubberCutSpeed)||0);
 });return state;}
 function costs(s,p,state){if(!s.rubberAuto||s.costSource!=='calculated')return null;
   const speed=s.rubberCutSpeed;
   if(!(speed>0))return {processCost:{mode:'per_piece',value:0,hourlyRate:0},holeCost:{mode:'per_hole',value:0,hourlyRate:0,performedBy:'supplier'}};
   const contours=1+(p.opening!=='none'?1:0)+p.holes;
   const qty=state.pieces.reduce((sum,p)=>sum+p.quantity,0);
   const minutes=g.GasketV2Geometry.cutLength(p)/speed+contours*s.rubberPierceSeconds/60+s.rubberSetupMinutes/qty;
   return {processCost:{mode:'minutes',value:minutes,hourlyRate:s.rubberHourRate/(g.QuoteCalculatorCore.exchangeFactor(s)||1)},holeCost:{mode:'per_hole',value:0,hourlyRate:0,performedBy:'supplier'}};
 }
 g.RubberV2={catalog,rubber,normalize,costs};
})(window);
