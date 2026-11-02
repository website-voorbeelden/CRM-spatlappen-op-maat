// Visible packing number only. The allocated document ID/series and the raw
// supplier reference used for shipment matching remain separate.
export function packingDisplayNumber(number,reference=''){
 const value=String(reference||'').trim();
 return value?'PB-'+value.replace(/^PB-/i,''):number;
}
