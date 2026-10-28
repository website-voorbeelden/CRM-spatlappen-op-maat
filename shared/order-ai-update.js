import {cleanInquirySpecs} from './inquiries.js?v=feedback-followup-20261028';
import {markProvenance} from './provenance.js?v=provenance-colors-20261027';
import {validateBusinessState} from './state-validation.js?v=feedback-followup-20261028';
const orderFields=['notes','expectedDate','leadTimeMinWeeks','leadTimeMaxWeeks','leadTimeBasis','leadTimeStartDate'];
const addressFields=['source','recipient','address','country','instructions'];
const itemFields=['description','quantity','width','height','thickness','diameter','holeDiameter','material','shape','printColors','specs'];
const specFields=['quantity','width','height','thickness','diameter','holeDiameter','material','color','printing','design','shape'];
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function paths(order){return [...orderFields,...['delivery','billing'].flatMap(group=>addressFields.map(key=>group+'.'+key)),...specFields.map(key=>'inquirySpecs.'+key),...order.items.flatMap(item=>itemFields.map(key=>'items.'+item.id+'.'+key))];}
function target(order,path){const parts=path.split('.');if(parts[0]==='items'){const record=order.items.find(i=>i.id===parts[1]);if(!record)throw Error('Een productregel is verwijderd.');return {record,key:parts[2],path:parts[2]};}return {record:order,key:parts.at(-1),path};}
function get(order,path){if(path.startsWith('items.')){const t=target(order,path);return t.record[t.key];}return path.split('.').reduce((v,key)=>v?.[key],order);}
export function orderAiSnapshot(state,orderId,companyId){
 const order=state.orders.find(o=>o.id===orderId);if(!order)throw Error('Order bestaat niet meer.');
 const customer=state.customers.find(c=>c.id===order.customerId);
 return {format:'crm-order-update-context',version:1,companyId,orderId,customerId:order.customerId,customer:{name:customer?.company||'',contact:customer?.contact||'',email:customer?.email||''},values:Object.fromEntries(paths(order).map(path=>[path,get(order,path)??null]))};
}
export function orderAiProposal(state,input,expected,companyId){
 if(input?.format!=='crm-order-update'||input.version!==1||input.companyId!==companyId||input.orderId!==expected.orderId||Object.keys(input).some(k=>!['format','version','companyId','orderId','changes'].includes(k))||!Array.isArray(input.changes)||input.changes.length>100)throw Error('Gebruik het verwachte antwoordformaat voor deze bestaande order.');
 const order=state.orders.find(o=>o.id===expected.orderId);if(order&&order.customerId!==expected.customerId)throw Error('De klantkoppeling is gewijzigd sinds de export. Open AI aanvullen opnieuw.');if(!order)throw Error('Order bestaat niet meer.');
 const allowed=new Set(paths(order)),seen=new Set(),changes=[];
 for(const change of input.changes){
  if(!change||Object.keys(change).some(k=>!['path','value','evidence'].includes(k))||!allowed.has(change.path)||!Object.hasOwn(expected.values,change.path)||seen.has(change.path))throw Error('Een veld is onbekend, dubbel of niet toegestaan. Geen nieuwe producten, prijzen, betalingen of fases via deze invoer.');seen.add(change.path);
  const value=change.value;if(value==null||value==='')continue;
  if(typeof change.evidence!=='string'||!change.evidence.trim()||change.evidence.length>1000)throw Error('Geef per voorgestelde wijziging de bron of korte uitleg.');
  const {key}=target(order,change.path);if(change.path.startsWith('inquirySpecs.'))cleanInquirySpecs({[key]:value});const numeric=['quantity','width','height','thickness','diameter','holeDiameter','printColors','leadTimeMinWeeks','leadTimeMaxWeeks'].includes(key);
  if(numeric){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1000000||['quantity','printColors','leadTimeMinWeeks','leadTimeMaxWeeks'].includes(key)&&!Number.isInteger(value)||key==='quantity'&&value<1)throw Error('Controleer het voorgestelde getal voor '+change.path+'.');}
  if(key==='printColors'&&value>99)throw Error('Maximaal 99 drukkleuren.');
  if(['width','height'].includes(key)&&value<=0)throw Error('Vul een positieve maat in.');
  if(['leadTimeMinWeeks','leadTimeMaxWeeks'].includes(key)&&value>104)throw Error('De levertijd mag maximaal 104 weken zijn.');
  if(!numeric&&(typeof value!=='string'||value.length>10000||value.includes('\0')))throw Error('Controleer de voorgestelde tekst voor '+change.path+'.');
  if(['expectedDate','leadTimeStartDate'].includes(key)&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))throw Error('Gebruik een geldige datum JJJJ-MM-DD.');
  if(key==='source'&&!(change.path.startsWith('billing.')?['delivery','customer','custom']:['customer','custom']).includes(value))throw Error('Ongeldige adreskeuze.');
  if(key==='leadTimeBasis'&&!['payment','deposit','order','manual'].includes(value))throw Error('Ongeldige startbasis van de levertijd.');
  if(!same(get(order,change.path),expected.values[change.path]))throw Error('Ordergegevens zijn gewijzigd sinds de export. Open AI aanvullen opnieuw; je huidige antwoord blijft staan.');
  if(!same(value,get(order,change.path)))changes.push({path:change.path,value,evidence:change.evidence.trim(),before:get(order,change.path)??null});
 }
 if(!changes.length)throw Error('Geen nieuwe ingevulde gegevens gevonden. Bestaande waarden worden niet met onbekend of leeg overschreven.');
 return {orderId:order.id,customerId:order.customerId,changes,itemsBasis:JSON.stringify(order.items),purchaseId:order.purchaseId||''};
}
export function applyOrderAiProposal(state,proposal,selected){
 const order=state.orders.find(o=>o.id===proposal.orderId);if(!order||order.customerId!==proposal.customerId||JSON.stringify(order.items)!==proposal.itemsBasis||(order.purchaseId||'')!==proposal.purchaseId)throw Error('Order, producten of klantkoppeling zijn gewijzigd. Bekijk het voorstel opnieuw.');
 const changes=proposal.changes.filter(c=>selected.includes(c.path));if(!changes.length)throw Error('Vink ten minste één gewenste wijziging aan.');
 for(const change of changes)if(!same(get(order,change.path),change.before))throw Error('Een voorgesteld veld is intussen gewijzigd. Er is niets overschreven.');
 for(const group of ['delivery','billing'])if(changes.some(c=>c.path.startsWith(group+'.')&&c.path!==group+'.source')&&order[group]?.source!=='custom'&&!changes.some(c=>c.path===group+'.source'&&c.value==='custom'))throw Error('Een afwijkend orderadres vraagt ook de keuze '+group+'.source = custom in het voorstel. Neem die keuze mee of pas het adres handmatig aan.');
 for(const change of changes){const t=target(order,change.path);if(change.path.startsWith('items.')&&['quantity','width','height','thickness','diameter','holeDiameter','shape'].includes(t.key)&&(t.record.costSource||order.purchaseId||state.inventory?.movements?.some(m=>m.orderId===order.id&&m.itemId===t.record.id)))throw Error('Dit product heeft inkoop- of voorraadkoppelingen. Pas maat/aantal gecontroleerd aan bij Order bewerken; andere gegevens kun je hier wel overnemen.');}
 for(const change of changes){const t=target(order,change.path);if(change.path.startsWith('items.')){t.record[t.key]=structuredClone(change.value);markProvenance(t.record,[t.key],'ai');}else{const p=change.path.split('.');if(p.length===2){order[p[0]]??={};order[p[0]][p[1]]=structuredClone(change.value);}else order[p[0]]=structuredClone(change.value);markProvenance(order,[change.path],'ai');}}
 if(order.leadTimeBasis==='manual'&&!order.leadTimeStartDate)throw Error('Kies ook de afgesproken startdatum.');
 if(order.leadTimeMinWeeks!=null&&order.leadTimeMaxWeeks!=null&&order.leadTimeMinWeeks>order.leadTimeMaxWeeks)throw Error('De minimale levertijd mag niet groter zijn dan de maximale.');
 validateBusinessState(state);state.activities.unshift({id:crypto.randomUUID(),message:'Bestaande order aangevuld uit gecontroleerd AI-voorstel ('+changes.length+' velden)',time:new Date().toISOString()});
}
