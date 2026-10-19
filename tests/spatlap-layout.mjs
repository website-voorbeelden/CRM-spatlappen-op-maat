import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({});vm.runInContext(await readFile('shared/spatlap-layout.js','utf8'),context);const layout=context.SpatlapLayout;
const b={left:10,right:30,top:5,bottom:15};
assert.equal(layout.intersects(b,{left:29,right:40,top:14,bottom:30}),true);
assert.equal(layout.intersects(b,{left:31,right:40,top:14,bottom:30}),false);
assert.equal(layout.union([b,{left:-1,right:12,top:8,bottom:20}]).left,-1);
const snap=layout.snap(b,[{left:31,right:60,top:15.3,bottom:25}],1.1);assert.equal(snap.dx,1);assert.ok(Math.abs(snap.dy-.3)<1e-8);assert.equal(snap.guides.length,2);
assert.equal(layout.snap(b,[{left:33,right:60,top:30,bottom:40}],1).guides.length,0);
assert.equal(layout.snap(b,[{left:0,right:41,top:0,bottom:20,centerOnly:true}],1).dx,.5);
for(const flap of [{w:190,h:25},{w:40,h:60},{w:10,h:5}])for(const ratio of [.01,.2,1,10,100]){
 const p=layout.initialLogo(flap,ratio);assert.ok(p.w>0&&p.h>0);assert.ok(p.w<=flap.w&&p.h<flap.h);assert.ok(p.y*flap.h+p.h/2<flap.h);assert.ok(Math.abs(p.w/p.h-ratio)<1e-6);assert.equal(p.x,.5);
}
assert.notEqual(layout.initialLogo({w:190,h:25},4,1).x,.5);
console.log('✓ Preview: intersection, group bounds, nearest snap, centre axes and bounded import ratios.');

// Follow editor script references after source extraction; this fixture is only run when checks are requested.
const html=await readFile("spatlap-preview.html","utf8");
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/type=["']module["']/.test(match[1]))continue;
 const src=match[1].match(/src=["']([^"']+)["']/)?.[1]?.split('?')[0];
 if(src&&!src.startsWith('admin/designs/editor/'))continue;
 new vm.Script(src?await readFile(src,'utf8'):match[2],{filename:src||'spatlap-preview-inline.js'});
}

assert.equal(layout.defaultRadius(190,25),2.5);assert.equal(layout.defaultRadius(40,10),1);assert.equal(layout.defaultRadius(20,60),2);

const mobileFrame={availableWidth:300,viewportHeight:844,mobile:true};
const wideHeight=layout.previewHeight({...mobileFrame,w:190,h:25}),squareHeight=layout.previewHeight({...mobileFrame,w:50,h:50});
assert.ok(wideHeight<squareHeight);assert.ok(squareHeight<=360&&squareHeight<=Math.ceil(844*.42));assert.ok(layout.previewHeight({...mobileFrame,w:10,h:1000})<=360);
assert.ok(layout.previewHeight({...mobileFrame,viewportHeight:320,w:50,h:50})<=135);
assert.ok(layout.previewHeight({availableWidth:700,viewportHeight:720,headerHeight:58,selectionHeight:150,w:50,h:50})<=456);
