import * as THREE from 'three';
import {makeChar2} from './char3dm.js';
import {mkHand,setHandPose,skinM,stdm,CFG} from './char3d.js';
import {buildBunker} from './bunker3d.js';
import {loadMocap,makeSource,sample,CLIPS} from './mocap.js';
const Q=new URLSearchParams(location.search);const OW=+(Q.get('w')||720),OH=Math.round(OW*16/9);const K=OW/1080;
const ST=await (await fetch('ep5_state.json')).json();const EV=ST.ev,S0=ST.start,DUR=ST.durs,FPS=ST.fps;
const Ls=id=>S0[id],Le=id=>S0[id]+DUR[id];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};const lerp=(a,b,t)=>a+(b-a)*t;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(OW,OH);renderer.shadowMap.enabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
const comp=document.createElement('canvas');comp.width=OW;comp.height=OH;document.body.appendChild(comp);const g2=comp.getContext('2d');
const scene=new THREE.Scene();const B=buildBunker(scene);
const camera=new THREE.PerspectiveCamera(50,OW/OH,.05,90);scene.add(camera);
const CL=['idle-a','idle-subtle','idle-hurt','idle-talking','idle-listening','idle-foldarms','walk-injured','walk-cautious','walk','rifle-idle','rifle-walk','push','pray','reject','defend','tired-hunched','crouch-idle','interact','confused','hit-chest','open-door','jog','sprint','head-nod','knock','pistol-aim-neutral'];
await loadMocap(CL);
// ---------- actors
const ids=['beto','diego','sofi','lucia','marta','sgt','sol2','sol3'];const SOLD=['sgt','sol2','sol3'];
const A={};for(const id of ids){const ch=makeChar2(id);scene.add(ch.root);const s=makeSource(scene);A[id]={id,ch,s,yaw:0,kid:id==='sofi'}}
// helmets
for(const id of SOLD){const hg=A[id].ch.headG;const hm=new THREE.Mesh(new THREE.SphereGeometry(.16,24,14,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:0x4a5532,roughness:.8}));hm.position.set(0,.06,0);hm.scale.set(1.05,1,1.1);hm.castShadow=true;hg.add(hm);const br=new THREE.Mesh(new THREE.TorusGeometry(.165,.012,8,30),new THREE.MeshStandardMaterial({color:0x2a3220}));br.rotation.x=Math.PI/2;br.position.set(0,.065,0);br.scale.set(1.05,1.1,1);hg.add(br)}
// rifles
function mkRifle(){const g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0x14171a,roughness:.5,metalness:.6});const body=new THREE.Mesh(new THREE.BoxGeometry(.07,.08,.8),m);body.position.z=-.05;g.add(body);const stock=new THREE.Mesh(new THREE.BoxGeometry(.06,.12,.26),new THREE.MeshStandardMaterial({color:0x2a2e30}));stock.position.set(0,-.02,.45);g.add(stock);const mag=new THREE.Mesh(new THREE.BoxGeometry(.05,.2,.08),m);mag.position.set(0,-.14,.05);mag.rotation.x=.2;g.add(mag);const bar=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.35,8),m);bar.rotation.x=Math.PI/2;bar.position.z=-.55;g.add(bar);const sc=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.2),m);sc.position.set(0,.07,-.05);g.add(sc);g.traverse(o=>o.castShadow=true);scene.add(g);return g}
const RIF={};for(const id of SOLD)RIF[id]=mkRifle();
const laserM=new THREE.LineBasicMaterial({color:0xff2a2a,transparent:true,opacity:.8});const LAS={};for(const id of SOLD){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(),V(0,0,1)]),laserM);scene.add(l);LAS[id]=l;}
const dotM=new THREE.MeshBasicMaterial({color:0xff2a2a});const DOT={};for(const id of SOLD){const d=new THREE.Mesh(new THREE.SphereGeometry(.025),dotM);scene.add(d);DOT[id]=d}
// ---------- choreography
const WK=Ls('e4')+.3,WK2=WK+4.8;
const track=(keys,t)=>{if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<keys[i][0]){const a=keys[i-1],b=keys[i];return lerp(a[1],b[1],sstep((t-a[0])/(b[0]-a[0])))}}return keys[keys.length-1][1]};
const FORM={lucia:-5.3,sofi:-4.5,diego:-3.8,beto:-2.9,marta:-2.1};const FIN={lucia:2.9,diego:3.9,beto:5.0,sofi:6.1,marta:6.9};
const GZ={lucia:.2,sofi:.7,diego:.0,beto:.2,marta:-.1};
function xOf(id,t){
 if(id==='sgt')return track([[0,-.2],[EV.check,-.2],[EV.check+2,-1.3],[EV.check+5,-1.3],[EV.check+6.5,-.2],[WK,-.2],[WK2,8.7]],t);
 if(id==='sol2')return track([[0,1.0],[WK,1.0],[WK+2,.2]],t);
 if(id==='sol3')return track([[0,2.0],[WK-.2,2.0],[EV.close-.6,-5.0],[EV.close+3,-5.0],[EV.knock,-5.0],[EV.knock+1.4,-4.2]],t);
 let x=FORM[id];if(t>=WK)x=lerp(FORM[id],FIN[id],sstep((t-WK)/(WK2-WK)));
 if(id==='marta'&&t>=Ls('e10')-.5)x=lerp(FIN.marta,6.55,sstep((t-Ls('e10')+.5)/1.2));
 if(id==='sofi'&&t>=Ls('e10')-.5)x=lerp(FIN.sofi,6.05,sstep((t-Ls('e10')+.5)/1.2));
 return x}
