// Explicitly supplied company documents. These are public terms, not dossier files.
const maatTerms=Object.freeze({key:'maatwerkkunststof-terms-2023',companyId:'maatwerkkunststof',title:'Algemene voorwaarden',edition:'1 januari 2023',name:'Algemene_voorwaarden_Maatwerkkunststof_01-01-2023.pdf',url:'/admin/assets/terms/maatwerkkunststof-2023.pdf'});
export function termsDocumentFor(companyId){return companyId==='maatwerkkunststof'?maatTerms:null;}
