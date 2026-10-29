import {installTableGuides} from './table-guides.js?v=table-guides-20261028';
import {installActionMenus} from './action-menus.js?v=feedback-five-20261029';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let menuCleanup=()=>{};
export function installSidebar(root,companyId){
 installTableGuides(document);
 menuCleanup();menuCleanup=installActionMenus(root);
 const shell=root.querySelector('.shell'),button=root.querySelector('[data-sidebar-toggle]');
 if(!shell||!button)return;
 const key=companyId+':sidebar-collapsed';let collapsed=false;
 try{collapsed=localStorage.getItem(key)==='true';}catch{}
 function apply(){
  shell.classList.toggle('sidebar-collapsed',collapsed);
  button.setAttribute('aria-expanded',String(!collapsed));
  button.setAttribute('aria-label',collapsed?'Zijbalk uitklappen':'Zijbalk inklappen');
  button.title=collapsed?'Zijbalk uitklappen':'Zijbalk inklappen';
  button.textContent=collapsed?'→ Menu':'←';
 }
 button.onclick=()=>{collapsed=!collapsed;try{localStorage.setItem(key,String(collapsed));}catch{}apply();};
 apply();
}

const actions={'mail-reply':'Naar antwoordveld','mail-new':'Nieuwe mail','mail-check':'Mail handmatig bijwerken','mail-choose-thread':'Gmail-gesprek koppelen','mail-choose-saved':'Bewaard gesprek koppelen','mail-intake-settings':'Aanvraagverwerking','mail-thread-refresh':'Gesprek bijwerken','mail-update':'Berichten bewaren','mail-unlink':'CRM-kopie verwijderen','mail-link':'Gesprek koppelen','mail-intake':'Mail als aanvraag','mail-save-draft':'Concept opslaan','mail-composer':'Uitgebreid bericht / bijlage','mail-request-info':'Gegevens opvragen','mail-analyse':'Mail analyseren','mail-template-edit':'Standaardtekst bewerken','mail-template-save':'Eigen tekst als template','mail-preview':'Mailvoorbeeld','sidebar-toggle':'Zijbalk inklappen / uitklappen','template-apply':'Template invullen','template-edit-current':'Template bewerken','template-save':'Nieuwe template opslaan','mail-switch':'Gesprek wisselen','funnel-specs':'Specificaties opvragen','funnel-calculate':'Prijs berekenen','funnel-indication':'Prijsindicatie opstellen','funnel-followup':'Opvolging voorbereiden','funnel-phase':'Fase bijwerken','funnel-filter':'Fasefilter in zijbalk'};
export function createUsagePreferences(companyId,{storage=globalThis.localStorage,target=globalThis.document}={}){const key=companyId+':ux-usage-v1';let data={enabled:true,counts:{},since:new Date().toISOString()},timer;try{const saved=JSON.parse(storage?.getItem(key)||'null');if(saved&&typeof saved.enabled==='boolean'&&saved.counts&&typeof saved.counts==='object')data={enabled:saved.enabled,since:typeof saved.since==='string'?saved.since:data.since,counts:Object.fromEntries(Object.entries(saved.counts).filter(([id,c])=>Object.hasOwn(actions,id)&&Number.isSafeInteger(c.total)&&c.total>=0).map(([id,c])=>[id,{total:c.total,more:Math.min(c.total,Number.isSafeInteger(c.more)?c.more:0)}]))};}catch{}function flush(){try{storage?.setItem(key,JSON.stringify(data));}catch{}}function record(id,more=false){if(!data.enabled||!Object.hasOwn(actions,id))return;const c=data.counts[id]??={total:0,more:0};c.total++;if(more)c.more++;clearTimeout(timer);timer=setTimeout(flush,800);}
 target?.addEventListener('click',e=>{const b=e.target.closest?.('button,a,summary');if(!b)return;const id=b.hasAttribute('data-funnel-select')?'funnel-filter':b.hasAttribute('data-funnel-action')?'funnel-'+b.dataset.funnelAction:Object.keys(actions).find(id=>b.hasAttribute('data-'+id));if(id)record(id,!!b.closest('details'));else if(b.matches('[type=submit]')&&b.closest('.mail-quick-reply'))record('mail-preview');});globalThis.window?.addEventListener('pagehide',flush);
 function markup(){return `<details class="panel ux-usage" data-ux-usage><summary>Mijn gebruik & lokale voorkeuren</summary><p>Alleen aantallen van vaste knoppen in dit bedrijf en deze browser. Geen mailtekst, klantgegevens of verzending naar een meetdienst. De indeling verandert niet automatisch.</p><label class="check-row"><input type="checkbox" data-ux-enabled ${data.enabled?'checked':''}>Knopgebruik lokaal tellen</label><div class="tablewrap"><table><thead><tr><th>Actie</th><th>Gebruikt</th><th>Vanuit Meer</th></tr></thead><tbody>${Object.entries(data.counts).sort((a,b)=>b[1].total-a[1].total).map(([id,c])=>`<tr><td>${esc(actions[id])}</td><td>${c.total}</td><td>${c.more}</td></tr>`).join('')||'<tr><td colspan="3">Nog geen gebruik geteld.</td></tr>'}</tbody></table></div><div class="actions"><button type="button" data-ux-export>Gebruiksoverzicht downloaden</button><button type="button" data-ux-reset>Tellers wissen</button></div><small>Telt sinds ${esc(data.since.slice(0,10))}. Download dit overzicht wanneer je samen de indeling wilt verbeteren. Browsergegevens wissen verwijdert ook deze tellers.</small></details>`;}
 function install(root){const panel=root.querySelector('[data-ux-usage]');if(!panel)return;panel.querySelector('[data-ux-enabled]').onchange=e=>{data.enabled=e.target.checked;flush();};panel.querySelector('[data-ux-reset]').onclick=()=>{if(!confirm('Alleen de lokale gebruikstellers wissen?'))return;data.counts={};data.since=new Date().toISOString();flush();panel.querySelector('tbody').innerHTML='<tr><td colspan="3">Tellers gewist.</td></tr>';};panel.querySelector('[data-ux-export]').onclick=()=>{const blob=new Blob([JSON.stringify({company:companyId,...data,actions},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='crm-knopgebruik-'+companyId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};}
 return {markup,install,record,flush,snapshot:()=>structuredClone(data)};
}
