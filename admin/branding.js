export function applyCompanyFavicon(company){const link=document.querySelector('link[rel="icon"]');if(link)link.href='/admin/icons/'+company.id+'.svg';}
