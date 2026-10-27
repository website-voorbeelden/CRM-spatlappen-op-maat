// IndexedDB and the cloud facade both require synchronous request callbacks.
// Await network work before opening a transaction, never inside its mutation.
export function synchronousTransactionResult(value){
 if(value&&typeof value.then==='function'){
  // An accidentally async callback can still reject after the transaction aborts.
  Promise.resolve(value).catch(()=>{});
  throw Error('Deze opslagactie moet zonder onderbreking worden uitgevoerd. Er is niets opgeslagen.');
 }
 return value;
}

export function storeTransaction(database,name,mode,mutate,{onCommitted=()=>{}}={}){
 return new Promise((resolve,reject)=>{
  const tx=database.transaction(name,mode);let result,failure;
  tx.oncomplete=()=>{resolve(result);onCommitted();};
  tx.onerror=()=>reject(failure||tx.error||Error('Opslaan mislukt. Probeer opnieuw.'));
  tx.onabort=()=>reject(failure||tx.error||Error('Opslaan afgebroken. Probeer opnieuw.'));
  try{
   const request=synchronousTransactionResult(mutate(tx.objectStore(name)));
   if(request)request.onsuccess=()=>{result=request.result;};
  }catch(error){
   failure=error;
   try{tx.abort();}finally{reject(error);}
  }
 });
}
