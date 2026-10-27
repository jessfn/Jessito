const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file:///home/user/Jessito/video/anim3.html');await p.evaluate(async()=>{await document.fonts.load('800 100px "Baloo 2"');await document.fonts.load('700 100px Fredoka');await document.fonts.ready});fs.mkdirSync('frames',{recursive:true});
const only=process.argv[2];const fr=only?[+only]:[...Array(720).keys()];
for(const f of fr){await p.evaluate(async f=>{window.frame(f);const im=document.querySelector('svg image');if(im){await new Promise(r=>{const i=new Image();i.onload=r;i.onerror=r;i.src=im.getAttribute('href')})}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))},f);await p.screenshot({path:only?`test${f}.png`:`frames/f${String(f).padStart(4,'0')}.png`});}
await b.close()})();
