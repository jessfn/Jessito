const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/user/Jessito/video/anim8.html');
await p.evaluate(async()=>{await document.fonts.load('800 100px "Baloo 2"');await document.fonts.load('700 100px Fredoka');await document.fonts.ready});
fs.mkdirSync('frames5',{recursive:true});
const only=process.argv[2]&&process.argv[2].includes(',')||process.argv[3]===undefined&&process.argv[2]&&!process.argv[2].includes('-')?process.argv[2]:null;let fr;if(process.argv[2]&&process.argv[2].includes('-')){const[a,b]=process.argv[2].split('-').map(Number);fr=[];for(let i=a;i<=b;i++)fr.push(i)}else if(only)fr=only.split(',').map(Number);else fr=[...Array(3600).keys()];
for(const f of fr){await p.evaluate(async f=>{window.frame(f);const im=document.querySelector('svg image');if(im){await new Promise(r=>{const i=new Image();i.onload=r;i.onerror=r;i.src=im.getAttribute('href')})}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))},f);
 await p.screenshot({path:only?`test${f}.png`:`frames5/f${String(f).padStart(5,'0')}.png`})}
await b.close()})();
