import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {limb as limbS,grp as grpS,hand as handW,handSkin,gripV2 as gripS} from '../char.mjs';
import {setCTM,mul,T,setHandTime,EX} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,dust,setEV,speedAt} from '../ep3/scene.mjs';
import {sky,skyline,heli,roofBack,roof,FLOOR} from '../ep6/scene6.mjs';
import {defs6} from '../ep6/scene6.mjs';
import {colossus,smokeBlob,chaser,head as mHead} from '../ep6/monster.mjs';
import {defs7,defsDoor,aerial,cabin,landmark,cracks,designator,parapet,facade,monsterEyeWindow,tunnelDoor,deadCity,farSilhouette,bloodSpray,bloodStain,lensBlood,stairsCollapsed,edgeRope,alley,mirrorRoom,mirrorGlass,camcorder} from './scene7.mjs';
import {tower} from '../ep6/scene6.mjs';
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
function focusBlur(t){let b=0;let tc=0;for(const c of CUTS)if(c<=t+1e-6)tc=Math.max(tc,c);const SH=SHOTS.filter(s=>s[0]>=tc-1e-6);for(let i=1;i<SH.length;i++){const sh=SH[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}for(const c of CUTS){if(c<=0)continue;if(t>=c-.12&&t<c)b=Math.max(b,16*(1-(c-t)/.12));if(t>=c&&t<c+.22)b=Math.max(b,16*Math.exp(-(t-c)/.09))}return b}
const IMPULSES=[[EVT.lunge0,60],[EVT.snap,60],[EVT.attack,90],[EVT.shatter,70],[EVT.pierce,40],[EVT.doorBreak,90],[EVT.white,60]];
function shakeAmp(t){const v=viewOf(t);let a=4.5+2*clamp((t-EVT.cam)/60,0,1);if(v==='roofA')a+=(t<EVT.lunge0+3?14:5);if(v==='tele')a+=4;if(v==='ext'||v==='cab')a+=10;if(v==='cabB')a+=7;if(v==='roof'&&t>=EVT.peek-3)a+=5+(t>=EVT.peek?5:0);if(v==='roof'&&t>=EVT.run)a+=10;if(v==='stairs')a+=6;if(v==='edge')a+=6;if(v==='facade')a+=8;if(v==='alley')a+=9;if(v==='tunnel'&&t>=EVT.pierce)a+=14;if(v==='cabF')a+=12+(t>=EVT.white-1?14:0);if(v==='tunnelB')a+=18*Math.exp(-(t-EVT.tunnelB)/1.5);if(v==='cabAfter')a+=5;if(v==='dead')a=2.2;if(v==='mirror')a=2.4+(t>=EVT.reveal?3:0);
 for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}
function monsterExt(t){const mon0=EVT.cutH+2,sn=EVT.snap,cl=EVT.close;let hx,hy,jaw=.05,mood='hunt',reach=0;
 const u1=sstep((t-mon0)/(cl-mon0));hx=lerp(6200,2500,u1);hy=lerp(2900,1900,u1);
 if(t>=cl){const u=sstep((t-cl)/(sn-cl-.6));hx=lerp(2500,2000,u);hy=lerp(1900,1560,u);jaw=u*.9;reach=u;mood='rage'}
 if(t>=sn-.5&&t<sn+.1){hx=1900;hy=1480;jaw=1}
 if(t>=sn+.1){const u=sstep((t-sn-.1)/1.0);hx=lerp(1900,4600,u);hy=lerp(1480,2300,u);jaw=.15;mood='cold'}
 return {hx,hy,jaw,mood,reach}}
const WHOL=['beto','diego','sofi','lucia','marta'];const SOL=['sgt'];
const A=(a,b,c,d,e,g)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e,sgt:g||'neutral'});
const N5=(x)=>A(x,x,x,x,x,x);
const EXL={
 j0:A('fear','fear','fear','fear','scream','scream'),j1:A('fear','fear','fear','fear','scream','fear'),j2:A('fear','fear','fear','fear','scream','fear'),j3:A('fear','fear','fear','fear','fear','annoyed'),
 j4:A('scream','scream','scream','scream','fear'),j5:A('scream','scream','scream','scream','fear'),j6:A('scream','scream','scream','scream','fear'),j7:A('scream','scream','scream','scream','fear'),
 j8:A('shock','scream','scream','shock','fear'),j9:A('shock','scream','scream','shock','fear'),j10:A('sad','scream','scream','scream','fear'),j11:A('scream','scream','sad','sad','fear'),
 j12:A('sad','neutral','sad','sad','fear'),j13:A('shock','neutral','sad','sad','fear'),j14:A('sad','neutral','sad','sad','fear'),
 j15:A('worry','neutral','worry','worry','worry','neutral'),j16:A('worry','neutral','worry','worry','fear','neutral'),j17:A('worry','neutral','worry','worry','fear','fear'),j18:A('worry','neutral','worry','worry','sad','sad'),
 j19:A('worry','neutral','worry','worry','sad','sad'),j20:A('worry','neutral','worry','worry','sad','sad'),j21:A('worry','neutral','worry','worry','fear','fear'),j22:A('worry','neutral','worry','worry','scream','scream'),
 j23:A('worry','neutral','worry','worry','scream'),j24:A('worry','neutral','worry','worry','fear'),j25:A('worry','neutral','worry','worry','fear'),j26:A('worry','neutral','worry','worry','fear'),
 j27:A('worry','neutral','worry','worry','scream'),j28:A('worry','neutral','worry','worry','fear'),j29:A('worry','neutral','worry','worry','sad'),j30:A('worry','neutral','worry','worry','sad'),
 j31:A('worry','neutral','worry','worry','sad'),j32:A('worry','neutral','worry','worry','sad'),j33:A('shock','neutral','sad','sad','sad'),j34:A('sad','neutral','sad','sad','sad'),j35:A('shock','neutral','shock','shock','sad')};
function exprNew(who,tn){if(who==='tomas')return tn<EVT.reveal?'sad':(tn<S_('j37')?'shock':'fear');const idx=WHOL.indexOf(who);let ex=who==='sgt'?'neutral':'fear';if(tn<START.j0)return ex;
 for(const l of LINES){if(!EXL[l.id])continue;const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.1*Math.max(0,idx));if(tn<t0)break;ex=EXL[l.id][who]||ex}
 if(who==='marta'&&tn>=EVT.attack&&tn<EVT.stairs)ex='scream';
 if(who==='sgt'&&tn>=EVT.peek)ex='fear';if(who==='sgt'&&tn>=EVT.attack-.8)ex='scream';
 if(who==='diego'&&tn>=EVT.close&&tn<EVT.snap+.2)ex='scream';
 if(who==='marta'&&tn>=EVT.pierce&&tn<EVT.doorBreak+.5)ex=tn<S_('j31')?'scream':'sad';
 if((who==='lucia'||who==='beto'||who==='sofi')&&tn>=EVT.snap&&tn<EVT.snap+4)ex='scream';
 return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3,neutral:0};
