// This is the entire inline-product contract, used at both message boundaries.
// No descriptions, customer names, addresses, prices or supplier metadata cross it.
export function costingInlineProduct(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const product={};
 if(Number.isSafeInteger(value.quantity)&&value.quantity>0&&value.quantity<=1_000_000)product.quantity=value.quantity;
 for(const key of ['width','height','thickness'])if(typeof value[key]==='number'&&Number.isFinite(value[key])&&value[key]>0&&value[key]<=1_000_000)product[key]=value[key];
 if(typeof value.material==='string'&&value.material.trim().length<=100&&!/[\x00-\x1f\x7f]/.test(value.material)&&value.material.trim())product.material=value.material.trim();
 return Object.keys(product).length?product:null;
}