function zOf(id,t){if(SOLD.includes(id))return id==='sgt'&&t>=WK2?-.6:.5+(id==='sol3'?.2:0);return GZ[id]}
const vel=(id,t)=>(xOf(id,t+.1)-xOf(id,t-.1))/.2;
// facing (yaw radians; 0 = toward camera, +pi/2 = facing +x)
function faceTarget(id,t){const v=vel(id,t);if(Math.abs(v)>.12)return Math.sign(v)*1.45;
 const x=xOf(id,t);const sp=speakerAt(t);const SO=SOLD.includes(id);
 if(SO){if(t<Ls('e4'))return -1.1;if(id==='sol3'&&t>=EV.close-.8&&t<EV.close+3)return -1.2;if(id==='sol3'&&t>=EV.knock-.3)return -1.2;if(id==='sgt'){if(t>=EV.map-.5&&t<Le('e13'))return .9;if(t>=EV.place-1&&t<EV.place+2)return -.5}return -.5}
 if(t<WK){return t>=EV.check&&t<EV.check+6?.5:.65}
 if(t>=Ls('e10')-.3&&t<Le('e10')+.9){return id==='marta'?-1.2:id==='sofi'?1.2:.2}
 if(t>=EV.radio&&t<Ls('e12'))return .9;if(t>=EV.map-.3&&t<Le('e13'))return .9;if(t>=EV.knock)return -1.0;
 if(sp&&sp.who!=='Tomas'&&sp.who!=='Radio'){const k=sp.who==='Sargento'?'sgt':sp.who.toLowerCase().replace('í','i');if(A[k]&&k!==id)return clamp((xOf(k,t)-x)/4,-1,1)*1.1}
 return .35}