const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};
const T7=EVT;
// ---- views (strictly sequential): roofA -> tele -> roofA -> ext/cab -> cabB -> roof -> stairs -> edge -> facade -> alley -> tunnel -> jets -> dead
const EXTW=[[T7.cutH,S_('j5')-.1],[T7.ext1,S_('j8')-.1],[T7.close,T7.snap+1.4]];
function viewOf(t){
 if(t<T7.tele)return 'roofA';if(t<S_('j3')-.2)return 'tele';if(t<T7.cutH)return 'roofA';
 if(t<T7.cutB)return EXTW.some(w=>t>=w[0]&&t<w[1])?'ext':'cab';
 if(t<T7.cutC)return 'cabB';if(t<T7.stairs)return 'roof';if(t<T7.rope)return 'stairs';if(t<T7.cutD)return 'edge';
 if(t<T7.alley)return 'facade';if(t<T7.cutE)return 'alley';if(t<T7.cutF)return 'tunnel';if(t<T7.tunnelB)return 'cabF';if(t<T7.cabAfter)return 'tunnelB';if(t<T7.dawn)return 'cabAfter';if(t>=T7.mirror&&t<T7.sil)return 'mirror';return 'dead'}
const CUTS=[0,T7.tele,S_('j3')-.2,T7.cutH,S_('j5')-.1,T7.ext1,S_('j8')-.1,T7.close,T7.snap+1.4,T7.cutB,T7.cutC,T7.run,T7.stairs,T7.rope,T7.cutD,T7.alley,T7.cutE,T7.cutF,T7.tunnelB,T7.cabAfter,T7.dawn,T7.mirror,T7.sil];
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const DEF2={L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}};
const COVER={L:{e:[150,170],w:[200,90],hand:'open',front:1},R:{e:[350,170],w:[300,90],hand:'open',front:1}};
const HANGA={L:{w:[170,-60],hand:'grip'},R:{w:[330,-60],hand:'grip'}};
const REACH={L:{w:[100,150],hand:'grip'},R:{w:[560,190],hand:'open'}};
const PUSH={L:{w:[430,280],hand:'open'},R:{w:[470,250],hand:'open'}};
const EXT={cx:1750,diegoY:2380};
const HOLDA=t=>({L:{w:[110,420],hand:'relax'},R:{w:[400,250],hand:'open'}});
const alleyX=t=>700+clamp(t-T7.alley,0,13)*270;
function chars(t){const v=viewOf(t);const out={};
 if(v==='roofA'){const dn=t<T7.monLeaves-.5;out.marta={x:1000,fy:FL,s:1.5,yaw:.9,arms:dn?COVER:{L:{w:[100,330],hand:'open'},R:{w:[560,170],hand:'open'}},rot:dn?-6:2};
  out.sgt={x:1700,fy:FL,s:1.5,yaw:.9,arms:t<S_('j3')?(dn?COVER:{L:REL.L,R:{w:[470,170],hand:'point'}}):{L:{w:[440,330],hand:'open'},R:{w:[300,380],hand:'relax'}},rot:dn?-6:0}}
 else if(v==='ext'){out.diego={x:EXT.cx+Math.sin(t*1.3)*14,fy:EXT.diegoY,s:1.5,yaw:0,rot:Math.sin(t*1.7)*5,arms:HANGA,hang:1,vis:t<T7.snap+.1}}
 else if(v==='cab'||v==='cabB'||v==='cabF'||v==='cabAfter'){const calm=t>=T7.cutB||t>=T7.snap+.2;
  out.lucia={x:2050,fy:FL,s:1.5,yaw:1.05,arms:calm?{L:REL.L,R:{w:[520,300],hand:'open'}}:REACH,rot:calm?0:-4};
  out.beto={x:1640,fy:FL,s:1.5,yaw:.9,arms:calm?{L:REL.L,R:REL.R}:{L:{w:[100,160],hand:'grip'},R:{w:[500,210],hand:'open'}},rot:calm?4:-3};
  out.sofi={x:1230,fy:FL,s:1.05,yaw:.35,arms:t>=S_('j8')?MOUTH():{L:{w:[134,330],hand:'open'},R:REL.R},rot:0}}
 else if(v==='roof'){const runT=sstep((t-T7.run)/1.8);const mx=t>=T7.run?lerp(1050,560,runT):1050;
  out.marta={x:mx,fy:FL,s:1.5,yaw:t>=T7.run?-1.3:.85,arms:t>=T7.run?{L:{w:[120,430],hand:'relax'},R:{w:[380,260],hand:'relax'}}:(t>=T7.peek?{L:{w:[100,330],hand:'open'},R:{w:[330,300],hand:'open'}}:HOLDA(t)),rot:0,amp:t>=T7.run?1.7:0};
  if(t<T7.death)out.sgt={x:1980,fy:FL,s:1.5,yaw:t<T7.attack-1?.9:1.2,arms:t>=T7.attack-1?{L:{w:[440,230],hand:'open'},R:{w:[470,250],hand:'open'}}:{L:{w:[400,300],hand:'open'},R:{w:[360,330],hand:'relax'}},rot:0}}
 else if(v==='stairs'){out.marta={x:1000,fy:FL,s:1.5,yaw:-1.15,arms:{L:{w:[100,420],hand:'relax'},R:{w:[250,330],hand:'open'}},rot:0}}
 else if(v==='edge'){out.marta={x:3060,fy:FL,s:1.5,yaw:1.2,arms:{L:{w:[440,300],hand:'grip'},R:{w:[470,250],hand:'grip'}},rot:-3}}
 else if(v==='facade'){const sw=Math.sin(t*1.4)*5;out.marta={x:1500,fy:FL-120,s:1.5,yaw:0,rot:sw,arms:HANGA,hang:1,sway:sw}}
 else if(v==='alley'){out.marta={x:alleyX(t),fy:FL,s:1.5,yaw:1.35,arms:{L:{w:[120,430],hand:'relax'},R:{w:[380,260],hand:'relax'}},rot:0,amp:1.4}}
 else if(v==='tunnel'){out.marta={x:1700,fy:FL,s:1.5,yaw:1.15,arms:PUSH,rot:-5,amp:0}}
 else if(v==='mirror'){out.tomas={x:1500,fy:1340,s:.95,yaw:0,arms:{L:{w:[176,318],hand:'relax',front:1},R:{w:[330,330],hand:'relax'}},rot:0}}
 return out}
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
 const spk=sp&&(sp.who==='Sargento'?'sgt':sp.who==='Tomas'?'tomas':WHOKEY[sp.who]);const talk=spk===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.8):0;
 const idx=who==='sgt'?5:who==='tomas'?6:WHOL.indexOf(who);const bl=blinkAt(idx*.37,t);
 const sacc=(Math.sin(Math.floor(t*1.7+idx)*12.9898)*.5);
 const ex=exprNew(who,tn);
 const arms=L.arms;const pose={L:{...arms.L},R:{...arms.R}};
 const amp=L.amp||0;const phase=t*(amp>1.2?11:6.2)+idx*.9;
 for(const s of['L','R']){pose[s].w=[pose[s].w[0]+Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5,pose[s].w[1]+Math.sin(t*1.7+idx*3)*2.5+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+Math.sin(t*14+idx)*2*quakeLvl(t)]}
 pose.walk={phase,amp};
 const zc=spk===who&&sp&&sp.zc?sp.zc[Math.floor((tn-sp.t0)*FPS)]||0:0;
 pose.vis=talk>.06?clamp((zc-.12)/.12,-1,1):0;pose.mdy=(ex==='sad'||ex==='fear'||ex==='scream')?Math.sin(t*37+idx)*(talk>.1?.8:1.5)*(ex==='sad'?1:.7):0;
 pose.expr=faceExpr(who,t,tn,talk,idx+1);pose.blink=bl;pose.look=[clamp(L.yaw*.5,-1,1)*.6+sacc*.35,(L.lookY??.1)+Math.sin(t*2.3+idx)*.12];pose.talk=talk;pose.breath=Math.sin(t*1.9+idx)*(1+shock);pose.byaw=L.hang?0:L.yaw;
 pose.head={rot:(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.4:0),dx:0,yaw:0,dy:Math.sin(t*1.9+idx)*1.2+(ex==='shock'||ex==='scream'?-4:0)+Math.abs(Math.sin(phase))*-5*amp};
 const s=L.s,x=L.x,fy=L.fy;const rot=(L.rot||0)+(amp>0?Math.sin(phase)*1.5:0);const yb=amp>0?-Math.abs(Math.sin(phase))*9*amp:0;
 const Mch=mul(mul(T(x-250*s,fy-752*s+yb,0,s,s),T(250,752)),mul(T(0,0,rot,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 const sh=L.hang?'':`<ellipse cx="${x}" cy="${fy+10}" rx="${190*s/1.5}" ry="${28*s/1.5}" fill="#000" opacity=".5"/>`;
 return sh+`<g transform="translate(${x-250*s},${fy-752*s+yb}) scale(${s}) rotate(${rot.toFixed(2)} 250 752)">${bd}</g>`}

// ---- overlays (Reels safe zones: top 230, bottom 330, right 120)
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),22);const fs=lines.length>2?50:56;let s='';const y0=1440-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="520" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="520" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]||sp.who}</text>`+s}
function hud(t){const vv=viewOf(t);const src=(['ext','cab','cabB','cabF','cabAfter'].includes(vv))?'AEROCAM 02':'CAM 01 · TOMÁS';const el=Math.max(0,t-EVT.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;const low=t>=EVT.eyes;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="270" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="282" font-size="38" font-weight="700">REC</text><text x="640" y="282" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="330" font-size="28" fill="#ffd54a">${src}</text><text x="70" y="1575" font-size="30">SEP 19 2025  ${t<EVT.cutH?'05:42':t<EVT.cutC?'05:44':t<EVT.cutF?'05:52':t<EVT.dawn?'05:58':'07:03'}</text><text x="700" y="1575" font-size="30" fill="${low&&on?'#ff4a3a':'#fff'}">${low?'BAT ▮▯▯▯':'BAT ▮▮▮▯'}</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,236h60M50,236v60M960,236h-60M960,236v60M50,1600h60M50,1600v-60M960,1600h-60M960,1600v-60"/><path d="M480,930h60M510,900v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
function title(t){const u=t-4.7;const ser=`<text x="540" y="300" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.1)?10:2;
 const T=(x,fill,op)=>`<text x="${x}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="${fill}" fill-opacity="${op}">CAPÍTULO 7</text>`;
 return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}">${T(540-g,'#ff2a3a',.7)}${T(540+g,'#2af0ff',.6)}${T(540,'#fff',1)}<rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1080" text-anchor="middle" font-family="Inter" font-weight="900" font-size="96" letter-spacing="2" fill="#fff" stroke="#000" stroke-width="3">EL FINAL</text></g>`}
function endcard(t){const u=t-EVT.endcard;const F='Inter';const tw=(s,n)=>s.slice(0,Math.max(0,Math.min(s.length,Math.floor(n))));
 return `<rect width="${W}" height="${H}" fill="#02030a"/><g font-family="DejaVu Sans Mono" fill="#cfd6df" text-anchor="middle"><text x="540" y="780" font-size="52" font-weight="700" fill="#ff2a3a">${tw('CINTA RECUPERADA',u*14)}</text><text x="540" y="880" font-size="34">${tw('ARCHIVO 07 DE 07',(u-1.4)*18)}</text><text x="540" y="950" font-size="34">${tw('ESTADO: INCOMPLETO',(u-2.6)*18)}</text><text x="540" y="1020" font-size="34">${tw('AGUARDANDO DATOS...',(u-3.8)*14)}${Math.floor(u*2)%2?'█':''}</text></g>${u>6?`<text x="540" y="1380" text-anchor="middle" font-family="Inter" font-weight="900" font-size="48" fill="#2af0ff">COMENTA QUÉ CREES QUE PASÓ</text><text x="540" y="1460" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#fff">SÍGUEME PARA MÁS HISTORIAS</text>`:''}`}
// ---- operator hand (the person filming)
function opState(t,tgt){const sw=Math.sin(t*1.3)*10+Math.sin(t*3.1)*5;let wx=800+sw,wy=1650+Math.sin(t*1.7)*8,ang=-32,bx=tgt?tgt[0]:560,by=tgt?tgt[1]:900;
 let on=(t>=EVT.stairs&&t<EVT.rope)||(t>=EVT.cutE&&t<EVT.cutF)?1:0;if(t>=EVT.pierce&&t<EVT.doorBreak+1)on=Math.sin(t*34)>-.2?1:.15;if(t>=EVT.eyes)on=0;
 if(t>=EVT.stairs&&t<EVT.cutF){wy+=Math.sin(t*9)*14}
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
function opMode(t){const dark=((t>=EVT.stairs&&t<EVT.rope)||(t>=EVT.cutE&&t<EVT.cutF)||(t>=EVT.tunnelB&&t<EVT.cabAfter))&&!(t>=EVT.pierce&&t<EVT.doorBreak+1.2);return dark?{m:'flash'}:{m:'none'}}
function opSchedule(){return [['brace',.2,4.2],['point',S_('j1')+.3,S_('j1')+2.2],['point',EVT.tele-.2,EVT.tele+2.6],['brace',S_('j3')-.1,EVT.cutH],
 ['brace',EVT.cutC+.4,S_('j16')],['point',S_('j16')+.2,S_('j16')+2.4],['brace',EVT.peek+1.5,EVT.attack-1.6],['shield',EVT.attack+1.0,EVT.attack+2.6],['swing',EVT.run,EVT.stairs],
 ['brace',EVT.stairs+.3,EVT.rope],['grip',EVT.rope+.2,EVT.cutD],['grip',EVT.cutD+.2,EVT.shatter-.3],['shield',EVT.shatter-.2,EVT.shatter+1.4],['swing',EVT.alley,EVT.cutE],
 ['brace',EVT.cutE+.3,EVT.pierce-.1],['shield',EVT.pierce,EVT.doorBreak+1.2],['reach',EVT.doorBreak+1.2,EVT.doorBreak+2.6],['brace',EVT.doorBreak+2.6,EVT.cutF],
 ['brace',EVT.tunnelB+.2,EVT.cabAfter],['brace',EVT.dawn,EVT.dead-.4],['shield',EVT.dead-.2,EVT.black]]}
function opArms(t){const vv=viewOf(t);if(['ext','cab','cabB','cabF','cabAfter'].includes(vv)||t<.2)return'';let cur=null;for(const o of opSchedule())if(t>=o[1]&&t<o[2]){cur=o;break}if(!cur)return'';
 const [type,t0,t1]=cur;const u=clamp(Math.min((t-t0)/.3,(t1-t)/.3));const e=sstep(u);const st=CAST.tomas;
 const c0=camera(t-.06),c2=camera(t+.06),c1=camera(t);const vx=(c2[0]-c0[0])/.12*c1[2],vy=(c2[1]-c0[1])/.12*c1[2];
 const swx=-clamp(vx*.04,-120,120)+Math.sin(t*1.3)*10+Math.sin(t*3.1)*5,swy=-clamp(vy*.03,-80,80)+Math.sin(t*1.7)*8;
 const run=(type==='swing');const bob=run?Math.sin(t*11)*150:0;const jit=(t>=EVT.attack-.5&&t<EVT.attack+4)||(t>=EVT.pierce&&t<EVT.doorBreak+2)?Math.sin(t*34)*9:0;
 let pose='open',hx,hy,rot=0,sc=3.3,from=[-220,2150];
 let adj=0;if(type==='brace'){pose='open';hx=230;hy=1560;adj=12}else if(type==='point'){pose='point';hx=330;hy=1230;sc=3.5}else if(type==='grip'){pose='fist';hx=220;hy=1330}
 else if(type==='swing'){pose='relax';hx=190;hy=1680}else if(type==='reach'){pose='open';hx=440;hy=1110;sc=3.7}else{pose='open';hx=560;hy=1040;sc=4.2}
 const off=1-e;let X=hx+swx+jit,Y=hy+swy+bob+off*520;if(type==='shield'){X=560+swx*.4+jit;Y=1040+swy*.4+off*900;sc=(t>=EVT.dead-.2)?8*sstep((t-EVT.dead+.2)/1.8)+.1:sc*(.3+.7*e)}
 else{from=[-220+swx*.5,2150]}
 if(type!=='shield')rot=Math.atan2(Y-from[1],X-from[0])*180/Math.PI+adj;else rot=-95;const fl=(type==='shield')?1:-1;setCTM(T(X,Y,rot,sc,sc*fl));const hh=handSkin(pose,st);setCTM([1,0,0,1,0,0]);let g='';
 if(type!=='shield'){const sl=limbS(from,[X-Math.cos(rot*Math.PI/180)*60*sc/3,Y-Math.sin(rot*Math.PI/180)*60*sc/3],175,118);setCTM([1,0,0,1,0,0]);g+=grpS(sl,st.hood,st,[-300,Y-500,Math.max(X,0)+700,1200],{ow:5,sd:8})}
 g+=`<g transform="translate(${X.toFixed(1)},${Y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(2)} ${(sc*fl).toFixed(2)})">${type==='shield'?`<g transform="translate(-30,-30)">${hh}</g>`:hh}</g>`;return g}
// ---- scene composition
const w2s=(x,y)=>[CAMM[0]*x+CAMM[2]*y+CAMM[4],CAMM[1]*x+CAMM[3]*y+CAMM[5]];
const f1=n=>(+n).toFixed(1);
const STRAPS=[[0.3,'AZOTEA · EDIFICIO CENTRAL'],[EVT.cutH,'AEROCAM 02 · HELICÓPTERO ÁGUILA 1'],[EVT.cutB,'SOBRE EL DISTRITO NORTE'],[EVT.cutC,'AZOTEA · 12 MIN PARA EL BOMBARDEO'],[EVT.stairs,'ESCALERA DE SERVICIO'],[EVT.cutD,'FACHADA OESTE · 40 PISOS'],[EVT.alley,'CALLE · ACCESO A SERVICIOS'],[EVT.cutE,'TÚNEL DE SERVICIO'],[EVT.cutF,'ÁGUILA 1 · SOBRE LA BAHÍA'],[EVT.tunnelB,'TÚNEL DE SERVICIO · IMPACTO'],[EVT.cabAfter,'ÁGUILA 1 · 22 KM DEL SECTOR 4'],[EVT.dawn,'DISTRITO CENTRO · 07:03'],[EVT.mirror,'CENTRO COMERCIAL · PLANTA BAJA']];
function strap(t){for(const [t0,tx] of STRAPS){if(t>=t0&&t<t0+3.6){const a=clamp(Math.min((t-t0)/.4,(t0+3.6-t)/.5));if(t<EVT.cam&&t0>1)continue;return `<g opacity="${a.toFixed(2)}"><rect x="60" y="350" width="${Math.min(940,tx.length*21+60)}" height="52" fill="#000" fill-opacity=".55"/><text x="80" y="388" font-family="DejaVu Sans Mono" font-size="30" font-weight="700" fill="#ffd54a">${tx}</text></g>`}}return''}
const specks=(x,y,seed,n=16,r=70)=>{let s='';for(let i=0;i<n;i++){const a=rn(seed+i)*6.28,d=rn(seed+i*3)*r;s+=`<circle cx="${f1(x+Math.cos(a)*d)}" cy="${f1(y+Math.sin(a)*d*1.3)}" r="${f1(2+rn(seed+i*5)*7)}" fill="#8a0c14" fill-opacity=".9"/>`}return s};
function monRoofA(t){const lu=sstep((t-(EVT.lunge0-.5))/.7),lv=sstep((t-EVT.monLeaves)/2.8);let hx=lerp(3900,2500,lu),hy=lerp(420,820,lu);
 hx=lerp(hx,7600,lv);hy=lerp(hy,-600,lv);const sc=lerp(1.8,.7,lv);const jaw=t<EVT.monLeaves?.15+.8*lu*(t<EVT.lunge0+.8?1:.3):.4;
 return chaser(t,{hx,hy,jaw,mood:'rage',reach:lu,ang:.1,scale:sc,look:[-1,.2],bx:hx+1600*sc/1.8,by:hy+1700*sc/1.8})}
function heliSmall(t,x,y,sc,L){let s=heli(t,{x,y,sc,tilt:Math.sin(t*1.3)*3-4,beam:0,bx:0,by:0,cable:L/sc,lamp:1});const hands=y+130*sc+L;const ds=.7;const fy=hands+812*ds;
 return s+`@@D@@${f1(x+40*sc)}@@${f1(fy)}@@${ds}@@`}
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 BLURV=blur;setHandTime(t);const view=viewOf(t);
 let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 let tint='#ff8a3a',tintA=.07,dark=.2;
 const L=chars(t);const bloodRoof=t>=EVT.death-.1;
 const diegoAt=(x,fy,s)=>{const Ld={x,fy,s,yaw:0,rot:Math.sin(t*1.7)*5,arms:HANGA,hang:1};return charSVG('diego',t,q,tn,Ld)};
 if(view==='roofA'){w+=sky(t,2300)+skyline(t,2300);w+=tower(t,{damage:0});
  const lv=sstep((t-EVT.monLeaves)/2.8);w+=monRoofA(t);
  // heli escaping with Diego on the cable (small, far)
  const hu=clamp((t+1)/9);const hx=lerp(3400,7400,hu),hy=lerp(260,-300,hu);
  w+=heli(t,{x:hx,y:hy,sc:.5,tilt:-4+Math.sin(t*1.3)*2,beam:0,bx:0,by:0,cable:170/.5,lamp:1});w+=diegoAt(hx+20,hy+65+170+812*.7,.7);
  w+=roofBack(t,{doorOpen:0})+roof(t,{});w+=parapet(t);
  // impact of the colossus on the roof edge
  const ui=t-EVT.lunge0;if(ui>-.1&&ui<3.5){w+=`<ellipse cx="3250" cy="${FL-80}" rx="${f1(600*sstep(ui/1.2))}" ry="260" fill="url(#mSmoke)" fill-opacity="${(.85*(1-clamp(ui/3.5))).toFixed(2)}"/>`;for(let i=0;i<26;i++){const px=2900+rn(i)*800,py=FL-((ui*800*(.4+rn(i+3))-ui*ui*600)%1000);w+=`<polygon points="${f1(px)},${f1(py)} ${f1(px+34*rn(i+2)+12)},${f1(py+14)} ${f1(px+10)},${f1(py+46*rn(i+5)+12)}" fill="#4a4448"/>`}}
  for(const k of['marta','sgt'])if(L[k])w+=charSVG(k,t,q,tn,L[k]);
  tint='#ff8a3a';tintA=.08;dark=.12}
 else if(view==='tele'){w+=sky(t,2300)+skyline(t,t*120);const u=t-EVT.tele;
  const hx=1800+Math.sin(t*.8)*30,hy=620+Math.sin(t*1.1)*14;const mh=lerp(3900,2900,sstep(u/10));
  w+=chaser(t,{hx:mh,hy:1180,jaw:.18,mood:'hunt',reach:.2,ang:.12,scale:1.1,look:[-1,-.2],bx:mh+1500,by:2300});
  w+=heli(t,{x:hx,y:hy,sc:.65,tilt:-3+Math.sin(t*1.3)*2,beam:0,bx:0,by:0,cable:240/.65,lamp:1});w+=diegoAt(hx+26,hy+85+240+812*.85,.85);
  tint='#ff8a3a';tintA=.1;dark=.15}
 else if(view==='ext'){w+=aerial(t,{scroll:t*420});const M=monsterExt(t);
  const hel={x:EXT.cx-50,y:500+Math.sin(t*1.1)*18,sc:1.1,tilt:Math.sin(t*1.3)*2.5};
  w+=chaser(t,{hx:M.hx,hy:M.hy,jaw:M.jaw,mood:M.mood,reach:M.reach,ang:.12,scale:1.7,look:[-1,-.1]});
  w+=heli(t,{x:hel.x,y:hel.y,sc:hel.sc,tilt:hel.tilt,beam:0,bx:0,by:0,cable:520/hel.sc,lamp:1});
  for(const k of Object.keys(L))if(L[k].vis!==false)w+=charSVG(k,t,q,tn,L[k]);
  if(t>=EVT.snap-.1&&t<EVT.snap+.5){w+=bloodSpray(t,EVT.snap,1850,1500,.9,-.3,11,44,1.6)+`<circle cx="1850" cy="1500" r="${f1(260*(t-EVT.snap+.1)/.6+60)}" fill="#8a0c14" fill-opacity="${(.5*(1-(t-EVT.snap+.1)/.6)).toFixed(2)}"/>`}
  if(t>=EVT.snap+.1)w+=`<path d="M${f1(EXT.cx+40-4)},1163 q${f1(Math.sin(t*3)*50)},200 ${f1(Math.sin(t*2.2)*90)},${f1(420+(t-EVT.snap)*60)}" stroke="#14170f" stroke-width="9" fill="none"/><path d="M${f1(EXT.cx+40-4)},1163 q${f1(Math.sin(t*3)*50)},200 ${f1(Math.sin(t*2.2)*90)},${f1(420+(t-EVT.snap)*60)}" stroke="#8a0c14" stroke-width="5" fill="none"/>`;
  tint='#ff8a3a';tintA=.1;dark=.15}
 else if(view==='cab'||view==='cabB'){
  let kind=null;if(t>=EVT.cutB-.2&&t<EVT.metro-.1)kind='bridge';else if(t>=EVT.metro-.1&&t<EVT.street-.1)kind='metro';else if(t>=EVT.street-.1&&t<EVT.cutC)kind='street';
  w+=sky(t,0)+skyline(t,t*500)+(kind?landmark(kind,t,(t-(kind==='bridge'?EVT.cutB:kind==='metro'?EVT.metro:EVT.street)+.5)):'');
  w+=cabin(t,{});
  for(const k of ['sofi','beto','lucia'])if(L[k])w+=charSVG(k,t,q,tn,L[k]);
  if(t>=EVT.snap+.3){const p=clamp((t-EVT.snap-.3)/1.2);w+=specks(2050,540,31,Math.round(22*p),90)+specks(1640,560,53,Math.round(20*p),85)+specks(1230,820,77,Math.round(10*p),50)+bloodStain(2050,1380,150*p,9,1)+`<path d="M2150,${f1(300+300*p)} L2150,${f1(300+300*p+60)}" stroke="#8a0c14" stroke-width="10"/>`}
  for(let i=0;i<14;i++){const yy=300+rn(i)*900,xx=((rn(i+3)*1000-t*2400*(.5+rn(i+5)))%1200+1200)%1200+2150;w+=`<rect x="${f1(xx)}" y="${f1(yy)}" width="${f1(160+rn(i)*200)}" height="3" fill="#fff" fill-opacity=".18"/>`}
  tint='#ff6a3a';tintA=.1;dark=.28}
 else if(view==='roof'){w+=sky(t,2000)+skyline(t,2000);
  const pk=sstep((t-EVT.peek)/7);const atk=sstep((t-EVT.attack)/.9);const hx=lerp(lerp(3650,3500,pk),2150,atk),hy=lerp(1700-700*pk,1030,atk);
  if(t>=EVT.peek-.5){const jaw=t>=EVT.attack?(t<EVT.attack+.9?.25+.75*atk:(t<EVT.attack+1.3?.05:.35)):.04;const mood=t>=EVT.attack-.6?'rage':'cold';
   const look=[-1,.3+Math.sin(t*.7)*.1];const ox=t>=EVT.attack+1.6?sstep((t-EVT.attack-1.6)/2.4)*900:0;w+=chaser(t,{hx:hx+ox,hy:hy-ox*.2,jaw,mood,reach:atk,ang:.05,scale:1.8,look,bx:hx+ox+500,by:hy+1700});
   if(!atk)for(let k=0;k<5;k++){const u=((t*.8+k*.2)%1);w+=`<ellipse cx="${f1(hx-520-u*260)}" cy="${f1(hy+70-u*120)}" rx="${f1(60+u*160)}" ry="${f1(40+u*90)}" fill="#cfd6df" fill-opacity="${(.22*(1-u)).toFixed(2)}"/>`}}
  w+=roofBack(t,{doorOpen:t>=EVT.run?sstep((t-EVT.run-1)/.8):0})+roof(t,{})+cracks(t,sstep((t-(EVT.peek-4))/6),{});
  w+=designator(t,{laser:t>=EVT.peek-1&&t<EVT.attack-.3,lx:hx-380,ly:hy+60});
  w+=parapet(t);
  if(bloodRoof){const g=clamp((t-EVT.death)/1.2);w+=bloodStain(1980,FL+30,150*g,5,1)+bloodStain(1800,FL+60,70*g,15,1)+`<path d="M3150,${FL-130} q-30,40 -10,120" stroke="#8a0c14" stroke-width="12" fill="none"/>`}
  for(const k of ['marta','sgt'])if(L[k])w+=charSVG(k,t,q,tn,L[k]);
  if(t>=EVT.attack-1.2&&t<EVT.attack+.2&&Math.sin(t*50)>0)w+=`<circle cx="2120" cy="800" r="80" fill="#ffe9a0" fill-opacity=".9"/><circle cx="2120" cy="800" r="260" fill="url(#orangeG7)" fill-opacity=".6"/>`;
  if(t>=EVT.attack){const u=t-EVT.attack;for(let i=0;i<30;i++){const px=1700+rn(i)*1200,py=FL-((u*900*(.4+rn(i+3))-u*u*700)%1100);w+=`<polygon points="${f1(px)},${f1(py)} ${f1(px+40*rn(i+2)+14)},${f1(py+16)} ${f1(px+10)},${f1(py+50*rn(i+5)+14)}" fill="#4a4448"/>`}w+=`<ellipse cx="2300" cy="${FL-60}" rx="${f1(700*sstep(u/1.2))}" ry="260" fill="url(#mSmoke)" fill-opacity="${(.8*(1-clamp(u/6))).toFixed(2)}"/>`+bloodSpray(t,EVT.attack+.5,1990,980,.8,-.4,21,50,1.6)}
  tint='#ff8a3a';tintA=.08;dark=.12}
 else if(view==='stairs'){w+=stairsCollapsed(t,{});
  if(L.marta)w+=charSVG('marta',t,q,tn,L.marta);
  w+=bloodStain(1500,FL+40,80,31,1);tint='#ff3a1a';tintA=.1;dark=.5}
 else if(view==='edge'){w+=sky(t,3000)+skyline(t,3000);const p=sstep((t-EVT.rope)/2.5);w+=roof(t,{});w+=edgeRope(t,{p});
  // the colossus far away, searching among the towers
  w+=`<g transform="translate(5200,1100) scale(.6)" opacity=".85">`+colossus(t,{jaw:.05,look:[-1,.1],climb:t*.1,sway:Math.sin(t*.7)*.1,headAng:-.2,headX:-120,headY:-780,headScale:1.7,mood:'hunt'})+`</g>`;
  if(L.marta)w+=charSVG('marta',t,q,tn,L.marta);tint='#ff8a3a';tintA=.08;dark=.2}
 else if(view==='facade'){const sc=(t-EVT.cutD)*640;w+=facade(t,{scroll:sc});
  w+=`<line x1="1500" y1="-1500" x2="1500" y2="${FL-1218-120+10}" stroke="#14170f" stroke-width="14"/><line x1="1500" y1="-1500" x2="1500" y2="${FL-1218-120+10}" stroke="#c9a23a" stroke-width="4"/>`;
  const ep=sstep((t-EVT.eyeWin)/1.2)*(t<EVT.shatter+.4?1:clamp(1-(t-EVT.shatter-.4)/.6));if(ep>0)w+=monsterEyeWindow(t,ep,2350,900);
  if(L.marta)w+=charSVG('marta',t,q,tn,L.marta);
  if(t>=EVT.shatter&&t<EVT.shatter+.9){const u=t-EVT.shatter;for(let i=0;i<40;i++){w+=`<polygon points="${f1(2000+rn(i)*800)},${f1(500+rn(i+3)*800+u*900)} ${f1(2000+rn(i)*800+40+rn(i+2)*60)},${f1(500+rn(i+3)*800+u*900+20)} ${f1(2000+rn(i)*800+14)},${f1(500+rn(i+3)*800+u*900+70)}" fill="#cfe0ff" fill-opacity=".8"/>`}}
  tint='#ff6a3a';tintA=.1;dark=.3}
 else if(view==='alley'){w+=alley(t,{cx});
  if(L.marta)w+=charSVG('marta',t,q,tn,L.marta);tint='#ff7a3a';tintA=.1;dark=.2}
 else if(view==='tunnel'){const bl=sstep((t-S_('j28'))/6)*.8;const pr=sstep((t-EVT.pierce)/3);const op=sstep((t-EVT.doorBreak)/.8);
  w+=tunnelDoor(t,{bulge:Math.max(bl,pr),pierce:pr,open:op,lightsOut:t>=EVT.pierce});
  if(L.marta&&t<EVT.doorBreak+.15)w+=charSVG('marta',t,q,tn,L.marta);
  if(t>=EVT.pierce+.6){const g=clamp((t-EVT.pierce-.6)/6)*(.3+.2*(t>=EVT.doorBreak));w+=`<path d="M2000,${FL-20} q-30,30 10,60 q-20,40 30,50" stroke="#7a0a10" stroke-width="10" fill="none" opacity="${g.toFixed(2)}"/>`+bloodStain(2050,FL+50,100*Math.min(1,g*2),41,1)}
  if(t>=EVT.doorBreak){const g=clamp((t-EVT.doorBreak)/1.5);w+=bloodSpray(t,EVT.doorBreak,2100,900,-.9,-.2,61,60,1.8)+bloodStain(1800,FL+60,260*g,71,1)+bloodStain(1500,FL+90,140*g,81,1)}
  if(op>0){w+=`<path d="M2100,${FL} Q2300,900 2700,${FL-60} L2900,${FL} Z" fill="#05030a" fill-opacity="${(.9*op).toFixed(2)}"/>`}
  tint='#ff7a2a';tintA=.06+.1*pr;dark=.55}
 else if(view==='cabF'||view==='cabAfter'){
  if(view==='cabF'){w+=sky(t,0)+skyline(t,t*420);const u0=t-EVT.jets;
   for(let k=0;k<4;k++){const x=lerp(5200,-1800,clamp((u0-k*.25)/3.0)),y=300+k*70+Math.sin(t*2+k)*10;if(x<5100&&x>-1700)w+=`<g transform="translate(${f1(x)},${f1(y)})"><polygon points="-240,0 40,-22 120,0 40,22" fill="#0a0c10" stroke="#05060a" stroke-width="4"/><polygon points="-30,0 -130,-120 -90,0" fill="#0a0c10"/><polygon points="-30,0 -130,120 -90,0" fill="#0a0c10"/><ellipse cx="-260" cy="0" rx="120" ry="14" fill="#ffb04a" fill-opacity=".85"/><ellipse cx="-300" cy="0" rx="260" ry="26" fill="#ff7a2a" fill-opacity=".35"/></g>`}
   for(let k=0;k<7;k++){const bt=EVT.jets+2.0+k*.55;if(t>=bt&&t<bt+1.2){const u=(t-bt)/1.2;w+=`<circle cx="${f1(200+k*480)}" cy="1000" r="${f1(60+420*u)}" fill="url(#orangeG7)" fill-opacity="${(.9*(1-u)).toFixed(2)}"/><circle cx="${f1(200+k*480)}" cy="1000" r="${f1(30+220*u)}" fill="#fff" fill-opacity="${(.8*(1-u)).toFixed(2)}"/>`}}}
  else{w+=deadCity(t,{cx:2000});for(let i=0;i<60;i++){const x=((rn(i)*3600+t*30)%3600),y=((rn(i+3)*1800+t*110*(.5+rn(i+5)))%1800);w+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(3+rn(i+4)*5)}" fill="#e8e0d4" fill-opacity=".6"/>`}}
  w+=cabin(t,{});
  for(const k of ['sofi','beto','lucia'])if(L[k])w+=charSVG(k,t,q,tn,L[k]);
  if(t>=EVT.snap+.3){w+=specks(2050,540,31,22,90)+specks(1640,560,53,20,85)+specks(1230,820,77,10,50)+bloodStain(2050,1380,150,9,1)}
  tint=view==='cabF'?'#ff9a4a':'#cfc7bd';tintA=view==='cabF'?.1:.08;dark=.3}
 else if(view==='tunnelB'){const u=t-EVT.tunnelB;w+=tunnelDoor(t,{bulge:0,pierce:1,open:1,lightsOut:u>.4});
  for(let i=0;i<60;i++){const x=rn(i)*4200-600,y=((rn(i+3)*1500+u*(300+rn(i+5)*700))%1700)-100;w+=`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(4+rn(i+7)*14)}" height="${f1(4+rn(i+9)*14)}" fill="#cfc7bd" fill-opacity="${(.5*Math.max(0,1-u/3.4)).toFixed(2)}"/>`}
  w+=bloodStain(1800,FL+60,260,71,1)+bloodStain(1500,FL+90,140,81,1);
  w+=`<ellipse cx="2000" cy="${FL-40}" rx="1400" ry="${f1(300+200*Math.max(0,1-u/2))}" fill="#e8dccf" fill-opacity="${(.35*Math.max(0,1-u/3)).toFixed(2)}"/>`;
  tint='#ffb07a';tintA=.08;dark=.5}
 else if(view==='mirror'){const rv=sstep((t-EVT.reveal)/1.2);
  let inner='';if(L.tomas)inner=charSVG('tomas',t,q,tn,L.tomas)+camcorder(1500-100,745+250,t,.72)+specks(1500,742,91,14,46)+`<path d="M1478,740 q-6,40 4,90" stroke="#7a0a10" stroke-width="8" fill="none" opacity=".85"/><path d="M1530,700 q8,30 -2,70" stroke="#7a0a10" stroke-width="6" fill="none" opacity=".7"/>`;
  w+=mirrorRoom(t,{cx:1500,cy:850})+mirrorGlass(t,{cx:1500,cy:850,reveal:rv},inner);
  for(let k=0;k<20;k++){const x=((rn(k)*3800+t*20)%3800)-400,y=((rn(k+3)*1800+t*40*(.5+rn(k+5)))%1800)-100;w+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(2+rn(k+4)*4)}" fill="#cfc7bd" fill-opacity=".4"/>`}
  tint='#ffb07a';tintA=.06;dark=.35}
 else{w+=deadCity(t,{cx});w+=farSilhouette(t,{x:3900,y:1340,sc:.3+.12*sstep((t-EVT.sil)/10),turnT:EVT.turn,eyesT:EVT.eyes});
  for(let k=0;k<4;k++)w+=smokeBlob(t,2800+k*500,1250,420,k);tint='#ffb87a';tintA=.06;dark=.2}
 w+=`</g>`;
 const tg=[540,900];const op=operatorHand(t,[tg[0],tg[1]]);
 w+=`<rect width="${W}" height="${H}" fill="${tint}" fill-opacity="${(tintA+.03*Math.sin(t*5)).toFixed(3)}"/>`;
 w+=`<defs><radialGradient id="dk" gradientUnits="userSpaceOnUse" cx="540" cy="960" r="1200"><stop offset="0" stop-color="#02040a" stop-opacity="0"/><stop offset=".6" stop-color="#02040a" stop-opacity="${(dark*.5).toFixed(2)}"/><stop offset="1" stop-color="#02040a" stop-opacity="${(dark+.3).toFixed(2)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dk)"/>`;
 const om=opMode(t);if(om.m==='flash')w+=op.svg;
 w+=opArms(t);
 for(let i=0;i<7;i++){const dx=(rn(i)*1000+60),dy=(rn(i+5)*1700+100);w+=`<circle cx="${f1(dx)}" cy="${f1(dy)}" r="${f1(5+rn(i+2)*10)}" fill="#fff" fill-opacity="${(.05+.04*rn(i+7)).toFixed(2)}"/>`}
 // blood on the lens at the moments of violence
 for(const [t0,sd] of [[EVT.snap+.1,3],[EVT.attack+.7,9],[EVT.doorBreak+.2,17]])if(t>=t0&&t<t0+7)w+=lensBlood(t,t0,sd,{hold:3.5});
 let fl=0;for(const [ft,k] of [[EVT.lunge0,.5],[EVT.snap,.7],[EVT.attack,.7],[EVT.shatter,.7],[EVT.pierce,.4],[EVT.doorBreak,.9]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 w+=`<rect width="${W}" height="${H}" fill="#fff0d8" opacity="${fl.toFixed(2)}"/>`;
 const wo=t>=EVT.white-1.4&&t<EVT.white+1.8?sstep((t-EVT.white+1.4)/1.4):(t>=EVT.white+1.8&&t<EVT.white+4.5?1-sstep((t-EVT.white-1.8)/2.7):0);if(wo>0)w+=`<rect width="${W}" height="${H}" fill="#fff" opacity="${wo.toFixed(2)}"/>`;
 w+=strap(t);
 return w}

function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=tn;let inner,hudOn=false;
 if(t<4.6)inner=sceneWorld(t,tn);else if(t<4.7)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7.1)inner=title(t);else if(t<EVT.cam)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 else if(t<EVT.black){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=EVT.cam&&t<EVT.cam+.25)g=.6;for(const c of CUTS.slice(1))if(t>=c&&t<c+.18)g=Math.max(g,.5);if(t>=EVT.dead-.6&&t<EVT.black)g=.5+.4*Math.sin(t*40);if(t<.35)g=.7;if(t>=EVT.attack&&t<EVT.attack+.25)g=.5;if(t>=EVT.black-1.0&&t<EVT.black)g=.6;
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
// ---- camera shots (cinematic coverage; each cut resets the camera): [t,cx,cy,zoom,rot,mode,skew]
const SHOTS=[
 // 1) roof (continuity from chapter 6): the colossus smashes the roof and flies after the helicopter
 [0,2300,800,.6,-2,'w',0],[1.8,2000,900,.8,3,'w',0],[4.0,1500,900,.9,-2,'n',0],[7.4,1000,820,1.5,2,'s',0],[S_('j1')-.3,1000,800,1.6,2,'n',0],[EVT.monLeaves+.6,2400,700,.8,-3,'w',0],
 [EVT.tele,1800,760,.9,-2,'w',0],[EVT.tele+2.5,1900,760,1.3,2,'s',0],[EVT.tele+6,1900,780,1.7,-2,'s',0],
 [S_('j3')-.2,1700,800,1.5,-2,'n',0],
 // 2) helicopter chase
 [EVT.cutH,1950,1300,.5,-3,'s',0],[EVT.cutH+1.6,2000,1500,.72,2,'w',0],[S_('j5')-.1,1640,820,1.5,-2,'n',0],[S_('j6')-.4,2050,820,1.4,2,'n',0],[S_('j7')-.4,520,1000,1.25,2,'n',0],
 [EVT.ext1,2100,1400,.55,-2,'s',0],[EVT.ext1+1.0,2000,1500,.75,3,'n',0],[S_('j8')-.1,1230,900,1.75,-2,'n',0],
 [EVT.close,1900,1500,.7,2,'n',0],[EVT.close+.5,1800,1700,1.25,-3,'n',0],[S_('j9')-.2,1800,1760,1.5,2,'n',0],[EVT.snap-.9,2000,1550,.9,-4,'w',0],[EVT.snap+.1,2050,1500,.8,4,'w',0],
 [EVT.snap+1.4,2050,800,1.9,3,'w',0],[S_('j11')-.4,1640,800,1.7,-3,'w',0],
 [EVT.cutB,1400,900,.7,0,'s',0],[S_('j12')-.3,520,1000,1.2,2,'n',0],[EVT.bridge+1.5,2650,700,.8,-2,'s',0],[EVT.metro+.3,2650,750,.85,2,'n',0],[S_('j13')-.3,520,1000,1.1,0,'n',0],[EVT.street+.3,2650,760,.85,-2,'n',0],[S_('j14')-.3,1230,900,1.75,2,'n',0],
 // 3) roof II: the colossus returns, the sergeant's sacrifice
 [EVT.cutC,2000,700,.6,-2,'s',0],[S_('j15')-.4,1980,800,1.5,-2,'n',0],[S_('j16')-.4,1500,780,.9,2,'n',0],[EVT.peek-.4,3200,700,.75,-3,'w',0],[S_('j17')-.4,1050,800,1.7,2,'n',0],
 [S_('j18')-.4,1980,800,1.5,-2,'n',0],[S_('j19')-.4,1050,800,1.7,2,'n',0],[S_('j20')-.4,1980,800,1.8,-1,'n',0],[S_('j21')-.4,3300,620,1.2,2,'z',0],[S_('j22')-.4,1980,800,1.9,0,'n',0],
 [EVT.attack-1.2,2500,750,.6,0,'w',0],[EVT.attack-.1,2300,800,.7,-5,'w',0],[EVT.attack+.9,1980,900,1.2,4,'w',0],[EVT.run,900,900,.9,3,'w',0],
 [EVT.stairs,800,900,.8,-2,'n',0],[S_('j23')-.4,900,820,1.4,2,'n',0],[EVT.rope,3000,900,.8,0,'s',0],[EVT.rope+1.5,3100,1000,1.2,-2,'n',0],
 // 4) facade descent
 [EVT.cutD,1500,900,.7,-3,'w',0],[S_('j24')-.4,1500,700,1.5,3,'w',0],[S_('j25')-.4,1500,800,1.3,-2,'n',0],[EVT.eyeWin-.5,1900,850,.9,0,'s',0],[EVT.eyeWin+.8,2300,850,1.2,3,'z',0],[EVT.shatter-.3,1700,850,.9,-3,'w',0],
 // 5) tunnel
 [EVT.cutE,1700,780,1.0,-2,'w',0],[S_('j28')-.4,1700,800,1.6,2,'n',0],[EVT.pierce-.6,2300,700,1.0,0,'w',0],[S_('j29')-.4,1700,800,1.8,3,'w',0],[S_('j30')-.4,1700,820,1.8,-2,'n',0],[S_('j31')-.4,1700,820,1.9,2,'n',0],[EVT.doorBreak-.4,2300,800,1.1,-4,'w',0],[EVT.doorBreak+.8,1300,900,.8,0,'n',0],[S_('j32')-.3,1200,900,.9,2,'n',0],
 // 6) jets / bombing / dead city
 [EVT.cutF,1400,900,.7,0,'s',0],[S_('j33')-.3,2650,700,.8,-2,'n',0],[EVT.white-1.4,2650,600,.9,0,'w',0],
 [EVT.tunnelB,1700,820,.9,0,'w',0],
 [EVT.cabAfter,1400,900,.7,0,'s',0],[S_('j34')-.3,1230,900,1.75,2,'n',0],[S_('j35')-.3,520,1000,1.1,0,'n',0],
 [EVT.dawn,2000,900,.6,0,'s',0],[EVT.dawn+1.8,2200,850,.75,2,'n',0],
 [EVT.mirror,1500,850,.8,0,'s',0],[EVT.mirror+2.0,1500,790,1.1,0,'s',0],[S_('j36')-.4,1500,700,1.55,0,'n',0],[EVT.reveal-.4,1500,800,1.25,0,'z',0],[S_('j37')-.3,1560,720,1.8,0,'n',0],
 [EVT.sil,2700,700,.9,0,'s',0],[EVT.sil+2.8,3300,900,1.2,0,'n',0],[EVT.turn,3800,900,1.9,0,'z',0],[EVT.eyes,3900,780,2.4,0,'z',0]];
