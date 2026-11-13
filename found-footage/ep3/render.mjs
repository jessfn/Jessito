import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {spawn,spawnSync} from 'child_process';import path from 'path';import {fileURLToPath} from 'url';
import {CAST,body,defs,elbow} from '../body.mjs';
import {limb as limbS,grp as grpS,hand as handW,handSkin,gripV2 as gripS} from '../char.mjs';
import {setCTM,mul,T} from '../char.mjs';
let CAMM=[1,0,0,1,0,0];let BLURV=0;
import {clamp,sm,lerp,defsScene,dust,creature,setEV,dist,speedAt,street,heli,flame,P as PJ,F as FOC,VX,HY} from './scene.mjs';
import {defsRooms,stairs,stairsFloor,stairsLight,slab,lobby,lobbyDesk,entryDoors,lobbyFloor,tunnel,keyRingLoose,DX,DY} from './rooms.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const BUILD=path.join(HERE,'../build/ep3');
const TL=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));const W=1080,H=1920,FPS=30,DUR=Math.ceil(TL.dur);
const script=JSON.parse(fs.readFileSync(path.join(HERE,'script.json'),'utf8'));
const START=TL.start;
const inv=tn=>tn;const EVT=TL.ev;setEV(EVT);const DURL=TL.durs;const Ls=id=>START[id],Le=id=>START[id]+DURL[id];
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA',Sofi:'SOFI',Altavoz:'ALTAVOZ'};
const WHOKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi'};
const FL=1510;
// ---- envelopes
function envelope(id){const r=spawnSync('ffmpeg',['-v','error','-i',path.join(BUILD,'voz_t',id+'.mp3'),'-f','s16le','-ac','1','-ar','8000','-'],{maxBuffer:1e8});const b=r.stdout;const n=Math.floor(b.length/2);const hop=Math.round(8000/FPS);const out=[];let mx=1e-6;for(let i=0;i+hop<=n;i+=hop){let s=0;for(let j=0;j<hop;j++){const v=b.readInt16LE((i+j)*2)/32768;s+=v*v}const e=Math.sqrt(s/hop);out.push(e);mx=Math.max(mx,e)}const nn=out.map(v=>v/mx);return nn.map((v,i)=>Math.max(v,(nn[i-1]||0)*.55))}
const LINES=script.map(l=>({...l,t0:START[l.id],env:envelope(l.id)}));LINES.forEach(l=>l.dur=l.env.length/FPS);
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}

// ---- camera shots [t,cx,cy,zoom,rot,mode,skew]
const SHOTS=[[0,2300,1180,1.2,-3,'s',0],[7.4,1500,1000,.62,0,'s',0],
 [Ls("b1")-.1,2300,850,.9,2,'n',0],[EVT.lever-.3,1000,1000,.85,-2,'n',0],[Ls("b2")+.2,1150,1050,.95,2,'n',0],[Ls("b2")+2.4,1450,1150,1.0,0,'s',0],
 [EVT.lift-.1,1500,1250,.95,-4,'w',0],[Ls('b3')-.1,2250,1150,1.8,3,'n',0],[Ls('b4')-.1,1250,900,.82,0,'n',0],[Ls('b5')-.1,1000,820,1.5,-2,'n',0],
 [Ls('b6')-.1,1900,780,1.6,2,'n',0],[EVT.go-.1,1250,950,.82,-2,'w',0],[Ls('b7')-.1,1500,850,1.15,2,'n',0],[EVT.arrive+.4,1700,880,.95,0,'s',0],
 [EVT.lobby-.05,1300,960,.62,0,'w',0],[Ls('b8')-.1,2150,900,1.1,2,'n',0],[Ls('b8')+1.3,2260,960,2.1,-2,'s',0],
 [Ls('b9')-.1,1350,860,1.25,2,'n',0],[Ls('b10')-.1,1450,820,1.55,-2,'n',0],[EVT.keys-.1,1430,780,2.5,1,'s',0],[Ls('b11')-.4,320,900,1.35,-3,'w',0],
 [Ls('b12')-.1,2000,900,1.05,2,'n',0],[EVT.unlock-1.2,2280,980,2.3,0,'s',0],[EVT.doorsOpen-.3,2300,850,.8,0,'w',0],
 [EVT.street-.05,1230,900,.78,0,'w',0],[Ls('b13')-.2,1230,520,.95,-2,'s',0],[Ls('b14')-.1,1230,790,2.4,0,'n',0],[Ls('b14')+3.2,1230,900,.8,0,'s',0],
 [Ls('b15')-.1,900,900,1.4,-2,'n',0],[Ls('b16')-.1,1650,760,1.7,3,'n',0],[Ls('b17')-.2,800,1120,1.7,-3,'w',0],
 [Ls('b18')-.1,1230,900,.78,3,'w',0],[EVT.run+.4,1230,980,.8,0,'w',0],[Ls('b19')-.15,1700,380,.95,-5,'w',0],[EVT.gstep-.3,1500,820,.72,-6,'w',0],[Ls('b20')-.1,1250,820,1.2,4,'w',0],
 [EVT.metroIn-.1,1250,1000,.8,0,'w',0],[EVT.fall,1250,1500,.8,78,'w',0]];
SHOTS.sort((x,y)=>x[0]-y[0]);

