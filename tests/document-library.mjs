import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {documentBundles,documentFormat,documentVersionGroups} from '../admin/document-library.js';
import {canReviseDocument,documentVersion} from '../shared/document-revisions.js';
import {documentTypes} from '../admin/document-generation.js';
import {createCategoryPreferences,documentLayoutToolbar,documentLayoutAttributes} from '../admin/document-layout.js';
import {previewDocument} from '../admin/document-preview.js';
import {formProblem} from '../admin/form-guidance.js';
const pdf={id:'pdf',ownerId:'o1',name:'Pakbon_<unsafe>.pdf',category:'packing',date:'2026-10-13',size:1000,generated:{kind:'packing',number:'PB-2026-3452',generationId:'event1'}},word={...pdf,id:'word',name:'Pakbon.docx',size:2000};
const input=[word,pdf],before=JSON.stringify(input),bundle=documentBundles(input);
assert.equal(bundle.length,1);assert.deepEqual(bundle[0].map(f=>f.id),['pdf','word']);assert.equal(JSON.stringify(input),before);
for(const variant of [{ownerId:'other'},{category:'other'},{generated:{...word.generated,generationId:'event2'}},{generated:{...word.generated,number:'PB-2026-3453'}},{generated:undefined},{generated:{...word.generated,generationId:''}}])assert.equal(documentBundles([pdf,{...word,...variant}]).length,2);
assert.equal(documentBundles([pdf,{...pdf,id:'second-pdf'},word]).length,3);
assert.equal(documentBundles([{...pdf,generated:undefined},{...word,generated:undefined}]).length,2);
assert.equal(documentBundles([pdf,word].map(f=>({...f,generated:{...f.generated,kind:'unknown'}}))).length,2);
assert.equal(documentBundles([pdf])[0][0],pdf);
assert.equal(documentFormat(word),'Word');
assert.equal(documentBundles([pdf,{...pdf,id:'newer',date:'2026-10-14',generated:undefined}])[0][0].id,'newer');
const source=await readFile(new URL('../admin/app.js',import.meta.url),'utf8');
function fn(name,next){const start=source.indexOf('function '+name+'(');return source.slice(start,source.indexOf('\n'+next,start));}
const categories=source.slice(source.indexOf('const documentCategories='),source.indexOf('\nfunction documentsForOwner'));
let markup,submit,options,opened=[],files=[pdf,word],selected;
const state={customers:[{id:'c1',company:'Test'}],orders:[{id:'o1',customerId:'c1',number:3001,items:[]},{id:'o2',customerId:'c1',number:3002,items:[]}],documents:files};
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const nodes={submit:{},form:{dataset:{}}};
const env={state,canReviseDocument,documentVersion,documentVersionGroups,documentLayoutToolbar,documentLayoutAttributes,createCategoryPreferences,previewDocument,documentPreviewButton:d=>previewDocument(state.documents,d.id)?'<button>Preview</button>':'',company:{id:'spatlappen'},documentTypes,documentBundles,documentFormat,formProblem,esc,date:v=>v,
 order:id=>state.orders.find(o=>o.id===id),customer:id=>state.customers.find(c=>c.id===id),purchase:()=>null,customerOrders:id=>state.orders.filter(o=>o.customerId===id),
 documentsForOwner:()=>files,documentSource:d=>`<span>Owner ${d.ownerId}</span>`,documentFile:d=>`<div data-file="${d.id}">${esc(d.name)}</div>`,
 button:(action,label,id)=>`<button data-action="${action}" data-id="${esc(id)}">${esc(label)}</button>`,
 openForm:(title,html,callback,opts)=>{markup=html;submit=callback;options=opts;},$:selector=>selector.endsWith('form')?nodes.form:nodes.submit,
 packingSlipForm:id=>opened.push(['packing',id]),confirmationForm:(id,kind)=>opened.push([kind,id]),toast:message=>{throw Error(message);}};
