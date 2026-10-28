// Transient visual guidance only. Native table/form/menu semantics and events
// remain intact; no values, focus, sorting, selection or storage are changed.
const installations=new WeakMap();
const excluded='[data-table-guides="off"],.mail-message-content,[contenteditable="true"],.document-editor,.document-content';
export function installTableGuides(root=globalThis.document){
 if(installations.has(root))return;
 let hovered=null,focused=null,active=null,marked=[];
 function cellAt(target){
  const cell=target?.closest?.('td,th'),table=cell?.closest('table');
  return table&&table.closest('.shell,dialog .tablewrap')&&!table.closest(excluded)&&!cell.closest(excluded)?cell:null;
 }
 function clear(){for(const [node,name] of marked)node.classList.remove(name);marked=[];active=null;}
 function mark(node,name){node.classList.add(name);marked.push([node,name]);}
 // Resolve logical columns per row group, including rowSpan/colSpan. Never
 // pretend a merged cell identifies one particular column.
 function columns(table){
  const positions=new Map();
  for(const group of [table.tHead,...table.tBodies,table.tFoot].filter(Boolean)){
   const rows=[...group.rows],grid=rows.map(()=>[]);
   for(let y=0;y<rows.length;y++){
    let x=0;
    for(const cell of rows[y].cells){
     while(grid[y][x])x++;
     const width=cell.colSpan,height=cell.rowSpan===0?rows.length-y:Math.min(cell.rowSpan,rows.length-y);
     positions.set(cell,{from:x,to:x+width-1});
     for(let dy=0;dy<height;dy++)for(let dx=0;dx<width;dx++)grid[y+dy][x+dx]=cell;
     x+=width;
    }
   }
  }
  return positions;
 }
 function paint(){
  const cell=hovered?.isConnected?hovered:focused?.isConnected?focused:null;
  if(active===cell)return;
  clear();if(!cell)return;active=cell;
  const table=cell.closest('table'),row=cell.parentElement;
  mark(row,'crm-table-guide-row');
  const positions=columns(table),column=cell.colSpan===1?positions.get(cell):null;
  if(column)for(const [candidate,position] of positions)if(position.from<=column.from&&position.to>=column.from)mark(candidate,'crm-table-guide-column');
  mark(cell,'crm-table-guide-cell');
 }
 function over(event){if(event.pointerType==='touch')return;hovered=cellAt(event.target);paint();}
 function out(event){if(event.pointerType==='touch')return;hovered=cellAt(event.relatedTarget);paint();}
 function focus(event){hovered=null;focused=cellAt(event.target);paint();}
 function blur(event){focused=cellAt(event.relatedTarget);paint();}
 function reset(){hovered=focused=null;clear();}
 root.addEventListener('pointerover',over);root.addEventListener('pointerout',out);
 root.addEventListener('focusin',focus);root.addEventListener('focusout',blur);
 root.defaultView?.addEventListener('blur',reset);
 root.defaultView?.addEventListener('focus',()=>{focused=cellAt(root.activeElement);paint();});
 root.addEventListener('visibilitychange',()=>{if(root.hidden)reset();else{focused=cellAt(root.activeElement);paint();}});
 installations.set(root,true);
}