// street run: the camera follows Marta toward the service entrance
for(let tt=EVT.alley;tt<EVT.cutE-.5;tt+=1.4){const mx=700+Math.min(Math.max(tt-EVT.alley,0),13)*270;SHOTS.push([tt,mx+380,820,tt<S_('j26')-.2?.9:1.15,((tt*7)%5)-2,'w',0])}
SHOTS.sort((x,y)=>x[0]-y[0]);
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(mode==='preview'){for(const a of process.argv.slice(3)){const t=parseFloat(a);const t0=Date.now();{const rp=renderPng(t);spawnSync('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-i','-',path.join(BUILD,`prev_${a}.png`)],{input:Buffer.from(rp.pixels.buffer?rp.pixels:rp.pixels),maxBuffer:1e8})}console.log(a,Date.now()-t0,'ms')}}
 else if(mode==='part'||mode==='seg'){const i=+process.argv[3],n=+process.argv[4];const total=DUR*FPS;let a=Math.floor(total*i/n),b=Math.floor(total*(i+1)/n);let outName=`part_${i}.mp4`;if(mode==='seg'){a=Math.round(+process.argv[3]*FPS);b=Math.round(+process.argv[4]*FPS);outName=process.argv[5]}
  const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-','-vf','gblur=sigma=0.7,eq=contrast=1.07:saturation=0.85,rgbashift=rh=-2:bh=2,noise=alls=11:allf=t,vignette=angle=PI/4.2','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',path.join(BUILD,outName)],{stdio:['pipe','inherit','inherit']});
  (async()=>{for(let f=a;f<b;f++){if(process.env.DBG)console.error("f",f);const px=renderPng(f/FPS).pixels;if(!ff.stdin.write(Buffer.from(px.buffer,px.byteOffset,px.length)))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%90===0)console.error('part',i,f-a,'/',b-a)}ff.stdin.end()})()}
}
export {SHOTS,camera,sceneWorld,LINES,EVT};