runInNewContext(categories+'\n'+fn('documentPreviewButton','function documentFile')+'\n'+fn('documentDeleteButton','function deleteDocumentForm')+'\n'+fn('documentBundleCard','function documentCreateButton')+'\n'+fn('documentCreateButton','function documentCreationForm')+'\n'+fn('documentCreationForm',"document.addEventListener")+'\n'+fn('documents',"document.addEventListener")+'\n'+fn('documentPaymentActions','function orderMailHistory'),env);
const rendered=env.documents('o1');
assert.equal((rendered.match(/class="document-bundle"/g)||[]).length,1);
assert.equal((rendered.match(/data-document-layout-handle=/g)||[]).length,6);
assert.ok(rendered.includes('data-action="preview-document" data-id="pdf"'));
assert.ok(rendered.includes('data-document-layout-reset'));
assert.equal((rendered.match(/>Mail voorbereiden<\/button>/g)||[]).length,1);
assert.ok(rendered.includes('PDF downloaden')&&rendered.includes('Word downloaden')&&rendered.includes('bestanden beheren'));
assert.ok(rendered.includes('PDF verwijderen')&&rendered.includes('Word verwijderen')&&!rendered.includes('Betaallink maken'));
assert.ok(rendered.includes('Pakbon_&lt;unsafe&gt;.pdf')&&!rendered.includes('<unsafe>'));
assert.equal((rendered.match(/data-drop-owner="o1"/g)||[]).length,6);
assert.ok(rendered.includes('data-kind="packing"')&&rendered.includes('data-kind="invoice"'));
const beforeState=JSON.stringify(state);env.documentCreationForm('o1','invoice');assert.deepEqual(opened,[['invoice','o1']]);assert.equal(JSON.stringify(state),beforeState);
opened=[];env.documentCreationForm('o1');assert.equal(nodes.submit.textContent,'Verder →');assert.equal((markup.match(/type="radio"/g)||[]).length,5);
submit({get:key=>key==='orderId'?'o1':'packing'});assert.deepEqual(opened,[]);options.afterSave();assert.deepEqual(opened,[['packing','o1']]);assert.equal(JSON.stringify(state),beforeState);
opened=[];env.documentCreationForm('c1','invoice');assert.ok(markup.includes('Kies een order'));assert.equal(opened.length,0);
assert.throws(()=>submit({get:key=>key==='orderId'?'elsewhere':'invoice'}),e=>e.field==='orderId');
submit({get:key=>key==='orderId'?'o2':'invoice'});options.afterSave();assert.deepEqual(opened,[['invoice','o2']]);
state.orders.push({id:'foreign',customerId:'c2'});env.documentCreationForm('c1','invoice');assert.throws(()=>submit({get:key=>key==='orderId'?'foreign':'invoice'}),e=>e.field==='orderId');
env.company.id='maatwerkkunststof';opened=[];env.documentCreationForm('o1');assert.equal((markup.match(/type="radio"/g)||[]).length,1);assert.ok(markup.includes('value="packing"'));assert.throws(()=>env.documentCreationForm('o1','invoice'),/nog niet ingericht/);
files=[word];assert.ok(!env.documents('o1').includes('Mail voorbereiden'));
files=[pdf,word];const customerPage=env.documents('c1');assert.ok(customerPage.includes('data-document-target="c1"')&&customerPage.includes('data-action="create-document" data-id="c1" data-kind="packing"'));
files=[];const supplierPage=env.documents('purchase');assert.ok(!supplierPage.includes('data-action="create-document"'));
assert.ok(!source.slice(source.indexOf(" if(tab==='documents')content=",source.indexOf('function renderOrder(')),source.indexOf(" if(tab==='mail')content=",source.indexOf('function renderOrder('))).includes('paymentLinksPanel'));
console.log('✓ Documentbibliotheek: één PDF/Word-kaart, exacte generatie/dossiergrenzen, losse uploads behouden, veilige download/mail/beheer-ID’s, maker bij uploadvakken, expliciete klantorderkeuze zonder writes en bedrijfsafscheiding.');

// The actual library displays one current document and preserves a folded history.
env.company.id='spatlappen';const revisionPayload={kind:'quote',number:'OF-2026-3452',fields:{},items:[{description:'Fixture',details:[],quantity:1,price:1000}]};
const first={id:'v1',ownerId:'o1',name:'Offerte.pdf',category:'quote',type:'application/pdf',size:20,date:'2026-10-13',generated:{kind:'quote',number:revisionPayload.number,generationId:'g1',payload:revisionPayload}};
const second={...first,id:'v2',name:'Offerte_v2.pdf',createdAt:'2026-10-14',generated:{...first.generated,generationId:'g2',seriesId:'g1',revision:2}};files=[first,second];state.documents=files;const versionPage=env.documents('o1');assert.ok(versionPage.includes('Eerdere versies (1)'));assert.equal((versionPage.match(/data-action="edit-document"/g)||[]).length,1);assert.ok(versionPage.includes('1 document · nieuwste eerst'));assert.ok(versionPage.includes('eerdere versie'));
console.log('✓ Werkelijke documentweergave: alleen huidige versie aanpassen, eerdere PDF bereikbaar en documenttelling blijft één.');
