const form=document.querySelector('form'),status=document.querySelector('#login-status'),submit=form.querySelector('button');
form.addEventListener('submit',async event=>{
 event.preventDefault();if(submit.disabled||!form.reportValidity())return;
 submit.disabled=true;submit.textContent='Inloggen…';status.textContent='';
 try{
  const response=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.elements.email.value,password:form.elements.password.value,remember:form.elements.remember.checked})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Inloggen mislukt.');
  form.elements.password.value='';
  const next=new URLSearchParams(location.search).get('next')||'/admin/',target=new URL(next,location.origin);
  if(target.origin!==location.origin||!next.startsWith('/')||target.pathname.startsWith('/login'))location.replace('/admin/');
  else{if(!target.hash&&location.hash)target.hash=location.hash;location.replace(target.pathname+target.search+target.hash);}
 }catch(error){status.textContent=error.message;submit.disabled=false;submit.textContent='Inloggen';}
});
