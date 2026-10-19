// Shared address splitting for the document form and batch preflight.
export function addressParts(address,country=''){
 const lines=String(address||'').split(/\n|,\s*/).map(s=>s.trim()).filter(Boolean);
 if(lines.length>1&&country&&lines.at(-1).toLowerCase()===country.trim().toLowerCase())lines.pop();
 if(lines.length===1){const match=lines[0].match(/^(.*?)\s+(\d{4}\s?[A-Za-z]{2}\s+.+)$/);if(match)return {street:match[1],postal:match[2]};}
 return {street:lines[0]||'',postal:lines.slice(1).join(', ')};
}
