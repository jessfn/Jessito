import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {setCTM,mul,T} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,backdrop,rooftop,T_BLACKOUT,giantLeg} from './scene.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep1');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;
function inv(tn){const A=TL.anchors;if(tn<=A[0][1])return tn;for(let i=1;i<A.length;i++){if(tn<=A[i][1]){const [o0,n0]=A[i-1],[o1,n1]=A[i];return n1===n0?o1:o0+(tn-n0)*(o1-o0)/(n1-n0)}}return tn-TL.delay}
export {START,KF,kfAt};
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA'};
const POSX={beto:700,diego:1100,marta:1500,lucia:1900};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia'};
// ---- envelopes
function envelope(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_c',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>l.dur=l.env.length/FPS);
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}
// ---- camera
const SHOTS=[[10.0,900,1500,1.0,6,'n',0],[11.4,800,1150,.9,-1,'p',0],[13.0,800,900,1.15,0,'n',0],[15.8,700,820,1.7,-2,'z',3],[18.8,700,640,2.1,2,'p',0],[19.9,900,980,1.0,-1,'w',0],[22.6,700,700,2.0,3,'z',-3],[24.8,1100,800,1.5,-2,'w',0],[26.6,1100,620,2.1,0,'p',0],[27.7,1500,780,1.6,2,'w',-2],[29.8,1500,610,2.3,-3,'z',2],[31.3,1100,720,1.7,1,'w',0],[33.8,1500,650,2.0,-2,'w',3],[36.6,1500,600,2.4,0,'p',0],[37.9,1500,950,.85,0,'w',0],[39.5,1900,800,1.5,3,'n',-3],[42.0,1900,700,1.8,-1,'z',0],[45.4,1900,600,2.3,0,'n',2],[49.5,1900,590,2.5,2,'p',0],[50.5,1100,650,2.0,-2,'w',0],[52.4,1100,600,2.3,0,'z',-2],[54.2,1300,980,.8,3,'w',0],[55.5,900,850,1.3,-2,'n',3],[59.0,700,780,1.6,0,'w',0],[61.5,700,500,1.5,-3,'z',-4],[63.4,1300,1000,.72,0,'w',0],[66.2,1300,1000,.7,2,'p',0],[67.4,1300,860,.62,6,'w',0],[68.9,1900,760,1.7,-3,'w',2],[70.7,700,760,1.5,2,'w',0],[73.3,1500,700,1.9,0,'w',-3],[76.0,1500,620,2.3,-2,'p',0],[78.4,2300,880,.75,-3,'w',0],[80.5,2300,760,1.1,2,'z',0],[83.2,1100,640,2.0,0,'w',3],[85.0,1500,700,1.8,2,'w',0],[88.7,1500,600,2.2,0,'z',-2],[91.5,1300,860,.7,-4,'w',0],[93.0,700,780,1.5,5,'w',4],[94.4,1900,620,2.2,3,'w',0],[96.9,700,640,2.0,-3,'w',-3],[99.8,1300,820,.62,5,'w',0],[102.5,1300,520,.6,2,'n',0],[104.8,1100,640,2.1,-2,'w',3],[107.8,1100,600,2.6,0,'p',0],[109.2,1500,640,2.0,2,'w',-2],[112.4,1300,780,.6,3,'w',0],[114.6,700,860,1.0,-6,'c',0],[116.2,1500,760,.6,-6,'w',0],[117.0,1900,620,2.0,-4,'w',3],[119.3,1300,700,.6,2,'w',0],[119.7,1300,1500,.8,78,'w',0]];
const MODE={n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let c=ch(SHOTS[0]);for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SHOTS[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[80.4,38],[92.1,60],[100.0,50],[116.3,60],[119.5,90]];
function shakeAmp(t){let a=5;if(t>78&&t<90)a=14;if(t>92&&t<100)a=26;if(t>100&&t<116)a=14;if(t>116&&t<121.5)a=34;if(t>67&&t<78)a=8;for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
// ---- characters
const EXPR={
 beto:[[0,'smile'],[67.2,'neutral'],[74,'surprise'],[95,'fear'],[105,'surprise'],[116,'fear']],
 diego:[[0,'smile'],[52.2,'sad'],[56,'smile'],[67.2,'neutral'],[80,'fear'],[105,'surprise'],[116,'fear']],
 marta:[[0,'neutral'],[34,'neutral'],[37.5,'smile'],[67.2,'neutral'],[78,'fear'],[105,'fear'],[116,'surprise']],
 lucia:[[0,'smile'],[45.5,'smile'],[52,'smile'],[67.2,'neutral'],[80,'fear'],[94,'fear'],[116,'surprise']]};

const WHOL=['beto','diego','marta','lucia'];
const EXL={
 l1:{beto:'amused',diego:'tender',marta:'annoyed',lucia:'amused'},
 l2:{beto:'laugh',diego:'annoyed',marta:'smirk',lucia:'amused'},
 l3:{beto:'disbelief',diego:'amused',marta:'smirk',lucia:'laugh'},
 l4:{beto:'neutral',diego:[[0,'smirk'],[.6,'tender']],marta:'annoyed',lucia:'worry'},
 l5:{beto:'amused',diego:'annoyed',marta:'smirk',lucia:'worry'},
 l6:{beto:'neutral',diego:'annoyed',marta:'annoyed',lucia:'tender'},
 l7:{beto:'neutral',diego:'tender',marta:[[0,'annoyed'],[.5,'sad']],lucia:'tender'},
 l8:{beto:'amused',diego:'neutral',marta:'tender',lucia:'amused'},
 l9:{beto:'amused',diego:'amused',marta:'amused',lucia:'worry'},
 l10:{beto:'amused',diego:[[0,'amused'],[.6,'tender'],[.9,'sad']],marta:[[0,'amused'],[.7,'tender']],lucia:[[0,'worry'],[.45,'tender']]},
 l11:{beto:'laugh',diego:'cryLaugh',marta:'laugh',lucia:'laugh'},
 l12:{beto:'amused',diego:'amused',marta:'smirk',lucia:'tender'},
 l13:{beto:'laugh',diego:'amused',marta:'laugh',lucia:'amused'},
 l14:{beto:'neutral',diego:'neutral',marta:'neutral',lucia:'worry'},
 l15:{beto:'disbelief',diego:'worry',marta:'worry',lucia:'worry'},
 l16:{beto:'worry',diego:'worry',marta:'worry',lucia:'worry'},
 l17:{beto:'worry',diego:'disbelief',marta:'worry',lucia:'worry'},
 l18:{beto:'worry',diego:'worry',marta:'fear',lucia:'worry'},
 l19:{beto:'fear',diego:'fear',marta:'fear',lucia:'fear'},
 l20:{beto:'fear',diego:'shock',marta:'shock',lucia:'fear'},
 l21:{beto:'fear',diego:'shock',marta:'fear',lucia:'fear'},
 l22:{beto:'shock',diego:'shock',marta:'shock',lucia:'shock'},
 l23:{beto:'fear',diego:'fear',marta:'scream',lucia:'fear'},
 l24:{beto:'fear',diego:'fear',marta:'fear',lucia:'fear'},
 l25:{beto:'shock',diego:'shock',marta:'shock',lucia:'scream'}};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex=tn<START.l1?'amused':'neutral';if(tn<START.l1)return ex;
 for(const l of LINES){const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.12*idx);if(tn<t0)break;const en=EXL[l.id][who];if(Array.isArray(en)){for(const [fr,e] of en)if(tn>=t0+fr*l.dur)ex=e}else ex=en}
 if(tn>START.l25+2.6)ex='shock';return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3};
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const KF={
 beto:[[0,{...REL,R:{w:[398,248],hand:'grip',prop:'bottle'}}],[59,{...REL,R:{w:[404,170],hand:'grip',prop:'bottle'}}],[65,{...REL,R:{w:[398,250],hand:'grip',prop:'bottle'}}],[75,{...REL,R:{w:[360,324],hand:'grip',prop:'bottle',fs:.55,rot:6}}],[93,{L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}}]],
 diego:[[0,{L:{w:[132,252],hand:'grip',prop:'cup'},R:REL.R}],[24.8,{L:{w:[132,252],hand:'grip',prop:'cup'},R:{w:[382,326],hand:'open'}}],[32,{L:{w:[132,252],hand:'grip',prop:'cup'},R:REL.R}],[52,{L:{w:[132,252],hand:'grip',prop:'cup'},R:{w:[286,178],hand:'open',front:1}}],[56,{L:{w:[132,252],hand:'grip',prop:'cup'},R:REL.R}],[80,{L:{w:[152,330],hand:'grip',prop:'cup',fs:.55,rot:-4},R:{w:[300,300],hand:'open'}}],[93,{L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}}],[105,{L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{w:[452,200],hand:'point'}}]],
 marta:[[0,{L:{w:[262,332],hand:'relax'},R:{w:[238,336],hand:'relax'}}],[37,REL],[60,{L:{w:[262,332],hand:'relax'},R:{w:[238,336],hand:'relax'}}],[78,{L:REL.L,R:{w:[452,196],hand:'point'}}],[93,{L:{e:[166,334],w:[226,240],hand:'open',front:1},R:{e:[334,334],w:[274,240],hand:'open',front:1}}],[109,{L:{e:[166,334],w:[226,240],hand:'open',front:1},R:{w:[350,262],hand:'open'}}]],
 lucia:[[0,{L:REL.L,R:{w:[364,254],hand:'grip',prop:'cup'}}],[45,{L:{w:[116,300],hand:'open'},R:{w:[364,254],hand:'grip',prop:'cup'}}],[67.5,{L:REL.L,R:{w:[352,326],hand:'grip',prop:'cup',fs:.55,rot:4}}],[80,{L:{e:[116,290],w:[160,168],hand:'open',front:1},R:{e:[384,290],w:[340,168],hand:'open',front:1}}]]};
