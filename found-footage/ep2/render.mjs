import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {limb as limbS,grp as grpS,hand as handW,handSkin,gripV2 as gripS} from '../char.mjs';
import {setCTM,mul,T} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,backdrop,dust,creature,rushers,setEV,descent,speedAt} from './scene.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep2');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;
const inv=tn=>tn;const EVT=TL.ev;setEV(EVT);const DURL=TL.durs;const Ls=id=>START[id],Le=id=>START[id]+DURL[id];
export {START,KF,kfAt};
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA',Sofi:'SOFI',Vecino:'VECINO'};
const POSX={beto:560,diego:960,sofi:1230,lucia:1500,marta:1900};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi'};
// ---- envelopes
function envelope(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>l.dur=l.env.length/FPS);
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}
// ---- camera
const SHOTS=[[7.4,1300,1000,.7,0,'s',0],[Ls('l0')+1,1300,900,.9,-1,'p',0],
 [Ls('a1')-.1,560,780,1.7,2,'n',2],[Ls('a2')-.1,1900,740,1.8,-2,'n',-2],[Ls('a2')+2.5,1250,950,.75,0,'s',0],
 [Ls('a3')-.1,960,720,1.9,1,'s',0],[Ls('a3')+1.5,1500,760,1.7,2,'s',0],[Ls('a4')-.1,1500,700,2.0,3,'n',0],
 [EVT.rush-.3,1250,1000,.7,-3,'w',0],[Ls('a6')-.2,1250,900,.8,0,'s',0],[Ls('a6')+1.2,1250,640,1.6,2,'s',0],
 [Ls('a7')-.1,1230,820,1.7,-1,'n',0],[Ls('a8')-.1,960,700,1.9,0,'n',0],[Ls('a9')-.1,1230,760,2.0,1,'s',0],
 [EVT.clicks,1250,560,1.4,-2,'s',0],[Ls('a10')-.1,560,700,2.0,-3,'n',0],[Ls('a11')-.1,1900,700,1.9,2,'n',0],
 [EVT.reveal-.3,1500,300,.9,-3,'w',0],[EVT.drop+.2,1550,640,1.8,4,'w',0],[Ls('a12'),1500,610,2.3,-5,'n',0],
 [EVT.smash-.3,1700,700,1.5,4,'w',0],[Ls('a13')+.3,1900,640,2.0,0,'n',0],
 [Ls('a14')-.1,1250,780,.75,3,'n',0],[Ls('a15')-.1,1100,720,1.7,-2,'n',0],
 [EVT.gstep-.2,1250,700,.7,-5,'w',0],[Ls('a16')-.1,560,700,1.9,3,'n',0],
 [EVT.run+.3,1250,1000,.7,0,'s',0],[EVT.collapse-.4,1250,900,.75,-4,'n',0],[EVT.collapse+.3,560,1100,1.3,6,'w',0],
 [Ls('a17')-.1,560,860,1.9,-3,'n',0],[Ls('a18')-.1,960,760,1.7,2,'n',0],
 [EVT.wallburst-.2,1500,700,.7,-5,'w',0],[Ls('a19')-.1,1500,620,2.0,3,'n',0],[EVT.eye+.4,1500,620,.62,0,'s',0],
 [EVT.fall,1250,1500,.8,78,'w',0]];
