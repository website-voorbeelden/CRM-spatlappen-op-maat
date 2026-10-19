import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {pbkdf2Sync} from 'node:crypto';
import {handleAuth,authenticated} from '../cloudflare/auth.js';
import {onRequest as middleware} from '../functions/_middleware.js';
import {handleTikkie,exportJournal} from '../cloudflare/tikkie.js';
import {handleCrm} from '../cloudflare/api.js';
import {handleDocuments} from '../cloudflare/documents.js';

// Real SQLite SQL; isolated memory database, dummy credentials and mocked providers.
const sql=new DatabaseSync(':memory:');
for(const name of ['0001_crm.sql','0002_login_tikkie.sql'])sql.exec(await readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));
class Query{
  constructor(query){this.query=query;this.args=[];}
  bind(...args){this.args=args;return this;}
  async first(){return sql.prepare(this.query).get(...this.args)||null;}
  async all(){return {results:sql.prepare(this.query).all(...this.args)};}
  async run(){return {meta:sql.prepare(this.query).run(...this.args)};}
}
const DB={prepare:query=>new Query(query),async batch(queries){sql.exec('BEGIN');try{const results=queries.map(q=>{const s=sql.prepare(q.query);return s.columns().length?{results:s.all(...q.args)}:{results:[],meta:s.run(...q.args)};});sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
const salt='12345678901234567890123456789012',password='Only a synthetic test password';
const env={DB,CRM_ALLOWED_EMAIL:'test@example.invalid',CRM_PASSWORD_HASH:'pbkdf2-sha256$100000$'+salt+'$'+pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex'),TIKKIE_API_KEY:'dummy-key',TIKKIE_APP_TOKEN:'dummy-token',CRM_DOCUMENT_SERVICE_URL:'https://dummy.onrender.com',CRM_DOCUMENT_SERVICE_TOKEN:'a'.repeat(64),CRM_FILES:{}};
const request=(path,body,headers={})=>new Request('https://crm.example.invalid'+path,{method:body===undefined?'GET':'POST',headers:{Origin:'https://crm.example.invalid','Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});
const gated=async(req,overrides={})=>middleware({request:req,env:{...env,...overrides},next:async()=>new Response('private')});
assert.equal((await gated(request('/admin/'))).status,302);
assert.equal((await gated(request('/api/crm/config'))).status,401);
for(const path of ['/api/crm/offline-grant','/api/crm/commit-status?id=test'])assert.equal((await gated(request(path))).status,401);
for(const path of ['/crm-offline-sw.js','/admin/offline/index.html','/admin/offline/client.js'])assert.equal((await gated(request(path))).status,200,'offline static code contains no private state');
assert.equal((await gated(request('/api/crm/website-analytics'))).status,401,'website reports require CRM authentication');
assert.equal((await gated(request('/__local/documents/render',{}))).status,401);
assert.equal((await gated(request('/__local/documents/preview',{}))).status,401);
assert.equal((await gated(request('/login.js'))).status,200);
for(const path of ['/login.html','/login'])assert.equal((await gated(request(path))).status,200,'Pages clean login URL must stay public to prevent redirect loops');
assert.equal((await gated(request('/admin/'),{CRM_LOCAL_DEV:'true'})).status,302,'local bypass cannot work at production hostname');
assert.equal((await gated(request('/admin/'),{CRM_PASSWORD_HASH:''})).status,503);
assert.equal((await gated(request('/auth/login',{}, {Origin:'https://another.invalid'}))).status,403);
const login=body=>handleAuth({request:request('/auth/login',body),env});
assert.equal((await login({email:env.CRM_ALLOWED_EMAIL,password:'wrong'})).status,401);
const logged=await login({email:'TEST@EXAMPLE.INVALID',password,remember:true});assert.equal(logged.status,200);
const setCookie=logged.headers.get('Set-Cookie');for(const fragment of ['__Host-crm_session=','HttpOnly','Secure','SameSite=Lax','Max-Age=2592000'])assert.ok(setCookie.includes(fragment));
const cookie=setCookie.split(';')[0],signed=path=>request(path,undefined,{Cookie:cookie});
assert.equal((await gated(signed('/admin/'))).status,200);
assert.equal((await authenticated(signed('/admin/'),env)).email,env.CRM_ALLOWED_EMAIL);
assert.equal(await authenticated(signed('/admin/'),{...env,CRM_PASSWORD_HASH:env.CRM_PASSWORD_HASH.slice(0,-1)+'0'}),null,'password rotation invalidates old session');
const grant=await (await handleCrm({request:signed('/api/crm/offline-grant'),env})).json();assert.match(grant.owner,/^[a-f0-9]{64}$/);assert.equal(grant.companyId,'spatlappen');assert.ok(grant.expiresAt>Date.now()+23*3600000);assert.equal((await handleCrm({request:request('/api/crm/offline-grant'),env})).status,401);
const row=sql.prepare('SELECT * FROM crm_sessions').get();assert.notEqual(row.token_hash,cookie.split('=')[1]);
sql.prepare('UPDATE crm_sessions SET expires_at=0 WHERE token_hash=?').run(row.token_hash);
assert.equal(await authenticated(signed('/admin/'),env),null,'expired session denied');
sql.prepare('UPDATE crm_sessions SET expires_at=? WHERE token_hash=?').run(row.expires_at,row.token_hash);
await handleAuth({request:request('/auth/logout',{}, {Cookie:cookie}),env});assert.equal(await authenticated(signed('/admin/'),env),null);
sql.exec('DELETE FROM crm_login_limits');
for(let i=0;i<10;i++)assert.equal((await login({email:env.CRM_ALLOWED_EMAIL,password:'wrong'})).status,401);
assert.equal((await login({email:env.CRM_ALLOWED_EMAIL,password})).status,429);
console.log('Login: protected routes, session cookies, logout, password rotation, origin and rate limits passed.');

const originalFetch=globalThis.fetch;
const orderId=crypto.randomUUID(),payload={requestId:crypto.randomUUID(),orderId,amountInCents:1,description:'Synthetic order',expiryDate:'2099-01-01'};
let posts=0,paymentInvalid=false;
globalThis.fetch=async(url,options={})=>{
  assert.ok(String(url).startsWith('https://api.abnamro.com/v2/tikkie/'));
  assert.equal(options.redirect,'manual','Workers must not follow provider redirects with API credentials');
  if(options.method==='POST'){posts++;return Response.json({url:'https://tikkie.me/pay/test',paymentRequestToken:'test-token',status:'OPEN'},{status:201});}
  if(String(url).includes('/payments?'))return Response.json({payments:[{paymentToken:'received-test',amountInCents:paymentInvalid?-1:1,createdDateTime:'2026-10-10T12:00:00Z'},{paymentToken:'received-test',amountInCents:1,createdDateTime:'2026-10-10T12:00:00Z'}],totalElementCount:2});
  return Response.json({status:'OPEN'});
};
const create=body=>handleTikkie({request:request('/__local/tikkie/create',body),env});
const first=await create(payload);assert.equal(first.status,200);const link=await first.json();assert.equal(link.amountInCents,1);
assert.equal((await create(payload)).status,200);assert.equal(posts,1);
assert.equal((await create({...payload,amountInCents:2})).status,409);
const checked=await handleTikkie({request:request('/__local/tikkie/check',{orderId}),env});assert.equal(checked.status,200);
const result=await checked.json();assert.equal(result.links[0].paidInCents,1);assert.equal(result.links[0].payments.length,1);
paymentInvalid=true;assert.equal((await handleTikkie({request:request('/__local/tikkie/check',{orderId}),env})).status,503);
assert.equal((await exportJournal(DB))[payload.requestId].result.paidInCents,1);
globalThis.fetch=async()=>{posts++;throw Error('simulated lost response');};
const uncertain={...payload,requestId:crypto.randomUUID(),orderId:crypto.randomUUID()};
assert.equal((await create(uncertain)).status,503);const calls=posts;
assert.equal((await create(uncertain)).status,409);assert.equal((await create({...uncertain,requestId:crypto.randomUUID()})).status,409);assert.equal(posts,calls);
console.log('Tikkie: 1 cent, idempotency, payment deduplication, invalid response and uncertain-request protection passed. No real provider calls.');

const journal=await exportJournal(DB);sql.exec('DELETE FROM crm_tikkie_requests');
const state={customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]};
const migration={id:crypto.randomUUID(),revision:0,migration:true,tikkieJournal:journal,operations:[{store:'state',action:'put',key:'main',value:state}]};
const commit=body=>handleCrm({request:request('/api/crm/commit',body),env});
assert.equal((await commit(migration)).status,200);assert.deepEqual(await (await handleCrm({request:request('/api/crm/commit-status?id='+migration.id),env})).json(),{committed:true,revision:1});assert.deepEqual(await exportJournal(DB),journal);
assert.equal((await commit(migration)).status,200);
assert.equal((await commit({...migration,id:crypto.randomUUID()})).status,409);
console.log('Migration: state and complete Tikkie journal saved together, replay safe and filled target protected.');

globalThis.fetch=async(url,options)=>{
  assert.equal(url,'https://dummy.onrender.com/render');assert.equal(options.redirect,'manual');assert.equal(options.headers.Authorization,'Bearer '+env.CRM_DOCUMENT_SERVICE_TOKEN);return Response.json({pdf:'dummy',downloads:{pdf:'/__local/downloads/'+'a'.repeat(32)}});
};
assert.equal((await handleDocuments({request:request('/__local/documents/render',{}),env})).status,200);
assert.equal((await handleDocuments({request:request('/__local/documents/render',{}),env:{...env,CRM_DOCUMENT_SERVICE_URL:'http://127.0.0.1'}})).status,503);
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://dummy.onrender.com/preview');assert.equal(options.redirect,'manual');assert.equal(options.headers.Authorization,'Bearer '+env.CRM_DOCUMENT_SERVICE_TOKEN);assert.equal(JSON.parse(options.body).page,1);return Response.json({page:1,pages:1,image:'fictitious'});};
assert.equal((await handleDocuments({request:request('/__local/documents/preview',{data:'fake',page:1}),env})).status,200);
assert.equal((await handleDocuments({request:request('/__local/documents/preview',{}),env:{...env,CRM_COMPANY_ID:'maatwerkkunststof'}})).status,503);
globalThis.fetch=async(_url,options)=>{assert.equal(options.redirect,'manual');return new Response(null,{status:302,headers:{Location:'https://another.example.invalid'}});};
const redirected=await handleDocuments({request:request('/__local/documents/render',{}),env});
assert.equal(redirected.status,503);assert.equal(redirected.headers.get('Location'),null,'redirects cannot escape the protected document proxy');
globalThis.fetch=originalFetch;
console.log('Document proxy: private bearer, Render-only destination and configuration guard passed.');
sql.close();
