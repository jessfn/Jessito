const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,300))});p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,500)));
await p.goto('http://localhost:8766/index.html?w=720');await p.waitForTimeout(500);const N=await p.evaluate(()=>window.initScene('state_ep2.json'));console.log('N',N);
for(const a of process.argv.slice(2)){const i=Math.round(parseFloat(a)*24);const t0=Date.now();const url=await p.evaluate(i=>window.renderFrame(i),i);fs.writeFileSync(`/home/user/Jessito/found-footage/3d/f_${a}.png`,Buffer.from(url.split(',')[1],'base64'));console.log('frame',a,Date.now()-t0,'ms')}
await b.close()})();
