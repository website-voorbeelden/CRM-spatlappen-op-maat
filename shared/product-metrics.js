import {productThickness} from './product-specifications.js?v=product-thickness-20261021';
export const materialKey=value=>typeof value==='string'?value.trim().replace(/\s+/g,' ').toLowerCase():'';
// Count product rows/registered quantities, never multiply order revenue across
// different thicknesses or infer physical sales from an enquiry.
export function thicknessUsage(orders,{material=''}={}){
 const groups=new Map();let noProducts=0;
 for(const order of orders){if(!order.items?.length){noProducts++;continue;}
  for(const item of order.items){if(material&&materialKey(item.material)!==materialKey(material))continue;
   const thickness=productThickness(item),key=thickness==null?'unknown':String(thickness),row=groups.get(key)||{key,thickness,productCount:0,orderIds:[],quantity:0,unknownQuantityCount:0};
   row.productCount++;if(!row.orderIds.includes(order.id))row.orderIds.push(order.id);
   if(Number.isSafeInteger(item.quantity)&&item.quantity>0)row.quantity+=item.quantity;else row.unknownQuantityCount++;
   groups.set(key,row);
  }
 }
 return {rows:[...groups.values()].sort((a,b)=>(a.thickness==null)-(b.thickness==null)||b.orderIds.length-a.orderIds.length||b.productCount-a.productCount||(a.thickness??0)-(b.thickness??0)),noProducts};
}
