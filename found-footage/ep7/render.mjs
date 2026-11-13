import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {limb as limbS,grp as grpS,hand as handW,handSkin,gripV2 as gripS} from '../char.mjs';
import {setCTM,mul,T,setHandTime,EX} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,dust,setEV,speedAt} from '../ep3/scene.mjs';
import {sky,skyline,heli,roofBack,roof,FLOOR} from '../ep6/scene6.mjs';
import {defs6} from '../ep6/scene6.mjs';
import {colossus,smokeBlob,chaser,head as mHead} from '../ep6/monster.mjs';
import {defs7,defsDoor,aerial,cabin,landmark,cracks,designator,parapet,facade,monsterEyeWindow,tunnelDoor,deadCity,farSilhouette} from './scene7.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep7');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;const S_=id=>START[id];
const inv=tn=>tn;const EVT=TL.ev;const DURL=TL.durs;const Ls=id=>START[id],Le=id=>START[id]+DURL[id];
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA',Sofi:'SOFI',Sargento:'SARGENTO',Radio:'RADIO',Piloto:'PILOTO'};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi'};
const FL=1510;const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// ---- envelopes
function envelope(id){const fp=path.join(BUILD,'voz_t',id+'.mp3');if(!fs.existsSync(fp)){const n=Math.max(8,Math.round((TL.durs[id]||2)*FPS));const o=[];for(let i=0;i<n;i++){const ph=Math.sin(i*.91+id.length)*.5;o.push(Math.max(0,.18+.82*Math.abs(Math.sin(Math.PI*(i/FPS)*4.3+ph))*(.7+.3*Math.sin(i*.37))))}return o}const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
function zcrEnv(id){const fp=path.join(BUILD,'voz_t',id+'.mp3');if(!fs.existsSync(fp)){const n=Math.max(8,Math.round((TL.durs[id]||2)*FPS));return Array.from({length:n},(_,i)=>.1+.12*Math.abs(Math.sin(i*.53)))}const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];for(let i=0;i+hop<=n;i+=hop){let z=0,prev=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2);if(j&&((v>0)!==(prev>0))&&Math.abs(v)>300)z++;prev=v}out.push(z/hop)}return out}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>{l.dur=l.env.length/FPS;l.zc=zcrEnv(l.id)});
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}





