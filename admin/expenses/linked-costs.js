// Read-only presentation of the authoritative expense records. These amounts
// already project into the dossier costs; do not add another subtotal here.
export function linkedExpenseMarkup(state,kind,ownerId,{esc}){
 const rows=(state.businessExpenses||[]).filter(e=>e.target.kind===kind&&e.target.ownerId===ownerId);
 if(!rows.length)return '<p class="form-help"><a href="#expenses">Losse bezorg-, verzend- en andere bedrijfskosten vastleggen →</a> Kies bij bestaande dossierkosten dezelfde bron om dubbel tellen te voorkomen.</p>';
 return '<p class="form-help">Kosten met aparte btw- en betaalregistratie: '+rows.map(e=>'<a href="#expenses/'+esc(e.id)+'">'+esc(e.label)+'</a>').join(' · ')+'. Deze bedragen zitten al in de dossierkosten, inclusief eventueel niet-aftrekbare btw. Pas bedrag, btw en betaling samen aan bij Bedrijfskosten.</p>';
}

export function protectExpenseCostFields(form,state,kind,ownerId,aliases={}){
 const rows=(state.businessExpenses||[]).filter(e=>e.target.kind===kind&&e.target.ownerId===ownerId&&e.target.slot!=='named');
 for(const e of rows){
  const field=form.elements[aliases[e.target.slot]||e.target.slot];if(!field)continue;
  field.readOnly=true;
  const help=document.createElement('small'),link=document.createElement('a');link.href='#expenses/'+encodeURIComponent(e.id);link.textContent='Bedrag en btw beheren bij Bedrijfskosten ↗';link.target='_blank';link.rel='noopener';help.append(link);field.closest('label')?.append(help);
 }
}
