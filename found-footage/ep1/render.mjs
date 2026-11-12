import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {setCTM,mul,T} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,backdrop,rooftop,giantLeg,setEV,flickerState} from './scene.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep1');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;
const inv=tn=>tn;const EVT=TL.ev;setEV(EVT);const DURL=TL.durs;const Ls=id=>START[id],Le=id=>START[id]+DURL[id];
export {START,KF,kfAt};
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA'};
const POSX={beto:700,diego:1100,marta:1500,lucia:1900};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia'};
// ---- envelopes
function envelope(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_e_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>l.dur=l.env.length/FPS);
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}
// ---- camera
const SHOTS=[[10.0,900,1500,1.0,6,'s',0],[10.4,800,1100,.8,-1,'s',0],
 [Ls('l1')+.5,1100,900,1.0,0,'s',0],
 [Ls('l2')-.1,700,780,1.6,2,'n',2],
 [Ls('l3')-.1,1100,740,1.8,-2,'n',0],
 [Ls('l4')-.1,1500,740,1.8,2,'n',-2],
 [Ls('l5')-.1,1100,660,2.1,-1,'n',0],
 [Ls('a1')-.1,1500,700,1.9,1,'n',2],
 [Ls('a2')-.1,900,1300,1.0,6,'n',0],[Ls('a2')+1.6,1900,800,1.5,-2,'s',0],
 [Ls('a3')-.1,1900,680,2.0,2,'n',-2],
 [Ls('l6')-.1,1900,760,1.5,3,'n',-3],[Ls('l6')+1.2,1800,1050,.8,0,'s',0],
 [Ls('l7')-.1,1900,700,1.8,-2,'s',0],
 [Ls('l8')-.1,1900,610,2.2,0,'s',2],[Ls('l8')+3,1900,590,2.5,2,'p',0],
 [Ls('l9')-.1,1100,620,2.3,-2,'n',0],[Ls('l9')+2.5,1100,590,2.6,0,'p',0],
 [Ls('l10')-.2,700,780,1.6,0,'n',0],[Ls('l10')+2.0,1300,980,.75,2,'s',0],
 [EVT.tB-.2,1300,980,.72,0,'s',0],[EVT.tB+.5,1300,850,.62,5,'w',0],
 [Ls('l11')-.1,1900,760,1.7,-3,'n',0],
 [Ls('l12')-.1,1500,720,1.9,2,'n',0],
 [EVT.rumble0,1300,1000,.7,-2,'s',0],
 [EVT.flash1-.3,2300,880,.75,-3,'n',0],[EVT.boom1+.4,2300,780,1.0,2,'z',0],
 [Ls('l13')-.1,1100,660,2.0,0,'n',0],
 [Ls('l14')-.1,1500,700,1.9,2,'n',0],
 [Ls('l15')-.1,1500,610,2.3,0,'z',0],
 [EVT.flash2-.2,1300,880,.7,-4,'n',0],
 [Ls('l16')-.1,1900,620,2.2,3,'n',0],
 [Ls('l17')-.1,700,640,2.0,-3,'n',0],
 [EVT.roar-.2,1300,820,.62,5,'w',0],[EVT.roar+2.0,1300,500,.6,2,'s',0],
 [Ls('l18')-.2,1100,640,2.1,-2,'s',3],[Ls('l18')+3,1100,600,2.6,0,'p',0],
 [Ls('l19')-.1,1500,640,2.0,2,'n',-2],
 [Ls('l20')-.1,1300,780,.6,3,'n',0],
 [EVT.collapse+.3,1500,760,.6,-6,'w',0],
 [Ls('l21')-.1,1900,620,2.0,-4,'w',3],
 [EVT.impact-.2,1300,700,.6,2,'w',0],[EVT.fall,1300,1500,.8,78,'w',0]];
