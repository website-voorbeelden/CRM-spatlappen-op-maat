// Consistent, read-only snapshot of the SAME preview CRM, not a second order DB.
export async function loadPacksServiceSnapshot(env){
 const rows=await env.DB.batch([
  env.DB.prepare('SELECT revision FROM crm_workspace WHERE id=1'),
  env.DB.prepare("SELECT part,payload FROM crm_records WHERE store='state' AND record_key='main' ORDER BY part")
 ]);
 if(!rows[0]?.success||!rows[1]?.success||!Number.isSafeInteger(rows[0].results?.[0]?.revision)||!rows[1].results?.length)throw Error('CRM_SNAPSHOT_UNAVAILABLE');
 let size=0;const parts=[];for(const [index,row] of rows[1].results.entries()){if(row.part!==index||typeof row.payload!=='string')throw Error('CRM_SNAPSHOT_PARTS');size+=row.payload.length;if(size>32_000_000)throw Error('CRM_SNAPSHOT_SIZE');parts.push(row.payload);}
 const state=JSON.parse(parts.join(''));if(!state||!['orders','customers','documents','payments','activities'].every(k=>Array.isArray(state[k])))throw Error('CRM_SNAPSHOT_INVALID');
 return {revision:rows[0].results[0].revision,state};
}
