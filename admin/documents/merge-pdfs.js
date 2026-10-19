// Vendored pdf-lib 1.17.1 (MIT). Only page contents are copied; the original
// stored files stay untouched. No document data goes to a CDN or merge service.
let library;
function loadLibrary(){
 if(globalThis.PDFLib?.PDFDocument)return Promise.resolve(globalThis.PDFLib);
 return library??=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='/print-assets/pdf-lib-1.17.1.min.js';
  script.onload=()=>globalThis.PDFLib?.PDFDocument?resolve(globalThis.PDFLib):reject(Error('PDF-bibliotheek ontbreekt.'));
  script.onerror=()=>reject(Error('Samenvoegen kon niet laden. Probeer opnieuw.'));document.head.append(script);
 }).catch(error=>{library=null;throw error;});
}
export async function mergePackingPdfs(files,onProgress=()=>{}){
 if(!files.length||files.length>100)throw Error('Kies 1 tot 100 pakbonbestanden per download.');
 if(files.reduce((total,f)=>total+f.blob.size,0)>80000000)throw Error('De pakbonnen zijn samen te groot (maximaal 80 MB). Kies minder orders.');
 const {PDFDocument}=await loadLibrary(),merged=await PDFDocument.create();
 for(const [index,file] of files.entries()){
  onProgress('Pakbonnen samenvoegen · '+(index+1)+' van '+files.length);
  if(!(file.blob instanceof Blob)||!file.blob.size||(await file.blob.slice(0,5).text())!=='%PDF-')throw Error(file.name+': geen geldig PDF-bestand.');
  let source;try{source=await PDFDocument.load(await file.blob.arrayBuffer(),{updateMetadata:false});}catch{throw Error(file.name+': kan niet worden samengevoegd. Download en controleer dit bestand afzonderlijk.');}
  if(merged.getPageCount()+source.getPageCount()>500)throw Error('Kies minder pakbonnen (maximaal 500 pagina’s per download).');
  const pages=await merged.copyPages(source,source.getPageIndices());for(const page of pages)merged.addPage(page);
 }
 merged.setTitle('Pakbonnen gezamenlijke bestelling');return new Blob([await merged.save()],{type:'application/pdf'});
}
