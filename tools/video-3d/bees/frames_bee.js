const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const q=process.argv[2]||'';const times=process.argv.slice(3).map(Number);const srv=await require('./srv.js')(8880,__dirname);
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('console',m=>console.log('c:',m.text().slice(0,300)));p.on('pageerror',e=>console.log('err',e.message.slice(0,800)));
const t00=Date.now();await p.goto('http://localhost:8880/scene_bee.html'+q);await p.waitForFunction('window.ready',{timeout:240000});console.log('load ms',Date.now()-t00);
for(const t of times){const t0=Date.now();const d=await p.evaluate(t=>{frame(t);return document.getElementById('out').toDataURL('image/jpeg',0.92)},t);
 require('fs').writeFileSync(`b_${t}.jpg`,Buffer.from(d.split(',')[1],'base64'));console.log('t',t,'ms',Date.now()-t0);}
await b.close();srv.close();})();