SHOTS.sort((x,y)=>x[0]-y[0]);
const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let c=ch(SHOTS[0]);for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SHOTS[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[EVT.gstep,60],[EVT.collapse,80],[EVT.wallburst,90],[EVT.smash,30],[EVT.drop,35],[EVT.fall,90]];
function shakeAmp(t){let a=4.5+2*clamp((t-EVT.cam)/60,0,1);const sp=speedAt(t);a+=sp>100?(sp/380)*3.5:0;if(t>EVT.reveal-.2&&t<EVT.smash+1)a+=6;if(t>EVT.gstep&&t<EVT.collapse+3)a+=10;if(t>EVT.wallburst&&t<EVT.fall)a+=14;if(t>=EVT.fall)a+=30;for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
// ---- characters
const WHOL=['beto','diego','sofi','lucia','marta'];
const A=(a,b,c,d,e)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e});
const EXL={
 l0:A('neutral','neutral','neutral','neutral','neutral'),
 a1:A('worry','worry','neutral','fear','worry'),
 a2:A('worry','worry','neutral','fear','annoyed'),
 a3:A('worry','tender','neutral',[[0,'fear'],[.6,'tender']],'worry'),
 a4:A('fear','fear','neutral','fear','fear'),
 a5:A('fear','fear','neutral','fear','fear'),
 a6:A('worry','worry','neutral','fear','worry'),
 a7:A('worry','tender','fear','worry','worry'),
 a8:A('worry','tender','sad','tender','worry'),
 a9:A('fear','worry',[[0,'sad'],[.6,'fear']],'fear','fear'),
 a10:A('fear','fear','fear','fear','fear'),
 a11:A('fear','fear','fear','fear','annoyed'),
 a12:A('shock','shock','scream','scream','shock'),
 a13:A('shock','shock','scream','shock','scream'),
 a14:A('shock','shock','shock','shock','shock'),
 a15:A('fear','worry','fear','fear','fear'),
 a16:A('scream','fear','fear','fear','fear'),
 a17:A('scream','shock','fear','shock','shock'),
 a18:A('scream','fear','sad','fear','fear'),
 a19:A('shock','shock','shock','shock','shock'),
 a20:A('shock','shock','shock','shock','shock')};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex='worry';if(tn<START.a1)return'neutral';
 for(const l of LINES){if(!EXL[l.id])continue;const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.1*idx);if(tn<t0)break;const en=EXL[l.id][who];if(Array.isArray(en)){for(const [fr,e] of en)if(tn>=t0+fr*l.dur)ex=e}else ex=en}
 if(tn>Le('a20')+1)ex='shock';return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3};
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const DEF2={L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}};
const CLUTCH={L:{e:[116,290],w:[160,168],hand:'open',front:1},R:{e:[384,290],w:[340,168],hand:'open',front:1}};
const KF={
 beto:[[0,REL],[Ls('a1'),{L:{w:[132,330],hand:'open'},R:REL.R}],[Le('a1')+.3,REL],[Ls('a10'),MOUTH()],[EVT.gstep-.3,DEF2],[EVT.collapse-.2,{L:{e:[118,322],w:[134,214],hand:'open'},R:{w:[420,360],hand:'open'}}]],
 diego:[[0,REL],[Ls('a3'),{L:REL.L,R:{w:[410,380],hand:'open'}}],[Le('a3')+.4,REL],[Ls('a8'),{L:{w:[100,340],hand:'open'},R:REL.R}],[Le('a9'),{L:{w:[130,360],hand:'relax'},R:REL.R}],[Ls('a15'),{L:{w:[96,330],hand:'open'},R:REL.R}]],
 sofi:[[0,REL],[Ls('a9')+.5,MOUTH()],[EVT.drop,{L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}}],[Ls('a15'),REL]],
 lucia:[[0,REL],[Ls('a3'),{L:REL.L,R:{w:[392,372],hand:'open'}}],[Le('a3')+.3,REL],[Ls('a4'),MOUTH()],[Le('a4')+.5,REL],[EVT.drop,DEF2],[EVT.smash-.3,CLUTCH],[EVT.smash+1.2,MOUTH()]],
 marta:[[0,REL],[Ls('a2'),{L:REL.L,R:{w:[420,300],hand:'open'}}],[Le('a2')+.3,REL],[Ls('a11')+.2,{L:{w:[60,330],hand:'grip',prop:'ext',fs:.6,rot:-20},R:REL.R}],[EVT.smash-.5,{L:{w:[88,150],hand:'grip',prop:'ext',rot:-40},R:REL.R}],[EVT.smash,{L:{w:[60,300],hand:'grip',prop:'ext',rot:-70},R:REL.R}],[EVT.smash+.6,{L:{w:[70,330],hand:'grip',prop:'ext',fs:.6,rot:-20},R:REL.R}],[EVT.gstep-.3,{L:{w:[70,330],hand:'grip',prop:'ext',fs:.6,rot:-20},R:{e:[382,322],w:[366,214],hand:'open'}}]]};