SHOTS.sort((x,y)=>x[0]-y[0]);
const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let c=ch(SHOTS[0]);for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SHOTS[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[EVT.boom1,38],[EVT.boom2,60],[EVT.roar,50],[EVT.collapse+.3,60],[EVT.impact,90]];
function shakeAmp(t){let a=4.5+3*clamp((t-EVT.flick0)/(EVT.collapse-EVT.flick0),0,1);if(t>EVT.rumble0&&t<EVT.boom1)a=12;if(t>=EVT.boom1&&t<EVT.boom1+4)a+=6;if(t>EVT.boom2-1&&t<EVT.boom2+6)a=26;if(t>EVT.roar&&t<EVT.collapse)a=14;if(t>EVT.collapse&&t<EVT.impact+3)a=34;for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
// ---- characters
const WHOL=['beto','diego','marta','lucia'];
const A=(a,b,c,d)=>({beto:a,diego:b,marta:c,lucia:d});
const EXL={
 l0:A('neutral','neutral','neutral','neutral'),
 l1:A('amused','smirk','annoyed','amused'),
 l2:A('laugh','annoyed','smirk','amused'),
 l3:A('laugh',[[0,'worry'],[.6,'tender']],'smirk','laugh'),
 l4:A('neutral','tender',[[0,'annoyed'],[.7,'sad']],'tender'),
 l5:A('amused','smirk','annoyed','tender'),
 a1:A('amused','smirk','smirk','tender'),
 a2:A('laugh','amused','smirk','amused'),
 a3:A('amused','amused','laugh',[[0,'disbelief'],[.6,'smirk']]),
 l6:A('amused','neutral','neutral','amused'),
 l7:A('amused','amused','amused','worry'),
 l8:A('amused',[[0,'amused'],[.6,'tender'],[.9,'sad']],[[0,'amused'],[.7,'tender']],[[0,'worry'],[.5,'tender']]),
 l9:A('amused','cryLaugh','tender','tender'),
 l10:A('laugh','amused','laugh','laugh'),
 l11:A('disbelief','neutral','neutral','worry'),
 l12:A('worry','worry','worry','worry'),
 l13:A('worry','worry','worry','worry'),
 l14:A('worry','worry','worry','fear'),
 l15:A('fear','fear','fear','fear'),
 l16:A('fear','shock','fear','fear'),
 l17:A('scream','fear','fear','fear'),
 l18:A('shock','shock','shock','shock'),
 l19:A('fear','fear','scream','fear'),
 l20:A('fear','fear','fear','fear'),
 l21:A('shock','shock','shock','scream')};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex='amused';if(tn<START.l1)return ex;
 for(const l of LINES){const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.12*idx);if(tn<t0)break;const en=EXL[l.id][who];if(Array.isArray(en)){for(const [fr,e] of en)if(tn>=t0+fr*l.dur)ex=e}else ex=en}
 if(tn>Le('l21')+2.6)ex='shock';return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3};
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const CUPR={w:[352,326],hand:'grip',prop:'cup',fs:.55,rot:4},CUPL={w:[152,330],hand:'grip',prop:'cup',fs:.55,rot:-4};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const DEF2={L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}};
const CLUTCH={L:{e:[116,290],w:[160,168],hand:'open',front:1},R:{e:[384,290],w:[340,168],hand:'open',front:1}};
const CUPUPR=(y)=>({w:[404,y],hand:'grip',prop:'cup',rot:8});
const KF={
 beto:[[0,{L:REL.L,R:CUPR}],[Ls('l2'),{L:{w:[120,300],hand:'open'},R:{w:[398,236],hand:'grip',prop:'cup',rot:12}}],[Le('l2')+.4,{L:REL.L,R:CUPR}],[Ls('l10')-.2,{L:REL.L,R:CUPUPR(172)}],[Le('l10')+.6,{L:REL.L,R:CUPR}],[EVT.tB,{L:{w:[206,300],hand:'open'},R:CUPR}],[EVT.boom2-.5,DEF2],[EVT.roar,CLUTCH]],
 diego:[[0,{L:CUPL,R:REL.R}],[Ls('l3'),{L:CUPL,R:{e:[332,332],w:[282,238],hand:'open',front:1}}],[Le('l3'),{L:CUPL,R:REL.R}],[Ls('l9')+1.2,{L:CUPL,R:{e:[332,332],w:[286,178],hand:'open',front:1}}],[Le('l9'),{L:CUPL,R:REL.R}],[Ls('l10')-.2,{L:{w:[96,196],hand:'grip',prop:'cup',rot:-8},R:REL.R}],[Le('l10')+.6,{L:CUPL,R:REL.R}],[EVT.tB,REL],[EVT.boom2-.3,MOUTH()],[Ls('l18')+1,{L:MOUTH().L,R:{w:[452,200],hand:'point'}}]],
 marta:[[0,{L:REL.L,R:CUPR}],[Ls('l4'),{L:{w:[262,332],hand:'relax'},R:{w:[238,336],hand:'relax'}}],[Le('l5'),{L:REL.L,R:CUPR}],[Ls('l10')-.2,{L:REL.L,R:CUPUPR(200)}],[Le('l10')+.6,{L:REL.L,R:CUPR}],[EVT.boom1+.2,MOUTH()],[Ls('l19'),{L:MOUTH().L,R:{w:[350,262],hand:'open'}}]],
 lucia:[[0,{L:REL.L,R:{w:[364,254],hand:'grip',prop:'cup'}}],[Ls('l8'),{L:{w:[236,322],hand:'open'},R:{w:[364,254],hand:'grip',prop:'cup'}}],[Ls('l10')-.2,{L:REL.L,R:CUPUPR(196)}],[Le('l10')+.6,{L:REL.L,R:{w:[364,254],hand:'grip',prop:'cup'}}],[EVT.tB,{L:REL.L,R:CUPR}],[Ls('l16'),MOUTH()],[EVT.boom2-.3,CLUTCH]]};
