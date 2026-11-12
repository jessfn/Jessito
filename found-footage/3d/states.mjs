import * as R from '../ep2/render.mjs';
import {descent,speedAt,getLand,EV} from '../ep2/scene.mjs';
import {KF,kfAt} from '../ep2/render.mjs';
import fs from 'fs';
const {camera,focusBlur,shakeAmp,quakeLvl,nz,opState,LINES,EVT,POSX,WHOL,HEADROT,exprNew,look,blinkAt,speakerAt,Ls,TL}=R;
const FPSO=+(process.env.FPSO||24);const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const N=Math.ceil(TL.dur*FPSO);const out=[];
for(let i=0;i<N;i++){const t=i/FPSO,tn=t;const [cx,cy,z,rot,sk]=camera(t);const a=shakeAmp(t);
 const run=t>EVT.run&&t<EVT.collapse;const sp_=speedAt(t);const amp=clamp(sp_/380,0,2.2);
 const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8+Math.sin(t*(run?11:6.2))*(sp_/380)*10,sr=nz(t+9,.9)*a*.04;
 const chars={};
 for(const who of WHOL){const idx=WHOL.indexOf(who);const pose=kfAt(KF[who],t);const sp=speakerAt(tn);const talk=sp&&R.NAMES&&sp.who&&({Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi'}[sp.who]===who)?clamp((sp.env[Math.floor((tn-sp.t0)*R.FPS)]||0)*1.7):0;
  const phase=t*(run?11:6.2)+idx*.9;
  for(const s of ['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+Math.sin(t*14+idx)*2*quakeLvl(t)]}
  const ex=exprNew(who,tn);const lk=look(who,t,tn);
  let yoff=-Math.abs(Math.sin(phase))*9*amp*(who==='sofi'?.6:1),rr=Math.sin(t*.8+idx*2)*.8+Math.sin(t*9+idx)*.5*quakeLvl(t);
  if(who==='beto'&&t>EVT.collapse){const u=clamp((t-EVT.collapse)/.5);yoff+=u*70;rr+=u*7}
  const hd={rot:lk[0]*3+(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.2:0),dy:Math.sin(t*1.9+idx)*1.2};
  chars[who]={x:POSX[who],ex,blink:+blinkAt(idx*.37,t).toFixed(3),look:lk,talk:+talk.toFixed(3),head:hd,walk:{phase,amp},yoff,rot:rr,breath:Math.sin(t*1.9+idx),L:pose.L,R:pose.R}}
 const op=opState(t);
 let fl=0;for(const [ft,k] of [[EVT.gstep,.5],[EVT.collapse,.7],[EVT.wallburst,.95],[EVT.smash,.35],[EVT.fall,.8]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 out.push({i,t,cam:[cx,cy,z,rot,sk],shake:[sx,sy,sr],q:quakeLvl(t),D:descent(t),speed:sp_,chars,op:{wx:op.wx,wy:op.wy,ang:op.ang,bx:op.bx,by:op.by,on:op.on},flash:fl,
  sofiOn:t>=Ls('a7')-.5,blur:focusBlur(t),hud:(t>=EVT.cam&&t<EVT.black-1.2),cap:(()=>{const sp=speakerAt(tn);if(!sp||!(t>=EVT.cam&&t<EVT.black-1.2))return null;const w=sp.text.replace(/\.\.\./g,'…').split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>24){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return {name:R.NAMES[sp.who]||sp.who,lines:out}})(),glitch:(t>=EVT.fall-.1&&t<EVT.black)?Math.min(1,(t-EVT.fall+.1)/1.2)*.9+.2:(t>=EVT.cam&&t<EVT.cam+.25?.6:0),fallBlack:(t>=EVT.fall+.9?Math.min(1,(t-EVT.fall-.9)/.4):0)})}
fs.writeFileSync('3d/state_ep2.json',JSON.stringify({fps:FPSO,N,land:getLand(),ev:EVT,posx:POSX,durs:TL.durs,start:TL.start,frames:out},(k,v)=>typeof v==='number'?+v.toFixed(3):v));
console.log('states',N,'land',getLand());