const SH={L:[186,240],R:[314,240]};
const ease=x=>{x=clamp(x);const c1=1.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function polar(sh,a,b,u){const ra=Math.hypot(a[0]-sh[0],a[1]-sh[1]),rb=Math.hypot(b[0]-sh[0],b[1]-sh[1]);let ta=Math.atan2(a[1]-sh[1],a[0]-sh[0]),tb=Math.atan2(b[1]-sh[1],b[0]-sh[0]);let d=tb-ta;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const th=ta+d*u,rr=ra+(rb-ra)*u;return[sh[0]+Math.cos(th)*rr,sh[1]+Math.sin(th)*rr]}
function kfAt(arr,t){let i=0;while(i+1<arr.length&&arr[i+1][0]<=t)i++;const cur=arr[i][1],prev=i>0?arr[i-1][1]:cur;const uu=clamp((t-arr[i][0])/.6);const u=ease(uu);const out={};for(const s of ['L','R']){const a=prev[s],b=cur[s];const pick=uu>.3?b:a;const side=s==='L'?-1:1;out[s]={w:polar(SH[s],a.w,b.w,u),hand:pick.hand,prop:pick.prop,fs:lerp(a.fs||1,b.fs||1,u),rot:pick.rot,front:pick.front};
 if(a.e||b.e){const ea=a.e||elbow(SH[s],a.w,side,a.fs||1),eb=b.e||elbow(SH[s],b.w,side,b.fs||1);out[s].e=polar(SH[s],ea,eb,u)}}return out}
function exprAt(arr,t){let e=arr[0][1];for(const [ti,ex] of arr)if(t>=ti)e=ex;return e}
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
function look(who,t,tn){const sp=speakerAt(tn);const mx=POSX[who];if(t>78.4&&t<83&&who!=='x')return[.9,-.6];if(t>100&&t<104.8)return[.4,-.7];if(t>112.4&&t<117)return[.5,-.6];if(sp&&sp.who!=='Tomas'&&WHOKEY[sp.who]!==who)return[clamp((POSX[WHOKEY[sp.who]]-mx)/500,-1,1),.1];return[0,.15]}
function charSVG(who,t,shock,tn){const st=CAST[who];const pose=kfAt(KF[who],t);const sp=speakerAt(tn);const talk=sp&&WHOKEY[sp.who]===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.7):0;
 const idx=Object.keys(POSX).indexOf(who);const bl=blinkAt(idx*.37,t);const lk=look(who,t,tn);
 const br=Math.sin(t*1.9+idx);const fear=t>78?1.6:0.8;const sway=Math.sin(t*.8+idx*2)*.8+(t>78?Math.sin(t*9+idx)*.5*quakeLvl(t):0);
 for(const s of ['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+(t>78?Math.sin(t*14+idx)*2*quakeLvl(t):0)]}
 const ex=exprNew(who,tn);
 pose.expr=ex;pose.blink=bl;pose.look=lk;pose.talk=talk;pose.breath=br*(['laugh','cryLaugh'].includes(ex)?2.5:1);pose.head={rot:lk[0]*3+(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.2:0),dx:lk[0]*3,dy:Math.sin(t*1.9+idx)*1.2+(['laugh','cryLaugh'].includes(ex)?Math.sin(tn*17+idx)*2.5:0)+(ex==='shock'||ex==='scream'?-4:0)};
 const s=1.5,x=POSX[who],fy=1500;
 const Mch=mul(mul(T(x-250*s,fy-752*s,0,s,s),T(250,752)),mul(T(0,0,sway,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 return `<ellipse cx="${x}" cy="${fy+10}" rx="${190}" ry="${28}" fill="#000" opacity=".5"/><g transform="translate(${x-250*s},${fy-752*s}) scale(${s}) rotate(${sway.toFixed(2)} 250 752)">${bd}</g>`}
// ---- overlays
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),24);const fs=lines.length>2?50:56;let s='';const y0=1560-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="540" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="540" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]}</text>`+s}
function hud(t){const el=Math.max(0,t-10);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="96" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="108" font-size="38" font-weight="700">REC</text><text x="760" y="108" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="1780" font-size="32">SEP 18 2025  22:14</text><text x="800" y="1780" font-size="32">SP ▮▮▮▯</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,50h60M50,50v60M1030,50h-60M1030,50v60M50,1870h60M50,1870v-60M1030,1870h-60M1030,1870v-60"/><path d="M510,960h60M540,930v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
// ---- special scenes
function hook(t){const sh=(n)=>(Math.sin(t*61*n)+Math.sin(t*37*n+1))*18;const st=CAST.lucia;const pose={...REL,L:{w:[212,206],hand:'open'},R:{w:[288,206],hand:'open'},expr:'surprise',talk:.55+.45*Math.sin(t*28),blink:0,look:[0,0],head:{rot:0}};
 setCTM(mul(mul(T(540+sh(1),900+sh(2),16+sh(.4)*.2),T(-1125,-700)),T(0,0,0,4.5,4.5)));const hb=body(st,pose);setCTM([1,0,0,1,0,0]);
 const flash=t>2.05?1:Math.max(0,Math.sin(t*34))*.35;
 return `<rect width="${W}" height="${H}" fill="#2a0c06"/><circle cx="${300+sh(.3)}" cy="500" r="480" fill="url(#glowO)"/><g transform="translate(${W-120},0)">${giantLeg(t,0).replace(/translate\(0,/,'translate(0,')}</g><g transform="translate(${540+sh(1)},${900+sh(2)}) rotate(${16+sh(.4)*.2}) translate(-1125,-700) scale(4.5)">${hb}</g><rect width="${W}" height="${H}" fill="#ff3a1a" opacity="${(.12+.1*Math.sin(t*40)).toFixed(2)}"/><rect width="${W}" height="${H}" fill="#fff" opacity="${flash.toFixed(2)}"/>`}
function typeText(lines,t,t0,cps){let s='';let n=Math.floor((t-t0)*cps);lines.forEach((l,i)=>{const k=clamp(n,0,l.length);n-=l.length+4;s+=`<text x="90" y="${820+i*74}" font-family="DejaVu Sans Mono" font-size="${i===0?50:40}" fill="${i===0?'#fff':'#c9d1d9'}" font-weight="${i===0?700:400}">${l.slice(0,k).replace(/&/g,'&amp;')}${(k<l.length&&k>0)||(i===lines.length-1&&Math.floor(t*2)%2===0)?'▌':''}</text>`});return s}
function intro(t){const fl=Math.random()<0?0:(Math.sin(t*50)>.9?.5:1);return `<rect width="${W}" height="${H}" fill="#05070a"/>`+typeText(['MATERIAL RECUPERADO','CÁMARA DIGITAL · CINTA 1','ZONA RESTRINGIDA — SECTOR NORTE','ESTADO: SIN VERIFICAR'],t,3.2,34)+`<g opacity=".25">${Array.from({length:30},(_,i)=>`<rect x="0" y="${i*64}" width="${W}" height="2" fill="#fff"/>`).join('')}</g>`}
function title(t){const u=t-7;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.3)?10:2;return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fl}"><text x="${540-g}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="#ff2a3a" opacity=".7">CAPÍTULO 1</text><text x="${540+g}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="#2af0ff" opacity=".6">CAPÍTULO 1</text><text x="540" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="#fff">CAPÍTULO 1</text><rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1090" text-anchor="middle" font-family="Inter" font-weight="900" font-size="150" letter-spacing="8" fill="#fff" stroke="#000" stroke-width="3">LA NOCHE</text></g>`}
function endcard(t){const u=t-122.4;const fade=clamp(u/.6);return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fade}"><text x="540" y="520" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="40" fill="#9aa4ae">// CINTA 1 — FIN DEL REGISTRO</text><text x="540" y="700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff2a3a" letter-spacing="6">PRÓXIMO CAPÍTULO</text><text x="540" y="800" text-anchor="middle" font-family="Inter" font-weight="900" font-size="56" fill="#fff">CAPÍTULO 2 | LAS ESCALERAS</text>${u>2?`<text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="800" font-size="56" fill="#ffd54a">¿QUÉ CREES QUE ES?</text><text x="540" y="1100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">A) UN EXPERIMENTO MILITAR</text><text x="540" y="1180" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">B) ALGO QUE SALIÓ DEL MAR</text>`:''}${u>4?`<text x="540" y="1400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="52" fill="#2af0ff">COMENTA TU ELECCIÓN</text><text x="540" y="1480" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#fff">SÍGUEME PARA EL CAPÍTULO 2</text>`:''}</g>`}
// ---- scene
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 const dark=t<T_BLACKOUT?0:sm((t-T_BLACKOUT)/2.5)*.34;
 BLURV=blur;let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 const SK=(process.env.SKIP||'').split(',');if(!SK.includes('bd'))w+=backdrop(t,cx,cy);if(!SK.includes('rf'))w+=rooftop(t,cx,cy,q);
 const rr=(rot+sr)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);const cor=[[-540,-960],[540,-960],[540,960],[-540,960]].map(([px,py])=>[cx+(px*cs+py*sn)/z,cy+(-px*sn+py*cs)/z]);const vx0=Math.min(...cor.map(c=>c[0])),vx1=Math.max(...cor.map(c=>c[0])),vy0=Math.min(...cor.map(c=>c[1])),vy1=Math.max(...cor.map(c=>c[1]));
 Object.keys(POSX).forEach(k=>{if(SK.includes(k))return;const x=POSX[k];if(x+300<vx0||x-300>vx1||1580<vy0||280>vy1)return;w+=charSVG(k,t,q,tn)});
 w+=`<rect x="-3500" y="-3000" width="9000" height="6000" fill="#050a1e" opacity="${dark.toFixed(2)}"/>`;
 const fire=t>80.4?.18*sm((t-80.4)/3)*(1+.2*Math.sin(t*19)):0;w+=`<rect x="-3500" y="-3000" width="9000" height="6000" fill="#ff5a1a" opacity="${fire.toFixed(3)}"/>`;
 w+=`</g>`;
 // flashes
 let fl=0;for(const ft of [80.0,91.7,119.5]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*.95)}
 if(t>=67.0&&t<67.12)fl=Math.max(fl,0);
 w+=`<rect width="${W}" height="${H}" fill="#fff6e0" opacity="${fl.toFixed(2)}"/>`;
 if(t>116){const d=sm((t-116)/5.3);w+=`<rect width="${W}" height="${H}" fill="#9a8a78" opacity="${(d*.8).toFixed(2)}"/>`+Array.from({length:6},(_,i)=>`<circle cx="${(i*260+((t*90)%260)).toFixed(0)}" cy="${(700+i*180+Math.sin(t*2+i)*60).toFixed(0)}" r="${(220+d*300).toFixed(0)}" fill="#c4b4a0" opacity="${(d*.35).toFixed(2)}"/>`).join('')}
 return w}
