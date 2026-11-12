const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,500)));await p.goto('http://localhost:8768/index.html?w=720');await p.waitForTimeout(500);await p.evaluate(()=>window.initScene('state_ep2.json'));
for(const [n,hide] of [['a',false],['b',true]]){const url=await p.evaluate(h=>{window.__dbg.sleeve.visible=!h;return window.renderFrame(Math.round(14*24))},hide);fs.writeFileSync(`/home/user/Jessito/found-footage/3d/o_${n}.png`,Buffer.from(url.split(',')[1],'base64'))}
const info=await p.evaluate(()=>{const d=window.__dbg;const v=new (d.opOuter.position.constructor)();d.opHand.g.getWorldPosition(v);return {outer:d.opOuter.position.toArray(),handWorld:v.toArray(),cam:d.cam.position.toArray()}});console.log(JSON.stringify(info));
await b.close()})();