function yawOf(id,t){let a=0,w=0;for(let k=0;k<12;k++){const wk=Math.exp(-k/3.5);a+=faceTarget(id,t-k*.08)*wk;w+=wk}return a/w}
const NAMEKEY={Beto:'beto',Diego:'diego',Marta:'marta',Lucia:'lucia',Sofi:'sofi',Sargento:'sgt'};
const LINES=ST.lines.map(l=>({...l,dur:l.env.length/FPS}));
function speakerAt(t){return LINES.find(l=>t>=l.t0&&t<l.t0+l.dur+.15)}
// clip schedules [t,clip,speed]
const talkSeg=(id,l)=>[[Ls(l)-.1,'idle-talking'],[Le(l)+.3,'idle-a']];
const SCH={
 beto:[[0,'idle-hurt'],[WK,'walk-injured'],[WK2,'idle-hurt'],[Ls('e14')-.1,'reject'],[Le('e14')+.4,'idle-hurt'],[EV.knock-.2,'defend']],
 diego:[[0,'idle-a'],[Ls('e1')-.1,'idle-talking'],[Le('e1')+.3,'idle-a'],[WK,'walk-cautious'],[WK2,'idle-listening'],[EV.knock-.2,'defend'],[Ls('e17')-.2,'defend']],
 sofi:[[0,'idle-a'],[Ls('e4'),'idle-a'],[WK,'walk-cautious'],[WK2,'idle-subtle'],[Ls('e7')-.1,'tired-hunched'],[Ls('e10')-.3,'pray'],[Le('e10')+1.2,'idle-subtle'],[EV.knock-.2,'crouch-idle']],
 lucia:[[0,'idle-a'],[WK,'walk-cautious'],[WK2,'idle-listening'],[Ls('e6')-.1,'idle-talking'],[Le('e6')+.4,'idle-listening'],[EV.knock-.2,'defend']],
 marta:[[0,'idle-a'],[Ls('e3')-.1,'idle-talking'],[Le('e3')+.3,'idle-a'],[WK,'walk-cautious'],[WK2,'idle-listening'],[Ls('e10')-.2,'idle-talking'],[Le('e10')+.8,'idle-subtle'],[EV.knock-.2,'defend']],
 sgt:[[0,'rifle-idle'],[Ls('e2')-.1,'idle-talking'],[Le('e2')+.3,'rifle-idle'],[Ls('e4')-.1,'idle-talking'],[Le('e4')+.2,'idle-a'],[WK,'walk'],[WK2,'idle-a'],[Ls('e8')-.1,'idle-talking'],[Le('e8')+.3,'idle-a'],[EV.place-.4,'interact'],[EV.place+1.8,'idle-a'],[Ls('e12')-.1,'idle-talking'],[Le('e13')+.3,'idle-a'],[Ls('e15')-.1,'idle-talking'],[Le('e15')+.3,'idle-a'],[Ls('e17')-.1,'idle-talking']],
 sol2:[[0,'rifle-idle'],[Ls('e4')-.2,'idle-a'],[EV.knock-.2,'rifle-idle']],
 sol3:[[0,'rifle-idle'],[Ls('e4')-.2,'idle-a'],[WK-.2,'rifle-walk'],[EV.close-.8,'push'],[EV.close+1.8,'idle-a'],[EV.knock-.4,'rifle-idle']]};
const clipSeg=(id,t)=>{const L=SCH[id];let i=0;while(i+1<L.length&&L[i+1][0]<=t)i++;return {i,seg:L[i],prev:i>0?L[i-1]:null}};
function poseFor(a,t){const {i,seg,prev}=clipSeg(a.id,t);const smp=(name,tm)=>{const s=a.s;const clip=CLIPS[name];s.mx.stopAllAction();if(!s.cache)s.cache={};const act=s.cache[name]||(s.cache[name]=s.mx.clipAction(clip));act.reset().play();s.mx.setTime(((tm%clip.duration)+clip.duration)%clip.duration);return sample(s,a.kid)};
 const cur=smp(seg[1],(t-seg[0])*(a.id==='sofi'?1:1)+i*.37);
 if(prev&&t-seg[0]<.35){const pv=smp(prev[1],(t-prev[0])+.37*(i-1));return blend(pv,cur,sstep((t-seg[0])/.35))}return cur}