const SH={L:[186,240],R:[314,240]};
const ease=x=>{x=clamp(x);const c1=1.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function polar(sh,a,b,u){const ra=Math.hypot(a[0]-sh[0],a[1]-sh[1]),rb=Math.hypot(b[0]-sh[0],b[1]-sh[1]);let ta=Math.atan2(a[1]-sh[1],a[0]-sh[0]),tb=Math.atan2(b[1]-sh[1],b[0]-sh[0]);let d=tb-ta;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const th=ta+d*u,rr=ra+(rb-ra)*u;return[sh[0]+Math.cos(th)*rr,sh[1]+Math.sin(th)*rr]}
function kfAt(arr,t){let i=0;while(i+1<arr.length&&arr[i+1][0]<=t)i++;const cur=arr[i][1],prev=i>0?arr[i-1][1]:cur;const uu=clamp((t-arr[i][0])/.6);const u=ease(uu);const out={};for(const s of ['L','R']){const a=prev[s],b=cur[s];const pick=uu>.3?b:a;const side=s==='L'?-1:1;out[s]={w:polar(SH[s],a.w,b.w,u),hand:pick.hand,prop:pick.prop,fs:lerp(a.fs||1,b.fs||1,u),rot:pick.rot,front:pick.front};
 if(a.e||b.e){const ea=a.e||elbow(SH[s],a.w,side,a.fs||1),eb=b.e||elbow(SH[s],b.w,side,b.fs||1);out[s].e=polar(SH[s],ea,eb,u)}}return out}
function exprAt(arr,t){let e=arr[0][1];for(const [ti,ex] of arr)if(t>=ti)e=ex;return e}
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
function look(who,t,tn){const sp=speakerAt(tn);const mx=POSX[who];if(t>EVT.flash1-.5&&t<EVT.boom1+3)return[.9,-.6];if(t>EVT.roar&&t<Ls('l18'))return[.4,-.7];if(t>Ls('l20')&&t<EVT.impact)return[.5,-.6];if(sp&&sp.who!=='Tomas'&&WHOKEY[sp.who]!==who)return[clamp((POSX[WHOKEY[sp.who]]-mx)/500,-1,1),.1];return[0,.15]}
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
function intro(t){const fl=Math.random()<0?0:(Math.sin(t*50)>.9?.5:1);return `<rect width="${W}" height="${H}" fill="#05070a"/>`+typeText(['MATERIAL RECUPERADO','CÁMARA DIGITAL · CINTA 1','ENCONTRADA 4 DÍAS DESPUÉS','ZONA RESTRINGIDA — SECTOR NORTE'],t,3.2,30)+`<g opacity=".25">${Array.from({length:30},(_,i)=>`<rect x="0" y="${i*64}" width="${W}" height="2" fill="#fff"/>`).join('')}</g>`}
function title(t){const u=t-7;const ser=`<text x="540" y="150" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.3)?10:2;return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}"><text x="${540-g}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="#ff2a3a" opacity=".7">CAPÍTULO 1</text><text x="${540+g}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="#2af0ff" opacity=".6">CAPÍTULO 1</text><text x="540" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="#fff">CAPÍTULO 1</text><rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1090" text-anchor="middle" font-family="Inter" font-weight="900" font-size="150" letter-spacing="8" fill="#fff" stroke="#000" stroke-width="3">LA NOCHE</text></g>`}
function endcard(t){const u=t-EVT.endcard;const fade=clamp(u/.6);return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fade}"><text x="540" y="520" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="40" fill="#9aa4ae">// CINTA 1 — FIN DEL REGISTRO</text><text x="540" y="700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff2a3a" letter-spacing="6">PRÓXIMO CAPÍTULO</text><text x="540" y="800" text-anchor="middle" font-family="Inter" font-weight="900" font-size="56" fill="#fff">CAPÍTULO 2 | LAS ESCALERAS</text>${u>2?`<text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="800" font-size="56" fill="#ffd54a">¿QUÉ CREES QUE ES?</text><text x="540" y="1100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">A) UN EXPERIMENTO MILITAR</text><text x="540" y="1180" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">B) ALGO QUE SALIÓ DEL MAR</text>`:''}${u>4?`<text x="540" y="1400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="52" fill="#2af0ff">COMENTA TU ELECCIÓN</text><text x="540" y="1480" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#fff">SÍGUEME PARA EL CAPÍTULO 2</text>`:''}</g>`}
// ---- scene
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 const fk=flickerState(t);const dark=t<EVT.flick0?0:t<EVT.tB?(fk<.2?.42:.14):Math.min(.5,sm((t-EVT.tB)/2)*.5);
 BLURV=blur;let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 const SK=(process.env.SKIP||'').split(',');if(!SK.includes('bd'))w+=backdrop(t,cx,cy);if(!SK.includes('rf'))w+=rooftop(t,cx,cy,q);
 const rr=(rot+sr)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);const cor=[[-540,-960],[540,-960],[540,960],[-540,960]].map(([px,py])=>[cx+(px*cs+py*sn)/z,cy+(-px*sn+py*cs)/z]);const vx0=Math.min(...cor.map(c=>c[0])),vx1=Math.max(...cor.map(c=>c[0])),vy0=Math.min(...cor.map(c=>c[1])),vy1=Math.max(...cor.map(c=>c[1]));
 Object.keys(POSX).forEach(k=>{if(SK.includes(k))return;const x=POSX[k];if(x+300<vx0||x-300>vx1||1580<vy0||280>vy1)return;w+=charSVG(k,t,q,tn)});
 w+=`<rect x="-3500" y="-3000" width="9000" height="6000" fill="#050a1e" opacity="${dark.toFixed(2)}"/>`;
 const fire=t>EVT.boom1?.18*sm((t-EVT.boom1)/3)*(1+.2*Math.sin(t*19)):0;w+=`<rect x="-3500" y="-3000" width="9000" height="6000" fill="#ff5a1a" opacity="${fire.toFixed(3)}"/>`;
 w+=`</g>`;
 w+=`<rect width="${W}" height="${H}" fill="#0a1a38" opacity=".12"/>`;
 // flashes
 let fl=0;for(const ft of [EVT.flash1,EVT.flash2,EVT.impact]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*.95)}
 w+=`<rect width="${W}" height="${H}" fill="#fff6e0" opacity="${fl.toFixed(2)}"/>`;
 if(t>EVT.collapse){const d=sm((t-EVT.collapse)/5.3);w+=`<rect width="${W}" height="${H}" fill="#9a8a78" opacity="${(d*.8).toFixed(2)}"/>`+Array.from({length:6},(_,i)=>`<circle cx="${(i*260+((t*90)%260)).toFixed(0)}" cy="${(700+i*180+Math.sin(t*2+i)*60).toFixed(0)}" r="${(220+d*300).toFixed(0)}" fill="#c4b4a0" opacity="${(d*.35).toFixed(2)}"/>`).join('')}
 return w}