function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=inv(tn);let inner,hudOn=false;
 if(t<2.4)inner=hook(t);else if(t<3.2)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7)inner=intro(t);else if(t<10)inner=title(t);
 else if(t<122.0){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<122.4)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=10&&t<10.25)g=.6;if(t>=66.95&&t<67.2)g=.7;if(t>=119.3&&t<122)g=clamp((t-119.3)/2.5)*.9+.2;if(t>=2.0&&t<2.4)g=.8;
 if(t>=121.2&&t<122)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=121.2))?hud(tn)+caption(tn):'';
 const head=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
 if(mode==='parts')return{full:fixOp(head+defsScene+defs(CAST.beto)+out+ov+'</svg>'),base:fixOp(head+defsScene+defs(CAST.beto)+out+'</svg>'),overlay:fixOp(head+ov+'</svg>'),blur:BLURV};
 return fixOp(head+defsScene+defs(CAST.beto)+out+ov+'</svg>')}
function boxBlur(px,w,h,rad){const t=new Uint8ClampedArray(px.length);const pass=(src,dst,horiz)=>{const n=horiz?w:h,m=horiz?h:w,st=horiz?4:4*w,ln=horiz?4*w:4;const d=2*rad+1;for(let k=0;k<m;k++){const base=k*ln;for(let c=0;c<4;c++){let sum=0;const idx=i=>base+Math.min(n-1,Math.max(0,i))*st+c;for(let i=-rad;i<=rad;i++)sum+=src[idx(i)];for(let i=0;i<n;i++){dst[base+i*st+c]=sum/d;sum+=src[idx(i+rad+1)]-src[idx(i-rad)]}}}};pass(px,t,true);pass(t,px,false)}
function renderPng(t){const P=frame(t,'parts');const opt={font:{loadSystemFonts:true,defaultFontFamily:'Inter'},fitTo:{mode:'original'}};
 if(P.blur<=.8)return new Resvg(P.full,opt).render();
 const b=new Resvg(P.base,opt).render();const px=Uint8ClampedArray.from(b.pixels);const rad=Math.max(1,Math.round(P.blur*1.3));boxBlur(px,W,H,rad);boxBlur(px,W,H,Math.max(1,Math.round(rad*.7)));
 const o=new Resvg(P.overlay,opt).render().pixels;for(let i=0;i<px.length;i+=4){const a=o[i+3]/255;if(a>0){px[i]=o[i]*a+px[i]*(1-a);px[i+1]=o[i+1]*a+px[i+1]*(1-a);px[i+2]=o[i+2]*a+px[i+2]*(1-a)}}
 return{pixels:Buffer.from(px.buffer),asPng:()=>new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="1" height="1"/></svg>`).render().asPng()}}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(mode==='preview'){for(const a of process.argv.slice(3)){const t=parseFloat(a);const t0=Date.now();{const rp=renderPng(t);spawnSync('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-i','-',path.join(BUILD,`prev_${a}.png`)],{input:Buffer.from(rp.pixels.buffer?rp.pixels:rp.pixels),maxBuffer:1e8})}console.log(a,Date.now()-t0,'ms')}}
 else if(mode==='part'){const i=+process.argv[3],n=+process.argv[4];const total=DUR*FPS;const a=Math.floor(total*i/n),b=Math.floor(total*(i+1)/n);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf','gblur=sigma=0.7,eq=contrast=1.07:saturation=1.08,rgbashift=rh=-2:bh=2,noise=alls=11:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,`part_${i}.mp4`)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS};