const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],c:[55,.9],p:[2.4,.95],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camera(t){const ch=s=>[s[1],s[2],s[3],s[4],s[6]];let c=ch(SHOTS[0]);for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];let [w,z]=MODE[sh[5]];if(sh[4]>40){w=14;z=.7}const g=stepResp(t-sh[0]-(sh[5]==='c'?0:.28),w,z);if(g===0)continue;const A=ch(sh),B=ch(SHOTS[i-1]);for(let k=0;k<5;k++)c[k]+=(A[k]-B[k])*g}return c}
function focusBlur(t){let b=0;for(let i=1;i<SHOTS.length;i++){const sh=SHOTS[i];if(!'wzc'.includes(sh[5]))continue;const tau=t-sh[0]-(sh[5]==='c'?0:.3);if(tau<0||tau>1.2)continue;const amp=sh[5]==='c'?9:sh[5]==='w'?6:3;b=Math.max(b,amp*Math.exp(-tau/.3))}return b}
const IMPULSES=[[EVT.lift,40],[EVT.gstep,80],[EVT.metroIn,25],[EVT.fall,90],[EVT.doorsOpen,20]];
function shakeAmp(t){let a=4.5+2*clamp((t-EVT.cam)/60,0,1);const sp=speedAt(t);a+=sp>2?sp*2.4:sp*1.5;if(t<EVT.cam)a+=5;
 if(t>EVT.lever&&t<EVT.lift)a+=3;if(t>EVT.scratch&&t<EVT.unlock)a+=3*(((t-EVT.scratch)/7.1)+.3);if(t>EVT.drain&&t<EVT.run)a+=6;if(t>EVT.run&&t<EVT.fall)a+=8;if(t>EVT.gstep&&t<EVT.fall)a+=14;if(t>=EVT.fall)a+=30;
 for(const [ti,m] of IMPULSES)if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function quakeLvl(t){return clamp(shakeAmp(t)/40,0,1.4)}

// ---- positions (world x) per phase
const WHOL=['beto','diego','sofi','lucia','marta'];
const A=(a,b,c,d,e)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e});
const EXL={
 b0:A('scream','worry','fear','fear','worry'),b1:A('sad','worry','fear','fear','annoyed'),b2:A('scream','annoyed','fear','fear','worry'),
 b3:A('sad','tender','tender','worry','worry'),b4:A('worry','fear','worry','fear','annoyed'),b5:A('worry','worry','fear','worry','worry'),
 b6:A('worry','worry','fear','worry','annoyed'),b7:A('worry','worry','neutral','tender','worry'),b8:A('worry','annoyed','fear','worry','worry'),
 b9:A('worry','worry','sad','tender','worry'),b10:A('worry','worry','tender','worry','worry'),b11:A('fear','fear','fear','fear','fear'),
 b12:A('fear','annoyed','fear','fear','fear'),b13:A('shock','shock','shock','shock','shock'),b14:A('worry','worry','fear','worry','worry'),
 b15:A('worry','worry','fear','worry','worry'),b16:A('worry','worry','fear','worry','annoyed'),b17:A('shock','shock','scream','scream','shock'),
 b18:A('fear','scream','fear','scream','fear'),b19:A('shock','shock','shock','shock','shock'),b20:A('shock','shock','scream','scream','shock')};
function exprNew(who,tn){const idx=WHOL.indexOf(who);let ex='worry';if(tn<START.b0)return'neutral';
 for(const l of LINES){if(!EXL[l.id])continue;const spk=WHOKEY[l.who]===who;const t0=l.t0+(spk?0:.25+.1*idx);if(tn<t0)break;const en=EXL[l.id][who];if(Array.isArray(en)){for(const [fr,e] of en)if(tn>=t0+fr*l.dur)ex=e}else ex=en}
 if(tn>=EVT.metroIn)ex='fear';if(tn>=EVT.fall)ex='shock';return ex}
const HEADROT={laugh:-7,cryLaugh:-6,sad:4,worry:2,tender:3,annoyed:-2,fear:-2,shock:-3,scream:-4,smirk:2,disbelief:-3};
const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};
function track(keys,t){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<keys[i][0]){const a=keys[i-1],b=keys[i];return a[1]+(b[1]-a[1])*sstep((t-a[0])/(b[0]-a[0]))}}return keys[keys.length-1][1]}
const J=EVT;
const MARTA=[[0,2640],[19.5,2640],[22.3,1690],[38.05,1690],[40.2,980],[56,980],[58.3,1760],[J.street-.06,1790],[J.street,1690]];
const XK={
 lucia:[[0,2000],[19.5,2000],[22.3,800],[43.5,800],[46.8,1460],[52.4,1460],[54.3,2100],[J.street-.06,2100],[J.street,800]],
 sofi:[[0,2190],[19.5,2190],[22.3,1030],[38.05,1030],[42.5,1180],[56,1180],[58.3,1960],[J.street-.06,1960],[J.street,1030]],
 diego:[[0,716],[16.8,716],[22.3,1230],[38.05,1230],[40.4,2330],[J.street-.06,2330],[J.street,1230]],
 marta:MARTA};
const betoFeet=t=>t<J.lift?1500:1500+150*sstep((t-J.lift)/1.8);
function xOf(who,t){if(who==='beto'){if(t<Ls('b4'))return betoFeet(t);const m=track(MARTA,t)-240;const u=sstep((t-Ls('b4'))/2);return lerp(betoFeet(Ls('b4')),m,u)}return track(XK[who],t)}
function betoSt(t){
 if(t<Ls('b4')){const k=sstep((t-J.lift)/3);return{rot:72-12*k,s:1.35,yoff:-55+10*k}}
 const u=sstep((t-Ls('b4'))/2.2);return{rot:lerp(60,9,u),s:lerp(1.35,1.5,u),yoff:lerp(-45,0,u)}}
