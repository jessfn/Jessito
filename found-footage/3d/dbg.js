const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,500)));await p.goto('http://localhost:8766/index.html?w=720');await p.waitForTimeout(500);await p.evaluate(()=>window.initScene('state_ep2.json'));
const shots=[['face',24.6,[-.2,1.9,1.5,-.2,1.78,0]],['body',24.6,[0,1.2,3.3,-.1,1.0,0]],['hook',1.5,null],['reveal',62.0,null]];
for(const [n,t,cam] of shots){await p.evaluate(c=>{window.DBG={cam:c}},cam);const i=Math.round(t*24);const url=await p.evaluate(i=>window.renderFrame(i),i);fs.writeFileSync(`/home/user/Jessito/found-footage/3d/d_${n}.png`,Buffer.from(url.split(',')[1],'base64'))}
await b.close()})();
