const {chromium}=require('/opt/node22/lib/node_modules/playwright');(async()=>{const srv=await require('./srv.js')(8961,__dirname);
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:2000,height:1200}});p.on('pageerror',e=>console.log('err',e.message.slice(0,300)));p.on('console',m=>{const s=m.text();if(!/GPU stall/.test(s))console.log('c:',s.slice(0,200))});
await p.goto('http://localhost:8961/'+process.argv[2]);await p.waitForFunction('window.done',null,{timeout:240000});
const el=await p.$('#out');await el.screenshot({path:process.argv[3]});await b.close();srv.close();})()
