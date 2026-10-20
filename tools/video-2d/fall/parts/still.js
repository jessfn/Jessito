const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const srv=await require('./srv.js')(8981,__dirname);const b=await chromium.launch({args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('err',e.message.slice(0,500)));p.on('console',m=>console.log('c:',m.text().slice(0,200)));
await p.goto('http://localhost:8981/scene.html?s=2');await p.waitForFunction('window.ready',null,{timeout:60000});
const ts=process.argv.slice(2).map(Number);for(const t of ts){const t0=Date.now();await p.evaluate(t=>{try{frame(t)}catch(e){throw new Error(e.stack.slice(0,600))}},t);console.log(t,Date.now()-t0,'ms');await p.locator('#c').screenshot({path:`still_${String(t).replace('.','_')}.png`});}
await b.close();srv.close();})();
