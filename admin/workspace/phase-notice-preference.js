// Personal display preference only. Never a permission to change a phase or Gmail.
export function createPhaseNoticePreference(companyId){
 const key=companyId+':phase-notice-hidden-v1';let fallback=false,temporary=false;
 function hidden(){if(temporary)return fallback;try{return globalThis.localStorage.getItem(key)==='true';}catch{return fallback;}}
 function setHidden(value){fallback=!!value;try{globalThis.localStorage.setItem(key,String(fallback));const saved=globalThis.localStorage.getItem(key)===String(fallback);temporary=!saved;return saved;}catch{temporary=true;return false;}}
 return {hidden,setHidden};
}
