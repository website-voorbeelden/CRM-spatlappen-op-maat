// Small, local line icons; navigation labels remain the accessible names.
const paths={
 dashboard:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 orders:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 11h6M9 15h6"/>',
 payments:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 14h4M17 14h1"/>',
 customers:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5"/>',
 'order-map':'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15M15 6v15"/>',
 purchases:'<path d="M3 3h2l3 12h11l2-8H6M10 7V3M15 7V3"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
 inventory:'<path d="m3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10M7 5l10 4"/>',
 designs:'<path d="m4 16-1 5 5-1L21 7l-4-4ZM14 6l4 4"/>',
 analytics:'<path d="M4 3v17h17M8 15v-4M13 15V6M18 15V9"/>',
 feedback:'<path d="M4 4h16v12H9l-5 5ZM8 8h8M8 12h5"/>',
 development:'<path d="m3 6 2 2 3-4M11 6h10M3 13l2 2 3-4M11 13h10M4 20h3M11 20h10"/>',
 settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>'
};
export function navigationIcon(id){return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[id]||paths.orders}</svg>`;}