function ampOf(who,t){let a=0;const d=(xOf(who,t+.06)-xOf(who,t-.06))/.12;a=clamp(Math.abs(d)/230,0,1.3);
 if(t>=J.go&&t<J.arrive)a=Math.max(a,.85);
 if(t>=J.street&&t<J.run){const sp=speedAt(t);a=Math.max(a,clamp(sp*.9,0,1.1))}
 if(t>=J.run&&t<J.fall)a=1.9;if(t>=J.fall)a=.4;
 if(who==='beto'&&t>=Ls('b4'))a*=.55;if(who==='beto'&&t<Ls('b4'))a=0;
 if(who==='diego'&&t<J.lift+1)a=0;return a}
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const MOUTH=()=>({L:{e:[168,332],w:[224,238],hand:'open',front:1},R:{e:[332,332],w:[276,238],hand:'open',front:1}});
const DEF2={L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}};
const KF={
 beto:[[0,{L:{w:[120,340],hand:'open'},R:{w:[380,360],hand:'open'}}],[J.lift,{L:{w:[150,380],hand:'open'},R:{w:[350,380],hand:'relax'}}],[Ls('b4')-.2,{L:{w:[134,300],hand:'open'},R:{w:[366,300],hand:'open'}}],[Ls('b4')+1.6,{L:{w:[40,232],hand:'open'},R:{w:[460,232],hand:'open'}}],[Ls('b15')-.2,{L:{w:[40,232],hand:'open'},R:{w:[560,250],hand:'point'}}],[Le('b15')+.3,{L:{w:[40,232],hand:'open'},R:{w:[460,232],hand:'open'}}],[J.run-.1,{L:{w:[134,214],hand:'open'},R:{w:[460,232],hand:'open'}}]],
 diego:[[0,REL],[Ls('b4'),{L:{w:[130,380],hand:'open'},R:{w:[400,430],hand:'open'}}],[J.door1-.5,{L:{w:[130,380],hand:'open'},R:{w:[470,300],hand:'open'}}],[J.door1+.9,REL],[Ls('b8')-.1,{L:REL.L,R:{w:[470,250],hand:'point'}}],[Le('b8')+.3,REL],[Ls('b12')-.2,{L:{w:[150,330],hand:'open'},R:REL.R}],[J.unlock-1.1,{L:{w:[225,322],hand:'grip'},R:{w:[330,330],hand:'open'}}],[J.unlock+.9,{L:{w:[225,322],hand:'open'},R:{w:[345,330],hand:'open'}}],[J.doorsOpen+.4,DEF2]],
 sofi:[[0,REL],[Ls('b4'),{L:{w:[134,330],hand:'open'},R:REL.R}],[Ls('b9')-.1,{L:REL.L,R:{w:[470,260],hand:'point'}}],[Le('b9')+.3,REL],[J.heli,MOUTH()],[J.gstep,DEF2]],
 lucia:[[0,REL],[Ls('b4'),{L:REL.L,R:{w:[350,440],hand:'open'}}],[Ls('b7')-.1,{L:REL.L,R:{w:[480,230],hand:'point'}}],[Le('b7')+.3,REL],[Ls('b10')-.1,{L:REL.L,R:{w:[300,270],hand:'open'}}],[J.keys-.1,{L:REL.L,R:{w:[330,215],hand:'open'}}],[J.keys+.5,{L:REL.L,R:{w:[360,170],hand:'grip'}}],[53.5,{L:REL.L,R:{w:[420,260],hand:'grip'}}],[54.5,{L:REL.L,R:{w:[430,330],hand:'open'}}],[Ls('b17')-.1,{L:{w:[40,300],hand:'point'},R:REL.R}],[Le('b17')+.4,MOUTH()]],
 marta:[[0,REL],[Ls('b1')-.1,{L:{w:[60,250],hand:'point'},R:REL.R}],[Le('b1')+.2,{L:{w:[100,430],hand:'open'},R:REL.R}],[Ls('b4')-.2,{L:{w:[100,430],hand:'open'},R:{w:[420,300],hand:'open'}}],[Le('b4')+.2,{L:{w:[100,430],hand:'open'},R:REL.R}],[J.phone-.5,{L:{w:[100,430],hand:'open'},R:{w:[430,200],hand:'grip',prop:'phone',rot:20}}],[J.arrive+2,{L:{w:[100,430],hand:'open'},R:REL.R}],[Ls('b16')-.1,{L:{w:[100,430],hand:'open'},R:{w:[500,240],hand:'point'}}],[Le('b16')+.3,{L:{w:[100,430],hand:'open'},R:REL.R}]]};
