import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const root=new URL('../tools/costing-v2/',import.meta.url),c=vm.createContext({console,Set,Map});c.window=c;c.self=c;
for(const f of ['cad-core.js','assets/gasket-configurator-core.js','geometry.js','assets/quote-calculator-core.js','rubber.js','packing-controls.js'])vm.runInContext(fs.readFileSync(new URL(f,root),'utf8'),c);
const G=c.GasketV2Geometry,C=c.QuoteCalculatorCore,P=c.PackingV2;let p=C.normalizeState(C.defaultState()).pieces[0],original=JSON.stringify(p);
const four=P.pattern(p,4);assert.ok(!four.error);p={...p,holeCoordinates:four.text};assert.equal(G.parseHoles(p).holes.length,4);assert.equal(G.validate(p).length,0);assert.equal(P.maximum(p,0),12);
assert.ok(P.proposed(p,0,'x',100).error);assert.ok(P.proposed(p,0,'d',13).error);assert.ok(P.proposed(p,0,'d',0).error);assert.ok(!P.proposed(p,0,'d',12).error);const before=JSON.stringify(p);P.proposed(p,0,'y',1e9);assert.equal(JSON.stringify(p),before,'rejected movement never mutates input');
const hs=P.holes(p);assert.ok(P.proposed(p,0,'x',hs[1].x).error,'two holes on same Y cannot overlap');const moved=P.proposed(p,0,'x',hs[0].x+1);assert.equal(G.validate({...p,holeCoordinates:moved.text}).length,0);
const edge={...p,holeCoordinates:'95;0;6'};assert.ok(P.maximum(edge,0)<10);assert.ok(P.proposed(edge,0,'d',10).error,'touching outside boundary is rejected');assert.ok(P.proposed(edge,0,'x',98).error);
const ring={...p,shape:'circle',outerDiameter:100,opening:'circle',innerDiameter:60,holeCoordinates:''};const ringFour=P.pattern(ring,4);assert.ok(!ringFour.error);assert.equal(G.validate({...ring,holeCoordinates:ringFour.text}).length,0);const ringAdd=P.add({...ring,holeCoordinates:ringFour.text});assert.ok(!ringAdd.error);assert.equal(G.parseHoles({...ring,holeCoordinates:ringAdd.text}).holes.length,5);assert.equal(G.validate({...ring,holeCoordinates:ringAdd.text}).length,0);
const tiny={...p,width:.2,height:.2,holeCoordinates:''};assert.ok(P.pattern(tiny,4).error);assert.ok(P.add(tiny).error);assert.equal(P.pattern(p,0).text,'');assert.equal(original,JSON.stringify(C.normalizeState(C.defaultState()).pieces[0]).replace(/piece-\d+/,JSON.parse(original).id),'pure defaults apart from allocated ID');
console.log('Friendly hole controls: safe patterns/rings, add/move/diameter caps, edge/overlap guards and purity passed.');

c.document={addEventListener(){}};vm.runInContext(fs.readFileSync(new URL('bolt-circle.js',root),'utf8'),c);
const base=C.normalizeState(C.defaultState()).pieces[0],round={...base,shape:'circle',outerDiameter:160,opening:'none',holeCoordinates:'',holes:0};
const central=P.variant(round,'center');assert.ok(!central.error);assert.equal(central.piece.opening,'circle');assert.equal(central.piece.id,round.id);assert.equal(central.piece.material,round.material);
const bolt=P.variant(central.piece,'bolt');assert.ok(!bolt.error);assert.equal(P.holes(bolt.piece).length,4);assert.equal(G.validate(bolt.piece).length,0);const detected=P.circular(bolt.piece);assert.equal(detected.count,4);assert.ok(detected.spacing>central.piece.innerDiameter);
const markup=P.controls(bolt.piece,0);assert.ok(markup.includes('data-circle-field="count"'));assert.ok(!markup.includes('data-hole-field'));assert.ok(!markup.includes('Vier gaten'));
assert.ok(!P.extraHoles(bolt.piece,0).includes('v2-hole-row'));assert.equal((P.extraHoles(bolt.piece,0,true).match(/class="v2-hole-row"/g)||[]).length,4);
const altered={...bolt.piece,holeCoordinates:P.proposed(bolt.piece,0,'x',P.holes(bolt.piece)[0].x+1).text};assert.equal(P.circular(altered),null,'Geen los gat stil omzetten in een boutcirkel.');
for(const shape of ['rect','manhole']){const piece={...base,shape,opening:'none',holeCoordinates:'',holes:0},frame=P.variant(piece,'center');assert.ok(!frame.error);assert.equal(frame.piece.opening,'rect');assert.equal(G.validate(frame.piece).length,0);assert.equal(frame.piece.quantity,piece.quantity);}
assert.equal((P.shapes(base,0).match(/data-action="piece-preset"/g)||[]).length,3);assert.match(P.shapes(base,0),/Vierkant.*Rond.*Mangat/);
console.log('✓ Drie hoofdvormen, veilige vervolgkeuzes, inline boutcirkel zonder X/Y per gat, lazy losse-gatvelden en behoud van bronvorm en stukidentiteit.');
