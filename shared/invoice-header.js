// Only explicitly labelled invoice fields. Never use the order date as invoice date.
export function invoiceHeaderLines(text){return text.replace(/\u00a0/g,' ').split(/\r?\n/).flatMap(line=>line.replace(/(?=\b(?:factuurnummer|factuurdatum|bestelnummer|besteldatum|invoice date)\s*:)/gi,'\n').split('\n')).map(s=>s.trim()).filter(Boolean);}
export function invoiceDate(value){
 const clean=String(value||'').normalize('NFKC').trim().toLowerCase(),months={januari:1,january:1,februari:2,february:2,maart:3,march:3,april:4,mei:5,may:5,juni:6,june:6,juli:7,july:7,augustus:8,august:8,september:9,oktober:10,october:10,november:11,december:12};let parts;
 let m=clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(m)parts=[m[1],m[2],m[3]];
 m=clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);if(m)parts=[m[3],m[2],m[1]];
 m=clean.match(/^([a-z]+)\s+(\d{1,2})(?:,\s*|\s+)(\d{4})$/);if(m&&Object.hasOwn(months,m[1]))parts=[m[3],months[m[1]],m[2]];
 m=clean.match(/^(\d{1,2})\s+([a-z]+),?\s+(\d{4})$/);if(m&&Object.hasOwn(months,m[2]))parts=[m[3],months[m[2]],m[1]];
 if(!parts)return '';const result=parts.map((n,i)=>String(n).padStart(i?2:4,'0')).join('-'),stamp=Date.parse(result+'T12:00:00Z');return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===result?result:'';
}