const SH={L:[186,240],R:[314,240]};
const ease=x=>{x=clamp(x);const c1=1.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function polar(sh,a,b,u){const ra=Math.hypot(a[0]-sh[0],a[1]-sh[1]),rb=Math.hypot(b[0]-sh[0],b[1]-sh[1]);let ta=Math.atan2(a[1]-sh[1],a[0]-sh[0]),tb=Math.atan2(b[1]-sh[1],b[0]-sh[0]);let d=tb-ta;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const th=ta+d*u,rr=ra+(rb-ra)*u;return[sh[0]+Math.cos(th)*rr,sh[1]+Math.sin(th)*rr]}
function kfAt(arr,t){let i=0;while(i+1<arr.length&&arr[i+1][0]<=t)i++;const cur=arr[i][1],prev=i>0?arr[i-1][1]:cur;const uu=clamp((t-arr[i][0])/.6);const u=ease(uu);const out={};for(const s of ['L','R']){const a=prev[s],b=cur[s];const pick=uu>.3?b:a;const side=s==='L'?-1:1;out[s]={w:polar(SH[s],a.w,b.w,u),hand:pick.hand,prop:pick.prop,fs:lerp(a.fs||1,b.fs||1,u),rot:pick.rot,front:pick.front};
 if(a.e||b.e){const ea=a.e||elbow(SH[s],a.w,side,a.fs||1),eb=b.e||elbow(SH[s],b.w,side,b.fs||1);out[s].e=polar(SH[s],ea,eb,u)}}return out}
function exprAt(arr,t){let e=arr[0][1];for(const [ti,ex] of arr)if(t>=ti)e=ex;return e}
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
function look(who,t,tn){const sp=speakerAt(tn);const mx=POSX[who];if(t>EVT.reveal-.5&&t<EVT.smash+.5)return[0,-.9];if(t>EVT.wallburst&&t<EVT.fall)return[.5,-.5];if(t>EVT.rush&&t<EVT.rush+2.5)return[.9,0];if(sp&&sp.who!=='Tomas'&&sp.who!=='Vecino'&&WHOKEY[sp.who]!==who)return[clamp((POSX[WHOKEY[sp.who]]-mx)/500,-1,1),.1];return[0,.15]}
function charSVG(who,t,shock,tn){const st=CAST[who];const pose=kfAt(KF[who],t);const sp=speakerAt(tn);const talk=sp&&WHOKEY[sp.who]===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.7):0;
 const idx=WHOL.indexOf(who);const bl=blinkAt(idx*.37,t);const lk=look(who,t,tn);
 const br=Math.sin(t*1.9+idx);const sway=Math.sin(t*.8+idx*2)*.8+Math.sin(t*9+idx)*.5*quakeLvl(t);
 const run=t>EVT.run&&t<EVT.collapse;const sp_=speedAt(t);const amp=clamp(sp_/380,0,2.2);const phase=t*(run?11:6.2)+idx*.9;
 for(const s of ['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+Math.sin(t*14+idx)*2*quakeLvl(t)]}
 const ex=exprNew(who,tn);pose.walk={phase,amp};
 pose.expr=ex;pose.blink=bl;pose.look=lk;pose.talk=talk;pose.breath=br;pose.head={rot:lk[0]*3+(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.2:0),dx:lk[0]*3,dy:Math.sin(t*1.9+idx)*1.2+(ex==='shock'||ex==='scream'?-4:0)+Math.abs(Math.sin(phase))*-5*amp};
 let s=who==='sofi'?1.05:1.5,x=POSX[who],fy=1500+(who==='sofi'?0:0);let rot=sway;
 const bob=-Math.abs(Math.sin(phase))*9*amp*(who==='sofi'?.6:1);let yoff=bob;
 if(who==='beto'&&t>EVT.collapse){const u=clamp((t-EVT.collapse)/.5);yoff+=u*70;rot+=u*7}
 const Mch=mul(mul(T(x-250*s,fy-752*s+yoff,0,s,s),T(250,752)),mul(T(0,0,rot,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 return `<ellipse cx="${x}" cy="${fy+10}" rx="${190*s/1.5}" ry="${28*s/1.5}" fill="#000" opacity=".5"/><g transform="translate(${x-250*s},${fy-752*s+yoff}) scale(${s}) rotate(${rot.toFixed(2)} 250 752)">${bd}</g>`}

// ---- overlays
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),24);const fs=lines.length>2?50:56;let s='';const y0=1560-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="540" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="540" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]}</text>`+s}
function hud(t){const el=Math.max(0,t-EVT.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="96" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="108" font-size="38" font-weight="700">REC</text><text x="760" y="108" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="1780" font-size="32">SEP 18 2025  22:14</text><text x="800" y="1780" font-size="32">SP ▮▮▮▯</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,50h60M50,50v60M1030,50h-60M1030,50v60M50,1870h60M50,1870v-60M1030,1870h-60M1030,1870v-60"/><path d="M510,960h60M540,930v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
// ---- special scenes
function typeText(lines,t,t0,cps){return''}
function hook(t){const u=clamp(t/2.8);const sh=n=>(Math.sin(t*61*n)+Math.sin(t*37*n+1))*14;const sc=.6+u*u*5.4;const fl=u>.86?1:Math.max(0,Math.sin(t*34))*.3;
 let bg='';for(let k=0;k<9;k++){bg+=`<rect x="${k*130-20+sh(.2)*2}" y="0" width="8" height="${H}" fill="#2a2d33" fill-opacity=".6"/>`}
 return `<rect width="${W}" height="${H}" fill="#0b0608"/>${bg}<circle cx="${300+sh(.3)}" cy="500" r="620" fill="url(#redG)" fill-opacity="${(.4+.3*Math.sin(t*22)).toFixed(2)}"/><polygon points="${560+sh(1)},1900 ${760},1900 ${600+sh(2)*3},700 ${520},700" fill="url(#beamCone)"/><g transform="translate(${540+sh(1)},${900+sh(2)}) rotate(${sh(.3)*.5})">${creature(0,0,sc,t*26,0,0)}</g><rect width="${W}" height="${H}" fill="#ff2a1a" fill-opacity="${(.1+.08*Math.sin(t*40)).toFixed(2)}"/><rect width="${W}" height="${H}" fill="#fff" fill-opacity="${fl.toFixed(2)}"/>`}
function title(t){const u=t-3.2;const ser=`<text x="540" y="150" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.3)?10:2;
 const T=(x,fill,op)=>`<text x="${x}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="${fill}" fill-opacity="${op}">CAPÍTULO 2</text>`;
 return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}">${T(540-g,'#ff2a3a',.7)}${T(540+g,'#2af0ff',.6)}${T(540,'#fff',1)}<rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1080" text-anchor="middle" font-family="Inter" font-weight="900" font-size="104" letter-spacing="4" fill="#fff" stroke="#000" stroke-width="3">LAS ESCALERAS</text></g>`}
function endcard(t){const u=t-EVT.endcard;const fade=clamp(u/.6);return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fade}"><text x="540" y="520" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="40" fill="#9aa4ae">// CINTA 2 — FIN DEL REGISTRO</text><text x="540" y="700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff2a3a" letter-spacing="6">PRÓXIMO CAPÍTULO</text><text x="540" y="800" text-anchor="middle" font-family="Inter" font-weight="900" font-size="76" fill="#fff">CAPÍTULO 3 | LA CALLE</text>${u>2?`<text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="800" font-size="54" fill="#ffd54a">¿QUÉ ERA ESE OJO?</text><text x="540" y="1100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">A) EL MONSTRUO</text><text x="540" y="1180" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">B) ALGO MÁS GRANDE</text>`:''}${u>4?`<text x="540" y="1400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="52" fill="#2af0ff">COMENTA TU ELECCIÓN</text><text x="540" y="1480" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#fff">SÍGUEME PARA EL CAPÍTULO 3</text>`:''}</g>`}
// ---- operator hand (the person filming)
function opState(t){const sw=Math.sin(t*1.3)*10+Math.sin(t*3.1)*5;let wx=800+sw,wy=1650+Math.sin(t*1.7)*8,ang=-32,bx=560+Math.sin(t*.9)*40,by=900+Math.sin(t*1.1)*30,on=1,lift=0;
 const bobR=t>EVT.run&&t<EVT.collapse;if(bobR){wy+=Math.sin(t*11)*26;bx+=Math.sin(t*5.5)*50;by+=Math.abs(Math.sin(t*11))*60}
 if(t>EVT.reveal-.3&&t<EVT.drop+.2){bx=860+Math.sin(t*3)*30;by=280;wy-=90;ang=-12}
 else if(t>=EVT.drop+.2&&t<EVT.smash+1.2){bx=700+Math.sin(t*8)*110;by=800+Math.cos(t*9)*90;wx+=Math.sin(t*20)*14}
 if(t>EVT.gstep&&t<EVT.gstep+3){wx+=Math.sin(t*30)*16*Math.exp(-(t-EVT.gstep));on=Math.sin(t*40)>-.4?1:.2}
 if(t>EVT.collapse&&t<EVT.wallburst){bx=380;by=1150;wx+=Math.sin(t*22)*10}
 if(t>=EVT.wallburst&&t<EVT.fall){bx=860;by=760;wx+=Math.sin(t*26)*8+Math.sin(t*3)*14;wy+=Math.sin(t*20)*8}
 if(t>=EVT.fall){const u=t-EVT.fall;wx+=u*u*500;wy-=u*500;ang-=u*160;on=Math.sin(t*50)>0?1:0}
 return {wx,wy,ang,sc:3.0,bx,by,on}}