const SH={L:[186,240],R:[314,240]};
const ease=x=>{x=clamp(x);const c1=1.1,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function polar(sh,a,b,u){const ra=Math.hypot(a[0]-sh[0],a[1]-sh[1]),rb=Math.hypot(b[0]-sh[0],b[1]-sh[1]);let ta=Math.atan2(a[1]-sh[1],a[0]-sh[0]),tb=Math.atan2(b[1]-sh[1],b[0]-sh[0]);let d=tb-ta;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const th=ta+d*u,rr=ra+(rb-ra)*u;return[sh[0]+Math.cos(th)*rr,sh[1]+Math.sin(th)*rr]}
function kfAt(arr,t){let i=0;while(i+1<arr.length&&arr[i+1][0]<=t)i++;const cur=arr[i][1],prev=i>0?arr[i-1][1]:cur;const uu=clamp((t-arr[i][0])/.6);const u=ease(uu);const out={};for(const s of ['L','R']){const a=prev[s],b=cur[s];const pick=uu>.3?b:a;const side=s==='L'?-1:1;out[s]={w:polar(SH[s],a.w,b.w,u),hand:pick.hand,prop:pick.prop,fs:lerp(a.fs||1,b.fs||1,u),rot:pick.rot,front:pick.front};
 if(a.e||b.e){const ea=a.e||elbow(SH[s],a.w,side,a.fs||1),eb=b.e||elbow(SH[s],b.w,side,b.fs||1);out[s].e=polar(SH[s],ea,eb,u)}}return out}
function blinkAt(seed,t){const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0}
const FUL=[1235,1322];
function diegoW(t){const a=[354,422],b=[330,330],c=[300,520];const u0=sstep((t-(J.lever-.7))/.7);const p=sstep((t-(Ls('b2')+.9))/(J.lift-Ls('b2')-.9));
 if(t<J.lever)return [lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)];if(t<J.lift+.5)return [lerp(b[0],c[0],p),lerp(b[1],c[1],p)];return [c[0],c[1]]}
function wristWorld(who,side,t){const pose=kfAt(KF[who],t);const x=xOf(who,t),s=who==='sofi'?1.05:1.5;const w=pose[side].w;return[x-250*s+w[0]*s,FL-752*s+w[1]*s]}
function rodAt(t){const w=diegoW(t),X=xOf('diego',t);const H=[X-375+w[0]*1.5,FL-1128+w[1]*1.5];const dx=FUL[0]-H[0],dy=FUL[1]-H[1],l=Math.hypot(dx,dy);const tip=[FUL[0]+dx/l*210,FUL[1]+dy/l*210];return{H,tip,F:FUL}}
function lookAt(who,t,tn){const sp=speakerAt(tn);const mx=xOf(who,t);
 if(t>EVT.heli&&t<EVT.gstep-.5)return[0,-.9];if(t>=EVT.gstep-.5&&t<EVT.fall)return[.6,-.7];if(t>Ls('b17')&&t<EVT.run)return[-.85,.35];
 if(t>EVT.scratch&&t<EVT.scratch+3.4)return[-.9,.05];if(t>=EVT.keys-1&&t<EVT.keys+3)return[(1465-mx)/500,.1];if(t>EVT.lift-4&&t<Ls('b4')&&who!=='beto')return[clamp((betoFeet(t)+900-mx)/600,-1,1),.5];
 if(t>EVT.lever&&t<EVT.lift&&who!=='diego')return[clamp((1500-mx)/600,-1,1),.6];
 if(t>EVT.unlock-3&&t<EVT.doorsOpen+1)return[clamp((2300-mx)/500,-1,1),.1];if(t>Ls('b8')&&t<Ls('b8')+3.2)return[clamp((2300-mx)/500,-1,1),.1];
 if(sp&&sp.who!=='Tomas'&&sp.who!=='Altavoz'&&WHOKEY[sp.who]!==who)return[clamp((xOf(WHOKEY[sp.who],t)-mx)/500,-1,1),.1];return[0,.15]}
function charSVG(who,t,shock,tn){const st=CAST[who];const pose=kfAt(KF[who],t);const sp=speakerAt(tn);const talk=sp&&WHOKEY[sp.who]===who?clamp((sp.env[Math.floor((tn-sp.t0)*FPS)]||0)*1.7):0;
 const idx=WHOL.indexOf(who);const bl=blinkAt(idx*.37,t);const lk=lookAt(who,t,tn);
 const br=Math.sin(t*1.9+idx);const sway=Math.sin(t*.8+idx*2)*.8+Math.sin(t*9+idx)*.5*quakeLvl(t);
 const run=t>=EVT.run;const amp=ampOf(who,t);const phase=t*(run?11:6.2)+idx*.9;
 const hold=(who==='diego'&&t>EVT.lever-.7&&t<EVT.lift+1.4);
 if(hold){const w=diegoW(t);pose.R.w=w;pose.R.hand='grip';pose.L.w=[w[0]+34,w[1]+26];pose.L.hand='grip';pose.L.front=1;pose.R.front=1;delete pose.R.e;delete pose.L.e;if(t>EVT.lift+.5){const u=sstep((t-EVT.lift-.5)/.8);pose.R.w=[lerp(w[0],354,u),lerp(w[1],422,u)];pose.L.w=[lerp(w[0]+34,146,u),lerp(w[1]+26,422,u)];if(u>.5)pose.R.hand=pose.L.hand='relax'}}
 for(const s of ['L','R']){pose[s].w=[pose[s].w[0]+(hold?0:Math.sin(t*1.3+idx+(s==='L'?0:2))*2.5),pose[s].w[1]+(hold?0:Math.sin(t*1.7+idx*3)*2.5)+Math.sin(phase+(s==='L'?0:Math.PI))*10*amp+Math.sin(t*14+idx)*2*quakeLvl(t)]}
 const ex=exprNew(who,tn);pose.walk={phase,amp};
 pose.expr=ex;pose.blink=bl;pose.look=lk;pose.talk=talk;pose.breath=br;pose.head={rot:lk[0]*3+(HEADROT[ex]||0)+Math.sin(t*.9+idx)*1.6+(talk>.2?Math.sin(t*9+idx)*1.2:0),dx:lk[0]*3,dy:Math.sin(t*1.9+idx)*1.2+(ex==='shock'||ex==='scream'?-4:0)+Math.abs(Math.sin(phase))*-5*amp};
 let s=who==='sofi'?1.05:1.5,x=xOf(who,t),fy=FL;let rot=sway;let yoff=-Math.abs(Math.sin(phase))*9*amp*(who==='sofi'?.6:1);
 if(who==='beto'){const b=betoSt(t);s=b.s;rot=b.rot+(b.rot>30?Math.sin(t*2.2)*1.2:sway+Math.sin(phase)*2*amp);yoff+=b.yoff}
 if(who==='diego'&&t>EVT.lever&&t<EVT.lift)rot+=3+Math.sin(t*28)*.8;
 const Mch=mul(mul(T(x-250*s,fy-752*s+yoff,0,s,s),T(250,752)),mul(T(0,0,rot,1,1),T(-250,-752)));setCTM(mul(CAMM,Mch));const bd=body(st,pose);setCTM([1,0,0,1,0,0]);
 const lying=who==='beto'&&betoSt(t).rot>30;
 const sh=lying?`<ellipse cx="${x+360}" cy="${fy+16}" rx="540" ry="26" fill="#000" opacity=".5"/>`:`<ellipse cx="${x}" cy="${fy+10}" rx="${190*s/1.5}" ry="${28*s/1.5}" fill="#000" opacity=".5"/>`;
 return sh+`<g transform="translate(${x-250*s},${fy-752*s+yoff}) scale(${s}) rotate(${rot.toFixed(2)} 250 752)">${bd}</g>`}