const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let tc=0;for(const c of CUTS)if(c<=t+1e-6)tc=Math.max(tc,c);const SH=SHOTS.filter(s=>s[0]>=tc-1e-6);let c=ch(SH[0]);for(let i=1;i<SH.length;i++){const sh=SH[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SH[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;let tc=0;for(const c of CUTS)if(c<=t+1e-6)tc=Math.max(tc,c);const SH=SHOTS.filter(s=>s[0]>=tc-1e-6);for(let i=1;i<SH.length;i++){const sh=SH[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[EVT.snap,60],[EVT.attack,90],[EVT.eyeWin+2.6,70],[EVT.pierce,40],[EVT.doorBreak,90],[EVT.white,60]];
function shakeAmp(t){const v=viewOf(t);let a=4.5+2*clamp((t-EVT.cam)/60,0,1);if(v==='ext'||v==='cab')a+=10;if(v==='cabB')a+=7;if(v==='roof'&&t>=EVT.crack1)a+=5+(t>=EVT.peek?5:0);if(v==='facade')a+=8;if(v==='tunnel'&&t>=EVT.pierce)a+=14;if(v==='jets')a+=10;if(v==='dead')a=2.2;
 for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
const WHOL=['beto','diego','sofi','lucia','marta'];const SOL=['sgt'];
const A=(a,b,c,d,e,g)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e,sgt:g||'neutral'});
const EXL={
 h0:A('fear','scream','fear','fear','fear'),h1:A('scream','scream','scream','scream','worry'),h2:A('scream','fear','scream','scream','worry'),h3:A('fear','fear','scream','fear','worry'),
 h4:A('shock','fear','scream','shock','worry'),h5:A('shock','scream','scream','shock','worry'),h6:A('sad','scream','scream','scream','worry'),h7:A('scream','scream','sad','sad','worry'),
 h8:A('sad','neutral','sad','sad','worry'),h9:A('sad','neutral','sad','sad','worry'),h10:A('shock','neutral','sad','sad','worry'),h11:A('sad','neutral','sad','sad','worry'),h12:A('worry','neutral','sad','worry','worry'),
 h13:A('worry','neutral','worry','worry','fear','fear'),h14:A('worry','neutral','worry','worry','worry','neutral'),h15:A('worry','neutral','worry','worry','sad','neutral'),h16:A('worry','neutral','worry','worry','fear','fear'),
 h17:A('worry','neutral','worry','worry','sad','sad'),h18:A('worry','neutral','worry','worry','fear','fear'),h19:A('worry','neutral','worry','worry','fear','fear'),h20:A('worry','neutral','worry','worry','scream','scream'),
 h21:A('worry','neutral','worry','worry','scream'),h22:A('worry','neutral','worry','worry','fear'),h23:A('worry','neutral','worry','worry','fear'),h24:A('worry','neutral','worry','worry','fear'),
 h25:A('worry','neutral','worry','worry','sad'),h26:A('worry','neutral','worry','worry','sad'),h27:A('worry','neutral','worry','worry','sad'),h28:A('worry','neutral','worry','worry','sad'),h29:A('worry','neutral','worry','worry','sad')};
const SCRIPT_SPK={Diego:'diego',Beto:'beto',Marta:'marta',Lucia:'lucia',Sofi:'sofi',Sargento:'sgt'};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex=who==='sgt'?'neutral':'fear';if(tn<START.h0)return ex;
 for(const l of LINES){if(!EXL[l.id])continue;const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.1*Math.max(0,idx));if(tn<t0)break;ex=EXL[l.id][who]||ex}
 // scripted extremes
 if(who==='marta'&&tn>=EVT.crack1&&tn<EVT.attack)ex='fear';if(who==='marta'&&tn>=EVT.attack&&tn<EVT.cutD)ex='scream';
 if(who==='sgt'&&tn>=EVT.peek)ex='fear';if(who==='sgt'&&tn>=EVT.attack-1)ex='scream';
 if(who==='diego'&&tn>=EVT.close&&tn<EVT.snap+.2)ex='scream';
 if(who==='marta'&&tn>=EVT.pierce&&tn<EVT.doorBreak+.5)ex=tn<S_('h27')?'scream':'sad';
 return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3,neutral:0};
const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};
const T7=EVT;
// ---- which view is on screen
const EXTW=[[0,S_('h1')-.15],[T7.ext1,S_('h3')-.1],[T7.close,T7.snap+1.3]];
function viewOf(t){if(t<T7.cutB)return EXTW.some(w=>t>=w[0]&&t<w[1])?'ext':'cab';if(t<T7.cutC)return 'cabB';if(t<T7.cutD)return 'roof';if(t<T7.cutE)return 'facade';if(t<T7.cutF)return 'tunnel';if(t<T7.dawn)return 'jets';return 'dead'}
const CUTS=[0,S_('h1')-.15,T7.ext1,S_('h3')-.1,T7.close,T7.snap+1.3,T7.cutB,T7.cutC,T7.cutD,T7.cutE,T7.cutF,T7.dawn];
// ---- layouts per view: returns {x,y(feet),s,yaw,hang,rot}
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const DEF2={L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}};
const HANGA={L:{w:[170,-60],hand:'grip'},R:{w:[330,-60],hand:'grip'}};
const REACH={L:{w:[100,150],hand:'grip'},R:{w:[560,190],hand:'open'}};
const PUSH={L:{w:[430,280],hand:'open'},R:{w:[470,250],hand:'open'}};
function chars(t){const v=viewOf(t);const out={};
 if(v==='ext'){out.diego={x:EXT.cx+Math.sin(t*1.3)*14,fy:EXT.diegoY,s:1.5,yaw:0,rot:Math.sin(t*1.7)*5,arms:HANGA,hang:1,vis:t<T7.snap+.1}}
 else if(v==='cab'||v==='cabB'){const calm=t>=T7.cutB;
  out.lucia={x:2050,fy:FL,s:1.5,yaw:1.05,arms:calm?{L:REL.L,R:{w:[520,300],hand:'open'}}:REACH,rot:calm?0:-4};
  out.beto={x:1640,fy:FL,s:1.5,yaw:.9,arms:calm?{L:REL.L,R:REL.R}:{L:{w:[100,160],hand:'grip'},R:{w:[500,210],hand:'open'}},rot:calm?4:-3};
  out.sofi={x:1230,fy:FL,s:1.05,yaw:.35,arms:t>=S_('h4')?MOUTH():{L:{w:[134,330],hand:'open'},R:REL.R},rot:0}}
 else if(v==='roof'){out.marta={x:1050,fy:FL,s:1.5,yaw:.85,arms:t>=T7.peek?{L:{w:[100,330],hand:'open'},R:{w:[330,300],hand:'open'}}:HOLDA(t),rot:0};
  if(t<T7.death-.2)out.sgt={x:1980,fy:FL,s:1.5,yaw:t<T7.attack-1?.9:1.2,arms:t>=T7.attack-1?{L:{w:[440,230],hand:'open'},R:{w:[470,250],hand:'open'}}:{L:{w:[400,300],hand:'open'},R:{w:[360,330],hand:'relax'}},rot:0}}
 else if(v==='facade'){const sw=Math.sin(t*1.4)*5;out.marta={x:1500,fy:FL-120,s:1.5,yaw:0,rot:sw,arms:HANGA,hang:1,sway:sw}}
 else if(v==='tunnel'){const run=t<S_('h24')-.3;out.marta={x:run?1100+sstep((t-T7.cutE)/3)*600:1700,fy:FL,s:1.5,yaw:run?1.2:1.15,arms:run?{L:{w:[120,430],hand:'relax'},R:{w:[380,260],hand:'relax'}}:PUSH,rot:run?0:-5,amp:run?1.6:0}}
 return out}
