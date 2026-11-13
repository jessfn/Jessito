import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {limb as limbS,grp as grpS,hand as handW,handSkin,gripV2 as gripS} from '../char.mjs';
import {setCTM,mul,T,setHandTime} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,dust,setEV,speedAt} from '../ep3/scene.mjs';
import {shelter,table,defs5} from './scene5.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep5');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;
const inv=tn=>tn;const EVT=TL.ev;const DURL=TL.durs;const Ls=id=>START[id],Le=id=>START[id]+DURL[id];
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA',Sofi:'SOFI',Sargento:'SARGENTO',Radio:'RADIO'};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi'};
const FL=1510;
// ---- envelopes
function envelope(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>l.dur=l.env.length/FPS);
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}



// ---- camera shots [t,cx,cy,zoom,rot,mode,skew]
const S_=id=>START[id];
const SHOTS=[[0,1550,800,.78,0,'s',0],[1.2,1250,740,1.25,-2,'w',0],[3.0,1500,800,.8,0,'w',0],[7.4,1500,800,.7,0,'s',0],
 [S_('e1')-.1,1230,700,1.7,2,'n',0],[EVT.check-.2,1450,800,1.0,-2,'n',0],[EVT.check+1.5,1000,760,1.5,2,'s',0],[S_('e3')-.1,1690,720,1.7,-2,'n',0],
 [S_('e4')-.1,2050,720,1.6,2,'n',0],[EVT.close-1.2,800,900,1.05,-2,'w',0],[EVT.walk-3.2,1900,800,.85,0,'w',0],[EVT.walk+1.5,2800,800,.85,0,'s',0],
 [S_('e5')-.2,3500,430,1.5,3,'z',0],[S_('e6')-.2,2750,850,1.2,-2,'n',0],[S_('e6')+1.2,2450,780,1.6,2,'n',0],[S_('e7')-.1,3130,760,1.8,2,'n',0],
 [S_('e8')-.1,3700,760,1.6,-2,'n',0],[EVT.place-.5,3800,1050,2.0,0,'s',0],[S_('e9')-.1,3130,720,1.9,3,'w',0],[S_('e10')-.1,3200,760,1.6,-1,'n',0],
 [EVT.radio-.2,3650,1000,1.8,0,'s',0],[S_('e12')-.1,3560,820,1.2,-2,'n',0],[EVT.map-.2,3560,880,1.5,0,'s',0],[S_('e13')-.1,3700,740,1.7,2,'n',0],
 [S_('e14')-.1,2870,740,1.7,-2,'n',0],[S_('e15')-.1,3700,760,1.9,1,'s',0],[EVT.knock-.3,700,900,1.1,-3,'w',0],[S_('e16')+1.6,3000,800,.8,3,'w',0],[S_('e17')-.1,3500,760,1.5,0,'w',0]];
SHOTS.sort((x,y)=>x[0]-y[0]);
const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let c=ch(SHOTS[0]);for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SHOTS[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[EVT.close,40],[EVT.knock+.4,45],[EVT.knock+1.6,55],[EVT.knock+3,70],[EVT.alarm,30]];
function shakeAmp(t){let a=4.5+2*clamp((t-EVT.cam)/60,0,1);if(t<3)a+=6;if(t>EVT.knock&&t<EVT.black)a+=7;
 for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
const WHOL=['beto','diego','sofi','lucia','marta'];const SOL=['sgt','sol2','sol3'];
const A=(a,b,c,d,e,g)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e,sgt:g||'neutral',sol2:'neutral',sol3:'neutral'});
const EXL={
 e0:A('fear','fear','fear','fear','fear','scream'),e1:A('fear','fear','sad','fear','fear','annoyed'),e2:A('worry','worry','fear','worry','worry','neutral'),
 e3:A('sad','worry','fear','worry','worry','neutral'),e4:A('worry','worry','fear','worry','worry','annoyed'),e5:A('worry','worry','fear','worry','worry','neutral'),
 e6:A('worry','worry','sad','tender','worry','neutral'),e7:A('sad','worry','sad','sad','tender','neutral'),e8:A('sad','sad','sad','sad','tender','sad'),
 e9:A('sad','sad','scream','sad','sad','sad'),e10:A('sad','sad','sad','sad','tender','sad'),e11:A('worry','worry','sad','worry','worry','neutral'),
 e12:A('worry','worry','sad','worry','worry','neutral'),e13:A('shock','shock','sad','shock','shock','neutral'),e14:A('annoyed','shock','sad','shock','worry','neutral'),
 e15:A('annoyed','fear','fear','fear','fear','annoyed'),e16:A('fear','fear','fear','fear','fear','neutral'),e17:A('scream','scream','scream','scream','scream','scream')};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex=SOL.includes(who)?'neutral':'worry';if(tn<START.e0)return'fear';
 for(const l of LINES){if(!EXL[l.id])continue;const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.1*Math.max(0,idx));if(tn<t0)break;ex=EXL[l.id][who]||ex}
 return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3,flat:0};