// ---- overlays (Reels safe zones: top 230, bottom 330, right 120)
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
function caption(t){const sp=speakerAt(t);if(!sp)return'';const lines=wrap(sp.text.replace(/\.\.\./g,'…'),22);const fs=lines.length>2?50:56;let s='';const y0=1440-(lines.length-1)*34;lines.forEach((l,i)=>{s+=`<text x="520" y="${y0+i*(fs+10)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${l.replace(/&/g,'&amp;')}</text>`});
 return `<text x="520" y="${y0-fs-14}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" letter-spacing="4" fill="#ffd54a" stroke="#000" stroke-width="7" paint-order="stroke">${NAMES[sp.who]||sp.who}</text>`+s}
function hud(t){const el=Math.max(0,t-EVT.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;
 return `<g font-family="DejaVu Sans Mono" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke"><circle cx="86" cy="270" r="15" fill="#ff2222" opacity="${on?1:.12}" stroke="none"/><text x="116" y="282" font-size="38" font-weight="700">REC</text><text x="640" y="282" font-size="36">${hh}:${mm}:${ss}</text><text x="70" y="1575" font-size="30">SEP 18 2025  23:07</text><text x="700" y="1575" font-size="30">SP ▮▮▮▯</text></g><g stroke="#fff" stroke-width="4" fill="none" opacity=".75"><path d="M50,236h60M50,236v60M960,236h-60M960,236v60M50,1600h60M50,1600v-60M960,1600h-60M960,1600v-60"/><path d="M480,930h60M510,900v60" opacity=".5"/></g>`}
const rng=s=>{let x=s>>>0;return()=>(x=(x*1664525+1013904223)>>>0)/4294967296};
function glitch(inner,t,amt){const r=rng(Math.floor(t*30)*7919);const dx=(r()-.5)*70*amt;let s=`<g transform="translate(${dx.toFixed(0)},0)">${inner}</g>`;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<Math.round(3+amt*6);i++){const y=Math.floor(r()*(H-60)),h=6+Math.floor(r()*40*amt+4);s+=`<rect x="0" y="${y}" width="${W}" height="${h}" fill="${cols[i%4]}" fill-opacity="${(.15+r()*.35).toFixed(2)}"/>`;if(r()<.5)s+=`<rect x="${Math.floor(r()*500)}" y="${y+h}" width="${Math.floor(200+r()*500)}" height="${Math.floor(3+r()*10)}" fill="#fff" fill-opacity="${(.3+r()*.4).toFixed(2)}"/>`}return s}
function title(t){const u=t-4.7;const ser=`<text x="540" y="300" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" letter-spacing="16" fill="#ffffff" fill-opacity=".75">CLOVERFIELD</text>`;const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;const g=(u>.3&&u<.55)||(u>2.1)?10:2;
 const T=(x,fill,op)=>`<text x="${x}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" letter-spacing="14" fill="${fill}" fill-opacity="${op}">CAPÍTULO 3</text>`;
 return `<rect width="${W}" height="${H}" fill="#05070a"/>${ser}<g opacity="${fl}">${T(540-g,'#ff2a3a',.7)}${T(540+g,'#2af0ff',.6)}${T(540,'#fff',1)}<rect x="470" y="935" width="140" height="6" fill="#ff2a3a"/><text x="540" y="1080" text-anchor="middle" font-family="Inter" font-weight="900" font-size="128" letter-spacing="4" fill="#fff" stroke="#000" stroke-width="3">LA CALLE</text></g>`}