const HOLDA=t=>({L:{w:[110,420],hand:'relax'},R:{w:[400,250],hand:'open'}});
const EXT={cx:1750,diegoY:2380};
function kfBlend(a,b,u){const o={};for(const s of['L','R']){o[s]={w:[lerp(a[s].w[0],b[s].w[0],u),lerp(a[s].w[1],b[s].w[1],u)],hand:u>.5?b[s].hand:a[s].hand,front:b[s].front,e:b[s].e}}return o}
const SH_={L:[186,240],R:[314,240]};
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
const EXN=(n)=>EX[n]||EX.neutral;
function exprChange(who,tn){let cur=exprNew(who,tn),tc=0;let prev=cur;for(let tt=tn;tt>Math.max(0,tn-3);tt-=.1){const e=exprNew(who,tt);if(e!==cur){prev=e;tc=tt+.1;break}else tc=Math.max(0,tt)}return {cur,prev,tc}}
function faceExpr(who,t,tn,talk,seed){const {cur,prev,tc}=exprChange(who,tn);const a=EXN(prev),b=EXN(cur);const u=sstep((tn-tc)/.22);
 const mix=(x,y)=>x+(y-x)*u;const e={...b,e:mix(a.e,b.e),brow:[mix(a.brow[0],b.brow[0]),mix(a.brow[1],b.brow[1])],rot:mix(a.rot,b.rot),pup:mix(a.pup,b.pup)};
 const sd=(seed%3)-1;const br=Math.sin(t*1.9+seed);const heavy=['worry','sad','fear','shock','scream'].includes(cur);
 e.bL=Math.sin(t*.7+seed)*.9+(heavy?-2.2*sd-1.4:0)-talk*2.6;e.bR=Math.sin(t*.8+seed*2)*.9+(heavy?2.2*sd-1.4:0)-talk*2.6*(.6+.4*Math.sin(t*5+seed));
 e.eL=1+Math.sin(t*.9+seed)*.06+(cur==='sad'?-.12:0)+(cur==='scream'||cur==='shock'?.1:0);e.eR=1+Math.sin(t*1.1+seed*1.3)*.06+(cur==='sad'?-.16:0)+(cur==='scream'||cur==='shock'?.12:0);
 e.bag=heavy?1:.15;e.well=(cur==='sad'||cur==='scream')?1:(cur==='fear'?.7:0);e.flare=(['scream','annoyed','fear'].includes(cur)?1:0)+Math.max(0,br)*.5;return e}
