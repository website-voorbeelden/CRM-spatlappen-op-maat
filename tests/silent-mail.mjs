import assert from 'node:assert/strict';
import {request} from '../admin/mail-inbox.js';
import {loading} from '../admin/loading.js';
const originalFetch=globalThis.fetch,originalRun=loading.run;let indicators=0,requests=0;
loading.run=async(label,task)=>{indicators++;return task();};globalThis.fetch=async()=>{requests++;return Response.json({messages:[]});};
try{await request('list',{}, {background:true});await request('thread',{}, {background:true});assert.equal(indicators,0);assert.equal(requests,2);await request('list',{});assert.equal(indicators,1);globalThis.fetch=async()=>Response.json({error:'Fictieve quota-fout'},{status:429});await assert.rejects(()=>request('list',{}, {background:true}),/quota-fout/);assert.equal(indicators,1);}finally{globalThis.fetch=originalFetch;loading.run=originalRun;}
console.log('✓ Achtergrond-Gmail: lijst en thread zonder laadindicator, handmatig ophalen met laadfeedback; fouten blijven fouten, geen echte providerrequests.');