const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};
const J=EVT;
const WK=S_('e4')+.3,WK2=WK+4.8;
const FORM={lucia:800,sofi:1030,diego:1230,beto:1450,marta:1690};
const FIN={lucia:2450,diego:2650,beto:2870,sofi:3130,marta:3330};
function xOf(who,t){
 if(who==='sgt'){const a=2050;if(t<J.check)return a;if(t<J.check+2)return lerp(a,1900,sstep((t-J.check)/2));if(t<WK)return lerp(1900,a,sstep((t-J.check-5)/1.5)) ;if(t<WK2)return lerp(a,3700,sstep((t-WK)/(WK2-WK)));return 3700}
 if(who==='sol2'){return lerp(2300,2150,sstep((t-WK)/2))}
 if(who==='sol3'){if(t<WK-.2)return 2550;if(t<J.close)return lerp(2550,800,sstep((t-WK+.2)/(J.close-WK-.1)));if(t<J.knock)return 800;return lerp(800,1000,sstep((t-J.knock)/1.4))}
 let x=FORM[who];
 if(t>=WK){const u=sstep((t-WK)/(WK2-WK));x=lerp(FORM[who],FIN[who],u)}
 if(who==='marta'&&t>=S_('e10')-.5)x=lerp(FIN.marta,3260,sstep((t-S_('e10')+.5)/1.2));
 if(who==='sofi'&&t>=S_('e10')-.5)x=lerp(FIN.sofi,3140,sstep((t-S_('e10')+.5)/1.2));
 if(who==='sofi'&&t<S_('e8'))x=x;
 return x}
