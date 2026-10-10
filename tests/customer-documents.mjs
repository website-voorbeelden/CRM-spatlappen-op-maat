import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {customerDocumentItems} from '../admin/document-generation.js';

// Private planning/cost canaries must never cross into customer-document payloads.
const item={description:'Spatlap op maat',width:1905,height:200,quantity:1,price:10000,
 specs:'PRIVATE_SPEC: lokaal bedrukken nog te plannen',notes:'PRIVATE_NOTE: via Turkije bestelling 1',
 cost:4000,productionSource:'local',purchaseId:'PRIVATE_PURCHASE',supplier:'PRIVATE_SUPPLIER'};
const fd=new FormData();fd.set('description_0',item.description);fd.set('detail1_0','Afmeting: 190,5 × 20 cm');
const items=customerDocumentItems([item],fd),body=JSON.stringify(items);
assert.deepEqual(items,[{description:'Spatlap op maat',details:['Afmeting: 190,5 × 20 cm'],quantity:1,price:10000}]);
assert.ok(!body.includes('PRIVATE_'));
fd.set('details_0','Zwart rubber\n\nZonder bevestigingsgaten');
assert.deepEqual(customerDocumentItems([item],fd)[0].details,['Afmeting: 190,5 × 20 cm','Zwart rubber','Zonder bevestigingsgaten']);
// Protect the shared form: all four document types use this mapping and leave
// the extra customer-text field empty instead of preloading specs or notes.
const source=await readFile(new URL('../admin/app.js',import.meta.url),'utf8');
const form=source.slice(source.indexOf('function confirmationForm'),source.indexOf("document.addEventListener('click'"));
assert.ok(form.includes('items:customerDocumentItems(o.items,fd)'));
assert.ok(form.includes("area('details_'+n,'Extra tekst voor de klant (optioneel · één regel per detail)','')"));
assert.ok(!form.includes('i.notes')&&!form.includes('i.specs'));
console.log('Klantdocumenten: interne notities, specificaties, kostprijs, planning en leverancier worden niet automatisch overgenomen; handmatige klanttekst blijft mogelijk.');
