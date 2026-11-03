const frame=document.querySelector('#website'),wrap=document.querySelector('#frame-wrap');
let width=1440,height=1000;
function fit(){
  const scale=Math.min(1,(document.documentElement.clientWidth-32)/width);
  frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform=`scale(${scale})`;
  wrap.style.width=width*scale+'px';wrap.style.height=height*scale+'px';
  document.querySelector('#size').textContent=width+' × '+height;
}
document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{
  width=Number(button.dataset.width);height=Number(button.dataset.height);
  document.querySelectorAll('[data-width]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  fit();
}));
addEventListener('resize',fit);fit();