function velX(who,t){return(xOf(who,t+.08)-xOf(who,t-.08))/.16}
function ampOf(who,t){let a=clamp(Math.abs(velX(who,t))/210,0,1.3);if(who==='beto')a*=.55;return a}
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const UP={L:{w:[96,150],hand:'open'},R:{w:[404,150],hand:'open'}};
const UPH={L:{w:[100,170],hand:'open'},R:{w:[400,170],hand:'open'}};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const HOLD={L:{w:[100,430],hand:'relax'},R:REL.R};
const AIM={L:{w:[-40,272],hand:'relax'},R:{w:[114,282],hand:'relax'}};
const KF={
 beto:[[0,UP],[WK-1,{L:{w:[40,232],hand:'relax'},R:{w:[460,232],hand:'relax'}}],[S_('e14')-.1,{L:{w:[40,232],hand:'relax'},R:{w:[560,230],hand:'point'}}],[Le('e14')+.4,{L:{w:[40,232],hand:'relax'},R:{w:[460,232],hand:'relax'}}]],
 diego:[[0,UP],[S_('e3')+1.5,UPH],[S_('e4'),{L:REL.L,R:{w:[400,430],hand:'relax'}}],[S_('e8'),{L:{w:[120,400],hand:'relax'},R:{w:[400,430],hand:'relax'}}]],
 sofi:[[0,UP],[S_('e4'),{L:{w:[134,330],hand:'open'},R:REL.R}],[S_('e7')-.1,MOUTH()],[Le('e7')+.3,{L:{w:[134,330],hand:'open'},R:REL.R}],[S_('e9')-.2,MOUTH()],[S_('e10')+.6,{L:{w:[400,300],hand:'open'},R:{w:[350,260],hand:'open'}}]],
 lucia:[[0,UP],[S_('e3')+1.5,UPH],[S_('e4'),{L:REL.L,R:{w:[350,440],hand:'relax'}}],[S_('e6')-.1,{L:REL.L,R:{w:[480,300],hand:'point'}}],[Le('e6')+.3,{L:REL.L,R:{w:[350,440],hand:'relax'}}],[J.knock,MOUTH()]],
 marta:[[0,UP],[S_('e3')-.1,{L:UP.L,R:{w:[420,300],hand:'open'}}],[S_('e4'),HOLD],[S_('e10')+.5,{L:{w:[100,300],hand:'open'},R:{w:[100,330],hand:'open'}}],[Le('e10')+.5,HOLD]],
 sgt:[[0,AIM],[S_('e4')-.2,REL],[S_('e8')+.5,{L:REL.L,R:{w:[380,420],hand:'open'}}],[J.place-.3,{L:REL.L,R:{w:[300,440],hand:'open'}}],[S_('e12')-.1,{L:REL.L,R:{w:[430,180],hand:'point'}}],[Le('e12')+.4,REL],[S_('e17')-.2,{L:REL.L,R:{w:[470,200],hand:'point'}}]],
 sol2:[[0,AIM],[S_('e4')-.2,REL]],
 sol3:[[0,AIM],[S_('e4')-.2,{L:{w:[40,260],hand:'open'},R:REL.R}],[J.close+.8,REL],[J.knock-.2,AIM]]};
