// Presentation only: use the existing amounts, never infer VAT from a receipt
// or a supplier document whose VAT basis has not been recorded.
export const moneyBases={net:{label:'Excl. btw',help:'Prijzen, kosten en marge exclusief btw.'},gross:{label:'Incl. btw',help:'Het volledige klantbedrag: te betalen, ontvangen of openstaand.'},document:{label:'Documentbedrag',help:'Zoals geregistreerd op het leveranciersdocument; btw-basis niet afzonderlijk vastgelegd.'}};
export function moneyBasisBadge(kind){const basis=moneyBases[kind];return `<span class="money-basis money-basis-${kind}" title="${basis.help}">${basis.label}</span>`;}
