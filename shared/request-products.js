// Deliberate product boundaries only. No paragraph guessing or shared dimensions.
export function requestProductBlocks(text){
 const lines=String(text||'').slice(0,30000).split(/\r?\n/),labels=[],listed=[];
 for(let index=0;index<lines.length;index++){
  const line=lines[index].trim();
  if(/^(?:product|artikel|onderdeel)\s*(?:\d+\s*)?:\s*\S/i.test(line))labels.push(index);
  if(/^(?:[-•*]|\d+[.)])\s+/.test(line)&&/\b(?:stuks?|platen|schijven|spatlappen|ringen|pakkingen|panelen|blokken|blokjes)\b/i.test(line)&&/\b(?:\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\b/i.test(line))listed.push(index);
 }
 // A general Product: header before a list is not an extra product itself.
 const starts=labels.length>=2?labels:listed;
 if(starts.length<2||starts.length>40)return [];
 return starts.map((start,index)=>lines.slice(start,starts[index+1]??lines.length).join('\n').trim());
}
export function cleanRequestProducts(input,cleanSpecs){
 if(!Array.isArray(input)||input.length<1||input.length>40)throw Error('Gebruik één tot veertig producten.');
 return input.map((product,index)=>{
  if(!product||typeof product!=='object'||Array.isArray(product)||typeof product.product!=='string'||!product.product.trim()||product.product.length>200)throw Error('Vul een productomschrijving in bij product '+(index+1)+'.');
  return {product:product.product.trim(),specs:cleanSpecs(product.specs||{})};
 });
}
