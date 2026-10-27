export function mobileManifest(company){
 return {id:'/admin/',name:company.name+' CRM',short_name:company.id==='maatwerkkunststof'?'Maatwerk CRM':'Spatlappen CRM',lang:'nl',start_url:'/admin/#dashboard',scope:'/admin/',display:'standalone',background_color:'#ffffff',theme_color:company.id==='maatwerkkunststof'?'#39ff14':'#8b24ff',icons:[192,512].map(size=>({src:'/admin/icons/'+company.id+'-'+size+'.png',sizes:size+'x'+size,type:'image/png',purpose:'any maskable'}))};
}