function blend(a,b,u){const L=(x,y)=>x.clone().lerp(y,u),Qs=(x,y)=>x.clone().slerp(y,u);return {wr:a.wr.map((v,i)=>L(v,b.wr[i])),el:a.el.map((v,i)=>L(v,b.el[i])),an:a.an.map((v,i)=>L(v,b.an[i])),kn:a.kn.map((v,i)=>L(v,b.kn[i])),fingers:a.fingers.map((f,i)=>({f:f.f.map((r,k)=>r.map((v,j)=>lerp(v,b.fingers[i].f[k][j],u))),th:f.th.map((v,k)=>lerp(v,b.fingers[i].th[k],u))})),pelvisQ:Qs(a.pelvisQ,b.pelvisQ),spineQ:Qs(a.spineQ,b.spineQ),chestQ:Qs(a.chestQ,b.chestQ),headQ:Qs(a.headQ,b.headQ),dy:lerp(a.dy,b.dy,u),gx:lerp(a.gx,b.gx,u),gz:lerp(a.gz,b.gz,u)}}
// ---------- expressions per line
const A_=(a,b,c,d,e,g)=>({beto:a,diego:b,sofi:c,lucia:d,marta:e,sgt:g||'neutral',sol2:'neutral',sol3:'neutral'});
const EXL={e0:A_('fear','fear','fear','fear','fear','scream'),e1:A_('fear','fear','sad','fear','fear','annoyed'),e2:A_('worry','worry','fear','worry','worry'),e3:A_('sad','worry','fear','worry','worry'),e4:A_('worry','worry','fear','worry','worry','annoyed'),e5:A_('worry','worry','fear','worry','worry'),e6:A_('worry','worry','sad','tender','worry'),e7:A_('sad','worry','sad','sad','tender'),e8:A_('sad','sad','sad','sad','tender','sad'),e9:A_('sad','sad','scream','sad','sad','sad'),e10:A_('sad','sad','sad','sad','tender','sad'),e11:A_('worry','worry','sad','worry','worry'),e12:A_('worry','worry','sad','worry','worry'),e13:A_('shock','shock','sad','shock','shock'),e14:A_('annoyed','shock','sad','shock','worry'),e15:A_('annoyed','fear','fear','fear','fear','annoyed'),e16:A_('fear','fear','fear','fear','fear'),e17:A_('scream','scream','scream','scream','scream','scream')};
function exprOf(id,t){let ex=SOLD.includes(id)?'neutral':'worry';if(t<Ls('e0'))return'fear';for(const l of LINES){const spk=(NAMEKEY[l.who]===id);const t0=l.t0+(spk?0:.25);if(t<t0)break;ex=EXL[l.id][id]||ex}return ex}
const blinkAt=(seed,t)=>{const per=3.1;const k=Math.floor(t/per+seed);const jit=((Math.sin(k*12.9898+seed*78.2)*43758.5453)%1+1)%1;const t0=(k-seed)*per+jit*1.2;const d=t-t0;return d>=0&&d<.14?Math.sin(d/.14*Math.PI):0};
// ---------- operator hand (the one filming)
const rig=new THREE.Group();camera.add(rig);rig.position.set(.2,-.26,-.55);rig.rotation.set(.1,-.25,.12);
const skinOp=skinM(0xe0a98a);const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,.5,16),new THREE.MeshStandardMaterial({color:0x55606e,roughness:.9}));sleeve.rotation.x=1.1;sleeve.position.set(.04,-.2,.25);rig.add(sleeve);
const opH=mkHand(skinOp,1);opH.g.scale.setScalar(1.35);opH.g.rotation.set(-1.1,0,0);opH.g.position.set(0,0,0);rig.add(opH.g);setHandPose(opH,'grip',1);
const fl=new THREE.Mesh(new THREE.CylinderGeometry(.028,.034,.2,16),new THREE.MeshStandardMaterial({color:0x2a2e34,metalness:.7,roughness:.4}));fl.rotation.x=Math.PI/2;fl.position.set(0,.02,-.12);rig.add(fl);const lens=new THREE.Mesh(new THREE.CircleGeometry(.03,16),new THREE.MeshBasicMaterial({color:0xfff6d8}));lens.position.set(0,.02,-.225);rig.add(lens);
const spot=new THREE.SpotLight(0xe8f2ff,0,22,.42,.65,1.3);spot.castShadow=false;camera.add(spot);spot.position.set(.2,-.22,-.7);const spotT=new THREE.Object3D();camera.add(spotT);spotT.position.set(0,0,-8);spot.target=spotT;
const fill=new THREE.PointLight(0xdfeaff,2.4,10,1.5);camera.add(fill);fill.position.set(0,.3,.2);
function flashOn(t){if(t<Ls('e2')+2)return 1;if(t>=EV.knock-1&&t<EV.alarm)return Math.sin(t*30)>-.2?1:.15;return 0}
// ---------- camera
const SH=[[0,-2.0,1.3,9.5,58,0,'s'],[1.2,-3.3,1.55,4.6,42,-2,'w'],[3.0,-1.8,1.3,10,58,0,'w'],[7.4,-1.8,1.3,10,58,0,'s'],
 [Ls('e1')-.1,-3.8,1.5,4.3,40,2,'n'],[EV.check-.2,-3.3,1.3,8.5,52,-2,'n'],[EV.check+1.5,-4.4,1.3,5.2,44,2,'s'],[Ls('e3')-.1,-2.2,1.5,4.3,40,-2,'n'],
 [Ls('e4')-.1,-.4,1.5,4.6,42,2,'n'],[EV.close-1.2,-6.0,1.5,7.5,52,-2,'w'],[WK-1.6,-.5,1.3,11,58,0,'w'],[WK+1.5,3.2,1.3,10,56,0,'s'],
 [Ls('e5')-.2,10.4,3.4,6.8,44,3,'z'],[Ls('e6')-.2,3.4,1.4,7,48,-2,'n'],[Ls('e6')+1.2,2.9,1.45,4.4,38,2,'n'],[Ls('e7')-.1,6.1,1.2,4.2,38,2,'n'],
 [Ls('e8')-.1,8.8,1.5,4.6,44,-2,'n'],[EV.place-.5,9.8,1.2,3.6,48,0,'s'],[Ls('e9')-.1,6.1,1.2,3.9,36,3,'w'],[Ls('e10')-.1,6.3,1.3,4.6,38,-1,'n'],
 [EV.radio-.2,9.9,1.2,3.3,36,0,'s'],[Ls('e12')-.1,9.4,1.7,6.8,46,-2,'n'],[EV.map-.2,10.2,1.8,5.2,46,0,'s'],[Ls('e13')-.1,8.8,1.5,4.4,42,2,'n'],
 [Ls('e14')-.1,5.1,1.4,4.4,40,-2,'n'],[Ls('e15')-.1,8.8,1.5,3.9,38,1,'s'],[EV.knock-.3,-6.0,1.5,7.5,52,-3,'w'],[Ls('e16')+1.6,3.0,1.4,11.5,58,3,'w'],[Ls('e17')-.1,8.2,1.5,5.2,46,0,'w']];
