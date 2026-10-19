import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../tools/costing-v2/',import.meta.url);
function runtime(v2=true){const c=vm.createContext({console,Set,Map,URLSearchParams,TextEncoder,TextDecoder,Buffer,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')});c.window=c;const files=v2?['assets/gasket-configurator-nesting.js','assets/gasket-configurator-core.js','geometry.js','assets/quote-calculator-core.js','rubber.js']:['assets/gasket-configurator-nesting.js','assets/quote-calculator-core.js'];for(const file of files)vm.runInContext(fs.readFileSync(new URL(file,v2?root:new URL('../tools/costing/',import.meta.url)),'utf8'),c);return c;}
const c=runtime(),C=c.QuoteCalculatorCore,G=c.GasketV2Geometry;
let s=C.normalizeState(C.defaultState()),p=s.pieces[0];
assert.equal(s.scenarios[0].rates['rubber epdm|3'].price,0);
assert.equal(C.calculate(s,c.GasketConfiguratorNesting).scenarios[0].priceComplete,false);
Object.assign(s.scenarios[0],{rubberAuto:true,rubberHourRate:6,rubberCutSpeed:1000,rubberSetupMinutes:.2,rubberPierceSeconds:.1});s.scenarios[0].rates['rubber epdm|3']={unit:'sheet',price:1};
assert.equal(G.validate(p).length,0);
assert.equal(G.cutLength(p),640);
p.holeCoordinates='-80; -40; 6\n80; -40; 6\n80; 40; 6\n-80; 40; 6';s=C.normalizeState(s);p=s.pieces[0];
assert.equal(p.holes,4);assert.equal(G.validate(p).length,0);
assert.ok(Math.abs(G.cutLength(p)-(640+24*Math.PI))<1e-8);
const dxf=G.dxf(p);assert.match(dxf,/\$INSUNITS\r\n70\r\n4/);assert.equal((dxf.match(/\r\nCIRCLE\r\n/g)||[]).length,4);
assert.match(dxf,/10\r\n-80\r\n20\r\n-40\r\n30\r\n0\r\n40\r\n3/);
assert.ok(G.svgShape(p,'green').includes('-83,40')); // same centre, SVG flips only Y.
for(const [coords,reason] of [['100; 0; 6','buitenrand'],['0; 0; 6\n1; 0; 6','overlappen'],['0; NaN; 6','Gatregel'],['0;0;-2','Gatregel'],['0;0;','Gatregel']]){const bad={...p,holeCoordinates:coords};assert.ok(G.validate(bad).some(e=>e.includes(reason)),coords);assert.throws(()=>G.dxf(bad));}
assert.ok(G.validate({...p,opening:'rect',innerWidth:100,innerHeight:60,holeCoordinates:'0; 0; 6'}).some(e=>e.includes('middenuitsparing')));
const l={...p,shape:'lshape',opening:'none',notchWidth:100,notchHeight:60,holeCoordinates:''};assert.equal(G.validate(l).length,0);assert.match(G.dxf(l),/LWPOLYLINE/);assert.ok(G.validate({...l,holeCoordinates:'40; 20; 6'}).some(e=>e.includes('buitenrand')));assert.equal(G.validate({...l,holeCoordinates:'-40;20;6'}).length,0);
const ring={...p,shape:'circle',outerDiameter:100,opening:'circle',innerDiameter:50,holeCoordinates:'35;0;6'};assert.equal(G.validate(ring).length,0);assert.equal((G.dxf(ring).match(/\r\nCIRCLE\r\n/g)||[]).length,3);
const rounded={...p,shape:'rect',cornerRadius:15,holeCoordinates:''};assert.equal((G.dxf(rounded).match(/\r\nARC\r\n/g)||[]).length,4);
const manhole={...p,shape:'manhole',opening:'rect',innerWidth:160,innerHeight:80,holeCoordinates:''};assert.equal(G.validate(manhole).length,0);
const result=C.calculate(s,c.GasketConfiguratorNesting);assert.equal(result.errors.length,0);const r=result.scenarios[0];assert.equal(r.errors.length,0);assert.equal(r.priceComplete,true);
const expectedMinutes=G.cutLength(p)/1000+5*.1/60+.2;
assert.ok(Math.abs(r.processCost-expectedMinutes/60*6)<1e-10);
const twice=structuredClone(s);twice.pieces[0].quantity=2;const two=C.calculate(twice,c.GasketConfiguratorNesting).scenarios[0];assert.ok(Math.abs(two.processCost-(2*(G.cutLength(p)/1000+5*.1/60)+.2)/60*6)<1e-10,'setup is once per request');
const thick=structuredClone(s);thick.pieces[0].thickness=5;const t=C.normalizeState(thick);assert.equal(t.scenarios[0].rates['rubber epdm|5'].price,0);
const manual=structuredClone(s);manual.scenarios[0].rubberAuto=false;manual.scenarios[0].processCosts.mill={mode:'per_piece',value:2,hourlyRate:50};assert.equal(C.calculate(manual,c.GasketConfiguratorNesting).scenarios[0].processCost,2);
const quote=structuredClone(s);quote.scenarios[0].costSource='quote_total';quote.scenarios[0].quotedTotal=12;assert.equal(C.calculate(quote,c.GasketConfiguratorNesting).scenarios[0].landedCost,12);
// Existing manual formula behavior stays exactly the same in V2 with valid, hole-free legacy input.
const old=runtime(false),base=old.QuoteCalculatorCore.defaultState();base.pieces[0].material='PE';base.scenarios[0].rates={'pe|10':{price:30,unit:'m2'}};const before=JSON.stringify(base),a=old.QuoteCalculatorCore.calculate(base,old.GasketConfiguratorNesting),b=C.calculate(base,c.GasketConfiguratorNesting);for(const k of ['materialCost','processCost','holeCost','landedCost','salePrice','marginPct'])assert.equal(a.scenarios[0][k],b.scenarios[0][k],k);assert.equal(JSON.stringify(base),before,'calculation is pure');
assert.equal(C.decodeState(C.encodeState(s)).pieces[0].holeCoordinates,p.holeCoordinates);
console.log('V2 geometry / DXF / coordinate validation / rubber / legacy calculations: passed');
// Free contours use exact vertices, reject self-intersections, and keep cutouts out of nesting.
const poly={...p,shape:'polygon',opening:'none',holeCoordinates:'',outlineCoordinates:'-100;-60\n100;-60\n100;0\n30;0\n30;60\n-100;60'};
let polyState=C.normalizeState({...s,pieces:[poly]});assert.equal(polyState.pieces[0].width,200);assert.equal(polyState.pieces[0].height,120);assert.equal(G.validate(polyState.pieces[0]).length,0);assert.equal(G.cutLength(polyState.pieces[0]),640);assert.match(G.dxf(polyState.pieces[0]),/LWPOLYLINE/);
assert.ok(G.validate({...poly,holeCoordinates:'50;40;6'}).some(e=>e.includes('buitenrand')));
assert.ok(G.parseOutline({...poly,outlineCoordinates:'-10;-10\n10;10\n-10;10\n10;-10'}).errors.length>0);
assert.ok(G.parseOutline({...poly,outlineCoordinates:'-10;-10\n10;-10\n0;-10\n10;10\n-10;10'}).errors.length>0);
assert.ok(G.validate({...p,shape:'rect',width:100,height:100,cornerRadius:50,opening:'rect',innerWidth:90,innerHeight:90,innerRadius:0,holeCoordinates:''}).some(e=>e.includes('buitenvorm')));
const fx=structuredClone(s);fx.scenarios[0].currency='TRY';fx.scenarios[0].exchangeRate=50;assert.ok(Math.abs(C.calculate(fx,c.GasketConfiguratorNesting).scenarios[0].processCost-r.processCost)<1e-10,'rubber workshop hourly rate remains EUR');
const unsupported=structuredClone(s);unsupported.pieces[0].thickness=7;unsupported.scenarios[0].rubberCutSpeed=null;assert.ok(C.calculate(unsupported,c.GasketConfiguratorNesting).scenarios[0].missingPrices.some(e=>e.includes('snijsnelheid')));
console.log('V2 free contours, exact containment and EUR workshop costs: passed');

const blankAuto=C.normalizeState(C.defaultState());blankAuto.scenarios[0].rubberAuto=true;const blank=C.normalizeState(blankAuto);assert.equal(blank.scenarios[0].rubberHourRate,null);assert.equal(blank.scenarios[0].rubberCutSpeed,null);assert.ok(!C.calculate(blank,c.GasketConfiguratorNesting).scenarios[0].priceComplete);assert.equal(Object.values(c.RubberV2.catalog).some(v=>'price' in v||'speed' in v),false);assert.equal(c.RubberV2.apply,undefined);console.log('No built-in prices/speeds, blank supplier rates and preserved explicit historical inputs: passed');

assert.equal(C.parseReadableUrl('?presentatie=leverancier&v=test'),null,'presentation/cache params cannot create unintended calculator input');