function operatorHand(t){const S=opState(t);const st=CAST.tomas;const a=S.ang*Math.PI/180;const ox=S.wx+S.sc*114*Math.sin(a),oy=S.wy-S.sc*114*Math.cos(a);
 let s='';
 const sleeve=limbS([S.wx+330,S.wy+520],[S.wx+10,S.wy+50],170,120);setCTM([1,0,0,1,0,0]);
 s+=grpS(sleeve,st.hood,st,[S.wx-200,S.wy-100,700,800],{ow:5,sd:8});
 s+=`<path d="M${(S.wx-70).toFixed(0)},${(S.wy+30).toFixed(0)} q70,50 140,0" stroke="#15181c" stroke-width="6" fill="none" opacity=".5"/>`;
 setCTM(T(S.wx,S.wy,S.ang,S.sc,S.sc));const hnd=gripS(st,'flash');setCTM([1,0,0,1,0,0]);
 s+=`<g transform="translate(${S.wx.toFixed(1)},${S.wy.toFixed(1)}) rotate(${S.ang}) scale(${S.sc})">${hnd}</g>`;
 // beam cone
 if(S.on){const dx=S.bx-ox,dy=S.by-oy,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;s=`<polygon points="${(ox+nx*10).toFixed(0)},${(oy+ny*10).toFixed(0)} ${(S.bx+nx*330).toFixed(0)},${(S.by+ny*330).toFixed(0)} ${(S.bx-nx*330).toFixed(0)},${(S.by-ny*330).toFixed(0)} ${(ox-nx*10).toFixed(0)},${(oy-ny*10).toFixed(0)}" fill="#e8f2ff" fill-opacity=".16"/>`+s}
 // left hand offering palm to Sofi
 if(t>Ls('a8')-.3&&t<Le('a9')+.6){const u=sm((t-Ls('a8')+.3)/.5)*(1-sm((t-Le('a9'))/.5));setCTM(T(200,1900-u*330,18,3.0,3.0));const hl=handSkin('open',st);setCTM([1,0,0,1,0,0]);s+=`<g transform="translate(200,${(1900-u*330).toFixed(0)}) rotate(18) scale(3 3)"><g transform="rotate(-90)">${hl}</g></g>`}
 // fall: palm over lens
 if(t>=EVT.fall+.35){const u=clamp((t-EVT.fall-.35)/.4);setCTM(T(540,980,-8,8*u+.1,8*u+.1));const hp=handSkin('open',st);setCTM([1,0,0,1,0,0]);s+=`<g transform="translate(540,980) rotate(-8) scale(${(8*u+.1).toFixed(2)})"><g transform="translate(-30,-30)">${hp}</g></g>`}
 return {svg:s,bx:S.bx,by:S.by,on:S.on}}
