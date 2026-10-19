import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {navigationGroups,navigationMarkup} from '../admin/workspace/navigation.js';
import {developmentPlanMarkup} from '../admin/workspace/development-plan.js';
import {items,stages,planFor} from '../shared/planning/roadmap.js';
import {renderPlan} from '../scripts/render-plan.mjs';
import {companyFor,companyIds} from '../shared/companies.js';
import {assistantPageContext} from '../shared/assistant-page-context.js';

const existingRoutes=['dashboard','analytics','orders','order-map','purchases','inventory','customers','mail','designs','feedback','settings'];
for(const companyId of companyIds){
 const company=companyFor(companyId),groups=navigationGroups(company),routes=groups.flatMap(g=>g.links.map(l=>l[0]));
 assert.equal(groups.length,4);assert.equal(new Set(routes).size,routes.length);
 assert.deepEqual([...routes].sort(),[...existingRoutes,'development'].sort());
 assert.equal(groups.flatMap(g=>g.links).find(l=>l[0]==='designs')[1],company.toolLabel);
 for(const route of routes){
  const markup=navigationMarkup({company,page:route,ordersNavigation:route==='orders'?'<div data-funnel-fixture>Fases</div>':''});
  assert.equal((markup.match(/aria-current="page"/g)||[]).length,1);
  assert.ok(markup.includes(`href="#${route}" title=`));
  assert.equal(markup.includes('data-funnel-fixture'),route==='orders');
  assert.equal(assistantPageContext({companyId,page:route}).page,route);
 }
 const plan=developmentPlanMarkup(company,{filter:'all',loading:false});
 for(const item of items)assert.equal(plan.includes(`<h3>${item.title}</h3>`),item.companies.includes(companyId));
 assert.equal((plan.match(/<article /g)||[]).length,planFor(companyId).length);
 assert.ok(plan.includes('href="#feedback"'));
 assert.ok(plan.includes('data-build-check')&&plan.includes('data-build-open')&&!plan.includes('<form'),'Bouwtaken openen een apart bewaarformulier.');
}
const escaped=navigationMarkup({company:{toolLabel:'<script>malicious & "label"</script>'},page:'designs'});
assert.ok(!escaped.includes('<script>'));assert.ok(escaped.includes('&lt;script&gt;'));
assert.ok(developmentPlanMarkup({id:'spatlappen',name:'<img src=x>'}).includes('&lt;img src=x&gt;'));
assert.equal(new Set(items.map(i=>i.id)).size,items.length);
const stageIds=stages.map(s=>s.id),byId=new Map(items.map(i=>[i.id,i]));
function dependencies(item,parents=[]){assert.ok(!parents.includes(item.id),'Cyclische planning: '+item.id);for(const id of item.dependsOn){assert.ok(byId.has(id));dependencies(byId.get(id),[...parents,item.id]);}}
for(const item of items){
 assert.ok(stageIds.includes(item.stage));assert.ok(item.companies.length);
 for(const id of item.companies)assert.ok(companyIds.includes(id));
 for(const key of ['id','title','goal','next','acceptance'])assert.ok(item[key]?.trim(),key+' ontbreekt');
 dependencies(item);
 for(const path of item.areas)await access(new URL('../'+path,import.meta.url));
 for(const id of item.dependsOn)for(const companyId of item.companies)assert.ok(byId.get(id).companies.includes(companyId),'Afhankelijkheid ontbreekt bij bedrijf.');
}
assert.equal(await readFile(new URL('../docs/plan/ROADMAP.md',import.meta.url),'utf8'),renderPlan(),'Voer npm run plan uit.');
// Verify links in the new entry documents instead of trusting a neat-looking folder tree.
for(const path of ['AGENTS.md','docs/README.md','docs/plan/ARCHITECTUUR.md','docs/plan/AUTOMATISERINGEN.md','docs/plan/BESLUITEN.md','docs/plan/ROADMAP.md']){
 const url=new URL('../'+path,import.meta.url),source=await readFile(url,'utf8');
 for(const [,href] of source.matchAll(/\]\(([^)]+)\)/g))if(!/^(https?:|#)/.test(href))await access(new URL(href,url));
}
console.log('✓ Beide bedrijven: alle bestaande routes, actieve navigatie/funnel, bedrijfsspecifiek plan, escape, echte bronpaden, afhankelijkheden en identieke gegenereerde roadmap.');
