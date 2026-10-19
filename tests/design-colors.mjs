import assert from 'node:assert/strict';
import {hexColor,rgbColor,rgbValues,samplePoint} from '../shared/design-colors.js';
assert.equal(hexColor('abc'),'#AABBCC');assert.equal(hexColor(' #ff6600 '),'#FF6600');assert.equal(hexColor('#abcd'),null);assert.equal(hexColor('red'),null);
assert.equal(rgbColor([255,0,16]),'#FF0010');assert.equal(rgbColor([256,0,0]),null);assert.equal(rgbColor([NaN,0,0]),null);assert.deepEqual(rgbValues('#00FF80'),[0,255,128]);assert.equal(rgbValues('nope'),null);
const rect={left:100,top:200,width:400,height:100};assert.deepEqual(samplePoint(300,250,rect,2000,500),{x:1000,y:250});assert.deepEqual(samplePoint(500,300,rect,2000,500),{x:1999,y:499});assert.equal(samplePoint(99,250,rect,2000,500),null);assert.equal(samplePoint(200,199,rect,2000,500),null);assert.equal(samplePoint(200,250,{...rect,width:0},2000,500),null);
console.log('✓ Selectiekleur: HEX/RGB-validatie, pipetmapping bij zoom/schaling, randen en buiten preview.');
