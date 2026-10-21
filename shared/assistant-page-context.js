import {companyFor} from './companies.js';
const pages={development:'Bouwtaken',inventory:'Voorraad',dashboard:'Overzicht',analytics:'Analytics',orders:'Aanvragen & orders',customers:'Klanten',purchases:'Inkoopbestellingen','order-map':'Orderkaart',designs:'Bedrijfstool',settings:'Instellingen & back-up',feedback:'Feedback',mail:'E-mail',assistant:'Assistent'};
const sections={analytics:{vat:'Btw-voorbereiding',financial:'Financiën',usage:'Websitegebruik',requests:'Aanvragen',google:'Google & SEO'},settings:{gmail:'Gmail',sending:'Verzenden & handtekening',templates:'Mailtemplates',preferences:'Voorkeuren',backup:'Back-up & herstel',archive:'Archief'},dashboard:{tasks:'Te doen',orders:'Lopende orders',activity:'Activiteiten'},orders:{stock:'Voorraad',overview:'Order',delivery:'Adres & levering',costs:'Inkoop & marge',payments:'Betalingen',documents:'Documenten',mail:'E-mail',list:'Orderoverzicht',prices:'Prijzen vergelijken'},customers:{overview:'Klantoverzicht',details:'Klantgegevens',orders:'Orders',addresses:'Adressen',documents:'Documenten',mail:'E-mail',list:'Klantenlijst'},purchases:{packing:'Pakbonnen',orders:'Orders in zending',costs:'Kosten & zending',invoices:'Facturen & betalingen',documents:'Documenten',list:'Inkoopoverzicht'}};
const filterKeys={orders:['text','visibility','customerId','stage','outcome','width','height','quantity','printColors','tolerance','from','to','sourceOrderId','sort','direction'],customers:['text','visibility','activity','country','sort'],analytics:['tab','period','scope','from','to'],'order-map':['stage','phase','purchaseId','method','search']};
const factNames={vatExceptionCount:'Orders met afwijkende/onbekende btw',vatReviewCount:'Orders met btw-controlepunt',stockArticleCount:'Voorraadartikelen',stockAvailableCount:'Fysiek op voorraad (stuks)',stockIncomingCount:'Nog te ontvangen voorraad (stuks)',calculatorMaterial:'Materiaal in calculator',calculatorQuantity:'Aantal in calculator',calculatorWidth:'Breedte (mm)',calculatorHeight:'Hoogte (mm)',calculatorDiameter:'Buitendiameter (mm)',calculatorThickness:'Dikte (mm)',savedMailCount:'Bewaarde mails (alleen aantal)',orderCount:'Orders',customerCount:'Klanten',openOrderCount:'Lopende orders',outstandingInCents:'Openstaand orderbedrag incl. btw',inProductionCount:'In productie',waitingApprovalCount:'Wacht op goedkeuring',productMatchCount:'Passende productregels',revenueInCents:'Orderomzet excl. btw',costInCents:'Bekende kostprijs excl. btw',profitInCents:'Brutomarge excl. btw',receivedInCents:'Ontvangen klantbetalingen incl. btw',marginPercent:'Brutomarge (%)',provisionalOrderCount:'Orders met voorlopige kosten',debtorInCents:'Te ontvangen van klanten · alle periodes',customerCreditInCents:'Te veel ontvangen · alle periodes',creditorInCents:'Te betalen aan leveranciers · alle periodes',supplierAdvanceInCents:'Te veel betaald aan leveranciers · alle periodes',unknownSupplierCount:'Inkoopbestellingen met onbekend factuurbedrag',purchaseCount:'Inkoopbestellingen',linkedOrderCount:'Gekoppelde klantorders',goodsInCents:'Bekende inkoop producten',sharedCostInCents:'Bekend transport, invoer en overige kosten',supplierPaidInCents:'Betaald aan leverancier',goodsKnown:'Productkosten volledig bekend',sharedKnown:'Gezamenlijke kosten volledig bekend',documentCount:'Documenten (alleen aantal)',archivedCustomerCount:'Gearchiveerde klanten',archivedOrderCount:'Gearchiveerde orders'};
const filterNames={phase:'Uitvoeringsfase',purchaseId:'Levering (ID)',method:'Leverwijze',search:'Zoekopdracht',tab:'Analytics-onderdeel',scope:'Btw-selectie',text:'Zoekopdracht',visibility:'Archiefselectie',customerId:'Klantselectie (ID)',stage:'Statusselectie',outcome:'Offerte-uitkomst',width:'Breedte (cm)',height:'Hoogte (cm)',quantity:'Aantal',printColors:'Drukkleuren',tolerance:'Afwijking (%)',from:'Vanaf',to:'Tot en met',sourceOrderId:'Vergelijkingsorder (ID)',sort:'Sortering',direction:'Richting',activity:'Klantgroep',country:'Land',period:'Periode'};
const values={active:'Niet-gearchiveerd',archived:'Alleen archief',all:'Alles',year:'Dit jaar','12months':'Laatste 12 maanden',open:'Lopend',outstanding:'Openstaand bedrag',single:'Eén order',repeat:'Terugkerend',none:'Zonder orders',completed:'Afgerond',name:'Naam A–Z',recent:'Meest recent',asc:'Oplopend',desc:'Aflopend',accepted:'Akkoord',pending:'Wacht op antwoord',declined:'Afgewezen',no_response:'Geen reactie',unknown:'Onbekend'};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const validId=v=>typeof v==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(v);
const text=v=>typeof v==='string'?v.slice(0,240):'';
export function normalizeAssistantPageContext(input,companyId){
 if(!object(input)||input.kind!=='page'||input.companyId!==companyId||!Object.hasOwn(pages,input.page))throw Error('Ongeldige paginacontext of ander bedrijf.');
 const company=companyFor(companyId),result={kind:'page',companyId,page:input.page,label:input.page==='designs'?company.toolLabel:pages[input.page],section:'',sectionLabel:'',filters:{},facts:{}};
 if(input.section&&Object.hasOwn(sections[input.page]||{},input.section)){result.section=input.section;result.sectionLabel=sections[input.page][input.section];}
 if(object(input.selected)){
  if(!['customer','order'].includes(input.selected.entity)||!validId(input.selected.id)||input.page!==(input.selected.entity==='order'?'orders':'customers'))throw Error('Ongeldig dossier bij deze pagina.');
  result.selected={entity:input.selected.entity,id:input.selected.id,label:text(input.selected.label)};
 }
 if(input.page==='purchases'&&object(input.reference)&&validId(input.reference.id))result.reference={id:input.reference.id,label:text(input.reference.label)};
 for(const key of filterKeys[input.page]||[]){const value=input.filters?.[key];if(typeof value==='string'&&value)result.filters[key]=text(value);}
 for(const [key,value] of Object.entries(input.facts||{})){
  if(!Object.hasOwn(factNames,key))continue;
  if(key==='calculatorMaterial'){if(typeof value==='string')result.facts[key]=text(value);}
  else if(['goodsKnown','sharedKnown'].includes(key)){if(typeof value==='boolean')result.facts[key]=value;}
  else if(Number.isFinite(value)&&Math.abs(value)<=9e12&&(key==='marginPercent'||Number.isSafeInteger(value)))result.facts[key]=value;
 }
 if(object(input.visible)){
  if(!['customer','order'].includes(input.visible.entity)||!Array.isArray(input.visible.ids)||!Number.isSafeInteger(input.visible.total)||input.visible.total<0)throw Error('Ongeldige paginaresultaten.');
  const ids=[...new Set(input.visible.ids.slice(0,20))];if(ids.some(id=>!validId(id))||input.visible.total<ids.length)throw Error('Ongeldige paginaresultaten.');
  result.visible={entity:input.visible.entity,ids,total:input.visible.total,limited:input.visible.total>ids.length};
 }
 return result;
}
export function assistantPageContext({companyId,page,section='',selected,reference,filters={},facts={},visible}){
 return normalizeAssistantPageContext({kind:'page',companyId,page,section,selected,reference,filters,facts,visible},companyId);
}
export function describeAssistantPageContext(context){
 if(!context)return [];
 if(context.kind!=='page')return [context.label||context.id];
 const lines=['Pagina: '+context.label+(context.sectionLabel?' · '+context.sectionLabel:'')];
 if(context.selected)lines.push('Dossier: '+(context.selected.label||((context.selected.entity==='order'?'Order':'Klant')+' '+context.selected.id)));
 if(context.reference)lines.push('Inkoopbestelling: '+context.reference.label);
 for(const [key,value] of Object.entries(context.filters))lines.push(filterNames[key]+': '+(values[value]||value));
 const euro=new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'});
 for(const [key,value] of Object.entries(context.facts))lines.push(factNames[key]+': '+(key.endsWith('InCents')?euro.format(value/100):typeof value==='string'?value:typeof value==='boolean'?value?'Ja':'Nee':new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(value)));
 if(context.visible)lines.push(context.visible.total+' resultaten op deze pagina; '+context.visible.ids.length+' dossierverwijzingen meegestuurd'+(context.visible.limited?' (beperkte selectie).':'.'));
 lines.push('Alleen deze pagina-informatie. Inhoud van bestanden, ontwerpen en niet-opgeslagen formulieren gaat niet mee.');
 return lines;
}
