// Load only after a deliberate file-reading action. PDF bytes stay in this
// browser. The existing project pins the same reader/worker version for design.
let library;
async function reader(){
 if(!library)library=import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.mjs').then(lib=>{lib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.mjs';return lib;}).catch(()=>{library=null;throw Error('De PDF-lezer kon niet laden. Je kunt de factuurtekst zelf plakken of de AI-prompt gebruiken.');});
 return library;
}
export async function readInvoicePdf(file,{signal,structured=false,allowEmptyText=false}={}){
 if(!file||file.size<=0||file.size>15*1024*1024)throw Error('Kies een volledige PDF van maximaal 15 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder('ascii').decode(bytes.slice(0,5))!=='%PDF-')throw Error('Dit bestand heeft geen PDF-header.');
 const lib=await reader();if(signal?.aborted)throw Error('Inlezen afgebroken.');
 const task=lib.getDocument({data:bytes,isEvalSupported:false,stopAtErrors:true,useSystemFonts:false,disableFontFace:true,maxImageSize:0,isOffscreenCanvasSupported:false});
 const cancel=()=>{void task.destroy().catch(()=>{});};signal?.addEventListener('abort',cancel,{once:true});
 try{
  const pdf=await task.promise;if(pdf.numPages>30)throw Error('Deze factuur heeft meer dan 30 pagina’s. Gebruik een afzonderlijk factuurbestand.');
  const pages=[],layoutRows=[];let chars=0;
  for(let n=1;n<=pdf.numPages;n++){
   if(signal?.aborted)throw Error('Inlezen afgebroken.');
   const page=await pdf.getPage(n),content=await page.getTextContent(),rows=[];let previousY=null;
   for(const item of content.items){if(typeof item.str!=='string')continue;const y=item.transform?.[5];if(previousY!==null&&Number.isFinite(y)&&Math.abs(y-previousY)>3)rows.push('\n');rows.push(item.str,item.hasEOL?'\n':' ');previousY=y;}
   if(structured){if(content.items.length>25000)throw Error('Deze pagina bevat te veel tekstonderdelen. Kopieer de factuurtekst zelf.');const groups=[],bins=new Map();for(const item of content.items){if(typeof item.str!=='string'||!item.str.trim()||!Number.isFinite(item.transform?.[4])||!Number.isFinite(item.transform?.[5]))continue;const x=item.transform[4],y=item.transform[5];const bin=Math.floor(y/2.5);let group=[bins.get(bin-1),bins.get(bin),bins.get(bin+1)].find(g=>g&&Math.abs(g.y-y)<2.5);if(!group){group={y,parts:[]};groups.push(group);bins.set(bin,group);}group.parts.push({text:item.str,x,width:Math.abs(item.width||0)});}groups.sort((a,b)=>b.y-a.y);for(const group of groups){group.parts.sort((a,b)=>a.x-b.x);layoutRows.push({page:n,text:group.parts.map(p=>p.text).join(' '),parts:group.parts});if(layoutRows.length>2000)throw Error('Gebruik een afzonderlijke factuur met maximaal 2000 tekstregels.');}}
   const text=rows.join('');chars+=text.length;if(chars>200000)throw Error('De factuurtekst is te groot. Gebruik één afzonderlijke factuur.');pages.push(text);page.cleanup();
  }
  const text=pages.join('\n\n');if(!allowEmptyText&&text.trim().length<20)throw Error('Geen bruikbare PDF-tekst gevonden. Dit kan een scan zijn: plak zelf tekst of gebruik je eigen AI met de originele factuur.');return structured?{text,rows:layoutRows}:text;
 }catch(error){if(error?.name==='PasswordException')throw Error('Deze PDF is beveiligd. Gebruik een eigen onbeveiligde factuurkopie of plak de tekst.');throw error;}
 finally{signal?.removeEventListener('abort',cancel);await task.destroy().catch(()=>{});}
}
