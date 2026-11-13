import {createRequire} from 'module';import fs from 'fs';
const require=createRequire(import.meta.url);const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg=await br.newPage({viewport:{width:540,height:960}});pg.on('console',m=>console.log('C:',m.text().slice(0,300)));pg.on('pageerror',e=>console.error('ERR',e.message.slice(0,400)));
await pg.goto('http://localhost:8770/show6.html');await pg.waitForFunction(()=>window.READY,null,{timeout:90000});
for(const t of [0.3,1.0,1.7,2.4]){const url=await pg.evaluate(t=>window.renderAt(t),t);fs.writeFileSync(`../build/ep5/t6_${t}.png`,Buffer.from(url.split(',')[1],'base64'))}
await br.close();console.log('done');
