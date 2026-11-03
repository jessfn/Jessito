const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const dir=__dirname,out=path.join(dir,'spr6');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm'};
const srv=http.createServer((q,r)=>{const f=path.join(dir,q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(8782);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1000}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8782/sprite_mascot.html');await p.waitForFunction('window.READY',null,{timeout:30000});
const N=120,FPS=24;for(let f=0;f<N;f++){const url=await p.evaluate(t=>new Promise(res=>{window.rc.requestAnimationFrame(()=>{window.drawT(t);window.rc.requestAnimationFrame(()=>res(window.extract()))})}),f/FPS);
 fs.writeFileSync(path.join(out,`d${String(f).padStart(2,'0')}.png`),Buffer.from(url.split(',')[1],'base64'))}
await b.close();srv.close()})();