const SH={L:[186,240],R:[314,240]};
const ease=x=>{x=clamp(x);const c1=1.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function polar(sh,a,b,u){const ra=Math.hypot(a[0]-sh[0],a[1]-sh[1]),rb=Math.hypot(b[0]-sh[0],b[1]-sh[1]);let ta=Math.atan2(a[1]-sh[1],a[0]-sh[0]),tb=Math.atan2(b[1]-sh[1],b[0]-sh[0]);let d=tb-ta;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const th=ta+d*u,rr=ra+(rb-ra)*u;return[sh[0]+Math.cos(th)*rr,sh[1]+Math.sin(th)*rr]}
function kfAt(arr,t){let i=0;while(i+1<arr.length&&arr[i+1][0]<=t)i++;const cur=arr[i][1],prev=i>0?arr[i-1][1]:cur;const uu=clamp((t-arr[i][0])/.6);const u=ease(uu);const out={};for(const s of ['L','R']){const a=prev[s],b=cur[s];const pick=uu>.3?b:a;const side=s==='L'?-1:1;out[s]={w:polar(SH[s],a.w,b.w,u),hand:pick.hand,prop:pick.prop,fs:lerp(a.fs||1,b.fs||1,u),rot:pick.rot,front:pick.front};
 if(a.e||b.e){const ea=a.e||elbow(SH[s],a.w,side,a.fs||1),eb=b.e||elbow(SH[s],b.w,side,b.fs||1);out[s].e=polar(SH[s],ea,eb,u)}}return out}
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
// ---- facing: where each character looks/turns (smoothed so the whole body turns progressively)
function faceTarget(who,t){const sp=speakerAt(t);const x=xOf(who,t);
 const v=velX(who,t);if(Math.abs(v)>25)return Math.sign(v)*.95;
 if(SOL.includes(who)){if(who==='sol3'&&t>=J.close-.5&&t<J.close+1)return -.95;if(t<WK)return -.85;if(who==='sgt'){if(t>=J.place-.5&&t<J.place+3)return -.4;if(t>=S_('e12')&&t<Le('e13'))return .6;if(t>=S_('e8')&&t<Le('e8'))return -.7;return -.35}return who==='sol3'?-.9:-.8}
 if(t<WK){if(t>=J.check&&t<J.check+5)return .6;return .55}
 if(t>=S_('e5')&&t<Le('e5')+.5)return .2;
 if(t>=S_('e6')&&t<Le('e6'))return -.45;
 if(t>=S_('e10')-.2&&t<Le('e10')+.8){if(who==='marta')return -.9;if(who==='sofi')return .9;}
 if(t>=J.radio&&t<S_('e12')){return .85}
 if(t>=J.map-.3&&t<Le('e13'))return .85;
 if(t>=J.knock)return -.9;
 if(sp&&sp.who!=='Tomas'&&sp.who!=='Radio'){const k=sp.who==='Sargento'?'sgt':WHOKEY[sp.who];if(k&&k!==who)return clamp((xOf(k,t)-x)/600,-1,1)*.85}
 return .3}
function yawOf(who,t){let a=0,w=0;for(let k=0;k<10;k++){const wk=Math.exp(-k/3.2);a+=faceTarget(who,t-k*.07)*wk;w+=wk}return a/w}
function lookAt(who,t,tn){const y=yawOf(who,t);return[clamp(y,-1,1),.1]}
const SOLX={sgt:'sgt',sol2:'sol2',sol3:'sol3'};
const AIMT={sgt:()=>xOf('diego',0),sol2:()=>xOf('marta',0),sol3:()=>xOf('lucia',0)};
function aimAmt(who,t){if(t<S_('e4')-.3)return 1;if(who==='sol3'&&t>=J.knock-.3)return sstep((t-J.knock+.3)/.4);return 0}
function rifleSVG(who,t,x){const aim=aimAmt(who,t);const hy=785;let s='';const dir=-1;
 if(aim>.05){const x2=x-215,x1=x+55;s+=`<g><rect x="${x2}" y="${hy-18}" width="${x1-x2}" height="22" rx="6" fill="#14171a" stroke="#050607" stroke-width="3"/><rect x="${x1-18}" y="${hy-26}" width="60" height="38" rx="8" fill="#2a2e30" stroke="#050607" stroke-width="3"/><rect x="${x2+110}" y="${hy+2}" width="22" height="58" rx="4" fill="#0e1012"/><rect x="${x2-12}" y="${hy-10}" width="20" height="8" fill="#0a0b0c"/><rect x="${x2+60}" y="${hy-30}" width="60" height="14" rx="4" fill="#1d2022"/><rect x="${x2+20}" y="${hy-6}" width="130" height="4" fill="#fff" fill-opacity=".15"/></g>`;
  if(t<S_('e4')){const tx=AIMT[who]()+Math.sin(t*3+x)*14,ty=565+Math.sin(t*2.3+x)*10;s+=`<line x1="${x2-12}" y1="${hy-14}" x2="${tx}" y2="${ty}" stroke="#ff2a2a" stroke-width="3" stroke-opacity=".75"/><circle cx="${tx}" cy="${ty}" r="9" fill="#ff2a2a"/><circle cx="${tx}" cy="${ty}" r="46" fill="url(#redGl5)" fill-opacity=".8"/>`}
  else if(who==='sol3'&&t>=J.knock-.3){const tx=300,ty=hy;s+=`<line x1="${x2-12}" y1="${hy-14}" x2="${tx}" y2="${ty}" stroke="#ff2a2a" stroke-width="3" stroke-opacity=".7"/>`}}
 else{const x1=x-60;s+=`<g transform="rotate(62 ${x1} 900)"><rect x="${x1-100}" y="880" width="190" height="20" rx="6" fill="#14171a" stroke="#050607" stroke-width="3"/><rect x="${x1+40}" y="868" width="60" height="34" rx="8" fill="#2a2e30" stroke="#050607" stroke-width="3"/></g>`}
 return s}
function helmet(x,y,yaw){const ox=yaw*8;return `<g><path d="M${x+ox-82},${y-12} Q${x+ox-86},${y-100} ${x+ox},${y-108} Q${x+ox+86},${y-100} ${x+ox+82},${y-12} Q${x+ox},${y-34} ${x+ox-82},${y-12}Z" fill="#4a5532" stroke="#14170e" stroke-width="6"/><path d="M${x+ox-60},${y-70} Q${x+ox},${y-92} ${x+ox+60},${y-70}" stroke="#fff" stroke-width="4" fill="none" opacity=".15"/><rect x="${x+ox-82}" y="${y-30}" width="164" height="12" rx="5" fill="#2a3220"/></g>`}
function charSVG(who,t,shock,tn){const st=CAST[who];const isS=SOL.includes(who);const pose=kfAt(KF[who],t);const sp=speakerAt(tn);
 const spk=sp&&(sp.who==='Sargento'?'sgt':WHOKEY[sp.who]);const talk=spk===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.7):0;
 const idx=isS?5+SOL.indexOf(who):WHOL.indexOf(who);const bl=blinkAt(idx*.37,t);
 const yaw=yawOf(who,t);const lk=[clamp(yaw*.8,-1,1),.1];
 const br=Math.sin(t*1.9+idx)*(who==='sofi'&&t>S_('e9')?2.2:1);const sway=Math.sin(t*.8+idx*2)*.8+Math.sin(t*9+idx)*.5*quakeLvl(t);
 const amp=ampOf(who,t);const phase=t*6.2+idx*.9;
 for(const s of ['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+(t<S_('e4')&&!isS?Math.sin(t*11+idx+(s==='L'?0:1))*3:0)]}
 const ex=exprNew(who,tn);pose.walk={phase,amp};
 pose.expr=ex;pose.blink=bl;pose.look=[lk[0]*.5,lk[1]];pose.talk=talk;pose.breath=br;pose.byaw=yaw;
 pose.head={rot:(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.2:0)+(who==='sofi'&&t>S_('e9')?5:0),dx:0,yaw:0,dy:Math.sin(t*1.9+idx)*1.2+(ex==='shock'||ex==='scream'?-4:0)+Math.abs(Math.sin(phase))*-5*amp};
 let s=who==='sofi'?1.05:1.5,x=xOf(who,t),fy=FL;let rot=sway+(who==='beto'?9+Math.sin(phase)*2*amp:0);let yoff=-Math.abs(Math.sin(phase))*9*amp*(who==='sofi'?.6:1);
 const Mch=mul(mul(T(x-250*s,fy-752*s+yoff,0,s,s),T(250,752)),mul(T(0,0,rot,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 let extra='';if(isS){extra=helmet(x,544+yoff,yaw)+rifleSVG(who,t,x)}
 return `<ellipse cx="${x}" cy="${fy+10}" rx="${190*s/1.5}" ry="${28*s/1.5}" fill="#000" opacity=".5"/><g transform="translate(${x-250*s},${fy-752*s+yoff}) scale(${s}) rotate(${rot.toFixed(2)} 250 752)">${bd}</g>${extra}`}

// ---- overlays (Reels safe zones: top 230, bottom 330, right 120)
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),22);const fs=lines.length>2?50:56;let s='';const y0=1440-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="520" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="520" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]||sp.who}</text>`+s}
function hud(t){const el=Math.max(0,t-EVT.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="270" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="282" font-size="38" font-weight="700">REC</text><text x="640" y="282" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="1575" font-size="30">SEP 18 2025  00:12</text><text x="700" y="1575" font-size="30">SP ▮▮▮▯</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,236h60M50,236v60M960,236h-60M960,236v60M50,1600h60M50,1600v-60M960,1600h-60M960,1600v-60"/><path d="M480,930h60M510,900v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
function title(t){const u=t-4.7;const ser=`<text x="540" y="300" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.1)?10:2;
 const T=(x,fill,op)=>`<text x="${x}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="${fill}" fill-opacity="${op}">CAPÍTULO 5</text>`;
 return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}">${T(540-g,'#ff2a3a',.7)}${T(540+g,'#2af0ff',.6)}${T(540,'#fff',1)}<rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1080" text-anchor="middle" font-family="Inter" font-weight="900" font-size="96" letter-spacing="2" fill="#fff" stroke="#000" stroke-width="3">LOS SOLDADOS</text></g>`}
function endcard(t){const u=t-EVT.endcard;const fade=clamp(u/.6);return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fade}"><text x="540" y="520" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="38" fill="#9aa4ae">// CINTA 5 — FIN DEL REGISTRO</text><text x="540" y="700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff2a3a" letter-spacing="6">PRÓXIMO CAPÍTULO</text><text x="540" y="800" text-anchor="middle" font-family="Inter" font-weight="900" font-size="70" fill="#fff">CAPÍTULO 6 | LA DECISIÓN</text>${u>2?`<text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#ffd54a">¿QUIÉN SUBE AL HELICÓPTERO?</text><text x="540" y="1100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">A) LOS MÁS JÓVENES</text><text x="540" y="1180" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">B) LOS MÁS FUERTES</text>`:''}${u>4?`<text x="540" y="1400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="52" fill="#2af0ff">COMENTA TU ELECCIÓN</text><text x="540" y="1480" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42" fill="#fff">SÍGUEME PARA EL CAPÍTULO 6</text>`:''}</g>`}
// ---- operator hand (the person filming)
function opState(t,tgt){const sw=Math.sin(t*1.3)*10+Math.sin(t*3.1)*5;let wx=800+sw,wy=1650+Math.sin(t*1.7)*8,ang=-32,bx=tgt?tgt[0]:560,by=tgt?tgt[1]:900;
 let on=t<S_('e2')+2?1:(t>=EVT.knock-1&&t<EVT.alarm?(Math.sin(t*30)>0?1:.2):0);
 if(on===0){wy=1700+Math.sin(t*1.7)*8;ang=-18}
 if(t>=EVT.knock&&t<EVT.knock+3)wx+=Math.sin(t*28)*10;
 if(t>=EVT.black-1.6){const u=t-(EVT.black-1.6);wy-=u*u*40}
 return {wx,wy,ang,sc:3.0,bx,by,on}}