SH.sort((a,b)=>a[0]-b[0]);
const MODE={s:[3.2,.92],n:[8,.72],w:[16,.5],z:[12,.6]};
function stepResp(tau,w,z){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z/Math.sqrt(1-z*z))*Math.sin(wd*tau))}
function camState(t){const ch=s=>[s[1],s[2],s[3],s[4],s[5]];let c=ch(SH[0]);for(let i=1;i<SH.length;i++){const sh=SH[i];const [w,z]=MODE[sh[6]];const gg=stepResp(t-sh[0]-.28,w,z);if(gg===0)continue;const A_=ch(sh),B_=ch(SH[i-1]);for(let k=0;k<5;k++)c[k]+=(A_[k]-B_[k])*gg}return c}
const nz=(t,s)=>Math.sin(t*1.7*s+1)*.5+Math.sin(t*3.9*s+2)*.3+Math.sin(t*7.3*s+3)*.2;
function shakeAmp(t){let a=1+.3*clamp((t-EV.cam)/60);if(t<3)a+=1.2;if(t>EV.knock&&t<EV.black)a+=1.3;for(const [ti,m] of [[EV.close,4],[EV.knock+.4,5],[EV.knock+1.6,6],[EV.knock+3,8],[EV.alarm,3]])if(t>ti)a+=m*Math.exp(-(t-ti)/.5);return a}
// ---------- overlays
function wrap(txt,max){const w=txt.split(' ');const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){out.push(cur.trim());cur=x}else cur+=' '+x}out.push(cur.trim());return out}
const NAMES={Tomas:'TOMÁS (cámara)',Beto:'BETO',Diego:'DIEGO',Marta:'MARTA',Lucia:'LUCÍA',Sofi:'SOFI',Sargento:'SARGENTO',Radio:'RADIO'};
function txt(g,s,x,y,size,fill,stroke,sw=10,al='center',font='Inter, "DejaVu Sans", Arial',weight=800,ls=0){g.font=`${weight} ${size}px ${font}`;g.textAlign=al;g.lineJoin='round';if(ls)g.letterSpacing=ls+'px';if(stroke){g.strokeStyle=stroke;g.lineWidth=sw;g.strokeText(s,x,y)}g.fillStyle=fill;g.fillText(s,x,y);if(ls)g.letterSpacing='0px'}
function hud(g,t){const el=Math.max(0,t-EV.cam);const hh=String(Math.floor(el/3600)).padStart(2,'0'),mm=String(Math.floor(el/60)%60).padStart(2,'0'),ss=String(Math.floor(el)%60).padStart(2,'0');const on=Math.floor(t*1.6)%2===0;
 g.fillStyle=on?'#ff2222':'rgba(255,34,34,.12)';g.beginPath();g.arc(86,270,15,0,6.28);g.fill();txt(g,'REC',116,282,38,'#fff','#000',5,'left','DejaVu Sans Mono',700);txt(g,`${hh}:${mm}:${ss}`,640,282,36,'#fff','#000',5,'left','DejaVu Sans Mono',400);txt(g,'SEP 18 2025  00:12',70,1575,30,'#fff','#000',5,'left','DejaVu Sans Mono',400);txt(g,'SP ▮▮▮▯',700,1575,30,'#fff','#000',5,'left','DejaVu Sans Mono',400);
 g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=4;g.beginPath();for(const [x,y,dx,dy] of [[50,236,1,1],[960,236,-1,1],[50,1600,1,-1],[960,1600,-1,-1]]){g.moveTo(x,y+dy*60);g.lineTo(x,y);g.lineTo(x+dx*60,y)}g.stroke()}
