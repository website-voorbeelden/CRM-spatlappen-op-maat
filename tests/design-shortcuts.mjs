import assert from 'node:assert/strict';
import {designShortcut} from '../shared/design-shortcuts.js';
import {designMeasurements} from '../admin/product-designs.js';
for(const [key,action] of [['S','save'],['e','png'],['t','pdf']]){
 assert.equal(designShortcut({key,metaKey:true,shiftKey:true}),action);
 assert.equal(designShortcut({key,ctrlKey:true,shiftKey:true}),action);
 assert.equal(designShortcut({key,metaKey:true}),null);
 assert.equal(designShortcut({key,metaKey:true,shiftKey:true,altKey:true}),null);
}
assert.equal(designShortcut({key:'x',metaKey:true,shiftKey:true}),null);
for(const qty of ['',null,undefined,'  '])assert.deepEqual(designMeasurements({w:190,h:25,qty}),{width:1900,height:250,quantity:null});
assert.equal(designMeasurements({w:40,h:10,qty:'12'}).quantity,12);
for(const qty of ['0','-1','1.5','abc'])assert.throws(()=>designMeasurements({w:40,h:10,qty}));
console.log('✓ Ontwerpsneltoetsen en optioneel aantal: leeg blijft onbekend, ingevuld blijft gevalideerd.');
