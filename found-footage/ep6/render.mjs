import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {limb as limbS,grp as grpS,hand as handW,handSkin,gripV2 as gripS} from '../char.mjs';
import {setCTM,mul,T,setHandTime,EX} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,dust,setEV,speedAt} from '../ep3/scene.mjs';
import {defs6,sky,skyline,tower,heli,roofBack,roof,pad,FLOOR} from './scene6.mjs';
import {colossus,smokeBlob,faceFront} from './monster.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep6');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;const S_=id=>START[id];
const inv=tn=>tn;const EVT=TL.ev;const DURL=TL.durs;const Ls=id=>START[id],Le=id=>START[id]+DURL[id];
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA',Sofi:'SOFI',Sargento:'SARGENTO',Radio:'RADIO'};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi'};
const FL=1510;const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// ---- envelopes
function envelope(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
function zcrEnv(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];for(let i=0;i+hop<=n;i+=hop){let z=0,prev=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2);if(j&&((v>0)!==(prev>0))&&Math.abs(v)>300)z++;prev=v}out.push(z/hop)}return out}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>{l.dur=l.env.length/FPS;l.zc=zcrEnv(l.id)});
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}




const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let c=ch(SHOTS[0]);for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SHOTS[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[EVT.rise,30],[EVT.roar,70],[EVT.crash,90],[EVT.lift,25],[EVT.lunge,100]];
function shakeAmp(t){let a=4.5+2*clamp((t-EVT.cam)/60,0,1);if(t<5.8)a+=8;if(t>=EVT.heli&&t<EVT.black)a+=3;if(t>=EVT.rise&&t<EVT.rise+6)a+=10;if(t>=EVT.roar&&t<EVT.roar+4)a+=22;if(t>=EVT.crash&&t<EVT.crash+3)a+=16;if(t>=EVT.lunge)a+=30;
 for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
const WHOL=['beto','diego','sofi','lucia','marta'];const SOL=['sgt'];
const A=(a,b,c,d,e,g)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e,sgt:g||'neutral'});
const EXL={
 g0:A('fear','fear','fear','fear','fear','scream'),g1:A('sad','worry','fear','worry','worry','neutral'),g2:A('sad','worry','fear','worry','worry'),
 g3:A('worry','annoyed','fear','worry','worry'),g4:A('worry','worry','sad','worry','tender'),g5:A('sad','worry','sad','tender','worry'),
 g6:A('worry','worry','fear','worry','worry'),g7:A('fear','fear','fear','fear','fear','fear'),g8:A('shock','shock','shock','shock','shock','shock'),
 g9:A('shock','shock','scream','scream','shock','shock'),g10:A('scream','shock','scream','scream','scream','shock'),g11:A('fear','fear','fear','fear','fear','scream'),
 g12:A('scream','scream','scream','scream','scream','scream'),g13:A('scream','scream','scream','scream','scream','scream'),g14:A('scream','scream','scream','scream','scream','scream')};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex=SOL.includes(who)?'neutral':'fear';if(tn<START.g0)return'fear';
 for(const l of LINES){if(!EXL[l.id])continue;const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.1*Math.max(0,idx));if(tn<t0)break;ex=EXL[l.id][who]||ex}
 if(tn>=EVT.rise-.5&&ex==='worry')ex='fear';return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3,neutral:0};
const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};
const J=EVT;
const STAGE={sgt:700,lucia:1150,sofi:1480,diego:1850,beto:2180,marta:2510};
function xOf(id,t){const s=STAGE[id];
 // run in from the roof door (x=380) during the hook, then stand
 if(t<7){const dl=({sgt:0,lucia:.5,sofi:.95,diego:1.35,beto:1.8,marta:2.2})[id];const u=sstep((t-dl)/(5.4-dl*.5));return lerp(380,s,u)-(t<dl?400:0)}
 let x=s;
 // boarding: Sofi, Lucia, Beto go under the cable
 const bt=J.cable+.3;if(id==='sofi')x=lerp(s,2290,sstep((t-bt)/2));if(id==='lucia')x=lerp(s,2410,sstep((t-bt-.4)/2));if(id==='beto')x=lerp(s,2350,sstep((t-bt-.2)/2));
 if(id==='diego'&&t>=J.cable)x=lerp(s,2320,sstep((t-J.load-1.2)/1.4));
 if(id==='marta'&&t>=J.load)x=lerp(s,2560,sstep((t-J.load)/1.5));
 return x}
