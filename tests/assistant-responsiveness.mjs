import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
// Exercise the real refresh implementation: delayed speech must never block chat startup.
const source=await readFile(new URL('../admin/assistant.js',import.meta.url),'utf8');
const refresh=source.slice(source.indexOf(' async function refresh('),source.indexOf('\n async function login('));
const calls=[],nodes=new Map(),node=selector=>{if(!nodes.has(selector))nodes.set(selector,{});return nodes.get(selector);};
let releaseStatus,clock=100000,fail=false,visible=true;
const env={host:{},refreshing:false,lastRefresh:0,visible:()=>visible,Date:{now:()=>clock},activeId:null,models:[],modelId:'fake',session:null,pendingUrl:'',sessionTokens:0,poll:null,el:node,paintConnection(){},paintUsage(){},clearConversation(){},setInterval:()=>1,clearInterval(){},request:async path=>{calls.push(path);if(path==='status'){if(fail)throw Error('Offline');await new Promise(resolve=>releaseStatus=resolve);return {sharing:true,pending:false,profiles:[{id:'a',active:true}]};}if(path==='models')return {models:[{id:'fake'}]};throw Error('Spraakcontrole hoort niet bij chat openen.');}};
runInNewContext(refresh,env);
const first=env.refresh();await env.refresh();assert.deepEqual(calls,['status']);releaseStatus();await first;assert.deepEqual(calls,['status','models']);
for(let n=0;n<20;n++)await env.refresh();assert.equal(calls.length,2,'Herhaald openen/focus veroorzaakt geen nieuwe requests.');
clock+=16000;const aged=env.refresh();releaseStatus();await aged;assert.deepEqual(calls,['status','models','status'],'Modelcatalogus wordt hergebruikt.');
const forced=env.refresh({force:true});releaseStatus();await forced;assert.equal(calls.length,4,'Accountwijziging kan direct verversen.');
visible=false;clock+=20000;await env.refresh({force:true});assert.equal(calls.length,4);visible=true;fail=true;await env.refresh();assert.match(node('[data-ai-connection]').textContent,/Offline/);assert.equal(env.refreshing,false);assert.equal(node('[data-ai-send]').disabled,true);
fail=false;const retry=env.refresh();releaseStatus();await retry;assert.equal(env.refreshing,false);
console.log('✓ AI-start: geen wachttijd op spraak, één gelijktijdige statuscheck, 15s hergebruik, modelcatalogus behouden, geforceerde accountrefresh en herstel na fout.');
