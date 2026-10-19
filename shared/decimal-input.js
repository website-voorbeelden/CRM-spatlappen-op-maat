// Deliberately reject grouping/exponents: an ambiguous pasted amount must not become another price.
export function decimalNumber(value,{places=2}={}){const raw=String(value??'').trim();if(!new RegExp('^[+-]?\\d+(?:[.,]\\d{1,'+places+'})?$').test(raw))return NaN;return Number(raw.replace(',','.'));}
export function decimalText(value,{places=2}={}){const n=decimalNumber(value,{places});return Number.isFinite(n)?n.toFixed(places).replace('.',','):String(value??'');}
