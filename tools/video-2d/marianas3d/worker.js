const { chromium } = require('/opt/node22/lib/node_modules/playwright');const {spawn}=require('child_process');
const [part,nparts,fps,total]=process.argv.slice(2).map(Number);
(async()=>{const port=8990+part;const srv=await require('./srv.js')(port,__dirname);const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('err',e.message.slice(0,300)));
await p.goto(`http://localhost:${port}/scene.html?s=2`);await p.waitForFunction('window.ready',null,{timeout:240000});
const N=Math.round(total*fps),per=Math.ceil(N/nparts),a=part*per,e=Math.min(N,a+per);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p','-f','mp4',`out/c_${String(part).padStart(2,"0")}.mp4.tmp`],{stdio:['pipe','inherit','inherit']});
for(let i=a;i<e;i++){const d=await p.evaluate(t=>{frame(t);return document.getElementById('c').toDataURL('image/jpeg',0.93).slice(23)},i/fps);
if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));if((i-a)%100==0)console.log(part,i-a,'/',e-a);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));require('fs').renameSync('out/c_'+String(part).padStart(2,'0')+'.mp4.tmp','out/c_'+String(part).padStart(2,'0')+'.mp4');console.log('done',part);await b.close();srv.close();})();
