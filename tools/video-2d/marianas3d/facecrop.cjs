const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const srv=await require('./srv.js')(8983,__dirname);const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('err',e.message.slice(0,500)));
await p.goto('http://localhost:8983/scene.html?s=2');await p.waitForFunction('window.ready',null,{timeout:240000});
const ts=process.argv.slice(2).map(Number);const imgs=[];
for(const t of ts){const d=await p.evaluate(t=>{const c=camAt(t,[0,0]);const P3=pose3At(t);const rb0=rootBaseAt(t);const hw=CH3D.layout(P3,[rb0[0]+P3.ox,rb0[1]+P3.oy]);
 // custom close camera on the head
 const cam={z:3.2,fx:hw.head[0],fy:hw.head[1]-10,tx:540,ty:700,world:false};CH3D.render(cam,depthAt(t),null,t);
 const o=document.createElement('canvas');o.width=700;o.height=700;const g=o.getContext('2d');g.fillStyle='#16507d';g.fillRect(0,0,700,700);g.drawImage(CH3D.canvas,(540-350)*2,(700-350)*2,1400,1400,0,0,700,700);return o.toDataURL('image/png');},t);imgs.push(d);}
require('fs').writeFileSync('faces.json',JSON.stringify(imgs));await b.close();srv.close();})();
