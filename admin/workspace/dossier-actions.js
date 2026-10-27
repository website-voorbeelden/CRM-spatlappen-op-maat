// Archive/restore changes only the chosen record, using the latest transaction.
export function createDossierActions(context){
 async function archive(action,id){
  const isCustomer=action.endsWith('customer'),archived=action.startsWith('archive-'),collection=isCustomer?'customers':'orders';
  const record=context.state[collection].find(record=>record.id===id);
  if(!record)throw Error('Dit dossier bestaat niet meer.');
  const basis=JSON.stringify(record),message=isCustomer?(archived?'Klant gearchiveerd':'Klant hersteld'):(archived?'Bestelling gearchiveerd; betalingen en bestanden blijven bewaard':'Bestelling hersteld');
  await context.mergeStoredState(next=>{
   const current=next[collection].find(record=>record.id===id);
   if(JSON.stringify(current)!==basis)throw Error('Dit dossier is intussen gewijzigd. Open het opnieuw voordat je het archiveert of herstelt.');
   if(isCustomer&&archived&&next.orders.some(order=>order.customerId===id&&!order.archived&&order.stage!=='Afgerond'))throw Error('Deze klant heeft nog lopende bestellingen. Rond die eerst af of archiveer ze.');
   current.archived=archived;next.activities.unshift({id:context.uid(),message,time:new Date().toISOString()});
  });
  if(archived)location.hash=isCustomer?'customers':'orders';
  context.render();context.toast(message);
 }
 return {archive};
}
