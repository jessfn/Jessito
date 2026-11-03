const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file:///home/user/Jessito/video/anim8.html');
await p.evaluate(async()=>{await document.fonts.load('800 100px "Baloo 2"');await document.fonts.ready});
await p.evaluate(async()=>{window.frame(240);const im=document.querySelector('svg image');if(im)await new Promise(r=>{const i=new Image();i.onload=r;i.onerror=r;i.src=im.getAttribute('href')});
 const svg=document.querySelector('svg');svg.insertAdjacentHTML('beforeend',txt('¡SONIDOS',480,150,150,1,'#ff5a5f',-3,null,'#fff')+txt('DE LA GRANJA!',480,300,118,1,'#3b3a8a',2,null,'#fff'));
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});
await p.screenshot({path:'miniatura4.png'});await b.close()})();