function charSVG(who,t,shock,tn,L){const st=CAST[who];const sp=speakerAt(tn);
 const spk=sp&&(sp.who==='Sargento'?'sgt':WHOKEY[sp.who]);const talk=spk===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.8):0;
 const idx=who==='sgt'?5:WHOL.indexOf(who);const bl=blinkAt(idx*.37,t);
 const sacc=(Math.sin(Math.floor(t*1.7+idx)*12.9898)*.5);
 const ex=exprNew(who,tn);
 const arms=L.arms;const pose={L:{...arms.L},R:{...arms.R}};
 const amp=L.amp||0;const phase=t*(amp>1?11:6.2)+idx*.9;
 for(const s of['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+Math.sin(t*14+idx)*2*quakeLvl(t)]}
 pose.walk={phase,amp};
 const zc=spk===who&&sp&&sp.zc?sp.zc[Math.floor((tn-sp.t0)*FPS)]||0:0;
 pose.vis=talk>.06?clamp((zc-.12)/.12,-1,1):0;pose.mdy=(ex==='sad'||ex==='fear'||ex==='scream')?Math.sin(t*37+idx)*(talk>.1?.8:1.5)*(ex==='sad'?1:.7):0;
 pose.expr=faceExpr(who,t,tn,talk,idx+1);pose.blink=bl;pose.look=[clamp(L.yaw*.5,-1,1)*.6+sacc*.35,(L.lookY??.1)+Math.sin(t*2.3+idx)*.12];pose.talk=talk;pose.breath=Math.sin(t*1.9+idx)*(1+shock);pose.byaw=L.hang?0:L.yaw;
 pose.head={rot:(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.4:0),dx:0,yaw:0,dy:Math.sin(t*1.9+idx)*1.2+(ex==='shock'||ex==='scream'?-4:0)};
 const s=L.s,x=L.x,fy=L.fy;const rot=L.rot||0;
 const Mch=mul(mul(T(x-250*s,fy-752*s,0,s,s),T(250,752)),mul(T(0,0,rot,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 const sh=L.hang?'':`<ellipse cx="${x}" cy="${fy+10}" rx="${190*s/1.5}" ry="${28*s/1.5}" fill="#000" opacity=".5"/>`;
 return sh+`<g transform="translate(${x-250*s},${fy-752*s}) scale(${s}) rotate(${rot.toFixed(2)} 250 752)">${bd}</g>`}

// ---- overlays (Reels safe zones: top 230, bottom 330, right 120)
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),22);const fs=lines.length>2?50:56;let s='';const y0=1440-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="520" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="520" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]||sp.who}</text>`+s}
function hud(t){const src=(t<EVT.cutC)?'AEROCAM 02':'CAM 01 · TOMÁS';const el=Math.max(0,t-EVT.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;const low=t>=EVT.eyes;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="270" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="282" font-size="38" font-weight="700">REC</text><text x="640" y="282" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="330" font-size="28" fill="#ffd54a">${src}</text><text x="70" y="1575" font-size="30">SEP 19 2025  ${t<EVT.cutC?'05:31':'05:44'}</text><text x="700" y="1575" font-size="30" fill="${low&&on?'#ff4a3a':'#fff'}">${low?'BAT ▮▯▯▯':'BAT ▮▮▮▯'}</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,236h60M50,236v60M960,236h-60M960,236v60M50,1600h60M50,1600v-60M960,1600h-60M960,1600v-60"/><path d="M480,930h60M510,900v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
function title(t){const u=t-4.7;const ser=`<text x="540" y="300" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.1)?10:2;
 const T=(x,fill,op)=>`<text x="${x}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="${fill}" fill-opacity="${op}">CAPÍTULO 7</text>`;
 return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}">${T(540-g,'#ff2a3a',.7)}${T(540+g,'#2af0ff',.6)}${T(540,'#fff',1)}<rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1080" text-anchor="middle" font-family="Inter" font-weight="900" font-size="96" letter-spacing="2" fill="#fff" stroke="#000" stroke-width="3">EL FINAL</text></g>`}
function endcard(t){const u=t-EVT.endcard;const F='Inter';const tw=(s,n)=>s.slice(0,Math.max(0,Math.min(s.length,Math.floor(n))));
 return `<rect width="${W}" height="${H}" fill="#02030a"/><g font-family="DejaVu Sans Mono" fill="#cfd6df" text-anchor="middle"><text x="540" y="780" font-size="52" font-weight="700" fill="#ff2a3a">${tw('CINTA RECUPERADA',u*14)}</text><text x="540" y="880" font-size="34">${tw('ARCHIVO 07 DE 07',(u-1.4)*18)}</text><text x="540" y="950" font-size="34">${tw('ESTADO: INCOMPLETO',(u-2.6)*18)}</text><text x="540" y="1020" font-size="34">${tw('AGUARDANDO DATOS...',(u-3.8)*14)}${Math.floor(u*2)%2?'█':''}</text></g>${u>6?`<text x="540" y="1380" text-anchor="middle" font-family="Inter" font-weight="900" font-size="48" fill="#2af0ff">COMENTA QUÉ CREES QUE PASÓ</text><text x="540" y="1460" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#fff">SÍGUEME PARA MÁS HISTORIAS</text>`:''}`}
// ---- operator hand (the person filming)
function opState(t,tgt){const sw=Math.sin(t*1.3)*10+Math.sin(t*3.1)*5;let wx=800+sw,wy=1650+Math.sin(t*1.7)*8,ang=-32,bx=tgt?tgt[0]:560,by=tgt?tgt[1]:900;
 let on=(t>=EVT.cutD&&t<EVT.cutF)?1:0;if(t>=EVT.pierce&&t<EVT.doorBreak+1)on=Math.sin(t*34)>-.2?1:.15;if(t>=EVT.eyes)on=0;
 if(t>=EVT.cutD&&t<EVT.cutF){wy+=Math.sin(t*9)*18}
 if(t>=EVT.pierce&&t<EVT.doorBreak+1)wx+=Math.sin(t*28)*14;
 if(t>=EVT.dead){const u=t-EVT.dead;wy+=u*60}
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
const f1=n=>(+n).toFixed(1);
function monsterExt(t){// chaser head position/jaw over time (hook + two chase windows)
 const mon0=EVT.mon0,sn=EVT.snap,cl=EVT.close;let hx,hy,jaw=.05,mood='hunt',reach=0;
 const u1=sstep((t-mon0)/(cl-mon0));hx=lerp(6200,2500,u1);hy=lerp(2900,1900,u1);
 if(t>=cl){const u=sstep((t-cl)/(sn-cl-.6));hx=lerp(2500,2000,u);hy=lerp(1900,1560,u);jaw=u*.9;reach=u;mood='rage'}
 if(t>=sn-.5&&t<sn+.1){hx=1900;hy=1480;jaw=1}
 if(t>=sn+.1){const u=sstep((t-sn-.1)/1.0);hx=lerp(1900,4600,u);hy=lerp(1480,2300,u);jaw=.15;mood='cold'}
 return {hx,hy,jaw,mood,reach}}
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 BLURV=blur;setHandTime(t);const view=viewOf(t);
 let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 let tint='#ff8a3a',tintA=.07,dark=.2,showHand=(t>=EVT.cutC);
 const L=chars(t);
 if(view==='ext'){w+=aerial(t,{scroll:t*420});const M=monsterExt(t);
  const hel={x:EXT.cx-50,y:500+Math.sin(t*1.1)*18,sc:1.1,tilt:Math.sin(t*1.3)*2.5};
  w+=chaser(t,{hx:M.hx,hy:M.hy,jaw:M.jaw,mood:M.mood,reach:M.reach,ang:.12,scale:1.7,look:[-1,-.1]});
  w+=heli(t,{x:hel.x,y:hel.y,sc:hel.sc,tilt:hel.tilt,beam:0,bx:0,by:0,cable:520/hel.sc,lamp:1});
  for(const k of Object.keys(L))if(L[k].vis!==false)w+=charSVG(k,t,q,tn,L[k]);
  if(t>=EVT.snap-.1&&t<EVT.snap+.4)w+=`<circle cx="1800" cy="1500" r="${f1(300*(t-EVT.snap+.1)/.5+60)}" fill="#fff" fill-opacity="${(.5*(1-(t-EVT.snap+.1)/.5)).toFixed(2)}"/>`;
  if(t>=EVT.snap+.1)w+=`<path d="M${f1(EXT.cx+40-4)},1163 q${f1(Math.sin(t*3)*50)},200 ${f1(Math.sin(t*2.2)*90)},${f1(420+(t-EVT.snap)*60)}" stroke="#14170f" stroke-width="9" fill="none"/>`;
  tint='#ff8a3a';tintA=.1;dark=.15}
 else if(view==='cab'||view==='cabB'){
  let kind=null;if(t>=EVT.cutB-.2&&t<EVT.metro-.1)kind='bridge';else if(t>=EVT.metro-.1&&t<EVT.street-.1)kind='metro';else if(t>=EVT.street-.1&&t<EVT.cutC)kind='street';
  w+=sky(t,0)+skyline(t,t*500)+(kind?landmark(kind,t,(t-(kind==='bridge'?EVT.cutB:kind==='metro'?EVT.metro:EVT.street)+.5)):'');
  w+=cabin(t,{});
  for(const k of ['sofi','beto','lucia'])if(L[k])w+=charSVG(k,t,q,tn,L[k]);
  // wind streaks through the open door
  for(let i=0;i<14;i++){const yy=300+rn(i)*900,xx=((rn(i+3)*1000-t*2400*(.5+rn(i+5)))%1200+1200)%1200+2150;w+=`<rect x="${f1(xx)}" y="${f1(yy)}" width="${f1(160+rn(i)*200)}" height="3" fill="#fff" fill-opacity=".18"/>`}
  tint='#ff6a3a';tintA=.1;dark=.28}
 else if(view==='roof'){w+=sky(t,2000)+skyline(t,2000);
  // distant hovering jets/helicopters far away + the colossus rising behind the parapet
  const pk=sstep((t-EVT.peek)/7);const atk=sstep((t-EVT.attack)/.9);const hx=lerp(lerp(3650,3500,pk),2150,atk),hy=lerp(1700-700*pk,1030,atk);
  if(t>=EVT.peek-.5){const jaw=t>=EVT.attack?.25+.75*atk*(t<EVT.attack+1.6?1:0):.04;const mood=t>=EVT.attack-.6?'rage':'cold';
   const look=[-1,.3+Math.sin(t*.7)*.1];w+=chaser(t,{hx,hy,jaw,mood,reach:atk,ang:.05,scale:1.8,look,bx:hx+500,by:hy+1700});
   // breath steam from the maw
   if(!atk)for(let k=0;k<5;k++){const u=((t*.8+k*.2)%1);w+=`<ellipse cx="${f1(hx-520-u*260)}" cy="${f1(hy+70-u*120)}" rx="${f1(60+u*160)}" ry="${f1(40+u*90)}" fill="#cfd6df" fill-opacity="${(.22*(1-u)).toFixed(2)}"/>`}}
  w+=roofBack(t,{doorOpen:0})+roof(t,{})+cracks(t,sstep((t-EVT.crack1)/6),{});
  w+=designator(t,{laser:t>=EVT.peek-1&&t<EVT.attack-.3,lx:hx-380,ly:hy+60});
  w+=parapet(t);
  for(const k of ['marta','sgt'])if(L[k])w+=charSVG(k,t,q,tn,L[k]);
  // attack: dust + debris + muzzle flashes
  if(t>=EVT.attack-1.2&&t<EVT.attack+.2&&Math.sin(t*50)>0)w+=`<circle cx="2120" cy="800" r="80" fill="#ffe9a0" fill-opacity=".9"/><circle cx="2120" cy="800" r="260" fill="url(#orangeG7)" fill-opacity=".6"/>`;
  if(t>=EVT.attack){const u=t-EVT.attack;for(let i=0;i<30;i++){const px=1700+rn(i)*1200,py=FL-((u*900*(.4+rn(i+3))-u*u*700)%1100);w+=`<polygon points="${f1(px)},${f1(py)} ${f1(px+40*rn(i+2)+14)},${f1(py+16)} ${f1(px+10)},${f1(py+50*rn(i+5)+14)}" fill="#4a4448"/>`}w+=`<ellipse cx="2300" cy="${FL-60}" rx="${f1(700*sstep(u/1.2))}" ry="260" fill="url(#mSmoke)" fill-opacity="${(.8*(1-clamp(u/6))).toFixed(2)}"/>`}
  tint='#ff8a3a';tintA=.08;dark=.12}
 else if(view==='facade'){const sc=(t-EVT.cutD)*640;w+=facade(t,{scroll:sc});
  w+=`<line x1="1500" y1="-1500" x2="1500" y2="${FL-1218-120+10}" stroke="#14170f" stroke-width="14"/><line x1="1500" y1="-1500" x2="1500" y2="${FL-1218-120+10}" stroke="#c9a23a" stroke-width="4"/>`;
  const ep=sstep((t-EVT.eyeWin)/1.2)*(t<EVT.eyeWin+3.2?1:clamp(1-(t-EVT.eyeWin-3.2)/.6));if(ep>0)w+=monsterEyeWindow(t,ep,2350,900);
  if(L.marta)w+=charSVG('marta',t,q,tn,L.marta);
  if(t>=EVT.eyeWin+2.6&&t<EVT.eyeWin+3.4){const u=t-EVT.eyeWin-2.6;for(let i=0;i<40;i++){w+=`<polygon points="${f1(2000+rn(i)*800)},${f1(500+rn(i+3)*800+u*900)} ${f1(2000+rn(i)*800+40+rn(i+2)*60)},${f1(500+rn(i+3)*800+u*900+20)} ${f1(2000+rn(i)*800+14)},${f1(500+rn(i+3)*800+u*900+70)}" fill="#cfe0ff" fill-opacity=".8"/>`}}
  tint='#ff6a3a';tintA=.1;dark=.3}
 else if(view==='tunnel'){const bl=sstep((t-S_('h25'))/6)*.8;const pr=sstep((t-EVT.pierce)/3);const op=sstep((t-EVT.doorBreak)/.8);
  w+=tunnelDoor(t,{bulge:Math.max(bl,pr),pierce:pr,open:op,lightsOut:t>=EVT.pierce});
  if(L.marta&&t<EVT.doorBreak+.2)w+=charSVG('marta',t,q,tn,L.marta);
  if(op>0){w+=`<path d="M2100,${FL} Q2300,900 2700,${FL-60} L2900,${FL} Z" fill="#05030a" fill-opacity="${(.9*op).toFixed(2)}"/>`}
  tint='#ff7a2a';tintA=.06+.1*pr;dark=.55}
 else if(view==='jets'){w+=sky(t,1500)+skyline(t,1500);
  const u0=t-EVT.jets;for(let k=0;k<4;k++){const x=lerp(5200,-1800,clamp((u0-k*.25)/3.2)),y=300+k*70+Math.sin(t*2+k)*10;if(x<5100&&x>-1700)w+=`<g transform="translate(${f1(x)},${f1(y)})"><polygon points="-240,0 40,-22 120,0 40,22" fill="#0a0c10" stroke="#05060a" stroke-width="4"/><polygon points="-30,0 -130,-120 -90,0" fill="#0a0c10"/><polygon points="-30,0 -130,120 -90,0" fill="#0a0c10"/><ellipse cx="-260" cy="0" rx="120" ry="14" fill="#ffb04a" fill-opacity=".85"/><ellipse cx="-300" cy="0" rx="260" ry="26" fill="#ff7a2a" fill-opacity=".35"/></g>`}
  for(let k=0;k<6;k++){const bt=EVT.jets+2.4+k*.55;if(t>=bt&&t<bt+1.2){const u=(t-bt)/1.2;w+=`<circle cx="${f1(400+k*600)}" cy="1100" r="${f1(60+500*u)}" fill="url(#orangeG7)" fill-opacity="${(.9*(1-u)).toFixed(2)}"/><circle cx="${f1(400+k*600)}" cy="1100" r="${f1(30+260*u)}" fill="#fff" fill-opacity="${(.8*(1-u)).toFixed(2)}"/>`}}
  tint='#ff9a4a';tintA=.1;dark=.2}
 else{w+=deadCity(t,{cx});w+=farSilhouette(t,{x:3900,y:1340,sc:.3+.12*sstep((t-EVT.sil)/10),turnT:EVT.turn,eyesT:EVT.eyes});
  for(let k=0;k<4;k++)w+=smokeBlob(t,2800+k*500,1250,420,k);tint='#ffb87a';tintA=.06;dark=.2}
 w+=`</g>`;
 const tg=[540,900];const op=operatorHand(t,[tg[0],tg[1]]);
 w+=`<rect width="${W}" height="${H}" fill="${tint}" fill-opacity="${(tintA+.03*Math.sin(t*5)).toFixed(3)}"/>`;
 w+=`<defs><radialGradient id="dk" gradientUnits="userSpaceOnUse" cx="540" cy="960" r="1200"><stop offset="0" stop-color="#02040a" stop-opacity="0"/><stop offset=".6" stop-color="#02040a" stop-opacity="${(dark*.5).toFixed(2)}"/><stop offset="1" stop-color="#02040a" stop-opacity="${(dark+.3).toFixed(2)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dk)"/>`;
 if(showHand)w+=op.svg;
 // lens dust specks + occasional autofocus hunting overlay
 for(let i=0;i<7;i++){const dx=(rn(i)*1000+60),dy=(rn(i+5)*1700+100);w+=`<circle cx="${f1(dx)}" cy="${f1(dy)}" r="${f1(5+rn(i+2)*10)}" fill="#fff" fill-opacity="${(.05+.04*rn(i+7)).toFixed(2)}"/>`}
 let fl=0;for(const [ft,k] of [[EVT.snap,.6],[EVT.attack,.7],[EVT.eyeWin+2.6,.7],[EVT.pierce,.4],[EVT.doorBreak,.9]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 w+=`<rect width="${W}" height="${H}" fill="#fff0d8" opacity="${fl.toFixed(2)}"/>`;
 // whiteout of the bombing
 const wo=t>=EVT.white-1.4&&t<EVT.white+1.8?sstep((t-EVT.white+1.4)/1.4):(t>=EVT.white+1.8&&t<EVT.white+4.5?1-sstep((t-EVT.white-1.8)/2.7):0);if(wo>0)w+=`<rect width="${W}" height="${H}" fill="#fff" opacity="${wo.toFixed(2)}"/>`;
 return w}

function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=tn;let inner,hudOn=false;
 if(t<4.6)inner=sceneWorld(t,tn);else if(t<4.7)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7.1)inner=title(t);else if(t<EVT.cam)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 else if(t<EVT.black){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=EVT.cam&&t<EVT.cam+.25)g=.6;for(const c of CUTS.slice(2))if(t>=c&&t<c+.18)g=Math.max(g,.55);if(t>=EVT.dead-.6&&t<EVT.black)g=.5+.4*Math.sin(t*40);if(t<.35)g=.7;if(t>=EVT.attack&&t<EVT.attack+.25)g=.5;if(t>=EVT.black-1.0&&t<EVT.black)g=.6;
 if(t>=EVT.black&&t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=EVT.black))?hud(tn)+caption(tn):((t<4.6||(t>=4.7&&t<EVT.cam))?caption(tn):'');
 const head=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
 const dfs=defsScene+defs6+defs7+defsDoor+defs(CAST.beto);
 if(mode==='parts')return{full:fixOp(head+dfs+out+ov+'</svg>'),base:fixOp(head+dfs+out+'</svg>'),overlay:fixOp(head+ov+'</svg>'),blur:BLURV};
 return fixOp(head+dfs+out+ov+'</svg>')}
function boxBlur(px,w,h,rad){const t=new Uint8ClampedArray(px.length);const pass=(src,dst,horiz)=>{const n=horiz?w:h,m=horiz?h:w,st=horiz?4:4*w,ln=horiz?4*w:4;const d=2*rad+1;for(let k=0;k<m;k++){const base=k*ln;for(let c=0;c<4;c++){let sum=0;const idx=i=>base+Math.min(n-1,Math.max(0,i))*st+c;for(let i=-rad;i<=rad;i++)sum+=src[idx(i)];for(let i=0;i<n;i++){dst[base+i*st+c]=sum/d;sum+=src[idx(i+rad+1)]-src[idx(i-rad)]}}}};pass(px,t,true);pass(t,px,false)}
function renderPng(t){const P=frame(t,'parts');const opt={font:{loadSystemFonts:true,defaultFontFamily:'Inter'},fitTo:{mode:'original'}};
 if(P.blur<=.8)return new Resvg(P.full,opt).render();
 const b=new Resvg(P.base,opt).render();const px=Uint8ClampedArray.from(b.pixels);const rad=Math.max(1,Math.round(P.blur*1.3));boxBlur(px,W,H,rad);boxBlur(px,W,H,Math.max(1,Math.round(rad*.7)));
 const o=new Resvg(P.overlay,opt).render().pixels;for(let i=0;i<px.length;i+=4){const a=o[i+3]/255;if(a>0){px[i]=o[i]*a+px[i]*(1-a);px[i+1]=o[i+1]*a+px[i+1]*(1-a);px[i+2]=o[i+2]*a+px[i+2]*(1-a)}}
 return{pixels:Buffer.from(px.buffer),asPng:()=>new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="1" height="1"/></svg>`).render().asPng()}}
