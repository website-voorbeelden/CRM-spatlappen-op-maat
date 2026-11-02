// Minimal identification only: no totals, payment inference, workflow, planning
// or optional feature is needed to keep an existing dossier reachable.
const plain=value=>typeof value==='string'?value:typeof value==='number'&&Number.isFinite(value)?String(value):'';
const esc=value=>plain(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
export function orderRecoveryRow(order,customers=[]){
 const client=id(order?.customerId)&&Array.isArray(customers)?customers.find(client=>client?.id===order?.customerId):null,number=plain(order?.sourceNumber)||plain(order?.number)||'Nummer onbekend',name=plain(client?.company)||'Klantgegevens bekijken';
 const title=esc(name)+' · #'+esc(number),reference=id(order?.id)?'<a class="order-list-link" href="#orders/'+esc(order.id)+'"><strong>'+title+'</strong></a>':'<strong>'+title+'</strong>';
 const products=Array.isArray(order?.items)?order.items.length+' productregels':plain(order?.inquiryProduct)||'Productgegevens controleren';
 return '<tr data-order-recovery-row><td data-label="Dossier & klant">'+reference+'<small>'+esc(products)+'</small>'+(order?.archived?'<small>Gearchiveerd</small>':'')+'</td><td data-label="Status">Details tijdelijk niet beschikbaar</td><td data-label="Wachttijd & planning">Planning niet getoond</td><td data-label="Verkoop excl. btw">Bedrag niet getoond</td><td data-label="Betaling">Betaling niet beoordeeld</td></tr>';
}
export function ordersRecoveryMarkup(state){
 if(!Array.isArray(state?.orders))return '<p class="notice" role="alert">De opgeslagen orderlijst kon niet worden gelezen. Er wordt geen lege lijst als vervanging opgeslagen.</p>';
 const rows=state.orders.map(order=>orderRecoveryRow(order,state.customers)).join('');
 return '<p>Deze eenvoudige lijst toont alle '+state.orders.length+' opgeslagen dossiers, inclusief archief. De normale filters en bedragen worden hier niet gebruikt.</p><label>Zoek in deze eenvoudige lijst<input type="search" data-recovery-search placeholder="Klant of ordernummer"></label><div class="tablewrap order-list-wrap"><table class="order-list"><thead><tr><th>Dossier & klant</th><th>Status</th><th>Planning</th><th>Bedrag</th><th>Betaling</th></tr></thead><tbody>'+ (rows||'<tr><td colspan="5">Geen opgeslagen orders in deze momentopname.</td></tr>')+'</tbody></table></div><p data-recovery-empty hidden>Geen overeenkomst in deze eenvoudige lijst. Wis je zoektekst om alle dossiers te zien.</p>';
}