function caption(g,t){const sp=speakerAt(t);if(!sp)return;const lines=wrap(sp.text.replace(/\.\.\./g,'…'),22);const fs=lines.length>2?50:56;const y0=1440-(lines.length-1)*34;txt(g,NAMES[sp.who]||sp.who,520,y0-fs-14,30,'#ffd54a','#000',7,'center','Inter, "DejaVu Sans", Arial',800,4);lines.forEach((l,i)=>txt(g,l,520,y0+i*(fs+10),fs,'#fff','#000',10))}
function title(g,t){const u=t-4.7;g.fillStyle='#05070a';g.fillRect(0,0,1080,1920);txt(g,'CLOVERFIELD',540,300,32,'rgba(255,255,255,.75)',null,0,'center','Inter, "DejaVu Sans", Arial',700,16);const fl=u<.4?(Math.sin(u*90)>0?1:.2):1;g.globalAlpha=fl;const gl=(u>.3&&u<.55)||u>2.1?10:2;txt(g,'CAPÍTULO 5',540-gl,900,64,'rgba(255,42,58,.7)',null,0,'center','Inter, "DejaVu Sans", Arial',900,14);txt(g,'CAPÍTULO 5',540+gl,900,64,'rgba(42,240,255,.6)',null,0,'center','Inter, "DejaVu Sans", Arial',900,14);txt(g,'CAPÍTULO 5',540,900,64,'#fff',null,0,'center','Inter, "DejaVu Sans", Arial',900,14);g.fillStyle='#ff2a3a';g.fillRect(470,935,140,6);txt(g,'LOS SOLDADOS',540,1080,96,'#fff','#000',3,'center','Inter, "DejaVu Sans", Arial',900,2);g.globalAlpha=1}
function endcard(g,t){const u=t-EV.endcard;g.fillStyle='#05070a';g.fillRect(0,0,1080,1920);g.globalAlpha=clamp(u/.6);const F='Inter, "DejaVu Sans", Arial';txt(g,'// CINTA 5 — FIN DEL REGISTRO',540,520,38,'#9aa4ae',null,0,'center','DejaVu Sans Mono',400);txt(g,'PRÓXIMO CAPÍTULO',540,700,58,'#ff2a3a',null,0,'center',F,900,6);txt(g,'CAPÍTULO 6 | LA DECISIÓN',540,800,70,'#fff',null,0,'center',F,900);if(u>2){txt(g,'¿QUIÉN SUBE AL HELICÓPTERO?',540,1000,50,'#ffd54a',null,0,'center',F,800);txt(g,'A) LOS MÁS JÓVENES',540,1100,50,'#fff',null,0,'center',F,800);txt(g,'B) LOS MÁS FUERTES',540,1180,50,'#fff',null,0,'center',F,800)}if(u>4){txt(g,'COMENTA TU ELECCIÓN',540,1400,52,'#2af0ff',null,0,'center',F,900);txt(g,'SÍGUEME PARA EL CAPÍTULO 6',540,1480,42,'#fff',null,0,'center',F,900)}g.globalAlpha=1}
function glitch(g,amt,t){let s=Math.floor(t*30)*7919;const r=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;const cols=['#ff2a3a','#2af0ff','#ffffff','#ff2a3a'];for(let i=0;i<3+amt*6;i++){const y=Math.floor(r()*1860),h=6+Math.floor(r()*40*amt+4);g.fillStyle=cols[i%4];g.globalAlpha=.15+r()*.35;g.fillRect(0,y,1080,h)}g.globalAlpha=1}
// ---------- main frame
const tmpV=V(),tmpV2=V();
function render3D(t){
 // actors
 const doorU=t<Ls('e4')?0:sstep((t-EV.close+.8)/1.2);const dent=t>=EV.knock?clamp((t-EV.knock)/5):0;
 for(const id of ids){const a=A[id];const p=poseFor(a,t);const x=xOf(id,t),z=zOf(id,t);const yaw=yawOf(id,t);a.yaw=yaw;const ex=exprOf(id,t);const sp=speakerAt(t);const spk=sp&&NAMEKEY[sp.who]===id;const talk=spk?clamp((sp.env[Math.floor((t-sp.t0)*FPS)]||0)*1.7):0;
  let hands=[{hand:'relax'},{hand:'relax'}];
  // surrender: arms up with open hands until "pasen"
  if(!SOLD.includes(id)&&t<Ls('e4')+.2){const w=1-sstep((t-Ls('e4')+.1)/.6);const SHs=[V(-.215,1.38,0),V(.215,1.38,0)];for(let i=0;i<2;i++){const sd=i?1:-1;const wrT=SHs[i].clone().add(V(sd*.12,.40+(id==='beto'?-.05:0),.12)),elT=SHs[i].clone().add(V(sd*.27,.17,.06));p.wr[i].lerp(wrT,w);p.el[i].lerp(elT,w);for(const f of p.fingers[i].f)for(let j=0;j<3;j++)f[j]=lerp(f[j],.08,w);p.fingers[i].th[0]=lerp(p.fingers[i].th[0],.1,w);p.fingers[i].th[1]=lerp(p.fingers[i].th[1],.1,w)}}
  a.ch.updateM({...p,x,z,yaw,ex,hands,fingers:p.fingers,st:{blink:blinkAt(ids.indexOf(id)*.37,t),talk,look:[clamp(Math.sin(yaw)*.9,-1,1),.1]}})}
 // rifles + lasers
 for(const id of SOLD){const a=A[id];const aim=t<Ls('e4')-.3||(id==='sol3'&&t>=EV.knock-.4)?1:0;const r=RIF[id];const root=a.ch.root;const yaw=a.yaw;
  if(aim){const hr=a.ch.hands[1].g,hl=a.ch.hands[0].g;hr.getWorldPosition(tmpV);hl.getWorldPosition(tmpV2);const dir=tmpV2.clone().sub(tmpV).normalize();r.position.copy(tmpV).add(dir.clone().multiplyScalar(-.1));r.quaternion.setFromUnitVectors(V(0,0,-1),dir)}
  else{r.position.set(root.position.x+Math.sin(yaw)*.2+.05,.95,root.position.z+Math.cos(yaw)*.2);r.rotation.set(1.1,yaw+Math.PI,.2)}
  const laserOn=t<Ls('e4')-.3||(id==='sol3'&&t>=EV.knock-.4&&t<EV.alarm);LAS[id].visible=DOT[id].visible=laserOn;
  if(laserOn){const tg=t<Ls('e4')?(id==='sgt'?A.diego:id==='sol2'?A.marta:A.lucia):null;const from=V(r.position.x,r.position.y+.02,r.position.z).add(V(0,0,-.5).applyQuaternion(r.quaternion));const to=tg?V(xOf(tg.id,t)+Math.sin(t*3)*.03,1.55,zOf(tg.id,t)):V(-6.2,1.2,-2.2);LAS[id].geometry.setFromPoints([from,to]);DOT[id].position.copy(to)}}
 // door
 B.door.rotation.y=-(1-doorU)*1.35*(1);B.doorLight.intensity=22*(1-doorU)+2;B.doorGlow.visible=doorU<.9;B.doorGlow.material.color.setScalar(1-doorU*.9);B.doorLamp.material.color.set(doorU>.9?0xff2a1a:0x3dff7a);
 B.dents.forEach((d,i)=>{const k=clamp(dent*1.3-i*.25);d.scale.setScalar(k)});
 if(t>=EV.knock){const hit=[EV.knock+.4,EV.knock+1.6,EV.knock+3].reduce((s,h)=>s+(t>h&&t<h+.4?Math.exp(-(t-h)*9):0),0);B.door.position.z=-2.2+hit*-.08}
 // lights & props
 for(const f of B.flick){f.light.intensity=f.base*(Math.sin(t*23+f.x)>-.55?1:.2)*(t>EV.alarm?.5:1)}
 const al=t>=EV.alarm?clamp((t-EV.alarm)/.5):0;for(const a of B.alarms){a.L.intensity=al*34*(.5+.5*Math.sin(t*8+a.x));a.b.material.color.set(al>0?0xff2a1a:0x4a1410)}
 B.camLed.material.color.set(Math.sin(t*5)>0?0xff2a1a:0x4a0e0a);B.camLight.intensity=Math.sin(t*5)>0?3:0;
 const ron=t>=EV.radio&&t<Le('e11')+.6;B.radioScr.material.color.set(ron?(Math.sin(t*14)>0?0x7fff9f:0x2a6a3a):0x0a120a);B.radioLed.material.color.set(ron&&Math.sin(t*14)>0?0xff2a1a:0x4a1410);
 B.items.visible=t>=EV.place;B.items.position.y=.98+(1-sstep((t-EV.place)/.5))*.2;
 const mp=sstep((t-EV.map)/1.2);B.helipad.material.opacity=mp*(.7+.3*Math.sin(t*6));B.route.material.opacity=mp*.8;
 B.mon.forEach((m,i)=>m.material.color.setHex([0x0e4a30,0x4a2a14,0x0e2a3a][i]).multiplyScalar(.7+.3*Math.sin(t*7+i*2)));
 B.dust.rotation.y=t*.01;
 // camera
 const c=camState(t);const sa=shakeAmp(t);const sx=(nz(t,1)+nz(t,2.3)*.5)*.012*sa,sy=nz(t+5,1.2)*.01*sa,sr=nz(t+9,.9)*.0035*sa;
 camera.fov=c[3];camera.updateProjectionMatrix();camera.position.set(c[0]+sx+Math.sin(t*.4)*.1,c[1]+.15+sy,c[2]);camera.lookAt(c[0]*1.0+(nz(t+3,.9))*.01*sa,c[1],0);camera.rotation.z+=c[4]*Math.PI/180*.7+sr;
 // operator hand sway + flashlight
 rig.position.set(.2+Math.sin(t*1.3)*.008,-.26+Math.sin(t*1.7)*.006,-.55);const fo=flashOn(t);spot.intensity=fo*38;lens.material.color.setScalar(.15+.85*fo);fill.intensity=.9;
 renderer.render(scene,camera)}