function operatorHand(t,tgt){const S=opState(t,tgt);const st=CAST.tomas;const a=S.ang*Math.PI/180;const ox=S.wx+S.sc*114*Math.sin(a),oy=S.wy-S.sc*114*Math.cos(a);
 let s='';
 const sleeve=limbS([S.wx+330,S.wy+520],[S.wx+10,S.wy+50],170,120);setCTM([1,0,0,1,0,0]);
 s+=grpS(sleeve,st.hood,st,[S.wx-200,S.wy-100,700,800],{ow:5,sd:8});
 s+=`<path d="M${(S.wx-70).toFixed(0)},${(S.wy+30).toFixed(0)} q70,50 140,0" stroke="#15181c" stroke-width="6" fill="none" opacity=".5"/>`;
 setCTM(T(S.wx,S.wy,S.ang,S.sc,S.sc));const hnd=gripS(st,'flash');setCTM([1,0,0,1,0,0]);
 s+=`<g transform="translate(${S.wx.toFixed(1)},${S.wy.toFixed(1)}) rotate(${S.ang}) scale(${S.sc})">${hnd}</g>`;
 if(S.on){const dx=S.bx-ox,dy=S.by-oy,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;s=`<polygon points="${(ox+nx*10).toFixed(0)},${(oy+ny*10).toFixed(0)} ${(S.bx+nx*330).toFixed(0)},${(S.by+ny*330).toFixed(0)} ${(S.bx-nx*330).toFixed(0)},${(S.by-ny*330).toFixed(0)} ${(ox-nx*10).toFixed(0)},${(oy-ny*10).toFixed(0)}" fill="#e8f2ff" fill-opacity=".16"/>`+s}
 if(t>=EVT.black-.9&&t<EVT.black){const u=clamp((t-EVT.black+.9)/.4);setCTM(T(540,980,-8,8*u+.1,8*u+.1));const hp=handSkin('open',st);setCTM([1,0,0,1,0,0]);s+=`<g transform="translate(540,980) rotate(-8) scale(${(8*u+.1).toFixed(2)})"><g transform="translate(-30,-30)">${hp}</g></g>`}
 return {svg:s,bx:S.bx,by:S.by,on:S.on}}