const velX=(id,t)=>(xOf(id,t+.08)-xOf(id,t-.08))/.16;
function ampOf(who,t){let a=clamp(Math.abs(velX(who,t))/210,0,1.4);if(t<5.8)a=Math.max(a,1.6);if(who==='beto')a*=.6;return a}
const liftH=t=>sstep((t-J.lift)/3.2)*1100;
const barX=t=>2350;
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const DEF2={L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}};
const HANG={L:{w:[170,-60],hand:'grip'},R:{w:[330,-60],hand:'grip'}};
const HOLD={L:{w:[100,430],hand:'relax'},R:REL.R};
const KF={
 beto:[[0,{L:{w:[40,232],hand:'relax'},R:{w:[460,232],hand:'relax'}}],[Ls('g10')-.1,DEF2],[J.cable+1.8,HANG]],
 diego:[[0,{L:{w:[120,400],hand:'relax'},R:{w:[400,430],hand:'relax'}}],[Ls('g3')-.1,{L:{w:[100,330],hand:'open'},R:{w:[400,430],hand:'relax'}}],[Ls('g12')-.1,{L:{w:[50,150],hand:'point'},R:REL.R}],[J.load+1.2,{L:{w:[150,120],hand:'open'},R:{w:[350,120],hand:'open'}}],[J.lift+.3,{L:{w:[170,-60],hand:'grip'},R:{w:[330,-60],hand:'grip'}}]],
 sofi:[[0,REL],[Ls('g4')-.1,MOUTH()],[Le('g4')+.3,{L:{w:[134,330],hand:'open'},R:REL.R}],[Ls('g9'),MOUTH()],[J.cable+1.8,HANG]],
 lucia:[[0,REL],[Ls('g5')-.1,{L:{w:[100,330],hand:'open'},R:{w:[350,330],hand:'open'}}],[Le('g5')+.5,REL],[Ls('g9')-.1,MOUTH()],[J.cable+1.8,HANG]],
 marta:[[0,HOLD],[Ls('g1')-.1,{L:{w:[100,430],hand:'relax'},R:{w:[420,300],hand:'open'}}],[Le('g1')+.4,HOLD],[Ls('g13')-.1,{L:{w:[60,160],hand:'open'},R:{w:[330,200],hand:'open'}}]],
 sgt:[[0,REL],[Ls('g0')+.5,{L:{w:[50,150],hand:'point'},R:REL.R}],[Le('g0')+.5,REL],[Ls('g8')-.1,{L:{w:[90,260],hand:'open'},R:{w:[410,260],hand:'open'}}]]};
