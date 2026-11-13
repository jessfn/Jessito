import fs from 'fs';import {spawnSync} from 'child_process';
const TL=JSON.parse(fs.readFileSync('../ep5/timeline.json','utf8'));const script=JSON.parse(fs.readFileSync('../ep5/script.json','utf8'));
const FPS=24;
function env(id){const r=spawnSync('ffmpeg',['-v','error','-i',`../build/ep5/voz_t/${id}.mp3`,'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>+Math.max(v,(nn[i-1]||0)*.55).toFixed(3))}
const lines=script.map(l=>({id:l.id,who:l.who,text:l.text,t0:TL.start[l.id],env:env(l.id)}));
fs.writeFileSync('ep5_state.json',JSON.stringify({fps:FPS,ev:TL.ev,start:TL.start,durs:TL.durs,dur:TL.dur,lines}));
console.log('ok',lines.length,TL.dur);