// ---- scene composition
const w2s=(x,y)=>[CAMM[0]*x+CAMM[2]*y+CAMM[4],CAMM[1]*x+CAMM[3]*y+CAMM[5]];
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 BLURV=blur;setHandTime(t);
 let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 const rr=(rot+sr)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);const cor=[[-540,-960],[540,-960],[540,960],[-540,960]].map(([px,py])=>[cx+(px*cs+py*sn)/z,cy+(-px*sn+py*cs)/z]);const vx0=Math.min(...cor.map(c=>c[0])),vx1=Math.max(...cor.map(c=>c[0])),vy0=Math.min(...cor.map(c=>c[1])),vy1=Math.max(...cor.map(c=>c[1]));
 const al=t>=EVT.alarm?clamp((t-EVT.alarm)/.5):0;
 const doorU=t<S_('e4')?0:sstep((t-EVT.close+.8)/1.2);const dent=t>=EVT.knock?clamp((t-EVT.knock)/5):0;
 w+=shelter(t,{doorU,dent,alarm:al,mapU:sstep((t-EVT.map)/1.2)});
 // flashlight scan of arms by the sergeant
 if(t>=EVT.check&&t<EVT.check+5.5){const u=clamp((t-EVT.check)/5);const hx=xOf('sgt',t)-90,hy=790;const tx=lerp(1700,800,u),ty=680;w+=`<polygon points="${hx},${hy} ${tx-130},${ty-110} ${tx+130},${ty+160}" fill="#fff6d8" fill-opacity=".28"/><ellipse cx="${tx}" cy="${ty+30}" rx="150" ry="210" fill="url(#whiteGl5)" fill-opacity=".35"/><circle cx="${hx}" cy="${hy}" r="14" fill="#fff"/>`}
 const order=['sol3','sol2','sgt','sofi','lucia','beto','marta','diego'];
 order.forEach(k=>{const x=xOf(k,t);if(x+700<vx0||x-700>vx1||1580<vy0||200>vy1)return;w+=charSVG(k,t,q,tn)});
 w+=table(t,{radio:t>=EVT.radio&&t<Le('e11')+.6?1:0,place:sstep((t-EVT.place)/.6)});
 w+=dust(t,q*.4);
 w+=`</g>`;
 let tgt=[1500,850];if(t<S_('e4'))tgt=[2050,780];else if(t>=EVT.walk-3&&t<EVT.walk+2)tgt=[1900,820];
 const tw=w2s(tgt[0],tgt[1]);const op=operatorHand(t,[tw[0],tw[1]]);
 const aE=.42+.18*al;
 w+=`<defs><radialGradient id="dk" gradientUnits="userSpaceOnUse" cx="${op.bx.toFixed(0)}" cy="${op.by.toFixed(0)}" r="1100"><stop offset="0" stop-color="#02040a" stop-opacity="0"/><stop offset=".3" stop-color="#02040a" stop-opacity="${(aE*.12).toFixed(2)}"/><stop offset=".65" stop-color="#02040a" stop-opacity="${(aE*.7).toFixed(2)}"/><stop offset="1" stop-color="#02040a" stop-opacity="${aE.toFixed(2)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dk)"/>`;
 w+=`<rect width="${W}" height="${H}" fill="${al>0?'#ff2a1a':'#9ac8ff'}" fill-opacity="${(al>0?.08*al*(.5+.5*Math.sin(t*8)):.035).toFixed(3)}"/>`;
 w+=op.svg;
 let fl=0;for(const [ft,k] of [[EVT.knock+.4,.4],[EVT.knock+1.6,.4],[EVT.knock+3,.5],[EVT.close,.35],[EVT.alarm,.5]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 w+=`<rect width="${W}" height="${H}" fill="#fff0d8" opacity="${fl.toFixed(2)}"/>`;
 return w}

function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=tn;let inner,hudOn=false;
 if(t<4.6)inner=sceneWorld(t,tn);else if(t<4.7)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7.1)inner=title(t);else if(t<EVT.cam)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 else if(t<EVT.black){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=EVT.cam&&t<EVT.cam+.25)g=.6;if(t<.35)g=.7;if(t>=EVT.knock+.4&&t<EVT.knock+.6)g=.4;if(t>=EVT.black-1.0&&t<EVT.black)g=.6;
 if(t>=EVT.black&&t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=EVT.black))?hud(tn)+caption(tn):((t<4.6||(t>=4.7&&t<EVT.cam))?caption(tn):'');
 const head=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
 const dfs=defsScene+defs5+defs(CAST.beto);
 if(mode==='parts')return{full:fixOp(head+dfs+out+ov+'</svg>'),base:fixOp(head+dfs+out+'</svg>'),overlay:fixOp(head+ov+'</svg>'),blur:BLURV};
 return fixOp(head+dfs+out+ov+'</svg>')}