function endcard(t){const u=t-EVT.endcard;const fade=clamp(u/.6);return `<rect width="${W}" height="${H}" fill="#05070a"/><g opacity="${fade}"><text x="540" y="520" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="38" fill="#9aa4ae">// CINTA 3 — FIN DEL REGISTRO</text><text x="540" y="700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff2a3a" letter-spacing="6">PRÓXIMO CAPÍTULO</text><text x="540" y="800" text-anchor="middle" font-family="Inter" font-weight="900" font-size="70" fill="#fff">CAPÍTULO 4 | EL METRO</text>${u>2?`<text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#ffd54a">¿QUÉ ERAN ESAS LUCES?</text><text x="540" y="1100" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">A) UN TREN</text><text x="540" y="1180" text-anchor="middle" font-family="Inter" font-weight="800" font-size="50" fill="#fff">B) ALGO VIVO</text>`:''}${u>4?`<text x="540" y="1400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="52" fill="#2af0ff">COMENTA TU ELECCIÓN</text><text x="540" y="1480" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42" fill="#fff">SÍGUEME PARA EL CAPÍTULO 4</text>`:''}</g>`}
// ---- operator hand (the person filming)
function opState(t,tgt){const sw=Math.sin(t*1.3)*10+Math.sin(t*3.1)*5;let wx=800+sw,wy=1650+Math.sin(t*1.7)*8,ang=-32,bx=tgt?tgt[0]:560,by=tgt?tgt[1]:900;
 let on=1;if(t>=EVT.dim){on=t<EVT.phone-.7?(Math.sin(t*38)>-.25?1:.15):0}if(t>=EVT.dim+1.5&&t<EVT.phone){wy+=40}
 if(on===0){wy=1700+Math.sin(t*1.7)*8;ang=-18}
 if(t>=EVT.run&&t<EVT.fall){wy+=Math.sin(t*11)*28;wx+=Math.sin(t*5.5)*16}
 if(t>EVT.gstep&&t<EVT.gstep+3)wx+=Math.sin(t*30)*16*Math.exp(-(t-EVT.gstep));
 if(t>=EVT.fall){const u=t-EVT.fall;wx+=u*u*500;wy-=u*500;ang-=u*160;on=Math.sin(t*50)>0?1:0}
 return {wx,wy,ang,sc:3.0,bx,by,on}}
function operatorHand(t,tgt){const S=opState(t,tgt);const st=CAST.tomas;const a=S.ang*Math.PI/180;const ox=S.wx+S.sc*114*Math.sin(a),oy=S.wy-S.sc*114*Math.cos(a);
 let s='';
 const sleeve=limbS([S.wx+330,S.wy+520],[S.wx+10,S.wy+50],170,120);setCTM([1,0,0,1,0,0]);
 s+=grpS(sleeve,st.hood,st,[S.wx-200,S.wy-100,700,800],{ow:5,sd:8});
 s+=`<path d="M${(S.wx-70).toFixed(0)},${(S.wy+30).toFixed(0)} q70,50 140,0" stroke="#15181c" stroke-width="6" fill="none" opacity=".5"/>`;
 setCTM(T(S.wx,S.wy,S.ang,S.sc,S.sc));const hnd=gripS(st,'flash');setCTM([1,0,0,1,0,0]);
 s+=`<g transform="translate(${S.wx.toFixed(1)},${S.wy.toFixed(1)}) rotate(${S.ang}) scale(${S.sc})">${hnd}</g>`;
 if(S.on&&t<EVT.cam+60&&t<EVT.fall+1){const dx=S.bx-ox,dy=S.by-oy,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;s=`<polygon points="${(ox+nx*10).toFixed(0)},${(oy+ny*10).toFixed(0)} ${(S.bx+nx*330).toFixed(0)},${(S.by+ny*330).toFixed(0)} ${(S.bx-nx*330).toFixed(0)},${(S.by-ny*330).toFixed(0)} ${(ox-nx*10).toFixed(0)},${(oy-ny*10).toFixed(0)}" fill="#e8f2ff" fill-opacity="${t<EVT.lobby?.16:0}"/>`+s}
 if(t>=EVT.fall+.35){const u=clamp((t-EVT.fall-.35)/.4);setCTM(T(540,980,-8,8*u+.1,8*u+.1));const hp=handSkin('open',st);setCTM([1,0,0,1,0,0]);s+=`<g transform="translate(540,980) rotate(-8) scale(${(8*u+.1).toFixed(2)})"><g transform="translate(-30,-30)">${hp}</g></g>`}
 return {svg:s,bx:S.bx,by:S.by,on:S.on}}
// ---- scene composition
const w2s=(x,y)=>[CAMM[0]*x+CAMM[2]*y+CAMM[4],CAMM[1]*x+CAMM[3]*y+CAMM[5]];
const sceneOf=t=>t<EVT.lobby?'stairs':t<EVT.street?'lobby':t<EVT.metroIn?'street':'tunnel';
function keyPos(t){const k0=EVT.keys+.35;let p;
 if(t<k0)return null;
 const board=[1504,590];
 if(t<EVT.keys+1.5){const u=sstep((t-k0)/1.1);const w=wristWorld('lucia','R',t);p=[lerp(board[0],w[0],u),lerp(board[1]+20,w[1],u)]}
 else if(t<54.6){p=wristWorld('lucia','R',t)}
 else if(t<55.4){const a=wristWorld('lucia','R',t),b=wristWorld('diego','L',t);const u=sstep((t-54.6)/.8);p=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)]}
 else if(t<EVT.unlock+.15){p=wristWorld('diego','L',t)}
 else return null;
 return p}
