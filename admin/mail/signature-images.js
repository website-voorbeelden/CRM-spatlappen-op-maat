import {sanitizeSignature} from '../../shared/mail-signature.js';
// Template contents stay detached: selecting an image never fetches remote assets.
const templateFor=html=>{const template=document.createElement('template');template.innerHTML=sanitizeSignature(html);return template;};
export function signatureImages(html){return [...templateFor(html).content.querySelectorAll('img')].map((image,index)=>({index,label:image.getAttribute('alt')||'Afbeelding '+(index+1),missing:image.hasAttribute('data-sp-signature-slot')}));}
export function replaceSignatureImage(html,dataUrl,target,{alt=''}={}){
 const template=templateFor(html),images=[...template.content.querySelectorAll('img')];
 if(target!=='append'){
  const index=Number(target),image=images[index];if(!Number.isInteger(index)||index<0||!image)throw Error('De gekozen afbeelding staat niet meer in deze HTML-handtekening. Kies opnieuw.');
  image.setAttribute('src',dataUrl);image.removeAttribute('data-sp-signature-slot');
  // Keep original dimensions, margins, position and alt text.
  if(!image.getAttribute('alt'))image.setAttribute('alt',alt);
 }else{
  const image=document.createElement('img');image.src=dataUrl;image.alt=alt;image.setAttribute('width','560');image.setAttribute('style','display:block;width:560px;max-width:100%;height:auto;border:0px');
  template.content.append(document.createElement('br'),image);
 }
 return sanitizeSignature(template.innerHTML);
}