window.renderFrame=(i)=>{const t=i/FPS;
 g2.setTransform(1,0,0,1,0,0);g2.clearRect(0,0,OW,OH);g2.save();g2.scale(K,K);
 const hook=t<4.6,tit=t>=4.7&&t<7.1;
 if(tit){title(g2,t)}else if(t>=EV.black){if(t>=EV.endcard)endcard(g2,t);else{g2.fillStyle='#000';g2.fillRect(0,0,1080,1920)}}
 else if(t>=4.6&&t<EV.cam||t>=EV.black-1.1&&t<EV.black){g2.fillStyle='#000';g2.fillRect(0,0,1080,1920)}
 else{g2.restore();render3D(t);g2.drawImage(renderer.domElement,0,0);g2.save();g2.scale(K,K);
  const gl=(t<.35?.7:0)+(t>=EV.cam&&t<EV.cam+.25?.6:0)+(t>=EV.knock+.4&&t<EV.knock+.6?.4:0);if(gl>0)glitch(g2,gl,t);
  if(t>=EV.cam)hud(g2,t);caption(g2,t);
  // vignette + grain
  const vg=g2.createRadialGradient(540,960,500,540,960,1200);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');g2.fillStyle=vg;g2.fillRect(0,0,1080,1920)}
 if(t>=4.6&&t<EV.cam&&!tit&&false){}
 g2.restore();return comp.toDataURL('image/png')};
window.READY=true;