const SH={L:[186,240],R:[314,240]};
const ease=x=>{x=clamp(x);const c1=1.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function polar(sh,a,b,u){const ra=Math.hypot(a[0]-sh[0],a[1]-sh[1]),rb=Math.hypot(b[0]-sh[0],b[1]-sh[1]);let ta=Math.atan2(a[1]-sh[1],a[0]-sh[0]),tb=Math.atan2(b[1]-sh[1],b[0]-sh[0]);let d=tb-ta;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const th=ta+d*u,rr=ra+(rb-ra)*u;return[sh[0]+Math.cos(th)*rr,sh[1]+Math.sin(th)*rr]}
function kfAt(arr,t){let i=0;while(i+1<arr.length&&arr[i+1][0]<=t)i++;const cur=arr[i][1],prev=i>0?arr[i-1][1]:cur;const uu=clamp((t-arr[i][0])/.6);const u=ease(uu);const out={};for(const s of ['L','R']){const a=prev[s],b=cur[s];const pick=uu>.3?b:a;const side=s==='L'?-1:1;out[s]={w:polar(SH[s],a.w,b.w,u),hand:pick.hand,prop:pick.prop,fs:lerp(a.fs||1,b.fs||1,u),rot:pick.rot,front:pick.front};
 if(a.e||b.e){const ea=a.e||elbow(SH[s],a.w,side,a.fs||1),eb=b.e||elbow(SH[s],b.w,side,b.fs||1);out[s].e=polar(SH[s],ea,eb,u)}}return out}
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
function faceTarget(id,t){const v=velX(id,t);if(Math.abs(v)>40)return Math.sign(v)*1.45;
 const sp=speakerAt(t);const x=xOf(id,t);
 if(t>=J.rise-1&&t<J.black)return .9;
 if(t>=J.heli&&t<J.smoke)return .7;
 if(sp&&sp.who!=='Tomas'&&sp.who!=='Radio'){const k=sp.who==='Sargento'?'sgt':WHOKEY[sp.who];if(k&&k!==id)return clamp((xOf(k,t)-x)/700,-1,1)*.85}
 return .5}
function yawOf(who,t){let a=0,w=0;for(let k=0;k<10;k++){const wk=Math.exp(-k/3.2);a+=faceTarget(who,t-k*.07)*wk;w+=wk}return a/w}
const EXN=(n)=>EX[n]||EX.neutral;
function exprChange(who,tn){let cur=exprNew(who,tn),tc=0;let prev=cur;for(let tt=tn;tt>Math.max(0,tn-3);tt-=.1){const e=exprNew(who,tt);if(e!==cur){prev=e;tc=tt+.1;break}else tc=Math.max(0,tt)}return {cur,prev,tc}}
function faceExpr(who,t,tn,talk,seed){const {cur,prev,tc}=exprChange(who,tn);const a=EXN(prev),b=EXN(cur);const u=sstep((tn-tc)/.3);
 const mix=(x,y)=>x+(y-x)*u;const e={...b,e:mix(a.e,b.e),brow:[mix(a.brow[0],b.brow[0]),mix(a.brow[1],b.brow[1])],rot:mix(a.rot,b.rot),pup:mix(a.pup,b.pup)};
 const sd=(seed%3)-1;const br=Math.sin(t*1.9+seed);
 e.bL=Math.sin(t*.7+seed)*.9+(['worry','sad','fear'].includes(cur)?-1.6*sd-1.0:0)-talk*2.2;e.bR=Math.sin(t*.8+seed*2)*.9+(['worry','sad','fear'].includes(cur)?1.6*sd-1.0:0)-talk*2.2*(.6+.4*Math.sin(t*5+seed));
 e.eL=1+Math.sin(t*.9+seed)*.05+(cur==='sad'?-.1:0);e.eR=1+Math.sin(t*1.1+seed*1.3)*.05+(cur==='sad'?-.14:0);
 e.bag=['sad','worry','fear','shock'].includes(cur)?.8:.15;e.well=(cur==='sad'||cur==='scream')?1:(cur==='fear'?.5:0);e.flare=(['scream','annoyed','fear'].includes(cur)?.8:0)+Math.max(0,br)*.4;return e}
function charSVG(who,t,shock,tn){const st=CAST[who];const isS=SOL.includes(who);const pose=kfAt(KF[who],t);const sp=speakerAt(tn);
 const spk=sp&&(sp.who==='Sargento'?'sgt':WHOKEY[sp.who]);const talk=spk===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.7):0;
 const idx=isS?5:WHOL.indexOf(who);const bl=blinkAt(idx*.37,t);
 const yaw=yawOf(who,t);const lk=[clamp(yaw*.8,-1,1),(t>=J.rise-1&&t<J.black)?-.7:.1];
 const br=Math.sin(t*1.9+idx)*(1+shock);const sway=Math.sin(t*.8+idx*2)*.8+Math.sin(t*9+idx)*.5*quakeLvl(t);
 const amp=ampOf(who,t);const phase=t*(t<6?10:6.2)+idx*.9;
 const lift=(['sofi','lucia','beto'].includes(who)&&t>=J.cable+1.8)||(who==='diego'&&t>=J.lift+.3)?liftH(t):0;
 for(const s of ['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+Math.sin(t*14+idx)*2*quakeLvl(t)]}
 const ex=exprNew(who,tn);pose.walk={phase,amp:lift>0?0:amp};
 const zc=spk===who&&sp&&sp.zc?sp.zc[Math.floor((tn-sp.t0)*FPS)]||0:0;const sacc=(Math.sin(Math.floor(t*1.7+idx)*12.9898)*.5);
 pose.vis=talk>.08?clamp((zc-.12)/.12,-1,1):0;pose.mdy=((ex==='sad'||ex==='fear'||ex==='scream'))?Math.sin(t*37+idx)*(talk>.1?.7:1.3)*(ex==='sad'?1:.6):0;
 pose.expr=faceExpr(who,t,tn,talk,idx+1);pose.blink=bl;pose.look=[lk[0]*.5+sacc*.35,lk[1]+Math.sin(t*2.3+idx)*.12];pose.talk=talk;pose.breath=br;pose.byaw=lift>0?0:yaw;
 pose.head={rot:(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.2:0),dx:0,yaw:0,dy:Math.sin(t*1.9+idx)*1.2+(ex==='shock'||ex==='scream'?-4:0)+Math.abs(Math.sin(phase))*-5*amp};
 let s=who==='sofi'?1.05:1.5,x=xOf(who,t),fy=FL;let rot=sway+(who==='beto'?9+Math.sin(phase)*2*amp:0);let yoff=-Math.abs(Math.sin(phase))*9*amp*(who==='sofi'?.6:1)-lift;
 if(lift>0){rot=Math.sin(t*1.6+idx)*2.5;x=barX(t)+({sofi:-330,lucia:330,beto:0,diego:0})[who];if(who==='diego')yoff-=-0}
 const Mch=mul(mul(T(x-250*s,fy-752*s+yoff,0,s,s),T(250,752)),mul(T(0,0,rot,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 const sh=lift>0?'':`<ellipse cx="${x}" cy="${fy+10}" rx="${190*s/1.5}" ry="${28*s/1.5}" fill="#000" opacity=".5"/>`;
 return sh+`<g transform="translate(${x-250*s},${fy-752*s+yoff}) scale(${s}) rotate(${rot.toFixed(2)} 250 752)">${bd}</g>`}

// ---- overlays (Reels safe zones: top 230, bottom 330, right 120)
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),22);const fs=lines.length>2?50:56;let s='';const y0=1440-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="520" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="520" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]||sp.who}</text>`+s}
function hud(t){const el=Math.max(0,t-EVT.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="270" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="282" font-size="38" font-weight="700">REC</text><text x="640" y="282" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="1575" font-size="30">SEP 19 2025  05:48</text><text x="700" y="1575" font-size="30">SP ▮▮▮▯</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,236h60M50,236v60M960,236h-60M960,236v60M50,1600h60M50,1600v-60M960,1600h-60M960,1600v-60"/><path d="M480,930h60M510,900v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
function title(t){const u=t-4.7;const ser=`<text x="540" y="300" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.1)?10:2;
 const T=(x,fill,op)=>`<text x="${x}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="${fill}" fill-opacity="${op}">CAPÍTULO 6</text>`;
 return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}">${T(540-g,'#ff2a3a',.7)}${T(540+g,'#2af0ff',.6)}${T(540,'#fff',1)}<rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1080" text-anchor="middle" font-family="Inter" font-weight="900" font-size="112" letter-spacing="2" fill="#fff" stroke="#000" stroke-width="3">LA DECISIÓN</text></g>`}
function endcard(t){const u=t-EVT.endcard;const fade=clamp(u/.6);return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fade}"><text x="540" y="520" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="38" fill="#9aa4ae">// CINTA 6 — FIN DEL REGISTRO</text><text x="540" y="700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff2a3a" letter-spacing="6">PRÓXIMO CAPÍTULO</text><text x="540" y="800" text-anchor="middle" font-family="Inter" font-weight="900" font-size="70" fill="#fff">CAPÍTULO 7 | EL FINAL</text>${u>2?`<text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#ffd54a">¿QUIÉN SOBREVIVE?</text><text x="540" y="1100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">A) LOS QUE SUBIERON</text><text x="540" y="1180" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">B) LOS QUE SE QUEDARON</text>`:''}${u>4?`<text x="540" y="1400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="52" fill="#2af0ff">COMENTA TU ELECCIÓN</text><text x="540" y="1480" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42" fill="#fff">SÍGUEME PARA EL CAPÍTULO 7</text>`:''}</g>`}
// ---- operator hand (the person filming)
function opState(t,tgt){const sw=Math.sin(t*1.3)*10+Math.sin(t*3.1)*5;let wx=800+sw,wy=1650+Math.sin(t*1.7)*8,ang=-32,bx=tgt?tgt[0]:560,by=tgt?tgt[1]:900;
 let on=0;if(t<5.5)wy+=Math.sin(t*11)*26;
 if(t>=EVT.roar&&t<EVT.roar+4)wx+=Math.sin(t*28)*12;if(t>=EVT.lunge)wx+=Math.sin(t*30)*18;
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
// ---- scene composition (rooftop)
const w2s=(x,y)=>[CAMM[0]*x+CAMM[2]*y+CAMM[4],CAMM[1]*x+CAMM[3]*y+CAMM[5]];
const heliPos=t=>{if(t<J.heli-1)return null;const u=sstep((t-J.heli)/4.2);let x=lerp(6600,2350,u),y=lerp(-600,-100,u)+(u>=1?Math.sin(t*1.3)*14:0);if(t>=J.lift){const L=liftH(t);y-=L;x-=sstep((t-J.lift-1)/4)*500}return {x,y,tilt:(1-u)*-7+Math.sin(t*1.1)*1.2}};
function monsterSVG(t){if(t<J.rise-.3)return'';const rise=sstep((t-J.rise)/6);let mOff=4200*(1-rise);const roar=t>=J.roar&&t<J.roar+3.4?1:0;const lung=sstep((t-J.lunge)/1.3);
 let jaw=.1+.06*Math.sin(t*2.1);if(roar)jaw=.85+.15*Math.sin(t*16);if(t>=J.lunge)jaw=.6+.4*lung+.1*Math.sin(t*18);
 const hp=heliPos(t);const look=hp?[-1,clamp((hp.y-300)/900,-1,1)*-.8]:[-1,.2];
 const sh=roar?Math.sin(t*47)*10:0;
 const o={jaw,look,climb:t*.12,sway:Math.sin(t*.9)*.2,headAng:-.32+Math.sin(t*.5)*.05-lung*.4,headX:lerp(-120,-1350,lung),headY:lerp(-780,-620,lung),headScale:lerp(1.7,3.3,lung)};
 const ms=lerp(1.6,2.1,lung),mx=lerp(4400,3600,lung);
 return `<g transform="translate(${(mx+sh).toFixed(1)},${(520+mOff).toFixed(1)}) scale(${ms.toFixed(3)})">`+colossus(t,o)+`</g>`}
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8+(t<5.8?Math.sin(t*11)*10:0),sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 BLURV=blur;setHandTime(t);
 let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 const rr=(rot+sr)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);const cor=[[-540,-960],[540,-960],[540,960],[-540,960]].map(([px,py])=>[cx+(px*cs+py*sn)/z,cy+(-px*sn+py*cs)/z]);const vx0=Math.min(...cor.map(c=>c[0])),vx1=Math.max(...cor.map(c=>c[0])),vy0=Math.min(...cor.map(c=>c[1])),vy1=Math.max(...cor.map(c=>c[1]));
 w+=sky(t,cx)+skyline(t,cx);
 const dmg=t>=J.crash?clamp((t-J.crash)/2):0;w+=tower(t,{damage:dmg});
 // tease: two amber eyes glowing in the smoke
 if(t>=J.tease&&t<J.tease+1.8){const u=t-J.tease;const k=Math.sin(u/1.8*Math.PI);w+=`<g opacity="${k.toFixed(2)}"><circle cx="4180" cy="-120" r="110" fill="url(#mGlow)"/><ellipse cx="4180" cy="-120" rx="46" ry="30" fill="url(#mEye)"/><ellipse cx="4180" cy="-120" rx="8" ry="26" fill="#050203"/><circle cx="4400" cy="-80" r="90" fill="url(#mGlow)"/><ellipse cx="4400" cy="-80" rx="36" ry="24" fill="url(#mEye)"/><ellipse cx="4400" cy="-80" rx="7" ry="20" fill="#050203"/></g>`}
 w+=monsterSVG(t);
 // smoke in front of the monster base
 for(let k=0;k<6;k++)w+=smokeBlob(t,3400+k*330,1250-((t>J.rise)?0:0),360+k%3*80,k);
 // debris falling when the monster smashes the tower
 if(t>=J.crash-.2&&t<J.crash+4){const u=t-J.crash;for(let i=0;i<26;i++){const px=3900+rn(i)*900,py=300+((u*500*(.5+rn(i+3)))+rn(i+5)*200)%1400;w+=`<polygon points="${px},${py} ${px+50*rn(i+2)+20},${py+20} ${px+14},${py+60*rn(i+7)+20}" fill="#3a3238"/>`}w+=`<ellipse cx="4300" cy="900" rx="${(600*sstep(u/1.5)).toFixed(0)}" ry="320" fill="url(#mSmoke)" fill-opacity="${(.8*(1-clamp(u/4))).toFixed(2)}"/>`}
 // helicopter
 const hp=heliPos(t);let barY=null;
 if(hp){const sc=1.1;const lenFull=300;const len=t>=J.cable?sstep((t-J.cable)/2.5)*lenFull:0;const lampW=[hp.x-215*sc,hp.y+80*sc];const tgt=[2000,FLOOR];const beam=(t<J.lift+1&&t>=J.heli)?1:.5;
  w+=heli(t,{x:hp.x,y:hp.y,sc,tilt:hp.tilt,beam,bx:(tgt[0]-hp.x)/sc+215,by:(tgt[1]-hp.y)/sc,cable:len/sc,lamp:1});barY=hp.y+130*sc+len;
  if(t>=J.cable){const bx0=barX(t);w+=`<line x1="${f1(bx0-480)}" y1="${f1(barY)}" x2="${f1(bx0+10)}" y2="${f1(barY-len+8)}" stroke="#14170f" stroke-width="6"/><line x1="${f1(bx0+480)}" y1="${f1(barY)}" x2="${f1(bx0+10)}" y2="${f1(barY-len+8)}" stroke="#14170f" stroke-width="6"/><rect x="${f1(bx0-500)}" y="${f1(barY-8)}" width="1000" height="16" rx="8" fill="#c9a23a" stroke="#14170f" stroke-width="5"/>`}}
 w+=roofBack(t,{doorOpen:sstep(1-clamp((t-.5)/1.2))*(t<3?1:.0)+(t<.4?1:0)});
 w+=roof(t,{})+pad(t,{});
 // rotor wash on the pad
 if(hp&&hp.y<400){for(let i=0;i<30;i++){const u=((t*1.6+rn(i))%1),ang=rn(i+2)*6.28;w+=`<circle cx="${f1(2350+Math.cos(ang)*(120+u*900))}" cy="${f1(FLOOR+40+Math.sin(ang)*20)}" r="${f1(4+6*(1-u))}" fill="#cdbfae" fill-opacity="${(.4*(1-u)).toFixed(2)}"/>`}}
 const order=['sgt','lucia','sofi','beto','diego','marta'];
 order.forEach(k=>{const x=xOf(k,t);const lifted=(['sofi','lucia','beto'].includes(k)&&t>=J.cable+1.8)||(k==='diego'&&t>=J.lift+.3);const xx=lifted?barX(t):x;if(xx+700<vx0||xx-700>vx1)return;w+=charSVG(k,t,q,tn)});
 w+=dust(t,q*.5);
 w+=`</g>`;
 let tgt=[1850,800];const tw=w2s(tgt[0],tgt[1]);const op=operatorHand(t,[tw[0],tw[1]]);
 const warm=.07+.05*Math.sin(t*5);
 w+=`<rect width="${W}" height="${H}" fill="#ff8a3a" fill-opacity="${warm.toFixed(3)}"/>`;
 w+=`<defs><radialGradient id="dk" gradientUnits="userSpaceOnUse" cx="540" cy="960" r="1200"><stop offset="0" stop-color="#02040a" stop-opacity="0"/><stop offset=".6" stop-color="#02040a" stop-opacity=".18"/><stop offset="1" stop-color="#02040a" stop-opacity=".6"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dk)"/>`;
 w+=op.svg;
 let fl=0;for(const [ft,k] of [[J.roar,.5],[J.crash,.6],[J.lunge,.8],[J.lift,.2]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 w+=`<rect width="${W}" height="${H}" fill="#fff0d8" opacity="${fl.toFixed(2)}"/>`;
 return w}
const f1=n=>(+n).toFixed(1);

function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=tn;let inner,hudOn=false;
 if(t<4.6)inner=sceneWorld(t,tn);else if(t<4.7)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7.1)inner=title(t);else if(t<EVT.cam)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 else if(t<EVT.black){inner=(t>=EVT.lunge+.8)?faceFront(t,clamp((t-EVT.lunge-.8)/1.2)):sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=EVT.cam&&t<EVT.cam+.25)g=.6;if(t>=EVT.lunge&&t<EVT.lunge+.3)g=.7;if(t<.35)g=.7;if(t>=EVT.roar&&t<EVT.roar+.25)g=.5;if(t>=EVT.black-1.0&&t<EVT.black)g=.6;
 if(t>=EVT.black&&t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=EVT.black))?hud(tn)+caption(tn):((t<4.6||(t>=4.7&&t<EVT.cam))?caption(tn):'');
 const head=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
 const dfs=defsScene+defs6+defs(CAST.beto);
 if(mode==='parts')return{full:fixOp(head+dfs+out+ov+'</svg>'),base:fixOp(head+dfs+out+'</svg>'),overlay:fixOp(head+ov+'</svg>'),blur:BLURV};
 return fixOp(head+dfs+out+ov+'</svg>')}
