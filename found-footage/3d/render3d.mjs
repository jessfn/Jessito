import {createRequire} from 'module';import {spawn,spawnSync} from 'child_process';import fs from 'fs';import path from 'path';
const require=createRequire(import.meta.url);const {chromium}=require('/opt/node22/lib/node_modules/playwright');
import {Resvg} from '@resvg/resvg-js';
const R=await import('../ep2/render.mjs');
const [,, wi, wn, f0s, f1s]=process.argv;const ST=JSON.parse(fs.readFileSync('state_ep2.json','utf8'));const N=ST.N,FPS=ST.fps,EV=ST.ev;
const total=N;const a=f0s!==undefined?+f0s:Math.floor(total*wi/wn),b=f1s!==undefined?+f1s:Math.floor(total*(+wi+1)/wn);
const OUT=process.env.OUT||`../build/ep2/p3d_${wi}.mp4`;
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-vcodec','png','-i','-','-vf','scale=1080:1920:flags=lanczos,gblur=sigma=0.6,eq=contrast=1.08:saturation=0.92,rgbashift=rh=-2:bh=2,noise=alls=10:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',OUT],{stdio:['pipe','inherit','inherit']});
const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg=await br.newPage({viewport:{width:720,height:1280}});pg.on('pageerror',e=>console.error('PAGEERR',e.message.slice(0,300)));
await pg.goto('http://localhost:8768/index.html?w=720');await pg.waitForTimeout(500);await pg.evaluate(()=>window.initScene('state_ep2.json'));
const opt={fitTo:{mode:'width',value:720},font:{loadSystemFonts:true,defaultFontFamily:'Inter'}};
const write=buf=>new Promise(r=>{if(!ff.stdin.write(buf))ff.stdin.once('drain',r);else r()});
for(let i=a;i<b;i++){const t=i/FPS;let png;
 if(t<2.8||(t>=EV.cam&&t<EV.black)){const url=await pg.evaluate(i=>window.renderFrame(i),i);png=Buffer.from(url.split(',')[1],'base64')}
 else{const svg=R.frame2d(t);png=new Resvg(svg,opt).render().asPng()}
 await write(png);if((i-a)%48===0)console.error('worker',wi,i-a,'/',b-a)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.error('worker',wi,'done');
