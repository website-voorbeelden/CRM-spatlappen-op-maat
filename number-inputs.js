// Keep ordinary page scrolling from changing a focused numeric field.
// Blur before the browser's wheel default; do not cancel scrolling itself.
document.addEventListener('wheel',()=>{
 const input=document.activeElement;
 if(input instanceof HTMLInputElement&&input.type==='number')input.blur();
},{capture:true,passive:true});
