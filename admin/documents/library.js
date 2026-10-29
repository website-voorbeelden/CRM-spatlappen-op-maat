// A generation produces two stored files. Group only its exact identity; never
// merge uploads, other orders, document numbers or separate generation events.
import {documentTypes} from "./generation.js";
import {documentSeriesKey,documentVersion} from "../../shared/document-revisions.js?v=feedback29-restpunten";
export function documentFormat(file){return /\.pdf$/i.test(file.name)?'PDF':/\.docx$/i.test(file.name)?'Word':'';}
export function documentBundles(files){
 const candidates=new Map(),single=[];
 files.forEach((file,index)=>{
  const g=file.generated,format=documentFormat(file);
  if(!format||typeof g?.generationId!=='string'||!g.generationId||typeof g?.number!=='string'||!g.number||!Object.hasOwn(documentTypes,g.kind)){single.push({files:[file],index});return;}
  const key=JSON.stringify([file.ownerId,file.category,g.kind,g.number,g.generationId]);
  if(!candidates.has(key))candidates.set(key,[]);candidates.get(key).push({file,index});
 });
 for(const batch of candidates.values()){
  const formats=batch.map(({file})=>documentFormat(file));
  // Duplicate formats are ambiguous. Keep all files visible and separate.
  if(new Set(formats).size!==formats.length)single.push(...batch.map(({file,index})=>({files:[file],index})));
  else single.push({files:batch.map(({file})=>file).sort((a,b)=>documentFormat(a)==='PDF'?-1:documentFormat(b)==='PDF'?1:0),index:Math.min(...batch.map(b=>b.index))});
 }
 return single.sort((a,b)=>String(b.files[0].createdAt||b.files[0].date||'').localeCompare(String(a.files[0].createdAt||a.files[0].date||''))||b.index-a.index).map(({files})=>files);
}
export function documentVersionGroups(files){
 const groups=new Map();for(const bundle of documentBundles(files)){const key=documentSeriesKey(bundle[0]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(bundle);}
 const result=[];for(const versions of groups.values()){
  // An ambiguous legacy generation stays separate and visible.
  if(new Set(versions.map(v=>documentVersion(v[0]))).size!==versions.length){result.push(...versions.map(current=>({current,previous:[]})));continue;}
  versions.sort((a,b)=>documentVersion(b[0])-documentVersion(a[0]));result.push({current:versions[0],previous:versions.slice(1)});
 }
 return result.sort((a,b)=>String(b.current[0].createdAt||b.current[0].date||'').localeCompare(String(a.current[0].createdAt||a.current[0].date||'')));
}
