const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const dir=__dirname,out=path.join(dir,'spr4'),N=+(process.env.N||900);fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm'};
const srv=http.createServer((q,r)=>{const f=path.join(dir,q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(8780);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:1000}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8780/sprite_robot.html');await p.waitForFunction('window.READY',null,{timeout:30000});
const only=process.argv[2];const frames=only?only.split(',').map(Number):[...Array(N).keys()];
for(const f of frames){const url=await p.evaluate(f=>new Promise(res=>{const pl=plan4(f/30);window.rc.requestAnimationFrame(()=>{window.drawPlan(pl);window.rc.requestAnimationFrame(()=>res(window.extract()))})}),f);
 fs.writeFileSync(path.join(out,only?`t${f}.png`:`s${String(f).padStart(4,'0')}.png`),Buffer.from(url.split(',')[1],'base64'))}
await b.close();srv.close()})();