function sceneWorld(t,tn){const [cx,cy,z,rot,sk]=camera(t);const blur=process.env.NOBLUR?0:focusBlur(t);const a=shakeAmp(t);const sx=nz(t,1)*a+nz(t,2.3)*a*.5,sy=nz(t+5,1.2)*a*.8+Math.sin(t*(t>=EVT.run?11:6.2))*(Math.min(speedAt(t),4.4)/4.4)*10,sr=nz(t+9,.9)*a*.04;
 const q=quakeLvl(t);CAMM=mul(mul(mul(T(540+sx,960+sy,rot+sr,1,1),[1,0,Math.tan(sk*Math.PI/180),1,0,0]),T(0,0,0,z,z)),T(-cx,-cy));
 BLURV=blur;const sc=sceneOf(t);const Dm=dist(t);
 let w=`<g transform="translate(${(540+sx).toFixed(1)},${(960+sy).toFixed(1)}) rotate(${(rot+sr).toFixed(2)}) skewX(${sk.toFixed(2)}) scale(${z.toFixed(3)}) translate(${-cx.toFixed(1)},${-cy.toFixed(1)})">`;
 const rr=(rot+sr)*Math.PI/180,cs=Math.cos(rr),sn=Math.sin(rr);const cor=[[-540,-960],[540,-960],[540,960],[-540,960]].map(([px,py])=>[cx+(px*cs+py*sn)/z,cy+(-px*sn+py*cs)/z]);const vx0=Math.min(...cor.map(c=>c[0])),vx1=Math.max(...cor.map(c=>c[0])),vy0=Math.min(...cor.map(c=>c[1])),vy1=Math.max(...cor.map(c=>c[1]));
 const kp=keyPos(t);
 let front='',lobbyDeskSvg='',pre='';
 let ambient=.78,tint='#ff1a0a',tintA=.07,rad=900;
 if(sc==='stairs'){const u=sstep((t-EVT.go)/(EVT.arrive-EVT.go));const dx=DX*u,dy=DY*u;const rod=rodAt(t);const lift=t<EVT.lever?0:Math.max(0,1496-rod.tip.y);
  w+=stairs(t,{dx,dy,door:sstep((t-EVT.door1)/.9)});
  w+=`<g transform="translate(${(-dx).toFixed(1)},${(-dy).toFixed(1)})">`+stairsLight(t,{})+`<g transform="translate(${DX},0)">`+stairsLight(t+3,{})+`</g>`+(t<EVT.lever-.5?slab(t,{lift:0,rod:{H:[rodAt(EVT.lever).H[0]-400,FL-60],tip:[1235+200,FL-80]}}):slab(t,{lift,rod:t<EVT.lift+1.8?rod:{H:[rod.tip[0]-420,rod.tip[1]+60-60],tip:rod.tip}}))+`</g>`;
  w+=stairsFloor(t,{});ambient=.55;tint='#ff2410';tintA=.06+.05*Math.sin(t*5)}
 else if(sc==='lobby'){const lb=lobby(t,{keysOn:t<EVT.keys+.35,scratch:clamp((t-EVT.scratch)/6)*(t<EVT.unlock?1:0)});w+=lb.back;lobbyDeskSvg=lobbyDesk(t,{});
  w+=lobbyFloor(t,{});
  const pad=sstep((t-EVT.unlock)/.45),fall=sstep((t-EVT.unlock-.3)/.7);const doorsU=sstep((t-EVT.doorsOpen)/1.5);
  w+=entryDoors(t,{pad,chainFall:fall,doorsU,chainShake:t>EVT.unlock-3&&t<EVT.unlock?1:0});
  ambient=.55;tint='#ff7a2a';tintA=.08+.04*Math.sin(t*7)+.15*doorsU}
 else if(sc==='street'){w+=street(t,Dm,cx,cy,q);ambient=.2;tint='#ff6a1a';tintA=.1+.05*Math.sin(t*6)}
 else{const o={t0:EVT.metroIn,t1:EVT.fall};w+=tunnel(t,dist(t),o);ambient=.5;tint='#2affd0';tintA=.05}
 w+=dust(t,q);
 const order=t<EVT.lift+3?['sofi','lucia','marta','diego','beto']:['sofi','lucia','beto','marta','diego'];
 const lucDesk=(sc==='lobby')&&xOfLucia(t);
 order.forEach(k=>{const x=xOf(k,t);if(x+700<vx0||x-700>vx1||1580<vy0||200>vy1)return;if(k==='lucia'&&lucDesk){w+=charSVG(k,t,q,tn)}});
 if(lobbyDeskSvg)w+=lobbyDeskSvg;
 order.forEach(k=>{const x=xOf(k,t);if(x+700<vx0||x-700>vx1||1580<vy0||200>vy1)return;if(k==='lucia'&&lucDesk)return;w+=charSVG(k,t,q,tn)});
 // keys in hand / board glow
 if(kp)w+=keyRingLoose(kp[0],kp[1]+26,t,Math.sin(t*14)*8);
 // phone light (Marta) while on the stairs
 let lightC=null;
 if(t>=EVT.phone&&t<EVT.arrive+2.5&&sc==='stairs'){const ph=wristWorld('marta','R',t);const gl=sstep((t-EVT.phone)/.5);lightC=ph;w+=`<polygon points="${ph[0]},${ph[1]-20} ${ph[0]-460},${FL} ${ph[0]+120},${FL}" fill="#e6f4ff" fill-opacity="${(.2*gl).toFixed(2)}"/><circle cx="${ph[0]}" cy="${ph[1]}" r="520" fill="url(#phoneG)" fill-opacity="${(.55*gl).toFixed(2)}"/><ellipse cx="${ph[0]-200}" cy="${FL+10}" rx="420" ry="40" fill="#e6f4ff" fill-opacity="${(.3*gl).toFixed(2)}"/>`}
 // helicopter spotlight on the group
 if(sc==='street'&&t>EVT.heli+.4&&t<EVT.gstep+1)w+=`<ellipse cx="1250" cy="1500" rx="900" ry="140" fill="#f4f9ff" fill-opacity="${(.4*clamp((t-EVT.heli-.4)/.6)).toFixed(2)}"/>`;
 w+=`</g>`;
 // light / darkness overlay
 let tgt;if(t<15.5)tgt=[1500,1350];else if(t<Ls('b4'))tgt=[2200,1150];else tgt=[1250,900];
 const tw=w2s(tgt[0],tgt[1]);const op=operatorHand(t,[tw[0],tw[1]]);
 let cxL=op.bx,cyL=op.by,aE=ambient,rr2=rad;const flashOn=op.on&&sc==='stairs'&&t<EVT.phone;
 if(sc==='stairs'&&!flashOn){if(lightC){const p=w2s(lightC[0],lightC[1]);cxL=p[0];cyL=p[1];rr2=1000;aE=.7}else{cxL=540;cyL=960;aE=.8}}
 if(sc==="stairs"&&flashOn&&t<EVT.cam){aE=.5}
 if(sc!=='stairs'){cxL=540;cyL=980;rr2=1200}
 w+=`<defs><radialGradient id="dk" gradientUnits="userSpaceOnUse" cx="${cxL.toFixed(0)}" cy="${cyL.toFixed(0)}" r="${rr2}"><stop offset="0" stop-color="#02040a" stop-opacity="0"/><stop offset=".3" stop-color="#02040a" stop-opacity="${(aE*.12).toFixed(2)}"/><stop offset=".65" stop-color="#02040a" stop-opacity="${(aE*.7).toFixed(2)}"/><stop offset="1" stop-color="#02040a" stop-opacity="${aE.toFixed(2)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dk)"/>`;
 w+=`<rect width="${W}" height="${H}" fill="${tint}" fill-opacity="${tintA.toFixed(3)}"/>`;
 if(sc==='street'){const ph=Math.sin(t*9)>0;w+=`<rect x="0" y="0" width="${W}" height="${H}" fill="${ph?'#ff2a1a':'#2a6aff'}" fill-opacity=".06"/>`}
 w+=op.svg;
 let fl=0;for(const [ft,k] of [[EVT.lift,.35],[EVT.gstep,.7],[EVT.fall,.8],[EVT.doorsOpen,.3],[EVT.metroIn,.25]]){if(t>=ft&&t<ft+.5)fl=Math.max(fl,Math.exp(-(t-ft)/.12)*k)}
 w+=`<rect width="${W}" height="${H}" fill="#fff0d8" opacity="${fl.toFixed(2)}"/>`;
 if(t>EVT.heli+.6&&t<EVT.gstep)w+=`<rect width="${W}" height="${H}" fill="#fff" opacity="${(.12*Math.sin((t-EVT.heli)*2)**2).toFixed(2)}"/>`;
 return w}