function rubble(t){if(t<EVT.collapse)return'';const u=sm((t-EVT.collapse)/.5);const dy=(1-u)*-300;return `<g transform="translate(0,${dy})"><polygon points="230,1640 320,1470 470,1380 610,1340 770,1400 920,1510 980,1640" fill="#2b2e35" stroke="#08090c" stroke-width="9"/><polygon points="360,1500 560,1400 700,1470 640,1570 420,1580" fill="#3c4048"/><polygon points="700,1500 860,1470 930,1560 780,1600" fill="#23262c"/><path d="M420,1400 L380,1250 M640,1350 L700,1180 M800,1420 L860,1290" stroke="#6a5f58" stroke-width="7"/><ellipse cx="620" cy="1480" rx="520" ry="160" fill="url(#dustG)" fill-opacity="${(.55*(1-clamp((t-EVT.collapse-2)/4))).toFixed(2)}"/></g>`}
function creatureLayer(t){if(t<EVT.reveal||t>EVT.smash+3.2)return'';let s='';
 if(t<EVT.drop){const u=(t-EVT.reveal)/(EVT.drop-EVT.reveal);s=creature(lerp(1100,1500,u),250+Math.sin(t*6)*12,.75,t*22,180,0)}
 else if(t<EVT.smash){const u=clamp((t-EVT.drop)/.35);const x=lerp(1500,1596,u)+(u>=1?Math.sin(t*14)*70:0),y=lerp(260,700,u*u)+(u>=1?Math.cos(t*17)*40:0);s=creature(x,y,.55,t*30,(u>=1?Math.sin(t*12)*70:90*(1-u)))}
 else{const k=clamp((t-EVT.smash)/.15);s=`<ellipse cx="1596" cy="716" rx="${(140*k).toFixed(0)}" ry="${(60*k).toFixed(0)}" fill="#0a0507" fill-opacity=".92"/><path d="M1500,700 L1450,760 M1620,740 L1700,800 M1580,690 L1560,630" stroke="#0a0507" stroke-width="9" stroke-linecap="round"/><path d="M1500,720 Q1596,760 1700,720" stroke="#6a4a62" stroke-width="4" fill="none"/>`+(t<EVT.smash+1.2?creature(1596,712,.55,0,12,.9):'')}
 return s}
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8+Math.sin(t*(t>EVT.run&&t<EVT.collapse?11:6.2))*(speedAt(t)/380)*10,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 BLURV=blur;let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 w+=backdrop(t,cx,cy)+dust(t,cx,cy,q)+rushers(t,cx,cy);
 const rr=(rot+sr)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);const cor=[[-540,-960],[540,-960],[540,960],[-540,960]].map(([px,py])=>[cx+(px*cs+py*sn)/z,cy+(-px*sn+py*cs)/z]);const vx0=Math.min(...cor.map(c=>c[0])),vx1=Math.max(...cor.map(c=>c[0])),vy0=Math.min(...cor.map(c=>c[1])),vy1=Math.max(...cor.map(c=>c[1]));
 const order=['beto','diego','sofi','lucia','marta'];
 order.forEach(k=>{if(k==='sofi'&&t<Ls('a7')-.5)return;const x=POSX[k];if(x+300<vx0||x-300>vx1||1580<vy0||280>vy1)return;w+=charSVG(k,t,q,tn)});
 w+=rubble(t)+creatureLayer(t);
 w+=`</g>`;
 const op=operatorHand(t);
 const flk=(t>EVT.gstep&&t<EVT.gstep+3)?(Math.sin(t*40)>-.4?1:.3):1;
 w+=`<defs><radialGradient id="dk" gradientUnits="userSpaceOnUse" cx="${op.bx.toFixed(0)}" cy="${op.by.toFixed(0)}" r="900"><stop offset="0" stop-color="#02040a" stop-opacity="0"/><stop offset=".3" stop-color="#02040a" stop-opacity=".1"/><stop offset=".6" stop-color="#02040a" stop-opacity="${(.72*(op.on?1:1.3)).toFixed(2)}"/><stop offset="1" stop-color="#02040a" stop-opacity="${op.on?.9:.98}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dk)"/>`;
 w+=`<rect width="${W}" height="${H}" fill="#ff1a0a" fill-opacity="${(.05+.06*(Math.sin(t*5)>0?1:.3)).toFixed(3)}"/>`;
 w+=op.svg;
 let fl=0;for(const [ft,k] of [[EVT.gstep,.5],[EVT.collapse,.7],[EVT.wallburst,.95],[EVT.smash,.35],[EVT.fall,.8]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 w+=`<rect width="${W}" height="${H}" fill="#fff0d8" opacity="${fl.toFixed(2)}"/>`;
 return w}

function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=inv(tn);let inner,hudOn=false;
 if(t<2.8)inner=hook(t);else if(t<3.2)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7.0)inner=title(t);else if(t<EVT.cam)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 else if(t<EVT.black){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=EVT.cam&&t<EVT.cam+.25)g=.6;if(t>=EVT.fall-.1&&t<EVT.black)g=clamp((t-EVT.fall+.1)/1.2)*.9+.2;if(t>=2.4&&t<2.8)g=.8;
 if(t>=EVT.black-1.2&&t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=EVT.black-1.2))?hud(tn)+caption(tn):(t>=3.2&&t<EVT.cam?caption(tn):'');
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
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf','gblur=sigma=0.7,eq=contrast=1.07:saturation=0.85,rgbashift=rh=-2:bh=2,noise=alls=11:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,outName)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS};
