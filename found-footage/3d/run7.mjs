import {createRequire} from 'module';import {spawn} from 'child_process';import fs from 'fs';
const require=createRequire(import.meta.url);const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [,,mode,a0,a1,out]=process.argv;const ST=JSON.parse(fs.readFileSync('ep5_state.json','utf8'));const FPS=ST.fps;const N=Math.ceil(ST.dur*FPS);
const W=+(process.env.W||720);
const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg=await br.newPage({viewport:{width:W,height:Math.round(W*16/9)}});pg.on('console',m=>{const s=m.text();if(!/PCFSoft/.test(s))console.log('C:',s.slice(0,200))});pg.on('pageerror',e=>console.error('ERR',e.message.slice(0,400)));
await pg.goto(`http://localhost:8770/show7.html?w=${W}`);await pg.waitForFunction(()=>window.READY,null,{timeout:180000});
if(mode==='frames'){for(const t of a0.split(',')){const url=await pg.evaluate(i=>window.renderFrame(i),Math.round(+t*FPS));fs.writeFileSync(`../build/ep5/f7_${t}.png`,Buffer.from(url.split(',')[1],'base64'));console.log('f',t)}}
else{const f0=+a0,f1=Math.min(N,+a1);const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-vcodec','png','-i','-','-vf','scale=1080:1920:flags=lanczos,gblur=sigma=0.6,eq=contrast=1.06:saturation=0.95,noise=alls=8:allf=t','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
 for(let i=f0;i<f1;i++){const url=await pg.evaluate(i=>window.renderFrame(i),i);const buf=Buffer.from(url.split(',')[1],'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if((i-f0)%48===0)console.error('frame',i-f0,'/',f1-f0)}ff.stdin.end();await new Promise(r=>ff.on('close',r))}
await br.close();console.log('done');