// ---- camera shots per view (cuts reset the camera): [t,cx,cy,zoom,rot,mode,skew]
const SHOTS=[
 // A: exterior chase / cabin
 [0,1950,1300,.5,-3,'s',0],[1.6,2000,1500,.72,2,'w',0],[3.6,1800,1350,.9,-3,'w',0],
 [S_('h1')-.15,2050,820,1.35,2,'n',0],[S_('h2')-.4,1640,820,1.5,-2,'n',0],
 [EVT.ext1,2100,1400,.55,-2,'s',0],[EVT.ext1+1.0,2000,1500,.75,3,'n',0],
 [S_('h3')-.1,520,1000,1.25,2,'n',0],[S_('h4')-.4,1230,900,1.75,-2,'n',0],
 [EVT.close,1900,1500,.7,2,'n',0],[EVT.close+.5,1800,1700,1.25,-3,'n',0],[S_('h5')-.2,1800,1760,1.5,2,'n',0],[EVT.snap-.9,2000,1550,.9,-4,'w',0],[EVT.snap+.1,2050,1500,.8,4,'w',0],
 [EVT.snap+1.3,2050,800,1.9,3,'w',0],[S_('h7')-.4,1640,800,1.7,-3,'w',0],
 // B: cabin flight over the destroyed city
 [EVT.cutB,1400,900,.7,0,'s',0],[S_('h8')-.3,520,1000,1.2,2,'n',0],[EVT.bridge+1.5,2650,700,.8,-2,'s',0],[S_('h9')-.3,1230,900,1.75,2,'n',0],[EVT.metro+.3,2650,750,.85,2,'n',0],
 [S_('h10')-.3,520,1000,1.1,0,'n',0],[EVT.street+.3,2650,760,.85,-2,'n',0],[S_('h11')-.3,1640,850,1.6,-2,'n',0],[S_('h12')-.3,520,1000,1.2,2,'n',0],
 // C: rooftop II
 [EVT.cutC,2000,700,.6,-2,'s',0],[S_('h13')-.5,1050,800,1.5,2,'n',0],[S_('h14')-.5,1980,800,1.4,-2,'n',0],[S_('h15')-.5,1050,800,1.6,2,'n',0],
 [EVT.crack1-.3,1500,1450,1.6,-2,'s',0],[S_('h16')-.5,1550,800,.9,2,'n',0],[S_('h17')-.5,1980,800,1.7,-2,'n',0],
 [EVT.peek-.5,3200,700,.75,-3,'w',0],[S_('h18')-.3,3350,600,1.25,2,'z',0],[S_('h19')-.5,1980,800,1.9,-1,'n',0],
 [EVT.attack-1.4,2500,750,.6,0,'w',0],[EVT.attack,2400,800,.7,-5,'w',0],[EVT.attack+1.2,1050,800,1.3,4,'w',0],
 // D: glass facade descent
 [EVT.cutD,1500,900,.7,-3,'w',0],[S_('h21')-.5,1500,700,1.5,3,'w',0],[S_('h22')-.5,1500,800,1.3,-2,'n',0],[EVT.eyeWin-.5,1900,850,.9,0,'s',0],[EVT.eyeWin+.8,2300,850,1.2,3,'z',0],[S_('h23')-.5,1500,800,1.5,-3,'w',0],
 // E: service tunnel + steel door
 [EVT.cutE,1100,900,.8,3,'w',0],[S_('h24')-.5,1700,780,1.3,-2,'n',0],[S_('h25')-.5,1700,800,1.6,2,'n',0],[S_('h26')-.5,1700,820,1.8,-2,'n',0],[EVT.pierce-.6,2300,700,1.0,0,'w',0],[S_('h27')-.3,1700,800,1.8,3,'w',0],[EVT.doorBreak-.4,2300,800,1.1,-4,'w',0],[EVT.doorBreak+.8,1300,900,.8,0,'n',0],[S_('h28')-.3,1200,900,.9,2,'n',0],
 // F: jets / bombing / dead city
 [EVT.cutF,2000,300,.55,-3,'w',0],[S_('h29')-.5,2000,350,.6,2,'n',0],[EVT.jets,2200,300,.7,-2,'w',0],
 [EVT.dawn,2000,900,.6,0,'s',0],[EVT.sil,2700,700,.9,0,'s',0],[EVT.sil+3.5,3300,900,1.2,0,'n',0],[EVT.turn,3800,900,1.9,0,'z',0],[EVT.eyes,3900,780,2.4,0,'z',0]];
SHOTS.sort((x,y)=>x[0]-y[0]);
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(mode==='preview'){for(const a of process.argv.slice(3)){const t=parseFloat(a);const t0=Date.now();{const rp=renderPng(t);spawnSync('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-i','-',path.join(BUILD,`prev_${a}.png`)],{input:Buffer.from(rp.pixels.buffer?rp.pixels:rp.pixels),maxBuffer:1e8})}console.log(a,Date.now()-t0,'ms')}}
 else if(mode==='part'||mode==='seg'){const i=+process.argv[3],n=+process.argv[4];const total=DUR*FPS;let a=Math.floor(total*i/n),b=Math.floor(total*(i+1)/n);let outName=`part_${i}.mp4`;if(mode==='seg'){a=Math.round(+process.argv[3]*FPS);b=Math.round(+process.argv[4]*FPS);outName=process.argv[5]}
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf','gblur=sigma=0.7,eq=contrast=1.07:saturation=0.85,rgbashift=rh=-2:bh=2,noise=alls=11:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,outName)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS,camera,sceneWorld,LINES,EVT};
