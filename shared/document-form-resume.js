// Temporary form edits only. Product text follows IDs, never a changed row order.
// Removed product edits remain available to the user, without entering a payload.
export function remapDocumentFormValues(values,sourceItems,currentItems){
 const result={},removed=[...(values.__removedProductEdits||[])],current=new Map(currentItems.map((item,index)=>[item.id,index])),source=new Map(sourceItems.map(item=>[item.id,item]));
 for(const [key,value] of Object.entries(values)){
  if(key==='__removedProductEdits')continue;
  const row=key.match(/^(description|detail[12]|details)_(\d+)$/),delivered=key.startsWith('delivered_')?key.slice(10):null;
  if(!row&&!delivered){result[key]=value;continue;}
  const item=row?sourceItems[Number(row[2])]:source.get(delivered),index=item?current.get(item.id):undefined;
  if(index!==undefined)result[row?row[1]+'_'+index:key]=value;
  else if(typeof value==='string')removed.push({product:item?.description||'Vervallen productregel',label:delivered?'Geleverd aantal':row[1]==='description'?'Artikelomschrijving':row[1]==='details'?'Extra producttekst':'Maatvoering',value});
 }
 if(removed.length)result.__removedProductEdits=removed;
 return result;
}