function boxBlur(px,w,h,rad){const t=new Uint8ClampedArray(px.length);const pass=(src,dst,horiz)=>{const n=horiz?w:h,m=horiz?h:w,st=horiz?4:4*w,ln=horiz?4*w:4;const d=2*rad+1;for(let k=0;k<m;k++){const base=k*ln;for(let c=0;c<4;c++){let sum=0;const idx=i=>base+Math.min(n-1,Math.max(0,i))*st+c;for(let i=-rad;i<=rad;i++)sum+=src[idx(i)];for(let i=0;i<n;i++){dst[base+i*st+c]=sum/d;sum+=src[idx(i+rad+1)]-src[idx(i-rad)]}}}};pass(px,t,true);pass(t,px,false)}
function renderPng(t){const P=frame(t,'parts');const opt={font:{loadSystemFonts:true,defaultFontFamily:'Inter'},fitTo:{mode:'original'}};
 if(P.blur<=.8)return new Resvg(P.full,opt).render();
 const b=new Resvg(P.base,opt).render();const px=Uint8ClampedArray.from(b.pixels);const rad=Math.max(1,Math.round(P.blur*1.3));boxBlur(px,W,H,rad);boxBlur(px,W,H,Math.max(1,Math.round(rad*.7)));
 const o=new Resvg(P.overlay,opt).render().pixels;for(let i=0;i<px.length;i+=4){const a=o[i+3]/255;if(a>0){px[i]=o[i]*a+px[i]*(1-a);px[i+1]=o[i+1]*a+px[i+1]*(1-a);px[i+2]=o[i+2]*a+px[i+2]*(1-a)}}
 return{pixels:Buffer.from(px.buffer),asPng:()=>new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="1" height="1"/></svg>`).render().asPng()}}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(mode==='preview'){for(const a of process.argv.slice(3)){const t=parseFloat(a);const t0=Date.now();{const rp=renderPng(t);spawnSync('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-i','-',path.join(BUILD,`prev_${a}.png`)],{input:Buffer.from(rp.pixels.buffer?rp.pixels:rp.pixels),maxBuffer:1e8})}console.log(a,Date.now()-t0,'ms')}}
 else if(mode==='part'||mode==='seg'){const i=+process.argv[3],n=+process.argv[4];const total=DUR*FPS;let a=Math.floor(total*i/n),b=Math.floor(total*(i+1)/n);let outName=`part_${i}.mp4`;if(mode==='seg'){a=Math.round(+process.argv[3]*FPS);b=Math.round(+process.argv[4]*FPS);outName=process.argv[5]}
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf','gblur=sigma=0.7,eq=contrast=1.07:saturation=0.85,rgbashift=rh=-2:bh=2,noise=alls=11:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,outName)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS,camera,sceneWorld,LINES,EVT,xOf};