function xOfLucia(t){const x=xOf('lucia',t);return x>1200&&x<1720&&t>=Ls('b10')-1&&t<54.3}

function fixOp(s){return s.replace(/<([a-zA-Z]+)((?:[^>"]|"[^"]*")*?) opacity="([^"]*)"((?:[^>"]|"[^"]*")*)>/g,(m,tag,a,o,b)=>{let self='';if(b.endsWith('/')){b=b.slice(0,-1);self='/'}const all=a+b;const hasStroke=/ stroke="/.test(all)&&!/ stroke="none"/.test(all);const hasFill=!/ fill="none"/.test(all);let ex;if(tag==='g'||tag==='text')ex=`fill-opacity="${o}" stroke-opacity="${o}"`;else{ex='';if(hasFill)ex+=`fill-opacity="${o}" `;if(hasStroke)ex+=`stroke-opacity="${o}"`;if(!ex)ex=`fill-opacity="${o}"`}return `<${tag}${a}${b} ${ex}${self}>`})}
export function frame(tn,mode){BLURV=0;const t=inv(tn);let inner,hudOn=false;
 if(t<4.6)inner=sceneWorld(t,tn);else if(t<4.7)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else if(t<7.1)inner=title(t);else if(t<EVT.cam)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 else if(t<EVT.black){inner=sceneWorld(t,tn);hudOn=true}
 else if(t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;else inner=endcard(t);
 let g=0;if(t>=EVT.cam&&t<EVT.cam+.25)g=.6;if(t>=EVT.fall-.1&&t<EVT.black)g=clamp((t-EVT.fall+.1)/1.2)*.9+.2;if(t<.35)g=.7;if(t>=EVT.metroIn&&t<EVT.metroIn+.25)g=.5;if(t>=EVT.gstep&&t<EVT.gstep+.3)g=.5;
 if(t>=EVT.black-1.2&&t<EVT.endcard)inner=`<rect width="${W}" height="${H}" fill="#000"/>`;
 let out=g>0?glitch(inner,t,g):inner;
 const ov=(hudOn&&!(t>=EVT.black-1.2))?hud(tn)+caption(tn):((t<4.6||(t>=4.7&&t<EVT.cam))?caption(tn):'');
 const head=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
 const dfs=defsScene+defsRooms+defs(CAST.beto)+`<defs><radialGradient id="phoneG"><stop offset="0" stop-color="#eaf6ff" stop-opacity=".95"/><stop offset=".5" stop-color="#bfe0ff" stop-opacity=".3"/><stop offset="1" stop-color="#bfe0ff" stop-opacity="0"/></radialGradient></defs>`;
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
