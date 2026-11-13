const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d)})});
(async()=>{
 await new Promise(r=>srv.listen(parseInt(process.env.PORT||8765),r));
 const [mode,a,b,outdir0]=process.argv.slice(2);const outdir=outdir0||b;
 fs.mkdirSync(outdir,{recursive:true});
 const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const pg=await br.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1.5});
 pg.on('console',m=>console.log('console:',m.text()));pg.on('pageerror',e=>console.log('pageerror:',e.message));
 await pg.goto('http://localhost:'+(process.env.PORT||8765)+'/episode.html');await pg.waitForTimeout(500);
 if(mode==='times'){for(const t of a.split(',')){await pg.evaluate(t=>render(t),parseFloat(t));await pg.screenshot({path:`${outdir}/t_${t}.png`});console.log('shot',t)}}
 else{const s=parseInt(a),e=parseInt(b);for(let i=s;i<e;i++){await pg.evaluate(t=>render(t),i/24);await pg.screenshot({path:`${outdir}/f_${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:90});if(i%40===0)console.log('frame',i)}}
 await br.close();srv.close();
})();
