import {createRequire} from 'module';import {spawn} from 'child_process';
const require=createRequire(import.meta.url);const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate','24','-vcodec','png','-i','-','-vf','scale=1080:1920:flags=lanczos,eq=contrast=1.08:saturation=.95,vignette=angle=PI/4','-c:v','libx264','-pix_fmt','yuv420p','-crf','22','../build/ep5/diego_prueba3d.mp4'],{stdio:['pipe','inherit','inherit']});
const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg=await br.newPage({viewport:{width:720,height:1280}});pg.on('console',m=>console.log('C:',m.text().slice(0,200)));pg.on('pageerror',e=>console.error('ERR',e.message.slice(0,300)));
await pg.goto('http://localhost:8770/show5.html');await pg.waitForFunction(()=>window.READY,null,{timeout:60000});
for(let i=0;i<24*9;i++){const t=i/24;const url=await pg.evaluate(t=>window.renderAt(t),t);const buf=Buffer.from(url.split(',')[1],'base64');if(i%24===0||i===60||i===100)require('fs').writeFileSync(`../build/ep5/sv_${i}.png`,buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.log('done');