function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=inv(tn);let inner,hudOn=false;
 if(t<2.4)inner=hook(t);else if(t<3.2)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7)inner=intro(t);else if(t<10)inner=title(t);
 else if(t<EVT.black){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=10&&t<10.25)g=.6;if(t>=EVT.tB-.05&&t<EVT.tB+.2)g=.7;if(t>=EVT.impact-.2&&t<EVT.black)g=clamp((t-EVT.impact+.2)/2.2)*.9+.2;if(t>=2.0&&t<2.4)g=.8;
 if(t>=EVT.black-1.2&&t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=EVT.black-1.2))?hud(tn)+caption(tn):(t>=3.2&&t<10?caption(tn):'');
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
 else if(mode==='part'||mode==='seg'){const i=+process.argv[3],n=+process.argv[4];const total=DUR*FPS;let a=Math.floor(total*i/n),b=Math.floor(total*(i+1)/n);let outName=`part_${i}.mp4`;if(mode==='seg'){a=Math.round(+process.argv[3]*FPS);b=Math.round(+process.argv[4]*FPS);outName=process.argv[5]}
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf',(()=>{const t0=EVT.tB+4-a/FPS,t1=EVT.boom2+7-a/FPS;const en=`enable='between(t,${t0.toFixed(2)},${t1.toFixed(2)})'`;return `gblur=sigma=0.7,eq=contrast=1.07:saturation=0.85,rgbashift=rh=-2:bh=2,colorchannelmixer=rr=.15:rg=.15:rb=.15:gr=.9:gg=.9:gb=.9:br=.1:bg=.1:bb=.1:${en},eq=brightness=.09:contrast=1.25:${en},noise=alls=11:allf=t,noise=alls=26:allf=t:${en},vignette=angle=PI/4.2`})(),'-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,outName)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS};
