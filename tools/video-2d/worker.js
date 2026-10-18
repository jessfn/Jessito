const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');const fs=require('fs');
const [idx,a,b,port]=process.argv.slice(2).map(Number);const FPS=30;
(async()=>{const srv=await require('./srv.js')(port,__dirname);
const br=await chromium.launch({args:['--no-sandbox']});
const p=await br.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('err',e.message.slice(0,300)));
await p.goto(`http://localhost:${port}/scene.html`);await p.waitForFunction('window.ready',null,{timeout:120000});
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-vcodec','mjpeg','-i','-','-c:v','libx264','-preset','fast','-crf','15','-pix_fmt','yuv420p','-r',String(FPS),`p_${idx}.mp4`],{stdio:['pipe','inherit','inherit']});
for(let n=a;n<b;n++){const d=await p.evaluate(t=>{frame(t);return document.getElementById('c').toDataURL('image/jpeg',0.95)},n/FPS);
 const buf=Buffer.from(d.split(',')[1],'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
 if((n-a)%20==0)fs.writeFileSync(`prog_${idx}.txt`,`${n-a}/${b-a}`);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();srv.close();fs.writeFileSync(`prog_${idx}.txt`,'DONE');})();