function boxBlur(px,w,h,rad){const t=new Uint8ClampedArray(px.length);const pass=(src,dst,horiz)=>{const n=horiz?w:h,m=horiz?h:w,st=horiz?4:4*w,ln=horiz?4*w:4;const d=2*rad+1;for(let k=0;k<m;k++){const base=k*ln;for(let c=0;c<4;c++){let sum=0;const idx=i=>base+Math.min(n-1,Math.max(0,i))*st+c;for(let i=-rad;i<=rad;i++)sum+=src[idx(i)];for(let i=0;i<n;i++){dst[base+i*st+c]=sum/d;sum+=src[idx(i+rad+1)]-src[idx(i-rad)]}}}};pass(px,t,true);pass(t,px,false)}
function renderPng(t){const P=frame(t,'parts');const opt={font:{loadSystemFonts:true,defaultFontFamily:'Inter'},fitTo:{mode:'original'}};
 if(P.blur<=.8)return new Resvg(P.full,opt).render();
 const b=new Resvg(P.base,opt).render();const px=Uint8ClampedArray.from(b.pixels);const rad=Math.max(1,Math.round(P.blur*1.3));boxBlur(px,W,H,rad);boxBlur(px,W,H,Math.max(1,Math.round(rad*.7)));
 const o=new Resvg(P.overlay,opt).render().pixels;for(let i=0;i<px.length;i+=4){const a=o[i+3]/255;if(a>0){px[i]=o[i]*a+px[i]*(1-a);px[i+1]=o[i+1]*a+px[i+1]*(1-a);px[i+2]=o[i+2]*a+px[i+2]*(1-a)}}
 return{pixels:Buffer.from(px.buffer),asPng:()=>new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="1" height="1"/></svg>`).render().asPng()}}
// ---- camera shots (cinematic coverage): [t,cx,cy,zoom,rot,mode,skew]
const SHOTS=[
 [0,420,1000,.9,-2,'s',0],[1.0,1000,960,.85,2,'w',0],[3.0,3600,-50,.45,-3,'n',0],[5.2,1700,900,.6,0,'w',0],[7.4,1700,900,.6,0,'s',0],
 [S_('g1')-.5,2345,800,1.5,2,'n',0],[S_('g2')-.5,2180,780,1.7,-2,'n',0],[S_('g3')-.5,1850,780,1.5,2,'n',0],
 [S_('g4')-.5,1480,900,1.8,-2,'n',0],[S_('g5')-.5,1320,780,1.4,2,'n',0],
 [EVT.heli-.6,3000,500,.6,-3,'w',0],[S_('g6')+1.5,2400,700,.65,2,'s',0],
 [S_('g7')-.5,3700,300,.5,-2,'n',0],[S_('g8')-.5,720,780,1.5,2,'n',0],
 [EVT.rise-1.8,3900,500,.5,-3,'w',0],[EVT.rise+2.2,3900,-150,.38,2,'s',0],[EVT.rise+4.8,4000,-700,.6,-2,'n',0],
 [S_('g9')-.7,1320,780,1.9,3,'w',0],[EVT.roar+.35,4050,-780,.62,-4,'w',0],[EVT.roar+3.3,3900,-100,.36,3,'w',0],[EVT.crash-.3,4300,0,.4,3,'w',0],
 [S_('g10')-.5,2180,780,1.7,-3,'n',0],[EVT.cable-1.0,2350,450,.65,0,'s',0],[S_('g12')-.5,1850,800,1.5,2,'n',0],[EVT.load-.3,2350,980,1.0,-2,'s',0],
 [S_('g13')-.5,2560,800,1.6,3,'w',0],[EVT.lift-.5,2350,500,.55,-2,'w',0],[S_('g14')-.3,3000,500,.45,4,'w',0],[EVT.lunge-.7,3300,-200,.5,0,'w',0]];
SHOTS.sort((x,y)=>x[0]-y[0]);
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(mode==='preview'){for(const a of process.argv.slice(3)){const t=parseFloat(a);const t0=Date.now();{const rp=renderPng(t);spawnSync('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-i','-',path.join(BUILD,`prev_${a}.png`)],{input:Buffer.from(rp.pixels.buffer?rp.pixels:rp.pixels),maxBuffer:1e8})}console.log(a,Date.now()-t0,'ms')}}
 else if(mode==='part'||mode==='seg'){const i=+process.argv[3],n=+process.argv[4];const total=DUR*FPS;let a=Math.floor(total*i/n),b=Math.floor(total*(i+1)/n);let outName=`part_${i}.mp4`;if(mode==='seg'){a=Math.round(+process.argv[3]*FPS);b=Math.round(+process.argv[4]*FPS);outName=process.argv[5]}
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf','gblur=sigma=0.7,eq=contrast=1.07:saturation=0.85,rgbashift=rh=-2:bh=2,noise=alls=11:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,outName)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS,camera,sceneWorld,LINES,EVT,xOf};
