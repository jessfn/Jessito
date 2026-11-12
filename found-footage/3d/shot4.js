const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1800,height:1100}});
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,300))});p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,400)));
await p.goto('http://localhost:8766/opts3.html');await p.waitForFunction('window.READY===true',null,{timeout:120000});await p.waitForTimeout(1500);await p.screenshot({path:'/home/user/Jessito/found-footage/3d/opciones3d.png'});console.log('shot');await b.close()})();
