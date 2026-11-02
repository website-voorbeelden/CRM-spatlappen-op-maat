// Filter an existing native select without choosing a different value or writing
// CRM records. Owners can replace the available options after a parent choice.
const installed=new WeakMap();let sequence=0;
export function installSelectSearch(select,{label='Zoeken',placeholder='Typ een naam…',keep=option=>!option.value||option.value.startsWith('__')}={}){
 if(!select)return;if(installed.has(select))return installed.get(select);
 const field=document.createElement('label'),input=document.createElement('input'),status=document.createElement('small'),statusId='select-search-status-'+(++sequence);
 field.textContent=label;input.type='search';input.placeholder=placeholder;input.autocomplete='off';status.id=statusId;status.className='form-help';status.setAttribute('role','status');field.append(input,status);(select.closest('label')||select).before(field);
 select.setAttribute('aria-describedby',[select.getAttribute('aria-describedby'),statusId].filter(Boolean).join(' '));
 const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 let choices=new Map([...select.options].map(option=>[option.value,option]));
 function refresh(){
  // Inline customer creation appends and selects a new option. Keep it available
  // on later searches as well as the options temporarily detached by filtering.
  for(const option of select.options)choices.set(option.value,option);
  const selected=select.value,words=normalized(input.value).split(/\s+/).filter(Boolean),all=[...choices.values()],matches=all.filter(option=>!keep(option)&&words.every(word=>normalized(option.textContent).includes(word))),matched=new Set(matches);
  select.replaceChildren(...all.filter(option=>option.value===selected||keep(option)||matched.has(option)));select.value=selected;
  const current=choices.get(selected),outside=words.length&&current&&!keep(current)&&!matched.has(current);
  status.textContent=words.length?(matches.length?matches.length+' passende keuzes.':'Geen passende keuzes. Pas je zoekterm aan.')+(outside?' Je huidige keuze staat er ook bij en blijft geselecteerd.':' Je keuze verandert pas als je die zelf selecteert.'):'';
 }
 function setOptions(options,{value=''}={}){choices=new Map([...options].map(option=>[option.value,option]));select.replaceChildren(...choices.values());select.value=value;refresh();}
 input.addEventListener('input',refresh);select.addEventListener('change',refresh);
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing){event.preventDefault();select.focus();}});
 const api={input,refresh,setOptions};installed.set(select,api);return api;
}
