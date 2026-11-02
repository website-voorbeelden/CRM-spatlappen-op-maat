// Source contract from the user's exact published bundle, not a provider client.
// Deployment metadata is provenance, not a live health/account confirmation.
export const packsWorkerV3=Object.freeze({contract:'tjworx-packs-v3',worker:'tjworx-packs-crm-test',versionId:'d49fa521-9eac-4959-afde-488a45fb0c64',deploymentId:'0402331b-3f5d-4927-9bcd-60fc32fe1d26',manifest:'300e311cdba13d4ad6ea93368d5835d1d7624ff7f5b7f7dd3955cc6a8965c831',databaseId:'5338467e-f8d9-48dc-83f4-3102ca97313b',bucket:'maatwerkkunststof-packs-preview-files'});
export function packsV3PreparationCompatible(value){return !value||value.planningMode===undefined&&['automatic','manual'].includes(value.loadDateMode);}
